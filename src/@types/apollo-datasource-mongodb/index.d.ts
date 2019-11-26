/// <reference types="node" />

declare module 'apollo-datasource-mongodb' {
  import { DataSourceConfig } from 'apollo-datasource/src/index'
  import { DataSource } from 'apollo-datasource'
  import { Collection } from 'mongodb'

  export class MongoDataSource<T> implements DataSource<T> {
    initialize?(config: DataSourceConfig<T>): void

    readonly collection: Collection

    constructor(db: any)

    findOneById(id: string): any
  }
}
