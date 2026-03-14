/**
 * FooterUI - 視覚実装テスト
 * TASK-0047 共通UIコンポーネント視覚実装
 * TASK-0112 FooterUI変更（フェーズタブ統合）
 *
 * @description
 * フッターUIの視覚要素（PhaseTabUI統合、手札表示）をテストする
 *
 * @信頼性レベル 🔵 REQ-006・TASK-0112テストケースに基づく
 */

import { FooterUI } from '@presentation/ui/components/FooterUI';
import type { IEventBus } from '@shared/services/event-bus/types';
import type { IGameFlowManager } from '@shared/services/game-flow/game-flow-manager.interface';
import { GamePhase } from '@shared/types/common';
import Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

interface MockText {
  setText: ReturnType<typeof vi.fn>;
  setStyle: ReturnType<typeof vi.fn>;
  setColor: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  setName: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  text: string;
}

interface MockRectangle {
  setFillStyle: ReturnType<typeof vi.fn>;
  setStrokeStyle: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  setName: ReturnType<typeof vi.fn>;
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
    container: ReturnType<typeof vi.fn>;
  };
}

interface MockGameFlowManager extends Partial<IGameFlowManager> {
  switchPhase: ReturnType<typeof vi.fn>;
  requestEndDay: ReturnType<typeof vi.fn>;
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

  vi.mocked(Phaser.GameObjects.Rectangle).mockImplementation(function (this: unknown) {
    const rect: MockRectangle = {
      setFillStyle: vi.fn().mockReturnThis(),
      setStrokeStyle: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      setName: vi.fn().mockReturnThis(),
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
          setName: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
          text: '',
        };
        mockTexts.push(text);
        return text;
      }),
      container: vi.fn().mockReturnValue(mockContainer),
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
  requestEndDay: vi.fn(),
});

const createMockEventBus = (): MockEventBus => ({
  on: vi.fn().mockReturnValue(vi.fn()),
  emit: vi.fn(),
});

// =============================================================================
// テストスイート
// =============================================================================

