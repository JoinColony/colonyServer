import { MongoClient, Db } from 'mongodb'

// FIXME use env var
const DB_URL = 'mongodb://localhost:27017'

// FIXME use env var
const DB_NAME = 'colonyServer'

export const connect = async (): Promise<{ db: Db; client: MongoClient }> => {
  console.info(`Connecting to database "${DB_NAME}" via "${DB_URL}"...`)
  const client = await MongoClient.connect(
    DB_URL,
    { useUnifiedTopology: true },
  )
  const db = await client.db(DB_NAME)
  console.info('Connected to database successfully.')
  return { db, client }
}
