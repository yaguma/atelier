/**
 * Phaser環境向けステートマネージャー
 *
 * TASK-0252: StateManager Phaser連携実装
 * 既存のStateManagerをラップし、状態変更時にEventBusへ自動通知する。
 * UI層とApplication層の状態同期を実現する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/dataflow.md
 */

import type { StateManager, StateSnapshot } from '@application/StateManager';
import type { GameState } from '@domain/game/GameState';
import type { PlayerState } from '@domain/player/PlayerState';
import type { Deck } from '@domain/services/DeckService';
import type { Inventory } from '@domain/services/InventoryService';
import type { QuestState } from '@application/StateManager';
import { EventBus } from '../events/EventBus';

/**
 * 状態変更イベント
 */
export interface StateChangeEvent {
  /** 変更されたパス */
  path: string[];
  /** 変更前の値 */
  previousValue: unknown;
  /** 変更後の値 */
  newValue: unknown;
}

/**
 * 状態変更リスナー
 */
export type StateChangeListener = (event: StateChangeEvent) => void;

/**
 * PhaserStateManagerオプション
 */
export interface PhaserStateManagerOptions {
  /** 基底となるStateManager */
  stateManager: StateManager;
  /** EventBusインスタンス（省略時はシングルトンを使用） */
  eventBus?: EventBus;
}

/**
 * Phaser環境向けステートマネージャー
 *
 * 状態変更を自動的にEventBusに通知し、UI層とApplication層の
 * 状態同期を実現する。
 *
 * @example
 * ```typescript
 * const stateManager = createStateManager();
 * const phaserState = new PhaserStateManager({ stateManager });
 *
 * // リスナー登録
 * const unsubscribe = phaserState.subscribe('player', (event) => {
 *   console.log('Player state changed:', event);
 * });
 *
 * // 状態更新（EventBusにも自動通知される）
 * phaserState.updatePlayerState({ gold: 100 });
 * ```
 */
export class PhaserStateManager {
  /** 基底StateManager */
  private stateManager: StateManager;

  /** EventBusインスタンス */
  private eventBus: EventBus;

  /** パス別リスナー */
  private listeners: Map<string, Set<StateChangeListener>> = new Map();

  /** 通知中フラグ（循環防止） */
  private isNotifying = false;

  /** 保留中の通知 */
  private pendingNotifications: StateChangeEvent[] = [];

  /** 初期化済みフラグ */
  private initialized = false;

  /**
   * コンストラクタ
   * @param options オプション
   */
  constructor(options: PhaserStateManagerOptions) {
    this.stateManager = options.stateManager;
    this.eventBus = options.eventBus ?? EventBus.getInstance();
  }

  /**
   * 初期化処理
   * StateManagerの購読を開始する
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    // StateManagerの変更を監視
    this.stateManager.subscribe(() => {
      this.emitFullStateUpdate();
    });

    this.initialized = true;
  }

  /**
   * 初期化済みかどうかを返す
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  // ===== 状態取得 =====

  /**
   * ゲーム状態を取得する
   */
  getGameState(): GameState {
    return this.stateManager.getGameState();
  }

  /**
   * プレイヤー状態を取得する
   */
  getPlayerState(): PlayerState {
    return this.stateManager.getPlayerState();
  }

  /**
   * デッキ状態を取得する
   */
  getDeckState(): Deck {
    return this.stateManager.getDeckState();
  }

  /**
   * インベントリ状態を取得する
   */
  getInventoryState(): Inventory {
    return this.stateManager.getInventoryState();
  }

  /**
   * クエスト状態を取得する
   */
  getQuestState(): QuestState {
    return this.stateManager.getQuestState();
  }

  /**
   * スナップショットを取得する
   */
  getSnapshot(): StateSnapshot {
    return this.stateManager.getSnapshot();
  }

  // ===== 状態更新 =====

  /**
   * ゲーム状態を更新する
   * @param state 新しいゲーム状態
   */
  updateGameState(state: GameState): void {
    const previous = this.stateManager.getGameState();
    this.stateManager.updateGameState(state);
    this.notifyChange(['game'], previous, state);
    this.emitGameStateChange(previous, state);
  }

  /**
   * プレイヤー状態を更新する
   * @param state 新しいプレイヤー状態
   */
  updatePlayerState(state: PlayerState): void {
    const previous = this.stateManager.getPlayerState();
    this.stateManager.updatePlayerState(state);
    this.notifyChange(['player'], previous, state);
    this.emitPlayerUpdate(previous, state);
  }

