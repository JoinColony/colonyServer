import { gql } from 'apollo-server-express'

export default gql`
  enum PersistentTaskStatus {
    Active
    Closed
    Deleted
  }
`
