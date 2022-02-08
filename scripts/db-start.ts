import { MongoMemoryServer } from 'mongodb-memory-server'
import { config } from 'dotenv'

config()

const MONGOD_VERSION = '4.2.7'

const startMongod = async () => {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27018,
      dbName: 'colonyServer',
    },
    binary: {
      version: MONGOD_VERSION,
    },
  })
  const uri = mongod.getUri()
  console.log(`MongoDB server v${MONGOD_VERSION} running on ${uri}`)
}

startMongod()