  /**
   * デッキ状態を更新する
   * @param state 新しいデッキ状態
   */
  updateDeckState(state: Deck): void {
    const previous = this.stateManager.getDeckState();
    this.stateManager.updateDeckState(state);
    this.notifyChange(['deck'], previous, state);
    this.emitDeckUpdate(state);
  }

  /**
   * インベントリ状態を更新する
   * @param state 新しいインベントリ状態
   */
  updateInventoryState(state: Inventory): void {
    const previous = this.stateManager.getInventoryState();
    this.stateManager.updateInventoryState(state);
    this.notifyChange(['inventory'], previous, state);
    this.emitInventoryUpdate(state);
  }

  /**
   * クエスト状態を更新する
   * @param state 新しいクエスト状態
   */
  updateQuestState(state: QuestState): void {
    const previous = this.stateManager.getQuestState();
    this.stateManager.updateQuestState(state);
    this.notifyChange(['quests'], previous, state);
    this.emitQuestsUpdate(state);
  }

  // ===== 一括操作 =====

  /**
   * スナップショットから状態を復元する
   * @param snapshot 復元元のスナップショット
   */
  restoreFromSnapshot(snapshot: StateSnapshot): void {
    this.stateManager.restoreFromSnapshot(snapshot);
    this.notifyChange([], {}, snapshot);
    this.emitFullStateUpdate();
  }

  /**
   * 状態を初期値にリセットする
   */
  reset(): void {
    this.stateManager.reset();
    this.notifyChange([], {}, this.getSnapshot());
    this.emitFullStateUpdate();
  }

  // ===== リスナー管理 =====

  /**
   * 状態変更リスナーを登録する
   * @param path 監視するパス（'*'で全変更を監視）
   * @param listener リスナー関数
   * @returns 購読解除関数
   */
  subscribe(path: string, listener: StateChangeListener): () => void {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path)!.add(listener);

