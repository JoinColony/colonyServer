import { gql } from 'apollo-server-express'

export default gql`
  interface ColonyEvent {
    type: EventType!
    colonyAddress: String
  }

  type CreateDomainEvent implements ColonyEvent {
    type: EventType!
    ethDomainId: Int!
    colonyAddress: String
  }

  type NewUserEvent {
    type: EventType!
  }

  type TransactionMessageEvent {
    type: EventType!
    transactionHash: String!
    message: String!
    colonyAddress: String!
    deleted: Boolean
    adminDelete: Boolean
  }

  union EventContext =
      CreateDomainEvent
    | NewUserEvent
    | TransactionMessageEvent

  type Event {
    id: String!
    type: EventType!
    createdAt: GraphQLDateTime!
    initiator: User
    initiatorAddress: String!
    sourceId: String!
    sourceType: String!
    context: EventContext!
  }

  type Notification {
    id: String!
    event: Event!
    read: Boolean!
  }
`
