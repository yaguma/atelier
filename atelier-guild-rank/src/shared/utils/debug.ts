/**
 * debug.ts - デバッグツール
 *
 * TASK-0030: E2Eテスト・デバッグ
 * 開発環境でのみ有効なデバッグユーティリティを提供する
 *
 * @module debug
 */

import type { IStateManager } from '@application/services/state-manager.interface';
import { Container, ServiceKeys } from '@infrastructure/di/container';
import { GuildRank } from '@shared/types';
import type Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/** 有効なギルドランクの配列（バリデーション用） */
const VALID_RANKS: readonly GuildRank[] = Object.values(GuildRank);

/** セーブデータのlocalStorageキー */
const SAVE_DATA_KEY = 'atelier-guild-rank-save';

/** 日数の最小値 */
const MIN_DAY = 1;

/** 行動ポイントの最小値 */
const MIN_ACTION_POINTS = 0;

// =============================================================================
// エラーメッセージ
// =============================================================================

/**
 * エラーメッセージ生成用のヘルパー関数
 */
const ErrorMessages = {
  /** 無効なランクエラー */
  invalidRank: (rank: GuildRank): string =>
    `無効なランク値です: ${rank}。有効なランク: ${VALID_RANKS.join(', ')}`,

  /** 無効な日数エラー */
  invalidDay: (day: number): string =>
    `無効な日数です: ${day}。日数は${MIN_DAY}以上を指定してください。`,

  /** 無効な行動ポイントエラー */
  invalidActionPoints: (points: number): string =>
    `無効な行動ポイントです: ${points}。行動ポイントは${MIN_ACTION_POINTS}以上を指定してください。`,
} as const;

/**
 * 【機能概要】: デバッグツールクラス
 * 【実装方針】: 開発環境でのみ使用するスタティックメソッド群を提供
 * 【責務】: ゲーム状態の操作とデバッグ情報の出力
 *
 * @description
 * 本番環境では window.debug に登録されないため、利用できない
 *
 * @example
 * ```typescript
 * // 開発環境でのみ利用可能
 * window.debug?.setRank(GuildRank.S);
 * window.debug?.addGold(1000);
 * window.debug?.skipToDay(1);
 * window.debug?.logState();
 * ```
 */
// biome-ignore lint/complexity/noStaticOnlyClass: デバッグツールはスタティックメソッドのみで構成され、window.debugとして公開するため
export class DebugTools {
  /**
   * 【機能概要】: StateManagerを取得する
   * 【実装方針】: DIコンテナ経由でStateManagerを解決
   * 【エラーハンドリング】: サービス未登録の場合はエラー
   *
   * @returns StateManagerインスタンス
   */
  private static getStateManager(): IStateManager {
    const container = Container.getInstance();
    return container.resolve<IStateManager>(ServiceKeys.StateManager);
  }

  /**
   * 【機能概要】: ギルドランクを即時変更する
   * 【実装方針】: StateManagerのupdateStateを使用
   * 【入力値検証】: 有効なランク値のみ受け付ける
   *
   * @param rank 設定するギルドランク
   * @throws 無効なランク値の場合
   *
   * @example
   * ```typescript
   * DebugTools.setRank(GuildRank.S); // Sランクに変更
   * DebugTools.setRank(GuildRank.G); // Gランクに変更
   * ```
   */
  static setRank(rank: GuildRank): void {
    if (!VALID_RANKS.includes(rank)) {
      throw new Error(ErrorMessages.invalidRank(rank));
    }

    const stateManager = DebugTools.getStateManager();
    stateManager.updateState({
      currentRank: rank,
    });
  }

