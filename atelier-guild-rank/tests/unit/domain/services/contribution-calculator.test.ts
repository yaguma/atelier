/**
 * ContributionCalculator テストケース
 * TASK-0014 ContributionCalculator・RankService実装
 *
 * @description
 * T-0014-01 〜 T-0014-04: 貢献度計算の単体テスト
 */

import {
  ContributionCalculator,
  type DeliveryContext,
} from '@domain/services/contribution-calculator';
import { ClientType, Quality } from '@shared/types';
import { beforeEach, describe, expect, it } from 'vitest';

// =============================================================================
// モックデータ
// =============================================================================

/**
 * モック納品コンテキストを作成
 */
function createDeliveryContext(
  baseContribution: number,
  quality: Quality,
  clientType: ClientType,
  deliveryCount: number,
): DeliveryContext {
  return {
    baseContribution,
    itemQuality: quality,
    clientType,
    deliveryCount,
  };
}

// =============================================================================
// テスト
// =============================================================================

describe('ContributionCalculator', () => {
  let calculator: ContributionCalculator;

  beforeEach(() => {
    calculator = new ContributionCalculator();
  });

  // =============================================================================
  // T-0014-01: 貢献度計算（基本）
  // =============================================================================

  describe('calculate（基本）', () => {
    it('T-0014-01: 基礎値のみで正しく計算される', () => {
      // 【テスト目的】: 補正なし（品質B、村人、初回納品）で基礎値がそのまま返る
      // 【テスト内容】: 基礎100、品質B(1.0)、村人(1.0)、初回(1.0)
      // 【期待される動作】: 100が返る
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const context = createDeliveryContext(100, Quality.B, ClientType.VILLAGER, 1);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(100);
    });

    it('基礎貢献度0の場合は0が返る', () => {
      // Arrange
      const context = createDeliveryContext(0, Quality.S, ClientType.GUILD, 5);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(0);
    });
  });

  // =============================================================================
  // T-0014-02: 品質補正適用
  // =============================================================================

  describe('品質補正', () => {
    it('T-0014-02: S品質で2倍の補正が適用される', () => {
      // 【テスト目的】: S品質の場合、貢献度が2倍になる
      // 【テスト内容】: 基礎100、品質S(2.0)、村人(1.0)、初回(1.0)
      // 【期待される動作】: 200が返る
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const context = createDeliveryContext(100, Quality.S, ClientType.VILLAGER, 1);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(200);
    });

    it('D品質で0.5倍の補正が適用される', () => {
      // Arrange
      const context = createDeliveryContext(100, Quality.D, ClientType.VILLAGER, 1);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(50);
    });

    it('C品質で0.75倍の補正が適用される', () => {
      // Arrange
      const context = createDeliveryContext(100, Quality.C, ClientType.VILLAGER, 1);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(75);
    });

    it('A品質で1.5倍の補正が適用される', () => {
      // Arrange
      const context = createDeliveryContext(100, Quality.A, ClientType.VILLAGER, 1);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(150);
    });
  });

  // =============================================================================
  // T-0014-03: 依頼者補正適用
  // =============================================================================

  describe('依頼者補正', () => {
    it('T-0014-03: guild依頼で1.5倍の補正が適用される', () => {
      // 【テスト目的】: ギルド依頼者の場合、貢献度が1.5倍になる
      // 【テスト内容】: 基礎100、品質B(1.0)、ギルド(1.5)、初回(1.0)
      // 【期待される動作】: 150が返る
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const context = createDeliveryContext(100, Quality.B, ClientType.GUILD, 1);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(150);
    });

    it('adventurer依頼で1.1倍の補正が適用される', () => {
      // Arrange
      const context = createDeliveryContext(100, Quality.B, ClientType.ADVENTURER, 1);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(110);
    });

    it('merchant依頼で1.2倍の補正が適用される', () => {
      // Arrange
      const context = createDeliveryContext(100, Quality.B, ClientType.MERCHANT, 1);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(120);
    });

    it('noble依頼で1.3倍の補正が適用される', () => {
      // Arrange
      const context = createDeliveryContext(100, Quality.B, ClientType.NOBLE, 1);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(130);
    });
  });

  // =============================================================================
  // T-0014-04: コンボ補正適用
  // =============================================================================

  describe('コンボ補正', () => {
    it('T-0014-04: 3回納品で1.3倍の補正が適用される', () => {
      // 【テスト目的】: 同日3回目の納品で1.3倍になる（段階的閾値テーブル方式）
      // 【テスト内容】: 基礎100、品質B(1.0)、村人(1.0)、3回目(1.3)
      // 【期待される動作】: 130が返る
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const context = createDeliveryContext(100, Quality.B, ClientType.VILLAGER, 3);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(130);
    });

    it('2回目の納品で1.1倍の補正が適用される', () => {
      // Arrange
      const context = createDeliveryContext(100, Quality.B, ClientType.VILLAGER, 2);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(110);
    });

    it('5回目の納品で1.5倍の補正が適用される', () => {
      // Arrange
      const context = createDeliveryContext(100, Quality.B, ClientType.VILLAGER, 5);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(150);
    });

    it('7回目の納品で2.0倍の補正が適用される', () => {
      // Arrange
      const context = createDeliveryContext(100, Quality.B, ClientType.VILLAGER, 7);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(200);
    });
  });

  // =============================================================================
  // 複合補正テスト
  // =============================================================================

  describe('複合補正', () => {
    it('全補正が同時に適用される', () => {
      // 【テスト目的】: 品質・依頼者・コンボの全補正が掛け算で適用される
      // 【テスト内容】: 基礎100、品質S(2.0)、ギルド(1.5)、3回目(1.3)
      // 【期待される動作】: 100 * 2.0 * 1.5 * 1.3 = 390 が返る
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const context = createDeliveryContext(100, Quality.S, ClientType.GUILD, 3);

      // Act
      const result = calculator.calculate(context);

      // Assert
      expect(result).toBe(390);
    });

    it('小数点以下は切り捨てられる', () => {
      // 【テスト目的】: 計算結果の小数点以下が切り捨てられる
      // 【テスト内容】: 基礎33、品質C(0.75)、冒険者(1.1)、初回(1.0)
      // 【期待される動作】: 33 * 0.75 * 1.1 = 27.225 → 27 が返る
      // 🔵 信頼性レベル: 設計文書に明記

      // Arrange
      const context = createDeliveryContext(33, Quality.C, ClientType.ADVENTURER, 1);

      // Act
      const result = calculator.calculate(context);

      // Assert
      // 33 * 0.75 * 1.1 = 27.225 → 27
      expect(result).toBe(27);
    });
  });

  // =============================================================================
  // 補正値取得メソッド
  // =============================================================================

  describe('getQualityModifier', () => {
    it('各品質の補正値を正しく返す', () => {
      expect(calculator.getQualityModifier(Quality.D)).toBe(0.5);
      expect(calculator.getQualityModifier(Quality.C)).toBe(0.75);
      expect(calculator.getQualityModifier(Quality.B)).toBe(1.0);
      expect(calculator.getQualityModifier(Quality.A)).toBe(1.5);
      expect(calculator.getQualityModifier(Quality.S)).toBe(2.0);
    });
  });

  describe('getClientModifier', () => {
    it('各依頼者タイプの補正値を正しく返す', () => {
      expect(calculator.getClientModifier(ClientType.VILLAGER)).toBe(1.0);
      expect(calculator.getClientModifier(ClientType.ADVENTURER)).toBe(1.1);
      expect(calculator.getClientModifier(ClientType.MERCHANT)).toBe(1.2);
      expect(calculator.getClientModifier(ClientType.NOBLE)).toBe(1.3);
      expect(calculator.getClientModifier(ClientType.GUILD)).toBe(1.5);
    });
  });

  describe('getComboModifier', () => {
    it('納品回数に応じた補正値を正しく返す（段階的閾値テーブル）', () => {
      expect(calculator.getComboModifier(1)).toBe(1.0);
      expect(calculator.getComboModifier(2)).toBe(1.1);
      expect(calculator.getComboModifier(3)).toBe(1.3);
      expect(calculator.getComboModifier(4)).toBe(1.3);
      expect(calculator.getComboModifier(5)).toBe(1.5);
      expect(calculator.getComboModifier(6)).toBe(1.5);
      expect(calculator.getComboModifier(7)).toBe(2.0);
      expect(calculator.getComboModifier(10)).toBe(2.0);
    });
  });
});
