/**
 * QuestAcceptPhaseUI 掲示板・訪問依頼表示テスト
 * TASK-0117: QuestAcceptPhaseUI変更
 *
 * @description
 * QuestAcceptPhaseUIの掲示板依頼・訪問依頼の切り替え表示、
 * 受注上限チェック機能を検証する。
 *
 * @信頼性レベル 🟡 REQ-005・architecture.md・dataflow.md セクション6から妥当な推測
 */

import type { Quest } from '@domain/entities/Quest';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モック定義
// =============================================================================

vi.mock('phaser', () => ({
  default: {
    Scene: class MockScene {},
    GameObjects: {
      Container: class {},
      Text: class {},
      Rectangle: class {},
    },
  },
}));

vi.mock('@shared/constants/keybindings', () => ({
  getSelectionIndexFromKey: vi.fn().mockReturnValue(null),
  isKeyForAction: vi.fn().mockReturnValue(false),
}));

vi.mock('@presentation/ui/theme', () => ({
  Colors: {
    PRIMARY: 0x4a90d9,
    BACKGROUND: 0x333333,
    TEXT: '#ffffff',
    BORDER: 0x888888,
    ACCENT: 0xff9900,
    background: {
      parchment: 0xffffff,
      dark: 0x333333,
    },
    surface: {
      card: 0xffffff,
    },
    border: {
      quest: 0xd9cfc2,
      default: 0xd9cfc2,
      subtle: 0xe8e0d6,
    },
    text: {
      primary: 0x3d3d3d,
      secondary: 0x5a5a5a,
      light: '#ffffff',
    },
    status: {
      info: 0x6b9fcc,
    },
  },
  toColorStr: (color: number) => `#${color.toString(16).padStart(6, '0')}`,
}));

vi.mock('@presentation/ui/components/QuestCardUI', () => ({
  QuestCardUI: class MockQuestCardUI {
    private mockContainer = {
      setVisible: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setScale: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      name: '',
      x: 0,
      y: 0,
      visible: true,
    };
    background = { on: vi.fn(), off: vi.fn() };
    create() {}
    destroy() {}
    getContainer() {
      return this.mockContainer;
    }
    getBackground() {
      return this.background;
    }
    setSelected() {}
  },
}));

vi.mock('@presentation/ui/components/QuestDetailModal', () => ({
  QuestDetailModal: class MockQuestDetailModal {
    create() {}
    destroy() {}
    show() {}
    hide() {}
  },
}));

// =============================================================================
// モック作成ヘルパー
// =============================================================================

const createMockContainer = () => ({
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  setScale: vi.fn().mockReturnThis(),
  setMask: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  bringToTop: vi.fn().mockReturnThis(),
  name: '',
  x: 0,
  y: 0,
  visible: true,
});

const createMockText = () => ({
  setText: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setStyle: vi.fn().mockReturnThis(),
  setColor: vi.fn().mockReturnThis(),
  setFontSize: vi.fn().mockReturnThis(),
  setFontStyle: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
  text: '',
});

