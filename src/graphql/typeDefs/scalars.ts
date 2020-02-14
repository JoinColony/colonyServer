import { gql } from 'apollo-server-express'

export default gql`
  scalar GraphQLDateTime

  enum EventType {
    AssignWorker
    CancelTask
    CreateDomain
    CreateTask
    CreateWorkRequest
    FinalizeTask
    NewUser
    RemoveTaskPayout
    SendWorkInvite
    SetTaskDescription
    SetTaskDomain
    SetTaskDueDate
    SetTaskPayout
    SetTaskSkill
    RemoveTaskSkill
    SetTaskTitle
    TaskMessage
    UnassignWorker
  }
`
