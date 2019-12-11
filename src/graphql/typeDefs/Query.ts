import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    user(address: String!): User!
    colony(address: String!): Colony!
    domain(colonyAddress: String!, ethDomainId: Int!): Domain!
    task(id: String!): Task!
    token(address: String!): Token!
  }
`
