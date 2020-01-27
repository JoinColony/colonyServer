import { ColonyMongoDataSource } from '../db/colonyMongoDataSource'
import { ColonyMongoApi } from '../db/colonyMongoApi'
import { ColonyAuthDataSource } from '../network/colonyAuthDataSource'
import { EthplorerDataSource } from '../external/ethplorerDataSource'
import { SystemDataSource } from '../external/systemDataSource'

export interface ApolloContext {
  readonly userAddress: string // The authenticated user address (we can trust this!)
  readonly api: ColonyMongoApi // The Colony MongoDB API to perform mutations (NOT for verification/authentication!)
  readonly dataSources: Readonly<{
    auth: ColonyAuthDataSource // A thin wrapper of Colony contracts, for on-chain authentication checks
    data: ColonyMongoDataSource // The Colony MongoDB data source (NOT for verification/authentication!)
    ethplorer: EthplorerDataSource // Data source to retrieve EthPlorer data via REST datasource
    system: SystemDataSource // Simple data source to retrieve and expose the server version (and other system values)
  }>
}
