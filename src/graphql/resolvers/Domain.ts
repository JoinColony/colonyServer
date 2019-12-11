import { ApolloContext } from '../apolloTypes'
import { DomainResolvers } from '../types'

export const Domain: DomainResolvers<ApolloContext> = {
  async colony({ colonyAddress }, input: any, { dataSources: { data } }) {
    return data.getColonyByAddress(colonyAddress)
  },
  async parent(
    { colonyAddress, ethParentDomainId },
    input: any,
    { dataSources: { data } },
  ) {
    return ethParentDomainId
      ? await data.getDomainByEthId(colonyAddress, ethParentDomainId)
      : null
  },
  async tasks(
    { colonyAddress, ethDomainId },
    input: any,
    { dataSources: { data } },
  ) {
    return data.getTasksByEthDomainId(colonyAddress, ethDomainId)
  },
}
