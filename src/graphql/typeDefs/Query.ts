import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    user(address: String!): User!
    domain(colonyAddress: String!, ethDomainId: Int!): Domain!
    tempDomains(colonyAddress: String!): [Domain!]!
    task(id: String!): Task!
    tokenInfo(address: String!): TokenInfo!
    systemInfo: SystemInfo!
    transactionMessages(transactionHash: String!): TransactionMessages!
    transactionMessagesCount(colonyAddress: String!): TransactionMessagesCount!
  }
`
