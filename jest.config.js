/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  moduleDirectories: ['node_modules', 'src'],
  preset: 'ts-jest',
  testTimeout: 10_000,
  setupFilesAfterEnv: ['jest-extended/all'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['tmp'],
  clearMocks: true,
}
