import assert from 'assert'
import { DataSource } from 'apollo-datasource'
import { Provider } from 'ethers/providers'
import retry from 'async-retry'

import { IColony } from './contracts/IColony'
import { IColonyFactory } from './contracts/IColonyFactory'
import { IColonyNetwork } from './contracts/IColonyNetwork'
import { IColonyNetworkFactory } from './contracts/IColonyNetworkFactory'
import { ROOT_DOMAIN } from '../constants'
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

enum AuthChecks {
  AdminProgram = 'AdminProgram',
  AssignWorker = 'AssignWorker',
  CancelTask = 'CancelTask',
  CreateDomain = 'CreateDomain',
  CreateTask = 'CreateTask',
  EditColonyProfile = 'EditColonyProfile',
  EditDomainName = 'EditDomainName',
  EditSuggestion = 'EditSuggestion',
  FinalizeTask = 'FinalizeTask',
  RemoveTaskPayout = 'RemoveTaskPayout',
  SendWorkInvite = 'SendWorkInvite',
  SetColonyTokens = 'SetColonyTokens',
  SetTaskDescription = 'SetTaskDescription',
  SetTaskDomain = 'SetTaskDomain',
  SetTaskDueDate = 'SetTaskDueDate',
  SetTaskPayout = 'SetTaskPayout',
  SetTaskSkill = 'SetTaskSkill',
  RemoveTaskSkill = 'RemoveTaskSkill',
  SetTaskTitle = 'SetTaskTitle',
  UnassignWorker = 'UnassignWorker',
}

enum AuthTypes {
  Colony,
  Domain,
  Task,
}

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

