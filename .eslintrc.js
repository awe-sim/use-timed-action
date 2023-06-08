module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'plugin:react/recommended'],
  plugins: ['prettier', 'react-hooks'],
  env: {
    browser: true,
    node: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'no-prototype-builtins': 'off',
    'no-debugger': 'error',
    'no-dupe-else-if': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-duplicate-imports': 'error',
    'no-fallthrough': 'error',
    'no-unreachable': 'error',
    'no-unsafe-optional-chaining': 'warn',
    'no-unused-vars': 'warn',
    'no-console': 'error',
    'no-alert': 'error',
    eqeqeq: 'warn',
    'no-shadow': 'warn',
    'no-useless-rename': 'warn',
    'no-var': 'warn',
    'prefer-const': 'error',
    'prefer-exponentiation-operator': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  globals: {
    NodeJS: true
  }
};
