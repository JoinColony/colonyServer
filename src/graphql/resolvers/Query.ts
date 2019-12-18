import { ApolloContext } from '../apolloTypes'
import { QueryResolvers } from '../types'

export const Query: QueryResolvers<ApolloContext> = {
  async user(parent, { address }, { dataSources: { data } }) {
    return data.getUserByAddress(address)
  },
  async colony(
    parent,
    { address }: { address: string },
    { dataSources: { data } },
  ) {
    return data.getColonyByAddress(address)
  },
  async domain(
    parent,
    {
      colonyAddress,
      ethDomainId,
    }: { colonyAddress: string; ethDomainId: number },
    { dataSources: { data } },
  ) {
    return data.getDomainByEthId(colonyAddress, ethDomainId)
  },
  // TODO task by ethTaskId/colonyAddress
  async task(parent, { id }: { id: string }, { dataSources: { data } }) {
    return data.getTaskById(id)
  },
  async token(
    parent,
    { address }: { address: string },
    { dataSources: { data } },
  ) {
    return data.getTokenByAddress(address)
  },
  async allTokens(parent, input, { dataSources: { data } }) {
    return data.getAllTokens()
  },
}
