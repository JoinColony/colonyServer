import { gql } from 'apollo-server-express'

export default gql`
  enum ProgramStatus {
    Draft
    Active
    Deleted
  }
`
