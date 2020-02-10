export const ROOT_DOMAIN = 1

export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'

export enum EventType {
  AssignWorker = 'AssignWorker',
  CancelTask = 'CancelTask',
  CreateDomain = 'CreateDomain',
  CreateTask = 'CreateTask',
  CreateWorkRequest = 'CreateWorkRequest',
  FinalizeTask = 'FinalizeTask',
  RemoveTaskPayout = 'RemoveTaskPayout',
  SendWorkInvite = 'SendWorkInvite',
  SetTaskDescription = 'SetTaskDescription',
  SetTaskDomain = 'SetTaskDomain',
  SetTaskDueDate = 'SetTaskDueDate',
  SetTaskPayout = 'SetTaskPayout',
  SetTaskSkill = 'SetTaskSkill',
  SetTaskTitle = 'SetTaskTitle',
  NewUser = 'NewUser',
  TaskMessage = 'TaskMessage',
  UnassignWorker = 'UnassignWorker',
}

/*
 * Colonies that newly created users on mainnet are automatically subscribed to
 */
export const AUTO_SUBSCRIBED_COLONIES = [
  '0x869814034d96544f3c62de2ac22448ed79ac8e70', // `beta`
]

/*
 * @NOTE Only used for dev purpouses
 */
export const NETWORK_LOCAL = 'local'
export const NETWORK_LOCAL_URL = 'http://localhost:8545'
