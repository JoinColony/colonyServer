import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { DocumentNode } from 'graphql'
import { mocked } from 'ts-jest/utils'

import { ColonyMongoApi } from '../../db/colonyMongoApi'
import { ColonyMongoDataSource } from '../../db/colonyMongoDataSource'
import { ColonyAuthDataSource } from '../../network/colonyAuthDataSource'

jest.mock('../../db/colonyMongoApi')
jest.mock('../../db/colonyMongoDataSource')
jest.mock('../../network/colonyAuthDataSource')
jest.mock('../resolvers/auth')

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

describe('Apollo Server', () => {
  const api = new ColonyMongoApi({} as any)
  const data = new ColonyMongoDataSource([])
  const auth = new ColonyAuthDataSource({} as any)

  const ctxUserAddress = 'user address from context'

  beforeEach(() => {
    jest.resetAllMocks()

    mocked(data.getTaskById).mockImplementation(
      async () =>
        ({
          colonyAddress: 'colony address',
          ethDomainId: 1,
          id: 'task id',
        } as any),
    )
  })

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
  const runMutation = async (node: DocumentNode) => mutate({ mutation: node })
  const runQuery = async (node: DocumentNode) => query({ query: node })

  describe('Query', () => {
    it('user', async () => {
      await runQuery(gql`
        query {
          user(address: "colony address") {
            id
          }
        }
      `)

      expect(data.getUserByAddress).toHaveBeenCalledWith('colony address')
    })

    it('colony', async () => {
      await runQuery(gql`
        query {
          colony(address: "colony address") {
            id
          }
        }
      `)

      expect(data.getColonyByAddress).toHaveBeenCalledWith('colony address')
    })

    it('domain', async () => {
      await runQuery(gql`
        query {
          domain(colonyAddress: "colony address", ethDomainId: 1) {
            id
          }
        }
      `)

      expect(data.getDomainByEthId).toHaveBeenCalledWith('colony address', 1)
    })

    it('task', async () => {
      await runQuery(gql`
        query {
          task(id: "task id") {
            id
          }
        }
      `)

      expect(data.getTaskById).toHaveBeenCalledWith('task id')
    })

    it('token', async () => {
      await runQuery(gql`
        query {
          token(address: "colony address") {
            id
          }
        }
      `)

      expect(data.getTokenByAddress).toHaveBeenCalledWith('colony address')
    })
  })

  describe('Mutation', () => {
    it('createUser', async () => {
      await runMutation(gql`
        mutation {
          createUser(input: { username: "u1" }) {
            id
          }
        }
      `)

      expect(api.createUser).toHaveBeenCalledWith(ctxUserAddress, 'u1')
      expect(data.getUserByAddress).toHaveBeenCalledWith(ctxUserAddress)
    })

    it('editUser', async () => {
      await runMutation(gql`
        mutation {
          editUser(input: { displayName: "User 1" }) {
            id
          }
        }
      `)

      expect(api.editUser).toHaveBeenCalledWith(ctxUserAddress, {
        displayName: 'User 1',
      })
      expect(data.getUserByAddress).toHaveBeenCalledWith(ctxUserAddress)
    })

    it('subscribeToColony', async () => {
      await runMutation(gql`
        mutation {
          subscribeToColony(input: { colonyAddress: "colony address" }) {
            id
          }
        }
      `)

      expect(api.subscribeToColony).toHaveBeenCalledWith(
        ctxUserAddress,
        'colony address',
      )
      expect(data.getUserByAddress).toHaveBeenCalledWith(ctxUserAddress)
    })

    it('unsubscribeFromColony', async () => {
      await runMutation(gql`
        mutation {
          unsubscribeFromColony(input: { colonyAddress: "colony address" }) {
            id
          }
        }
      `)

      expect(api.unsubscribeFromColony).toHaveBeenCalledWith(
        ctxUserAddress,
        'colony address',
      )
      expect(data.getUserByAddress).toHaveBeenCalledWith(ctxUserAddress)
    })

    it('createColony', async () => {
      await runMutation(gql`
        mutation {
          createColony(
            input: {
              colonyAddress: "colony address"
              colonyName: "c1"
              displayName: "Colony 1"
              tokenAddress: "0xT"
              tokenDecimals: 18
              tokenName: "Token"
              tokenSymbol: "TKN"
            }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertColonyExists).toHaveBeenCalledWith('colony address')
      expect(api.createColony).toHaveBeenCalledWith(
        ctxUserAddress,
        'colony address',
        'c1',
        'Colony 1',
        '0xT',
        'Token',
        'TKN',
        18,
        undefined,
      )
      expect(data.getColonyByAddress).toHaveBeenCalledWith('colony address')
    })

    it('createTask', async () => {
      await runMutation(gql`
        mutation {
          createTask(
            input: { colonyAddress: "colony address", ethDomainId: 1 }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanCreateTask).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.createTask).toHaveBeenCalledWith(
        ctxUserAddress,
        'colony address',
        1,
      )
    })

    it('setTaskDomain', async () => {
      await runMutation(gql`
        mutation {
          setTaskDomain(input: { id: "task id", ethDomainId: 2 }) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetTaskDomain).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        currentDomainId: 1,
        newDomainId: 2,
      })
      expect(api.setTaskDomain).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
        2,
      )
    })

    it('setTaskDescription', async () => {
      await runMutation(gql`
        mutation {
          setTaskDescription(
            input: { id: "task id", description: "task description" }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetTaskDescription).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.setTaskDescription).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
        'task description',
      )
    })

    it('setTaskTitle', async () => {
      await runMutation(gql`
        mutation {
          setTaskTitle(input: { id: "task id", title: "task title" }) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetTaskTitle).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.setTaskTitle).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
        'task title',
      )
    })

    it('setTaskDueDate', async () => {
      await runMutation(gql`
        mutation {
          setTaskDueDate(
            input: { id: "task id", dueDate: "2019-12-13T15:53:59.196Z" }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetTaskDueDate).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.setTaskDueDate).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
        new Date('2019-12-13T15:53:59.196Z'),
      )
    })

    it('createWorkRequest', async () => {
      await runMutation(gql`
        mutation {
          createWorkRequest(input: { id: "task id" }) {
            id
          }
        }
      `)

      expect(tryAuth).not.toHaveBeenCalled()
      expect(api.createWorkRequest).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
      )
    })

    it('sendWorkInvite', async () => {
      await runMutation(gql`
        mutation {
          sendWorkInvite(
            input: { id: "task id", workerAddress: "worker address" }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSendWorkInvite).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.sendWorkInvite).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
        'worker address',
      )
    })

    it('setTaskPayout', async () => {
      await runMutation(gql`
        mutation {
          setTaskPayout(
            input: {
              id: "task id"
              amount: "100"
              tokenAddress: "token address"
            }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanSetTaskPayout).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.setTaskPayout).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
        '100',
        'token address',
      )
    })

    it('removeTaskPayout', async () => {
      await runMutation(gql`
        mutation {
          removeTaskPayout(
            input: {
              id: "task id"
              amount: "100"
              tokenAddress: "token address"
            }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanRemoveTaskPayout).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.removeTaskPayout).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
        '100',
        'token address',
      )
    })

    it('assignWorker', async () => {
      await runMutation(gql`
        mutation {
          assignWorker(
            input: { id: "task id", workerAddress: "worker address" }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanAssignWorker).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.assignWorker).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
        'worker address',
      )
    })

    it('unassignWorker', async () => {
      await runMutation(gql`
        mutation {
          unassignWorker(
            input: { id: "task id", workerAddress: "worker address" }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanUnassignWorker).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.unassignWorker).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
        'worker address',
      )
    })

    it('finalizeTask', async () => {
      await runMutation(gql`
        mutation {
          finalizeTask(input: { id: "task id" }) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanFinalizeTask).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.finalizeTask).toHaveBeenCalledWith(ctxUserAddress, 'task id')
    })

    it('cancelTask', async () => {
      await runMutation(gql`
        mutation {
          cancelTask(input: { id: "task id" }) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanCancelTask).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 1,
      })
      expect(api.cancelTask).toHaveBeenCalledWith(ctxUserAddress, 'task id')
    })

    it('createToken', async () => {
      await runMutation(gql`
        mutation {
          createToken(
            input: {
              address: "token address"
              name: "token name"
              symbol: "token symbol"
              decimals: 18
              iconHash: "icon hash"
            }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).not.toHaveBeenCalled()
      expect(api.createToken).toHaveBeenCalledWith(
        ctxUserAddress,
        'token address',
        'token name',
        'token symbol',
        18,
        'icon hash',
      )
    })

    it('addColonyTokenReference', async () => {
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

    it('setColonyTokenAvatar', async () => {
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

    it('setUserTokens', async () => {
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
      await runMutation(gql`
        mutation {
          markNotificationAsRead(input: { id: "notification id" })
        }
      `)

      expect(tryAuth).not.toHaveBeenCalled()
      expect(api.markNotificationAsRead).toHaveBeenCalledWith(
        ctxUserAddress,
        'notification id',
      )
    })

    it('markAllNotificationsAsRead', async () => {
      await runMutation(gql`
        mutation {
          markAllNotificationsAsRead
        }
      `)

      expect(tryAuth).not.toHaveBeenCalled()
      expect(api.markAllNotificationsAsRead).toHaveBeenCalledWith(
        ctxUserAddress,
      )
    })

    it('sendTaskMessage', async () => {
      await runMutation(gql`
        mutation {
          sendTaskMessage(input: { id: "task id", message: "task message" })
        }
      `)

      expect(tryAuth).not.toHaveBeenCalled()
      expect(api.sendTaskMessage).toHaveBeenCalledWith(
        ctxUserAddress,
        'task id',
        'task message',
      )
    })

    it('createDomain', async () => {
      await runMutation(gql`
        mutation {
          createDomain(
            input: {
              colonyAddress: "colony address"
              ethDomainId: 2
              ethParentDomainId: 1
              name: "domain name"
            }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanCreateDomain).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 2,
        parentDomainId: 1,
      })
      expect(api.createDomain).toHaveBeenCalledWith(
        ctxUserAddress,
        'colony address',
        2,
        1,
        'domain name',
      )
    })

    it('editDomainName', async () => {
      await runMutation(gql`
        mutation {
          editDomainName(
            input: {
              colonyAddress: "colony address"
              ethDomainId: 2
              name: "new domain name"
            }
          ) {
            id
          }
        }
      `)

      expect(tryAuth).toHaveBeenCalled()
      expect(auth.assertCanEditDomainName).toHaveBeenCalledWith({
        colonyAddress: 'colony address',
        userAddress: ctxUserAddress,
        domainId: 2,
      })
      expect(api.editDomainName).toHaveBeenCalledWith(
        ctxUserAddress,
        'colony address',
        2,
        'new domain name',
      )
    })
  })
})
