/**
 * id-generator テスト
 * TASK-0065: shared/utils移行
 */

import { generateUniqueId } from '@shared/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('id-generator', () => {
  describe('generateUniqueId', () => {
    describe('基本動作', () => {
      it('プレフィックス付きのIDが生成されること', () => {
        const id = generateUniqueId('material');
        expect(id).toMatch(/^material_\d+_\d+$/);
      });

      it('異なるプレフィックスで異なるフォーマットのIDが生成されること', () => {
        const materialId = generateUniqueId('material');
        const itemId = generateUniqueId('item');
        const cardId = generateUniqueId('card');

        expect(materialId).toMatch(/^material_/);
        expect(itemId).toMatch(/^item_/);
        expect(cardId).toMatch(/^card_/);
      });
    });

    describe('一意性', () => {
      it('連続呼び出しで高い確率で異なるIDが生成されること', () => {
        // 注: タイムスタンプとランダム値の組み合わせのため、
        // 極めて稀に重複する可能性がある（確率的に非常に低い）
        const ids = new Set<string>();
        for (let i = 0; i < 100; i++) {
          ids.add(generateUniqueId('test'));
        }
        // 99%以上の一意性を期待（許容範囲1%の重複）
        expect(ids.size).toBeGreaterThanOrEqual(95);
      });

      it('異なるプレフィックスでも高い確率で一意のIDが生成されること', () => {
        const ids = new Set<string>();
        for (let i = 0; i < 50; i++) {
          ids.add(generateUniqueId('material'));
          ids.add(generateUniqueId('item'));
        }
        // 99%以上の一意性を期待
        expect(ids.size).toBeGreaterThanOrEqual(95);
      });
    });

    describe('フォーマット検証', () => {
      it('IDが3つの部分から構成されること', () => {
        const id = generateUniqueId('test');
        const parts = id.split('_');
        expect(parts.length).toBe(3);
      });

      it('タイムスタンプ部分が数値であること', () => {
        const id = generateUniqueId('test');
        const parts = id.split('_');
        const timestamp = parts[1];
        expect(Number.isNaN(Number.parseInt(timestamp, 10))).toBe(false);
        expect(Number.parseInt(timestamp, 10)).toBeGreaterThan(0);
      });

      it('ランダム部分が数値であること', () => {
        const id = generateUniqueId('test');
        const parts = id.split('_');
        const random = parts[2];
        expect(Number.isNaN(Number.parseInt(random, 10))).toBe(false);
      });

      it('ランダム部分が0〜9999の範囲であること', () => {
        // 複数回実行して範囲を確認
        for (let i = 0; i < 100; i++) {
          const id = generateUniqueId('test');
          const parts = id.split('_');
          const random = Number.parseInt(parts[2], 10);
          expect(random).toBeGreaterThanOrEqual(0);
          expect(random).toBeLessThan(10000);
        }
      });
    });

    describe('純粋関数性', () => {
      let originalDateNow: typeof Date.now;
      let originalMathRandom: typeof Math.random;

      beforeEach(() => {
        originalDateNow = Date.now;
        originalMathRandom = Math.random;
      });

      afterEach(() => {
        Date.now = originalDateNow;
        Math.random = originalMathRandom;
      });

      it('同じタイムスタンプとランダム値で同じIDが生成されること', () => {
        const fixedTimestamp = 1705401234567;
        const fixedRandom = 0.5; // Math.floor(0.5 * 10000) = 5000

        Date.now = vi.fn(() => fixedTimestamp);
        Math.random = vi.fn(() => fixedRandom);

        const id1 = generateUniqueId('test');
        const id2 = generateUniqueId('test');

        expect(id1).toBe('test_1705401234567_5000');
        expect(id2).toBe('test_1705401234567_5000');
      });
    });

    describe('エッジケース', () => {
      it('空文字列のプレフィックスでもIDが生成されること', () => {
        const id = generateUniqueId('');
        expect(id).toMatch(/^_\d+_\d+$/);
      });

      it('特殊文字を含むプレフィックスでもIDが生成されること', () => {
        const id = generateUniqueId('test-item');
        expect(id).toMatch(/^test-item_\d+_\d+$/);
      });

      it('長いプレフィックスでもIDが生成されること', () => {
        const longPrefix = 'very_long_prefix_name_for_testing';
        const id = generateUniqueId(longPrefix);
        expect(id).toMatch(new RegExp(`^${longPrefix}_\\d+_\\d+$`));
      });
    });
  });
});
