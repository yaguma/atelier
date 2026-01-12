/**
 * Phaser環境向けゲームフロー管理
 *
 * TASK-0253: GameFlowManager Phaser連携実装
 * シーン遷移との連携とゲームフロー制御を実装する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/core-systems.md
 */

import type { PhaserStateManager } from '../state/PhaserStateManager';
import { StateSelectors } from '../state/StateSelectors';
import { EventBus } from '../events/EventBus';
import type { SceneKey } from '../config/SceneKeys';
import { SceneKeys } from '../config/SceneKeys';
import { GamePhase } from '@domain/common/types';

/**
 * フェーズ設定
 */
export interface PhaseConfig {
  /** フェーズタイプ */
  type: GamePhase;
  /** 表示名 */
  name: string;
  /** スキップ可能かどうか */
  canSkip: boolean;
}

/**
 * 日統計
 */
export interface DayStats {
  /** 完了した依頼数 */
  questsCompleted: number;
  /** 調合したアイテム数 */
  itemsCrafted: number;
  /** 獲得したゴールド */
  goldEarned: number;
}

/**
 * ゲーム結果判定
 */
export interface GameResult {
  /** ゲームオーバーかどうか */
  isGameOver: boolean;
  /** ゲームオーバー理由 */
  reason?: string;
  /** ゲームクリアかどうか */
  isGameClear: boolean;
}

/**
 * シーンマネージャーインターフェース
 */
export interface ISceneManager {
  /** シーン切り替え */
  switchTo(sceneKey: SceneKey, data?: unknown): void;
  /** 現在のシーンキーを取得 */
  getCurrentSceneKey(): SceneKey | null;
}

/**
 * PhaserGameFlowManagerオプション
 */
export interface PhaserGameFlowManagerOptions {
  /** PhaserStateManagerインスタンス */
  stateManager: PhaserStateManager;
  /** シーンマネージャー（省略時はnull） */
  sceneManager?: ISceneManager | null;
  /** EventBusインスタンス（省略時はシングルトンを使用） */
  eventBus?: EventBus;
}

/**
 * Phaser環境向けゲームフロー管理クラス
 *
 * ゲームの進行フローを管理し、シーン遷移やイベント発火を制御する。
 *
 * @example
 * ```typescript
 * const flowManager = new PhaserGameFlowManager({
 *   stateManager: phaserStateManager,
 *   sceneManager: sceneManager,
 * });
 *
 * // フェーズを進める
 * await flowManager.advancePhase();
 *
 * // ターン終了
 * await flowManager.endTurn();
 * ```
 */
export class PhaserGameFlowManager {
  /** PhaserStateManagerインスタンス */
  private stateManager: PhaserStateManager;

  /** シーンマネージャー */
  private sceneManager: ISceneManager | null;

  /** EventBusインスタンス */
  private eventBus: EventBus;

  /** セレクタ */
  private selectors: StateSelectors;

  /** フェーズ設定 */
  private phases: PhaseConfig[] = [
    { type: GamePhase.QUEST_ACCEPT, name: '依頼受注', canSkip: true },
    { type: GamePhase.GATHERING, name: '採取', canSkip: true },
    { type: GamePhase.ALCHEMY, name: '調合', canSkip: true },
    { type: GamePhase.DELIVERY, name: '納品', canSkip: true },
  ];

  /** 日統計 */
  private dayStats: DayStats = {
    questsCompleted: 0,
    itemsCrafted: 0,
    goldEarned: 0,
  };

  /** 初期化済みフラグ */
  private initialized = false;

  /** イベント購読解除関数 */
  private unsubscribes: Array<() => void> = [];

  /**
   * コンストラクタ
   * @param options オプション
   */
  constructor(options: PhaserGameFlowManagerOptions) {
    this.stateManager = options.stateManager;
    this.sceneManager = options.sceneManager ?? null;
    this.eventBus = options.eventBus ?? EventBus.getInstance();
    this.selectors = new StateSelectors(this.stateManager);
  }

  /**
   * 初期化処理
   * イベントリスナーを設定する
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.setupEventListeners();
    this.initialized = true;
  }

  /**
   * 初期化済みかどうかを返す
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * イベントリスナーを設定する
   */
  private setupEventListeners(): void {
    // 依頼受注フェーズ完了
    const unsubQuestPhase = this.eventBus.onVoid(
      'ui:questPhase:completed',
      () => {
        void this.advancePhase();
      }
    );
    this.unsubscribes.push(unsubQuestPhase);

    // 採取フェーズスキップ
    const unsubGatheringSkip = this.eventBus.onVoid(
      'ui:gathering:skipped',
      () => {
        void this.advancePhase();
      }
    );
    this.unsubscribes.push(unsubGatheringSkip);

    // 調合フェーズスキップ
    const unsubAlchemySkip = this.eventBus.onVoid('ui:alchemy:skipped', () => {
      void this.advancePhase();
    });
    this.unsubscribes.push(unsubAlchemySkip);

    // 日終了確認
    const unsubDayEnd = this.eventBus.onVoid('ui:dayEnd:confirmed', () => {
      void this.endTurn();
    });
    this.unsubscribes.push(unsubDayEnd);

    // ゲームリスタート
    const unsubRestart = this.eventBus.onVoid('game:restart', () => {
      void this.startNewGame();
    });
    this.unsubscribes.push(unsubRestart);
  }

