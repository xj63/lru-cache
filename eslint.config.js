import { sxzz } from '@sxzz/eslint-config'

export default sxzz(
  {
    // Features: it'll detect installed dependency and enable necessary features automatically
  },
  [
    /* custom config */
    {
      rules: {
        // enable _p var not use
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
      },
    },
  ],
)
