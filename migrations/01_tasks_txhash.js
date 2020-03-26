/*
 * Migration: Add a new property, `txHash` to the `tasks` collection
 *
 * This migration needs to be run on an already existing database, created prior to this.
 * If you are starting up a fresh one, you *do not* need to run this.
 *
 * This migration is intended to be run manually against the database, either via the
 * mongo CLI, or via another client you may be using
 */

db.runCommand({
  collMod: 'tasks',
  validator: {
    $jsonSchema: {
      properties: {
        txHash: {
          bsonType: 'string',
          maxLength: 100,
        }
      }
    }
  }
});
