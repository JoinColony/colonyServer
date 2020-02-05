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
    isNativeTokenExternal: Boolean!
    nativeTokenAddress: String!
    programs: [Program!]!
    subscribedUsers: [User!]!
    suggestions: [Suggestion!]!
    tokenAddresses: [String!]!
  }
`
