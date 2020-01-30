import { ApolloContext } from '../apolloTypes'
import { TokenInfo, QueryResolvers } from '../types'
import { EthplorerDataSource, EthplorerTokenInfo } from '../../external/ethplorerDataSource'
import { SystemDataSource } from '../../external/systemDataSource';
import { toChecksumAddress } from 'web3-utils';

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
    /*
     * @NOTE In all likelyhood the address that comes from the dApp is already checksummed
     * But we'll checksum it again here as a precaution
     */
    const checksummedTokenAddress: string = toChecksumAddress(address);
    let ethplorerTokenInfo = {} as EthplorerTokenInfo
    // There might be a better way to check whether we're on mainnet (not on QA)
    if (EthplorerDataSource.isActive) {
      try {
        ethplorerTokenInfo = await ethplorer.getTokenInfo(
          checksummedTokenAddress
        )
      } catch (e) {
        // Do nothing, might be just a token that isn't on ethplorer
      }
    }
    let databaseTokenInfo = {} as TokenInfo
    try {
      databaseTokenInfo = await data.getTokenByAddress(
        checksummedTokenAddress
      )
    } catch (e) {
      // Also do nothing, might be just a token that isn't in the db
    }
    // Always return a token, if needed just a fallback
    return {
      id: checksummedTokenAddress,
      address: checksummedTokenAddress,
      decimals: ethplorerTokenInfo.decimals || databaseTokenInfo.decimals || 18,
      iconHash: databaseTokenInfo.iconHash,
      name: ethplorerTokenInfo.name || databaseTokenInfo.name || 'Unknown token',
      symbol: ethplorerTokenInfo.symbol || databaseTokenInfo.symbol || '???',
      verified: ethplorerTokenInfo.verified || false,
    }
  },
  async systemInfo() {
    const system = new SystemDataSource();
    return system.getSystemInfo();
  },
}
