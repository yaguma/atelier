/**
 * save-load-service.ts - セーブ/ロードサービス
 *
 * TASK-0029: セーブ/ロード機能統合
 *
 * @description
 * セーブ/ロード機能を統合し、各サービスからの状態収集と復元を担当する。
 * 各サービスから現在の状態を取得し、セーブデータを構築してリポジトリに保存する。
 * ロード時はセーブデータから各サービスに状態を復元する。
 *
 * @信頼性レベル 🔵
 * - 設計文書・要件定義書に基づいた実装
 * - バージョン互換性チェック
 * - エラーハンドリング
 */

import type { IEventBus } from '@application/events/event-bus.interface';
import type { IStateManager } from '@application/services/state-manager.interface';
import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type { IInventoryService } from '@domain/interfaces/inventory-service.interface';
import type { IQuestService } from '@domain/interfaces/quest-service.interface';
import type { ISaveDataRepository } from '@domain/interfaces/save-data-repository.interface';
import type { CardId, ICraftedItem, IMaterialInstance, ISaveData } from '@shared/types';
import { ApplicationError, ErrorCodes, GameEventType } from '@shared/types';

// =============================================================================
// 定数
// =============================================================================

/** 現在のセーブデータバージョン */
const CURRENT_VERSION = '1.0.0';

// =============================================================================
// SaveLoadServiceインターフェース
// =============================================================================

/**
 * セーブ/ロードサービスインターフェース
 */
export interface ISaveLoadService {
  /**
   * 現在のゲーム状態をセーブする
   * @throws ApplicationError セーブに失敗した場合
   */
  save(): Promise<void>;

  /**
   * セーブデータからゲーム状態を復元する
   * @returns ロード成功時true、セーブデータなしの場合false
   * @throws ApplicationError バージョン非互換またはロード失敗時
   */
  load(): Promise<boolean>;

  /**
   * セーブデータの存在を確認する
   * @returns セーブデータが存在すればtrue
   */
  hasSaveData(): boolean;

  /**
   * セーブデータを削除する
   * @throws ApplicationError 削除に失敗した場合
   */
  deleteSaveData(): Promise<void>;
}

// =============================================================================
// SaveLoadService実装
// =============================================================================

/**
 * 【機能概要】: SaveLoadService
 * 【実装方針】: 各サービスから状態を収集してセーブ、セーブデータから状態を復元
 * 🔵 信頼性レベル: 設計文書・要件定義書に明記
 */
export class SaveLoadService implements ISaveLoadService {
  constructor(
    private readonly saveRepo: ISaveDataRepository,
    private readonly stateManager: IStateManager,
    private readonly deckService: IDeckService,
    private readonly inventoryService: IInventoryService,
    private readonly questService: IQuestService,
    private readonly eventBus: IEventBus,
  ) {}

  // ===========================================================================
  // セーブ
  // ===========================================================================

