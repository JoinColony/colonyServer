import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  GraphQLDateTime: any,
};

export type AcceptSubmissionInput = {
  id: Scalars['String'],
};

export type AddUpvoteToSuggestionInput = {
  id: Scalars['String'],
};

export type AssignWorkerEvent = TaskEvent & {
   __typename?: 'AssignWorkerEvent',
  type: EventType,
  taskId: Scalars['String'],
  workerAddress: Scalars['String'],
};

export type AssignWorkerInput = {
  id: Scalars['String'],
  workerAddress: Scalars['String'],
};

export type CancelTaskEvent = TaskEvent & {
   __typename?: 'CancelTaskEvent',
  type: EventType,
  taskId: Scalars['String'],
};

export type Colony = {
   __typename?: 'Colony',
  id: Scalars['String'],
  createdAt: Scalars['GraphQLDateTime'],
  colonyAddress: Scalars['String'],
  founderAddress: Scalars['String'],
  colonyName: Scalars['String'],
  avatarHash?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  displayName?: Maybe<Scalars['String']>,
  guideline?: Maybe<Scalars['String']>,
  website?: Maybe<Scalars['String']>,
  taskIds: Array<Scalars['String']>,
  tasks: Array<Task>,
  domains: Array<Domain>,
  founder?: Maybe<User>,
  isNativeTokenExternal: Scalars['Boolean'],
  nativeTokenAddress: Scalars['String'],
  programs: Array<Program>,
  subscribedUsers: Array<User>,
  suggestions: Array<Suggestion>,
  tokenAddresses: Array<Scalars['String']>,
};

export type ColonyEvent = {
  type: EventType,
  colonyAddress: Scalars['String'],
};

export type CreateColonyInput = {
  colonyAddress: Scalars['String'],
  colonyName: Scalars['String'],
  displayName: Scalars['String'],
  tokenAddress: Scalars['String'],
  tokenName: Scalars['String'],
  tokenSymbol: Scalars['String'],
  tokenDecimals: Scalars['Int'],
  tokenIsExternal: Scalars['Boolean'],
  tokenIconHash?: Maybe<Scalars['String']>,
};

export type CreateDomainEvent = ColonyEvent & {
   __typename?: 'CreateDomainEvent',
  type: EventType,
  ethDomainId: Scalars['Int'],
  colonyAddress: Scalars['String'],
};

export type CreateDomainInput = {
  colonyAddress: Scalars['String'],
  ethDomainId: Scalars['Int'],
  ethParentDomainId?: Maybe<Scalars['Int']>,
  name: Scalars['String'],
};

export type CreateLevelInput = {
  programId: Scalars['String'],
};

export type CreateLevelTaskInput = {
  levelId: Scalars['String'],
};

export type CreateLevelTaskSubmissionInput = {
  levelId: Scalars['String'],
  persistentTaskId: Scalars['String'],
  submission: Scalars['String'],
};

export type CreateProgramInput = {
  colonyAddress: Scalars['String'],
};

export type CreateSuggestionInput = {
  colonyAddress: Scalars['String'],
  ethDomainId: Scalars['Int'],
  title: Scalars['String'],
};

export type CreateTaskEvent = TaskEvent & {
   __typename?: 'CreateTaskEvent',
  type: EventType,
  taskId: Scalars['String'],
  ethDomainId: Scalars['Int'],
  colonyAddress: Scalars['String'],
};

export type CreateTaskFromSuggestionInput = {
  id: Scalars['String'],
};

export type CreateTaskInput = {
  colonyAddress: Scalars['String'],
  ethDomainId: Scalars['Int'],
};

export type CreateUserInput = {
  username: Scalars['String'],
};

export type CreateWorkRequestEvent = TaskEvent & {
   __typename?: 'CreateWorkRequestEvent',
  type: EventType,
  taskId: Scalars['String'],
};

export type CreateWorkRequestInput = {
  id: Scalars['String'],
};

export type Domain = {
   __typename?: 'Domain',
  id: Scalars['String'],
  createdAt: Scalars['GraphQLDateTime'],
  colonyAddress: Scalars['String'],
  ethDomainId: Scalars['Int'],
  ethParentDomainId?: Maybe<Scalars['Int']>,
  name: Scalars['String'],
  colony?: Maybe<Colony>,
  parent?: Maybe<Domain>,
  tasks: Array<Task>,
};

export type EditColonyProfileInput = {
  colonyAddress: Scalars['String'],
  avatarHash?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  displayName?: Maybe<Scalars['String']>,
  guideline?: Maybe<Scalars['String']>,
  website?: Maybe<Scalars['String']>,
};

export type EditDomainNameInput = {
  colonyAddress: Scalars['String'],
  ethDomainId: Scalars['Int'],
  name: Scalars['String'],
};

export type EditLevelInput = {
  id: Scalars['String'],
  title?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  achievement?: Maybe<Scalars['String']>,
  numRequiredSteps?: Maybe<Scalars['Int']>,
};

export type EditPersistentTaskInput = {
  id: Scalars['String'],
  ethDomainId?: Maybe<Scalars['Int']>,
  ethSkillId?: Maybe<Scalars['Int']>,
  title?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
};

export type EditProgramInput = {
  id: Scalars['String'],
  title?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
};

export type EditSubmissionInput = {
  id: Scalars['String'],
  submission: Scalars['String'],
};

export type EditUserInput = {
  avatarHash?: Maybe<Scalars['String']>,
  bio?: Maybe<Scalars['String']>,
  displayName?: Maybe<Scalars['String']>,
  location?: Maybe<Scalars['String']>,
  website?: Maybe<Scalars['String']>,
};

export type Event = {
   __typename?: 'Event',
  id: Scalars['String'],
  type: EventType,
  createdAt: Scalars['GraphQLDateTime'],
  initiator?: Maybe<User>,
  initiatorAddress: Scalars['String'],
  sourceId: Scalars['String'],
  sourceType: Scalars['String'],
  context: EventContext,
};

export type EventContext = AssignWorkerEvent | CancelTaskEvent | CreateDomainEvent | CreateTaskEvent | CreateWorkRequestEvent | FinalizeTaskEvent | NewUserEvent | RemoveTaskPayoutEvent | SendWorkInviteEvent | SetTaskDescriptionEvent | SetTaskDomainEvent | SetTaskDueDateEvent | SetTaskPayoutEvent | SetTaskSkillEvent | RemoveTaskSkillEvent | SetTaskTitleEvent | TaskMessageEvent | UnassignWorkerEvent;

export enum EventType {
  AssignWorker = 'AssignWorker',
  CancelTask = 'CancelTask',
  CreateDomain = 'CreateDomain',
  CreateTask = 'CreateTask',
  CreateWorkRequest = 'CreateWorkRequest',
  FinalizeTask = 'FinalizeTask',
  NewUser = 'NewUser',
  RemoveTaskPayout = 'RemoveTaskPayout',
  SendWorkInvite = 'SendWorkInvite',
  SetTaskDescription = 'SetTaskDescription',
  SetTaskDomain = 'SetTaskDomain',
  SetTaskDueDate = 'SetTaskDueDate',
  SetTaskPayout = 'SetTaskPayout',
  SetTaskSkill = 'SetTaskSkill',
  RemoveTaskSkill = 'RemoveTaskSkill',
  SetTaskTitle = 'SetTaskTitle',
  TaskMessage = 'TaskMessage',
  UnassignWorker = 'UnassignWorker'
}

