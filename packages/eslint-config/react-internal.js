const { resolve } = require('node:path');
const baseConfig = require('./base.js');
const onlyWarnPlugin = require('eslint-plugin-only-warn');

const project = resolve(process.cwd(), 'tsconfig.json');

/**
 * This is a custom ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 *
 * @type {import("eslint").Linter.FlatConfig[]}
 */
module.exports = [
  ...baseConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
      },
      parserOptions: {
        project,
        ecmaFeatures: {
          jsx: true,
        },
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
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
];
