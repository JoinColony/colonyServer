import {
  ObjectID,
  OnlyFieldsOfType,
  PullAllOperator,
  PullOperator,
  PushOperator,
  RootQuerySelector,
  SetFields,
} from 'mongodb'

import { EventType, LevelStatus, ProgramStatus } from '../graphql/types'

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
  nativeTokenAddress: string
  isNativeTokenExternal: boolean
  tokenAddresses: string[]
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

export interface EventBansDoc extends MongoDoc {
  colonyAddress: string
  bannedWalletAddresses: string[]
}

export interface ProgramDoc extends MongoDoc {
  colonyAddress: string
  creatorAddress: string
  title?: string
  description?: string
  levelIds: string[]
  enrolledUserAddresses: string[]
  status: ProgramStatus
}

export interface LevelDoc extends MongoDoc {
  creatorAddress: string
  programId: ObjectID
  title?: string
  description?: string
  achievement?: string
  numRequiredSteps?: number
  stepIds: string[]
  completedBy: string[]
  status: LevelStatus
}

export interface PersistentTaskDoc extends MongoDoc {
  colonyAddress: string
  creatorAddress: string
  ethDomainId?: number
  ethSkillId?: number
  title?: string
  description?: string
  payouts: any[]
  status: any
}

export interface SubmissionDoc extends MongoDoc {
  creatorAddress: string
  submission: string
  statusChangedAt: Date
}

export interface ProgramSubmissionDoc extends MongoDoc {
  levelId: ObjectID
  submission: SubmissionDoc
}

enum SuggestionStatus {
  Open = 'Open',
  NotPlanned = 'NotPlanned',
  Accepted = 'Accepted',
  Deleted = 'Deleted',
}

export interface SuggestionDoc extends MongoDoc {
  colonyAddress: string
  creatorAddress: string
  ethDomainId: number
  status: SuggestionStatus
  upvotes: string[]
  title: string
}

export interface TaskDoc extends MongoDoc {
  colonyAddress: string
  creatorAddress: string
  ethDomainId: number
  ethPotId?: number
  assignedWorkerAddress?: string
  cancelledAt?: Date
  description?: string
  dueDate?: Date
  ethSkillId?: number
  finalizedAt?: Date
  payouts: any[]
  title?: string
  txHash?: string
  workInviteAddresses: string[]
  workRequestAddresses: string[]
}

export interface TokenDoc extends MongoDoc {
  address: string
  creatorAddress: string
  decimals: number
  iconHash?: string
  name: string
  symbol: string
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
  username: string
  walletAddress: string
  website?: string
  tokenAddresses: string[]
}
