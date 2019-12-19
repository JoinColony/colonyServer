import { Db, ObjectID } from 'mongodb'
import { MongoDataSource } from 'apollo-datasource-mongo'
import { CachedCollection } from 'apollo-datasource-mongo/dist/cache'
import { DataSource, DataSourceConfig } from 'apollo-datasource'

import {
  ColonyDoc,
  DomainDoc,
  EventDoc,
  NotificationDoc,
  TaskDoc,
  TokenDoc,
  UserDoc,
} from './types'
import { CollectionNames } from './collections'
import { ETH_ADDRESS } from '../constants'

// TODO re-enable cache
// const DEFAULT_TTL = { ttl: 10000 }
const DEFAULT_TTL = { ttl: undefined }

interface Collections {
  colonies: CachedCollection<ColonyDoc>
  domains: CachedCollection<DomainDoc>
  events: CachedCollection<EventDoc<any>>
  notifications: CachedCollection<NotificationDoc>
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
  private static transformColony({
    _id,
    tokenAddresses = [],
    taskIds = [],
    ...doc
  }: ColonyDoc) {
    return {
      ...doc,
      createdAt: _id.getTimestamp(),
      id: doc.colonyAddress,
      taskIds,
      tokenAddresses,
      nativeToken: undefined,
      tasks: [],
      tokens: [],
      domains: [],
      subscribedUsers: [],
    }
  }

  private static transformUser({
    _id,
    colonyAddresses = [],
    taskIds = [],
    tokenAddresses = [],
    ...profile
  }: UserDoc) {
    return {
      id: profile.walletAddress,
      createdAt: _id.getTimestamp(),
      colonies: [],
      tasks: [],
      tokens: [],
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
  }: EventDoc<C>) {
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
    name,
    decimals,
    symbol,
    ...doc
  }: TokenDoc) {
    return {
      ...doc,
      id: doc.address,
      createdAt: _id.getTimestamp(),
      info: { name, decimals, symbol },
    }
  }

  private static transformDomain({ _id, ...doc }: DomainDoc) {
    return {
      ...doc,
      tasks: [],
      id: _id.toHexString(),
      createdAt: _id.getTimestamp(),
    }
  }

  private static transformTask({
    workInviteAddresses = [],
    workRequestAddresses = [],
    payouts = [],
    _id,
    ...doc
  }: TaskDoc) {
    return {
      ...doc,
      id: _id.toHexString(),
      createdAt: _id.getTimestamp(),
      events: [],
      workInvites: [],
      workRequests: [],
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

  async getTaskByEthId(colonyAddress: string, ethTaskId: number, ttl?: number) {
    const query = { colonyAddress, ethTaskId }
    const [doc] = ttl
      ? await this.collections.tasks.findManyByQuery(query, { ttl })
      : [await this.collections.tasks.collection.findOne(query)]

    if (!doc)
      throw new Error(
        `Task with ID '${ethTaskId}' for colony '${colonyAddress}' not found`,
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
    const query = { colonies: colonyAddress }
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

  async getTokensByAddress(tokenAddresses: string[], ttl?: number) {
    const query = { address: { $in: tokenAddresses } }
    const tokens = ttl
      ? await this.collections.tokens.findManyByQuery(query, { ttl })
      : await this.collections.tokens.collection.find(query).toArray()
    return tokens.map(ColonyMongoDataSource.transformToken)
  }

  async getColonyTokens(colonyAddress: string) {
    const docs = ((await this.collections.colonies.collection
      .aggregate([
        { $match: { colonyAddress } },
        {
          $project: {
            _id: '$_id',
            tokenAddresses: {
              $concatArrays: [[ETH_ADDRESS], '$tokenAddresses'],
            },
          },
        },
        { $unwind: '$tokenAddresses' },
        {
          $lookup: {
            from: this.collections.tokens.collection.collectionName,
            localField: 'tokenAddresses',
            foreignField: 'address',
            as: 'tokens',
          },
        },
        { $unwind: '$tokens' },
        {
          $project: {
            _id: '$tokens._id',
            address: '$tokens.address',
            creatorAddress: '$tokens.creatorAddress',
            decimals: '$tokens.decimals',
            iconHash: '$tokens.iconHash',
            name: '$tokens.name',
            symbol: '$tokens.symbol',
          },
        },
      ])
      .toArray()) as unknown) as TokenDoc[]
    return docs.map(ColonyMongoDataSource.transformToken)
  }

  async getAllTokens(ttl?: number) {
    const tokens = ttl
      ? await this.collections.tokens.findManyByQuery({}, { ttl })
      : await this.collections.tokens.collection.find({}).toArray()
    return tokens.map(ColonyMongoDataSource.transformToken)
  }
}
