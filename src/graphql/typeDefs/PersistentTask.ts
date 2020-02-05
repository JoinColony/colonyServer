import { gql } from 'apollo-server-express'

export default gql`
  enum PersistentTaskStatus {
    Active
    Closed
    Deleted
  }

  type PersistentTask {
    id: String! # mongodb ObjectId
    createdAt: GraphQLDateTime!
    creatorAddress: String!
    ethDomainId: Int!
    ethSkillId: Int
    title: String!
    description: String!
    payouts: [TaskPayout!]!
    submissions: [Submission!]!
    status: PersistentTaskStatus!
  }
`
