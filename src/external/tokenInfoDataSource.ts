import { Contract } from 'ethers'
import { Provider } from 'ethers/providers'
import { DataSource } from 'apollo-datasource'
import baseTokenAbi from './baseTokenAbi.json'

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
  private abi: typeof baseTokenAbi

  constructor(provider: Provider) {
    super()
    if (!provider) {
      throw new Error('Provider not set. Cannot fetch Token infomation')
    }
    this.provider = provider
    this.abi = baseTokenAbi
  }

  async getTokenInfo(address: string): Promise<NetworkTokenInfo> {
    const token = new Contract(address, this.abi, this.provider)
    const name = await token.name()
    const symbol = await token.symbol()
    const decimals = await token.decimals()
    return {
      id: address,
      address,
      name,
      symbol,
      decimals: parseInt(decimals, 10),
      verified: true,
    }
  }
}
