import fs from 'node:fs'
import path from 'node:path'

import { parseTOML } from 'confbox'

import { getRoot } from './getRoot.js'

const root = getRoot()

export function getCliMainCargoToml() {
  const rootCargoTomlPath = `${root}/Cargo.toml`
  const cargoToml = fs.readFileSync(rootCargoTomlPath, 'utf-8')
  const members = parseTOML<{ workspace: { members: string[] } }>(cargoToml).workspace.members
  const mainMember = members[0]
  const cliMainCargoTomlPath = path.join(root, mainMember, 'Cargo.toml')
  return parseTOML<{ bin: [{ name: string }] }>(fs.readFileSync(cliMainCargoTomlPath, 'utf-8'))
}
