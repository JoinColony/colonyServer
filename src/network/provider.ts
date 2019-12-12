import { providers } from 'ethers'

export const provider = new providers.JsonRpcProvider(process.env.ETH_NETWORK)
