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
  tokenRefs: [],
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
const tokenDoc: Omit<TokenDoc, '_id'> = {
  address: 'token address',
  name: 'Token name',
  symbol: 'TKN',
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

  /** @deprecated */
  const runMutation = async (node: DocumentNode) => mutate({ mutation: node })

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
      const {
        tasks: [id],
      } = await insertDocs(db, {
        tasks: [taskDoc],
      })

      await expect(
        query({
          query: gql`
            query task($id: String!) {
              task(id: $id) {
                id
                ethDomainId
                colonyAddress
                creatorAddress
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
            ethDomainId: taskDoc.ethDomainId,
            colonyAddress: taskDoc.colonyAddress,
            creatorAddress: taskDoc.creatorAddress,
          },
        },
        errors: undefined,
      })
    })

    it('token', async () => {
      await insertDocs(db, {
        tokens: [tokenDoc],
      })

      await expect(
        query({
          query: gql`
            query token($address: String!) {
              token(address: $address) {
                address
                decimals
                name
                symbol
              }
            }
          `,
          variables: {
            address: tokenDoc.address,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          token: {
            address: tokenDoc.address,
            decimals: tokenDoc.decimals,
            name: tokenDoc.name,
            symbol: tokenDoc.symbol,
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
                tokens {
                  address
                }
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
            tokens: [{ address: createColonyInput.tokenAddress }],
          },
        },
        errors: undefined,
      })

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertColonyExists).toHaveBeenCalledWith('colony address')
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
        tokens: [tokenDoc],
      })

      const amount = '100'
      const tokenAddress = tokenDoc.address

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
        tokens: [tokenDoc],
      })

      const amount = '100'
      const tokenAddress = tokenDoc.address

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
        tokens: [tokenDoc],
        tasks: [
          {
            ...taskDoc,
            assignedWorkerAddress: user2Doc.walletAddress,
            payouts: [{ amount: '100', tokenAddress: tokenDoc.address }],
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
                name
                symbol
                decimals
                iconHash
              }
            }
          `,
          variables: {
            input: tokenInput,
          },
        }),
      ).resolves.toMatchObject({
        data: {
          createToken: tokenInput,
        },
        errors: undefined,
      })

      expect(tryAuth).not.toHaveBeenCalled()
    })

    // TODO reinstate this test; API changing soon
    it.skip('addColonyTokenReference', async () => {
      await runMutation(gql`
        mutation {
          addColonyTokenReference(
            input: {
              tokenAddress: "token address"
              colonyAddress: "colony address"
              isExternal: false
              iconHash: "icon hash"
            }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanAddColonyTokenReference).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
      })
      expect(api.addColonyTokenReference).toHaveBeenCalledWith(
        ctxUserAddress,
        'colony address',
        'token address',
        false,
        'icon hash',
      )
    })

    // TODO reinstate this test; API changing soon
    it.skip('setColonyTokenAvatar', async () => {
      // Set to an icon hash
      await runMutation(gql`
        mutation {
          setColonyTokenAvatar(
            input: {
              tokenAddress: "token address"
              colonyAddress: "colony address"
              iconHash: "icon hash"
            }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanAddColonyTokenReference).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
      })
      expect(api.removeColonyTokenAvatar).not.toHaveBeenCalled()
      expect(api.setColonyTokenAvatar).toHaveBeenCalledWith(
        'colony address',
        'token address',
        'icon hash',
      )

      mocked(api.setColonyTokenAvatar).mockClear()

      // Remove the icon
      await runMutation(gql`
        mutation {
          setColonyTokenAvatar(
            input: {
              tokenAddress: "token address"
              colonyAddress: "colony address"
              iconHash: null
            }
          ) {
            id
          }
        }
      `)

      expect(api.setColonyTokenAvatar).not.toHaveBeenCalled()
      expect(api.removeColonyTokenAvatar).toHaveBeenCalledWith(
        'colony address',
        'token address',
      )
    })

    // TODO reinstate this test; API changing soon
    it.skip('setUserTokens', async () => {
      await runMutation(gql`
        mutation {
          setUserTokens(input: { tokens: ["token 1", "token 2"] }) {
            id
          }
        }
      `)

      expect(tryAuth).not.toHaveBeenCalled()
      expect(api.setUserTokens).toHaveBeenCalledWith(ctxUserAddress, [
        'token 1',
        'token 2',
      ])
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
