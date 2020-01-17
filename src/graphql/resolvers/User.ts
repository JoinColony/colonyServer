import { ApolloContext } from '../apolloTypes'
import { UserResolvers } from '../types'
import { ETH_ADDRESS } from '../../constants'

export const User: UserResolvers<ApolloContext> = {
  async colonies({ colonyAddresses }, input, { dataSources: { data } }) {
    return data.getColoniesByAddress(colonyAddresses)
  },
  async tasks(
    { taskIds },
    input, // TODO allow restriction of query, e.g. by open tasks
    { dataSources: { data } },
  ) {
    return data.getTasksById(taskIds)
  },
  async notifications(
    { id },
    { read }: { read?: boolean },
    { userAddress, dataSources: { data } },
  ) {
    // Only find notifications for the current user
    if (id !== userAddress) return null

    if (read === false) {
      return data.getUnreadUserNotifications(userAddress)
    } else if (read) {
      return data.getReadUserNotifications(userAddress)
    } else {
      return data.getAllUserNotifications(userAddress)
    }
  },
}
