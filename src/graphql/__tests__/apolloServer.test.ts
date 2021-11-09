import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { MongoClient, ObjectID } from 'mongodb'
import fs from 'fs'
import path from 'path'
import { PubSub } from 'graphql-subscriptions'

import { ColonyMongoApi } from '../../db/colonyMongoApi'
import { ColonyMongoDataSource } from '../../db/colonyMongoDataSource'
import { ColonyAuthDataSource } from '../../network/colonyAuthDataSource'
import Event from '../typeDefs/Event'
import Mutation from '../typeDefs/Mutation'
import Query from '../typeDefs/Query'
import TokenInfo from '../typeDefs/TokenInfo'
import SystemInfo from '../typeDefs/SystemInfo'
import Transaction from '../typeDefs/Transaction'
import User from '../typeDefs/User'
import scalars from '../typeDefs/scalars'
import { resolvers } from '../resolvers'
import { tryAuth } from '../resolvers/auth'
import { insertDocs } from '../../testUtils'
import { UserDoc } from '../../db/types'
import { EventType } from '../types'
import { CollectionNames } from '../../db/collections'

jest.mock('../../network/colonyAuthDataSource')
jest.mock('../resolvers/auth')

const typeDefs = [
  Event,
  Mutation,
  Query,
  TokenInfo,
  SystemInfo,
  Transaction,
  User,
  scalars,
]

let ctxUserAddress

const user1Doc: Omit<UserDoc, '_id'> = {
  walletAddress: 'user 1 wallet address',
  username: 'user1',
  colonyAddresses: [],
  tokenAddresses: [],
}
const user2Doc: Omit<UserDoc, '_id'> = {
  walletAddress: 'user 2 wallet address',
  username: 'user2',
  colonyAddresses: [],
  tokenAddresses: [],
}

const token1Doc = {
  address: '0x06441dEaF11D60d77e5e42d4f644C64Ca05C2Fc1',
  creatorAddress: user1Doc.walletAddress,
  name: 'Token name 1',
  symbol: 'TKN1',
  decimals: 18,
}
const token2Doc = {
  address: '0x06441dEaf11d60d77e5E42d4F644c64ca05C2fC2',
  creatorAddress: user1Doc.walletAddress,
  name: 'Token name 2',
  symbol: 'TKN2',
  decimals: 18,
}
const token3Doc = {
  address: '0x06441dEaF11D60d77e5e42d4f644C64Ca05C2Fc3',
  creatorAddress: user1Doc.walletAddress,
  name: 'Token name 3',
  symbol: 'TKN3',
  decimals: 18,
}

const systemInfoResult = {
  version: JSON.parse(
    /*
     * @NOTE As opposed to the data source, we're reading this file syncronously
     * We don't really care about halting the process here, so this way is easier
     * (plus we can chain everything)
     */
    fs.readFileSync(path.resolve('package.json')).toString(),
  ).version,
}

