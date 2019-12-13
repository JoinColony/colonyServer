import assert from 'assert'
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
  NotificationDoc,
  StrictRootQuerySelector,
  StrictUpdateQuery,
  TaskDoc,
  TokenDoc,
  UserDoc,
} from './types'
import { CollectionNames } from './collections'
import { matchUsernames } from './matchers'
import { ROOT_DOMAIN } from '../constants'

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
  private readonly notifications: Collection<NotificationDoc>
  private readonly tasks: Collection<TaskDoc>
  private readonly tokens: Collection<TokenDoc>
  private readonly users: Collection<UserDoc>

  constructor(db: Db) {
    this.colonies = db.collection<ColonyDoc>(CollectionNames.Colonies)
    this.events = db.collection<EventDoc<any>>(CollectionNames.Events)
    this.domains = db.collection<DomainDoc>(CollectionNames.Domains)
    this.notifications = db.collection<NotificationDoc>(
      CollectionNames.Notifications,
    )
    this.tasks = db.collection<TaskDoc>(CollectionNames.Tasks)
    this.tokens = db.collection<TokenDoc>(CollectionNames.Tokens)
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
    modifier: StrictUpdateQuery<ColonyDoc & { 'tokens.$.iconHash': string }>,
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
    const idFilter = { _id: new ObjectID(taskId) }

    // Ensure that the task does not enter an illegal state; if either
    // cancelledAt or finalizedAt is set, no further writes should be allowed
    if (
      !!(await this.tasks.findOne({
        $and: [
          idFilter,
          query,
          {
            $or: [
              { cancelledAt: { $exists: true } },
              { finalizedAt: { $exists: true } },
            ],
          },
        ],
      }))
    ) {
      throw new Error(
        `Unable to update task with ID '${taskId}': task is cancelled or finalized`,
      )
    }

    return this.tasks.updateOne(
      {
        $and: [
          idFilter,
          query,
          // This query is still necessary for data integrity
          { cancelledAt: { $exists: false }, finalizedAt: { $exists: false } },
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

  private async tryGetTask(taskId: string) {
    const task = await this.tasks.findOne(new ObjectID(taskId))
    assert.ok(!!task, `Task with ID '${taskId}' not found`)
    return task
  }

  private async tryGetUser(walletAddress: string) {
    const user = await this.users.findOne({ walletAddress })
    assert.ok(!!user, `User with address '${walletAddress}' not found`)
    return user
  }

  private async tryGetColony(colonyAddress: string) {
    const colony = await this.colonies.findOne({ colonyAddress })
    assert.ok(!!colony, `Colony with address '${colonyAddress}' not found`)
    return colony
  }

  private async tryGetToken(address: string) {
    const token = await this.tokens.findOne({ address })
    assert.ok(!!token, `Token with address '${address}' not found`)
    return token
  }

  private async tryGetDomain(colonyAddress: string, ethDomainId: number) {
    const domain = await this.domains.findOne({ colonyAddress, ethDomainId })
    assert.ok(
      !!domain,
      `Domain with ID '${ethDomainId}' of colony '${colonyAddress}' not found`,
    )
    return domain
  }

  private async createNotification(eventId: ObjectID, users: string[]) {
    // No point in creating a notification for no users
    if (users.length === 0) return null

    const doc = {
      eventId,
      users: users.map(address => ({ address })),
    }
    return this.notifications.updateOne(
      doc,
      {
        $setOnInsert: doc,
      } as StrictRootQuerySelector<NotificationDoc>,
      { upsert: true },
    )
  }

  private async createTaskNotification(
    initiator: string,
    eventId: ObjectID,
    taskId: string,
  ) {
    const users = await this.users
      .find({ taskIds: taskId, _id: { $ne: new ObjectID(initiator) } })
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
        colonyAddresses: colonyAddress,
        walletAddress: { $ne: initiator },
      })
      .toArray()
    return this.createNotification(
      eventId,
      users.map(({ walletAddress }) => walletAddress),
    )
  }

  private async createEvent<C extends object>(
    initiatorAddress: string,
    type: EventType,
    context: C,
  ) {
    const { insertedId } = await this.events.insertOne({
      context,
      initiatorAddress,
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
    initiator: string,
    profile: {
      avatarHash?: string | null
      displayName?: string | null
      website?: string | null
      location?: string | null
      bio?: string | null
    },
  ) {
    await this.tryGetUser(initiator)
    return this.updateUser(
      initiator,
      {},
      ColonyMongoApi.profileModifier(profile),
    )
  }

  async subscribeToColony(initiator: string, colonyAddress: string) {
    await this.tryGetUser(initiator)
    await this.tryGetColony(colonyAddress)

    return this.updateUser(
      initiator,
      // @ts-ignore This is too fiddly to type, for now
      { colonyAddresses: { $ne: colonyAddress } },
      { $push: { colonyAddresses: colonyAddress } },
    )
  }

  async unsubscribeFromColony(initiator: string, colonyAddress: string) {
    await this.tryGetUser(initiator)

    return this.updateUser(
      initiator,
      // @ts-ignore This is too fiddly to type, for now
      { colonyAddresses: colonyAddress },
      { $pull: { colonyAddresses: colonyAddress } },
    )
  }

  async subscribeToTask(initiator: string, taskId: string) {
    await this.tryGetUser(initiator)
    await this.tryGetTask(taskId)

    return this.updateUser(
      initiator,
      // @ts-ignore This is too fiddly to type, for now
      { taskIds: { $ne: taskId } },
      { $push: { taskIds: taskId } },
    )
  }

  async unsubscribeFromTask(initiator: string, taskId: string) {
    await this.tryGetUser(initiator)

    return this.updateUser(
      initiator,
      // @ts-ignore This is too fiddly to type, for now
      { taskIds: taskId },
      { $pull: { taskIds: taskId } },
    )
  }

  async createColony(
    initiator: string,
    colonyAddress: string,
    colonyName: string,
    displayName: string,
    tokenAddress: string,
    tokenName: string,
    tokenSymbol: string,
    tokenDecimals: number,
    tokenIconHash?: string,
  ) {
    await this.tryGetUser(initiator)

    const tokenExists = !!(await this.tokens.findOne({ address: tokenAddress }))
    if (!tokenExists) {
      await this.createToken(
        initiator,
        tokenAddress,
        tokenName,
        tokenSymbol,
        tokenDecimals,
        tokenIconHash,
      )
    }

    const doc = {
      colonyAddress,
      colonyName,
      displayName,
      founderAddress: initiator,
      tokenRefs: [
        {
          address: tokenAddress,
          isNative: true,
          isExternal: tokenExists,
        },
      ],
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

    await this.createDomain(initiator, colonyAddress, ROOT_DOMAIN, null, 'Root')

    return this.subscribeToColony(initiator, colonyAddress)
  }

  async editColony(
    initiator: string,
    colonyAddress: string,
    profile: {
      avatarHash?: string | null
      description?: string | null
      displayName?: string | null
      guideline?: string | null
      website?: string | null
    },
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetColony(colonyAddress)

    return this.updateColony(
      colonyAddress,
      {},
      ColonyMongoApi.profileModifier(profile),
    )
  }

  async setColonyTokenAvatar(
    colonyAddress: string,
    tokenAddress: string,
    ipfsHash: string,
  ) {
    await this.tryGetColony(colonyAddress)

    return this.updateColony(
      colonyAddress,
      // @ts-ignore $elemMatch isn't typed well
      { tokenRefs: { $elemMatch: { address: tokenAddress } } },
      { $set: { 'tokenRefs.$.iconHash': ipfsHash } },
    )
  }

  async removeColonyTokenAvatar(colonyAddress: string, tokenAddress: string) {
    await this.tryGetColony(colonyAddress)

    return this.updateColony(
      colonyAddress,
      // @ts-ignore $elemMatch isn't typed well
      { tokenRefs: { $elemMatch: { address: tokenAddress } } },
      { $unset: { 'tokenRefs.$.iconHash': '' } },
    )
  }

  async setUserTokens(initiator: string, tokenAddresses: string[]) {
    await this.tryGetUser(initiator)
    await Promise.all(
      tokenAddresses.map(tokenAddress => this.tryGetToken(tokenAddress)),
    )
    return this.updateUser(initiator, {}, { $set: { tokenAddresses } })
  }

  async createTask(
    initiator: string,
    colonyAddress: string,
    ethDomainId: number,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetColony(colonyAddress)
    await this.tryGetDomain(colonyAddress, ethDomainId)

    const { insertedId } = await this.tasks.insertOne({
      colonyAddress,
      creatorAddress: initiator,
      ethDomainId,
    } as TaskDoc)
    const taskId = insertedId.toString()

    await this.subscribeToTask(initiator, taskId)
    await this.updateColony(colonyAddress, {}, { $push: { taskIds: taskId } })

    const eventId = await this.createEvent(initiator, EventType.CreateTask, {
      colonyAddress,
      ethDomainId,
      taskId,
    })
    await this.createColonyNotification(initiator, eventId, colonyAddress)

    return taskId
  }

  async setTaskDomain(initiator: string, taskId: string, ethDomainId: number) {
    await this.tryGetUser(initiator)
    const { colonyAddress } = await this.tryGetTask(taskId)
    await this.tryGetDomain(colonyAddress, ethDomainId)

    await this.subscribeToTask(initiator, taskId)
    await this.createEvent(initiator, EventType.SetTaskDomain, {
      taskId,
      ethDomainId,
    })
    return this.updateTask(taskId, {}, { $set: { ethDomainId } })
  }

  async setTaskTitle(initiator: string, taskId: string, title: string) {
    await this.tryGetUser(initiator)
    await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    await this.createEvent(initiator, EventType.SetTaskTitle, { taskId, title })
    return this.updateTask(taskId, {}, { $set: { title } })
  }

  async setTaskDescription(
    initiator: string,
    taskId: string,
    description: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    await this.createEvent(initiator, EventType.SetTaskDescription, {
      taskId,
      description,
    })
    return this.updateTask(taskId, {}, { $set: { description } })
  }

  async setTaskDueDate(
    initiator: string,
    taskId: string,
    dueDate: string | null,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    await this.createEvent(initiator, EventType.SetTaskDueDate, {
      taskId,
      dueDate,
    })
    return this.updateTask(
      taskId,
      {},
      dueDate ? { $set: { dueDate } } : { $unset: { dueDate: '' } },
    )
  }

  async setTaskSkill(initiator: string, taskId: string, ethSkillId: number) {
    await this.tryGetUser(initiator)
    await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    await this.createEvent(initiator, EventType.SetTaskSkill, {
      taskId,
      ethSkillId,
    })
    return this.updateTask(taskId, {}, { $set: { ethSkillId } })
  }

  async createWorkRequest(initiator: string, taskId: string) {
    await this.tryGetUser(initiator)
    const { workRequestAddresses = [], creatorAddress } = await this.tryGetTask(
      taskId,
    )

    await this.subscribeToTask(initiator, taskId)

    if (workRequestAddresses.includes(initiator)) {
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

    return this.updateTask(
      taskId,
      {},
      { $push: { workRequestAddresses: initiator } },
    )
  }

  async sendWorkInvite(
    initiator: string,
    taskId: string,
    workerAddress: string,
  ) {
    await this.tryGetUser(initiator)
    const { workInviteAddresses = [] } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)

    if (workInviteAddresses.includes(workerAddress)) {
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
      { $push: { workInviteAddresses: workerAddress } },
    )
  }

  async setTaskPayout(
    initiator: string,
    taskId: string,
    amount: string,
    token: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
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
    await this.tryGetUser(initiator)
    await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
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
    await this.tryGetUser(initiator)
    await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    const eventId = await this.createEvent(initiator, EventType.AssignWorker, {
      taskId,
      workerAddress,
    })
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(
      taskId,
      {},
      { $set: { assignedWorkerAddress: workerAddress } },
    )
  }

  async unassignWorker(
    initiator: string,
    taskId: string,
    workerAddress: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetUser(workerAddress)
    await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
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
      { assignedWorkerAddress: workerAddress },
      { $unset: { assignedWorkerAddress: '' } },
    )
  }

  async finalizeTask(initiator: string, taskId: string) {
    await this.tryGetUser(initiator)
    const task = await this.tryGetTask(taskId)

    if (
      !(task.payouts && task.payouts.length > 0) ||
      !task.assignedWorkerAddress
    ) {
      throw new Error(
        `Unable to finalize task with ID '${taskId}: assigned worker and payout required'`,
      )
    }

    await this.subscribeToTask(initiator, taskId)
    const eventId = await this.createEvent(initiator, EventType.FinalizeTask, {
      taskId,
    })
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(
      taskId,
      {},
      { $set: { finalizedAt: new Date().toISOString() } },
    )
  }

  async cancelTask(initiator: string, taskId: string) {
    await this.tryGetUser(initiator)
    await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    const eventId = await this.createEvent(initiator, EventType.CancelTask, {
      taskId,
    })
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(
      taskId,
      {},
      { $set: { cancelledAt: new Date().toISOString() } },
    )
  }

  async markNotificationAsRead(initiator: string, id: string) {
    await this.tryGetUser(initiator)

    // Horrific typing to get this checked reasonably well...
    const match: QuerySelector<NotificationDoc['users']> = {
      $elemMatch: { address: initiator, read: { $ne: true } },
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
    await this.tryGetUser(initiator)

    // Horrific typing to get this checked reasonably well...
    const match: QuerySelector<NotificationDoc['users']> = {
      $elemMatch: { address: initiator, read: { $ne: true } },
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
    ethParentDomainId: number | undefined | null,
    name: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetColony(colonyAddress)

    const isRoot = ethDomainId === ROOT_DOMAIN
    const hasParent = typeof ethParentDomainId === 'number'

    if (hasParent && isRoot) {
      throw new Error('Unable to add root domain with a parent domain')
    }
    if (!hasParent && !isRoot) {
      throw new Error('Unable to add non-root domain without a parent domain')
    }

    if (hasParent) {
      await this.tryGetDomain(colonyAddress, ethParentDomainId)
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
      {
        $setOnInsert: {
          colonyAddress,
          ethDomainId,
          ethParentDomainId,
          name,
        },
      },
      { upsert: true },
    )
  }

  async editDomainName(
    initiator: string,
    colonyAddress: string,
    ethDomainId: number,
    name: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetDomain(colonyAddress, ethDomainId)

    return this.updateDomain(colonyAddress, ethDomainId, {}, { $set: { name } })
  }

  async sendTaskMessage(initiator: string, taskId: string, message: string) {
    await this.tryGetUser(initiator)
    await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    const eventId = await this.createEvent(initiator, EventType.TaskMessage, {
      taskId,
      message,
    })

    const { username: currentUsername } = await this.tryGetUser(initiator)
    const mentioned = matchUsernames(message).filter(
      username => username !== currentUsername,
    )
    const users = (await this.users
      .find({ username: { $in: mentioned } })
      .toArray()).map(({ walletAddress }) => walletAddress)
    await this.createNotification(eventId, users)
  }

  async createToken(
    initiator: string,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    iconHash?: string,
  ) {
    await this.tryGetUser(initiator)

    const doc = {
      address,
      creator: initiator,
      decimals,
      name,
      symbol,
      ...(iconHash ? { iconHash } : null),
    }

    const exists = !!(await this.tokens.findOne({ address }))
    if (exists) {
      throw new Error(`Token with address '${address}' already exists`)
    }

    // An upsert is used even if it's not strictly necessary because
    // it's not the job of a unique index to preserve data integrity.
    return this.tokens.updateOne(doc, { $setOnInsert: doc }, { upsert: true })
  }

  async addColonyTokenReference(
    initiator: string,
    colonyAddress: string,
    tokenAddress: string,
    isExternal: boolean,
    iconHash?: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetColony(colonyAddress)
    await this.tryGetToken(tokenAddress)

    await this.colonies.updateOne(
      { colonyAddress, tokens: { $ne: { address: tokenAddress } } },
      {
        $push: {
          tokens: {
            address: tokenAddress,
            isExternal,
            ...(iconHash ? { iconHash } : null),
          },
        },
      },
    )
  }
}
