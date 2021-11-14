import { ApolloContext } from '../apolloTypes'
import { UserResolvers } from '../types'

export const User: UserResolvers<ApolloContext> = {
  async notifications(
    { id },
    { read }: { read?: boolean },
    { userAddress, dataSources: { data } },
  ) {
    // Only find notifications for the current user
    if (id !== userAddress) return []

    if (read === false) {
      return data.getUnreadUserNotifications(userAddress)
    } else if (read) {
      return data.getReadUserNotifications(userAddress)
    } else {
      return data.getAllUserNotifications(userAddress)
    }
  },
}
