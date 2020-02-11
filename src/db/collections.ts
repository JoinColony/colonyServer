import { CollectionCreateOptions, IndexOptions } from 'mongodb'
import {
  ColonyDoc,
  DomainDoc,
  EventDoc,
  LevelDoc,
  NotificationDoc,
  PersistentTaskDoc,
  ProgramDoc,
  SubmissionDoc,
  SuggestionDoc,
  TaskDoc,
  TokenDoc,
  UserDoc,
} from './types'
import { ETH_ADDRESS } from '../constants'

export enum CollectionNames {
  Colonies = 'colonies',
  Domains = 'domains',
  Events = 'events',
  Levels = 'levels',
  Notifications = 'notifications',
  PersistentTasks = 'persistentTasks',
  Programs = 'programs',
  Submissions = 'submissions',
  Suggestions = 'suggestions',
  Tasks = 'tasks',
  Tokens = 'tokens',
  Users = 'users',
}

export type CollectionsManifest = Map<
  CollectionNames,
  {
    create: CollectionCreateOptions
    indexes: [string, IndexOptions][]
    seedDocs?: any[]
  }
>

type SchemaFields<T> = {
  readonly [P in keyof T]: {}
}

export const COLLECTIONS_MANIFEST: CollectionsManifest = new Map([
  [
    CollectionNames.Users,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: ['username', 'walletAddress'],
            properties: {
              _id: { bsonType: 'objectId' },
              username: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 100,
              },
              walletAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              avatarHash: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 100,
              },
              bio: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 2000,
              },
              displayName: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 100,
              },
              location: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 100,
              },
              website: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 2000,
              },
              colonyAddresses: {
                bsonType: 'array',
                description: 'must be an array of colony addresses',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
              taskIds: {
                bsonType: 'array',
                description: 'must be an array of task IDs',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
              tokenAddresses: {
                bsonType: 'array',
                description: 'must be an array of token addresses',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
            } as SchemaFields<UserDoc>,
          },
        },
      },
      indexes: [
        ['walletAddress', { unique: true }],
        ['username', { unique: true }],
        ['colonyAddresses', { sparse: true }],
        ['taskIds', { sparse: true }],
      ],
    },
  ],
  [
    CollectionNames.Colonies,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: ['colonyName', 'colonyAddress'],
            properties: {
              _id: { bsonType: 'objectId' },
              colonyAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              founderAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              colonyName: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 100,
              },
              avatarHash: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 100,
              },
              displayName: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 200,
              },
              description: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 4000,
              },
              guideline: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 4000,
              },
              website: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 400,
              },
              taskIds: {
                bsonType: 'array',
                description: 'must be an array of task IDs',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
              nativeTokenAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              isNativeTokenExternal: {
                bsonType: 'bool',
                description: 'must be a boolean',
              },
              tokenAddresses: {
                bsonType: 'array',
                description: 'must be an array of token addresses',
                uniqueItems: true,
                additionalProperties: false,
                items: {
                  bsonType: 'string',
                },
              },
            } as SchemaFields<ColonyDoc>,
          },
        },
      },
      indexes: [
        ['colonyAddress', { unique: true }],
        ['colonyName', { unique: true }],
      ],
    },
  ],
  [
    CollectionNames.Tasks,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: ['creatorAddress', 'colonyAddress', 'ethDomainId'],
            properties: {
              _id: { bsonType: 'objectId' },
              assignedWorkerAddress: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 42,
              },
              colonyAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              creatorAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              ethDomainId: {
                bsonType: 'number',
                minimum: 1,
              },
              ethPotId: {
                bsonType: 'number',
                minimum: 1,
              },
              ethSkillId: {
                bsonType: 'number',
                minimum: 1,
              },
              dueDate: {
                bsonType: 'date',
              },
              finalizedAt: {
                bsonType: 'date',
              },
              title: {
                bsonType: 'string',
                maxLength: 200,
              },
              description: {
                bsonType: 'string',
                maxLength: 4000,
              },
              cancelledAt: {
                bsonType: 'date',
              },
              workRequestAddresses: {
                bsonType: 'array',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
              workInviteAddresses: {
                bsonType: 'array',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
              payouts: {
                bsonType: 'array',
                additionalProperties: false,
                items: {
                  bsonType: 'object',
                  required: ['tokenAddress', 'amount'],
                  properties: {
                    tokenAddress: {
                      bsonType: 'string',
                    },
                    amount: {
                      bsonType: 'string',
                    },
                  },
                },
              },
            } as SchemaFields<TaskDoc>,
          },
        },
      },
      indexes: [
        ['colonyAddress', {}],
        ['creatorAddress', {}],
        ['ethDomainId', {}],
        ['ethPotId', { sparse: true }],
      ],
    },
  ],
  [
    CollectionNames.PersistentTasks,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: [
              'creatorAddress',
              'colonyAddress',
              'ethDomainId',
              'status',
            ],
            properties: {
              _id: { bsonType: 'objectId' },
              colonyAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              creatorAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              ethDomainId: {
                bsonType: 'number',
                minimum: 1,
              },
              ethSkillId: {
                bsonType: 'number',
                minimum: 1,
              },
              title: {
                bsonType: 'string',
                maxLength: 200,
              },
              description: {
                bsonType: 'string',
                maxLength: 4000,
              },
              payouts: {
                bsonType: 'array',
                additionalProperties: false,
                items: {
                  bsonType: 'object',
                  required: ['tokenAddress', 'amount'],
                  properties: {
                    tokenAddress: {
                      bsonType: 'string',
                    },
                    amount: {
                      bsonType: 'string',
                    },
                  },
                },
              },
              status: {
                enum: ['Active', 'Closed', 'Deleted'],
                maxLength: 100,
              },
            } as SchemaFields<PersistentTaskDoc>,
          },
        },
      },
      indexes: [
        ['colonyAddress', {}],
        ['ethDomainId', {}],
        ['status', {}],
      ],
    },
  ],
  [
    CollectionNames.Domains,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: [
              'colonyAddress',
              'name',
              'ethDomainId',
              'ethParentDomainId',
            ],
            properties: {
              _id: { bsonType: 'objectId' },
              colonyAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              name: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 200,
              },
              ethDomainId: {
                bsonType: 'number',
                minimum: 1,
              },
              ethParentDomainId: {
                oneOf: [
                  {
                    bsonType: 'number',
                    minimum: 1,
                  },
                  {
                    // For the root domain
                    bsonType: 'null',
                  },
                ],
              },
            } as SchemaFields<DomainDoc>,
          },
        },
      },
      indexes: [
        ['colonyAddress', {}],
        ['ethDomainId', {}],
        ['ethParentDomainId', { sparse: true }],
      ],
    },
  ],
  [
    CollectionNames.Notifications,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: ['eventId', 'users'],
            properties: {
              _id: { bsonType: 'objectId' },
              eventId: {
                bsonType: 'objectId',
              },
              users: {
                bsonType: 'array',
                uniqueItems: true,
                additionalProperties: false,
                items: {
                  bsonType: 'object',
                  required: ['address', 'read'],
                  properties: {
                    address: {
                      bsonType: 'string',
                    },
                    read: {
                      bsonType: 'bool',
                    },
                  },
                },
              },
            } as SchemaFields<NotificationDoc>,
          },
        },
      },
      indexes: [['users.address', {}]],
    },
  ],
  [
    CollectionNames.Events,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: ['type', 'sourceType', 'context'],
            properties: {
              _id: { bsonType: 'objectId' },
              type: {
                bsonType: 'string',
                maxLength: 100,
              },
              initiatorAddress: {
                bsonType: 'string',
                maxLength: 100,
              },
              sourceType: {
                enum: ['contract', 'db'],
                maxLength: 100,
              },
              context: {
                bsonType: 'object',
              },
            } as SchemaFields<EventDoc<object>>,
          },
        },
      },
      indexes: [
        ['type', {}],
        ['initiatorAddress', {}],
        ['context.colonyAddress', { sparse: true }],
        ['context.taskId', { sparse: true }],
      ],
    },
  ],
  [
    CollectionNames.Suggestions,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: [
              'colonyAddress',
              'creatorAddress',
              'ethDomainId',
              'status',
              'upvotes',
              'title',
            ],
            properties: {
              _id: { bsonType: 'objectId' },
              colonyAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              creatorAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              ethDomainId: {
                bsonType: 'number',
                minimum: 1,
              },
              status: {
                enum: ['Open', 'NotPlanned', 'Accepted', 'Deleted'],
                maxLength: 100,
              },
              upvotes: {
                bsonType: 'array',
                uniqueItems: true,
                additionalProperties: false,
                items: {
                  bsonType: 'string',
                  maxLength: 42,
                },
              },
              taskId: { bsonType: 'objectId' },
              title: {
                bsonType: 'string',
                maxLength: 200,
              },
            } as SchemaFields<SuggestionDoc>,
          },
        },
      },
      indexes: [
        ['colonyAddress', {}],
        ['creatorAddress', {}],
        ['ethDomainId', {}],
        ['status', {}],
        ['context.taskId', { sparse: true }],
      ],
    },
  ],
  [
    CollectionNames.Submissions,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: [
              'creatorAddress',
              'persistentTaskId',
              'submission',
              'status',
            ],
            properties: {
              _id: { bsonType: 'objectId' },
              creatorAddress: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 42,
              },
              persistentTaskId: { bsonType: 'objectId' },
              submission: {
                bsonType: 'string',
              },
              status: {
                enum: ['Open', 'Accepted', 'Rejected', 'Deleted'],
                maxLength: 100,
              },
              statusChangedAt: {
                bsonType: 'date',
              },
            } as SchemaFields<SubmissionDoc>,
          },
        },
      },
      indexes: [
        ['creatorAddress', {}],
        ['persistentTaskId', {}],
        ['status', {}],
      ],
    },
  ],
  [
    CollectionNames.Levels,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: [
              'creatorAddress',
              'programId',
              'title',
              'numRequiredSteps',
              'stepIds',
              'status',
            ],
            properties: {
              _id: { bsonType: 'objectId' },
              creatorAddress: {
                bsonType: 'string',
                maxLength: 42,
              },
              programId: { bsonType: 'objectId' },
              title: {
                bsonType: 'string',
                maxLength: 200,
              },
              description: {
                bsonType: 'string',
                maxLength: 4000,
              },
              achievement: {
                bsonType: 'string',
                maxLength: 200,
              },
              numRequiredSteps: {
                bsonType: 'int',
              },
              stepIds: {
                bsonType: 'array',
                description: 'must be an array of persistent task IDs',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
              completedBy: {
                bsonType: 'array',
                description: 'must be an array of user addresses',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
              status: {
                enum: ['Active', 'Deleted'],
                maxLength: 10,
              },
            } as SchemaFields<LevelDoc>,
          },
        },
      },
      indexes: [['status', {}], ['completedBy', {}]],
    },
  ],
  [
    CollectionNames.Tokens,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: ['address', 'name', 'symbol', 'decimals'],
            properties: {
              _id: { bsonType: 'objectId' },
              address: {
                bsonType: 'string',
                maxLength: 42,
              },
              creatorAddress: {
                bsonType: 'string',
                maxLength: 42,
              },
              name: {
                bsonType: 'string',
                maxLength: 100,
              },
              symbol: {
                bsonType: 'string',
                maxLength: 10,
              },
              decimals: {
                bsonType: 'int',
                minimum: 1,
              },
              iconHash: {
                bsonType: 'string',
              },
            } as SchemaFields<TokenDoc>,
          },
        },
      },
      indexes: [['address', {}]],
      seedDocs: [
        {
          name: 'Ether',
          symbol: 'ETH',
          address: ETH_ADDRESS,
          creatorAddress: '',
          decimals: 18,
        },
      ] as TokenDoc[],
    },
  ],
  [
    CollectionNames.Programs,
    {
      create: {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            required: [
              'colonyAddress',
              'creatorAddress',
              'status',
            ],
            properties: {
              _id: { bsonType: 'objectId' },
              colonyAddress: {
                bsonType: 'string',
                maxLength: 42,
              },
              creatorAddress: {
                bsonType: 'string',
                maxLength: 42,
              },
              title: {
                bsonType: 'string',
                maxLength: 100,
              },
              description: {
                bsonType: 'string',
                maxLength: 4000,
              },
              levelIds: {
                bsonType: 'array',
                description: 'must be an ordered array of level Ids',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
              enrolledUserAddresses: {
                bsonType: 'array',
                description: 'must be an array of user addresses',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                  maxLength: 42,
                },
              },
              status: {
                enum: ['Draft', 'Active', 'Deleted'],
                maxLength: 100,
              },
            } as SchemaFields<ProgramDoc>,
          },
        },
      },
      indexes: [
        ['colonyAddress', {}],
        ['status', {}],
      ],
    },
  ],
])