export type FinalizeTaskEvent = TaskEvent & {
   __typename?: 'FinalizeTaskEvent',
  type: EventType,
  taskId: Scalars['String'],
};

export type FinalizeTaskInput = {
  id: Scalars['String'],
  ethPotId: Scalars['Int'],
};


export type Level = {
   __typename?: 'Level',
  id: Scalars['String'],
  createdAt: Scalars['GraphQLDateTime'],
  creatorAddress: Scalars['String'],
  programId: Scalars['String'],
  title?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  achievement?: Maybe<Scalars['String']>,
  numRequiredSteps?: Maybe<Scalars['Int']>,
  stepIds: Array<Scalars['String']>,
  steps: Array<PersistentTask>,
  status: LevelStatus,
};

export enum LevelStatus {
  Active = 'Active',
  Deleted = 'Deleted'
}

export type MarkNotificationAsReadInput = {
  id: Scalars['String'],
};

export type Mutation = {
   __typename?: 'Mutation',
  /**  Colonies */
  createColony?: Maybe<Colony>,
  editColonyProfile?: Maybe<Colony>,
  setColonyTokens?: Maybe<Colony>,
  /** Domains */
  createDomain?: Maybe<Domain>,
  editDomainName?: Maybe<Domain>,
  /**  Messages */
  sendTaskMessage: Scalars['Boolean'],
  /** Notifications */
  markAllNotificationsAsRead: Scalars['Boolean'],
  markNotificationAsRead: Scalars['Boolean'],
  /** Suggestions */
  createSuggestion?: Maybe<Suggestion>,
  setSuggestionStatus?: Maybe<Suggestion>,
  addUpvoteToSuggestion?: Maybe<Suggestion>,
  removeUpvoteFromSuggestion?: Maybe<Suggestion>,
  /** Tasks */
  assignWorker?: Maybe<Task>,
  cancelTask?: Maybe<Task>,
  createTask?: Maybe<Task>,
  createTaskFromSuggestion?: Maybe<Task>,
  createWorkRequest?: Maybe<Task>,
  finalizeTask?: Maybe<Task>,
  removeTaskPayout?: Maybe<Task>,
  sendWorkInvite?: Maybe<Task>,
  setTaskDomain?: Maybe<Task>,
  setTaskDescription?: Maybe<Task>,
  setTaskDueDate?: Maybe<Task>,
  setTaskPayout?: Maybe<Task>,
  setTaskSkill?: Maybe<Task>,
  removeTaskSkill?: Maybe<Task>,
  setTaskTitle?: Maybe<Task>,
  unassignWorker?: Maybe<Task>,
  /** Users */
  createUser?: Maybe<User>,
  editUser?: Maybe<User>,
  subscribeToColony?: Maybe<User>,
  unsubscribeFromColony?: Maybe<User>,
  setUserTokens?: Maybe<User>,
  /** Submissions */
  createLevelTaskSubmission?: Maybe<Submission>,
  editSubmission?: Maybe<Submission>,
  acceptSubmission?: Maybe<Submission>,
  /** PersistentTasks */
  createLevelTask?: Maybe<PersistentTask>,
  removeLevelTask?: Maybe<PersistentTask>,
  editPersistentTask?: Maybe<PersistentTask>,
  setPersistentTaskPayout?: Maybe<PersistentTask>,
  removePersistentTaskPayout?: Maybe<PersistentTask>,
  removePersistentTask?: Maybe<PersistentTask>,
  /** Levels */
  createLevel?: Maybe<Level>,
  editLevel?: Maybe<Level>,
  reorderLevelSteps?: Maybe<Level>,
  removeLevel?: Maybe<Level>,
  /** Programs */
  createProgram?: Maybe<Program>,
  editProgram?: Maybe<Program>,
  reorderProgramLevels?: Maybe<Program>,
  publishProgram?: Maybe<Program>,
  removeProgram?: Maybe<Program>,
};


export type MutationCreateColonyArgs = {
  input: CreateColonyInput
};


export type MutationEditColonyProfileArgs = {
  input: EditColonyProfileInput
};


export type MutationSetColonyTokensArgs = {
  input: SetColonyTokensInput
};


export type MutationCreateDomainArgs = {
  input: CreateDomainInput
};


export type MutationEditDomainNameArgs = {
  input: EditDomainNameInput
};


export type MutationSendTaskMessageArgs = {
  input: SendTaskMessageInput
};


export type MutationMarkNotificationAsReadArgs = {
  input: MarkNotificationAsReadInput
};


export type MutationCreateSuggestionArgs = {
  input: CreateSuggestionInput
};


export type MutationSetSuggestionStatusArgs = {
  input: SetSuggestionStatusInput
};


export type MutationAddUpvoteToSuggestionArgs = {
  input: AddUpvoteToSuggestionInput
};


export type MutationRemoveUpvoteFromSuggestionArgs = {
  input: RemoveUpvoteFromSuggestionInput
};


export type MutationAssignWorkerArgs = {
  input: AssignWorkerInput
};


export type MutationCancelTaskArgs = {
  input: TaskIdInput
};


export type MutationCreateTaskArgs = {
  input: CreateTaskInput
};


export type MutationCreateTaskFromSuggestionArgs = {
  input: CreateTaskFromSuggestionInput
};


export type MutationCreateWorkRequestArgs = {
  input: CreateWorkRequestInput
};


export type MutationFinalizeTaskArgs = {
  input: FinalizeTaskInput
};


export type MutationRemoveTaskPayoutArgs = {
  input: RemoveTaskPayoutInput
};


export type MutationSendWorkInviteArgs = {
  input: SendWorkInviteInput
};


export type MutationSetTaskDomainArgs = {
  input: SetTaskDomainInput
};


export type MutationSetTaskDescriptionArgs = {
  input: SetTaskDescriptionInput
};


export type MutationSetTaskDueDateArgs = {
  input: SetTaskDueDateInput
};


export type MutationSetTaskPayoutArgs = {
  input: SetTaskPayoutInput
};


export type MutationSetTaskSkillArgs = {
  input: SetTaskSkillInput
};


export type MutationRemoveTaskSkillArgs = {
  input: RemoveTaskSkillInput
};


export type MutationSetTaskTitleArgs = {
  input: SetTaskTitleInput
};


export type MutationUnassignWorkerArgs = {
  input: UnassignWorkerInput
};


export type MutationCreateUserArgs = {
  input: CreateUserInput
};


export type MutationEditUserArgs = {
  input: EditUserInput
};


export type MutationSubscribeToColonyArgs = {
  input: SubscribeToColonyInput
};


export type MutationUnsubscribeFromColonyArgs = {
  input: UnsubscribeFromColonyInput
};


export type MutationSetUserTokensArgs = {
  input: SetUserTokensInput
};


export type MutationCreateLevelTaskSubmissionArgs = {
  input: CreateLevelTaskSubmissionInput
};


export type MutationEditSubmissionArgs = {
  input: EditSubmissionInput
};


export type MutationAcceptSubmissionArgs = {
  input: AcceptSubmissionInput
};


export type MutationCreateLevelTaskArgs = {
  input: CreateLevelTaskInput
};


export type MutationRemoveLevelTaskArgs = {
  input: RemoveLevelTaskInput
};


export type MutationEditPersistentTaskArgs = {
  input: EditPersistentTaskInput
};


export type MutationSetPersistentTaskPayoutArgs = {
  input: SetTaskPayoutInput
};