  // ===== フェーズ管理 =====

  /**
   * 現在のフェーズを取得する
   * @returns 現在のフェーズ
   */
  getCurrentPhase(): GamePhase {
    return this.stateManager.getGameState().currentPhase;
  }

  /**
   * 次のフェーズを取得する
   * @returns 次のフェーズ（最終フェーズの場合はnull）
   */
  getNextPhase(): GamePhase | null {
    const currentPhase = this.getCurrentPhase();
    const currentIndex = this.phases.findIndex((p) => p.type === currentPhase);

    if (currentIndex < 0 || currentIndex >= this.phases.length - 1) {
      return null;
    }

    return this.phases[currentIndex + 1].type;
  }

  /**
   * フェーズを進める
   */
  async advancePhase(): Promise<void> {
    const nextPhase = this.getNextPhase();

    if (nextPhase) {
      await this.transitionToPhase(nextPhase);
    } else {
      // 全フェーズ完了 → ターン終了
      await this.endTurn();
    }
  }

  /**
   * フェーズをスキップする
   * @param phase スキップするフェーズ
   */
  async skipPhase(phase: GamePhase): Promise<void> {
    const phaseConfig = this.phases.find((p) => p.type === phase);

    if (!phaseConfig?.canSkip) {
      this.eventBus.emit('ui:toast:shown', {
        message: 'このフェーズはスキップできません',
        type: 'warning',
      });
      return;
    }

    await this.advancePhase();
  }

  /**
   * 指定フェーズに遷移する
   * @param phase 遷移先フェーズ
   */
  async transitionToPhase(phase: GamePhase): Promise<void> {
    const previousPhase = this.getCurrentPhase();

    // 状態更新
    const gameState = this.stateManager.getGameState();
    this.stateManager.updateGameState({
      ...gameState,
      currentPhase: phase,
    });

    // UIに通知
    this.eventBus.emit('state:phase:changed', {
      phase: phase,
      previousPhase: previousPhase,
    });
  }

  // ===== ターン管理 =====

  /**
   * ターン終了処理
   */
  async endTurn(): Promise<void> {
    // サマリーを保存
    const summary = { ...this.dayStats };

    // 日数を進める
    const gameState = this.stateManager.getGameState();
    const playerState = this.stateManager.getPlayerState();
    const newDay = gameState.currentDay + 1;

    // 残り日数を減らす（ゲーム結果判定の前に計算）
    const newRankDaysRemaining = Math.max(0, playerState.rankDaysRemaining - 1);

    // ゲーム結果判定（減らした後の値で判定）
    const gameResult = this.checkGameResult(newDay, {
      ...playerState,
      rankDaysRemaining: newRankDaysRemaining,
    });

    if (gameResult.isGameOver) {
      await this.handleGameOver(gameResult.reason!);
      return;
    }

    if (gameResult.isGameClear) {
      await this.handleGameClear();
      return;
    }

    // 状態更新
    this.stateManager.updateGameState({
      ...gameState,
      currentDay: newDay,
      currentPhase: GamePhase.QUEST_ACCEPT,
    });

    // プレイヤー状態更新（AP回復、残り日数減少）
    this.stateManager.updatePlayerState({
      ...playerState,
      actionPoints: playerState.actionPointsMax,
      rankDaysRemaining: newRankDaysRemaining,
    });

    // 統計リセット
    this.dayStats = {
      questsCompleted: 0,
      itemsCrafted: 0,
      goldEarned: 0,
    };

    // UIに通知
    this.eventBus.emit('state:day:changed', {
      day: newDay,
      maxDays: newRankDaysRemaining + newDay,
    });

    this.eventBus.emit('state:phase:changed', {
      phase: GamePhase.QUEST_ACCEPT,
      previousPhase: GamePhase.DELIVERY,
    });
  }

  /**
   * ゲーム結果を判定する
   * @param day 現在の日数
   * @param playerState プレイヤー状態
   * @returns ゲーム結果
   */
  private checkGameResult(
    day: number,
    playerState: { rankDaysRemaining: number; gold: number; rank: string }
  ): GameResult {
    // 日数オーバー（残り日数が0以下になった）
    if (playerState.rankDaysRemaining <= 0) {
      return {
        isGameOver: true,
        reason: '期限切れ - 期限内に昇格できませんでした',
        isGameClear: false,
      };
    }

    // ゴールド枯渇
    if (playerState.gold < 0) {
      return {
        isGameOver: true,
        reason: '所持金がマイナスになりました',
        isGameClear: false,
      };
    }

    // S級到達
    if (playerState.rank === 'S') {
      return {
        isGameOver: false,
        isGameClear: true,
      };
    }

    return {
      isGameOver: false,
      isGameClear: false,
    };
  }

