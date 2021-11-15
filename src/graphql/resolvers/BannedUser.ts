import { ApolloContext } from '../apolloTypes'
import { BannedUserResolvers } from '../types'

export const BannedUser: BannedUserResolvers<ApolloContext> = {
  async profile({ id: walletAddress }, input, { dataSources: { data } }) {
    const user = await data.getUserByAddress(walletAddress)
    return user.profile
  },
  async event({ eventId }, input, { dataSources: { data } }) {
    return data.getEventById(eventId)
  },
}
