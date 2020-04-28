import { ColonyMongoApi } from '../db/colonyMongoApi'
import { IColonyNetworkFactory } from '../network/contracts/IColonyNetworkFactory'
import { IColonyFactory } from '../network/contracts/IColonyFactory'
import { IColonyNetwork } from '../network/contracts/IColonyNetwork'
import { IColony } from '../network/contracts/IColony'
import { utils, EventFilter } from 'ethers'
import { Log } from 'ethers/providers/abstract-provider'
import { ChainEventDoc } from './../db/types'
import { Db } from 'mongodb'
import { Provider } from 'ethers/providers'

type FullEventFilter = {
  address?: string | Array<string>
  topics?: Array<Array<string>> | Array<string>
  fromBlock?: Number
  toBlock?: Number
}

class EventMonitor {
  provider: Provider
  db: Db
  api: ColonyMongoApi
  network: IColonyNetwork
  colonyAddresses: string[]
  dummyColony: IColony
  topicMapping: Map<string, string>
  blockProcessing: boolean
  blocksToProcess: number[]
  logsToProcess: Log[]
  logProcessing: boolean
  logQueueTimerId: NodeJS.Timer
  blockQueueTimerId: NodeJS.Timer
  topicFilter: FullEventFilter

  constructor(db: Db, provider: Provider) {
    this.provider = provider
    this.db = db
    this.api = new ColonyMongoApi(db)
    this.network = IColonyNetworkFactory.connect(
      process.env.NETWORK_CONTRACT_ADDRESS,
      provider,
    )
    this.colonyAddresses = []
    // We hook off this dummy colony to get access to events
    this.dummyColony = IColonyFactory.connect(
      '0x0000000000000000000000000000000000000000',
      this.provider,
    )

    // We're gonna need this later
    this.topicMapping = new Map<string, string>()
    Object.keys(this.dummyColony.interface.events).forEach(
      (eName) =>
        (this.topicMapping[
          this.dummyColony.interface.events[eName].topic
        ] = eName),
    )
    this.logsToProcess = []
    this.blocksToProcess = []
    // Every second, check the queue of events to affect the database
    this.logQueueTimerId = setInterval(this.processLogQueue.bind(this), 1000)
    // Every 15 seconds, check the queue of blocks we've not processed
    this.blockQueueTimerId = setInterval(
      this.processBlockQueue.bind(this),
      15000,
    )
    this.topicFilter = { fromBlock: 1, toBlock: 1, topics: [[]] }
  }

  private async processBlockQueue() {
    if (this.blockProcessing === true) {
      return
    }
    this.blockProcessing = true
    // No async calls above here, otherwise it's race-condition city
    while (this.blocksToProcess.length > 0) {
      const blockNumberToProcess = this.blocksToProcess.shift()
      await this.queueEvents(blockNumberToProcess)
    }

    this.blockProcessing = false
  }

  async queueEvents(blockNumber: Number) {
    this.topicFilter.fromBlock = blockNumber
    this.topicFilter.toBlock = blockNumber
    let logs = []
    try {
      logs = await this.provider.getLogs(this.topicFilter)
    } catch (e) {
      console.log(
        `getLogs failed with error ${e}. Some events might have been missed`,
      )
      return
    }
    if (logs.length > 500) {
      console.log(
        `Warning: Log length over 500 in a single block. Multiple filters might be required soon`,
      )
    }
    logs.forEach(async (log) => {
      if (this.colonyAddresses.indexOf(log.address) === -1) {
        return
      }
      this.logsToProcess.push(log)
    })
  }

  private async processLogQueue() {
    if (this.logProcessing === true) {
      return
    }
    this.logProcessing = true
    // No async calls above here, otherwise it's race-condition city
    while (this.logsToProcess.length > 0) {
      // Get log
      const log = this.logsToProcess.shift()
      const res = await this.api.recordChainEvent(
        log.transactionHash,
        log.logIndex,
        log.address,
        log.topics,
        log.data,
      )
      // TODO: If the process gets killed here, the effect of this event will never be applied to the db. An edge case, but a case
      // nonetheless
      if (res?.upsertedCount !== 0) {
        // This property is nonzero if we didn't have the log previously, so process the consequences
        await this.processLogConsequences(log)
      }
    }

    this.logProcessing = false
  }

