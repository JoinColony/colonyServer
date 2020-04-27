import { Db } from 'mongodb'
import { config } from 'dotenv'

config()

import { connect } from '../src/db/connect'
import { COLLECTIONS_MANIFEST } from '../src/db/collections'

export const createCollections = async (db: Db) => {
  const collections = await db.collections()
  return Promise.all(
    Array.from(COLLECTIONS_MANIFEST.entries()).map(
      async ([name, { create, indexes, seedDocs = [] }]) => {
        console.info(`Creating collection ${name}`)
        await db.createCollection(name, create)

        await Promise.all(
          indexes.map(([fieldName, options]) =>
            db.createIndex(name, fieldName, options),
          ),
        )
        if (collections.map((c) => c.collectionName).includes(name)) {
          console.log(`${name} collection already exists, don't seed it again`)
          return
        }
        if (seedDocs.length) {
          await db.collection(name).insertMany(seedDocs)
        }
      },
    ),
  )
}

const setup = async () => {
  console.info('Running database setup...')
  const { db } = await connect()
  await createCollections(db)
}

if (require.main === module) {
  setup()
    .then(() => {
      console.info('Database setup completed successfully.')
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
