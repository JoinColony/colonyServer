import { gql } from 'apollo-server-express'

export default gql`
  scalar GraphQLDateTime

  enum EventType {
    AcceptLevelTaskSubmission
    AssignWorker
    CancelTask
    CreateDomain
    CreateLevelTaskSubmission
    CreateTask
    CreateWorkRequest
    EnrollUserInProgram
    FinalizeTask
    NewUser
    RemoveTaskPayout
    SendWorkInvite
    SetTaskDescription
    SetTaskDomain
    SetTaskDueDate
    SetTaskPayout
    SetTaskPending
    SetTaskSkill
    RemoveTaskSkill
    SetTaskTitle
    TaskMessage
    UnassignWorker
    UnlockNextLevel
  }
`
