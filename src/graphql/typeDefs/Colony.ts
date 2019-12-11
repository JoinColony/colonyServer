import { gql } from 'apollo-server-express'

export default gql`
  type ColonyTokenRef {
    address: String!
    isExternal: Boolean
    isNative: Boolean
    iconHash: String
  }

  type Colony {
    id: String! # colony address
    createdAt: GraphQLDateTime!
    colonyAddress: String!
    founderAddress: String!
    colonyName: String!
    avatarHash: String
    description: String
    displayName: String
    guideline: String
    website: String
    taskIds: [String!]!
    tasks: [Task!]!
    domains: [Domain!]!
    founder: User
    subscribedUsers: [User!]!
    tokens: [ColonyToken!]!
    tokenRefs: [ColonyTokenRef!]!
  }

  type ColonyToken implements IToken {
    id: String!
    createdAt: GraphQLDateTime!
    address: String!
    name: String!
    symbol: String!
    iconHash: String
    isExternal: Boolean!
    isNative: Boolean!
  }
`
