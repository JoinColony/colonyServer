import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Collection, Db, ObjectID } from 'mongodb'
import { CollectionNames } from './collections'

interface MongoDoc {
  readonly _id: ObjectID
}

interface UserDoc extends MongoDoc {
  walletAddress: string
}

interface ColonyDoc extends MongoDoc {
  colonyAddress: string
  colonyName: string
}

interface TaskDoc extends MongoDoc {
  colonyAddress: string
  creatorAddress: string
  ethDomainId: number
  ethTaskId?: number
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

  private static transform({ _id: mongoId, ...userObj }: UserDoc) {
    return {
      id: userObj.walletAddress,
      profile: userObj,
    }
  }

  async getOne(walletAddress) {
    // TODO use findOneById
    const doc = await this.collection.findOne<UserDoc>({ walletAddress })
    if (!doc) throw new Error(`User with address '${walletAddress}' not found`)
    return Users.transform(doc)
  }

  async create(walletAddress: string, username: string) {
    const doc = { walletAddress, username }

    const exists = !!(await this.collection.findOne({
      $or: [{ walletAddress }, { username }],
    }))
    if (exists) {
      throw new Error(
        `User with address '${walletAddress}' or username '${username}' already exists`,
      )
    }

    // An upsert is used even if it's not strictly necessary because
    // it's not the job of a unique index to preserve data integrity.
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
    const doc = await this.collection.findOne<ColonyDoc>({ colonyAddress })
    if (!doc) {
      throw new Error(`Colony with address '${colonyAddress}' not found`)
    }
    return { ...doc, id: doc.colonyAddress }
  }

  async create(
    colonyAddress: string,
    colonyName: string,
    founderAddress: string,
  ) {
    const doc = { colonyAddress, colonyName, founderAddress }

    const exists = !!(await this.collection.findOne({
      $or: [{ colonyAddress }, { colonyName }],
    }))
    if (exists) {
      throw new Error(
        `Colony with address '${colonyAddress}' or name '${colonyName}' already exists`,
      )
    }

    // An upsert is used even if it's not strictly necessary because
    // it's not the job of a unique index to preserve data integrity.
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
    const doc = await this.collection.findOne<TaskDoc>({
      _id: new ObjectID(id),
    })
    if (!doc) throw new Error(`Task with Mongo ID '${id}' not found`)
    return { ...doc, id: doc._id.toString() }
  }

  async getOneByEthId(ethTaskId: number, colonyAddress: string) {
    const doc = await this.collection.findOne<TaskDoc>({
      ethTaskId,
      colonyAddress,
    })
    if (!doc) {
      throw new Error(
        `Task with Eth ID '${ethTaskId}' not found for colony with address '${colonyAddress}'`,
      )
    }
    return { ...doc, id: doc._id.toString() }
  }

  async create(colonyAddress: string, creatorAddress: string, ethDomainId) {
    const doc = { colonyAddress, creatorAddress, ethDomainId }
    const { insertedId } = await this.collection.insertOne(doc)
    return this.getOne(insertedId.toString())
  }

  // TODO: all task actions, e.g. assignment
}

// TODO define DataSources for other collections
