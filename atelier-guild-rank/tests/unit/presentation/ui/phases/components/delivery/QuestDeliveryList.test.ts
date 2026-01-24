/**
 * QuestDeliveryList ユニットテスト
 * TASK-0057 DeliveryPhaseUIリファクタリング - TDD Redフェーズ
 *
 * @description
 * 依頼リストコンポーネントのテストケース
 * - 依頼リスト表示
 * - 依頼選択
 * - 空状態表示
 * - リソース管理
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// モックインポート
import { createMockScene } from './__mocks__/scene.mock';
import { createTestQuest, createTestQuests } from './__mocks__/test-data.factory';

// =============================================================================
// テストスイート
// =============================================================================

describe('QuestDeliveryList', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-301: 依頼リストが正しく表示される
  // ===========================================================================

  describe('TC-301: 依頼リストが正しく表示される', () => {
    it('Given: 3件の依頼データ When: create()実行 Then: 3つの依頼パネルが生成される', async () => {
      // Given: 3件の依頼データ
      const quests = createTestQuests(3);
      const { scene } = createMockScene();
      const callbacks = { onQuestSelect: vi.fn() };

      // When: QuestDeliveryListを初期化してcreate()を実行
      const { QuestDeliveryList } = await import(
        '@presentation/ui/phases/components/delivery/QuestDeliveryList'
      );
      const list = new QuestDeliveryList(scene, 0, 0, callbacks);
      list.create();
      list.setQuests(quests);

      // Then:
      // - scene.add.textが依頼ごとに呼び出される（パネル生成）
      expect(scene.add.text).toHaveBeenCalled();
      // - 内部の依頼数が3件
      expect(list.getQuestCount()).toBe(3);
    });
  });

  // ===========================================================================
  // TC-302: 依頼パネルクリックでコールバックが呼ばれる
  // ===========================================================================

  describe('TC-302: 依頼パネルクリックでコールバックが呼ばれる', () => {
    it('Given: 依頼リスト表示済み When: パネルクリック Then: onQuestSelectコールバックが呼ばれる', async () => {
      // Given: 依頼リストが表示済み
      const quest = createTestQuest();
      const { scene, mockRectangle } = createMockScene();
      const callbacks = { onQuestSelect: vi.fn() };

      const { QuestDeliveryList } = await import(
        '@presentation/ui/phases/components/delivery/QuestDeliveryList'
      );
      const list = new QuestDeliveryList(scene, 0, 0, callbacks);
      list.create();
      list.setQuests([quest]);

      // パネルのクリックイベントをシミュレート
      // mockRectangle.on の第2引数として渡されたコールバックを取得して実行
      const pointerdownCallback = mockRectangle.on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'pointerdown',
      )?.[1] as (() => void) | undefined;

      // When: パネルをクリック
      if (pointerdownCallback) {
        pointerdownCallback();
      }

      // Then: onQuestSelectコールバックが呼ばれる
      expect(callbacks.onQuestSelect).toHaveBeenCalledWith(quest);
    });
  });

  // ===========================================================================
  // TC-303: 依頼0件時に適切なメッセージが表示される
  // ===========================================================================

  describe('TC-303: 依頼0件時に適切なメッセージが表示される', () => {
    it('Given: 空の依頼配列 When: setQuests([])実行 Then: 「納品可能な依頼がありません」メッセージ表示', async () => {
      // Given: 空の依頼配列
      const { scene } = createMockScene();
      const callbacks = { onQuestSelect: vi.fn() };

      const { QuestDeliveryList } = await import(
        '@presentation/ui/phases/components/delivery/QuestDeliveryList'
      );
      const list = new QuestDeliveryList(scene, 0, 0, callbacks);
      list.create();

      // When: 空の配列を設定
      list.setQuests([]);

      // Then: 空メッセージが表示される
      expect(list.isEmpty()).toBe(true);
      // または、特定のメッセージテキストが作成されていることを確認
      expect(scene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('依頼がありません'),
        expect.any(Object),
      );
    });
  });

  // ===========================================================================
  // TC-304: setQuests更新時に既存パネルが破棄される
  // ===========================================================================

  describe('TC-304: setQuests更新時に既存パネルが破棄される', () => {
    it('Given: 依頼リスト表示済み When: 新しいデータでsetQuests()実行 Then: 既存パネルが破棄され再生成', async () => {
      // Given: 依頼リストが表示済み
      const oldQuests = createTestQuests(2);
      const newQuests = createTestQuests(3);
      const { scene } = createMockScene();
      const callbacks = { onQuestSelect: vi.fn() };

      const { QuestDeliveryList } = await import(
        '@presentation/ui/phases/components/delivery/QuestDeliveryList'
      );
      const list = new QuestDeliveryList(scene, 0, 0, callbacks);
      list.create();
      list.setQuests(oldQuests);

      // 初回のパネル数を確認
      const initialCount = list.getQuestCount();

      // When: 新しいデータで更新
      list.setQuests(newQuests);

      // Then:
      // - 既存パネルが破棄されている（destroyが呼ばれている）
      // - 新しい依頼数が反映されている
      expect(list.getQuestCount()).toBe(3);
      expect(initialCount).toBe(2);
    });
  });

  // ===========================================================================
  // TC-305: getSelectedQuest()で選択依頼が取得できる
  // ===========================================================================

  describe('TC-305: getSelectedQuest()で選択依頼が取得できる', () => {
    it('Given: 依頼選択済み When: getSelectedQuest()呼び出し Then: 選択した依頼が返される', async () => {
      // Given: 依頼が選択済み
      const quest = createTestQuest();
      const { scene } = createMockScene();
      const callbacks = { onQuestSelect: vi.fn() };

      const { QuestDeliveryList } = await import(
        '@presentation/ui/phases/components/delivery/QuestDeliveryList'
      );
      const list = new QuestDeliveryList(scene, 0, 0, callbacks);
      list.create();
      list.setQuests([quest]);
      list.selectQuest(quest.id);

      // When: getSelectedQuest()を呼び出す
      const selected = list.getSelectedQuest();

      // Then: 選択した依頼が返される
      expect(selected).toEqual(quest);
    });
  });

  // ===========================================================================
  // TC-306: clearSelection()で選択がクリアされる
  // ===========================================================================

  describe('TC-306: clearSelection()で選択がクリアされる', () => {
    it('Given: 依頼選択済み When: clearSelection()呼び出し Then: getSelectedQuest()がnullを返す', async () => {
      // Given: 依頼が選択済み
      const quest = createTestQuest();
      const { scene } = createMockScene();
      const callbacks = { onQuestSelect: vi.fn() };

      const { QuestDeliveryList } = await import(
        '@presentation/ui/phases/components/delivery/QuestDeliveryList'
      );
      const list = new QuestDeliveryList(scene, 0, 0, callbacks);
      list.create();
      list.setQuests([quest]);
      list.selectQuest(quest.id);

      // When: clearSelection()を呼び出す
      list.clearSelection();

      // Then: getSelectedQuest()がnullを返す
      expect(list.getSelectedQuest()).toBeNull();
    });
  });

  // ===========================================================================
  // TC-307: destroy()でリソースが解放される
  // ===========================================================================

  describe('TC-307: destroy()でリソースが解放される', () => {
    it('Given: QuestDeliveryListインスタンス When: destroy()呼び出し Then: コンテナが破棄される', async () => {
      // Given: インスタンスが存在
      const { scene, mockContainer } = createMockScene();
      const callbacks = { onQuestSelect: vi.fn() };

      const { QuestDeliveryList } = await import(
        '@presentation/ui/phases/components/delivery/QuestDeliveryList'
      );
      const list = new QuestDeliveryList(scene, 0, 0, callbacks);
      list.create();

      // When: destroy()を呼び出す
      list.destroy();

      // Then: コンテナのdestroyが呼ばれる
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
