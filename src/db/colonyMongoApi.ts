import {
  Collection,
  Db,
  ObjectID,
  QuerySelector,
  UpdateOneOptions,
} from 'mongodb'

import {
  ColonyDoc,
  DomainDoc,
  EventDoc,
  EventType,
  MessageDoc,
  NotificationDoc,
  StrictRootQuerySelector,
  StrictUpdateQuery,
  TaskDoc,
  UserDoc,
} from './types'
import { CollectionNames } from './collections'

export class ColonyMongoApi {
  private static profileModifier(profile: Record<string, any>) {
    // Set non-null values, unset null values
    return Object.keys(profile).reduce(
      (modifier, field) => ({
        ...(profile[field] === null
          ? { ...modifier, $unset: { ...modifier.$unset, [field]: '' } }
          : {
              ...modifier,
              $set: { ...modifier.$set, [field]: profile[field] },
            }),
      }),
      {} as { $set?: {}; $unset?: {} },
    )
  }

  private readonly colonies: Collection<ColonyDoc>
  private readonly events: Collection<EventDoc<any>>
  private readonly domains: Collection<DomainDoc>
  private readonly messages: Collection<MessageDoc>
  private readonly notifications: Collection<NotificationDoc>
  private readonly tasks: Collection<TaskDoc>
  private readonly users: Collection<UserDoc>

  constructor(db: Db) {
    this.colonies = db.collection<ColonyDoc>(CollectionNames.Colonies)
    this.events = db.collection<EventDoc<any>>(CollectionNames.Events)
    this.domains = db.collection<DomainDoc>(CollectionNames.Domains)
    this.notifications = db.collection<NotificationDoc>(
      CollectionNames.Notifications,
    )
    this.messages = db.collection<NotificationDoc>(CollectionNames.Messages)
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
    const filter = {
      $and: [
        { _id: new ObjectID(taskId) },
        // Ensure that the task does not enter an illegal state; if either
        // cancelledAt or finalizedAt is set, no further writes should be allowed
        // FIXME this should throw an error (it needs to be here too, but we just need to be more explicit about it)
        { cancelledAt: { $exists: false }, finalizedAt: { $exists: false } },
        query,
      ],
    }

    if (
      await this.tasks.findOne({
        cancelledAt: { $exists: false },
        finalizedAt: { $exists: false },
      })
    ) {
    }

    return this.tasks.updateOne(filter, modifier, options)
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

  private async createNotification(eventId: ObjectID, users: string[]) {
    // No point in creating a notification for no users
    if (users.length === 0) return null;

    const doc = {
      eventId,
      users: users.map(userAddress => ({ userAddress })),
    }
    return this.notifications.updateOne(
      doc,
      {
        $setOnInsert: doc,
      } as StrictRootQuerySelector<NotificationDoc>,
      { upsert: true },
    )
  }

  private async getTaskColonyAddress(taskId: string) {
    const { colonyAddress } = await this.tasks.findOne(new ObjectID(taskId))
    return colonyAddress
  }

  private async createTaskNotification(
    initiator: string,
    eventId: ObjectID,
    taskId: string,
  ) {
    const users = await this.users
      .find({ subscribedTasks: taskId, _id: { $ne: new ObjectID(initiator) } })
      .toArray()
    return this.createNotification(
      eventId,
      users.map(({ walletAddress }) => walletAddress),
    )
  }

  private async createColonyNotification(
    initiator: string,
    eventId: ObjectID,
    colonyAddress: string,
  ) {
    const users = await this.users
      .find({
        subscribedColonies: colonyAddress,
        walletAddress: { $ne: initiator },
      })
      .toArray()
    return this.createNotification(
      eventId,
      users.map(({ walletAddress }) => walletAddress),
    )
  }

  private async createEvent<C extends object>(
    initiator: string,
    type: EventType,
    context: C,
  ) {
    const { insertedId } = await this.events.insertOne({
      context,
      initiator,
      type,
      sourceType: 'db',
    })
    return insertedId
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
      avatarHash?: string | null
      displayName?: string | null
      website?: string | null
      location?: string | null
      bio?: string | null
    },
  ) {
    return this.updateUser(
      walletAddress,
      {},
      ColonyMongoApi.profileModifier(profile),
    )
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
    return this.updateUser(
      walletAddress,
      {},
      { $push: { subscribedTasks: taskId } },
    )
  }

  async unsubscribeFromTask(walletAddress: string, taskId: string) {
    return this.updateUser(
      walletAddress,
      {},
      { $pull: { subscribedTasks: taskId } },
    )
  }

