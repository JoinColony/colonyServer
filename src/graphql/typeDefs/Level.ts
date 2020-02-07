import { gql } from 'apollo-server-express'

export default gql`
  enum LevelStatus {
    Active
    Deleted
  }

  type Level {
    id: String! # mongodb ObjectId
    createdAt: GraphQLDateTime!
    creatorAddress: String!
    programId: String!
    title: String
    description: String
    achievement: String
    numRequiredSteps: Int
    stepIds: [String!]! # list of stepIds in the correct order
    steps: [PersistentTask!]! # resolved
    status: LevelStatus!
  }
`
