/**
 * gathering-types.test.ts - features/gathering/types エクスポートテスト
 *
 * TASK-0072: features/gathering/types作成
 * 型定義が正しくエクスポートされていることを確認する
 */

import type {
  DraftSession,
  GatheringCostResult,
  GatheringResult,
  IGatheringCard,
  IGatheringMaterial,
  IGatheringService,
  IMaterial,
  IMaterialInstance,
  MaterialOption,
} from '@features/gathering/types';
import { isGatheringCard } from '@features/gathering/types';
import type { Card, MaterialId } from '@shared/types';
import { CardType, Quality } from '@shared/types';
import { describe, expect, it } from 'vitest';

describe('features/gathering/types', () => {
  describe('IGatheringService', () => {
    it('@features/gathering/typesからIGatheringServiceがインポートできること', () => {
      // IGatheringServiceが型としてインポートできることを確認
      // コンパイルが通ること自体がテスト
      const _typeCheck: IGatheringService | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('DraftSession型のオブジェクトを作成できること', () => {
      const session: DraftSession = {
        sessionId: 'test-session',
        card: {
          id: 'card-001',
          name: 'Test Card',
          type: CardType.GATHERING,
          rarity: 'COMMON',
          unlockRank: 'G',
          cost: 1,
          materials: [],
        } as unknown as Card,
        currentRound: 1,
        maxRounds: 3,
        selectedMaterials: [],
        currentOptions: [],
        isComplete: false,
      };
      expect(session.sessionId).toBe('test-session');
      expect(session.currentRound).toBe(1);
      expect(session.maxRounds).toBe(3);
      expect(session.isComplete).toBe(false);
    });

    it('MaterialOption型のオブジェクトを作成できること', () => {
      const option: MaterialOption = {
        materialId: 'mat-001' as MaterialId,
        quality: Quality.C,
        quantity: 2,
      };
      expect(option.materialId).toBe('mat-001');
      expect(option.quality).toBe(Quality.C);
      expect(option.quantity).toBe(2);
    });

    it('GatheringResult型のオブジェクトを作成できること', () => {
      const result: GatheringResult = {
        materials: [],
        cost: { actionPointCost: 1, extraDays: 0 },
      };
      expect(result.materials).toEqual([]);
      expect(result.cost.actionPointCost).toBe(1);
      expect(result.cost.extraDays).toBe(0);
    });

    it('GatheringCostResult型のオブジェクトを作成できること', () => {
      const cost: GatheringCostResult = {
        actionPointCost: 3,
        extraDays: 1,
      };
      expect(cost.actionPointCost).toBe(3);
      expect(cost.extraDays).toBe(1);
    });
  });

  describe('採取カード型', () => {
    it('IGatheringCard型がインポートできること', () => {
      const _typeCheck: IGatheringCard | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('IGatheringMaterial型がインポートできること', () => {
      const material: IGatheringMaterial = {
        materialId: 'mat-001' as MaterialId,
        quantity: 1,
        probability: 0.5,
      };
      expect(material.materialId).toBe('mat-001');
      expect(material.probability).toBe(0.5);
    });

    it('isGatheringCard型ガード関数が正しく動作すること', () => {
      const gatheringCard = {
        id: 'card-001',
        name: 'Test Gathering Card',
        type: CardType.GATHERING,
        rarity: 'COMMON',
        unlockRank: 'G',
        cost: 1,
        materials: [],
      } as unknown as Card;

      const recipeCard = {
        id: 'card-002',
        name: 'Test Recipe Card',
        type: CardType.RECIPE,
        rarity: 'COMMON',
        unlockRank: 'G',
        cost: 1,
        requiredMaterials: [],
        outputItemId: 'item-001',
        category: 'CONSUMABLE',
      } as unknown as Card;

      expect(isGatheringCard(gatheringCard)).toBe(true);
      expect(isGatheringCard(recipeCard)).toBe(false);
    });
  });

  describe('素材型', () => {
    it('IMaterial型がインポートできること', () => {
      const material: IMaterial = {
        id: 'mat-001' as MaterialId,
        name: 'Test Material',
        baseQuality: Quality.C,
        attributes: [],
      };
      expect(material.id).toBe('mat-001');
      expect(material.name).toBe('Test Material');
    });

    it('IMaterialInstance型がインポートできること', () => {
      const instance: IMaterialInstance = {
        materialId: 'mat-001' as MaterialId,
        quality: Quality.B,
        quantity: 3,
      };
      expect(instance.materialId).toBe('mat-001');
      expect(instance.quality).toBe(Quality.B);
    });
  });

  describe('index.tsバレルエクスポート', () => {
    it('すべての型と関数が@features/gathering/typesから一括インポートできること', async () => {
      const mod = await import('@features/gathering/types');
      // isGatheringCard関数がエクスポートされていること
      expect(typeof mod.isGatheringCard).toBe('function');
    });
  });
});
