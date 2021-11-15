import { Provider } from 'ethers/providers'
import {
  ApolloServer,
  AuthenticationError,
  ValidationError,
} from 'apollo-server-express'
import { Db } from 'mongodb'
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { PubSub } from 'graphql-subscriptions'

import { isDevelopment } from '../env'
import { getAddressFromToken } from '../auth'
import { ColonyMongoApi } from '../db/colonyMongoApi'
import { ColonyMongoDataSource } from '../db/colonyMongoDataSource'
import { ColonyAuthDataSource } from '../network/colonyAuthDataSource'
import { TokenInfoDataSource } from '../external/tokenInfoDataSource'
import { resolvers as queryResolvers } from './resolvers'
import { subscription as subscriptionResolvers } from './resolvers/Subscription'

import Event from './typeDefs/Event'
import Mutation from './typeDefs/Mutation'
import Query from './typeDefs/Query'
import TokenInfo from './typeDefs/TokenInfo'
import SystemInfo from './typeDefs/SystemInfo'
import User from './typeDefs/User'
import Transaction from './typeDefs/Transaction'
import scalars from './typeDefs/scalars'
import Subscriptions from './typeDefs/Subscriptions'

const pubSubInstance = new PubSub()

const typeDefs = [
  Event,
  Mutation,
  Query,
  Subscriptions,
  TokenInfo,
  SystemInfo,
  User,
  scalars,
  Transaction,
]

let dataSources = {}

const resolvers = {
  ...queryResolvers,
  Subscription: subscriptionResolvers(pubSubInstance),
}

const authenticate = (token: string) => {
  let user

  // In dev mode we enable a mode without a token for code generation
  if (token === 'codegen') {
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
  const api = new ColonyMongoApi(db, pubSubInstance)
  const data = new ColonyMongoDataSource(db)
  const auth = new ColonyAuthDataSource(provider)
  const tokenInfo = new TokenInfoDataSource(provider)

  dataSources = { data, auth, tokenInfo }

  return new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => {
      // MongoDB json schema validation
      if (err.message.includes('failed validation')) {
        return new ValidationError('Database validation failed')
      }
      // Otherwise return the original error.  The error can also
      // be manipulated in other ways, so long as it's returned.
      return err
    },
    dataSources: () => dataSources,
    context: ({ req }) => {
      const token = (req.headers['x-access-token'] ||
        req.headers['authorization']) as string
      const userAddress = authenticate(token)
      return {
        api,
        userAddress,
      }
    },
  })
}

export const createSubscriptionServer = (server, path) => {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  return new SubscriptionServer(
    {
      schema,
      execute,
      subscribe,
      /*
       * Subscriptions JWT Authentication
       *
       * In theory this works just as with the query/mutation authentication,
       * however, unlike the request based model of queries/mutations, once
       * the websocket connection is open it will stay open (an re-connect),
       * meaning the wallet address with which you first subscribed will
       * stay the same for the whole session.
       *
       * This gets a bit complicated with ethereal wallets (which are temporary),
       * but on the other hand this is just read-only public data, this whole
       * authentication setup was done for consistency purpouses only.
       *
       * But beware, if you actually need to guard something against unauthorized
       * reads, you will need to make sure, you use the correct wallet address
       * when first subscribing and opening the websocket connection
       */
      onConnect: ({ authorization }: { authorization?: string } = {}) => {
        const userAddress = authenticate(authorization)
        return { userAddress }
      },
      onOperation: (message, params) => ({
        ...params,
        context: { dataSources: { ...dataSources } },
      }),
    },
    { server, path },
  )
}
