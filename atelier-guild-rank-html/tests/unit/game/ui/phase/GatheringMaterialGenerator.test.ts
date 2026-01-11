/**
 * GatheringMaterialGenerator単体テスト
 *
 * TASK-0223: GatheringContainer素材提示実装のテスト
 * 素材生成ロジックをテストする
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  Attribute,
  CardType,
  GuildRank,
  Quality,
  Rarity,
} from '../../../../../src/domain/common/types';
import { GatheringCard } from '../../../../../src/domain/card/CardEntity';
import { Material } from '../../../../../src/domain/material/MaterialEntity';
import { GatheringMaterialGenerator } from '../../../../../src/game/ui/phase/GatheringMaterialGenerator';

/**
 * テスト用の素材マスターデータを作成
 */
function createMaterialMaster(): Map<string, Material> {
  const materials = new Map<string, Material>();

  materials.set(
    'mat-herb',
    new Material({
      id: 'mat-herb',
      name: '薬草',
      baseQuality: Quality.C,
      attributes: [Attribute.GRASS],
      isRare: false,
      description: '一般的な薬草',
    })
  );

  materials.set(
    'mat-ore',
    new Material({
      id: 'mat-ore',
      name: '鉄鉱石',
      baseQuality: Quality.C,
      attributes: [Attribute.EARTH],
      isRare: false,
      description: '一般的な鉱石',
    })
  );

  materials.set(
    'mat-rare-crystal',
    new Material({
      id: 'mat-rare-crystal',
      name: '輝石',
      baseQuality: Quality.A,
      attributes: [Attribute.EARTH, Attribute.FIRE],
      isRare: true,
      description: 'レアな輝く結晶',
    })
  );

  return materials;
}

/**
 * テスト用の採取カードを作成
 */
function createTestGatheringCard(
  materials: { materialId: string; quantity: number; probability: number }[]
): GatheringCard {
  return new GatheringCard({
    id: 'gather-test',
    name: 'テスト採取地',
    type: CardType.GATHERING,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: 'テスト用採取地',
    cost: 2,
    materials: materials,
  });
}

