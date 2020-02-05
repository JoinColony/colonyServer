import { RESTDataSource } from 'apollo-datasource-rest'

import { isMainnet, ethplorerKey } from '../env'

export interface EthplorerTokenInfo {
  id: string
  address: string
  name: string
  symbol: string
  decimals: number
  verified: boolean
}

export class EthplorerDataSource extends RESTDataSource {
  static get isActive() {
    return isMainnet
  }

  constructor() {
    super()
    this.baseURL = 'https://api.ethplorer.io/'
  }

  willSendRequest(request) {
    request.params.set('apiKey', ethplorerKey)
  }

  async getTokenInfo(address: string): Promise<EthplorerTokenInfo> {
    const data = await this.get(`getTokenInfo/${address}`)
    const { name, symbol, decimals } = data
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
