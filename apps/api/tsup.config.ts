import { defineConfig } from 'tsup';

/**
 * Bundle the API into a self-contained artifact so the monorepo workspace
 * packages (@tayralsaad/*) are inlined and never resolved as raw TS at runtime.
 * npm dependencies stay external (installed via node_modules in the image/host),
 * which keeps the bundle small and native modules working.
 */
export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  bundle: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  minify: false,
  // Inline the workspace packages; everything else in package.json deps is external.
  noExternal: [/^@tayralsaad\//],
});
