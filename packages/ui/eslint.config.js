const reactInternalConfig = require('@repo/eslint-config/react-internal.js');

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  ...reactInternalConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.lint.json',
      },
    },
  },
];
