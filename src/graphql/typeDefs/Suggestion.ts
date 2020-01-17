import { gql } from 'apollo-server-express'

export default gql`
  enum SuggestionStatus {
    Open
    NotPlanned
    Accepted
    Deleted
  }

  type Suggestion {
    id: String!
    createdAt: GraphQLDateTime!
    colonyAddress: String!
    creatorAddress: String!
    creator: User!
    ethDomainId: Int!
    status: SuggestionStatus!
    title: String!
    taskId: String
    upvotes: [String!]!
  }
`
