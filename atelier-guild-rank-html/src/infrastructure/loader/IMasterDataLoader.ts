/**
 * マスターデータローダーインターフェース
 * JSONファイルからマスターデータを読み込む
 */

import {
  IGatheringCard,
  IRecipeCard,
  IEnhancementCard,
} from '@domain/card/Card';
import { IMaterial } from '@domain/material/Material';
import { IItem } from '@domain/item/Item';
import { IQuestTemplate } from '@domain/quest/Quest';
import { IGuildRank } from '@domain/rank/Rank';
import { IArtifact } from '@domain/artifact/Artifact';
import { CardType, GuildRank, Quality, QuestType } from '@domain/common/types';

/**
 * クライアント種別
 */
export type ClientType = 'VILLAGER' | 'ADVENTURER' | 'MERCHANT' | 'NOBLE' | 'GUILD';

/**
 * クライアント（依頼人）インターフェース
 */
export interface IClient {
  /** クライアントID */
  id: string;
  /** クライアント名 */
  name: string;
  /** クライアント種別 */
  type: ClientType;
  /** 貢献度倍率 */
  contributionMultiplier: number;
  /** ゴールド倍率 */
  goldMultiplier: number;
  /** 期限補正値 */
  deadlineModifier: number;
  /** 好みの依頼タイプ */
  preferredQuestTypes: QuestType[];
  /** 解放ランク */
  unlockRank: GuildRank;
  /** 台詞パターン */
  dialoguePatterns: string[];
  /** 説明 */
  description: string;
}

/**
 * 初期デッキのカード情報
 */
export interface IInitialDeckCard {
  /** カードID */
  cardId: string;
  /** 枚数 */
  quantity: number;
  /** カード種別 */
  type: CardType;
  /** カード名 */
  name: string;
}

/**
 * 初期デッキインターフェース
 */
export interface IInitialDeck {
  /** バージョン */
  version: string;
  /** 説明 */
  description: string;
  /** 総カード枚数 */
  totalCards: number;
  /** デッキ構成 */
  deck: IInitialDeckCard[];
  /** カードID一覧（展開済み） */
  cardIds: string[];
  /** サマリー */
  summary?: {
    gathering: number;
    recipe: number;
    enhancement: number;
  };
}

/**
 * ショップアイテム種別
 */
export type ShopItemType = 'card' | 'material' | 'artifact';

/**
 * ショップアイテムインターフェース
 */
export interface IShopItem {
  /** ショップアイテムID */
  id: string;
  /** アイテム種別 */
  type: ShopItemType;
  /** 実際のアイテムID */
  itemId: string;
  /** 価格 */
  price: number;
  /** 在庫数（-1は無限在庫） */
  stock: number;
  /** 解放ランク */
  unlockRank: GuildRank;
  /** 説明 */
  description: string;
  /** 品質（素材用） */
  quality?: Quality;
}

/**
 * マスターデータセット
 * すべてのマスターデータを一括で保持する型
 */
export interface MasterDataSet {
  cards: {
    gathering: IGatheringCard[];
    recipe: IRecipeCard[];
    enhancement: IEnhancementCard[];
  };
  materials: IMaterial[];
  items: IItem[];
  quests: IQuestTemplate[];
  ranks: IGuildRank[];
  artifacts: IArtifact[];
  /** クライアント（依頼人）一覧 */
  clients: IClient[];
  /** 初期デッキ構成 */
  initialDeck: IInitialDeck;
  /** ショップアイテム一覧 */
  shopItems: IShopItem[];
}

/**
 * マスターデータローダーインターフェース
 */
export interface IMasterDataLoader {
  /**
   * 指定パスからJSONファイルを読み込む
   * @param path JSONファイルのパス
   * @returns 読み込んだデータ
   * @throws ファイルが存在しない場合、JSONが不正な場合にエラー
   */
  load<T>(path: string): Promise<T>;

  /**
   * すべてのマスターデータを一括ロードする
   * @returns マスターデータセット
   */
  loadAll(): Promise<MasterDataSet>;

  /**
   * キャッシュをクリアする
   */
  clearCache(): void;
}
