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

export class ColonyAuthDataSource extends DataSource<any> {
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
    // FIXME remove this (when we want authentication to run)
    return true
    // const auth = await authPromise
    // assert.ok(
    //   auth,
    //   ColonyAuth.notAuthorizedMessage(
    //     action,
    //     colonyAddress,
    //     userAddress,
    //     domainId,
    //     taskId,
    //   ),
    // )
    // return auth
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

  // TODO check all of these roles
  async canCreateTask(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canEditColonyProfile(colonyAddress: ColonyAddress, userAddress: string) {
    return this.hasSomeRole([ColonyRoles.Administration], colonyAddress, userAddress, 1)
  }

  async canCreateDomain(...args: ColonyAuthArgs) {
    return this.hasSomeRole(
      [ColonyRoles.Administration, ColonyRoles.Architecture],
      ...args,
    )
  }

  async canSetTaskDomain(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canSetTaskTitle(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canSetTaskDescription(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canSetTaskSkill(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canSetTaskDueDate(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canCreateWorkRequest(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canSendWorkInvite(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canSetTaskPayout(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canRemoveTaskPayout(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canAssignWorker(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canUnassignWorker(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canFinalizeTask(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async canCancelTask(...args: ColonyAuthArgs) {
    return this.hasSomeRole([ColonyRoles.Administration], ...args)
  }

  async assertCanSetTaskDomain(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canSetTaskDomain(...args),
      'Set task domain',
      ...args,
    )
  }

  async assertCanSetTaskTitle(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canSetTaskTitle(...args),
      'Set task title',
      ...args,
    )
  }

  async assertCanSetTaskDescription(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canSetTaskDescription(...args),
      'Set task description',
      ...args,
    )
  }

  async assertCanSetTaskSkill(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canSetTaskSkill(...args),
      'Set task skill',
      ...args,
    )
  }

  async assertCanSetTaskDueDate(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canSetTaskDueDate(...args),
      'Set task due date',
      ...args,
    )
  }

  async assertCanCreateWorkRequest(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canCreateWorkRequest(...args),
      'Create work request',
      ...args,
    )
  }

  async assertCanSendWorkInvite(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canSendWorkInvite(...args),
      'Send work invite',
      ...args,
    )
  }

  async assertCanSetTaskPayout(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canSetTaskPayout(...args),
      'Set task payout',
      ...args,
    )
  }

  async assertCanRemoveTaskPayout(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canRemoveTaskPayout(...args),
      'Remove task payout',
      ...args,
    )
  }

  async assertCanAssignWorker(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canAssignWorker(...args),
      'Assign worker',
      ...args,
    )
  }

  async assertCanUnassignWorker(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canUnassignWorker(...args),
      'Unassign worker',
      ...args,
    )
  }

  async assertCanFinalizeTask(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canFinalizeTask(...args),
      'Finalize task',
      ...args,
    )
  }

  async assertCanCancelTask(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canCancelTask(...args),
      'Cancel task',
      ...args,
    )
  }

  async assertCanCreateDomain(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canCreateDomain(...args),
      'Create domain',
      ...args,
    )
  }

  async assertCanCreateTask(...args: ColonyAuthArgs) {
    return ColonyAuthDataSource.assert(
      this.canCreateTask(...args),
      'Create task',
      ...args,
    )
  }

  async assertCanEditColonyProfile(...args: [ColonyAddress, UserAddress]) {
    return ColonyAuthDataSource.assert(
      this.canEditColonyProfile(...args),
      'Edit colony profile',
      args[0],
      args[1],
      1,
    )
  }

  // TODO
  // async assertColonyExists(colonyAddress: string) {
  //   return ColonyAuth.assert(
  //     this.canColonyExists(colonyAddress),
  //     'Colony exists',
  //     colonyAddress,
  //   )
  // }
}
