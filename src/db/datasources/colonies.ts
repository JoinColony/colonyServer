import { UpdateOneOptions } from 'mongodb'

import { CollectionNames } from '../collections'
import { ColonyMongoDataSource, MongoDoc } from './index'
import { StrictRootQuerySelector, StrictUpdateQuery } from '../types'

export interface ColonyDoc extends MongoDoc {
  colonyAddress: string
  colonyName: string
  displayName?: string
  description?: string
  guideline?: string
  website?: string
  token: {
    address: string
    name: string
    symbol: string
    iconHash?: string
    isExternal?: boolean
    isNative?: boolean
  }
  tasks: string[]
}

export class Colonies extends ColonyMongoDataSource<any> {
  protected static collectionName = CollectionNames.Colonies

  private async updateOne(
    colonyAddress: string,
    query: StrictRootQuerySelector<ColonyDoc>,
    modifier: StrictUpdateQuery<ColonyDoc & { 'token.iconHash': string }>,
    options?: UpdateOneOptions,
  ) {
    await this.collection.updateOne(
      { $and: [{ colonyAddress }, query] },
      modifier,
      options,
    )
    return this.getOne(colonyAddress)
  }

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

  async editProfile(
    colonyAddress: string,
    profile: Pick<
      ColonyDoc,
      'displayName' | 'description' | 'guideline' | 'website'
    >,
  ) {
    return this.updateOne(colonyAddress, {}, { $set: profile })
  }

  async setAvatar(colonyAddress: string, ipfsHash: string) {
    return this.updateOne(
      colonyAddress,
      {},
      { $set: { 'token.iconHash': ipfsHash } },
    )
  }

  async removeAvatar(colonyAddress: string) {
    return this.updateOne(
      colonyAddress,
      {},
      { $unset: { 'token.iconHash': '' } },
    )
  }

  // TODO
  // async setTokenInfo(colonyAddress: string) {}
  // async updateTokenInfo(colonyAddress: string) {}

  async addReferenceToTask(colonyAddress: string, taskId: string) {
    return this.updateOne(colonyAddress, {}, { $push: { tasks: taskId } })
  }
}
