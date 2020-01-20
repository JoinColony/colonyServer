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
  TaskDoc,
  TokenDoc,
  UserDoc,
} from './types'
import { CollectionNames } from './collections'
import {
  Colony,
  Domain,
  Event,
  Suggestion,
  SuggestionStatus,
  Task,
  TokenInfo,
  User,
} from '../graphql/types'
import { ETH_ADDRESS } from '../constants'

// TODO re-enable cache
// const DEFAULT_TTL = { ttl: 10000 }
const DEFAULT_TTL = { ttl: undefined }

interface Collections {
  colonies: CachedCollection<ColonyDoc>
  domains: CachedCollection<DomainDoc>
  events: CachedCollection<EventDoc<any>>
  notifications: CachedCollection<NotificationDoc>
  suggestions: CachedCollection<SuggestionDoc>
  tasks: CachedCollection<TaskDoc>
  tokens: CachedCollection<TokenDoc>
  users: CachedCollection<UserDoc>
}

export class ColonyMongoDataSource extends MongoDataSource<Collections, {}>
  implements DataSource<any> {
  public readonly collections: Collections

  constructor(db: Db) {
    super([
      db.collection(CollectionNames.Colonies),
      db.collection(CollectionNames.Domains),
      db.collection(CollectionNames.Events),
      db.collection(CollectionNames.Notifications),
      db.collection(CollectionNames.Suggestions),
      db.collection(CollectionNames.Tasks),
      db.collection(CollectionNames.Tokens),
      db.collection(CollectionNames.Users),
    ])
  }

  // This shouldn't be necessary, but there were problems with the GraphQL types
  initialize(config: DataSourceConfig<{}>): void {
    super.initialize(config)
  }

  // TODO consider extending API of MongoDataSource for document transformation
  // @NOTE: This is where you add resolver fields to avoid super weird TS errors
  // LOOK AT MEE I'M MR MESEEKS
  private static transformColony({
    _id,
    tokenAddresses = [],
    taskIds = [],
    ...doc
  }: ColonyDoc): Colony {
    return {
      ...doc,
      createdAt: _id.getTimestamp(),
      id: doc.colonyAddress,
      taskIds,
      tokenAddresses,
      tasks: [],
      domains: [],
      subscribedUsers: [],
      suggestions: [],
    }
  }

  private static transformUser({
    _id,
    colonyAddresses = [],
    taskIds = [],
    tokenAddresses = [],
    ...profile
  }: UserDoc): User {
    return {
      id: profile.walletAddress,
      createdAt: _id.getTimestamp(),
      colonies: [],
      notifications: [],
      tasks: [],
      colonyAddresses,
      tokenAddresses,
      taskIds,
      profile,
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

  private static transformToken({
    _id,
    ...doc
  }: TokenDoc): TokenInfo {
    return {
      ...doc,
      id: doc.address,
      createdAt: _id.getTimestamp(),
    }
  }

  private static transformDomain({ _id, ...doc }: DomainDoc): Domain {
    return {
      ...doc,
      tasks: [],
      id: _id.toHexString(),
      createdAt: _id.getTimestamp(),
    }
  }

  private static transformSuggestion({
    _id,
    taskId,
    ...doc
  }: SuggestionDoc): Suggestion {
    return {
      ...doc,
      id: _id.toHexString(),
      createdAt: _id.getTimestamp(),
      creator: undefined,
      taskId: taskId ? taskId.toHexString() : undefined,
    }
  }

  private static transformTask({
    workInviteAddresses = [],
    workRequestAddresses = [],
    payouts = [],
    _id,
    ...doc
  }: TaskDoc): Task {
    return {
      ...doc,
      id: _id.toHexString(),
      createdAt: _id.getTimestamp(),
      events: [],
      workInvites: [],
      workRequests: [],
      colony: undefined,
      creator: undefined,
      domain: undefined,
      payouts: payouts.map(payout => ({ ...payout, token: undefined })),
      workRequestAddresses,
      workInviteAddresses,
    }
  }

  async getColonyByAddress(colonyAddress: string, ttl?: number) {
    const query = { colonyAddress }
    const [doc] = ttl
      ? await this.collections.colonies.findManyByQuery(query, { ttl })
      : [await this.collections.colonies.collection.findOne(query)]

    if (!doc) {
      throw new Error(`Colony with address '${colonyAddress}' not found`)
    }

    return ColonyMongoDataSource.transformColony(doc)
  }

  async getColoniesByAddress(colonyAddresses: string[], ttl?: number) {
    const query = { colonyAddress: { $in: colonyAddresses } }
    const docs = ttl
      ? await this.collections.colonies.findManyByQuery(query, { ttl })
      : await this.collections.colonies.collection.find(query).toArray()
    return docs.map(ColonyMongoDataSource.transformColony)
  }

  async getTaskById(taskId: string, ttl?: number) {
    const doc = ttl
      ? await this.collections.tasks.findOneById(taskId, { ttl })
      : await this.collections.tasks.collection.findOne({
          _id: new ObjectID(taskId),
        })

    if (!doc) throw new Error(`Task with id '${taskId}' not found`)

    return ColonyMongoDataSource.transformTask(doc)
  }

  async getTaskByEthId(colonyAddress: string, ethPotId: number, ttl?: number) {
    const query = { colonyAddress, ethPotId }
    const [doc] = ttl
      ? await this.collections.tasks.findManyByQuery(query, { ttl })
      : [await this.collections.tasks.collection.findOne(query)]

    if (!doc)
      throw new Error(
        `Task with potId '${ethPotId}' for colony '${colonyAddress}' not found`,
      )

    return ColonyMongoDataSource.transformTask(doc)
  }

  async getTasksById(taskIds: string[], ttl?: number) {
    const docs = ttl
      ? await this.collections.tasks.findManyByIds(taskIds, { ttl })
      : await this.collections.tasks.collection
          .find({ _id: { $in: taskIds.map(id => new ObjectID(id)) } })
          .toArray()

    return docs.map(ColonyMongoDataSource.transformTask)
  }

  async getTasksByEthDomainId(
    colonyAddress: string,
    ethDomainId: number,
    ttl?: number,
  ) {
    const query = { colonyAddress, ethDomainId }
    const docs = ttl
      ? await this.collections.tasks.findManyByQuery(query, { ttl })
      : await this.collections.tasks.collection.find(query).toArray()

    return docs.map(ColonyMongoDataSource.transformTask)
  }

  async getDomainByEthId(
    colonyAddress: string,
    ethDomainId: number,
    ttl?: number,
  ) {
    const query = { colonyAddress, ethDomainId }
    const [doc] = ttl
      ? await this.collections.domains.findManyByQuery(query, { ttl })
      : [await this.collections.domains.collection.findOne(query)]

    if (!doc)
      throw new Error(
        `Domain with ID '${ethDomainId}' for colony '${colonyAddress}' not found`,
      )

    return ColonyMongoDataSource.transformDomain(doc)
  }

  async getColonyDomains(colonyAddress: string, ttl?: number) {
    const query = { colonyAddress }
    const docs = ttl
      ? await this.collections.domains.findManyByQuery(query, { ttl })
      : await this.collections.domains.collection.find(query).toArray()
    return docs.map(ColonyMongoDataSource.transformDomain)
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

  async getTaskEvents(taskId: string, ttl?: number) {
    const query = { 'context.taskId': taskId }
    const events = ttl
      ? await this.collections.events.findManyByQuery(query, { ttl })
      : await this.collections.events.collection.find(query).toArray()
    return events.map(ColonyMongoDataSource.transformEvent)
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
}
