import { CollectionNames } from '../collections'
import { ColonyMongoDataSource, MongoDoc } from './index'
import { StrictRootQuerySelector, StrictUpdateQuery } from '../types'
import { UpdateOneOptions } from 'mongodb'

export interface DomainDoc extends MongoDoc {
  colonyAddress: string
  ethDomainId: number
  ethParentDomainId: number
  name: string
}

export class Domains extends ColonyMongoDataSource<any> {
  protected static collectionName = CollectionNames.Domains

  private async updateOne(
    colonyAddress: string,
    ethDomainId: number,
    query: StrictRootQuerySelector<DomainDoc>,
    modifier: StrictUpdateQuery<DomainDoc>,
    options?: UpdateOneOptions,
  ) {
    await this.collection.updateOne(
      { $and: [{ colonyAddress, ethDomainId }, query] },
      modifier,
      options,
    )
    return this.getOne(colonyAddress, ethDomainId)
  }

  async getOne(colonyAddress: string, ethDomainId: number) {
    const doc = await this.collection.findOne<DomainDoc>({
      colonyAddress,
      ethDomainId,
    })
    if (!doc) {
      throw new Error(`Domain with id '${ethDomainId}' not found`)
    }
    return doc
  }

  async create(
    colonyAddress: string,
    ethDomainId: number,
    ethParentDomainId: number,
    name: string,
  ) {
    const parentExists = !!(await this.collection.findOne({
      colonyAddress,
      ethDomainId: ethParentDomainId,
    }))
    if (!parentExists) {
      throw new Error(
        `Parent domain '${ethParentDomainId}' does not exist for colony '${colonyAddress}'`,
      )
    }

    const exists = !!(await this.collection.findOne({
      colonyAddress,
      ethDomainId,
    }))
    if (exists) {
      throw new Error(
        `Domain with ID '${ethDomainId}' already exists for colony '${colonyAddress}'`,
      )
    }

    // An upsert is used even if it's not strictly necessary because
    // it's not the job of a unique index to preserve data integrity.
    await this.collection.updateOne(
      { colonyAddress, ethDomainId },
      { $setOnInsert: { colonyAddress, ethDomainId, name } },
      { upsert: true },
    )

    return this.getOne(colonyAddress, ethDomainId)
  }

  async editName(colonyAddress: string, ethDomainId: number, name: string) {
    return this.updateOne(colonyAddress, ethDomainId, {}, { $set: { name } })
  }
}
