const { defaults } = require('ts-jest/presets')
const {
  globalSetup,
  globalTeardown,
  testEnvironment,
} = require('@shelf/jest-mongodb/jest-preset')
const { config } = require('dotenv')

config()

module.exports = {
  ...defaults,
  globalSetup,
  globalTeardown,
  testEnvironment,
}
