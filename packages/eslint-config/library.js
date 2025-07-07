const { resolve } = require('node:path');
const baseConfig = require('./base.js');
const onlyWarnPlugin = require('eslint-plugin-only-warn');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  ...baseConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
      parserOptions: {
        project,
      },
    },
    plugins: {
      'only-warn': onlyWarnPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project,
        },
      },
    },
  },
];
