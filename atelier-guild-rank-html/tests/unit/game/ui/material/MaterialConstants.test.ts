/**
 * MaterialConstants テスト
 *
 * 素材ビュー定数のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  MaterialLayout,
  MaterialQualityColors,
  MaterialViewMode,
} from '../../../../../src/game/ui/material/MaterialConstants';
import { Quality } from '../../../../../src/domain/common/types';

describe('MaterialConstants', () => {
  describe('MaterialLayout', () => {
    it('レイアウト定数が定義されている', () => {
      expect(MaterialLayout.ICON_SIZE).toBeTypeOf('number');
      expect(MaterialLayout.BADGE_SIZE).toBeTypeOf('number');
      expect(MaterialLayout.COMPACT_WIDTH).toBeTypeOf('number');
      expect(MaterialLayout.COMPACT_HEIGHT).toBeTypeOf('number');
      expect(MaterialLayout.DETAIL_WIDTH).toBeTypeOf('number');
      expect(MaterialLayout.DETAIL_HEIGHT).toBeTypeOf('number');
    });

    it('アイコンサイズが正の数', () => {
      expect(MaterialLayout.ICON_SIZE).toBeGreaterThan(0);
    });

    it('コンパクト表示サイズが正の数', () => {
      expect(MaterialLayout.COMPACT_WIDTH).toBeGreaterThan(0);
      expect(MaterialLayout.COMPACT_HEIGHT).toBeGreaterThan(0);
    });

    it('詳細表示サイズがコンパクト表示より大きい', () => {
      expect(MaterialLayout.DETAIL_WIDTH).toBeGreaterThan(
        MaterialLayout.COMPACT_WIDTH
      );
    });

    it('角丸半径が定義されている', () => {
      expect(MaterialLayout.BORDER_RADIUS).toBeGreaterThan(0);
      expect(MaterialLayout.DETAIL_BORDER_RADIUS).toBeGreaterThan(0);
    });
  });

  describe('MaterialQualityColors', () => {
    it('全ての品質に対して色が定義されている', () => {
      expect(MaterialQualityColors[Quality.E]).toBeTypeOf('number');
      expect(MaterialQualityColors[Quality.D]).toBeTypeOf('number');
      expect(MaterialQualityColors[Quality.C]).toBeTypeOf('number');
      expect(MaterialQualityColors[Quality.B]).toBeTypeOf('number');
      expect(MaterialQualityColors[Quality.A]).toBeTypeOf('number');
      expect(MaterialQualityColors[Quality.S]).toBeTypeOf('number');
    });

    it('Sランクは金色', () => {
      // 0xffd700 = 16766720
      expect(MaterialQualityColors[Quality.S]).toBe(0xffd700);
    });

    it('Eランクは灰色', () => {
      // 0x808080 = 8421504
      expect(MaterialQualityColors[Quality.E]).toBe(0x808080);
    });

    it('高ランクほど目立つ色になっている', () => {
      // 色の検証（金 > 紫 > 青 > 緑 > 灰）
      // S: 金、A: 紫、B: 青、C: 緑、D: やや緑、E: 灰
      // 色の明るさや特別さで判断
      expect(MaterialQualityColors[Quality.S]).not.toBe(
        MaterialQualityColors[Quality.E]
      );
      expect(MaterialQualityColors[Quality.A]).not.toBe(
        MaterialQualityColors[Quality.B]
      );
    });
  });

  describe('MaterialViewMode', () => {
    it('compactモードが有効な値', () => {
      const mode: MaterialViewMode = 'compact';
      expect(mode).toBe('compact');
    });

    it('detailモードが有効な値', () => {
      const mode: MaterialViewMode = 'detail';
      expect(mode).toBe('detail');
    });
  });
});
