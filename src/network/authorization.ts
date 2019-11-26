import { Provider } from 'ethers/providers'
import { IColonyNetwork } from './contracts/IColonyNetwork'
import { IColony } from './contracts/IColony'

export enum ColonyAuthorizedMethods {
  CreateTask,
}

export enum NetworkAuthorizedMethods {
  DoSomethingCool,
}

export type ColonyAuthManifest = Map<
  ColonyAuthorizedMethods,
  (
    provider: Provider,
    colonyAddress: string,
    userAddress: string,
    ...args: any[]
  ) => Promise<boolean>
>

export type NetworkAuthManifest = Map<
  NetworkAuthorizedMethods,
  (
    network: IColonyNetwork,
    userAddress: string,
    ...args: any[]
  ) => Promise<boolean>
>

export const COLONY_AUTH_MANIFEST: ColonyAuthManifest = new Map([
  [
    ColonyAuthorizedMethods.CreateTask,
    // FIXME complete this
    async (provider, colonyAddress, userAddress) => true,
  ],
])

// FIXME define manifest
export const NETWORK_AUTH_MANIFEST: NetworkAuthManifest = new Map([
  [
    NetworkAuthorizedMethods.DoSomethingCool,
    async (network, userAddress) => true,
  ],
])
