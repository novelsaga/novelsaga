import * as esbuild from 'esbuild'
import macros from 'unplugin-parcel-macros'

const isWatch = process.argv.includes('--watch')

const ctx = await esbuild.context({
  plugins: [macros.esbuild()],
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  outfile: './out/extension.cjs',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  minify: !isWatch,
  logLevel: 'info',
  treeShaking: true,
})

if (isWatch) {
  console.log('Watching for changes...')
  await ctx.watch()
} else {
  await ctx.rebuild()
  await ctx.dispose()
  console.log('Build complete!')
}
