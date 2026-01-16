/**
 * state-manager.ts - StateManager実装
 *
 * TASK-0005: StateManager実装
 * ゲーム状態を一元管理し、状態変更時にイベントを発行する
 */

import type { GamePhase, IGameState, ISaveData } from '@shared/types';
import { DomainError, ErrorCodes, GameEventType } from '@shared/types';
import type { IEventBus } from '../events/event-bus.interface';
import { INITIAL_GAME_STATE, MAX_ACTION_POINTS, VALID_PHASE_TRANSITIONS } from './initial-state';
import type { IStateManager } from './state-manager.interface';

/**
 * StateManager実装
 *
 * @example
 * ```typescript
 * const eventBus = new EventBus();
 * const stateManager = new StateManager(eventBus);
 *
 * // 状態取得
 * const state = stateManager.getState();
 *
 * // フェーズ変更
 * stateManager.setPhase(GamePhase.GATHERING);
 *
 * // リソース操作
 * stateManager.addGold(100);
 * stateManager.spendActionPoints(1);
 * ```
 */
export class StateManager implements IStateManager {
  /** 現在のゲーム状態 */
  private state: IGameState;

  /**
   * StateManagerを作成する
   *
   * @param eventBus イベントバス
   */
  constructor(private readonly eventBus: IEventBus) {
    this.state = { ...INITIAL_GAME_STATE };
  }

  // =============================================================================
  // 状態取得・更新
  // =============================================================================

  /**
   * 現在のゲーム状態を取得する
   *
   * @returns 現在のゲーム状態（イミュータブルなコピー）
   */
  getState(): Readonly<IGameState> {
    return { ...this.state };
  }

  /**
   * ゲーム状態を部分的に更新する
   *
   * @param partial 更新するプロパティ
   */
  updateState(partial: Partial<IGameState>): void {
    this.state = {
      ...this.state,
      ...partial,
    };
  }

  // =============================================================================
  // フェーズ管理
  // =============================================================================

  /**
   * ゲームフェーズを変更する
   *
   * @param phase 新しいフェーズ
   * @throws 無効なフェーズ遷移の場合
   */
  setPhase(phase: GamePhase): void {
    if (!this.canTransitionTo(phase)) {
      throw new DomainError(
        ErrorCodes.INVALID_PHASE_TRANSITION,
        `Cannot transition from ${this.state.currentPhase} to ${phase}`,
      );
    }

    const previousPhase = this.state.currentPhase;
    this.state = {
      ...this.state,
      currentPhase: phase,
    };

    this.eventBus.emit(GameEventType.PHASE_CHANGED, {
      previousPhase,
      newPhase: phase,
    });
  }

  /**
   * 指定フェーズへの遷移が可能か確認する
   *
   * @param phase 確認するフェーズ
   * @returns 遷移可能な場合true
   */
  canTransitionTo(phase: GamePhase): boolean {
    const validTargets = VALID_PHASE_TRANSITIONS[this.state.currentPhase];
    return validTargets.includes(phase);
  }

  // =============================================================================
  // 日進行
  // =============================================================================

  /**
   * 日を進める
   *
   * currentDay を +1 し、remainingDays を -1 し、AP を回復する
   */
  advanceDay(): void {
    this.state = {
      ...this.state,
      currentDay: this.state.currentDay + 1,
      remainingDays: this.state.remainingDays - 1,
      actionPoints: MAX_ACTION_POINTS,
    };

    this.eventBus.emit(GameEventType.DAY_STARTED, {
      day: this.state.currentDay,
      remainingDays: this.state.remainingDays,
    });
  }

  // =============================================================================
  // リソース管理
  // =============================================================================

  /**
   * 行動ポイントを消費する
   *
   * @param amount 消費量
   * @returns 消費に成功した場合true、APが不足している場合false
   */
  spendActionPoints(amount: number): boolean {
    if (this.state.actionPoints < amount) {
      return false;
    }

    this.state = {
      ...this.state,
      actionPoints: this.state.actionPoints - amount,
    };

    return true;
  }

  /**
   * ゴールドを追加する
   *
   * @param amount 追加量
   */
  addGold(amount: number): void {
    this.state = {
      ...this.state,
      gold: this.state.gold + amount,
    };
  }

  /**
   * ゴールドを消費する
   *
   * @param amount 消費量
   * @returns 消費に成功した場合true、ゴールドが不足している場合false
   */
  spendGold(amount: number): boolean {
    if (this.state.gold < amount) {
      return false;
    }

    this.state = {
      ...this.state,
      gold: this.state.gold - amount,
    };

    return true;
  }

  // =============================================================================
  // 昇格ゲージ
  // =============================================================================

  /**
   * 貢献度を追加する
   *
   * @param amount 追加量
   */
  addContribution(_amount: number): void {
    // TODO: 昇格ゲージの実装（TASK-0014で詳細実装予定）
  }

  // =============================================================================
  // 初期化・リセット
  // =============================================================================

  /**
   * ゲーム状態を初期化する
   *
   * @param initialState カスタム初期状態（部分的に指定可能）
   */
  initialize(initialState?: Partial<IGameState>): void {
    this.state = {
      ...INITIAL_GAME_STATE,
      ...initialState,
    };
  }

  /**
   * ゲーム状態をデフォルト初期状態にリセットする
   */
  reset(): void {
    this.state = { ...INITIAL_GAME_STATE };
  }

  // =============================================================================
  // セーブ/ロード
  // =============================================================================

  /**
   * セーブデータからゲーム状態を復元する
   *
   * @param saveData セーブデータ
   */
  loadFromSaveData(saveData: ISaveData): void {
    this.state = { ...saveData.gameState };
  }

  /**
   * 現在のゲーム状態をセーブデータ形式でエクスポートする
   *
   * @returns セーブデータ
   */
  exportToSaveData(): ISaveData {
    return {
      version: '1.0.0',
      lastSaved: new Date().toISOString(),
      gameState: { ...this.state },
      deckState: {
        deck: [],
        hand: [],
        discard: [],
        ownedCards: [],
      },
      inventoryState: {
        materials: [],
        craftedItems: [],
        storageLimit: 20,
      },
      questState: {
        activeQuests: [],
        todayClients: [],
        todayQuests: [],
        questLimit: 3,
      },
      artifacts: [],
    };
  }
}
