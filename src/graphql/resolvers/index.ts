import { GraphQLDateTime } from 'graphql-iso-date'

import { ApolloContext } from '../apolloTypes'
import { Event, ColonyEvent, TaskEvent, EventContext } from './Event'
import { Query } from './Query'
import { Colony } from './Colony'
import { Domain } from './Domain'
import { PersistentTask } from './PersistentTask'
import { Program } from './Program'
import { Suggestion } from './Suggestion'
import { Submission } from './Submission'
import { User } from './User'
import { Task } from './Task'
import { Mutation } from './Mutation'
import { Resolvers } from '../types'

export const resolvers: Resolvers<ApolloContext> = {
  Event,
  Colony,
  ColonyEvent,
  TaskEvent,
  EventContext,
  Query,
  Domain,
  PersistentTask,
  Program,
  Suggestion,
  User,
  Task,
  Mutation,
  GraphQLDateTime,
}
