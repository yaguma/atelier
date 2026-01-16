/**
 * master-data-repository.ts - マスターデータリポジトリ実装
 *
 * TASK-0006: マスターデータローダー実装
 * JSONからマスターデータを読み込み、キャッシュして提供する
 */

import type { IMasterDataRepository } from '@domain/interfaces';
import type {
  ArtifactId,
  CardId,
  CardMaster,
  ClientId,
  ClientMaster,
  IArtifactMaster,
  IEnhancementCardMaster,
  IGatheringCardMaster,
  IGuildRankMaster,
  IRecipeCardMaster,
  ItemId,
  ItemMaster,
  MaterialId,
  MaterialMaster,
} from '@shared/types';
import {
  ApplicationError,
  type Attribute,
  type CardType,
  ErrorCodes,
  type GuildRank,
  toArtifactId,
  toCardId,
  toClientId,
  toItemId,
  toMaterialId,
} from '@shared/types';
import type { IJsonLoader } from '../loaders/json-loader';
import { JsonLoader } from '../loaders/json-loader';

/**
 * マスターデータリポジトリ設定
 */
export interface IMasterDataRepositoryConfig {
  /** データファイルのベースパス */
  basePath: string;
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: IMasterDataRepositoryConfig = {
  basePath: '/assets/data/master',
};

/**
 * マスターデータリポジトリ実装
 *
 * @example
 * ```typescript
 * const repository = new MasterDataRepository();
 * await repository.load();
 *
 * const cards = repository.getAllCards();
 * const material = repository.getMaterialById(toMaterialId('herb'));
 * ```
 */
export class MasterDataRepository implements IMasterDataRepository {
  /** 設定 */
  private readonly config: IMasterDataRepositoryConfig;

  /** JSONローダー */
  private readonly loader: IJsonLoader;

  /** 読み込み済みフラグ */
  private loaded = false;

  // キャッシュ
  private cards: CardMaster[] = [];
  private cardIndex = new Map<CardId, CardMaster>();

  private materials: MaterialMaster[] = [];
  private materialIndex = new Map<MaterialId, MaterialMaster>();

  private items: ItemMaster[] = [];
  private itemIndex = new Map<ItemId, ItemMaster>();

  private ranks: IGuildRankMaster[] = [];
  private rankIndex = new Map<GuildRank, IGuildRankMaster>();

  private clients: ClientMaster[] = [];
  private clientIndex = new Map<ClientId, ClientMaster>();

  private artifacts: IArtifactMaster[] = [];
  private artifactIndex = new Map<ArtifactId, IArtifactMaster>();

  /**
   * MasterDataRepositoryを作成する
   *
   * @param config 設定（オプション）
   * @param loader JSONローダー（オプション、テスト用）
   */
  constructor(config?: Partial<IMasterDataRepositoryConfig>, loader?: IJsonLoader) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loader = loader ?? new JsonLoader();
  }

  // =============================================================================
  // カード
  // =============================================================================

  getAllCards(): CardMaster[] {
    this.ensureLoaded();
    return [...this.cards];
  }

  getCardById(id: CardId): CardMaster | undefined {
    this.ensureLoaded();
    return this.cardIndex.get(id);
  }

  getCardsByType(type: CardType): CardMaster[] {
    this.ensureLoaded();
    return this.cards.filter((card) => card.type === type);
  }

  // =============================================================================
  // 素材
  // =============================================================================

  getAllMaterials(): MaterialMaster[] {
    this.ensureLoaded();
    return [...this.materials];
  }

  getMaterialById(id: MaterialId): MaterialMaster | undefined {
    this.ensureLoaded();
    return this.materialIndex.get(id);
  }

  getMaterialsByAttribute(attribute: Attribute): MaterialMaster[] {
    this.ensureLoaded();
    return this.materials.filter((m) => m.attributes.includes(attribute));
  }

  // =============================================================================
  // アイテム
  // =============================================================================

  getAllItems(): ItemMaster[] {
    this.ensureLoaded();
    return [...this.items];
  }

  getItemById(id: ItemId): ItemMaster | undefined {
    this.ensureLoaded();
    return this.itemIndex.get(id);
  }

  // =============================================================================
  // ランク
  // =============================================================================

  getAllRanks(): IGuildRankMaster[] {
    this.ensureLoaded();
    return [...this.ranks];
  }

  getRankByValue(rank: GuildRank): IGuildRankMaster | undefined {
    this.ensureLoaded();
    return this.rankIndex.get(rank);
  }

  // =============================================================================
  // 依頼者
  // =============================================================================

  getAllClients(): ClientMaster[] {
    this.ensureLoaded();
    return [...this.clients];
  }

  getClientById(id: ClientId): ClientMaster | undefined {
    this.ensureLoaded();
    return this.clientIndex.get(id);
  }

