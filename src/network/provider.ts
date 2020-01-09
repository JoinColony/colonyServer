import { providers } from 'ethers'

import { blockchainNetwork, infuraId } from '../env'
import { NETWORK_LOCAL, NETWORK_LOCAL_URL } from '../constants';

export const provider = blockchainNetwork === NETWORK_LOCAL
  ? new providers.JsonRpcProvider(NETWORK_LOCAL_URL)
  : new providers.InfuraProvider(blockchainNetwork, infuraId);