  /**
   * 【機能概要】: ゴールドを追加する
   * 【実装方針】: 現在の所持金に加算（負の値で減算）
   * 【制約】: 結果が0未満にならないよう下限を設定
   *
   * @param amount 追加量（負の値で減少）
   *
   * @example
   * ```typescript
   * DebugTools.addGold(1000);  // 1000ゴールド追加
   * DebugTools.addGold(-500);  // 500ゴールド減少
   * ```
   */
  static addGold(amount: number): void {
    const stateManager = DebugTools.getStateManager();
    const currentState = stateManager.getState();
    const newGold = Math.max(0, currentState.gold + amount);

    stateManager.updateState({
      gold: newGold,
    });
  }

  /**
   * 【機能概要】: 指定日数にスキップする
   * 【実装方針】: remainingDaysを直接設定
   * 【入力値検証】: 1以上の値のみ受け付ける
   *
   * @param day 設定する残り日数（1-30）
   * @throws 無効な日数の場合
   *
   * @example
   * ```typescript
   * DebugTools.skipToDay(1);   // 残り1日に設定
   * DebugTools.skipToDay(30);  // 残り30日に設定
   * ```
   */
  static skipToDay(day: number): void {
    if (day < MIN_DAY) {
      throw new Error(ErrorMessages.invalidDay(day));
    }

    const stateManager = DebugTools.getStateManager();
    stateManager.updateState({
      remainingDays: day,
    });
  }

  /**
   * 【機能概要】: 全カードを解放する
   * 【実装方針】: デッキ状態を更新して全カードを所有状態にする
   * 【注意】: この機能はマスターデータから全カードIDを取得する必要があるため、
   *          現在は状態更新のみ実行
   *
   * @example
   * ```typescript
   * DebugTools.unlockAllCards(); // 全カード解放
   * ```
   */
  static unlockAllCards(): void {
    const stateManager = DebugTools.getStateManager();
    // デッキ状態の更新をトリガー
    // 実際のカード解放ロジックはDeckServiceとの連携が必要
    stateManager.updateState({});
  }

  /**
   * 【機能概要】: 現在のゲーム状態をコンソールに出力する
   * 【実装方針】: console.logでJSON形式で出力
   *
   * @example
   * ```typescript
   * DebugTools.logState(); // 状態をコンソールに出力
   * ```
   */
  static logState(): void {
    const stateManager = DebugTools.getStateManager();
    const state = stateManager.getState();

    console.log('=== Current Game State ===');
    console.log(JSON.stringify(state, null, 2));
    console.log(`currentRank: ${state.currentRank}`);
    console.log(`remainingDays: ${state.remainingDays}`);
    console.log(`gold: ${state.gold}`);
    console.log(`actionPoints: ${state.actionPoints}`);
    console.log('========================');
  }

  /**
   * 【機能概要】: 行動ポイントを設定する
   * 【実装方針】: actionPointsを直接設定
   * 【入力値検証】: 0以上の値のみ受け付ける
   *
   * @param points 設定する行動ポイント（0以上）
   * @throws 無効な行動ポイントの場合
   *
   * @example
   * ```typescript
   * DebugTools.setActionPoints(10); // 行動ポイントを10に設定
   * DebugTools.setActionPoints(0);  // 行動ポイントを0に設定
   * ```
   */
  static setActionPoints(points: number): void {
    if (points < MIN_ACTION_POINTS) {
      throw new Error(ErrorMessages.invalidActionPoints(points));
    }

    const stateManager = DebugTools.getStateManager();
    stateManager.updateState({
      actionPoints: points,
    });
  }

  /**
   * 【機能概要】: セーブデータを削除する
   * 【実装方針】: localStorageから該当キーを削除
   *
   * @example
   * ```typescript
   * DebugTools.clearSaveData(); // セーブデータを削除
   * ```
   */
  static clearSaveData(): void {
    localStorage.removeItem(SAVE_DATA_KEY);
  }

  // =============================================================================
  // E2Eテスト用UIインタラクションメソッド
  // =============================================================================

