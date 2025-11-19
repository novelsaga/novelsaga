import type { Configuration } from 'lint-staged'

import fs from 'node:fs/promises'
import path from 'node:path'

import isBinaryPath from 'is-binary-path'
import micromatch from 'micromatch'
import { isEmpty, isNotEmpty } from 'ramda'
import shebangCommand from 'shebang-command'

const isShellScript = async (filename: string) => {
  if (filename.endsWith('.sh') || filename.endsWith('.zsh') || filename.endsWith('.bash')) return true
  // get first line of file
  const sheBang = (await fs.readFile(filename, { encoding: 'utf-8' })).split('\n')[0]
  const command = shebangCommand(sheBang)
  return command?.endsWith('sh') || false
}

const commands = {
  eslint: (filenames: string[]) => `eslint --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`,
  changeEol: (filenames: string[]) =>
    `crlf --set=LF ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`,
  prettier: (filenames: string[]) =>
    `prettier --write ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`,
  shfmt: (filenames: string[]) => `shfmt --write ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`,
  cspell: (filenames: string[]) => `cspell lint ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`,
  checkEmpty: (filenames: string[], command: (filenames: string[]) => string) =>
    isEmpty(filenames) ? [] : [command(filenames)],
  alejandra: (filenames: string[]) => `alejandra ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`,
  rustfmt: (filenames: string[]) =>
    `rustfmt --edition 2024 ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`,
}

const lintStage: Configuration = async (allStagedFiles) => {
  const noBinaryFile = allStagedFiles.filter((f) => !isBinaryPath(f))
  const srcJsFiles = micromatch(noBinaryFile, [
    '**/src/**/*.js',
    '**/src/**/*.mjs',
    '**/src/**/*.cjs',
    '**/src/**/*.jsx',
  ])
  if (isNotEmpty(srcJsFiles)) {
    throw new Error(`JavaScript files aren't allowed in src directory`)
  }
  const jsAndTsFiles = micromatch(noBinaryFile, [
    '**/*.js',
    '**/*.mjs',
    '**/*.cjs',
    '**/*.ts',
    '**/*.mts',
    '**/*.cts',
    '**/*.tsx',
    '**/*.jsx',
  ])
  const jsonFile = noBinaryFile.filter((f) => f.endsWith('.json') || f.endsWith('.json5'))
  const yamlFile = noBinaryFile
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .filter((f) => !f.includes('pnpm-lock'))
  const shellFiles: string[] = []
  for (const f of noBinaryFile) {
    if ((await isShellScript(f)) || f.includes('.envrc') || f.includes('.husky')) {
      shellFiles.push(f)
    }
  }
  const ignoreFiles = noBinaryFile.filter((f) => f.endsWith('ignore'))
  const nixFiles = noBinaryFile.filter((f) => f.endsWith('.nix'))
  const rustFiles = noBinaryFile.filter((f) => f.endsWith('.rs'))
  return commands
    .checkEmpty(noBinaryFile, commands.changeEol)
    .concat(commands.checkEmpty(noBinaryFile, commands.cspell))
    .concat(commands.checkEmpty(jsAndTsFiles, commands.eslint))
    .concat(commands.checkEmpty([...jsonFile, ...yamlFile], commands.prettier))
    .concat(commands.checkEmpty([...shellFiles, ...ignoreFiles], commands.shfmt))
    .concat(commands.checkEmpty(nixFiles, commands.alejandra))
    .concat(commands.checkEmpty(rustFiles, commands.rustfmt))
}

export default lintStage
