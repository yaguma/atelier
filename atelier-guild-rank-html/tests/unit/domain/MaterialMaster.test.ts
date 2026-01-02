import { describe, it, expect } from 'vitest';
import { Quality, Attribute } from '../../../src/domain/common/types';
import { IMaterial } from '../../../src/domain/material/Material';

// テスト用にJSONファイルを直接インポート
import materials from '../../../data/master/materials.json';

describe('MaterialMaster', () => {
  const mats = materials as IMaterial[];

  it('素材が定義されている', () => {
    expect(mats.length).toBeGreaterThan(0);
  });

  it('素材のスキーマが正しい', () => {
    mats.forEach((mat) => {
      // 必須フィールドの存在チェック
      expect(mat.id).toBeDefined();
      expect(typeof mat.id).toBe('string');
      expect(mat.name).toBeDefined();
      expect(typeof mat.name).toBe('string');
      expect(Object.values(Quality)).toContain(mat.baseQuality);
      expect(Array.isArray(mat.attributes)).toBe(true);
    });
  });

  it('カテゴリが正しく定義されている（属性配列）', () => {
    mats.forEach((mat) => {
      mat.attributes.forEach((attr) => {
        expect(Object.values(Attribute)).toContain(attr);
      });
    });
  });

  it('レアリティ（品質）が正しく定義されている', () => {
    mats.forEach((mat) => {
      expect(Object.values(Quality)).toContain(mat.baseQuality);
    });
  });

  it('スタック可能フラグが正しい（isRareがboolean or undefined）', () => {
    mats.forEach((mat) => {
      if (mat.isRare !== undefined) {
        expect(typeof mat.isRare).toBe('boolean');
      }
    });
  });

  describe('素材カテゴリ', () => {
    it('基本素材（薬草、水、石など）が存在する', () => {
      const basicMaterials = ['mat_herb', 'mat_water', 'mat_stone'];
      basicMaterials.forEach((id) => {
        expect(mats.some((m) => m.id === id)).toBe(true);
      });
    });

    it('中級素材（鉱石、キノコなど）が存在する', () => {
      const mediumMaterials = ['mat_iron_ore', 'mat_mushroom'];
      mediumMaterials.forEach((id) => {
        expect(mats.some((m) => m.id === id)).toBe(true);
      });
    });

    it('レア素材（火山石、魔法素材など）が存在する', () => {
      const rareMaterials = ['mat_fire_stone', 'mat_magic_stone'];
      rareMaterials.forEach((id) => {
        expect(mats.some((m) => m.id === id)).toBe(true);
      });
    });
  });

  describe('属性バランス', () => {
    it('全ての属性タイプが少なくとも1つ存在する', () => {
      const allAttributes = Object.values(Attribute);
      allAttributes.forEach((attr) => {
        expect(mats.some((m) => m.attributes.includes(attr))).toBe(true);
      });
    });
  });

  describe('品質バランス', () => {
    it('低品質（D, C）の素材が存在する', () => {
      const lowQualityMats = mats.filter(
        (m) => m.baseQuality === Quality.D || m.baseQuality === Quality.C
      );
      expect(lowQualityMats.length).toBeGreaterThan(0);
    });

    it('高品質（A, S）の素材が存在する', () => {
      const highQualityMats = mats.filter(
        (m) => m.baseQuality === Quality.A || m.baseQuality === Quality.S
      );
      expect(highQualityMats.length).toBeGreaterThan(0);
    });
  });

  it('全素材のIDがユニークである', () => {
    const ids = mats.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
