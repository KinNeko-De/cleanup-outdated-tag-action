/* eslint-disable global-require */
// Flat config for ESLint 9+ — explicitly define languageOptions and rules
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const githubPlugin = require('eslint-plugin-github')
const jestPlugin = require('eslint-plugin-jest')
const jsoncPlugin = require('eslint-plugin-jsonc')
const prettierPlugin = require('eslint-plugin-prettier')
const importPlugin = require('eslint-plugin-import')

const baseConfig = {
  ignores: [
    '**/dist/**',
    '**/coverage/**',
    'node_modules/**',
    '.github/**',
    'badges/**',
    '**/lib/**'
  ],
  languageOptions: {
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly'
    }
  },

  plugins: {
    github: githubPlugin,
    jest: jestPlugin,
    jsonc: jsoncPlugin,
    prettier: prettierPlugin,
    import: importPlugin
  },

  // Settings for import resolver so ESLint can resolve .ts imports
  settings: {
    'import/resolver': {
      typescript: {
        // include both root and linter tsconfig
        project: ['./tsconfig.json', './.github/linters/tsconfig.json'],
        // try to resolve `@types/*` packages and TypeScript extensions
        alwaysTryTypes: true
      }
    },
    // ensure eslint-plugin-import knows about .ts extensions
    'import/extensions': ['.js', '.ts']
  },

  // Base rules (non-TypeScript specific)
  rules: {
    'prettier/prettier': 'error',
    camelcase: 'off',
    'eslint-comments/no-use': 'off',
    'eslint-comments/no-unused-disable': 'off',
    'i18n-text/no-en': 'off',
    'import/no-namespace': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    semi: 'off'
  }
}

const tsConfig = {
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      project: ['./tsconfig.json', './.github/linters/tsconfig.json']
    }
  },
  plugins: {
    '@typescript-eslint': tsPlugin
  },
  rules: {
    ...((tsPlugin &&
      tsPlugin.configs &&
      tsPlugin.configs.recommended &&
      tsPlugin.configs.recommended.rules) ||
      {}),
    '@typescript-eslint/no-non-null-assertion': 'warn'
  }
}

module.exports = [baseConfig, tsConfig]
