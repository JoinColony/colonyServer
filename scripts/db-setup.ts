import { Db } from 'mongodb'
import { config } from 'dotenv'

config()

import { connect } from '../src/db/connect'
import { COLLECTIONS_MANIFEST } from '../src/db/collections'

const createCollections = async (db: Db) =>
  Promise.all(
    Array.from(COLLECTIONS_MANIFEST.entries()).map(
      async ([name, { create, indexes, seedDocs = [] }]) => {
        console.info(`Creating collection ${name}`)
        await db.createCollection(name, create)

        // If the collection already exists, remove all documents
        await db.collection(name).deleteMany({})

        await Promise.all(
          indexes.map(([fieldName, options]) =>
            db.createIndex(name, fieldName, options),
          ),
        )
        if (seedDocs.length) {
          await db.collection(name).insertMany(seedDocs)
        }
      },
    ),
  )

const setup = async () => {
  console.info('Running database setup...')
  const { db } = await connect()
  await createCollections(db)
}

setup()
  .then(() => {
    console.info('Database setup completed successfully.')
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
