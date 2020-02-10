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

  input CreateLevelTaskSubmissionInput {
    levelId: String!
    persistentTaskId: String!
    submission: String!
  }

  input EditSubmissionInput {
    id: String!
    submission: String!
  }

  input AcceptSubmissionInput {
    id: String!
  }

  input CreateLevelTaskInput {
    levelId: String!
  }

  input RemoveLevelTaskInput {
    id: String!
    levelId: String!
  }

  input EditPersistentTaskInput {
    id: String!
    ethDomainId: Int
    ethSkillId: Int
    title: String
    description: String
  }

  input RemovePersistentTaskInput {
    id: String!
  }

  input CreateLevelInput {
    programId: String!
  }

  input EditLevelInput {
    id: String!
    title: String
    description: String
    achievement: String
    numRequiredSteps: Int
  }

  input ReorderLevelStepsInput {
    id: String!
    stepIds: [String!]!
  }

  input RemoveLevelInput {
    id: String!
  }

  input CreateProgramInput {
    colonyAddress: String!
  }

  input EnrollInProgramInput {
    id: String!
  }

  input EditProgramInput {
    id: String!
    title: String
    description: String
  }

  input ReorderProgramLevelsInput {
    id: String!
    levelIds: [String!]!
  }

  input PublishProgramInput {
    id: String!
  }

  input RemoveProgramInput {
    id: String!
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
    # Submissions
    createLevelTaskSubmission(
      input: CreateLevelTaskSubmissionInput!
    ): Submission
    editSubmission(input: EditSubmissionInput!): Submission
    acceptSubmission(input: AcceptSubmissionInput!): Submission
    # PersistentTasks
    createLevelTask(input: CreateLevelTaskInput!): PersistentTask
    removeLevelTask(input: RemoveLevelTaskInput!): PersistentTask
    editPersistentTask(input: EditPersistentTaskInput!): PersistentTask
    setPersistentTaskPayout(input: SetTaskPayoutInput!): PersistentTask # Re-use task input typedefs
    removePersistentTaskPayout(input: RemoveTaskPayoutInput!): PersistentTask # Re-use task input typedefs
    removePersistentTask(input: RemovePersistentTaskInput!): PersistentTask
    # Levels
    createLevel(input: CreateLevelInput!): Level
    editLevel(input: EditLevelInput!): Level
    reorderLevelSteps(input: ReorderLevelStepsInput!): Level
    removeLevel(input: RemoveLevelInput!): Level
    # Programs
    createProgram(input: CreateProgramInput!): Program
    enrollInProgram(input: EnrollInProgramInput!): Program
    editProgram(input: EditProgramInput!): Program
    reorderProgramLevels(input: ReorderProgramLevelsInput!): Program
    publishProgram(input: PublishProgramInput!): Program
    removeProgram(input: RemoveProgramInput!): Program
  }
`
