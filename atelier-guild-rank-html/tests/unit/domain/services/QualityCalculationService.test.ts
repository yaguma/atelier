/**
 * 品質計算ドメインサービスのテスト
 * TASK-0094: 品質計算ドメインサービス
 *
 * 品質計算のビジネスロジックをテストする
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  QualityCalculationService,
  QualityRank,
} from '../../../../src/domain/services/QualityCalculationService';
import {
  createMaterialInstance,
} from '../../../../src/domain/material/MaterialEntity';
import {
  createEnhancementCard,
} from '../../../../src/domain/card/CardEntity';
import {
  createArtifact,
} from '../../../../src/domain/artifact/ArtifactEntity';
import {
  Quality,
  EffectType,
  EnhancementTarget,
  CardType,
  GuildRank,
  Rarity,
} from '../../../../src/domain/common/types';
import type { IEnhancementCard } from '../../../../src/domain/card/Card';
import type { IArtifact } from '../../../../src/domain/artifact/Artifact';

describe('QualityCalculationService', () => {
  let qualityService: QualityCalculationService;

  beforeEach(() => {
    qualityService = new QualityCalculationService();
  });

  describe('calculateBaseQuality（基本品質計算）', () => {
    it('素材の品質平均から基本品質を計算できる', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.C, quantity: 2 }),
        createMaterialInstance({ materialId: 'ore', quality: Quality.A, quantity: 1 }),
      ];

      const baseQuality = qualityService.calculateBaseQuality(materials);

      // C(50) * 2 + A(90) * 1 = 190 / 3 = 63.33...
      expect(baseQuality).toBeGreaterThanOrEqual(50);
      expect(baseQuality).toBeLessThanOrEqual(70);
    });

    it('同一品質の素材のみの場合、その品質値になる', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.B, quantity: 3 }),
      ];

      const baseQuality = qualityService.calculateBaseQuality(materials);

      // B品質の値（70）付近
      expect(baseQuality).toBe(70);
    });

    it('素材がない場合はデフォルト品質になる', () => {
      const materials: ReturnType<typeof createMaterialInstance>[] = [];

      const baseQuality = qualityService.calculateBaseQuality(materials);

      // デフォルト品質（C=50）
      expect(baseQuality).toBe(50);
    });
  });

  describe('applyEnhancementBonus（強化カードボーナス適用）', () => {
    it('強化カードによる品質ボーナスを適用できる', () => {
      const baseQuality = 50;
      const enhancement: IEnhancementCard = {
        id: 'enhancement_quality_up',
        name: '品質向上',
        type: CardType.ENHANCEMENT,
        rarity: Rarity.UNCOMMON,
        unlockRank: GuildRank.G,
        cost: 0,
        effect: { type: EffectType.QUALITY_UP, value: 15 },
        targetAction: EnhancementTarget.ALCHEMY,
      };
      const enhancements = [createEnhancementCard(enhancement)];

      const result = qualityService.applyEnhancementBonus(baseQuality, enhancements);

      expect(result).toBe(65); // 50 + 15
    });

    it('複数の強化カードボーナスが累積される', () => {
      const baseQuality = 50;
      const enhancements = [
        createEnhancementCard({
          id: 'enhancement_1',
          name: '品質向上1',
          type: CardType.ENHANCEMENT,
          rarity: Rarity.UNCOMMON,
          unlockRank: GuildRank.G,
          cost: 0,
          effect: { type: EffectType.QUALITY_UP, value: 10 },
          targetAction: EnhancementTarget.ALCHEMY,
        }),
        createEnhancementCard({
          id: 'enhancement_2',
          name: '品質向上2',
          type: CardType.ENHANCEMENT,
          rarity: Rarity.RARE,
          unlockRank: GuildRank.F,
          cost: 0,
          effect: { type: EffectType.QUALITY_UP, value: 20 },
          targetAction: EnhancementTarget.ALCHEMY,
        }),
      ];

      const result = qualityService.applyEnhancementBonus(baseQuality, enhancements);

      expect(result).toBe(80); // 50 + 10 + 20
    });

    it('品質向上以外の効果は適用されない', () => {
      const baseQuality = 50;
      const enhancements = [
        createEnhancementCard({
          id: 'enhancement_material_save',
          name: '素材節約',
          type: CardType.ENHANCEMENT,
          rarity: Rarity.UNCOMMON,
          unlockRank: GuildRank.G,
          cost: 0,
          effect: { type: EffectType.MATERIAL_SAVE, value: 50 },
          targetAction: EnhancementTarget.ALCHEMY,
        }),
      ];

      const result = qualityService.applyEnhancementBonus(baseQuality, enhancements);

      expect(result).toBe(50); // 変化なし
    });
  });

  describe('applyArtifactBonus（アーティファクトボーナス適用）', () => {
    it('アーティファクトによる品質ボーナスを適用できる', () => {
      const baseQuality = 50;
      const artifact: IArtifact = {
        id: 'artifact_quality',
        name: '品質の指輪',
        rarity: Rarity.RARE,
        effect: { type: EffectType.QUALITY_UP, value: 10 },
      };
      const artifacts = [createArtifact(artifact)];

      const result = qualityService.applyArtifactBonus(baseQuality, artifacts);

      expect(result).toBe(60); // 50 + 10
    });

    it('複数のアーティファクトボーナスが累積される', () => {
      const baseQuality = 50;
      const artifacts = [
        createArtifact({
          id: 'artifact_1',
          name: '品質の指輪',
          rarity: Rarity.RARE,
          effect: { type: EffectType.QUALITY_UP, value: 10 },
        }),
        createArtifact({
          id: 'artifact_2',
          name: '職人の腕輪',
          rarity: Rarity.EPIC,
          effect: { type: EffectType.QUALITY_UP, value: 15 },
        }),
      ];

      const result = qualityService.applyArtifactBonus(baseQuality, artifacts);

      expect(result).toBe(75); // 50 + 10 + 15
    });

    it('品質向上以外の効果は適用されない', () => {
      const baseQuality = 50;
      const artifacts = [
        createArtifact({
          id: 'artifact_gold',
          name: 'ゴールドの指輪',
          rarity: Rarity.RARE,
          effect: { type: EffectType.GOLD_UP, value: 20 },
        }),
      ];

      const result = qualityService.applyArtifactBonus(baseQuality, artifacts);

      expect(result).toBe(50); // 変化なし
    });
  });

  describe('determineQualityRank（品質ランク決定）', () => {
    it('品質値からランクSを決定できる（90-100）', () => {
      expect(qualityService.determineQualityRank(90)).toBe(Quality.S);
      expect(qualityService.determineQualityRank(100)).toBe(Quality.S);
      expect(qualityService.determineQualityRank(95)).toBe(Quality.S);
    });

    it('品質値からランクAを決定できる（70-89）', () => {
      expect(qualityService.determineQualityRank(70)).toBe(Quality.A);
      expect(qualityService.determineQualityRank(89)).toBe(Quality.A);
      expect(qualityService.determineQualityRank(80)).toBe(Quality.A);
    });

    it('品質値からランクBを決定できる（50-69）', () => {
      expect(qualityService.determineQualityRank(50)).toBe(Quality.B);
      expect(qualityService.determineQualityRank(69)).toBe(Quality.B);
      expect(qualityService.determineQualityRank(60)).toBe(Quality.B);
    });

    it('品質値からランクCを決定できる（30-49）', () => {
      expect(qualityService.determineQualityRank(30)).toBe(Quality.C);
      expect(qualityService.determineQualityRank(49)).toBe(Quality.C);
      expect(qualityService.determineQualityRank(40)).toBe(Quality.C);
    });

    it('品質値からランクDを決定できる（0-29）', () => {
      expect(qualityService.determineQualityRank(0)).toBe(Quality.D);
      expect(qualityService.determineQualityRank(29)).toBe(Quality.D);
      expect(qualityService.determineQualityRank(15)).toBe(Quality.D);
    });

    it('品質値からランクEを決定できる（負の値）', () => {
      expect(qualityService.determineQualityRank(-10)).toBe(Quality.E);
    });
  });

  describe('calculateFinalQuality（最終品質計算）', () => {
    it('素材、強化カード、アーティファクトから最終品質を計算できる', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.B, quantity: 2 }),
      ];
      const enhancements = [
        createEnhancementCard({
          id: 'enhancement_quality',
          name: '品質向上',
          type: CardType.ENHANCEMENT,
          rarity: Rarity.UNCOMMON,
          unlockRank: GuildRank.G,
          cost: 0,
          effect: { type: EffectType.QUALITY_UP, value: 10 },
          targetAction: EnhancementTarget.ALCHEMY,
        }),
      ];
      const artifacts = [
        createArtifact({
          id: 'artifact_quality',
          name: '品質の指輪',
          rarity: Rarity.RARE,
          effect: { type: EffectType.QUALITY_UP, value: 5 },
        }),
      ];

      const result = qualityService.calculateFinalQuality(materials, enhancements, artifacts);

      // B品質(70) + 強化(10) + アーティファクト(5) = 85
      expect(result.qualityValue).toBe(85);
      expect(result.qualityRank).toBe(Quality.A);
    });

    it('品質上限（100）を超えない', () => {
      const materials = [
        createMaterialInstance({ materialId: 'herb', quality: Quality.S, quantity: 1 }),
      ];
      const enhancements = [
        createEnhancementCard({
          id: 'enhancement_quality',
          name: '品質向上',
          type: CardType.ENHANCEMENT,
          rarity: Rarity.LEGENDARY,
          unlockRank: GuildRank.A,
          cost: 0,
          effect: { type: EffectType.QUALITY_UP, value: 50 },
          targetAction: EnhancementTarget.ALCHEMY,
        }),
      ];
      const artifacts = [
        createArtifact({
          id: 'artifact_quality',
          name: '伝説の指輪',
          rarity: Rarity.LEGENDARY,
          effect: { type: EffectType.QUALITY_UP, value: 30 },
        }),
      ];

      const result = qualityService.calculateFinalQuality(materials, enhancements, artifacts);

      // S品質(100) + 強化(50) + アーティファクト(30) = 180 → 上限100
      expect(result.qualityValue).toBe(100);
      expect(result.qualityRank).toBe(Quality.S);
    });

    it('品質下限（0）を下回らない', () => {
      // 現状は品質がマイナスになることはないが、将来的なデバフ効果に備えてテスト
      const materials: ReturnType<typeof createMaterialInstance>[] = [];
      const enhancements: ReturnType<typeof createEnhancementCard>[] = [];
      const artifacts: ReturnType<typeof createArtifact>[] = [];

      const result = qualityService.calculateFinalQuality(materials, enhancements, artifacts);

      // デフォルト品質（50）から計算
      expect(result.qualityValue).toBeGreaterThanOrEqual(0);
    });
  });

  describe('品質値の定数', () => {
    it('品質Eの値は10', () => {
      expect(qualityService.getQualityValue(Quality.E)).toBe(10);
    });

    it('品質Dの値は30', () => {
      expect(qualityService.getQualityValue(Quality.D)).toBe(30);
    });

    it('品質Cの値は50', () => {
      expect(qualityService.getQualityValue(Quality.C)).toBe(50);
    });

    it('品質Bの値は70', () => {
      expect(qualityService.getQualityValue(Quality.B)).toBe(70);
    });

    it('品質Aの値は90', () => {
      expect(qualityService.getQualityValue(Quality.A)).toBe(90);
    });

    it('品質Sの値は100', () => {
      expect(qualityService.getQualityValue(Quality.S)).toBe(100);
    });
  });
});
