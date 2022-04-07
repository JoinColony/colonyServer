import { Network, getColonyNetworkClient } from '@colony/colony-js'
// import { ColonyMongoApi } from '../db/colonyMongoApi'
import { FaunaApi } from '../fauna/faunaApi'

import { userLabelFeederTask } from './tasks'

const createFeederService = async (provider, db, faunaClient) => {
  // const api = new ColonyMongoApi(db, null)
  const faunaApi = new FaunaApi(faunaClient)

  let interval = 10000
  if (
    process.env.NETWORK === Network.Xdai ||
    process.env.NETWORK === Network.XdaiFork
  ) {
    interval = 5000
  }
  if (process.env.NETWORK === Network.Local) {
    interval = 1000
  }

  const { number: initialBlock } = await provider.getBlock()
  let currentBlock = initialBlock

  console.log('Tick:', interval)
  console.log('Network:', process.env.NETWORK)
  console.log('Startup Block:', initialBlock)

  const networkClient = getColonyNetworkClient(
    process.env.NETWORK as Network,
    provider,
    { networkAddress: process.env.NETWORK_CONTRACT_ADDRESS },
  )

  return setInterval(async () => {
    const { number: newBlock } = await provider.getBlock()
    if (newBlock > currentBlock) {
      // run feeder tasks
      await userLabelFeederTask(networkClient, faunaApi, currentBlock, newBlock)
      // end feeder tasks
      currentBlock = newBlock
      console.log('Updated Current Block:', currentBlock)
    }
  }, interval)
}

export default createFeederService