  // =============================================================================
  // アーティファクト
  // =============================================================================

  getAllArtifacts(): IArtifactMaster[] {
    this.ensureLoaded();
    return [...this.artifacts];
  }

  getArtifactById(id: ArtifactId): IArtifactMaster | undefined {
    this.ensureLoaded();
    return this.artifactIndex.get(id);
  }

  // =============================================================================
  // 初期化
  // =============================================================================

  async load(): Promise<void> {
    // 2回目以降の呼び出しはキャッシュを使用
    if (this.loaded) {
      return;
    }

    try {
      // 全データを並列読み込み
      const [
        gatheringCards,
        recipeCards,
        enhancementCards,
        materials,
        items,
        ranks,
        clients,
        artifacts,
      ] = await Promise.all([
        this.loader.load<IGatheringCardMaster[]>(
          `${this.config.basePath}/cards/gathering_cards.json`,
        ),
        this.loader.load<IRecipeCardMaster[]>(`${this.config.basePath}/cards/recipe_cards.json`),
        this.loader.load<IEnhancementCardMaster[]>(
          `${this.config.basePath}/cards/enhancement_cards.json`,
        ),
        this.loader.load<MaterialMaster[]>(`${this.config.basePath}/items/materials.json`),
        this.loader.load<ItemMaster[]>(`${this.config.basePath}/items/items.json`),
        this.loader.load<IGuildRankMaster[]>(`${this.config.basePath}/ranks/guild_ranks.json`),
        this.loader.load<ClientMaster[]>(`${this.config.basePath}/quests/clients.json`),
        this.loader.load<IArtifactMaster[]>(`${this.config.basePath}/artifacts/artifacts.json`),
      ]);

      // カードのマージとインデックス構築
      this.cards = [
        ...gatheringCards.map((c) => ({ ...c, id: toCardId(c.id as string) })),
        ...recipeCards.map((c) => ({ ...c, id: toCardId(c.id as string) })),
        ...enhancementCards.map((c) => ({
          ...c,
          id: toCardId(c.id as string),
        })),
      ];
      this.buildCardIndex();

      // 素材のインデックス構築
      this.materials = materials.map((m) => ({
        ...m,
        id: toMaterialId(m.id as string),
      }));
      this.buildMaterialIndex();

      // アイテムのインデックス構築
      this.items = items.map((i) => ({ ...i, id: toItemId(i.id as string) }));
      this.buildItemIndex();

      // ランクのインデックス構築
      this.ranks = ranks;
      this.buildRankIndex();

      // 依頼者のインデックス構築
      this.clients = clients.map((c) => ({
        ...c,
        id: toClientId(c.id as string),
      }));
      this.buildClientIndex();

      // アーティファクトのインデックス構築
      this.artifacts = artifacts.map((a) => ({
        ...a,
        id: toArtifactId(a.id as string),
      }));
      this.buildArtifactIndex();

      this.loaded = true;
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCodes.DATA_LOAD_FAILED,
        'Failed to load master data',
        error instanceof Error ? error : undefined,
      );
    }
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  // =============================================================================
  // プライベートメソッド
  // =============================================================================

  /**
   * 読み込み済みかを確認し、未読み込みの場合はエラーを投げる
   */
  private ensureLoaded(): void {
    if (!this.loaded) {
      throw new ApplicationError(
        ErrorCodes.DATA_NOT_LOADED,
        'Master data is not loaded. Call load() first.',
      );
    }
  }

  /**
   * カードインデックスを構築する
   */
  private buildCardIndex(): void {
    this.cardIndex.clear();
    for (const card of this.cards) {
      this.cardIndex.set(card.id, card);
    }
  }

  /**
   * 素材インデックスを構築する
   */
  private buildMaterialIndex(): void {
    this.materialIndex.clear();
    for (const material of this.materials) {
      this.materialIndex.set(material.id, material);
    }
  }

  /**
   * アイテムインデックスを構築する
   */
  private buildItemIndex(): void {
    this.itemIndex.clear();
    for (const item of this.items) {
      this.itemIndex.set(item.id, item);
    }
  }

  /**
   * ランクインデックスを構築する
   */
  private buildRankIndex(): void {
    this.rankIndex.clear();
    for (const rank of this.ranks) {
      this.rankIndex.set(rank.id, rank);
    }
  }

  /**
   * 依頼者インデックスを構築する
   */
  private buildClientIndex(): void {
    this.clientIndex.clear();
    for (const client of this.clients) {
      this.clientIndex.set(client.id, client);
    }
  }

  /**
   * アーティファクトインデックスを構築する
   */
  private buildArtifactIndex(): void {
    this.artifactIndex.clear();
    for (const artifact of this.artifacts) {
      this.artifactIndex.set(artifact.id, artifact);
    }
  }
}
