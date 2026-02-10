/**
 * RankUpHeader ユニットテスト
 * TASK-0055 RankUpSceneリファクタリング
 *
 * @description
 * ヘッダーコンポーネントのテストケース
 * - タイトル表示
 * - ランク表示更新
 * - 破棄処理
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  destroy: vi.fn(),
  text: '',
});

/**
 * モックグラフィックスを作成
 */
const createMockGraphics = () => ({
  fillStyle: vi.fn().mockReturnThis(),
  fillRoundedRect: vi.fn().mockReturnThis(),
  lineStyle: vi.fn().mockReturnThis(),
  strokeRoundedRect: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

/**
 * モックシーンを作成
 */
const createMockScene = () => {
  const mockContainer = createMockContainer();
  const mockText = createMockText();
  const mockGraphics = createMockGraphics();

  return {
    scene: {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        text: vi.fn().mockReturnValue(mockText),
        graphics: vi.fn().mockReturnValue(mockGraphics),
      },
      tweens: {
        add: vi.fn(),
      },
    } as unknown as Phaser.Scene,
    mockContainer,
    mockText,
    mockGraphics,
  };
};

// =============================================================================
// テストスイート
// =============================================================================

describe('RankUpHeader', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-H01: 初期化テスト
  // ===========================================================================

  describe('TC-H01: 初期化', () => {
    it('TC-H01: シーンインスタンスでRankUpHeaderを初期化するとコンテナが作成される', async () => {
      // Given: シーンインスタンス
      const { scene: mockScene } = createMockScene();

      // When: RankUpHeaderを初期化
      const { RankUpHeader } = await import('@presentation/scenes/components/rankup/RankUpHeader');
      const header = new RankUpHeader(mockScene, 0, 0);

      // Then: コンテナが作成される
      expect(header).toBeDefined();
      expect(header.getContainer()).toBeDefined();
    });
  });

  // ===========================================================================
  // TC-H02: タイトル表示テスト
  // ===========================================================================

  describe('TC-H02: タイトル表示', () => {
    it('TC-H02: create()が呼び出されると「🏆 昇格試験」タイトルが表示される', async () => {
      // Given: RankUpHeaderインスタンス
      const { scene: mockScene, mockText } = createMockScene();

      // When: RankUpHeaderを初期化してcreate()が呼び出される
      const { RankUpHeader } = await import('@presentation/scenes/components/rankup/RankUpHeader');
      const header = new RankUpHeader(mockScene, 0, 0);
      header.create();

      // Then: タイトルテキストが作成される
      expect(mockScene.add.text).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-H03: ランク表示更新テスト
  // ===========================================================================

  describe('TC-H03: ランク表示更新', () => {
    it('TC-H03: updateRank(F, E)が呼び出されると「F → E ランクへの昇格」と表示される', async () => {
      // Given: RankUpHeaderインスタンス
      const { scene: mockScene, mockText } = createMockScene();
      const { RankUpHeader } = await import('@presentation/scenes/components/rankup/RankUpHeader');
      const header = new RankUpHeader(mockScene, 0, 0);
      header.create();

      // When: updateRank()が呼び出される（最初の呼び出しはテキスト作成）
      header.updateRank('F', 'E');

      // Then: テキストが作成される（最初の呼び出し時）
      // add.textはcreate()で1回、updateRank()で1回呼ばれる
      expect(mockScene.add.text).toHaveBeenCalledTimes(2);
    });

    it('TC-H03b: updateRank()を2回呼び出すと2回目はsetTextで更新される', async () => {
      // Given: RankUpHeaderインスタンス
      const { scene: mockScene, mockText } = createMockScene();
      const { RankUpHeader } = await import('@presentation/scenes/components/rankup/RankUpHeader');
      const header = new RankUpHeader(mockScene, 0, 0);
      header.create();

      // When: updateRank()を2回呼び出す
      header.updateRank('F', 'E');
      header.updateRank('E', 'D');

      // Then: 2回目はsetTextが呼ばれる
      expect(mockText.setText).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-H04: 破棄テスト
  // ===========================================================================

  describe('TC-H04: 破棄', () => {
    it('TC-H04: destroy()が呼び出されるとコンテナと子要素が破棄される', async () => {
      // Given: RankUpHeaderインスタンス
      const { scene: mockScene, mockContainer } = createMockScene();
      const { RankUpHeader } = await import('@presentation/scenes/components/rankup/RankUpHeader');
      const header = new RankUpHeader(mockScene, 0, 0);
      header.create();

      // When: destroy()が呼び出される
      header.destroy();

      // Then: コンテナが破棄される
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
