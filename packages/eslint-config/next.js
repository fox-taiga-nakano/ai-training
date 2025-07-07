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
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        process: 'readonly',
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
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },
];
