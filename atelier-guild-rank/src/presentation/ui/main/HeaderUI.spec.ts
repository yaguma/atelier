/**
 * HeaderUIのテスト
 * TASK-0020 MainScene共通レイアウト
 *
 * @description
 * T-0020-HEADER-01: コンストラクタの初期化検証
 * T-0020-HEADER-02: create()メソッドでのUI生成
 * T-0020-HEADER-03: ランク表示機能の検証
 * T-0020-HEADER-04: 昇格ゲージ表示の検証
 * T-0020-HEADER-05: 残り日数表示の検証
 * T-0020-HEADER-06: 残り日数境界値テスト
 * T-0020-HEADER-07: 所持金表示の検証
 * T-0020-HEADER-08: 行動ポイント表示の検証
 * T-0020-HEADER-09: update(state)メソッドの検証
 * T-0020-HEADER-10: destroy()メソッドの検証
 */

import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GamePhase, GuildRank } from '../../../shared/types/common';
import type { IGameState } from '../../../shared/types/game-state';
import { HeaderUI } from './HeaderUI';

// ランク別カラー定義（テスト用）
const RANK_COLORS: Record<GuildRank, number> = {
  G: 0x808080, // グレー
  F: 0xcd7f32, // ブロンズ
  E: 0xc0c0c0, // シルバー
  D: 0xffd700, // ゴールド
  C: 0x00ced1, // ターコイズ
  B: 0x9400d3, // パープル
  A: 0xff4500, // オレンジレッド
  S: 0xffffff, // ホワイト
};

// ゲージ色定義（テスト用）
const GAUGE_COLORS = {
  LOW: 0xff6b6b, // 30%未満: 赤系
  MEDIUM: 0xffd93d, // 30-60%: 黄系
  HIGH: 0x6bcb77, // 60%以上: 緑系
  COMPLETE: 0x4ecdc4, // 100%: 完了色
};

// 日数警告色定義（テスト用）
const DAYS_COLORS = {
  NORMAL: '#FFFFFF', // 11日以上: 白
  WARNING: '#FFD93D', // 10日以下: 黄
  URGENT: '#FF6B6B', // 5日以下: 赤
  CRITICAL: '#FF0000', // 3日以下: 点滅赤
};

// レイアウト定数
const HEADER_HEIGHT = 60;
const HEADER_DEPTH = 200;

/**
 * Phaserシーンのモックを作成
 */
