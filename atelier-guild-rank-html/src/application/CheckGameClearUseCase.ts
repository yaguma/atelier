/**
 * ゲームクリア判定ユースケース
 * TASK-0115: ゲームクリア判定ユースケース
 *
 * ゲームクリア判定処理を担当するユースケース
 * Sランク到達でゲームクリア、統計記録、イベント発行を行う
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import { GuildRank } from '@domain/common/types';
import { setGameProgress, GameProgress } from '@domain/game/GameState';

/**
 * プレイ統計
 */
export interface PlayStats {
  /** 総プレイ日数 */
  totalDays: number;
  /** 最終ゴールド */
  finalGold: number;
  /** 最終ランク */
  finalRank: GuildRank;
  /** 所持アーティファクト数 */
  artifactCount: number;
}

/**
 * ゲームクリア判定結果
 */
export interface CheckGameClearResult {
  /** ゲームクリアかどうか */
  isGameClear: boolean;
  /** 既にクリア済みかどうか */
  alreadyCleared?: boolean;
  /** プレイ統計（クリア時のみ） */
  playStats?: PlayStats;
}

/**
 * ゲームクリア判定ユースケースインターフェース
 */
export interface CheckGameClearUseCase {
  /**
   * ゲームクリアを判定する
   * @returns ゲームクリア判定結果
   */
  execute(): Promise<CheckGameClearResult>;
}

/**
 * ゲームクリア判定ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @returns ゲームクリア判定ユースケース
 */
export function createCheckGameClearUseCase(
  stateManager: StateManager,
  eventBus: EventBus
): CheckGameClearUseCase {
  return {
    async execute(): Promise<CheckGameClearResult> {
      const playerState = stateManager.getPlayerState();
      let gameState = stateManager.getGameState();

      // Sランクでなければゲームクリアではない
      if (playerState.rank !== GuildRank.S) {
        return {
          isGameClear: false,
        };
      }

      // 既にクリア済みかチェック
      if (gameState.gameProgress === GameProgress.GAME_CLEAR) {
        return {
          isGameClear: true,
          alreadyCleared: true,
          playStats: {
            totalDays: gameState.currentDay,
            finalGold: playerState.gold,
            finalRank: playerState.rank,
            artifactCount: playerState.artifacts.length,
          },
        };
      }

      // ゲームクリア！
      // ゲーム進行状態を更新
      gameState = setGameProgress(gameState, GameProgress.GAME_CLEAR);
      stateManager.updateGameState(gameState);

      // プレイ統計を作成
      const playStats: PlayStats = {
        totalDays: gameState.currentDay,
        finalGold: playerState.gold,
        finalRank: playerState.rank,
        artifactCount: playerState.artifacts.length,
      };

      // ゲームクリアイベント発行
      eventBus.publish({
        type: GameEventType.GAME_CLEAR,
        payload: {},
      });

      return {
        isGameClear: true,
        playStats,
      };
    },
  };
}
