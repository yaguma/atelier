/**
 * ステートマネージャー
 * TASK-0103: ステートマネージャー
 *
 * ゲーム状態の集中管理を担当するマネージャー
 * 各種状態の取得・更新・購読機能を提供する
 */

import { GameState, createGameState } from '@domain/game/GameState';
import { PlayerState, createPlayerState } from '@domain/player/PlayerState';
import { Deck, createDeck } from '@domain/services/DeckService';
import { Inventory, createInventory } from '@domain/services/InventoryService';
import { IActiveQuest, IQuest } from '@domain/quest/QuestEntity';

/**
 * クエスト状態
 */
export interface QuestState {
  /** 受注中の依頼 */
  activeQuests: IActiveQuest[];
  /** 利用可能な依頼（当日生成された依頼） */
  availableQuests: IQuest[];
}

/**
 * 全状態のスナップショット
 */
export interface StateSnapshot {
  gameState: GameState;
  playerState: PlayerState;
  deckState: Deck;
  inventoryState: Inventory;
  questState: QuestState;
}

/**
 * 購読解除関数の型
 */
export type Unsubscribe = () => void;

/**
 * 状態変更リスナーの型
 */
export type StateListener = () => void;

/**
 * ステートマネージャーインターフェース
 */
export interface StateManager {
  /**
   * ゲーム状態を取得する
   * @returns ゲーム状態
   */
  getGameState(): GameState;

  /**
   * プレイヤー状態を取得する
   * @returns プレイヤー状態
   */
  getPlayerState(): PlayerState;

  /**
   * デッキ状態を取得する
   * @returns デッキ状態
   */
  getDeckState(): Deck;

  /**
   * インベントリ状態を取得する
   * @returns インベントリ状態
   */
  getInventoryState(): Inventory;

  /**
   * クエスト状態を取得する
   * @returns クエスト状態
   */
  getQuestState(): QuestState;

  /**
   * ゲーム状態を更新する
   * @param state 新しいゲーム状態
   */
  updateGameState(state: GameState): void;

  /**
   * プレイヤー状態を更新する
   * @param state 新しいプレイヤー状態
   */
  updatePlayerState(state: PlayerState): void;

  /**
   * デッキ状態を更新する
   * @param state 新しいデッキ状態
   */
  updateDeckState(state: Deck): void;

  /**
   * インベントリ状態を更新する
   * @param state 新しいインベントリ状態
   */
  updateInventoryState(state: Inventory): void;

  /**
   * クエスト状態を更新する
   * @param state 新しいクエスト状態
   */
  updateQuestState(state: QuestState): void;

  /**
   * 状態変更を購読する
   * @param listener リスナー関数
   * @returns 購読解除関数
   */
  subscribe(listener: StateListener): Unsubscribe;

  /**
   * 全状態のスナップショットを取得する
   * @returns 状態のスナップショット
   */
  getSnapshot(): StateSnapshot;

  /**
   * 状態を初期値にリセットする
   */
  reset(): void;

  /**
   * スナップショットから状態を復元する
   * @param snapshot 復元元のスナップショット
   */
  restoreFromSnapshot(snapshot: StateSnapshot): void;
}

/**
 * 初期クエスト状態を生成する
 * @returns 初期クエスト状態
 */
function createInitialQuestState(): QuestState {
  return {
    activeQuests: [],
    availableQuests: [],
  };
}

/**
 * ステートマネージャーを生成する
 * @returns ステートマネージャー
 */
export function createStateManager(): StateManager {
  // 内部状態
  let gameState: GameState = createGameState();
  let playerState: PlayerState = createPlayerState();
  let deckState: Deck = createDeck();
  let inventoryState: Inventory = createInventory();
  let questState: QuestState = createInitialQuestState();

  // リスナー管理
  const listeners: Set<StateListener> = new Set();

  /**
   * 全リスナーに通知する
   */
  const notifyListeners = (): void => {
    listeners.forEach((listener) => listener());
  };

  /**
   * 状態のディープコピーを作成する
   */
  const deepCopyState = <T>(state: T): T => {
    return JSON.parse(JSON.stringify(state));
  };

  return {
    getGameState(): GameState {
      return { ...gameState };
    },

    getPlayerState(): PlayerState {
      return {
        ...playerState,
        artifacts: [...playerState.artifacts],
      };
    },

    getDeckState(): Deck {
      return {
        cards: [...deckState.cards],
        hand: [...deckState.hand],
        discardPile: [...deckState.discardPile],
      };
    },

    getInventoryState(): Inventory {
      return {
        materials: [...inventoryState.materials],
        items: [...inventoryState.items],
        materialCapacity: inventoryState.materialCapacity,
      };
    },

    getQuestState(): QuestState {
      return {
        activeQuests: [...questState.activeQuests],
        availableQuests: [...questState.availableQuests],
      };
    },

    updateGameState(state: GameState): void {
      gameState = { ...state };
      notifyListeners();
    },

    updatePlayerState(state: PlayerState): void {
      playerState = {
        ...state,
        artifacts: [...state.artifacts],
      };
      notifyListeners();
    },

    updateDeckState(state: Deck): void {
      deckState = {
        cards: [...state.cards],
        hand: [...state.hand],
        discardPile: [...state.discardPile],
      };
      notifyListeners();
    },

    updateInventoryState(state: Inventory): void {
      inventoryState = {
        materials: [...state.materials],
        items: [...state.items],
        materialCapacity: state.materialCapacity,
      };
      notifyListeners();
    },

    updateQuestState(state: QuestState): void {
      questState = {
        activeQuests: [...state.activeQuests],
        availableQuests: [...state.availableQuests],
      };
      notifyListeners();
    },

    subscribe(listener: StateListener): Unsubscribe {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    getSnapshot(): StateSnapshot {
      return {
        gameState: deepCopyState(gameState),
        playerState: deepCopyState(playerState),
        deckState: deepCopyState(deckState),
        inventoryState: deepCopyState(inventoryState),
        questState: deepCopyState(questState),
      };
    },

    reset(): void {
      gameState = createGameState();
      playerState = createPlayerState();
      deckState = createDeck();
      inventoryState = createInventory();
      questState = createInitialQuestState();
      notifyListeners();
    },

    restoreFromSnapshot(snapshot: StateSnapshot): void {
      gameState = deepCopyState(snapshot.gameState);
      playerState = deepCopyState(snapshot.playerState);
      deckState = deepCopyState(snapshot.deckState);
      inventoryState = deepCopyState(snapshot.inventoryState);
      questState = deepCopyState(snapshot.questState);
      notifyListeners();
    },
  };
}
