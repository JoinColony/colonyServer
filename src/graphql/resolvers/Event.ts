import { ApolloContext } from '../apolloTypes'
import {
  EventResolvers,
  EventContextResolvers,
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

export const ColonyEvent: ColonyEventResolvers<ApolloContext> = {
  __resolveType() {
    // Preferable to do this over turning `requireResolversForResolveType` off?
    throw new Error('ColonyEvent is an abstract interface')
  },
}
