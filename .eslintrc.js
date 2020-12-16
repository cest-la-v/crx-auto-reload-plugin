const isProd = process.env.NODE_ENV === 'production'
module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
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
