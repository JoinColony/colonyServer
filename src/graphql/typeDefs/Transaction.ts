import { gql } from 'apollo-server-express'

export default gql`
  type TransactionEvents implements Event {
    context: TransactionMessageEvent!
  }

  type Transaction {
    events: [Event!]!
  }
`
