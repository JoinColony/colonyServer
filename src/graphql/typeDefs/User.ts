import { gql } from 'apollo-server-express'

export default gql`
  type User {
    id: String! # wallet address
    createdAt: GraphQLDateTime!
    profile: UserProfile!
    colonies: [Colony!]!
    colonyAddresses: [String!]!
    tasks: [Task!]!
    taskIds: [String!]!
    tokens(addresses: [String!]): [UserToken!]!
    tokenAddresses: [String!]!
    notifications(read: Boolean): [Notification!] # Only provided for the current user
  }

  type UserProfile {
    username: String
    avatarHash: String
    bio: String
    displayName: String
    location: String
    walletAddress: String!
    website: String
  }

  type UserToken {
    id: String! # token address
    createdAt: GraphQLDateTime!
    address: String!
    iconHash: String
    info: TokenInfo!
  }
`
