/**
 * マスターデータローダー実装
 * fetchを使用してJSONファイルを読み込む
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
import {
  IMasterDataLoader,
  MasterDataSet,
  IClient,
  IInitialDeck,
  IShopItem,
} from './IMasterDataLoader';

/**
 * マスターデータ読み込みエラー
 * ファイルが存在しない、ネットワークエラーなど
 */
export class MasterDataLoadError extends Error {
  constructor(
    public readonly path: string,
    public readonly cause?: Error
  ) {
    super(`Failed to load master data: ${path}`);
    this.name = 'MasterDataLoadError';
  }
}

/**
 * マスターデータパースエラー
 * JSONが不正な場合
 */
export class MasterDataParseError extends Error {
  constructor(
    public readonly path: string,
    public readonly cause?: Error
  ) {
    super(`Failed to parse master data JSON: ${path}`);
    this.name = 'MasterDataParseError';
  }
}

/**
 * マスターデータローダー実装クラス
 */
export class MasterDataLoader implements IMasterDataLoader {
  private readonly basePath: string;
  private readonly cache: Map<string, unknown> = new Map();

  /**
   * コンストラクタ
   * @param basePath マスターデータJSONファイルのベースパス
   */
  constructor(basePath: string = '') {
    // 末尾のスラッシュを除去
    this.basePath = basePath.replace(/\/$/, '');
  }

  /**
   * 指定パスからJSONファイルを読み込む
   * キャッシュがあればキャッシュから返す
   */
  async load<T>(path: string): Promise<T> {
    const fullPath = this.buildPath(path);

    // キャッシュチェック
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath) as T;
    }

    try {
      const response = await fetch(fullPath);

      if (!response.ok) {
        throw new MasterDataLoadError(fullPath);
      }

      try {
        const data = (await response.json()) as T;
        // キャッシュに保存
        this.cache.set(fullPath, data);
        return data;
      } catch (parseError) {
        throw new MasterDataParseError(
          fullPath,
          parseError instanceof Error ? parseError : undefined
        );
      }
    } catch (error) {
      if (
        error instanceof MasterDataLoadError ||
        error instanceof MasterDataParseError
      ) {
        throw error;
      }
      throw new MasterDataLoadError(
        fullPath,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * すべてのマスターデータを一括ロードする
   */
  async loadAll(): Promise<MasterDataSet> {
    const [
      gathering,
      recipe,
      enhancement,
      materials,
      items,
      quests,
      ranks,
      artifacts,
      clients,
      initialDeck,
      shopItems,
    ] = await Promise.all([
      this.load<IGatheringCard[]>('cards/gathering.json'),
      this.load<IRecipeCard[]>('cards/recipe.json'),
      this.load<IEnhancementCard[]>('cards/enhancement.json'),
      this.load<IMaterial[]>('materials.json'),
      this.load<IItem[]>('items.json'),
      this.load<IQuestTemplate[]>('quests.json'),
      this.load<IGuildRank[]>('ranks.json'),
      this.load<IArtifact[]>('artifacts.json'),
      this.load<IClient[]>('clients.json'),
      this.load<IInitialDeck>('initial_deck.json'),
      this.load<IShopItem[]>('shop_items.json'),
    ]);

    return {
      cards: {
        gathering,
        recipe,
        enhancement,
      },
      materials,
      items,
      quests,
      ranks,
      artifacts,
      clients,
      initialDeck,
      shopItems,
    };
  }

  /**
   * キャッシュをクリアする
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * ベースパスとファイルパスを結合
   */
  private buildPath(path: string): string {
    if (!this.basePath) {
      return path;
    }
    return `${this.basePath}/${path}`;
  }
}
