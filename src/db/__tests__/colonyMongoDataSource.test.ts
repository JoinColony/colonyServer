import { MongoClient, ObjectID } from 'mongodb'
import { CachedCollection } from 'apollo-datasource-mongo'

import { ColonyMongoDataSource } from '../colonyMongoDataSource'
import { EventType } from '../../constants'

describe('ColonyMongoDataSource', () => {
  let connection
  let db
  let data

  beforeAll(async () => {
    // Use the MONGO_URL injected by jest-mongodb
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    db = await connection.db()
    data = new ColonyMongoDataSource(db)
    data.initialize({} as any)
  })

  afterAll(async () => {
    await connection.close()
  })

  beforeEach(async () => {
    await db.collection('colonies').deleteMany({})
    await db.collection('domains').deleteMany({})
    await db.collection('events').deleteMany({})
    await db.collection('notifications').deleteMany({})
    await db.collection('suggestions').deleteMany({})
    await db.collection('tasks').deleteMany({})
    await db.collection('tokens').deleteMany({})
    await db.collection('users').deleteMany({})
  })

  const insertFirstUser = async () =>
    data.collections.users.collection.insertOne({
      walletAddress: 'first',
      username: 'first_user',
    })

  const insertSecondUser = async () =>
    data.collections.users.collection.insertOne({
      walletAddress: 'second',
      username: 'second_user',
    })

  it('should have been initialized with collections', async () => {
    expect(data.collections).toMatchObject({
      colonies: expect.any(CachedCollection),
      domains: expect.any(CachedCollection),
      events: expect.any(CachedCollection),
      notifications: expect.any(CachedCollection),
      tasks: expect.any(CachedCollection),
      tokens: expect.any(CachedCollection),
      users: expect.any(CachedCollection),
    })
  })

  it('should find a user by address', async () => {
    await insertFirstUser()

    const user = await data.getUserByAddress('first')
    expect(user).toMatchObject({
      id: 'first',
      profile: {
        walletAddress: 'first',
        username: 'first_user',
      },
    })
  })

  it('should find user notifications', async () => {
    await insertFirstUser()
    await insertSecondUser()

    const { insertedIds } = await data.collections.events.collection.insertMany(
      [
        {
          type: EventType.TaskMessage,
          sourceType: 'db',
          initiatorAddress: 'second',
          context: { taskId: 'task id', message: 'message 1' },
        },
        {
          type: EventType.TaskMessage,
          sourceType: 'db',
          initiatorAddress: 'second',
          context: { taskId: 'task id', message: 'message 2' },
        },
        {
          type: EventType.TaskMessage,
          sourceType: 'db',
          initiatorAddress: 'second',
          context: { taskId: 'task id', message: 'message 3' },
        },
        {
          type: EventType.TaskMessage,
          sourceType: 'db',
          initiatorAddress: 'first',
          context: { taskId: 'task id', message: 'message 4' },
        },
      ] as any,
    )

    await data.collections.notifications.collection.insertMany([
      {
        eventId: insertedIds[0],
        users: [{ address: 'first', read: true }],
      },
      {
        eventId: insertedIds[1],
        users: [{ address: 'first', read: false }],
      },
      {
        eventId: insertedIds[2],
        users: [{ address: 'first', read: false }],
      },
      {
        eventId: insertedIds[3],
        users: [{ address: 'second', read: false }],
      },
    ] as any)

    const firstAllNotifications = await data.getAllUserNotifications('first')
    const firstReadNotifications = await data.getReadUserNotifications('first')
    const firstUnreadNotifications = await data.getUnreadUserNotifications(
      'first',
    )
    const secondAllNotifications = await data.getAllUserNotifications('second')
    const secondReadNotifications = await data.getReadUserNotifications(
      'second',
    )
    const secondUnreadNotifications = await data.getUnreadUserNotifications(
      'second',
    )

    expect(firstAllNotifications.length).toBe(3)
    expect(firstReadNotifications.length).toBe(1)
    expect(firstUnreadNotifications.length).toBe(2)
    expect(secondAllNotifications.length).toBe(1)
    expect(secondReadNotifications.length).toBe(0)
    expect(secondUnreadNotifications.length).toBe(1)

    // Returned results should be formatted correctly, but the order of
    // the inserted events can change: just check one as a generic example
    expect(firstAllNotifications[0]).toMatchObject({
      id: expect.any(String),
      read: expect.any(Boolean),
      event: {
        context: {
          message: expect.stringContaining('message'),
          taskId: 'task id',
          type: EventType.TaskMessage,
        },
        createdAt: expect.any(Date),
        id: expect.any(String),
        initiatorAddress: expect.any(String),
        sourceId: expect.any(String),
        type: EventType.TaskMessage,
      },
    })
  })
})
