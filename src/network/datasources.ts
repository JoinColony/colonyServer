import { DataSource } from 'apollo-datasource'
import { IColonyNetwork } from './contracts/IColonyNetwork'

import { COLONY_AUTH_MANIFEST, ColonyAuthorizedMethods } from './authorization'

// FIXME this is pretty useless at the moment
export class Network extends DataSource<any> {
  static initialize(contract: IColonyNetwork) {
    return new this(contract)
  }

  readonly contract: IColonyNetwork

  constructor(contract: IColonyNetwork) {
    super()
    this.contract = contract
  }

  // FIXME complete this
  async isAuthorizedForColony(
    method: ColonyAuthorizedMethods,
    colonyAddress: string,
    userAddress: string,
    ...args: any[]
  ): Promise<boolean> {
    return true
  }
}

// TODO Colony DataSource?
