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

// TODO add Required to all resolver definitions?
export const Mutation: Required<MutationResolvers<ApolloContext>> = {
  // Users
  async createUser(
    parent,
    { input: { username } },
    { user, api, dataSources: { data } },
  ) {
    await api.createUser(user, username)
    return data.getUserByAddress(user)
  },
  async editUser(parent, { input }, { user, api, dataSources: { data } }) {
    await api.editUser(user, input)
    return data.getUserByAddress(user)
  },
  async subscribeToColony(
    parent,
    { input: { colonyAddress } },
    { user, api, dataSources: { data } },
  ) {
    await api.subscribeToColony(user, colonyAddress)
    return data.getUserByAddress(user)
  },
  async unsubscribeFromColony(
    parent,
    { input: { colonyAddress } },
    { user, api, dataSources: { data } },
  ) {
    await api.unsubscribeFromColony(user, colonyAddress)
    return data.getUserByAddress(user)
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
    { user, api, dataSources: { data, auth } },
  ) {
    // No permissions-based auth call needed: anyone should be able to do this

    // TODO test that the given colony address exists on-chain?
    // Not really auth per-se, more validation (if it doesn't exist, permissions checks will fail)
    // TODO the newly-created Colony might not be propagated... maybe we need to use events/polling?
    // await tryAuth(auth.assertColonyExists(colonyAddress))

    // TODO we need to get the right creatorAddress...
    await api.createColony(
      user,
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
    { user, api, dataSources: { data, auth } },
  ) {
    await tryAuth(auth.assertCanEditColonyProfile(colonyAddress, user))
    await api.editColony(colonyAddress, profile)
    return data.getColonyByAddress(colonyAddress)
  },
  // Tasks
  async createTask(
    parent,
    { input: { colonyAddress, ethDomainId } },
    { user, api, dataSources: { data, auth } },
  ) {
    await tryAuth(auth.assertCanCreateTask(colonyAddress, user, ethDomainId))
    const taskId = await api.createTask(user, colonyAddress, ethDomainId)
    return data.getTaskById(taskId)
  },
  async setTaskDomain(
    parent,
    { input: { id, ethDomainId } },
    { user, api, dataSources: { data, auth } },
  ) {
    const {
      colonyAddress,
      ethDomainId: currentEthDomainId,
    } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSetTaskDomain(
        colonyAddress,
        user,
        currentEthDomainId,
        ethDomainId,
      ),
    )
    await api.setTaskDomain(user, id, ethDomainId)
    return data.getTaskById(id)
  },
  async setTaskDescription(
    parent,
    { input: { id, description } },
    { user, api, dataSources: { data, auth } },
  ) {
    // TODO for all of these cases (where we need to look up the ethDomainId for an off-chain task),
    // it's ok to do this lookup, but if we have an ethTaskId, we should look up the ethDomainId
    // from on-chain.
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSetTaskDescription(colonyAddress, user, ethDomainId),
    )
    await api.setTaskDescription(user, id, description)
    return data.getTaskById(id)
  },
  async setTaskTitle(
    parent,
    { input: { id, title } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(auth.assertCanSetTaskTitle(colonyAddress, user, ethDomainId))
    await api.setTaskTitle(user, id, title)
    return data.getTaskById(id)
  },
  async setTaskSkill(
    parent,
    { input: { id, ethSkillId } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(auth.assertCanSetTaskSkill(colonyAddress, user, ethDomainId))
    await api.setTaskSkill(user, id, ethSkillId)
    return data.getTaskById(id)
  },
  async setTaskDueDate(
    parent,
    { input: { id, dueDate } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSetTaskDueDate(colonyAddress, user, ethDomainId),
    )
    await api.setTaskDueDate(user, id, dueDate)
    return data.getTaskById(id)
  },
  async createWorkRequest(
    parent,
    { input: { id } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanCreateWorkRequest(colonyAddress, user, ethDomainId),
    )
    await api.createWorkRequest(user, id)
    return data.getTaskById(id)
  },
  async sendWorkInvite(
    parent,
    { input: { id, workerAddress } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanSendWorkInvite(colonyAddress, user, ethDomainId),
    )
    await api.sendWorkInvite(user, id, workerAddress)
    return data.getTaskById(id)
  },
  async setTaskPayout(
    parent,
    { input: { id, amount, tokenAddress } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(auth.assertCanSetTaskPayout(colonyAddress, user, ethDomainId))
    await api.setTaskPayout(user, id, amount, tokenAddress)
    return data.getTaskById(id)
  },
  async removeTaskPayout(
    parent,
    { input: { id, amount, tokenAddress } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanRemoveTaskPayout(colonyAddress, user, ethDomainId),
    )
    await api.removeTaskPayout(user, id, amount, tokenAddress)
    return data.getTaskById(id)
  },
  async assignWorker(
    parent,
    { input: { id, workerAddress } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(auth.assertCanAssignWorker(colonyAddress, user, ethDomainId))
    await api.assignWorker(user, id, workerAddress)
    return data.getTaskById(id)
  },
  async unassignWorker(
    parent,
    { input: { id, workerAddress } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanUnassignWorker(colonyAddress, user, ethDomainId),
    )
    await api.unassignWorker(user, id, workerAddress)
    return data.getTaskById(id)
  },
  async finalizeTask(
    parent,
    { input: { id } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(auth.assertCanFinalizeTask(colonyAddress, user, ethDomainId))
    await api.finalizeTask(user, id)
    return data.getTaskById(id)
  },
  async cancelTask(
    parent,
    { input: { id } },
    { user, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(auth.assertCanCancelTask(colonyAddress, user, ethDomainId))
    await api.cancelTask(user, id)
    return data.getTaskById(id)
  },
  // Tokens
  async createToken(
    parent,
    { input: { address, name, decimals, symbol, iconHash } },
    { user, api, dataSources: { data, auth } },
  ) {
    // TODO verify that token exists at the given address?
    await api.createToken(user, address, name, symbol, decimals, iconHash)
    return data.getTokenByAddress(address)
  },
  async addColonyTokenReference(
    parent,
    { input: { tokenAddress, colonyAddress, isExternal, iconHash } },
    { user, api, dataSources: { data, auth } },
  ) {
    await tryAuth(auth.assertCanAddColonyTokenReference(colonyAddress, user))
    await api.addColonyTokenReference(
      user,
      colonyAddress,
      tokenAddress,
      isExternal,
      iconHash,
    )
    return data.getTokenByAddress(tokenAddress)
  },
  async addUserTokenReference(
    parent,
    { input: { tokenAddress, iconHash } },
    { user, api, dataSources: { data } },
  ) {
    // No auth call needed; restricted to the current authenticated user address
    await api.addUserTokenReference(user, tokenAddress, iconHash)
    return data.getTokenByAddress(tokenAddress)
  },
  async setColonyTokenAvatar(
    parent,
    { input: { tokenAddress, colonyAddress, iconHash } },
    { user, api, dataSources: { data, auth } },
  ) {
    await tryAuth(auth.assertCanAddColonyTokenReference(colonyAddress, user))

    if (iconHash) {
      await api.setColonyTokenAvatar(colonyAddress, tokenAddress, iconHash)
    } else {
      await api.removeColonyTokenAvatar(colonyAddress, tokenAddress)
    }

    return data.getTokenByAddress(tokenAddress)
  },
  async setUserTokenAvatar(
    parent,
    { input: { tokenAddress, iconHash } },
    { user, api, dataSources: { data } },
  ) {
    // No auth call needed; restricted to the current authenticated user address
    if (iconHash) {
      await api.setUserTokenAvatar(user, tokenAddress, iconHash)
    } else {
      await api.removeUserTokenAvatar(user, tokenAddress)
    }

    return data.getTokenByAddress(tokenAddress)
  },
  // Notifications
  async markNotificationAsRead(parent, { input: { id } }, { user, api }) {
    // No auth call needed; restricted to the current authenticated user address
    await api.markNotificationAsRead(user, id)
    return true
  },
  async markAllNotificationsAsRead(parent, input: Input<any>, { user, api }) {
    // No auth call needed; restricted to the current authenticated user address
    await api.markAllNotificationsAsRead(user)
    return true
  },
  // Messages
  async sendTaskMessage(parent, { input: { id, message } }, { user, api }) {
    // No auth call needed; anyone can do this (for now...?)
    // TODO assert task exists? Should this be done for all of these mutations, or in API land?
    await api.sendTaskMessage(user, id, message)
    return true
  },
  // Domains
  async createDomain(
    parent,
    { input: { ethDomainId, ethParentDomainId, name, colonyAddress } },
    { user, api, dataSources: { auth, data } },
  ) {
    await tryAuth(
      auth.assertCanCreateDomain(
        colonyAddress,
        user,
        ethDomainId,
        ethParentDomainId,
      ),
    )
    await api.createDomain(
      user,
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
    { user, api, dataSources: { auth, data } },
  ) {
    await tryAuth(
      auth.assertCanEditDomainName(colonyAddress, user, ethDomainId),
    )
    await api.editDomainName(user, colonyAddress, ethDomainId, name)
    return data.getDomainByEthId(colonyAddress, ethDomainId)
  },
}
