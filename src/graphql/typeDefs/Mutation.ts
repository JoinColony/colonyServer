import { gql } from 'apollo-server-express'

export default gql`
  input CreateUserInput {
    username: String!
  }

  input EditUserInput {
    avatarHash: String
    bio: String
    displayName: String
    location: String
    website: String
  }

  input CreateWorkRequestInput {
    id: String!
  }

  input SendWorkInviteInput {
    id: String!
    workerAddress: String!
  }

  input AssignWorkerInput {
    id: String!
    workerAddress: String!
  }

  input UnassignWorkerInput {
    id: String!
    workerAddress: String!
  }

  input SubscribeToColonyInput {
    colonyAddress: String!
  }

  input UnsubscribeFromColonyInput {
    colonyAddress: String!
  }

  input MarkNotificationAsReadInput {
    id: String!
  }

  input EditDomainNameInput {
    colonyAddress: String!
    ethDomainId: Int!
    name: String!
  }

  input SetUserTokensInput {
    tokenAddresses: [String!]!
  }

  input Payout {
    amount: String!
    tokenAddress: String!
  }

  input SendTransactionMessageInput {
    transactionHash: String!
    message: String!
    colonyAddress: String!
  }

  type Mutation {
    # Messages
    sendTransactionMessage(input: SendTransactionMessageInput!): Boolean!
    # Notifications
    markAllNotificationsAsRead: Boolean!
    markNotificationAsRead(input: MarkNotificationAsReadInput!): Boolean!
    # Users
    createUser(input: CreateUserInput!): User # TODO find out why we can't use an exclamation mark here
    editUser(input: EditUserInput!): User
    subscribeToColony(input: SubscribeToColonyInput!): User
    unsubscribeFromColony(input: UnsubscribeFromColonyInput!): User
    setUserTokens(input: SetUserTokensInput!): User
  }
`
