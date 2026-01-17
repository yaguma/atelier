/**
 * artifact-service.ts - ArtifactService実装
 *
 * TASK-0016: ShopService・ArtifactService実装
 *
 * @description
 * アーティファクト管理サービスの実装。
 * アーティファクトの所持管理とボーナス計算を提供する。
 *
 * @信頼性レベル 🔵
 * - 設計文書・要件定義書に基づいた実装
 */

import type {
  ArtifactEffectType,
  IArtifactService,
} from '@domain/interfaces/artifact-service.interface';
import type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type { ArtifactId, IArtifactMaster } from '@shared/types';
import { DomainError, ErrorCodes } from '@shared/types';

// =============================================================================
// ArtifactService実装
// =============================================================================

/**
 * 【機能概要】: ArtifactService実装クラス
 * 【実装方針】: InventoryServiceとMasterDataRepositoryを使用してアーティファクト管理
 * 🔵 信頼性レベル: 設計文書・要件定義書に明記
 */
export class ArtifactService implements IArtifactService {
  // ===========================================================================
  // フィールド
  // ===========================================================================

  /** インベントリサービス */
  private readonly inventoryService: IInventoryService;

  /** マスターデータリポジトリ */
  private readonly masterDataRepository: IMasterDataRepository;

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  /**
   * ArtifactServiceを初期化
   *
   * @param inventoryService - インベントリサービス
   * @param masterDataRepository - マスターデータリポジトリ
   */
  constructor(inventoryService: IInventoryService, masterDataRepository: IMasterDataRepository) {
    this.inventoryService = inventoryService;
    this.masterDataRepository = masterDataRepository;
  }

  // ===========================================================================
  // アーティファクト管理
  // ===========================================================================

  /**
   * 【機能概要】: 所持アーティファクト取得
   * 【実装方針】: InventoryServiceから所持リストを取得
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getOwnedArtifacts(): ArtifactId[] {
    return this.inventoryService.getArtifacts();
  }

  /**
   * 【機能概要】: アーティファクト追加
   * 【実装方針】: 重複チェック後、InventoryServiceに追加
   * 【エラー】: 既に所持している場合
   * 🔵 信頼性レベル: 設計文書に明記
   */
  addArtifact(artifactId: ArtifactId): void {
    if (this.inventoryService.hasArtifact(artifactId)) {
      throw new DomainError(
        ErrorCodes.INVALID_OPERATION,
        `アーティファクト「${artifactId}」は既に所持しています`,
      );
    }
    this.inventoryService.addArtifact(artifactId);
  }

  /**
   * 【機能概要】: アーティファクト所持判定
   * 【実装方針】: InventoryServiceに委譲
   * 🔵 信頼性レベル: 設計文書に明記
   */
  hasArtifact(artifactId: ArtifactId): boolean {
    return this.inventoryService.hasArtifact(artifactId);
  }

  /**
   * 【機能概要】: アーティファクト情報取得
   * 【実装方針】: MasterDataRepositoryから取得
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getArtifactInfo(artifactId: ArtifactId): IArtifactMaster | null {
    return this.masterDataRepository.getArtifactById(artifactId) ?? null;
  }

  // ===========================================================================
  // ボーナス計算
  // ===========================================================================

  /**
   * 【機能概要】: 品質ボーナス計算
   * 【実装方針】: QUALITY_UP + ALL_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getQualityBonus(): number {
    return this.calculateBonusByType('QUALITY_UP') + this.getAllBonusContribution();
  }

  /**
   * 【機能概要】: 採取ボーナス計算
   * 【実装方針】: 現時点では未実装（将来拡張用）
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   */
  getGatheringBonus(): number {
    // 現在、採取に特化したボーナスは定義されていない
    return this.getAllBonusContribution();
  }

  /**
   * 【機能概要】: 貢献度ボーナス計算
   * 【実装方針】: CONTRIBUTION_BONUS + ALL_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getContributionBonus(): number {
    return this.calculateBonusByType('CONTRIBUTION_BONUS') + this.getAllBonusContribution();
  }

  /**
   * 【機能概要】: ゴールドボーナス計算
   * 【実装方針】: GOLD_BONUS + ALL_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getGoldBonus(): number {
    return this.calculateBonusByType('GOLD_BONUS') + this.getAllBonusContribution();
  }

  /**
   * 【機能概要】: 倉庫拡張ボーナス計算
   * 【実装方針】: STORAGE_EXPANSION効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getStorageBonus(): number {
    return this.calculateBonusByType('STORAGE_EXPANSION');
  }

  /**
   * 【機能概要】: 行動ポイントボーナス計算
   * 【実装方針】: ACTION_POINT_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getActionPointBonus(): number {
    return this.calculateBonusByType('ACTION_POINT_BONUS');
  }

  /**
   * 【機能概要】: レア確率ボーナス計算
   * 【実装方針】: RARE_CHANCE_UP + ALL_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getRareChanceBonus(): number {
    return this.calculateBonusByType('RARE_CHANCE_UP') + this.getAllBonusContribution();
  }

  /**
   * 【機能概要】: 調合コスト削減計算
   * 【実装方針】: ALCHEMY_COST_REDUCTION効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getAlchemyCostReduction(): number {
    return this.calculateBonusByType('ALCHEMY_COST_REDUCTION');
  }

  /**
   * 【機能概要】: 提示回数ボーナス計算
   * 【実装方針】: PRESENTATION_BONUS効果を合計
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getPresentationBonus(): number {
    return this.calculateBonusByType('PRESENTATION_BONUS');
  }

  // ===========================================================================
  // プライベートメソッド
  // ===========================================================================

  /**
   * 指定タイプのボーナスを計算
   *
   * @param effectType - 効果タイプ
   * @returns ボーナス値の合計
   */
  private calculateBonusByType(effectType: ArtifactEffectType): number {
    let totalBonus = 0;

    for (const artifactId of this.inventoryService.getArtifacts()) {
      const artifact = this.masterDataRepository.getArtifactById(artifactId);
      if (artifact && artifact.effect.type === effectType) {
        totalBonus += artifact.effect.value;
      }
    }

    return totalBonus;
  }

  /**
   * ALL_BONUS効果の貢献度を計算
   * ALL_BONUS 10% = 各効果に1ポイント追加
   *
   * @returns ALL_BONUSからの貢献度
   */
  private getAllBonusContribution(): number {
    let allBonus = 0;

    for (const artifactId of this.inventoryService.getArtifacts()) {
      const artifact = this.masterDataRepository.getArtifactById(artifactId);
      if (artifact && artifact.effect.type === 'ALL_BONUS') {
        // ALL_BONUS 10% = 各効果に1ポイント追加（10%を1として扱う）
        allBonus += Math.floor(artifact.effect.value / 10);
      }
    }

    return allBonus;
  }
}
