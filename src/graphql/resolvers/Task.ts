import { ApolloContext } from '../apolloTypes'
import { TaskResolvers, TaskPayoutResolvers } from '../types'

export const Task: TaskResolvers<ApolloContext> = {
  async colony({ colonyAddress }, input, { dataSources: { data } }) {
    return data.getColonyByAddress(colonyAddress)
  },
  async creator({ creatorAddress }, input, { dataSources: { data } }) {
    return data.getUserByAddress(creatorAddress)
  },
  async domain(
    { colonyAddress, ethDomainId },
    input,
    { dataSources: { data } },
  ) {
    return data.getDomainByEthId(colonyAddress, ethDomainId)
  },
  async assignedWorker(
    { assignedWorkerAddress },
    input,
    { dataSources: { data } },
  ) {
    return assignedWorkerAddress
      ? await data.getUserByAddress(assignedWorkerAddress)
      : null
  },
  async workInvites({ workInviteAddresses }, input, { dataSources: { data } }) {
    return data.getUsersByAddress(workInviteAddresses)
  },
  async workRequests(
    { workRequestAddresses },
    input,
    { dataSources: { data } },
  ) {
    return data.getUsersByAddress(workRequestAddresses)
  },
  async events({ id }, input, { dataSources: { data } }) {
    return data.getTaskEvents(id)
  },
}
