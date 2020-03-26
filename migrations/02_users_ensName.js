/*
 * Migration 2.1: Add a new property, `ensName` to the `users` collection
 *
 * This migration needs to be run on an already existing database, created prior to this.
 * If you are starting up a fresh one, you *do not* need to run this.
 *
 * This migration is intended to be run manually against the database, either via the
 * mongo CLI, or via another client you may be using
 */

db.runCommand({
  collMod: 'users',
  validator: {
    $jsonSchema: {
      properties: {
        ensName: {
          bsonType: 'string',
          maxLength: 100,
        }
      }
    }
  }
});

/*
 * Migration 2.2: Copy values from the existing `username` field into `ensName` for historic value preservation
 *
 * This migration needs to be run on an already existing database, created prior to this.
 * If you are starting up a fresh one, you *do not* need to run this.
 *
 * This migration is intended to be run manually against the database, either via the
 * mongo CLI, or via another client you may be using
 *
 * @NOTE If using Robo 3T as your mongo client
 * Anything <= version 1.3 has a bug that makes this update not work.
 * My advice is to use the standard mongo CLI client
 */

db.getCollection('users').updateMany(
  {},
  [
    { '$set': { 'ensName': '$username' }}
  ]
);
