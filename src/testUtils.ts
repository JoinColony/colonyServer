import { Db } from 'mongodb'

import { CollectionNames } from './db/collections'
import {
  ColonyDoc,
  DomainDoc,
  EventDoc,
  NotificationDoc,
  TaskDoc,
  TokenDoc,
  UserDoc,
} from './db/types'

const insertMany = async <T>(
  db: Db,
  collectionName: string,
  docs: T[] = [],
): Promise<string[]> => {
  if (!docs.length) return []

  const { insertedIds } = await db.collection(collectionName).insertMany(docs)
  return Object.keys(insertedIds)
    .sort()
    .map(idx => insertedIds[idx].toHexString())
}

export const insertDocs = async (
  db: Db,
  {
    colonies = [],
    domains = [],
    events = [],
    notifications = [],
    tasks = [],
    tokens = [],
    users = [],
  }: {
    colonies?: Partial<ColonyDoc>[]
    domains?: Partial<DomainDoc>[]
    events?: Partial<EventDoc<any>>[]
    notifications?: Partial<NotificationDoc>[]
    tasks?: Partial<TaskDoc>[]
    tokens?: Partial<TokenDoc>[]
    users?: Partial<UserDoc>[]
  },
): Promise<{
  colonies: string[]
  domains: string[]
  events: string[]
  notifications: string[]
  tasks: string[]
  tokens: string[]
  users: string[]
}> => ({
  colonies: await insertMany(db, CollectionNames.Colonies, colonies),
  domains: await insertMany(db, CollectionNames.Domains, domains),
  events: await insertMany(db, CollectionNames.Events, events),
  notifications: await insertMany(
    db,
    CollectionNames.Notifications,
    notifications,
  ),
  tasks: await insertMany(db, CollectionNames.Tasks, tasks),
  tokens: await insertMany(db, CollectionNames.Tokens, tokens),
  users: await insertMany(db, CollectionNames.Users, users),
})
