/**
 * 昇格試験判定ユースケース
 * TASK-0114: 昇格試験判定ユースケース
 *
 * 昇格試験の判定処理を担当するユースケース
 * 課題達成判定、ランクアップ、ボーナス付与、失敗時ゲームオーバーを行う
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import { GuildRank, Quality } from '@domain/common/types';
import { Rank } from '@domain/rank/RankEntity';
import { endPromotionTest, setGameProgress, GameProgress } from '@domain/game/GameState';
import { CraftedItem } from '@domain/item/ItemEntity';

/**
 * 試験要件
 */
export interface PromotionRequirement {
  itemId: string;
  quantity: number;
  minQuality?: Quality;
}

/**
 * 昇格試験判定エラー種別
 */
export type JudgePromotionTestError = 'NOT_IN_TEST';

/**
 * 試験失敗理由
 */
export type FailureReason = 'TIME_LIMIT_EXCEEDED' | 'REQUIREMENTS_NOT_MET';

/**
 * 昇格試験判定結果
 */
export interface JudgePromotionTestResult {
  /** 判定処理が成功したかどうか */
  success: boolean;
  /** 試験に合格したかどうか */
  passed?: boolean;
  /** 新しいランク（合格時） */
  newRank?: GuildRank;
  /** ボーナスゴールド（合格時） */
  bonusGold?: number;
  /** アーティファクト選択肢（合格時） */
  artifactChoices?: string[];
  /** 失敗理由（不合格時） */
  reason?: FailureReason;
  /** エラー種別 */
  error?: JudgePromotionTestError;
}

/**
 * 昇格試験判定ユースケースインターフェース
 */
export interface JudgePromotionTestUseCase {
  /**
   * 昇格試験を判定する
   * @returns 昇格試験判定結果
   */
  execute(): Promise<JudgePromotionTestResult>;
}

/**
 * ランクデータ取得関数型
 */
export type GetRankDataFn = (rank: GuildRank) => Rank;

/**
 * 試験課題取得関数型
 */
export type GetPromotionRequirementsFn = () => PromotionRequirement[];

/**
 * 次ランクマップ
 */
const NextRank: Record<GuildRank, GuildRank | null> = {
  [GuildRank.G]: GuildRank.F,
  [GuildRank.F]: GuildRank.E,
  [GuildRank.E]: GuildRank.D,
  [GuildRank.D]: GuildRank.C,
  [GuildRank.C]: GuildRank.B,
  [GuildRank.B]: GuildRank.A,
  [GuildRank.A]: GuildRank.S,
  [GuildRank.S]: null,
};

/**
 * 品質の順序（比較用）
 */
const QualityOrder: Record<Quality, number> = {
  [Quality.E]: 0,
  [Quality.D]: 1,
  [Quality.C]: 2,
  [Quality.B]: 3,
  [Quality.A]: 4,
  [Quality.S]: 5,
};

/**
 * 昇格試験判定ユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @param getRankData ランクデータ取得関数
 * @param getPromotionRequirements 試験課題取得関数
 * @param promotionBonusGold ボーナスゴールド
 * @param artifactChoices アーティファクト選択肢
 * @returns 昇格試験判定ユースケース
 */
export function createJudgePromotionTestUseCase(
  stateManager: StateManager,
  eventBus: EventBus,
  getRankData: GetRankDataFn,
  getPromotionRequirements: GetPromotionRequirementsFn,
  promotionBonusGold: number,
  artifactChoices: string[]
): JudgePromotionTestUseCase {
  return {
    async execute(): Promise<JudgePromotionTestResult> {
      let gameState = stateManager.getGameState();
      let playerState = stateManager.getPlayerState();

      // 試験中でないかチェック
      if (!gameState.isInPromotionTest) {
        return {
          success: false,
          error: 'NOT_IN_TEST',
        };
      }

      // 制限日数超過チェック
      if (gameState.promotionTestDaysRemaining !== null && gameState.promotionTestDaysRemaining <= 0) {
        // 試験失敗 - 制限日数超過
        gameState = endPromotionTest(gameState);
        gameState = setGameProgress(gameState, GameProgress.GAME_OVER);
        stateManager.updateGameState(gameState);

        // ゲームオーバーイベント発行
        eventBus.publish({
          type: GameEventType.GAME_OVER,
          payload: {
            reason: '昇格試験の制限日数を超過しました',
          },
        });

        return {
          success: true,
          passed: false,
          reason: 'TIME_LIMIT_EXCEEDED',
        };
      }

      // 課題達成判定
      const requirements = getPromotionRequirements();
      const inventoryState = stateManager.getInventoryState();
      const items = inventoryState.items as CraftedItem[];

      const requirementsMet = checkRequirements(requirements, items);

      if (!requirementsMet) {
        // まだ課題を達成していない場合は何もしない（日数経過で再度判定）
        return {
          success: true,
          passed: false,
          reason: 'REQUIREMENTS_NOT_MET',
        };
      }

      // 試験合格
      const nextRank = NextRank[playerState.rank];
      if (!nextRank) {
        // 最高ランクの場合（本来ここには来ない）
        return {
          success: false,
          error: 'NOT_IN_TEST',
        };
      }

      // ランクアップ
      playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rank: nextRank,
        gold: playerState.gold + promotionBonusGold,
      });

      // 試験終了
      gameState = stateManager.getGameState();
      gameState = endPromotionTest(gameState);
      stateManager.updateGameState(gameState);

      // ランクアップイベント発行
      eventBus.publish({
        type: GameEventType.RANK_UP,
        payload: {
          newRank: nextRank,
        },
      });

      return {
        success: true,
        passed: true,
        newRank: nextRank,
        bonusGold: promotionBonusGold,
        artifactChoices,
      };
    },
  };
}

/**
 * 課題達成をチェックする
 * @param requirements 試験課題
 * @param items インベントリのアイテム
 * @returns 課題達成しているかどうか
 */
function checkRequirements(
  requirements: PromotionRequirement[],
  items: CraftedItem[]
): boolean {
  for (const req of requirements) {
    // 該当アイテムの数をカウント（品質条件も考慮）
    const matchingItems = items.filter((item) => {
      if (item.itemId !== req.itemId) {
        return false;
      }
      if (req.minQuality) {
        const itemQualityOrder = QualityOrder[item.quality];
        const minQualityOrder = QualityOrder[req.minQuality];
        if (itemQualityOrder < minQualityOrder) {
          return false;
        }
      }
      return true;
    });

    if (matchingItems.length < req.quantity) {
      return false;
    }
  }

  return true;
}
