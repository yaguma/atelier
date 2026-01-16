/**
 * ItemInstance.ts - アイテムインスタンスエンティティ
 *
 * TASK-0012: アイテムエンティティ・AlchemyService実装
 *
 * @description
 * 調合によって生成されたアイテムの実体を表すエンティティ。
 * アイテムマスターデータへの参照、実際の品質、使用した素材を保持する。
 *
 * @信頼性レベル 🔵
 * - note.mdに基づいた実装
 * - 不変オブジェクトとして設計
 */

import type { ItemId, Quality } from '@shared/types';
import type { ItemMaster } from '@shared/types/master-data';
import type { MaterialInstance } from './MaterialInstance';

/**
 * 【機能概要】: 品質価格係数定義
 * 【実装方針】: 品質ごとに価格に適用する係数を定義
 * 🔵 信頼性レベル: note.md・設計文書に明記
 *
 * | 品質 | 係数 |
 * |-----|------|
 * | D   | 0.5  |
 * | C   | 0.75 |
 * | B   | 1.0  |
 * | A   | 1.5  |
 * | S   | 2.0  |
 */
export const QUALITY_PRICE_MULTIPLIER: Record<Quality, number> = {
  D: 0.5,
  C: 0.75,
  B: 1.0,
  A: 1.5,
  S: 2.0,
};

/**
 * 【機能概要】: アイテムインスタンスエンティティクラス
 * 【実装方針】: インスタンスID、マスターデータ、品質、使用素材を保持し、getterで属性を公開
 * 【不変性】: 全プロパティがreadonlyで変更不可
 * 🔵 信頼性レベル: note.md・設計文書に明記
 */
export class ItemInstance {
  /**
   * 【機能概要】: ItemInstanceエンティティのコンストラクタ
   * 【実装方針】: インスタンスID、マスターデータ、品質、使用素材をreadonlyプロパティとして保持
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param instanceId - アイテムインスタンスの一意なID（例: "item_1705401234567_8934"）
   * @param master - アイテムマスターデータへの参照
   * @param quality - 実際の品質（D, C, B, A, S）
   * @param usedMaterials - 調合に使用した素材インスタンスのリスト
   */
  constructor(
    /** インスタンスID（一意） */
    public readonly instanceId: string,
    /** アイテムマスターへの参照 */
    public readonly master: ItemMaster,
    /** 実際の品質 */
    public readonly quality: Quality,
    /** 使用した素材リスト */
    public readonly usedMaterials: MaterialInstance[],
  ) {
    // 【実装内容】: readonly プロパティとして保持するため、処理なし
    // 🔵 信頼性レベル: note.md・設計文書に明記
  }

  /**
   * 【機能概要】: アイテムIDを取得
   * 【実装方針】: master.idをそのまま返す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns アイテムID
   */
  get itemId(): ItemId {
    // 【実装内容】: マスターデータのidプロパティを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.id;
  }

  /**
   * 【機能概要】: アイテム名を取得
   * 【実装方針】: master.nameをそのまま返す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns アイテム名
   */
  get name(): string {
    // 【実装内容】: マスターデータのnameプロパティを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.name;
  }

  /**
   * 【機能概要】: 基本価格を取得
   * 【実装方針】: master.basePriceを返す（存在しない場合は0）
   * 【型安全性】: IItem型にbasePriceはオプショナルなため、型アサーションで対応
   * 🟡 信頼性レベル: 設計文書から妥当に推測
   *
   * @returns 基本価格（未定義の場合は0）
   */
  get basePrice(): number {
    // 【実装内容】: マスターデータのbasePriceプロパティを返す
    // 【注意】: IItem型にはbasePriceが定義されていないため、型アサーションを使用
    // 将来的にはIItem型にbasePriceを追加するか、拡張型を定義することを推奨
    // 🟡 信頼性レベル: 設計文書から妥当に推測
    const masterWithPrice = this.master as { basePrice?: number };
    return masterWithPrice.basePrice ?? 0;
  }

  /**
   * 【機能概要】: 品質に応じた価格を計算
   * 【実装方針】: 基本価格 × 品質係数（端数切り捨て）
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns 品質に応じた最終価格
   *
   * @example
   * // 基本価格100G、品質Bの場合
   * // 100 * 1.0 = 100G
   *
   * // 基本価格100G、品質Aの場合
   * // 100 * 1.5 = 150G
   */
  calculatePrice(): number {
    // 【実装内容】: 基本価格に品質係数を掛けて端数切り捨て
    // 🔵 信頼性レベル: note.md・設計文書に明記
    const qualityMultiplier = QUALITY_PRICE_MULTIPLIER[this.quality];
    return Math.floor(this.basePrice * qualityMultiplier);
  }
}
