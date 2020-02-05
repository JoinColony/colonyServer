import { gql } from 'apollo-server-express'

export default gql`
  enum SubmissionStatus {
    Open
    Accepted
    Rejected
    Deleted
  }

  type Submission {
    id: String! # mongodb ObjectId
    createdAt: GraphQLDateTime!
    creatorAddress: String!
    creator: User! # resolved
    persistentTaskId: String!
    submission: String!
    status: SubmissionStatus!
    statusChangedAt: GraphQLDateTime
  }
`
