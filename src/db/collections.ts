import { CollectionCreateOptions, IndexOptions } from 'mongodb'

export enum CollectionNames {
  Colonies = 'colonies',
  Domains = 'domains',
  Messages = 'messages',
  Notifications = 'notifications',
  Tasks = 'tasks',
  Users = 'users',
}

export type CollectionsManifest = Map<
  CollectionNames,
  { create: CollectionCreateOptions; indexes: [string, IndexOptions][] }
>

export const COLLECTIONS_MANIFEST: CollectionsManifest = new Map([
  [
    CollectionNames.Users,
    {
      create: {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['username', 'walletAddress'],
            properties: {
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
              colonies: {
                bsonType: 'array',
                description: 'must be an array of colony addresses',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
              tasks: {
                bsonType: 'array',
                description: 'must be an array of task IDs',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
            },
          },
        },
      },
      indexes: [
        ['walletAddress', { unique: true }],
        ['username', { unique: true }],
        ['colonies', { sparse: true }],
        ['tasks', { sparse: true }],
      ],
    },
  ],
  [
    CollectionNames.Colonies,
    {
      create: {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['colonyName', 'colonyAddress'],
            properties: {
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
              tasks: {
                bsonType: 'array',
                description: 'must be an array of task IDs',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
            },
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
            bsonType: 'object',
            required: ['creatorAddress', 'colonyAddress', 'ethDomainId'],
            properties: {
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
              ethTaskId: {
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
              workRequests: {
                bsonType: 'array',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
              workInvites: {
                bsonType: 'array',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
            },
          },
        },
      },
      indexes: [
        ['colonyAddress', {}],
        ['creatorAddress', {}],
        ['ethDomainId', {}],
        ['ethTaskId', { sparse: true }],
      ],
    },
  ],
  [
    CollectionNames.Domains,
    {
      create: {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: [
              'colonyAddress',
              'name',
              'ethDomainId',
              'ethParentDomainId',
            ],
            properties: {
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
              ethParenttDomainId: {
                bsonType: 'number',
                minimum: 1,
              },
            },
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
            bsonType: 'object',
            required: ['type', 'createdAt'],
            properties: {
              createdAt: {
                bsonType: 'timestamp',
              },
              type: {
                bsonType: 'string',
                maxLength: 100,
              },
              value: {
                bsonType: 'object',
              },
              users: {
                bsonType: 'array',
                uniqueItems: true,
                additionalProperties: false,
                items: {
                  bsonType: 'object',
                  required: ['userAddress'],
                  properties: {
                    userAddress: {
                      bsonType: 'string',
                    },
                    read: {
                      bsonType: 'bool',
                    },
                  },
                },
              },
            },
          },
        },
      },
      indexes: [
        ['type', {}],
        ['colonyAddress', { sparse: true }],
        ['mentions', { sparse: true }],
      ],
    },
  ],
  [
    CollectionNames.Messages,
    {
      create: {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['context', 'body', 'createdAt'],
            properties: {
              createdAt: {
                bsonType: 'timestamp',
              },
              context: {
                properties: {
                  type: {
                    enum: ['task', 'domain', 'colony', 'user'],
                  },
                  value: {
                    bsonType: 'string',
                  },
                },
              },
              body: {
                bsonType: 'string',
                maxLength: 4000,
              },
              // TODO later: Support mentioning colonies, domains, tasks?
              userMentions: {
                bsonType: 'array',
                description: 'must be an array of user addresses',
                uniqueItems: true,
                items: {
                  bsonType: 'string',
                },
              },
            },
          },
        },
      },
      indexes: [
        ['type', {}],
        ['context', {}],
        ['userMentions', { sparse: true }],
      ],
    },
  ],
])
