import { test, expect } from '../fixtures/test-fixtures';

/**
 * サンプルE2Eテスト
 * E2Eテスト環境が正しくセットアップされているか確認
 */
test.describe('E2E環境確認テスト', () => {
  test('ページが読み込まれることを確認', async ({ page }) => {
    // Given: ルートURLに移動
    await page.goto('/');

    // Then: ページが読み込まれる
    await expect(page).toHaveURL('/');
  });

  test('タイトルが存在することを確認', async ({ page }) => {
    // Given: ルートURLに移動
    await page.goto('/');

    // Then: タイトルが設定されている
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('Page Objectが正しく動作することを確認', async ({ titlePage }) => {
    // Given: タイトルページに移動
    await titlePage.goto();

    // Then: ページが読み込まれている
    await titlePage.waitForPageLoad();
  });
});