const AUTH_DECLARATIONS: Record<AuthChecks, AuthDeclaration> = {
  // Colony
  SetColonyTokens: {
    description: 'Set colony tokens',
    roles: [ColonyRoles.Administration, ColonyRoles.Funding],
    type: AuthTypes.Domain,
  },
  EditColonyProfile: {
    description: 'Edit colony profile',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Colony,
  },
  // Domain
  CreateDomain: {
    description: 'Create domain',
    roles: [ColonyRoles.Architecture],
    type: AuthTypes.Domain,
  },
  EditDomainName: {
    description: 'Edit domain name',
    roles: [ColonyRoles.Architecture],
    type: AuthTypes.Domain,
  },
  CreateTask: {
    description: 'Create a task',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Domain,
  },
  // Administer Programs
  AdminProgram: {
    description: 'Administer a program',
    roles: [ColonyRoles.Administration, ColonyRoles.Funding],
    type: AuthTypes.Domain,
  },
  // Suggestion
  EditSuggestion: {
    description: 'Edit a suggestion',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Domain,
  },
  // Task
  AssignWorker: {
    description: 'Assign worker',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  CancelTask: {
    description: 'Cancel task',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  FinalizeTask: {
    description: 'Finalize task',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  RemoveTaskPayout: {
    description: 'Remove task payout',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  SendWorkInvite: {
    description: 'Send work invite',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  SetTaskDescription: {
    description: 'Set task description',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  SetTaskDueDate: {
    description: 'Set task due date',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  SetTaskPayout: {
    description: 'Set task payout',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  SetTaskSkill: {
    description: 'Set task skill',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  RemoveTaskSkill: {
    description: 'Remove task skill',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  SetTaskTitle: {
    description: 'Set task title',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
  },
  SetTaskDomain: {
    description: 'Set task domain',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Domain,
  },
  UnassignWorker: {
    description: 'Unassign worker',
    roles: [ColonyRoles.Administration],
    type: AuthTypes.Task,
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

  private async assertForColony(check: AuthChecks, args: ColonyAuthArgs) {
    // TODO check valid colony address
    const { description, roles } = AUTH_DECLARATIONS[check]
    return ColonyAuthDataSource.assertIsAuthorized(
      this.hasSomeRole(roles, { ...args, domainId: ROOT_DOMAIN }),
      description,
      args,
    )
  }

  private async assertForDomain(check: AuthChecks, args: DomainAuthArgs) {
    // TODO check valid colony address
    const { description, roles } = AUTH_DECLARATIONS[check]
    try {
      return await ColonyAuthDataSource.assertIsAuthorized(
        this.hasSomeRole(roles, args),
        description,
        args,
      )
    } catch (e) {
      // As long as we only have 1 level of domains in the dapp, we just check the root domain additionally
      return this.assertForColony(check, args)
    }
  }

  private async assertForTask(check: AuthChecks, args: TaskAuthArgs) {
    // `taskId` could be used here (for now, it's not part of TaskAuthArgs)
    return this.assertForDomain(check, args)
  }

  private async assertAdminProgram(check: AuthChecks, args: ColonyAuthArgs) {
    // Programs require the FUNDING and ADMINISTRATION permissions in the ROOT domain. Always. So here's a shortcut
    const domainAuthArgs: DomainAuthArgs = { ...args, domainId: ROOT_DOMAIN }
    return this.assertForDomain(check, domainAuthArgs)
  }

  async assertCanSetTaskDomain({
    colonyAddress,
    userAddress,
    currentDomainId,
    newDomainId,
  }: ColonyAuthArgs & {
    currentDomainId: DomainId
    newDomainId: DomainId
  }) {
    const isAuthorizedForCurrentDomain = await this.assertForTask(
      AuthChecks.SetTaskDomain,
      { userAddress, colonyAddress, domainId: currentDomainId },
    )
    const isAuthorizedForNewDomain = await this.assertForTask(
      AuthChecks.SetTaskDomain,
      { userAddress, colonyAddress, domainId: newDomainId },
    )
    return isAuthorizedForCurrentDomain && isAuthorizedForNewDomain
  }

  async assertCanSetTaskTitle(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.SetTaskTitle, args)
  }

  async assertCanSetTaskDescription(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.SetTaskDescription, args)
  }

  async assertCanSetTaskSkill(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.SetTaskSkill, args)
  }

  async assertCanRemoveTaskSkill(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.RemoveTaskSkill, args)
  }

  async assertCanSetTaskDueDate(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.SetTaskDueDate, args)
  }

  async assertCanSendWorkInvite(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.SendWorkInvite, args)
  }

  async assertCanSetTaskPayout(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.SetTaskPayout, args)
  }

  async assertCanRemoveTaskPayout(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.RemoveTaskPayout, args)
  }

  async assertCanAssignWorker(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.AssignWorker, args)
  }

  async assertCanUnassignWorker(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.UnassignWorker, args)
  }

  async assertCanFinalizeTask(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.FinalizeTask, args)
  }

  async assertCanCancelTask(args: TaskAuthArgs) {
    return this.assertForTask(AuthChecks.CancelTask, args)
  }

  async assertCanCreateDomain({
    colonyAddress,
    userAddress,
    domainId,
    parentDomainId,
  }: DomainAuthArgs & {
    parentDomainId: DomainId
  }) {
    return this.assertForDomain(AuthChecks.CreateDomain, {
      userAddress,
      colonyAddress,
      domainId: parentDomainId,
    })
  }

  async assertCanEditDomainName(args: DomainAuthArgs) {
    return this.assertForDomain(AuthChecks.EditDomainName, args)
  }

  async assertCanModifySuggestionStatus(args: DomainAuthArgs) {
    return this.assertForDomain(AuthChecks.EditSuggestion, args)
  }

  async assertCanCreateTask(args: DomainAuthArgs) {
    return this.assertForDomain(AuthChecks.CreateTask, args)
  }

  async assertCanEditColonyProfile(args: ColonyAuthArgs) {
    return this.assertForColony(AuthChecks.EditColonyProfile, args)
  }

  async assertCanSetColonyTokens(args: ColonyAuthArgs) {
    return this.assertForColony(AuthChecks.SetColonyTokens, args)
  }

  async assertCanCreatePersistentTask(args: ColonyAuthArgs) {
    // For now we just check the program auth for persistent tasks (as they are only used in programs)
    return this.assertAdminProgram(AuthChecks.AdminProgram, args)
  }

  async assertCanEditPersistentTask(args: ColonyAuthArgs) {
    // For now we just check the program auth for persistent tasks (as they are only used in programs)
    return this.assertAdminProgram(AuthChecks.AdminProgram, args)
  }

  async assertCanAcceptSubmission(args: ColonyAuthArgs) {
    return this.assertAdminProgram(AuthChecks.AdminProgram, args)
  }

  async assertCanCreateProgram(args: ColonyAuthArgs) {
    return this.assertAdminProgram(AuthChecks.AdminProgram, args)
  }

  async assertCanEditProgram(args: ColonyAuthArgs) {
    return this.assertAdminProgram(AuthChecks.AdminProgram, args)
  }

  async assertCanCreateLevel(args: ColonyAuthArgs) {
    return this.assertAdminProgram(AuthChecks.AdminProgram, args)
  }

  async assertCanEditLevel(args: ColonyAuthArgs) {
    return this.assertAdminProgram(AuthChecks.AdminProgram, args)
  }

  async assertColonyExists(colonyAddress: ColonyAddress): Promise<boolean> {
    if (disableAuthCheck) {
      return true
    }

    const exists = await retry(
      async () => {
        const exists = await this.network.isColony(colonyAddress)
        if (exists) return exists
      },
      { retries: 5 },
    )
    assert.ok(exists, `Colony contract not found: '${colonyAddress}'`)
    return exists
  }
}
