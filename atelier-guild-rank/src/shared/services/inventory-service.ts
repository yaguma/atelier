/**
 * inventory-service.ts - InventoryService実装
 *
 * TASK-0015: InventoryService実装
 *
 * @description
 * インベントリ管理サービスの実装。
 * 素材、アイテム、アーティファクトの追加・削除・取得を提供する。
 *
 * @信頼性レベル 🔵
 * - 設計文書・要件定義書に基づいた実装
 * - 容量制限管理
 * - カテゴリ別フィルタリング
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
import type { ArtifactId, Attribute, ItemId } from '@shared/types';
import { DomainError, ErrorCodes } from '@shared/types';

// =============================================================================
// 定数
// =============================================================================

/** 素材の最大容量 */
const MAX_MATERIALS = 99;

/** アイテムの最大容量 */
const MAX_ITEMS = 99;

/** アーティファクトの最大容量 */
const MAX_ARTIFACTS = 10;

// =============================================================================
// InventoryService実装
// =============================================================================

/**
 * 【機能概要】: InventoryService実装クラス
 * 【実装方針】: Map/Setを使用して素材、アイテム、アーティファクトを管理
 * 🔵 信頼性レベル: 設計文書・要件定義書に明記
 */
export class InventoryService implements IInventoryService {
  // ===========================================================================
  // フィールド
  // ===========================================================================

  /** 素材ストレージ（instanceId -> MaterialInstance） */
  private materials = new Map<string, MaterialInstance>();

  /** アイテムストレージ（instanceId -> ItemInstance） */
  private items = new Map<string, ItemInstance>();

  /** アーティファクトストレージ */
  private artifacts = new Set<ArtifactId>();

  // ===========================================================================
  // 素材管理
  // ===========================================================================

  /**
   * 【機能概要】: 素材を追加
   * 【実装方針】: 容量チェック後、素材をインベントリに追加
   * 【エラー】: 容量超過時
   * 🔵 信頼性レベル: 設計文書に明記
   */
  addMaterial(material: MaterialInstance): void {
    if (this.materials.size >= MAX_MATERIALS) {
      throw new DomainError(
        ErrorCodes.INVALID_OPERATION,
        `素材インベントリが満杯です (最大${MAX_MATERIALS}個)`,
      );
    }
    this.materials.set(material.instanceId, material);
  }

  /**
   * 【機能概要】: 素材を複数追加
   * 【実装方針】: 容量チェック後、複数の素材をインベントリに追加
   * 【エラー】: 容量超過時
   * 🔵 信頼性レベル: 設計文書に明記
   */
  addMaterials(materials: MaterialInstance[]): void {
    if (this.materials.size + materials.length > MAX_MATERIALS) {
      throw new DomainError(
        ErrorCodes.INVALID_OPERATION,
        `素材インベントリの容量を超えます (最大${MAX_MATERIALS}個)`,
      );
    }
    for (const material of materials) {
      this.materials.set(material.instanceId, material);
    }
  }

  /**
   * 【機能概要】: 素材を削除
   * 【実装方針】: インスタンスIDで素材を検索し削除
   * 🔵 信頼性レベル: 設計文書に明記
   */
  removeMaterial(instanceId: string): MaterialInstance | null {
    const material = this.materials.get(instanceId);
    if (!material) {
      return null;
    }
    this.materials.delete(instanceId);
    return material;
  }

  /**
   * 【機能概要】: 複数の素材を削除
   * 【実装方針】: 複数のインスタンスIDで素材を検索し削除
   * 🔵 信頼性レベル: 設計文書に明記
   */
  removeMaterials(instanceIds: string[]): MaterialInstance[] {
    const removed: MaterialInstance[] = [];
    for (const id of instanceIds) {
      const material = this.removeMaterial(id);
      if (material) {
        removed.push(material);
      }
    }
    return removed;
  }

  /**
   * 【機能概要】: 全素材を取得
   * 【実装方針】: インベントリ内の全素材を配列で返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getMaterials(): MaterialInstance[] {
    return Array.from(this.materials.values());
  }

  /**
   * 【機能概要】: 属性で素材をフィルタリング
   * 【実装方針】: 指定属性を持つ素材のみを返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getMaterialsByAttribute(attribute: Attribute): MaterialInstance[] {
    return this.getMaterials().filter((material) => material.attributes.includes(attribute));
  }

  /**
   * 【機能概要】: 素材数を取得
   * 【実装方針】: インベントリ内の素材の総数を返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getMaterialCount(): number {
    return this.materials.size;
  }

  // ===========================================================================
  // アイテム管理
  // ===========================================================================

  /**
   * 【機能概要】: アイテムを追加
   * 【実装方針】: 容量チェック後、アイテムをインベントリに追加
   * 【エラー】: 容量超過時
   * 🔵 信頼性レベル: 設計文書に明記
   */
  addItem(item: ItemInstance): void {
    if (this.items.size >= MAX_ITEMS) {
      throw new DomainError(
        ErrorCodes.INVALID_OPERATION,
        `アイテムインベントリが満杯です (最大${MAX_ITEMS}個)`,
      );
    }
    this.items.set(item.instanceId, item);
  }