export type MutationRemovePersistentTaskPayoutArgs = {
  input: RemoveTaskPayoutInput
};


export type MutationRemovePersistentTaskArgs = {
  input: RemovePersistentTaskInput
};


export type MutationCreateLevelArgs = {
  input: CreateLevelInput
};


export type MutationEditLevelArgs = {
  input: EditLevelInput
};


export type MutationReorderLevelStepsArgs = {
  input: ReorderLevelStepsInput
};


export type MutationRemoveLevelArgs = {
  input: RemoveLevelInput
};


export type MutationCreateProgramArgs = {
  input: CreateProgramInput
};


export type MutationEditProgramArgs = {
  input: EditProgramInput
};


export type MutationReorderProgramLevelsArgs = {
  input: ReorderProgramLevelsInput
};


export type MutationPublishProgramArgs = {
  input: PublishProgramInput
};


export type MutationRemoveProgramArgs = {
  input: RemoveProgramInput
};

export type NewUserEvent = {
   __typename?: 'NewUserEvent',
  type: EventType,
};

export type Notification = {
   __typename?: 'Notification',
  id: Scalars['String'],
  event: Event,
  read: Scalars['Boolean'],
};

export type PersistentTask = {
   __typename?: 'PersistentTask',
  id: Scalars['String'],
  createdAt: Scalars['GraphQLDateTime'],
  colonyAddress: Scalars['String'],
  creatorAddress: Scalars['String'],
  ethDomainId?: Maybe<Scalars['Int']>,
  ethSkillId?: Maybe<Scalars['Int']>,
  title?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  payouts: Array<TaskPayout>,
  submissions: Array<Submission>,
  status: PersistentTaskStatus,
};

export enum PersistentTaskStatus {
  Active = 'Active',
  Closed = 'Closed',
  Deleted = 'Deleted'
}

export type Program = {
   __typename?: 'Program',
  id: Scalars['String'],
  createdAt: Scalars['GraphQLDateTime'],
  creatorAddress: Scalars['String'],
  colonyAddress: Scalars['String'],
  title?: Maybe<Scalars['String']>,
  description?: Maybe<Scalars['String']>,
  levelIds: Array<Scalars['String']>,
  levels: Array<Level>,
  status: ProgramStatus,
  submissions: Array<Submission>,
};

export enum ProgramStatus {
  Draft = 'Draft',
  Active = 'Active',
  Deleted = 'Deleted'
}

export type PublishProgramInput = {
  id: Scalars['String'],
};

export type Query = {
   __typename?: 'Query',
  user: User,
  colony: Colony,
  domain: Domain,
  task: Task,
  tokenInfo: TokenInfo,
  systemInfo: SystemInfo,
};


export type QueryUserArgs = {
  address: Scalars['String']
};


export type QueryColonyArgs = {
  address: Scalars['String']
};


export type QueryDomainArgs = {
  colonyAddress: Scalars['String'],
  ethDomainId: Scalars['Int']
};


export type QueryTaskArgs = {
  id: Scalars['String']
};


export type QueryTokenInfoArgs = {
  address: Scalars['String']
};

export type RemoveLevelInput = {
  id: Scalars['String'],
};

export type RemoveLevelTaskInput = {
  id: Scalars['String'],
  levelId: Scalars['String'],
};

export type RemovePersistentTaskInput = {
  id: Scalars['String'],
};

export type RemoveProgramInput = {
  id: Scalars['String'],
};

export type RemoveTaskPayoutEvent = TaskEvent & {
   __typename?: 'RemoveTaskPayoutEvent',
  type: EventType,
  taskId: Scalars['String'],
  tokenAddress: Scalars['String'],
  amount: Scalars['String'],
};

export type RemoveTaskPayoutInput = {
  id: Scalars['String'],
  amount: Scalars['String'],
  tokenAddress: Scalars['String'],
};

export type RemoveTaskSkillEvent = TaskEvent & {
   __typename?: 'RemoveTaskSkillEvent',
  type: EventType,
  taskId: Scalars['String'],
  ethSkillId: Scalars['Int'],
};

export type RemoveTaskSkillInput = {
  id: Scalars['String'],
  ethSkillId: Scalars['Int'],
};

export type RemoveUpvoteFromSuggestionInput = {
  id: Scalars['String'],
};

export type ReorderLevelStepsInput = {
  id: Scalars['String'],
  stepIds: Array<Scalars['String']>,
};

export type ReorderProgramLevelsInput = {
  id: Scalars['String'],
  levelIds: Array<Scalars['String']>,
};

export type SendTaskMessageInput = {
  id: Scalars['String'],
  message: Scalars['String'],
};

export type SendWorkInviteEvent = TaskEvent & {
   __typename?: 'SendWorkInviteEvent',
  type: EventType,
  taskId: Scalars['String'],
  workerAddress: Scalars['String'],
};

export type SendWorkInviteInput = {
  id: Scalars['String'],
  workerAddress: Scalars['String'],
};

export type SetColonyTokensInput = {
  tokenAddresses: Array<Maybe<Scalars['String']>>,
  colonyAddress: Scalars['String'],
};

export type SetSuggestionStatusInput = {
  id: Scalars['String'],
  status: SuggestionStatus,
};

export type SetTaskDescriptionEvent = TaskEvent & {
   __typename?: 'SetTaskDescriptionEvent',
  type: EventType,
  taskId: Scalars['String'],
  description: Scalars['String'],
};

export type SetTaskDescriptionInput = {
  id: Scalars['String'],
  description: Scalars['String'],
};

export type SetTaskDomainEvent = TaskEvent & {
   __typename?: 'SetTaskDomainEvent',
  type: EventType,
  taskId: Scalars['String'],
  ethDomainId: Scalars['Int'],
};

export type SetTaskDomainInput = {
  id: Scalars['String'],
  ethDomainId: Scalars['Int'],
};

export type SetTaskDueDateEvent = TaskEvent & {
   __typename?: 'SetTaskDueDateEvent',
  type: EventType,
  taskId: Scalars['String'],
  dueDate: Scalars['GraphQLDateTime'],
};

export type SetTaskDueDateInput = {
  id: Scalars['String'],
  dueDate?: Maybe<Scalars['GraphQLDateTime']>,
};

export type SetTaskPayoutEvent = TaskEvent & {
   __typename?: 'SetTaskPayoutEvent',
  type: EventType,
  taskId: Scalars['String'],
  tokenAddress: Scalars['String'],
  amount: Scalars['String'],
};

export type SetTaskPayoutInput = {
  id: Scalars['String'],
  amount: Scalars['String'],
  tokenAddress: Scalars['String'],
};

export type SetTaskSkillEvent = TaskEvent & {
   __typename?: 'SetTaskSkillEvent',
  type: EventType,
  taskId: Scalars['String'],
  ethSkillId: Scalars['Int'],
};

export type SetTaskSkillInput = {
  id: Scalars['String'],
  ethSkillId: Scalars['Int'],
};

export type SetTaskTitleEvent = TaskEvent & {
   __typename?: 'SetTaskTitleEvent',
  type: EventType,
  taskId: Scalars['String'],
  title: Scalars['String'],
};

export type SetTaskTitleInput = {
  id: Scalars['String'],
  title: Scalars['String'],
};

export type SetUserTokensInput = {
  tokenAddresses: Array<Scalars['String']>,
};

