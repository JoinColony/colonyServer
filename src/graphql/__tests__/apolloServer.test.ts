import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { DocumentNode } from 'graphql'
import { mocked } from 'ts-jest/utils'
import { MongoClient, ObjectID } from 'mongodb'
import fs from 'fs'
import path from 'path'

import { ColonyMongoApi } from '../../db/colonyMongoApi'
import { ColonyMongoDataSource } from '../../db/colonyMongoDataSource'
import { ColonyAuthDataSource } from '../../network/colonyAuthDataSource'
import Colony from '../typeDefs/Colony'
import Domain from '../typeDefs/Domain'
import Event from '../typeDefs/Event'
import Mutation from '../typeDefs/Mutation'
import Query from '../typeDefs/Query'
import Suggestion from '../typeDefs/Suggestion'
import Task from '../typeDefs/Task'
import TokenInfo from '../typeDefs/TokenInfo'
import SystemInfo from '../typeDefs/SystemInfo'
import User from '../typeDefs/User'
import scalars from '../typeDefs/scalars'
import { resolvers } from '../resolvers'
import { tryAuth } from '../resolvers/auth'
import { insertDocs } from '../../testUtils'
import {
  ColonyDoc,
  DomainDoc,
  SuggestionDoc,
  TaskDoc,
  TokenDoc,
  UserDoc,
} from '../../db/types'
import { SuggestionStatus } from '../types'
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
  Suggestion,
  Task,
  TokenInfo,
  SystemInfo,
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
const suggestionDoc: Omit<SuggestionDoc, '_id'> = {
  colonyAddress: 'colony address',
  ethDomainId: 1,
  creatorAddress: user1Doc.walletAddress,
  upvotes: [],
  status: SuggestionStatus.Open,
  title: 'Take this!',
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
    // Use the MONGO_URL injected by jest-mongodb
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
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
                  tokenAddress
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
                tokenAddress: taskDoc.payouts[0].tokenAddress,
              },
              {
                amount: taskDoc.payouts[1].amount,
                tokenAddress: taskDoc.payouts[1].tokenAddress,
              },
            ],
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
                tokenAddresses
              }
            }
          `,
          variables: { colonyAddress: colonyDoc.colonyAddress },
        }),
      ).resolves.toMatchObject({
        data: {
          colony: {
            // token3 should not have been included because it is not
            // in the tokenAddresses of this colony
            tokenAddresses: [token1Doc.address, token2Doc.address],
          },
        },
        errors: undefined,
      })
    })

    it('suggestions', async () => {
      const {
        suggestions: [id],
      } = await insertDocs(db, {
        suggestions: [suggestionDoc],
      })

      const colonyDoc = {
        colonyAddress: 'colony address',
        colonyName: 'colony name',
        founderAddress: user1Doc.walletAddress,
        taskIds: [],
        nativeTokenAddress: token1Doc.address,
        isNativeTokenExternal: false,
        tokenAddresses: [],
        suggestions: [id],
      }

      await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
      })

      await expect(
        query({
          query: gql`
            query colonyTokens($colonyAddress: String!) {
              colony(address: $colonyAddress) {
                suggestions {
                  title
                  colonyAddress
                  ethDomainId
                  creatorAddress
                  upvotes
                  status
                  creator {
                    profile {
                      walletAddress
                    }
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
            suggestions: [
              {
                colonyAddress: suggestionDoc.colonyAddress,
                ethDomainId: suggestionDoc.ethDomainId,
                creatorAddress: suggestionDoc.creatorAddress,
                upvotes: [],
                title: suggestionDoc.title,
                status: suggestionDoc.status,
                creator: {
                  profile: {
                    walletAddress: user1Doc.walletAddress,
                  },
                },
              },
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

    it('createTaskFromSuggestion', async () => {
      const {
        suggestions: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        domains: [rootDomainDoc],
        suggestions: [suggestionDoc],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation createTaskFromSuggestion(
              $input: CreateTaskFromSuggestionInput!
            ) {
              createTaskFromSuggestion(input: $input) {
                id
                title
              }
            }
          `,
          variables: {
            input: { id },
          },
        }),
      ).resolves.toMatchObject({
        data: {
          createTaskFromSuggestion: {
            id: expect.toBeString(),
            title: suggestionDoc.title,
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
            mutation finalizeTask($input: FinalizeTaskInput!) {
              finalizeTask(input: $input) {
                id
                finalizedAt
                events {
                  type
                }
              }
            }
          `,
          variables: { input: { id, ethPotId: 1 } },
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
              { id: id4, event: { type: EventType.FinalizeTask }, read: true },
              { id: id2, event: { type: EventType.CreateTask }, read: true },
              { id: id1, event: { type: EventType.CreateDomain }, read: true },
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
              { id: id4, event: { type: EventType.FinalizeTask }, read: false },
              { id: id3, event: { type: EventType.CancelTask }, read: false },
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

    it('createSuggestion', async () => {
      await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
      })

      const suggestionInput = {
        colonyAddress: colonyDoc.colonyAddress,
        ethDomainId: 1,
        title: 'Suggest this!',
      }

      await expect(
        mutate({
          mutation: gql`
            mutation createSuggestion($input: CreateSuggestionInput!) {
              createSuggestion(input: $input) {
                title
                ethDomainId
                colonyAddress
                status
              }
            }
          `,
          variables: { input: suggestionInput },
        }),
      ).resolves.toMatchObject({
        data: { createSuggestion: { ...suggestionInput, status: 'Open' } },
        errors: undefined,
      })
    })

    it('setSuggestionStatus', async () => {
      const {
        suggestions: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        suggestions: [suggestionDoc],
      })

      const suggestionInput = {
        id,
        status: 'NotPlanned',
      }

      await expect(
        mutate({
          mutation: gql`
            mutation setSuggestionStatus($input: SetSuggestionStatusInput!) {
              setSuggestionStatus(input: $input) {
                status
              }
            }
          `,
          variables: {
            input: suggestionInput,
          },
        }),
      ).resolves.toMatchObject({
        data: { setSuggestionStatus: { status: 'NotPlanned' } },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanModifySuggestionStatus).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
    })

    it('setSuggestionStatus delete (no need for auth)', async () => {
      const {
        suggestions: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        suggestions: [{ ...suggestionDoc, creatorAddress: ctxUserAddress }],
      })

      const suggestionInput = {
        id,
        status: 'Deleted',
      }

      await expect(
        mutate({
          mutation: gql`
            mutation setSuggestionStatus($input: SetSuggestionStatusInput!) {
              setSuggestionStatus(input: $input) {
                status
              }
            }
          `,
          variables: {
            input: suggestionInput,
          },
        }),
      ).resolves.toMatchObject({
        data: { setSuggestionStatus: { status: 'Deleted' } },
        errors: undefined,
      })

      expect(tryAuth).not.toHaveBeenCalled()
      expect(auth.assertCanModifySuggestionStatus).not.toHaveBeenCalled()
    })

    it('addUpvoteToSuggestion', async () => {
      const {
        suggestions: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        suggestions: [suggestionDoc],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation addUpvoteToSuggestion(
              $input: AddUpvoteToSuggestionInput!
            ) {
              addUpvoteToSuggestion(input: $input) {
                upvotes
              }
            }
          `,
          variables: {
            input: { id },
          },
        }),
      ).resolves.toMatchObject({
        data: { addUpvoteToSuggestion: { upvotes: [ctxUserAddress] } },
        errors: undefined,
      })
    })

    it('removeUpvoteFromSuggestion', async () => {
      const {
        suggestions: [id],
      } = await insertDocs(db, {
        users: [user1Doc],
        colonies: [colonyDoc],
        suggestions: [{ ...suggestionDoc, upvotes: [ctxUserAddress] }],
      })

      await expect(
        mutate({
          mutation: gql`
            mutation removeUpvoteFromSuggestion(
              $input: RemoveUpvoteFromSuggestionInput!
            ) {
              removeUpvoteFromSuggestion(input: $input) {
                upvotes
              }
            }
          `,
          variables: {
            input: { id },
          },
        }),
      ).resolves.toMatchObject({
        data: { removeUpvoteFromSuggestion: { upvotes: [] } },
        errors: undefined,
      })
    })
  })
})
