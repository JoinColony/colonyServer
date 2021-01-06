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
    tokenIsExternal: Boolean!
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

  input RemoveTaskSkillInput {
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
  }

  input RemoveTaskPayoutInput {
    id: String!
    amount: String!
    tokenAddress: String!
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

  input SetTaskPendingInput {
    id: String!
    txHash: String!
  }

  input FinalizeTaskInput {
    id: String!
    ethPotId: Int!
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

  input SetColonyTokensInput {
    tokenAddresses: [String]!
    colonyAddress: String!
  }

  input SetUserTokensInput {
    tokenAddresses: [String!]!
  }

  input CreateSuggestionInput {
    colonyAddress: String!
    ethDomainId: Int!
    title: String!
  }

  input SetSuggestionStatusInput {
    id: String!
    status: SuggestionStatus!
  }

  input AddUpvoteToSuggestionInput {
    id: String!
  }

  input RemoveUpvoteFromSuggestionInput {
    id: String!
  }

  input CreateTaskFromSuggestionInput {
    id: String!
  }

  input EditSubmissionInput {
    id: String!
    submission: String!
  }

  input Payout {
    amount: String!
    tokenAddress: String!
  }

  input SendTransactionMessageInput {
    transactionHash: String!
    message: String!
    colonyAddress: String!
  }

  type Mutation {
    # Colonies
    createColony(input: CreateColonyInput!): Colony
    editColonyProfile(input: EditColonyProfileInput!): Colony
    setColonyTokens(input: SetColonyTokensInput!): Colony
    # Domains
    createDomain(input: CreateDomainInput!): Domain
    editDomainName(input: EditDomainNameInput!): Domain
    # Messages
    sendTaskMessage(input: SendTaskMessageInput!): Boolean!
    sendTransactionMessage(input: SendTransactionMessageInput!): Boolean!
    # Notifications
    markAllNotificationsAsRead: Boolean!
    markNotificationAsRead(input: MarkNotificationAsReadInput!): Boolean!
    # Suggestions
    createSuggestion(input: CreateSuggestionInput!): Suggestion
    setSuggestionStatus(input: SetSuggestionStatusInput!): Suggestion
    addUpvoteToSuggestion(input: AddUpvoteToSuggestionInput!): Suggestion
    removeUpvoteFromSuggestion(
      input: RemoveUpvoteFromSuggestionInput!
    ): Suggestion
    # Tasks
    assignWorker(input: AssignWorkerInput!): Task
    cancelTask(input: TaskIdInput!): Task
    createTask(input: CreateTaskInput!): Task
    createTaskFromSuggestion(input: CreateTaskFromSuggestionInput!): Task
    createWorkRequest(input: CreateWorkRequestInput!): Task
    finalizeTask(input: FinalizeTaskInput!): Task
    removeTaskPayout(input: RemoveTaskPayoutInput!): Task
    sendWorkInvite(input: SendWorkInviteInput!): Task
    setTaskDomain(input: SetTaskDomainInput!): Task
    setTaskDescription(input: SetTaskDescriptionInput!): Task
    setTaskDueDate(input: SetTaskDueDateInput!): Task
    setTaskPayout(input: SetTaskPayoutInput!): Task
    setTaskPending(input: SetTaskPendingInput!): Task
    setTaskSkill(input: SetTaskSkillInput!): Task
    removeTaskSkill(input: RemoveTaskSkillInput!): Task
    setTaskTitle(input: SetTaskTitleInput!): Task
    unassignWorker(input: UnassignWorkerInput!): Task
    # Users
    createUser(input: CreateUserInput!): User # TODO find out why we can't use an exclamation mark here
    editUser(input: EditUserInput!): User
    subscribeToColony(input: SubscribeToColonyInput!): User
    unsubscribeFromColony(input: UnsubscribeFromColonyInput!): User
    setUserTokens(input: SetUserTokensInput!): User
    editSubmission(input: EditSubmissionInput!): Submission
  }
`
