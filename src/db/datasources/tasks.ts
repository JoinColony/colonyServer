import { ObjectID, UpdateOneOptions } from 'mongodb'

import { CollectionNames } from '../collections'
import { ColonyMongoDataSource, MongoDoc } from './index'
import { StrictRootQuerySelector, StrictUpdateQuery } from '../types'

export interface TaskDoc extends MongoDoc {
  colonyAddress: string
  creatorAddress: string
  ethDomainId: number
  assignedWorker?: string
  cancelledAt?: Date
  description?: string
  dueDate?: Date
  ethSkillId?: number
  ethTaskId?: number
  finalizedAt?: Date
  title?: string
  workInvites: string[]
  workRequests: string[]
}

export class Tasks extends ColonyMongoDataSource<TaskDoc> {
  protected static collectionName = CollectionNames.Tasks

  // Extends the query such that no illegal changes are possible
  private static safeQuery(
    query: StrictRootQuerySelector<TaskDoc>,
  ): StrictRootQuerySelector<TaskDoc> {
    return {
      $and: [
        query,
        { cancelledAt: { $exists: false }, finalizedAt: { $exists: false } },
      ],
    }
  }

  private async updateOne(
    _id: ObjectID,
    query: StrictRootQuerySelector<TaskDoc>,
    modifier: StrictUpdateQuery<TaskDoc>,
    options?: UpdateOneOptions,
  ) {
    await this.collection.updateOne(Tasks.safeQuery(query), modifier, options)
    return this.getOne(_id)
  }

  async getOne(_id: ObjectID | string) {
    _id = typeof _id === 'string' ? new ObjectID(_id) : _id
    const doc = await this.collection.findOne<TaskDoc>({ _id })
    if (!doc) throw new Error(`Task with ObjectID '${_id}' not found`)
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
    return doc
  }

  async create(
    colonyAddress: string,
    creatorAddress: string,
    ethDomainId: number,
  ) {
    const doc = {
      colonyAddress,
      creatorAddress,
      ethDomainId,
      workRequests: [],
      workInvites: [],
    }
    const { insertedId } = await this.collection.insertOne(doc)
    return this.getOne(insertedId)
  }

  async setDomain(_id: ObjectID, ethDomainId: number) {
    return this.updateOne(_id, {}, { $set: { ethDomainId } })
  }

  async setTitle(_id: ObjectID, title: string) {
    return this.updateOne(_id, {}, { $set: { title } })
  }

  async setDescription(_id: ObjectID, description: string) {
    return this.updateOne(_id, {}, { $set: { description } })
  }

  async setDueDate(_id: ObjectID, dueDate: Date) {
    return this.updateOne(_id, {}, { $set: { dueDate } })
  }

  async setSkill(_id: ObjectID, ethSkillId: number) {
    return this.updateOne(_id, {}, { $set: { ethSkillId } })
  }

  async createWorkRequest(_id: ObjectID, workerAddress: string) {
    return this.updateOne(_id, {}, { $push: { workRequests: workerAddress } })
  }

  async sendWorkInvite(_id: ObjectID, workerAddress: string) {
    return this.updateOne(_id, {}, { $pull: { workInvites: workerAddress } })
  }

  async setPayout(
    _id: ObjectID,
    amount: string,
    token: string,
    ethDomainId: number,
  ) {
    const payout = { amount, token, ethDomainId }
    return this.updateOne(_id, {}, { $push: { payouts: payout } })
  }

  async removePayout(
    _id: ObjectID,
    amount: string,
    token: string,
    ethDomainId: number,
  ) {
    const payout = { amount, token, ethDomainId }
    return this.updateOne(_id, {}, { $pull: { payouts: payout } })
  }

  async assignWorker(_id: ObjectID, workerAddress: string) {
    return this.updateOne(_id, {}, { $set: { assignedWorker: workerAddress } })
  }

  async unassignWorker(_id: ObjectID, workerAddress: string) {
    return this.updateOne(
      _id,
      { assignedWorker: workerAddress },
      { $unset: { assignedWorker: '' } },
    )
  }

  async finalize(_id: ObjectID) {
    return this.updateOne(_id, {}, { $set: { finalizedAt: new Date() } })
  }

  async cancel(_id: ObjectID) {
    return this.updateOne(_id, {}, { $set: { cancelledAt: new Date() } })
  }
}
