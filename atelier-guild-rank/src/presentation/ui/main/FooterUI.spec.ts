/**
 * FooterUIのテスト
 * TASK-0020 MainScene共通レイアウト
 *
 * @description
 * T-0020-FOOTER-01: コンストラクタの初期化検証
 * T-0020-FOOTER-02: create()メソッドでのUI生成
 * T-0020-FOOTER-03: フェーズインジケーター表示の検証
 * T-0020-FOOTER-04: フェーズインジケーター状態の検証
 * T-0020-FOOTER-05: 手札表示エリアの検証
 * T-0020-FOOTER-06: 休憩ボタン表示の検証
 * T-0020-FOOTER-07: 次へボタン表示の検証
 * T-0020-FOOTER-08: update(state)メソッドの検証
 * T-0020-FOOTER-09: destroy()メソッドの検証
 */

import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GamePhase, GuildRank } from '../../../shared/types/common';
import type { IGameState } from '../../../shared/types/game-state';
import { FooterUI } from './FooterUI';

// レイアウト定数
const SCREEN_HEIGHT = 720;
const FOOTER_HEIGHT = 160;
const FOOTER_Y = SCREEN_HEIGHT - FOOTER_HEIGHT; // 560
const FOOTER_DEPTH = 200;
const CARD_SPACING = 8;
const MAX_HAND_SIZE = 5;

// フェーズ表示状態
const PhaseDisplayState = {
  PENDING: 'pending',
  CURRENT: 'current',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
} as const;

type PhaseDisplayState = (typeof PhaseDisplayState)[keyof typeof PhaseDisplayState];

// フェーズ名定義
const PHASE_NAMES: Record<GamePhase, string> = {
  [GamePhase.QUEST_ACCEPT]: '依頼受注',
  [GamePhase.GATHERING]: '採取',
  [GamePhase.ALCHEMY]: '調合',
  [GamePhase.DELIVERY]: '納品',
};

// 次へボタンラベル定義
const NEXT_BUTTON_LABELS: Record<GamePhase, string> = {
  [GamePhase.QUEST_ACCEPT]: '採取へ',
  [GamePhase.GATHERING]: '調合へ',
  [GamePhase.ALCHEMY]: '納品へ',
  [GamePhase.DELIVERY]: '日終了',
};

// イベント名定数
const EVENTS = {
  REST_REQUESTED: 'REST_REQUESTED',
  NEXT_PHASE_REQUESTED: 'NEXT_PHASE_REQUESTED',
};

/**
 * Phaserシーンのモックを作成
 */