export type Submission = {
   __typename?: 'Submission',
  id: Scalars['String'],
  createdAt: Scalars['GraphQLDateTime'],
  creatorAddress: Scalars['String'],
  creator: User,
  persistentTaskId: Scalars['String'],
  submission: Scalars['String'],
  status: SubmissionStatus,
  statusChangedAt?: Maybe<Scalars['GraphQLDateTime']>,
};

export enum SubmissionStatus {
  Open = 'Open',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Deleted = 'Deleted'
}

export type SubscribeToColonyInput = {
  colonyAddress: Scalars['String'],
};

export type Suggestion = {
   __typename?: 'Suggestion',
  id: Scalars['String'],
  createdAt: Scalars['GraphQLDateTime'],
  colonyAddress: Scalars['String'],
  creatorAddress: Scalars['String'],
  creator: User,
  ethDomainId: Scalars['Int'],
  status: SuggestionStatus,
  title: Scalars['String'],
  taskId?: Maybe<Scalars['String']>,
  upvotes: Array<Scalars['String']>,
};

export enum SuggestionStatus {
  Open = 'Open',
  NotPlanned = 'NotPlanned',
  Accepted = 'Accepted',
  Deleted = 'Deleted'
}

export type SystemInfo = {
   __typename?: 'SystemInfo',
  version: Scalars['String'],
};

export type Task = {
   __typename?: 'Task',
  id: Scalars['String'],
  createdAt: Scalars['GraphQLDateTime'],
  ethDomainId: Scalars['Int'],
  ethPotId?: Maybe<Scalars['Int']>,
  ethSkillId?: Maybe<Scalars['Int']>,
  cancelledAt?: Maybe<Scalars['GraphQLDateTime']>,
  description?: Maybe<Scalars['String']>,
  dueDate?: Maybe<Scalars['GraphQLDateTime']>,
  finalizedAt?: Maybe<Scalars['GraphQLDateTime']>,
  title?: Maybe<Scalars['String']>,
  colony: Colony,
  colonyAddress: Scalars['String'],
  creator: User,
  creatorAddress: Scalars['String'],
  domain: Domain,
  assignedWorker?: Maybe<User>,
  assignedWorkerAddress?: Maybe<Scalars['String']>,
  workInvites: Array<User>,
  workInviteAddresses: Array<Scalars['String']>,
  workRequests: Array<User>,
  workRequestAddresses: Array<Scalars['String']>,
  events: Array<Event>,
  payouts: Array<TaskPayout>,
};

export type TaskEvent = {
  type: EventType,
  taskId: Scalars['String'],
};

export type TaskIdInput = {
  id: Scalars['String'],
};

export type TaskMessageEvent = TaskEvent & {
   __typename?: 'TaskMessageEvent',
  type: EventType,
  taskId: Scalars['String'],
  message: Scalars['String'],
};

export type TaskPayout = {
   __typename?: 'TaskPayout',
  amount: Scalars['String'],
  tokenAddress: Scalars['String'],
};

export type TokenInfo = {
   __typename?: 'TokenInfo',
  id: Scalars['String'],
  address: Scalars['String'],
  iconHash?: Maybe<Scalars['String']>,
  name: Scalars['String'],
  decimals: Scalars['Int'],
  symbol: Scalars['String'],
  verified: Scalars['Boolean'],
};

export type UnassignWorkerEvent = TaskEvent & {
   __typename?: 'UnassignWorkerEvent',
  type: EventType,
  taskId: Scalars['String'],
  workerAddress: Scalars['String'],
};

export type UnassignWorkerInput = {
  id: Scalars['String'],
  workerAddress: Scalars['String'],
};

export type UnsubscribeFromColonyInput = {
  colonyAddress: Scalars['String'],
};

export type User = {
   __typename?: 'User',
  id: Scalars['String'],
  createdAt: Scalars['GraphQLDateTime'],
  profile: UserProfile,
  colonies: Array<Colony>,
  colonyAddresses: Array<Scalars['String']>,
  tasks: Array<Task>,
  taskIds: Array<Scalars['String']>,
  tokenAddresses: Array<Scalars['String']>,
  notifications: Array<Notification>,
};


export type UserNotificationsArgs = {
  read?: Maybe<Scalars['Boolean']>
};

export type UserProfile = {
   __typename?: 'UserProfile',
  username?: Maybe<Scalars['String']>,
  avatarHash?: Maybe<Scalars['String']>,
  bio?: Maybe<Scalars['String']>,
  displayName?: Maybe<Scalars['String']>,
  location?: Maybe<Scalars['String']>,
  walletAddress: Scalars['String'],
  website?: Maybe<Scalars['String']>,
};



export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>;

