import { ApolloContext } from '../apolloTypes'
import { ProgramSubmissionResolvers } from '../types'

export const ProgramSubmission: ProgramSubmissionResolvers<ApolloContext> = {
  async creator({ creatorAddress }, input, { dataSources: { data } }) {
    return data.getUserByAddress(creatorAddress)
  },
  async task({ persistentTaskId }, input, { dataSources: { data } }) {
    return data.getPersistentTaskById(persistentTaskId);
  },
  async level({ levelId }, input, { dataSources: { data } }) {
    return data.getLevelById(levelId);
  }
}
