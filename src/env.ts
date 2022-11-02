import { AddressZero } from 'ethers/constants'

export const isDevelopment = process.env.NODE_ENV === 'development'
export const disableAuthCheck =
  isDevelopment && process.env.DISABLE_AUTH_CHECK === 'true'
export const disableExpiryCheck =
  isDevelopment && process.env.DISABLE_EXPIRY_CHECK === 'true'
export const blockchainNetwork = process.env.NETWORK || 'local'
export const infuraId = process.env.INFURA_ID
export const isMainnet = blockchainNetwork === 'mainnet'
export const dbName = process.env.DB_NAME
export const dbUrl = process.env.DB_URL
export const rpcUrl = process.env.RPC_URL

export const addressZeroToken = {
  'local': {
    name: 'Ethereum',
    symbol: 'ETH',
    address: AddressZero,
    creatorAddress: '',
    decimals: 18,
  },
  'goerli': {
    name: 'Ethereum',
    symbol: 'ETH',
    address: AddressZero,
    creatorAddress: '',
    decimals: 18,
  },
  'mainnet': {
    name: 'Ethereum',
    symbol: 'ETH',
    address: AddressZero,
    creatorAddress: '',
    decimals: 18,
  },
  'xdai': {
    name: 'xDai Token',
    symbol: 'XDAI',
    address: AddressZero,
    creatorAddress: '',
    decimals: 18,
  },
}
