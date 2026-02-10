/**
 * RankUpTestPanel ユニットテスト
 * TASK-0055 RankUpSceneリファクタリング
 *
 * @description
 * 試験パネルコンポーネントのテストケース
 * - 状態表示（NotStarted, InProgress, Completed, Failed）
 * - ボタンクリック
 * - ホバーアニメーション
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
// 型定義
// =============================================================================

type TestState = 'NotStarted' | 'InProgress' | 'Completed' | 'Failed';

// =============================================================================
// テストスイート
// =============================================================================

describe('RankUpTestPanel', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-P01: 初期化テスト
  // ===========================================================================

  describe('TC-P01: 初期化', () => {
    it('TC-P01: シーンインスタンスとコールバック関数でRankUpTestPanelを初期化するとコンテナが作成される', async () => {
      // Given: シーンインスタンスとコールバック関数
      const { scene: mockScene } = createMockScene();
      const callbacks = {
        onStartTest: vi.fn(),
        onDeclineTest: vi.fn(),
        onToTitle: vi.fn(),
      };

      // When: RankUpTestPanelを初期化
      const { RankUpTestPanel } = await import(
        '@presentation/scenes/components/rankup/RankUpTestPanel'
      );
      const panel = new RankUpTestPanel(mockScene, 0, 0, callbacks);

      // Then: コンテナが作成される
      expect(panel).toBeDefined();
      expect(panel.getContainer()).toBeDefined();
    });
  });

  // ===========================================================================
  // TC-P02: NotStarted状態の表示テスト
  // ===========================================================================

  describe('TC-P02: NotStarted状態の表示', () => {
    it('TC-P02: setState(NotStarted)で試験開始ボタンと辞退ボタンが表示される', async () => {
      // Given: RankUpTestPanelインスタンス
      const { scene: mockScene } = createMockScene();
      const callbacks = {
        onStartTest: vi.fn(),
        onDeclineTest: vi.fn(),
        onToTitle: vi.fn(),
      };
      const { RankUpTestPanel } = await import(
        '@presentation/scenes/components/rankup/RankUpTestPanel'
      );
      const panel = new RankUpTestPanel(mockScene, 0, 0, callbacks);
      panel.create();

      // When: NotStarted状態に設定
      panel.setState('NotStarted');

      // Then: ボタンが作成される
      expect(mockScene.add.rectangle).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-P03: 試験開始ボタンクリックテスト
  // ===========================================================================

  describe('TC-P03: 試験開始ボタンクリック', () => {
    it('TC-P03: 試験開始ボタンがクリックされるとonStartTestコールバックが呼び出される', async () => {
      // Given: NotStarted状態のRankUpTestPanel
      const { scene: mockScene } = createMockScene();
      const callbacks = {
        onStartTest: vi.fn(),
        onDeclineTest: vi.fn(),
        onToTitle: vi.fn(),
      };

      const { RankUpTestPanel } = await import(
        '@presentation/scenes/components/rankup/RankUpTestPanel'
      );
      const panel = new RankUpTestPanel(mockScene, 0, 0, callbacks);
      panel.create();
      panel.setState('NotStarted');

      // When: 試験開始ボタンをクリック（直接コールバックを呼び出す）
      panel.handleStartTest();

      // Then: onStartTestコールバックが呼び出される
      expect(callbacks.onStartTest).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-P04: 辞退ボタンクリックテスト
  // ===========================================================================

  describe('TC-P04: 辞退ボタンクリック', () => {
    it('TC-P04: 辞退ボタンがクリックされるとonDeclineTestコールバックが呼び出される', async () => {
      // Given: NotStarted状態のRankUpTestPanel
      const { scene: mockScene, mockRectangle } = createMockScene();
      const callbacks = {
        onStartTest: vi.fn(),
        onDeclineTest: vi.fn(),
        onToTitle: vi.fn(),
      };

      const { RankUpTestPanel } = await import(
        '@presentation/scenes/components/rankup/RankUpTestPanel'
      );
      const panel = new RankUpTestPanel(mockScene, 0, 0, callbacks);
      panel.create();
      panel.setState('NotStarted');

      // When: 辞退ボタンをクリック（直接コールバックを呼び出す）
      panel.handleDeclineTest();

      // Then: onDeclineTestコールバックが呼び出される
      expect(callbacks.onDeclineTest).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-P05: InProgress状態の表示テスト
  // ===========================================================================

  describe('TC-P05: InProgress状態の表示', () => {
    it('TC-P05: setState(InProgress)で進行中インジケーターが表示される', async () => {
      // Given: RankUpTestPanelインスタンス
      const { scene: mockScene, mockText } = createMockScene();
      const callbacks = {
        onStartTest: vi.fn(),
        onDeclineTest: vi.fn(),
        onToTitle: vi.fn(),
      };
      const { RankUpTestPanel } = await import(
        '@presentation/scenes/components/rankup/RankUpTestPanel'
      );
      const panel = new RankUpTestPanel(mockScene, 0, 0, callbacks);
      panel.create();

      // When: InProgress状態に設定
      panel.setState('InProgress');

      // Then: 進行中テキストが作成される
      expect(mockScene.add.text).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-P06: Completed状態の表示テスト
  // ===========================================================================

  describe('TC-P06: Completed状態の表示', () => {
    it('TC-P06: setState(Completed)でクリアメッセージが表示される', async () => {
      // Given: RankUpTestPanelインスタンス
      const { scene: mockScene, mockText } = createMockScene();
      const callbacks = {
        onStartTest: vi.fn(),
        onDeclineTest: vi.fn(),
        onToTitle: vi.fn(),
      };
      const { RankUpTestPanel } = await import(
        '@presentation/scenes/components/rankup/RankUpTestPanel'
      );
      const panel = new RankUpTestPanel(mockScene, 0, 0, callbacks);
      panel.create();

      // When: Completed状態に設定
      panel.setState('Completed');

      // Then: クリアメッセージが作成される
      expect(mockScene.add.text).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-P07: Failed状態の表示テスト
  // ===========================================================================

  describe('TC-P07: Failed状態の表示', () => {
    it('TC-P07: setState(Failed)で失敗メッセージとタイトルへボタンが表示される', async () => {
      // Given: RankUpTestPanelインスタンス
      const { scene: mockScene, mockText } = createMockScene();
      const callbacks = {
        onStartTest: vi.fn(),
        onDeclineTest: vi.fn(),
        onToTitle: vi.fn(),
      };
      const { RankUpTestPanel } = await import(
        '@presentation/scenes/components/rankup/RankUpTestPanel'
      );
      const panel = new RankUpTestPanel(mockScene, 0, 0, callbacks);
      panel.create();

      // When: Failed状態に設定
      panel.setState('Failed');

      // Then: 失敗メッセージとボタンが作成される
      expect(mockScene.add.text).toHaveBeenCalled();
      expect(mockScene.add.rectangle).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-P08: ホバーアニメーション適用テスト
  // ===========================================================================

  describe('TC-P08: ホバーアニメーション適用', () => {
    it('TC-P08: ボタン作成時にsetInteractiveが呼び出される', async () => {
      // Given: RankUpTestPanelインスタンス
      const { scene: mockScene, mockRectangle } = createMockScene();
      const callbacks = {
        onStartTest: vi.fn(),
        onDeclineTest: vi.fn(),
        onToTitle: vi.fn(),
      };
      const { RankUpTestPanel } = await import(
        '@presentation/scenes/components/rankup/RankUpTestPanel'
      );
      const panel = new RankUpTestPanel(mockScene, 0, 0, callbacks);
      panel.create();

      // When: NotStarted状態に設定（ボタンが作成される）
      panel.setState('NotStarted');

      // Then: setInteractiveが呼び出される
      expect(mockRectangle.setInteractive).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-P09: 破棄テスト
  // ===========================================================================

  describe('TC-P09: 破棄', () => {
    it('TC-P09: destroy()が呼び出されるとコンテナが破棄される', async () => {
      // Given: RankUpTestPanelインスタンス
      const { scene: mockScene, mockContainer } = createMockScene();
      const callbacks = {
        onStartTest: vi.fn(),
        onDeclineTest: vi.fn(),
        onToTitle: vi.fn(),
      };
      const { RankUpTestPanel } = await import(
        '@presentation/scenes/components/rankup/RankUpTestPanel'
      );
      const panel = new RankUpTestPanel(mockScene, 0, 0, callbacks);
      panel.create();

      // When: destroy()が呼び出される
      panel.destroy();

      // Then: コンテナが破棄される
      expect(mockContainer.destroy).toHaveBeenCalled();
    });
  });
});
