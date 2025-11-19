import * as esbuild from 'esbuild'

const isWatch = process.argv.includes('--watch')

const ctx = await esbuild.context({
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
})

if (isWatch) {
  console.log('Watching for changes...')
  await ctx.watch()
} else {
  await ctx.rebuild()
  await ctx.dispose()
  console.log('Build complete!')
}
