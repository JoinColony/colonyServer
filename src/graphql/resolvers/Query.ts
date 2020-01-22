import { ApolloContext } from '../apolloTypes'
import { QueryResolvers } from '../types'
import { EthplorerDataSource, EthplorerTokenInfo } from '../../external/ethplorerDataSource'

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
  // TODO task by ethPotId/colonyAddress
  async task(parent, { id }: { id: string }, { dataSources: { data } }) {
    return data.getTaskById(id)
  },
  async tokenInfo(
    parent,
    { address }: { address: string },
    { dataSources: { data, ethplorer } },
  ) {
    let ethplorerTokenInfo = {} as EthplorerTokenInfo
    // There might be a better way to check whether we're on mainnet (not on QA)
    if (EthplorerDataSource.isActive) {
      try {
        ethplorerTokenInfo = await ethplorer.getTokenInfo(address)
      } catch (e) {
        // Do nothing, might be just a token that isn't on ethplorer
      }
    }
    let databaseTokenInfo
    try {
      databaseTokenInfo = await data.getTokenByAddress(address)
    } catch (e) {
      // Also do nothing, might be just a token that isn't in the db
    }
    return {
      id: address,
      address,
      decimals: ethplorerTokenInfo.decimals || databaseTokenInfo.decimals,
      iconHash: databaseTokenInfo.iconHash,
      name: ethplorerTokenInfo.name || databaseTokenInfo.name,
      symbol: ethplorerTokenInfo.symbol || databaseTokenInfo.symbol,
      verified: ethplorerTokenInfo.verified || false,
    }
  },
}
