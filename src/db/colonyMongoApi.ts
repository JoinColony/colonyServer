import {
  Collection,
  Db,
  UpdateOneOptions,
  ObjectID,
  QuerySelector,
} from 'mongodb'

import {
  ColonyDoc,
  TaskDoc,
  NotificationDoc,
  UserDoc,
  DomainDoc,
  StrictRootQuerySelector,
  StrictUpdateQuery,
  NotificationType,
} from './types'
import { CollectionNames } from './collections'

export class ColonyMongoApi {
  private readonly colonies: Collection<ColonyDoc>
  private readonly domains: Collection<DomainDoc>
  private readonly notifications: Collection<NotificationDoc>
  private readonly tasks: Collection<TaskDoc>
  private readonly users: Collection<UserDoc>

  constructor(db: Db) {
    this.colonies = db.collection<ColonyDoc>(CollectionNames.Colonies)
    this.domains = db.collection<DomainDoc>(CollectionNames.Domains)
    this.notifications = db.collection<NotificationDoc>(
      CollectionNames.Notifications,
    )
    this.tasks = db.collection<TaskDoc>(CollectionNames.Tasks)
    this.users = db.collection<UserDoc>(CollectionNames.Users)
  }

  private async updateUser(
    walletAddress: string,
    query: StrictRootQuerySelector<UserDoc>,
    modifier: StrictUpdateQuery<UserDoc>,
    options?: UpdateOneOptions,
  ) {
    return this.users.updateOne(
      { $and: [{ walletAddress }, query] },
      modifier,
      options,
    )
  }

  private async updateColony(
    colonyAddress: string,
    query: StrictRootQuerySelector<ColonyDoc>,
    modifier: StrictUpdateQuery<ColonyDoc & { 'token.iconHash': string }>,
    options?: UpdateOneOptions,
  ) {
    return this.colonies.updateOne(
      { $and: [{ colonyAddress }, query] },
      modifier,
      options,
    )
  }

  private async updateTask(
    taskId: string,
    query: StrictRootQuerySelector<TaskDoc>,
    modifier: StrictUpdateQuery<TaskDoc>,
    options?: UpdateOneOptions,
  ) {
    return this.tasks.updateOne(
      {
        $and: [
          { _id: new ObjectID(taskId) },
          // Ensure that the task does not enter an illegal state; if either
          // cancelledAt or finalizedAt is set, no further writes should be allowed
          { cancelledAt: { $exists: false }, finalizedAt: { $exists: false } },
          query,
        ],
      },
      modifier,
      options,
    )
  }

  private async updateDomain(
    colonyAddress: string,
    ethDomainId: number,
    query: StrictRootQuerySelector<DomainDoc>,
    modifier: StrictUpdateQuery<DomainDoc>,
    options?: UpdateOneOptions,
  ) {
    return this.domains.updateOne(
      { $and: [{ colonyAddress, ethDomainId }, query] },
      modifier,
      options,
    )
  }

  private async createNotification<T extends object>(
    type: NotificationType,
    users: string[],
    value: T,
  ) {
    const doc = {
      type,
      users: users.map(userAddress => ({ userAddress })),
      value,
    }
    const { upsertedId } = await this.notifications.updateOne(
      doc,
      {
        $setOnInsert: { ...doc, createdAt: new Date() },
      } as StrictRootQuerySelector<NotificationDoc>,
      { upsert: true },
    )
    return upsertedId.toString()
  }

  private async getTaskColonyAddress(taskId: string) {
    const { colonyAddress } = await this.tasks.findOne(new ObjectID(taskId))
    return colonyAddress
  }

  async createUser(walletAddress: string, username: string) {
    const doc = { walletAddress, username }

    const exists = !!(await this.users.findOne({
      $or: [{ walletAddress }, { username }],
    }))
    if (exists) {
      throw new Error(
        `User with address '${walletAddress}' or username '${username}' already exists`,
      )
    }

    // An upsert is used even if it's not strictly necessary because
    // it's not the job of a unique index to preserve data integrity.
    return this.users.updateOne(doc, { $setOnInsert: doc }, { upsert: true })
  }

  async editUser(
    walletAddress: string,
    profile: {
      displayName: string | null
      website: string | null
      location: string | null
      bio: string | null
    },
  ) {
    // Set non-null values, unset null values
    const modifier = Object.keys(profile).reduce(
      ({ $set, $unset }, field) => ({
        ...(profile[field] === null
          ? { $set, $unset: { ...$unset, [field]: '' } }
          : { $set: { ...$set, [field]: profile[field] }, $unset }),
      }),
      { $set: {}, $unset: {} },
    )
    return this.updateUser(walletAddress, {}, modifier)
  }

  async setUserAvatar(walletAddress: string, ipfsHash: string) {
    return this.updateUser(
      walletAddress,
      {},
      { $set: { avatarHash: ipfsHash } },
    )
  }

  async removeUserAvatar(walletAddress: string) {
    return this.updateUser(walletAddress, {}, { $unset: { avatarHash: '' } })
  }

