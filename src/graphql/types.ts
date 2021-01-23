import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  GraphQLDateTime: any;
};

export type TaskEvent = {
  type: EventType;
  taskId: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type ColonyEvent = {
  type: EventType;
  colonyAddress?: Maybe<Scalars['String']>;
};

export type AssignWorkerEvent = TaskEvent & {
   __typename?: 'AssignWorkerEvent';
  type: EventType;
  taskId: Scalars['String'];
  workerAddress: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type UnassignWorkerEvent = TaskEvent & {
   __typename?: 'UnassignWorkerEvent';
  type: EventType;
  taskId: Scalars['String'];
  workerAddress: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type CancelTaskEvent = TaskEvent & {
   __typename?: 'CancelTaskEvent';
  type: EventType;
  taskId: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type CreateDomainEvent = ColonyEvent & {
   __typename?: 'CreateDomainEvent';
  type: EventType;
  ethDomainId: Scalars['Int'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type CreateTaskEvent = TaskEvent & {
   __typename?: 'CreateTaskEvent';
  type: EventType;
  taskId: Scalars['String'];
  ethDomainId: Scalars['Int'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type CreateWorkRequestEvent = TaskEvent & {
   __typename?: 'CreateWorkRequestEvent';
  type: EventType;
  taskId: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type FinalizeTaskEvent = TaskEvent & {
   __typename?: 'FinalizeTaskEvent';
  type: EventType;
  taskId: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type SetTaskPendingEvent = TaskEvent & {
   __typename?: 'SetTaskPendingEvent';
  type: EventType;
  taskId: Scalars['String'];
  txHash: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type RemoveTaskPayoutEvent = TaskEvent & {
   __typename?: 'RemoveTaskPayoutEvent';
  type: EventType;
  taskId: Scalars['String'];
  tokenAddress: Scalars['String'];
  amount: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type SendWorkInviteEvent = TaskEvent & {
   __typename?: 'SendWorkInviteEvent';
  type: EventType;
  taskId: Scalars['String'];
  workerAddress: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type SetTaskDescriptionEvent = TaskEvent & {
   __typename?: 'SetTaskDescriptionEvent';
  type: EventType;
  taskId: Scalars['String'];
  description: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type SetTaskDomainEvent = TaskEvent & {
   __typename?: 'SetTaskDomainEvent';
  type: EventType;
  taskId: Scalars['String'];
  ethDomainId: Scalars['Int'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type SetTaskDueDateEvent = TaskEvent & {
   __typename?: 'SetTaskDueDateEvent';
  type: EventType;
  taskId: Scalars['String'];
  dueDate?: Maybe<Scalars['GraphQLDateTime']>;
  colonyAddress?: Maybe<Scalars['String']>;
};

export type SetTaskPayoutEvent = TaskEvent & {
   __typename?: 'SetTaskPayoutEvent';
  type: EventType;
  taskId: Scalars['String'];
  tokenAddress: Scalars['String'];
  amount: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type SetTaskSkillEvent = TaskEvent & {
   __typename?: 'SetTaskSkillEvent';
  type: EventType;
  taskId: Scalars['String'];
  ethSkillId: Scalars['Int'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type RemoveTaskSkillEvent = TaskEvent & {
   __typename?: 'RemoveTaskSkillEvent';
  type: EventType;
  taskId: Scalars['String'];
  ethSkillId: Scalars['Int'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type SetTaskTitleEvent = TaskEvent & {
   __typename?: 'SetTaskTitleEvent';
  type: EventType;
  taskId: Scalars['String'];
  title: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type TaskMessageEvent = TaskEvent & {
   __typename?: 'TaskMessageEvent';
  type: EventType;
  taskId: Scalars['String'];
  message: Scalars['String'];
  colonyAddress?: Maybe<Scalars['String']>;
};

export type NewUserEvent = {
   __typename?: 'NewUserEvent';
  type: EventType;
};

export type TransactionMessageEvent = {
   __typename?: 'TransactionMessageEvent';
  type: EventType;
  transactionHash: Scalars['String'];
  message: Scalars['String'];
  colonyAddress: Scalars['String'];
};

export type EventContext = AssignWorkerEvent | CancelTaskEvent | CreateDomainEvent | CreateTaskEvent | CreateWorkRequestEvent | FinalizeTaskEvent | NewUserEvent | RemoveTaskPayoutEvent | SendWorkInviteEvent | SetTaskDescriptionEvent | SetTaskDomainEvent | SetTaskDueDateEvent | SetTaskPayoutEvent | SetTaskPendingEvent | SetTaskSkillEvent | RemoveTaskSkillEvent | SetTaskTitleEvent | TaskMessageEvent | UnassignWorkerEvent | TransactionMessageEvent;

export type Event = {
   __typename?: 'Event';
  id: Scalars['String'];
  type: EventType;
  createdAt: Scalars['GraphQLDateTime'];
  initiator?: Maybe<User>;
  initiatorAddress: Scalars['String'];
  sourceId: Scalars['String'];
  sourceType: Scalars['String'];
  context: EventContext;
};

export type Notification = {
   __typename?: 'Notification';
  id: Scalars['String'];
  event: Event;
  read: Scalars['Boolean'];
};

export enum LevelStatus {
  Active = 'Active',
  Deleted = 'Deleted'
}

export type CreateUserInput = {
  username: Scalars['String'];
};

export type EditUserInput = {
  avatarHash?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

export type CreateColonyInput = {
  colonyAddress: Scalars['String'];
  colonyName: Scalars['String'];
  displayName: Scalars['String'];
  tokenAddress: Scalars['String'];
  tokenName: Scalars['String'];
  tokenSymbol: Scalars['String'];
  tokenDecimals: Scalars['Int'];
  tokenIsExternal: Scalars['Boolean'];
  tokenIconHash?: Maybe<Scalars['String']>;
};

export type CreateTaskInput = {
  colonyAddress: Scalars['String'];
  ethDomainId: Scalars['Int'];
};

export type SetTaskDomainInput = {
  id: Scalars['String'];
  ethDomainId: Scalars['Int'];
};

export type SetTaskSkillInput = {
  id: Scalars['String'];
  ethSkillId: Scalars['Int'];
};

export type RemoveTaskSkillInput = {
  id: Scalars['String'];
  ethSkillId: Scalars['Int'];
};

export type SetTaskTitleInput = {
  id: Scalars['String'];
  title: Scalars['String'];
};

export type SetTaskDescriptionInput = {
  id: Scalars['String'];
  description: Scalars['String'];
};

export type SetTaskDueDateInput = {
  id: Scalars['String'];
  dueDate?: Maybe<Scalars['GraphQLDateTime']>;
};

export type CreateWorkRequestInput = {
  id: Scalars['String'];
};

export type SendWorkInviteInput = {
  id: Scalars['String'];
  workerAddress: Scalars['String'];
};

export type SetTaskPayoutInput = {
  id: Scalars['String'];
  amount: Scalars['String'];
  tokenAddress: Scalars['String'];
};

export type RemoveTaskPayoutInput = {
  id: Scalars['String'];
  amount: Scalars['String'];
  tokenAddress: Scalars['String'];
};

export type AssignWorkerInput = {
  id: Scalars['String'];
  workerAddress: Scalars['String'];
};

export type UnassignWorkerInput = {
  id: Scalars['String'];
  workerAddress: Scalars['String'];
};

export type TaskIdInput = {
  id: Scalars['String'];
};

export type SetTaskPendingInput = {
  id: Scalars['String'];
  txHash: Scalars['String'];
};

export type FinalizeTaskInput = {
  id: Scalars['String'];
  ethPotId: Scalars['Int'];
};

export type EditColonyProfileInput = {
  colonyAddress: Scalars['String'];
  avatarHash?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  guideline?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

export type SubscribeToColonyInput = {
  colonyAddress: Scalars['String'];
};

export type UnsubscribeFromColonyInput = {
  colonyAddress: Scalars['String'];
};

export type MarkNotificationAsReadInput = {
  id: Scalars['String'];
};

export type SendTaskMessageInput = {
  id: Scalars['String'];
  message: Scalars['String'];
};

export type EditDomainNameInput = {
  colonyAddress: Scalars['String'];
  ethDomainId: Scalars['Int'];
  name: Scalars['String'];
};

export type SetColonyTokensInput = {
  tokenAddresses: Array<Maybe<Scalars['String']>>;
  colonyAddress: Scalars['String'];
};

export type SetUserTokensInput = {
  tokenAddresses: Array<Scalars['String']>;
};

export type CreateSuggestionInput = {
  colonyAddress: Scalars['String'];
  ethDomainId: Scalars['Int'];
  title: Scalars['String'];
};

export type SetSuggestionStatusInput = {
  id: Scalars['String'];
  status: SuggestionStatus;
};

export type AddUpvoteToSuggestionInput = {
  id: Scalars['String'];
};

export type RemoveUpvoteFromSuggestionInput = {
  id: Scalars['String'];
};

export type CreateTaskFromSuggestionInput = {
  id: Scalars['String'];
};

export type Payout = {
  amount: Scalars['String'];
  tokenAddress: Scalars['String'];
};

export type SendTransactionMessageInput = {
  transactionHash: Scalars['String'];
  message: Scalars['String'];
  colonyAddress: Scalars['String'];
};

export type Mutation = {
   __typename?: 'Mutation';
  sendTaskMessage: Scalars['Boolean'];
  sendTransactionMessage: Scalars['Boolean'];
  markAllNotificationsAsRead: Scalars['Boolean'];
  markNotificationAsRead: Scalars['Boolean'];
  createSuggestion?: Maybe<Suggestion>;
  setSuggestionStatus?: Maybe<Suggestion>;
  addUpvoteToSuggestion?: Maybe<Suggestion>;
  removeUpvoteFromSuggestion?: Maybe<Suggestion>;
  assignWorker?: Maybe<Task>;
  cancelTask?: Maybe<Task>;
  createTask?: Maybe<Task>;
  createTaskFromSuggestion?: Maybe<Task>;
  createWorkRequest?: Maybe<Task>;
  finalizeTask?: Maybe<Task>;
  removeTaskPayout?: Maybe<Task>;
  sendWorkInvite?: Maybe<Task>;
  setTaskDomain?: Maybe<Task>;
  setTaskDescription?: Maybe<Task>;
  setTaskDueDate?: Maybe<Task>;
  setTaskPayout?: Maybe<Task>;
  setTaskPending?: Maybe<Task>;
  setTaskSkill?: Maybe<Task>;
  removeTaskSkill?: Maybe<Task>;
  setTaskTitle?: Maybe<Task>;
  unassignWorker?: Maybe<Task>;
  createUser?: Maybe<User>;
  editUser?: Maybe<User>;
  subscribeToColony?: Maybe<User>;
  unsubscribeFromColony?: Maybe<User>;
  setUserTokens?: Maybe<User>;
};


export type MutationSendTaskMessageArgs = {
  input: SendTaskMessageInput;
};


export type MutationSendTransactionMessageArgs = {
  input: SendTransactionMessageInput;
};


export type MutationMarkNotificationAsReadArgs = {
  input: MarkNotificationAsReadInput;
};


export type MutationCreateSuggestionArgs = {
  input: CreateSuggestionInput;
};


export type MutationSetSuggestionStatusArgs = {
  input: SetSuggestionStatusInput;
};


export type MutationAddUpvoteToSuggestionArgs = {
  input: AddUpvoteToSuggestionInput;
};


export type MutationRemoveUpvoteFromSuggestionArgs = {
  input: RemoveUpvoteFromSuggestionInput;
};


export type MutationAssignWorkerArgs = {
  input: AssignWorkerInput;
};


export type MutationCancelTaskArgs = {
  input: TaskIdInput;
};


export type MutationCreateTaskArgs = {
  input: CreateTaskInput;
};


export type MutationCreateTaskFromSuggestionArgs = {
  input: CreateTaskFromSuggestionInput;
};


export type MutationCreateWorkRequestArgs = {
  input: CreateWorkRequestInput;
};


export type MutationFinalizeTaskArgs = {
  input: FinalizeTaskInput;
};


export type MutationRemoveTaskPayoutArgs = {
  input: RemoveTaskPayoutInput;
};


export type MutationSendWorkInviteArgs = {
  input: SendWorkInviteInput;
};


export type MutationSetTaskDomainArgs = {
  input: SetTaskDomainInput;
};


export type MutationSetTaskDescriptionArgs = {
  input: SetTaskDescriptionInput;
};


export type MutationSetTaskDueDateArgs = {
  input: SetTaskDueDateInput;
};


export type MutationSetTaskPayoutArgs = {
  input: SetTaskPayoutInput;
};


export type MutationSetTaskPendingArgs = {
  input: SetTaskPendingInput;
};


export type MutationSetTaskSkillArgs = {
  input: SetTaskSkillInput;
};


export type MutationRemoveTaskSkillArgs = {
  input: RemoveTaskSkillInput;
};


export type MutationSetTaskTitleArgs = {
  input: SetTaskTitleInput;
};


export type MutationUnassignWorkerArgs = {
  input: UnassignWorkerInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationEditUserArgs = {
  input: EditUserInput;
};


export type MutationSubscribeToColonyArgs = {
  input: SubscribeToColonyInput;
};


export type MutationUnsubscribeFromColonyArgs = {
  input: UnsubscribeFromColonyInput;
};


export type MutationSetUserTokensArgs = {
  input: SetUserTokensInput;
};

export enum PersistentTaskStatus {
  Active = 'Active',
  Closed = 'Closed',
  Deleted = 'Deleted'
}

export enum ProgramStatus {
  Draft = 'Draft',
  Active = 'Active',
  Deleted = 'Deleted'
}

export type Query = {
   __typename?: 'Query';
  user: User;
  subscribedUsers: Array<User>;
  task: Task;
  tokenInfo: TokenInfo;
  systemInfo: SystemInfo;
  transactionMessages: TransactionMessages;
  transactionMessagesCount: TransactionMessagesCount;
};


export type QueryUserArgs = {
  address: Scalars['String'];
};


export type QuerySubscribedUsersArgs = {
  colonyAddress: Scalars['String'];
};


export type QueryTaskArgs = {
  id: Scalars['String'];
};


export type QueryTokenInfoArgs = {
  address: Scalars['String'];
};


export type QueryTransactionMessagesArgs = {
  transactionHash: Scalars['String'];
};


export type QueryTransactionMessagesCountArgs = {
  colonyAddress: Scalars['String'];
};

export enum SuggestionStatus {
  Open = 'Open',
  NotPlanned = 'NotPlanned',
  Accepted = 'Accepted',
  Deleted = 'Deleted'
}

export type Suggestion = {
   __typename?: 'Suggestion';
  id: Scalars['String'];
  createdAt: Scalars['GraphQLDateTime'];
  colonyAddress: Scalars['String'];
  creatorAddress: Scalars['String'];
  creator: User;
  ethDomainId: Scalars['Int'];
  status: SuggestionStatus;
  title: Scalars['String'];
  taskId?: Maybe<Scalars['String']>;
  upvotes: Array<Scalars['String']>;
};

export type SystemInfo = {
   __typename?: 'SystemInfo';
  version: Scalars['String'];
};

export type TaskPayout = {
   __typename?: 'TaskPayout';
  amount: Scalars['String'];
  tokenAddress: Scalars['String'];
};

export type Task = {
   __typename?: 'Task';
  id: Scalars['String'];
  createdAt: Scalars['GraphQLDateTime'];
  ethDomainId: Scalars['Int'];
  ethPotId?: Maybe<Scalars['Int']>;
  ethSkillId?: Maybe<Scalars['Int']>;
  cancelledAt?: Maybe<Scalars['GraphQLDateTime']>;
  description?: Maybe<Scalars['String']>;
  dueDate?: Maybe<Scalars['GraphQLDateTime']>;
  finalizedAt?: Maybe<Scalars['GraphQLDateTime']>;
  title?: Maybe<Scalars['String']>;
  colonyAddress: Scalars['String'];
  creator: User;
  creatorAddress: Scalars['String'];
  assignedWorker?: Maybe<User>;
  assignedWorkerAddress?: Maybe<Scalars['String']>;
  workInvites: Array<User>;
  workInviteAddresses: Array<Scalars['String']>;
  workRequests: Array<User>;
  workRequestAddresses: Array<Scalars['String']>;
  events: Array<Event>;
  payouts: Array<TaskPayout>;
  txHash?: Maybe<Scalars['String']>;
};

export type TokenInfo = {
   __typename?: 'TokenInfo';
  id: Scalars['String'];
  address: Scalars['String'];
  iconHash?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  decimals: Scalars['Int'];
  symbol: Scalars['String'];
  verified: Scalars['Boolean'];
};

export type TransactionMessages = {
   __typename?: 'TransactionMessages';
  transactionHash: Scalars['String'];
  messages: Array<Event>;
};

export type TransactionCount = {
   __typename?: 'TransactionCount';
  transactionHash: Scalars['String'];
  count: Scalars['Int'];
};

export type TransactionMessagesCount = {
   __typename?: 'TransactionMessagesCount';
  colonyTransactionMessages: Array<TransactionCount>;
};

export type User = {
   __typename?: 'User';
  id: Scalars['String'];
  createdAt: Scalars['GraphQLDateTime'];
  profile: UserProfile;
  colonyAddresses: Array<Scalars['String']>;
  tasks: Array<Task>;
  taskIds: Array<Scalars['String']>;
  tokenAddresses: Array<Scalars['String']>;
  notifications: Array<Notification>;
};


export type UserNotificationsArgs = {
  read?: Maybe<Scalars['Boolean']>;
};

export type UserProfile = {
   __typename?: 'UserProfile';
  username?: Maybe<Scalars['String']>;
  avatarHash?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  walletAddress: Scalars['String'];
  website?: Maybe<Scalars['String']>;
};


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
  SetTaskPending = 'SetTaskPending',
  SetTaskSkill = 'SetTaskSkill',
  RemoveTaskSkill = 'RemoveTaskSkill',
  SetTaskTitle = 'SetTaskTitle',
  TaskMessage = 'TaskMessage',
  UnassignWorker = 'UnassignWorker',
  TransactionMessage = 'TransactionMessage'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

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
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type isTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

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
  String: ResolverTypeWrapper<Scalars['String']>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  TaskEvent: ResolversTypes['AssignWorkerEvent'] | ResolversTypes['UnassignWorkerEvent'] | ResolversTypes['CancelTaskEvent'] | ResolversTypes['CreateTaskEvent'] | ResolversTypes['CreateWorkRequestEvent'] | ResolversTypes['FinalizeTaskEvent'] | ResolversTypes['SetTaskPendingEvent'] | ResolversTypes['RemoveTaskPayoutEvent'] | ResolversTypes['SendWorkInviteEvent'] | ResolversTypes['SetTaskDescriptionEvent'] | ResolversTypes['SetTaskDomainEvent'] | ResolversTypes['SetTaskDueDateEvent'] | ResolversTypes['SetTaskPayoutEvent'] | ResolversTypes['SetTaskSkillEvent'] | ResolversTypes['RemoveTaskSkillEvent'] | ResolversTypes['SetTaskTitleEvent'] | ResolversTypes['TaskMessageEvent'],
  ColonyEvent: ResolversTypes['CreateDomainEvent'],
  AssignWorkerEvent: ResolverTypeWrapper<AssignWorkerEvent>,
  UnassignWorkerEvent: ResolverTypeWrapper<UnassignWorkerEvent>,
  CancelTaskEvent: ResolverTypeWrapper<CancelTaskEvent>,
  CreateDomainEvent: ResolverTypeWrapper<CreateDomainEvent>,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  CreateTaskEvent: ResolverTypeWrapper<CreateTaskEvent>,
  CreateWorkRequestEvent: ResolverTypeWrapper<CreateWorkRequestEvent>,
  FinalizeTaskEvent: ResolverTypeWrapper<FinalizeTaskEvent>,
  SetTaskPendingEvent: ResolverTypeWrapper<SetTaskPendingEvent>,
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
  NewUserEvent: ResolverTypeWrapper<NewUserEvent>,
  TransactionMessageEvent: ResolverTypeWrapper<TransactionMessageEvent>,
  EventContext: ResolversTypes['AssignWorkerEvent'] | ResolversTypes['CancelTaskEvent'] | ResolversTypes['CreateDomainEvent'] | ResolversTypes['CreateTaskEvent'] | ResolversTypes['CreateWorkRequestEvent'] | ResolversTypes['FinalizeTaskEvent'] | ResolversTypes['NewUserEvent'] | ResolversTypes['RemoveTaskPayoutEvent'] | ResolversTypes['SendWorkInviteEvent'] | ResolversTypes['SetTaskDescriptionEvent'] | ResolversTypes['SetTaskDomainEvent'] | ResolversTypes['SetTaskDueDateEvent'] | ResolversTypes['SetTaskPayoutEvent'] | ResolversTypes['SetTaskPendingEvent'] | ResolversTypes['SetTaskSkillEvent'] | ResolversTypes['RemoveTaskSkillEvent'] | ResolversTypes['SetTaskTitleEvent'] | ResolversTypes['TaskMessageEvent'] | ResolversTypes['UnassignWorkerEvent'] | ResolversTypes['TransactionMessageEvent'],
  Event: ResolverTypeWrapper<Omit<Event, 'context'> & { context: ResolversTypes['EventContext'] }>,
  Notification: ResolverTypeWrapper<Notification>,
  LevelStatus: LevelStatus,
  CreateUserInput: CreateUserInput,
  EditUserInput: EditUserInput,
  CreateColonyInput: CreateColonyInput,
  CreateTaskInput: CreateTaskInput,
  SetTaskDomainInput: SetTaskDomainInput,
  SetTaskSkillInput: SetTaskSkillInput,
  RemoveTaskSkillInput: RemoveTaskSkillInput,
  SetTaskTitleInput: SetTaskTitleInput,
  SetTaskDescriptionInput: SetTaskDescriptionInput,
  SetTaskDueDateInput: SetTaskDueDateInput,
  CreateWorkRequestInput: CreateWorkRequestInput,
  SendWorkInviteInput: SendWorkInviteInput,
  SetTaskPayoutInput: SetTaskPayoutInput,
  RemoveTaskPayoutInput: RemoveTaskPayoutInput,
  AssignWorkerInput: AssignWorkerInput,
  UnassignWorkerInput: UnassignWorkerInput,
  TaskIdInput: TaskIdInput,
  SetTaskPendingInput: SetTaskPendingInput,
  FinalizeTaskInput: FinalizeTaskInput,
  EditColonyProfileInput: EditColonyProfileInput,
  SubscribeToColonyInput: SubscribeToColonyInput,
  UnsubscribeFromColonyInput: UnsubscribeFromColonyInput,
  MarkNotificationAsReadInput: MarkNotificationAsReadInput,
  SendTaskMessageInput: SendTaskMessageInput,
  EditDomainNameInput: EditDomainNameInput,
  SetColonyTokensInput: SetColonyTokensInput,
  SetUserTokensInput: SetUserTokensInput,
  CreateSuggestionInput: CreateSuggestionInput,
  SetSuggestionStatusInput: SetSuggestionStatusInput,
  AddUpvoteToSuggestionInput: AddUpvoteToSuggestionInput,
  RemoveUpvoteFromSuggestionInput: RemoveUpvoteFromSuggestionInput,
  CreateTaskFromSuggestionInput: CreateTaskFromSuggestionInput,
  Payout: Payout,
  SendTransactionMessageInput: SendTransactionMessageInput,
  Mutation: ResolverTypeWrapper<{}>,
  PersistentTaskStatus: PersistentTaskStatus,
  ProgramStatus: ProgramStatus,
  Query: ResolverTypeWrapper<{}>,
  SuggestionStatus: SuggestionStatus,
  Suggestion: ResolverTypeWrapper<Suggestion>,
  SystemInfo: ResolverTypeWrapper<SystemInfo>,
  TaskPayout: ResolverTypeWrapper<TaskPayout>,
  Task: ResolverTypeWrapper<Task>,
  TokenInfo: ResolverTypeWrapper<TokenInfo>,
  TransactionMessages: ResolverTypeWrapper<TransactionMessages>,
  TransactionCount: ResolverTypeWrapper<TransactionCount>,
  TransactionMessagesCount: ResolverTypeWrapper<TransactionMessagesCount>,
  User: ResolverTypeWrapper<User>,
  UserProfile: ResolverTypeWrapper<UserProfile>,
  GraphQLDateTime: ResolverTypeWrapper<Scalars['GraphQLDateTime']>,
  EventType: EventType,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  String: Scalars['String'],
  Boolean: Scalars['Boolean'],
  TaskEvent: ResolversParentTypes['AssignWorkerEvent'] | ResolversParentTypes['UnassignWorkerEvent'] | ResolversParentTypes['CancelTaskEvent'] | ResolversParentTypes['CreateTaskEvent'] | ResolversParentTypes['CreateWorkRequestEvent'] | ResolversParentTypes['FinalizeTaskEvent'] | ResolversParentTypes['SetTaskPendingEvent'] | ResolversParentTypes['RemoveTaskPayoutEvent'] | ResolversParentTypes['SendWorkInviteEvent'] | ResolversParentTypes['SetTaskDescriptionEvent'] | ResolversParentTypes['SetTaskDomainEvent'] | ResolversParentTypes['SetTaskDueDateEvent'] | ResolversParentTypes['SetTaskPayoutEvent'] | ResolversParentTypes['SetTaskSkillEvent'] | ResolversParentTypes['RemoveTaskSkillEvent'] | ResolversParentTypes['SetTaskTitleEvent'] | ResolversParentTypes['TaskMessageEvent'],
  ColonyEvent: ResolversParentTypes['CreateDomainEvent'],
  AssignWorkerEvent: AssignWorkerEvent,
  UnassignWorkerEvent: UnassignWorkerEvent,
  CancelTaskEvent: CancelTaskEvent,
  CreateDomainEvent: CreateDomainEvent,
  Int: Scalars['Int'],
  CreateTaskEvent: CreateTaskEvent,
  CreateWorkRequestEvent: CreateWorkRequestEvent,
  FinalizeTaskEvent: FinalizeTaskEvent,
  SetTaskPendingEvent: SetTaskPendingEvent,
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
  NewUserEvent: NewUserEvent,
  TransactionMessageEvent: TransactionMessageEvent,
  EventContext: ResolversParentTypes['AssignWorkerEvent'] | ResolversParentTypes['CancelTaskEvent'] | ResolversParentTypes['CreateDomainEvent'] | ResolversParentTypes['CreateTaskEvent'] | ResolversParentTypes['CreateWorkRequestEvent'] | ResolversParentTypes['FinalizeTaskEvent'] | ResolversParentTypes['NewUserEvent'] | ResolversParentTypes['RemoveTaskPayoutEvent'] | ResolversParentTypes['SendWorkInviteEvent'] | ResolversParentTypes['SetTaskDescriptionEvent'] | ResolversParentTypes['SetTaskDomainEvent'] | ResolversParentTypes['SetTaskDueDateEvent'] | ResolversParentTypes['SetTaskPayoutEvent'] | ResolversParentTypes['SetTaskPendingEvent'] | ResolversParentTypes['SetTaskSkillEvent'] | ResolversParentTypes['RemoveTaskSkillEvent'] | ResolversParentTypes['SetTaskTitleEvent'] | ResolversParentTypes['TaskMessageEvent'] | ResolversParentTypes['UnassignWorkerEvent'] | ResolversParentTypes['TransactionMessageEvent'],
  Event: Omit<Event, 'context'> & { context: ResolversParentTypes['EventContext'] },
  Notification: Notification,
  LevelStatus: LevelStatus,
  CreateUserInput: CreateUserInput,
  EditUserInput: EditUserInput,
  CreateColonyInput: CreateColonyInput,
  CreateTaskInput: CreateTaskInput,
  SetTaskDomainInput: SetTaskDomainInput,
  SetTaskSkillInput: SetTaskSkillInput,
  RemoveTaskSkillInput: RemoveTaskSkillInput,
  SetTaskTitleInput: SetTaskTitleInput,
  SetTaskDescriptionInput: SetTaskDescriptionInput,
  SetTaskDueDateInput: SetTaskDueDateInput,
  CreateWorkRequestInput: CreateWorkRequestInput,
  SendWorkInviteInput: SendWorkInviteInput,
  SetTaskPayoutInput: SetTaskPayoutInput,
  RemoveTaskPayoutInput: RemoveTaskPayoutInput,
  AssignWorkerInput: AssignWorkerInput,
  UnassignWorkerInput: UnassignWorkerInput,
  TaskIdInput: TaskIdInput,
  SetTaskPendingInput: SetTaskPendingInput,
  FinalizeTaskInput: FinalizeTaskInput,
  EditColonyProfileInput: EditColonyProfileInput,
  SubscribeToColonyInput: SubscribeToColonyInput,
  UnsubscribeFromColonyInput: UnsubscribeFromColonyInput,
  MarkNotificationAsReadInput: MarkNotificationAsReadInput,
  SendTaskMessageInput: SendTaskMessageInput,
  EditDomainNameInput: EditDomainNameInput,
  SetColonyTokensInput: SetColonyTokensInput,
  SetUserTokensInput: SetUserTokensInput,
  CreateSuggestionInput: CreateSuggestionInput,
  SetSuggestionStatusInput: SetSuggestionStatusInput,
  AddUpvoteToSuggestionInput: AddUpvoteToSuggestionInput,
  RemoveUpvoteFromSuggestionInput: RemoveUpvoteFromSuggestionInput,
  CreateTaskFromSuggestionInput: CreateTaskFromSuggestionInput,
  Payout: Payout,
  SendTransactionMessageInput: SendTransactionMessageInput,
  Mutation: {},
  PersistentTaskStatus: PersistentTaskStatus,
  ProgramStatus: ProgramStatus,
  Query: {},
  SuggestionStatus: SuggestionStatus,
  Suggestion: Suggestion,
  SystemInfo: SystemInfo,
  TaskPayout: TaskPayout,
  Task: Task,
  TokenInfo: TokenInfo,
  TransactionMessages: TransactionMessages,
  TransactionCount: TransactionCount,
  TransactionMessagesCount: TransactionMessagesCount,
  User: User,
  UserProfile: UserProfile,
  GraphQLDateTime: Scalars['GraphQLDateTime'],
  EventType: EventType,
};

export type TaskEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskEvent'] = ResolversParentTypes['TaskEvent']> = {
  __resolveType: TypeResolveFn<'AssignWorkerEvent' | 'UnassignWorkerEvent' | 'CancelTaskEvent' | 'CreateTaskEvent' | 'CreateWorkRequestEvent' | 'FinalizeTaskEvent' | 'SetTaskPendingEvent' | 'RemoveTaskPayoutEvent' | 'SendWorkInviteEvent' | 'SetTaskDescriptionEvent' | 'SetTaskDomainEvent' | 'SetTaskDueDateEvent' | 'SetTaskPayoutEvent' | 'SetTaskSkillEvent' | 'RemoveTaskSkillEvent' | 'SetTaskTitleEvent' | 'TaskMessageEvent', ParentType, ContextType>,
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
};

export type ColonyEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['ColonyEvent'] = ResolversParentTypes['ColonyEvent']> = {
  __resolveType: TypeResolveFn<'CreateDomainEvent', ParentType, ContextType>,
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
};

export type AssignWorkerEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['AssignWorkerEvent'] = ResolversParentTypes['AssignWorkerEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  workerAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type UnassignWorkerEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['UnassignWorkerEvent'] = ResolversParentTypes['UnassignWorkerEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  workerAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type CancelTaskEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CancelTaskEvent'] = ResolversParentTypes['CancelTaskEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type CreateDomainEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateDomainEvent'] = ResolversParentTypes['CreateDomainEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  ethDomainId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type CreateTaskEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateTaskEvent'] = ResolversParentTypes['CreateTaskEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  ethDomainId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type CreateWorkRequestEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateWorkRequestEvent'] = ResolversParentTypes['CreateWorkRequestEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type FinalizeTaskEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['FinalizeTaskEvent'] = ResolversParentTypes['FinalizeTaskEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskPendingEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskPendingEvent'] = ResolversParentTypes['SetTaskPendingEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  txHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type RemoveTaskPayoutEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['RemoveTaskPayoutEvent'] = ResolversParentTypes['RemoveTaskPayoutEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  tokenAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  amount?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SendWorkInviteEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SendWorkInviteEvent'] = ResolversParentTypes['SendWorkInviteEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  workerAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskDescriptionEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskDescriptionEvent'] = ResolversParentTypes['SetTaskDescriptionEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskDomainEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskDomainEvent'] = ResolversParentTypes['SetTaskDomainEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  ethDomainId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskDueDateEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskDueDateEvent'] = ResolversParentTypes['SetTaskDueDateEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  dueDate?: Resolver<Maybe<ResolversTypes['GraphQLDateTime']>, ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskPayoutEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskPayoutEvent'] = ResolversParentTypes['SetTaskPayoutEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  tokenAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  amount?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskSkillEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskSkillEvent'] = ResolversParentTypes['SetTaskSkillEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  ethSkillId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type RemoveTaskSkillEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['RemoveTaskSkillEvent'] = ResolversParentTypes['RemoveTaskSkillEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  ethSkillId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type SetTaskTitleEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['SetTaskTitleEvent'] = ResolversParentTypes['SetTaskTitleEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type TaskMessageEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskMessageEvent'] = ResolversParentTypes['TaskMessageEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  taskId?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type NewUserEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['NewUserEvent'] = ResolversParentTypes['NewUserEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type TransactionMessageEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['TransactionMessageEvent'] = ResolversParentTypes['TransactionMessageEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  transactionHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type EventContextResolvers<ContextType = any, ParentType extends ResolversParentTypes['EventContext'] = ResolversParentTypes['EventContext']> = {
  __resolveType: TypeResolveFn<'AssignWorkerEvent' | 'CancelTaskEvent' | 'CreateDomainEvent' | 'CreateTaskEvent' | 'CreateWorkRequestEvent' | 'FinalizeTaskEvent' | 'NewUserEvent' | 'RemoveTaskPayoutEvent' | 'SendWorkInviteEvent' | 'SetTaskDescriptionEvent' | 'SetTaskDomainEvent' | 'SetTaskDueDateEvent' | 'SetTaskPayoutEvent' | 'SetTaskPendingEvent' | 'SetTaskSkillEvent' | 'RemoveTaskSkillEvent' | 'SetTaskTitleEvent' | 'TaskMessageEvent' | 'UnassignWorkerEvent' | 'TransactionMessageEvent', ParentType, ContextType>
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

export type NotificationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  event?: Resolver<ResolversTypes['Event'], ParentType, ContextType>,
  read?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  sendTaskMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSendTaskMessageArgs, 'input'>>,
  sendTransactionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSendTransactionMessageArgs, 'input'>>,
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
  setTaskPending?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSetTaskPendingArgs, 'input'>>,
  setTaskSkill?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSetTaskSkillArgs, 'input'>>,
  removeTaskSkill?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationRemoveTaskSkillArgs, 'input'>>,
  setTaskTitle?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationSetTaskTitleArgs, 'input'>>,
  unassignWorker?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationUnassignWorkerArgs, 'input'>>,
  createUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>,
  editUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationEditUserArgs, 'input'>>,
  subscribeToColony?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSubscribeToColonyArgs, 'input'>>,
  unsubscribeFromColony?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUnsubscribeFromColonyArgs, 'input'>>,
  setUserTokens?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSetUserTokensArgs, 'input'>>,
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, 'address'>>,
  subscribedUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QuerySubscribedUsersArgs, 'colonyAddress'>>,
  task?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<QueryTaskArgs, 'id'>>,
  tokenInfo?: Resolver<ResolversTypes['TokenInfo'], ParentType, ContextType, RequireFields<QueryTokenInfoArgs, 'address'>>,
  systemInfo?: Resolver<ResolversTypes['SystemInfo'], ParentType, ContextType>,
  transactionMessages?: Resolver<ResolversTypes['TransactionMessages'], ParentType, ContextType, RequireFields<QueryTransactionMessagesArgs, 'transactionHash'>>,
  transactionMessagesCount?: Resolver<ResolversTypes['TransactionMessagesCount'], ParentType, ContextType, RequireFields<QueryTransactionMessagesCountArgs, 'colonyAddress'>>,
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

export type TaskPayoutResolvers<ContextType = any, ParentType extends ResolversParentTypes['TaskPayout'] = ResolversParentTypes['TaskPayout']> = {
  amount?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  tokenAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
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
  colonyAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  creator?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
  creatorAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  assignedWorker?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>,
  assignedWorkerAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  workInvites?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>,
  workInviteAddresses?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  workRequests?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>,
  workRequestAddresses?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>,
  payouts?: Resolver<Array<ResolversTypes['TaskPayout']>, ParentType, ContextType>,
  txHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
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

export type TransactionMessagesResolvers<ContextType = any, ParentType extends ResolversParentTypes['TransactionMessages'] = ResolversParentTypes['TransactionMessages']> = {
  transactionHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  messages?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type TransactionCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['TransactionCount'] = ResolversParentTypes['TransactionCount']> = {
  transactionHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type TransactionMessagesCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['TransactionMessagesCount'] = ResolversParentTypes['TransactionMessagesCount']> = {
  colonyTransactionMessages?: Resolver<Array<ResolversTypes['TransactionCount']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['GraphQLDateTime'], ParentType, ContextType>,
  profile?: Resolver<ResolversTypes['UserProfile'], ParentType, ContextType>,
  colonyAddresses?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>,
  taskIds?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  tokenAddresses?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>,
  notifications?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType, RequireFields<UserNotificationsArgs, never>>,
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

export interface GraphQlDateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['GraphQLDateTime'], any> {
  name: 'GraphQLDateTime'
}

export type Resolvers<ContextType = any> = {
  TaskEvent?: TaskEventResolvers,
  ColonyEvent?: ColonyEventResolvers,
  AssignWorkerEvent?: AssignWorkerEventResolvers<ContextType>,
  UnassignWorkerEvent?: UnassignWorkerEventResolvers<ContextType>,
  CancelTaskEvent?: CancelTaskEventResolvers<ContextType>,
  CreateDomainEvent?: CreateDomainEventResolvers<ContextType>,
  CreateTaskEvent?: CreateTaskEventResolvers<ContextType>,
  CreateWorkRequestEvent?: CreateWorkRequestEventResolvers<ContextType>,
  FinalizeTaskEvent?: FinalizeTaskEventResolvers<ContextType>,
  SetTaskPendingEvent?: SetTaskPendingEventResolvers<ContextType>,
  RemoveTaskPayoutEvent?: RemoveTaskPayoutEventResolvers<ContextType>,
  SendWorkInviteEvent?: SendWorkInviteEventResolvers<ContextType>,
  SetTaskDescriptionEvent?: SetTaskDescriptionEventResolvers<ContextType>,
  SetTaskDomainEvent?: SetTaskDomainEventResolvers<ContextType>,
  SetTaskDueDateEvent?: SetTaskDueDateEventResolvers<ContextType>,
  SetTaskPayoutEvent?: SetTaskPayoutEventResolvers<ContextType>,
  SetTaskSkillEvent?: SetTaskSkillEventResolvers<ContextType>,
  RemoveTaskSkillEvent?: RemoveTaskSkillEventResolvers<ContextType>,
  SetTaskTitleEvent?: SetTaskTitleEventResolvers<ContextType>,
  TaskMessageEvent?: TaskMessageEventResolvers<ContextType>,
  NewUserEvent?: NewUserEventResolvers<ContextType>,
  TransactionMessageEvent?: TransactionMessageEventResolvers<ContextType>,
  EventContext?: EventContextResolvers,
  Event?: EventResolvers<ContextType>,
  Notification?: NotificationResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  Suggestion?: SuggestionResolvers<ContextType>,
  SystemInfo?: SystemInfoResolvers<ContextType>,
  TaskPayout?: TaskPayoutResolvers<ContextType>,
  Task?: TaskResolvers<ContextType>,
  TokenInfo?: TokenInfoResolvers<ContextType>,
  TransactionMessages?: TransactionMessagesResolvers<ContextType>,
  TransactionCount?: TransactionCountResolvers<ContextType>,
  TransactionMessagesCount?: TransactionMessagesCountResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
  UserProfile?: UserProfileResolvers<ContextType>,
  GraphQLDateTime?: GraphQLScalarType,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;

