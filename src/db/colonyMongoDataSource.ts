import { Collection } from 'mongodb'
import { MongoDataSource, CachedCollection } from 'apollo-datasource-mongodb'

import {
  UserDoc,
  ColonyDoc,
  NotificationDoc,
  TaskDoc,
  DomainDoc,
} from './types'
import { DataSource, DataSourceConfig } from 'apollo-datasource'

const DEFAULT_TTL = { ttl: 10000 }

interface Collections {
  colonies: CachedCollection<ColonyDoc>
  domains: CachedCollection<DomainDoc>
  notifications: CachedCollection<NotificationDoc>
  tasks: CachedCollection<TaskDoc>
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
  private static transformColony(doc: ColonyDoc) {
    return { ...doc, id: doc.colonyAddress }
  }

  private static transformUser({ _id, ...profile }: UserDoc) {
    return { id: profile.walletAddress, profile }
  }

  private static transformDoc(doc: TaskDoc) {
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

  async getColonyByName(colonyName: string) {
    const [doc] = await this.collections.colonies.findManyByQuery(
      { colonyName },
      DEFAULT_TTL,
    )

    if (!doc) throw new Error(`Colony with name '${colonyName}' not found`)

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

  async getTaskByEthId(ethTaskId: string, colonyAddress: string) {
    const [doc] = await this.collections.tasks.findManyByQuery(
      { colonyAddress, ethTaskId },
      DEFAULT_TTL,
    )

    if (!doc)
      throw new Error(
        `Task with task ID '${ethTaskId}' for colony '${colonyAddress}' not found`,
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
      { subscribedColonies: colonyAddress },
      DEFAULT_TTL,
    )
    return docs.map(ColonyMongoDataSource.transformUser)
  }
}
