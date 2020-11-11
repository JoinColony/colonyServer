import { providers } from 'ethers'

import { blockchainNetwork, infuraId, rpcUrl } from '../env'
import { NETWORK_LOCAL, NETWORK_LOCAL_URL } from '../constants'

let provider

// If we make some assumptions, we can make this a ternary again.

if (blockchainNetwork === NETWORK_LOCAL) {
  provider = new providers.JsonRpcProvider(NETWORK_LOCAL_URL)
} else if (rpcUrl) {
  provider = new providers.JsonRpcProvider(rpcUrl)
} else {
  provider = new providers.InfuraProvider(blockchainNetwork, infuraId)
}

export { provider }
