import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 2000, // Phaserは大きいため警告閾値を引き上げ
    rollupOptions: {
      input: {
        // HTML版エントリーポイント
        main: resolve(__dirname, 'index.html'),
        // Phaser版エントリーポイント
        phaser: resolve(__dirname, 'phaser.html'),
      },
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@domain': resolve(__dirname, 'src/domain'),
      '@application': resolve(__dirname, 'src/application'),
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@presentation': resolve(__dirname, 'src/presentation'),
      '@game': resolve(__dirname, 'src/game'),
    },
  },
  optimizeDeps: {
    include: ['phaser'],
  },
  server: {
    port: 3000,
    open: true,
  },
});
