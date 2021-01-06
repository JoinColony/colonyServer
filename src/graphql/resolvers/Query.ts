import { toChecksumAddress } from 'web3-utils'

import { ApolloContext } from '../apolloTypes'
import { TokenInfo, QueryResolvers } from '../types'
import { NetworkTokenInfo } from '../../external/tokenInfoDataSource'
import { SystemDataSource } from '../../external/systemDataSource'
import { getTokenDecimalsWithFallback } from '../../utils'

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
    { dataSources: { data, tokenInfo } },
  ) {
    /*
     * @NOTE In all likelyhood the address that comes from the dApp is already checksummed
     * But we'll checksum it again here as a precaution
     */
    const checksummedTokenAddress: string = toChecksumAddress(address)
    let networkTokenInfo = {} as NetworkTokenInfo
    try {
      networkTokenInfo = await tokenInfo.getTokenInfo(checksummedTokenAddress)
    } catch (error) {
      // Do nothing, might be just a token that isn't on the network
      // Also, it might be that the PRC endpoint failed to fetch it
      // At any rate, we're falling back here to the database token info
    }
    let databaseTokenInfo = {} as TokenInfo
    try {
      databaseTokenInfo = await data.getTokenByAddress(checksummedTokenAddress)
    } catch (e) {
      // Also do nothing, might be just a token that isn't in the db
    }
    // Always return a token, if needed just a fallback
    return {
      id: checksummedTokenAddress,
      address: checksummedTokenAddress,
      decimals: getTokenDecimalsWithFallback(
        networkTokenInfo.decimals,
        databaseTokenInfo.decimals,
      ),
      iconHash: databaseTokenInfo.iconHash,
      name: networkTokenInfo.name || databaseTokenInfo.name || 'Unknown token',
      symbol: networkTokenInfo.symbol || databaseTokenInfo.symbol || '???',
      verified: networkTokenInfo.verified || false,
    }
  },
  async systemInfo() {
    const system = new SystemDataSource()
    return system.getSystemInfo()
  },
  async transactionMessages(
    parent,
    { transactionHash }: { transactionHash: string },
    { dataSources: { data } },
  ) {
    const messages = await data.getTransactionMessages(transactionHash)
    return {
      transactionHash,
      messages,
    }
  },
  async transactionMessagesCount(
    parent,
    { colonyAddress }: { colonyAddress: string },
    { dataSources: { data } },
  ) {
    const messagesCount = await data.getTransactionMessagesCount(colonyAddress)
    return {
      colonyTransactionMessages: messagesCount,
    }
  },
}
