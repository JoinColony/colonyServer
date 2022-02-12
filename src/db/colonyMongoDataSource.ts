import { Db, ObjectID } from 'mongodb'
import { MongoDataSource } from 'apollo-datasource-mongo'
import { CachedCollection } from 'apollo-datasource-mongo/dist/cache'
import { DataSource, DataSourceConfig } from 'apollo-datasource'

import {
  EventBansDoc,
  EventDoc,
  NotificationDoc,
  TokenDoc,
  UserDoc,
} from './types'
import { CollectionNames } from './collections'
import { Event, TokenInfo, User, EventType } from '../graphql/types'

interface Collections {
  events: CachedCollection<EventDoc<any>>
  eventBans: CachedCollection<EventBansDoc>
  notifications: CachedCollection<NotificationDoc>
  tokens: CachedCollection<TokenDoc>
  users: CachedCollection<UserDoc>
}

export class ColonyMongoDataSource extends MongoDataSource<Collections, {}>
  implements DataSource<any> {
  public readonly collections: Collections

  constructor(db: Db) {
    super([
      db.collection(CollectionNames.Events),
      db.collection(CollectionNames.EventBans),
      db.collection(CollectionNames.Notifications),
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

  static transformEvent<C extends object>({
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

  private static transformBannedUser({
    userAddress,
    eventId,
  }: {
    userAddress: string
    eventId?: string
  }) {
    return {
      id: userAddress,
      eventId,
      banned: true,
    }
  }

  async getUserByAddress(walletAddress: string, ttl?: number) {
    const query = { walletAddress }
    const [doc] = ttl
      ? await this.collections.users.findManyByQuery(query, { ttl })
      : [await this.collections.users.collection.findOne(query)]

    if (!doc) throw new Error(`User with address '${walletAddress}' not found`)

    return ColonyMongoDataSource.transformUser(doc)
  }

  async getUserByName(username: string, ttl?: number) {
    const query = { username }
    const [doc] = ttl
      ? await this.collections.users.findManyByQuery(query, { ttl })
      : [await this.collections.users.collection.findOne(query)]

    if (!doc) throw new Error(`User with username '${username}' not found`)

    return ColonyMongoDataSource.transformUser(doc)
  }

  async getUsersByAddress(walletAddresses: string[], ttl?: number) {
    const query = { walletAddress: { $in: walletAddresses } }
    const docs = ttl
      ? await this.collections.users.findManyByQuery(query, { ttl })
      : await this.collections.users.collection.find(query).toArray()
    return docs.map(ColonyMongoDataSource.transformUser)
  }

  async getTopUsers(limit: number = 10, ttl?: number) {
    const query = {}
    const docs = ttl
      ? await this.collections.users.findManyByQuery(query, { ttl })
      : await this.collections.users.collection
          .find(query)
          .limit(limit)
          .toArray()
    return docs.map(ColonyMongoDataSource.transformUser)
  }

  async getEventById(eventId: string, ttl?: number) {
    const query = { _id: ObjectID(eventId) }
    const [doc] = ttl
      ? await this.collections.events.findManyByQuery(query, { ttl })
      : [await this.collections.events.collection.findOne(query)]

    if (!doc) throw new Error(`Event with id '${eventId}' not found`)

    return ColonyMongoDataSource.transformEvent(doc)
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

  async getTransactionMessages(transactionHash: string, limit: number = 1000) {
    const events = await this.collections.events.collection
      .aggregate([
        { $match: { 'context.transactionHash': transactionHash } },
        { $sort: { _id: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: this.collections.eventBans.collection.collectionName,
            let: {
              colonyAddress: '$context.colonyAddress',
              userAddress: '$initiatorAddress',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$colonyAddress', '$$colonyAddress'] },
                      {
                        $in: [
                          '$$userAddress',
                          '$bannedWalletAddresses.userAddress',
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'eventBans',
          },
        },
        {
          $set: {
            'context.userBanned': {
              $cond: {
                if: { $eq: [{ $size: '$eventBans' }, 0] },
                then: false,
                else: true,
              },
            },
          },
        },
        { $project: { eventBans: 0 } },
      ])
      .toArray()
    return events.reverse().map(ColonyMongoDataSource.transformEvent)
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

  async getBannedUsers(colonyAddress: string, ttl?: number) {
    const query = { colonyAddress }
    const [bannedUsers] = ttl
      ? await this.collections.eventBans.findManyByQuery(query, { ttl })
      : await this.collections.eventBans.collection.find(query).toArray()
    return (
      bannedUsers?.bannedWalletAddresses.map(
        ColonyMongoDataSource.transformBannedUser,
      ) || []
    )
  }
}
