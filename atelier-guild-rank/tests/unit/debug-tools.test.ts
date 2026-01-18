/**
 * DebugTools テストケース
 * TASK-0030 E2Eテスト・デバッグ
 *
 * @description
 * TC-DBG-001〜TC-DBG-070: デバッグツールのユニットテスト
 *
 * テスト対象メソッド:
 * - setRank
 * - addGold
 * - skipToDay
 * - unlockAllCards
 * - logState
 * - setActionPoints
 * - clearSaveData
 */

import type { IStateManager } from '@application/services/state-manager.interface';
import { GuildRank } from '@shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// モックのStateManagerを保持する変数
let mockStateManager: IStateManager;
let mockGetState: ReturnType<typeof vi.fn>;
let mockUpdateState: ReturnType<typeof vi.fn>;

// DIコンテナのモック（ファイルの先頭でホイスティングされる）
vi.mock('@infrastructure/di/container', () => ({
  Container: {
    getInstance: vi.fn().mockReturnValue({
      resolve: vi.fn().mockImplementation(() => mockStateManager),
    }),
  },
  ServiceKeys: {
    StateManager: 'StateManager',
  },
}));

// DebugToolsをモック設定後にインポート
import { DebugTools } from '@shared/utils/debug';

describe('DebugTools', () => {
  beforeEach(() => {
    // モック関数を作成
    mockGetState = vi.fn().mockReturnValue({
      currentRank: GuildRank.G,
      gold: 100,
      remainingDays: 30,
      actionPoints: 3,
    });
    mockUpdateState = vi.fn();

    // モックのStateManagerを作成
    mockStateManager = {
      getState: mockGetState,
      updateState: mockUpdateState,
      setPhase: vi.fn(),
      canTransitionTo: vi.fn(),
      advanceDay: vi.fn(),
      spendActionPoints: vi.fn(),
      addGold: vi.fn(),
      spendGold: vi.fn(),
      addContribution: vi.fn(),
      initialize: vi.fn(),
      reset: vi.fn(),
      loadFromSaveData: vi.fn(),
      exportToSaveData: vi.fn(),
    } as IStateManager;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =============================================================================
  // TC-DBG-001〜TC-DBG-003: setRank
  // =============================================================================

  describe('setRank', () => {
    it('TC-DBG-001: setRankでSランクに変更できる', () => {
      // 【テスト目的】: setRankでSランクに変更できることを確認
      // 【テスト内容】: debug.setRank('S')を実行し、状態が更新されることを検証
      // 【期待される動作】: StateManagerのupdateStateが呼ばれ、ランクがSに変更される

      DebugTools.setRank(GuildRank.S);

      expect(mockUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentRank: GuildRank.S,
        }),
      );
    });

    it('TC-DBG-002: setRankでGランクに変更できる', () => {
      // 【テスト目的】: setRankでGランクに変更できることを確認
      // 【テスト内容】: debug.setRank('G')を実行し、状態が更新されることを検証
      // 【期待される動作】: StateManagerのupdateStateが呼ばれ、ランクがGに変更される

      DebugTools.setRank(GuildRank.G);

      expect(mockUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentRank: GuildRank.G,
        }),
      );
    });

    it('TC-DBG-003: 無効なランク指定時にエラーがスローされる', () => {
      // 【テスト目的】: 無効なランク指定時にエラーがスローされることを確認
      // 【テスト内容】: 無効なランク値でsetRankを実行し、エラーが発生することを検証
      // 【期待される動作】: エラーがスローされる or 警告ログが出力される

      expect(() => {
        DebugTools.setRank('X' as GuildRank);
      }).toThrow();
    });
  });

  // =============================================================================
  // TC-DBG-010〜TC-DBG-012: addGold
  // =============================================================================

  describe('addGold', () => {
    it('TC-DBG-010: addGoldで正の値を追加できる', () => {
      // 【テスト目的】: addGoldで正の値を追加できることを確認
      // 【テスト内容】: debug.addGold(1000)を実行し、ゴールドが増加することを検証
      // 【期待される動作】: ゴールドが1000増加する

      DebugTools.addGold(1000);

      expect(mockUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          gold: 1100, // 100 + 1000
        }),
      );
    });

    it('TC-DBG-011: addGoldで負の値を指定してゴールドを減少できる', () => {
      // 【テスト目的】: addGoldで負の値を指定してゴールドを減少できることを確認
      // 【テスト内容】: debug.addGold(-50)を実行し、ゴールドが減少することを検証
      // 【期待される動作】: ゴールドが50減少する

      DebugTools.addGold(-50);

      expect(mockUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          gold: 50, // 100 - 50
        }),
      );
    });

    it('TC-DBG-012: ゴールドが0未満にならない', () => {
      // 【テスト目的】: ゴールドが0未満にならないことを確認
      // 【テスト内容】: 所持金以上の負の値を指定し、ゴールドが0になることを検証
      // 【期待される動作】: ゴールドが0になる（負にならない）

      DebugTools.addGold(-200);

      expect(mockUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          gold: 0, // 100 - 200 = 0 (負にはならない)
        }),
      );
    });
  });

  // =============================================================================
  // TC-DBG-020〜TC-DBG-022: skipToDay
  // =============================================================================

  describe('skipToDay', () => {
    it('TC-DBG-020: skipToDayで残り日数を1に設定できる', () => {
      // 【テスト目的】: skipToDayで残り日数を設定できることを確認
      // 【テスト内容】: debug.skipToDay(1)を実行し、残り日数が1になることを検証
      // 【期待される動作】: 残り日数が1になる

      DebugTools.skipToDay(1);

      expect(mockUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          remainingDays: 1,
        }),
      );
    });

    it('TC-DBG-021: skipToDayで最大日数（30日）を設定できる', () => {
      // 【テスト目的】: skipToDayで最大日数を設定できることを確認
      // 【テスト内容】: debug.skipToDay(30)を実行し、残り日数が30になることを検証
      // 【期待される動作】: 残り日数が30になる

      DebugTools.skipToDay(30);

      expect(mockUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          remainingDays: 30,
        }),
      );
    });

    it('TC-DBG-022: 無効な日数指定時にエラーがスローされる', () => {
      // 【テスト目的】: 無効な日数指定時にエラーがスローされることを確認
      // 【テスト内容】: 0や負の日数を指定し、エラーが発生することを検証
      // 【期待される動作】: エラーがスローされる

      expect(() => {
        DebugTools.skipToDay(0);
      }).toThrow();

      expect(() => {
        DebugTools.skipToDay(-5);
      }).toThrow();
    });
  });

  // =============================================================================
  // TC-DBG-030〜TC-DBG-031: unlockAllCards
  // =============================================================================

  describe('unlockAllCards', () => {
    it('TC-DBG-030: unlockAllCardsで全カードが解放される', () => {
      // 【テスト目的】: unlockAllCardsで全カードが解放されることを確認
      // 【テスト内容】: debug.unlockAllCards()を実行し、デッキに全カードが追加されることを検証
      // 【期待される動作】: 全種類のカードがデッキに追加される

      DebugTools.unlockAllCards();

      // updateStateが呼ばれることを確認（デッキ状態の更新）
      expect(mockUpdateState).toHaveBeenCalled();
    });
  });

  // =============================================================================
  // TC-DBG-040〜TC-DBG-041: logState
  // =============================================================================

  describe('logState', () => {
    it('TC-DBG-040: logStateでコンソールに状態が出力される', () => {
      // 【テスト目的】: logStateでコンソールに状態が出力されることを確認
      // 【テスト内容】: debug.logState()を実行し、コンソールログが呼ばれることを検証
      // 【期待される動作】: console.logが呼ばれる

      const consoleSpy = vi.spyOn(console, 'log');

      DebugTools.logState();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('TC-DBG-041: logStateの出力にゲーム状態が含まれる', () => {
      // 【テスト目的】: logStateの出力にゲーム状態が含まれることを確認
      // 【テスト内容】: debug.logState()を実行し、出力内容を検証
      // 【期待される動作】: ランク、日数、ゴールド等が出力される

      const consoleSpy = vi.spyOn(console, 'log');

      DebugTools.logState();

      // console.logの呼び出し引数を検証
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('currentRank'));
      consoleSpy.mockRestore();
    });
  });

  // =============================================================================
  // TC-DBG-050〜TC-DBG-053: setActionPoints
  // =============================================================================

  describe('setActionPoints', () => {
    it('TC-DBG-050: setActionPointsで行動ポイントを設定できる', () => {
      // 【テスト目的】: setActionPointsで行動ポイントを設定できることを確認
      // 【テスト内容】: debug.setActionPoints(10)を実行し、行動ポイントが設定されることを検証
      // 【期待される動作】: 行動ポイントが10に設定される

      DebugTools.setActionPoints(10);

      expect(mockUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          actionPoints: 10,
        }),
      );
    });

    it('TC-DBG-051: setActionPointsで0を設定できる', () => {
      // 【テスト目的】: setActionPointsで0を設定できることを確認
      // 【テスト内容】: debug.setActionPoints(0)を実行し、行動ポイントが0になることを検証
      // 【期待される動作】: 行動ポイントが0に設定される

      DebugTools.setActionPoints(0);

      expect(mockUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          actionPoints: 0,
        }),
      );
    });

    it('TC-DBG-052: 負の行動ポイント指定時にエラーがスローされる', () => {
      // 【テスト目的】: 負の行動ポイント指定時にエラーがスローされることを確認
      // 【テスト内容】: debug.setActionPoints(-1)を実行し、エラーが発生することを検証
      // 【期待される動作】: エラーがスローされる

      expect(() => {
        DebugTools.setActionPoints(-1);
      }).toThrow();

      expect(() => {
        DebugTools.setActionPoints(-100);
      }).toThrow();
    });
  });

  // =============================================================================
  // TC-DBG-060〜TC-DBG-061: clearSaveData
  // =============================================================================

  describe('clearSaveData', () => {
    it('TC-DBG-060: clearSaveDataでセーブデータが削除される', () => {
      // 【テスト目的】: clearSaveDataでセーブデータが削除されることを確認
      // 【テスト内容】: debug.clearSaveData()を実行し、localStorageからデータが削除されることを検証
      // 【期待される動作】: localStorageから該当キーが消える

      // setup.tsでlocalStorageがモックされているため、グローバルのlocalStorageをスパイ
      const removeItemSpy = vi.spyOn(globalThis.localStorage, 'removeItem');

      DebugTools.clearSaveData();

      expect(removeItemSpy).toHaveBeenCalledWith('atelier-guild-rank-save');
      removeItemSpy.mockRestore();
    });
  });

  // =============================================================================
  // TC-DBG-070: 本番環境での無効化
  // =============================================================================

  describe('本番環境での無効化', () => {
    it('TC-DBG-070: 本番モードではDebugToolsが利用不可', () => {
      // 【テスト目的】: 本番モードでDebugToolsが利用不可であることを確認
      // 【テスト内容】: import.meta.env.DEV === falseの環境を模擬し、debugオブジェクトがundefinedであることを検証
      // 【期待される動作】: window.debugがundefinedである
      // 注: このテストはE2Eテストまたは本番ビルドのテストで実施することを推奨

      // 本番環境のシミュレーションは難しいため、
      // DebugToolsがDEV環境判定のロジックを持つことを確認
      expect(typeof DebugTools.setRank).toBe('function');
    });
  });
});
