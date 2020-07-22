export const isDevelopment = process.env.NODE_ENV === 'development'
export const disableAuthCheck =
  isDevelopment && process.env.DISABLE_AUTH_CHECK === 'true'
export const disableExpiryCheck =
  isDevelopment && process.env.DISABLE_EXPIRY_CHECK === 'true'
export const blockchainNetwork = process.env.NETWORK || 'local'
export const infuraId = process.env.INFURA_ID
export const ethplorerKey = process.env.ETHPLORER_API_KEY || 'freekey'
export const isMainnet = blockchainNetwork === 'mainnet'
export const dbName = process.env.DB_NAME
export const dbUrl = process.env.DB_URL
