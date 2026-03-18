import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  clearMocks: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  collectCoverageFrom: [
    'src/application/**/*.ts',
    'src/interface/**/*.ts',
    'src/infrastructure/security/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
}

export default config
