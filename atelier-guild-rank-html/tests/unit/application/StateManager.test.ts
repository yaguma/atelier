/**
 * StateManagerテスト
 * TASK-0103: ステートマネージャー
 *
 * ゲーム状態の集中管理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  StateManager,
  createStateManager,
  Unsubscribe,
} from '@application/StateManager';
import { GameState, createGameState } from '@domain/game/GameState';
import { PlayerState, createPlayerState } from '@domain/player/PlayerState';
import { Deck, createDeck } from '@domain/services/DeckService';
import { Inventory, createInventory } from '@domain/services/InventoryService';
import { IActiveQuest, createActiveQuest } from '@domain/quest/QuestEntity';
import { GamePhase, GuildRank, QuestType } from '@domain/common/types';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = createStateManager();
  });

  describe('状態取得', () => {
    it('ゲーム状態を取得できる', () => {
      const gameState = stateManager.getGameState();
      expect(gameState).toBeDefined();
      expect(gameState.currentPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(gameState.currentDay).toBe(1);
    });

    it('プレイヤー状態を取得できる', () => {
      const playerState = stateManager.getPlayerState();
      expect(playerState).toBeDefined();
      expect(playerState.rank).toBe(GuildRank.G);
      expect(playerState.gold).toBe(100);
    });

    it('デッキ状態を取得できる', () => {
      const deckState = stateManager.getDeckState();
      expect(deckState).toBeDefined();
      expect(deckState.cards).toBeInstanceOf(Array);
      expect(deckState.hand).toBeInstanceOf(Array);
      expect(deckState.discardPile).toBeInstanceOf(Array);
    });

    it('インベントリ状態を取得できる', () => {
      const inventoryState = stateManager.getInventoryState();
      expect(inventoryState).toBeDefined();
      expect(inventoryState.materials).toBeInstanceOf(Array);
      expect(inventoryState.items).toBeInstanceOf(Array);
    });

    it('クエスト状態を取得できる', () => {
      const questState = stateManager.getQuestState();
      expect(questState).toBeDefined();
      expect(questState.activeQuests).toBeInstanceOf(Array);
      expect(questState.availableQuests).toBeInstanceOf(Array);
    });
  });

  describe('状態更新', () => {
    it('ゲーム状態を更新できる', () => {
      const newGameState = createGameState({ currentDay: 5 });
      stateManager.updateGameState(newGameState);

      const gameState = stateManager.getGameState();
      expect(gameState.currentDay).toBe(5);
    });

    it('プレイヤー状態を更新できる', () => {
      const newPlayerState = createPlayerState({ gold: 500 });
      stateManager.updatePlayerState(newPlayerState);

      const playerState = stateManager.getPlayerState();
      expect(playerState.gold).toBe(500);
    });

    it('デッキ状態を更新できる', () => {
      const newDeckState = createDeck();
      stateManager.updateDeckState(newDeckState);

      const deckState = stateManager.getDeckState();
      expect(deckState.cards).toEqual([]);
    });

    it('インベントリ状態を更新できる', () => {
      const newInventoryState = createInventory([], [], 100);
      stateManager.updateInventoryState(newInventoryState);

      const inventoryState = stateManager.getInventoryState();
      expect(inventoryState.materialCapacity).toBe(100);
    });

    it('クエスト状態を更新できる', () => {
      stateManager.updateQuestState({
        activeQuests: [],
        availableQuests: [],
      });

      const questState = stateManager.getQuestState();
      expect(questState.activeQuests).toEqual([]);
    });
  });

  describe('状態変更の購読', () => {
    it('状態変更を購読できる', () => {
      const listener = vi.fn();
      const unsubscribe = stateManager.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('状態変更時に通知される', () => {
      const listener = vi.fn();
      stateManager.subscribe(listener);

      const newGameState = createGameState({ currentDay: 10 });
      stateManager.updateGameState(newGameState);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('複数のリスナーに通知される', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      stateManager.subscribe(listener1);
      stateManager.subscribe(listener2);

      const newGameState = createGameState({ currentDay: 10 });
      stateManager.updateGameState(newGameState);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('購読解除後は通知されない', () => {
      const listener = vi.fn();
      const unsubscribe = stateManager.subscribe(listener);

      unsubscribe();

      const newGameState = createGameState({ currentDay: 10 });
      stateManager.updateGameState(newGameState);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('状態のスナップショット', () => {
    it('状態のスナップショットを取得できる', () => {
      const snapshot = stateManager.getSnapshot();

      expect(snapshot).toBeDefined();
      expect(snapshot.gameState).toBeDefined();
      expect(snapshot.playerState).toBeDefined();
      expect(snapshot.deckState).toBeDefined();
      expect(snapshot.inventoryState).toBeDefined();
      expect(snapshot.questState).toBeDefined();
    });

    it('スナップショットは現在の状態のコピーである', () => {
      const snapshot = stateManager.getSnapshot();

      // 状態を更新
      const newGameState = createGameState({ currentDay: 20 });
      stateManager.updateGameState(newGameState);

      // スナップショットは影響を受けない
      expect(snapshot.gameState.currentDay).toBe(1);
      expect(stateManager.getGameState().currentDay).toBe(20);
    });
  });

  describe('状態のリセット', () => {
    it('状態をリセットできる', () => {
      // 状態を変更
      stateManager.updateGameState(createGameState({ currentDay: 50 }));
      stateManager.updatePlayerState(createPlayerState({ gold: 9999 }));

      // リセット
      stateManager.reset();

      // 初期状態に戻る
      expect(stateManager.getGameState().currentDay).toBe(1);
      expect(stateManager.getPlayerState().gold).toBe(100);
    });

    it('リセット時にリスナーに通知される', () => {
      const listener = vi.fn();
      stateManager.subscribe(listener);

      stateManager.reset();

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('状態の復元', () => {
    it('スナップショットから状態を復元できる', () => {
      // 現在の状態を取得
      const originalSnapshot = stateManager.getSnapshot();

      // 状態を変更
      stateManager.updateGameState(createGameState({ currentDay: 100 }));
      stateManager.updatePlayerState(createPlayerState({ gold: 5000 }));

      // スナップショットから復元
      stateManager.restoreFromSnapshot(originalSnapshot);

      // 元の状態に戻る
      expect(stateManager.getGameState().currentDay).toBe(1);
      expect(stateManager.getPlayerState().gold).toBe(100);
    });

    it('復元時にリスナーに通知される', () => {
      const listener = vi.fn();
      stateManager.subscribe(listener);

      const snapshot = stateManager.getSnapshot();
      stateManager.restoreFromSnapshot(snapshot);

      expect(listener).toHaveBeenCalled();
    });
  });
});
