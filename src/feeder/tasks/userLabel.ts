import { getLogs } from '@colony/colony-js'
import { getAddress } from 'ethers/utils'

const userLabel = async (networkClient, api, startBlock, endBlock) => {
  const userLabelRegisteredFilter = networkClient.filters.UserLabelRegistered(
    null,
    null,
  )

  const userLabelRegisteredLogs = await getLogs(
    networkClient,
    userLabelRegisteredFilter,
    {
      fromBlock: startBlock,
      toBlock: endBlock,
    },
  )

  userLabelRegisteredLogs.map(async (log) => {
    const event = networkClient.interface.parseLog(log)
    const domain = await networkClient.lookupRegisteredENSDomainWithNetworkPatches(
      event.values.user,
    )

    const username = domain.slice(0, domain.indexOf('.'))
    const walletAddress = getAddress(event.values.user)

    try {
      const user = await api.tryGetUser(walletAddress, false)
      if (!user) {
        await api.createUser(walletAddress, username)
        console.log(
          'Found Registered User Label:',
          username,
          `(block ${log.blockNumber})`,
        )
      }
    } catch (error) {
      console.error(
        'Could not create user:',
        username,
        'with address:',
        walletAddress,
      )
      console.error(error)
    }
  })
}

export default userLabel