export type isTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>,
  String: ResolverTypeWrapper<Scalars['String']>,
  User: ResolverTypeWrapper<User>,
  GraphQLDateTime: ResolverTypeWrapper<Scalars['GraphQLDateTime']>,
  UserProfile: ResolverTypeWrapper<UserProfile>,
  Colony: ResolverTypeWrapper<Colony>,
  Task: ResolverTypeWrapper<Task>,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  Domain: ResolverTypeWrapper<Domain>,
  Event: ResolverTypeWrapper<Omit<Event, 'context'> & { context: ResolversTypes['EventContext'] }>,
  EventType: EventType,
  EventContext: ResolversTypes['AssignWorkerEvent'] | ResolversTypes['CancelTaskEvent'] | ResolversTypes['CreateDomainEvent'] | ResolversTypes['CreateTaskEvent'] | ResolversTypes['CreateWorkRequestEvent'] | ResolversTypes['FinalizeTaskEvent'] | ResolversTypes['NewUserEvent'] | ResolversTypes['RemoveTaskPayoutEvent'] | ResolversTypes['SendWorkInviteEvent'] | ResolversTypes['SetTaskDescriptionEvent'] | ResolversTypes['SetTaskDomainEvent'] | ResolversTypes['SetTaskDueDateEvent'] | ResolversTypes['SetTaskPayoutEvent'] | ResolversTypes['SetTaskSkillEvent'] | ResolversTypes['RemoveTaskSkillEvent'] | ResolversTypes['SetTaskTitleEvent'] | ResolversTypes['TaskMessageEvent'] | ResolversTypes['UnassignWorkerEvent'],
  AssignWorkerEvent: ResolverTypeWrapper<AssignWorkerEvent>,
  TaskEvent: ResolverTypeWrapper<TaskEvent>,
  CancelTaskEvent: ResolverTypeWrapper<CancelTaskEvent>,
  CreateDomainEvent: ResolverTypeWrapper<CreateDomainEvent>,
  ColonyEvent: ResolverTypeWrapper<ColonyEvent>,
  CreateTaskEvent: ResolverTypeWrapper<CreateTaskEvent>,
  CreateWorkRequestEvent: ResolverTypeWrapper<CreateWorkRequestEvent>,
  FinalizeTaskEvent: ResolverTypeWrapper<FinalizeTaskEvent>,
  NewUserEvent: ResolverTypeWrapper<NewUserEvent>,
  RemoveTaskPayoutEvent: ResolverTypeWrapper<RemoveTaskPayoutEvent>,
  SendWorkInviteEvent: ResolverTypeWrapper<SendWorkInviteEvent>,
  SetTaskDescriptionEvent: ResolverTypeWrapper<SetTaskDescriptionEvent>,
  SetTaskDomainEvent: ResolverTypeWrapper<SetTaskDomainEvent>,
  SetTaskDueDateEvent: ResolverTypeWrapper<SetTaskDueDateEvent>,
  SetTaskPayoutEvent: ResolverTypeWrapper<SetTaskPayoutEvent>,
  SetTaskSkillEvent: ResolverTypeWrapper<SetTaskSkillEvent>,
  RemoveTaskSkillEvent: ResolverTypeWrapper<RemoveTaskSkillEvent>,
  SetTaskTitleEvent: ResolverTypeWrapper<SetTaskTitleEvent>,
  TaskMessageEvent: ResolverTypeWrapper<TaskMessageEvent>,
  UnassignWorkerEvent: ResolverTypeWrapper<UnassignWorkerEvent>,
  TaskPayout: ResolverTypeWrapper<TaskPayout>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  Program: ResolverTypeWrapper<Program>,
  Level: ResolverTypeWrapper<Level>,
  PersistentTask: ResolverTypeWrapper<PersistentTask>,
  Submission: ResolverTypeWrapper<Submission>,
  SubmissionStatus: SubmissionStatus,
  PersistentTaskStatus: PersistentTaskStatus,
  LevelStatus: LevelStatus,
  ProgramStatus: ProgramStatus,
  Suggestion: ResolverTypeWrapper<Suggestion>,
  SuggestionStatus: SuggestionStatus,
  Notification: ResolverTypeWrapper<Notification>,
  TokenInfo: ResolverTypeWrapper<TokenInfo>,
  SystemInfo: ResolverTypeWrapper<SystemInfo>,
  Mutation: ResolverTypeWrapper<{}>,
  CreateColonyInput: CreateColonyInput,
  EditColonyProfileInput: EditColonyProfileInput,
  SetColonyTokensInput: SetColonyTokensInput,
  CreateDomainInput: CreateDomainInput,
  EditDomainNameInput: EditDomainNameInput,
  SendTaskMessageInput: SendTaskMessageInput,
  MarkNotificationAsReadInput: MarkNotificationAsReadInput,
  CreateSuggestionInput: CreateSuggestionInput,
  SetSuggestionStatusInput: SetSuggestionStatusInput,
  AddUpvoteToSuggestionInput: AddUpvoteToSuggestionInput,
  RemoveUpvoteFromSuggestionInput: RemoveUpvoteFromSuggestionInput,
  AssignWorkerInput: AssignWorkerInput,
  TaskIdInput: TaskIdInput,
  CreateTaskInput: CreateTaskInput,
  CreateTaskFromSuggestionInput: CreateTaskFromSuggestionInput,
  CreateWorkRequestInput: CreateWorkRequestInput,
  FinalizeTaskInput: FinalizeTaskInput,
  RemoveTaskPayoutInput: RemoveTaskPayoutInput,
  SendWorkInviteInput: SendWorkInviteInput,
  SetTaskDomainInput: SetTaskDomainInput,
  SetTaskDescriptionInput: SetTaskDescriptionInput,
  SetTaskDueDateInput: SetTaskDueDateInput,
  SetTaskPayoutInput: SetTaskPayoutInput,
  SetTaskSkillInput: SetTaskSkillInput,
  RemoveTaskSkillInput: RemoveTaskSkillInput,
  SetTaskTitleInput: SetTaskTitleInput,
  UnassignWorkerInput: UnassignWorkerInput,
  CreateUserInput: CreateUserInput,
  EditUserInput: EditUserInput,
  SubscribeToColonyInput: SubscribeToColonyInput,
  UnsubscribeFromColonyInput: UnsubscribeFromColonyInput,
  SetUserTokensInput: SetUserTokensInput,
  CreateLevelTaskSubmissionInput: CreateLevelTaskSubmissionInput,
  EditSubmissionInput: EditSubmissionInput,
  AcceptSubmissionInput: AcceptSubmissionInput,
  CreateLevelTaskInput: CreateLevelTaskInput,
  RemoveLevelTaskInput: RemoveLevelTaskInput,
  EditPersistentTaskInput: EditPersistentTaskInput,
  RemovePersistentTaskInput: RemovePersistentTaskInput,
  CreateLevelInput: CreateLevelInput,
  EditLevelInput: EditLevelInput,
  ReorderLevelStepsInput: ReorderLevelStepsInput,
  RemoveLevelInput: RemoveLevelInput,
  CreateProgramInput: CreateProgramInput,
  EditProgramInput: EditProgramInput,
  ReorderProgramLevelsInput: ReorderProgramLevelsInput,
  PublishProgramInput: PublishProgramInput,
  RemoveProgramInput: RemoveProgramInput,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  String: Scalars['String'],
  User: User,
  GraphQLDateTime: Scalars['GraphQLDateTime'],
  UserProfile: UserProfile,
  Colony: Colony,
  Task: Task,
  Int: Scalars['Int'],
  Domain: Domain,
  Event: Omit<Event, 'context'> & { context: ResolversParentTypes['EventContext'] },
  EventType: EventType,
  EventContext: ResolversParentTypes['AssignWorkerEvent'] | ResolversParentTypes['CancelTaskEvent'] | ResolversParentTypes['CreateDomainEvent'] | ResolversParentTypes['CreateTaskEvent'] | ResolversParentTypes['CreateWorkRequestEvent'] | ResolversParentTypes['FinalizeTaskEvent'] | ResolversParentTypes['NewUserEvent'] | ResolversParentTypes['RemoveTaskPayoutEvent'] | ResolversParentTypes['SendWorkInviteEvent'] | ResolversParentTypes['SetTaskDescriptionEvent'] | ResolversParentTypes['SetTaskDomainEvent'] | ResolversParentTypes['SetTaskDueDateEvent'] | ResolversParentTypes['SetTaskPayoutEvent'] | ResolversParentTypes['SetTaskSkillEvent'] | ResolversParentTypes['RemoveTaskSkillEvent'] | ResolversParentTypes['SetTaskTitleEvent'] | ResolversParentTypes['TaskMessageEvent'] | ResolversParentTypes['UnassignWorkerEvent'],
  AssignWorkerEvent: AssignWorkerEvent,
  TaskEvent: TaskEvent,
  CancelTaskEvent: CancelTaskEvent,
  CreateDomainEvent: CreateDomainEvent,
  ColonyEvent: ColonyEvent,
  CreateTaskEvent: CreateTaskEvent,
  CreateWorkRequestEvent: CreateWorkRequestEvent,
  FinalizeTaskEvent: FinalizeTaskEvent,
  NewUserEvent: NewUserEvent,
  RemoveTaskPayoutEvent: RemoveTaskPayoutEvent,
  SendWorkInviteEvent: SendWorkInviteEvent,
  SetTaskDescriptionEvent: SetTaskDescriptionEvent,
  SetTaskDomainEvent: SetTaskDomainEvent,
  SetTaskDueDateEvent: SetTaskDueDateEvent,
  SetTaskPayoutEvent: SetTaskPayoutEvent,
  SetTaskSkillEvent: SetTaskSkillEvent,
  RemoveTaskSkillEvent: RemoveTaskSkillEvent,
  SetTaskTitleEvent: SetTaskTitleEvent,
  TaskMessageEvent: TaskMessageEvent,
  UnassignWorkerEvent: UnassignWorkerEvent,
  TaskPayout: TaskPayout,
  Boolean: Scalars['Boolean'],
  Program: Program,
  Level: Level,
  PersistentTask: PersistentTask,
  Submission: Submission,
  SubmissionStatus: SubmissionStatus,
  PersistentTaskStatus: PersistentTaskStatus,
  LevelStatus: LevelStatus,
  ProgramStatus: ProgramStatus,
  Suggestion: Suggestion,
  SuggestionStatus: SuggestionStatus,
  Notification: Notification,
  TokenInfo: TokenInfo,
  SystemInfo: SystemInfo,
  Mutation: {},
  CreateColonyInput: CreateColonyInput,
  EditColonyProfileInput: EditColonyProfileInput,
  SetColonyTokensInput: SetColonyTokensInput,
  CreateDomainInput: CreateDomainInput,
  EditDomainNameInput: EditDomainNameInput,
  SendTaskMessageInput: SendTaskMessageInput,
  MarkNotificationAsReadInput: MarkNotificationAsReadInput,
  CreateSuggestionInput: CreateSuggestionInput,
  SetSuggestionStatusInput: SetSuggestionStatusInput,
  AddUpvoteToSuggestionInput: AddUpvoteToSuggestionInput,
  RemoveUpvoteFromSuggestionInput: RemoveUpvoteFromSuggestionInput,
  AssignWorkerInput: AssignWorkerInput,
  TaskIdInput: TaskIdInput,
  CreateTaskInput: CreateTaskInput,
  CreateTaskFromSuggestionInput: CreateTaskFromSuggestionInput,
  CreateWorkRequestInput: CreateWorkRequestInput,
  FinalizeTaskInput: FinalizeTaskInput,
  RemoveTaskPayoutInput: RemoveTaskPayoutInput,
  SendWorkInviteInput: SendWorkInviteInput,
  SetTaskDomainInput: SetTaskDomainInput,
  SetTaskDescriptionInput: SetTaskDescriptionInput,
  SetTaskDueDateInput: SetTaskDueDateInput,
  SetTaskPayoutInput: SetTaskPayoutInput,
  SetTaskSkillInput: SetTaskSkillInput,
  RemoveTaskSkillInput: RemoveTaskSkillInput,
  SetTaskTitleInput: SetTaskTitleInput,
  UnassignWorkerInput: UnassignWorkerInput,
  CreateUserInput: CreateUserInput,
  EditUserInput: EditUserInput,
  SubscribeToColonyInput: SubscribeToColonyInput,
  UnsubscribeFromColonyInput: UnsubscribeFromColonyInput,
  SetUserTokensInput: SetUserTokensInput,
  CreateLevelTaskSubmissionInput: CreateLevelTaskSubmissionInput,
  EditSubmissionInput: EditSubmissionInput,
  AcceptSubmissionInput: AcceptSubmissionInput,
  CreateLevelTaskInput: CreateLevelTaskInput,
  RemoveLevelTaskInput: RemoveLevelTaskInput,
  EditPersistentTaskInput: EditPersistentTaskInput,
  RemovePersistentTaskInput: RemovePersistentTaskInput,
  CreateLevelInput: CreateLevelInput,
  EditLevelInput: EditLevelInput,
  ReorderLevelStepsInput: ReorderLevelStepsInput,
  RemoveLevelInput: RemoveLevelInput,
  CreateProgramInput: CreateProgramInput,
  EditProgramInput: EditProgramInput,
  ReorderProgramLevelsInput: ReorderProgramLevelsInput,
  PublishProgramInput: PublishProgramInput,
  RemoveProgramInput: RemoveProgramInput,
};

