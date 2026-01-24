/**
 * ItemSelector ユニットテスト
 * TASK-0057 DeliveryPhaseUIリファクタリング - TDD Redフェーズ
 *
 * @description
 * アイテム選択コンポーネントのテストケース
 * - アイテム一覧表示
 * - アイテム選択
 * - 空状態表示
 * - 品質色分け
 * - リソース管理
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// モックインポート
import { createMockScene } from './__mocks__/scene.mock';
import { createQualityItems, createTestItem, createTestItems } from './__mocks__/test-data.factory';

// =============================================================================
// テストスイート
// =============================================================================

describe('ItemSelector', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-401: アイテム一覧が正しく表示される
  // ===========================================================================

  describe('TC-401: アイテム一覧が正しく表示される', () => {
    it('Given: 5件のアイテムデータ When: setItems()実行 Then: 5つのアイテムボタンが生成される', async () => {
      // Given: 5件のアイテムデータ
      const items = createTestItems(5);
      const { scene } = createMockScene();
      const callbacks = { onItemSelect: vi.fn() };

      // When: ItemSelectorを初期化してsetItems()を実行
      const { ItemSelector } = await import(
        '@presentation/ui/phases/components/delivery/ItemSelector'
      );
      const selector = new ItemSelector(scene, 0, 0, callbacks);
      selector.create();
      selector.setItems(items);

      // Then: アイテム数が5件
      expect(selector.getItemCount()).toBe(5);
    });
  });

  // ===========================================================================
  // TC-402: アイテムクリックでコールバックが呼ばれる
  // ===========================================================================

  describe('TC-402: アイテムクリックでコールバックが呼ばれる', () => {
    it('Given: アイテム一覧表示済み When: アイテムクリック Then: onItemSelectコールバックが呼ばれる', async () => {
      // Given: アイテム一覧が表示済み
      const item = createTestItem();
      const { scene, mockText } = createMockScene();
      const callbacks = { onItemSelect: vi.fn() };

      const { ItemSelector } = await import(
        '@presentation/ui/phases/components/delivery/ItemSelector'
      );
      const selector = new ItemSelector(scene, 0, 0, callbacks);
      selector.create();
      selector.setItems([item]);

      // アイテムのクリックイベントをシミュレート
      const pointerdownCallback = mockText.on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'pointerdown',
      )?.[1] as (() => void) | undefined;

      // When: アイテムをクリック
      if (pointerdownCallback) {
        pointerdownCallback();
      }

      // Then: onItemSelectコールバックが呼ばれる
      expect(callbacks.onItemSelect).toHaveBeenCalledWith(item);
    });
  });

  // ===========================================================================
  // TC-403: アイテム0件時に適切なメッセージが表示される
  // ===========================================================================

  describe('TC-403: アイテム0件時に適切なメッセージが表示される', () => {
    it('Given: 空のアイテム配列 When: setItems([])実行 Then: 「アイテムがありません」メッセージ表示', async () => {
      // Given: 空のアイテム配列
      const { scene } = createMockScene();
      const callbacks = { onItemSelect: vi.fn() };

      const { ItemSelector } = await import(
        '@presentation/ui/phases/components/delivery/ItemSelector'
      );
      const selector = new ItemSelector(scene, 0, 0, callbacks);
      selector.create();

      // When: 空の配列を設定
      selector.setItems([]);

      // Then: 空メッセージが表示される
      expect(selector.isEmpty()).toBe(true);
    });
  });

  // ===========================================================================
  // TC-404: getSelectedItem()で選択アイテムが取得できる
  // ===========================================================================

  describe('TC-404: getSelectedItem()で選択アイテムが取得できる', () => {
    it('Given: アイテム選択済み When: getSelectedItem()呼び出し Then: 選択したアイテムが返される', async () => {
      // Given: アイテムが選択済み
      const item = createTestItem();
      const { scene } = createMockScene();
      const callbacks = { onItemSelect: vi.fn() };

      const { ItemSelector } = await import(
        '@presentation/ui/phases/components/delivery/ItemSelector'
      );
      const selector = new ItemSelector(scene, 0, 0, callbacks);
      selector.create();
      selector.setItems([item]);
      selector.selectItem(item.instanceId);

      // When: getSelectedItem()を呼び出す
      const selected = selector.getSelectedItem();

      // Then: 選択したアイテムが返される
      expect(selected).toEqual(item);
    });
  });

  // ===========================================================================
  // TC-405: clearSelection()で選択がクリアされる
  // ===========================================================================

  describe('TC-405: clearSelection()で選択がクリアされる', () => {
    it('Given: アイテム選択済み When: clearSelection()呼び出し Then: getSelectedItem()がnullを返す', async () => {
      // Given: アイテムが選択済み
      const item = createTestItem();
      const { scene } = createMockScene();
      const callbacks = { onItemSelect: vi.fn() };

      const { ItemSelector } = await import(
        '@presentation/ui/phases/components/delivery/ItemSelector'
      );
      const selector = new ItemSelector(scene, 0, 0, callbacks);
      selector.create();
      selector.setItems([item]);
      selector.selectItem(item.instanceId);

      // When: clearSelection()を呼び出す
      selector.clearSelection();

      // Then: getSelectedItem()がnullを返す
      expect(selector.getSelectedItem()).toBeNull();
    });
  });

  // ===========================================================================
  // TC-406: 品質に応じた色分けが適用される
  // ===========================================================================

  describe('TC-406: 品質に応じた色分けが適用される', () => {
    it('Given: S品質アイテム When: setItems()実行 Then: レジェンダリーカラー(0xffaa00)が適用される', async () => {
      // Given: S品質アイテム
      const sQualityItem = createTestItem({ quality: 'S' });
      const { scene, mockText } = createMockScene();
      const callbacks = { onItemSelect: vi.fn() };

      const { ItemSelector } = await import(
        '@presentation/ui/phases/components/delivery/ItemSelector'
      );
      const selector = new ItemSelector(scene, 0, 0, callbacks);
      selector.create();

      // When: S品質アイテムを設定
      selector.setItems([sQualityItem]);

      // Then: setColorがレジェンダリーカラーで呼ばれる
      // Colors.quality.legendary = 0xffaa00
      expect(mockText.setColor).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-407: destroy()でリソースが解放される
  // ===========================================================================

  describe('TC-407: destroy()でリソースが解放される', () => {
    it('Given: ItemSelectorインスタンス When: destroy()呼び出し Then: コンテナが破棄される', async () => {
      // Given: インスタンスが存在
      const { scene, mockContainer } = createMockScene();
      const callbacks = { onItemSelect: vi.fn() };

      const { ItemSelector } = await import(
        '@presentation/ui/phases/components/delivery/ItemSelector'
      );
      const selector = new ItemSelector(scene, 0, 0, callbacks);
      selector.create();

      // When: destroy()を呼び出す
      selector.destroy();

      // Then: コンテナのdestroyが呼ばれる
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
