import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { DocumentNode } from 'graphql'
import { mocked } from 'ts-jest/utils'
import { MongoClient, ObjectID } from 'mongodb'

import { ColonyMongoApi } from '../../db/colonyMongoApi'
import { ColonyMongoDataSource } from '../../db/colonyMongoDataSource'
import { ColonyAuthDataSource } from '../../network/colonyAuthDataSource'
import Colony from '../typeDefs/Colony'
import Domain from '../typeDefs/Domain'
import Event from '../typeDefs/Event'
import Mutation from '../typeDefs/Mutation'
import Query from '../typeDefs/Query'
import Task from '../typeDefs/Task'
import Token from '../typeDefs/Token'
import User from '../typeDefs/User'
import scalars from '../typeDefs/scalars'
import { resolvers } from '../resolvers'
import { tryAuth } from '../resolvers/auth'
import { insertDocs } from '../../testUtils'
import {
  ColonyDoc,
  DomainDoc,
  TaskDoc,
  TokenDoc,
  UserDoc,
} from '../../db/types'
import { EventType } from '../../constants'
import { CollectionNames } from '../../db/collections'

jest.mock('../../network/colonyAuthDataSource')
jest.mock('../resolvers/auth')

const typeDefs = [
  Colony,
  Domain,
  Event,
  Mutation,
  Query,
  Task,
  Token,
  User,
  scalars,
]

let ctxUserAddress

const user1Doc: Omit<UserDoc, '_id'> = {
  walletAddress: 'user 1 wallet address',
  username: 'user1',
  taskIds: [],
  colonyAddresses: [],
  tokenAddresses: [],
}
const user2Doc: Omit<UserDoc, '_id'> = {
  walletAddress: 'user 2 wallet address',
  username: 'user2',
  taskIds: [],
  colonyAddresses: [],
  tokenAddresses: [],
}
const colonyDoc: Omit<ColonyDoc, '_id'> = {
  colonyAddress: 'colony address',
  colonyName: 'colony name',
  founderAddress: user1Doc.walletAddress,
  taskIds: [],
  nativeTokenAddress: 'token address',
  isNativeTokenExternal: false,
  tokenAddresses: [],
}
const rootDomainDoc: Omit<DomainDoc, '_id'> = {
  colonyAddress: 'colony address',
  ethDomainId: 1,
  ethParentDomainId: null,
  name: 'Root',
}
const taskDoc: Omit<TaskDoc, '_id'> = {
  colonyAddress: 'colony address',
  ethDomainId: 1,
  creatorAddress: user1Doc.walletAddress,
  payouts: [],
  workInviteAddresses: [],
  workRequestAddresses: [],
}
const token1Doc = {
  address: 'token address 1',
  creatorAddress: user1Doc.walletAddress,
  name: 'Token name 1',
  symbol: 'TKN1',
  decimals: 18,
}
const token2Doc = {
  address: 'token address 2',
  creatorAddress: user1Doc.walletAddress,
  name: 'Token name 2',
  symbol: 'TKN2',
  decimals: 18,
}
const token3Doc = {
  address: 'token address 3',
  creatorAddress: user1Doc.walletAddress,
  name: 'Token name 3',
  symbol: 'TKN3',
  decimals: 18,
}

