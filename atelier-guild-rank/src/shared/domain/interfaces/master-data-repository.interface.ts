/**
 * master-data-repository.interface.ts - マスターデータリポジトリインターフェース
 *
 * TASK-0006: マスターデータローダー実装
 * マスターデータへのアクセスを抽象化するインターフェース
 */

import type {
  ArtifactId,
  Attribute,
  CardId,
  CardMaster,
  CardType,
  ClientId,
  ClientMaster,
  GuildRank,
  IArtifactMaster,
  IGuildRankMaster,
  ItemId,
  ItemMaster,
  MaterialId,
  MaterialMaster,
  QuestId,
  QuestMaster,
} from '@shared/types';

/**
 * マスターデータリポジトリインターフェース
 *
 * ゲームの静的マスターデータへのアクセスを提供する
 */
export interface IMasterDataRepository {
  // =============================================================================
  // カード
  // =============================================================================

  /**
   * 全カードを取得する
   *
   * @returns カードマスターの配列
   */
  getAllCards(): CardMaster[];

  /**
   * IDでカードを取得する
   *
   * @param id カードID
   * @returns カードマスター（存在しない場合undefined）
   */
  getCardById(id: CardId): CardMaster | undefined;

  /**
   * 種別でカードを取得する
   *
   * @param type カード種別
   * @returns 指定種別のカードマスターの配列
   */
  getCardsByType(type: CardType): CardMaster[];

  // =============================================================================
  // 素材
  // =============================================================================

  /**
   * 全素材を取得する
   *
   * @returns 素材マスターの配列
   */
  getAllMaterials(): MaterialMaster[];

  /**
   * IDで素材を取得する
   *
   * @param id 素材ID
   * @returns 素材マスター（存在しない場合undefined）
   */
  getMaterialById(id: MaterialId): MaterialMaster | undefined;

  /**
   * 属性で素材を取得する
   *
   * @param attribute 属性
   * @returns 指定属性を持つ素材マスターの配列
   */
  getMaterialsByAttribute(attribute: Attribute): MaterialMaster[];

  // =============================================================================
  // アイテム
  // =============================================================================

  /**
   * 全アイテムを取得する
   *
   * @returns アイテムマスターの配列
   */
  getAllItems(): ItemMaster[];

  /**
   * IDでアイテムを取得する
   *
   * @param id アイテムID
   * @returns アイテムマスター（存在しない場合undefined）
   */
  getItemById(id: ItemId): ItemMaster | undefined;

  // =============================================================================
  // ランク
  // =============================================================================

  /**
   * 全ランクを取得する
   *
   * @returns ギルドランクマスターの配列
   */
  getAllRanks(): IGuildRankMaster[];

  /**
   * ランク値でランクを取得する
   *
   * @param rank ギルドランク
   * @returns ギルドランクマスター（存在しない場合undefined）
   */
  getRankByValue(rank: GuildRank): IGuildRankMaster | undefined;

  // =============================================================================
  // 依頼者
  // =============================================================================

  /**
   * 全依頼者を取得する
   *
   * @returns 依頼者マスターの配列
   */
  getAllClients(): ClientMaster[];

  /**
   * IDで依頼者を取得する
   *
   * @param id 依頼者ID
   * @returns 依頼者マスター（存在しない場合undefined）
   */
  getClientById(id: ClientId): ClientMaster | undefined;

  // =============================================================================
  // 依頼テンプレート
  // =============================================================================

  /**
   * 全依頼テンプレートを取得する
   *
   * @returns 依頼テンプレートマスターの配列
   */
  getAllQuests(): QuestMaster[];

  /**
   * IDで依頼テンプレートを取得する
   *
   * @param id 依頼ID
   * @returns 依頼テンプレートマスター（存在しない場合undefined）
   */
  getQuestById(id: QuestId): QuestMaster | undefined;

  // =============================================================================
  // アーティファクト
  // =============================================================================

  /**
   * 全アーティファクトを取得する
   *
   * @returns アーティファクトマスターの配列
   */
  getAllArtifacts(): IArtifactMaster[];

  /**
   * IDでアーティファクトを取得する
   *
   * @param id アーティファクトID
   * @returns アーティファクトマスター（存在しない場合undefined）
   */
  getArtifactById(id: ArtifactId): IArtifactMaster | undefined;

  // =============================================================================
  // 初期化
  // =============================================================================

  /**
   * マスターデータを読み込む
   *
   * @returns 読み込み完了を示すPromise
   * @throws 読み込みに失敗した場合
   */
  load(): Promise<void>;

  /**
   * マスターデータが読み込み済みかどうかを確認する
   *
   * @returns 読み込み済みの場合true
   */
  isLoaded(): boolean;
}