describe('GatheringMaterialGenerator', () => {
  let generator: GatheringMaterialGenerator;
  let materialMaster: Map<string, Material>;

  beforeEach(() => {
    // 固定シードで初期化（テストの再現性確保）
    generator = new GatheringMaterialGenerator(12345);
    materialMaster = createMaterialMaster();
  });

  describe('generateMaterialOptions', () => {
    it('採取地カードから素材選択肢を生成できる', () => {
      const card = createTestGatheringCard([
        { materialId: 'mat-herb', quantity: 2, probability: 1.0 },
        { materialId: 'mat-ore', quantity: 1, probability: 1.0 },
      ]);

      const options = generator.generateMaterialOptions(card, materialMaster);

      expect(options.length).toBeGreaterThanOrEqual(1);
      expect(options.every((opt) => opt.material)).toBe(true);
    });

    it('確率1.0の素材は必ず出現する', () => {
      // 確実なシードで初期化
      generator = new GatheringMaterialGenerator(0);

      const card = createTestGatheringCard([
        { materialId: 'mat-herb', quantity: 1, probability: 1.0 },
      ]);

      const options = generator.generateMaterialOptions(card, materialMaster);

      expect(options.length).toBe(1);
      expect(options[0].material.id).toBe('mat-herb');
    });

    it('確率0の素材は出現しない（最低保証を除く）', () => {
      // 確率0の素材のみのカード（複数ある場合、最低1つは出現保証）
      const card = createTestGatheringCard([
        { materialId: 'mat-herb', quantity: 1, probability: 0 },
        { materialId: 'mat-ore', quantity: 1, probability: 1.0 },
      ]);

      const options = generator.generateMaterialOptions(card, materialMaster);

      // mat-oreのみ出現するはず
      expect(options.length).toBe(1);
      expect(options[0].material.id).toBe('mat-ore');
    });

    it('素材数量が計算される', () => {
      const card = createTestGatheringCard([
        { materialId: 'mat-herb', quantity: 3, probability: 1.0 },
      ]);

      const options = generator.generateMaterialOptions(card, materialMaster);

      expect(options.length).toBe(1);
      // 数量は baseQuantity ± 1 の範囲
      expect(options[0].quantity).toBeGreaterThanOrEqual(2);
      expect(options[0].quantity).toBeLessThanOrEqual(4);
    });

    it('素材が見つからない場合は除外される', () => {
      const card = createTestGatheringCard([
        { materialId: 'nonexistent-material', quantity: 1, probability: 1.0 },
        { materialId: 'mat-herb', quantity: 1, probability: 1.0 },
      ]);

      const options = generator.generateMaterialOptions(card, materialMaster);

      // 存在する素材のみ返る
      expect(options.length).toBe(1);
      expect(options[0].material.id).toBe('mat-herb');
    });

    it('空の素材マップの場合は空配列を返す', () => {
      const card = createTestGatheringCard([
        { materialId: 'mat-herb', quantity: 1, probability: 1.0 },
      ]);

      const options = generator.generateMaterialOptions(
        card,
        new Map<string, Material>()
      );

      expect(options.length).toBe(0);
    });
  });

  describe('最低保証', () => {
    it('全素材が確率判定で落ちても最低1つは出現する', () => {
      // シードを調整して全て失敗するケースを作る
      // 確率が低い場合でもフォールバックが働く
      const card = createTestGatheringCard([
        { materialId: 'mat-herb', quantity: 1, probability: 0.001 },
        { materialId: 'mat-ore', quantity: 1, probability: 0.001 },
      ]);

      // 何度試行しても少なくとも1つは返る
      for (let seed = 0; seed < 10; seed++) {
        generator.resetSeed(seed);
        const options = generator.generateMaterialOptions(card, materialMaster);
        expect(options.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('素材がカードにない場合は空配列', () => {
      const card = createTestGatheringCard([]);

      const options = generator.generateMaterialOptions(card, materialMaster);

      expect(options.length).toBe(0);
    });
  });

  describe('isRareMaterial', () => {
    it('確率30%未満の素材はレア判定される', () => {
      expect(generator.isRareMaterial(0.1)).toBe(true);
      expect(generator.isRareMaterial(0.2)).toBe(true);
      expect(generator.isRareMaterial(0.29)).toBe(true);
    });

    it('確率30%以上の素材はレア判定されない', () => {
      expect(generator.isRareMaterial(0.3)).toBe(false);
      expect(generator.isRareMaterial(0.5)).toBe(false);
      expect(generator.isRareMaterial(1.0)).toBe(false);
    });

    it('境界値のテスト', () => {
      expect(generator.isRareMaterial(0.299)).toBe(true);
      expect(generator.isRareMaterial(0.3)).toBe(false);
      expect(generator.isRareMaterial(0.301)).toBe(false);
    });
  });

  describe('シード乱数', () => {
    it('同じシードで同じ結果が得られる', () => {
      const card = createTestGatheringCard([
        { materialId: 'mat-herb', quantity: 2, probability: 0.8 },
        { materialId: 'mat-ore', quantity: 1, probability: 0.5 },
        { materialId: 'mat-rare-crystal', quantity: 1, probability: 0.2 },
      ]);

      // シードをリセットして同じ結果を確認
      generator.resetSeed(54321);
      const options1 = generator.generateMaterialOptions(card, materialMaster);

      generator.resetSeed(54321);
      const options2 = generator.generateMaterialOptions(card, materialMaster);

      expect(options1.length).toBe(options2.length);
      for (let i = 0; i < options1.length; i++) {
        expect(options1[i].material.id).toBe(options2[i].material.id);
        expect(options1[i].quantity).toBe(options2[i].quantity);
      }
    });

    it('resetSeedでシードを再設定できる', () => {
      generator.resetSeed(99999);

      const card = createTestGatheringCard([
        { materialId: 'mat-herb', quantity: 1, probability: 1.0 },
      ]);

      const options = generator.generateMaterialOptions(card, materialMaster);

      expect(options.length).toBe(1);
    });
  });

  describe('probability情報', () => {
    it('生成された素材選択肢にprobabilityが含まれる', () => {
      const card = createTestGatheringCard([
        { materialId: 'mat-herb', quantity: 1, probability: 0.8 },
      ]);

      const options = generator.generateMaterialOptions(card, materialMaster);

      expect(options.length).toBe(1);
      expect(options[0].probability).toBe(0.8);
    });
  });
});