  /**
   * 【機能概要】: 新規ゲームを開始する（E2Eテスト用）
   * 【実装方針】: セーブデータを削除し、MainSceneへ遷移する
   * 【用途】: E2Eテストでタイトル画面から新規ゲームを開始する
   *
   * @example
   * ```typescript
   * window.debug?.clickNewGame(); // 新規ゲーム開始
   * ```
   */
  static clickNewGame(): void {
    // セーブデータを削除
    localStorage.removeItem(SAVE_DATA_KEY);

    // Phaserゲームインスタンス経由でシーン遷移
    const game = (globalThis as unknown as { game?: Phaser.Game }).game;
    if (game?.scene) {
      // TitleSceneを停止してMainSceneを開始（isNewGame: trueで状態リセット）
      game.scene.stop('TitleScene');
      game.scene.start('MainScene', { isNewGame: true });
    }
  }

  /**
   * 【機能概要】: コンティニューを実行する（E2Eテスト用）
   * 【実装方針】: セーブデータを読み込んでMainSceneへ遷移する
   * 【用途】: E2Eテストでタイトル画面からコンティニューを実行する
   *
   * @example
   * ```typescript
   * window.debug?.clickContinue(); // コンティニュー
   * ```
   */
  static clickContinue(): void {
    const saveData = localStorage.getItem(SAVE_DATA_KEY);
    if (!saveData) {
      console.warn('No save data found for continue');
      return;
    }

    // Phaserゲームインスタンス経由でシーン遷移
    const game = (globalThis as unknown as { game?: Phaser.Game }).game;
    if (game?.scene) {
      // TitleSceneを停止してMainSceneを開始
      game.scene.stop('TitleScene');
      game.scene.start('MainScene', { saveData: JSON.parse(saveData) });
    }
  }

  /**
   * 【機能概要】: タイトル画面に戻る（E2Eテスト用）
   * 【実装方針】: TitleSceneへ遷移する
   * 【用途】: E2Eテストでゲーム中からタイトル画面に戻る
   *
   * @example
   * ```typescript
   * window.debug?.returnToTitle(); // タイトルに戻る
   * ```
   */
  static returnToTitle(): void {
    const game = (globalThis as unknown as { game?: Phaser.Game }).game;
    if (game?.scene) {
      // 現在アクティブな全シーンを停止してTitleSceneを開始
      for (const scene of game.scene.scenes) {
        if (scene.sys.isActive() && scene.sys.settings.key !== 'TitleScene') {
          game.scene.stop(scene.sys.settings.key);
        }
      }
      game.scene.start('TitleScene');
    }
  }

  /**
   * 【機能概要】: 現在のフェーズをスキップする（E2Eテスト用）
   * 【実装方針】: GameFlowManager経由でフェーズを進める
   * 【用途】: E2Eテストでフェーズを素早く進める
   *
   * @example
   * ```typescript
   * window.debug?.skipPhase(); // フェーズをスキップ
   * ```
   */
  static skipPhase(): void {
    try {
      const container = Container.getInstance();
      if (container.has(ServiceKeys.GameFlowManager)) {
        const gameFlowManager = container.resolve<{ skipPhase: () => void }>(
          ServiceKeys.GameFlowManager,
        );
        gameFlowManager.skipPhase();
      }
    } catch (e) {
      console.warn('skipPhase failed:', e);
    }
  }

  /**
   * 【機能概要】: 「次へ」ボタンをクリックする（E2Eテスト用）
   * 【実装方針】: GameFlowManager経由でフェーズを終了する
   * 【用途】: E2Eテストで「次へ」ボタンクリックをシミュレート
   * 【注意】: UIの「次へ」ボタンと同等の動作（endPhase()を呼び出す）
   *
   * @example
   * ```typescript
   * window.debug?.clickNextButton(); // 「次へ」ボタンクリック
   * ```
   */
  static clickNextButton(): void {
    try {
      const container = Container.getInstance();
      if (container.has(ServiceKeys.GameFlowManager)) {
        const gameFlowManager = container.resolve<{ endPhase: () => void }>(
          ServiceKeys.GameFlowManager,
        );
        gameFlowManager.endPhase();
      }
    } catch (e) {
      console.warn('clickNextButton failed:', e);
    }
  }

