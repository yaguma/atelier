/**
 * gathering-service.interface.ts - GatheringServiceインターフェース
 *
 * TASK-0011: GatheringService実装（ドラフト採取）
 *
 * @description
 * ドラフト採取システムのインターフェース定義。
 * 採取地カードを使用して素材をドラフト形式で獲得する機能を提供する。
 *
 * @信頼性レベル 🔵
 * - note.md・要件定義書に基づいた定義
 * - 採取地カードごとの提示回数設定
 * - 選択個数に応じたコスト計算
 */

import type { Card } from '@domain/entities/Card';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { MaterialId, Quality } from '@shared/types';

/**
 * 【機能概要】: ドラフト採取セッション
 * 【実装方針】: 採取セッションの状態を保持する
 * 🔵 信頼性レベル: note.md・要件定義書に明記
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
 * 【機能概要】: 素材オプション
 * 【実装方針】: ドラフト採取で提示される素材の情報
 * 🔵 信頼性レベル: note.md・要件定義書に明記
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
 * 【機能概要】: 採取結果
 * 【実装方針】: 採取終了時に返される結果
 * 🔵 信頼性レベル: note.md・要件定義書に明記
 */
export interface GatheringResult {
  /** 獲得した素材のリスト */
  materials: MaterialInstance[];
  /** 採取コスト */
  cost: GatheringCostResult;
}

/**
 * 【機能概要】: 採取コスト結果
 * 【実装方針】: 行動ポイントコストと追加日数を含む
 * 🔵 信頼性レベル: note.md・要件定義書に明記
 */
export interface GatheringCostResult {
  /** 行動ポイントコスト */
  actionPointCost: number;
  /** 追加日数（7個以上で+1日） */
  extraDays: number;
}

/**
 * 【機能概要】: GatheringServiceインターフェース
 * 【実装方針】: ドラフト採取セッション管理、素材オプション生成、採取コスト計算を提供
 * 🔵 信頼性レベル: note.md・要件定義書に明記
 */
export interface IGatheringService {
  /**
   * 【機能概要】: ドラフト採取セッション開始
   * 【実装方針】: セッションIDを生成し、素材オプションを3つ提示する
   * 【エラー】: 採取地カード以外を指定した場合はINVALID_CARD_TYPE
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   *
   * @param card - 採取地カード
   * @param enhancementCards - 強化カード（オプション）
   * @returns ドラフト採取セッション
   */
  startDraftGathering(card: Card, enhancementCards?: Card[]): DraftSession;

  /**
   * 【機能概要】: 素材を選択
   * 【実装方針】: 提示された素材オプションから1つを選択し、インスタンス化して獲得
   * 【エラー】: 存在しないセッションID時はSESSION_NOT_FOUND、範囲外のインデックス時はINVALID_SELECTION
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   *
   * @param sessionId - セッションID
   * @param materialIndex - 素材オプションのインデックス（0〜2）
   * @returns 選択した素材インスタンス
   */
  selectMaterial(sessionId: string, materialIndex: number): MaterialInstance;

  /**
   * 【機能概要】: 素材選択をスキップ
   * 【実装方針】: 素材を選ばずに次のラウンドに進む
   * 【エラー】: 存在しないセッションID時はSESSION_NOT_FOUND
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   *
   * @param sessionId - セッションID
   */
  skipSelection(sessionId: string): void;

  /**
   * 【機能概要】: 採取を終了
   * 【実装方針】: 獲得した素材とコストを計算し、セッションを削除
   * 【エラー】: 存在しないセッションID時はSESSION_NOT_FOUND
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   *
   * @param sessionId - セッションID
   * @returns 採取結果
   */
  endGathering(sessionId: string): GatheringResult;

  /**
   * 【機能概要】: 現在のセッションを取得
   * 【実装方針】: アクティブなセッションを返す、セッションがない場合はnull
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   *
   * @returns 現在のドラフト採取セッション、またはnull
   */
  getCurrentSession(): DraftSession | null;

  /**
   * 【機能概要】: 採取可能かどうかを判定
   * 【実装方針】: カードタイプが採取地カードかどうかを判定
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   *
   * @param card - 判定するカード
   * @returns 採取可能な場合true
   */
  canGather(card: Card): boolean;

  /**
   * 【機能概要】: 採取コストを計算
   * 【実装方針】: 基本コスト + 選択個数に応じた追加コストを計算
   * 【コスト計算】:
   *   - 0個: +0
   *   - 1〜2個: +1
   *   - 3〜4個: +2
   *   - 5〜6個: +3
   *   - 7個以上: +3、extraDays: +1
   * 🔵 信頼性レベル: note.md・要件定義書に明記
   *
   * @param baseCost - 採取地の基本コスト
   * @param selectedCount - 選択した素材の個数
   * @returns 採取コスト結果
   */
  calculateGatheringCost(baseCost: number, selectedCount: number): GatheringCostResult;
}