  async createColony(
    initiator: string,
    colonyAddress: string,
    colonyName: string,
    displayName: string,
  ) {
    const doc = {
      colonyAddress,
      colonyName,
      displayName,
      founderAddress: initiator,
    }

    const exists = !!(await this.colonies.findOne({
      $or: [{ colonyAddress }, { colonyName }],
    }))
    if (exists) {
      throw new Error(
        `Colony with address '${colonyAddress}' or name '${colonyName}' already exists`,
      )
    }

    // An upsert is used even if it's not strictly necessary because
    // it's not the job of a unique index to preserve data integrity.
    await this.colonies.updateOne(doc, { $setOnInsert: doc }, { upsert: true })

    await this.createDomain(initiator, colonyAddress, 1, null, 'Root')

    return this.subscribeToColony(initiator, colonyAddress)
  }

  async editColony(
    colonyAddress: string,
    profile: {
      avatarHash?: string | null
      description?: string | null
      displayName?: string | null
      guideline?: string | null
      website?: string | null
    },
  ) {
    return this.updateColony(
      colonyAddress,
      {},
      ColonyMongoApi.profileModifier(profile),
    )
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
    initiator: string,
    colonyAddress: string,
    ethDomainId: number,
  ) {
    const { insertedId } = await this.tasks.insertOne({
      colonyAddress,
      creatorAddress: initiator,
      ethDomainId,
    } as TaskDoc)
    const taskId = insertedId.toString()

    await this.subscribeToTask(initiator, taskId)
    await this.updateColony(colonyAddress, {}, { $push: { tasks: taskId } })

    const eventId = await this.createEvent(initiator, EventType.CreateTask, {
      colonyAddress,
      ethDomainId,
      taskId,
    })
    await this.createColonyNotification(initiator, eventId, colonyAddress)

    return taskId
  }

  async setTaskDomain(initiator: string, taskId: string, ethDomainId: number) {
    await this.createEvent(initiator, EventType.SetTaskDomain, {
      taskId,
      ethDomainId,
    })
    return this.updateTask(taskId, {}, { $set: { ethDomainId } })
  }

  async setTaskTitle(initiator: string, taskId: string, title: string) {
    await this.createEvent(initiator, EventType.SetTaskTitle, { taskId, title })
    return this.updateTask(taskId, {}, { $set: { title } })
  }

  async setTaskDescription(
    initiator: string,
    taskId: string,
    description: string,
  ) {
    await this.createEvent(initiator, EventType.SetTaskDescription, {
      taskId,
      description,
    })
    return this.updateTask(taskId, {}, { $set: { description } })
  }

  async setTaskDueDate(initiator: string, taskId: string, dueDate: Date) {
    await this.createEvent(initiator, EventType.SetTaskDueDate, {
      taskId,
      dueDate,
    })
    return this.updateTask(taskId, {}, { $set: { dueDate } })
  }

  async setTaskSkill(initiator: string, taskId: string, ethSkillId: number) {
    await this.createEvent(initiator, EventType.SetTaskSkill, {
      taskId,
      ethSkillId,
    })
    return this.updateTask(taskId, {}, { $set: { ethSkillId } })
  }

  async createWorkRequest(initiator: string, taskId: string) {
    const { workRequests = [], creatorAddress } = await this.tasks.findOne(
      new ObjectID(taskId),
    )

    if (workRequests.includes(initiator)) {
      throw new Error(
        `Unable to create work request for '${initiator}'; work request already exists`,
      )
    }

    const eventId = await this.createEvent(
      initiator,
      EventType.CreateWorkRequest,
      { taskId },
    )
    await this.createNotification(eventId, [creatorAddress])

    return this.updateTask(taskId, {}, { $push: { workRequests: initiator } })
  }

  async sendWorkInvite(
    initiator: string,
    taskId: string,
    workerAddress: string,
  ) {
    const { workInvites = [] } = await this.tasks.findOne(new ObjectID(taskId))

    if (workInvites.includes(workerAddress)) {
      throw new Error(
        `Unable to send work invite for '${workerAddress}'; work invite already sent`,
      )
    }

    const eventId = await this.createEvent(
      initiator,
      EventType.SendWorkInvite,
      { taskId },
    )
    await this.createNotification(eventId, [workerAddress])

    return this.updateTask(
      taskId,
      {},
      { $push: { workInvites: workerAddress } },
    )
  }

  async setTaskPayout(
    initiator: string,
    taskId: string,
    amount: string,
    token: string,
  ) {
    const payout = { amount, token }
    const eventId = await this.createEvent(initiator, EventType.SetTaskPayout, {
      taskId,
      payout,
    })
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(taskId, {}, { $push: { payouts: payout } })
  }

