import { defineConfig } from 'vite';

// Second build pass: bundles the content script as a single self-contained
// IIFE file (dist/content.js) with no module imports, as required for MV3
// content scripts. emptyOutDir is false so it lands next to the main build.
export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: 'src/content/content.ts',
      formats: ['iife'],
      name: 'PromptVaultContent',
      fileName: () => 'content.js',
    },
  },
});
