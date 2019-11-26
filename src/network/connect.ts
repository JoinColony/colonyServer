import { providers } from 'ethers'

import { IColonyNetworkFactory } from './contracts/IColonyNetworkFactory'
import { IColonyFactory } from './contracts/IColonyFactory'

// FIXME use env var
const ETH_NETWORK = 'http://localhost:8545'

// FIXME use env var
const NETWORK_CONTRACT_ADDRESS = '0xde3EDaBA7c15F845F59D1058eCD70Ed33FfdB2b9'

const provider = new providers.JsonRpcProvider(ETH_NETWORK)

export const connectNetwork = async () =>
  IColonyNetworkFactory.connect(
    NETWORK_CONTRACT_ADDRESS,
    provider,
  )

export const connectColony = async (address: string) =>
  IColonyFactory.connect(
    address,
    provider,
  )
