/**
 * HandLayoutUtilsテスト
 *
 * カード配置計算ユーティリティのテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCardPositions,
  CardPosition,
} from '../../../../../src/game/ui/hand/HandLayoutUtils';
import { HandLayout } from '../../../../../src/game/ui/hand/HandConstants';

describe('HandLayoutUtils', () => {
  describe('calculateCardPositions', () => {
    describe('共通', () => {
      it('カード0枚の場合は空配列を返す', () => {
        const positions = calculateCardPositions(0, 'horizontal');
        expect(positions).toEqual([]);
      });

      it('カード1枚の場合は中央に配置', () => {
        const positions = calculateCardPositions(1, 'horizontal', 640, 650);
        expect(positions.length).toBe(1);
        expect(positions[0].x).toBe(640);
        expect(positions[0].y).toBe(650);
      });
    });

    describe('水平レイアウト', () => {
      it('5枚のカードが等間隔で配置される', () => {
        const positions = calculateCardPositions(5, 'horizontal', 640, 650);

        expect(positions.length).toBe(5);

        // 等間隔確認
        for (let i = 1; i < positions.length; i++) {
          const spacing = positions[i].x - positions[i - 1].x;
          expect(spacing).toBe(HandLayout.CARD_SPACING);
        }
      });

      it('カードが中央を基準に配置される', () => {
        const centerX = 640;
        const positions = calculateCardPositions(5, 'horizontal', centerX, 650);

        // 中央のカード（3番目）が中央に近い
        const middleIndex = Math.floor(positions.length / 2);
        expect(positions[middleIndex].x).toBe(centerX);
      });

      it('Y座標は全て同じ', () => {
        const positions = calculateCardPositions(5, 'horizontal', 640, 650);

        positions.forEach((pos) => {
          expect(pos.y).toBe(650);
        });
      });

      it('回転角度は0', () => {
        const positions = calculateCardPositions(5, 'horizontal', 640, 650);

        positions.forEach((pos) => {
          expect(pos.rotation).toBe(0);
        });
      });

      it('depthが順番に設定される', () => {
        const positions = calculateCardPositions(5, 'horizontal', 640, 650);

        positions.forEach((pos, index) => {
          expect(pos.depth).toBe(index);
        });
      });

      it('scaleは1', () => {
        const positions = calculateCardPositions(5, 'horizontal', 640, 650);

        positions.forEach((pos) => {
          expect(pos.scale).toBe(1);
        });
      });
    });

    describe('扇形レイアウト', () => {
      it('5枚のカードが扇形に配置される', () => {
        const positions = calculateCardPositions(5, 'fan', 640, 650);

        expect(positions.length).toBe(5);
      });

      it('左端のカードは負の回転角度を持つ', () => {
        const positions = calculateCardPositions(5, 'fan', 640, 650);

        expect(positions[0].rotation).toBeLessThan(0);
      });

      it('右端のカードは正の回転角度を持つ', () => {
        const positions = calculateCardPositions(5, 'fan', 640, 650);

        expect(positions[positions.length - 1].rotation).toBeGreaterThan(0);
      });

      it('中央のカードは回転角度が0に近い', () => {
        const positions = calculateCardPositions(5, 'fan', 640, 650);

        const middleIndex = Math.floor(positions.length / 2);
        expect(Math.abs(positions[middleIndex].rotation)).toBeLessThan(0.01);
      });

      it('depthが順番に設定される', () => {
        const positions = calculateCardPositions(5, 'fan', 640, 650);

        positions.forEach((pos, index) => {
          expect(pos.depth).toBe(index);
        });
      });

      it('1枚の場合は中央に回転なしで配置', () => {
        const positions = calculateCardPositions(1, 'fan', 640, 650);

        expect(positions.length).toBe(1);
        expect(positions[0].x).toBe(640);
        expect(positions[0].rotation).toBe(0);
      });
    });

    describe('カスタム位置', () => {
      it('カスタム中心座標が使用される', () => {
        const customX = 400;
        const customY = 500;
        const positions = calculateCardPositions(1, 'horizontal', customX, customY);

        expect(positions[0].x).toBe(customX);
        expect(positions[0].y).toBe(customY);
      });
    });
  });

  describe('CardPosition型', () => {
    it('必要なプロパティを持つ', () => {
      const pos: CardPosition = {
        x: 100,
        y: 200,
        rotation: 0.1,
        scale: 1,
        depth: 0,
      };

      expect(pos.x).toBeDefined();
      expect(pos.y).toBeDefined();
      expect(pos.rotation).toBeDefined();
      expect(pos.scale).toBeDefined();
      expect(pos.depth).toBeDefined();
    });
  });
});
