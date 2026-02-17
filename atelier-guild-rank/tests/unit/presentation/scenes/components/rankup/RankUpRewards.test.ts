/**
 * RankUpRewards ユニットテスト
 * TASK-0055 RankUpSceneリファクタリング
 *
 * @description
 * 報酬コンポーネントのテストケース
 * - ボーナスゴールド表示
 * - アーティファクトカード表示
 * - アーティファクト選択
 * - ホバーエフェクト
 */

import Phaser from 'phaser';
import { afterEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

/**
 * モックコンテナを作成
 */
const createMockContainer = () => ({
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  removeAll: vi.fn(),
  x: 0,
  y: 0,
});

/**
 * モックテキストを作成
 */
const createMockText = () => ({
  setText: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setStyle: vi.fn().mockReturnThis(),
  setColor: vi.fn().mockReturnThis(),
  setWordWrapWidth: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  text: '',
});

/**
 * モックRectangleを作成
 */
const createMockRectangle = () => ({
  setInteractive: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  setFillStyle: vi.fn().mockReturnThis(),
  setStrokeStyle: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * モックシーンを作成
 */
const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockRectangle = createMockRectangle();

  return {
    scene: {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        text: vi.fn().mockReturnValue(mockText),
        rectangle: vi.fn().mockReturnValue(mockRectangle),
        graphics: vi.fn().mockReturnValue({
          fillStyle: vi.fn().mockReturnThis(),
          fillRoundedRect: vi.fn().mockReturnThis(),
          lineStyle: vi.fn().mockReturnThis(),
          strokeRoundedRect: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
      },
      make: {
        text: vi.fn().mockReturnValue(mockText),
        container: vi.fn().mockReturnValue(mockContainer),
      },
      tweens: {
        add: vi.fn(),
      },
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
    mockRectangle,
  };
};

// =============================================================================
// テスト用データ
// =============================================================================

const mockArtifacts = [
  {
    id: 'artifact-1',
    name: '炎の護符',
    rarity: 'Rare',
    effect: '攻撃力+10',
    description: '炎の力を秘めた護符',
  },
  {
    id: 'artifact-2',
    name: '氷の結晶',
    rarity: 'Epic',
    effect: '防御力+15',
    description: '永遠の氷が閉じ込められた結晶',
  },
  {
    id: 'artifact-3',
    name: '風の羽',
    rarity: 'Uncommon',
    effect: '速度+5',
    description: '風の精霊の羽',
  },
];

const mockReward = {
  bonusGold: 500,
  artifacts: mockArtifacts,
};

// =============================================================================
// テストスイート
// =============================================================================

describe('RankUpRewards', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-W01: 初期化テスト
  // ===========================================================================

  describe('TC-W01: 初期化', () => {
    it('TC-W01: シーンインスタンスでRankUpRewardsを初期化するとコンテナが作成される', async () => {
      // Given: シーンインスタンス
      const { scene: mockScene } = createMockScene();
      const onSelectArtifact = vi.fn();

      // When: RankUpRewardsを初期化
      const { RankUpRewards } = await import(
        '@presentation/scenes/components/rankup/RankUpRewards'
      );
      const rewards = new RankUpRewards(mockScene, 0, 0, { onSelectArtifact });

      // Then: コンテナが作成される
      expect(rewards).toBeDefined();
      expect(rewards.getContainer()).toBeDefined();
    });
  });

  // ===========================================================================
  // TC-W02: ボーナスゴールド表示テスト
  // ===========================================================================

  describe('TC-W02: ボーナスゴールド表示', () => {
    it('TC-W02: setReward()が呼び出されるとボーナスゴールドが表示される', async () => {
      // Given: RankUpRewardsインスタンス
      const { scene: mockScene, mockText } = createMockScene();
      const onSelectArtifact = vi.fn();
      const { RankUpRewards } = await import(
        '@presentation/scenes/components/rankup/RankUpRewards'
      );
      const rewards = new RankUpRewards(mockScene, 0, 0, { onSelectArtifact });
      rewards.create();

      // When: 報酬を設定
      rewards.setReward(mockReward);

      // Then: テキストが作成される（ボーナスゴールド表示）
      expect(mockScene.make.text).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-W03: アーティファクトカード表示テスト
  // ===========================================================================

  describe('TC-W03: アーティファクトカード表示', () => {
    it('TC-W03: setReward()が呼び出されると3枚のアーティファクトカードが表示される', async () => {
      // Given: RankUpRewardsインスタンス
      const { scene: mockScene, mockContainer } = createMockScene();
      const onSelectArtifact = vi.fn();
      const { RankUpRewards } = await import(
        '@presentation/scenes/components/rankup/RankUpRewards'
      );
      const rewards = new RankUpRewards(mockScene, 0, 0, { onSelectArtifact });
      rewards.create();

      // When: 3つのアーティファクトを持つ報酬を設定
      rewards.setReward(mockReward);

      // Then: コンテナにカードが追加される
      expect(mockContainer.add).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-W04: アーティファクト選択テスト
  // ===========================================================================

  describe('TC-W04: アーティファクト選択', () => {
    it('TC-W04: カードの選択ボタンがクリックされるとonSelectArtifactコールバックが呼び出される', async () => {
      // Given: 3枚のアーティファクトが表示されている状態
      const { scene: mockScene } = createMockScene();
      const onSelectArtifact = vi.fn();

      const { RankUpRewards } = await import(
        '@presentation/scenes/components/rankup/RankUpRewards'
      );
      const rewards = new RankUpRewards(mockScene, 0, 0, { onSelectArtifact });
      rewards.create();
      rewards.setReward(mockReward);

      // When: 1枚目のカードを選択（selectArtifactByIndex経由）
      rewards.selectArtifactByIndex(0);

      // Then: onSelectArtifactコールバックが呼び出される
      expect(onSelectArtifact).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-W05: アーティファクトカードホバーエフェクトテスト
  // ===========================================================================

  describe('TC-W05: アーティファクトカードホバーエフェクト', () => {
    it('TC-W05: カードにsetInteractiveが適用される', async () => {
      // Given: RankUpRewardsインスタンス
      const { scene: mockScene } = createMockScene();
      const onSelectArtifact = vi.fn();
      const { RankUpRewards } = await import(
        '@presentation/scenes/components/rankup/RankUpRewards'
      );
      const rewards = new RankUpRewards(mockScene, 0, 0, { onSelectArtifact });
      rewards.create();

      // When: 報酬を設定
      rewards.setReward(mockReward);

      // Then: new Phaser.GameObjects.Rectangle() でカード背景・選択ボタンが作成される
      expect(Phaser.GameObjects.Rectangle).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-W06: アーティファクトが0個の場合のテスト
  // ===========================================================================

  describe('TC-W06: アーティファクトが0個の場合', () => {
    it('TC-W06: アーティファクトが0個でもボーナスゴールドのみ表示される', async () => {
      // Given: RankUpRewardsインスタンス
      const { scene: mockScene } = createMockScene();
      const onSelectArtifact = vi.fn();
      const { RankUpRewards } = await import(
        '@presentation/scenes/components/rankup/RankUpRewards'
      );
      const rewards = new RankUpRewards(mockScene, 0, 0, { onSelectArtifact });
      rewards.create();

      // When: アーティファクトが0個の報酬を設定
      const emptyReward = { bonusGold: 100, artifacts: [] };
      rewards.setReward(emptyReward);

      // Then: ボーナスゴールドのテキストは作成されるが、カードのRectangleは作成されない
      expect(mockScene.make.text).toHaveBeenCalled();
      expect(Phaser.GameObjects.Rectangle).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-W07: 破棄テスト
  // ===========================================================================

  describe('TC-W07: 破棄', () => {
    it('TC-W07: destroy()が呼び出されるとコンテナが破棄される', async () => {
      // Given: RankUpRewardsインスタンス
      const { scene: mockScene, mockContainer } = createMockScene();
      const onSelectArtifact = vi.fn();
      const { RankUpRewards } = await import(
        '@presentation/scenes/components/rankup/RankUpRewards'
      );
      const rewards = new RankUpRewards(mockScene, 0, 0, { onSelectArtifact });
      rewards.create();

      // When: destroy()が呼び出される
      rewards.destroy();

      // Then: コンテナが破棄される
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
