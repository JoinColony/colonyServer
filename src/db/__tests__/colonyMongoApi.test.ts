import { Db, MongoClient, ObjectID } from 'mongodb'
import { CachedCollection } from 'apollo-datasource-mongo'

import { ColonyMongoApi } from '../colonyMongoApi'
import {
  LevelStatus,
  PersistentTaskStatus,
  ProgramStatus,
  SubmissionStatus,
} from '../../graphql/types'
import { EventType } from '../../constants'

describe('ColonyMongoApi', () => {
  let connection: MongoClient
  let db: Db
  let api: ColonyMongoApi

  beforeAll(async () => {
    // Use the MONGO_URL injected by jest-mongodb
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    db = await connection.db()
    api = new ColonyMongoApi(db)
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

  it('should count all submissions for a level by a user', async () => {
    const { insertedIds: taskIds } = await db
      .collection('persistentTasks')
      .insertMany([
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
        {
          colonyAddress: '0xdeadbeef',
          creatorAddress: 'first',
          title: 'Third task',
          payouts: [],
          status: PersistentTaskStatus.Active,
        },
      ])
    const { insertedId: programId } = await db
      .collection('programs')
      .insertOne({
        colonyAddress: '0xdeadbeef',
        creatorAddress: 'first',
        levelIds: [],
        enrolledUserAddresses: [],
        status: ProgramStatus.Active,
      })
    const { insertedIds: levelIds } = await db.collection('levels').insertMany([
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

    await db.collection('programs').updateOne(
      {
        _id: programId,
      },
      {
        $push: {
          levelIds: { $each: [levelIds[0].toString(), levelIds[1].toString()] },
        },
      },
    )
    
    // We're creating five submissions of which just 2 satisfy the criteria:
    // - Belongs to user `second`
    // - Is `Accepted`
    // - Belongs to taskId 0 (these are the level steps)

    await db.collection('submissions').insertMany([
      {
        creatorAddress: 'second',
        persistentTaskId: taskIds[0],
        submission: 'My result open',
        status: SubmissionStatus.Open,
        statusChangedAt: new Date(),
      },
      {
        creatorAddress: 'second',
        persistentTaskId: taskIds[0],
        submission: 'My result',
        status: SubmissionStatus.Accepted,
        statusChangedAt: new Date(),
      },
      {
        creatorAddress: 'second',
        persistentTaskId: taskIds[0],
        submission: 'My other result',
        status: SubmissionStatus.Accepted,
        statusChangedAt: new Date(),
      },
      {
        creatorAddress: 'second',
        persistentTaskId: taskIds[1],
        submission: 'My other result for second task',
        status: SubmissionStatus.Accepted,
        statusChangedAt: new Date(),
      },
      {
        creatorAddress: 'second',
        persistentTaskId: taskIds[2],
        submission: 'result for third task',
        status: SubmissionStatus.Accepted,
        statusChangedAt: new Date(),
      },
    ])

    await expect(
      api['countAcceptedLevelSubmissions'](
        [taskIds[0].toString()],
        'second',
      ),
    ).resolves.toEqual(2)
  })
})