  async subscribeToColony(walletAddress: string, colonyAddress: string) {
    return this.updateUser(
      walletAddress,
      {},
      { $push: { subscribedColonies: colonyAddress } },
    )
  }

  async unsubscribeFromColony(walletAddress: string, colonyAddress: string) {
    return this.updateUser(
      walletAddress,
      {},
      { $pull: { subscribedColonies: colonyAddress } },
    )
  }

  async subscribeToTask(walletAddress: string, taskId: string) {
    return this.updateUser(walletAddress, {}, { $push: { subscribedTasks: taskId } })
  }

  async unsubscribeFromTask(walletAddress: string, taskId: string) {
    return this.updateUser(walletAddress, {}, { $pull: { subscribedTasks: taskId } })
  }

  async createColony(
    colonyAddress: string,
    colonyName: string,
    founderAddress: string,
  ) {
    const doc = { colonyAddress, colonyName, founderAddress }

    const exists = !!(await this.colonies.findOne(
      {
        $or: [{ colonyAddress }, { colonyName }],
      }
    ))
    if (exists) {
      throw new Error(
        `Colony with address '${colonyAddress}' or name '${colonyName}' already exists`,
      )
    }

    // An upsert is used even if it's not strictly necessary because
    // it's not the job of a unique index to preserve data integrity.
    await this.colonies.updateOne(doc, { $setOnInsert: doc }, { upsert: true })

    return this.subscribeToColony(founderAddress, colonyAddress)
  }

  async editColony(
    colonyAddress: string,
    profile: {
      description: string | null
      displayName: string | null
      guideline: string | null
      website: string | null
    },
  ) {
    // Set non-null values, unset null values
    const modifier = Object.keys(profile).reduce(
      ({ $set, $unset }, field) => ({
        ...(profile[field] === null
          ? { $set, $unset: { ...$unset, [field]: '' } }
          : { $set: { ...$set, [field]: profile[field] }, $unset }),
      }),
      { $set: {}, $unset: {} },
    )
    return this.updateColony(colonyAddress, {}, modifier)
  }

  async setColonyAvatar(colonyAddress: string, ipfsHash: string) {
    return this.updateColony(
      colonyAddress,
      {},
      { $set: { avatarHash: ipfsHash } },
    )
  }

  async removeColonyAvatar(colonyAddress: string) {
    return this.updateColony(colonyAddress, {}, { $unset: { avatarHash: '' } })
  }

  async setColonyTokenAvatar(colonyAddress: string, ipfsHash: string) {
    return this.updateColony(
      colonyAddress,
      {},
      { $set: { 'token.iconHash': ipfsHash } },
    )
  }

  async removeColonyTokenAvatar(colonyAddress: string) {
    return this.updateColony(
      colonyAddress,
      {},
      { $unset: { 'token.iconHash': '' } },
    )
  }

  // TODO
  // async setColonyTokenInfo(colonyAddress: string) {}
  // async updateColonyTokenInfo(colonyAddress: string) {}

  async createTask(
    colonyAddress: string,
    creatorAddress: string,
    ethDomainId: number,
  ) {
    const doc = {
      colonyAddress,
      creatorAddress,
      ethDomainId,
    }
    const { insertedId } = await this.tasks.insertOne(doc as TaskDoc)
    const taskId = insertedId.toString()
    await this.subscribeToTask(colonyAddress, taskId)
    await this.updateColony(colonyAddress, {}, { $push: { tasks: taskId } })
    return taskId
  }

  async setTaskDomain(taskId: string, ethDomainId: number) {
    return this.updateTask(taskId, {}, { $set: { ethDomainId } })
  }

  async setTaskTitle(taskId: string, title: string) {
    return this.updateTask(taskId, {}, { $set: { title } })
  }

  async setTaskDescription(taskId: string, description: string) {
    return this.updateTask(taskId, {}, { $set: { description } })
  }

  async setTaskDueDate(taskId: string, dueDate: Date) {
    return this.updateTask(taskId, {}, { $set: { dueDate } })
  }

  async setTaskSkill(taskId: string, ethSkillId: number) {
    return this.updateTask(taskId, {}, { $set: { ethSkillId } })
  }

  async createWorkRequest(taskId: string, workerAddress: string) {
    const { colonyAddress, creatorAddress } = await this.tasks.findOne(
      new ObjectID(taskId),
    )
    await this.notifyWorkRequest(
      colonyAddress,
      taskId,
      workerAddress,
      creatorAddress,
    )
    return this.updateTask(
      taskId,
      {},
      { $push: { workRequests: workerAddress } },
    )
  }

  async sendWorkInvite(taskId: string, workerAddress: string) {
    return this.updateTask(
      taskId,
      {},
      { $pull: { workInvites: workerAddress } },
    )
  }

  async setTaskPayout(
    taskId: string,
    amount: string,
    token: string,
    ethDomainId: number,
  ) {
    const payout = { amount, token, ethDomainId }
    return this.updateTask(taskId, {}, { $push: { payouts: payout } })
  }

