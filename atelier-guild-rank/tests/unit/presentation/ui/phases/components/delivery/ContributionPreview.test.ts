/**
 * ContributionPreview ユニットテスト
 * TASK-0057 DeliveryPhaseUIリファクタリング - TDD Redフェーズ
 *
 * @description
 * 貢献度プレビューコンポーネントのテストケース
 * - 初期状態メッセージ
 * - プレビュー更新
 * - 品質ボーナス表示
 * - 状態メッセージ切替
 * - リソース管理
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// モックインポート
import { createMockScene } from './__mocks__/scene.mock';
import { createTestItem, createTestQuest } from './__mocks__/test-data.factory';

// =============================================================================
// テストスイート
// =============================================================================

describe('ContributionPreview', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-501: 初期状態で「依頼を選択してください」が表示される
  // ===========================================================================

  describe('TC-501: 初期状態で「依頼を選択してください」が表示される', () => {
    it('Given: ContributionPreviewインスタンス When: create()実行 Then: 初期メッセージが表示される', async () => {
      // Given: ContributionPreviewインスタンス
      const { scene } = createMockScene();

      // When: create()を実行
      const { ContributionPreview } = await import(
        '@presentation/ui/phases/components/delivery/ContributionPreview'
      );
      const preview = new ContributionPreview(scene, 0, 0);
      preview.create();

      // Then: 初期メッセージテキストが作成される
      expect(scene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('選択'),
        expect.any(Object),
      );
    });
  });

  // ===========================================================================
  // TC-502: update()でプレビュー内容が更新される
  // ===========================================================================

  describe('TC-502: update()でプレビュー内容が更新される', () => {
    it('Given: 依頼とアイテム選択済み When: update()実行 Then: 計算結果が表示される', async () => {
      // Given: 依頼とアイテムが選択済み
      const quest = createTestQuest();
      const item = createTestItem();
      const previewData = {
        baseReward: 100,
        qualityModifier: 1.5,
        qualityBonus: 50,
        totalContribution: 150,
      };
      const { scene, mockText } = createMockScene();

      const { ContributionPreview } = await import(
        '@presentation/ui/phases/components/delivery/ContributionPreview'
      );
      const preview = new ContributionPreview(scene, 0, 0);
      preview.create();

      // When: update()を実行
      preview.update(quest, item, previewData);

      // Then: プレビュー内容が更新される
      expect(mockText.setText).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-503: 品質ボーナスが正しく表示される
  // ===========================================================================

  describe('TC-503: 品質ボーナスが正しく表示される', () => {
    it('Given: S品質アイテム(+100%ボーナス) When: update()実行 Then: +100%ボーナスが表示される', async () => {
      // Given: S品質アイテム
      const quest = createTestQuest({ rewardContribution: 100 });
      const item = createTestItem({ quality: 'S' });
      const previewData = {
        baseReward: 100,
        qualityModifier: 2.0, // +100%
        qualityBonus: 100,
        totalContribution: 200,
      };
      const { scene, mockText } = createMockScene();

      const { ContributionPreview } = await import(
        '@presentation/ui/phases/components/delivery/ContributionPreview'
      );
      const preview = new ContributionPreview(scene, 0, 0);
      preview.create();

      // When: update()を実行
      preview.update(quest, item, previewData);

      // Then: ボーナス表示が含まれる
      expect(mockText.setText).toHaveBeenCalledWith(expect.stringContaining('100'));
    });
  });

  // ===========================================================================
  // TC-504: showSelectQuestMessage()で依頼選択メッセージが表示
  // ===========================================================================

  describe('TC-504: showSelectQuestMessage()で依頼選択メッセージが表示', () => {
    it('Given: ContributionPreviewインスタンス When: showSelectQuestMessage()実行 Then: 依頼選択メッセージが表示', async () => {
      // Given: インスタンスが存在
      const { scene, mockText } = createMockScene();

      const { ContributionPreview } = await import(
        '@presentation/ui/phases/components/delivery/ContributionPreview'
      );
      const preview = new ContributionPreview(scene, 0, 0);
      preview.create();

      // When: showSelectQuestMessage()を呼び出す
      preview.showSelectQuestMessage();

      // Then: 依頼選択メッセージが表示される
      expect(mockText.setText).toHaveBeenCalledWith(expect.stringContaining('依頼'));
    });
  });

  // ===========================================================================
  // TC-505: showSelectItemMessage()でアイテム選択メッセージが表示
  // ===========================================================================

  describe('TC-505: showSelectItemMessage()でアイテム選択メッセージが表示', () => {
    it('Given: ContributionPreviewインスタンス When: showSelectItemMessage()実行 Then: アイテム選択メッセージが表示', async () => {
      // Given: インスタンスが存在
      const { scene, mockText } = createMockScene();

      const { ContributionPreview } = await import(
        '@presentation/ui/phases/components/delivery/ContributionPreview'
      );
      const preview = new ContributionPreview(scene, 0, 0);
      preview.create();

      // When: showSelectItemMessage()を呼び出す
      preview.showSelectItemMessage();

      // Then: アイテム選択メッセージが表示される
      expect(mockText.setText).toHaveBeenCalledWith(expect.stringContaining('アイテム'));
    });
  });

  // ===========================================================================
  // TC-506: clear()で表示がクリアされる
  // ===========================================================================

  describe('TC-506: clear()で表示がクリアされる', () => {
    it('Given: プレビュー表示済み When: clear()実行 Then: テキストが空になる', async () => {
      // Given: プレビューが表示済み
      const { scene, mockText } = createMockScene();

      const { ContributionPreview } = await import(
        '@presentation/ui/phases/components/delivery/ContributionPreview'
      );
      const preview = new ContributionPreview(scene, 0, 0);
      preview.create();
      preview.update(createTestQuest(), createTestItem(), {
        baseReward: 100,
        qualityModifier: 1.0,
        qualityBonus: 0,
        totalContribution: 100,
      });

      // When: clear()を呼び出す
      preview.clear();

      // Then: テキストがクリアされる
      expect(mockText.setText).toHaveBeenCalledWith('');
    });
  });

  // ===========================================================================
  // TC-507: destroy()でリソースが解放される
  // ===========================================================================

  describe('TC-507: destroy()でリソースが解放される', () => {
    it('Given: ContributionPreviewインスタンス When: destroy()呼び出し Then: コンテナが破棄される', async () => {
      // Given: インスタンスが存在
      const { scene, mockContainer } = createMockScene();

      const { ContributionPreview } = await import(
        '@presentation/ui/phases/components/delivery/ContributionPreview'
      );
      const preview = new ContributionPreview(scene, 0, 0);
      preview.create();

      // When: destroy()を呼び出す
      preview.destroy();

      // Then: コンテナのdestroyが呼ばれる
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
