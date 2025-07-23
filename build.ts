await Bun.build({
  entrypoints: ['src/index.ts'],
  target: 'node',
  external: ['sury', 'effect', '@valibot/to-json-schema'],
  outdir: './dist',
});
