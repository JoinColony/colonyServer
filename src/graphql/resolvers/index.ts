import { GraphQLDateTime } from 'graphql-iso-date'

import { ApolloContext } from '../apolloTypes'
import { Event, ColonyEvent, EventContext } from './Event'
import { Query } from './Query'
import { User } from './User'
import { Mutation } from './Mutation'
import { Resolvers } from '../types'
import { BannedUser } from './BannedUser'

export const resolvers: Resolvers<ApolloContext> = {
  Event,
  ColonyEvent,
  EventContext,
  Query,
  User,
  Mutation,
  GraphQLDateTime,
  BannedUser,
}
