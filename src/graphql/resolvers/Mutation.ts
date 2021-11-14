import { ApolloContext } from '../apolloTypes'
import { MutationResolvers } from '../types'
import { checkAuth } from './auth'

export const Mutation: MutationResolvers<ApolloContext> = {
  // Users
  async createUser(
    parent,
    { input: { username } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.createUser(userAddress, username)
    return data.getUserByAddress(userAddress)
  },
  async editUser(
    parent,
    { input },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.editUser(userAddress, input)
    return data.getUserByAddress(userAddress)
  },
  async subscribeToColony(
    parent,
    { input: { colonyAddress } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.subscribeToColony(userAddress, colonyAddress)
    return data.getUserByAddress(userAddress)
  },
  async unsubscribeFromColony(
    parent,
    { input: { colonyAddress } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.unsubscribeFromColony(userAddress, colonyAddress)
    return data.getUserByAddress(userAddress)
  },
  async setUserTokens(
    parent,
    { input: { tokenAddresses } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.setUserTokens(userAddress, tokenAddresses)
    return data.getUserByAddress(userAddress)
  },
  // Notifications
  async markNotificationAsRead(
    parent,
    { input: { id } },
    { userAddress, api },
  ) {
    // No auth call needed; restricted to the current authenticated user address
    await api.markNotificationAsRead(userAddress, id)
    return true
  },
  async markAllNotificationsAsRead(parent, input, { userAddress, api }) {
    // No auth call needed; restricted to the current authenticated user address
    await api.markAllNotificationsAsRead(userAddress)
    return true
  },
  // Messages
  async sendTransactionMessage(
    parent,
    { input: { transactionHash, message, colonyAddress } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.sendTransactionMessage(
      userAddress,
      transactionHash,
      colonyAddress,
      message,
    )
    return true
  },
  async deleteTransactionMessage(
    parent,
    { input: { id, colonyAddress } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const adminOverride = await checkAuth(
      auth.assertCanDeleteComment({
        colonyAddress,
        userAddress,
      }),
    )
    await api.deleteTransactionMessage(userAddress, id, adminOverride)
    return true
  },
}
