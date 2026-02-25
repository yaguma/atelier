/**
 * MainScene ローカル型定義
 * Issue #266: MainScene分割リファクタリング
 *
 * @description
 * MainSceneおよびPhaseManagerで使用するローカルインターフェースを一元管理。
 * DIコンテナから取得するサービスの型定義を含む。
 */

import type { EventHandler } from '@shared/services';
import type { GamePhase, GuildRank } from '@shared/types/common';

// =============================================================================
// サービスインターフェース（依存注入用）
// =============================================================================

/**
 * StateManager インターフェース（依存注入用）
 */
export interface IMainSceneStateManager {
  getState(): {
    currentRank: GuildRank;
    promotionGauge: number;
    remainingDays: number;
    currentDay: number;
    currentPhase: GamePhase;
    gold: number;
    actionPoints: number;
    comboCount: number;
    rankHp: number;
    isPromotionTest: boolean;
  };
  updateState(state: Partial<ReturnType<IMainSceneStateManager['getState']>>): void;
  setPhase(phase: GamePhase): void;
  canTransitionTo(phase: GamePhase): boolean;
  addGold(amount: number): void;
  spendGold(amount: number): boolean;
  addContribution(amount: number): void;
}

/**
 * GameFlowManager インターフェース（依存注入用）
 */
export interface IMainSceneGameFlowManager {
  getCurrentPhase(): GamePhase;
  canAdvancePhase(): boolean;
  startPhase(phase: GamePhase): void;
  endPhase(): void;
  startNewGame(): void;
  continueGame(saveData: unknown): void;
  startDay(): void;
  endDay(): void;
  skipPhase(): void;
}

/**
 * BasePhaseUI インターフェース（フェーズUIの共通インターフェース）
 */
export interface IBasePhaseUI {
  setVisible(visible: boolean): IBasePhaseUI;
  destroy(): void;
}

/**
 * EventBus インターフェース（依存注入用）
 * IBusEvent/EventHandler は shared/services/event-bus/types.ts の本家定義を再利用
 */
export interface IMainSceneEventBus {
  emit(event: string, data: unknown): void;
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void;
  off(event: string, handler?: EventHandler): void;
}

/**
 * MainSceneのシーンデータ型
 * Issue #111: TitleSceneからのシーン遷移時にゲーム開始フラグを受け取る
 */
export interface MainSceneData {
  /** 新規ゲーム開始フラグ（TitleSceneから渡される） */
  isNewGame?: boolean;
  /** セーブデータ（コンティニュー時に渡される） */
  saveData?: unknown;
}
