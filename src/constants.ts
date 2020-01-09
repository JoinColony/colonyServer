export const ROOT_DOMAIN = 1

export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'

/*
 * @NOTE Only used for dev purpouses
 */
export const NETWORK_LOCAL = 'local';
export const NETWORK_LOCAL_URL = 'http://localhost:8545';

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
