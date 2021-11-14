/*
 * Migration: Create a new collection called eventBans
 *
 * This is to only be run for already deployed servers. If you spun a new one up
 * it will be created automatically
 */
db.createCollection(
  'eventBans',
  {
    validator: {
      $jsonSchema: {
        additionalProperties: false,
        bsonType: 'object',
        required: ['colonyAddress'],
        properties: {
          _id: { bsonType: 'objectId' },
          colonyAddress: {
            bsonType: 'string',
            description: 'must be a string and is required',
            maxLength: 42,
          },
          bannedWalletAddresses: {
            bsonType: 'array',
            description: 'must be an array of user addresses',
            uniqueItems: true,
            additionalProperties: false,
            items: {
              bsonType: 'string',
            }
          }
        }
      }
    }
  }
);

db.getCollection('eventBans').createIndex(
  { 'colonyAddress': 1 },
  { unique: true }
);
