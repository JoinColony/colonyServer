import { gql } from 'apollo-server-express'

export default gql`
  type TokenInfo {
    name: String
    decimals: Int
    symbol: String
  }

  type Token {
    id: String! # token address
    createdAt: GraphQLDateTime!
    address: String!
    iconHash: String
    info: TokenInfo!
  }
`
