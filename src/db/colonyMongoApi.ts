import assert from 'assert'
import {
  Collection,
  Db,
  ObjectID,
  QuerySelector,
  UpdateOneOptions,
} from 'mongodb'
import { toChecksumAddress } from 'web3-utils'

import { ROOT_DOMAIN, AUTO_SUBSCRIBED_COLONIES } from '../constants'
import { isETH } from '../utils'
import { EventContextOfType } from '../graphql/eventContext'
import { EventType, SuggestionStatus } from '../graphql/types'
import {
  ColonyDoc,
  DomainDoc,
  EventDoc,
  NotificationDoc,
  StrictRootQuerySelector,
  StrictUpdateQuery,
  SuggestionDoc,
  UserDoc,
  SubmissionDoc,
  LevelDoc,
} from './types'
import { CollectionNames } from './collections'
import { matchUsernames } from './matchers'

export class ColonyMongoApi {
  private static createEditUpdater(edit: Record<string, any>) {
    // Set non-null values, unset null values
    return Object.keys(edit).reduce((modifier, field) => {
      if (typeof edit[field] == 'undefined') return modifier
      if (edit[field] === null) {
        return { ...modifier, $unset: { ...modifier.$unset, [field]: '' } }
      }
      return { ...modifier, $set: { ...modifier.$set, [field]: edit[field] } }
    }, {} as { $set?: {}; $unset?: {} })
  }

  private readonly events: Collection<EventDoc<any>>
  private readonly notifications: Collection<NotificationDoc>
  private readonly suggestions: Collection<SuggestionDoc>
  private readonly users: Collection<UserDoc>
  private readonly submissions: Collection<SubmissionDoc>

  constructor(db: Db) {
    this.events = db.collection<EventDoc<any>>(CollectionNames.Events)
    this.notifications = db.collection<NotificationDoc>(
      CollectionNames.Notifications,
    )
    this.submissions = db.collection<SubmissionDoc>(CollectionNames.Submissions)
    this.suggestions = db.collection<SuggestionDoc>(CollectionNames.Suggestions)
    this.users = db.collection<UserDoc>(CollectionNames.Users)
  }

  private async updateUser(
    walletAddress: string,
    query: StrictRootQuerySelector<UserDoc>,
    modifier: StrictUpdateQuery<UserDoc>,
    options?: UpdateOneOptions,
  ) {
    return this.users.updateOne(
      { $and: [{ walletAddress }, query] },
      modifier,
      options,
    )
  }

  private async tryGetSuggestion(id: string) {
    const suggestion = await this.suggestions.findOne(new ObjectID(id))
    assert.ok(!!suggestion, `Suggestion with ID '${id}' not found`)
    return suggestion
  }

  private async tryGetUser(walletAddress: string) {
    const user = await this.users.findOne({ walletAddress })
    assert.ok(!!user, `User with address '${walletAddress}' not found`)
    return user
  }

  private async createNotification(eventId: ObjectID, users: string[]) {
    // No point in creating a notification for no users
    if (users.length === 0) return null

    const uniqueUsers = Array.from(new Set(users))

    const doc = {
      eventId,
      users: uniqueUsers.map((address) => ({ address, read: false })),
    }

    return this.notifications.updateOne(
      doc,
      {
        $setOnInsert: doc,
      } as StrictRootQuerySelector<NotificationDoc>,
      { upsert: true },
    )
  }

  private async createColonyNotification(
    initiator: string,
    eventId: ObjectID,
    colonyAddress: string,
  ) {
    const users = await this.users
      .find({
        colonyAddresses: colonyAddress,
        walletAddress: { $ne: initiator },
      })
      .toArray()
    return this.createNotification(
      eventId,
      users.map(({ walletAddress }) => walletAddress),
    )
  }

  private async createEvent<
    T extends EventType,
    C extends EventContextOfType<T>
  >(initiatorAddress: string, type: T, context: C) {
    const { insertedId } = await this.events.insertOne({
      context,
      initiatorAddress,
      type,
      sourceType: 'db',
    })
    return insertedId
  }

  async createUser(walletAddress: string, username: string) {
    const doc = { walletAddress, username } as UserDoc

    const exists = !!(await this.users.findOne({
      $or: [{ walletAddress }, { username }],
    }))
    if (exists) {
      throw new Error(
        `User with address '${walletAddress}' or username '${username}' already exists`,
      )
    }

    // An upsert is used even if it's not strictly necessary because
    // it's not the job of a unique index to preserve data integrity.
    await this.users.updateOne(doc, { $setOnInsert: doc }, { upsert: true })

    const eventId = await this.createEvent(walletAddress, EventType.NewUser, {})
    await this.createNotification(eventId, [walletAddress])
  }

