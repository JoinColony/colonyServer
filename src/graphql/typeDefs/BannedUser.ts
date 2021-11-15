import { gql } from 'apollo-server-express'

export default gql`
  type BannedUser {
    id: String! # wallet address
    profile: UserProfile
    eventId: String
    event: Event
    banned: Boolean!
  }
`
