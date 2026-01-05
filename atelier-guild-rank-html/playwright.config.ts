import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2Eテスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストファイルのディレクトリ
  testDir: './tests/e2e/specs',

  // 各テストファイルの最大実行時間
  timeout: 30_000,

  // expect()の最大待機時間
  expect: {
    timeout: 5_000,
  },

  // テストの並列実行設定
  fullyParallel: true,

  // CI環境での失敗時リトライ回数
  retries: process.env.CI ? 2 : 0,

  // CI環境での並列ワーカー数
  workers: process.env.CI ? 1 : undefined,

  // テストレポート設定
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // 全テスト共通設定
  use: {
    // 開発サーバーのベースURL
    baseURL: 'http://localhost:3000',

    // 失敗時にトレースを収集
    trace: 'on-first-retry',

    // 失敗時にスクリーンショットを撮影
    screenshot: 'only-on-failure',

    // ビデオ録画設定
    video: 'retain-on-failure',

    // ロケール設定
    locale: 'ja-JP',

    // タイムゾーン設定
    timezoneId: 'Asia/Tokyo',
  },

  // ブラウザ設定
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 開発サーバーの自動起動設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