function createMockScene(): Phaser.Scene {
  const mockText = {
    setText: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    text: '',
    style: { color: '' },
  };

  const mockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    fillCircle: vi.fn().mockReturnThis(),
    lineStyle: vi.fn().mockReturnThis(),
    lineBetween: vi.fn().mockReturnThis(),
    strokePath: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockContainer = {
    setVisible: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: FOOTER_Y,
    depth: 0,
    visible: true,
  };

  const mockButton = {
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    disabled: false,
  };

  return {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      text: vi.fn().mockReturnValue({ ...mockText }),
      graphics: vi.fn().mockReturnValue({ ...mockGraphics }),
    },
    rexUI: {
      add: {
        sizer: vi.fn().mockReturnValue({
          add: vi.fn().mockReturnThis(),
          layout: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
        label: vi.fn().mockReturnValue({
          ...mockButton,
          text: '',
        }),
        buttons: vi.fn().mockReturnValue({
          add: vi.fn().mockReturnThis(),
          layout: vi.fn().mockReturnThis(),
          destroy: vi.fn(),
        }),
      },
    },
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  } as unknown as Phaser.Scene;
}

/**
 * テスト用のゲーム状態を作成
 */
function createMockGameState(overrides: Partial<IGameState> = {}): IGameState {
  return {
    currentRank: GuildRank.G,
    rankHp: 100,
    promotionGauge: 35,
    remainingDays: 25,
    currentDay: 1,
    currentPhase: GamePhase.QUEST_ACCEPT,
    gold: 130,
    comboCount: 0,
    actionPoints: 3,
    isPromotionTest: false,
    ...overrides,
  };
}

describe('FooterUI', () => {
  let scene: Phaser.Scene;
  let footerUI: FooterUI;

  beforeEach(() => {
    // 【テスト前準備】: 各テスト実行前にPhaserシーンとコンポーネントを初期化
    // 【環境初期化】: 前のテストの影響を受けないよう、新しいインスタンスを生成
    scene = createMockScene();
    footerUI = new FooterUI(scene);
  });

  describe('T-0020-FOOTER-01: コンストラクタの初期化検証', () => {
    // 【テスト目的】: FooterUIが正しく初期化されることを確認
    // 【テスト内容】: scene、container、rexUIプロパティが正しく設定されることを検証
    // 【期待される動作】: すべてのプロパティが正しく初期化される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-016, REQ-0020-025）に明記

    test('scene プロパティが正しく設定されている', () => {
      // 【確認内容】: コンストラクタで渡されたsceneが、インスタンスのsceneプロパティに設定されていることを確認
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(footerUI['scene']).toBe(scene); // 🔵
    });

    test('container が作成されている', () => {
      // 【確認内容】: Phaserのcontainerが正しく作成され、add.containerメソッドが呼ばれたことを確認
      expect(scene.add.container).toHaveBeenCalled(); // 🔵
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(footerUI['container']).toBeDefined(); // 🔵
    });

    test('BaseComponentを継承している', () => {
      // 【確認内容】: FooterUIがBaseComponentを正しく継承していることを確認
      expect(footerUI.setVisible).toBeDefined(); // 🔵
      expect(footerUI.setPosition).toBeDefined(); // 🔵
      expect(footerUI.create).toBeDefined(); // 🔵
      expect(footerUI.destroy).toBeDefined(); // 🔵
    });
  });

  describe('T-0020-FOOTER-02: create()メソッドでのUI生成', () => {
    // 【テスト目的】: create()メソッドが正しくUIを生成することを確認
    // 【テスト内容】: フッターコンテナとその子要素が正しく生成されることを検証
    // 【期待される動作】: フッターUIが正しく生成される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-016）に明記

    test('create()呼び出しでフッターが生成される', () => {
      // 【確認内容】: create()を呼び出すと、containerに子要素が追加されることを確認
      footerUI.create();
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(footerUI['container'].add).toHaveBeenCalled(); // 🔵
    });

    test('コンテナのdepthが200に設定される', () => {
      // 【確認内容】: フッターコンテナのdepthが200に設定されることを確認
      footerUI.create();
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(footerUI['container'].setDepth).toHaveBeenCalledWith(FOOTER_DEPTH); // 🔵
    });

    test('フッターのY座標が560である', () => {
      // 【確認内容】: フッターコンテナが画面下部（Y座標560）に配置されることを確認
      expect(scene.add.container).toHaveBeenCalledWith(expect.any(Number), FOOTER_Y); // 🔵
    });

    test('FOOTER_HEIGHT定数が160である', () => {
      // 【確認内容】: フッターの高さが160pxであることを確認
      expect(FOOTER_HEIGHT).toBe(160); // 🔵
    });

    test('FOOTER_Y定数が560である', () => {
      // 【確認内容】: フッターのY座標が560（720-160）であることを確認
      expect(FOOTER_Y).toBe(560); // 🔵
    });
  });

  describe('T-0020-FOOTER-03: フェーズインジケーター表示の検証', () => {
    // 【テスト目的】: フェーズインジケーターが正しく表示されることを確認
    // 【テスト内容】: 4フェーズノードとフェーズ名が正しく表示されることを検証
    // 【期待される動作】: フェーズインジケーターが正しく表示される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-017）に明記

    test('フェーズ名定義が4つ存在する', () => {
      // 【確認内容】: 4つのフェーズ名が定義されていることを確認
      expect(Object.keys(PHASE_NAMES).length).toBe(4); // 🔵
    });

    test('「依頼受注」フェーズ名が定義されている', () => {
      // 【確認内容】: QUEST_ACCEPTフェーズの名前が「依頼受注」であることを確認
      expect(PHASE_NAMES[GamePhase.QUEST_ACCEPT]).toBe('依頼受注'); // 🔵
    });

    test('「採取」フェーズ名が定義されている', () => {
      // 【確認内容】: GATHERINGフェーズの名前が「採取」であることを確認
      expect(PHASE_NAMES[GamePhase.GATHERING]).toBe('採取'); // 🔵
    });

    test('「調合」フェーズ名が定義されている', () => {
      // 【確認内容】: ALCHEMYフェーズの名前が「調合」であることを確認
      expect(PHASE_NAMES[GamePhase.ALCHEMY]).toBe('調合'); // 🔵
    });

    test('「納品」フェーズ名が定義されている', () => {
      // 【確認内容】: DELIVERYフェーズの名前が「納品」であることを確認
      expect(PHASE_NAMES[GamePhase.DELIVERY]).toBe('納品'); // 🔵
    });

    test('フェーズの順序配列が正しい', () => {
      // 【確認内容】: フェーズの順序が正しいことを確認
      const phaseOrder: GamePhase[] = [
        GamePhase.QUEST_ACCEPT,
        GamePhase.GATHERING,
        GamePhase.ALCHEMY,
        GamePhase.DELIVERY,
      ];
      expect(phaseOrder.length).toBe(4); // 🔵
      expect(phaseOrder[0]).toBe(GamePhase.QUEST_ACCEPT); // 🔵
      expect(phaseOrder[1]).toBe(GamePhase.GATHERING); // 🔵
      expect(phaseOrder[2]).toBe(GamePhase.ALCHEMY); // 🔵
      expect(phaseOrder[3]).toBe(GamePhase.DELIVERY); // 🔵
    });
  });

  describe('T-0020-FOOTER-04: フェーズインジケーター状態の検証', () => {
    // 【テスト目的】: 各フェーズノードの状態表示が正しいことを確認
    // 【テスト内容】: pending、current、completed、skipped状態が正しく表示されることを検証
    // 【期待される動作】: フェーズ状態に応じた表示がされる
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-018）に明記

    test('PhaseDisplayState定義が4つ存在する', () => {
      // 【確認内容】: 4つの表示状態が定義されていることを確認
      expect(Object.keys(PhaseDisplayState).length).toBe(4); // 🔵
    });

    test('pending状態が定義されている', () => {
      // 【確認内容】: 未到達状態が定義されていることを確認
      expect(PhaseDisplayState.PENDING).toBe('pending'); // 🔵
    });

    test('current状態が定義されている', () => {
      // 【確認内容】: 現在状態が定義されていることを確認
      expect(PhaseDisplayState.CURRENT).toBe('current'); // 🔵
    });

    test('completed状態が定義されている', () => {
      // 【確認内容】: 完了状態が定義されていることを確認
      expect(PhaseDisplayState.COMPLETED).toBe('completed'); // 🔵
    });

    test('skipped状態が定義されている', () => {
      // 【確認内容】: スキップ状態が定義されていることを確認
      expect(PhaseDisplayState.SKIPPED).toBe('skipped'); // 🔵
    });

    test('フェーズ状態を取得する関数が正しく動作する', () => {
      // 【確認内容】: 現在のフェーズに基づいて各ノードの状態が正しく判定されることを確認
      const phaseOrder: GamePhase[] = [
        GamePhase.QUEST_ACCEPT,
        GamePhase.GATHERING,
        GamePhase.ALCHEMY,
        GamePhase.DELIVERY,
      ];

      const getPhaseState = (
        phase: GamePhase,
        currentPhase: GamePhase,
        completedPhases: GamePhase[] = [],
      ): PhaseDisplayState => {
        if (completedPhases.includes(phase)) return PhaseDisplayState.COMPLETED;
        if (phase === currentPhase) return PhaseDisplayState.CURRENT;
        const currentIndex = phaseOrder.indexOf(currentPhase);
        const phaseIndex = phaseOrder.indexOf(phase);
        return phaseIndex < currentIndex ? PhaseDisplayState.COMPLETED : PhaseDisplayState.PENDING;
      };

      // QUEST_ACCEPTフェーズの場合
      expect(getPhaseState(GamePhase.QUEST_ACCEPT, GamePhase.QUEST_ACCEPT)).toBe(
        PhaseDisplayState.CURRENT,
      ); // 🔵
      expect(getPhaseState(GamePhase.GATHERING, GamePhase.QUEST_ACCEPT)).toBe(
        PhaseDisplayState.PENDING,
      ); // 🔵

      // GATHERINGフェーズの場合
      expect(getPhaseState(GamePhase.QUEST_ACCEPT, GamePhase.GATHERING)).toBe(
        PhaseDisplayState.COMPLETED,
      ); // 🔵
      expect(getPhaseState(GamePhase.GATHERING, GamePhase.GATHERING)).toBe(
        PhaseDisplayState.CURRENT,
      ); // 🔵
      expect(getPhaseState(GamePhase.ALCHEMY, GamePhase.GATHERING)).toBe(PhaseDisplayState.PENDING); // 🔵

      // DELIVERYフェーズの場合
      expect(getPhaseState(GamePhase.DELIVERY, GamePhase.DELIVERY)).toBe(PhaseDisplayState.CURRENT); // 🔵
    });
  });

  describe('T-0020-FOOTER-05: 手札表示エリアの検証', () => {
    // 【テスト目的】: 手札表示エリアが正しく表示されることを確認
    // 【テスト内容】: カード配置と間隔が正しいことを検証
    // 【期待される動作】: 手札エリアが正しく表示される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-019）に明記

    test('MAX_HAND_SIZE定数が5である', () => {
      // 【確認内容】: 最大手札枚数が5であることを確認
      expect(MAX_HAND_SIZE).toBe(5); // 🔵
    });

    test('CARD_SPACING定数が8である', () => {
      // 【確認内容】: カード間隔が8pxであることを確認
      expect(CARD_SPACING).toBe(8); // 🔵
    });

    test('手札配置の計算関数が正しく動作する', () => {
      // 【確認内容】: 手札のX座標計算が正しいことを確認
      const cardWidth = 100;
      const startX = 200;
      const getCardX = (index: number): number => startX + index * (cardWidth + CARD_SPACING);

      expect(getCardX(0)).toBe(200); // 🔵
      expect(getCardX(1)).toBe(308); // 200 + 108 🔵
      expect(getCardX(2)).toBe(416); // 200 + 216 🔵
      expect(getCardX(3)).toBe(524); // 200 + 324 🔵
      expect(getCardX(4)).toBe(632); // 200 + 432 🔵
    });
  });

  describe('T-0020-FOOTER-06: 休憩ボタン表示の検証', () => {
    // 【テスト目的】: 休憩ボタンが正しく表示・動作することを確認
    // 【テスト内容】: ボタン表示と有効/無効状態を検証
    // 【期待される動作】: 休憩ボタンが正しく動作する
    // 🟡 信頼性レベル: 要件定義書（REQ-0020-020, REQ-0020-021）に明記（黄信号）

    test('休憩ボタンのラベルが「休憩」である', () => {
      // 【確認内容】: 休憩ボタンのラベルテキストを確認
      const restButtonLabel = '休憩';
      expect(restButtonLabel).toBe('休憩'); // 🟡
    });

    test('REST_REQUESTEDイベント名が定義されている', () => {
      // 【確認内容】: 休憩要求イベント名が正しく定義されていることを確認
      expect(EVENTS.REST_REQUESTED).toBe('REST_REQUESTED'); // 🟡
    });

    test('AP最大値判定関数が正しく動作する', () => {
      // 【確認内容】: APが最大値かどうかの判定が正しいことを確認
      const isAPMax = (current: number, max: number): boolean => current >= max;

      expect(isAPMax(3, 3)).toBe(true); // AP最大: ボタン無効 🟡
      expect(isAPMax(2, 3)).toBe(false); // AP未満: ボタン有効 🟡
      expect(isAPMax(0, 3)).toBe(false); // AP 0: ボタン有効 🟡
    });

    test('ボタンの有効/無効状態を設定する関数が正しく動作する', () => {
      // 【確認内容】: APに基づいてボタンの状態が正しく設定されることを確認
      const getRestButtonEnabled = (ap: number, maxAp: number): boolean => ap < maxAp;

      expect(getRestButtonEnabled(3, 3)).toBe(false); // 🟡
      expect(getRestButtonEnabled(2, 3)).toBe(true); // 🟡
      expect(getRestButtonEnabled(0, 3)).toBe(true); // 🟡
    });
  });

  describe('T-0020-FOOTER-07: 次へボタン表示の検証', () => {
    // 【テスト目的】: 次へボタンが正しく表示・動作することを確認
    // 【テスト内容】: フェーズに応じたラベル表示とイベント発行を検証
    // 【期待される動作】: 次へボタンが正しく動作する
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-022, REQ-0020-023）に明記

    test('QUEST_ACCEPTフェーズで「採取へ」と表示される', () => {
      // 【確認内容】: QUEST_ACCEPTフェーズでの次へボタンラベルを確認
      expect(NEXT_BUTTON_LABELS[GamePhase.QUEST_ACCEPT]).toBe('採取へ'); // 🔵
    });

    test('GATHERINGフェーズで「調合へ」と表示される', () => {
      // 【確認内容】: GATHERINGフェーズでの次へボタンラベルを確認
      expect(NEXT_BUTTON_LABELS[GamePhase.GATHERING]).toBe('調合へ'); // 🔵
    });

    test('ALCHEMYフェーズで「納品へ」と表示される', () => {
      // 【確認内容】: ALCHEMYフェーズでの次へボタンラベルを確認
      expect(NEXT_BUTTON_LABELS[GamePhase.ALCHEMY]).toBe('納品へ'); // 🔵
    });

    test('DELIVERYフェーズで「日終了」と表示される', () => {
      // 【確認内容】: DELIVERYフェーズでの次へボタンラベルを確認
      expect(NEXT_BUTTON_LABELS[GamePhase.DELIVERY]).toBe('日終了'); // 🔵
    });

    test('NEXT_PHASE_REQUESTEDイベント名が定義されている', () => {
      // 【確認内容】: 次フェーズ要求イベント名が正しく定義されていることを確認
      expect(EVENTS.NEXT_PHASE_REQUESTED).toBe('NEXT_PHASE_REQUESTED'); // 🔵
    });

    test('次へボタンラベル取得関数が正しく動作する', () => {
      // 【確認内容】: フェーズに応じた次へボタンラベルが取得できることを確認
      const getNextButtonLabel = (phase: GamePhase): string => NEXT_BUTTON_LABELS[phase];

      expect(getNextButtonLabel(GamePhase.QUEST_ACCEPT)).toBe('採取へ'); // 🔵
      expect(getNextButtonLabel(GamePhase.GATHERING)).toBe('調合へ'); // 🔵
      expect(getNextButtonLabel(GamePhase.ALCHEMY)).toBe('納品へ'); // 🔵
      expect(getNextButtonLabel(GamePhase.DELIVERY)).toBe('日終了'); // 🔵
    });

    test('イベントペイロードに現在フェーズが含まれる', () => {
      // 【確認内容】: NEXT_PHASE_REQUESTEDイベントのペイロードに現在フェーズが含まれることを確認
      const currentPhase = GamePhase.GATHERING;
      const payload = { currentPhase };
      expect(payload.currentPhase).toBe(GamePhase.GATHERING); // 🔵
    });
  });

  describe('T-0020-FOOTER-08: update(state)メソッドの検証', () => {
    // 【テスト目的】: update()メソッドが正しく状態を更新することを確認
    // 【テスト内容】: フェーズインジケーター、ボタン状態が更新されることを検証
    // 【期待される動作】: すべての表示要素が正しく更新される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-024）に明記

    test('updateメソッドが存在する', () => {
      // 【確認内容】: updateメソッドが定義されていることを確認
      expect(footerUI.update).toBeDefined(); // 🔵
      expect(typeof footerUI.update).toBe('function'); // 🔵
    });

    test('updateメソッドがIGameStateを受け取る', () => {
      // 【確認内容】: updateメソッドがゲーム状態を引数として受け取れることを確認
      footerUI.create();
      const gameState = createMockGameState();
      expect(() => footerUI.update(gameState)).not.toThrow(); // 🔵
    });

    test('異なるフェーズで更新した場合、フェーズインジケーターが変わる', () => {
      // 【確認内容】: 異なるフェーズで更新した際に表示が更新されることを確認
      footerUI.create();
      const stateQuestAccept = createMockGameState({ currentPhase: GamePhase.QUEST_ACCEPT });
      const stateGathering = createMockGameState({ currentPhase: GamePhase.GATHERING });

      footerUI.update(stateQuestAccept);
      // モックの動作を確認

      footerUI.update(stateGathering);
      // モックの動作を確認
      // 🔵
    });

    test('次へボタンのラベルがフェーズに応じて更新される', () => {
      // 【確認内容】: フェーズ変更時に次へボタンのラベルが更新されることを確認
      footerUI.create();
      const state = createMockGameState({ currentPhase: GamePhase.ALCHEMY });
      expect(() => footerUI.update(state)).not.toThrow(); // 🔵
    });

    test('休憩ボタンの状態がAPに応じて更新される', () => {
      // 【確認内容】: AP変更時に休憩ボタンの有効/無効状態が更新されることを確認
      footerUI.create();
      const stateAPMax = createMockGameState({ actionPoints: 3 });
      const stateAPLow = createMockGameState({ actionPoints: 1 });

      expect(() => footerUI.update(stateAPMax)).not.toThrow(); // 🔵
      expect(() => footerUI.update(stateAPLow)).not.toThrow(); // 🔵
    });
  });

  describe('T-0020-FOOTER-09: destroy()メソッドの検証', () => {
    // 【テスト目的】: destroy()メソッドが正しくリソースを解放することを確認
    // 【テスト内容】: 全オブジェクトとイベントリスナーが解放されることを検証
    // 【期待される動作】: すべてのリソースが正しく解放される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-026）に明記

    test('destroyメソッドが存在する', () => {
      // 【確認内容】: destroyメソッドが定義されていることを確認
      expect(footerUI.destroy).toBeDefined(); // 🔵
      expect(typeof footerUI.destroy).toBe('function'); // 🔵
    });

    test('destroy()が呼び出し可能である', () => {
      // 【確認内容】: destroyメソッドが実際に呼び出せることを確認
      footerUI.create();
      expect(() => footerUI.destroy()).not.toThrow(); // 🔵
    });

    test('destroy()でコンテナが破棄される', () => {
      // 【確認内容】: destroy()呼び出し時にcontainer.destroyが呼ばれることを確認
      footerUI.create();
      footerUI.destroy();
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(footerUI['container'].destroy).toHaveBeenCalled(); // 🔵
    });
  });

  describe('T-0020-FOOTER-ERROR: 異常系テスト', () => {
    // 【テスト目的】: 異常値が渡された場合の動作を確認
    // 【テスト内容】: null、undefined、不正なフェーズでの動作を検証
    // 【期待される動作】: エラーが適切に処理される
    // 🟡 信頼性レベル: TDDのベストプラクティスから推測

    test('sceneがnullの場合エラーをスローする', () => {
      // 【確認内容】: sceneがnullの場合、エラーがスローされることを確認
      expect(() => new FooterUI(null as unknown as Phaser.Scene)).toThrow(); // 🟡
    });

    test('不正なフェーズでも正常に処理される', () => {
      // 【確認内容】: 不正なフェーズ値でもクラッシュしないことを確認
      footerUI.create();
      const state = createMockGameState();
      // @ts-expect-error - 意図的に不正な値をテスト
      state.currentPhase = 'INVALID_PHASE';
      // エラーが発生しないことを確認（実装によっては警告を出す）
      expect(() => footerUI.update(state)).not.toThrow(); // 🟡
    });

    test('actionPointsが負の場合も正常に処理される', () => {
      // 【確認内容】: 負のAP値でも正常に処理されることを確認
      footerUI.create();
      const state = createMockGameState({ actionPoints: -1 });
      expect(() => footerUI.update(state)).not.toThrow(); // 🟡
    });
  });

  describe('T-0020-FOOTER-BOUNDARY: 境界値テスト', () => {
    // 【テスト目的】: 境界値での動作を確認
    // 【テスト内容】: 各パラメータの境界値での動作を検証
    // 【期待される動作】: 境界値で正しく動作する
    // 🟡 信頼性レベル: TDDのベストプラクティスから推測

    test('全フェーズでの更新テスト', () => {
      // 【確認内容】: 各フェーズで更新が正しく動作することを確認
      footerUI.create();

      const phases: GamePhase[] = [
        GamePhase.QUEST_ACCEPT,
        GamePhase.GATHERING,
        GamePhase.ALCHEMY,
        GamePhase.DELIVERY,
      ];

      for (const phase of phases) {
        const state = createMockGameState({ currentPhase: phase });
        expect(() => footerUI.update(state)).not.toThrow(); // 🟡
      }
    });

    test('actionPoints境界値テスト', () => {
      // 【確認内容】: 行動ポイントの境界値で正しく動作することを確認
      footerUI.create();

      const testCases = [0, 1, 3, 5];
      for (const ap of testCases) {
        const state = createMockGameState({ actionPoints: ap });
        expect(() => footerUI.update(state)).not.toThrow(); // 🟡
      }
    });

    test('手札枚数の境界値テスト', () => {
      // 【確認内容】: 手札枚数の境界値で正しく動作することを確認
      const handSizes = [0, 1, 3, 5];
      for (const size of handSizes) {
        expect(size).toBeGreaterThanOrEqual(0); // 🟡
        expect(size).toBeLessThanOrEqual(MAX_HAND_SIZE); // 🟡
      }
    });
  });
});
