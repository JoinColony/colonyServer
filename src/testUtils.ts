import { Db } from 'mongodb'

import { CollectionNames, COLLECTIONS_MANIFEST } from './db/collections'
import {
  ColonyDoc,
  DomainDoc,
  EventDoc,
  LevelDoc,
  NotificationDoc,
  PersistentTaskDoc,
  ProgramDoc,
  SubmissionDoc,
  SuggestionDoc,
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

  const { insertedIds } = await db
    .collection(collectionName)
    .insertMany(docs.map((doc) => Object.assign({}, doc)))
  return Object.keys(insertedIds)
    .sort()
    .map((idx) => insertedIds[idx].toHexString())
}

interface DocsToInsert {
  colonies?: Partial<ColonyDoc>[]
  domains?: Partial<DomainDoc>[]
  events?: Partial<EventDoc<any>>[]
  levels?: Partial<LevelDoc>[]
  notifications?: Partial<NotificationDoc>[]
  persistentTasks?: Partial<PersistentTaskDoc>[]
  programs?: Partial<ProgramDoc>[]
  submissions?: Partial<SubmissionDoc>[]
  suggestions?: Partial<SuggestionDoc>[]
  tasks?: Partial<TaskDoc>[]
  tokens?: Partial<TokenDoc>[]
  users?: Partial<UserDoc>[]
}

interface InsertedDocs {
  colonies: string[]
  domains: string[]
  events: string[]
  levels: string[]
  notifications: string[]
  persistentTasks: string[]
  programs: string[]
  submissions: string[]
  suggestions: string[]
  tasks: string[]
  tokens: string[]
  users: string[]
}

export const insertDocs = async (
  db: Db,
  docs: DocsToInsert,
): Promise<InsertedDocs> => {
  // Insert seeded docs first (as defined on the collection manifest) to reflect
  // how the database should be set up in practise
  const seededDocs = await Promise.all(
    Object.keys(docs).map(async (collectionName: CollectionNames) => {
      const seedDocs = COLLECTIONS_MANIFEST.get(collectionName).seedDocs
      const ids =
        seedDocs && seedDocs.length
          ? await insertMany(db, collectionName, seedDocs)
          : []
      return [collectionName, ids]
    }),
  )

  const givenDocs = await Promise.all(
    Object.keys(docs).map(async (collectionName: CollectionNames) => {
      const ids = await insertMany(db, collectionName, docs[collectionName])
      return [collectionName, ids]
    }),
  )

  // Construct the InsertedDocs from the seeded and given docs that were inserted
  return [...seededDocs, ...givenDocs].reduce(
    (acc, [collectionName, ids]: [CollectionNames, string[]]) => ({
      ...acc,
      [collectionName]: [...acc[collectionName], ...ids],
    }),
    {
      colonies: [],
      domains: [],
      events: [],
      levels: [],
      notifications: [],
      persistentTasks: [],
      programs: [],
      submissions: [],
      suggestions: [],
      tasks: [],
      tokens: [],
      users: [],
    },
  )
}
