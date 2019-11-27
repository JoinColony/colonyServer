import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Collection, Db, ObjectID } from 'mongodb'

export interface MongoDoc {
  readonly _id: ObjectID
}

/**
 * @NOTE
 *
 * These data sources are designed in such a way that the integrity of the data
 * is ensured (e.g. all operations are idempotent, all data is validated),
 * but there is no attempt provide security with any kind of authentication,
 * by design.
 *
 * For this application, authentication is the responsibility of the GraphQL
 * resolvers, which will use on-chain verification.
 */

export class ColonyMongoDataSource<T> extends MongoDataSource<any> {
  protected static collectionName = ''

  static initialize(db: Db) {
    return new this(db.collection(this.collectionName))
  }

  readonly collection: Collection<T>
}

export { Colonies, ColonyDoc } from './colonies'
export { Domains, DomainDoc } from './domains'
export { Tasks, TaskDoc } from './tasks'
export { Users, UserDoc } from './users'
