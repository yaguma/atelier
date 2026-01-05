/**
 * オートセーブユースケース
 * TASK-0117: オートセーブユースケース
 *
 * オートセーブ処理を担当するユースケース
 * フェーズ遷移、日数経過、ショップ購入後、昇格試験開始/終了時にセーブを行う
 */

import { StateManager } from '@application/StateManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import { ISaveDataRepository } from '@infrastructure/repository/ISaveDataRepository';
import {
  ISaveData,
  IGameState,
  IDeckState,
  IInventoryState,
  IQuestState,
  ICraftedItem,
} from '@domain/save/SaveData';
import { CraftedItem } from '@domain/item/ItemEntity';

/**
 * オートセーブトリガー
 */
export enum AutoSaveTrigger {
  /** フェーズ終了時 */
  PHASE_END = 'PHASE_END',
  /** 日数経過時 */
  DAY_ADVANCE = 'DAY_ADVANCE',
  /** ショップ購入後 */
  SHOP_PURCHASE = 'SHOP_PURCHASE',
  /** 昇格試験開始時 */
  PROMOTION_TEST_START = 'PROMOTION_TEST_START',
  /** 昇格試験終了時 */
  PROMOTION_TEST_END = 'PROMOTION_TEST_END',
}

/**
 * オートセーブエラー種別
 */
export type AutoSaveError = 'SAVE_FAILED';

/**
 * オートセーブ結果
 */
export interface AutoSaveResult {
  /** 成功したかどうか */
  success: boolean;
  /** エラー種別 */
  error?: AutoSaveError;
}

/**
 * オートセーブユースケースインターフェース
 */
export interface AutoSaveUseCase {
  /**
   * オートセーブを実行する
   * @param trigger セーブトリガー
   * @returns オートセーブ結果
   */
  execute(trigger: AutoSaveTrigger): Promise<AutoSaveResult>;
}

/** セーブデータバージョン */
const SAVE_DATA_VERSION = '1.0.0';

/**
 * オートセーブユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param eventBus イベントバス
 * @param saveDataRepository セーブデータリポジトリ
 * @returns オートセーブユースケース
 */
export function createAutoSaveUseCase(
  stateManager: StateManager,
  eventBus: EventBus,
  saveDataRepository: ISaveDataRepository
): AutoSaveUseCase {
  return {
    async execute(trigger: AutoSaveTrigger): Promise<AutoSaveResult> {
      try {
        // 現在の状態を取得
        const gameState = stateManager.getGameState();
        const playerState = stateManager.getPlayerState();
        const deckState = stateManager.getDeckState();
        const inventoryState = stateManager.getInventoryState();
        const questState = stateManager.getQuestState();

        // ISaveData形式に変換
        const saveData: ISaveData = {
          version: SAVE_DATA_VERSION,
          lastSaved: new Date().toISOString(),
          gameState: convertToSaveGameState(gameState, playerState),
          deckState: convertToSaveDeckState(deckState),
          inventoryState: convertToSaveInventoryState(inventoryState),
          questState: convertToSaveQuestState(questState),
          artifacts: [...playerState.artifacts],
        };

        // 保存
        saveDataRepository.save(saveData);

        return {
          success: true,
        };
      } catch (error) {
        // セーブエラーイベント発行
        eventBus.publish({
          type: GameEventType.SAVE_ERROR,
          payload: {
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        return {
          success: false,
          error: 'SAVE_FAILED',
        };
      }
    },
  };
}

/**
 * ゲーム状態をセーブデータ形式に変換する
 */
function convertToSaveGameState(
  gameState: ReturnType<StateManager['getGameState']>,
  playerState: ReturnType<StateManager['getPlayerState']>
): IGameState {
  return {
    currentRank: playerState.rank,
    promotionGauge: playerState.promotionGauge,
    requiredContribution: playerState.promotionGaugeMax,
    remainingDays: playerState.rankDaysRemaining,
    currentDay: gameState.currentDay,
    currentPhase: gameState.currentPhase,
    gold: playerState.gold,
    comboCount: 0, // TODO: コンボカウントの追加が必要
    actionPoints: playerState.actionPoints,
    isPromotionTest: gameState.isInPromotionTest,
    promotionTestRemainingDays: gameState.promotionTestDaysRemaining,
  };
}

/**
 * デッキ状態をセーブデータ形式に変換する
 */
function convertToSaveDeckState(
  deckState: ReturnType<StateManager['getDeckState']>
): IDeckState {
  return {
    deck: deckState.cards.map((card) => card.id),
    hand: deckState.hand.map((card) => card.id),
    discard: deckState.discardPile.map((card) => card.id),
    ownedCards: [
      ...deckState.cards,
      ...deckState.hand,
      ...deckState.discardPile,
    ].map((card) => card.id),
  };
}

/**
 * インベントリ状態をセーブデータ形式に変換する
 */
function convertToSaveInventoryState(
  inventoryState: ReturnType<StateManager['getInventoryState']>
): IInventoryState {
  return {
    materials: inventoryState.materials.map((material) => ({
      materialId: material.id,
      quality: material.quality,
      quantity: material.quantity,
    })),
    craftedItems: inventoryState.items.map((item) =>
      convertCraftedItemToSave(item as CraftedItem)
    ),
    storageLimit: inventoryState.materialCapacity,
  };
}

/**
 * 調合アイテムをセーブデータ形式に変換する
 */
function convertCraftedItemToSave(item: CraftedItem): ICraftedItem {
  return {
    itemId: item.itemId,
    quality: item.quality,
    attributeValues: item.attributeValues.map((attr) => ({
      attribute: attr.attribute,
      value: attr.value,
    })),
    effectValues: item.effectValues.map((eff) => ({
      type: eff.type,
      value: eff.value,
    })),
    usedMaterials: item.usedMaterials.map((mat) => ({
      materialId: mat.materialId,
      quantity: mat.quantity,
      quality: mat.quality,
      isRare: mat.isRare,
    })),
  };
}

/**
 * クエスト状態をセーブデータ形式に変換する
 */
function convertToSaveQuestState(
  questState: ReturnType<StateManager['getQuestState']>
): IQuestState {
  return {
    activeQuests: questState.activeQuests.map((quest) => ({
      questId: quest.questId,
      remainingDays: quest.remainingDays,
      acceptedDay: quest.acceptedDay,
    })),
    todayClients: [], // TODO: 本日の依頼者リストの追加が必要
    questLimit: 3, // TODO: 同時受注上限の追加が必要
  };
}
