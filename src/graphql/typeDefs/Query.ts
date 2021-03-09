import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    user(address: String!): User!
    subscribedUsers(colonyAddress: String!): [User!]!
    tokenInfo(address: String!): TokenInfo!
    systemInfo: SystemInfo!
    transactionMessages(transactionHash: String!): TransactionMessages!
    transactionMessagesCount(colonyAddress: String!): TransactionMessagesCount!
  }
`
