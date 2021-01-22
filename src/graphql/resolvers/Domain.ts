import { ApolloContext } from '../apolloTypes'
import { TempDomainResolvers } from '../types'

export const TempDomain: TempDomainResolvers<ApolloContext> = {
  async parent(
    { colonyAddress, ethParentDomainId },
    input,
    { dataSources: { data } },
  ) {
    return ethParentDomainId
      ? await data.getDomainByEthId(colonyAddress, ethParentDomainId)
      : null
  },
  async tasks(
    { colonyAddress, ethDomainId },
    input,
    { dataSources: { data } },
  ) {
    return data.getTasksByEthDomainId(colonyAddress, ethDomainId)
  },
}
