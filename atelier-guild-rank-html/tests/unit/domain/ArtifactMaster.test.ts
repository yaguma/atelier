/**
 * アーティファクトマスターデータのテスト
 */

import { describe, it, expect } from 'vitest';
import { IArtifact } from '@domain/artifact/Artifact';
import { Rarity, EffectType } from '@domain/common/types';

// テスト用にJSONファイルを直接インポート
import artifactsData from '../../../data/master/artifacts.json';

describe('ArtifactMaster', () => {
  const artifacts = artifactsData as IArtifact[];

  it('アーティファクトが定義されている', () => {
    expect(artifacts.length).toBeGreaterThan(0);
  });

  it('アーティファクトのスキーマが正しい', () => {
    for (const artifact of artifacts) {
      expect(artifact).toHaveProperty('id');
      expect(artifact).toHaveProperty('name');
      expect(artifact).toHaveProperty('effect');
      expect(artifact).toHaveProperty('rarity');
      expect(typeof artifact.id).toBe('string');
      expect(typeof artifact.name).toBe('string');
    }
  });

  it('効果のスキーマが正しい', () => {
    for (const artifact of artifacts) {
      expect(artifact.effect).toHaveProperty('type');
      expect(artifact.effect).toHaveProperty('value');
      expect(Object.values(EffectType)).toContain(artifact.effect.type);
      expect(typeof artifact.effect.value).toBe('number');
    }
  });

  it('レアリティが正しい', () => {
    for (const artifact of artifacts) {
      expect(Object.values(Rarity)).toContain(artifact.rarity);
    }
  });

  it('効果値が正の数である', () => {
    for (const artifact of artifacts) {
      expect(artifact.effect.value).toBeGreaterThan(0);
    }
  });

  describe('取得方法', () => {
    it('取得方法が定義されている場合は正しい値である', () => {
      for (const artifact of artifacts) {
        if (artifact.acquisitionType !== undefined) {
          expect(['shop', 'promotion']).toContain(artifact.acquisitionType);
        }
      }
    });

    it('ショップ購入アーティファクトが存在する', () => {
      const shopArtifacts = artifacts.filter(
        (a) => a.acquisitionType === 'shop'
      );
      expect(shopArtifacts.length).toBeGreaterThan(0);
    });

    it('昇格報酬アーティファクトが存在する', () => {
      const promotionArtifacts = artifacts.filter(
        (a) => a.acquisitionType === 'promotion'
      );
      expect(promotionArtifacts.length).toBeGreaterThan(0);
    });
  });

  describe('レアリティ分布', () => {
    it('複数のレアリティが存在する', () => {
      const rarities = new Set(artifacts.map((a) => a.rarity));
      expect(rarities.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('効果タイプ', () => {
    it('複数の効果タイプが存在する', () => {
      const effectTypes = new Set(artifacts.map((a) => a.effect.type));
      expect(effectTypes.size).toBeGreaterThanOrEqual(2);
    });
  });

  it('全アーティファクトのIDがユニークである', () => {
    const ids = artifacts.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('全アーティファクトに説明があれば文字列である', () => {
    for (const artifact of artifacts) {
      if (artifact.description !== undefined) {
        expect(typeof artifact.description).toBe('string');
        expect(artifact.description.length).toBeGreaterThan(0);
      }
    }
  });
});
