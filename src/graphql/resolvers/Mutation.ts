import { ForbiddenError } from 'apollo-server-errors'

import { ApolloContext, Input } from '../apolloTypes'
import { MutationResolvers } from '../types'

const tryAuth = async (promise: Promise<boolean>) => {
  let auth = false

  try {
    auth = await promise
  } catch (caughtError) {
    throw new ForbiddenError(caughtError.message || caughtError.toString())
  }

  if (!auth) {
    throw new ForbiddenError('Not allowed')
  }
}

export const Mutation: MutationResolvers<ApolloContext> = {
  // Users
  async createUser(
    parent,
    { input: { username } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.createUser(userAddress, username)
    return data.getUserByAddress(userAddress)
  },
  async editUser(
    parent,
    { input },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.editUser(userAddress, input)
    return data.getUserByAddress(userAddress)
  },
  async subscribeToColony(
    parent,
    { input: { colonyAddress } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.subscribeToColony(userAddress, colonyAddress)
    return data.getUserByAddress(userAddress)
  },
  async unsubscribeFromColony(
    parent,
    { input: { colonyAddress } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.unsubscribeFromColony(userAddress, colonyAddress)
    return data.getUserByAddress(userAddress)
  },
  // Colonies
  async createColony(
    parent,
    {
      input: {
        colonyAddress,
        colonyName,
        displayName,
        tokenAddress,
        tokenName,
        tokenSymbol,
        tokenDecimals,
        tokenIconHash,
      },
    },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    // No permissions-based auth call needed: anyone should be able to do this,
    // but the colony needs to exist on-chain.
    await tryAuth(auth.assertColonyExists(colonyAddress))

    await api.createColony(
      userAddress,
      colonyAddress,
      colonyName,
      displayName,
      tokenAddress,
      tokenName,
      tokenSymbol,
      tokenDecimals,
      tokenIconHash,
    )
    return data.getColonyByAddress(colonyAddress)
  },
  async editColonyProfile(
    parent,
    { input: { colonyAddress, ...profile } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    await tryAuth(
      auth.assertCanEditColonyProfile({ colonyAddress, userAddress }),
    )
    await api.editColony(userAddress, colonyAddress, profile)
    return data.getColonyByAddress(colonyAddress)
  },
  // Tasks
  async createTask(
    parent,
    { input: { colonyAddress, ethDomainId } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    await tryAuth(
      auth.assertCanCreateTask({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    const taskId = await api.createTask(userAddress, colonyAddress, ethDomainId)
    return data.getTaskById(taskId)
  },
  async setTaskDomain(
    parent,
    { input: { id, ethDomainId } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const {
      colonyAddress,
      ethDomainId: currentEthDomainId,
    } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSetTaskDomain({
        colonyAddress,
        userAddress,
        currentDomainId: currentEthDomainId,
        newDomainId: ethDomainId,
      }),
    )
    await api.setTaskDomain(userAddress, id, ethDomainId)
    return data.getTaskById(id)
  },
  async setTaskDescription(
    parent,
    { input: { id, description } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    // TODO for all of these cases (where we need to look up the ethDomainId for an off-chain task),
    // it's ok to do this lookup, but if we have an ethTaskId, we should look up the ethDomainId
    // from on-chain.
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSetTaskDescription({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.setTaskDescription(userAddress, id, description)
    return data.getTaskById(id)
  },
  async setTaskTitle(
    parent,
    { input: { id, title } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSetTaskTitle({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.setTaskTitle(userAddress, id, title)
    return data.getTaskById(id)
  },
  async setTaskSkill(
    parent,
    { input: { id, ethSkillId } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSetTaskSkill({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.setTaskSkill(userAddress, id, ethSkillId)
    return data.getTaskById(id)
  },
  async setTaskDueDate(
    parent,
    {
      input: { id, dueDate },
    }: { input: { id: string; dueDate: string | null | undefined } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSetTaskDueDate({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.setTaskDueDate(userAddress, id, dueDate || null)
    return data.getTaskById(id)
  },
  async createWorkRequest(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { data } },
  ) {
    // No auth needed here, anyone can do it
    await api.createWorkRequest(userAddress, id)
    return data.getTaskById(id)
  },
  async sendWorkInvite(
    parent,
    { input: { id, workerAddress } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSendWorkInvite({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.sendWorkInvite(userAddress, id, workerAddress)
    return data.getTaskById(id)
  },
  async setTaskPayout(
    parent,
    { input: { id, amount, tokenAddress } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSetTaskPayout({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.setTaskPayout(userAddress, id, amount, tokenAddress)
    return data.getTaskById(id)
  },
  async removeTaskPayout(
    parent,
    { input: { id, amount, tokenAddress } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanRemoveTaskPayout({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.removeTaskPayout(userAddress, id, amount, tokenAddress)
    return data.getTaskById(id)
  },
  async assignWorker(
    parent,
    { input: { id, workerAddress } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanAssignWorker({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.assignWorker(userAddress, id, workerAddress)
    return data.getTaskById(id)
  },
  async unassignWorker(
    parent,
    { input: { id, workerAddress } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanUnassignWorker({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.unassignWorker(userAddress, id, workerAddress)
    return data.getTaskById(id)
  },
  async finalizeTask(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanFinalizeTask({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.finalizeTask(userAddress, id)
    return data.getTaskById(id)
  },
  async cancelTask(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanCancelTask({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.cancelTask(userAddress, id)
    return data.getTaskById(id)
  },
  // Tokens
  async createToken(
    parent,
    { input: { address, name, decimals, symbol, iconHash } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    await api.createToken(
      userAddress,
      address,
      name,
      symbol,
      decimals,
      iconHash,
    )
    return data.getTokenByAddress(address)
  },
  async addColonyTokenReference(
    parent,
    { input: { tokenAddress, colonyAddress, isExternal, iconHash } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    await tryAuth(
      auth.assertCanAddColonyTokenReference({ colonyAddress, userAddress }),
    )
    await api.addColonyTokenReference(
      userAddress,
      colonyAddress,
      tokenAddress,
      isExternal,
      iconHash,
    )
    return data.getTokenByAddress(tokenAddress)
  },
  async setColonyTokenAvatar(
    parent,
    { input: { tokenAddress, colonyAddress, iconHash } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    await tryAuth(
      auth.assertCanAddColonyTokenReference({ colonyAddress, userAddress }),
    )

    if (iconHash) {
      await api.setColonyTokenAvatar(colonyAddress, tokenAddress, iconHash)
    } else {
      await api.removeColonyTokenAvatar(colonyAddress, tokenAddress)
    }

    return data.getTokenByAddress(tokenAddress)
  },
  async setUserTokens(
    parent,
    { input: { tokens } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.setUserTokens(userAddress, tokens)
    return data.getUserByAddress(userAddress)
  },
  // Notifications
  async markNotificationAsRead(
    parent,
    { input: { id } },
    { userAddress, api },
  ) {
    // No auth call needed; restricted to the current authenticated user address
    await api.markNotificationAsRead(userAddress, id)
    return true
  },
  async markAllNotificationsAsRead(
    parent,
    input: Input<any>,
    { userAddress, api },
  ) {
    // No auth call needed; restricted to the current authenticated user address
    await api.markAllNotificationsAsRead(userAddress)
    return true
  },
  // Messages
  async sendTaskMessage(
    parent,
    { input: { id, message } },
    { userAddress, api },
  ) {
    // No auth call needed; anyone can do this (for now...?)
    await api.sendTaskMessage(userAddress, id, message)
    return true
  },
  // Domains
  async createDomain(
    parent,
    { input: { ethDomainId, ethParentDomainId, name, colonyAddress } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    await tryAuth(
      auth.assertCanCreateDomain({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
        parentDomainId: ethParentDomainId,
      }),
    )
    await api.createDomain(
      userAddress,
      colonyAddress,
      ethDomainId,
      ethParentDomainId,
      name,
    )
    return data.getDomainByEthId(colonyAddress, ethDomainId)
  },
  async editDomainName(
    parent,
    { input: { ethDomainId, name, colonyAddress } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    await tryAuth(
      auth.assertCanEditDomainName({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.editDomainName(userAddress, colonyAddress, ethDomainId, name)
    return data.getDomainByEthId(colonyAddress, ethDomainId)
  },
}
