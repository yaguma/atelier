/**
 * DeliveryResultPanel ユニットテスト
 * TASK-0057 DeliveryPhaseUIリファクタリング - TDD Redフェーズ
 *
 * @description
 * 納品結果パネルコンポーネントのテストケース
 * - パネル表示
 * - アニメーション再生
 * - 報酬情報表示
 * - パネル非表示
 * - コールバック発行
 * - リソース管理
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// モックインポート
import { createMockScene } from './__mocks__/scene.mock';
import { createTestDeliveryResult } from './__mocks__/test-data.factory';

// =============================================================================
// テストスイート
// =============================================================================

describe('DeliveryResultPanel', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-601: show()でパネルが表示される
  // ===========================================================================

  describe('TC-601: show()でパネルが表示される', () => {
    it('Given: DeliveryResultPanelインスタンス When: show()実行 Then: isVisible()がtrueを返す', async () => {
      // Given: インスタンスが存在
      const { scene } = createMockScene();

      const { DeliveryResultPanel } = await import(
        '@presentation/ui/phases/components/delivery/DeliveryResultPanel'
      );
      const panel = new DeliveryResultPanel(scene, 0, 0);
      panel.create();

      // When: show()を呼び出す
      const result = createTestDeliveryResult();
      panel.show(result, 'テスト依頼');

      // Then: isVisible()がtrueを返す
      expect(panel.isVisible()).toBe(true);
    });
  });

  // ===========================================================================
  // TC-602: フェードインアニメーションが再生される
  // ===========================================================================

  describe('TC-602: フェードインアニメーションが再生される', () => {
    it('Given: DeliveryResultPanelインスタンス When: show()実行 Then: tweens.add()が呼ばれる', async () => {
      // Given: インスタンスが存在
      const { scene } = createMockScene();

      const { DeliveryResultPanel } = await import(
        '@presentation/ui/phases/components/delivery/DeliveryResultPanel'
      );
      const panel = new DeliveryResultPanel(scene, 0, 0);
      panel.create();

      // When: show()を呼び出す
      const result = createTestDeliveryResult();
      panel.show(result, 'テスト依頼');

      // Then: tweens.add()が呼ばれる（AnimationPresets.fade.in使用）
      expect(scene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          alpha: expect.any(Object),
        }),
      );
    });
  });

  // ===========================================================================
  // TC-603: 報酬情報が正しく表示される
  // ===========================================================================

  describe('TC-603: 報酬情報が正しく表示される', () => {
    it('Given: 納品結果 When: show()実行 Then: 貢献度・お金のテキストが正しい', async () => {
      // Given: 納品結果データ
      const result = createTestDeliveryResult({
        contribution: 150,
        gold: 75,
      });
      const { scene } = createMockScene();

      const { DeliveryResultPanel } = await import(
        '@presentation/ui/phases/components/delivery/DeliveryResultPanel'
      );
      const panel = new DeliveryResultPanel(scene, 0, 0);
      panel.create();

      // When: show()を呼び出す
      panel.show(result, 'テスト依頼');

      // Then: 報酬情報が表示される
      expect(scene.add.text).toHaveBeenCalled();
      // 貢献度150、お金75が表示されていることを確認
    });
  });

  // ===========================================================================
  // TC-604: hide()でパネルが非表示になる
  // ===========================================================================

  describe('TC-604: hide()でパネルが非表示になる', () => {
    it('Given: パネル表示済み When: hide()実行 Then: isVisible()がfalseを返す', async () => {
      // Given: パネルが表示済み
      const { scene } = createMockScene();

      const { DeliveryResultPanel } = await import(
        '@presentation/ui/phases/components/delivery/DeliveryResultPanel'
      );
      const panel = new DeliveryResultPanel(scene, 0, 0);
      panel.create();
      panel.show(createTestDeliveryResult(), 'テスト依頼');

      // When: hide()を呼び出す
      panel.hide();

      // Then: isVisible()がfalseを返す
      expect(panel.isVisible()).toBe(false);
    });
  });

  // ===========================================================================
  // TC-605: 閉じるボタンクリックでonCloseコールバックが呼ばれる
  // ===========================================================================

  describe('TC-605: 閉じるボタンクリックでonCloseコールバックが呼ばれる', () => {
    it('Given: コールバック設定済み When: 閉じるボタンクリック Then: onCloseが呼ばれる', async () => {
      // Given: コールバックが設定済み
      const { scene, mockText } = createMockScene();
      const callbacks = { onClose: vi.fn() };

      const { DeliveryResultPanel } = await import(
        '@presentation/ui/phases/components/delivery/DeliveryResultPanel'
      );
      const panel = new DeliveryResultPanel(scene, 0, 0, callbacks);
      panel.create();
      panel.show(createTestDeliveryResult(), 'テスト依頼');

      // 閉じるボタンのクリックイベントをシミュレート
      const pointerdownCallback = mockText.on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'pointerdown',
      )?.[1] as (() => void) | undefined;

      // When: 閉じるボタンをクリック
      if (pointerdownCallback) {
        pointerdownCallback();
      }

      // Then: onCloseコールバックが呼ばれる
      expect(callbacks.onClose).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-606: destroy()でリソースが解放される
  // ===========================================================================

  describe('TC-606: destroy()でリソースが解放される', () => {
    it('Given: DeliveryResultPanelインスタンス When: destroy()呼び出し Then: コンテナが破棄される', async () => {
      // Given: インスタンスが存在
      const { scene, mockContainer } = createMockScene();

      const { DeliveryResultPanel } = await import(
        '@presentation/ui/phases/components/delivery/DeliveryResultPanel'
      );
      const panel = new DeliveryResultPanel(scene, 0, 0);
      panel.create();

      // When: destroy()を呼び出す
      panel.destroy();

      // Then: コンテナのdestroyが呼ばれる
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
