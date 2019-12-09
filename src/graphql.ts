import { Provider } from 'ethers/providers'
import { IResolvers } from 'graphql-tools'
import {
  ApolloServer,
  AuthenticationError,
  ForbiddenError,
  gql,
  ValidationError,
} from 'apollo-server-express'
import { Db } from 'mongodb'

import { getAddressFromToken } from './auth'
import { ColonyAuthDataSource } from './network/colonyAuthDataSource'
import { ColonyMongoDataSource } from './db/colonyMongoDataSource'
import { ColonyMongoApi } from './db/colonyMongoApi'
import { CollectionNames } from './db/collections'

interface ApolloContext {
  readonly user: string // The authenticated user address (we can trust this!)
  readonly api: ColonyMongoApi // The Colony MongoDB API to perform mutations (NOT for verification/authentication!)
  readonly dataSources: Readonly<{
    auth: ColonyAuthDataSource // A thin wrapper of Colony contracts, for on-chain authentication checks
    data: ColonyMongoDataSource // The Colony MongoDB data source (NOT for verification/authentication!)
  }>
}

interface Input<T extends object> {
  input: T
}

const typeDefs = gql`
  type UserProfile {
    username: String
    avatarHash: String
    bio: String
    displayName: String
    location: String
    walletAddress: String!
    website: String
  }

  type User {
    id: String! # wallet address
    profile: UserProfile!
    colonies: [Colony!]!
    tasks: [Task!]!
    notifications(read: Boolean): [Notification!] # Only provided for the current user
  }

  type Token {
    address: String!
    name: String
    symbol: String
    iconHash: String
    isExternal: Boolean
    isNative: Boolean
  }

  type Colony {
    id: String! # colony address
    colonyAddress: String!
    colonyName: String!
    avatarHash: String
    description: String
    displayName: String
    guideline: String
    website: String
    tasks: [Task!]!
    domains: [Domain!]!
    founder: User
    subscribedUsers: [User!]!
    # token: Token
  }

  type Domain {
    id: String! # TODO is this mongo id or colonyaddress-ethdomainid?
    colonyAddress: String!
    ethDomainId: Int!
    ethParentDomainId: Int!
    name: String!
    colony: Colony!
    parent: Domain
    tasks: [Task!]!
  }

  type Task {
    id: String! # stringified ObjectId
    ethTaskId: Int
    ethDomainId: Int!
    ethSkillId: Int
    cancelledAt: Int
    description: String
    dueDate: Int
    finalizedAt: Int
    title: String
    colony: Colony
    creator: User
    assignedWorker: User
    workInvites: [User!]!
    workRequests: [User!]!
    events: [Event!]!
  }

  interface TaskEvent {
    taskId: String!
  }

  interface ColonyEvent {
    colonyAddress: String!
  }

  type AssignWorkerEvent implements TaskEvent {
    taskId: String!
    workerAddress: String!
  }

  type UnassignWorkerEvent implements TaskEvent {
    taskId: String!
    workerAddress: String!
  }

  type CancelTaskEvent implements TaskEvent {
    taskId: String!
  }

  type CreateDomainEvent implements ColonyEvent {
    ethDomainId: String!
    colonyAddress: String!
  }

  type CreateTaskEvent implements TaskEvent {
    taskId: String!
    ethDomainId: String!
    colonyAddress: String!
  }

  type CreateWorkRequestEvent implements TaskEvent {
    taskId: String!
  }

  type FinalizeTaskEvent implements TaskEvent {
    taskId: String!
  }

  type RemoveTaskPayoutEvent implements TaskEvent {
    taskId: String!
  }

  type SendWorkInviteEvent implements TaskEvent {
    taskId: String!
  }

  type SetTaskDescriptionEvent implements TaskEvent {
    taskId: String!
    description: String!
  }

  type SetTaskDomainEvent implements TaskEvent {
    taskId: String!
    ethDomainId: String!
  }

  type SetTaskDueDateEvent implements TaskEvent {
    taskId: String!
    dueDate: Int!
  }

  type SetTaskPayoutEvent implements TaskEvent {
    taskId: String!
  }

  type SetTaskSkillEvent implements TaskEvent {
    taskId: String!
    ethSkillId: Int!
  }

  type SetTaskTitleEvent implements TaskEvent {
    taskId: String!
    title: String!
  }

  type TaskMessageEvent implements TaskEvent {
    taskId: String!
    message: String!
  }

  union EventContext =
      AssignWorkerEvent
    | CancelTaskEvent
    | CreateDomainEvent
    | CreateTaskEvent
    | CreateWorkRequestEvent
    | FinalizeTaskEvent
    | RemoveTaskPayoutEvent
    | SendWorkInviteEvent
    | SetTaskDescriptionEvent
    | SetTaskDomainEvent
    | SetTaskDueDateEvent
    | SetTaskPayoutEvent
    | SetTaskSkillEvent
    | SetTaskTitleEvent
    | TaskMessageEvent
    | UnassignWorkerEvent

  type Event {
    type: String!
    initiator: User!
    sourceId: String!
    sourceType: String!
    context: EventContext!
  }

  type Notification {
    event: Event!
    read: Boolean!
  }

  type Query {
    user(address: String!): User!
    colony(address: String!): Colony!
    domain(colonyAddress: String!, ethDomainId: Int!): Colony!
    task(id: String!): Task!
  }

  input CreateUserInput {
    username: String!
  }

  input EditUserInput {
    avatarHash: String
    bio: String
    displayName: String
    location: String
    website: String
  }

  input CreateColonyInput {
    colonyAddress: String!
    colonyName: String!
    displayName: String!
  }

  input CreateTaskInput {
    colonyAddress: String!
    ethDomainId: Int!
  }

  input SetTaskDomainInput {
    id: String!
    ethDomainId: Int!
  }

  input SetTaskSkillInput {
    id: String!
    ethSkillId: Int!
  }

  input SetTaskTitleInput {
    id: String!
    title: String!
  }

  input SetTaskDescriptionInput {
    id: String!
    description: String!
  }

  input SetTaskDueDateInput {
    id: String!
    dueDate: Int!
  }

  input CreateWorkRequestInput {
    id: String!
  }

  input SendWorkInviteInput {
    id: String!
    workerAddress: String!
  }

  input SetTaskPayoutInput {
    id: String!
    amount: String!
    token: String!
    ethDomainId: Int!
  }

  input RemoveTaskPayoutInput {
    id: String!
    amount: String!
    token: String!
    ethDomainId: Int!
  }

  input AssignWorkerInput {
    id: String!
    workerAddress: String!
  }

  input UnassignWorkerInput {
    id: String!
    workerAddress: String!
  }

  input TaskIdInput {
    id: String!
  }

  input EditColonyProfileInput {
    colonyAddress: String!
    avatarHash: String
    description: String
    displayName: String
    guideline: String
    website: String
  }

  input SubscribeToColonyInput {
    colonyAddress: String!
  }

  input UnsubscribeFromColonyInput {
    colonyAddress: String!
  }

  input MarkNotificationAsReadInput {
    id: String!
  }

  input SendTaskMessageInput {
    id: String!
    message: String!
  }

  input CreateDomainInput {
    colonyAddress: String!
    ethDomainId: Int!
    name: Int!
    parentEthDomainId: Int
  }

  input EditDomainNameInput {
    colonyAddress: String!
    ethDomainId: Int!
    name: Int!
  }

  type Mutation {
    # Users
    createUser(input: CreateUserInput!): User # TODO find out why we can't use an exclamation mark here
    editUser(input: EditUserInput!): User
    subscribeToColony(input: SubscribeToColonyInput!): User
    unsubscribeFromColony(input: UnsubscribeFromColonyInput!): User
    # Colonies
    createColony(input: CreateColonyInput!): Colony
    editColonyProfile(input: EditColonyProfileInput!): Colony
    # Domains
    createDomain(input: CreateDomainInput!): Domain
    editDomainName(input: EditDomainNameInput!): Domain
    # Tasks
    assignWorker(input: AssignWorkerInput!): Task
    cancelTask(input: TaskIdInput!): Task
    createTask(input: CreateTaskInput!): Task
    createWorkRequest(input: CreateWorkRequestInput!): Task
    finalizeTask(input: TaskIdInput!): Task
    removeTaskPayout(input: RemoveTaskPayoutInput!): Task
    sendWorkInvite(input: SendWorkInviteInput!): Task
    setTaskDomain(input: SetTaskDomainInput!): Task
    setTaskDescription(input: SetTaskDescriptionInput!): Task
    setTaskDueDate(input: SetTaskDueDateInput!): Task
    setTaskPayout(input: SetTaskPayoutInput!): Task
    setTaskSkill(input: SetTaskSkillInput!): Task
    setTaskTitle(input: SetTaskTitleInput!): Task
    unassignWorker(input: UnassignWorkerInput!): Task
    # Notifications
    markAllNotificationsAsRead: Boolean!
    markNotificationAsRead(input: MarkNotificationAsReadInput!): Boolean!
    # Messages
    sendTaskMessage(input: SendTaskMessageInput!): Boolean!
  }
`

