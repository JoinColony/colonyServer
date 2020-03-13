import { gql } from 'apollo-server-express'

export default gql`
  interface TaskEvent {
    type: EventType!
    taskId: String!
    colonyAddress: String
  }

  interface ColonyEvent {
    type: EventType!
    colonyAddress: String!
  }

  type AssignWorkerEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    workerAddress: String!
    colonyAddress: String
  }

  type UnassignWorkerEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    workerAddress: String!
  }

  type CancelTaskEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    colonyAddress: String
  }

  type CreateDomainEvent implements ColonyEvent {
    type: EventType!
    ethDomainId: Int!
    colonyAddress: String!
  }

  type CreateTaskEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    ethDomainId: Int!
    colonyAddress: String
  }

  type CreateWorkRequestEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    colonyAddress: String
  }

  type FinalizeTaskEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    colonyAddress: String
  }

  type RemoveTaskPayoutEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    tokenAddress: String!
    amount: String!
    colonyAddress: String
  }

  type SendWorkInviteEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    workerAddress: String!
  }

  type SetTaskDescriptionEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    description: String!
  }

  type SetTaskDomainEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    ethDomainId: Int!
  }

  type SetTaskDueDateEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    dueDate: GraphQLDateTime!
  }

  type SetTaskPayoutEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    tokenAddress: String!
    amount: String!
  }

  type SetTaskSkillEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    ethSkillId: Int!
  }

  type RemoveTaskSkillEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    ethSkillId: Int!
  }

  type SetTaskTitleEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    title: String!
  }

  type TaskMessageEvent implements TaskEvent {
    type: EventType!
    taskId: String!
    message: String!
    colonyAddress: String
  }

  type NewUserEvent {
    type: EventType!
  }

  union EventContext =
      AssignWorkerEvent
    | CancelTaskEvent
    | CreateDomainEvent
    | CreateTaskEvent
    | CreateWorkRequestEvent
    | FinalizeTaskEvent
    | NewUserEvent
    | RemoveTaskPayoutEvent
    | SendWorkInviteEvent
    | SetTaskDescriptionEvent
    | SetTaskDomainEvent
    | SetTaskDueDateEvent
    | SetTaskPayoutEvent
    | SetTaskSkillEvent
    | RemoveTaskSkillEvent
    | SetTaskTitleEvent
    | TaskMessageEvent
    | UnassignWorkerEvent

  type Event {
    id: String!
    type: EventType!
    createdAt: GraphQLDateTime!
    initiator: User
    initiatorAddress: String!
    sourceId: String!
    sourceType: String!
    context: EventContext!
  }

  type Notification {
    id: String!
    event: Event!
    read: Boolean!
  }
`
