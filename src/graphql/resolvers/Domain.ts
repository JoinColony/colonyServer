import { ApolloContext } from '../apolloTypes'
import { DomainResolvers } from '../types'

export const Domain: DomainResolvers<ApolloContext> = {
  async colony({ colonyAddress }, input, { dataSources: { data } }) {
    return data.getColonyByAddress(colonyAddress)
  },
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
