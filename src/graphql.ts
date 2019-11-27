import { IResolvers } from 'graphql-tools'
import {
  ApolloServer,
  AuthenticationError,
  ForbiddenError,
  gql,
} from 'apollo-server-express'
import { Db } from 'mongodb'

import { getAddressFromToken } from './auth'
import { Colonies, Tasks, Users } from './db/datasources'
import { ColonyAuth } from './network/datasources'
import { Provider } from 'ethers/providers'

interface ApolloContext {
  user: string
  dataSources: {
    colonies: Colonies
    auth: ColonyAuth
    tasks: Tasks
    users: Users
  }
}

interface Input<T extends object> {
  input: T
}

const typeDefs = gql`
  type UserProfile {
    username: String!
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
    # token: Token
  }

  type Task {
    id: String! # stringified ObjectId
    colonyAddress: String!
    creatorAddress: String!
    ethTaskId: Int
    ethDomainId: Int!
    ethSkillId: Int
    assignedWorker: String
    cancelledAt: Int
    description: String
    dueDate: Int
    finalizedAt: Int
    title: String
    # workInvites: [String]
    # workRequests: [String]
  }

  type Query {
    user(address: String!): User!
    colony(address: String!): Colony!
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
    workerAddress: String!
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
    displayName: String
    description: String
    guideline: String
    website: String
  }

  input SetColonyAvatarInput {
    colonyAddress: String!
    ipfsHash: String!
  }

  input RemoveColonyAvatarInput {
    colonyAddress: String!
  }

  input SetUserAvatarInput {
    ipfsHash: String!
  }

  input SubscribeToColonyInput {
    colonyAddress: String!
  }

  input UnsubscribeFromColonyInput {
    colonyAddress: String!
  }

  input SubscribeToTaskInput {
    id: String!
  }

  input UnsubscribeFromTaskInput {
    id: String!
  }

  type Mutation {
    # Users
    createUser(input: CreateUserInput!): User!
    editUser(input: EditUserInput!): User!
    setUserAvatar(input: SetUserAvatarInput!): User!
    removeUserAvatar(input: SetUserAvatarInput): User! # TODO input should be empty
    subscribeToColony(input: SubscribeToColonyInput!): User!
    unsubscribeFromColony(input: UnsubscribeFromColonyInput!): User!
    subscribeToTask(input: SubscribeToTaskInput!): User!
    unsubscribeFromTask(input: UnsubscribeFromTaskInput!): User!
    # Colonies
    createColony(input: CreateColonyInput!): Colony!
    editColonyProfile(input: EditColonyProfileInput!): Colony!
    setColonyAvatar(input: SetColonyAvatarInput!): Colony!
    removeColonyAvatar(input: RemoveColonyAvatarInput!): Colony!
    # Tasks
    createTask(input: CreateTaskInput!): Task!
    setTaskDomain(input: SetTaskDomainInput!): Task!
    setTaskTitle(input: SetTaskTitleInput!): Task!
    setTaskSkill(input: SetTaskSkillInput!): Task!
    setTaskDueDate(input: SetTaskDueDateInput!): Task!
    createWorkRequest(input: CreateWorkRequestInput!): Task!
    sendWorkInvite(input: SendWorkInviteInput!): Task!
    setTaskPayout(input: SetTaskPayoutInput!): Task!
    removeTaskPayout(input: RemoveTaskPayoutInput!): Task!
    assignWorker(input: AssignWorkerInput!): Task!
    unssignWorker(input: UnassignWorkerInput!): Task!
    finalizeTask(input: TaskIdInput!): Task!
    cancelTask(input: TaskIdInput!): Task!
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
  Query: {
    async user(parent, { address }, { dataSources: { users } }) {
      return users.getOne(address)
    },
    async colony(
      parent,
      { address }: { address: string },
      { dataSources: { colonies } },
    ) {
      return colonies.getOne(address)
    },
    async task(
      parent,
      { id }: { id: string }, // TODO support get by ethTaskId/colonyAddress?
      { dataSources: { tasks } },
    ) {
      return tasks.getOne(id)
    },
  },
  Mutation: {
    // Users
    async createUser(
      parent,
      { input: { username } }: Input<{ username: string }>,
      { user, dataSources: { users } },
    ) {
      return users.create(user, username)
    },
    async editUser(
      parent,
      {
        input,
      }: Input<{
        displayName?: string
        website?: string
        location?: string
        bio?: string
      }>,
      { user, dataSources: { users } },
    ) {
      return users.edit(user, input)
    },
    async setUserAvatar(
      parent,
      { input: { ipfsHash } }: Input<{ ipfsHash: string }>,
      { user, dataSources: { users } },
    ) {
      return users.setAvatar(user, ipfsHash)
    },
    async removeUserAvatar(
      parent,
      {  }: Input<any>,
      { user, dataSources: { users } },
    ) {
      return users.removeAvatar(user)
    },
    async subscribeToColony(
      parent,
      { input: { colonyAddress } }: Input<{ colonyAddress: string }>,
      { user, dataSources: { users } },
    ) {
      return users.subscribeToColony(user, colonyAddress)
    },
    async unsubscribeFromColony(
      parent,
      { input: { colonyAddress } }: Input<{ colonyAddress: string }>,
      { user, dataSources: { users } },
    ) {
      return users.unsubscribeFromColony(user, colonyAddress)
    },
    async subscribeToTask(
      parent,
      { input: { id } }: Input<{ id: string }>,
      { user, dataSources: { users } },
    ) {
      return users.subscribeToTask(user, id)
    },
    async unsubscribeFromTask(
      parent,
      { input: { id } }: Input<{ id: string }>,
      { user, dataSources: { users } },
    ) {
      return users.unsubscribeFromTask(user, id)
    },
    // Colonies
    async createColony(
      parent,
      {
        input: { colonyAddress, colonyName },
      }: Input<{ colonyAddress: string; colonyName: string }>,
      { user, dataSources: { colonies, users } },
    ) {
      await colonies.create(colonyAddress, colonyName, user)
      await users.subscribeToColony(user, colonyAddress)
      return colonies.getOne(colonyAddress)
    },
    // Tasks
    async createTask(
      parent,
      {
        input: { colonyAddress, ethDomainId },
      }: Input<{ colonyAddress: string; ethDomainId: number }>,
      { user, dataSources: { colonies, tasks, users, auth } },
    ) {
      // await tryAuth(auth.assertCanCreateTask(colonyAddress, user, ethDomainId))
      const task = await tasks.create(colonyAddress, user, ethDomainId)
      await users.subscribeToColony(user, task.id)
      await colonies.addReferenceToTask(colonyAddress, task.id)
      return task
    },
    async setTaskDomain(
      parent,
      {
        input: { id, ethDomainId },
      }: Input<{ id: string; ethDomainId: number }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanSetTaskDomain(colonyAddress, user, ethDomainId))
      return tasks.setDomain(id, ethDomainId)
    },
    async setTaskTitle(
      parent,
      { input: { id, title } }: Input<{ id: string; title: string }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress, ethDomainId } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanSetTaskTitle(colonyAddress, user, ethDomainId))
      return tasks.setTitle(id, title)
    },
    async setTaskSkill(
      parent,
      { input: { id, ethSkillId } }: Input<{ id: string; ethSkillId: number }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress, ethDomainId } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanSetTaskSkill(colonyAddress, user, ethDomainId))
      return tasks.setSkill(id, ethSkillId)
    },
    async setTaskDueDate(
      parent,
      { input: { id, dueDate } }: Input<{ id: string; dueDate: number }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress, ethDomainId } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanSetTaskDueDate(colonyAddress, user, ethDomainId))
      return tasks.setDueDate(id, new Date(dueDate))
    },
    async createWorkRequest(
      parent,
      {
        input: { id, workerAddress },
      }: Input<{ id: string; workerAddress: string }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress, ethDomainId } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanCreateWorkRequest(colonyAddress, user, ethDomainId))
      return tasks.createWorkRequest(id, workerAddress)
    },
    async sendWorkInvite(
      parent,
      {
        input: { id, workerAddress },
      }: Input<{ id: string; workerAddress: string }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress, ethDomainId } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanSendWorkInvite(colonyAddress, user, ethDomainId))
      return tasks.sendWorkInvite(id, workerAddress)
    },
    async setTaskPayout(
      parent,
      {
        input: { id, ethDomainId, amount, token },
      }: Input<{
        id: string
        amount: string
        token: string
        ethDomainId: number
      }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanSetTaskPayout(colonyAddress, user, ethDomainId))
      return tasks.setPayout(id, amount, token, ethDomainId)
    },
    async removeTaskPayout(
      parent,
      {
        input: { id, ethDomainId, amount, token },
      }: Input<{
        id: string
        amount: string
        token: string
        ethDomainId: number
      }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanRemoveTaskPayout(colonyAddress, user, ethDomainId))
      return tasks.removePayout(id, amount, token, ethDomainId)
    },
    async assignWorker(
      parent,
      {
        input: { id, workerAddress },
      }: Input<{ id: string; workerAddress: string }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanAssignWorker(colonyAddress, user, ethDomainId))
      return tasks.assignWorker(id, workerAddress)
    },
    async unssignWorker(
      parent,
      {
        input: { id, workerAddress },
      }: Input<{ id: string; workerAddress: string }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress, ethDomainId } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanUnssignWorker(colonyAddress, user, ethDomainId))
      return tasks.unassignWorker(id, workerAddress)
    },
    async finalizeTask(
      parent,
      { input: { id } }: Input<{ id: string }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress, ethDomainId } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanFinalizeTask(colonyAddress, user, ethDomainId))
      return tasks.finalize(id)
    },
    async cancelTask(
      parent,
      { input: { id } }: Input<{ id: string }>,
      { user, dataSources: { tasks, auth } },
    ) {
      // const { colonyAddress, ethDomainId } = await tasks.getOne(id)
      // await tryAuth(auth.assertCanCancelTask(colonyAddress, user, ethDomainId))
      return tasks.cancel(id)
    },
  },
}

export const createApolloServer = (db: Db, provider: Provider) =>
  new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
      auth: new ColonyAuth(provider),
      colonies: Colonies.initialize(db),
      tasks: Tasks.initialize(db),
      users: Users.initialize(db),
    }),
    context: ({ req }) => {
      const token =
        req.headers['x-access-token'] || req.headers['authorization']

      /**
       * @NOTE
       *
       * Theoretically we don't _need_ to do this authentication check for all
       * requests, and this could be handled by each resolver. However, since
       * the current use-case (dapp) requires a wallet address, we may as well
       * put this check here, and disallow any requests without a valid token.
       */
      let address
      try {
        address = getAddressFromToken(token as string)
      } catch (caughtError) {
        throw new AuthenticationError(
          `Not authenticated: ${caughtError.message || caughtError.toString()}`,
        )
      }

      return { user: address }
    },
  })
