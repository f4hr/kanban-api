import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testTimeout: 30000,
  preset: 'ts-jest',
  testPathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/__tests__/helpers.ts'],
};

export default config;
