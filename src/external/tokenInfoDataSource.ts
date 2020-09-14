import { Provider } from 'ethers/providers'
import { DataSource } from 'apollo-datasource'

export interface NetworkTokenInfo {
  id: string
  address: string
  name: string
  symbol: string
  decimals: number
  verified: boolean
}

export class TokenInfoDataSource extends DataSource<any> {
  private provider: Provider

  constructor(provider: Provider) {
    super()
    if (!provider) {
      throw new Error('Provider not set. Cannot fetch Token infomation')
    }
    this.provider = provider
  }

  async getTokenInfo(address: string): Promise<NetworkTokenInfo> {
    /**
     * @TODO Fetch Token Info from RPC Endpoint (via provider)
     */
    const decimals = '18'
    return {
      id: address,
      address,
      name,
      symbol: '',
      decimals: parseInt(decimals, 10),
      verified: true,
    }
  }
}