  /**
   * ゲームオーバー処理
   * @param reason ゲームオーバー理由
   */
  private async handleGameOver(reason: string): Promise<void> {
    const gameState = this.stateManager.getGameState();
    const playerState = this.stateManager.getPlayerState();

    const stats = {
      finalDay: gameState.currentDay,
      finalRank: playerState.rank,
      reason,
    };

    // UIに通知
    this.eventBus.emit('state:game:changed', {
      state: 'gameOver',
    });

    // シーンマネージャーがあれば遷移
    if (this.sceneManager) {
      this.sceneManager.switchTo(SceneKeys.GAME_OVER, stats);
    }
  }

  /**
   * ゲームクリア処理
   */
  private async handleGameClear(): Promise<void> {
    const gameState = this.stateManager.getGameState();
    const playerState = this.stateManager.getPlayerState();

    const stats = {
      clearDay: gameState.currentDay,
      finalRank: 'S',
      totalGold: playerState.gold,
    };

    // UIに通知
    this.eventBus.emit('state:game:changed', {
      state: 'gameClear',
    });

    // シーンマネージャーがあれば遷移
    if (this.sceneManager) {
      this.sceneManager.switchTo(SceneKeys.GAME_CLEAR, stats);
    }
  }

  // ===== 統計更新 =====

  /**
   * 依頼完了を記録する
   */
  recordQuestComplete(): void {
    this.dayStats.questsCompleted++;
  }

  /**
   * アイテム調合を記録する
   */
  recordItemCrafted(): void {
    this.dayStats.itemsCrafted++;
  }

  /**
   * ゴールド獲得を記録する
   * @param amount 獲得量
   */
  recordGoldEarned(amount: number): void {
    this.dayStats.goldEarned += amount;
  }

  /**
   * 日統計を取得する
   * @returns 日統計
   */
  getDayStats(): DayStats {
    return { ...this.dayStats };
  }

  // ===== ゲーム開始・ロード =====

  /**
   * 新規ゲームを開始する
   */
  async startNewGame(): Promise<void> {
    // 状態リセット
    this.stateManager.reset();

    // 統計リセット
    this.dayStats = {
      questsCompleted: 0,
      itemsCrafted: 0,
      goldEarned: 0,
    };

    // UIに通知
    this.eventBus.emit('state:game:changed', {
      state: 'playing',
    });

    // シーンマネージャーがあれば遷移
    if (this.sceneManager) {
      this.sceneManager.switchTo(SceneKeys.MAIN);
    }

    // 最初のフェーズへ
    await this.transitionToPhase(GamePhase.QUEST_ACCEPT);
  }

  /**
   * ゲームをロードする
   * @param saveData セーブデータ（JSON文字列）
   */
  async loadGame(saveData: string): Promise<void> {
    this.stateManager.deserialize(saveData);

    // 統計リセット
    this.dayStats = {
      questsCompleted: 0,
      itemsCrafted: 0,
      goldEarned: 0,
    };

    // UIに通知
    this.eventBus.emit('state:game:changed', {
      state: 'playing',
    });

    // シーンマネージャーがあれば遷移
    if (this.sceneManager) {
      this.sceneManager.switchTo(SceneKeys.MAIN);
    }

    // 保存時のフェーズへ
    const currentPhase = this.getCurrentPhase();
    await this.transitionToPhase(currentPhase);
  }

  // ===== ユーティリティ =====

  /**
   * フェーズ設定を取得する
   * @returns フェーズ設定配列
   */
  getPhases(): PhaseConfig[] {
    return [...this.phases];
  }

  /**
   * 指定フェーズの設定を取得する
   * @param phase フェーズ
   * @returns フェーズ設定（存在しない場合はundefined）
   */
  getPhaseConfig(phase: GamePhase): PhaseConfig | undefined {
    return this.phases.find((p) => p.type === phase);
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    // イベント購読解除
    for (const unsubscribe of this.unsubscribes) {
      unsubscribe();
    }
    this.unsubscribes = [];

    this.initialized = false;
  }
}

/**
 * シングルトンインスタンス
 */
let instance: PhaserGameFlowManager | null = null;

/**
 * PhaserGameFlowManagerのシングルトンインスタンスを作成する
 * @param options オプション
 * @returns PhaserGameFlowManagerインスタンス
 */
export function createPhaserGameFlowManager(
  options: PhaserGameFlowManagerOptions
): PhaserGameFlowManager {
  if (!instance) {
    instance = new PhaserGameFlowManager(options);
    instance.initialize();
  }
  return instance;
}

/**
 * PhaserGameFlowManagerのシングルトンインスタンスを取得する
 * @returns PhaserGameFlowManagerインスタンス（未作成の場合はnull）
 */
export function getPhaserGameFlowManager(): PhaserGameFlowManager | null {
  return instance;
}

/**
 * PhaserGameFlowManagerのシングルトンインスタンスをリセットする
 * テスト用途で使用する
 */
export function resetPhaserGameFlowManager(): void {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}