  /**
   * 【機能概要】: アイテムを削除
   * 【実装方針】: インスタンスIDでアイテムを検索し削除
   * 🔵 信頼性レベル: 設計文書に明記
   */
  removeItem(instanceId: string): ItemInstance | null {
    const item = this.items.get(instanceId);
    if (!item) {
      return null;
    }
    this.items.delete(instanceId);
    return item;
  }

  /**
   * 【機能概要】: 全アイテムを取得
   * 【実装方針】: インベントリ内の全アイテムを配列で返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getItems(): ItemInstance[] {
    return Array.from(this.items.values());
  }

  /**
   * 【機能概要】: アイテムIDでフィルタリング
   * 【実装方針】: 指定アイテムIDを持つアイテムのみを返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getItemsByType(itemId: ItemId): ItemInstance[] {
    return this.getItems().filter((item) => item.itemId === itemId);
  }

  /**
   * 【機能概要】: アイテム数を取得
   * 【実装方針】: インベントリ内のアイテムの総数を返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getItemCount(): number {
    return this.items.size;
  }

  // ===========================================================================
  // アーティファクト管理
  // ===========================================================================

  /**
   * 【機能概要】: アーティファクトを追加
   * 【実装方針】: 容量チェック後、アーティファクトを追加
   * 【エラー】: 容量超過時、重複時
   * 🔵 信頼性レベル: 設計文書に明記
   */
  addArtifact(artifactId: ArtifactId): void {
    if (this.artifacts.has(artifactId)) {
      throw new DomainError(
        ErrorCodes.INVALID_OPERATION,
        `アーティファクト「${artifactId}」は既に所持しています`,
      );
    }
    if (this.artifacts.size >= MAX_ARTIFACTS) {
      throw new DomainError(
        ErrorCodes.INVALID_OPERATION,
        `アーティファクトインベントリが満杯です (最大${MAX_ARTIFACTS}個)`,
      );
    }
    this.artifacts.add(artifactId);
  }

  /**
   * 【機能概要】: アーティファクトを削除
   * 【実装方針】: アーティファクトIDで検索し削除
   * 🔵 信頼性レベル: 設計文書に明記
   */
  removeArtifact(artifactId: ArtifactId): boolean {
    return this.artifacts.delete(artifactId);
  }

  /**
   * 【機能概要】: 全アーティファクトを取得
   * 【実装方針】: 所持している全アーティファクトIDを配列で返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getArtifacts(): ArtifactId[] {
    return Array.from(this.artifacts);
  }

  /**
   * 【機能概要】: アーティファクト所持判定
   * 【実装方針】: 指定アーティファクトを所持しているか判定
   * 🔵 信頼性レベル: 設計文書に明記
   */
  hasArtifact(artifactId: ArtifactId): boolean {
    return this.artifacts.has(artifactId);
  }

  /**
   * 【機能概要】: アーティファクト数を取得
   * 【実装方針】: 所持しているアーティファクトの総数を返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getArtifactCount(): number {
    return this.artifacts.size;
  }

  // ===========================================================================
  // 検索
  // ===========================================================================

  /**
   * 【機能概要】: 素材をインスタンスIDで検索
   * 【実装方針】: インスタンスIDで素材を検索
   * 🔵 信頼性レベル: 設計文書に明記
   */
  findMaterialById(instanceId: string): MaterialInstance | null {
    return this.materials.get(instanceId) ?? null;
  }

  /**
   * 【機能概要】: アイテムをインスタンスIDで検索
   * 【実装方針】: インスタンスIDでアイテムを検索
   * 🔵 信頼性レベル: 設計文書に明記
   */
  findItemById(instanceId: string): ItemInstance | null {
    return this.items.get(instanceId) ?? null;
  }

  // ===========================================================================
  // インベントリ操作
  // ===========================================================================

  /**
   * 【機能概要】: インベントリをクリア
   * 【実装方針】: 全素材、全アイテム、全アーティファクトを削除
   * 🔵 信頼性レベル: 設計文書に明記
   */
  clear(): void {
    this.materials.clear();
    this.items.clear();
    this.artifacts.clear();
  }

  /**
   * 【機能概要】: 素材の最大容量を取得
   * 【実装方針】: 素材インベントリの最大容量を返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getMaterialCapacity(): number {
    return MAX_MATERIALS;
  }

  /**
   * 【機能概要】: 素材の残り容量を取得
   * 【実装方針】: 最大容量 - 現在数
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getMaterialRemainingCapacity(): number {
    return MAX_MATERIALS - this.materials.size;
  }

  /**
   * 【機能概要】: アイテムの最大容量を取得
   * 【実装方針】: アイテムインベントリの最大容量を返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getItemCapacity(): number {
    return MAX_ITEMS;
  }

  /**
   * 【機能概要】: アイテムの残り容量を取得
   * 【実装方針】: 最大容量 - 現在数
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getItemRemainingCapacity(): number {
    return MAX_ITEMS - this.items.size;
  }

  /**
   * 【機能概要】: アーティファクトの最大容量を取得
   * 【実装方針】: アーティファクトインベントリの最大容量を返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getArtifactCapacity(): number {
    return MAX_ARTIFACTS;
  }

  /**
   * 【機能概要】: アーティファクトの残り容量を取得
   * 【実装方針】: 最大容量 - 現在数
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getArtifactRemainingCapacity(): number {
    return MAX_ARTIFACTS - this.artifacts.size;
  }
}
