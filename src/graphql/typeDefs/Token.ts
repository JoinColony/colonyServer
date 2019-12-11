import { gql } from 'apollo-server-express'

export default gql`
  interface IToken {
    id: String!
    createdAt: GraphQLDateTime!
    address: String!
    name: String!
    symbol: String!
    iconHash: String
  }

  type Token implements IToken {
    id: String!
    createdAt: GraphQLDateTime!
    address: String!
    name: String!
    symbol: String!
    iconHash: String
  }
`
