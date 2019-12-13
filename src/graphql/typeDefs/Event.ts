import { gql } from 'apollo-server-express'

export default gql`
  interface TaskEvent {
    type: String!
    taskId: String!
  }

  interface ColonyEvent {
    type: String!
    colonyAddress: String!
  }

  type AssignWorkerEvent implements TaskEvent {
    type: String!
    taskId: String!
    workerAddress: String!
  }

  type UnassignWorkerEvent implements TaskEvent {
    type: String!
    taskId: String!
    workerAddress: String!
  }

  type CancelTaskEvent implements TaskEvent {
    type: String!
    taskId: String!
  }

  type CreateDomainEvent implements ColonyEvent {
    type: String!
    ethDomainId: String!
    colonyAddress: String!
  }

  type CreateTaskEvent implements TaskEvent {
    type: String!
    taskId: String!
    ethDomainId: String!
    colonyAddress: String!
  }

  type CreateWorkRequestEvent implements TaskEvent {
    type: String!
    taskId: String!
  }

  type FinalizeTaskEvent implements TaskEvent {
    type: String!
    taskId: String!
  }

  type RemoveTaskPayoutEvent implements TaskEvent {
    type: String!
    taskId: String!
    tokenAddress: String!
    amount: String!
  }

  type SendWorkInviteEvent implements TaskEvent {
    type: String!
    taskId: String!
    tokenAddress: String!
    amount: String!
  }

  type SetTaskDescriptionEvent implements TaskEvent {
    type: String!
    taskId: String!
    description: String!
  }

  type SetTaskDomainEvent implements TaskEvent {
    type: String!
    taskId: String!
    ethDomainId: String!
  }

  type SetTaskDueDateEvent implements TaskEvent {
    type: String!
    taskId: String!
    dueDate: GraphQLDateTime!
  }

  type SetTaskPayoutEvent implements TaskEvent {
    type: String!
    taskId: String!
  }

  type SetTaskSkillEvent implements TaskEvent {
    type: String!
    taskId: String!
    ethSkillId: Int!
  }

  type SetTaskTitleEvent implements TaskEvent {
    type: String!
    taskId: String!
    title: String!
  }

  type TaskMessageEvent implements TaskEvent {
    type: String!
    taskId: String!
    message: String!
  }

  union EventContext =
      AssignWorkerEvent
    | CancelTaskEvent
    | CreateDomainEvent
    | CreateTaskEvent
    | CreateWorkRequestEvent
    | FinalizeTaskEvent
    | RemoveTaskPayoutEvent
    | SendWorkInviteEvent
    | SetTaskDescriptionEvent
    | SetTaskDomainEvent
    | SetTaskDueDateEvent
    | SetTaskPayoutEvent
    | SetTaskSkillEvent
    | SetTaskTitleEvent
    | TaskMessageEvent
    | UnassignWorkerEvent

  type Event {
    type: String!
    createdAt: GraphQLDateTime!
    initiator: User
    initiatorAddress: String!
    sourceId: String!
    sourceType: String!
    context: EventContext!
  }

  type Notification {
    event: Event!
    read: Boolean!
  }
`
