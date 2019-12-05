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
  colonyName: string
  avatarHash?: string
  displayName?: string
  description?: string
  guideline?: string
  website?: string
  token: {
    address: string
    name: string
    symbol: string
    iconHash?: string
    isExternal?: boolean
    isNative?: boolean
  }
  tasks: string[]
}

export interface DomainDoc extends MongoDoc {
  colonyAddress: string
  ethDomainId: number
  ethParentDomainId: number
  name: string
}

// TODO
export interface EventDoc<C extends object> extends MongoDoc {
  type: EventType
  initiator: string
  sourceType: 'db' | 'contract'
  context: C
}

// TODO
export interface MessageDoc extends MongoDoc {}

export interface TaskDoc extends MongoDoc {
  colonyAddress: string
  creatorAddress: string
  ethDomainId: number
  assignedWorker?: string
  cancelledAt?: Date
  description?: string
  dueDate?: Date
  ethSkillId?: number
  ethTaskId?: number
  finalizedAt?: Date
  title?: string
  workInvites: string[]
  workRequests: string[]
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
  UnassignWorker = 'UnassignWorker',
}

export interface NotificationDoc extends MongoDoc {
  eventId: ObjectID
  users: { userAddress: string; read?: boolean }[]
}

export interface UserDoc extends MongoDoc {
  avatarHash?: string
  bio?: string
  displayName?: string
  location?: string
  subscribedColonies: string[]
  subscribedTasks: string[]
  username: string
  walletAddress: string
  website?: string
}
