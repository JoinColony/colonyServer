import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Collection, Db, ObjectID } from 'mongodb'
import { CollectionNames } from './collections'

interface UserObj {
  _id: ObjectID
  walletAddress: string
}

/**
 * @NOTE
 *
 * These data sources are designed in such a way that the integrity of the data
 * is ensured (e.g. all operations are idempotent, all data is validated),
 * but there is no attempt provide security with any kind of authentication,
 * by design.
 *
 * For this application, authentication is the responsibility of the GraphQL
 * resolvers, which will use on-chain verification.
 */

class ColonyMongoDataSource<T> extends MongoDataSource<T> {
  protected static collectionName = ''

  static initialize(db: Db) {
    return new this(db.collection(this.collectionName))
  }

  readonly collection: Collection
}

export class Users extends ColonyMongoDataSource<any> {
  protected static collectionName = CollectionNames.Users

  private static transform({ _id: mongoId, ...userObj }: UserObj) {
    return {
      id: userObj.walletAddress,
      profile: userObj,
    }
  }

  async getOne(walletAddress) {
    // TODO use findOneById
    const doc = await this.collection.findOne<UserObj>({ walletAddress })
    if (!doc) throw new Error(`User with address '${walletAddress}' not found`)
    return Users.transform(doc)
  }

  async create(walletAddress: string, username: string) {
    const doc = { walletAddress, username, colonies: [], tasks: [] }
    await this.collection.updateOne(
      doc,
      { $setOnInsert: doc },
      { upsert: true },
    )
    return this.getOne(walletAddress)
  }

  async edit(walletAddress: string, profile: object) {
    await this.collection.updateOne({ walletAddress }, { $set: profile })
    return this.getOne(walletAddress)
  }

  async subscribeToColony(walletAddress: string, colonyAddress: string) {
    await this.collection.updateOne(
      { walletAddress, colonies: { $ne: colonyAddress } },
      { $push: { colonies: colonyAddress } },
    )
  }

  async unsubscribeFromColony(walletAddress: string, colonyAddress: string) {
    await this.collection.updateOne(
      { walletAddress, colonies: { $eq: colonyAddress } },
      { $pull: { colonies: colonyAddress } },
    )
  }

  async subscribeToTask(walletAddress: string, taskId: string) {
    await this.collection.updateOne(
      { walletAddress, tasks: { $ne: taskId } },
      { $push: { tasks: taskId } },
    )
  }

  async unsubscribeFromTask(walletAddress: string, taskId: string) {
    await this.collection.updateOne(
      { walletAddress, tasks: { $eq: taskId } },
      { $pull: { tasks: taskId } },
    )
  }
}

export class Colonies extends ColonyMongoDataSource<any> {
  protected static collectionName = CollectionNames.Colonies

  async getOne(colonyAddress: string) {
    const doc = await this.collection.findOne({ colonyAddress })
    if (!doc) {
      throw new Error(`Colony with address '${colonyAddress}' not found`)
    }
    return doc
  }

  async create(
    colonyAddress: string,
    colonyName: string,
    founderAddress: string,
  ) {
    const doc = { colonyAddress, colonyName, founderAddress }
    await this.collection.updateOne(
      doc,
      { $setOnInsert: doc },
      { upsert: true },
    )
    return this.getOne(colonyAddress)
  }

  async edit(colonyAddress: string, profile: object) {
    await this.collection.updateOne({ colonyAddress }, { $set: profile })
    return this.getOne(colonyAddress)
  }

  async addReferenceToTask(colonyAddress: string, taskId: string) {
    await this.collection.updateOne(
      { colonyAddress, tasks: { $ne: taskId } },
      { $push: { tasks: taskId } },
    )
    return this.getOne(colonyAddress)
  }
}

export class Tasks extends ColonyMongoDataSource<any> {
  protected static collectionName = CollectionNames.Tasks

  async getOne(id: string) {
    const doc = await this.collection.findOne({ _id: id })
    if (!doc) throw new Error(`Task with Mongo ID '${id}' not found`)
    return doc
  }

  async getOneByEthId(ethTaskId: number, colonyAddress: string) {
    const doc = await this.collection.findOne({ ethTaskId, colonyAddress })
    if (!doc) {
      throw new Error(
        `Task with Eth ID '${ethTaskId}' not found for colony with address '${colonyAddress}'`,
      )
    }
    return doc
  }

  async create(colonyAddress: string, creatorAddress: string) {
    const doc = { colonyAddress, creatorAddress }
    const { insertedId } = await this.collection.insertOne(doc)
    return this.getOne(insertedId.toString())
  }

  // TODO: all task actions, e.g. assignment
}

// TODO define DataSources for other collections
