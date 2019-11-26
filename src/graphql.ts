import { IResolvers } from 'graphql-tools'
import { ApolloServer, AuthenticationError, gql } from 'apollo-server-express'
import { Db } from 'mongodb'

import { getAddressFromToken } from './auth'
import { Colonies, Tasks, Users } from './db/datasources'
import { Network } from './network/datasources'
import { IColonyNetwork } from './network/contracts/IColonyNetwork'

interface ApolloContext {
  user: string
  dataSources: {
    colonies: Colonies
    network: Network
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

  interface MutationResponse {
    ok: Boolean!
    error: String
  }

  type UserResponse implements MutationResponse {
    ok: Boolean!
    error: String
    value: User
  }

  type ColonyResponse implements MutationResponse {
    ok: Boolean!
    error: String
    value: Colony
  }

  type TaskResponse implements MutationResponse {
    ok: Boolean!
    error: String
    value: Task
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
    address: String!
    colonyName: String!
  }

  input CreateTaskInput {
    colonyAddress: String!
    ethDomainId: Int!
  }

  type Mutation {
    createUser(input: CreateUserInput!): UserResponse!
    editUser(input: EditUserInput!): UserResponse!
    createColony(input: CreateColonyInput!): ColonyResponse!
    createTask(input: CreateTaskInput!): TaskResponse!
  }
`

const asMutationResponse = async <T>(
  promise: Promise<T>,
): Promise<{
  ok: boolean
  error: string | null
  value: T | null
}> => {
  let value = null

  try {
    value = await promise
  } catch (caughtError) {
    return {
      ok: false,
      error: caughtError.message || caughtError.toString(),
      value,
    }
  }

  return {
    ok: true,
    error: null,
    value,
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
      return asMutationResponse(users.create(user, username))
    },
    async editUser(
      parent,
      { input }: Input<object>,
      { user, dataSources: { users } },
    ) {
      return asMutationResponse(users.edit(user, input))
    },
    // Colonies
    async createColony(
      parent,
      {
        input: { colonyAddress, colonyName },
      }: Input<{ colonyAddress: string; colonyName: string }>,
      { user, dataSources: { colonies, users } },
    ) {
      return asMutationResponse(
        (async () => {
          await colonies.create(colonyAddress, colonyName, user)
          await users.subscribeToColony(user, colonyAddress)
          return colonies.getOne(colonyAddress)
        })(),
      )
    },
    // Tasks
    async createTask(
      parent,
      {
        input: { colonyAddress },
      }: Input<{ colonyAddress: string; taskId: string }>,
      { user, dataSources: { colonies, tasks, users } },
    ) {
      return asMutationResponse(
        (async () => {
          // FIXME check auth
          const task = await tasks.create(colonyAddress, user)
          await users.subscribeToColony(user, task._id)
          await colonies.addReferenceToTask(colonyAddress, task._id)
          return task
        })(),
      )
    },
  },
}

export const createApolloServer = (db: Db, network: IColonyNetwork) =>
  new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
      colonies: Colonies.initialize(db),
      network: Network.initialize(network),
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
