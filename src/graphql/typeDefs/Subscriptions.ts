import { gql } from 'apollo-server-express'

export default gql`
  type Subscription {
    transactionMessages(
      transactionHash: String!
      limit: Int
    ): TransactionMessages!
    transactionMessagesCount(colonyAddress: String!): TransactionMessagesCount!
    subscribedUsers(colonyAddress: String!): [User!]!
  }
`
