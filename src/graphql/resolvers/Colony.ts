import { ApolloContext } from '../apolloTypes'
import { ColonyResolvers, ColonyToken } from '../types'

export const Colony: ColonyResolvers<ApolloContext> = {
  async tasks(
    { taskIds },
    // TODO select on-chain tasks by ethTaskId, so that we can start from on-chain and select from there
    // TODO allow restriction of query, e.g. by open tasks
    input,
    { dataSources: { data } },
  ) {
    return data.getTasksById(taskIds)
  },
  async domains({ colonyAddress }, input, { dataSources: { data } }) {
    return data.getColonyDomains(colonyAddress)
  },
  async founder({ founderAddress }, input, { dataSources: { data } }) {
    return data.getUserByAddress(founderAddress)
  },
  async tokens({ tokenRefs }, input, { dataSources: { data } }) {
    // Combine generic token data (e.g. `symbol`) with colony-specific token data (e.g. `isNative`)
    const tokenData = await data.getTokensByAddress(
      tokenRefs.map(({ address }) => address),
    )
    return tokenRefs.map(
      token =>
        ({
          ...token,
          ...(tokenData.find(({ address }) => address === token.address) || {}),
        } as ColonyToken),
    )
  },
  async subscribedUsers({ colonyAddress }, input, { dataSources: { data } }) {
    return data.getColonySubscribedUsers(colonyAddress)
  },
}
