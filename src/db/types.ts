import {
  ObjectID,
  OnlyFieldsOfType,
  PullAllOperator,
  PullOperator,
  PushOperator,
  RootQuerySelector,
  SetFields,
} from 'mongodb'

// Stricter than RootQuerySelector (only allows fields from T),
// but doesn't allow dot-notation fields.
export type StrictRootQuerySelector<T> = Partial<T> &
  Pick<
    RootQuerySelector<T>,
    '$and' | '$nor' | '$or' | '$text' | '$where' | '$comment'
  >

// Stricter than UpdateQuery (only allows fields from T),
// but doesn't allow dot-notation fields
export interface StrictUpdateQuery<T> {
  $currentDate?: OnlyFieldsOfType<
    T,
    Date,
    true | { $type: 'date' | 'timestamp' }
  >
  $inc?: OnlyFieldsOfType<T, number>
  $min?: Partial<T>
  $max?: Partial<T>
  $mul?: OnlyFieldsOfType<T, number>
  $rename?: { [key: string]: string }
  $set?: Partial<T>
  $setOnInsert?: Partial<T>
  $unset?: OnlyFieldsOfType<T, any, ''>
  $addToSet?: SetFields<T>
  $pop?: OnlyFieldsOfType<T, any[], 1 | -1>
  $pull?: PullOperator<T>
  $push?: PushOperator<T>
  $pullAll?: PullAllOperator<T>
  $bit?: {
    [key: string]: { [key in 'and' | 'or' | 'xor']?: number }
  }
}

export interface MongoDoc {
  readonly _id: ObjectID
}

export interface ColonyDoc extends MongoDoc {
  colonyAddress: string
  founderAddress: string
  colonyName: string
  avatarHash?: string
  displayName?: string
  description?: string
  guideline?: string
  website?: string
  tokenRefs: {
    address: string
    iconHash?: string
    isExternal?: boolean
    isNative?: boolean
  }[]
  taskIds: string[]
}

export interface DomainDoc extends MongoDoc {
  colonyAddress: string
  ethDomainId: number
  ethParentDomainId: number
  name: string
}

export interface EventDoc<C extends object> extends MongoDoc {
  type: EventType
  initiatorAddress: string
  sourceType: 'db' | 'contract'
  context: C
}

export interface TaskDoc extends MongoDoc {
  colonyAddress: string
  creatorAddress: string
  ethDomainId: number
  assignedWorkerAddress?: string
  cancelledAt?: string
  description?: string
  dueDate?: string
  ethSkillId?: number
  ethTaskId?: number
  finalizedAt?: string
  title?: string
  workInviteAddresses: string[]
  workRequestAddresses: string[]
}

export interface TokenDoc extends MongoDoc {
  address: string
  decimals: number
  iconHash?: string
  name: string
  symbol: string
}

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
  TaskMessage = 'TaskMessage',
  UnassignWorker = 'UnassignWorker',
}

export interface NotificationDoc extends MongoDoc {
  eventId: ObjectID
  users: { address: string; read?: boolean }[]
}

export interface UserDoc extends MongoDoc {
  avatarHash?: string
  bio?: string
  displayName?: string
  location?: string
  colonyAddresses: string[]
  taskIds: string[]
  username: string
  walletAddress: string
  website?: string
  tokenAddresses: string[]
}