describe('FooterUI（TASK-0112）', () => {
  let scene: MockScene;
  let mockContainer: MockContainer;
  let mockRectangles: MockRectangle[];
  let mockGameFlowManager: MockGameFlowManager;
  let mockEventBus: MockEventBus;
  let footerUI: FooterUI;

  beforeEach(() => {
    const mocks = createMockScene();
    scene = mocks.scene;
    mockContainer = mocks.mockContainer;
    mockRectangles = mocks.mockRectangles;
    mockGameFlowManager = createMockGameFlowManager();
    mockEventBus = createMockEventBus();

    footerUI = new FooterUI(
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
  // T-0112-01: プログレスバーが表示されない
  // ===========================================================================

  describe('T-0112-01: プログレスバーが表示されない', () => {
    it('create()後にフェーズインジケーター関連のメソッドが存在しない', () => {
      // 【テスト目的】: プログレスバーが削除されていることを確認
      // 🔵 信頼性レベル: REQ-006「プログレスバーからタブ切り替えUIに変更」より

      footerUI.create();

      // getPhaseIndicators()やupdatePhaseIndicator()が存在しないことを確認
      expect((footerUI as Record<string, unknown>).getPhaseIndicators).toBeUndefined();
      expect((footerUI as Record<string, unknown>).updatePhaseIndicator).toBeUndefined();
    });

    it('Phaser.GameObjects.Arcが呼び出されない（円形インジケーターなし）', () => {
      // 【テスト目的】: 円形のフェーズインジケーターが生成されないことを確認
      // 🔵 信頼性レベル: REQ-006より

      footerUI.create();

      // Arcコンストラクタが呼び出されていないことを確認
      expect(Phaser.GameObjects.Arc).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // T-0112-02: PhaseTabUIが表示される
  // ===========================================================================

  describe('T-0112-02: PhaseTabUIが表示される', () => {
    it('create()後にPhaseTabUIインスタンスが取得できる', () => {
      // 【テスト目的】: PhaseTabUIが統合されていることを確認
      // 🟡 信頼性レベル: design-interview.md D4「PhaseTabUIを別コンポーネントとして新設しFooterUIに組み込み」

      footerUI.create();

      const phaseTabUI = footerUI.getPhaseTabUI();
      expect(phaseTabUI).not.toBeNull();
    });

    it('PhaseTabUIが4つのタブを持つ', () => {
      // 【テスト目的】: PhaseTabUIに4つのフェーズタブがあることを確認
      // 🔵 信頼性レベル: REQ-006-01より

      footerUI.create();

      const phaseTabUI = footerUI.getPhaseTabUI();
      expect(phaseTabUI?.getTabCount()).toBe(4);
    });

    it('PhaseTabUIのアクティブフェーズが初期フェーズと一致する', () => {
      // 【テスト目的】: 初期フェーズがPhaseTabUIに正しく渡されていることを確認
      // 🔵 信頼性レベル: REQ-006-02より

      footerUI.create();

      const phaseTabUI = footerUI.getPhaseTabUI();
      expect(phaseTabUI?.getActivePhase()).toBe(GamePhase.QUEST_ACCEPT);
    });
  });

  // ===========================================================================
  // T-0112-03: 「次へ」ボタンが存在しない
  // ===========================================================================

  describe('T-0112-03: 「次へ」ボタンが存在しない', () => {
    it('「次へ」ボタン関連のメソッドが存在しない', () => {
      // 【テスト目的】: 「次へ」ボタンが廃止されていることを確認
      // 🔵 信頼性レベル: 要件定義「既存要件からの変更点サマリー」より

      footerUI.create();

      // getNextButtonLabel()やonNextClick()等が存在しないことを確認
      expect((footerUI as Record<string, unknown>).getNextButtonLabel).toBeUndefined();
      expect((footerUI as Record<string, unknown>).onNextClick).toBeUndefined();
      expect((footerUI as Record<string, unknown>).updateNextButton).toBeUndefined();
      expect((footerUI as Record<string, unknown>).simulateNextButtonClick).toBeUndefined();
    });
  });

  // ===========================================================================
  // T-0112-04: 「日終了」ボタンが存在する
  // ===========================================================================

  describe('T-0112-04: 「日終了」ボタンが存在する', () => {
    it('PhaseTabUI経由で日終了ボタンクリックでrequestEndDay()が呼ばれる', () => {
      // 【テスト目的】: 「日終了」ボタンがPhaseTabUI経由でrequestEndDay()を呼ぶことを確認
      // 🔵 信頼性レベル: REQ-004・REQ-004-01「残りAP破棄→日終了」より

      footerUI.create();

      const phaseTabUI = footerUI.getPhaseTabUI();
      phaseTabUI?.simulateEndDayClick();

      expect(mockGameFlowManager.requestEndDay).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // 手札表示エリアテスト（既存機能維持）
  // ===========================================================================

  describe('手札表示エリア（既存機能維持）', () => {
    it('手札プレースホルダーが5つ生成される', () => {
      // 【テスト目的】: 手札表示エリアが維持されていることを確認
      // 🔵 信頼性レベル: TASK-0047・既存実装より

      footerUI.create();

      expect(footerUI.getHandDisplayAreaCapacity()).toBe(5);
      expect(footerUI.getHandDisplayArea()).toHaveLength(5);
    });
  });

  // ===========================================================================
  // destroy()テスト
  // ===========================================================================

  describe('destroy()でリソースが解放される', () => {
    it('destroy()でPhaseTabUIも破棄される', () => {
      // 【テスト目的】: FooterUI破棄時にPhaseTabUIも破棄されることを確認
      // 🔵 信頼性レベル: BaseComponent継承パターンより

      const mockUnsubscribe = vi.fn();
      mockEventBus.on = vi.fn().mockReturnValue(mockUnsubscribe);

      footerUI = new FooterUI(
        scene,
        0,
        0,
        mockGameFlowManager as unknown as IGameFlowManager,
        mockEventBus as unknown as IEventBus,
        GamePhase.QUEST_ACCEPT,
      );
      footerUI.create();
      footerUI.destroy();

      // PhaseTabUI内のEventBus購読が解除されている
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('コンテナが破棄される', () => {
      // 【テスト目的】: destroy()でコンテナが破棄されることを確認
      // 🔵 信頼性レベル: BaseComponent継承パターンより

      footerUI.create();
      footerUI.destroy();

      expect(mockContainer.destroy).toHaveBeenCalledWith(true);
    });
  });
});