    return () => {
      const listeners = this.listeners.get(path);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  /**
   * リスナー数を取得する
   * @param path パス（省略時は全リスナー数）
   */
  getListenerCount(path?: string): number {
    if (path) {
      return this.listeners.get(path)?.size ?? 0;
    }

    let count = 0;
    this.listeners.forEach((set) => {
      count += set.size;
    });
    return count;
  }

  /**
   * 変更をリスナーに通知する
   */
  private notifyChange(
    path: string[],
    previousValue: unknown,
    newValue: unknown
  ): void {
    const event: StateChangeEvent = { path, previousValue, newValue };

    if (this.isNotifying) {
      this.pendingNotifications.push(event);
      return;
    }

    this.isNotifying = true;

    try {
      // パスリスナーに通知
      const pathKey = path.join('.');
      if (pathKey) {
        this.listeners.get(pathKey)?.forEach((listener) => listener(event));
      }

      // ルートリスナー（すべての変更）に通知
      this.listeners.get('*')?.forEach((listener) => listener(event));

      // 保留中の通知を処理
      while (this.pendingNotifications.length > 0) {
        const pending = this.pendingNotifications.shift()!;
        const pendingPathKey = pending.path.join('.');
        if (pendingPathKey) {
          this.listeners
            .get(pendingPathKey)
            ?.forEach((listener) => listener(pending));
        }
        this.listeners.get('*')?.forEach((listener) => listener(pending));
      }
    } finally {
      this.isNotifying = false;
    }
  }

  // ===== EventBus通知 =====

  /**
   * ゲーム状態変更をEventBusに通知
   */
  private emitGameStateChange(previous: GameState, current: GameState): void {
    // フェーズ変更
    if (previous.currentPhase !== current.currentPhase) {
      this.eventBus.emit('state:phase:changed', {
        phase: current.currentPhase,
        previousPhase: previous.currentPhase,
      });
    }

    // 日数変更
    if (previous.currentDay !== current.currentDay) {
      // PlayerStateのrankDaysRemainingを使用（maxDaysはGameStateに存在しない）
      const playerState = this.getPlayerState();
      this.eventBus.emit('state:day:changed', {
        day: current.currentDay,
        maxDays: playerState.rankDaysRemaining + current.currentDay,
      });
    }
  }

  /**
   * プレイヤー状態変更をEventBusに通知
   */
  private emitPlayerUpdate(previous: PlayerState, current: PlayerState): void {
    // ゴールド変更
    if (previous.gold !== current.gold) {
      this.eventBus.emit('state:gold:changed', {
        gold: current.gold,
        delta: current.gold - previous.gold,
      });
    }

    // AP変更
    if (
      previous.actionPoints !== current.actionPoints ||
      previous.actionPointsMax !== current.actionPointsMax
    ) {
      this.eventBus.emit('state:ap:changed', {
        ap: current.actionPoints,
        maxAP: current.actionPointsMax,
      });
    }

    // ランク変更
    if (previous.rank !== current.rank) {
      this.eventBus.emit('state:rank:changed', {
        rank: current.rank,
        previousRank: previous.rank,
      });
    }

    // 貢献度変更
    if (
      previous.promotionGauge !== current.promotionGauge ||
      previous.promotionGaugeMax !== current.promotionGaugeMax
    ) {
      this.eventBus.emit('state:contribution:changed', {
        contribution: current.promotionGauge,
        maxContribution: current.promotionGaugeMax,
      });
    }
  }

  /**
   * デッキ状態変更をEventBusに通知
   */
  private emitDeckUpdate(deck: Deck): void {
    this.eventBus.emit('state:hand:updated', {
      cardIds: deck.hand.map((c) => c.id),
    });
    this.eventBus.emit('state:deck:updated', {
      deckCount: deck.cards.length,
      discardCount: deck.discardPile.length,
    });
  }

  /**
   * インベントリ状態変更をEventBusに通知
   */
  private emitInventoryUpdate(inventory: Inventory): void {
    this.eventBus.emit('state:inventory:updated', {
      materialIds: inventory.materials.map((m) => m.material.id),
      itemIds: inventory.items.map((i) => i.id),
    });
  }

  /**
   * クエスト状態変更をEventBusに通知
   */
  private emitQuestsUpdate(quests: QuestState): void {
    this.eventBus.emit('state:quests:updated', {
      questIds: quests.availableQuests.map((q) => q.id),
    });
    this.eventBus.emit('state:activeQuests:updated', {
      questIds: quests.activeQuests.map((q) => q.quest.id),
    });
  }

  /**
   * 全状態更新をEventBusに通知
   */
  private emitFullStateUpdate(): void {
    const gameState = this.getGameState();
    const playerState = this.getPlayerState();
    const deck = this.getDeckState();
    const inventory = this.getInventoryState();
    const quests = this.getQuestState();

    // 各状態を通知
    this.eventBus.emit('state:phase:changed', {
      phase: gameState.currentPhase,
    });
    this.eventBus.emit('state:day:changed', {
      day: gameState.currentDay,
      maxDays: playerState.rankDaysRemaining + gameState.currentDay,
    });
    this.eventBus.emit('state:gold:changed', {
      gold: playerState.gold,
      delta: 0,
    });
    this.eventBus.emit('state:ap:changed', {
      ap: playerState.actionPoints,
      maxAP: playerState.actionPointsMax,
    });
    this.eventBus.emit('state:rank:changed', {
      rank: playerState.rank,
    });
    this.eventBus.emit('state:contribution:changed', {
      contribution: playerState.promotionGauge,
      maxContribution: playerState.promotionGaugeMax,
    });

    this.emitDeckUpdate(deck);
    this.emitInventoryUpdate(inventory);
    this.emitQuestsUpdate(quests);
  }

  // ===== シリアライズ =====

  /**
   * 状態をシリアライズする
   * @returns JSON文字列
   */
  serialize(): string {
    return JSON.stringify(this.getSnapshot());
  }

  /**
   * 状態をデシリアライズする
   * @param data JSON文字列
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data) as StateSnapshot;
      this.restoreFromSnapshot(parsed);
    } catch (error) {
      console.error('Failed to deserialize state:', error);
      throw new Error('Invalid save data');
    }
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    this.listeners.clear();
    this.pendingNotifications = [];
    this.isNotifying = false;
    this.initialized = false;
  }
}

/**
 * シングルトンインスタンス
 */
let instance: PhaserStateManager | null = null;

/**
 * PhaserStateManagerのシングルトンインスタンスを作成する
 * @param stateManager StateManagerインスタンス
 * @returns PhaserStateManagerインスタンス
 */
export function createPhaserStateManager(
  stateManager: StateManager
): PhaserStateManager {
  if (!instance) {
    instance = new PhaserStateManager({ stateManager });
    instance.initialize();
  }
  return instance;
}

/**
 * PhaserStateManagerのシングルトンインスタンスを取得する
 * @returns PhaserStateManagerインスタンス（未作成の場合はnull）
 */
export function getPhaserStateManager(): PhaserStateManager | null {
  return instance;
}

/**
 * PhaserStateManagerのシングルトンインスタンスをリセットする
 * テスト用途で使用する
 */
export function resetPhaserStateManager(): void {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}
