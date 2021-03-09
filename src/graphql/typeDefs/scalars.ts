import { gql } from 'apollo-server-express'

export default gql`
  scalar GraphQLDateTime

  enum EventType {
    AssignWorker
    CreateDomain
    CreateWorkRequest
    NewUser
    SendWorkInvite
    UnassignWorker
    TransactionMessage
  }
`
