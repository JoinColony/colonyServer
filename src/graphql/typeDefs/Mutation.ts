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

  input SubscribeToColonyInput {
    colonyAddress: String!
  }

  input UnsubscribeFromColonyInput {
    colonyAddress: String!
  }

  input MarkNotificationAsReadInput {
    id: String!
  }

  input SetUserTokensInput {
    tokenAddresses: [String!]!
  }

  input SendTransactionMessageInput {
    transactionHash: String!
    message: String!
    colonyAddress: String!
  }

  input DeleteTransactionMessageInput {
    id: String!
    colonyAddress: String!
  }

  input BanTransactionMessagesInput {
    colonyAddress: String!
    userAddress: String!
    eventId: String!
  }

  input UnBanTransactionMessagesInput {
    colonyAddress: String!
    userAddress: String!
  }

  type Mutation {
    # Messages
    sendTransactionMessage(input: SendTransactionMessageInput!): Boolean!
    deleteTransactionMessage(input: DeleteTransactionMessageInput!): Boolean!
    # Banning
    banUserTransactionMessages(input: BanTransactionMessagesInput!): Boolean!
    unbanUserTransactionMessages(
      input: UnBanTransactionMessagesInput!
    ): Boolean!
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
