import { v4 as uuidv4 } from 'uuid'

import {
  getTransactionMessages,
  getTransactionMessagesCount,
  getSubscribedUsers,
} from './Query'
import { SubscriptionLabel } from '../subscriptionTypes'

/*
 * @NOTE Subscription Database Initialization Race Condition
 *
 * There's a race condition on the initial server startup, where, if the first
 * thing the server receives is a subscription request (not a query or mutation)
 * the database will not be yet initialized, and the first subscription response
 * will be a mongo collections error.
 *
 * After a query/mutation has been fired, the database gets initialized properly
 * and all subsequent subscriptions work as expected. Note that this is relevant
 * only to the first server boot up, not to every subscription request.
 *
 * In the case of the dapp this is irrelevant as all subscription requests will
 * only be made well after a bunch of queries and mutation have been fired,
 * meaning the database has been properly initialized.
 */
export const subscription = (pubsub) => ({
  transactionMessages: {
    resolve: async ({ transactionHash }, args, { dataSources: { data } }) =>
      await getTransactionMessages(transactionHash, data),
    subscribe: (args, { transactionHash }) => {
      /*
       * @NOTE We need a client id to publish the subscription to, otherwise
       * each new client subscription will reset and re-send all the subscription
       * data out again
       */
      const id = uuidv4()
      process.nextTick(() => pubsub.publish(id, { transactionHash }))
      return pubsub.asyncIterator([
        id,
        SubscriptionLabel.TransactionMessageAdded,
        SubscriptionLabel.TransactionMessageDeleted,
        SubscriptionLabel.UserWasBanned,
        SubscriptionLabel.UserWasUnBanned,
      ])
    },
  },
  transactionMessagesCount: {
    resolve: async ({ colonyAddress }, args, { dataSources: { data } }) =>
      await getTransactionMessagesCount(colonyAddress, data),
    subscribe: (args, { colonyAddress }) => {
      /*
       * @NOTE We need a client id to publish the subscription to, otherwise
       * each new client subscription will reset and re-send all the subscription
       * data out again
       */
      const id = uuidv4()
      process.nextTick(() => pubsub.publish(id, { colonyAddress }))
      return pubsub.asyncIterator([
        id,
        SubscriptionLabel.TransactionMessageAdded,
        SubscriptionLabel.TransactionMessageDeleted,
        SubscriptionLabel.UserWasBanned,
        SubscriptionLabel.UserWasUnBanned,
      ])
    },
  },
  subscribedUsers: {
    resolve: async ({ colonyAddress }, args, { dataSources: { data } }) =>
      await getSubscribedUsers(colonyAddress, data),
    subscribe: (args, { colonyAddress }) => {
      /*
       * @NOTE We need a client id to publish the subscription to, otherwise
       * each new client subscription will reset and re-send all the subscription
       * data out again
       */
      const id = uuidv4()
      process.nextTick(() => pubsub.publish(id, { colonyAddress }))
      return pubsub.asyncIterator([
        id,
        SubscriptionLabel.ColonySubscriptionUpdated,
      ])
    },
  },
})
