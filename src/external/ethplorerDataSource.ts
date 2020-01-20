import { RESTDataSource } from 'apollo-datasource-rest'

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
    return !!process.env.ETHPLORER_API_KEY
  }

  constructor() {
    super()
    this.baseURL = 'https://api.ethplorer.io/'
  }

  willSendRequest(request) {
    request.params.set('apiKey', process.env.ETHPLORER_API_KEY || 'freekey')
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
