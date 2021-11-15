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

export type BannedUser = {
   __typename?: 'BannedUser';
  id: Scalars['String'];
  profile?: Maybe<UserProfile>;
  eventId?: Maybe<Scalars['String']>;
  event?: Maybe<Event>;
  banned: Scalars['Boolean'];
};

export type ColonyEvent = {
  type: EventType;
  colonyAddress?: Maybe<Scalars['String']>;
};

export type CreateDomainEvent = ColonyEvent & {
   __typename?: 'CreateDomainEvent';
  type: EventType;
  ethDomainId: Scalars['Int'];
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
  deleted?: Maybe<Scalars['Boolean']>;
  adminDelete?: Maybe<Scalars['Boolean']>;
  userBanned?: Maybe<Scalars['Boolean']>;
};

export type EventContext = CreateDomainEvent | NewUserEvent | TransactionMessageEvent;

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

export type SubscribeToColonyInput = {
  colonyAddress: Scalars['String'];
};

export type UnsubscribeFromColonyInput = {
  colonyAddress: Scalars['String'];
};

export type MarkNotificationAsReadInput = {
  id: Scalars['String'];
};

export type SetUserTokensInput = {
  tokenAddresses: Array<Scalars['String']>;
};

export type SendTransactionMessageInput = {
  transactionHash: Scalars['String'];
  message: Scalars['String'];
  colonyAddress: Scalars['String'];
};

export type DeleteTransactionMessageInput = {
  id: Scalars['String'];
  colonyAddress: Scalars['String'];
};

export type BanTransactionMessagesInput = {
  colonyAddress: Scalars['String'];
  userAddress: Scalars['String'];
  eventId?: Maybe<Scalars['String']>;
};

export type UnBanTransactionMessagesInput = {
  colonyAddress: Scalars['String'];
  userAddress: Scalars['String'];
};

export type Mutation = {
   __typename?: 'Mutation';
  sendTransactionMessage: Scalars['Boolean'];
  deleteTransactionMessage: Scalars['Boolean'];
  undeleteTransactionMessage: Scalars['Boolean'];
  banUserTransactionMessages: Scalars['Boolean'];
  unbanUserTransactionMessages: Scalars['Boolean'];
  markAllNotificationsAsRead: Scalars['Boolean'];
  markNotificationAsRead: Scalars['Boolean'];
  createUser?: Maybe<User>;
  editUser?: Maybe<User>;
  subscribeToColony?: Maybe<User>;
  unsubscribeFromColony?: Maybe<User>;
  setUserTokens?: Maybe<User>;
};


export type MutationSendTransactionMessageArgs = {
  input: SendTransactionMessageInput;
};


export type MutationDeleteTransactionMessageArgs = {
  input: DeleteTransactionMessageInput;
};


export type MutationUndeleteTransactionMessageArgs = {
  input: DeleteTransactionMessageInput;
};


export type MutationBanUserTransactionMessagesArgs = {
  input: BanTransactionMessagesInput;
};


export type MutationUnbanUserTransactionMessagesArgs = {
  input: UnBanTransactionMessagesInput;
};


