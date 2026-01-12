/**
 * 状態セレクタ
 *
 * TASK-0252: StateManager Phaser連携実装
 * PhaserStateManagerから派生値を計算するセレクタを提供する。
 * UIコンポーネントが必要とする複合的な状態判定を集約する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/dataflow.md
 */

import type { PhaserStateManager } from './PhaserStateManager';
import type { GuildRank } from '@domain/rank/RankConfig';

/**
 * 状態セレクタクラス
 *
 * 状態から派生値を計算するセレクタを提供する。
 *
 * @example
 * ```typescript
 * const selectors = new StateSelectors(phaserStateManager);
 *
 * if (selectors.canAfford(100)) {
 *   // 購入処理
 * }
 *
 * if (selectors.hasEnoughAP(1)) {
 *   // アクション実行
 * }
 * ```
 */
export class StateSelectors {
  /** PhaserStateManagerインスタンス */
  private stateManager: PhaserStateManager;

  /**
   * コンストラクタ
   * @param stateManager PhaserStateManagerインスタンス
   */
  constructor(stateManager: PhaserStateManager) {
    this.stateManager = stateManager;
  }

  // ===== プレイヤー関連 =====

  /**
   * 指定金額を支払えるかどうかを判定する
   * @param cost 必要な金額
   * @returns 支払い可能な場合true
   */
  canAfford(cost: number): boolean {
    return this.stateManager.getPlayerState().gold >= cost;
  }

  /**
   * 指定APを消費できるかどうかを判定する
   * @param required 必要なAP
   * @returns 消費可能な場合true
   */
  hasEnoughAP(required: number): boolean {
    const player = this.stateManager.getPlayerState();
    return player.actionPoints >= required;
  }

  /**
   * 経験値進捗率を取得する（0.0〜1.0）
   * @returns 進捗率
   */
  getExpProgress(): number {
    const player = this.stateManager.getPlayerState();
    if (player.promotionGaugeMax === 0) {
      return 0;
    }
    return player.promotionGauge / player.promotionGaugeMax;
  }

  /**
   * 日数進捗率を取得する（0.0〜1.0）
   * @returns 進捗率
   */
  getDayProgress(): number {
    const game = this.stateManager.getGameState();
    const player = this.stateManager.getPlayerState();
    const maxDays = player.rankDaysRemaining + game.currentDay;
    if (maxDays === 0) {
      return 0;
    }
    return game.currentDay / maxDays;
  }

  /**
   * 現在の残り日数を取得する
   * @returns 残り日数
   */
  getRemainingDays(): number {
    const player = this.stateManager.getPlayerState();
    return Math.max(0, player.rankDaysRemaining);
  }

  /**
   * AP回復量を取得する
   * @returns 回復量（最大APとの差分）
   */
  getAPRecovery(): number {
    const player = this.stateManager.getPlayerState();
    return player.actionPointsMax - player.actionPoints;
  }

  // ===== 依頼関連 =====

  /**
   * アクティブな依頼数を取得する
   * @returns 依頼数
   */
  getActiveQuestCount(): number {
    return this.stateManager.getQuestState().activeQuests.length;
  }

  /**
   * 追加で依頼を受注できるかどうかを判定する
   * @param maxQuests 最大受注数（デフォルト: 3）
   * @returns 受注可能な場合true
   */
  canAcceptMoreQuests(maxQuests: number = 3): boolean {
    return this.getActiveQuestCount() < maxQuests;
  }

  /**
   * 納品可能な依頼一覧を取得する
   * @returns 納品可能な依頼の配列
   */
  getDeliverableQuests(): unknown[] {
    const quests = this.stateManager.getQuestState().activeQuests;
    const inventory = this.stateManager.getInventoryState();

    return quests.filter((activeQuest) => {
      // 依頼の要求アイテムをすべて持っているかチェック
      const quest = activeQuest.quest;
      if (!quest.requiredItems || quest.requiredItems.length === 0) {
        return true;
      }

      return quest.requiredItems.every((req: { itemId: string; quantity: number }) => {
        // 素材から検索
        const material = inventory.materials.find(
          (m) => m.material.id === req.itemId
        );
        if (material && material.quantity >= req.quantity) {
          return true;
        }

        // アイテムから検索
        const items = inventory.items.filter((i) => i.id === req.itemId);
        return items.length >= req.quantity;
      });
    });
  }

  /**
   * 納品可能な依頼があるかどうかを判定する
   * @returns 納品可能な依頼がある場合true
   */
  hasDeliverableQuests(): boolean {
    return this.getDeliverableQuests().length > 0;
  }

