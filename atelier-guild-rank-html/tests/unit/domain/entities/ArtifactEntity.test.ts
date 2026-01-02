/**
 * アーティファクトエンティティのテスト
 * TASK-0089: アーティファクトエンティティ
 *
 * アーティファクトマスターデータエンティティをテストする
 */

import { describe, it, expect } from 'vitest';
import {
  Artifact,
  createArtifact,
} from '../../../../src/domain/artifact/ArtifactEntity';
import { Rarity, EffectType } from '../../../../src/domain/common/types';

describe('Artifact Entity', () => {
  // テスト用データ
  const sampleArtifactData = {
    id: 'artifact_quality_ring',
    name: '品質の指輪',
    effect: {
      type: EffectType.QUALITY_UP,
      value: 10,
    },
    rarity: Rarity.UNCOMMON,
    acquisitionType: 'shop' as const,
    description: '調合品の品質を少し上げる不思議な指輪。',
  };

  const gatheringArtifactData = {
    id: 'artifact_gathering_gloves',
    name: '採取手袋',
    effect: {
      type: EffectType.GATHERING_BONUS,
      value: 1,
    },
    rarity: Rarity.COMMON,
    acquisitionType: 'shop' as const,
    description: '採取時に素材を1つ多く獲得できる手袋。',
  };

  const promotionArtifactData = {
    id: 'artifact_f_rank_medal',
    name: 'Fランク昇格メダル',
    effect: {
      type: EffectType.GATHERING_BONUS,
      value: 1,
    },
    rarity: Rarity.COMMON,
    acquisitionType: 'promotion' as const,
    description: 'Fランク昇格時に授与されるメダル。採取効率が上がる。',
  };

  const rareArtifactData = {
    id: 'artifact_material_pouch',
    name: '素材節約の袋',
    effect: {
      type: EffectType.MATERIAL_SAVE,
      value: 20,
    },
    rarity: Rarity.RARE,
    acquisitionType: 'shop' as const,
    description: '調合時に20%の確率で素材を消費しない魔法の袋。',
  };

  const legendaryArtifactData = {
    id: 'artifact_legendary_charm',
    name: '伝説のチャーム',
    effect: {
      type: EffectType.ALL_BONUS,
      value: 5,
    },
    rarity: Rarity.LEGENDARY,
    acquisitionType: 'shop' as const,
    description: 'すべての効果を少しずつ強化する伝説的なチャーム。',
  };

  describe('Artifact（アーティファクト）', () => {
    it('アーティファクトを生成できる', () => {
      const artifact = createArtifact(sampleArtifactData);

      expect(artifact).toBeInstanceOf(Artifact);
      expect(artifact.id).toBe('artifact_quality_ring');
      expect(artifact.name).toBe('品質の指輪');
    });

    it('レアリティを取得できる', () => {
      const commonArtifact = createArtifact(gatheringArtifactData);
      const rareArtifact = createArtifact(rareArtifactData);
      const legendaryArtifact = createArtifact(legendaryArtifactData);

      expect(commonArtifact.getRarity()).toBe(Rarity.COMMON);
      expect(rareArtifact.getRarity()).toBe(Rarity.RARE);
      expect(legendaryArtifact.getRarity()).toBe(Rarity.LEGENDARY);
    });

    it('パッシブ効果を取得できる', () => {
      const artifact = createArtifact(sampleArtifactData);

      const effect = artifact.getEffect();

      expect(effect.type).toBe(EffectType.QUALITY_UP);
      expect(effect.value).toBe(10);
    });

    it('効果タイプを判定できる', () => {
      const qualityArtifact = createArtifact(sampleArtifactData);
      const gatheringArtifact = createArtifact(gatheringArtifactData);
      const materialSaveArtifact = createArtifact(rareArtifactData);

      expect(qualityArtifact.hasEffectType(EffectType.QUALITY_UP)).toBe(true);
      expect(qualityArtifact.hasEffectType(EffectType.GATHERING_BONUS)).toBe(false);
      expect(gatheringArtifact.hasEffectType(EffectType.GATHERING_BONUS)).toBe(true);
      expect(materialSaveArtifact.hasEffectType(EffectType.MATERIAL_SAVE)).toBe(true);
    });

    it('効果値を取得できる', () => {
      const artifact = createArtifact(sampleArtifactData);

      expect(artifact.getEffectValue()).toBe(10);
    });

    it('取得方法を取得できる', () => {
      const shopArtifact = createArtifact(sampleArtifactData);
      const promotionArtifact = createArtifact(promotionArtifactData);

      expect(shopArtifact.getAcquisitionType()).toBe('shop');
      expect(promotionArtifact.getAcquisitionType()).toBe('promotion');
    });

    it('取得方法が未設定の場合はundefinedを返す', () => {
      const artifactWithoutType = createArtifact({
        ...sampleArtifactData,
        acquisitionType: undefined,
      });

      expect(artifactWithoutType.getAcquisitionType()).toBeUndefined();
    });

    it('ショップ購入かどうかを判定できる', () => {
      const shopArtifact = createArtifact(sampleArtifactData);
      const promotionArtifact = createArtifact(promotionArtifactData);

      expect(shopArtifact.isShopPurchase()).toBe(true);
      expect(promotionArtifact.isShopPurchase()).toBe(false);
    });

    it('昇格報酬かどうかを判定できる', () => {
      const shopArtifact = createArtifact(sampleArtifactData);
      const promotionArtifact = createArtifact(promotionArtifactData);

      expect(shopArtifact.isPromotionReward()).toBe(false);
      expect(promotionArtifact.isPromotionReward()).toBe(true);
    });

    it('説明文を取得できる', () => {
      const artifact = createArtifact(sampleArtifactData);

      expect(artifact.getDescription()).toBe('調合品の品質を少し上げる不思議な指輪。');
    });

    it('説明文が未設定の場合は空文字を返す', () => {
      const artifactWithoutDesc = createArtifact({
        ...sampleArtifactData,
        description: undefined,
      });

      expect(artifactWithoutDesc.getDescription()).toBe('');
    });

    it('レアリティの重みを取得できる', () => {
      const commonArtifact = createArtifact(gatheringArtifactData);
      const uncommonArtifact = createArtifact(sampleArtifactData);
      const rareArtifact = createArtifact(rareArtifactData);
      const legendaryArtifact = createArtifact(legendaryArtifactData);

      expect(commonArtifact.getRarityWeight()).toBe(1);
      expect(uncommonArtifact.getRarityWeight()).toBe(2);
      expect(rareArtifact.getRarityWeight()).toBe(3);
      // EPICは4、LEGENDARYは5として設定
      expect(legendaryArtifact.getRarityWeight()).toBe(5);
    });

    it('不変オブジェクトとして設計されている', () => {
      const artifact = createArtifact(sampleArtifactData);

      const effect1 = artifact.getEffect();
      const effect2 = artifact.getEffect();

      // 異なるオブジェクトが返される（コピーされている）
      expect(effect1).not.toBe(effect2);
      // 値は同じ
      expect(effect1.type).toBe(effect2.type);
      expect(effect1.value).toBe(effect2.value);
    });
  });
});
