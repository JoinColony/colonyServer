import assert from 'assert'
import { DataSource } from 'apollo-datasource'
import { Provider } from 'ethers/providers'

import { IColony } from './contracts/IColony'
import { IColonyFactory } from './contracts/IColonyFactory'

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
type TaskId = number

type ColonyAuthArgs =
  | [ColonyAddress, UserAddress, DomainId, TaskId]
  | [ColonyAddress, UserAddress, DomainId]

// TODO call contract functions statically (rather than IColony instances)
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

    colony = IColonyFactory.connect(
      colonyAddress,
      this.provider,
    )
    this.set(colonyAddress, colony)
    return colony
  }
}

export class ColonyAuth extends DataSource<any> {
  private static notAuthorizedMessage(
    action: string,
    ...[colonyAddress, userAddress, domainId, taskId]: ColonyAuthArgs
  ) {
    let message = `${action} not authorized for user '${userAddress}' on colony '${colonyAddress}' with domain '${domainId}'`

    if (taskId) message += ` and task '${taskId}'`

    return message
  }

  private static async assert(
    authPromise: Promise<boolean>,
    action: string,
    ...[colonyAddress, userAddress, domainId, taskId]: ColonyAuthArgs
  ) {
    const auth = await authPromise
    assert.ok(
      auth,
      ColonyAuth.notAuthorizedMessage(
        action,
        colonyAddress,
        userAddress,
        domainId,
        taskId,
      ),
    )
    return auth
  }

  private readonly colonies: ColoniesMap

  constructor(provider: Provider) {
    super()
    this.colonies = new ColoniesMap(provider)
  }

  private async hasRole(
    role: ColonyRoles,
    ...[colonyAddress, userAddress, domainId]: ColonyAuthArgs
  ) {
    return this.colonies
      .get(colonyAddress)
      .hasUserRole(userAddress, domainId, role)
  }

  private async hasSomeRole(roles: ColonyRoles[], ...args: ColonyAuthArgs) {
    const userRoles = await Promise.all(
      roles.map(role => this.hasRole(role, ...args)),
    )
    return userRoles.some(Boolean)
  }

  async canCreateTask(...args: ColonyAuthArgs) {
    // TODO check these roles
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async assertCanCreateTask(...args: ColonyAuthArgs) {
    return ColonyAuth.assert(
      this.canCreateTask(...args),
      'Create task',
      ...args,
    )
  }

  async canCreateDomain(...args: ColonyAuthArgs) {
    // TODO check these roles
    return this.hasSomeRole(
      [ColonyRoles.Administration, ColonyRoles.Architecture],
      ...args,
    )
  }

  async assertCanCreateDomain(...args: ColonyAuthArgs) {
    return ColonyAuth.assert(
      this.canCreateDomain(...args),
      'Create domain',
      ...args,
    )
  }

  // TODO define all permissions
}