  async removeTaskPayout(
    taskId: string,
    amount: string,
    token: string,
    ethDomainId: number,
  ) {
    const payout = { amount, token, ethDomainId }
    return this.updateTask(taskId, {}, { $pull: { payouts: payout } })
  }

  async assignWorker(taskId: string, workerAddress: string) {
    const colonyAddress = await this.getTaskColonyAddress(taskId)
    await this.notifyAssignWorker(colonyAddress, taskId, workerAddress)
    return this.updateTask(
      taskId,
      {},
      { $set: { assignedWorker: workerAddress } },
    )
  }

  async unassignWorker(taskId: string, workerAddress: string) {
    const colonyAddress = await this.getTaskColonyAddress(taskId)
    await this.notifyUnassignWorker(colonyAddress, taskId, workerAddress)
    return this.updateTask(
      taskId,
      { assignedWorker: workerAddress },
      { $unset: { assignedWorker: '' } },
    )
  }

  async finalizeTask(taskId: string) {
    const { colonyAddress, assignedWorker } = await this.tasks.findOne(
      new ObjectID(taskId),
    )
    await this.notifyFinalizeTask(colonyAddress, taskId, assignedWorker)
    return this.updateTask(taskId, {}, { $set: { finalizedAt: new Date() } })
  }

  async cancelTask(taskId: string) {
    return this.updateTask(taskId, {}, { $set: { cancelledAt: new Date() } })
  }

  async markNotificationAsRead(userAddress: string, id: string) {
    // Horrific typing to get this checked reasonably well...
    const match: QuerySelector<NotificationDoc['users']> = {
      $elemMatch: { userAddress, read: false },
    }
    const filter: StrictRootQuerySelector<NotificationDoc> = {
      _id: new ObjectID(id),
      users: match as NotificationDoc['users'],
    }

    return this.notifications.updateOne(filter, {
      'users.$.read': true,
    } as StrictUpdateQuery<NotificationDoc>)
  }

  async markAllNotificationsAsRead(userAddress: string) {
    // Horrific typing to get this checked reasonably well...
    const match: QuerySelector<NotificationDoc['users']> = {
      $elemMatch: { userAddress, read: false },
    }
    const filter: StrictRootQuerySelector<NotificationDoc> = {
      users: match as NotificationDoc['users'],
    }
    const update: StrictUpdateQuery<
      NotificationDoc & { 'users.$.read': boolean }
    > = { $set: { 'users.$.read': true } }

    return this.notifications.updateMany(filter, update)
  }

  async notifyAssignWorker(
    colonyAddress: string,
    taskId: string,
    workerAddress: string,
  ) {
    return this.createNotification(
      NotificationType.AssignWorker,
      [workerAddress],
      {
        colonyAddress,
        taskId,
      },
    )
  }

  async notifyUnassignWorker(
    colonyAddress: string,
    taskId: string,
    workerAddress: string,
  ) {
    return this.createNotification(
      NotificationType.UnassignWorker,
      [workerAddress],
      {
        colonyAddress,
        taskId,
      },
    )
  }

  async notifyWorkRequest(
    colonyAddress: string,
    taskId: string,
    workerAddress: string,
    managerAddress: string,
  ) {
    return this.createNotification(
      NotificationType.WorkRequest,
      [managerAddress],
      {
        colonyAddress,
        taskId,
        workerAddress,
      },
    )
  }

  async notifyFinalizeTask(
    colonyAddress: string,
    taskId: string,
    workerAddress: string,
  ) {
    return this.createNotification(
      NotificationType.FinalizeTask,
      [workerAddress],
      {
        colonyAddress,
        taskId,
      },
    )
  }

  async notifyCommentMention(
    colonyAddress: string,
    taskId: string,
    users: string[],
  ) {
    return this.createNotification(NotificationType.CommentMention, users, {
      colonyAddress,
      taskId,
    })
  }

  async createDomain(
    colonyAddress: string,
    ethDomainId: number,
    ethParentDomainId: number,
    name: string,
  ) {
    const parentExists = !!(await this.domains.findOne(
      {
        colonyAddress,
        ethDomainId: ethParentDomainId,
      },
    ))
    if (!parentExists) {
      throw new Error(
        `Parent domain '${ethParentDomainId}' does not exist for colony '${colonyAddress}'`,
      )
    }

    const exists = !!(await this.domains.findOne(
      {
        colonyAddress,
        ethDomainId,
      },
    ))
    if (exists) {
      throw new Error(
        `Domain with ID '${ethDomainId}' already exists for colony '${colonyAddress}'`,
      )
    }

    // An upsert is used even if it's not strictly necessary because
    // it's not the job of a unique index to preserve data integrity.
    return this.domains.updateOne(
      { colonyAddress, ethDomainId },
      { $setOnInsert: { colonyAddress, ethDomainId, name } },
      { upsert: true },
    )
  }

  async editDomainName(
    colonyAddress: string,
    ethDomainId: number,
    name: string,
  ) {
    return this.updateDomain(colonyAddress, ethDomainId, {}, { $set: { name } })
  }
}