const createMockRectangle = () => ({
  setFillStyle: vi.fn().mockReturnThis(),
  setStrokeStyle: vi.fn().mockReturnThis(),
  setOrigin: vi.fn().mockReturnThis(),
  setInteractive: vi.fn().mockReturnThis(),
  disableInteractive: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

function createMockScene(): Phaser.Scene {
  return {
    add: {
      container: vi.fn().mockImplementation(() => createMockContainer()),
      text: vi.fn().mockImplementation(() => createMockText()),
      rectangle: vi.fn().mockImplementation(() => createMockRectangle()),
      graphics: vi.fn().mockReturnValue({
        fillStyle: vi.fn().mockReturnThis(),
        fillRect: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
    },
    make: {
      text: vi.fn().mockImplementation(() => createMockText()),
      container: vi.fn().mockImplementation(() => createMockContainer()),
      graphics: vi.fn().mockReturnValue({
        fillStyle: vi.fn().mockReturnThis(),
        fillRect: vi.fn().mockReturnThis(),
        clear: vi.fn().mockReturnThis(),
        createGeometryMask: vi.fn().mockReturnValue({}),
        destroy: vi.fn(),
      }),
    },
    data: {
      get: vi.fn().mockReturnValue({
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn(),
      }),
      set: vi.fn(),
    },
    input: {
      on: vi.fn(),
      off: vi.fn(),
      keyboard: { on: vi.fn(), off: vi.fn() },
    },
    rexUI: {
      add: {
        label: vi.fn().mockReturnValue({
          layout: vi.fn(),
          setInteractive: vi.fn().mockReturnThis(),
          on: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
          setText: vi.fn().mockReturnThis(),
        }),
        roundRectangle: vi.fn().mockReturnValue({
          setFillStyle: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        sizer: vi.fn().mockReturnValue({
          layout: vi.fn(),
          add: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
      },
    },
    cameras: {
      main: { centerX: 640, centerY: 360, width: 1280, height: 720 },
    },
    tweens: {
      add: vi.fn().mockReturnValue({ stop: vi.fn() }),
    },
  } as unknown as Phaser.Scene;
}

function createMockQuest(id: string, clientName = '依頼者'): Quest {
  return {
    data: {
      id,
      clientId: `client-${id}`,
      condition: { type: 'QUANTITY', targetId: 'item-1', quantity: 1 },
      contribution: 10,
      gold: 100,
      deadline: 3,
      difficulty: 'E',
      flavorText: 'テスト依頼',
    },
    client: {
      id: `client-${id}`,
      name: clientName,
      type: 'VILLAGER',
      contributionMultiplier: 1.0,
      goldMultiplier: 1.0,
      deadlineModifier: 0,
      preferredQuestTypes: ['QUANTITY'],
      unlockRank: 'G',
    },
    canDeliver: vi.fn().mockReturnValue(false),
    calculateContribution: vi.fn().mockReturnValue(10),
    calculateGold: vi.fn().mockReturnValue(100),
  } as unknown as Quest;
}

// =============================================================================
// テスト
// =============================================================================

describe('QuestAcceptPhaseUI - 掲示板・訪問依頼表示（TASK-0117）', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
  });

  // ===========================================================================
  // テストケース1: 掲示板依頼の表示
  // ===========================================================================

  describe('掲示板依頼の表示', () => {
    it('T-0117-01: boardQuestsに3件の依頼があるとき、掲示板タブで3件表示される', async () => {
      // 【テスト目的】: 掲示板依頼リストが正しく表示されること
      // 🟡 REQ-005・dataflow.md セクション6から妥当な推測

      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      const boardQuests = [
        createMockQuest('board-1', '掲示板依頼者1'),
        createMockQuest('board-2', '掲示板依頼者2'),
        createMockQuest('board-3', '掲示板依頼者3'),
      ];

      // 掲示板依頼を設定
      phaseUI.updateBoardQuests(boardQuests);

      // 掲示板タブが選択されている場合、3件表示される
      expect(phaseUI.getActiveTab()).toBe('board');
      expect(phaseUI.getDisplayedQuestCount()).toBe(3);
    });
  });

  // ===========================================================================
  // テストケース2: 訪問依頼の表示
  // ===========================================================================

  describe('訪問依頼の表示', () => {
    it('T-0117-02: visitorQuestsに2件の依頼があるとき、訪問タブで2件表示される', async () => {
      // 【テスト目的】: 訪問依頼リストが正しく表示されること
      // 🟡 REQ-005・dataflow.md セクション6から妥当な推測

      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      const visitorQuests = [
        createMockQuest('visitor-1', '訪問依頼者1'),
        createMockQuest('visitor-2', '訪問依頼者2'),
      ];

      // 訪問依頼を設定
      phaseUI.updateVisitorQuests(visitorQuests);

      // 訪問タブに切り替え
      phaseUI.switchTab('visitor');

      expect(phaseUI.getActiveTab()).toBe('visitor');
      expect(phaseUI.getDisplayedQuestCount()).toBe(2);
    });
  });

  // ===========================================================================
  // テストケース3: 受注上限チェック
  // ===========================================================================

  describe('受注上限チェック', () => {
    it('T-0117-03: 既に3件受注済みのとき、canAcceptMore()がfalseを返す', async () => {
      // 【テスト目的】: 受注上限（3件）チェックが動作すること
      // 🟡 REQ-005から妥当な推測

      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      // 受注済み数を3に設定
      phaseUI.setAcceptedCount(3);

      expect(phaseUI.canAcceptMore()).toBe(false);
    });

    it('受注済み2件のとき、canAcceptMore()がtrueを返す', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      phaseUI.setAcceptedCount(2);

      expect(phaseUI.canAcceptMore()).toBe(true);
    });
  });

  // ===========================================================================
  // テストケース4: タブ切り替え
  // ===========================================================================

  describe('タブ切り替え', () => {
    it('デフォルトタブは掲示板（board）', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      expect(phaseUI.getActiveTab()).toBe('board');
    });

    it('switchTab("visitor")で訪問タブに切り替わる', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      phaseUI.switchTab('visitor');

      expect(phaseUI.getActiveTab()).toBe('visitor');
    });

    it('タブ切り替えで表示される依頼が変わる', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      const boardQuests = [
        createMockQuest('board-1'),
        createMockQuest('board-2'),
        createMockQuest('board-3'),
      ];
      const visitorQuests = [createMockQuest('visitor-1')];

      phaseUI.updateBoardQuests(boardQuests);
      phaseUI.updateVisitorQuests(visitorQuests);

      // 掲示板タブ: 3件
      expect(phaseUI.getDisplayedQuestCount()).toBe(3);

      // 訪問タブに切り替え: 1件
      phaseUI.switchTab('visitor');
      expect(phaseUI.getDisplayedQuestCount()).toBe(1);

      // 掲示板タブに戻す: 3件
      phaseUI.switchTab('board');
      expect(phaseUI.getDisplayedQuestCount()).toBe(3);
    });
  });

  // ===========================================================================
  // テストケース5: スクロール機能（Issue #355）
  // ===========================================================================

  describe('スクロール機能（Issue #355）', () => {
    it('create()時にscene.input.onでwheelイベントが登録される', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      // create()でスクロールハンドラが設定される
      phaseUI.create();

      expect(mockScene.input.on).toHaveBeenCalledWith('wheel', expect.any(Function));
    });

    it('destroy()時にscene.input.offでwheelイベントが解除される', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      phaseUI.create();
      phaseUI.destroy();

      expect(mockScene.input.off).toHaveBeenCalledWith('wheel', expect.any(Function));
    });

    it('3件以下の依頼では全カードが表示される', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      const boardQuests = [
        createMockQuest('board-1'),
        createMockQuest('board-2'),
        createMockQuest('board-3'),
      ];

      phaseUI.updateBoardQuests(boardQuests);

      // 3件（1行）は表示可能範囲内
      expect(phaseUI.getDisplayedQuestCount()).toBe(3);
    });

    it('依頼更新後もカード数が正しく反映される', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      // 最初に3件
      const boardQuests3 = [
        createMockQuest('board-1'),
        createMockQuest('board-2'),
        createMockQuest('board-3'),
      ];
      phaseUI.updateBoardQuests(boardQuests3);
      expect(phaseUI.getDisplayedQuestCount()).toBe(3);

      // 5件に更新
      const boardQuests5 = [
        createMockQuest('board-1'),
        createMockQuest('board-2'),
        createMockQuest('board-3'),
        createMockQuest('board-4'),
        createMockQuest('board-5'),
      ];
      phaseUI.updateBoardQuests(boardQuests5);
      expect(phaseUI.getDisplayedQuestCount()).toBe(5);
    });
  });

  // ===========================================================================
  // テストケース6: 受注済み依頼の除外（Issue #356）
  // ===========================================================================

  describe('受注済み依頼の除外（Issue #356）', () => {
    it('T-0356-01: removeAcceptedQuestで掲示板依頼が1件除外される', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      const boardQuests = [
        createMockQuest('board-1', '依頼者1'),
        createMockQuest('board-2', '依頼者2'),
        createMockQuest('board-3', '依頼者3'),
      ];

      phaseUI.updateBoardQuests(boardQuests);
      expect(phaseUI.getDisplayedQuestCount()).toBe(3);

      // 1件受注 → 2件に減る
      phaseUI.removeAcceptedQuest('board-2');
      expect(phaseUI.getDisplayedQuestCount()).toBe(2);
    });

    it('T-0356-02: removeAcceptedQuestで訪問依頼が除外される', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      const visitorQuests = [
        createMockQuest('visitor-1', '訪問者1'),
        createMockQuest('visitor-2', '訪問者2'),
      ];

      phaseUI.updateVisitorQuests(visitorQuests);
      phaseUI.switchTab('visitor');
      expect(phaseUI.getDisplayedQuestCount()).toBe(2);

      // 1件受注 → 1件に減る
      phaseUI.removeAcceptedQuest('visitor-1');
      expect(phaseUI.getDisplayedQuestCount()).toBe(1);
    });

    it('T-0356-03: 存在しないIDを指定しても件数が変わらない', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      const boardQuests = [
        createMockQuest('board-1', '依頼者1'),
        createMockQuest('board-2', '依頼者2'),
      ];

      phaseUI.updateBoardQuests(boardQuests);
      expect(phaseUI.getDisplayedQuestCount()).toBe(2);

      phaseUI.removeAcceptedQuest('non-existent-id');
      expect(phaseUI.getDisplayedQuestCount()).toBe(2);
    });

    it('T-0356-04: 受注後に別タブの依頼数に影響しない', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      const boardQuests = [
        createMockQuest('board-1'),
        createMockQuest('board-2'),
        createMockQuest('board-3'),
      ];
      const visitorQuests = [createMockQuest('visitor-1')];

      phaseUI.updateBoardQuests(boardQuests);
      phaseUI.updateVisitorQuests(visitorQuests);

      // 掲示板タブで1件受注
      phaseUI.removeAcceptedQuest('board-1');
      expect(phaseUI.getDisplayedQuestCount()).toBe(2);

      // 訪問タブに切り替え → 訪問は影響なし
      phaseUI.switchTab('visitor');
      expect(phaseUI.getDisplayedQuestCount()).toBe(1);
    });
  });
});
