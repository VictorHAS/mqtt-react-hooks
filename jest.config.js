const { join } = require('path');

module.exports = {
  bail: true,
  collectCoverage: true,
  collectCoverageFrom: ['lib/*.tsx', '!lib/setupTest.tsx'],
  coverageDirectory: '__tests__/coverage',
  coverageReporters: ['json', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  clearMocks: true,
  testMatch: [join(__dirname, '__tests__/*.spec.{ts,tsx}')],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
};
