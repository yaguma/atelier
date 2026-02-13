/**
 * Gathering Components Module Tests
 * TASK-0074: features/gathering/components作成
 *
 * 採取機能UIコンポーネントのエクスポート検証テスト
 */

import type { MaterialDisplay } from '@features/gathering/components';
import { GatheringPhaseUI, MaterialSlotUI } from '@features/gathering/components';
import { describe, expect, it } from 'vitest';

describe('features/gathering/components', () => {
  describe('GatheringPhaseUI', () => {
    it('GatheringPhaseUIがエクスポートされている', () => {
      expect(GatheringPhaseUI).toBeDefined();
    });

    it('GatheringPhaseUIはクラスである', () => {
      expect(typeof GatheringPhaseUI).toBe('function');
    });

    it('GatheringPhaseUIはprototypeを持つ', () => {
      expect(GatheringPhaseUI.prototype).toBeDefined();
    });

    it('GatheringPhaseUIはcreateメソッドを持つ', () => {
      expect(typeof GatheringPhaseUI.prototype.create).toBe('function');
    });

    it('GatheringPhaseUIはdestroyメソッドを持つ', () => {
      expect(typeof GatheringPhaseUI.prototype.destroy).toBe('function');
    });

    it('GatheringPhaseUIはupdateSessionメソッドを持つ', () => {
      expect(typeof GatheringPhaseUI.prototype.updateSession).toBe('function');
    });
  });

  describe('MaterialSlotUI', () => {
    it('MaterialSlotUIがエクスポートされている', () => {
      expect(MaterialSlotUI).toBeDefined();
    });

    it('MaterialSlotUIはクラスである', () => {
      expect(typeof MaterialSlotUI).toBe('function');
    });

    it('MaterialSlotUIはprototypeを持つ', () => {
      expect(MaterialSlotUI.prototype).toBeDefined();
    });

    it('MaterialSlotUIはcreateメソッドを持つ', () => {
      expect(typeof MaterialSlotUI.prototype.create).toBe('function');
    });

    it('MaterialSlotUIはdestroyメソッドを持つ', () => {
      expect(typeof MaterialSlotUI.prototype.destroy).toBe('function');
    });

    it('MaterialSlotUIはsetMaterialメソッドを持つ', () => {
      expect(typeof MaterialSlotUI.prototype.setMaterial).toBe('function');
    });

    it('MaterialSlotUIはsetEmptyメソッドを持つ', () => {
      expect(typeof MaterialSlotUI.prototype.setEmpty).toBe('function');
    });

    it('MaterialSlotUIはsetInteractiveメソッドを持つ', () => {
      expect(typeof MaterialSlotUI.prototype.setInteractive).toBe('function');
    });
  });

  describe('MaterialDisplay型', () => {
    it('MaterialDisplay型が正しい構造を持つ', () => {
      const display: MaterialDisplay = {
        id: 'herb' as MaterialDisplay['id'],
        name: '薬草',
        type: 'herb',
        quality: 'B' as MaterialDisplay['quality'],
      };

      expect(display.id).toBe('herb');
      expect(display.name).toBe('薬草');
      expect(display.type).toBe('herb');
      expect(display.quality).toBe('B');
    });

    it('MaterialDisplay型の全フィールドが必須である', () => {
      const display: MaterialDisplay = {
        id: 'ore' as MaterialDisplay['id'],
        name: '鉄鉱',
        type: 'ore',
        quality: 'A' as MaterialDisplay['quality'],
      };

      expect(Object.keys(display)).toHaveLength(4);
      expect(display).toHaveProperty('id');
      expect(display).toHaveProperty('name');
      expect(display).toHaveProperty('type');
      expect(display).toHaveProperty('quality');
    });
  });

  describe('後方互換性', () => {
    it('presentation/ui/components/MaterialSlotUIからの再エクスポートが機能する', async () => {
      const compatModule = await import('@presentation/ui/components/MaterialSlotUI');
      expect(compatModule.MaterialSlotUI).toBe(MaterialSlotUI);
    });

    it('presentation/ui/phases/GatheringPhaseUIからの再エクスポートが機能する', async () => {
      const compatModule = await import('@presentation/ui/phases/GatheringPhaseUI');
      expect(compatModule.GatheringPhaseUI).toBe(GatheringPhaseUI);
    });
  });
});
