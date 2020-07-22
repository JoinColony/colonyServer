import { MongoClient, Db } from 'mongodb'

import { dbName, dbUrl } from '../env'

export const connect = async (): Promise<{ db: Db; client: MongoClient }> => {
  console.info(`Connecting to database "${dbName}" via "${dbUrl}"...`)

  const client = await MongoClient.connect(dbUrl, { useUnifiedTopology: true })

  const db = await client.db(dbName)
  console.info('Connected to database successfully.')

  return { db, client }
}