  async removeTaskPayout(
    initiator: string,
    taskId: string,
    amount: string,
    token: string,
  ) {
    const payout = { amount, token }
    const eventId = await this.createEvent(
      initiator,
      EventType.RemoveTaskPayout,
      {
        taskId,
        payout,
      },
    )
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(taskId, {}, { $pull: { payouts: payout } })
  }

  async assignWorker(initiator: string, taskId: string, workerAddress: string) {
    const eventId = await this.createEvent(initiator, EventType.AssignWorker, {
      taskId,
      workerAddress,
    })
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(
      taskId,
      {},
      { $set: { assignedWorker: workerAddress } },
    )
  }

  async unassignWorker(
    initiator: string,
    taskId: string,
    workerAddress: string,
  ) {
    const eventId = await this.createEvent(
      initiator,
      EventType.UnassignWorker,
      {
        taskId,
        workerAddress,
      },
    )
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(
      taskId,
      { assignedWorker: workerAddress },
      { $unset: { assignedWorker: '' } },
    )
  }

  async finalizeTask(initiator: string, taskId: string) {
    // TODO for this to be valid, there needs to be: payouts, assignedWorker... check the contracts
    const eventId = await this.createEvent(initiator, EventType.FinalizeTask, {
      taskId,
    })
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(taskId, {}, { $set: { finalizedAt: new Date() } })
  }

  async cancelTask(initiator: string, taskId: string) {
    const eventId = await this.createEvent(initiator, EventType.CancelTask, {
      taskId,
    })
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(taskId, {}, { $set: { cancelledAt: new Date() } })
  }

  async markNotificationAsRead(initiator: string, id: string) {
    // Horrific typing to get this checked reasonably well...
    const match: QuerySelector<NotificationDoc['users']> = {
      $elemMatch: { userAddress: initiator, read: { $ne: true } },
    }
    const filter: StrictRootQuerySelector<NotificationDoc> = {
      _id: new ObjectID(id),
      users: match as NotificationDoc['users'],
    }

    return this.notifications.updateOne(filter, {
      'users.$.read': true,
    } as StrictUpdateQuery<NotificationDoc>)
  }

  async markAllNotificationsAsRead(initiator: string) {
    // Horrific typing to get this checked reasonably well...
    const match: QuerySelector<NotificationDoc['users']> = {
      $elemMatch: { userAddress: initiator, read: { $ne: true } },
    }
    const filter: StrictRootQuerySelector<NotificationDoc> = {
      users: match as NotificationDoc['users'],
    }
    const update: StrictUpdateQuery<
      NotificationDoc & { 'users.$.read': boolean }
    > = { $set: { 'users.$.read': true } }

    return this.notifications.updateMany(filter, update)
  }

  async createDomain(
    initiator: string,
    colonyAddress: string,
    ethDomainId: number,
    ethParentDomainId: number | null,
    name: string,
  ) {
    // TODO add constant for root domain
    if (ethDomainId === 1 && ethParentDomainId !== null) {
      throw new Error('Unable to add root domain with a parent domain')
    }

    if (ethDomainId !== 1) {
      const parentExists = !!(await this.domains.findOne({
        colonyAddress,
        ethDomainId: ethParentDomainId,
      }))
      if (!parentExists) {
        throw new Error(
          `Parent domain '${ethParentDomainId}' does not exist for colony '${colonyAddress}'`,
        )
      }
    }

    const exists = !!(await this.domains.findOne({
      colonyAddress,
      ethDomainId,
    }))
    if (exists) {
      throw new Error(
        `Domain with ID '${ethDomainId}' already exists for colony '${colonyAddress}'`,
      )
    }

    const eventId = await this.createEvent(initiator, EventType.CreateDomain, {
      colonyAddress,
      ethDomainId,
      ethParentDomainId,
      name,
    })
    await this.createColonyNotification(initiator, eventId, colonyAddress)

    // An upsert is used even if it's not strictly necessary because
    // it's not the job of a unique index to preserve data integrity.
    return this.domains.updateOne(
      { colonyAddress, ethDomainId, ethParentDomainId },
      { $setOnInsert: { colonyAddress, ethDomainId, ethParentDomainId, name } },
      { upsert: true },
    )
  }

  async editDomainName(
    initiator: string,
    colonyAddress: string,
    ethDomainId: number,
    name: string,
  ) {
    return this.updateDomain(colonyAddress, ethDomainId, {}, { $set: { name } })
  }

  async sendTaskMessage(initiator: string, taskId: string, message: string) {
    // TODO
  }
}
