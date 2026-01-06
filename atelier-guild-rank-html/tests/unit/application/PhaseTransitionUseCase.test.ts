/**
 * PhaseTransitionUseCaseテスト
 * TASK-0110: フェーズ遷移ユースケース
 *
 * フェーズ遷移処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PhaseTransitionUseCase,
  createPhaseTransitionUseCase,
  PhaseTransitionResult,
} from '@application/PhaseTransitionUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import { GamePhase, GuildRank } from '@domain/common/types';

describe('PhaseTransitionUseCase', () => {
  let phaseTransitionUseCase: PhaseTransitionUseCase;
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
      actionPoints: 0, // 行動ポイント消費済み
      gold: 100,
      promotionGauge: 50,
    });

    // ゲーム状態を設定
    const gameState = stateManager.getGameState();
    stateManager.updateGameState({
      ...gameState,
      currentPhase: GamePhase.QUEST_ACCEPT,
      currentDay: 1,
    });

    // ユースケースを生成
    phaseTransitionUseCase = createPhaseTransitionUseCase(stateManager, eventBus);
  });

  describe('フェーズ遷移', () => {
    it('次のフェーズに遷移できる', async () => {
      const result = await phaseTransitionUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.newPhase).toBe(GamePhase.GATHERING);
    });

    it('QUEST_ACCEPTからGATHERINGに遷移', async () => {
      const result = await phaseTransitionUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.previousPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(result.newPhase).toBe(GamePhase.GATHERING);
    });

    it('GATHERINGからALCHEMYに遷移', async () => {
      // GATHERINGフェーズに設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        currentPhase: GamePhase.GATHERING,
      });

      const result = await phaseTransitionUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.previousPhase).toBe(GamePhase.GATHERING);
      expect(result.newPhase).toBe(GamePhase.ALCHEMY);
    });

    it('ALCHEMYからDELIVERYに遷移', async () => {
      // ALCHEMYフェーズに設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        currentPhase: GamePhase.ALCHEMY,
      });

      const result = await phaseTransitionUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.previousPhase).toBe(GamePhase.ALCHEMY);
      expect(result.newPhase).toBe(GamePhase.DELIVERY);
    });

    it('DELIVERYから次の日のQUEST_ACCEPTに遷移', async () => {
      // DELIVERYフェーズに設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        currentPhase: GamePhase.DELIVERY,
        currentDay: 1,
      });

      const result = await phaseTransitionUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.previousPhase).toBe(GamePhase.DELIVERY);
      expect(result.newPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(result.dayAdvanced).toBe(true);
      expect(result.newDay).toBe(2);
    });
  });

  describe('行動ポイント', () => {
    it('フェーズ遷移時に行動ポイントがリセットされる', async () => {
      // 行動ポイントを0に設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        actionPoints: 0,
        actionPointsMax: 3,
      });

      await phaseTransitionUseCase.execute();

      const updatedPlayerState = stateManager.getPlayerState();
      expect(updatedPlayerState.actionPoints).toBe(3);
    });
  });

  describe('イベント発行', () => {
    it('フェーズ遷移イベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.PHASE_CHANGED, eventHandler);

      await phaseTransitionUseCase.execute();

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.PHASE_CHANGED,
          payload: expect.objectContaining({
            phase: GamePhase.GATHERING,
          }),
        })
      );
    });

    it('日数経過イベントが発行される（DELIVERYから遷移時）', async () => {
      // DELIVERYフェーズに設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        currentPhase: GamePhase.DELIVERY,
        currentDay: 1,
      });

      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.DAY_ADVANCED, eventHandler);

      await phaseTransitionUseCase.execute();

      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.DAY_ADVANCED,
          payload: expect.objectContaining({
            day: 2,
          }),
        })
      );
    });
  });

  describe('昇格試験中', () => {
    it('昇格試験中は試験用フェーズルールが適用される', async () => {
      // 昇格試験中の状態を設定
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        currentPhase: GamePhase.DELIVERY,
        currentDay: 1,
        isInPromotionTest: true,
        promotionTestDaysRemaining: 5,
      });

      const result = await phaseTransitionUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.dayAdvanced).toBe(true);

      // 昇格試験の残り日数が減っていることを確認
      const updatedGameState = stateManager.getGameState();
      expect(updatedGameState.promotionTestDaysRemaining).toBe(4);
    });

    it('昇格試験の残り日数が0になったらフラグが立つ', async () => {
      // 昇格試験中の状態を設定（残り1日）
      const gameState = stateManager.getGameState();
      stateManager.updateGameState({
        ...gameState,
        currentPhase: GamePhase.DELIVERY,
        currentDay: 5,
        isInPromotionTest: true,
        promotionTestDaysRemaining: 1,
      });

      const result = await phaseTransitionUseCase.execute();

      expect(result.success).toBe(true);
      expect(result.promotionTestExpired).toBe(true);

      const updatedGameState = stateManager.getGameState();
      expect(updatedGameState.promotionTestDaysRemaining).toBe(0);
    });
  });
});
