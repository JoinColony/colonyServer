import { ApolloContext } from '../apolloTypes'
import { TaskResolvers } from '../types'

export const Task: TaskResolvers<ApolloContext> = {
  async colony({ colonyAddress }, input: any, { dataSources: { data } }) {
    return data.getColonyByAddress(colonyAddress)
  },
  async creator({ creatorAddress }, input: any, { dataSources: { data } }) {
    return data.getUserByAddress(creatorAddress)
  },
  async assignedWorker(
    { assignedWorkerAddress },
    input: any,
    { dataSources: { data } },
  ) {
    return assignedWorkerAddress
      ? await data.getUserByAddress(assignedWorkerAddress)
      : null
  },
  async workInvites(
    { workInviteAddresses },
    input: any,
    { dataSources: { data } },
  ) {
    return data.getUsersByAddress(workInviteAddresses)
  },
  async workRequests(
    { workRequestAddresses },
    input: any,
    { dataSources: { data } },
  ) {
    return data.getUsersByAddress(workRequestAddresses)
  },
  // async events({ id }, input: any, { dataSources: { data } }) {
  //   const events = await data.getTaskEvents(id)
  //   return events;
  // },
}
