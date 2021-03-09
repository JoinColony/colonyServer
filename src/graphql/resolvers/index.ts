import { GraphQLDateTime } from 'graphql-iso-date'

import { ApolloContext } from '../apolloTypes'
import { Event, ColonyEvent, EventContext } from './Event'
import { Query } from './Query'
import { Suggestion } from './Suggestion'
import { User } from './User'
import { Mutation } from './Mutation'
import { Resolvers } from '../types'

export const resolvers: Resolvers<ApolloContext> = {
  Event,
  ColonyEvent,
  EventContext,
  Query,
  Suggestion,
  User,
  Mutation,
  GraphQLDateTime,
}
