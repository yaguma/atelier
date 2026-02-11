/**
 * gathering-service.ts - GatheringService関連の型定義
 *
 * TASK-0072: features/gathering/types作成
 *
 * ドラフト採取システムのインターフェース定義。
 * domain/interfaces/gathering-service.interface.tsから移行。
 */

import type { Card } from '@domain/entities/Card';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { MaterialId, Quality } from '@shared/types';

/**
 * ドラフト採取セッション
 */
export interface DraftSession {
  /** セッションID（一意） */
  sessionId: string;
  /** 使用した採取地カード */
  card: Card;
  /** 現在のラウンド（1〜maxRounds） */
  currentRound: number;
  /** 最大ラウンド数（採取地により異なる） */
  maxRounds: number;
  /** 選択済み素材 */
  selectedMaterials: MaterialInstance[];
  /** 現在の素材オプション（3つ） */
  currentOptions: MaterialOption[];
  /** 採取完了フラグ */
  isComplete: boolean;
}

/**
 * 素材オプション
 * ドラフト採取で提示される素材の情報
 */
export interface MaterialOption {
  /** 素材ID */
  materialId: MaterialId;
  /** 品質 */
  quality: Quality;
  /** 数量 */
  quantity: number;
}

/**
 * 採取結果
 * 採取終了時に返される結果
 */
export interface GatheringResult {
  /** 獲得した素材のリスト */
  materials: MaterialInstance[];
  /** 採取コスト */
  cost: GatheringCostResult;
}

/**
 * 採取コスト結果
 * 行動ポイントコストと追加日数を含む
 */
export interface GatheringCostResult {
  /** 行動ポイントコスト */
  actionPointCost: number;
  /** 追加日数（7個以上で+1日） */
  extraDays: number;
}

/**
 * GatheringServiceインターフェース
 * ドラフト採取セッション管理、素材オプション生成、採取コスト計算を提供
 */
export interface IGatheringService {
  /**
   * ドラフト採取セッション開始
   * @param card - 採取地カード
   * @param enhancementCards - 強化カード（オプション）
   * @returns ドラフト採取セッション
   */
  startDraftGathering(card: Card, enhancementCards?: Card[]): DraftSession;

  /**
   * 素材を選択
   * @param sessionId - セッションID
   * @param materialIndex - 素材オプションのインデックス（0〜2）
   * @returns 選択した素材インスタンス
   */
  selectMaterial(sessionId: string, materialIndex: number): MaterialInstance;

  /**
   * 素材選択をスキップ
   * @param sessionId - セッションID
   */
  skipSelection(sessionId: string): void;

  /**
   * 採取を終了
   * @param sessionId - セッションID
   * @returns 採取結果
   */
  endGathering(sessionId: string): GatheringResult;

  /**
   * 現在のセッションを取得
   * @returns 現在のドラフト採取セッション、またはnull
   */
  getCurrentSession(): DraftSession | null;

  /**
   * 採取可能かどうかを判定
   * @param card - 判定するカード
   * @returns 採取可能な場合true
   */
  canGather(card: Card): boolean;

  /**
   * 採取コストを計算
   * @param baseCost - 採取地の基本コスト
   * @param selectedCount - 選択した素材の個数
   * @returns 採取コスト結果
   */
  calculateGatheringCost(baseCost: number, selectedCount: number): GatheringCostResult;
}
