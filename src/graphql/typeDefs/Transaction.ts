import { gql } from 'apollo-server-express'

export default gql`
  type TransactionMessages {
    transactionHash: String!
    messages: [Event!]!
  }
`