const tryAuth = async (promise: Promise<boolean>) => {
  let auth = false

  try {
    auth = await promise
  } catch (caughtError) {
    throw new ForbiddenError(caughtError.message || caughtError.toString())
  }

  if (!auth) {
    throw new ForbiddenError('Not allowed')
  }
}

const resolvers: IResolvers<any, ApolloContext> = {
  // TODO add colony/user tokens
  Query: {
    async user(parent, { address }, { dataSources: { data } }) {
      return data.getUserByAddress(address)
    },
    async colony(
      parent,
      { address }: { address: string },
      { dataSources: { data } },
    ) {
      return data.getColonyByAddress(address)
    },
    async domain(
      parent,
      {
        colonyAddress,
        ethDomainId,
      }: { colonyAddress: string; ethDomainId: number },
      { dataSources: { data } },
    ) {
      return data.getDomainByEthId(colonyAddress, ethDomainId)
    },
    // TODO task by ethTaskId/colonyAddress
    async task(parent, { id }: { id: string }, { dataSources: { data } }) {
      return data.getTaskById(id)
    },
  },
  Event: {
    async initiator({ initiator }, input: any, { dataSources: { data } }) {
      return data.getUserByAddress(initiator)
    },
  },
  EventContext: {
    __resolveType({ type }) {
      return `${type}Event`
    },
  },
  TaskEvent: {
    __resolveType() {
      // Preferable to do this over turning `requireResolversForResolveType` off?
      throw new Error('TaskEvent is an abstract interface')
    },
  },
  ColonyEvent: {
    __resolveType() {
      // Preferable to do this over turning `requireResolversForResolveType` off?
      throw new Error('ColonyEvent is an abstract interface')
    },
  },
  Domain: {
    async colony({ colonyAddress }, input: any, { dataSources: { data } }) {
      return data.getColonyByAddress(colonyAddress)
    },
    async parent(
      { colonyAddress, ethParentDomainId },
      input: any,
      { dataSources: { data } },
    ) {
      return ethParentDomainId
        ? await data.getDomainByEthId(colonyAddress, ethParentDomainId)
        : null
    },
    async tasks(
      { colonyAddress, ethDomainId },
      input: any,
      { dataSources: { data } },
    ) {
      return data.getTasksByEthDomainId(colonyAddress, ethDomainId)
    },
  },
  Colony: {
    async tasks(
      { tasks = [] },
      // TODO select on-chain tasks by ethTaskId, so that we can start from on-chain and select from there
      // TODO allow restriction of query, e.g. by open tasks
      input: any,
      { dataSources: { data } },
    ) {
      return data.getTasksById(tasks)
    },
    async domains({ colonyAddress }, input: any, { dataSources: { data } }) {
      return data.getColonyDomains(colonyAddress)
    },
    async founder({ founderAddress }, input: any, { dataSources: { data } }) {
      return data.getUserByAddress(founderAddress)
    },
    async subscribedUsers(
      { colonyAddress },
      input: any,
      { dataSources: { data } },
    ) {
      return data.getColonySubscribedUsers(colonyAddress)
    },
  },
  User: {
    async colonies(
      { subscribedColonies = [] },
      input: any,
      { dataSources: { data } },
    ) {
      return data.getColoniesByAddress(subscribedColonies)
    },
    async tasks(
      { subscribedTasks = [] },
      input: any, // TODO allow restriction of query, e.g. by open tasks
      { dataSources: { data } },
    ) {
      return data.getTasksById(subscribedTasks)
    },
    async notifications(
      { id },
      { read }: { read?: boolean },
      { user, dataSources: { data } },
    ) {
      // Only find notifications for the current user
      if (id !== user) return null

      if (read === false) {
        return data.getUnreadUserNotifications(user)
      } else if (read) {
        return data.getReadUserNotifications(user)
      } else {
        return data.getAllUserNotifications(user)
      }
    },
  },
  Task: {
    async colony({ colonyAddress }, input: any, { dataSources: { data } }) {
      return data.getColonyByAddress(colonyAddress)
    },
    async creator({ creatorAddress }, input: any, { dataSources: { data } }) {
      return data.getUserByAddress(creatorAddress)
    },
    async assignedWorker(
      { assignedWorker },
      input: any,
      { dataSources: { data } },
    ) {
      return assignedWorker ? await data.getUserByAddress(assignedWorker) : null
    },
    async workInvites(
      { workInvites = [] },
      input: any,
      { dataSources: { data } },
    ) {
      return data.getUsersByAddress(workInvites)
    },
    async workRequests(
      { workRequests = [] },
      input: any,
      { dataSources: { data } },
    ) {
      return data.getUsersByAddress(workRequests)
    },
    async events({ id }, input: any, { dataSources: { data } }) {
      return data.getTaskEvents(id)
    },
  },
  Mutation: {
    // Users
    async createUser(
      parent,
      { input: { username } }: Input<{ username: string }>,
      { user, api, dataSources: { data } },
    ) {
      await api.createUser(user, username)
      return data.getUserByAddress(user)
    },
    async editUser(
      parent,
      {
        input,
      }: Input<{
        avatarHash?: string | null
        bio?: string | null
        displayName?: string | null
        location?: string | null
        website?: string | null
      }>,
      { user, api, dataSources: { data } },
    ) {
      await api.editUser(user, input)
      return data.getUserByAddress(user)
    },
    async subscribeToColony(
      parent,
      { input: { colonyAddress } }: Input<{ colonyAddress: string }>,
      { user, api, dataSources: { data } },
    ) {
      await api.subscribeToColony(user, colonyAddress)
      return data.getUserByAddress(user)
    },
    async unsubscribeFromColony(
      parent,
      { input: { colonyAddress } }: Input<{ colonyAddress: string }>,
      { user, api, dataSources: { data } },
    ) {
      await api.unsubscribeFromColony(user, colonyAddress)
      return data.getUserByAddress(user)
    },
    // Colonies
    async createColony(
      parent,
      {
        input: { colonyAddress, colonyName, displayName },
      }: Input<{
        colonyAddress: string
        colonyName: string
        displayName: string
      }>,
      { user, api, dataSources: { data, auth } },
    ) {
      // No permissions-based auth call needed: anyone should be able to do this

      // TODO test that the given colony address exists on-chain?
      // Not really auth per-se, more validation (if it doesn't exist, permissions checks will fail)
      // TODO the newly-created Colony might not be propagated... maybe we need to use events/polling?
      // await tryAuth(auth.assertColonyExists(colonyAddress))

      // TODO we need to get the right creatorAddress...
      await api.createColony(user, colonyAddress, colonyName, displayName)
      return data.getColonyByAddress(colonyAddress)
    },
    async editColonyProfile(
      parent,
      {
        input: { colonyAddress, ...profile },
      }: Input<{
        colonyAddress: string
        avatarHash?: string | null
        description?: string | null
        displayName?: string | null
        guideline?: string | null
        website?: string | null
      }>,
      { user, api, dataSources: { data, auth } },
    ) {
      await tryAuth(auth.assertCanEditColonyProfile(colonyAddress, user))
      await api.editColony(colonyAddress, profile)
      return data.getColonyByAddress(colonyAddress)
    },
    // Tasks
    async createTask(
      parent,
      {
        input: { colonyAddress, ethDomainId },
      }: Input<{ colonyAddress: string; ethDomainId: number }>,
      { user, api, dataSources: { data, auth } },
    ) {
      await tryAuth(auth.assertCanCreateTask(colonyAddress, user, ethDomainId))
      const taskId = await api.createTask(user, colonyAddress, ethDomainId)
      return data.getTaskById(taskId)
    },
    async setTaskDomain(
      parent,
      {
        input: { id, ethDomainId },
      }: Input<{ id: string; ethDomainId: number }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const {
        colonyAddress,
        ethDomainId: currentEthDomainId,
      } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanSetTaskDomain(
          colonyAddress,
          user,
          currentEthDomainId,
          ethDomainId,
        ),
      )
      await api.setTaskDomain(user, id, ethDomainId)
      return data.getTaskById(id)
    },
    async setTaskDescription(
      parent,
      {
        input: { id, description },
      }: Input<{ id: string; description: string }>,
      { user, api, dataSources: { data, auth } },
    ) {
      // TODO for all of these cases (where we need to look up the ethDomainId for an off-chain task),
      // it's ok to do this lookup, but if we have an ethTaskId, we should look up the ethDomainId
      // from on-chain.
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanSetTaskDescription(colonyAddress, user, ethDomainId),
      )
      await api.setTaskDescription(user, id, description)
      return data.getTaskById(id)
    },
    async setTaskTitle(
      parent,
      { input: { id, title } }: Input<{ id: string; title: string }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanSetTaskTitle(colonyAddress, user, ethDomainId),
      )
      await api.setTaskTitle(user, id, title)
      return data.getTaskById(id)
    },
    async setTaskSkill(
      parent,
      { input: { id, ethSkillId } }: Input<{ id: string; ethSkillId: number }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanSetTaskSkill(colonyAddress, user, ethDomainId),
      )
      await api.setTaskSkill(user, id, ethSkillId)
      return data.getTaskById(id)
    },
    async setTaskDueDate(
      parent,
      { input: { id, dueDate } }: Input<{ id: string; dueDate: number }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanSetTaskDueDate(colonyAddress, user, ethDomainId),
      )
      await api.setTaskDueDate(user, id, new Date(dueDate))
      return data.getTaskById(id)
    },
    async createWorkRequest(
      parent,
      { input: { id } }: Input<{ id: string }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanCreateWorkRequest(colonyAddress, user, ethDomainId),
      )
      await api.createWorkRequest(user, id)
      return data.getTaskById(id)
    },
    async sendWorkInvite(
      parent,
      {
        input: { id, workerAddress },
      }: Input<{ id: string; workerAddress: string }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanSendWorkInvite(colonyAddress, user, ethDomainId),
      )
      await api.sendWorkInvite(user, id, workerAddress)
      return data.getTaskById(id)
    },
    async setTaskPayout(
      parent,
      {
        input: { id, amount, token },
      }: Input<{ id: string; amount: string; token: string }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanSetTaskPayout(colonyAddress, user, ethDomainId),
      )
      await api.setTaskPayout(user, id, amount, token)
      return data.getTaskById(id)
    },
    async removeTaskPayout(
      parent,
      {
        input: { id, amount, token },
      }: Input<{ id: string; amount: string; token: string }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanRemoveTaskPayout(colonyAddress, user, ethDomainId),
      )
      await api.removeTaskPayout(user, id, amount, token)
      return data.getTaskById(id)
    },
    async assignWorker(
      parent,
      {
        input: { id, workerAddress },
      }: Input<{ id: string; workerAddress: string }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanAssignWorker(colonyAddress, user, ethDomainId),
      )
      await api.assignWorker(user, id, workerAddress)
      return data.getTaskById(id)
    },
    async unassignWorker(
      parent,
      {
        input: { id, workerAddress },
      }: Input<{ id: string; workerAddress: string }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanUnassignWorker(colonyAddress, user, ethDomainId),
      )
      await api.unassignWorker(user, id, workerAddress)
      return data.getTaskById(id)
    },
    async finalizeTask(
      parent,
      { input: { id } }: Input<{ id: string }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(
        auth.assertCanFinalizeTask(colonyAddress, user, ethDomainId),
      )
      await api.finalizeTask(user, id)
      return data.getTaskById(id)
    },
    async cancelTask(
      parent,
      { input: { id } }: Input<{ id: string }>,
      { user, api, dataSources: { data, auth } },
    ) {
      const { colonyAddress, ethDomainId } = await data.getTaskById(id)
      await tryAuth(auth.assertCanCancelTask(colonyAddress, user, ethDomainId))
      await api.cancelTask(user, id)
      return data.getTaskById(id)
    },
    // Notifications
    async markNotificationAsRead(
      parent,
      { input: { id } }: Input<{ id: string }>,
      { user, api },
    ) {
      // No auth call needed; restricted to the current authenticated user address
      await api.markNotificationAsRead(user, id)
      return true
    },
    async markAllNotificationsAsRead(parent, input: Input<any>, { user, api }) {
      // No auth call needed; restricted to the current authenticated user address
      await api.markAllNotificationsAsRead(user)
      return true
    },
    // Messages
    async sendTaskMessage(
      parent,
      { input: { id, message } }: Input<{ id: string; message: string }>,
      { user, api },
    ) {
      // No auth call needed; anyone can do this (for now...?)
      // TODO assert task exists? Should this be done for all of these mutations, or in API land?
      await api.sendTaskMessage(user, id, message)
      return true
    },
    // Domains
    async createDomain(
      parent,
      {
        input: { ethDomainId, ethParentDomainId, name, colonyAddress },
      }: Input<{
        ethDomainId: number
        ethParentDomainId: number
        name: string
        colonyAddress: string
      }>,
      { user, api, dataSources: { auth, data } },
    ) {
      await tryAuth(
        auth.assertCanCreateDomain(
          colonyAddress,
          user,
          ethDomainId,
          ethParentDomainId,
        ),
      )
      await api.createDomain(
        user,
        colonyAddress,
        ethDomainId,
        ethParentDomainId,
        name,
      )
      return data.getDomainByEthId(colonyAddress, ethDomainId)
    },
    async editDomainName(
      parent,
      {
        input: { ethDomainId, name, colonyAddress },
      }: Input<{
        ethDomainId: number
        name: string
        colonyAddress: string
      }>,
      { user, api, dataSources: { auth, data } },
    ) {
      await tryAuth(
        auth.assertCanEditDomainName(colonyAddress, user, ethDomainId),
      )
      await api.editDomainName(user, colonyAddress, ethDomainId, name)
      return data.getDomainByEthId(colonyAddress, ethDomainId)
    },
  },
}

