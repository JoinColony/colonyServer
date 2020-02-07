import assert from 'assert'
import {
  Collection,
  Db,
  ObjectID,
  QuerySelector,
  UpdateOneOptions,
} from 'mongodb'
import { toChecksumAddress } from 'web3-utils'

import { EventType, ROOT_DOMAIN, AUTO_SUBSCRIBED_COLONIES } from '../constants'
import { isETH } from '../utils'
import { EventContextOfType } from '../graphql/eventContext'
import {
  EditPersistentTaskInput,
  EditSubmissionInput,
  PersistentTaskStatus,
  ProgramStatus,
  SubmissionStatus,
  SuggestionStatus,
} from '../graphql/types'
import {
  ColonyDoc,
  DomainDoc,
  EventDoc,
  NotificationDoc,
  PersistentTaskDoc,
  ProgramDoc,
  StrictRootQuerySelector,
  StrictUpdateQuery,
  SubmissionDoc,
  SuggestionDoc,
  TaskDoc,
  TokenDoc,
  UserDoc,
} from './types'
import { CollectionNames } from './collections'
import { matchUsernames } from './matchers'

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
  private readonly persistentTasks: Collection<PersistentTaskDoc>
  private readonly programs: Collection<ProgramDoc>
  private readonly submissions: Collection<SubmissionDoc>
  private readonly suggestions: Collection<SuggestionDoc>
  private readonly tasks: Collection<TaskDoc>
  private readonly users: Collection<UserDoc>

  constructor(db: Db) {
    this.colonies = db.collection<ColonyDoc>(CollectionNames.Colonies)
    this.events = db.collection<EventDoc<any>>(CollectionNames.Events)
    this.domains = db.collection<DomainDoc>(CollectionNames.Domains)
    this.notifications = db.collection<NotificationDoc>(
      CollectionNames.Notifications,
    )
    this.persistentTasks = db.collection<PersistentTaskDoc>(
      CollectionNames.PersistentTasks,
    )
    this.programs = db.collection<ProgramDoc>(CollectionNames.Programs)
    this.submissions = db.collection<SubmissionDoc>(CollectionNames.Submissions)
    this.suggestions = db.collection<SuggestionDoc>(CollectionNames.Suggestions)
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

  private async tryGetSuggestion(id: string) {
    const suggestion = await this.suggestions.findOne(new ObjectID(id))
    assert.ok(!!suggestion, `Suggestion with ID '${id}' not found`)
    return suggestion
  }

  private async tryGetPersistentTask(id: string) {
    const query = {
      _id: new ObjectID(id),
      status: { $ne: PersistentTaskStatus.Deleted },
    }
    const task = await this.persistentTasks.findOne(query)
    assert.ok(!!task, `Persistent Task with ID '${id}' not found`)
    return task
  }

  private async tryGetSubmission(id: string) {
    const submission = await this.submissions.findOne(new ObjectID(id))
    assert.ok(!!submission, `Submission with ID '${id}' not found`)
    assert.ok(
      submission.status !== SubmissionStatus.Deleted,
      `Submission with ID ${id} was deleted`,
    )
    return submission
  }

  private async tryGetProgram(id: string) {
    const query = {
      _id: new ObjectID(id),
      status: { $ne: ProgramStatus.Deleted },
    }
    const program = await this.programs.findOne(query)
    assert.ok(!!program, `Program with ID '${id}' not found`)
    return program
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
      users: users.map(address => ({ address, read: false })),
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
      .find({ taskIds: taskId, walletAddress: { $ne: initiator } })
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

  private async createEvent<
    T extends EventType,
    C extends EventContextOfType<T>
  >(initiatorAddress: string, type: T, context: C) {
    const { insertedId } = await this.events.insertOne({
      context,
      initiatorAddress,
      type,
      sourceType: 'db',
    })
    return insertedId
  }

  private async getAutoSubscribeColonies() {
    const colonies = await Promise.all(
      AUTO_SUBSCRIBED_COLONIES.map(async (colony: string) => {
        try {
          await this.tryGetColony(colony)
        } catch (err) {
          return null
        }
        return colony
      }),
    )
    return colonies.filter(Boolean)
  }

  async createUser(walletAddress: string, username: string) {
    const doc = { walletAddress, username } as UserDoc

    const colonyAddresses = await this.getAutoSubscribeColonies()
    if (colonyAddresses.length) {
      doc.colonyAddresses = colonyAddresses
    }

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
    await this.users.updateOne(doc, { $setOnInsert: doc }, { upsert: true })

    const eventId = await this.createEvent(walletAddress, EventType.NewUser, {})
    await this.createNotification(eventId, [walletAddress])
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
    tokenIsExternal: boolean,
  ) {
    await this.tryGetUser(initiator)

    const doc: Omit<ColonyDoc, '_id'> = {
      colonyAddress,
      colonyName,
      displayName,
      founderAddress: initiator,
      nativeTokenAddress: tokenAddress,
      isNativeTokenExternal: tokenIsExternal,
      tokenAddresses: [tokenAddress],
      taskIds: [],
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

  async setUserTokens(initiator: string, tokenAddresses: string[]) {
    await this.tryGetUser(initiator)
    const tokens = tokenAddresses
      .filter(token => !isETH(token))
      /*
       * @NOTE In all likelyhood the address that comes from the dApp is already checksummed
       * But we'll checksum it again here as a precaution
       */
      .map(token => toChecksumAddress(token))
    return this.updateUser(initiator, {}, { $set: { tokenAddresses: tokens } })
  }

  async setColonyTokens(
    initiator: string,
    colonyAddress: string,
    tokenAddresses: string[],
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetColony(colonyAddress)
    const tokens = tokenAddresses
      .filter(token => !isETH(token))
      /*
       * @NOTE In all likelyhood the address that comes from the dApp is already checksummed
       * But we'll checksum it again here as a precaution
       */
      .map(token => toChecksumAddress(token))
    return this.updateColony(
      colonyAddress,
      {},
      { $set: { tokenAddresses: tokens } },
    )
  }

  async createTask(
    initiator: string,
    colonyAddress: string,
    ethDomainId: number,
    title?: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetColony(colonyAddress)
    await this.tryGetDomain(colonyAddress, ethDomainId)

    const insertedDoc = {
      colonyAddress,
      creatorAddress: initiator,
      ethDomainId,
      payouts: [],
    } as TaskDoc

    if (title) {
      insertedDoc.title = title
    }

    const { insertedId } = await this.tasks.insertOne(insertedDoc)
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
      colonyAddress,
    })
    return this.updateTask(taskId, {}, { $set: { ethDomainId } })
  }

  async setTaskTitle(initiator: string, taskId: string, title: string) {
    await this.tryGetUser(initiator)
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    await this.createEvent(initiator, EventType.SetTaskTitle, {
      taskId,
      title,
      colonyAddress,
    })
    return this.updateTask(taskId, {}, { $set: { title } })
  }

  async setTaskDescription(
    initiator: string,
    taskId: string,
    description: string,
  ) {
    await this.tryGetUser(initiator)
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    await this.createEvent(initiator, EventType.SetTaskDescription, {
      taskId,
      description,
      colonyAddress,
    })
    return this.updateTask(taskId, {}, { $set: { description } })
  }

  async setTaskDueDate(
    initiator: string,
    taskId: string,
    dueDate: string | null,
  ) {
    await this.tryGetUser(initiator)
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    await this.createEvent(initiator, EventType.SetTaskDueDate, {
      taskId,
      dueDate,
      colonyAddress,
    })
    return this.updateTask(
      taskId,
      {},
      dueDate
        ? { $set: { dueDate: new Date(dueDate) } }
        : { $unset: { dueDate: '' } },
    )
  }

  async setTaskSkill(initiator: string, taskId: string, ethSkillId: number) {
    await this.tryGetUser(initiator)
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    await this.createEvent(initiator, EventType.SetTaskSkill, {
      taskId,
      ethSkillId,
      colonyAddress,
    })
    return this.updateTask(taskId, {}, { $set: { ethSkillId } })
  }

  async removeTaskSkill(initiator: string, taskId: string, ethSkillId: number) {
    await this.tryGetUser(initiator)
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    await this.createEvent(initiator, EventType.RemoveTaskSkill, {
      taskId,
      ethSkillId,
      colonyAddress,
    })
    return this.updateTask(taskId, {}, { $unset: { ethSkillId: '' } })
  }

  async createWorkRequest(initiator: string, taskId: string) {
    await this.tryGetUser(initiator)
    const { workRequestAddresses = [], creatorAddress, colonyAddress } =
      await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)

    if (workRequestAddresses.includes(initiator)) {
      throw new Error(
        `Unable to create work request for '${initiator}'; work request already exists`,
      )
    }

    const eventId = await this.createEvent(
      initiator,
      EventType.CreateWorkRequest,
      {
        taskId,
        colonyAddress,
      },
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
    const { workInviteAddresses = [], colonyAddress } = await this.tryGetTask(
      taskId
    )

    await this.subscribeToTask(initiator, taskId)

    if (workInviteAddresses.includes(workerAddress)) {
      throw new Error(
        `Unable to send work invite for '${workerAddress}'; work invite already sent`,
      )
    }

    const eventId = await this.createEvent(
      initiator,
      EventType.SendWorkInvite,
      {
        taskId,
        workerAddress,
        colonyAddress,
      },
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
    tokenAddress: string,
  ) {
    await this.tryGetUser(initiator)
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    const payout = { amount, tokenAddress }
    const eventId = await this.createEvent(initiator, EventType.SetTaskPayout, {
      taskId,
      amount,
      tokenAddress,
      colonyAddress,
    })
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(taskId, {}, { $push: { payouts: payout } })
  }

  async removeTaskPayout(
    initiator: string,
    taskId: string,
    amount: string,
    tokenAddress: string,
  ) {
    await this.tryGetUser(initiator)
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    const payout = { amount, tokenAddress }
    const eventId = await this.createEvent(
      initiator,
      EventType.RemoveTaskPayout,
      {
        taskId,
        amount,
        tokenAddress,
        colonyAddress,
      },
    )
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(taskId, {}, { $pull: { payouts: payout } })
  }

  async assignWorker(initiator: string, taskId: string, workerAddress: string) {
    await this.tryGetUser(initiator)
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    const eventId = await this.createEvent(initiator, EventType.AssignWorker, {
      taskId,
      workerAddress,
      colonyAddress,
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
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    const eventId = await this.createEvent(
      initiator,
      EventType.UnassignWorker,
      {
        taskId,
        workerAddress,
        colonyAddress,
      },
    )
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(
      taskId,
      { assignedWorkerAddress: workerAddress },
      { $unset: { assignedWorkerAddress: '' } },
    )
  }

  async finalizeTask(
    initiator: string,
    { taskId, ethPotId }: { taskId: string; ethPotId: number },
  ) {
    await this.tryGetUser(initiator)
    const task = await this.tryGetTask(taskId)
    const { colonyAddress } = task;

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
      colonyAddress,
    })
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(
      taskId,
      {},
      { $set: { finalizedAt: new Date(), ethPotId } },
    )
  }

  async cancelTask(initiator: string, taskId: string) {
    await this.tryGetUser(initiator)
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    const eventId = await this.createEvent(initiator, EventType.CancelTask, {
      taskId,
      colonyAddress,
    })
    await this.createTaskNotification(initiator, eventId, taskId)
    return this.updateTask(taskId, {}, { $set: { cancelledAt: new Date() } })
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
      $set: { 'users.$.read': true },
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
    const update: StrictUpdateQuery<NotificationDoc & {
      'users.$.read': boolean
    }> = { $set: { 'users.$.read': true } }

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
    const { colonyAddress } = await this.tryGetTask(taskId)

    await this.subscribeToTask(initiator, taskId)
    const eventId = await this.createEvent(initiator, EventType.TaskMessage, {
      taskId,
      message,
      colonyAddress,
    })

    const { username: currentUsername } = await this.tryGetUser(initiator)
    const mentioned = matchUsernames(message).filter(
      username => username !== currentUsername,
    )
    const users = (
      await this.users.find({ username: { $in: mentioned } }).toArray()
    ).map(({ walletAddress }) => walletAddress)
    await this.createNotification(eventId, users)
  }

  async createSuggestion(
    initiator: string,
    colonyAddress: string,
    ethDomainId: number,
    title: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetColony(colonyAddress)

    const { insertedId } = await this.suggestions.insertOne({
      colonyAddress,
      creatorAddress: initiator,
      ethDomainId,
      status: SuggestionStatus.Open,
      upvotes: [initiator],
      title,
    })

    return insertedId.toString()
  }

  async editSuggestion(
    initiator: string,
    id: string,
    {
      status,
      taskId,
      title,
    }: { status?: SuggestionStatus; taskId?: string; title?: string },
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetSuggestion(id)
    const edit = {} as {
      status?: SuggestionStatus
      taskId?: ObjectID
      title?: string
    }
    if (status) {
      edit.status = status
    }
    if (title) {
      edit.title = title
    }
    if (taskId) {
      edit.taskId = new ObjectID(taskId)
    }
    return this.suggestions.updateOne({ _id: new ObjectID(id) }, { $set: edit })
  }

  async addUpvoteToSuggestion(initiator: string, id: string) {
    // This effectively limits upvotes to users with a registered ENS name
    await this.tryGetUser(initiator)
    await this.tryGetSuggestion(id)
    return this.suggestions.updateOne(
      { _id: new ObjectID(id) },
      { $addToSet: { upvotes: initiator } },
    )
  }

  async removeUpvoteFromSuggestion(initiator: string, id: string) {
    // This effectively limits upvotes to users with a registered ENS name
    await this.tryGetUser(initiator)
    await this.tryGetSuggestion(id)
    return this.suggestions.updateOne(
      { _id: new ObjectID(id) },
      { $pull: { upvotes: initiator } },
    )
  }

  async createPersistentTask(
    initiator: string,
    colonyAddress: string,
    ethDomainId: number,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetColony(colonyAddress)

    const { insertedId } = await this.persistentTasks.insertOne({
      colonyAddress,
      creatorAddress: initiator,
      ethDomainId,
      payouts: [],
      status: PersistentTaskStatus.Active,
    })

    return insertedId.toString()
  }

  async editPersistentTask(
    initiator: string,
    id: string,
    {
      ethDomainId,
      ethSkillId,
      title,
      description,
    }: Omit<EditPersistentTaskInput, 'id'>,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetPersistentTask(id)

    const edit = {} as Omit<EditPersistentTaskInput, 'id'>
    if (ethDomainId) {
      edit.ethDomainId = ethDomainId
    }
    if (ethSkillId) {
      edit.ethSkillId = ethSkillId
    }
    if (title) {
      edit.title = title
    }
    if (description) {
      edit.description = description
    }
    return this.persistentTasks.updateOne(
      { _id: new ObjectID(id) },
      { $set: edit },
    )
  }

  async setPersistentTaskPayout(
    initiator: string,
    persistentTaskId: string,
    amount: string,
    tokenAddress: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetPersistentTask(persistentTaskId)

    const payout = { amount, tokenAddress }
    return this.persistentTasks.updateOne(
      { _id: new ObjectID(persistentTaskId) },
      { $push: { payouts: payout } },
    )
  }

  async removePersistentTaskPayout(
    initiator: string,
    persistentTaskId: string,
    amount: string,
    tokenAddress: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetPersistentTask(persistentTaskId)

    const payout = { amount, tokenAddress }
    return this.persistentTasks.updateOne(
      { _id: new ObjectID(persistentTaskId) },
      { $pull: { payouts: payout } },
    )
  }

  async removePersistentTask(initiator: string, id: string) {
    await this.tryGetUser(initiator)
    await this.tryGetPersistentTask(id)

    return this.persistentTasks.updateOne(
      { _id: new ObjectID(id) },
      { $set: { status: PersistentTaskStatus.Deleted } },
    )
  }

  async createSubmission(
    initiator: string,
    persistentTaskId: string,
    submission: string,
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetPersistentTask(persistentTaskId)

    const { insertedId } = await this.submissions.insertOne({
      creatorAddress: initiator,
      persistentTaskId: new ObjectID(persistentTaskId),
      submission: submission,
      status: SubmissionStatus.Open,
      statusChangedAt: new Date(),
    })

    return insertedId.toString()
  }

  async editSubmission(
    initiator: string,
    id: string,
    { submission, status }: { submission?: string; status?: SubmissionStatus },
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetSubmission(id)

    const edit = {} as { submission?: string; status?: SubmissionStatus }

    if (submission) {
      edit.submission = submission
    }

    if (status) {
      edit.status = status
    }

    return this.submissions.updateOne({ _id: new ObjectID(id) }, { $set: edit })
  }

  async createProgram(initiator: string, colonyAddress: string) {
    await this.tryGetUser(initiator)
    await this.tryGetColony(colonyAddress)

    const { insertedId } = await this.programs.insertOne({
      colonyAddress,
      creatorAddress: initiator,
      levelIds: [],
      status: ProgramStatus.Draft,
    })

    return insertedId.toString()
  }

  async editProgram(
    initiator: string,
    id: string,
    {
      title,
      description,
      status,
    }: { title?: string; description?: string; status?: ProgramStatus },
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetProgram(id)

    const update = {} as {
      title?: string
      description?: string
      status?: ProgramStatus
    }

    if (title) {
      update.title = title
    }
    if (description) {
      update.description = description
    }
    if (status) {
      update.status = status
    }

    return this.programs.updateOne(
      {
        _id: new ObjectID(id),
      },
      update,
    )
  }
}
