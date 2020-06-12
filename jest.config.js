const { join } = require('path');

module.exports = {
  bail:1,
  clearMocks: true,
  testMatch: [join(__dirname, '__tests__/*.spec.{ts,tsx}')],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
};
