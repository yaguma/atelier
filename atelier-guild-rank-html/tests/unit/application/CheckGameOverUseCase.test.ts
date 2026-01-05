/**
 * CheckGameOverUseCaseテスト
 * TASK-0116: ゲームオーバー判定ユースケース
 *
 * ゲームオーバー判定処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CheckGameOverUseCase,
  createCheckGameOverUseCase,
  CheckGameOverResult,
} from '@application/CheckGameOverUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { GamePhase, GuildRank } from '@domain/common/types';
import { GameProgress } from '@domain/game/GameState';

describe('CheckGameOverUseCase', () => {
  let checkGameOverUseCase: CheckGameOverUseCase;
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
      rank: GuildRank.G,
      gold: 500,
      rankDaysRemaining: 10,
    });

    // ゲーム状態を設定
    const gameState = stateManager.getGameState();
    stateManager.updateGameState({
      ...gameState,
      currentPhase: GamePhase.DELIVERY,
      currentDay: 50,
      gameProgress: GameProgress.IN_PROGRESS,
    });

    // ユースケースを生成
    checkGameOverUseCase = createCheckGameOverUseCase(stateManager, eventBus);
  });

  describe('ランク維持日数チェック', () => {
    it('ランク維持日数0でゲームオーバー', async () => {
      // ランク維持日数を0に設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rankDaysRemaining: 0,
      });

      const result = await checkGameOverUseCase.execute();

      expect(result.isGameOver).toBe(true);
      expect(result.reason).toBe('RANK_DAYS_EXPIRED');
    });

    it('ランク維持日数が残っている場合はゲームオーバーではない', async () => {
      // ランク維持日数が1以上
      const result = await checkGameOverUseCase.execute();

      expect(result.isGameOver).toBe(false);
    });
  });

  describe('昇格試験失敗チェック', () => {
    it('昇格試験中で残り日数0でゲームオーバー', async () => {
      // 昇格試験中、残り日数0に設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        isInPromotionTest: true,
        promotionTestDaysRemaining: 0,
      });

      const result = await checkGameOverUseCase.execute();

      expect(result.isGameOver).toBe(true);
      expect(result.reason).toBe('PROMOTION_TEST_FAILED');
    });
  });

  describe('ゲームオーバー状態', () => {
    it('ゲーム進行状態がGAME_OVERになる', async () => {
      // ランク維持日数を0に設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rankDaysRemaining: 0,
      });

      await checkGameOverUseCase.execute();

      const gameState = stateManager.getGameState();
      expect(gameState.gameProgress).toBe(GameProgress.GAME_OVER);
    });
  });

  describe('イベント発行', () => {
    it('ゲームオーバーイベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_OVER, eventHandler);

      // ランク維持日数を0に設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rankDaysRemaining: 0,
      });

      await checkGameOverUseCase.execute();

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.GAME_OVER,
        })
      );
    });

    it('ゲームオーバーでない場合はイベントが発行されない', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_OVER, eventHandler);

      // ランク維持日数が残っている
      await checkGameOverUseCase.execute();

      expect(eventHandler).not.toHaveBeenCalled();
    });
  });

  describe('ゲームオーバー理由', () => {
    it('ゲームオーバー理由が記録される', async () => {
      // ランク維持日数を0に設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rankDaysRemaining: 0,
      });

      const result = await checkGameOverUseCase.execute();

      expect(result.reason).toBeDefined();
      expect(result.reason).toBe('RANK_DAYS_EXPIRED');
    });

    it('昇格試験失敗の理由が記録される', async () => {
      // 昇格試験中、残り日数0に設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        isInPromotionTest: true,
        promotionTestDaysRemaining: 0,
      });

      const result = await checkGameOverUseCase.execute();

      expect(result.reason).toBe('PROMOTION_TEST_FAILED');
    });
  });

  describe('プレイ統計', () => {
    it('プレイ統計が記録される', async () => {
      // ランク維持日数を0に設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rankDaysRemaining: 0,
        gold: 1000,
        artifacts: ['artifact_1', 'artifact_2'],
      });

      const result = await checkGameOverUseCase.execute();

      expect(result.playStats).toBeDefined();
      expect(result.playStats?.totalDays).toBe(50);
      expect(result.playStats?.finalGold).toBe(1000);
      expect(result.playStats?.finalRank).toBe(GuildRank.G);
      expect(result.playStats?.artifactCount).toBe(2);
    });

    it('ゲームオーバーでない場合は統計が返されない', async () => {
      // ランク維持日数が残っている
      const result = await checkGameOverUseCase.execute();

      expect(result.playStats).toBeUndefined();
    });
  });

  describe('既にゲームオーバーの場合', () => {
    it('既にGAME_OVERの場合は何もしない', async () => {
      // 既にGAME_OVER状態に設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        gameProgress: GameProgress.GAME_OVER,
      });

      // ランク維持日数を0に設定（本来ならゲームオーバー条件）
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        rankDaysRemaining: 0,
      });

      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.GAME_OVER, eventHandler);

      const result = await checkGameOverUseCase.execute();

      expect(result.isGameOver).toBe(true);
      expect(result.alreadyGameOver).toBe(true);
      expect(eventHandler).not.toHaveBeenCalled(); // 既にゲームオーバーなのでイベントは発行されない
    });
  });
});
