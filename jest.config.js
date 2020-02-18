const path = require('path')
const { defaults } = require('ts-jest/presets')
const {
  globalTeardown,
  testEnvironment,
} = require('@shelf/jest-mongodb/jest-preset')

const { config } = require('dotenv')
config()

module.exports = {
  ...defaults,
  globalSetup: path.resolve(__dirname, './jest.setup.ts'),
  globalTeardown,
  testEnvironment,
  setupFilesAfterEnv: ['jest-extended'],
}
