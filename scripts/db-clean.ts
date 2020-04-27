import { Db } from 'mongodb'
import { config } from 'dotenv'

config()

import { connect } from '../src/db/connect'
import { COLLECTIONS_MANIFEST } from '../src/db/collections'

const cleanCollections = async (db: Db) =>
  Promise.all(
    Array.from(COLLECTIONS_MANIFEST.entries()).map(
      async ([name, { create, indexes }]) => {
        console.info(`Cleaning collection "${name}"...`)
        const collection = db.collection(name)
        const { deletedCount } = await collection.deleteMany({})
        console.info(`${deletedCount} documents deleted for "${name}".`)
      },
    ),
  )

const clean = async () => {
  console.info('Cleaning database...')
  const { db } = await connect()
  await cleanCollections(db)
}

clean()
  .then(() => {
    console.info('Database cleaned successfully.')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
