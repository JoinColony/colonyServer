import { gql } from 'apollo-server-express'

export default gql`
  type Task {
    id: String! # stringified ObjectId
    createdAt: GraphQLDateTime!
    ethTaskId: Int
    ethDomainId: Int!
    ethSkillId: Int
    cancelledAt: Int
    description: String
    dueDate: Int
    finalizedAt: Int
    title: String
    colony: Colony
    colonyAddress: String!
    creator: User
    creatorAddress: String!
    assignedWorker: User
    assignedWorkerAddress: String
    workInvites: [User!]!
    workInviteAddresses: [String!]!
    workRequests: [User!]!
    workRequestAddresses: [String!]!
    events: [Event!]!
  }
`