export type MutationMarkNotificationAsReadArgs = {
  input: MarkNotificationAsReadInput;
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

export enum ProgramStatus {
  Draft = 'Draft',
  Active = 'Active',
  Deleted = 'Deleted'
}

export type Query = {
   __typename?: 'Query';
  user: User;
  subscribedUsers: Array<User>;
  tokenInfo: TokenInfo;
  systemInfo: SystemInfo;
  transactionMessages: TransactionMessages;
  transactionMessagesCount: TransactionMessagesCount;
  bannedUsers: Array<Maybe<BannedUser>>;
};


export type QueryUserArgs = {
  address: Scalars['String'];
};


export type QuerySubscribedUsersArgs = {
  colonyAddress: Scalars['String'];
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


export type QueryBannedUsersArgs = {
  colonyAddress: Scalars['String'];
};

export type Subscription = {
   __typename?: 'Subscription';
  transactionMessages: TransactionMessages;
  transactionMessagesCount: TransactionMessagesCount;
  subscribedUsers: Array<User>;
};


export type SubscriptionTransactionMessagesArgs = {
  transactionHash: Scalars['String'];
};


export type SubscriptionTransactionMessagesCountArgs = {
  colonyAddress: Scalars['String'];
};


export type SubscriptionSubscribedUsersArgs = {
  colonyAddress: Scalars['String'];
};

export type SystemInfo = {
   __typename?: 'SystemInfo';
  version: Scalars['String'];
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
  CreateDomain = 'CreateDomain',
  CreateWorkRequest = 'CreateWorkRequest',
  NewUser = 'NewUser',
  SendWorkInvite = 'SendWorkInvite',
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
  BannedUser: ResolverTypeWrapper<BannedUser>,
  ColonyEvent: ResolversTypes['CreateDomainEvent'],
  CreateDomainEvent: ResolverTypeWrapper<CreateDomainEvent>,
  Int: ResolverTypeWrapper<Scalars['Int']>,
  NewUserEvent: ResolverTypeWrapper<NewUserEvent>,
  TransactionMessageEvent: ResolverTypeWrapper<TransactionMessageEvent>,
  EventContext: ResolversTypes['CreateDomainEvent'] | ResolversTypes['NewUserEvent'] | ResolversTypes['TransactionMessageEvent'],
  Event: ResolverTypeWrapper<Omit<Event, 'context'> & { context: ResolversTypes['EventContext'] }>,
  Notification: ResolverTypeWrapper<Notification>,
  LevelStatus: LevelStatus,
  CreateUserInput: CreateUserInput,
  EditUserInput: EditUserInput,
  SubscribeToColonyInput: SubscribeToColonyInput,
  UnsubscribeFromColonyInput: UnsubscribeFromColonyInput,
  MarkNotificationAsReadInput: MarkNotificationAsReadInput,
  SetUserTokensInput: SetUserTokensInput,
  SendTransactionMessageInput: SendTransactionMessageInput,
  DeleteTransactionMessageInput: DeleteTransactionMessageInput,
  BanTransactionMessagesInput: BanTransactionMessagesInput,
  UnBanTransactionMessagesInput: UnBanTransactionMessagesInput,
  Mutation: ResolverTypeWrapper<{}>,
  ProgramStatus: ProgramStatus,
  Query: ResolverTypeWrapper<{}>,
  Subscription: ResolverTypeWrapper<{}>,
  SystemInfo: ResolverTypeWrapper<SystemInfo>,
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
  BannedUser: BannedUser,
  ColonyEvent: ResolversParentTypes['CreateDomainEvent'],
  CreateDomainEvent: CreateDomainEvent,
  Int: Scalars['Int'],
  NewUserEvent: NewUserEvent,
  TransactionMessageEvent: TransactionMessageEvent,
  EventContext: ResolversParentTypes['CreateDomainEvent'] | ResolversParentTypes['NewUserEvent'] | ResolversParentTypes['TransactionMessageEvent'],
  Event: Omit<Event, 'context'> & { context: ResolversParentTypes['EventContext'] },
  Notification: Notification,
  LevelStatus: LevelStatus,
  CreateUserInput: CreateUserInput,
  EditUserInput: EditUserInput,
  SubscribeToColonyInput: SubscribeToColonyInput,
  UnsubscribeFromColonyInput: UnsubscribeFromColonyInput,
  MarkNotificationAsReadInput: MarkNotificationAsReadInput,
  SetUserTokensInput: SetUserTokensInput,
  SendTransactionMessageInput: SendTransactionMessageInput,
  DeleteTransactionMessageInput: DeleteTransactionMessageInput,
  BanTransactionMessagesInput: BanTransactionMessagesInput,
  UnBanTransactionMessagesInput: UnBanTransactionMessagesInput,
  Mutation: {},
  ProgramStatus: ProgramStatus,
  Query: {},
  Subscription: {},
  SystemInfo: SystemInfo,
  TokenInfo: TokenInfo,
  TransactionMessages: TransactionMessages,
  TransactionCount: TransactionCount,
  TransactionMessagesCount: TransactionMessagesCount,
  User: User,
  UserProfile: UserProfile,
  GraphQLDateTime: Scalars['GraphQLDateTime'],
  EventType: EventType,
};

export type BannedUserResolvers<ContextType = any, ParentType extends ResolversParentTypes['BannedUser'] = ResolversParentTypes['BannedUser']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  profile?: Resolver<Maybe<ResolversTypes['UserProfile']>, ParentType, ContextType>,
  eventId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType>,
  banned?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type ColonyEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['ColonyEvent'] = ResolversParentTypes['ColonyEvent']> = {
  __resolveType: TypeResolveFn<'CreateDomainEvent', ParentType, ContextType>,
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  colonyAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
};

export type CreateDomainEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateDomainEvent'] = ResolversParentTypes['CreateDomainEvent']> = {
  type?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>,
  ethDomainId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>,
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
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>,
  adminDelete?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>,
  userBanned?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type EventContextResolvers<ContextType = any, ParentType extends ResolversParentTypes['EventContext'] = ResolversParentTypes['EventContext']> = {
  __resolveType: TypeResolveFn<'CreateDomainEvent' | 'NewUserEvent' | 'TransactionMessageEvent', ParentType, ContextType>
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
  sendTransactionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSendTransactionMessageArgs, 'input'>>,
  deleteTransactionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTransactionMessageArgs, 'input'>>,
  undeleteTransactionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUndeleteTransactionMessageArgs, 'input'>>,
  banUserTransactionMessages?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationBanUserTransactionMessagesArgs, 'input'>>,
  unbanUserTransactionMessages?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUnbanUserTransactionMessagesArgs, 'input'>>,
  markAllNotificationsAsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>,
  markNotificationAsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMarkNotificationAsReadArgs, 'input'>>,
  createUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>,
  editUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationEditUserArgs, 'input'>>,
  subscribeToColony?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSubscribeToColonyArgs, 'input'>>,
  unsubscribeFromColony?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUnsubscribeFromColonyArgs, 'input'>>,
  setUserTokens?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSetUserTokensArgs, 'input'>>,
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, 'address'>>,
  subscribedUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QuerySubscribedUsersArgs, 'colonyAddress'>>,
  tokenInfo?: Resolver<ResolversTypes['TokenInfo'], ParentType, ContextType, RequireFields<QueryTokenInfoArgs, 'address'>>,
  systemInfo?: Resolver<ResolversTypes['SystemInfo'], ParentType, ContextType>,
  transactionMessages?: Resolver<ResolversTypes['TransactionMessages'], ParentType, ContextType, RequireFields<QueryTransactionMessagesArgs, 'transactionHash'>>,
  transactionMessagesCount?: Resolver<ResolversTypes['TransactionMessagesCount'], ParentType, ContextType, RequireFields<QueryTransactionMessagesCountArgs, 'colonyAddress'>>,
  bannedUsers?: Resolver<Array<Maybe<ResolversTypes['BannedUser']>>, ParentType, ContextType, RequireFields<QueryBannedUsersArgs, 'colonyAddress'>>,
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  transactionMessages?: SubscriptionResolver<ResolversTypes['TransactionMessages'], "transactionMessages", ParentType, ContextType, RequireFields<SubscriptionTransactionMessagesArgs, 'transactionHash'>>,
  transactionMessagesCount?: SubscriptionResolver<ResolversTypes['TransactionMessagesCount'], "transactionMessagesCount", ParentType, ContextType, RequireFields<SubscriptionTransactionMessagesCountArgs, 'colonyAddress'>>,
  subscribedUsers?: SubscriptionResolver<Array<ResolversTypes['User']>, "subscribedUsers", ParentType, ContextType, RequireFields<SubscriptionSubscribedUsersArgs, 'colonyAddress'>>,
};

export type SystemInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['SystemInfo'] = ResolversParentTypes['SystemInfo']> = {
  version?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
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
  BannedUser?: BannedUserResolvers<ContextType>,
  ColonyEvent?: ColonyEventResolvers,
  CreateDomainEvent?: CreateDomainEventResolvers<ContextType>,
  NewUserEvent?: NewUserEventResolvers<ContextType>,
  TransactionMessageEvent?: TransactionMessageEventResolvers<ContextType>,
  EventContext?: EventContextResolvers,
  Event?: EventResolvers<ContextType>,
  Notification?: NotificationResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  Subscription?: SubscriptionResolvers<ContextType>,
  SystemInfo?: SystemInfoResolvers<ContextType>,
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

