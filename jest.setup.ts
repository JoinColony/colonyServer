import { resolve } from 'path'
import { MongoClient } from 'mongodb'
import { globalSetup } from '@shelf/jest-mongodb/jest-preset'

const mongoDbSetup = require(globalSetup)
const { createCollections } = require(resolve(
  __dirname,
  './scripts/db-setup.ts',
))

module.exports = async () => {
  await mongoDbSetup()
  // Use the MONGO_URL injected by jest-mongodb
  const connection = await MongoClient.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const db = await connection.db()
  await createCollections(db)
  return connection.close()
}
