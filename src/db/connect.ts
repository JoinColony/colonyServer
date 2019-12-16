import { MongoClient, Db } from 'mongodb'

export const connect = async (): Promise<{ db: Db; client: MongoClient }> => {
  const dbName = process.env.DB_NAME
  const dbUrl = process.env.DB_URL

  console.info(`Connecting to database "${dbName}" via "${dbUrl}"...`)

  const client = await MongoClient.connect(
    dbUrl,
    { useUnifiedTopology: true },
  )

  const db = await client.db(dbName)
  console.info('Connected to database successfully.')

  return { db, client }
}
