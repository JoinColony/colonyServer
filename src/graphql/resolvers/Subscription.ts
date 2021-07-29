import { ColonyMongoDataSource } from '../../db/colonyMongoDataSource'
import { getTransactionMessages } from './Query'

export const subscription = (pubsub) => ({
  transactionMessages: {
    resolve: async ({ transactionHash }, args, { dataSources: { data } }) =>
      await getTransactionMessages(transactionHash, data),
    subscribe: () => pubsub.asyncIterator('TRANSACTION_MESSAGE_ADDED'),
  },
  transactionMessagesCount: {
    subscribe: () => pubsub.asyncIterator(['TRANSACTION_MESSAGE_ADDED']),
  },
})
