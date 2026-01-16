/**
 * MaterialInstance.ts - 素材インスタンスエンティティ
 *
 * TASK-0010: 素材エンティティ・MaterialService実装
 *
 * @description
 * プレイヤーが所持する素材の実体を表すエンティティ。
 * 素材マスターデータへの参照と実際の品質を保持する。
 *
 * @信頼性レベル 🔵
 * - note.mdに基づいた実装
 * - 不変オブジェクトとして設計
 */

import type { Attribute, IMaterial, MaterialId, Quality } from '@shared/types';

/**
 * 【機能概要】: 素材インスタンスエンティティクラス
 * 【実装方針】: インスタンスID、マスターデータ、品質を保持し、getterで属性を公開
 * 【不変性】: 全プロパティがreadonlyで変更不可
 * 🔵 信頼性レベル: note.md・設計文書に明記
 */
export class MaterialInstance {
  /**
   * 【機能概要】: MaterialInstanceエンティティのコンストラクタ
   * 【実装方針】: インスタンスID、マスターデータ、品質をreadonlyプロパティとして保持
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param instanceId - 素材インスタンスの一意なID（例: "material_1705401234567_8934"）
   * @param master - 素材マスターデータへの参照
   * @param quality - 実際の品質（D, C, B, A, S）
   */
  constructor(
    /** インスタンスID（一意） */
    public readonly instanceId: string,
    /** 素材マスターへの参照 */
    public readonly master: IMaterial,
    /** 実際の品質 */
    public readonly quality: Quality,
  ) {
    // 【実装内容】: readonly プロパティとして保持するため、処理なし
    // 🔵 信頼性レベル: note.md・設計文書に明記
  }

  /**
   * 【機能概要】: 素材IDを取得
   * 【実装方針】: master.idをそのまま返す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns 素材ID
   */
  get materialId(): MaterialId {
    // 【実装内容】: マスターデータのidプロパティを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.id;
  }

  /**
   * 【機能概要】: 素材名を取得
   * 【実装方針】: master.nameをそのまま返す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns 素材名
   */
  get name(): string {
    // 【実装内容】: マスターデータのnameプロパティを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.name;
  }

  /**
   * 【機能概要】: 基本品質を取得
   * 【実装方針】: master.baseQualityをそのまま返す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns 基本品質
   */
  get baseQuality(): Quality {
    // 【実装内容】: マスターデータのbaseQualityプロパティを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.baseQuality;
  }

  /**
   * 【機能概要】: 属性リストを取得
   * 【実装方針】: master.attributesをそのまま返す
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns 属性リスト
   */
  get attributes(): Attribute[] {
    // 【実装内容】: マスターデータのattributesプロパティを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.attributes;
  }
}