const authenticate = (token: string) => {
  let user

  // In dev mode we enable a mode without a token for code generation
  if (process.env.NODE_ENV === 'development' && token === 'codegen') {
    user = null
  } else {
    /**
     * @NOTE
     *
     * Theoretically we don't _need_ to do this authentication check for all
     * requests, and this could be handled by each resolver. However, since
     * the current use-case (dapp) requires a wallet address, we may as well
     * put this check here, and disallow any requests without a valid token.
     */
    try {
      user = getAddressFromToken(token as string)
    } catch (caughtError) {
      throw new AuthenticationError(
        `Not authenticated: ${caughtError.message || caughtError.toString()}`,
      )
    }
  }
  return user
}

export const createApolloServer = (db: Db, provider: Provider) => {
  const api = new ColonyMongoApi(db)
  const data = new ColonyMongoDataSource([
    db.collection(CollectionNames.Colonies),
    db.collection(CollectionNames.Domains),
    db.collection(CollectionNames.Events),
    db.collection(CollectionNames.Notifications),
    db.collection(CollectionNames.Tasks),
    db.collection(CollectionNames.Users),
  ])
  const auth = new ColonyAuthDataSource(provider)
  return new ApolloServer({
    typeDefs,
    resolvers,
    formatError: err => {
      // MongoDB json schema validation
      if (err.message.includes('failed validation')) {
        return new ValidationError('Database validation failed')
      }
      // Otherwise return the original error.  The error can also
      // be manipulated in other ways, so long as it's returned.
      return err
    },
    dataSources: () => ({ auth, data }),
    context: ({ req }) => {
      const token = (req.headers['x-access-token'] ||
        req.headers['authorization']) as string
      const user = authenticate(token)
      return {
        api,
        user,
      }
    },
  })
}