  async editUser(
    initiator: string,
    profile: {
      avatarHash?: string | null
      displayName?: string | null
      website?: string | null
      location?: string | null
      bio?: string | null
    },
  ) {
    await this.tryGetUser(initiator)
    return this.updateUser(
      initiator,
      {},
      ColonyMongoApi.createEditUpdater(profile),
    )
  }

  async subscribeToColony(initiator: string, colonyAddress: string) {
    await this.tryGetUser(initiator)

    return this.updateUser(
      initiator,
      // @ts-ignore This is too fiddly to type, for now
      { colonyAddresses: { $ne: colonyAddress } },
      { $addToSet: { colonyAddresses: colonyAddress } },
    )
  }

  async unsubscribeFromColony(initiator: string, colonyAddress: string) {
    await this.tryGetUser(initiator)

    return this.updateUser(
      initiator,
      // @ts-ignore This is too fiddly to type, for now
      { colonyAddresses: colonyAddress },
      { $pull: { colonyAddresses: colonyAddress } },
    )
  }

  async setUserTokens(initiator: string, tokenAddresses: string[]) {
    await this.tryGetUser(initiator)
    const tokens = tokenAddresses
      .filter((token) => !isETH(token))
      /*
       * @NOTE In all likelyhood the address that comes from the dApp is already checksummed
       * But we'll checksum it again here as a precaution
       */
      .map((token) => toChecksumAddress(token))
    return this.updateUser(initiator, {}, { $set: { tokenAddresses: tokens } })
  }

  async markNotificationAsRead(initiator: string, id: string) {
    await this.tryGetUser(initiator)

    // Horrific typing to get this checked reasonably well...
    const match: QuerySelector<NotificationDoc['users']> = {
      $elemMatch: { address: initiator, read: { $ne: true } },
    }
    const filter: StrictRootQuerySelector<NotificationDoc> = {
      _id: new ObjectID(id),
      users: match as NotificationDoc['users'],
    }

    return this.notifications.updateOne(filter, {
      $set: { 'users.$.read': true },
    } as StrictUpdateQuery<NotificationDoc>)
  }

  async markAllNotificationsAsRead(initiator: string) {
    await this.tryGetUser(initiator)

    // Horrific typing to get this checked reasonably well...
    const match: QuerySelector<NotificationDoc['users']> = {
      $elemMatch: { address: initiator, read: { $ne: true } },
    }
    const filter: StrictRootQuerySelector<NotificationDoc> = {
      users: match as NotificationDoc['users'],
    }
    const update: StrictUpdateQuery<
      NotificationDoc & {
        'users.$.read': boolean
      }
    > = { $set: { 'users.$.read': true } }

    return this.notifications.updateMany(filter, update)
  }

  async createSuggestion(
    initiator: string,
    colonyAddress: string,
    ethDomainId: number,
    title: string,
  ) {
    await this.tryGetUser(initiator)

    const { insertedId } = await this.suggestions.insertOne({
      colonyAddress,
      creatorAddress: initiator,
      ethDomainId,
      status: SuggestionStatus.Open,
      upvotes: [initiator],
      title,
    })

    return insertedId.toString()
  }

  async editSuggestion(
    initiator: string,
    id: string,
    {
      ...edit
    }: {
      status?: SuggestionStatus
      title?: string | null
    },
  ) {
    await this.tryGetUser(initiator)
    await this.tryGetSuggestion(id)
    const update = ColonyMongoApi.createEditUpdater({
      ...edit,
    })
    return this.suggestions.updateOne({ _id: new ObjectID(id) }, update)
  }

  async addUpvoteToSuggestion(initiator: string, id: string) {
    // This effectively limits upvotes to users with a registered ENS name
    await this.tryGetUser(initiator)
    await this.tryGetSuggestion(id)
    return this.suggestions.updateOne(
      { _id: new ObjectID(id) },
      { $addToSet: { upvotes: initiator } },
    )
  }

  async removeUpvoteFromSuggestion(initiator: string, id: string) {
    // This effectively limits upvotes to users with a registered ENS name
    await this.tryGetUser(initiator)
    await this.tryGetSuggestion(id)
    return this.suggestions.updateOne(
      { _id: new ObjectID(id) },
      { $pull: { upvotes: initiator } },
    )
  }

  async sendTransactionMessage(
    initiator: string,
    transactionHash: string,
    colonyAddress: string,
    message: string,
  ) {
    await this.tryGetUser(initiator)
    return this.createEvent(initiator, EventType.TransactionMessage, {
      transactionHash,
      message,
      colonyAddress,
    })
  }
}
