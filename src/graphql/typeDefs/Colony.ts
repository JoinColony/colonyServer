import { gql } from 'apollo-server-express'

export default gql`
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
    nativeToken: Token!
    isNativeTokenExternal: Boolean!
    nativeTokenAddress: String!
    subscribedUsers: [User!]!
    suggestions: [Suggestion!]!
    tokens(addresses: [String!]): [Token!]!
    tokenAddresses: [String!]!
  }
`
