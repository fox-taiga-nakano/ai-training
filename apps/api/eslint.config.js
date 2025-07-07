const nestConfig = require('@repo/eslint-config/nest.js');

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  ...nestConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
  },
];
