import assert from 'assert'
import { DataSource } from 'apollo-datasource'
import { Provider } from 'ethers/providers'

import { IColony } from './contracts/IColony'
import { IColonyFactory } from './contracts/IColonyFactory'
import { IColonyNetwork } from './contracts/IColonyNetwork'
import { IColonyNetworkFactory } from './contracts/IColonyNetworkFactory'
import { disableAuthCheck } from '../env'

enum ColonyRoles {
  Recovery,
  Root,
  Arbitration,
  Architecture,
  ArchitectureSubdomain,
  Funding,
  Administration,
}

type ColonyAddress = string
type UserAddress = string
type DomainId = number

enum AuthChecks {}

enum AuthTypes {}

interface ColonyAuthArgs {
  userAddress: UserAddress
  colonyAddress: ColonyAddress
}

interface DomainAuthArgs extends ColonyAuthArgs {
  domainId: DomainId
}

// TODO extend with { taskId: TaskID } for taskId-specific auth checks, if needed
type TaskAuthArgs = DomainAuthArgs

interface AuthDeclaration {
  description: string
  roles: ColonyRoles[]
  type: AuthTypes
}

const AUTH_DECLARATIONS: Record<AuthChecks, AuthDeclaration> = {}

// TODO detect and support different Colony versions
class ColoniesMap extends Map<ColonyAddress, IColony> {
  private readonly provider: Provider

  constructor(provider: Provider) {
    super()
    this.provider = provider
  }

  get(colonyAddress: ColonyAddress) {
    let colony = super.get(colonyAddress)
    if (colony) return colony

    colony = IColonyFactory.connect(colonyAddress, this.provider)
    this.set(colonyAddress, colony)
    return colony
  }
}

export class ColonyAuthDataSource extends DataSource<any> {
  private static notAuthorizedMessage(
    description: string,
    {
      userAddress,
      colonyAddress,
      ...args
    }: ColonyAuthArgs | DomainAuthArgs | TaskAuthArgs,
  ) {
    let message = `${description} not authorized for user '${userAddress}' on colony '${colonyAddress}'`

    if ((args as DomainAuthArgs).domainId) {
      message += ` with domain '${(args as DomainAuthArgs).domainId}'`
    }

    return message
  }

  private static async assertIsAuthorized(
    authPromise: Promise<boolean>,
    description: string,
    args: ColonyAuthArgs | DomainAuthArgs | TaskAuthArgs,
  ) {
    const isAuthorized = await authPromise
    assert.ok(
      isAuthorized,
      ColonyAuthDataSource.notAuthorizedMessage(description, args),
    )
    return isAuthorized
  }

  private readonly colonies: ColoniesMap
  private readonly network?: IColonyNetwork

  constructor(provider: Provider) {
    super()
    this.colonies = new ColoniesMap(provider)
    if (!disableAuthCheck) {
      this.network = IColonyNetworkFactory.connect(
        process.env.NETWORK_CONTRACT_ADDRESS,
        provider,
      )
    }
  }

  private async hasRole(
    role: ColonyRoles,
    { userAddress, colonyAddress, domainId }: DomainAuthArgs,
  ) {
    if (disableAuthCheck) {
      return true
    }
    return this.colonies
      .get(colonyAddress)
      .hasUserRole(userAddress, domainId, role)
  }

  private async hasSomeRole(roles: ColonyRoles[], args: DomainAuthArgs) {
    const userRoles = await Promise.all(
      roles.map((role) => this.hasRole(role, args)),
    )
    return userRoles.some(Boolean)
  }
}
