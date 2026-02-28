/**
 * contribution-calculator.ts - 貢献度計算サービス
 *
 * TASK-0014: ContributionCalculator・RankService実装
 *
 * @description
 * 納品時の貢献度を計算するドメインサービス。
 * 品質補正、依頼者補正、コンボ補正を適用して最終貢献度を算出する。
 *
 * @信頼性レベル 🔵
 * - 設計文書に基づいた実装
 * - 計算式は設計文書に明記
 */

import { COMBO_THRESHOLDS } from '@shared/constants';
import { ClientType, type Quality } from '@shared/types';

// =============================================================================
// 納品コンテキスト
// =============================================================================

/**
 * 【機能概要】: 納品コンテキスト
 * 【実装方針】: 貢献度計算に必要な情報を保持
 * 🔵 信頼性レベル: 設計文書に明記
 */
export interface DeliveryContext {
  /** 基礎貢献度 */
  baseContribution: number;
  /** 納品アイテムの品質 */
  itemQuality: Quality;
  /** 依頼者タイプ */
  clientType: ClientType;
  /** 同日の納品回数（1から開始） */
  deliveryCount: number;
}

// =============================================================================
// 純粋関数（共通ロジック）
// =============================================================================

/**
 * コンボ補正値を取得する（純粋関数）
 *
 * 段階的閾値テーブル（COMBO_THRESHOLDS）に基づき、
 * 連続成功回数に応じた補正値を返す。
 *
 * @param deliveryCount - 同日の納品回数（1から開始）
 * @returns コンボ補正値
 */
export function getComboModifier(deliveryCount: number): number {
  let modifier = 1.0;
  for (const threshold of COMBO_THRESHOLDS) {
    if (deliveryCount >= threshold.minCount) {
      modifier = threshold.modifier;
    }
  }
  return modifier;
}

// =============================================================================
// 貢献度計算サービス
// =============================================================================

/**
 * 【機能概要】: 貢献度計算サービスクラス
 * 【実装方針】: 各種補正を掛け算して最終貢献度を算出
 * 🔵 信頼性レベル: 設計文書に明記
 *
 * @example
 * ```typescript
 * const calculator = new ContributionCalculator();
 * const contribution = calculator.calculate({
 *   baseContribution: 100,
 *   itemQuality: Quality.A,
 *   clientType: ClientType.MERCHANT,
 *   deliveryCount: 2,
 * });
 * // 100 * 1.5 * 1.2 * 1.1 = 198
 * ```
 */
export class ContributionCalculator {
  /**
   * 【機能概要】: 品質補正テーブル
   * 【実装方針】: D:0.5, C:0.75, B:1.0, A:1.5, S:2.0
   * 🔵 信頼性レベル: 設計文書に明記
   */
  private readonly qualityModifiers: Record<Quality, number> = {
    D: 0.5,
    C: 0.75,
    B: 1.0,
    A: 1.5,
    S: 2.0,
  };

  /**
   * 【機能概要】: 依頼者補正テーブル
   * 【実装方針】: VILLAGER:1.0, ADVENTURER:1.1, MERCHANT:1.2, NOBLE:1.3, GUILD:1.5
   * 🔵 信頼性レベル: 設計文書に明記
   */
  private readonly clientModifiers: Record<ClientType, number> = {
    [ClientType.VILLAGER]: 1.0,
    [ClientType.ADVENTURER]: 1.1,
    [ClientType.MERCHANT]: 1.2,
    [ClientType.NOBLE]: 1.3,
    [ClientType.GUILD]: 1.5,
  };

  /**
   * 【機能概要】: 貢献度を計算する
   * 【実装方針】: 基礎貢献度 × 品質補正 × 依頼者補正 × コンボ補正
   * 【注意】: 結果は切り捨てで整数化
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param context - 納品コンテキスト
   * @returns 最終貢献度（整数）
   */
  calculate(context: DeliveryContext): number {
    const { baseContribution, itemQuality, clientType, deliveryCount } = context;

    const qualityMod = this.getQualityModifier(itemQuality);
    const clientMod = this.getClientModifier(clientType);
    const comboMod = this.getComboModifier(deliveryCount);

    // 小数点以下切り捨て
    return Math.floor(baseContribution * qualityMod * clientMod * comboMod);
  }

  /**
   * 【機能概要】: 品質補正を取得
   * 【実装方針】: 品質に応じた補正値を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param quality - 品質
   * @returns 品質補正値
   */
  getQualityModifier(quality: Quality): number {
    return this.qualityModifiers[quality];
  }

  /**
   * 【機能概要】: 依頼者補正を取得
   * 【実装方針】: 依頼者タイプに応じた補正値を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param clientType - 依頼者タイプ
   * @returns 依頼者補正値
   */
  getClientModifier(clientType: ClientType): number {
    return this.clientModifiers[clientType];
  }

  /**
   * 【機能概要】: コンボ補正を取得
   * 【実装方針】: 共通の getComboModifier 純粋関数に委譲
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param deliveryCount - 同日の納品回数
   * @returns コンボ補正値
   */
  getComboModifier(deliveryCount: number): number {
    return getComboModifier(deliveryCount);
  }
}
