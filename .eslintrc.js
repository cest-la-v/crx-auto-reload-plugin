const isProd = process.env.NODE_ENV === 'production'
module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': isProd ? 'error' : 'off',
    'no-debugger': isProd ? 'error' : 'off',
    'comma-dangle': isProd ? 'error' : 'off',
    '@typescript-eslint/ban-ts-comment': 'off'
  },
}
