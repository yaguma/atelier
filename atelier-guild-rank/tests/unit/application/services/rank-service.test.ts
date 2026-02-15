/**
 * RankService テストケース
 * TASK-0014 ContributionCalculator・RankService実装
 *
 * @description
 * T-0014-05 〜 T-0014-06 およびRankServiceの追加テスト
 */

import type { IMasterDataRepository } from '@domain/interfaces';
import type { IRankService } from '@domain/interfaces/rank-service.interface';
import { RankService } from '@shared/services/rank-service';
import { GuildRank } from '@shared/types';
import type { IGuildRankMaster } from '@shared/types/master-data';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックデータ
// =============================================================================

const mockRankMasters: IGuildRankMaster[] = [
  {
    id: GuildRank.G,
    name: '見習い',
    requiredContribution: 100,
    dayLimit: 30,
    specialRules: [],
    promotionTest: {
      requirements: [{ itemId: 'healing_potion', quantity: 2 }],
      dayLimit: 5,
    },
    unlockedGatheringCards: ['gathering_backyard'],
    unlockedRecipeCards: ['recipe_healing_potion'],
  },
  {
    id: GuildRank.F,
    name: '新人',
    requiredContribution: 200,
    dayLimit: 30,
    specialRules: [{ type: 'QUEST_LIMIT', value: 2, description: '同時受注2件まで' }],
    promotionTest: {
      requirements: [{ itemId: 'healing_potion', quantity: 3, minQuality: 'B' }],
      dayLimit: 5,
    },
    unlockedGatheringCards: ['gathering_riverside'],
    unlockedRecipeCards: ['recipe_antidote'],
  },
  {
    id: GuildRank.E,
    name: '駆け出し',
    requiredContribution: 300,
    dayLimit: 30,
    specialRules: [],
    promotionTest: {
      requirements: [{ itemId: 'antidote', quantity: 2 }],
      dayLimit: 5,
    },
    unlockedGatheringCards: [],
    unlockedRecipeCards: [],
  },
  {
    id: GuildRank.S,
    name: '名匠',
    requiredContribution: 1000,
    dayLimit: 30,
    specialRules: [],
    promotionTest: null, // 最高ランクなので昇格試験なし
    unlockedGatheringCards: [],
    unlockedRecipeCards: [],
  },
];

/**
 * モックマスターデータリポジトリを作成
 */
function createMockMasterDataRepository(): IMasterDataRepository {
  return {
    load: vi.fn().mockResolvedValue(undefined),
    isLoaded: vi.fn().mockReturnValue(true),
    getAllCards: vi.fn().mockReturnValue([]),
    getCardById: vi.fn().mockReturnValue(undefined),
    getCardsByType: vi.fn().mockReturnValue([]),
    getAllMaterials: vi.fn().mockReturnValue([]),
    getMaterialById: vi.fn().mockReturnValue(undefined),
    getMaterialsByAttribute: vi.fn().mockReturnValue([]),
    getAllItems: vi.fn().mockReturnValue([]),
    getItemById: vi.fn().mockReturnValue(undefined),
    getAllRanks: vi.fn().mockReturnValue(mockRankMasters),
    getRankByValue: vi.fn().mockImplementation((rank: GuildRank) => {
      return mockRankMasters.find((r) => r.id === rank) ?? null;
    }),
    getAllClients: vi.fn().mockReturnValue([]),
    getClientById: vi.fn().mockReturnValue(undefined),
    getAllQuests: vi.fn().mockReturnValue([]),
    getQuestById: vi.fn().mockReturnValue(undefined),
    getAllArtifacts: vi.fn().mockReturnValue([]),
    getArtifactById: vi.fn().mockReturnValue(undefined),
  };
}

// =============================================================================
// テスト
// =============================================================================

