/**
 * DayEndManager
 *
 * TASK-0258: DayEndUI実装
 * 1日終了時の処理を管理するクラス。
 * イベントを通じて日中の統計を収集し、DayEndPanelで表示する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import { EventBus } from '../../events/EventBus';
import { PhaserStateManager } from '../../state/PhaserStateManager';
import { DayEndPanel, DaySummary } from './DayEndPanel';

/**
 * 日中の統計データ
 */
export interface DayStats {
  /** 完了した依頼数 */
  questsCompleted: number;
  /** 採取した素材数 */
  materialsGathered: number;
  /** 合成したアイテム数 */
  itemsCrafted: number;
  /** 獲得したゴールド */
  goldEarned: number;
  /** 使用したゴールド */
  goldSpent: number;
  /** 獲得した経験値/貢献度 */
  expGained: number;
}

/**
 * DayEndManagerオプション
 */
export interface DayEndManagerOptions {
  /** EventBusインスタンス */
  eventBus: EventBus;
  /** PhaserStateManagerインスタンス */
  stateManager: PhaserStateManager;
}

/**
 * 1日終了時の処理を管理するクラス
 *
 * @example
 * ```typescript
 * const manager = new DayEndManager({
 *   eventBus: EventBus.getInstance(),
 *   stateManager: getPhaserStateManager(),
 * });
 *
 * // シーン設定
 * manager.setScene(this);
 *
 * // 統計追加（イベントではなく手動の場合）
 * manager.addStats({ questsCompleted: 1 });
 *
 * // 日終了画面を表示
 * await manager.showDayEnd();
 * ```
 */
export class DayEndManager {
  private eventBus: EventBus;
  private stateManager: PhaserStateManager;
  private scene: Phaser.Scene | null = null;
  private dayStats: DayStats = {
    questsCompleted: 0,
    materialsGathered: 0,
    itemsCrafted: 0,
    goldEarned: 0,
    goldSpent: 0,
    expGained: 0,
  };

  /** イベントリスナーのunsubscribe関数 */
  private unsubscribers: Array<() => void> = [];

  constructor(options: DayEndManagerOptions) {
    this.eventBus = options.eventBus;
    this.stateManager = options.stateManager;

    this.setupEventListeners();
  }

  /**
   * シーンを設定する
   * @param scene Phaserシーン
   */
  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * イベントリスナーをセットアップする
   */
  private setupEventListeners(): void {
    // 依頼完了イベント - on()の戻り値がunsubscribe関数
    this.unsubscribers.push(
      this.eventBus.on('quest:delivered', (data) => {
        this.dayStats.questsCompleted++;
        this.dayStats.goldEarned += data.rewards?.gold ?? 0;
        this.dayStats.expGained += data.rewards?.contribution ?? 0;
      })
    );

    // 採取完了イベント
    this.unsubscribers.push(
      this.eventBus.on('gathering:complete', (data) => {
        this.dayStats.materialsGathered += data.materials?.length ?? 0;
      })
    );

    // 合成完了イベント
    this.unsubscribers.push(
      this.eventBus.on('alchemy:crafted', () => {
        this.dayStats.itemsCrafted++;
      })
    );

    // 購入イベント
    this.unsubscribers.push(
      this.eventBus.on('shop:purchased', (data) => {
        this.dayStats.goldSpent += data.cost ?? 0;
      })
    );
  }

  /**
   * 1日終了処理を開始する
   * @returns Promise<void>
   */
  async showDayEnd(): Promise<void> {
    if (!this.scene) {
      console.error('Scene not set for DayEndManager');
      return;
    }

    const gameState = this.stateManager.getGameState();
    const playerState = this.stateManager.getPlayerState();
    const questState = this.stateManager.getQuestState();

    // サマリーを作成
    const summary: DaySummary = {
      day: gameState.currentDay,
      questsCompleted: this.dayStats.questsCompleted,
      questsTotal:
        questState.activeQuests.length + this.dayStats.questsCompleted,
      materialsGathered: this.dayStats.materialsGathered,
      itemsCrafted: this.dayStats.itemsCrafted,
      goldEarned: this.dayStats.goldEarned,
      goldSpent: this.dayStats.goldSpent,
      expGained: this.dayStats.expGained,
      currentRank: playerState.rank,
      nextRankProgress:
        playerState.promotionGaugeMax > 0
          ? playerState.promotionGauge / playerState.promotionGaugeMax
          : 0,
    };

    return new Promise((resolve) => {
      new DayEndPanel({
        scene: this.scene!,
        x: this.scene!.cameras.main.centerX,
        y: this.scene!.cameras.main.centerY,
        summary,
        onContinue: () => {
          this.resetDayStats();
          this.eventBus.emit('ui:day:end:confirmed', {});
          resolve();
        },
      });
    });
  }

  /**
   * 日の統計をリセットする
   */
  private resetDayStats(): void {
    this.dayStats = {
      questsCompleted: 0,
      materialsGathered: 0,
      itemsCrafted: 0,
      goldEarned: 0,
      goldSpent: 0,
      expGained: 0,
    };
  }

  /**
   * 手動で統計を追加する（テスト用）
   * @param stats 追加する統計
   */
  addStats(stats: Partial<DayStats>): void {
    Object.assign(this.dayStats, stats);
  }

  /**
   * 現在の統計を取得する
   * @returns 統計データ
   */
  getStats(): DayStats {
    return { ...this.dayStats };
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    // イベントリスナーを解除
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];

    // 統計をリセット
    this.resetDayStats();

    // シーン参照をクリア
    this.scene = null;
  }
}
