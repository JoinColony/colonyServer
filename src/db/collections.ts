import { CollectionCreateOptions, IndexOptions } from 'mongodb'

export enum CollectionNames {
  Users = 'users',
  Tasks = 'tasks',
  Colonies = 'colonies',
  // TODO define other collections
  // Domains = 'domains',
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
            required: ['creatorAddress', 'colonyAddress', 'onChain'],
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
                min: 1,
              },
              ethTaskId: {
                bsonType: 'number',
                min: 1,
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
])
