import { GraphQLDateTime } from 'graphql-iso-date'

import { ApolloContext } from '../apolloTypes'
import { Event, ColonyEvent, TaskEvent, EventContext } from './Event'
import { Query } from './Query'
import { TempDomain } from './Domain'
import { Suggestion } from './Suggestion'
import { User } from './User'
import { Task } from './Task'
import { Mutation } from './Mutation'
import { Resolvers } from '../types'

export const resolvers: Resolvers<ApolloContext> = {
  Event,
  ColonyEvent,
  TaskEvent,
  EventContext,
  Query,
  TempDomain,
  Suggestion,
  User,
  Task,
  Mutation,
  GraphQLDateTime,
}
