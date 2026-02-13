/**
 * Gathering Feature Public API Tests
 * TASK-0075: features/gathering/index.ts公開API作成
 *
 * 採取機能の公開APIが正しくエクスポートされていることを検証
 */

import type {
  DraftSession,
  GatherInput,
  GatheringCostResult,
  GatheringResult,
  GatherResult,
  IGatheringCard,
  IGatheringMaterial,
  IGatheringService,
  IMaterial,
  IMaterialInstance,
  MaterialDisplay,
  MaterialOption,
  SelectionError,
  SelectionResult,
} from '@features/gathering';
import {
  calculateGatheringCost,
  GatheringPhaseUI,
  gather,
  isGatheringCard,
  MaterialSlotUI,
  selectGatheringOption,
} from '@features/gathering';
import { describe, expect, it } from 'vitest';

describe('features/gathering 公開API', () => {
  describe('Types エクスポート', () => {
    it('IGatheringCard型がインポートできる', () => {
      const _typeCheck: IGatheringCard | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('IGatheringMaterial型がインポートできる', () => {
      const _typeCheck: IGatheringMaterial | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('IGatheringService型がインポートできる', () => {
      const _typeCheck: IGatheringService | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('DraftSession型がインポートできる', () => {
      const _typeCheck: DraftSession | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('GatheringCostResult型がインポートできる', () => {
      const _typeCheck: GatheringCostResult | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('GatheringResult型がインポートできる', () => {
      const _typeCheck: GatheringResult | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('MaterialOption型がインポートできる', () => {
      const _typeCheck: MaterialOption | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('IMaterial型がインポートできる', () => {
      const _typeCheck: IMaterial | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('IMaterialInstance型がインポートできる', () => {
      const _typeCheck: IMaterialInstance | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('MaterialDisplay型がインポートできる', () => {
      const _typeCheck: MaterialDisplay | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });
  });

  describe('Services エクスポート', () => {
    it('isGatheringCard関数がエクスポートされている', () => {
      expect(typeof isGatheringCard).toBe('function');
    });

    it('calculateGatheringCost関数がエクスポートされている', () => {
      expect(typeof calculateGatheringCost).toBe('function');
    });

    it('gather関数がエクスポートされている', () => {
      expect(typeof gather).toBe('function');
    });

    it('selectGatheringOption関数がエクスポートされている', () => {
      expect(typeof selectGatheringOption).toBe('function');
    });

    it('GatherInput型がインポートできる', () => {
      const _typeCheck: GatherInput | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('GatherResult型がインポートできる', () => {
      const _typeCheck: GatherResult | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('SelectionError型がインポートできる', () => {
      const _typeCheck: SelectionError | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });

    it('SelectionResult型がインポートできる', () => {
      const _typeCheck: SelectionResult | undefined = undefined;
      expect(_typeCheck).toBeUndefined();
    });
  });

  describe('Components エクスポート', () => {
    it('GatheringPhaseUIがエクスポートされている', () => {
      expect(GatheringPhaseUI).toBeDefined();
      expect(typeof GatheringPhaseUI).toBe('function');
    });

    it('MaterialSlotUIがエクスポートされている', () => {
      expect(MaterialSlotUI).toBeDefined();
      expect(typeof MaterialSlotUI).toBe('function');
    });
  });

  describe('動的インポートの検証', () => {
    it('@features/gatheringから全てのエクスポートが利用可能', async () => {
      const mod = await import('@features/gathering');

      // 関数エクスポート
      expect(typeof mod.isGatheringCard).toBe('function');
      expect(typeof mod.calculateGatheringCost).toBe('function');
      expect(typeof mod.gather).toBe('function');
      expect(typeof mod.selectGatheringOption).toBe('function');

      // コンポーネントエクスポート
      expect(typeof mod.GatheringPhaseUI).toBe('function');
      expect(typeof mod.MaterialSlotUI).toBe('function');
    });
  });
});
