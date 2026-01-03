/**
 * 品質計算ドメインサービス
 * TASK-0094: 品質計算ドメインサービス
 *
 * 品質計算のビジネスロジックを管理する
 */

import { MaterialInstance } from '@domain/material/MaterialEntity';
import { EnhancementCard } from '@domain/card/CardEntity';
import { Artifact } from '@domain/artifact/ArtifactEntity';
import { Quality, EffectType } from '@domain/common/types';

/**
 * 品質値の数値マップ
 */
const QualityValue: Record<Quality, number> = {
  [Quality.E]: 10,
  [Quality.D]: 30,
  [Quality.C]: 50,
  [Quality.B]: 70,
  [Quality.A]: 90,
  [Quality.S]: 100,
};

/**
 * デフォルトの品質値
 */
const DEFAULT_QUALITY_VALUE = QualityValue[Quality.C];

/**
 * 品質上限
 */
const QUALITY_MAX = 100;

/**
 * 品質下限
 */
const QUALITY_MIN = 0;

/**
 * 品質ランク型（エクスポート用エイリアス）
 */
export type QualityRank = Quality;

/**
 * 最終品質計算結果
 */
export interface FinalQualityResult {
  /** 品質値（0-100） */
  qualityValue: number;
  /** 品質ランク（E-S） */
  qualityRank: Quality;
  /** 基本品質値 */
  baseQuality: number;
  /** 強化カードボーナス合計 */
  enhancementBonus: number;
  /** アーティファクトボーナス合計 */
  artifactBonus: number;
}

/**
 * 品質計算ドメインサービス
 * 品質計算に関するビジネスロジックを提供する
 */
export class QualityCalculationService {
  /**
   * 素材の品質平均から基本品質を計算する
   * @param materials 使用素材リスト
   * @returns 基本品質値（0-100）
   */
  calculateBaseQuality(materials: MaterialInstance[]): number {
    if (materials.length === 0) {
      return DEFAULT_QUALITY_VALUE;
    }

    let totalValue = 0;
    let totalWeight = 0;

    for (const material of materials) {
      const value = QualityValue[material.quality];
      const weight = material.quantity;
      totalValue += value * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) {
      return DEFAULT_QUALITY_VALUE;
    }

    return totalValue / totalWeight;
  }

  /**
   * 強化カードによるボーナスを適用する
   * @param baseQuality 基本品質値
   * @param enhancements 強化カードリスト
   * @returns ボーナス適用後の品質値
   */
  applyEnhancementBonus(baseQuality: number, enhancements: EnhancementCard[]): number {
    let bonus = 0;

    for (const enhancement of enhancements) {
      if (enhancement.getEffectType() === EffectType.QUALITY_UP) {
        bonus += enhancement.getEffectValue();
      }
    }

    return baseQuality + bonus;
  }

  /**
   * アーティファクトによるボーナスを適用する
   * @param baseQuality 基本品質値
   * @param artifacts アーティファクトリスト
   * @returns ボーナス適用後の品質値
   */
  applyArtifactBonus(baseQuality: number, artifacts: Artifact[]): number {
    let bonus = 0;

    for (const artifact of artifacts) {
      if (artifact.hasEffectType(EffectType.QUALITY_UP)) {
        bonus += artifact.getEffectValue();
      }
    }

    return baseQuality + bonus;
  }

  /**
   * 品質値から品質ランクを決定する
   * 設計書より:
   * - S: 90-100
   * - A: 70-89
   * - B: 50-69
   * - C: 30-49
   * - D: 0-29
   * - E: 負の値（特殊ケース）
   *
   * @param qualityValue 品質値
   * @returns 品質ランク
   */
  determineQualityRank(qualityValue: number): Quality {
    if (qualityValue >= 90) return Quality.S;
    if (qualityValue >= 70) return Quality.A;
    if (qualityValue >= 50) return Quality.B;
    if (qualityValue >= 30) return Quality.C;
    if (qualityValue >= 0) return Quality.D;
    return Quality.E;
  }

  /**
   * 最終品質を計算する
   * 最終品質 = 基本品質 + 強化ボーナス + アーティファクトボーナス
   *
   * @param materials 使用素材リスト
   * @param enhancements 強化カードリスト
   * @param artifacts アーティファクトリスト
   * @returns 最終品質計算結果
   */
  calculateFinalQuality(
    materials: MaterialInstance[],
    enhancements: EnhancementCard[],
    artifacts: Artifact[]
  ): FinalQualityResult {
    // 基本品質を計算
    const baseQuality = this.calculateBaseQuality(materials);

    // 強化カードボーナスを計算
    let enhancementBonus = 0;
    for (const enhancement of enhancements) {
      if (enhancement.getEffectType() === EffectType.QUALITY_UP) {
        enhancementBonus += enhancement.getEffectValue();
      }
    }

    // アーティファクトボーナスを計算
    let artifactBonus = 0;
    for (const artifact of artifacts) {
      if (artifact.hasEffectType(EffectType.QUALITY_UP)) {
        artifactBonus += artifact.getEffectValue();
      }
    }

    // 最終品質を計算（上限・下限適用）
    let finalQualityValue = baseQuality + enhancementBonus + artifactBonus;
    finalQualityValue = Math.min(QUALITY_MAX, finalQualityValue);
    finalQualityValue = Math.max(QUALITY_MIN, finalQualityValue);

    // 品質ランクを決定
    const qualityRank = this.determineQualityRank(finalQualityValue);

    return {
      qualityValue: finalQualityValue,
      qualityRank,
      baseQuality,
      enhancementBonus,
      artifactBonus,
    };
  }

  /**
   * 品質ランクの数値を取得する
   * @param quality 品質ランク
   * @returns 品質値
   */
  getQualityValue(quality: Quality): number {
    return QualityValue[quality];
  }

  /**
   * 品質値から品質ランクへ変換する
   * @param value 品質値
   * @returns 品質ランク
   */
  valueToQuality(value: number): Quality {
    return this.determineQualityRank(value);
  }
}
