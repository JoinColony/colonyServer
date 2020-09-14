import { ColonyMongoDataSource } from '../db/colonyMongoDataSource'
import { ColonyMongoApi } from '../db/colonyMongoApi'
import { ColonyAuthDataSource } from '../network/colonyAuthDataSource'
import { SystemDataSource } from '../external/systemDataSource'
import { TokenInfoDataSource } from '../external/tokenInfoDataSource'

export interface ApolloContext {
  readonly userAddress: string // The authenticated user address (we can trust this!)
  readonly api: ColonyMongoApi // The Colony MongoDB API to perform mutations (NOT for verification/authentication!)
  readonly dataSources: Readonly<{
    auth: ColonyAuthDataSource // A thin wrapper of Colony contracts, for on-chain authentication checks
    data: ColonyMongoDataSource // The Colony MongoDB data source (NOT for verification/authentication!)
    system: SystemDataSource // Simple data source to retrieve and expose the server version (and other system values)
    tokenInfo: TokenInfoDataSource // Data source to retrieve Token Info via an RPC enpoint
  }>
}