  // ===== インベントリ関連 =====

  /**
   * 指定素材の所持数を取得する
   * @param materialId 素材ID
   * @returns 所持数
   */
  getMaterialCount(materialId: string): number {
    const material = this.stateManager
      .getInventoryState()
      .materials.find((m) => m.material.id === materialId);
    return material?.quantity ?? 0;
  }

  /**
   * 指定アイテムの所持数を取得する
   * @param itemId アイテムID
   * @returns 所持数
   */
  getItemCount(itemId: string): number {
    return this.stateManager
      .getInventoryState()
      .items.filter((i) => i.id === itemId).length;
  }

  /**
   * 必要な素材をすべて所持しているかを判定する
   * @param requirements 必要素材一覧
   * @returns 所持している場合true
   */
  hasRequiredMaterials(
    requirements: { itemId: string; quantity: number }[]
  ): boolean {
    return requirements.every(
      (req) => this.getMaterialCount(req.itemId) >= req.quantity
    );
  }

  /**
   * インベントリの素材が上限に達しているかを判定する
   * @returns 上限に達している場合true
   */
  isMaterialCapacityFull(): boolean {
    const inventory = this.stateManager.getInventoryState();
    const totalMaterials = inventory.materials.reduce(
      (sum, m) => sum + m.quantity,
      0
    );
    return totalMaterials >= inventory.materialCapacity;
  }

  /**
   * 素材の空き容量を取得する
   * @returns 空き容量
   */
  getMaterialCapacityRemaining(): number {
    const inventory = this.stateManager.getInventoryState();
    const totalMaterials = inventory.materials.reduce(
      (sum, m) => sum + m.quantity,
      0
    );
    return Math.max(0, inventory.materialCapacity - totalMaterials);
  }

  // ===== デッキ関連 =====

  /**
   * 手札のカード数を取得する
   * @returns カード数
   */
  getHandSize(): number {
    return this.stateManager.getDeckState().hand.length;
  }

  /**
   * デッキの残りカード数を取得する
   * @returns カード数
   */
  getDeckSize(): number {
    return this.stateManager.getDeckState().cards.length;
  }

  /**
   * 捨て札のカード数を取得する
   * @returns カード数
   */
  getDiscardSize(): number {
    return this.stateManager.getDeckState().discardPile.length;
  }

  /**
   * カードをドローできるかを判定する
   * @returns ドロー可能な場合true
   */
  canDraw(): boolean {
    return this.getDeckSize() > 0 || this.getDiscardSize() > 0;
  }

  /**
   * 手札が空かどうかを判定する
   * @returns 空の場合true
   */
  isHandEmpty(): boolean {
    return this.getHandSize() === 0;
  }

  // ===== 複合条件 =====

  /**
   * ゲームオーバー条件を満たしているかを判定する
   * @returns ゲームオーバーの場合true
   */
  isGameOver(): boolean {
    const player = this.stateManager.getPlayerState();

    // 残り日数が0になった
    if (player.rankDaysRemaining <= 0) {
      return true;
    }

    // ゴールド枯渇
    if (player.gold < 0) {
      return true;
    }

    return false;
  }

  /**
   * ゲームクリア条件を満たしているかを判定する
   * @returns ゲームクリアの場合true
   */
  isGameClear(): boolean {
    const player = this.stateManager.getPlayerState();
    return player.rank === 'S';
  }

  /**
   * 昇格試験を受けられるかを判定する
   * @returns 受験可能な場合true
   */
  canTakeRankUpExam(): boolean {
    const player = this.stateManager.getPlayerState();
    return player.promotionGauge >= player.promotionGaugeMax;
  }

  /**
   * 次のランクを取得する
   * @returns 次のランク（最高ランクの場合はnull）
   */
  getNextRank(): GuildRank | null {
    const player = this.stateManager.getPlayerState();
    const ranks: GuildRank[] = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
    const currentIndex = ranks.indexOf(player.rank);

    if (currentIndex < 0 || currentIndex >= ranks.length - 1) {
      return null;
    }

    return ranks[currentIndex + 1];
  }

  /**
   * 現在のフェーズを取得する
   * @returns 現在のフェーズ
   */
  getCurrentPhase(): string {
    return this.stateManager.getGameState().currentPhase;
  }

  /**
   * 指定フェーズかどうかを判定する
   * @param phase フェーズ名
   * @returns 指定フェーズの場合true
   */
  isPhase(phase: string): boolean {
    return this.getCurrentPhase() === phase;
  }
}
