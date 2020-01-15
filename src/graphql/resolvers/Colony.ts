import { ApolloContext } from '../apolloTypes'
import { ColonyResolvers } from '../types'

export const Colony: ColonyResolvers<ApolloContext> = {
  async domains({ colonyAddress }, input, { dataSources: { data } }) {
    return data.getColonyDomains(colonyAddress)
  },
  async founder({ founderAddress }, input, { dataSources: { data } }) {
    return data.getUserByAddress(founderAddress)
  },
  async nativeToken({ nativeTokenAddress }, input, { dataSources: { data } }) {
    return data.getTokenByAddress(nativeTokenAddress)
  },
  async subscribedUsers({ colonyAddress }, input, { dataSources: { data } }) {
    return data.getColonySubscribedUsers(colonyAddress)
  },
  async tasks(
    { taskIds },
    // TODO select on-chain tasks by ethPotId, so that we can start from on-chain and select from there
    // TODO allow restriction of query, e.g. by open tasks
    input,
    { dataSources: { data } },
  ) {
    return data.getTasksById(taskIds)
  },
  async tokens({ colonyAddress }, input, { dataSources: { data } }) {
    return data.getColonyTokens(colonyAddress)
  },
}
