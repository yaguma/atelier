/**
 * gather.ts - 採取素材オプション生成の純粋関数
 *
 * TASK-0073: features/gathering/services作成
 *
 * @description
 * 素材プールと乱数値から採取時の素材オプションを生成する純粋関数。
 * 乱数は外部から注入するため、テスト容易性が高い。
 */

import type { MaterialOption } from '@features/gathering/types';
import { GATHERING_QUALITY } from '@shared/constants';
import type { MaterialId, Quality } from '@shared/types';

/**
 * gather関数の入力パラメータ
 */
export interface GatherInput {
  /** 素材プール（素材IDリスト） */
  readonly materialPool: readonly MaterialId[];
  /** 素材IDから基本品質へのマッピング */
  readonly baseQualities: Readonly<Record<string, Quality>>;
  /** 生成するオプション数 */
  readonly optionCount: number;
  /** 素材選択用の乱数値配列（0-1、optionCountと同じ長さ） */
  readonly randomValues: readonly number[];
  /** 品質決定用の乱数値配列（0-1、optionCountと同じ長さ） */
  readonly qualityRandomValues: readonly number[];
}

/**
 * gather関数の出力
 */
export interface GatherResult {
  /** 生成された素材オプション */
  readonly options: readonly MaterialOption[];
}

/** 品質の順序定義 */
const QUALITY_LEVELS: readonly Quality[] = ['D', 'C', 'B', 'A', 'S'];

/**
 * 基本品質と乱数値から実際の品質を決定する
 *
 * @param baseQuality - 素材の基本品質
 * @param randomValue - 品質決定用の乱数値（0-1）
 * @returns 決定された品質
 */
function determineQuality(baseQuality: Quality, randomValue: number): Quality {
  const baseIndex = QUALITY_LEVELS.indexOf(baseQuality);
  if (baseIndex === -1) return 'D';

  // 乱数値に基づいて品質を上下させる（GATHERING_QUALITYの閾値を使用）
  // 0.0〜QUALITY_DOWN_THRESHOLD: 1段階下（下限D）
  // QUALITY_DOWN_THRESHOLD〜QUALITY_UP_THRESHOLD: 基本品質
  // QUALITY_UP_THRESHOLD〜1.0: 1段階上（上限S）
  if (randomValue < GATHERING_QUALITY.QUALITY_DOWN_THRESHOLD && baseIndex > 0) {
    return QUALITY_LEVELS[baseIndex - 1] as Quality;
  }
  if (
    randomValue >= GATHERING_QUALITY.QUALITY_UP_THRESHOLD &&
    baseIndex < QUALITY_LEVELS.length - 1
  ) {
    return QUALITY_LEVELS[baseIndex + 1] as Quality;
  }

  return baseQuality;
}

/**
 * 採取時の素材オプションを生成する純粋関数
 *
 * @param input - 素材プール、乱数値、オプション数などの入力
 * @returns 生成された素材オプションリスト
 *
 * @example
 * ```typescript
 * const result = gather({
 *   materialPool: ['mat-herb', 'mat-ore'],
 *   baseQualities: { 'mat-herb': 'C', 'mat-ore': 'D' },
 *   optionCount: 3,
 *   randomValues: [0.1, 0.5, 0.9],
 *   qualityRandomValues: [0.5, 0.5, 0.5],
 * });
 * ```
 */
export function gather(input: GatherInput): GatherResult {
  const { materialPool, baseQualities, optionCount, randomValues, qualityRandomValues } = input;

  if (materialPool.length === 0 || optionCount <= 0) {
    return { options: [] };
  }

  const options: MaterialOption[] = [];

  for (let i = 0; i < optionCount; i++) {
    const randomValue = randomValues[i] ?? 0;
    const qualityRandom = qualityRandomValues[i] ?? 0.5;

    // 素材プールからランダム選択
    const materialIndex = Math.min(
      Math.floor(randomValue * materialPool.length),
      materialPool.length - 1,
    );
    const materialId = materialPool[materialIndex] as MaterialId;

    // 基本品質から実際の品質を決定
    const baseQuality = baseQualities[materialId] ?? ('D' as Quality);
    const quality = determineQuality(baseQuality, qualityRandom);

    options.push({
      materialId,
      quality,
      quantity: 1,
    });
  }

  return { options };
}
