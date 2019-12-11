import { ApolloContext } from '../apolloTypes'
import { UserResolvers, UserToken } from '../types'

export const User: UserResolvers<ApolloContext> = {
  async colonies({ colonyAddresses }, input: any, { dataSources: { data } }) {
    return data.getColoniesByAddress(colonyAddresses)
  },
  async tasks(
    { taskIds },
    input: any, // TODO allow restriction of query, e.g. by open tasks
    { dataSources: { data } },
  ) {
    return data.getTasksById(taskIds)
  },
  async tokens({ tokenRefs }, input: any, { dataSources: { data } }) {
    // Combine generic token data (e.g. `symbol`) with user-specific token data (e.g. `ipfsHash`)
    const tokenData = await data.getTokensByAddress(
      tokenRefs.map(({ address }) => address),
    )
    return tokenRefs.map(
      token =>
        ({
          ...token,
          ...(tokenData.find(({ address }) => address === token.address) || {}),
        } as UserToken),
    )
  },
  async notifications(
    { id },
    { read }: { read?: boolean },
    { user, dataSources: { data } },
  ) {
    // Only find notifications for the current user
    if (id !== user) return null

    if (read === false) {
      return data.getUnreadUserNotifications(user)
    } else if (read) {
      return data.getReadUserNotifications(user)
    } else {
      return data.getAllUserNotifications(user)
    }
  },
}
