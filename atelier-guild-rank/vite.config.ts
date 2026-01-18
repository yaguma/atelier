import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  // GitHub Pages等へのデプロイ時にベースパスを設定
  // 環境変数VITE_BASE_PATHで上書き可能
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Phaserライブラリを専用チャンクに分割
          if (id.includes('node_modules/phaser/')) {
            return 'phaser';
          }
          // phaser3-rex-pluginsを専用チャンクに分割
          if (id.includes('node_modules/phaser3-rex-plugins/')) {
            return 'rexui';
          }
          return undefined;
        },
      },
    },
  },
}));
