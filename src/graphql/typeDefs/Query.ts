import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    user(address: String!): User!
    subscribedUsers(colonyAddress: String!): [User!]!
    tokenInfo(address: String!): TokenInfo!
    systemInfo: SystemInfo!
    transactionMessages(
      transactionHash: String!
      limit: Int
    ): TransactionMessages!
    transactionMessagesCount(colonyAddress: String!): TransactionMessagesCount!
    bannedUsers(colonyAddress: String!): [BannedUser]!
  }
`
