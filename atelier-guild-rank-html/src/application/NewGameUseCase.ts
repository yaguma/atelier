/**
 * ニューゲームユースケース
 * TASK-0104: ニューゲームユースケース
 *
 * 新規ゲーム開始時の初期化処理を担当するユースケース
 */

import { StateManager } from '@application/StateManager';
import { GameFlowManager } from '@application/GameFlowManager';
import { EventBus, GameEventType } from '@domain/events/GameEvents';
import { ISaveDataRepository } from '@infrastructure/repository/ISaveDataRepository';
import { ISaveData, IGameState, IDeckState, IInventoryState, IQuestState } from '@domain/save/SaveData';
import { GamePhase, GuildRank } from '@domain/common/types';
import { DeckService, Deck } from '@domain/services/DeckService';
import { GameProgress } from '@domain/game/GameState';
import { createPlayerState } from '@domain/player/PlayerState';
import { createGameState } from '@domain/game/GameState';
import { createInventory } from '@domain/services/InventoryService';

/**
 * ニューゲーム実行オプション
 */
export interface NewGameOptions {
  /** 既存データを上書きする */
  forceOverwrite?: boolean;
}

/**
 * ニューゲーム実行結果
 */
export interface NewGameResult {
  /** 成功したかどうか */
  success: boolean;
  /** 上書き確認が必要かどうか */
  requiresConfirmation?: boolean;
  /** エラーメッセージ */
  error?: string;
}

/**
 * ニューゲームユースケースインターフェース
 */
export interface NewGameUseCase {
  /**
   * ニューゲームを実行する
   * @param options オプション
   * @returns 実行結果
   */
  execute(options?: NewGameOptions): Promise<NewGameResult>;
}

/**
 * セーブデータバージョン
 */
const SAVE_DATA_VERSION = '1.0.0';

/**
 * デッキをセーブデータ形式に変換する
 * @param deck デッキ
 * @returns IDeckState形式
 */
function convertDeckToSaveFormat(deck: Deck): IDeckState {
  const allCards = [...deck.cards, ...deck.hand, ...deck.discardPile];
  return {
    deck: deck.cards.map(c => c.id),
    hand: deck.hand.map(c => c.id),
    discard: deck.discardPile.map(c => c.id),
    ownedCards: allCards.map(c => c.id),
  };
}

/**
 * ニューゲームユースケースを生成する
 * @param stateManager ステートマネージャー
 * @param gameFlowManager ゲームフローマネージャー
 * @param saveRepository セーブデータリポジトリ
 * @param eventBus イベントバス
 * @param deckService デッキサービス
 * @returns ニューゲームユースケース
 */
export function createNewGameUseCase(
  stateManager: StateManager,
  gameFlowManager: GameFlowManager,
  saveRepository: ISaveDataRepository,
  eventBus: EventBus,
  deckService: DeckService
): NewGameUseCase {
  return {
    async execute(options?: NewGameOptions): Promise<NewGameResult> {
      // 既存セーブデータの確認
      if (saveRepository.exists() && !options?.forceOverwrite) {
        return {
          success: false,
          requiresConfirmation: true,
        };
      }

      // 既存データを削除
      if (saveRepository.exists()) {
        saveRepository.delete();
      }

      // ゲームフローマネージャーを初期化
      const { gameState, playerState } = gameFlowManager.initializeGame({
        initialDay: 1,
        initialGold: 100,
        initialRank: GuildRank.G,
      });

      // ステートマネージャーを更新
      stateManager.updateGameState(gameState);
      stateManager.updatePlayerState(playerState);

      // 初期デッキを生成（非同期）
      const initialDeck = await deckService.createInitialDeck();
      const shuffledDeck = deckService.shuffle(initialDeck);
      stateManager.updateDeckState(shuffledDeck);

      // インベントリをリセット
      stateManager.updateInventoryState(createInventory());

      // クエスト状態をリセット
      stateManager.updateQuestState({
        activeQuests: [],
        availableQuests: [],
      });

      // セーブデータを作成
      const saveData: ISaveData = {
        version: SAVE_DATA_VERSION,
        lastSaved: new Date().toISOString(),
        gameState: {
          currentRank: playerState.rank,
          promotionGauge: playerState.promotionGauge,
          requiredContribution: playerState.promotionGaugeMax,
          remainingDays: playerState.rankDaysRemaining,
          currentDay: gameState.currentDay,
          currentPhase: gameState.currentPhase,
          gold: playerState.gold,
          comboCount: 0,
          actionPoints: playerState.actionPoints,
          isPromotionTest: gameState.isInPromotionTest,
          promotionTestRemainingDays: gameState.promotionTestDaysRemaining,
        },
        deckState: convertDeckToSaveFormat(shuffledDeck),
        inventoryState: {
          materials: [],
          craftedItems: [],
          storageLimit: 20,
        },
        questState: {
          activeQuests: [],
          todayClients: [],
          questLimit: 3,
        },
        artifacts: [],
      };

      saveRepository.create(saveData);

      // ゲーム開始イベントを発行
      eventBus.publish({
        type: GameEventType.GAME_STARTED,
        payload: {},
      });

      return {
        success: true,
      };
    },
  };
}
