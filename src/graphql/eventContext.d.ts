import { EventType } from '../graphql/types'
import {
  AssignWorkerEvent,
  CancelTaskEvent,
  CreateDomainEvent,
  CreateTaskEvent,
  CreateWorkRequestEvent,
  FinalizeTaskEvent,
  NewUserEvent,
  RemoveTaskPayoutEvent,
  SendWorkInviteEvent,
  SetTaskDescriptionEvent,
  SetTaskDomainEvent,
  SetTaskDueDateEvent,
  SetTaskPayoutEvent,
  SetTaskPendingEvent,
  SetTaskSkillEvent,
  RemoveTaskSkillEvent,
  SetTaskTitleEvent,
  TaskMessageEvent,
  UnassignWorkerEvent,
  TransactionMessageEvent,
} from './types'

interface EventContextMap {
  [EventType.AssignWorker]: AssignWorkerEvent
  [EventType.CancelTask]: CancelTaskEvent
  [EventType.CreateDomain]: CreateDomainEvent
  [EventType.CreateTask]: CreateTaskEvent
  [EventType.CreateWorkRequest]: CreateWorkRequestEvent
  [EventType.FinalizeTask]: FinalizeTaskEvent
  [EventType.RemoveTaskPayout]: RemoveTaskPayoutEvent
  [EventType.SendWorkInvite]: SendWorkInviteEvent
  [EventType.SetTaskDescription]: SetTaskDescriptionEvent
  [EventType.SetTaskDomain]: SetTaskDomainEvent
  [EventType.SetTaskDueDate]: SetTaskDueDateEvent
  [EventType.SetTaskPayout]: SetTaskPayoutEvent
  [EventType.SetTaskPending]: SetTaskPendingEvent
  [EventType.SetTaskSkill]: SetTaskSkillEvent
  [EventType.RemoveTaskSkill]: RemoveTaskSkillEvent
  [EventType.SetTaskTitle]: SetTaskTitleEvent
  [EventType.TaskMessage]: TaskMessageEvent
  [EventType.UnassignWorker]: UnassignWorkerEvent
  [EventType.NewUser]: NewUserEvent
  [EventType.TransactionMessage]: TransactionMessageEvent
}

export type EventContextOfType<T extends EventType> = Omit<
  EventContextMap[T],
  '__typename' | 'type'
>
