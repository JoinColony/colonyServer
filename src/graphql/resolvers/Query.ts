import { toChecksumAddress } from 'web3-utils'

import { ApolloContext } from '../apolloTypes'
import { TokenInfo, QueryResolvers } from '../types'
import { NetworkTokenInfo } from '../../external/tokenInfoDataSource'
import { SystemDataSource } from '../../external/systemDataSource'
import { getTokenDecimalsWithFallback } from '../../utils'

export const getTransactionMessages = async (transactionHash, limit, data) => {
  const messages = await data.getTransactionMessages(transactionHash, limit)
  return {
    transactionHash,
    messages,
  }
}

export const getTransactionMessagesCount = async (colonyAddress, data) => {
  const messagesCount = await data.getTransactionMessagesCount(colonyAddress)
  return {
    colonyTransactionMessages: messagesCount,
  }
}

export const getSubscribedUsers = async (colonyAddress, data) => {
  return await data.getColonySubscribedUsers(colonyAddress)
}

export const Query: QueryResolvers<ApolloContext> = {
  async user(parent, { address }, { dataSources: { data } }) {
    return data.getUserByAddress(address)
  },
  async userByName(parent, { username }, { dataSources: { data } }) {
    return data.getUserByName(username)
  },
  async subscribedUsers(
    parent,
    { colonyAddress }: { colonyAddress: string },
    { dataSources: { data } },
  ) {
    return await getSubscribedUsers(colonyAddress, data)
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
    {
      transactionHash,
      limit = 1000,
    }: { transactionHash: string; limit?: number },
    { dataSources: { data } },
  ) {
    return await getTransactionMessages(transactionHash, limit, data)
  },
  async transactionMessagesCount(
    parent,
    { colonyAddress }: { colonyAddress: string },
    { dataSources: { data } },
  ) {
    return await getTransactionMessagesCount(colonyAddress, data)
  },
  async bannedUsers(
    parent,
    { colonyAddress }: { colonyAddress: string },
    { dataSources: { data } },
  ) {
    return await data.getBannedUsers(colonyAddress)
  },
}