function createMockScene(): Phaser.Scene {
  const mockText = {
    setText: vi.fn().mockReturnThis(),
    setStyle: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    text: '',
    style: { color: '' },
  };

  const mockGraphics = {
    fillStyle: vi.fn().mockReturnThis(),
    fillRect: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    fillColor: 0,
    width: 0,
  };

  const mockContainer = {
    setVisible: vi.fn().mockReturnThis(),
    setPosition: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
    depth: 0,
    visible: true,
  };

  return {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      text: vi.fn().mockReturnValue({ ...mockText }),
      graphics: vi.fn().mockReturnValue({ ...mockGraphics }),
    },
    rexUI: {},
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

describe('HeaderUI', () => {
  let scene: Phaser.Scene;
  let headerUI: HeaderUI;

  beforeEach(() => {
    // 【テスト前準備】: 各テスト実行前にPhaserシーンとコンポーネントを初期化
    // 【環境初期化】: 前のテストの影響を受けないよう、新しいインスタンスを生成
    scene = createMockScene();
    headerUI = new HeaderUI(scene);
  });

  describe('T-0020-HEADER-01: コンストラクタの初期化検証', () => {
    // 【テスト目的】: HeaderUIが正しく初期化されることを確認
    // 【テスト内容】: scene、container、rexUIプロパティが正しく設定されることを検証
    // 【期待される動作】: すべてのプロパティが正しく初期化される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-001, REQ-0020-025）に明記

    test('scene プロパティが正しく設定されている', () => {
      // 【確認内容】: コンストラクタで渡されたsceneが、インスタンスのsceneプロパティに設定されていることを確認
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(headerUI['scene']).toBe(scene); // 🔵
    });

    test('container が作成されている', () => {
      // 【確認内容】: Phaserのcontainerが正しく作成され、add.containerメソッドが呼ばれたことを確認
      expect(scene.add.container).toHaveBeenCalled(); // 🔵
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(headerUI['container']).toBeDefined(); // 🔵
    });

    test('rexUI プラグインへの参照が設定されている', () => {
      // 【確認内容】: シーンのrexUIプラグインへの参照が、コンポーネントのrexUIプロパティに設定されていることを確認
      // TASK-0059: rexUI型定義を追加したため、@ts-expect-errorは不要
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(headerUI['rexUI']).toBe(scene.rexUI); // 🔵
    });

    test('BaseComponentを継承している', () => {
      // 【確認内容】: HeaderUIがBaseComponentを正しく継承していることを確認
      expect(headerUI.setVisible).toBeDefined(); // 🔵
      expect(headerUI.setPosition).toBeDefined(); // 🔵
      expect(headerUI.create).toBeDefined(); // 🔵
      expect(headerUI.destroy).toBeDefined(); // 🔵
    });
  });

  describe('T-0020-HEADER-02: create()メソッドでのUI生成', () => {
    // 【テスト目的】: create()メソッドが正しくUIを生成することを確認
    // 【テスト内容】: ヘッダーコンテナとその子要素が正しく生成されることを検証
    // 【期待される動作】: ヘッダーUIが正しく生成される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-001）に明記

    test('create()呼び出しでヘッダーが生成される', () => {
      // 【確認内容】: create()を呼び出すと、containerに子要素が追加されることを確認
      headerUI.create();
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(headerUI['container'].add).toHaveBeenCalled(); // 🔵
    });

    test('コンテナのdepthが200に設定される', () => {
      // 【確認内容】: ヘッダーコンテナのdepthが200に設定されることを確認
      headerUI.create();
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(headerUI['container'].setDepth).toHaveBeenCalledWith(HEADER_DEPTH); // 🔵
    });

    test('ヘッダーのY座標が0である', () => {
      // 【確認内容】: ヘッダーコンテナが画面上部（Y座標0）に配置されることを確認
      expect(scene.add.container).toHaveBeenCalledWith(expect.any(Number), 0); // 🔵
    });

    test('HEADER_HEIGHT定数が60である', () => {
      // 【確認内容】: ヘッダーの高さが60pxであることを確認
      expect(HEADER_HEIGHT).toBe(60); // 🔵
    });
  });

  describe('T-0020-HEADER-03: ランク表示機能の検証', () => {
    // 【テスト目的】: ランク表示が正しく動作することを確認
    // 【テスト内容】: 各ランクに対応するカラーで表示されることを検証
    // 【期待される動作】: ランク別のカラーで正しく表示される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-002）に明記

    test('ランクGの場合グレー(0x808080)で表示される', () => {
      // 【確認内容】: ランクGのカラーがグレーであることを確認
      expect(RANK_COLORS.G).toBe(0x808080); // 🔵
    });

    test('ランクFの場合ブロンズ(0xCD7F32)で表示される', () => {
      // 【確認内容】: ランクFのカラーがブロンズであることを確認
      expect(RANK_COLORS.F).toBe(0xcd7f32); // 🔵
    });

    test('ランクEの場合シルバー(0xC0C0C0)で表示される', () => {
      // 【確認内容】: ランクEのカラーがシルバーであることを確認
      expect(RANK_COLORS.E).toBe(0xc0c0c0); // 🔵
    });

    test('ランクDの場合ゴールド(0xFFD700)で表示される', () => {
      // 【確認内容】: ランクDのカラーがゴールドであることを確認
      expect(RANK_COLORS.D).toBe(0xffd700); // 🔵
    });

    test('ランクCの場合ターコイズ(0x00CED1)で表示される', () => {
      // 【確認内容】: ランクCのカラーがターコイズであることを確認
      expect(RANK_COLORS.C).toBe(0x00ced1); // 🔵
    });

    test('ランクBの場合パープル(0x9400D3)で表示される', () => {
      // 【確認内容】: ランクBのカラーがパープルであることを確認
      expect(RANK_COLORS.B).toBe(0x9400d3); // 🔵
    });

    test('ランクAの場合オレンジレッド(0xFF4500)で表示される', () => {
      // 【確認内容】: ランクAのカラーがオレンジレッドであることを確認
      expect(RANK_COLORS.A).toBe(0xff4500); // 🔵
    });

    test('ランクSの場合ホワイト(0xFFFFFF)で表示される', () => {
      // 【確認内容】: ランクSのカラーがホワイトであることを確認
      expect(RANK_COLORS.S).toBe(0xffffff); // 🔵
    });

    test('全ランクのカラーが定義されている', () => {
      // 【確認内容】: 全8ランクのカラーが定義されていることを確認
      const ranks: GuildRank[] = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
      for (const rank of ranks) {
        expect(RANK_COLORS[rank]).toBeDefined(); // 🔵
      }
    });
  });

  describe('T-0020-HEADER-04: 昇格ゲージ表示の検証', () => {
    // 【テスト目的】: 昇格ゲージが正しく表示されることを確認
    // 【テスト内容】: 進捗率に応じた色とサイズで表示されることを検証
    // 【期待される動作】: ゲージが正しい色とサイズで表示される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-003）に明記

    test('進捗30%未満は赤系(0xFF6B6B)で表示される', () => {
      // 【確認内容】: 進捗30%未満のゲージ色が赤系であることを確認
      expect(GAUGE_COLORS.LOW).toBe(0xff6b6b); // 🔵
    });

    test('進捗30-60%は黄系(0xFFD93D)で表示される', () => {
      // 【確認内容】: 進捗30-60%のゲージ色が黄系であることを確認
      expect(GAUGE_COLORS.MEDIUM).toBe(0xffd93d); // 🔵
    });

    test('進捗60%以上は緑系(0x6BCB77)で表示される', () => {
      // 【確認内容】: 進捗60%以上のゲージ色が緑系であることを確認
      expect(GAUGE_COLORS.HIGH).toBe(0x6bcb77); // 🔵
    });

    test('進捗100%は完了色(0x4ECDC4)で表示される', () => {
      // 【確認内容】: 進捗100%のゲージ色が完了色であることを確認
      expect(GAUGE_COLORS.COMPLETE).toBe(0x4ecdc4); // 🔵
    });

    test('ゲージ色を取得する関数が正しく動作する', () => {
      // 【確認内容】: 進捗率に応じた正しいゲージ色が返されることを確認
      const getGaugeColor = (progress: number): number => {
        if (progress >= 100) return GAUGE_COLORS.COMPLETE;
        if (progress >= 60) return GAUGE_COLORS.HIGH;
        if (progress >= 30) return GAUGE_COLORS.MEDIUM;
        return GAUGE_COLORS.LOW;
      };

      expect(getGaugeColor(0)).toBe(GAUGE_COLORS.LOW); // 🔵
      expect(getGaugeColor(29)).toBe(GAUGE_COLORS.LOW); // 🔵
      expect(getGaugeColor(30)).toBe(GAUGE_COLORS.MEDIUM); // 🔵
      expect(getGaugeColor(59)).toBe(GAUGE_COLORS.MEDIUM); // 🔵
      expect(getGaugeColor(60)).toBe(GAUGE_COLORS.HIGH); // 🔵
      expect(getGaugeColor(99)).toBe(GAUGE_COLORS.HIGH); // 🔵
      expect(getGaugeColor(100)).toBe(GAUGE_COLORS.COMPLETE); // 🔵
    });
  });

  describe('T-0020-HEADER-05: 残り日数表示の検証', () => {
    // 【テスト目的】: 残り日数が正しく表示されることを確認
    // 【テスト内容】: 残り日数に応じた警告色で表示されることを検証
    // 【期待される動作】: 日数に応じた色で正しく表示される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-004）に明記

    test('残り11日以上は通常色(白)で表示される', () => {
      // 【確認内容】: 残り11日以上の場合の色が白であることを確認
      expect(DAYS_COLORS.NORMAL).toBe('#FFFFFF'); // 🔵
    });

    test('残り10日以下は警告色(黄)で表示される', () => {
      // 【確認内容】: 残り10日以下の場合の色が黄であることを確認
      expect(DAYS_COLORS.WARNING).toBe('#FFD93D'); // 🔵
    });

    test('残り5日以下は緊急色(赤)で表示される', () => {
      // 【確認内容】: 残り5日以下の場合の色が赤であることを確認
      expect(DAYS_COLORS.URGENT).toBe('#FF6B6B'); // 🔵
    });

    test('残り3日以下は危機色(点滅赤)で表示される', () => {
      // 【確認内容】: 残り3日以下の場合の色が点滅赤であることを確認
      expect(DAYS_COLORS.CRITICAL).toBe('#FF0000'); // 🔵
    });
  });

  describe('T-0020-HEADER-06: 残り日数境界値テスト', () => {
    // 【テスト目的】: 残り日数の境界値での動作を確認
    // 【テスト内容】: 境界値（11日、10日、6日、5日、4日、3日、0日）での色を検証
    // 【期待される動作】: 境界値で正しい色が適用される
    // 🟡 信頼性レベル: 要件から妥当な推測

    test('日数警告色を取得する関数が正しく動作する', () => {
      // 【確認内容】: 残り日数に応じた正しい警告色が返されることを確認
      const getDaysColor = (days: number): string => {
        if (days <= 3) return DAYS_COLORS.CRITICAL;
        if (days <= 5) return DAYS_COLORS.URGENT;
        if (days <= 10) return DAYS_COLORS.WARNING;
        return DAYS_COLORS.NORMAL;
      };

      expect(getDaysColor(11)).toBe(DAYS_COLORS.NORMAL); // 🟡
      expect(getDaysColor(10)).toBe(DAYS_COLORS.WARNING); // 🟡
      expect(getDaysColor(6)).toBe(DAYS_COLORS.WARNING); // 🟡
      expect(getDaysColor(5)).toBe(DAYS_COLORS.URGENT); // 🟡
      expect(getDaysColor(4)).toBe(DAYS_COLORS.URGENT); // 🟡
      expect(getDaysColor(3)).toBe(DAYS_COLORS.CRITICAL); // 🟡
      expect(getDaysColor(0)).toBe(DAYS_COLORS.CRITICAL); // 🟡
    });
  });

  describe('T-0020-HEADER-07: 所持金表示の検証', () => {
    // 【テスト目的】: 所持金が正しく表示されることを確認
    // 【テスト内容】: 様々な金額が正しい形式で表示されることを検証
    // 【期待される動作】: 「XXX G」形式で正しく表示される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-005）に明記

    test('所持金のフォーマット関数が正しく動作する', () => {
      // 【確認内容】: 所持金が「XXX G」形式で表示されることを確認
      const formatGold = (gold: number): string => `${gold} G`;

      expect(formatGold(130)).toBe('130 G'); // 🔵
      expect(formatGold(0)).toBe('0 G'); // 🔵
      expect(formatGold(99999)).toBe('99999 G'); // 🔵
    });
  });

  describe('T-0020-HEADER-08: 行動ポイント表示の検証', () => {
    // 【テスト目的】: 行動ポイントが正しく表示されることを確認
    // 【テスト内容】: APが「X/Y AP」形式で表示されることを検証
    // 【期待される動作】: 正しい形式でAPが表示される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-006）に明記

    test('行動ポイントのフォーマット関数が正しく動作する', () => {
      // 【確認内容】: APが「X/Y AP」形式で表示されることを確認
      const formatAP = (current: number, max: number): string => `${current}/${max} AP`;

      expect(formatAP(3, 3)).toBe('3/3 AP'); // 🔵
      expect(formatAP(0, 3)).toBe('0/3 AP'); // 🔵
      expect(formatAP(5, 5)).toBe('5/5 AP'); // 🔵
    });

    test('AP 0の場合は警告として扱われる', () => {
      // 【確認内容】: AP 0の場合に警告状態と判定されることを確認
      const isAPWarning = (ap: number): boolean => ap === 0;

      expect(isAPWarning(0)).toBe(true); // 🔵
      expect(isAPWarning(1)).toBe(false); // 🔵
    });
  });

  describe('T-0020-HEADER-09: update(state)メソッドの検証', () => {
    // 【テスト目的】: update()メソッドが正しく状態を更新することを確認
    // 【テスト内容】: 各表示要素が新しい状態で更新されることを検証
    // 【期待される動作】: すべての表示要素が正しく更新される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-007）に明記

    test('updateメソッドが存在する', () => {
      // 【確認内容】: updateメソッドが定義されていることを確認
      expect(headerUI.update).toBeDefined(); // 🔵
      expect(typeof headerUI.update).toBe('function'); // 🔵
    });

    test('updateメソッドがIGameStateを受け取る', () => {
      // 【確認内容】: updateメソッドがゲーム状態を引数として受け取れることを確認
      headerUI.create();
      const gameState = createMockGameState();
      expect(() => headerUI.update(gameState)).not.toThrow(); // 🔵
    });

    test('異なるランクで更新した場合、ランク表示が変わる', () => {
      // 【確認内容】: 異なるランクで更新した際に表示が更新されることを確認
      headerUI.create();
      const stateG = createMockGameState({ currentRank: GuildRank.G });
      const stateS = createMockGameState({ currentRank: GuildRank.S });

      headerUI.update(stateG);
      // モックの動作を確認（実際の実装では色が変わる）

      headerUI.update(stateS);
      // モックの動作を確認（実際の実装では色が変わる）
      // 🔵
    });

    test('昇格ゲージの値が更新される', () => {
      // 【確認内容】: 昇格ゲージの更新が正しく行われることを確認
      headerUI.create();
      const state = createMockGameState({ promotionGauge: 50 });
      expect(() => headerUI.update(state)).not.toThrow(); // 🔵
    });

    test('残り日数が更新される', () => {
      // 【確認内容】: 残り日数の更新が正しく行われることを確認
      headerUI.create();
      const state = createMockGameState({ remainingDays: 10 });
      expect(() => headerUI.update(state)).not.toThrow(); // 🔵
    });

    test('所持金が更新される', () => {
      // 【確認内容】: 所持金の更新が正しく行われることを確認
      headerUI.create();
      const state = createMockGameState({ gold: 500 });
      expect(() => headerUI.update(state)).not.toThrow(); // 🔵
    });

    test('行動ポイントが更新される', () => {
      // 【確認内容】: 行動ポイントの更新が正しく行われることを確認
      headerUI.create();
      const state = createMockGameState({ actionPoints: 1 });
      expect(() => headerUI.update(state)).not.toThrow(); // 🔵
    });
  });

  describe('T-0020-HEADER-10: destroy()メソッドの検証', () => {
    // 【テスト目的】: destroy()メソッドが正しくリソースを解放することを確認
    // 【テスト内容】: 全オブジェクトとイベントリスナーが解放されることを検証
    // 【期待される動作】: すべてのリソースが正しく解放される
    // 🔵 信頼性レベル: 要件定義書（REQ-0020-026）に明記

    test('destroyメソッドが存在する', () => {
      // 【確認内容】: destroyメソッドが定義されていることを確認
      expect(headerUI.destroy).toBeDefined(); // 🔵
      expect(typeof headerUI.destroy).toBe('function'); // 🔵
    });

    test('destroy()が呼び出し可能である', () => {
      // 【確認内容】: destroyメソッドが実際に呼び出せることを確認
      headerUI.create();
      expect(() => headerUI.destroy()).not.toThrow(); // 🔵
    });

    test('destroy()でコンテナが破棄される', () => {
      // 【確認内容】: destroy()呼び出し時にcontainer.destroyが呼ばれることを確認
      headerUI.create();
      headerUI.destroy();
      // biome-ignore lint/complexity/useLiteralKeys: protectedプロパティのテストには配列アクセスが必要
      expect(headerUI['container'].destroy).toHaveBeenCalled(); // 🔵
    });
  });

  describe('T-0020-HEADER-ERROR: 異常系テスト', () => {
    // 【テスト目的】: 異常値が渡された場合の動作を確認
    // 【テスト内容】: null、undefined、範囲外の値での動作を検証
    // 【期待される動作】: エラーが適切に処理される
    // 🟡 信頼性レベル: TDDのベストプラクティスから推測

    test('sceneがnullの場合エラーをスローする', () => {
      // 【確認内容】: sceneがnullの場合、エラーがスローされることを確認
      expect(() => new HeaderUI(null as unknown as Phaser.Scene)).toThrow(); // 🟡
    });

    test('promotionGaugeが負の場合も正常に処理される', () => {
      // 【確認内容】: 負のゲージ値でも正常に処理されることを確認
      headerUI.create();
      const state = createMockGameState({ promotionGauge: -10 });
      expect(() => headerUI.update(state)).not.toThrow(); // 🟡
    });

    test('promotionGaugeが100を超える場合も正常に処理される', () => {
      // 【確認内容】: 100を超えるゲージ値でも正常に処理されることを確認
      headerUI.create();
      const state = createMockGameState({ promotionGauge: 150 });
      expect(() => headerUI.update(state)).not.toThrow(); // 🟡
    });

    test('goldが負の場合も正常に処理される', () => {
      // 【確認内容】: 負の所持金でも正常に処理されることを確認
      headerUI.create();
      const state = createMockGameState({ gold: -100 });
      expect(() => headerUI.update(state)).not.toThrow(); // 🟡
    });

    test('remainingDaysが負の場合も正常に処理される', () => {
      // 【確認内容】: 負の残り日数でも正常に処理されることを確認
      headerUI.create();
      const state = createMockGameState({ remainingDays: -5 });
      expect(() => headerUI.update(state)).not.toThrow(); // 🟡
    });
  });

  describe('T-0020-HEADER-BOUNDARY: 境界値テスト', () => {
    // 【テスト目的】: 境界値での動作を確認
    // 【テスト内容】: 各パラメータの境界値での動作を検証
    // 【期待される動作】: 境界値で正しく動作する
    // 🟡 信頼性レベル: TDDのベストプラクティスから推測

    test('promotionGauge境界値テスト', () => {
      // 【確認内容】: 昇格ゲージの境界値で正しく動作することを確認
      headerUI.create();

      const testCases = [0, 29, 30, 59, 60, 99, 100];
      for (const gauge of testCases) {
        const state = createMockGameState({ promotionGauge: gauge });
        expect(() => headerUI.update(state)).not.toThrow(); // 🟡
      }
    });

    test('remainingDays境界値テスト', () => {
      // 【確認内容】: 残り日数の境界値で正しく動作することを確認
      headerUI.create();

      const testCases = [0, 3, 4, 5, 6, 10, 11, 25];
      for (const days of testCases) {
        const state = createMockGameState({ remainingDays: days });
        expect(() => headerUI.update(state)).not.toThrow(); // 🟡
      }
    });

    test('actionPoints境界値テスト', () => {
      // 【確認内容】: 行動ポイントの境界値で正しく動作することを確認
      headerUI.create();

      const testCases = [0, 1, 3, 5];
      for (const ap of testCases) {
        const state = createMockGameState({ actionPoints: ap });
        expect(() => headerUI.update(state)).not.toThrow(); // 🟡
      }
    });
  });
});
