module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json', './__tests__/tsconfig.json'],
  },
  extends: ['airbnb-base', 'airbnb-typescript/base', 'plugin:jest/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'jest', 'prettier'],
  ignorePatterns: ['db'],
  rules: {
    'no-underscore-dangle': [
      warn,
      {
        allow: ['_id'],
      },
    ],
    'import/prefer-default-export': 'off',
  },
};