  async processLogConsequences(log: Log) {
    const eventSig = this.topicMapping[log.topics[0]]
    if (!eventSig) {
      return
    }
    if (eventSig === 'DomainAdded(uint256)') {
      const domain = await this.api.domains.findOne({
        colonyAddress: log.address,
        ethDomainId: parseInt(log.data),
      })
      if (domain !== null) {
        // Domain already exists, so return
        console.log('Domain already exists, skipping')
        return
      }
      // If it doesn't already exist, we should make it. We need to get the tx, to find out the parent ID
      const tx = await this.provider.getTransaction(log.transactionHash)
      const [, , parentId] = utils.defaultAbiCoder.decode(
        ['uint256', 'uint256', 'uint256'],
        utils.hexDataSlice(tx.data, 4),
      )
      // Copied almost-verbatim from inside the API...
      // An upsert is used even if it's not strictly necessary because
      // it's not the job of a unique index to preserve data integrity.
      return this.api.domains.updateOne(
        {
          colonyAddress: log.address,
          ethDomainId: parseInt(log.data),
          ethParentDomainId: parentId.toNumber(),
        },
        {
          $setOnInsert: {
            colonyAddress: log.address,
            ethDomainId: parseInt(log.data),
            ethParentDomainId: parentId.toNumber(),
            name: `Domain #${parseInt(log.data)}`,
          },
        },
        { upsert: true },
      )
    }
  }

  private async catchUpEvents() {
    // Get the most recent event we added
    const latestEvent = await this.api.chainEvents.findOne(
      {},
      { sort: [['_id', -1]] },
    )
    let blockNumber
    if (latestEvent === null) {
      blockNumber = await this.provider.getBlockNumber()
    } else {
      // Get the block it was in
      const tx = await this.provider.getTransaction(latestEvent.transaction)
      blockNumber = tx.blockNumber
    }
    // We start resyncing from 20 blocks back to accommodate reorgs
    const fromBlock = blockNumber - 20
    const latestBlock = await this.provider.getBlockNumber()
    const nBlocks = latestBlock - fromBlock + 1
    this.blocksToProcess = [...Array(nBlocks).keys()].map((x) => x + fromBlock)

    // Add future blocks to the block queue:
    this.provider.on('block', async (blockNumber) => {
      this.blocksToProcess.push(blockNumber)
    })
  }

  async init() {
    // First, get a list of colonies
    const colonyAddedFilter = await this.network.filters.ColonyAdded(
      null,
      null,
      null,
    )

    const colonyAddedFilterSinceGenesis = colonyAddedFilter as FullEventFilter
    colonyAddedFilterSinceGenesis.fromBlock = 1
    let colonyAddedEvents = []
    try {
      colonyAddedEvents = await this.provider.getLogs(
        colonyAddedFilterSinceGenesis,
      )
    } catch (e) {
      console.log(`getLogs failed with error ${e}. Initialisation unsuccessful`)
      return
    }
    colonyAddedEvents.forEach((e) => {
      this.colonyAddresses.push(
        utils.getAddress(`0x${e.topics[2].substring(26)}`),
      )
    })
    // Set up listener for future colonies being created to be added to the array.
    this.network.on(colonyAddedFilter as EventFilter, (e) => {
      this.colonyAddresses.push(
        utils.getAddress(`0x${e.topics[2].substring(26)}`),
      )
    })

    // Set up single listener for all events from everywhere.
    const topicsOfInterest = [
      this.dummyColony.filters.DomainAdded(null),
      this.dummyColony.filters.FundingPotAdded(null),
    ].map((f) => f.topics[0])
    this.topicFilter.topics = [topicsOfInterest]

    await this.catchUpEvents()
  }
}

export const createEventMonitor = (db: Db, provider: Provider) => {
  return new EventMonitor(db, provider)
}
