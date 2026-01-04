/**
 * ゲーム再開ユースケース
 * TASK-0105: ゲーム再開ユースケース
 *
 * セーブデータからゲームを再開する処理を担当するユースケース
 */

import { StateManager } from '@application/StateManager';
import { GameFlowManager } from '@application/GameFlowManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import { ISaveDataRepository } from '@infrastructure/repository/ISaveDataRepository';
import { ISaveData } from '@domain/save/SaveData';
import { GamePhase, GuildRank } from '@domain/common/types';
import { createPlayerState } from '@domain/player/PlayerState';
import { createGameState } from '@domain/game/GameState';

/**
 * ゲーム再開実行結果
 */
export interface ContinueGameResult {
  /** 成功したかどうか */
  success: boolean;
  /** エラータイプ */
  error?: 'NO_SAVE_DATA' | 'INVALID_VERSION' | 'CORRUPTED_DATA';
}

/**
 * ゲーム再開ユースケースインターフェース
 */
export interface ContinueGameUseCase {
  /**
   * ゲームを再開する
   * @returns 実行結果
   */
  execute(): Promise<ContinueGameResult>;
}

/**
 * ゲーム再開ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param gameFlowManager ゲームフローマネージャー
 * @param saveRepository セーブデータリポジトリ
 * @param eventBus イベントバス
 * @returns ゲーム再開ユースケース
 */
export function createContinueGameUseCase(
  stateManager: StateManager,
  gameFlowManager: GameFlowManager,
  saveRepository: ISaveDataRepository,
  eventBus: EventBus
): ContinueGameUseCase {
  return {
    async execute(): Promise<ContinueGameResult> {
      // セーブデータの存在確認
      if (!saveRepository.exists()) {
        return {
          success: false,
          error: 'NO_SAVE_DATA',
        };
      }

      // セーブデータを読み込み
      const saveData = saveRepository.load();
      if (!saveData) {
        return {
          success: false,
          error: 'NO_SAVE_DATA',
        };
      }

      // ゲーム状態を復元
      const gameState = createGameState({
        currentDay: saveData.gameState.currentDay,
        currentPhase: saveData.gameState.currentPhase,
        isInPromotionTest: saveData.gameState.isPromotionTest,
        promotionTestDaysRemaining: saveData.gameState.promotionTestRemainingDays,
      });
      stateManager.updateGameState(gameState);

      // プレイヤー状態を復元
      const playerState = createPlayerState({
        rank: saveData.gameState.currentRank,
        gold: saveData.gameState.gold,
        promotionGauge: saveData.gameState.promotionGauge,
        promotionGaugeMax: saveData.gameState.requiredContribution,
        rankDaysRemaining: saveData.gameState.remainingDays,
        actionPoints: saveData.gameState.actionPoints,
        artifacts: saveData.artifacts || [],
      });
      stateManager.updatePlayerState(playerState);

      // デッキ状態を復元（簡易実装）
      // TODO: 実際のカードオブジェクトに変換する処理が必要
      stateManager.updateDeckState({
        cards: [],
        hand: [],
        discardPile: [],
      });

      // インベントリ状態を復元
      stateManager.updateInventoryState({
        materials: saveData.inventoryState.materials.map((m) => ({
          materialId: m.materialId,
          quality: m.quality as 'S' | 'A' | 'B' | 'C',
          quantity: m.quantity,
        })),
        items: [],
      });

      // クエスト状態を復元
      stateManager.updateQuestState({
        activeQuests: saveData.questState.activeQuests.map((q) => ({
          questId: q.questId,
          remainingDays: q.remainingDays,
          acceptedDay: q.acceptedDay,
        })),
        availableQuests: [],
      });

      // ゲーム再開イベントを発行
      eventBus.publish({
        type: GameEventType.GAME_CONTINUED,
        payload: {},
      });

      return {
        success: true,
      };
    },
  };
}
