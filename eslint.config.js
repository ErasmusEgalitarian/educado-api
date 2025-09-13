const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      prettier,
    },
    settings: {
    },
    rules: {
      // Your custom rules (formatting rules removed as they're handled by Prettier)
      'camelcase': 'off',
      
      '@typescript-eslint/no-require-imports': 'off',
      
      // Prettier
      'prettier/prettier': [
        'error',
        {
          semi: false,
          printWidth: 80,
          bracketSpacing: true,
          singleQuote: true,
          trailingComma: 'es5',
          endOfLine: 'auto',
        },
      ],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      '*.config.js',
      '*.config.ts',
      'babel.config.js',
      'coverage/**',
      'out/**',
      '*.log',
      '.DS_Store',
    ],
  }
);
