export default {
  testEnvironment: 'node',
  transform: {},
  openHandlesTimeout: 0,
  setupFilesAfterEnv: ['./__tests__/global-script/suite.config.js'],
  globalSetup: './__tests__/global-script/start.config.js',
  globalTeardown: './__tests__/global-script/end.config.js',
  testPathIgnorePatterns: ["./*.config.js"]
};