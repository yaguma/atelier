/**
 * ランク管理ドメインサービスのテスト
 * TASK-0096: ランク管理ドメインサービス
 *
 * ランクの貢献度管理、昇格試験発生、ゲームオーバー・ゲームクリア条件をテストする
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  RankManagementService,
  createRankState,
  type RankState,
} from '../../../../src/domain/services/RankManagementService';
import { GuildRank, Quality } from '../../../../src/domain/common/types';
import { createRank } from '../../../../src/domain/rank/RankEntity';
import type { IGuildRank } from '../../../../src/domain/rank/Rank';

describe('RankManagementService', () => {
  // テスト用ランクマスターデータ
  const sampleRankDataG: IGuildRank = {
    id: GuildRank.G,
    name: 'Gランク（見習い）',
    maxPromotionGauge: 100,
    dayLimit: 30,
    specialRules: [],
    promotionTest: {
      requirements: [
        { itemId: 'healing_potion', quantity: 1, minQuality: Quality.D },
      ],
      dayLimit: 5,
    },
    unlockedGatheringCards: ['gathering_forest'],
    unlockedRecipeCards: ['recipe_healing_potion'],
  };

  const sampleRankDataF: IGuildRank = {
    id: GuildRank.F,
    name: 'Fランク（新人）',
    maxPromotionGauge: 200,
    dayLimit: 25,
    specialRules: [],
    promotionTest: {
      requirements: [
        { itemId: 'healing_potion', quantity: 2, minQuality: Quality.C },
      ],
      dayLimit: 7,
    },
    unlockedGatheringCards: ['gathering_cave'],
    unlockedRecipeCards: ['recipe_bomb'],
  };

  const sampleRankDataS: IGuildRank = {
    id: GuildRank.S,
    name: 'Sランク（伝説）',
    maxPromotionGauge: 0,
    dayLimit: 999,
    specialRules: [],
    promotionTest: null,
    unlockedGatheringCards: [],
    unlockedRecipeCards: [],
  };

  let rankManagementService: RankManagementService;
  let rankDataMap: Map<GuildRank, IGuildRank>;

  beforeEach(() => {
    rankDataMap = new Map([
      [GuildRank.G, sampleRankDataG],
      [GuildRank.F, sampleRankDataF],
      [GuildRank.S, sampleRankDataS],
    ]);
    rankManagementService = new RankManagementService(rankDataMap);
  });

  describe('createRankState（ランク状態生成）', () => {
    it('初期ランク状態を生成できる', () => {
      const state = createRankState(GuildRank.G, 100, 30);

      expect(state.currentRank).toBe(GuildRank.G);
      expect(state.promotionGauge).toBe(0);
      expect(state.maxPromotionGauge).toBe(100);
      expect(state.remainingDays).toBe(30);
      expect(state.isInPromotionTest).toBe(false);
      expect(state.promotionTestDaysRemaining).toBeNull();
    });
  });

  describe('addContribution（貢献度加算）', () => {
    it('貢献度を加算できる', () => {
      const state = createRankState(GuildRank.G, 100, 30);

      const newState = rankManagementService.addContribution(state, 50);

      expect(newState.promotionGauge).toBe(50);
    });

    it('貢献度は昇格ゲージ最大値を超えない', () => {
      const state = createRankState(GuildRank.G, 100, 30);

      const newState = rankManagementService.addContribution(state, 150);

      expect(newState.promotionGauge).toBe(100);
    });

    it('負の貢献度は追加されない', () => {
      const state = createRankState(GuildRank.G, 100, 30);
      const stateWithContribution = rankManagementService.addContribution(state, 50);

      const newState = rankManagementService.addContribution(stateWithContribution, -10);

      expect(newState.promotionGauge).toBe(50);
    });
  });

  describe('isPromotionReady（昇格試験発生判定）', () => {
    it('昇格ゲージが満タンになると昇格試験が発生する', () => {
      let state = createRankState(GuildRank.G, 100, 30);
      state = rankManagementService.addContribution(state, 100);

      expect(rankManagementService.isPromotionReady(state)).toBe(true);
    });

    it('昇格ゲージが満タンでなければ昇格試験は発生しない', () => {
      let state = createRankState(GuildRank.G, 100, 30);
      state = rankManagementService.addContribution(state, 99);

      expect(rankManagementService.isPromotionReady(state)).toBe(false);
    });

    it('Sランクでは昇格試験は発生しない', () => {
      const state = createRankState(GuildRank.S, 0, 999);

      expect(rankManagementService.isPromotionReady(state)).toBe(false);
    });
  });

  describe('decrementDay（日数カウント）', () => {
    it('ランク維持日数をカウントできる', () => {
      const state = createRankState(GuildRank.G, 100, 30);

      const newState = rankManagementService.decrementDay(state);

      expect(newState.remainingDays).toBe(29);
    });

    it('残り日数が0以下にならない', () => {
      const state = createRankState(GuildRank.G, 100, 0);

      const newState = rankManagementService.decrementDay(state);

      expect(newState.remainingDays).toBe(0);
    });
  });

  describe('isGameOver（ゲームオーバー判定）', () => {
    it('ランク維持日数超過でゲームオーバー', () => {
      const state = createRankState(GuildRank.G, 100, 0);

      expect(rankManagementService.isGameOver(state)).toBe(true);
    });

    it('残り日数がある場合はゲームオーバーではない', () => {
      const state = createRankState(GuildRank.G, 100, 1);

      expect(rankManagementService.isGameOver(state)).toBe(false);
    });
  });

  describe('isGameClear（ゲームクリア判定）', () => {
    it('Sランク到達でゲームクリア', () => {
      const state = createRankState(GuildRank.S, 0, 999);

      expect(rankManagementService.isGameClear(state)).toBe(true);
    });

    it('Sランク以外ではゲームクリアではない', () => {
      const state = createRankState(GuildRank.A, 500, 10);

      expect(rankManagementService.isGameClear(state)).toBe(false);
    });
  });

  describe('getAvailableQuests（受注可能依頼）', () => {
    it('現在ランクで受注可能な依頼を取得できる', () => {
      const state = createRankState(GuildRank.G, 100, 30);
      const allQuests = [
        { id: 'quest_1', requiredRank: GuildRank.G },
        { id: 'quest_2', requiredRank: GuildRank.F },
        { id: 'quest_3', requiredRank: GuildRank.G },
      ];

      const availableQuests = rankManagementService.getAvailableQuests(state, allQuests);

      expect(availableQuests).toHaveLength(2);
      expect(availableQuests.map((q) => q.id)).toEqual(['quest_1', 'quest_3']);
    });

    it('より高いランクの依頼は受注できない', () => {
      const state = createRankState(GuildRank.G, 100, 30);
      const allQuests = [
        { id: 'quest_1', requiredRank: GuildRank.F },
        { id: 'quest_2', requiredRank: GuildRank.E },
      ];

      const availableQuests = rankManagementService.getAvailableQuests(state, allQuests);

      expect(availableQuests).toHaveLength(0);
    });
  });

  describe('startPromotionTest（昇格試験開始）', () => {
    it('昇格試験を開始できる', () => {
      let state = createRankState(GuildRank.G, 100, 30);
      state = rankManagementService.addContribution(state, 100);

      const result = rankManagementService.startPromotionTest(state);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.isInPromotionTest).toBe(true);
        expect(result.value.promotionTestDaysRemaining).toBe(5);
      }
    });

    it('昇格ゲージが満タンでなければ開始できない', () => {
      const state = createRankState(GuildRank.G, 100, 30);

      const result = rankManagementService.startPromotionTest(state);

      expect(result.success).toBe(false);
    });

    it('Sランクでは昇格試験を開始できない', () => {
      const state = createRankState(GuildRank.S, 0, 999);

      const result = rankManagementService.startPromotionTest(state);

      expect(result.success).toBe(false);
    });
  });

  describe('promoteRank（ランク昇格）', () => {
    it('次のランクに昇格できる', () => {
      let state = createRankState(GuildRank.G, 100, 30);
      state = {
        ...state,
        isInPromotionTest: true,
        promotionTestDaysRemaining: 3,
      };

      const result = rankManagementService.promoteRank(state);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.currentRank).toBe(GuildRank.F);
        expect(result.value.promotionGauge).toBe(0);
        expect(result.value.maxPromotionGauge).toBe(200);
        expect(result.value.remainingDays).toBe(25);
        expect(result.value.isInPromotionTest).toBe(false);
        expect(result.value.promotionTestDaysRemaining).toBeNull();
      }
    });

    it('昇格試験中でなければ昇格できない', () => {
      const state = createRankState(GuildRank.G, 100, 30);

      const result = rankManagementService.promoteRank(state);

      expect(result.success).toBe(false);
    });
  });

  describe('getPromotionTestRequirements（試験課題取得）', () => {
    it('昇格試験の課題を取得できる', () => {
      const state = createRankState(GuildRank.G, 100, 30);

      const requirements = rankManagementService.getPromotionTestRequirements(state);

      expect(requirements).not.toBeNull();
      if (requirements) {
        expect(requirements.requirements).toHaveLength(1);
        expect(requirements.requirements[0].itemId).toBe('healing_potion');
        expect(requirements.dayLimit).toBe(5);
      }
    });

    it('Sランクでは課題がない', () => {
      const state = createRankState(GuildRank.S, 0, 999);

      const requirements = rankManagementService.getPromotionTestRequirements(state);

      expect(requirements).toBeNull();
    });
  });
});
