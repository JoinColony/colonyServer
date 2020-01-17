import { gql } from 'apollo-server-express'

export default gql`
  type TokenInfo {
    id: String! # token address
    createdAt: GraphQLDateTime!
    address: String!
    iconHash: String
    name: String!
    decimals: Int!
    symbol: String!
  }
`
