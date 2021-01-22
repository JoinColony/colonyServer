import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    user(address: String!): User!
    subscribedUsers(colonyAddress: String!): [User!]!
    tempDomain(colonyAddress: String!, ethDomainId: Int!): TempDomain!
    tempDomains(colonyAddress: String!): [TempDomain!]!
    task(id: String!): Task!
    tokenInfo(address: String!): TokenInfo!
    systemInfo: SystemInfo!
    transactionMessages(transactionHash: String!): TransactionMessages!
    transactionMessagesCount(colonyAddress: String!): TransactionMessagesCount!
  }
`
