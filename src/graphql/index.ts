import { Provider } from 'ethers/providers'
import {
  ApolloServer,
  AuthenticationError,
  ValidationError,
} from 'apollo-server-express'
import { Db } from 'mongodb'

import { isDevelopment } from '../env'
import { getAddressFromToken } from '../auth'
import { ColonyMongoApi } from '../db/colonyMongoApi'
import { ColonyMongoDataSource } from '../db/colonyMongoDataSource'
import { ColonyAuthDataSource } from '../network/colonyAuthDataSource'
import { TokenInfoDataSource } from '../external/tokenInfoDataSource'
import { resolvers } from './resolvers'

import Colony from './typeDefs/Colony'
import Domain from './typeDefs/Domain'
import Event from './typeDefs/Event'
import Mutation from './typeDefs/Mutation'
import Query from './typeDefs/Query'
import Suggestion from './typeDefs/Suggestion'
import Submission from './typeDefs/Submission'
import Task from './typeDefs/Task'
import TokenInfo from './typeDefs/TokenInfo'
import SystemInfo from './typeDefs/SystemInfo'
import User from './typeDefs/User'
import Transaction from './typeDefs/Transaction'
import scalars from './typeDefs/scalars'

const authenticate = (token: string) => {
  let user

  // In dev mode we enable a mode without a token for code generation
  if (isDevelopment && token === 'codegen') {
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
  const data = new ColonyMongoDataSource(db)
  const auth = new ColonyAuthDataSource(provider)
  const tokenInfo = new TokenInfoDataSource(provider)

  return new ApolloServer({
    typeDefs: [
      Colony,
      Domain,
      Event,
      Mutation,
      Query,
      Submission,
      Suggestion,
      Task,
      TokenInfo,
      SystemInfo,
      User,
      scalars,
      Transaction,
    ],
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
    dataSources: () => ({ auth, data, tokenInfo }),
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
