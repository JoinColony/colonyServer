import { CollectionCreateOptions, IndexOptions } from 'mongodb'

export enum CollectionNames {
  Colonies = 'colonies',
  Domains = 'domains',
  Comments = 'comments',
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
                bsonType: ['string'],
                description: 'must be an array of colony addresses',
                uniqueItems: true,
              },
              tasks: {
                bsonType: ['string'],
                description: 'must be an array of task addresses',
                uniqueItems: true,
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
                bsonType: ['string'],
                uniqueItems: true,
              },
              workInvites: {
                bsonType: ['string'],
                uniqueItems: true,
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
            required: ['type'],
            properties: {
              colonyAddress: {
                bsonType: 'string',
                description: 'must be a string',
                maxLength: 42,
              },
              type: {
                bsonType: 'string',
                description: 'must be a string and is required',
                maxLength: 100,
              },
              mentions: {
                bsonType: ['string'],
                description: 'must be an array of user addresses',
                uniqueItems: true,
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
])
