export const ROOT_DOMAIN = 1

export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'

/*
 * Colonies that newly created users on mainnet are automatically subscribed to
 *
 * @NOTE Make sure the addresses in the this array are checksummed, otherwise
 * all kinds of *nasty* things will happen.
 */
export const AUTO_SUBSCRIBED_COLONIES = [
  '0x869814034d96544f3C62DE2aC22448ed79Ac8e70', // `beta`
]

/*
 * @NOTE Only used for dev purpouses
 */
export const NETWORK_LOCAL = 'local'
export const NETWORK_LOCAL_URL = 'http://localhost:8545'

export const DEFAULT_TOKEN_DECIMALS = 18
