import { gql } from 'apollo-server-express'

export default gql`
  type TokenInfo {
    id: String! # token address
    address: String!
    iconHash: String
    name: String!
    decimals: Int!
    symbol: String!
  }
`
