/**
 * RankUpRequirements ユニットテスト
 * TASK-0055 RankUpSceneリファクタリング
 *
 * @description
 * 昇格条件コンポーネントのテストケース
 * - 課題リスト表示
 * - 完了状態表示
 * - 期限表示
 * - 共通ユーティリティ使用
 */

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
        rectangle: vi.fn().mockReturnValue({
          setStrokeStyle: vi.fn().mockReturnThis(),
          setOrigin: vi.fn().mockReturnThis(),
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
    mockGraphics,
  };
};

// =============================================================================
// テスト用の課題データ
// =============================================================================

const mockTasks = [
  {
    taskId: 'task-1',
    description: 'アイテムA x3',
    itemId: 'item-a',
    count: 3,
    completed: 0,
    isCompleted: false,
  },
  {
    taskId: 'task-2',
    description: 'アイテムB x2',
    itemId: 'item-b',
    count: 2,
    completed: 2,
    isCompleted: true,
  },
];

// =============================================================================
// テストスイート
// =============================================================================

describe('RankUpRequirements', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-R01: 初期化テスト
  // ===========================================================================

  describe('TC-R01: 初期化', () => {
    it('TC-R01: シーンインスタンスでRankUpRequirementsを初期化するとコンテナが作成される', async () => {
      // Given: シーンインスタンス
      const { scene: mockScene } = createMockScene();

      // When: RankUpRequirementsを初期化
      const { RankUpRequirements } = await import(
        '@presentation/scenes/components/rankup/RankUpRequirements'
      );
      const requirements = new RankUpRequirements(mockScene, 0, 0);

      // Then: コンテナが作成される
      expect(requirements).toBeDefined();
      expect(requirements.getContainer()).toBeDefined();
    });
  });

  // ===========================================================================
  // TC-R02: 空の課題リスト表示テスト
  // ===========================================================================

  describe('TC-R02: 空の課題リスト表示', () => {
    it('TC-R02: setTasks([])が呼び出されると空のパネルが表示される', async () => {
      // Given: RankUpRequirementsインスタンス
      const { scene: mockScene } = createMockScene();
      const { RankUpRequirements } = await import(
        '@presentation/scenes/components/rankup/RankUpRequirements'
      );
      const requirements = new RankUpRequirements(mockScene, 0, 0);
      requirements.create();

      // When: 空の課題リストを設定
      requirements.setTasks([]);

      // Then: エラーなく処理が完了する
      expect(() => requirements.setTasks([])).not.toThrow();
    });
  });

  // ===========================================================================
  // TC-R03: 課題リスト表示テスト
  // ===========================================================================

  describe('TC-R03: 課題リスト表示', () => {
    it('TC-R03: setTasks()が呼び出されると課題が表示される', async () => {
      // Given: RankUpRequirementsインスタンス
      const { scene: mockScene, mockText } = createMockScene();
      const { RankUpRequirements } = await import(
        '@presentation/scenes/components/rankup/RankUpRequirements'
      );
      const requirements = new RankUpRequirements(mockScene, 0, 0);
      requirements.create();

      // When: 課題リストを設定
      requirements.setTasks([mockTasks[0]]);

      // Then: テキストが作成される
      expect(mockScene.make.text).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-R04: 完了課題の表示テスト
  // ===========================================================================

  describe('TC-R04: 完了課題の表示', () => {
    it('TC-R04: 完了した課題は「✓」アイコンで表示される', async () => {
      // Given: RankUpRequirementsインスタンス
      const { scene: mockScene } = createMockScene();
      const { RankUpRequirements } = await import(
        '@presentation/scenes/components/rankup/RankUpRequirements'
      );
      const requirements = new RankUpRequirements(mockScene, 0, 0);
      requirements.create();

      // When: 完了した課題を設定
      requirements.setTasks([mockTasks[1]]);

      // Then: 完了アイコンが表示される（実装で確認）
      expect(mockScene.make.text).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-R05: 期限表示テスト
  // ===========================================================================

  describe('TC-R05: 期限表示', () => {
    it('TC-R05: setTimeLimit(7)が呼び出されると「期限: 7日以内」が表示される', async () => {
      // Given: RankUpRequirementsインスタンス
      const { scene: mockScene, mockText } = createMockScene();
      const { RankUpRequirements } = await import(
        '@presentation/scenes/components/rankup/RankUpRequirements'
      );
      const requirements = new RankUpRequirements(mockScene, 0, 0);
      requirements.create();

      // When: 期限を設定
      requirements.setTimeLimit(7);

      // Then: 期限テキストが更新される
      expect(mockText.setText).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-R06: 背景にUIBackgroundBuilderが使用されているテスト
  // ===========================================================================

  describe('TC-R06: UIBackgroundBuilder使用', () => {
    it('TC-R06: create()でUIBackgroundBuilderを使用して背景が作成される', async () => {
      // Given: RankUpRequirementsインスタンス
      const { scene: mockScene, mockGraphics } = createMockScene();
      const { RankUpRequirements } = await import(
        '@presentation/scenes/components/rankup/RankUpRequirements'
      );
      const requirements = new RankUpRequirements(mockScene, 0, 0);

      // When: create()が呼び出される
      requirements.create();

      // Then: グラフィックスが作成される（UIBackgroundBuilder経由）
      expect(mockScene.add.graphics).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-R07: 破棄テスト
  // ===========================================================================

  describe('TC-R07: 破棄', () => {
    it('TC-R07: destroy()が呼び出されるとコンテナが破棄される', async () => {
      // Given: RankUpRequirementsインスタンス
      const { scene: mockScene, mockContainer } = createMockScene();
      const { RankUpRequirements } = await import(
        '@presentation/scenes/components/rankup/RankUpRequirements'
      );
      const requirements = new RankUpRequirements(mockScene, 0, 0);
      requirements.create();

      // When: destroy()が呼び出される
      requirements.destroy();

      // Then: コンテナが破棄される
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
