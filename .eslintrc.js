module.exports = {
  extends: '@exodus/eslint-config/javascript',
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      extends: '@exodus/eslint-config/typescript',
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: ['**/*.spec.ts', 'src/utils/testing.ts'] },
        ],
      },
    },
  ],
}
