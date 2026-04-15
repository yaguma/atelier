/**
 * QuestAcceptPhaseUI 受注済み依頼表示テスト
 * Issue #431: 依頼フェーズで受注済み依頼の内容が確認できない
 *
 * @description
 * QuestAcceptPhaseUIの受注済み依頼表示機能を検証する。
 * updateAcceptedQuests()による受注済み依頼カードの表示・更新・破棄を確認。
 */

import type { Quest } from '@domain/entities/Quest';
import type { IActiveQuest } from '@shared/types/quests';
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

function createMockActiveQuest(id: string, clientName: string, remainingDays = 3): IActiveQuest {
  return {
    quest: {
      id,
      clientId: `client-${id}`,
      condition: { type: 'QUANTITY', quantity: 1 },
      contribution: 50,
      gold: 100,
      deadline: 5,
      difficulty: 'normal',
      flavorText: `${clientName}からの依頼`,
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
    remainingDays,
    acceptedDay: 1,
  } as IActiveQuest;
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

describe('QuestAcceptPhaseUI - 受注済み依頼表示（Issue #431）', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
  });

  // ===========================================================================
  // テストケース1: 受注済み依頼の表示
  // ===========================================================================

  describe('受注済み依頼の表示', () => {
    it('T-0431-01: updateAcceptedQuestsで受注済み依頼が表示される', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      const activeQuests = [
        createMockActiveQuest('quest-1', '村人A', 3),
        createMockActiveQuest('quest-2', '商人B', 2),
      ];

      phaseUI.updateAcceptedQuests(activeQuests);

      expect(phaseUI.getAcceptedQuestCount()).toBe(2);
    });

    it('T-0431-02: 受注済み依頼が0件の場合、カードが表示されない', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      phaseUI.updateAcceptedQuests([]);

      expect(phaseUI.getAcceptedQuestCount()).toBe(0);
    });

    it('T-0431-03: updateAcceptedQuestsを複数回呼ぶと前回の表示が置き換わる', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      // 最初に2件表示
      phaseUI.updateAcceptedQuests([
        createMockActiveQuest('quest-1', '村人A'),
        createMockActiveQuest('quest-2', '商人B'),
      ]);
      expect(phaseUI.getAcceptedQuestCount()).toBe(2);

      // 1件に更新
      phaseUI.updateAcceptedQuests([createMockActiveQuest('quest-1', '村人A')]);
      expect(phaseUI.getAcceptedQuestCount()).toBe(1);
    });

    it('T-0431-04: null/undefinedを渡してもエラーにならない', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      // null相当
      phaseUI.updateAcceptedQuests(null as unknown as IActiveQuest[]);
      expect(phaseUI.getAcceptedQuestCount()).toBe(0);
    });
  });

  // ===========================================================================
  // テストケース2: 新規依頼と受注済み依頼の共存
  // ===========================================================================

  describe('新規依頼と受注済み依頼の共存', () => {
    it('T-0431-05: 新規依頼と受注済み依頼が両方表示される', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      // 新規依頼を設定
      const boardQuests = [
        createMockQuest('board-1', '掲示板依頼者1'),
        createMockQuest('board-2', '掲示板依頼者2'),
      ];
      phaseUI.updateBoardQuests(boardQuests);

      // 受注済み依頼を設定
      const activeQuests = [createMockActiveQuest('active-1', '受注済み依頼者1')];
      phaseUI.updateAcceptedQuests(activeQuests);

      expect(phaseUI.getDisplayedQuestCount()).toBe(2);
      expect(phaseUI.getAcceptedQuestCount()).toBe(1);
    });
  });

  // ===========================================================================
  // テストケース3: destroy時のクリーンアップ
  // ===========================================================================

  describe('destroy時のクリーンアップ', () => {
    it('T-0431-06: destroy()で受注済み依頼カードが破棄される', async () => {
      const { QuestAcceptPhaseUI } = await import('@presentation/ui/phases/QuestAcceptPhaseUI');
      const phaseUI = new QuestAcceptPhaseUI(mockScene);

      phaseUI.updateAcceptedQuests([createMockActiveQuest('quest-1', '村人A')]);
      expect(phaseUI.getAcceptedQuestCount()).toBe(1);

      phaseUI.destroy();

      expect(phaseUI.getAcceptedQuestCount()).toBe(0);
    });
  });
});
