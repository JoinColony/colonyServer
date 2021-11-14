import { DataSource } from 'apollo-datasource'
import { Provider } from 'ethers/providers'

import { IColony } from './contracts/IColony'
import { IColonyFactory } from './contracts/IColonyFactory'
import { IColonyNetwork } from './contracts/IColonyNetwork'
import { IColonyNetworkFactory } from './contracts/IColonyNetworkFactory'
import { disableAuthCheck } from '../env'
import { ROOT_DOMAIN } from '../constants'

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

enum AuthChecks {
  DeleteCommentAsAdmin = 'DeleteCommentAsAdmin',
  BanUser = 'BanUser',
}

enum AuthTypes {
  Colony,
}

interface ColonyAuthArgs {
  userAddress: UserAddress
  colonyAddress: ColonyAddress
  domainId?: DomainId
}

interface AuthDeclaration {
  description: string
  roles: ColonyRoles[]
  type: AuthTypes
}

const AUTH_DECLARATIONS: Record<AuthChecks, AuthDeclaration> = {
  // Comment
  DeleteCommentAsAdmin: {
    description: "Delete a user's comment with admin privilesges",
    roles: [ColonyRoles.Root, ColonyRoles.Administration],
    type: AuthTypes.Colony,
  },
  // User banning / unbanning
  BanUser: {
    description: 'Ban a user from commenting on a colony again',
    roles: [ColonyRoles.Root, ColonyRoles.Administration],
    type: AuthTypes.Colony,
  },
}

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
    { userAddress, colonyAddress }: ColonyAuthArgs,
  ) {
    return `${description} not authorized for user '${userAddress}' on colony '${colonyAddress}'`
  }

  private static async assertIsAuthorized(authPromise: Promise<boolean>) {
    return authPromise
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
    { userAddress, colonyAddress, domainId }: ColonyAuthArgs,
  ) {
    if (disableAuthCheck) {
      return true
    }
    return this.colonies
      .get(colonyAddress)
      .hasUserRole(userAddress, domainId, role)
  }

  private async hasSomeRole(roles: ColonyRoles[], args: ColonyAuthArgs) {
    const userRoles = await Promise.all(
      roles.map((role) => this.hasRole(role, args)),
    )
    return userRoles.some(Boolean)
  }

  private async assertForColony(check: AuthChecks, args: ColonyAuthArgs) {
    const { roles } = AUTH_DECLARATIONS[check]
    return ColonyAuthDataSource.assertIsAuthorized(
      this.hasSomeRole(roles, { ...args, domainId: ROOT_DOMAIN }),
    )
  }

  async assertCanDeleteComment(args: ColonyAuthArgs) {
    return this.assertForColony(AuthChecks.DeleteCommentAsAdmin, args)
  }

  async assertCanBanUser(args: ColonyAuthArgs) {
    return this.assertForColony(AuthChecks.BanUser, args)
  }
}
