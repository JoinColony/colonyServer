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

  type Colony {
    id: String! # colony address
    colonyName: String!
  }

  type Task {
    id: String! # ObjectId
    colonyAddress: String!
    creatorAddress: String!
    ethTaskId: Int
    ethDomainId: Int!
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

  type Mutation {
    createUser(input: CreateUserInput!): User!
    editUser(input: EditUserInput!): User!
    createColony(input: CreateColonyInput!): Colony!
    createTask(input: CreateTaskInput!): Task!
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
      { input }: Input<object>,
      { user, dataSources: { users } },
    ) {
      return users.edit(user, input)
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
      await tryAuth(auth.assertCanCreateTask(colonyAddress, user, ethDomainId))
      const task = await tasks.create(colonyAddress, user, ethDomainId)
      await users.subscribeToColony(user, task.id)
      await colonies.addReferenceToTask(colonyAddress, task.id)
      return task
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
