import { EventType } from '../constants'
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
  SetTaskSkillEvent,
  RemoveTaskSkillEvent,
  SetTaskTitleEvent,
  TaskMessageEvent,
  UnassignWorkerEvent,
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
  [EventType.SetTaskSkill]: SetTaskSkillEvent
  [EventType.RemoveTaskSkill]: RemoveTaskSkillEvent
  [EventType.SetTaskTitle]: SetTaskTitleEvent
  [EventType.TaskMessage]: TaskMessageEvent
  [EventType.UnassignWorker]: UnassignWorkerEvent
  [EventType.NewUser]: NewUserEvent
}

export type EventContextOfType<T extends EventType> = Omit<
  EventContextMap[T],
  '__typename' | 'type'
>
