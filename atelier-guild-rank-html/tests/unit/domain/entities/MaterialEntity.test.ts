/**
 * 素材エンティティのテスト
 * TASK-0085: 素材エンティティ
 *
 * 素材マスターデータエンティティと素材インスタンスエンティティをテストする
 */

import { describe, it, expect } from 'vitest';
import {
  Material,
  MaterialInstance,
  createMaterial,
  createMaterialInstance,
} from '../../../../src/domain/material/MaterialEntity';
import { Attribute, Quality } from '../../../../src/domain/common/types';

describe('Material Entity', () => {
  // テスト用データ
  const sampleMaterialData = {
    id: 'mat_herb',
    name: '薬草',
    baseQuality: Quality.C,
    attributes: [Attribute.GRASS],
    isRare: false,
    description: 'テスト用の薬草',
  };

  const sampleRareMaterialData = {
    id: 'mat_dragon_scale',
    name: '竜の鱗',
    baseQuality: Quality.S,
    attributes: [Attribute.FIRE],
    isRare: true,
    description: '伝説の素材',
  };

  const sampleMultiAttributeData = {
    id: 'mat_magic_stone',
    name: '魔法石',
    baseQuality: Quality.A,
    attributes: [Attribute.FIRE, Attribute.WATER, Attribute.EARTH, Attribute.WIND],
    isRare: true,
    description: '複数属性を持つ素材',
  };

  describe('Material（素材マスターデータ）', () => {
    it('素材を生成できる', () => {
      const material = createMaterial(sampleMaterialData);

      expect(material).toBeInstanceOf(Material);
      expect(material.id).toBe('mat_herb');
      expect(material.name).toBe('薬草');
    });

    it('カテゴリを取得できる', () => {
      const material = createMaterial(sampleMultiAttributeData);

      const attributes = material.getAttributes();

      expect(attributes).toContain(Attribute.FIRE);
      expect(attributes).toContain(Attribute.WATER);
      expect(attributes).toHaveLength(4);
    });

    it('レアリティを取得できる', () => {
      const material = createMaterial(sampleMaterialData);
      const rareMaterial = createMaterial(sampleRareMaterialData);

      expect(material.getBaseQuality()).toBe(Quality.C);
      expect(rareMaterial.getBaseQuality()).toBe(Quality.S);
    });

    it('レア素材判定ができる', () => {
      const normalMaterial = createMaterial(sampleMaterialData);
      const rareMaterial = createMaterial(sampleRareMaterialData);

      expect(normalMaterial.isRareMaterial()).toBe(false);
      expect(rareMaterial.isRareMaterial()).toBe(true);
    });

    it('isRareが未定義の場合はfalseを返す', () => {
      const materialWithoutRare = createMaterial({
        id: 'mat_test',
        name: 'テスト素材',
        baseQuality: Quality.C,
        attributes: [Attribute.GRASS],
      });

      expect(materialWithoutRare.isRareMaterial()).toBe(false);
    });

    it('特定の属性を持つかどうかを判定できる', () => {
      const material = createMaterial(sampleMultiAttributeData);

      expect(material.hasAttribute(Attribute.FIRE)).toBe(true);
      expect(material.hasAttribute(Attribute.GRASS)).toBe(false);
    });

    it('不変オブジェクトとして設計されている', () => {
      const material = createMaterial(sampleMultiAttributeData);

      // attributesを変更しても元のマテリアルには影響しない
      const attributes = material.getAttributes();
      attributes.push(Attribute.GRASS);

      expect(material.getAttributes()).toHaveLength(4);
      expect(material.hasAttribute(Attribute.GRASS)).toBe(false);
    });
  });

  describe('MaterialInstance（素材インスタンス）', () => {
    const sampleInstanceData = {
      materialId: 'mat_herb',
      quality: Quality.B,
      quantity: 5,
    };

    it('品質を持つ素材を生成できる', () => {
      const instance = createMaterialInstance(sampleInstanceData);

      expect(instance).toBeInstanceOf(MaterialInstance);
      expect(instance.materialId).toBe('mat_herb');
      expect(instance.quality).toBe(Quality.B);
      expect(instance.quantity).toBe(5);
    });

    it('品質を取得できる', () => {
      const instanceC = createMaterialInstance({ ...sampleInstanceData, quality: Quality.C });
      const instanceS = createMaterialInstance({ ...sampleInstanceData, quality: Quality.S });

      expect(instanceC.getQuality()).toBe(Quality.C);
      expect(instanceS.getQuality()).toBe(Quality.S);
    });

    it('数量を取得できる', () => {
      const instance = createMaterialInstance(sampleInstanceData);

      expect(instance.getQuantity()).toBe(5);
    });

    it('同一素材の比較ができる', () => {
      const instance1 = createMaterialInstance({
        materialId: 'mat_herb',
        quality: Quality.B,
        quantity: 5,
      });
      const instance2 = createMaterialInstance({
        materialId: 'mat_herb',
        quality: Quality.B,
        quantity: 3,
      });
      const instance3 = createMaterialInstance({
        materialId: 'mat_herb',
        quality: Quality.A,
        quantity: 5,
      });
      const instance4 = createMaterialInstance({
        materialId: 'mat_water',
        quality: Quality.B,
        quantity: 5,
      });

      // 同一素材ID、同一品質なら同一素材と判定（数量は無視）
      expect(instance1.isSameMaterial(instance2)).toBe(true);
      // 品質が異なれば別素材と判定
      expect(instance1.isSameMaterial(instance3)).toBe(false);
      // 素材IDが異なれば別素材と判定
      expect(instance1.isSameMaterial(instance4)).toBe(false);
    });

    it('同一素材IDの比較ができる（品質無視）', () => {
      const instance1 = createMaterialInstance({
        materialId: 'mat_herb',
        quality: Quality.B,
        quantity: 5,
      });
      const instance2 = createMaterialInstance({
        materialId: 'mat_herb',
        quality: Quality.A,
        quantity: 3,
      });
      const instance3 = createMaterialInstance({
        materialId: 'mat_water',
        quality: Quality.B,
        quantity: 5,
      });

      // 素材IDが同じなら同一素材と判定
      expect(instance1.isSameMaterialId(instance2)).toBe(true);
      // 素材IDが異なれば別素材と判定
      expect(instance1.isSameMaterialId(instance3)).toBe(false);
    });

    it('数量を追加した新しいインスタンスを作成できる', () => {
      const instance = createMaterialInstance(sampleInstanceData);
      const newInstance = instance.addQuantity(3);

      // 元のインスタンスは変更されない
      expect(instance.getQuantity()).toBe(5);
      // 新しいインスタンスは数量が増えている
      expect(newInstance.getQuantity()).toBe(8);
      // 他のプロパティは維持される
      expect(newInstance.materialId).toBe('mat_herb');
      expect(newInstance.quality).toBe(Quality.B);
    });

    it('数量を減らした新しいインスタンスを作成できる', () => {
      const instance = createMaterialInstance(sampleInstanceData);
      const newInstance = instance.subtractQuantity(2);

      expect(instance.getQuantity()).toBe(5);
      expect(newInstance.getQuantity()).toBe(3);
    });

    it('不変オブジェクトとして設計されている', () => {
      const instance = createMaterialInstance(sampleInstanceData);

      // プロパティを変更しようとしても影響がない
      expect(instance.getQuantity()).toBe(5);
      expect(instance.getQuality()).toBe(Quality.B);
    });
  });
});
