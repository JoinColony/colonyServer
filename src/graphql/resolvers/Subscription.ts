import { ColonyMongoDataSource } from '../../db/colonyMongoDataSource'

export const subscription = (pubsub) => ({
  transactionMessages: {
    resolve: ({ transactionMessages, transactionMessages: { messages } }) => ({
      ...transactionMessages,
      messages: messages.map(ColonyMongoDataSource.transformEvent),
    }),
    subscribe: () => pubsub.asyncIterator('TRANSACTION_MESSAGE_ADDED'),
  },
  transactionMessagesCount: {
    subscribe: () => pubsub.asyncIterator(['TRANSACTION_MESSAGE_ADDED']),
  },
})
