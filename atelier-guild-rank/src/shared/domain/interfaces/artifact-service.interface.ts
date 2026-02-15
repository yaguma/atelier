/**
 * artifact-service.interface.ts - ArtifactServiceインターフェース
 *
 * TASK-0016: ShopService・ArtifactService実装
 *
 * @description
 * アーティファクト管理のインターフェース定義。
 * アーティファクトの所持管理とボーナス計算を提供する。
 *
 * @信頼性レベル 🔵
 * - 設計文書・要件定義書に基づいた定義
 */

import type { ArtifactId, IArtifactMaster } from '@shared/types';

// =============================================================================
// アーティファクト効果タイプ
// =============================================================================

/**
 * 【機能概要】: アーティファクト効果タイプ
 * 🔵 信頼性レベル: 設計文書に明記
 */
export type ArtifactEffectType =
  | 'QUALITY_UP' // 品質+N
  | 'STORAGE_EXPANSION' // 素材保管+N枠
  | 'GOLD_BONUS' // 報酬金+N%
  | 'RARE_CHANCE_UP' // レア確率+N%
  | 'ACTION_POINT_BONUS' // 行動ポイント+N/日
  | 'CONTRIBUTION_BONUS' // 貢献度+N%
  | 'ALCHEMY_COST_REDUCTION' // 調合コスト-N
  | 'PRESENTATION_BONUS' // 採取提示回数+N
  | 'ALL_BONUS'; // 全効果+N%

// =============================================================================
// ArtifactServiceインターフェース
// =============================================================================

/**
 * 【機能概要】: ArtifactServiceインターフェース
 * 【実装方針】: アーティファクトの管理とボーナス計算を提供
 * 🔵 信頼性レベル: 設計文書・要件定義書に明記
 */
export interface IArtifactService {
  // ===========================================================================
  // アーティファクト管理
  // ===========================================================================

  /**
   * 【機能概要】: 所持アーティファクト取得
   * 【実装方針】: 所持している全アーティファクトIDを配列で返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns アーティファクトIDの配列
   */
  getOwnedArtifacts(): ArtifactId[];

  /**
   * 【機能概要】: アーティファクト追加
   * 【実装方針】: 重複チェック後、アーティファクトを追加
   * 【エラー】: 既に所持している場合
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param artifactId - 追加するアーティファクトID
   */
  addArtifact(artifactId: ArtifactId): void;

  /**
   * 【機能概要】: アーティファクト所持判定
   * 【実装方針】: 指定アーティファクトを所持しているか判定
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param artifactId - 判定するアーティファクトID
   * @returns 所持している場合true
   */
  hasArtifact(artifactId: ArtifactId): boolean;

  /**
   * 【機能概要】: アーティファクト情報取得
   * 【実装方針】: マスターデータからアーティファクト情報を取得
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param artifactId - 取得するアーティファクトID
   * @returns アーティファクトマスターデータ（存在しない場合はnull）
   */
  getArtifactInfo(artifactId: ArtifactId): IArtifactMaster | null;

  // ===========================================================================
  // ボーナス計算
  // ===========================================================================

  /**
   * 【機能概要】: 品質ボーナス計算
   * 【実装方針】: QUALITY_UP + ALL_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 品質ボーナス値
   */
  getQualityBonus(): number;

  /**
   * 【機能概要】: 採取ボーナス計算
   * 【実装方針】: 採取に関するボーナスを計算
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   *
   * @returns 採取ボーナス値
   */
  getGatheringBonus(): number;

  /**
   * 【機能概要】: 貢献度ボーナス計算
   * 【実装方針】: CONTRIBUTION_BONUS + ALL_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 貢献度ボーナス（%）
   */
  getContributionBonus(): number;

  /**
   * 【機能概要】: ゴールドボーナス計算
   * 【実装方針】: GOLD_BONUS + ALL_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns ゴールドボーナス（%）
   */
  getGoldBonus(): number;

  /**
   * 【機能概要】: 倉庫拡張ボーナス計算
   * 【実装方針】: STORAGE_EXPANSION効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 倉庫拡張枠数
   */
  getStorageBonus(): number;

  /**
   * 【機能概要】: 行動ポイントボーナス計算
   * 【実装方針】: ACTION_POINT_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 追加行動ポイント
   */
  getActionPointBonus(): number;

  /**
   * 【機能概要】: レア確率ボーナス計算
   * 【実装方針】: RARE_CHANCE_UP + ALL_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns レア確率ボーナス（%）
   */
  getRareChanceBonus(): number;

  /**
   * 【機能概要】: 調合コスト削減計算
   * 【実装方針】: ALCHEMY_COST_REDUCTION効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 調合コスト削減値
   */
  getAlchemyCostReduction(): number;

  /**
   * 【機能概要】: 提示回数ボーナス計算
   * 【実装方針】: PRESENTATION_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 提示回数ボーナス
   */
  getPresentationBonus(): number;
}
