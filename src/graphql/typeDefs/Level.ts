import { gql } from 'apollo-server-express'

export default gql`
  enum LevelStatus {
    Active
    Deleted
  }
`