describe('Apollo Server', () => {
  let connection
  let db
  let api
  let data
  let auth

  const removeAll = async () => {
    await db.collection(CollectionNames.Colonies).deleteMany({})
    await db.collection(CollectionNames.Domains).deleteMany({})
    await db.collection(CollectionNames.Events).deleteMany({})
    await db.collection(CollectionNames.Notifications).deleteMany({})
    await db.collection(CollectionNames.Tasks).deleteMany({})
    await db.collection(CollectionNames.Tokens).deleteMany({})
    await db.collection(CollectionNames.Users).deleteMany({})
  }

  beforeAll(async () => {
    connection = await MongoClient.connect(
      process.env.DB_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    )
    db = await connection.db()
    api = new ColonyMongoApi(db)
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

    it('colony', async () => {
      await insertDocs(db, {
        colonies: [colonyDoc],
      })

      await expect(
        query({
          query: gql`
            query colony($address: String!) {
              colony(address: $address) {
                colonyAddress
                colonyName
              }
            }
          `,
          variables: {
            address: colonyDoc.colonyAddress,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          colony: {
            colonyAddress: colonyDoc.colonyAddress,
            colonyName: colonyDoc.colonyName,
          },
        },
        errors: undefined,
      })
    })

    it('domain', async () => {
      await insertDocs(db, {
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
      })

      await expect(
        query({
          query: gql`
            query domain($colonyAddress: String!, $ethDomainId: Int!) {
              domain(colonyAddress: $colonyAddress, ethDomainId: $ethDomainId) {
                ethDomainId
                colonyAddress
                name
              }
            }
          `,
          variables: {
            colonyAddress: colonyDoc.colonyAddress,
            ethDomainId: 1,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          domain: {
            ethDomainId: 1,
            colonyAddress: colonyDoc.colonyAddress,
          },
        },
        errors: undefined,
      })
    })

    it('task', async () => {
      const taskDoc: Omit<TaskDoc, '_id'> = {
        colonyAddress: 'colony address',
        ethDomainId: 1,
        creatorAddress: user1Doc.walletAddress,
        payouts: [
          {
            amount: '420',
            tokenAddress: token1Doc.address,
          },
          {
            amount: '69',
            tokenAddress: token2Doc.address,
          },
        ],
        workInviteAddresses: [user2Doc.walletAddress],
        workRequestAddresses: [user2Doc.walletAddress],
        assignedWorkerAddress: user2Doc.walletAddress,
      }
      const {
        tasks: [id],
      } = await insertDocs(db, {
        tasks: [taskDoc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tokens: [token1Doc, token2Doc],
        users: [user1Doc, user2Doc],
      })

      await expect(
        query({
          query: gql`
            query task($id: String!) {
              task(id: $id) {
                id
                colony {
                  id
                }
                assignedWorker {
                  id
                }
                creator {
                  id
                }
                domain {
                  ethDomainId
                }
                payouts {
                  amount
                  token {
                    address
                  }
                }
              }
            }
          `,
          variables: {
            id,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          task: {
            id,
            colony: {
              id: colonyDoc.colonyAddress,
            },
            creator: {
              id: user1Doc.walletAddress,
            },
            assignedWorker: {
              id: user2Doc.walletAddress,
            },
            domain: {
              ethDomainId: rootDomainDoc.ethDomainId,
            },
            payouts: [
              {
                amount: taskDoc.payouts[0].amount,
                token: {
                  address: taskDoc.payouts[0].tokenAddress,
                },
              },
              {
                amount: taskDoc.payouts[1].amount,
                token: {
                  address: taskDoc.payouts[1].tokenAddress,
                },
              },
            ],
          },
        },
        errors: undefined,
      })
    })

    it('token', async () => {
      await insertDocs(db, {
        tokens: [token1Doc],
      })

      await expect(
        query({
          query: gql`
            query token($address: String!) {
              token(address: $address) {
                address
                info {
                  decimals
                  name
                  symbol
                }
              }
            }
          `,
          variables: {
            address: token1Doc.address,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          token: {
            address: token1Doc.address,
            info: {
              decimals: token1Doc.decimals,
              name: token1Doc.name,
              symbol: token1Doc.symbol,
            },
          },
        },
        errors: undefined,
      })
    })

    it('allTokens', async () => {
      await insertDocs(db, {
        tokens: [token1Doc, token2Doc, token3Doc],
      })

      await expect(
        query({
          query: gql`
            query {
              allTokens {
                address
                info {
                  decimals
                  name
                  symbol
                }
              }
            }
          `,
        }),
      ).resolves.toMatchObject({
        data: {
          allTokens: [
            // This document is from seeded data when the collection was created
            {
              address: '0x0000000000000000000000000000000000000000',
              info: {
                name: 'Ether',
                decimals: 18,
                symbol: 'ETH',
              },
            },
            {
              address: token1Doc.address,
              info: {
                name: token1Doc.name,
                decimals: token1Doc.decimals,
                symbol: token1Doc.symbol,
              },
            },
            {
              address: token2Doc.address,
              info: {
                name: token2Doc.name,
                decimals: token2Doc.decimals,
                symbol: token2Doc.symbol,
              },
            },
            {
              address: token3Doc.address,
              info: {
                name: token3Doc.name,
                decimals: token3Doc.decimals,
                symbol: token3Doc.symbol,
              },
            },
          ],
        },
        errors: undefined,
      })
    })
  })

  describe('Colony', () => {
    it('tokens', async () => {
      const colonyDoc = {
        colonyAddress: 'colony address',
        colonyName: 'colony name',
        founderAddress: user1Doc.walletAddress,
        taskIds: [],
        nativeTokenAddress: token1Doc.address,
        isNativeTokenExternal: false,
        tokenAddresses: [token1Doc.address, token2Doc.address],
      }

      await insertDocs(db, {
        tokens: [token1Doc, token2Doc, token3Doc],
        colonies: [colonyDoc],
      })

      await expect(
        query({
          query: gql`
            query colonyTokens($colonyAddress: String!) {
              colony(address: $colonyAddress) {
                tokens {
                  address
                  info {
                    decimals
                    name
                    symbol
                  }
                }
              }
            }
          `,
          variables: { colonyAddress: colonyDoc.colonyAddress },
        }),
      ).resolves.toMatchObject({
        data: {
          colony: {
            tokens: [
              // This document is from seeded data when the collection was created
              {
                address: '0x0000000000000000000000000000000000000000',
                info: {
                  name: 'Ether',
                  decimals: 18,
                  symbol: 'ETH',
                },
              },
              {
                address: token1Doc.address,
                info: {
                  name: token1Doc.name,
                  decimals: token1Doc.decimals,
                  symbol: token1Doc.symbol,
                },
              },
              {
                address: token2Doc.address,
                info: {
                  name: token2Doc.name,
                  decimals: token2Doc.decimals,
                  symbol: token2Doc.symbol,
                },
              },
              // token3 should not have been included because it is not
              // in the tokenAddresses of this colony
            ],
          },
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

    it('subscribeToColony', async () => {
      await insertDocs(db, {
        users: [{ ...user1Doc, colonyAddresses: [] }],
        colonies: [colonyDoc],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation subscribeToColony($input: SubscribeToColonyInput!) {
              subscribeToColony(input: $input) {
                id
                colonies {
                  id
                }
              }
            }
          `,
          variables: {
            input: { colonyAddress: colonyDoc.colonyAddress },
          },
        }),
      ).resolves.toMatchObject({
        data: {
          subscribeToColony: {
            id: user1Doc.walletAddress,
            colonies: [{ id: colonyDoc.colonyAddress }],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).not.toHaveBeenCalled()
    })

    it('unsubscribeFromColony', async () => {
      await insertDocs(db, {
        users: [{ ...user1Doc, colonyAddresses: [colonyDoc.colonyAddress] }],
        colonies: [colonyDoc],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation unsubscribeFromColony(
              $input: UnsubscribeFromColonyInput!
            ) {
              unsubscribeFromColony(input: $input) {
                id
                colonies {
                  id
                }
              }
            }
          `,
          variables: {
            input: { colonyAddress: colonyDoc.colonyAddress },
          },
        }),
      ).resolves.toMatchObject({
        data: {
          unsubscribeFromColony: {
            id: user1Doc.walletAddress,
            colonies: [],
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

    it('createColony', async () => {
      await insertDocs(db, {
        users: [user1Doc],
      })

      const createColonyInput = {
        colonyAddress: 'colony address',
        colonyName: 'c1',
        displayName: 'Colony 1',
        tokenAddress: '0xT',
        tokenDecimals: 18,
        tokenName: 'Token',
        tokenIsExternal: false,
        tokenSymbol: 'TKN',
      }

      await expect(
        mutate({
          mutation: gql`
            mutation createColony($input: CreateColonyInput!) {
              createColony(input: $input) {
                id
                colonyAddress
                colonyName
                displayName
                isNativeTokenExternal
                nativeTokenAddress
                tokenAddresses
              }
            }
          `,
          variables: {
            input: createColonyInput,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          createColony: {
            id: createColonyInput.colonyAddress,
            colonyAddress: colonyDoc.colonyAddress,
            colonyName: createColonyInput.colonyName,
            displayName: createColonyInput.displayName,
            nativeTokenAddress: createColonyInput.tokenAddress,
            isNativeTokenExternal: createColonyInput.tokenIsExternal,
            tokenAddresses: [createColonyInput.tokenAddress],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertColonyExists).toHaveBeenCalledWith('colony address')
    })

    it('setColonyTokens', async () => {
      await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        tokens: [token1Doc, token2Doc],
      })

      const setColonyTokensInput = {
        colonyAddress: colonyDoc.colonyAddress,
        tokenAddresses: [token1Doc.address, token2Doc.address],
      }

      await expect(
        mutate({
          mutation: gql`
            mutation setColonyTokens($input: SetColonyTokensInput!) {
              setColonyTokens(input: $input) {
                id
                tokenAddresses
              }
            }
          `,
          variables: {
            input: setColonyTokensInput,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          setColonyTokens: {
            id: setColonyTokensInput.colonyAddress,
            tokenAddresses: setColonyTokensInput.tokenAddresses,
          },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetColonyTokens).toHaveBeenCalledWith({
        colonyAddress: setColonyTokensInput.colonyAddress,
        userAddress: user1Doc.walletAddress,
      })
    })

    it('createTask', async () => {
      await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation createTask($input: CreateTaskInput!) {
              createTask(input: $input) {
                id
                colonyAddress
                ethDomainId
              }
            }
          `,
          variables: {
            input: { colonyAddress: colonyDoc.colonyAddress, ethDomainId: 1 },
          },
        }),
      ).resolves.toMatchObject({
        data: {
          createTask: {
            id: expect.toBeString(),
            colonyAddress: colonyDoc.colonyAddress,
            ethDomainId: 1,
          },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanCreateTask).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('setTaskDomain', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [
          rootDomainDoc,
          {
            colonyAddress: colonyDoc.colonyAddress,
            ethDomainId: 2,
            ethParentDomainId: 1,
            name: 'another domain',
          },
        ],
        tasks: [taskDoc],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation setTaskTitle($input: SetTaskDomainInput!) {
              setTaskDomain(input: $input) {
                id
                ethDomainId
              }
            }
          `,
          variables: { input: { id, ethDomainId: 2 } },
        }),
      ).resolves.toMatchObject({
        data: { setTaskDomain: { id, ethDomainId: 2 } },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetTaskDomain).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        currentDomainId: 1,
        newDomainId: 2,
      })
    })

    it('setTaskDescription', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
      })

      const description = 'new task description'

      await expect(
        mutate({
          mutation: gql`
            mutation setTaskDescription($input: SetTaskDescriptionInput!) {
              setTaskDescription(input: $input) {
                id
                description
              }
            }
          `,
          variables: { input: { id, description } },
        }),
      ).resolves.toMatchObject({
        data: { setTaskDescription: { id, description } },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetTaskDescription).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('setTaskTitle', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
      })

      const title = 'new task title'

      await expect(
        mutate({
          mutation: gql`
            mutation setTaskTitle($input: SetTaskTitleInput!) {
              setTaskTitle(input: $input) {
                id
                title
              }
            }
          `,
          variables: { input: { id, title } },
        }),
      ).resolves.toMatchObject({
        data: { setTaskTitle: { id, title } },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetTaskTitle).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('setTaskDueDate', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
      })

      const dueDate = '2019-12-13T15:53:59.196Z'

      await expect(
        mutate({
          mutation: gql`
            mutation setTaskDueDate($input: SetTaskDueDateInput!) {
              setTaskDueDate(input: $input) {
                id
                dueDate
              }
            }
          `,
          variables: { input: { id, dueDate } },
        }),
      ).resolves.toMatchObject({
        data: { setTaskDueDate: { id, dueDate } },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetTaskDueDate).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('createWorkRequest', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation createWorkRequest($input: CreateWorkRequestInput!) {
              createWorkRequest(input: $input) {
                id
                workRequestAddresses
              }
            }
          `,
          variables: { input: { id } },
        }),
      ).resolves.toMatchObject({
        data: {
          createWorkRequest: { id, workRequestAddresses: [ctxUserAddress] },
        },
        errors: undefined,
      })

      expect(tryAuth).not.toHaveBeenCalled()
    })

    it('sendWorkInvite', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation sendWorkInvite($input: SendWorkInviteInput!) {
              sendWorkInvite(input: $input) {
                id
                workInviteAddresses
              }
            }
          `,
          variables: { input: { id, workerAddress: user2Doc.walletAddress } },
        }),
      ).resolves.toMatchObject({
        data: {
          sendWorkInvite: { id, workInviteAddresses: [user2Doc.walletAddress] },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSendWorkInvite).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('setTaskPayout', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
        tokens: [token1Doc],
      })

      const amount = '100'
      const tokenAddress = token1Doc.address

      await expect(
        mutate({
          mutation: gql`
            mutation setTaskPayout($input: SetTaskPayoutInput!) {
              setTaskPayout(input: $input) {
                id
                payouts {
                  amount
                  tokenAddress
                }
                events {
                  type
                }
              }
            }
          `,
          variables: { input: { id, amount, tokenAddress } },
        }),
      ).resolves.toMatchObject({
        data: {
          setTaskPayout: {
            id,
            payouts: [{ amount, tokenAddress }],
            events: [{ type: EventType.SetTaskPayout }],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetTaskPayout).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('removeTaskPayout', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
        tokens: [token1Doc],
      })

      const amount = '100'
      const tokenAddress = token1Doc.address

      await expect(
        mutate({
          mutation: gql`
            mutation removeTaskPayout($input: RemoveTaskPayoutInput!) {
              removeTaskPayout(input: $input) {
                id
                payouts {
                  amount
                  tokenAddress
                }
                events {
                  type
                }
              }
            }
          `,
          variables: { input: { id, amount, tokenAddress } },
        }),
      ).resolves.toMatchObject({
        data: {
          removeTaskPayout: {
            id,
            payouts: [],
            events: [{ type: EventType.RemoveTaskPayout }],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanRemoveTaskPayout).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('assignWorker', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc, user2Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
      })

      const workerAddress = user2Doc.walletAddress

      await expect(
        mutate({
          mutation: gql`
            mutation assignWorker($input: AssignWorkerInput!) {
              assignWorker(input: $input) {
                id
                assignedWorkerAddress
                events {
                  type
                }
              }
            }
          `,
          variables: { input: { id, workerAddress } },
        }),
      ).resolves.toMatchObject({
        data: {
          assignWorker: {
            id,
            assignedWorkerAddress: workerAddress,
            events: [{ type: EventType.AssignWorker }],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanAssignWorker).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('unassignWorker', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc, user2Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
      })

      const workerAddress = user2Doc.walletAddress

      await expect(
        mutate({
          mutation: gql`
            mutation unassignWorker($input: UnassignWorkerInput!) {
              unassignWorker(input: $input) {
                id
                assignedWorkerAddress
                events {
                  type
                }
              }
            }
          `,
          variables: { input: { id, workerAddress } },
        }),
      ).resolves.toMatchObject({
        data: {
          unassignWorker: {
            id,
            assignedWorkerAddress: null,
            events: [{ type: EventType.UnassignWorker }],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanUnassignWorker).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('finalizeTask', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc, user2Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tokens: [token1Doc],
        tasks: [
          {
            ...taskDoc,
            assignedWorkerAddress: user2Doc.walletAddress,
            payouts: [{ amount: '100', tokenAddress: token1Doc.address }],
          },
        ],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation finalizeTask($input: TaskIdInput!) {
              finalizeTask(input: $input) {
                id
                finalizedAt
                events {
                  type
                }
              }
            }
          `,
          variables: { input: { id } },
        }),
      ).resolves.toMatchObject({
        data: {
          finalizeTask: {
            id,
            finalizedAt: expect.toBeString(),
            events: [{ type: EventType.FinalizeTask }],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanFinalizeTask).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('cancelTask', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation cancelTask($input: TaskIdInput!) {
              cancelTask(input: $input) {
                id
                cancelledAt
                events {
                  type
                }
              }
            }
          `,
          variables: { input: { id } },
        }),
      ).resolves.toMatchObject({
        data: {
          cancelTask: {
            id,
            cancelledAt: expect.toBeString(),
            events: [{ type: EventType.CancelTask }],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanCancelTask).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('createToken', async () => {
      await insertDocs(db, {
        users: [user1Doc],
      })

      const tokenInput = {
        address: 'token address',
        name: 'token name',
        symbol: 'token symbol',
        decimals: 18,
        iconHash: 'icon hash',
      }

      await expect(
        mutate({
          mutation: gql`
            mutation createToken($input: CreateTokenInput!) {
              createToken(input: $input) {
                address
                iconHash
                info {
                  name
                  symbol
                  decimals
                }
              }
            }
          `,
          variables: {
            input: tokenInput,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          createToken: {
            address: tokenInput.address,
            iconHash: tokenInput.iconHash,
            info: {
              name: tokenInput.name,
              symbol: tokenInput.symbol,
              decimals: tokenInput.decimals,
            },
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
        events: [{ type: EventType.CreateDomain }],
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
        events: [eventId1, eventId2, eventId3, eventId4],
      } = await insertDocs(db, {
        users: [user1Doc, user2Doc],
        events: [
          { type: EventType.CreateDomain },
          { type: EventType.CreateTask },
          { type: EventType.CancelTask },
          { type: EventType.FinalizeTask },
        ],
      })

      // Notifications for user1/user2
      const {
        notifications: [id1, id2, id3, id4],
      } = await insertDocs(db, {
        notifications: [
          {
            eventId: new ObjectID(eventId1),
            users: [{ address: ctxUserAddress, read: false }],
          },
          {
            eventId: new ObjectID(eventId2),
            users: [{ address: ctxUserAddress, read: false }],
          },
          {
            eventId: new ObjectID(eventId3),
            users: [{ address: user2Doc.walletAddress, read: false }],
          },
          {
            eventId: new ObjectID(eventId4),
            users: [
              { address: ctxUserAddress, read: true },
              { address: user2Doc.walletAddress, read: false },
            ],
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
              { id: id2, event: { type: EventType.CreateTask }, read: true },
              { id: id4, event: { type: EventType.FinalizeTask }, read: true },
            ],
          },
        },
        errors: undefined,
      })

      // For the other user (user1): should be unread
      ctxUserAddress = user2Doc.walletAddress
      await expect(
        query({
          query: notificationsQuery,
          variables: { address: user2Doc.walletAddress },
        }),
      ).resolves.toMatchObject({
        data: {
          user: {
            id: user2Doc.walletAddress,
            notifications: [
              { id: id3, event: { type: EventType.CancelTask }, read: false },
              { id: id4, event: { type: EventType.FinalizeTask }, read: false },
            ],
          },
        },
        errors: undefined,
      })
      ctxUserAddress = user1Doc.walletAddress

      expect(tryAuth).not.toHaveBeenCalled()
    })

    it('sendTaskMessage', async () => {
      const {
        tasks: [id],
      } = await insertDocs(db, {
        users: [user1Doc, user2Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        tasks: [taskDoc],
      })

      const message = 'hello @user2'

      await expect(
        mutate({
          mutation: gql`
            mutation sendTaskMessage($input: SendTaskMessageInput!) {
              sendTaskMessage(input: $input)
            }
          `,
          variables: { input: { id, message } },
        }),
      ).resolves.toMatchObject({
        data: { sendTaskMessage: true },
        errors: undefined,
      })

      // The task should have an event
      await expect(
        query({
          query: gql`
            query task($id: String!) {
              task(id: $id) {
                id
                events {
                  type
                }
              }
            }
          `,
          variables: { id },
        }),
      ).resolves.toMatchObject({
        data: {
          task: {
            id,
            events: [{ type: EventType.TaskMessage }],
          },
        },
        errors: undefined,
      })

      // The mentioned user should have a notification
      ctxUserAddress = user2Doc.walletAddress
      await expect(
        query({
          query: gql`
            query user($address: String!) {
              user(address: $address) {
                id
                notifications {
                  event {
                    type
                    context {
                      ... on TaskMessageEvent {
                        taskId
                        message
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { address: user2Doc.walletAddress },
        }),
      ).resolves.toMatchObject({
        data: {
          user: {
            id: user2Doc.walletAddress,
            notifications: [
              {
                event: {
                  type: EventType.TaskMessage,
                  context: { message, taskId: id },
                },
              },
            ],
          },
        },
        errors: undefined,
      })
      ctxUserAddress = user1Doc.walletAddress

      expect(tryAuth).not.toHaveBeenCalled()
    })

    it('createDomain', async () => {
      await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
      })

      const domainInput = {
        name: 'My domain',
        ethDomainId: 2,
        ethParentDomainId: 1,
        colonyAddress: colonyDoc.colonyAddress,
      }

      await expect(
        mutate({
          mutation: gql`
            mutation createDomain($input: CreateDomainInput!) {
              createDomain(input: $input) {
                name
                ethDomainId
                ethParentDomainId
                colonyAddress
              }
            }
          `,
          variables: { input: domainInput },
        }),
      ).resolves.toMatchObject({
        data: { createDomain: domainInput },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanCreateDomain).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 2,
        parentDomainId: 1,
      })
    })

    it('editDomainName', async () => {
      await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [
          rootDomainDoc,
          {
            colonyAddress: colonyDoc.colonyAddress,
            ethDomainId: 2,
            ethParentDomainId: 1,
            name: 'old domain name',
          },
        ],
      })

      const name = 'new domain name'

      await expect(
        mutate({
          mutation: gql`
            mutation editDomainName($input: EditDomainNameInput!) {
              editDomainName(input: $input) {
                name
              }
            }
          `,
          variables: {
            input: {
              ethDomainId: 2,
              colonyAddress: colonyDoc.colonyAddress,
              name,
            },
          },
        }),
      ).resolves.toMatchObject({
        data: { editDomainName: { name } },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanEditDomainName).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 2,
      })
    })
  })
})
