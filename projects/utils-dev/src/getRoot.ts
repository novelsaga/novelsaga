import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getRoot = () => {
  const DEVENV_ROOT = process.env.DEVENV_ROOT
  if (DEVENV_ROOT) return DEVENV_ROOT
  // 向上寻找 flake.nix 所在目录
  let dir = __dirname
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'flake.nix'))) {
      return dir
    }
    dir = path.dirname(dir)
  }
  throw new Error('Cannot find project root (flake.nix not found)')
}
