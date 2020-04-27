import { ApolloContext } from '../apolloTypes'
import { SubmissionResolvers } from '../types'

export const Submission: SubmissionResolvers<ApolloContext> = {
  async creator({ creatorAddress }, input, { dataSources: { data } }) {
    return data.getUserByAddress(creatorAddress)
  },
  async task({ persistentTaskId }, input, { dataSources: { data } }) {
    return data.getPersistentTaskById(persistentTaskId)
  },
}
