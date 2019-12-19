import { ApolloContext } from '../apolloTypes'
import {
  EventResolvers,
  EventContextResolvers,
  TaskEventResolvers,
  ColonyEventResolvers,
} from '../types'

export const Event: EventResolvers<ApolloContext> = {
  async initiator({ initiatorAddress }, input, { dataSources: { data } }) {
    return data.getUserByAddress(initiatorAddress)
  },
}

export const EventContext: EventContextResolvers<ApolloContext> = {
  // @ts-ignore
  __resolveType({ type }: { type: string }) {
    return `${type}Event`
  },
}

export const TaskEvent: TaskEventResolvers<ApolloContext> = {
  __resolveType() {
    // Preferable to do this over turning `requireResolversForResolveType` off?
    throw new Error('TaskEvent is an abstract interface')
  },
}

export const ColonyEvent: ColonyEventResolvers<ApolloContext> = {
  __resolveType() {
    // Preferable to do this over turning `requireResolversForResolveType` off?
    throw new Error('ColonyEvent is an abstract interface')
  },
}
