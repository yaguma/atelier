/**
 * Card.ts - カードエンティティ
 *
 * TASK-0009: カードエンティティ・DeckService実装
 *
 * @description
 * カードのインスタンスを表すエンティティ。
 * カードマスターデータへの参照を保持し、カードの属性を公開する。
 *
 * @信頼性レベル 🔵
 * - note.mdに基づいた実装
 * - CardMaster型定義に準拠
 */

import type {
  CardId,
  CardMaster,
  IEnhancementCardMaster,
  IGatheringCardMaster,
  IRecipeCardMaster,
} from '@shared/types';

/**
 * 【機能概要】: カードエンティティクラス
 * 【実装方針】: カードIDとマスターデータを保持し、getterで属性を公開する
 * 【テスト対応】: T-CARD-01 〜 T-CARD-08 を通すための実装
 * 🔵 信頼性レベル: note.md・設計文書に明記
 */
export class Card {
  /**
   * 【機能概要】: Cardエンティティのコンストラクタ
   * 【実装方針】: カードIDとマスターデータをreadonly プロパティとして保持
   * 【テスト対応】: T-CARD-01 コンストラクタでCardインスタンスを生成
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @param id - カードのインスタンスID
   * @param master - カードマスターデータ（静的データ）
   */
  constructor(
    public readonly id: CardId,
    public readonly master: CardMaster,
  ) {
    // 【実装内容】: readonly プロパティとして保持するため、処理なし
    // 🔵 信頼性レベル: note.md・設計文書に明記
  }

  /**
   * 【機能概要】: カード名を取得
   * 【実装方針】: master.nameをそのまま返す
   * 【テスト対応】: T-CARD-02 get name()でカード名を取得
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns カード名
   */
  get name(): string {
    // 【実装内容】: マスターデータのnameプロパティを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.name;
  }

  /**
   * 【機能概要】: カード種別を取得
   * 【実装方針】: master.typeをそのまま返す
   * 【テスト対応】: T-CARD-03 get type()でカード種別を取得
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns カード種別（GATHERING, RECIPE, ENHANCEMENT）
   */
  get type(): string {
    // 【実装内容】: マスターデータのtypeプロパティを返す
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.type;
  }

  /**
   * 【機能概要】: カードコストを取得
   * 【実装方針】: GATHERINGの場合はbaseCost、それ以外はcostを返す
   * 【テスト対応】: T-CARD-04 get cost()でコストを取得
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns カードコスト
   */
  get cost(): number {
    // 【実装内容】: カード種別に応じてコストを返す
    // 【処理方針】: GATHERINGカードの場合はbaseCost、それ以外はcostプロパティを参照
    // 🔵 信頼性レベル: note.md・設計文書に明記
    if (this.master.type === 'GATHERING') {
      // 【GATHERING用コスト】: baseCostプロパティを返す
      // 🔵 信頼性レベル: CardMaster型定義に準拠
      return this.master.baseCost;
    }

    // 【RECIPE/ENHANCEMENT用コスト】: costプロパティを返す
    // 🔵 信頼性レベル: CardMaster型定義に準拠
    return this.master.cost;
  }

  /**
   * 【機能概要】: 採取地カードかどうかを判定（型ガード）
   * 【実装方針】: type === 'GATHERING' を判定し、型をナローイング
   * 【テスト対応】: T-CARD-05 isGatheringCard()で採取地カード判定
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns 採取地カードの場合true
   */
  isGatheringCard(): this is Card & { master: IGatheringCardMaster } {
    // 【実装内容】: typeプロパティがGATHERINGかどうかを判定
    // 【型ナローイング】: trueの場合、card.master.materialPoolなどにアクセス可能になる
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.type === 'GATHERING';
  }

  /**
   * 【機能概要】: レシピカードかどうかを判定（型ガード）
   * 【実装方針】: type === 'RECIPE' を判定し、型をナローイング
   * 【テスト対応】: T-CARD-06 isRecipeCard()でレシピカード判定
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns レシピカードの場合true
   */
  isRecipeCard(): this is Card & { master: IRecipeCardMaster } {
    // 【実装内容】: typeプロパティがRECIPEかどうかを判定
    // 【型ナローイング】: trueの場合、card.master.requiredMaterialsなどにアクセス可能になる
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.type === 'RECIPE';
  }

  /**
   * 【機能概要】: 強化カードかどうかを判定（型ガード）
   * 【実装方針】: type === 'ENHANCEMENT' を判定し、型をナローイング
   * 【テスト対応】: T-CARD-07 isEnhancementCard()で強化カード判定
   * 🔵 信頼性レベル: note.md・設計文書に明記
   *
   * @returns 強化カードの場合true
   */
  isEnhancementCard(): this is Card & { master: IEnhancementCardMaster } {
    // 【実装内容】: typeプロパティがENHANCEMENTかどうかを判定
    // 【型ナローイング】: trueの場合、card.master.effectなどにアクセス可能になる
    // 🔵 信頼性レベル: note.md・設計文書に明記
    return this.master.type === 'ENHANCEMENT';
  }
}
