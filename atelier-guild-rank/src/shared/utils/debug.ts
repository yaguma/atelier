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
}

/**
 * window.debug型定義のための拡張
 */
declare global {
  interface Window {
    debug?: typeof DebugTools;
    gameState?: () => ReturnType<IStateManager['getState']>;
  }
}
