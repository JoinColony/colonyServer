import { Collection } from 'mongodb'
import { MongoDataSource, CachedCollection } from 'apollo-datasource-mongo'
import { DataSource, DataSourceConfig } from 'apollo-datasource'

import {
  ColonyDoc,
  DomainDoc,
  EventDoc,
  MongoDoc,
  NotificationDoc,
  TaskDoc,
  TokenDoc,
  UserDoc,
} from './types'

const DEFAULT_TTL = { ttl: 10000 }

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

  // This shouldn't be necessary, but there were problems with the GraphQL types
  constructor(collections: Collection[]) {
    super(collections)
  }

  // This shouldn't be necessary, but there were problems with the GraphQL types
  initialize(config: DataSourceConfig<{}>): void {
    super.initialize(config)
  }

  // TODO consider extending API of MongoDataSource for document transformation
  private static transformColony({
    tokens = [],
    tasks = [],
    ...doc
  }: ColonyDoc) {
    return { ...doc, tasks, tokens, id: doc.colonyAddress }
  }

  private static transformUser({
    _id,
    colonies = [],
    tasks = [],
    tokens = [],
    ...profile
  }: UserDoc) {
    return { id: profile.walletAddress, colonies, tokens, tasks, profile }
  }

  private static transformEvent<C extends object>({
    _id,
    context,
    type,
    ...doc
  }: EventDoc<C>) {
    const id = _id.toString()
    return {
      ...doc,
      id,
      sourceId: id,
      type,
      context: {
        ...context,
        type, // For the sake of discriminating the union type in gql
      },
    }
  }

  private static transformToken(doc: TokenDoc) {
    return { ...doc, id: doc.address }
  }

  private static transformDoc<T extends MongoDoc>(doc: T) {
    return { ...doc, id: doc._id.toString() }
  }

  async getColonyByAddress(colonyAddress: string) {
    const [doc] = await this.collections.colonies.findManyByQuery(
      { colonyAddress },
      DEFAULT_TTL,
    )

    if (!doc) {
      throw new Error(`Colony with address '${colonyAddress}' not found`)
    }

    return ColonyMongoDataSource.transformColony(doc)
  }

  async getColoniesByAddress(colonyAddresses: string[]) {
    const docs = await this.collections.colonies.findManyByQuery(
      { colonyAddress: { $in: colonyAddresses } },
      DEFAULT_TTL,
    )
    return docs.map(ColonyMongoDataSource.transformColony)
  }

  async getTaskById(taskId: string) {
    const doc = await this.collections.tasks.findOneById(taskId, DEFAULT_TTL)

    if (!doc) throw new Error(`Task with id '${taskId}' not found`)

    return ColonyMongoDataSource.transformDoc(doc)
  }

  async getTaskByEthId(colonyAddress: string, ethTaskId: number) {
    const [doc] = await this.collections.tasks.findManyByQuery(
      { colonyAddress, ethTaskId },
      DEFAULT_TTL,
    )

    if (!doc)
      throw new Error(
        `Task with ID '${ethTaskId}' for colony '${colonyAddress}' not found`,
      )

    return ColonyMongoDataSource.transformDoc(doc)
  }

  async getTasksById(taskIds: string[]) {
    const docs = await this.collections.tasks.findManyByIds(
      taskIds,
      DEFAULT_TTL,
    )

    return docs.map(ColonyMongoDataSource.transformDoc)
  }

  async getTasksByEthDomainId(colonyAddress: string, ethDomainId: number) {
    const docs = await this.collections.tasks.findManyByQuery(
      { colonyAddress, ethDomainId },
      DEFAULT_TTL,
    )

    return docs.map(ColonyMongoDataSource.transformDoc)
  }

  async getDomainByEthId(colonyAddress: string, ethDomainId: number) {
    const [doc] = await this.collections.domains.findManyByQuery(
      { colonyAddress, ethDomainId },
      DEFAULT_TTL,
    )

    if (!doc)
      throw new Error(
        `Domain with ID '${ethDomainId}' for colony '${colonyAddress}' not found`,
      )

    return ColonyMongoDataSource.transformDoc(doc)
  }

  async getColonyDomains(colonyAddress: string) {
    const docs = await this.collections.domains.findManyByQuery(
      { colonyAddress },
      DEFAULT_TTL,
    )
    return docs.map(ColonyMongoDataSource.transformDoc)
  }

  async getUserByAddress(walletAddress: string) {
    const [doc] = await this.collections.users.findManyByQuery(
      { walletAddress },
      DEFAULT_TTL,
    )

    if (!doc) throw new Error(`User with address '${walletAddress}' not found`)

    return ColonyMongoDataSource.transformUser(doc)
  }

  async getUsersByAddress(walletAddresses: string[]) {
    const docs = await this.collections.users.findManyByQuery(
      { walletAddress: { $in: walletAddresses } },
      DEFAULT_TTL,
    )
    return docs.map(ColonyMongoDataSource.transformUser)
  }

  async getColonySubscribedUsers(colonyAddress: string) {
    const docs = await this.collections.users.findManyByQuery(
      { colonies: colonyAddress },
      DEFAULT_TTL,
    )
    return docs.map(ColonyMongoDataSource.transformUser)
  }

  private async getUserNotifications(userAddress: string, query: object) {
    // This could also use an aggregation, but it wouldn't be cached on the DataSource.
    const docs = await this.collections.notifications.findManyByQuery(
      query,
      DEFAULT_TTL,
    )
    const events = await this.collections.events.findManyByIds(
      docs.map(({ eventId }) => eventId.toString()),
      DEFAULT_TTL,
    )
    return docs.map(({ eventId, users }) => ({
      event: ColonyMongoDataSource.transformEvent(
        events.find(({ _id }) => _id.toString() === eventId.toString()),
      ),
      read: !!(users.find(u => u.userAddress === userAddress) || {}).read,
    }))
  }

  async getAllUserNotifications(userAddress: string) {
    return this.getUserNotifications(userAddress, {
      'users.userAddress': userAddress,
    })
  }

  async getReadUserNotifications(userAddress: string) {
    return this.getUserNotifications(userAddress, {
      users: { $elemMatch: { userAddress, read: true } },
    })
  }

  async getUnreadUserNotifications(userAddress: string) {
    return this.getUserNotifications(userAddress, {
      users: { $elemMatch: { userAddress, read: { $ne: true } } },
    })
  }

  async getTaskEvents(taskId: string) {
    // TODO sorting?
    const events = await this.collections.events.findManyByQuery(
      {
        'context.taskId': taskId,
      },
      DEFAULT_TTL,
    )
    return events.map(ColonyMongoDataSource.transformEvent)
  }

  async getTokenByAddress(tokenAddress: string) {
    const [token] = await this.collections.tokens.findManyByQuery(
      { address: tokenAddress },
      DEFAULT_TTL,
    )

    if (!token) {
      throw new Error(`Token with address '${tokenAddress}' not found`)
    }

    return ColonyMongoDataSource.transformToken(token)
  }

  async getTokensByAddress(tokenAddresses: string[]) {
    const tokens = await this.collections.tokens.findManyByQuery(
      { address: { $in: tokenAddresses } },
      DEFAULT_TTL,
    )
    return tokens.map(ColonyMongoDataSource.transformToken)
  }
}
