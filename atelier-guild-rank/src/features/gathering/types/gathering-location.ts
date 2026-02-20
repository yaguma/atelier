/**
 * gathering-location.ts - 採取場所関連の型定義
 *
 * TASK-0105: 採取場所データ定義とGatheringService拡張
 *
 * 採取2段階化に必要な場所情報、素材プレビュー、ステージ状態の型を定義する。
 * 設計文書: docs/design/free-phase-navigation/interfaces.ts
 * 要件: REQ-002, REQ-002-01〜REQ-002-05
 */

import type { CardId } from '@shared/types';

// =============================================================================
// 採取フェーズステージ
// =============================================================================

/**
 * 採取フェーズの状態
 *
 * 場所選択→場所詳細→ドラフトセッション→結果の順に遷移する。
 * GatheringPhaseUI実装時に使用予定。
 */
export const GatheringStage = {
  /** 場所選択（新規追加） */
  LOCATION_SELECT: 'LOCATION_SELECT',
  /** 場所詳細（新規追加） */
  LOCATION_DETAIL: 'LOCATION_DETAIL',
  /** ドラフト採取セッション（既存） */
  DRAFT_SESSION: 'DRAFT_SESSION',
  /** 採取結果（既存） */
  GATHER_RESULT: 'GATHER_RESULT',
} as const;

export type GatheringStage = (typeof GatheringStage)[keyof typeof GatheringStage];

// =============================================================================
// 素材プレビュー
// =============================================================================

/** 出現確率の表示用ラベル */
export type DropRateLabel = 'high' | 'medium' | 'low';

/**
 * 素材プレビュー（場所選択画面用）
 *
 * 場所選択時にユーザーが判断できるよう、素材の概要情報を表示する。
 */
export interface IMaterialPreview {
  /** 素材名 */
  readonly name: string;
  /** レアリティ（表示用文字列。設計文書でstring型として定義） */
  readonly rarity: string;
  /** 出現確率（表示用） */
  readonly dropRate: DropRateLabel;
}

// =============================================================================
// 場所マスタデータ定義
// =============================================================================

/**
 * 採取場所マスタデータ
 *
 * 場所の基本情報。ゲームデータとして定義し、
 * カードIDとの対応付けはサービス層で行う。
 */
export interface IGatheringLocationData {
  /** 採取地カードID */
  readonly cardId: CardId;
  /** 採取地名 */
  readonly name: string;
  /** 移動APコスト */
  readonly movementAPCost: number;
  /** 採取可能素材プレビュー */
  readonly availableMaterials: readonly IMaterialPreview[];
  /** マップ上のX座標 */
  readonly mapX: number;
  /** マップ上のY座標 */
  readonly mapY: number;
}

// =============================================================================
// 採取場所（UI用）
// =============================================================================

/**
 * 採取場所情報（UI表示用）
 *
 * IGatheringLocationDataにisSelectableフラグを追加したUI用インターフェース。
 * 場所選択UIで一覧表示するために使用する。
 */
export interface IGatheringLocation extends IGatheringLocationData {
  /** 手札に該当カードがあるか */
  readonly isSelectable: boolean;
}

// =============================================================================
// 場所選択結果
// =============================================================================

/**
 * 場所選択結果
 *
 * ユーザーが場所を選択した後の結果データ。
 * GatheringPhaseUIからドラフトセッションへの橋渡しに使用する。
 */
export interface ILocationSelectResult {
  /** 選択した採取地カードID */
  readonly cardId: CardId;
  /** 採取地名 */
  readonly locationName: string;
  /** 移動APコスト */
  readonly movementAPCost: number;
}
