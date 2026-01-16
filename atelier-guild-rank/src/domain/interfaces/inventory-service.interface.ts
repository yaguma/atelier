/**
 * inventory-service.interface.ts - InventoryServiceインターフェース
 *
 * TASK-0015: InventoryService実装
 *
 * @description
 * インベントリ管理のインターフェース定義。
 * 素材、アイテム、アーティファクトの追加・削除・取得を提供する。
 *
 * @信頼性レベル 🔵
 * - 設計文書・要件定義書に基づいた定義
 * - 容量制限管理
 * - カテゴリ別フィルタリング
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { ArtifactId, Attribute, ItemId } from '@shared/types';

// =============================================================================
// InventoryServiceインターフェース
// =============================================================================

/**
 * 【機能概要】: InventoryServiceインターフェース
 * 【実装方針】: 素材、アイテム、アーティファクトの管理を提供
 * 🔵 信頼性レベル: 設計文書・要件定義書に明記
 */
export interface IInventoryService {
  // ===========================================================================
  // 素材管理
  // ===========================================================================

  /**
   * 【機能概要】: 素材を追加
   * 【実装方針】: 容量チェック後、素材をインベントリに追加
   * 【エラー】: 容量超過時
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param material - 追加する素材インスタンス
   */
  addMaterial(material: MaterialInstance): void;

  /**
   * 【機能概要】: 素材を複数追加
   * 【実装方針】: 容量チェック後、複数の素材をインベントリに追加
   * 【エラー】: 容量超過時
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param materials - 追加する素材インスタンスの配列
   */
  addMaterials(materials: MaterialInstance[]): void;

  /**
   * 【機能概要】: 素材を削除
   * 【実装方針】: インスタンスIDで素材を検索し削除
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param instanceId - 削除する素材のインスタンスID
   * @returns 削除された素材（存在しない場合はnull）
   */
  removeMaterial(instanceId: string): MaterialInstance | null;

  /**
   * 【機能概要】: 複数の素材を削除
   * 【実装方針】: 複数のインスタンスIDで素材を検索し削除
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param instanceIds - 削除する素材のインスタンスIDの配列
   * @returns 削除された素材の配列
   */
  removeMaterials(instanceIds: string[]): MaterialInstance[];

  /**
   * 【機能概要】: 全素材を取得
   * 【実装方針】: インベントリ内の全素材を配列で返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 素材インスタンスの配列
   */
  getMaterials(): MaterialInstance[];

  /**
   * 【機能概要】: 属性で素材をフィルタリング
   * 【実装方針】: 指定属性を持つ素材のみを返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param attribute - フィルタリングする属性
   * @returns フィルタリングされた素材の配列
   */
  getMaterialsByAttribute(attribute: Attribute): MaterialInstance[];

  /**
   * 【機能概要】: 素材数を取得
   * 【実装方針】: インベントリ内の素材の総数を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 素材の総数
   */
  getMaterialCount(): number;

  // ===========================================================================
  // アイテム管理
  // ===========================================================================

  /**
   * 【機能概要】: アイテムを追加
   * 【実装方針】: 容量チェック後、アイテムをインベントリに追加
   * 【エラー】: 容量超過時
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param item - 追加するアイテムインスタンス
   */
  addItem(item: ItemInstance): void;

  /**
   * 【機能概要】: アイテムを削除
   * 【実装方針】: インスタンスIDでアイテムを検索し削除
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param instanceId - 削除するアイテムのインスタンスID
   * @returns 削除されたアイテム（存在しない場合はnull）
   */
  removeItem(instanceId: string): ItemInstance | null;

  /**
   * 【機能概要】: 全アイテムを取得
   * 【実装方針】: インベントリ内の全アイテムを配列で返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns アイテムインスタンスの配列
   */
  getItems(): ItemInstance[];

  /**
   * 【機能概要】: アイテムIDでフィルタリング
   * 【実装方針】: 指定アイテムIDを持つアイテムのみを返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param itemId - フィルタリングするアイテムID
   * @returns フィルタリングされたアイテムの配列
   */
  getItemsByType(itemId: ItemId): ItemInstance[];

  /**
   * 【機能概要】: アイテム数を取得
   * 【実装方針】: インベントリ内のアイテムの総数を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns アイテムの総数
   */
  getItemCount(): number;

  // ===========================================================================
  // アーティファクト管理
  // ===========================================================================

  /**
   * 【機能概要】: アーティファクトを追加
   * 【実装方針】: 容量チェック後、アーティファクトを追加
   * 【エラー】: 容量超過時、重複時
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param artifactId - 追加するアーティファクトID
   */
  addArtifact(artifactId: ArtifactId): void;

  /**
   * 【機能概要】: アーティファクトを削除
   * 【実装方針】: アーティファクトIDで検索し削除
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param artifactId - 削除するアーティファクトID
   * @returns 削除成功時true
   */
  removeArtifact(artifactId: ArtifactId): boolean;

  /**
   * 【機能概要】: 全アーティファクトを取得
   * 【実装方針】: 所持している全アーティファクトIDを配列で返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns アーティファクトIDの配列
   */
  getArtifacts(): ArtifactId[];

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
   * 【機能概要】: アーティファクト数を取得
   * 【実装方針】: 所持しているアーティファクトの総数を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns アーティファクトの総数
   */
  getArtifactCount(): number;

  // ===========================================================================
  // 検索
  // ===========================================================================

  /**
   * 【機能概要】: 素材をインスタンスIDで検索
   * 【実装方針】: インスタンスIDで素材を検索
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param instanceId - 検索するインスタンスID
   * @returns 見つかった素材（存在しない場合はnull）
   */
  findMaterialById(instanceId: string): MaterialInstance | null;

  /**
   * 【機能概要】: アイテムをインスタンスIDで検索
   * 【実装方針】: インスタンスIDでアイテムを検索
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param instanceId - 検索するインスタンスID
   * @returns 見つかったアイテム（存在しない場合はnull）
   */
  findItemById(instanceId: string): ItemInstance | null;

  // ===========================================================================
  // インベントリ操作
  // ===========================================================================

  /**
   * 【機能概要】: インベントリをクリア
   * 【実装方針】: 全素材、全アイテム、全アーティファクトを削除
   * 🔵 信頼性レベル: 設計文書に明記
   */
  clear(): void;

  /**
   * 【機能概要】: 素材の最大容量を取得
   * 【実装方針】: 素材インベントリの最大容量を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 素材の最大容量
   */
  getMaterialCapacity(): number;

  /**
   * 【機能概要】: 素材の残り容量を取得
   * 【実装方針】: 最大容量 - 現在数
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns 素材の残り容量
   */
  getMaterialRemainingCapacity(): number;

  /**
   * 【機能概要】: アイテムの最大容量を取得
   * 【実装方針】: アイテムインベントリの最大容量を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns アイテムの最大容量
   */
  getItemCapacity(): number;

  /**
   * 【機能概要】: アイテムの残り容量を取得
   * 【実装方針】: 最大容量 - 現在数
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns アイテムの残り容量
   */
  getItemRemainingCapacity(): number;

  /**
   * 【機能概要】: アーティファクトの最大容量を取得
   * 【実装方針】: アーティファクトインベントリの最大容量を返す
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns アーティファクトの最大容量
   */
  getArtifactCapacity(): number;

  /**
   * 【機能概要】: アーティファクトの残り容量を取得
   * 【実装方針】: 最大容量 - 現在数
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns アーティファクトの残り容量
   */
  getArtifactRemainingCapacity(): number;
}