export type AssignWorkerEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['AssignWorkerEvent'] = ResolversParentTypes['AssignWorkerEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  workerAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type CancelTaskEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CancelTaskEvent'] = ResolversParentTypes['CancelTaskEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type ColonyResolvers<ContextType = any, ParentType extends ResolversParentTypes['Colony'] = ResolversParentTypes['Colony']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  founderAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  avatarHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  guideline?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  taskIds?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>,
  domains?: Resolver<Array<ResolversTypes['Domain']>, ParentType, ContextType>,
  founder?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>,
  isNativeTokenExternal?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  nativeTokenAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  programs?: Resolver<Array<ResolversTypes['Program']>, ParentType, ContextType>,
  subscribedUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>,
  suggestions?: Resolver<Array<ResolversTypes['Suggestion']>, ParentType, ContextType>,
  tokenAddresses?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type ColonyEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['ColonyEvent'] = ResolversParentTypes['ColonyEvent']> = {
  __resolveType: TypeResolveFn<'CreateDomainEvent', ParentType, ContextType>,
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type CreateDomainEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateDomainEvent'] = ResolversParentTypes['CreateDomainEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  ethDomainId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type CreateTaskEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateTaskEvent'] = ResolversParentTypes['CreateTaskEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  ethDomainId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type CreateWorkRequestEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateWorkRequestEvent'] = ResolversParentTypes['CreateWorkRequestEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type DomainResolvers<ContextType = any, ParentType extends ResolversParentTypes['Domain'] = ResolversParentTypes['Domain']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  ethDomainId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  ethParentDomainId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colony?: Resolver<Maybe<ResolversTypes['Colony']>, ParentType, ContextType>,
  parent?: Resolver<Maybe<ResolversTypes['Domain']>, ParentType, ContextType>,
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type EventResolvers<ContextType = any, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  initiator?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>,
  initiatorAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  sourceId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  sourceType?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  context?: Resolver<ResolversTypes['EventContext'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type EventContextResolvers<ContextType = any, ParentType extends ResolversParentTypes['EventContext'] = ResolversParentTypes['EventContext']> = {
  __resolveType: TypeResolveFn<'AssignWorkerEvent' | 'CancelTaskEvent' | 'CreateDomainEvent' | 'CreateTaskEvent' | 'CreateWorkRequestEvent' | 'FinalizeTaskEvent' | 'NewUserEvent' | 'RemoveTaskPayoutEvent' | 'SendWorkInviteEvent' | 'SetTaskDescriptionEvent' | 'SetTaskDomainEvent' | 'SetTaskDueDateEvent' | 'SetTaskPayoutEvent' | 'SetTaskSkillEvent' | 'RemoveTaskSkillEvent' | 'SetTaskTitleEvent' | 'TaskMessageEvent' | 'UnassignWorkerEvent', ParentType, ContextType>
};

export type FinalizeTaskEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['FinalizeTaskEvent'] = ResolversParentTypes['FinalizeTaskEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export interface GraphQlDateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['GraphQLDateTime'], any> {
  name: 'GraphQLDateTime'
}

export type LevelResolvers<ContextType = any, ParentType extends ResolversParentTypes['Level'] = ResolversParentTypes['Level']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  creatorAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  programId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  achievement?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  numRequiredSteps?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>,
  stepIds?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  steps?: Resolver<Array<ResolversTypes['PersistentTask']>, ParentType, ContextType>,
  status?: Resolver<ResolversTypes['LevelStatus'], ParentType, ContextType>,
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createColony?: Resolver<Maybe<ResolversTypes['Colony']>, ParentType, ContextType, RequireFields<MutationCreateColonyArgs, 'input'>>,
  editColonyProfile?: Resolver<Maybe<ResolversTypes['Colony']>, ParentType, ContextType, RequireFields<MutationEditColonyProfileArgs, 'input'>>,
  setColonyTokens?: Resolver<Maybe<ResolversTypes['Colony']>, ParentType, ContextType, RequireFields<MutationSetColonyTokensArgs, 'input'>>,
  createDomain?: Resolver<Maybe<ResolversTypes['Domain']>, ParentType, ContextType, RequireFields<MutationCreateDomainArgs, 'input'>>,
  editDomainName?: Resolver<Maybe<ResolversTypes['Domain']>, ParentType, ContextType, RequireFields<MutationEditDomainNameArgs, 'input'>>,
  sendTaskMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSendTaskMessageArgs, 'input'>>,
  markAllNotificationsAsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  markNotificationAsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMarkNotificationAsReadArgs, 'input'>>,
  createSuggestion?: Resolver<Maybe<ResolversTypes['Suggestion']>, ParentType, ContextType, RequireFields<MutationCreateSuggestionArgs, 'input'>>,
  setSuggestionStatus?: Resolver<Maybe<ResolversTypes['Suggestion']>, ParentType, ContextType, RequireFields<MutationSetSuggestionStatusArgs, 'input'>>,
  addUpvoteToSuggestion?: Resolver<Maybe<ResolversTypes['Suggestion']>, ParentType, ContextType, RequireFields<MutationAddUpvoteToSuggestionArgs, 'input'>>,
  removeUpvoteFromSuggestion?: Resolver<Maybe<ResolversTypes['Suggestion']>, ParentType, ContextType, RequireFields<MutationRemoveUpvoteFromSuggestionArgs, 'input'>>,
  assignWorker?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationAssignWorkerArgs, 'input'>>,
  cancelTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationCancelTaskArgs, 'input'>>,
  createTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationCreateTaskArgs, 'input'>>,
  createTaskFromSuggestion?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationCreateTaskFromSuggestionArgs, 'input'>>,
  createWorkRequest?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationCreateWorkRequestArgs, 'input'>>,
  finalizeTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationFinalizeTaskArgs, 'input'>>,
  removeTaskPayout?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationRemoveTaskPayoutArgs, 'input'>>,
  sendWorkInvite?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSendWorkInviteArgs, 'input'>>,
  setTaskDomain?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSetTaskDomainArgs, 'input'>>,
  setTaskDescription?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSetTaskDescriptionArgs, 'input'>>,
  setTaskDueDate?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSetTaskDueDateArgs, 'input'>>,
  setTaskPayout?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSetTaskPayoutArgs, 'input'>>,
  setTaskSkill?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSetTaskSkillArgs, 'input'>>,
  removeTaskSkill?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationRemoveTaskSkillArgs, 'input'>>,
  setTaskTitle?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSetTaskTitleArgs, 'input'>>,
  unassignWorker?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationUnassignWorkerArgs, 'input'>>,
  createUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>,
  editUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationEditUserArgs, 'input'>>,
  subscribeToColony?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSubscribeToColonyArgs, 'input'>>,
  unsubscribeFromColony?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUnsubscribeFromColonyArgs, 'input'>>,
  setUserTokens?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSetUserTokensArgs, 'input'>>,
  createLevelTaskSubmission?: Resolver<Maybe<ResolversTypes['Submission']>, ParentType, ContextType, RequireFields<MutationCreateLevelTaskSubmissionArgs, 'input'>>,
  editSubmission?: Resolver<Maybe<ResolversTypes['Submission']>, ParentType, ContextType, RequireFields<MutationEditSubmissionArgs, 'input'>>,
  acceptSubmission?: Resolver<Maybe<ResolversTypes['Submission']>, ParentType, ContextType, RequireFields<MutationAcceptSubmissionArgs, 'input'>>,
  createLevelTask?: Resolver<Maybe<ResolversTypes['PersistentTask']>, ParentType, ContextType, RequireFields<MutationCreateLevelTaskArgs, 'input'>>,
  removeLevelTask?: Resolver<Maybe<ResolversTypes['PersistentTask']>, ParentType, ContextType, RequireFields<MutationRemoveLevelTaskArgs, 'input'>>,
  editPersistentTask?: Resolver<Maybe<ResolversTypes['PersistentTask']>, ParentType, ContextType, RequireFields<MutationEditPersistentTaskArgs, 'input'>>,
  setPersistentTaskPayout?: Resolver<Maybe<ResolversTypes['PersistentTask']>, ParentType, ContextType, RequireFields<MutationSetPersistentTaskPayoutArgs, 'input'>>,
  removePersistentTaskPayout?: Resolver<Maybe<ResolversTypes['PersistentTask']>, ParentType, ContextType, RequireFields<MutationRemovePersistentTaskPayoutArgs, 'input'>>,
  removePersistentTask?: Resolver<Maybe<ResolversTypes['PersistentTask']>, ParentType, ContextType, RequireFields<MutationRemovePersistentTaskArgs, 'input'>>,
  createLevel?: Resolver<Maybe<ResolversTypes['Level']>, ParentType, ContextType, RequireFields<MutationCreateLevelArgs, 'input'>>,
  editLevel?: Resolver<Maybe<ResolversTypes['Level']>, ParentType, ContextType, RequireFields<MutationEditLevelArgs, 'input'>>,
  reorderLevelSteps?: Resolver<Maybe<ResolversTypes['Level']>, ParentType, ContextType, RequireFields<MutationReorderLevelStepsArgs, 'input'>>,
  removeLevel?: Resolver<Maybe<ResolversTypes['Level']>, ParentType, ContextType, RequireFields<MutationRemoveLevelArgs, 'input'>>,
  createProgram?: Resolver<Maybe<ResolversTypes['Program']>, ParentType, ContextType, RequireFields<MutationCreateProgramArgs, 'input'>>,
  editProgram?: Resolver<Maybe<ResolversTypes['Program']>, ParentType, ContextType, RequireFields<MutationEditProgramArgs, 'input'>>,
  reorderProgramLevels?: Resolver<Maybe<ResolversTypes['Program']>, ParentType, ContextType, RequireFields<MutationReorderProgramLevelsArgs, 'input'>>,
  publishProgram?: Resolver<Maybe<ResolversTypes['Program']>, ParentType, ContextType, RequireFields<MutationPublishProgramArgs, 'input'>>,
  removeProgram?: Resolver<Maybe<ResolversTypes['Program']>, ParentType, ContextType, RequireFields<MutationRemoveProgramArgs, 'input'>>,
};

export type NewUserEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['NewUserEvent'] = ResolversParentTypes['NewUserEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type NotificationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  event?: Resolver<ResolversTypes['Event'], ParentType, ContextType>,
  read?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type PersistentTaskResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersistentTask'] = ResolversParentTypes['PersistentTask']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  creatorAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  ethDomainId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>,
  ethSkillId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>,
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  payouts?: Resolver<Array<ResolversTypes['TaskPayout']>, ParentType, ContextType>,
  submissions?: Resolver<Array<ResolversTypes['Submission']>, ParentType, ContextType>,
  status?: Resolver<ResolversTypes['PersistentTaskStatus'], ParentType, ContextType>,
};

export type ProgramResolvers<ContextType = any, ParentType extends ResolversParentTypes['Program'] = ResolversParentTypes['Program']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  creatorAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  levelIds?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  levels?: Resolver<Array<ResolversTypes['Level']>, ParentType, ContextType>,
  status?: Resolver<ResolversTypes['ProgramStatus'], ParentType, ContextType>,
  submissions?: Resolver<Array<ResolversTypes['Submission']>, ParentType, ContextType>,
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, 'address'>>,
  colony?: Resolver<ResolversTypes['Colony'], ParentType, ContextType, RequireFields<QueryColonyArgs, 'address'>>,
  domain?: Resolver<ResolversTypes['Domain'], ParentType, ContextType, RequireFields<QueryDomainArgs, 'colonyAddress' | 'ethDomainId'>>,
  task?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<QueryTaskArgs, 'id'>>,
  tokenInfo?: Resolver<ResolversTypes['TokenInfo'], ParentType, ContextType, RequireFields<QueryTokenInfoArgs, 'address'>>,
  systemInfo?: Resolver<ResolversTypes['SystemInfo'], ParentType, ContextType>,
};

export type RemoveTaskPayoutEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['RemoveTaskPayoutEvent'] = ResolversParentTypes['RemoveTaskPayoutEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  tokenAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  amount?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type RemoveTaskSkillEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['RemoveTaskSkillEvent'] = ResolversParentTypes['RemoveTaskSkillEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  ethSkillId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SendWorkInviteEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SendWorkInviteEvent'] = ResolversParentTypes['SendWorkInviteEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  workerAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskDescriptionEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskDescriptionEvent'] = ResolversParentTypes['SetTaskDescriptionEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskDomainEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskDomainEvent'] = ResolversParentTypes['SetTaskDomainEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  ethDomainId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskDueDateEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskDueDateEvent'] = ResolversParentTypes['SetTaskDueDateEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  dueDate?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskPayoutEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskPayoutEvent'] = ResolversParentTypes['SetTaskPayoutEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  tokenAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  amount?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskSkillEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskSkillEvent'] = ResolversParentTypes['SetTaskSkillEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  ethSkillId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskTitleEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskTitleEvent'] = ResolversParentTypes['SetTaskTitleEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SubmissionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Submission'] = ResolversParentTypes['Submission']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  creatorAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  creator?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
  persistentTaskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  submission?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  status?: Resolver<ResolversTypes['SubmissionStatus'], ParentType, ContextType>,
  statusChangedAt?: Resolver<Maybe<ResolversTypes['GraphQLDateTime']>, ParentType, ContextType>,
};

export type SuggestionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Suggestion'] = ResolversParentTypes['Suggestion']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  creatorAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  creator?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
  ethDomainId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  status?: Resolver<ResolversTypes['SuggestionStatus'], ParentType, ContextType>,
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  taskId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  upvotes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SystemInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['SystemInfo'] = ResolversParentTypes['SystemInfo']> = {
  version?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type TaskResolvers<ContextType = any, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  ethDomainId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  ethPotId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>,
  ethSkillId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>,
  cancelledAt?: Resolver<Maybe<ResolversTypes['GraphQLDateTime']>, ParentType, ContextType>,
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  dueDate?: Resolver<Maybe<ResolversTypes['GraphQLDateTime']>, ParentType, ContextType>,
  finalizedAt?: Resolver<Maybe<ResolversTypes['GraphQLDateTime']>, ParentType, ContextType>,
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  colony?: Resolver<ResolversTypes['Colony'], ParentType, ContextType>,
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  creator?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
  creatorAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  domain?: Resolver<ResolversTypes['Domain'], ParentType, ContextType>,
  assignedWorker?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>,
  assignedWorkerAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  workInvites?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>,
  workInviteAddresses?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  workRequests?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>,
  workRequestAddresses?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>,
  payouts?: Resolver<Array<ResolversTypes['TaskPayout']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type TaskEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskEvent'] = ResolversParentTypes['TaskEvent']> = {
  __resolveType: TypeResolveFn<'AssignWorkerEvent' | 'CancelTaskEvent' | 'CreateTaskEvent' | 'CreateWorkRequestEvent' | 'FinalizeTaskEvent' | 'RemoveTaskPayoutEvent' | 'SendWorkInviteEvent' | 'SetTaskDescriptionEvent' | 'SetTaskDomainEvent' | 'SetTaskDueDateEvent' | 'SetTaskPayoutEvent' | 'SetTaskSkillEvent' | 'RemoveTaskSkillEvent' | 'SetTaskTitleEvent' | 'TaskMessageEvent' | 'UnassignWorkerEvent', ParentType, ContextType>,
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
};

export type TaskMessageEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskMessageEvent'] = ResolversParentTypes['TaskMessageEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type TaskPayoutResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskPayout'] = ResolversParentTypes['TaskPayout']> = {
  amount?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  tokenAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type TokenInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['TokenInfo'] = ResolversParentTypes['TokenInfo']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  iconHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type UnassignWorkerEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['UnassignWorkerEvent'] = ResolversParentTypes['UnassignWorkerEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  workerAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  profile?: Resolver<ResolversTypes['UserProfile'], ParentType, ContextType>,
  colonies?: Resolver<Array<ResolversTypes['Colony']>, ParentType, ContextType>,
  colonyAddresses?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>,
  taskIds?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  tokenAddresses?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  notifications?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType, UserNotificationsArgs>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type UserProfileResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserProfile'] = ResolversParentTypes['UserProfile']> = {
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  avatarHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  walletAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type Resolvers<ContextType = any> = {
  AssignWorkerEvent?: AssignWorkerEventResolvers<ContextType>,
  CancelTaskEvent?: CancelTaskEventResolvers<ContextType>,
  Colony?: ColonyResolvers<ContextType>,
  ColonyEvent?: ColonyEventResolvers,
  CreateDomainEvent?: CreateDomainEventResolvers<ContextType>,
  CreateTaskEvent?: CreateTaskEventResolvers<ContextType>,
  CreateWorkRequestEvent?: CreateWorkRequestEventResolvers<ContextType>,
  Domain?: DomainResolvers<ContextType>,
  Event?: EventResolvers<ContextType>,
  EventContext?: EventContextResolvers,
  FinalizeTaskEvent?: FinalizeTaskEventResolvers<ContextType>,
  GraphQLDateTime?: GraphQLScalarType,
  Level?: LevelResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  NewUserEvent?: NewUserEventResolvers<ContextType>,
  Notification?: NotificationResolvers<ContextType>,
  PersistentTask?: PersistentTaskResolvers<ContextType>,
  Program?: ProgramResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  RemoveTaskPayoutEvent?: RemoveTaskPayoutEventResolvers<ContextType>,
  RemoveTaskSkillEvent?: RemoveTaskSkillEventResolvers<ContextType>,
  SendWorkInviteEvent?: SendWorkInviteEventResolvers<ContextType>,
  SetTaskDescriptionEvent?: SetTaskDescriptionEventResolvers<ContextType>,
  SetTaskDomainEvent?: SetTaskDomainEventResolvers<ContextType>,
  SetTaskDueDateEvent?: SetTaskDueDateEventResolvers<ContextType>,
  SetTaskPayoutEvent?: SetTaskPayoutEventResolvers<ContextType>,
  SetTaskSkillEvent?: SetTaskSkillEventResolvers<ContextType>,
  SetTaskTitleEvent?: SetTaskTitleEventResolvers<ContextType>,
  Submission?: SubmissionResolvers<ContextType>,
  Suggestion?: SuggestionResolvers<ContextType>,
  SystemInfo?: SystemInfoResolvers<ContextType>,
  Task?: TaskResolvers<ContextType>,
  TaskEvent?: TaskEventResolvers,
  TaskMessageEvent?: TaskMessageEventResolvers<ContextType>,
  TaskPayout?: TaskPayoutResolvers<ContextType>,
  TokenInfo?: TokenInfoResolvers<ContextType>,
  UnassignWorkerEvent?: UnassignWorkerEventResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
  UserProfile?: UserProfileResolvers<ContextType>,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;

