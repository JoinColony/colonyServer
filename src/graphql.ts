import { ApolloServer, AuthenticationError, gql } from 'apollo-server-express'

import { getAddressFromToken } from './auth'

const typeDefs = gql`
  type UserProfile {
    username: String!
    avatarHash: String
    bio: String
    displayName: String
    location: String
    walletAddress: String!
    website: String
  }

  type User {
    profile: UserProfile!
  }

  type Query {
    user(address: String!): User!
  }

  input UserProfileInput {
    avatarHash: String
    bio: String
    displayName: String
    location: String
    website: String
  }

  type Mutation {
    createUser(address: String!, username: String!): User!
    editUser(address: String!, profile: UserProfileInput!): User!
  }
`

const TEMP_inMemoryStorage = {
  users: {
    '0xb77D57F4959eAfA0339424b83FcFaf9c15407461': {
      profile: {
        username: 'c',
        avatarHash: 'QmRyLAw2orT8hSCaY3DwpVvNuxeyQZLDkYKEwXkfSW5bER',
        bio: 'Cool dude',
        displayName: 'Christian Maniewski',
        location: 'Berlin',
        walletAddress: '0xb77D57F4959eAfA0339424b83FcFaf9c15407461',
        website: 'https://github.com/chmanie',
      },
    },
  },
}

// FIXME In general we should probably check whether the users are authenticated?
const resolvers = {
  Query: {
    user: (parent, args, { user: currentUser }) => {
      console.log(currentUser)
      return TEMP_inMemoryStorage.users[args.address]
    },
  },
  Mutation: {
    createUser: (parent, { username, address }, { user: currentUser }) => {
      // FIXME here we should check whether the user is the same that tries to modify this entry
      // Plus Of course all other kinds of input validation I guess
      const user = {
        profile: {
          username,
          walletAddress: address,
        },
      }
      TEMP_inMemoryStorage.users[address] = user
      return user
    },
    editUser: (parent, { address, profile }, { user: currentUser }) => {
      // FIXME Check for same user

      // FIXME what do we do if the user doesn't exist?
      const existingUser = TEMP_inMemoryStorage.users[address]
      const user = {
        ...existingUser,
        profile: {
          ...existingUser.profile,
          ...profile,
        },
      }
      return user;
    },
  },
}

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers['x-access-token'] || req.headers['authorization']

    let address
    try {
      address = getAddressFromToken(token)
    } catch (e) {
      throw new AuthenticationError('Not authenticated')
    }

    return { user: address }
  },
})
