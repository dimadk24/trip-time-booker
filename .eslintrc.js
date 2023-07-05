module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'airbnb-typescript',
    'prettier',
    'next/core-web-vitals',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  rules: {
    'max-len': [
      'warn',
      {
        code: 80,
        ignorePattern: '^(import|\\} from )',
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreComments: true,
      },
    ],
    // just cause non-default exports are awesome
    'import/prefer-default-export': 'off',
    'import/order': 'warn',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'consistent-return': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'jsx-a11y/label-has-for': [
      'error',
      {
        required: {
          some: ['nesting', 'id'],
        },
        allowChildren: true,
      },
    ],
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        assert: 'either',
      },
    ],
    // rule conflicts with prettier
    'react/jsx-wrap-multilines': [
      'error',
      { declaration: false, assignment: false },
    ],
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/anchor-has-content': [
      2,
      {
        components: ['Link'],
      },
    ],
    // Since we do not use prop-types
    'react/prop-types': 'off',
    'react/require-default-props': 'off',

    // typescript
    '@typescript-eslint/ban-ts-comment': 'off',

    'no-console': 'warn',
  },
  root: true,
}
