/**
 * contribution-calculator.ts - 貢献度計算の純粋関数
 * TASK-0092: features/rank/services作成
 *
 * 納品時の貢献度計算ロジックを純粋関数として提供する。
 * 品質補正、依頼者補正、コンボ補正を適用して最終貢献度を算出する。
 */

import {
  CLIENT_TYPE_MODIFIERS,
  COMBO_MODIFIER_RATE,
  CONTRIBUTION_QUALITY_MODIFIERS,
} from '@shared/constants';
import type { ClientType, Quality } from '@shared/types';

// =============================================================================
// 定数（GAME_CONFIGから参照）
// =============================================================================
// CONTRIBUTION_QUALITY_MODIFIERS, CLIENT_TYPE_MODIFIERS, COMBO_MODIFIER_RATE
// は @shared/constants/game-config からインポート済み

// =============================================================================
// 型定義
// =============================================================================

/** 貢献度計算コンテキスト */
export interface ContributionContext {
  /** 基礎貢献度 */
  baseContribution: number;
  /** 納品アイテムの品質 */
  itemQuality: Quality;
  /** 依頼者タイプ */
  clientType: ClientType;
  /** 同日の納品回数（1から開始） */
  deliveryCount: number;
}

/** 貢献度計算結果 */
export interface ContributionResult {
  /** 最終貢献度（整数） */
  contribution: number;
  /** 品質補正値 */
  qualityModifier: number;
  /** 依頼者補正値 */
  clientModifier: number;
  /** コンボ補正値 */
  comboModifier: number;
}

// =============================================================================
// 純粋関数
// =============================================================================

/**
 * 貢献度を計算する（純粋関数）
 *
 * 基礎貢献度 x 品質補正 x 依頼者補正 x コンボ補正
 * 結果は切り捨てで整数化
 *
 * @param context - 計算コンテキスト
 * @returns 計算結果
 */
export function calculateContribution(context: ContributionContext): ContributionResult {
  const qualityModifier = getQualityModifier(context.itemQuality);
  const clientModifier = getClientModifier(context.clientType);
  const comboModifier = getComboModifier(context.deliveryCount);

  const contribution = Math.floor(
    context.baseContribution * qualityModifier * clientModifier * comboModifier,
  );

  return {
    contribution,
    qualityModifier,
    clientModifier,
    comboModifier,
  };
}

/**
 * 品質補正値を取得する（純粋関数）
 *
 * @param quality - 品質
 * @returns 品質補正値
 */
export function getQualityModifier(quality: Quality): number {
  return CONTRIBUTION_QUALITY_MODIFIERS[quality];
}

/**
 * 依頼者補正値を取得する（純粋関数）
 *
 * @param clientType - 依頼者タイプ
 * @returns 依頼者補正値
 */
export function getClientModifier(clientType: ClientType): number {
  return CLIENT_TYPE_MODIFIERS[clientType];
}

/**
 * コンボ補正値を取得する（純粋関数）
 * 1 + 0.1 x (納品回数 - 1)
 *
 * @param deliveryCount - 同日の納品回数（1から開始）
 * @returns コンボ補正値
 */
export function getComboModifier(deliveryCount: number): number {
  return 1 + COMBO_MODIFIER_RATE * (deliveryCount - 1);
}
