import { getTransactionMessages, getTransactionMessagesCount } from './Query'
import { SubscriptionLabel } from '../subscriptionTypes'

export const subscription = (pubsub) => ({
  transactionMessages: {
    resolve: async ({ transactionHash }, args, { dataSources: { data } }) =>
      await getTransactionMessages(transactionHash, data),
    subscribe: () =>
      pubsub.asyncIterator(SubscriptionLabel.TransactionMessageAdded),
  },
  transactionMessagesCount: {
    resolve: async ({ colonyAddress }, args, { dataSources: { data } }) =>
      await getTransactionMessagesCount(colonyAddress, data),
    subscribe: () =>
      pubsub.asyncIterator(SubscriptionLabel.TransactionMessageAdded),
  },
})
