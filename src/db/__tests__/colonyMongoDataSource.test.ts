import { MongoClient, ObjectID } from 'mongodb'
import { CachedCollection } from 'apollo-datasource-mongo'

import { ColonyMongoDataSource } from '../colonyMongoDataSource'
import {
  EventType,
  LevelStatus,
  PersistentTaskStatus,
  ProgramStatus,
  SubmissionStatus,
} from '../../graphql/types'

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
    await db.collection('levels').deleteMany({})
    await db.collection('notifications').deleteMany({})
    await db.collection('persistentTasks').deleteMany({})
    await db.collection('programs').deleteMany({})
    await db.collection('submissions').deleteMany({})
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
      levels: expect.any(CachedCollection),
      notifications: expect.any(CachedCollection),
      persistentTasks: expect.any(CachedCollection),
      programs: expect.any(CachedCollection),
      submissions: expect.any(CachedCollection),
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

  it('should get all achievements for a user in a colony', async () => {
    const {
      insertedIds: programIds,
    } = await data.collections.programs.collection.insertMany([
      {
        colonyAddress: '0xdeadbeef',
        creatorAddress: 'first',
        levelIds: [],
        enrolledUserAddresses: [],
        status: ProgramStatus.Active,
      },
      {
        colonyAddress: '0xbeefdead',
        creatorAddress: 'first',
        levelIds: [],
        enrolledUserAddresses: [],
        status: ProgramStatus.Active,
      },
    ])
    const {
      insertedIds: levelIds,
    } = await data.collections.levels.collection.insertMany([
      {
        creatorAddress: 'first',
        programId: programIds[0],
        stepIds: [],
        completedBy: ['first'],
        status: LevelStatus.Active,
      },
      {
        creatorAddress: 'first',
        programId: programIds[0],
        stepIds: [],
        completedBy: ['first'],
        status: LevelStatus.Active,
      },
      {
        creatorAddress: 'first',
        programId: programIds[1],
        stepIds: [],
        completedBy: ['first'],
        status: LevelStatus.Active,
      },
    ])

    const achievements = await data.getUserCompletedLevels(
      'first',
      '0xdeadbeef',
    )

    expect(achievements.length).toEqual(2)
  })

  it('should get all submissions for a program', async () => {
    const {
      insertedIds: taskIds,
    } = await data.collections.persistentTasks.collection.insertMany([
      {
        colonyAddress: '0xdeadbeef',
        creatorAddress: 'first',
        title: 'One task',
        payouts: [],
        status: PersistentTaskStatus.Active,
      },
      {
        colonyAddress: '0xdeadbeef',
        creatorAddress: 'first',
        title: 'Another task',
        payouts: [],
        status: PersistentTaskStatus.Active,
      },
    ])
    const {
      insertedId: programId,
    } = await data.collections.programs.collection.insertOne({
      colonyAddress: '0xdeadbeef',
      creatorAddress: 'first',
      levelIds: [],
      enrolledUserAddresses: [],
      status: ProgramStatus.Active,
    })
    const {
      insertedIds: levelIds,
    } = await data.collections.levels.collection.insertMany([
      {
        creatorAddress: 'first',
        programId: programId,
        stepIds: [taskIds[0].toString()],
        completedBy: [],
        status: LevelStatus.Active,
      },
      {
        creatorAddress: 'first',
        programId: programId,
        stepIds: [taskIds[1].toString()],
        completedBy: [],
        status: LevelStatus.Active,
      },
    ])

    await data.collections.programs.collection.updateOne(
      {
        _id: programId,
      },
      {
        $push: {
          levelIds: { $each: [levelIds[0].toString(), levelIds[1].toString()] },
        },
      },
    )

    await data.collections.submissions.collection.insertMany([
      {
        creatorAddress: 'second',
        persistentTaskId: taskIds[0],
        submission: 'My result',
        status: SubmissionStatus.Open,
        statusChangedAt: new Date(),
      },
      {
        creatorAddress: 'third',
        persistentTaskId: taskIds[1],
        submission: 'My other result',
        status: SubmissionStatus.Open,
        statusChangedAt: new Date(),
      },
      {
        creatorAddress: 'third',
        persistentTaskId: taskIds[1],
        submission: 'My other result for second task',
        status: SubmissionStatus.Open,
        statusChangedAt: new Date(),
      },
    ])

    const submissions = await data.getProgramSubmissions(programId.toString())

    expect(submissions[0].submission).toMatchObject({
      creatorAddress: 'second',
      submission: 'My result',
    })
    expect(submissions[1].submission).toMatchObject({
      creatorAddress: 'third',
      submission: 'My other result',
    })
    expect(submissions[2].submission).toMatchObject({
      creatorAddress: 'third',
      submission: 'My other result for second task',
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