  /**
   * 【機能概要】: 日を終了する（E2Eテスト用）
   * 【実装方針】: StateManager経由で日を進め、ゲーム終了条件をチェックしてシーン遷移
   * 【用途】: E2Eテストで日数を進める
   *
   * @example
   * ```typescript
   * window.debug?.endDay(); // 日を終了
   * ```
   */
  static endDay(): void {
    try {
      const stateManager = DebugTools.getStateManager();
      const stateBefore = stateManager.getState();

      // Sランク到達でゲームクリア
      if (stateBefore.currentRank === GuildRank.S) {
        DebugTools.transitionToGameClear(stateBefore);
        return;
      }

      // 日を進める
      stateManager.advanceDay();
      const stateAfter = stateManager.getState();

      // 残り日数0でゲームオーバー（Sランク未到達の場合）
      if (stateAfter.remainingDays <= 0) {
        DebugTools.transitionToGameOver(stateAfter);
        return;
      }
    } catch (e) {
      console.warn('endDay failed:', e);
    }
  }

  /**
   * 【機能概要】: ゲームクリアシーンへ遷移する
   * 【実装方針】: 現在アクティブなシーンからシーン遷移し、統計情報を渡す
   *
   * @param state 現在のゲーム状態
   */
  private static transitionToGameClear(state: {
    remainingDays: number;
    gold: number;
    currentRank: string;
  }): void {
    const game = (globalThis as unknown as { game?: Phaser.Game }).game;
    if (game?.scene) {
      const stats = {
        finalRank: state.currentRank,
        totalDays: 30 - state.remainingDays,
        totalDeliveries: 0, // TODO: 実際の納品数をStateから取得
        totalGold: state.gold,
      };
      // MainSceneを停止してGameClearSceneを開始
      game.scene.stop('MainScene');
      game.scene.start('GameClearScene', { stats });
    }
  }

  /**
   * 【機能概要】: ゲームオーバーシーンへ遷移する
   * 【実装方針】: 現在アクティブなシーンからシーン遷移し、統計情報を渡す
   *
   * @param state 現在のゲーム状態
   */
  private static transitionToGameOver(state: {
    remainingDays: number;
    gold: number;
    currentRank: string;
  }): void {
    const game = (globalThis as unknown as { game?: Phaser.Game }).game;
    if (game?.scene) {
      const stats = {
        finalRank: state.currentRank,
        totalDays: 30 - state.remainingDays,
        totalDeliveries: 0, // TODO: 実際の納品数をStateから取得
        totalGold: state.gold,
      };
      // MainSceneを停止してGameOverSceneを開始
      game.scene.stop('MainScene');
      game.scene.start('GameOverScene', { stats });
    }
  }
}

/**
 * E2Eテスト用のグローバル型定義
 *
 * window.game, window.gameState, window.debug を提供する
 */
declare global {
  interface Window {
    /** Phaserゲームインスタンス（main.tsで設定） */
    game?: Phaser.Game;
    /** デバッグツール（開発環境のみ、main.tsで設定） */
    debug?: typeof DebugTools;
    /**
     * 現在のゲーム状態を取得する関数（E2Eテスト用、main.tsで設定）
     *
     * StateManagerが初期化されている場合はゲーム状態を含む、
     * されていない場合はシーン情報のみを返す
     */
    gameState?: () => {
      currentScene?: string;
      currentPhase?: string;
      remainingDays?: number;
      gold?: number;
      currentRank?: string;
      actionPoints?: number;
      hasSaveData?: boolean;
      isGameClear?: boolean;
      isGameOver?: boolean;
    };
  }
}
