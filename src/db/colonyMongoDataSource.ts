import { Db, ObjectID } from 'mongodb'
import { MongoDataSource } from 'apollo-datasource-mongo'
import { CachedCollection } from 'apollo-datasource-mongo/dist/cache'
import { DataSource, DataSourceConfig } from 'apollo-datasource'

import {
  ColonyDoc,
  DomainDoc,
  EventDoc,
  NotificationDoc,
  SuggestionDoc,
  TokenDoc,
  UserDoc,
} from './types'
import { CollectionNames } from './collections'
import {
  Event,
  Suggestion,
  SuggestionStatus,
  TokenInfo,
  User,
  EventType,
} from '../graphql/types'

// TODO re-enable cache
// const DEFAULT_TTL = { ttl: 10000 }
const DEFAULT_TTL = { ttl: undefined }

interface Collections {
  events: CachedCollection<EventDoc<any>>
  notifications: CachedCollection<NotificationDoc>
  suggestions: CachedCollection<SuggestionDoc>
  tokens: CachedCollection<TokenDoc>
  users: CachedCollection<UserDoc>
}

export class ColonyMongoDataSource extends MongoDataSource<Collections, {}>
  implements DataSource<any> {
  public readonly collections: Collections

  constructor(db: Db) {
    super([
      db.collection(CollectionNames.Events),
      db.collection(CollectionNames.Notifications),
      db.collection(CollectionNames.Suggestions),
      db.collection(CollectionNames.Tokens),
      db.collection(CollectionNames.Users),
    ])
  }

  // This shouldn't be necessary, but there were problems with the GraphQL types
  initialize(config: DataSourceConfig<{}>): void {
    super.initialize(config)
  }

  private static transformUser({
    _id,
    colonyAddresses = [],
    tokenAddresses = [],
    ...profile
  }: UserDoc): User {
    return {
      id: profile.walletAddress,
      createdAt: _id.getTimestamp(),
      notifications: [],
      colonyAddresses,
      tokenAddresses,
      profile,
    }
  }

  // Get a minimal user profile for unregistered users
  static getMinimalUser(address): User {
    return {
      id: address,
      createdAt: new Date(0),
      notifications: [],
      colonyAddresses: [],
      tokenAddresses: [],
      profile: {
        walletAddress: address,
      },
    }
  }

  private static transformEvent<C extends object>({
    _id,
    context,
    type,
    ...doc
  }: EventDoc<C>): Event {
    const id = _id.toHexString()
    return {
      ...doc,
      id,
      createdAt: _id.getTimestamp(),
      sourceId: id,
      type,
      context: {
        ...context,
        type, // For the sake of discriminating the union type in gql
      },
    }
  }

  private static transformToken({ _id, ...doc }: TokenDoc): TokenInfo {
    return {
      ...doc,
      id: doc.address,
      verified: undefined,
    }
  }

  private static transformSuggestion({
    _id,
    ...doc
  }: SuggestionDoc): Suggestion {
    return {
      ...doc,
      id: _id.toHexString(),
      createdAt: _id.getTimestamp(),
      creator: undefined,
    }
  }

  private static transformTransactionMessagesCount(
    transactionMessages: EventDoc<{ transactionHash: string }>[] = [],
  ): Array<{ transactionHash: string; count: number }> {
    const messages = {}
    transactionMessages.map(({ context: { transactionHash } }) => {
      messages[transactionHash] = messages[transactionHash]
        ? messages[transactionHash] + 1
        : 1
    })
    return Object.keys(messages).map((transactionHash) => ({
      transactionHash,
      count: messages[transactionHash],
    }))
  }

  async getSuggestionById(id: string, ttl?: number) {
    const doc = ttl
      ? await this.collections.suggestions.findOneById(id, { ttl })
      : await this.collections.suggestions.collection.findOne({
          _id: new ObjectID(id),
        })

    if (!doc) throw new Error(`Suggestion with id '${id}' not found`)

    return ColonyMongoDataSource.transformSuggestion(doc)
  }

  async getColonySuggestions(colonyAddress: string, ttl?: number) {
    const query = { colonyAddress, status: { $ne: SuggestionStatus.Deleted } }
    const docs = ttl
      ? await this.collections.suggestions.findManyByQuery(query, { ttl })
      : await this.collections.suggestions.collection.find(query).toArray()
    return docs.map(ColonyMongoDataSource.transformSuggestion)
  }

  async getUserByAddress(walletAddress: string, ttl?: number) {
    const query = { walletAddress }
    const [doc] = ttl
      ? await this.collections.users.findManyByQuery(query, { ttl })
      : [await this.collections.users.collection.findOne(query)]

    if (!doc) throw new Error(`User with address '${walletAddress}' not found`)

    return ColonyMongoDataSource.transformUser(doc)
  }

  async getUsersByAddress(walletAddresses: string[], ttl?: number) {
    const query = { walletAddress: { $in: walletAddresses } }
    const docs = ttl
      ? await this.collections.users.findManyByQuery(query, { ttl })
      : await this.collections.users.collection.find(query).toArray()
    return docs.map(ColonyMongoDataSource.transformUser)
  }

  async getColonySubscribedUsers(colonyAddress: string, ttl?: number) {
    const query = { colonyAddresses: colonyAddress }
    const docs = ttl
      ? await this.collections.users.findManyByQuery(query, { ttl })
      : await this.collections.users.collection.find(query).toArray()
    return docs.map(ColonyMongoDataSource.transformUser)
  }

  private async getUserNotifications(address: string, query: object) {
    const docs = ((await this.collections.notifications.collection
      .aggregate([
        { $match: query },
        { $sort: { _id: -1 } },
        { $unwind: '$users' },
        { $match: { 'users.address': address } },
        {
          $lookup: {
            from: this.collections.events.collection.collectionName,
            localField: 'eventId',
            foreignField: '_id',
            as: 'events',
          },
        },
        {
          $project: {
            _id: '$_id',
            event: { $arrayElemAt: ['$events', 0] },
            read: { $ifNull: ['$users.read', false] },
          },
        },
      ])
      .toArray()) as unknown) as {
      _id: ObjectID
      read: boolean
      event: EventDoc<any>
    }[]
    return docs.map(({ event, read, _id }) => ({
      id: _id.toHexString(),
      read,
      event: ColonyMongoDataSource.transformEvent(event),
    }))
  }

  async getAllUserNotifications(address: string) {
    return this.getUserNotifications(address, {
      'users.address': address,
    })
  }

  async getReadUserNotifications(address: string) {
    return this.getUserNotifications(address, {
      users: { address, read: true },
    })
  }

  async getUnreadUserNotifications(address: string) {
    return this.getUserNotifications(address, {
      users: { address, read: false },
    })
  }

  async getTokenByAddress(tokenAddress: string, ttl?: number) {
    const query = { address: tokenAddress }
    const [token] = ttl
      ? await this.collections.tokens.findManyByQuery(query, { ttl })
      : [await this.collections.tokens.collection.findOne(query)]
  
    if (!token) {
      throw new Error(`Token with address '${tokenAddress}' not found`)
    }
  
    return ColonyMongoDataSource.transformToken(token)
  }

  async getTransactionMessages(transactionHash: string, ttl?: number) {
    const query = { 'context.transactionHash': transactionHash }
    const events = ttl
      ? await this.collections.events.findManyByQuery(query, { ttl })
      : await this.collections.events.collection.find(query).toArray()
    return events.map(ColonyMongoDataSource.transformEvent)
  }

  async getTransactionMessagesCount(colonyAddress: string, ttl?: number) {
    const query = {
      'context.colonyAddress': colonyAddress,
      type: EventType.TransactionMessage,
    }
    const events = ttl
      ? await this.collections.events.findManyByQuery(query, { ttl })
      : await this.collections.events.collection.find(query).toArray()
    return ColonyMongoDataSource.transformTransactionMessagesCount(events)
  }
}
