import { ApolloContext } from '../apolloTypes'
import { ProgramSubmissionResolvers } from '../types'

export const ProgramSubmission: ProgramSubmissionResolvers<ApolloContext> = {
  async level({ levelId }, input, { dataSources: { data } }) {
    return data.getLevelById(levelId);
  }
}
