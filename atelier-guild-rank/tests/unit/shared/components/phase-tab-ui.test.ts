/**
 * PhaseTabUI - テスト
 * TASK-0111: PhaseTabUI実装
 *
 * @description
 * フェーズタブUIコンポーネントの動作をテストする
 *
 * @信頼性レベル 🔵 REQ-006・TASK-0111テストケースに基づく
 */

import { PhaseTabUI } from '@shared/components/PhaseTabUI';
import type { IEventBus } from '@shared/services/event-bus/types';
import type { IGameFlowManager } from '@shared/services/game-flow/game-flow-manager.interface';
import { GamePhase } from '@shared/types/common';
import { GameEventType } from '@shared/types/events';
import Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// カラー定数（テスト検証用）
// =============================================================================

// タブカラー定数はPhaseTabUI内部で使用されるため、テストではgetActivePhase()等の公開APIで検証

// =============================================================================
// モック定義
// =============================================================================

interface MockText {
  setText: ReturnType<typeof vi.fn>;
  setStyle: ReturnType<typeof vi.fn>;
  setColor: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  text: string;
}

interface MockRectangle {
  setFillStyle: ReturnType<typeof vi.fn>;
  setStrokeStyle: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

interface MockContainer {
  add: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  bringToTop: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  name: string;
}

interface MockScene extends Phaser.Scene {
  add: {
    container: ReturnType<typeof vi.fn>;
  };
  make: {
    text: ReturnType<typeof vi.fn>;
  };
}

interface MockGameFlowManager extends Partial<IGameFlowManager> {
  switchPhase: ReturnType<typeof vi.fn>;
  endDay: ReturnType<typeof vi.fn>;
}

interface MockEventBus extends Partial<IEventBus> {
  on: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
}

/**
 * テスト用モックを作成する
 */
const createMockScene = (): {
  scene: MockScene;
  mockContainer: MockContainer;
  mockTexts: MockText[];
  mockRectangles: MockRectangle[];
} => {
  const mockTexts: MockText[] = [];
  const mockRectangles: MockRectangle[] = [];

  const mockContainer: MockContainer = {
    add: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    bringToTop: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    name: '',
  };

  // Rectangleモック: 呼び出しごとに新しいインスタンスを返す
  vi.mocked(Phaser.GameObjects.Rectangle).mockImplementation(function (this: unknown) {
    const rect: MockRectangle = {
      setFillStyle: vi.fn().mockReturnThis(),
      setStrokeStyle: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };
    Object.assign(this, rect);
    mockRectangles.push(rect);
    return this as typeof rect;
  });

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
    },
    make: {
      text: vi.fn(() => {
        const text: MockText = {
          setText: vi.fn().mockReturnThis(),
          setStyle: vi.fn().mockReturnThis(),
          setColor: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
          setPosition: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
          text: '',
        };
        mockTexts.push(text);
        return text;
      }),
    },
  } as unknown as MockScene;

  return { scene, mockContainer, mockTexts, mockRectangles };
};

const createMockGameFlowManager = (): MockGameFlowManager => ({
  switchPhase: vi.fn().mockResolvedValue({
    success: true,
    previousPhase: GamePhase.QUEST_ACCEPT,
    newPhase: GamePhase.ALCHEMY,
  }),
  endDay: vi.fn(),
});

const createMockEventBus = (): MockEventBus => ({
  on: vi.fn().mockReturnValue(vi.fn()),
  emit: vi.fn(),
});

// =============================================================================
// テストスイート
// =============================================================================

