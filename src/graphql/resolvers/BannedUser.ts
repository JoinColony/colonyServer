import { ApolloContext } from '../apolloTypes'
import { BannedUserResolvers } from '../types'

export const BannedUser: BannedUserResolvers<ApolloContext> = {
  async profile({ id: walletAddress }, input, { dataSources: { data } }) {
    const user = await data.getUserByAddress(walletAddress)
    return user.profile
  },
  async event({ eventId }, input, { dataSources: { data } }) {
    let event = null
    /*
     * @NOTE This needs to be wrapped inside a try/catch if the user was
     * banned without a reason, meaning the query won't actually find the event
     */
    try {
      event = await data.getEventById(eventId)
    } catch (error) {
      // silent error
    }
    return event
  },
}
