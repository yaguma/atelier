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