describe('PhaseTabUI（TASK-0111）', () => {
  let scene: MockScene;
  let mockContainer: MockContainer;
  let mockRectangles: MockRectangle[];
  let mockGameFlowManager: MockGameFlowManager;
  let mockEventBus: MockEventBus;
  let phaseTabUI: PhaseTabUI;

  beforeEach(() => {
    const mocks = createMockScene();
    scene = mocks.scene;
    mockContainer = mocks.mockContainer;
    mockRectangles = mocks.mockRectangles;
    mockGameFlowManager = createMockGameFlowManager();
    mockEventBus = createMockEventBus();

    phaseTabUI = new PhaseTabUI(
      scene,
      0,
      0,
      mockGameFlowManager as unknown as IGameFlowManager,
      mockEventBus as unknown as IEventBus,
      GamePhase.QUEST_ACCEPT,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // テストケース1: 4タブが表示される
  // ===========================================================================

  describe('T-0111-01: 4つのタブが表示される', () => {
    it('create()呼び出し後に4つのタブが生成される', () => {
      // 【テスト目的】: create()でフェーズタブが4つ生成されることを確認
      // 🔵 信頼性レベル: REQ-006-01より

      phaseTabUI.create();

      expect(phaseTabUI.getTabCount()).toBe(4);
    });

    it('各タブにフェーズ名ラベルが設定されている', () => {
      // 【テスト目的】: 各タブに「依頼」「採取」「調合」「納品」のラベルが設定されることを確認
      // 🔵 信頼性レベル: REQ-006-01より

      phaseTabUI.create();

      // scene.make.textが4つのタブ + 1つの日終了ボタンテキスト = 5回呼ばれる
      const tabTextCalls = scene.make.text.mock.calls.slice(0, 4);
      const labels = tabTextCalls.map((call) => call[0]?.text);

      expect(labels).toContain('依頼');
      expect(labels).toContain('採取');
      expect(labels).toContain('調合');
      expect(labels).toContain('納品');
    });

    it('日終了ボタンが表示される', () => {
      // 【テスト目的】: 日終了ボタンが生成されることを確認
      // 🔵 信頼性レベル: REQ-004・architecture.md「日終了ボタンの配置」より

      phaseTabUI.create();

      // 日終了ボタンテキストが含まれる
      const allTextCalls = scene.make.text.mock.calls;
      const endDayCall = allTextCalls.find((call) => call[0]?.text === '日終了');
      expect(endDayCall).toBeDefined();
    });
  });

  // ===========================================================================
  // テストケース2: アクティブタブの強調
  // ===========================================================================

  describe('T-0111-02: アクティブタブの強調表示', () => {
    it('PHASE_CHANGEDイベントでアクティブタブが更新される', () => {
      // 【テスト目的】: PHASE_CHANGEDイベント受信時にアクティブタブが更新されることを確認
      // 🔵 信頼性レベル: 既存EventBusパターンより

      phaseTabUI.create();

      // EventBus.onがPHASE_CHANGEDで呼ばれていることを確認
      expect(mockEventBus.on).toHaveBeenCalledWith(
        GameEventType.PHASE_CHANGED,
        expect.any(Function),
      );

      // イベントハンドラーを取得して実行
      const handler = mockEventBus.on.mock.calls.find(
        (call) => call[0] === GameEventType.PHASE_CHANGED,
      )?.[1];
      expect(handler).toBeDefined();

      // GATHERINGへの変更イベントをシミュレート（IBusEvent<IPhaseChangedEvent>構造に合わせる）
      handler?.({
        payload: {
          previousPhase: GamePhase.QUEST_ACCEPT,
          newPhase: GamePhase.GATHERING,
        },
      });

      expect(phaseTabUI.getActivePhase()).toBe(GamePhase.GATHERING);
    });

    it('初期フェーズがアクティブとして表示される', () => {
      // 【テスト目的】: コンストラクタで指定した初期フェーズがアクティブであることを確認
      // 🔵 信頼性レベル: REQ-006-02より

      phaseTabUI.create();

      expect(phaseTabUI.getActivePhase()).toBe(GamePhase.QUEST_ACCEPT);
    });
  });

  // ===========================================================================
  // テストケース3: タブクリックでswitchPhase呼び出し
  // ===========================================================================

  describe('T-0111-03: タブクリックでswitchPhase()が呼ばれる', () => {
    it('調合タブクリックでswitchPhase({targetPhase: ALCHEMY})が呼ばれる', () => {
      // 【テスト目的】: タブクリック時にGameFlowManager.switchPhase()が正しく呼ばれることを確認
      // 🔵 信頼性レベル: REQ-006-03「タブクリックで即座にフェーズ切り替え」より

      phaseTabUI.create();
      phaseTabUI.simulateTabClick(GamePhase.ALCHEMY);

      expect(mockGameFlowManager.switchPhase).toHaveBeenCalledTimes(1);
      expect(mockGameFlowManager.switchPhase).toHaveBeenCalledWith({
        targetPhase: GamePhase.ALCHEMY,
      });
    });

    it('同じフェーズへのクリックではswitchPhaseが呼ばれない', () => {
      // 【テスト目的】: 現在と同じフェーズタブをクリックした場合、switchPhase()が呼ばれないことを確認
      // 🟡 信頼性レベル: 一般的なUXベストプラクティス

      phaseTabUI.create();
      phaseTabUI.simulateTabClick(GamePhase.QUEST_ACCEPT);

      expect(mockGameFlowManager.switchPhase).not.toHaveBeenCalled();
    });

    it('各フェーズタブがクリック可能である', () => {
      // 【テスト目的】: 4つのタブそれぞれがクリック可能であることを確認
      // 🔵 信頼性レベル: REQ-006-03より

      phaseTabUI.create();

      // 4つのタブ背景にsetInteractiveが呼ばれていることを確認
      // Rectangleコンストラクタは4タブ + 1日終了ボタン = 5回呼ばれる
      const tabRects = mockRectangles.slice(0, 4);
      for (const rect of tabRects) {
        expect(rect.setInteractive).toHaveBeenCalled();
      }
    });
  });

  // ===========================================================================
  // テストケース4: 日終了ボタンでendDay呼び出し
  // ===========================================================================

  describe('T-0111-04: 日終了ボタンでendDay()が呼ばれる', () => {
    it('日終了ボタンクリックでendDay()が呼ばれる', () => {
      // 【テスト目的】: 日終了ボタンクリック時にGameFlowManager.endDay()が呼ばれることを確認
      // 🔵 信頼性レベル: REQ-004・architecture.md「日終了ボタン」より

      phaseTabUI.create();
      phaseTabUI.simulateEndDayClick();

      expect(mockGameFlowManager.endDay).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // destroy()テスト
  // ===========================================================================

  describe('destroy()でリソースが解放される', () => {
    it('EventBus購読が解除される', () => {
      // 【テスト目的】: destroy()でEventBusの購読が確実に解除されることを確認
      // 🔵 信頼性レベル: BaseComponent継承パターンより

      const mockUnsubscribe = vi.fn();
      mockEventBus.on = vi.fn().mockReturnValue(mockUnsubscribe);

      phaseTabUI = new PhaseTabUI(
        scene,
        0,
        0,
        mockGameFlowManager as unknown as IGameFlowManager,
        mockEventBus as unknown as IEventBus,
        GamePhase.QUEST_ACCEPT,
      );
      phaseTabUI.create();
      phaseTabUI.destroy();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it('コンテナが破棄される', () => {
      // 【テスト目的】: destroy()でコンテナが破棄されることを確認
      // 🔵 信頼性レベル: BaseComponent継承パターンより

      phaseTabUI.create();
      phaseTabUI.destroy();

      expect(mockContainer.destroy).toHaveBeenCalledWith(true);
    });
  });
});
