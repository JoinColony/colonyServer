import { gql } from 'apollo-server-express'

export default gql`
  type TaskPayout {
    amount: String!
    tokenAddress: String!
    token: Token!
  }

  type Task {
    id: String! # stringified ObjectId
    createdAt: GraphQLDateTime!
    ethTaskId: Int
    ethDomainId: Int!
    ethSkillId: Int
    cancelledAt: GraphQLDateTime
    description: String
    dueDate: GraphQLDateTime
    finalizedAt: GraphQLDateTime
    title: String
    colony: Colony!
    colonyAddress: String!
    creator: User!
    creatorAddress: String!
    domain: Domain!
    assignedWorker: User
    assignedWorkerAddress: String
    workInvites: [User!]!
    workInviteAddresses: [String!]!
    workRequests: [User!]!
    workRequestAddresses: [String!]!
    events: [Event!]!
    payouts: [TaskPayout!]!
  }
`
