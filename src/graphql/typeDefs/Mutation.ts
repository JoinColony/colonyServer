import { gql } from 'apollo-server-express'

export default gql`
  input CreateUserInput {
    username: String!
  }

  input EditUserInput {
    avatarHash: String
    bio: String
    displayName: String
    location: String
    website: String
  }

  input CreateColonyInput {
    colonyAddress: String!
    colonyName: String!
    displayName: String!
    tokenAddress: String!
    tokenName: String!
    tokenSymbol: String!
    tokenDecimals: Int!
    tokenIconHash: String
  }

  input CreateTaskInput {
    colonyAddress: String!
    ethDomainId: Int!
  }

  input SetTaskDomainInput {
    id: String!
    ethDomainId: Int!
  }

  input SetTaskSkillInput {
    id: String!
    ethSkillId: Int!
  }

  input SetTaskTitleInput {
    id: String!
    title: String!
  }

  input SetTaskDescriptionInput {
    id: String!
    description: String!
  }

  input SetTaskDueDateInput {
    id: String!
    dueDate: GraphQLDateTime
  }

  input CreateWorkRequestInput {
    id: String!
  }

  input SendWorkInviteInput {
    id: String!
    workerAddress: String!
  }

  input SetTaskPayoutInput {
    id: String!
    amount: String!
    tokenAddress: String!
    ethDomainId: Int! # TODO is this necessary?
  }

  input RemoveTaskPayoutInput {
    id: String!
    amount: String!
    token: String!
    tokenAddress: String!
    ethDomainId: Int! # TODO is this necessary?
  }

  input AssignWorkerInput {
    id: String!
    workerAddress: String!
  }

  input UnassignWorkerInput {
    id: String!
    workerAddress: String!
  }

  input TaskIdInput {
    id: String!
  }

  input EditColonyProfileInput {
    colonyAddress: String!
    avatarHash: String
    description: String
    displayName: String
    guideline: String
    website: String
  }

  input SubscribeToColonyInput {
    colonyAddress: String!
  }

  input UnsubscribeFromColonyInput {
    colonyAddress: String!
  }

  input MarkNotificationAsReadInput {
    id: String!
  }

  input SendTaskMessageInput {
    id: String!
    message: String!
  }

  input CreateDomainInput {
    colonyAddress: String!
    ethDomainId: Int!
    ethParentDomainId: Int
    name: String!
  }

  input EditDomainNameInput {
    colonyAddress: String!
    ethDomainId: Int!
    name: String!
  }

  input CreateTokenInput {
    address: String!
    decimals: Int!
    name: String!
    symbol: String!
    iconHash: String
  }

  input AddColonyTokenReferenceInput {
    tokenAddress: String!
    colonyAddress: String!
    isExternal: Boolean!
    iconHash: String
  }

  input AddUserTokenReferenceInput {
    tokenAddress: String!
    iconHash: String
  }

  input SetColonyTokenAvatarInput {
    tokenAddress: String!
    colonyAddress: String!
    iconHash: String
  }

  input SetUserTokensInput {
    tokens: [String!]!
  }

  type Mutation {
    # Users
    createUser(input: CreateUserInput!): User # TODO find out why we can't use an exclamation mark here
    editUser(input: EditUserInput!): User
    subscribeToColony(input: SubscribeToColonyInput!): User
    unsubscribeFromColony(input: UnsubscribeFromColonyInput!): User
    setUserTokens(input: SetUserTokensInput!): User
    # Colonies
    createColony(input: CreateColonyInput!): Colony
    editColonyProfile(input: EditColonyProfileInput!): Colony
    # Domains
    createDomain(input: CreateDomainInput!): Domain
    editDomainName(input: EditDomainNameInput!): Domain
    # Tasks
    assignWorker(input: AssignWorkerInput!): Task
    cancelTask(input: TaskIdInput!): Task
    createTask(input: CreateTaskInput!): Task
    createWorkRequest(input: CreateWorkRequestInput!): Task
    finalizeTask(input: TaskIdInput!): Task
    removeTaskPayout(input: RemoveTaskPayoutInput!): Task
    sendWorkInvite(input: SendWorkInviteInput!): Task
    setTaskDomain(input: SetTaskDomainInput!): Task
    setTaskDescription(input: SetTaskDescriptionInput!): Task
    setTaskDueDate(input: SetTaskDueDateInput!): Task
    setTaskPayout(input: SetTaskPayoutInput!): Task
    setTaskSkill(input: SetTaskSkillInput!): Task
    setTaskTitle(input: SetTaskTitleInput!): Task
    unassignWorker(input: UnassignWorkerInput!): Task
    # Tokens
    createToken(input: CreateTokenInput!): Token
    addColonyTokenReference(input: AddColonyTokenReferenceInput!): Token
    setColonyTokenAvatar(input: SetColonyTokenAvatarInput!): Token
    # Notifications
    markAllNotificationsAsRead: Boolean!
    markNotificationAsRead(input: MarkNotificationAsReadInput!): Boolean!
    # Messages
    sendTaskMessage(input: SendTaskMessageInput!): Boolean!
  }
`
