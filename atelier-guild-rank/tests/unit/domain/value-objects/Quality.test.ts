/**
 * Quality値オブジェクト テストケース
 * TASK-0010 素材エンティティ・MaterialService実装
 *
 * @description
 * T-0010-Q01 〜 T-0010-Q09 を実装
 */

import {
  compareQuality,
  getHigherQuality,
  getLowerQuality,
  orderToQuality,
  QUALITIES,
  QUALITY_ORDER,
} from '@domain/value-objects/Quality';
import { Quality } from '@shared/types';
import { describe, expect, it } from 'vitest';

describe('Quality値オブジェクト', () => {
  // =============================================================================
  // T-0010-Q01: QUALITY_ORDER定数の定義
  // =============================================================================

  describe('QUALITY_ORDER定数', () => {
    it('T-0010-Q01: QUALITY_ORDER定数が正しく定義されていること', () => {
      // 【テスト目的】: 品質順序定数が正しく定義されていること
      // 【テスト内容】: D=1, C=2, B=3, A=4, S=5の順序が定義されている
      // 【期待される動作】: 各品質に対応する数値が正しく設定されている
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      expect(QUALITY_ORDER[Quality.D]).toBe(1);
      expect(QUALITY_ORDER[Quality.C]).toBe(2);
      expect(QUALITY_ORDER[Quality.B]).toBe(3);
      expect(QUALITY_ORDER[Quality.A]).toBe(4);
      expect(QUALITY_ORDER[Quality.S]).toBe(5);
    });
  });

  // =============================================================================
  // T-0010-Q02〜Q04: 品質比較関数のテスト
  // =============================================================================

  describe('compareQuality', () => {
    it('T-0010-Q02: 品質比較（S > A）', () => {
      // 【テスト目的】: compareQuality()でS > Aが正しく比較されること
      // 【テスト内容】: SとAを比較すると正の数が返される
      // 【期待される動作】: 1が返される（5 - 4 = 1）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      const result = compareQuality(Quality.S, Quality.A);
      expect(result).toBe(1);
      expect(result).toBeGreaterThan(0);
    });

    it('T-0010-Q03: 品質比較（同値 B == B）', () => {
      // 【テスト目的】: compareQuality()でB == Bが正しく比較されること
      // 【テスト内容】: 同じ品質を比較すると0が返される
      // 【期待される動作】: 0が返される（3 - 3 = 0）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      const result = compareQuality(Quality.B, Quality.B);
      expect(result).toBe(0);
    });

    it('T-0010-Q04: 品質比較（C < B）', () => {
      // 【テスト目的】: compareQuality()でC < Bが正しく比較されること
      // 【テスト内容】: CとBを比較すると負の数が返される
      // 【期待される動作】: -1が返される（2 - 3 = -1）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      const result = compareQuality(Quality.C, Quality.B);
      expect(result).toBe(-1);
      expect(result).toBeLessThan(0);
    });
  });

  // =============================================================================
  // T-0010-Q05〜Q06: より高い品質を取得
  // =============================================================================

  describe('getHigherQuality', () => {
    it('T-0010-Q05: より高い品質を取得（A vs C → A）', () => {
      // 【テスト目的】: getHigherQuality()で高い方の品質が返されること
      // 【テスト内容】: AとCを比較してAが返される
      // 【期待される動作】: Aが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      const result = getHigherQuality(Quality.A, Quality.C);
      expect(result).toBe(Quality.A);
    });

    it('T-0010-Q06: より高い品質を取得（同値 B vs B → B）', () => {
      // 【テスト目的】: getHigherQuality()で同じ品質の場合、最初の引数が返されること
      // 【テスト内容】: BとBを比較してBが返される
      // 【期待される動作】: Bが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      const result = getHigherQuality(Quality.B, Quality.B);
      expect(result).toBe(Quality.B);
    });
  });

  // =============================================================================
  // T-0010-Q07: より低い品質を取得
  // =============================================================================

  describe('getLowerQuality', () => {
    it('T-0010-Q07: より低い品質を取得（A vs C → C）', () => {
      // 【テスト目的】: getLowerQuality()で低い方の品質が返されること
      // 【テスト内容】: AとCを比較してCが返される
      // 【期待される動作】: Cが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      const result = getLowerQuality(Quality.A, Quality.C);
      expect(result).toBe(Quality.C);
    });
  });

  // =============================================================================
  // T-0010-Q08〜Q09: 境界値テスト
  // =============================================================================

  describe('境界値テスト', () => {
    it('T-0010-Q08: 最小値と最大値の比較（D < S）', () => {
      // 【テスト目的】: 最小値Dと最大値Sが正しく比較されること
      // 【テスト内容】: DとSを比較すると負の数が返される
      // 【期待される動作】: -4が返される（1 - 5 = -4）
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      const result = compareQuality(Quality.D, Quality.S);
      expect(result).toBe(-4);
      expect(result).toBeLessThan(0);
    });

    it('T-0010-Q09: より高い品質を取得（D vs S → S）', () => {
      // 【テスト目的】: 最小値と最大値でgetHigherQuality()が正しく動作すること
      // 【テスト内容】: DとSを比較してSが返される
      // 【期待される動作】: Sが返される
      // 🔵 信頼性レベル: 要件定義書・設計文書に明記

      const result = getHigherQuality(Quality.D, Quality.S);
      expect(result).toBe(Quality.S);
    });
  });

  // =============================================================================
  // T-0010-Q10〜Q13: QUALITIES定数とorderToQuality関数
  // =============================================================================

  describe('QUALITIES定数', () => {
    it('T-0010-Q10: QUALITIES定数が正しく定義されていること', () => {
      // 【テスト目的】: 品質配列定数が正しく定義されていること
      // 【テスト内容】: インデックス0〜4がD〜Sに対応している
      // 【期待される動作】: 配列が['D', 'C', 'B', 'A', 'S']である
      // 🔵 信頼性レベル: リファクタリングで追加

      expect(QUALITIES).toEqual(['D', 'C', 'B', 'A', 'S']);
      expect(QUALITIES[0]).toBe(Quality.D);
      expect(QUALITIES[1]).toBe(Quality.C);
      expect(QUALITIES[2]).toBe(Quality.B);
      expect(QUALITIES[3]).toBe(Quality.A);
      expect(QUALITIES[4]).toBe(Quality.S);
    });
  });

  describe('orderToQuality', () => {
    it('T-0010-Q11: 順序値から品質への変換（正常系）', () => {
      // 【テスト目的】: orderToQuality()が正しく動作すること
      // 【テスト内容】: 順序値1〜5が正しくD〜Sに変換される
      // 【期待される動作】: 1→D, 2→C, 3→B, 4→A, 5→S
      // 🔵 信頼性レベル: リファクタリングで追加

      expect(orderToQuality(1)).toBe(Quality.D);
      expect(orderToQuality(2)).toBe(Quality.C);
      expect(orderToQuality(3)).toBe(Quality.B);
      expect(orderToQuality(4)).toBe(Quality.A);
      expect(orderToQuality(5)).toBe(Quality.S);
    });

    it('T-0010-Q12: 順序値から品質への変換（範囲外の最小値）', () => {
      // 【テスト目的】: orderToQuality()が範囲外の値を正しくクランプすること
      // 【テスト内容】: 1未満の値がDに変換される
      // 【期待される動作】: 0や負の値がDになる
      // 🔵 信頼性レベル: リファクタリングで追加

      expect(orderToQuality(0)).toBe(Quality.D);
      expect(orderToQuality(-1)).toBe(Quality.D);
      expect(orderToQuality(-100)).toBe(Quality.D);
    });

    it('T-0010-Q13: 順序値から品質への変換（範囲外の最大値）', () => {
      // 【テスト目的】: orderToQuality()が範囲外の値を正しくクランプすること
      // 【テスト内容】: 5超過の値がSに変換される
      // 【期待される動作】: 6や大きな値がSになる
      // 🔵 信頼性レベル: リファクタリングで追加

      expect(orderToQuality(6)).toBe(Quality.S);
      expect(orderToQuality(10)).toBe(Quality.S);
      expect(orderToQuality(100)).toBe(Quality.S);
    });
  });
});
