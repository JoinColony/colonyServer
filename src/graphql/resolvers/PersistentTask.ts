import { ApolloContext } from '../apolloTypes'
import { PersistentTaskResolvers } from '../types'

export const PersistentTask: PersistentTaskResolvers<ApolloContext> = {
  async submissions({ id }, input, { dataSources: { data } }) {
    return data.getTaskSubmissions(id)
  },
  async currentUserSubmission({ id }, input, { userAddress, dataSources: { data } }) {
    return data.getUserSubmissionForTask(id, userAddress);
  },
  async domain({ colonyAddress, ethDomainId }, input, { dataSources: { data } }) {
    if (!ethDomainId) return null;
    return data.getDomainByEthId(colonyAddress, ethDomainId);
  }
}
