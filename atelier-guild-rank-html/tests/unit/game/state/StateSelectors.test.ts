/**
 * StateSelectors テスト
 *
 * TASK-0252: StateManager Phaser連携実装
 * StateSelectorの機能テスト。
 * - プレイヤー関連セレクタ
 * - 依頼関連セレクタ
 * - インベントリ関連セレクタ
 * - デッキ関連セレクタ
 * - 複合条件セレクタ
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StateSelectors } from '@game/state/StateSelectors';
import {
  PhaserStateManager,
  resetPhaserStateManager,
} from '@game/state/PhaserStateManager';
import { createStateManager, type StateManager } from '@application/StateManager';
import { createGameState } from '@domain/game/GameState';
import { createPlayerState } from '@domain/player/PlayerState';
import { createDeck } from '@domain/services/DeckService';
import { createInventory } from '@domain/services/InventoryService';
import { EventBus } from '@game/events/EventBus';
import { GuildRank } from '@domain/common/types';

describe('StateSelectors', () => {
  let stateManager: StateManager;
  let phaserStateManager: PhaserStateManager;
  let selectors: StateSelectors;

  beforeEach(() => {
    EventBus.resetInstance();
    stateManager = createStateManager();
    phaserStateManager = new PhaserStateManager({
      stateManager,
      eventBus: EventBus.getInstance(),
    });
    selectors = new StateSelectors(phaserStateManager);
  });

  afterEach(() => {
    resetPhaserStateManager();
    EventBus.resetInstance();
  });

  describe('プレイヤー関連', () => {
    describe('canAfford()', () => {
      it('ゴールドが足りる場合trueを返す', () => {
        // 初期ゴールドは100
        expect(selectors.canAfford(100)).toBe(true);
        expect(selectors.canAfford(50)).toBe(true);
      });

      it('ゴールドが足りない場合falseを返す', () => {
        expect(selectors.canAfford(101)).toBe(false);
        expect(selectors.canAfford(1000)).toBe(false);
      });

      it('ちょうど同額の場合trueを返す', () => {
        expect(selectors.canAfford(100)).toBe(true);
      });
    });

    describe('hasEnoughAP()', () => {
      it('APが足りる場合trueを返す', () => {
        // 初期APは3
        expect(selectors.hasEnoughAP(3)).toBe(true);
        expect(selectors.hasEnoughAP(1)).toBe(true);
      });

      it('APが足りない場合falseを返す', () => {
        expect(selectors.hasEnoughAP(4)).toBe(false);
        expect(selectors.hasEnoughAP(10)).toBe(false);
      });
    });

    describe('getExpProgress()', () => {
      it('貢献度進捗率を返す', () => {
        const progress = selectors.getExpProgress();
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(1);
      });

      it('貢献度が0の場合0を返す', () => {
        // 初期状態では0/必要量
        expect(selectors.getExpProgress()).toBe(0);
      });
    });

    describe('getDayProgress()', () => {
      it('日数進捗率を返す', () => {
        const progress = selectors.getDayProgress();
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(1);
      });
    });

    describe('getRemainingDays()', () => {
      it('残り日数を返す', () => {
        const remaining = selectors.getRemainingDays();
        expect(remaining).toBeGreaterThan(0);
      });

      it('残り日数が0の場合0を返す', () => {
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          rankDaysRemaining: 0,
        });

        expect(selectors.getRemainingDays()).toBe(0);
      });
    });

    describe('getAPRecovery()', () => {
      it('AP回復量を返す', () => {
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          actionPoints: 1,
          actionPointsMax: 3,
        });

        expect(selectors.getAPRecovery()).toBe(2);
      });

      it('APが満タンの場合0を返す', () => {
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          actionPoints: 3,
          actionPointsMax: 3,
        });

        expect(selectors.getAPRecovery()).toBe(0);
      });
    });
  });

  describe('依頼関連', () => {
    describe('getActiveQuestCount()', () => {
      it('初期状態では0を返す', () => {
        expect(selectors.getActiveQuestCount()).toBe(0);
      });
    });

    describe('canAcceptMoreQuests()', () => {
      it('依頼が0件の場合trueを返す', () => {
        expect(selectors.canAcceptMoreQuests()).toBe(true);
      });

      it('カスタム上限を指定できる', () => {
        expect(selectors.canAcceptMoreQuests(1)).toBe(true);
        expect(selectors.canAcceptMoreQuests(0)).toBe(false);
      });
    });

    describe('getDeliverableQuests()', () => {
      it('初期状態では空配列を返す', () => {
        expect(selectors.getDeliverableQuests()).toEqual([]);
      });
    });

    describe('hasDeliverableQuests()', () => {
      it('納品可能な依頼がない場合falseを返す', () => {
        expect(selectors.hasDeliverableQuests()).toBe(false);
      });
    });
  });

  describe('インベントリ関連', () => {
    describe('getMaterialCount()', () => {
      it('素材がない場合0を返す', () => {
        expect(selectors.getMaterialCount('unknown-material')).toBe(0);
      });
    });

    describe('getItemCount()', () => {
      it('アイテムがない場合0を返す', () => {
        expect(selectors.getItemCount('unknown-item')).toBe(0);
      });
    });

    describe('hasRequiredMaterials()', () => {
      it('空の要件の場合trueを返す', () => {
        expect(selectors.hasRequiredMaterials([])).toBe(true);
      });

      it('素材がない場合falseを返す', () => {
        expect(
          selectors.hasRequiredMaterials([{ itemId: 'mat1', quantity: 1 }])
        ).toBe(false);
      });
    });

    describe('isMaterialCapacityFull()', () => {
      it('初期状態ではfalseを返す', () => {
        expect(selectors.isMaterialCapacityFull()).toBe(false);
      });
    });

    describe('getMaterialCapacityRemaining()', () => {
      it('空き容量を返す', () => {
        const remaining = selectors.getMaterialCapacityRemaining();
        expect(remaining).toBeGreaterThan(0);
      });
    });
  });

  describe('デッキ関連', () => {
    describe('getHandSize()', () => {
      it('手札数を返す', () => {
        expect(selectors.getHandSize()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getDeckSize()', () => {
      it('デッキ残り枚数を返す', () => {
        expect(selectors.getDeckSize()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getDiscardSize()', () => {
      it('捨て札枚数を返す', () => {
        expect(selectors.getDiscardSize()).toBeGreaterThanOrEqual(0);
      });
    });

    describe('canDraw()', () => {
      it('デッキか捨て札があればtrueを返す', () => {
        // 初期状態ではデッキも捨て札もない
        expect(selectors.canDraw()).toBe(false);
      });
    });

    describe('isHandEmpty()', () => {
      it('手札が空の場合trueを返す', () => {
        expect(selectors.isHandEmpty()).toBe(true);
      });
    });
  });

  describe('複合条件', () => {
    describe('isGameOver()', () => {
      it('初期状態ではfalseを返す', () => {
        expect(selectors.isGameOver()).toBe(false);
      });

      it('残り日数が0でtrueを返す', () => {
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          rankDaysRemaining: 0,
        });

        expect(selectors.isGameOver()).toBe(true);
      });

      it('ゴールドがマイナスでtrueを返す', () => {
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          gold: -1,
        });

        expect(selectors.isGameOver()).toBe(true);
      });
    });

    describe('isGameClear()', () => {
      it('Sランクでない場合falseを返す', () => {
        expect(selectors.isGameClear()).toBe(false);
      });

      it('Sランクの場合trueを返す', () => {
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          rank: GuildRank.S,
        });

        expect(selectors.isGameClear()).toBe(true);
      });
    });

    describe('canTakeRankUpExam()', () => {
      it('貢献度が不足している場合falseを返す', () => {
        expect(selectors.canTakeRankUpExam()).toBe(false);
      });

      it('貢献度が必要量に達している場合trueを返す', () => {
        const playerState = createPlayerState();
        phaserStateManager.updatePlayerState({
          ...playerState,
          promotionGauge: playerState.promotionGaugeMax,
        });

        expect(selectors.canTakeRankUpExam()).toBe(true);
      });
    });

    describe('getNextRank()', () => {
      it('次のランクを返す', () => {
        // 初期ランクはG
        expect(selectors.getNextRank()).toBe(GuildRank.F);
      });

      it('Sランクの場合nullを返す', () => {
        phaserStateManager.updatePlayerState({
          ...createPlayerState(),
          rank: GuildRank.S,
        });

        expect(selectors.getNextRank()).toBeNull();
      });
    });

    describe('getCurrentPhase()', () => {
      it('現在のフェーズを返す', () => {
        expect(selectors.getCurrentPhase()).toBe('QUEST_ACCEPT');
      });
    });

    describe('isPhase()', () => {
      it('正しいフェーズの場合trueを返す', () => {
        expect(selectors.isPhase('QUEST_ACCEPT')).toBe(true);
      });

      it('異なるフェーズの場合falseを返す', () => {
        expect(selectors.isPhase('GATHERING')).toBe(false);
      });
    });
  });
});