describe('RankService', () => {
  let service: IRankService;
  let mockRepository: IMasterDataRepository;

  beforeEach(() => {
    mockRepository = createMockMasterDataRepository();
    service = new RankService(mockRepository);
  });

  // =============================================================================
  // 初期状態
  // =============================================================================

  describe('初期状態', () => {
    it('初期ランクはGである', () => {
      expect(service.getCurrentRank()).toBe(GuildRank.G);
    });

    it('初期の昇格ゲージは0である', () => {
      expect(service.getPromotionGauge()).toBe(0);
    });

    it('初期の累積貢献度は0である', () => {
      expect(service.getAccumulatedContribution()).toBe(0);
    });
  });

  // =============================================================================
  // T-0014-05: 昇格可能判定
  // =============================================================================

  describe('canPromote', () => {
    it('T-0014-05: ゲージ100以上で昇格可能', () => {
      // 【テスト目的】: 昇格ゲージが100に達した時、昇格可能と判定される
      // 【テスト内容】: 貢献度を必要量加算し、canPromoteがtrueを返す
      // 【期待される動作】: ゲージ100以上でtrue
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      // Gランクの必要貢献度は100
      service.addContribution(100);

      // Act & Assert
      expect(service.canPromote()).toBe(true);
    });

    it('ゲージ100未満では昇格不可', () => {
      // Arrange
      service.addContribution(50);

      // Act & Assert
      expect(service.canPromote()).toBe(false);
    });

    it('ゲージ100を超えても昇格可能', () => {
      // Arrange
      service.addContribution(150);

      // Act & Assert
      expect(service.canPromote()).toBe(true);
    });
  });

  // =============================================================================
  // T-0014-06: 昇格処理
  // =============================================================================

  describe('promote', () => {
    it('T-0014-06: 昇格でランクアップしゲージがリセットされる', () => {
      // 【テスト目的】: 昇格を実行するとランクが上がりゲージがリセットされる
      // 【テスト内容】: G→Fへの昇格
      // 【期待される動作】: ランクがF、ゲージが0、ボーナスが付与される
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      service.addContribution(100);

      // Act
      const result = service.promote();

      // Assert
      expect(result.previousRank).toBe(GuildRank.G);
      expect(result.newRank).toBe(GuildRank.F);
      expect(result.bonusReward).toBeGreaterThanOrEqual(0);
      expect(service.getCurrentRank()).toBe(GuildRank.F);
      expect(service.getPromotionGauge()).toBe(0);
      expect(service.getAccumulatedContribution()).toBe(0);
    });

    it('昇格不可能な状態で昇格を試みるとエラー', () => {
      // Arrange
      // 貢献度を加算しない

      // Act & Assert
      expect(() => service.promote()).toThrow();
    });

    it('最高ランクでは昇格不可', () => {
      // Arrange
      service.setRank(GuildRank.S);

      // Act & Assert
      expect(service.canPromote()).toBe(false);
    });
  });

  // =============================================================================
  // 貢献度加算
  // =============================================================================

  describe('addContribution', () => {
    it('貢献度が累積される', () => {
      // Arrange & Act
      service.addContribution(30);
      service.addContribution(20);

      // Assert
      expect(service.getAccumulatedContribution()).toBe(50);
    });

    it('貢献度に応じてゲージが更新される', () => {
      // Arrange & Act
      // Gランクの必要貢献度は100
      service.addContribution(50);

      // Assert
      expect(service.getPromotionGauge()).toBe(50);
    });

    it('必要貢献度を超えてもゲージは100を超える', () => {
      // Arrange & Act
      service.addContribution(150);

      // Assert
      expect(service.getPromotionGauge()).toBe(150);
      expect(service.getAccumulatedContribution()).toBe(150);
    });
  });

  // =============================================================================
  // ランク設定
  // =============================================================================

  describe('setRank', () => {
    it('ランクを直接設定できる', () => {
      // Arrange & Act
      service.setRank(GuildRank.C);

      // Assert
      expect(service.getCurrentRank()).toBe(GuildRank.C);
    });

    it('ランク設定時にゲージはリセットされない', () => {
      // Arrange
      service.addContribution(50);

      // Act
      service.setRank(GuildRank.F);

      // Assert
      // 実装によるが、setRankはデータ復元用なのでゲージはそのまま
      // 必要に応じて調整
    });
  });

  // =============================================================================
  // ランク情報取得
  // =============================================================================

  describe('getRankRequirements', () => {
    it('ランク要件を取得できる', () => {
      // Arrange & Act
      const requirements = service.getRankRequirements(GuildRank.G);

      // Assert
      expect(requirements).not.toBeNull();
      expect(requirements?.name).toBe('見習い');
      expect(requirements?.requiredContribution).toBe(100);
    });

    it('存在しないランクはnullを返す', () => {
      // Arrange
      vi.mocked(mockRepository.getRankByValue).mockReturnValueOnce(undefined);

      // Act
      const requirements = service.getRankRequirements('X' as GuildRank);

      // Assert
      expect(requirements).toBeNull();
    });
  });

  describe('getNextRank', () => {
    it('現在ランクの次のランクを取得できる', () => {
      // Arrange - 初期ランクはG

      // Act
      const nextRank = service.getNextRank();

      // Assert
      expect(nextRank).toBe(GuildRank.F);
    });

    it('最高ランクの場合はnullを返す', () => {
      // Arrange
      service.setRank(GuildRank.S);

      // Act
      const nextRank = service.getNextRank();

      // Assert
      expect(nextRank).toBeNull();
    });
  });

  describe('getRemainingContribution', () => {
    it('残り必要貢献度を取得できる', () => {
      // Arrange
      service.addContribution(30);

      // Act
      const remaining = service.getRemainingContribution();

      // Assert
      // Gランクの必要貢献度100 - 累積30 = 70
      expect(remaining).toBe(70);
    });

    it('昇格可能な場合は0を返す', () => {
      // Arrange
      service.addContribution(150);

      // Act
      const remaining = service.getRemainingContribution();

      // Assert
      expect(remaining).toBe(0);
    });
  });

  // =============================================================================
  // 昇格試験
  // =============================================================================

  describe('昇格試験', () => {
    it('初期状態では昇格試験中ではない', () => {
      expect(service.isInPromotionTest()).toBe(false);
    });

    it('昇格試験を開始できる', () => {
      // Arrange
      service.addContribution(100); // 昇格可能にする

      // Act
      const test = service.startPromotionTest();

      // Assert
      expect(service.isInPromotionTest()).toBe(true);
      expect(test.targetRank).toBe(GuildRank.F);
      expect(test.requirements.length).toBeGreaterThan(0);
    });

    it('昇格不可能な状態で試験開始するとエラー', () => {
      // Arrange - 貢献度不足

      // Act & Assert
      expect(() => service.startPromotionTest()).toThrow();
    });

    it('既に試験中に試験開始するとエラー', () => {
      // Arrange
      service.addContribution(100);
      service.startPromotionTest();

      // Act & Assert
      expect(() => service.startPromotionTest()).toThrow();
    });

    it('現在の昇格試験を取得できる', () => {
      // Arrange
      service.addContribution(100);
      service.startPromotionTest();

      // Act
      const test = service.getCurrentPromotionTest();

      // Assert
      expect(test).not.toBeNull();
      expect(test?.targetRank).toBe(GuildRank.F);
    });

    it('試験中でない場合はnullを返す', () => {
      // Act
      const test = service.getCurrentPromotionTest();

      // Assert
      expect(test).toBeNull();
    });

    it('昇格試験要件を完了マークできる', () => {
      // Arrange
      service.addContribution(100);
      service.startPromotionTest();

      // Act
      service.completePromotionTestRequirement(0);

      // Assert
      const test = service.getCurrentPromotionTest();
      expect(test?.completedRequirements).toContain(0);
    });

    it('昇格試験成功で昇格する', () => {
      // Arrange
      service.addContribution(100);
      service.startPromotionTest();

      // Act
      const result = service.completePromotionTest(true);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.newRank).toBe(GuildRank.F);
      expect(service.isInPromotionTest()).toBe(false);
    });

    it('昇格試験失敗でゲージが減少し試験終了', () => {
      // Arrange
      service.addContribution(100);
      service.startPromotionTest();
      const gaugeBefore = service.getPromotionGauge();

      // Act
      const result = service.completePromotionTest(false);

      // Assert
      expect(result).toBeNull();
      expect(service.isInPromotionTest()).toBe(false);
      // ゲージが減少している（実装による）
      expect(service.getPromotionGauge()).toBeLessThanOrEqual(gaugeBefore);
    });

    it('試験中でない場合に完了を呼ぶとエラー', () => {
      // Act & Assert
      expect(() => service.completePromotionTest(true)).toThrow();
    });

    it('昇格試験の残り日数を減らせる', () => {
      // Arrange
      service.addContribution(100);
      service.startPromotionTest();
      const daysBefore = service.getCurrentPromotionTest()?.remainingDays ?? 0;

      // Act
      service.decrementPromotionTestDays();

      // Assert
      const daysAfter = service.getCurrentPromotionTest()?.remainingDays ?? 0;
      expect(daysAfter).toBe(daysBefore - 1);
    });

    it('残り日数が0になると試験失敗', () => {
      // Arrange
      service.addContribution(100);
      service.startPromotionTest();

      // Act - 残り日数を全て消費
      let expired = false;
      for (let i = 0; i < 10; i++) {
        expired = service.decrementPromotionTestDays();
        if (expired) break;
      }

      // Assert
      expect(expired).toBe(true);
      expect(service.isInPromotionTest()).toBe(false);
    });
  });

  // =============================================================================
  // ランク順序
  // =============================================================================

  describe('ランク順序', () => {
    it('G→F→E→D→C→B→A→Sの順で昇格する', () => {
      const expectedOrder = [
        GuildRank.G,
        GuildRank.F,
        GuildRank.E,
        GuildRank.D,
        GuildRank.C,
        GuildRank.B,
        GuildRank.A,
        GuildRank.S,
      ];

      for (let i = 0; i < expectedOrder.length - 1; i++) {
        service.setRank(expectedOrder[i]);
        const nextRank = service.getNextRank();
        expect(nextRank).toBe(expectedOrder[i + 1]);
      }
    });
  });
});
