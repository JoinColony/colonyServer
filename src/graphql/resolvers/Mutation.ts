import { ApolloContext } from '../apolloTypes'
import { MutationResolvers, SuggestionStatus } from '../types'
import { tryAuth } from './auth'

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
  // Suggestions
  async createSuggestion(
    parent,
    { input: { colonyAddress, ethDomainId, title } },
    { userAddress, api, dataSources: { data } },
  ) {
    const id = await api.createSuggestion(
      userAddress,
      colonyAddress,
      ethDomainId,
      title,
    )
    return data.getSuggestionById(id)
  },
  async setSuggestionStatus(
    parent,
    { input: { id, status } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const {
      colonyAddress,
      creatorAddress,
      ethDomainId,
    } = await data.getSuggestionById(id)
    // Only skip auth if user wants to delete and is the creator
    if (
      !(status === SuggestionStatus.Deleted && userAddress === creatorAddress)
    ) {
      await tryAuth(
        auth.assertCanModifySuggestionStatus({
          colonyAddress,
          domainId: ethDomainId,
          userAddress,
        }),
      )
    }
    await api.editSuggestion(userAddress, id, { status })
    return data.getSuggestionById(id)
  },
  async addUpvoteToSuggestion(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.addUpvoteToSuggestion(userAddress, id)
    return data.getSuggestionById(id)
  },
  async removeUpvoteFromSuggestion(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.removeUpvoteFromSuggestion(userAddress, id)
    return data.getSuggestionById(id)
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
}