describe('Apollo Server', () => {
  let connection
  let db
  let api
  let data
  let auth
  let pubsub

  const removeAll = async () => {
    await db.collection(CollectionNames.Colonies).deleteMany({})
    await db.collection(CollectionNames.Domains).deleteMany({})
    await db.collection(CollectionNames.Events).deleteMany({})
    await db.collection(CollectionNames.Notifications).deleteMany({})
    await db.collection(CollectionNames.Tokens).deleteMany({})
    await db.collection(CollectionNames.Users).deleteMany({})
  }

  beforeAll(async () => {
    // Use the MONGO_URL injected by jest-mongodb
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    pubsub = new PubSub()
    db = await connection.db()
    api = new ColonyMongoApi(db, pubsub)
    data = new ColonyMongoDataSource(db)
    auth = new ColonyAuthDataSource({} as any)
    await removeAll()
  })

  afterAll(async () => {
    await removeAll()
    await connection.close()
  })

  beforeEach(async () => {
    jest.resetAllMocks()
    await removeAll()
  })

  afterEach(async () => {
    await removeAll()
  })

  ctxUserAddress = user1Doc.walletAddress

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({ auth, data }),
    context: () => ({
      api,
      userAddress: ctxUserAddress,
    }),
  })

  const { query, mutate } = createTestClient(server as any)

  describe('Query', () => {
    it('user', async () => {
      await insertDocs(db, {
        users: [user1Doc],
      })

      await expect(
        query({
          query: gql`
            query user($address: String!) {
              user(address: $address) {
                id
                profile {
                  username
                }
              }
            }
          `,
          variables: {
            address: user1Doc.walletAddress,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          user: {
            id: user1Doc.walletAddress,
            profile: {
              username: user1Doc.username,
            },
          },
        },
        errors: undefined,
      })
    })

    it('tokenInfo', async () => {
      await insertDocs(db, {
        tokens: [token1Doc],
      })

      await expect(
        query({
          query: gql`
            query tokenInfo($address: String!) {
              tokenInfo(address: $address) {
                address
                decimals
                name
                symbol
              }
            }
          `,
          variables: {
            address: token1Doc.address,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          tokenInfo: {
            address: token1Doc.address,
            decimals: token1Doc.decimals,
            name: token1Doc.name,
            symbol: token1Doc.symbol,
          },
        },
        errors: undefined,
      })
    })

    it('systemInfo', async () => {
      await expect(
        query({
          query: gql`
            query SystemInfo {
              systemInfo {
                version
              }
            }
          `,
        }),
      ).resolves.toMatchObject({
        data: {
          systemInfo: systemInfoResult,
        },
        errors: undefined,
      })
    })
  })

  describe('Mutation', () => {
    it('createUser', async () => {
      const username = 'my_username'

      await expect(
        mutate({
          mutation: gql`
            mutation createUser($input: CreateUserInput!) {
              createUser(input: $input) {
                id
                profile {
                  username
                }
              }
            }
          `,
          variables: {
            input: { username },
          },
        }),
      ).resolves.toMatchObject({
        data: {
          createUser: {
            id: user1Doc.walletAddress,
            profile: { username },
          },
        },
        errors: undefined,
      })

      // A `NewUser` notification should have been sent to the user
      await expect(
        query({
          query: gql`
            query user($address: String!) {
              user(address: $address) {
                id
                notifications {
                  event {
                    type
                  }
                  read
                }
              }
            }
          `,
          variables: { address: user1Doc.walletAddress },
        }),
      ).resolves.toMatchObject({
        data: {
          user: {
            id: user1Doc.walletAddress,
            notifications: [
              {
                event: { type: EventType.NewUser },
                read: false,
              },
            ],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).not.toHaveBeenCalled()
    })

    it('editUser', async () => {
      await insertDocs(db, {
        users: [
          { ...user1Doc, bio: 'check out my bio', displayName: 'My name' },
        ],
      })

      const displayName = null
      const bio = 'more bio than prenzlauer berg'

      await expect(
        mutate({
          mutation: gql`
            mutation editUser($input: EditUserInput!) {
              editUser(input: $input) {
                id
                profile {
                  bio
                  displayName
                }
              }
            }
          `,
          variables: {
            input: { displayName, bio },
          },
        }),
      ).resolves.toMatchObject({
        data: {
          editUser: {
            id: user1Doc.walletAddress,
            profile: { displayName, bio },
          },
        },
        errors: undefined,
      })

      expect(tryAuth).not.toHaveBeenCalled()
    })

    it('setUserTokens', async () => {
      await insertDocs(db, {
        users: [user1Doc],
        tokens: [token1Doc, token2Doc, token3Doc],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation setUserTokens($input: SetUserTokensInput!) {
              setUserTokens(input: $input) {
                id
                tokenAddresses
              }
            }
          `,
          variables: {
            input: { tokenAddresses: [token1Doc.address, token2Doc.address] },
          },
        }),
      ).resolves.toMatchObject({
        data: {
          setUserTokens: {
            id: user1Doc.walletAddress,
            tokenAddresses: [token1Doc.address, token2Doc.address],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).not.toHaveBeenCalled()
    })

    it('markNotificationAsRead', async () => {
      const {
        events: [eventId],
      } = await insertDocs(db, {
        users: [user1Doc],
        events: [
          { type: EventType.CreateDomain, sourceType: 'db', context: {} },
        ],
      })
      const {
        notifications: [id],
      } = await insertDocs(db, {
        notifications: [
          {
            eventId: new ObjectID(eventId),
            users: [{ address: ctxUserAddress, read: false }],
          },
        ],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation markNotificationAsRead(
              $input: MarkNotificationAsReadInput!
            ) {
              markNotificationAsRead(input: $input)
            }
          `,
          variables: { input: { id } },
        }),
      ).resolves.toMatchObject({
        data: { markNotificationAsRead: true },
        errors: undefined,
      })

      await expect(
        query({
          query: gql`
            query user($address: String!) {
              user(address: $address) {
                id
                notifications {
                  event {
                    type
                  }
                  read
                }
              }
            }
          `,
          variables: { address: ctxUserAddress },
        }),
      ).resolves.toMatchObject({
        data: {
          user: {
            id: ctxUserAddress,
            notifications: [
              { event: { type: EventType.CreateDomain }, read: true },
            ],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).not.toHaveBeenCalled()
    })

    it('markAllNotificationsAsRead', async () => {
      const {
        events: [eventId1],
      } = await insertDocs(db, {
        users: [user1Doc, user2Doc],
        events: [
          { type: EventType.CreateDomain, sourceType: 'db', context: {} },
        ],
      })

      // Notifications for user1/user2
      const {
        notifications: [id1],
      } = await insertDocs(db, {
        notifications: [
          {
            eventId: new ObjectID(eventId1),
            users: [{ address: ctxUserAddress, read: false }],
          },
        ],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation {
              markAllNotificationsAsRead
            }
          `,
        }),
      ).resolves.toMatchObject({
        data: { markAllNotificationsAsRead: true },
        errors: undefined,
      })

      const notificationsQuery = gql`
        query user($address: String!) {
          user(address: $address) {
            id
            notifications {
              id
              event {
                type
              }
              read
            }
          }
        }
      `

      // For the current user (user1): should be read
      await expect(
        query({
          query: notificationsQuery,
          variables: { address: ctxUserAddress },
        }),
      ).resolves.toMatchObject({
        data: {
          user: {
            id: ctxUserAddress,
            notifications: [
              { id: id1, event: { type: EventType.CreateDomain }, read: true },
            ],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).not.toHaveBeenCalled()
    })
  })
})
