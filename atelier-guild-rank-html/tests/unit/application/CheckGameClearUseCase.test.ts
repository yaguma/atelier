/**
 * CheckGameClearUseCaseテスト
 * TASK-0115: ゲームクリア判定ユースケース
 *
 * ゲームクリア判定処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CheckGameClearUseCase,
  createCheckGameClearUseCase,
  CheckGameClearResult,
} from '@application/CheckGameClearUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { GamePhase, GuildRank } from '@domain/common/types';
import { GameProgress } from '@domain/game/GameState';

describe('CheckGameClearUseCase', () => {
  let checkGameClearUseCase: CheckGameClearUseCase;
  let stateManager: StateManager;
  let eventBus: EventBus;

  beforeEach(() => {
    // イベントバスを生成
    eventBus = createEventBus();
    // ステートマネージャーを生成
    stateManager = createStateManager();

    // 初期状態を設定
    const playerState = stateManager.getPlayerState();
    stateManager.updatePlayerState({
      ...playerState,
      rank: GuildRank.A,
      gold: 5000,
    });

    // ゲーム状態を設定
    const gameState = stateManager.getGameState();
    stateManager.updateGameState({
      ...gameState,
      currentPhase: GamePhase.DELIVERY,
      currentDay: 100,
      gameProgress: GameProgress.IN_PROGRESS,
    });

    // ユースケースを生成
    checkGameClearUseCase = createCheckGameClearUseCase(stateManager, eventBus);
  });

  describe('ゲームクリア判定', () => {
    it('Sランク到達でゲームクリア', async () => {
      // Sランクに設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rank: GuildRank.S,
      });

      const result = await checkGameClearUseCase.execute();

      expect(result.isGameClear).toBe(true);
    });

    it('Sランク以外ではゲームクリアにならない', async () => {
      // Aランクのまま
      const result = await checkGameClearUseCase.execute();

      expect(result.isGameClear).toBe(false);
    });

    it('ゲーム進行状態がGAME_CLEARになる', async () => {
      // Sランクに設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rank: GuildRank.S,
      });

      await checkGameClearUseCase.execute();

      const gameState = stateManager.getGameState();
      expect(gameState.gameProgress).toBe(GameProgress.GAME_CLEAR);
    });
  });

  describe('プレイ統計', () => {
    it('プレイ統計が記録される', async () => {
      // Sランクに設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rank: GuildRank.S,
      });

      const result = await checkGameClearUseCase.execute();

      expect(result.playStats).toBeDefined();
      expect(result.playStats?.totalDays).toBe(100);
      expect(result.playStats?.finalGold).toBe(5000);
      expect(result.playStats?.finalRank).toBe(GuildRank.S);
    });

    it('ゲームクリアでない場合は統計が返されない', async () => {
      // Aランクのまま
      const result = await checkGameClearUseCase.execute();

      expect(result.playStats).toBeUndefined();
    });
  });

  describe('イベント発行', () => {
    it('ゲームクリアイベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_CLEAR, eventHandler);

      // Sランクに設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rank: GuildRank.S,
      });

      await checkGameClearUseCase.execute();

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.GAME_CLEAR,
        })
      );
    });

    it('ゲームクリアでない場合はイベントが発行されない', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_CLEAR, eventHandler);

      // Aランクのまま
      await checkGameClearUseCase.execute();

      expect(eventHandler).not.toHaveBeenCalled();
    });
  });

  describe('既にクリア済みの場合', () => {
    it('既にクリア済みの場合は何もしない', async () => {
      // 既にGAME_CLEAR状態に設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        gameProgress: GameProgress.GAME_CLEAR,
      });

      // Sランクに設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rank: GuildRank.S,
      });

      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_CLEAR, eventHandler);

      const result = await checkGameClearUseCase.execute();

      expect(result.isGameClear).toBe(true);
      expect(result.alreadyCleared).toBe(true);
      expect(eventHandler).not.toHaveBeenCalled(); // 既にクリア済みなのでイベントは発行されない
    });
  });
});
