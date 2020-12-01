import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    user(address: String!): User!
    colony(address: String!): Colony!
    domain(colonyAddress: String!, ethDomainId: Int!): Domain!
    level(id: String!): Level!
    program(id: String!): Program!
    task(id: String!): Task!
    tokenInfo(address: String!): TokenInfo!
    systemInfo: SystemInfo!
    transaction: Transaction!
  }
`
