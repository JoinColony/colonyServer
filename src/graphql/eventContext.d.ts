import { EventType } from '../graphql/types'
import {
  CreateDomainEvent,
  NewUserEvent,
  TransactionMessageEvent,
} from './types'

interface EventContextMap {
  [EventType.CreateDomain]: CreateDomainEvent
  [EventType.NewUser]: NewUserEvent
  [EventType.TransactionMessage]: TransactionMessageEvent
}

export type EventContextOfType<T extends EventType> = Omit<
  EventContextMap[T],
  '__typename' | 'type'
>
