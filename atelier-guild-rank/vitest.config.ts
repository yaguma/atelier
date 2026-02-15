import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/features/**/*.ts', 'src/shared/**/*.ts', 'src/scenes/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/main.ts',
        'src/**/index.ts',
        'src/shared/utils/debug.ts',
        // 型定義のみのファイル（実行可能コードなし）
        'src/features/alchemy/types/crafted-item.ts',
        'src/features/alchemy/types/recipe.ts',
        'src/features/alchemy/types/alchemy-service.ts',
        'src/features/deck/types/deck-service.ts',
        'src/features/gathering/types/material.ts',
        'src/features/gathering/types/gathering-service.ts',
        'src/features/quest/types/client.ts',
        'src/features/rank/types/rank-progress.ts',
        'src/features/shop/types/shop-item.ts',
        'src/features/shop/types/purchase-result.ts',
        'src/features/shop/types/shop-service.ts',
        // Phaser依存UIコンポーネント（E2Eテストでカバー）
        'src/features/gathering/components/GatheringPhaseUI.ts',
        'src/features/gathering/components/MaterialSlotUI.ts',
      ],
      thresholds: {
        global: {
          // UIコンポーネント（Phaserシーン・rexUI）の条件分岐は
          // ユニットテストでのカバレッジ確保が困難なため、
          // branchesのみ60%に設定（E2Eテストで補完）
          branches: 60,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, './src/shared/domain'),
      '@presentation': path.resolve(__dirname, './src/shared/presentation'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@scenes': path.resolve(__dirname, './src/scenes'),
    },
  },
});
