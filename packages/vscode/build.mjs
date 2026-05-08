import { build } from 'esbuild';

build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],   // vscode lo provee el host, no se bundlea
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  minify: false,
}).catch(() => process.exit(1));
