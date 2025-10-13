// jest.config.js
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/*.test.ts"], 
  collectCoverage: true, 
  collectCoverageFrom: [ 
    "src/**/*.ts",
    "!src/server.ts", 
    "!src/index.ts",
    "!src/**/config.ts"
  ],
  coverageDirectory: "coverage",
};