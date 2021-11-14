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
  private readonly notifications: Collection<NotificationDoc>
  private readonly users: Collection<UserDoc>
  private readonly pubsub: PubSub

  constructor(db: Db, pubsub: PubSub) {
    this.events = db.collection<EventDoc<any>>(CollectionNames.Events)
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

  private async tryGetComment(id: string) {
    const eventMessage = await this.events.findOne(ObjectID(id))
    assert.ok(!!eventMessage, `Comment "${id}" does not exist`)
    return eventMessage
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
      },
    )
    this.pubsub.publish(SubscriptionLabel.TransactionMessageAdded, {
      transactionHash,
      colonyAddress,
    })
    return newTransactionMessageId
  }

  async deleteTransactionMessage(initiator: string, id: string) {
    await this.tryGetUser(initiator)
    const comment = await this.tryGetComment(id)

    // assert.ok(initiator === comment.initiatorAddress || , `User with address '${walletAddress}' not found`)
    const filter: StrictRootQuerySelector<EventDoc<TransactionMessageEvent>> = {
      _id: new ObjectID(id),
    }

    return this.events.updateOne(filter, {
      $set: { 'context.deleted': true },
    } as StrictUpdateQuery<EventDoc<TransactionMessageEvent>>)
    /*
     * @TODO Don't forget about subscriptions
     */
  }
}
