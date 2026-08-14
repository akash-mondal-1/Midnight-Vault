import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

export default defineConfig({
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
    },
    dedupe: ['@midnight-ntwrk/compact-runtime'],
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
