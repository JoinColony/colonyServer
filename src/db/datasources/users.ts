import { CollectionNames } from '../collections'
import { ColonyDoc, ColonyMongoDataSource, MongoDoc } from './index'
import { StrictRootQuerySelector, StrictUpdateQuery } from '../types'
import { UpdateOneOptions } from 'mongodb'

export interface UserDoc extends MongoDoc {
  colonies: string[]
  tasks: string[]
  username: string
  walletAddress: string
  avatarHash?: string
  bio?: string
  displayName?: string
  location?: string
  website?: string
}

export class Users extends ColonyMongoDataSource<any> {
  protected static collectionName = CollectionNames.Users

  // TODO do we need this?
  private static transform({ _id: mongoId, ...userObj }: UserDoc) {
    return {
      id: userObj.walletAddress,
      profile: userObj,
    }
  }

  private async updateOne(
    walletAddress: string,
    query: StrictRootQuerySelector<UserDoc>,
    modifier: StrictUpdateQuery<UserDoc>,
    options?: UpdateOneOptions,
  ) {
    await this.collection.updateOne(
      { $and: [{ walletAddress }, query] },
      modifier,
      options,
    )
    return this.getOne(walletAddress)
  }

  async getOne(walletAddress) {
    // TODO use findOneById
    const doc = await this.collection.findOne<UserDoc>({ walletAddress })
    if (!doc) throw new Error(`User with address '${walletAddress}' not found`)
    return Users.transform(doc)
  }

  async create(walletAddress: string, username: string) {
    const doc = { walletAddress, username, colonies: [], tasks: [] }

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

  async edit(walletAddress: string, profile: Pick<UserDoc, 'displayName' | 'website' | 'location'>) {
    return this.updateOne(walletAddress, {}, { $set: profile })
  }

  async setAvatar(walletAddress: string, ipfsHash: string) {
    return this.updateOne(walletAddress, {}, { $set: { avatarHash: ipfsHash } })
  }

  async removeAvatar(walletAddress: string) {
    return this.updateOne(walletAddress, {}, { $unset: { avatarHash: '' } })
  }

  async subscribeToColony(walletAddress: string, colonyAddress: string) {
    return this.updateOne(
      walletAddress,
      {},
      { $push: { colonies: colonyAddress } },
    )
  }

  async unsubscribeFromColony(walletAddress: string, colonyAddress: string) {
    return this.updateOne(
      walletAddress,
      {},
      { $pull: { colonies: colonyAddress } },
    )
  }

  async subscribeToTask(walletAddress: string, taskId: string) {
    return this.updateOne(
      walletAddress,
      {},
      { $push: { tasks: taskId } },
    )
  }

  async unsubscribeFromTask(walletAddress: string, taskId: string) {
    return this.updateOne(
      walletAddress,
      {},
      { $pull: { tasks: taskId } },
    )
  }
}
