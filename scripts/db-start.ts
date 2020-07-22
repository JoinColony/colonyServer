import { MongoMemoryServer } from 'mongodb-memory-server'

const MONGOD_VERSION = '4.2.7'

const startMongod = async () => {
  const mongod = new MongoMemoryServer({
    instance: {
      port: 27018,
      dbName: 'colonyServer',
    },
    binary: {
      version: MONGOD_VERSION,
    },
  })
  const uri = await mongod.getUri()
  console.log(`MongoDB server v${MONGOD_VERSION} running on ${uri}`)
}

startMongod()
