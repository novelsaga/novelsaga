import path from 'node:path'
import { fileURLToPath } from 'node:url'

import cspellPlugin from '@cspell/eslint-plugin'
import { FlatCompat } from '@eslint/eslintrc'
import eslint from '@eslint/js'
import EslintConfigPrettier from 'eslint-config-prettier'
import EslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const tseslintConfig = defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  EslintPluginPrettierRecommended,
  EslintConfigPrettier,
  ...compat.config({
    plugins: ['ramda'],
    extends: ['plugin:ramda/recommended'],
  }),
  {
    ignores: ['**/node_modules/**/*', '**/dist/**/*', '**/build/**/*', '**/out/**/*'],
    plugins: { '@cspell': cspellPlugin },
    rules: { '@cspell/spellchecker': ['warn', {}] },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.mts', '**/*.cts'],
    ignores: ['**/src/**/*.js', '**/src/**/*.mjs', '**/src/**/*.cjs', '**/src/**/*.mts', '**/src/**/*.cts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ['**/node_modules/**/*', '**/dist/**/*', '**/build/**/*'],
    languageOptions: {
      parserOptions: {
        projectService: {
          defaultProject: `${__dirname}/tsconfig.json`,
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        {
          allowConstantLoopConditions: true,
        },
      ],
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          checkThenables: true,
          ignoreVoid: true,
          ignoreIIFE: true,
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowAny: false,
          allowBoolean: true,
          allowArray: false,
          allowNever: false,
          allowNullish: false,
          allowNumber: true,
          allowRegExp: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksConditionals: true,
          checksSpreads: true,
          checksVoidReturn: {
            arguments: false,
            attributes: false,
          },
        },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/swagger/api'],
              message: '使用useAPI',
              allowTypeImports: true,
              importNames: ['default'],
            },
            {
              group: ['@assets/iconify-icons/generated-icons'],
              message: '使用 @assets/iconify-icons/classes',
              allowTypeImports: true,
              importNames: ['default'],
            },
            {
              group: ['enum_overrides'],
              message: '请导入覆盖后的类型',
              allowTypeImports: false,
            },
            {
              group: ['@assets/iconify-icons/classes'],
              message: '此对象太大，请使用宏进行导入',
              allowTypeImports: true,
              importNames: ['default'],
            },
            {
              group: ['___generated___'],
              message: '请勿使用生成的代码',
            },
          ],
          paths: [
            ...[
              'assert',
              'buffer',
              'child_process',
              'cluster',
              'crypto',
              'dgram',
              'dns',
              'domain',
              'events',
              'freelist',
              'fs',
              'http',
              'https',
              'module',
              'net',
              'os',
              'path',
              'punycode',
              'querystring',
              'readline',
              'repl',
              'smalloc',
              'stream',
              'string_decoder',
              'sys',
              'timers',
              'tls',
              'tracing',
              'tty',
              'url',
              'util',
              'vm',
              'zlib',
            ].map((name) => ({
              name,
              message: `please import from 'node:${name}' instead`,
            })),
          ],
        },
      ],
    },
  },
)

export default tseslintConfig