  /**
   * 【機能概要】: ゲーム状態をセーブする
   * 【実装方針】: 各サービスから状態を収集し、リポジトリに保存
   * 【テスト対応】: TC-SAVE-001〜TC-SAVE-008
   * 🔵 信頼性レベル: 設計文書に明記
   */
  async save(): Promise<void> {
    try {
      // 各サービスから状態を取得
      const gameState = this.stateManager.getState();
      const deck = this.deckService.getDeck();
      const hand = this.deckService.getHand();
      const discard = this.deckService.getDiscard();
      const materials = this.inventoryService.getMaterials();
      const items = this.inventoryService.getItems();
      const artifacts = this.inventoryService.getArtifacts();
      const activeQuests = this.questService.getActiveQuests();
      const availableQuests = this.questService.getAvailableQuests();
      const questLimit = this.questService.getQuestLimit();

      // カードIDに変換
      const deckIds = this.extractCardIds(deck);
      const handIds = this.extractCardIds(hand);
      const discardIds = this.extractCardIds(discard);

      // セーブデータを構築
      const saveData: ISaveData = {
        version: CURRENT_VERSION,
        lastSaved: new Date().toISOString(),
        gameState: { ...gameState },
        deckState: {
          deck: deckIds,
          hand: handIds,
          discard: discardIds,
          ownedCards: [...deckIds, ...handIds, ...discardIds],
        },
        inventoryState: {
          materials: this.convertMaterialsToSaveData(materials),
          craftedItems: this.convertItemsToSaveData(items),
          storageLimit: this.inventoryService.getMaterialCapacity(),
        },
        questState: {
          activeQuests: activeQuests,
          todayClients: [],
          todayQuests: availableQuests,
          questLimit: questLimit,
        },
        artifacts: artifacts,
      };

      // リポジトリに保存
      await this.saveRepo.save(saveData);

      // イベント発火
      this.eventBus.emit(GameEventType.GAME_SAVED, { saveData });
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        ErrorCodes.SAVE_FAILED,
        'セーブに失敗しました',
        error instanceof Error ? error : undefined,
      );
    }
  }

  // ===========================================================================
  // ロード
  // ===========================================================================

  /**
   * 【機能概要】: セーブデータからゲーム状態を復元する
   * 【実装方針】: リポジトリからデータを読み込み、各サービスに状態を復元
   * 【テスト対応】: TC-LOAD-001〜TC-LOAD-E007
   * 🔵 信頼性レベル: 設計文書に明記
   */
  async load(): Promise<boolean> {
    // リポジトリからセーブデータを読み込み
    const saveData = await this.saveRepo.load();

    // セーブデータが存在しない場合
    if (!saveData) {
      return false;
    }

    // バージョン互換性チェック
    if (!this.isCompatibleVersion(saveData.version)) {
      throw new ApplicationError(
        ErrorCodes.INVALID_SAVE_DATA,
        `Incompatible save data version: ${saveData.version}`,
      );
    }

    // 各サービスに状態を復元
    this.stateManager.loadFromSaveData(saveData);

    // イベント発火
    this.eventBus.emit(GameEventType.GAME_LOADED, { saveData });

    return true;
  }

  // ===========================================================================
  // 存在チェック
  // ===========================================================================

  /**
   * 【機能概要】: セーブデータの存在を確認する
   * 【実装方針】: リポジトリのexists()を呼び出す
   * 【テスト対応】: TC-EXISTS-001〜TC-EXISTS-003
   * 🔵 信頼性レベル: 設計文書に明記
   */
  hasSaveData(): boolean {
    return this.saveRepo.exists();
  }

  // ===========================================================================
  // 削除
  // ===========================================================================

  /**
   * 【機能概要】: セーブデータを削除する
   * 【実装方針】: リポジトリのdelete()を呼び出す
   * 【テスト対応】: TC-DELETE-001〜TC-DELETE-002
   * 🔵 信頼性レベル: 設計文書に明記
   */
  async deleteSaveData(): Promise<void> {
    await this.saveRepo.delete();
  }

  // ===========================================================================
  // プライベートメソッド
  // ===========================================================================

  /**
   * カード配列からIDのみを抽出する
   *
   * @param cards - カード配列
   * @returns カードIDの配列
   */
  private extractCardIds(cards: ReturnType<IDeckService['getDeck']>): CardId[] {
    return cards.map((card) => card.id);
  }

  /**
   * 【機能概要】: バージョン互換性をチェックする
   * 【実装方針】: メジャーバージョンが一致すれば互換性あり（セマンティックバージョニング）
   * 【テスト対応】: TC-VER-001〜TC-VER-005
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param version - チェックするバージョン文字列（例: "1.0.0"）
   * @returns 互換性がある場合true
   */
  private isCompatibleVersion(version: string): boolean {
    const [major] = version.split('.');
    const [currentMajor] = CURRENT_VERSION.split('.');
    return major === currentMajor;
  }

  /**
   * 【機能概要】: MaterialInstanceをセーブデータ形式に変換する
   * 【実装方針】: MaterialInstanceからIMaterialInstance形式に変換
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param materials - 素材インスタンスの配列
   * @returns セーブデータ形式の素材配列
   */
  private convertMaterialsToSaveData(
    materials: ReturnType<IInventoryService['getMaterials']>,
  ): IMaterialInstance[] {
    return materials.map((m) => ({
      materialId: m.materialId,
      quality: m.quality,
      quantity: 1,
    }));
  }

  /**
   * 【機能概要】: ItemInstanceをセーブデータ形式に変換する
   * 【実装方針】: ItemInstanceからICraftedItem形式に変換
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param items - アイテムインスタンスの配列
   * @returns セーブデータ形式のアイテム配列
   */
  private convertItemsToSaveData(items: ReturnType<IInventoryService['getItems']>): ICraftedItem[] {
    return items.map((item) => ({
      itemId: item.itemId,
      quality: item.quality,
      attributeValues: [],
      effectValues: [],
      usedMaterials: item.usedMaterials.map((mat) => ({
        materialId: mat.materialId,
        quality: mat.quality,
        quantity: 1,
        isRare: false,
      })),
    }));
  }
}
