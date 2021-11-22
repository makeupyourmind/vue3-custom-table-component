/* eslint-disable prettier/prettier */
module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
    '@vue/typescript',
    'plugin:import/typescript',
  ],
  plugins: [
    'unused-imports',
    'prettier',
    '@typescript-eslint',
    'eslint-plugin-import'
  ],
  rules: {
    'vue/max-len': [
      'error',
      {
        code: 100,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
        ignoreHTMLAttributeValues: true,
        ignoreHTMLTextContents: true,
      },
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'object-curly-newline': ['error', { consistent: true }],
    // 'prettier/prettier': ['error', { semi: true }],
    'quote-props': ['error', 'consistent'],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/no-v-html': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'import/order': [
      'error',
      {
        "groups": ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        'endOfLine': 'auto',
      }
    ]
  },
};
