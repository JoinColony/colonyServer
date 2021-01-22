import { gql } from 'apollo-server-express'

export default gql`
  type TaskPayout {
    amount: String!
    tokenAddress: String!
  }

  type Task {
    id: String! # stringified ObjectId
    createdAt: GraphQLDateTime!
    ethDomainId: Int!
    ethPotId: Int
    ethSkillId: Int
    cancelledAt: GraphQLDateTime
    description: String
    dueDate: GraphQLDateTime
    finalizedAt: GraphQLDateTime
    title: String
    colonyAddress: String!
    creator: User!
    creatorAddress: String!
    domain: TempDomain!
    assignedWorker: User
    assignedWorkerAddress: String
    workInvites: [User!]!
    workInviteAddresses: [String!]!
    workRequests: [User!]!
    workRequestAddresses: [String!]!
    events: [Event!]!
    payouts: [TaskPayout!]!
    txHash: String
  }
`
