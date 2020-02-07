import { ApolloContext } from '../apolloTypes'
import {
  LevelStatus,
  MutationResolvers,
  PersistentTaskStatus,
  ProgramStatus,
  SubmissionStatus,
  SuggestionStatus,
} from '../types'
import { tryAuth } from './auth'

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
  async setUserTokens(
    parent,
    { input: { tokenAddresses } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.setUserTokens(userAddress, tokenAddresses)
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
        tokenIsExternal,
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
      tokenIsExternal,
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
  async setColonyTokens(
    parent,
    { input: { tokenAddresses, colonyAddress } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    await tryAuth(auth.assertCanSetColonyTokens({ colonyAddress, userAddress }))
    await api.setColonyTokens(userAddress, colonyAddress, tokenAddresses)
    return data.getColonyByAddress(colonyAddress)
  },
  // Suggestions
  async createSuggestion(
    parent,
    { input: { colonyAddress, ethDomainId, title } },
    { userAddress, api, dataSources: { data } },
  ) {
    const id = await api.createSuggestion(
      userAddress,
      colonyAddress,
      ethDomainId,
      title,
    )
    return data.getSuggestionById(id)
  },
  async setSuggestionStatus(
    parent,
    { input: { id, status } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const {
      colonyAddress,
      creatorAddress,
      ethDomainId,
    } = await data.getSuggestionById(id)
    // Only skip auth if user wants to delete and is the creator
    if (
      !(status === SuggestionStatus.Deleted && userAddress === creatorAddress)
    ) {
      await tryAuth(
        auth.assertCanModifySuggestionStatus({
          colonyAddress,
          domainId: ethDomainId,
          userAddress,
        }),
      )
    }
    await api.editSuggestion(userAddress, id, { status })
    return data.getSuggestionById(id)
  },
  async addUpvoteToSuggestion(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.addUpvoteToSuggestion(userAddress, id)
    return data.getSuggestionById(id)
  },
  async removeUpvoteFromSuggestion(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { data } },
  ) {
    await api.removeUpvoteFromSuggestion(userAddress, id)
    return data.getSuggestionById(id)
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
  async createTaskFromSuggestion(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId, title } = await data.getSuggestionById(
      id,
    )
    await tryAuth(
      auth.assertCanCreateTask({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    const taskId = await api.createTask(
      userAddress,
      colonyAddress,
      ethDomainId,
      title,
    )
    await api.editSuggestion(userAddress, id, {
      status: SuggestionStatus.Accepted,
      taskId,
    })
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
    // it's ok to do this lookup, but if we have an ethPotId, we should look up the ethDomainId
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
  async removeTaskSkill(
    parent,
    { input: { id, ethSkillId } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress, ethDomainId } = await data.getTaskById(id)
    await tryAuth(
      auth.assertCanRemoveTaskSkill({
        colonyAddress,
        userAddress,
        domainId: ethDomainId,
      }),
    )
    await api.removeTaskSkill(userAddress, id, ethSkillId)
    return data.getTaskById(id)
  },
  async setTaskDueDate(
    parent,
    { input: { id, dueDate } },
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
    { input: { id, ethPotId } },
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
    await api.finalizeTask(userAddress, { taskId: id, ethPotId })
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
  async markAllNotificationsAsRead(parent, input, { userAddress, api }) {
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
  // Persistent Tasks
  async createLevelTask(
    parent,
    { input: { levelId } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { programId } = await data.getLevelById(levelId)
    const { colonyAddress } = await data.getProgramById(programId)
    await tryAuth(
      auth.assertCanCreatePersistentTask({
        colonyAddress,
        userAddress,
      }),
    )
    const taskId = await api.createLevelTask(userAddress, levelId)
    return data.getPersistentTaskById(taskId)
  },
  async removeLevelTask(
    parent,
    { input: { id, levelId } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { programId } = await data.getLevelById(levelId)
    const { colonyAddress } = await data.getProgramById(programId)
    await tryAuth(
      auth.assertCanCreatePersistentTask({
        colonyAddress,
        userAddress,
      }),
    )
    await api.removeLevelTask(userAddress, id, levelId)
    return data.getPersistentTaskById(id)
  },
  async editPersistentTask(
    parent,
    { input: { id, ...update } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { colonyAddress } = await data.getPersistentTaskById(id)
    await tryAuth(
      auth.assertCanEditPersistentTask({
        colonyAddress,
        userAddress,
      }),
    )
    await api.editPersistentTask(userAddress, id, update)
    return data.getPersistentTaskById(id)
  },
  async setPersistentTaskPayout(
    parent,
    { input: { id, amount, tokenAddress } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress } = await data.getPersistentTaskById(id)
    await tryAuth(
      auth.assertCanEditPersistentTask({
        colonyAddress,
        userAddress,
      }),
    )
    await api.setPersistentTaskPayout(userAddress, id, amount, tokenAddress)
    return data.getPersistentTaskById(id)
  },
  async removePersistentTaskPayout(
    parent,
    { input: { id, amount, tokenAddress } },
    { userAddress, api, dataSources: { data, auth } },
  ) {
    const { colonyAddress } = await data.getPersistentTaskById(id)
    await tryAuth(
      auth.assertCanEditPersistentTask({
        colonyAddress,
        userAddress,
      }),
    )
    await api.removePersistentTaskPayout(userAddress, id, amount, tokenAddress)
    return data.getPersistentTaskById(id)
  },
  async removePersistentTask(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { colonyAddress } = await data.getPersistentTaskById(id)
    await tryAuth(
      auth.assertCanEditPersistentTask({
        colonyAddress,
        userAddress,
      }),
    )
    await api.removePersistentTask(userAddress, id)
    return data.getPersistentTaskById(id)
  },
  // Submissions
  async createLevelTaskSubmission(
    parent,
    { input: { levelId, persistentTaskId, submission } },
    { userAddress, api, dataSources: { data } },
  ) {
    const submissionId = await api.createLevelTaskSubmission(
      userAddress,
      persistentTaskId,
      levelId,
      submission,
    )
    return data.getSubmissionById(submissionId)
  },
  async editSubmission(
    parent,
    { input: { id, submission } },
    { userAddress, api, dataSources: { data } },
  ) {
    const { creatorAddress } = await data.getSubmissionById(id)
    if (creatorAddress !== userAddress) {
      throw new Error('Submissions can only be edited by their creators')
    }
    await api.editSubmission(userAddress, id, { submission })
    return data.getSubmissionById(id)
  },
  async acceptSubmission(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { persistentTaskId } = await data.getSubmissionById(id)
    const { colonyAddress } = await data.getPersistentTaskById(persistentTaskId)
    await tryAuth(
      auth.assertCanAcceptSubmission({
        colonyAddress,
        userAddress,
      }),
    )
    await api.editSubmission(userAddress, id, { status: SubmissionStatus.Accepted })
    return data.getSubmissionById(id)
  },
  // Programs
  async createProgram(
    parent,
    { input: { colonyAddress } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    await tryAuth(
      auth.assertCanCreateProgram({
        colonyAddress,
        userAddress,
      }),
    )
    const id = await api.createProgram(userAddress, colonyAddress)
    return data.getProgramById(id)
  },
  async editProgram(
    parent,
    { input: { id, ...update } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { colonyAddress } = await data.getProgramById(id)
    await tryAuth(
      auth.assertCanEditProgram({
        colonyAddress,
        userAddress,
      }),
    )
    await api.editProgram(userAddress, id, update)
    return data.getProgramById(id)
  },
  async reorderProgramLevels(
    parent,
    { input: { id, levelIds } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { colonyAddress } = await data.getProgramById(id)
    await tryAuth(
      auth.assertCanEditProgram({
        colonyAddress,
        userAddress,
      }),
    )
    await api.reorderProgramLevels(userAddress, id, levelIds)
    return data.getProgramById(id)
  },
  async publishProgram(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { colonyAddress } = await data.getProgramById(id)
    await tryAuth(
      auth.assertCanEditProgram({
        colonyAddress,
        userAddress,
      }),
    )
    await api.editProgram(userAddress, id, { status: ProgramStatus.Active })
    return data.getProgramById(id)
  },
  async removeProgram(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { colonyAddress } = await data.getProgramById(id)
    await tryAuth(
      auth.assertCanEditProgram({
        colonyAddress,
        userAddress,
      }),
    )
    await api.removeProgram(userAddress, id)
    return data.getProgramById(id)
  },
  // Levels
  async createLevel(
    parent,
    { input: { programId } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { colonyAddress } = await data.getProgramById(programId)
    await tryAuth(
      auth.assertCanCreateLevel({
        colonyAddress,
        userAddress
      })
    )
    const levelId = await api.createLevel(userAddress, programId)
    return data.getLevelById(levelId) 
  },
  async editLevel(
    parent,
    { input: { id, ...update } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { programId } = await data.getLevelById(id)
    const { colonyAddress } = await data.getProgramById(programId)
    await tryAuth(
      auth.assertCanEditLevel({
        colonyAddress,
        userAddress,
      }),
    )
    await api.editLevel(userAddress, id, update)
    return data.getLevelById(id)
  },
  async reorderLevelSteps(
    parent,
    { input: { id, stepIds } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { programId } = await data.getLevelById(id)
    const { colonyAddress } = await data.getProgramById(programId)
    await tryAuth(
      auth.assertCanEditLevel({
        colonyAddress,
        userAddress,
      }),
    )
    await api.reorderLevelSteps(userAddress, id, stepIds)
    return data.getLevelById(id)
  },
  async removeLevel(
    parent,
    { input: { id } },
    { userAddress, api, dataSources: { auth, data } },
  ) {
    const { programId } = await data.getLevelById(id)
    const { colonyAddress } = await data.getProgramById(programId)
    await tryAuth(
      auth.assertCanEditLevel({
        colonyAddress,
        userAddress,
      }),
    )
    await api.removeLevel(userAddress, id)
    return data.getLevelById(id)
  },
}
