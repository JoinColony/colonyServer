import assert from 'assert'
import {
  Collection,
  Db,
  ObjectID,
  QuerySelector,
  UpdateOneOptions,
} from 'mongodb'
import { toChecksumAddress } from 'web3-utils'
import { PubSub } from 'graphql-subscriptions'

import { isETH } from '../utils'
import { EventContextOfType } from '../graphql/eventContext'
import { SubscriptionLabel } from '../graphql/subscriptionTypes'
import { EventType, TransactionMessageEvent } from '../graphql/types'
import {
  EventBansDoc,
  EventDoc,
  NotificationDoc,
  StrictRootQuerySelector,
  StrictUpdateQuery,
  UserDoc,
} from './types'
import { CollectionNames } from './collections'

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
  private readonly eventBans: Collection<EventBansDoc>
  private readonly notifications: Collection<NotificationDoc>
  private readonly users: Collection<UserDoc>
  private readonly pubsub: PubSub

  constructor(db: Db, pubsub: PubSub) {
    this.events = db.collection<EventDoc<any>>(CollectionNames.Events)
    this.eventBans = db.collection<EventBansDoc>(CollectionNames.EventBans)
    this.notifications = db.collection<NotificationDoc>(
      CollectionNames.Notifications,
    )
    this.users = db.collection<UserDoc>(CollectionNames.Users)
    this.pubsub = pubsub
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

  private async tryGetUser(walletAddress: string) {
    const user = await this.users.findOne({ walletAddress })
    assert.ok(!!user, `User with address '${walletAddress}' not found`)
    return user
  }

  private async tryGetComment(id: string, assertive: boolean = true) {
    const eventMessage = await this.events.findOne(new ObjectID(id))
    if (assertive) {
      assert.ok(!!eventMessage, `Comment "${id}" does not exist`)
    }
    return eventMessage
  }

  private async tryGetBannedUser(
    colonyAddress: string,
    walletAddress: string,
    banned = true,
  ) {
    const bannedUser = await this.eventBans.findOne({
      colonyAddress,
      'bannedWalletAddresses.userAddress': walletAddress,
    })

    if (!banned) {
      assert.ok(
        bannedUser,
        `User '${walletAddress}' is not currently banned from commenting`,
      )
    } else {
      assert.ok(
        !bannedUser,
        `User '${walletAddress}' is already banned from commenting`,
      )
    }

    const { userAddress, eventId } =
      bannedUser?.bannedWalletAddresses.find(
        ({ userAddress }) => userAddress === walletAddress,
      ) || {}

    return {
      userAddress,
      eventId,
    }
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

    const subscribedUser = await this.updateUser(
      initiator,
      // @ts-ignore This is too fiddly to type, for now
      { colonyAddresses: { $ne: colonyAddress } },
      { $addToSet: { colonyAddresses: colonyAddress } },
    )
    this.pubsub.publish(SubscriptionLabel.ColonySubscriptionUpdated, {
      colonyAddress,
    })

    return subscribedUser
  }

  async unsubscribeFromColony(initiator: string, colonyAddress: string) {
    await this.tryGetUser(initiator)

    const unsubscribedUser = await this.updateUser(
      initiator,
      // @ts-ignore This is too fiddly to type, for now
      { colonyAddresses: colonyAddress },
      { $pull: { colonyAddresses: colonyAddress } },
    )
    this.pubsub.publish(SubscriptionLabel.ColonySubscriptionUpdated, {
      colonyAddress,
    })

    return unsubscribedUser
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

  /*
   * Comments
   */

  async sendTransactionMessage(
    initiator: string,
    transactionHash: string,
    colonyAddress: string,
    message: string,
  ) {
    await this.tryGetUser(initiator)
    const newTransactionMessageId = await this.createEvent(
      initiator,
      EventType.TransactionMessage,
      {
        transactionHash,
        message,
        colonyAddress,
        deleted: false,
        adminDelete: false,
      },
    )
    this.pubsub.publish(SubscriptionLabel.TransactionMessageAdded, {
      transactionHash,
      colonyAddress,
    })
    return newTransactionMessageId
  }

  async deleteTransactionMessage(
    initiator: string,
    id: string,
    adminOverride: boolean = false,
  ) {
    await this.tryGetUser(initiator)
    const {
      initiatorAddress,
      context: { transactionHash, colonyAddress },
    } = await this.tryGetComment(id)

    if (!adminOverride) {
      assert.ok(
        initiator === initiatorAddress,
        `User '${initiator}' connot delete a comment they do not own`,
      )
    }

    const filter: StrictRootQuerySelector<EventDoc<TransactionMessageEvent>> = {
      _id: new ObjectID(id),
    }

    let set = {
      $set: { 'context.deleted': true },
    } as StrictUpdateQuery<EventDoc<TransactionMessageEvent>>

    if (adminOverride) {
      set = {
        $set: { 'context.adminDelete': true },
      } as StrictUpdateQuery<EventDoc<TransactionMessageEvent>>
    }

    this.pubsub.publish(SubscriptionLabel.TransactionMessageUpdated, {
      transactionHash,
      colonyAddress,
    })

    return this.events.updateOne(filter, set)
  }

  async undeleteTransactionMessage(
    initiator: string,
    id: string,
    adminOverride: boolean = false,
  ) {
    await this.tryGetUser(initiator)
    const {
      initiatorAddress,
      context: { transactionHash, colonyAddress },
    } = await this.tryGetComment(id)

    if (!adminOverride) {
      assert.ok(
        initiator === initiatorAddress,
        `User '${initiator}' connot delete a comment they do not own`,
      )
    }

    const filter: StrictRootQuerySelector<EventDoc<TransactionMessageEvent>> = {
      _id: new ObjectID(id),
    }

    let set = {
      $set: { 'context.deleted': false },
    } as StrictUpdateQuery<EventDoc<TransactionMessageEvent>>

    if (adminOverride) {
      set = {
        $set: { 'context.adminDelete': false },
      } as StrictUpdateQuery<EventDoc<TransactionMessageEvent>>
    }

    this.pubsub.publish(SubscriptionLabel.TransactionMessageUpdated, {
      transactionHash,
      colonyAddress,
    })

    return this.events.updateOne(filter, set)
  }

  /*
   * Ban Hammers
   */

  async banUserTransactionMessages(
    initiator: string,
    colonyAddress: string,
    userAddress: string,
    eventId: string,
  ) {
    await this.tryGetUser(initiator)
    const transactionMessage = await this.tryGetComment(eventId, false)
    await this.tryGetBannedUser(colonyAddress, userAddress)

    /*
     * Ensure the colony entry always exists (creates a new one if it doesn't)
     */
    await this.eventBans.updateOne(
      { colonyAddress },
      { $setOnInsert: { colonyAddress } },
      { upsert: true },
    )

    /*
     * Add the banned user, and the reason for the ban
     */
    const bannedUser = await this.eventBans.updateOne(
      { $and: [{ colonyAddress }, { colonyAddress }] },
      {
        $addToSet: {
          bannedWalletAddresses: {
            userAddress,
            eventId: (new ObjectID(eventId) as unknown) as string,
          },
        },
      },
    )

    /*
     * Update the subscriptions
     */
    this.pubsub.publish(SubscriptionLabel.UserWasBanned, {
      transactionHash: transactionMessage?.context?.transactionHash || '',
      colonyAddress,
    })

    return bannedUser
  }

  async unbanUserTransactionMessages(
    initiator: string,
    colonyAddress: string,
    userAddress: string,
    eventId: string,
  ) {
    await this.tryGetUser(initiator)
    const { eventId: foundEventId } = await this.tryGetBannedUser(
      colonyAddress,
      userAddress,
      false,
    )
    const transactionMessage = await this.tryGetComment(
      eventId || foundEventId,
      false,
    )

    /*
     * Ensure the colony entry always exists (creates a new one if it doesn't)
     */
    await this.eventBans.updateOne(
      { colonyAddress },
      { $setOnInsert: { colonyAddress } },
      { upsert: true },
    )

    /*
     * Remove the previously banned user
     */
    const unBannedUser = await this.eventBans.updateOne(
      { $and: [{ colonyAddress }, { colonyAddress }] },
      { $pull: { bannedWalletAddresses: { userAddress } } },
    )

    /*
     * Update the subscriptions
     */
    this.pubsub.publish(SubscriptionLabel.UserWasUnBanned, {
      transactionHash: transactionMessage?.context?.transactionHash || '',
      colonyAddress,
    })

    return unBannedUser
  }
}
