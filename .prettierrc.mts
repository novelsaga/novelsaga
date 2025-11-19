import type { PrettierConfig as PrettierPluginSortImportsConfig } from '@ianvs/prettier-plugin-sort-imports'
import type { Config, Options } from 'prettier'
import type { Options as PrettierPluginJsdocOptions } from 'prettier-plugin-jsdoc'
import type { SortJsonOptions } from 'prettier-plugin-sort-json'

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const pnpmLock = YAML.parse(fs.readFileSync(path.join(__dirname, 'pnpm-lock.yaml'), 'utf8'))

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const typescriptVer = pnpmLock.importers['.'].devDependencies.typescript.version as string

const jsCommon: PrettierPluginSortImportsConfig & PrettierPluginJsdocOptions = {
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  proseWrap: 'preserve',
  embeddedLanguageFormatting: 'auto',
  /* cspell:disable-next-line */
  plugins: ['@prettier/plugin-oxc', 'prettier-plugin-jsdoc', '@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '',
    '<TYPES>^(node:)',
    '',
    '<TYPES>',
    '',
    // ...pathAlias.map((a) => [`<TYPES>^${a}/(.*)$`, '']).flat(),
    '<TYPES>^[./]',
    '',
    '<BUILTIN_MODULES>',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    // ...pathAlias.map((a) => [`^${a}/(.*)$`, '']).flat(),
    '^[./]',
    '^(?!.*[.]css$)[./].*$',
    '.css$',
  ],
  importOrderParserPlugins: [
    'typescript',
    'jsx',
    'classProperties',
    'decorators',
    'dynamicImport',
    '["importAttributes", { "deprecatedAssertSyntax": true }]',
  ],
  importOrderTypeScriptVersion: typescriptVer,
  jsdocSeparateReturnsFromParam: true,
  jsdocSeparateTagGroups: true,
  jsdocPreferCodeFences: true,
}

const config: Config = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'strict',
  endOfLine: 'auto',
  overrides: [
    {
      files: ['*.js', '*.mjs', '*.cjs', '*.jsx'],
      options: jsCommon,
    },
    {
      files: ['*.ts', '*.mts', '*.cts', '*.tsx'],
      options: jsCommon,
    },
    {
      files: ['*.json'],
      excludeFiles: ['package.json'],
      options: {
        plugins: ['prettier-plugin-sort-json'],
        jsonRecursiveSort: true,
      } satisfies SortJsonOptions | Options,
    },
    {
      files: ['package.json'],
      options: {
        plugins: ['prettier-plugin-pkg'],
      },
    },
  ],
}

export default config
