import { gql } from 'apollo-server-express'

export default gql`
  enum SubmissionStatus {
    Open
    Accepted
    Rejected
    Deleted
  }
`
