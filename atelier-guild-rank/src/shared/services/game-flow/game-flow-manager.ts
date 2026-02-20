/**
 * game-flow-manager.ts - GameFlowManager実装
 *
 * TASK-0017: GameFlowManager実装
 *
 * @description
 * ゲーム全体の進行を統括する中心的なサービスの実装。
 * ゲームの開始・終了、日の進行、フェーズ遷移、ゲーム終了判定を提供する。
 *
 * @信頼性レベル 🔵
 * - 設計文書・要件定義書に基づいた実装
 * - ゲームフロー全体の統括機能
 */

import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type { IQuestService } from '@domain/interfaces/quest-service.interface';
import type { IEventBus } from '@shared/services/event-bus';
import type { IStateManager } from '@shared/services/state-manager';
import type { IPhaseSwitchRequest, IPhaseSwitchResult, ISaveData } from '@shared/types';
import {
  ApplicationError,
  ErrorCodes,
  GameEventType,
  GamePhase,
  GuildRank,
  PhaseSwitchFailureReason,
} from '@shared/types';
import type { CardId } from '@shared/types/ids';
import type { GameEndCondition, IGameFlowManager } from './game-flow-manager.interface';

/**
 * 【定数定義】: 初期デッキ構成
 * 【実装内容】: ゲーム開始時のデッキ構成（CardIdの配列）
 * 【暫定実装】: 現在は空配列として実装
 * 【将来的な実装】: 以下の実装方法を検討中
 *   - マスターデータから取得する方式
 *   - ゲームバランス調整用の設定ファイルから読み込む方式
 *   - ランク別の初期デッキを定義する方式
 * 【依存タスク】: カードマスターデータの実装完了後に正式な定義を追加予定
 * 【テスト影響】: 現在のテストはモックを使用しているため、空配列でも問題なく動作
 * 🟡 信頼性レベル: 暫定実装（後でマスターデータから取得）
 */
const INITIAL_DECK: CardId[] = [] as CardId[];

/**
 * 【定数定義】: 1日の最大行動ポイント
 * 【実装内容】: ゲームメカニクス設計書に基づく固定値
 * 【根拠】: game-mechanics.md の「1.3 行動ポイントシステム」に記載
 * 🔵 信頼性レベル: 設計文書に明記
 */
const MAX_ACTION_POINTS = 3;

/**
 * 【機能概要】: GameFlowManagerクラス
 * 【実装方針】: ゲーム全体の進行を統括し、各サービスを連携させる
 * 【テスト対応】: T-0017-01 〜 T-0017-B02 を通すための実装
 * 🔵 信頼性レベル: 設計文書・要件定義書に明記
 */
export class GameFlowManager implements IGameFlowManager {
  /**
   * 【機能概要】: コンストラクタ
   * 【実装方針】: 依存性注入で各サービスを受け取る
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param stateManager - ゲーム状態管理サービス
   * @param deckService - デッキ管理サービス
   * @param questService - 依頼管理サービス
   * @param eventBus - イベントバス
   * @param activeOperationChecker - 進行中操作チェック（採取セッション等）
   */
  constructor(
    private readonly stateManager: IStateManager,
    private readonly deckService: IDeckService,
    private readonly questService: IQuestService,
    private readonly eventBus: IEventBus,
    private readonly activeOperationChecker?: () => boolean,
  ) {
    // 【実装内容】: 依存性注入のみ、初期化処理はstartNewGame()またはcontinueGame()で行う
    // 🔵 信頼性レベル: 設計文書に明記
  }

  // =============================================================================
  // ゲーム開始
  // =============================================================================

  /**
   * 【機能概要】: 新規ゲームを開始
   * 【実装方針】: StateManagerとDeckServiceを初期化し、startDay()を呼び出す
   * 【テスト対応】: T-0017-01 新規ゲーム開始時の初期化処理が正しく実行される
   * 🔵 信頼性レベル: 設計文書に明記
   */
  startNewGame(): void {
    // 【実装内容】: StateManagerを初期化
    // 【処理方針】: デフォルト初期状態に設定
    // 🔵 信頼性レベル: 設計文書に明記
    this.stateManager.initialize();

    // 【実装内容】: DeckServiceを初期デッキで初期化
    // 【処理方針】: INITIAL_DECK定数からカードIDを渡す
    // 🔵 信頼性レベル: 設計文書に明記
    this.deckService.initialize(INITIAL_DECK);

    // 【実装内容】: 最初の日を開始
    // 【処理方針】: startDay()で日開始処理を実行
    // 🔵 信頼性レベル: 設計文書に明記
    this.startDay();
  }

  /**
   * 【機能概要】: セーブデータからゲームを再開
   * 【実装方針】: セーブデータから各サービスの状態を復元
   * 【例外】: ApplicationError(ErrorCodes.INVALID_SAVE_DATA) - セーブデータが不正な場合
   * 【セキュリティ】: 入力値の厳密な検証により、不正データによるクラッシュを防ぐ
   * 【テスト対応】: T-0017-E02 不正なセーブデータでエラーをスローする、T-0017-B06 continueGame()にnullを渡すとエラー
   * 🟡 信頼性レベル: 要件定義書から推測
   *
   * @param saveData - セーブデータ
   */
  continueGame(saveData: ISaveData): void {
    // 【入力値検証】: セーブデータの妥当性をチェック
    // 【エラー処理】: 不正なセーブデータの場合はエラーをスロー
    // 【セキュリティ】: null/undefined、必須フィールドの欠落を検出
    // 【ユーザビリティ】: ユーザーに分かりやすいエラーメッセージを提供
    // 🟡 信頼性レベル: 要件定義書のエラーハンドリングから推測
    if (
      !saveData ||
      saveData === null ||
      typeof saveData !== 'object' ||
      !saveData.version ||
      !saveData.gameState
    ) {
      // 【エラー処理】: セーブデータが不正な場合
      // 【ユーザビリティ】: セーブデータが読み込めないことをユーザーに通知
      // 【安全性】: 不正なデータによるクラッシュを防ぐ
      // 🟡 信頼性レベル: 要件定義書のエラーハンドリングから推測
      throw new ApplicationError(ErrorCodes.INVALID_SAVE_DATA, 'セーブデータが不正です');
    }

    // 【実装内容】: StateManagerにセーブデータから状態を復元
    // 【処理方針】: loadFromSaveData()で復元
    // 【エラー処理】: StateManager側でさらに詳細な検証が行われる
    // 🟡 信頼性レベル: 要件定義書から推測
    this.stateManager.loadFromSaveData(saveData);

    // 【実装内容】: 現在のフェーズからゲームを再開
    // 【処理方針】: 特に追加処理は不要（状態復元のみ）
    // 【ゲームフロー】: StateManagerが現在のフェーズを保持しているため、そこから再開
    // 🟡 信頼性レベル: 要件定義書から推測
  }

  // =============================================================================
  // 日の進行
  // =============================================================================

  /**
   * 【機能概要】: 日を開始
   * 【実装方針】: AP回復→依頼生成→DAY_STARTEDイベント発行→QUEST_ACCEPTフェーズに遷移
   * 【パフォーマンス】: getState()の呼び出しを1回に削減し、状態を変数に保存して再利用
   * 【保守性】: 状態の取得を一箇所にまとめることで、コードの可読性と保守性を向上
   * 【テスト対応】: T-0017-02 日開始処理が正しく実行される
   * 🔵 信頼性レベル: 設計文書に明記
   */
  startDay(): void {
    // 【パフォーマンス改善】: getState()の呼び出しを1回にまとめる
    // 【処理方針】: 状態を取得して変数に保存し、複数箇所で再利用
    // 【改善効果】: 不要な関数呼び出しを削減し、パフォーマンスを向上
    // 🔵 信頼性レベル: 設計文書に明記
    const state = this.stateManager.getState();

    // 【実装内容】: 行動ポイントを最大値に回復
    // 【処理方針】: MAX_ACTION_POINTS定数を使用してAPを更新
    // 🔵 信頼性レベル: 設計文書に明記
    this.stateManager.updateState({
      actionPoints: MAX_ACTION_POINTS,
    });

    // 【実装内容】: 現在のランクに応じた日次依頼を生成
    // 【処理方針】: 取得した状態から現在のランクを使用してQuestServiceを呼び出す
    // 🔵 信頼性レベル: 設計文書に明記
    this.questService.generateDailyQuests(state.currentRank);

    // 【実装内容】: DAY_STARTEDイベントを発行
    // 【処理方針】: 取得した状態から現在の日数と残り日数を使用してイベントを発行
    // 【パフォーマンス】: 事前に取得した状態を再利用することでgetState()の再呼び出しを避ける
    // 🔵 信頼性レベル: 設計文書に明記
    this.eventBus.emit(GameEventType.DAY_STARTED, {
      day: state.currentDay,
      remainingDays: state.remainingDays,
    });

    // 【実装内容】: 依頼受注フェーズに遷移
    // 【処理方針】: StateManagerのsetPhase()を呼び出す
    // 【Issue #111修正】: 新規ゲーム開始時、initialize()後は既にQUEST_ACCEPTフェーズのため、
    //   同じフェーズへの遷移を避けてエラーを防ぐ
    // 🔵 信頼性レベル: 設計文書に明記
    if (state.currentPhase !== GamePhase.QUEST_ACCEPT) {
      this.stateManager.setPhase(GamePhase.QUEST_ACCEPT);
    }
  }

  /**
   * 【機能概要】: 日を終了
   * 【実装方針】: 期限処理→日数更新→DAY_ENDEDイベント発行→ゲーム終了判定→次の日へ or ゲーム終了
   * 【パフォーマンス】: 計算結果を変数に保存して再利用することで不要な再計算を削減
   * 【テスト対応】: T-0017-05 日終了処理が正しく実行される
   * 🔵 信頼性レベル: 設計文書に明記
   */
  endDay(): void {
    // 【実装内容】: 期限切れ依頼を処理
    // 【処理方針】: QuestServiceのupdateDeadlines()で期限を更新し、失敗した依頼を取得
    // 🔵 信頼性レベル: 設計文書に明記
    const failedQuests = this.questService.updateDeadlines();

    // 【実装内容】: 現在の状態を取得して、新しい日数を計算
    // 【処理方針】: StateManagerでゲーム状態を更新
    // 【パフォーマンス改善】: 計算結果を変数に保存して再利用
    // 🔵 信頼性レベル: 設計文書に明記
    const state = this.stateManager.getState();
    const newRemainingDays = state.remainingDays - 1;
    const newCurrentDay = state.currentDay + 1;

    // 【実装内容】: 残り日数を-1、現在の日を+1
    // 【処理方針】: 計算済みの値でゲーム状態を更新
    // 🔵 信頼性レベル: 設計文書に明記
    this.stateManager.updateState({
      remainingDays: newRemainingDays,
      currentDay: newCurrentDay,
    });

    // 【実装内容】: DAY_ENDEDイベントを発行
    // 【処理方針】: 失敗した依頼リストと更新後の日数を含むイベントを発行
    // 【パフォーマンス改善】: 事前に計算した値を使用して再計算を避ける
    // 🔵 信頼性レベル: 設計文書に明記
    this.eventBus.emit(GameEventType.DAY_ENDED, {
      failedQuests,
      remainingDays: newRemainingDays,
      currentDay: newCurrentDay,
    });

    // 【実装内容】: ゲーム終了判定を実行
    // 【処理方針】: checkGameOver()とcheckGameClear()を呼び出して判定
    // 🔵 信頼性レベル: 設計文書に明記
    const gameOver = this.checkGameOver();
    const gameClear = this.checkGameClear();

    // 【実装内容】: ゲーム終了判定の結果に応じて処理を分岐
    // 【処理方針】: ゲームオーバー→GAME_OVERイベント発行、ゲームクリア→GAME_CLEARイベント発行、継続→startDay()
    // 【エラー処理】: ゲームオーバーとゲームクリアは排他的であることを保証
    // 🔵 信頼性レベル: 設計文書に明記
    if (gameOver) {
      // 【実装内容】: ゲームオーバー時の処理
      // 【ユーザビリティ】: ゲームオーバーイベントを発行してUI層に通知
      // 🔵 信頼性レベル: 設計文書に明記
      this.eventBus.emit(GameEventType.GAME_OVER, gameOver);
    } else if (gameClear) {
      // 【実装内容】: ゲームクリア時の処理
      // 【ユーザビリティ】: ゲームクリアイベントを発行してUI層に通知
      // 🔵 信頼性レベル: 設計文書に明記
      this.eventBus.emit(GameEventType.GAME_CLEARED, gameClear);
    } else {
      // 【実装内容】: ゲームが継続する場合は次の日を開始
      // 【処理方針】: startDay()で次の日を開始
      // 【ゲームフロー】: 継続的な日の進行を保証
      // 🔵 信頼性レベル: 設計文書に明記
      this.startDay();
    }
  }

  // =============================================================================
  // フェーズ進行
  // =============================================================================

  /**
   * 【機能概要】: フェーズを自由に切り替える（TASK-0106）
   * 【実装方針】:
   *   1. 同一フェーズの場合はno-op（成功として返却）
   *   2. 進行中操作チェック（採取セッション中断確認）
   *   3. StateManager.setPhase()でフェーズ変更
   *   4. IPhaseSwitchResultを返却
   *
   * 設計文書: architecture.md, dataflow.md セクション2
   * 要件: REQ-001, REQ-001-01〜REQ-001-03
   * 🔵 信頼性レベル: 設計文書に明記
   */
  async switchPhase(request: IPhaseSwitchRequest): Promise<IPhaseSwitchResult> {
    const currentPhase = this.stateManager.getState().currentPhase;
    const { targetPhase, forceAbort = false } = request;

    // 同一フェーズへの切り替えはno-op
    if (currentPhase === targetPhase) {
      return {
        success: true,
        previousPhase: currentPhase,
        newPhase: currentPhase,
      };
    }

    // 進行中操作チェック
    const hasActiveOperation = this.activeOperationChecker?.() ?? false;
    if (hasActiveOperation && !forceAbort) {
      return {
        success: false,
        previousPhase: currentPhase,
        newPhase: currentPhase,
        failureReason: PhaseSwitchFailureReason.SESSION_ABORT_REJECTED,
      };
    }

    // フェーズ遷移（StateManagerがバリデーションとPHASE_CHANGEDイベント発行を行う）
    this.stateManager.setPhase(targetPhase);

    return {
      success: true,
      previousPhase: currentPhase,
      newPhase: targetPhase,
    };
  }

  /**
   * 【機能概要】: 指定されたフェーズに遷移
   * 【実装方針】: StateManager.setPhase()を呼び出す
   * 【例外】: ApplicationError(ErrorCodes.INVALID_PHASE_TRANSITION) - 無効なフェーズ遷移の場合
   * 【設計方針】: フェーズ遷移のバリデーションはStateManager側に委譲することで責務を分離
   * 【保守性】: StateManagerが状態管理とバリデーションを一元管理
   * 【テスト対応】: T-0017-03 フェーズが順番に進行する、T-0017-E01 無効なフェーズ遷移でエラーをスローする
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param phase - 遷移先のフェーズ
   */
  startPhase(phase: GamePhase): void {
    // 【実装内容】: StateManagerでフェーズを更新
    // 【処理方針】: setPhase()でフェーズを変更（イベント発行とバリデーションは内部で行われる）
    // 【責務分離】: フェーズ遷移のチェックはStateManager側で行う
    // 【イベント発行】: StateManagerがPHASE_CHANGEDイベントを自動的に発行
    // 🔵 信頼性レベル: 設計文書に明記
    this.stateManager.setPhase(phase);
  }

  /**
   * 【機能概要】: 現在のフェーズを終了し、次のフェーズに遷移
   * 【実装方針】: QUEST_ACCEPT→GATHERING→ALCHEMY→DELIVERY→endDay()
   * 【テスト対応】: T-0017-04 endPhase()で次のフェーズに遷移する
   * 🟡 信頼性レベル: 要件定義書から推測
   */
  endPhase(): void {
    // 【実装内容】: 現在のフェーズから次のフェーズへ自動遷移
    // 【処理方針】: 現在のフェーズに応じて次のフェーズを決定
    // 🟡 信頼性レベル: 要件定義書から推測
    const currentPhase = this.stateManager.getState().currentPhase;

    const nextPhaseMap = {
      [GamePhase.QUEST_ACCEPT]: GamePhase.GATHERING,
      [GamePhase.GATHERING]: GamePhase.ALCHEMY,
      [GamePhase.ALCHEMY]: GamePhase.DELIVERY,
      [GamePhase.DELIVERY]: null, // 納品フェーズの次は日終了
    };

    const nextPhase = nextPhaseMap[currentPhase];

    if (nextPhase) {
      // 【実装内容】: 次のフェーズに遷移
      // 【処理方針】: StateManagerのsetPhase()を呼び出す
      // 🟡 信頼性レベル: 要件定義書から推測
      this.stateManager.setPhase(nextPhase);
    } else {
      // 【実装内容】: 納品フェーズの場合は日終了処理を実行
      // 【処理方針】: endDay()を呼び出す
      // 🟡 信頼性レベル: 要件定義書から推測
      this.endDay();
    }
  }

  /**
   * 【機能概要】: 現在のフェーズをスキップして次のフェーズに遷移
   * 【実装方針】: endPhase()と同様だが、スキップとして記録
   * 【テスト対応】: T-0017-09 skipPhase()でフェーズをスキップできる
   * 🟡 信頼性レベル: 要件定義書から推測
   */
  skipPhase(): void {
    // 【実装内容】: endPhase()と同様の処理を実行
    // 【処理方針】: スキップもフェーズ終了として扱う
    // 🟡 信頼性レベル: 要件定義書から推測
    this.endPhase();
  }

  // =============================================================================
  // ゲーム終了判定
  // =============================================================================

  /**
   * 【機能概要】: ゲームオーバー判定
   * 【実装方針】: remainingDays <= 0 && currentRank !== GuildRank.S の場合にGameEndConditionを返す
   * 【テスト対応】: T-0017-B01 残り日数が0でSランク未到達の場合、ゲームオーバー判定
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns ゲームオーバーの場合GameEndCondition、継続の場合null
   */
  checkGameOver(): GameEndCondition | null {
    // 【実装内容】: 現在のゲーム状態を取得
    // 【処理方針】: StateManagerからゲーム状態を取得
    // 🔵 信頼性レベル: 設計文書に明記
    const state = this.stateManager.getState();

    // 【実装内容】: ゲームオーバー条件をチェック
    // 【処理方針】: 残り日数が0以下かつSランク未到達の場合
    // 🔵 信頼性レベル: 設計文書に明記
    if (state.remainingDays <= 0 && state.currentRank !== GuildRank.S) {
      return {
        type: 'game_over',
        reason: 'time_expired',
        finalRank: state.currentRank,
        totalDays: state.currentDay,
      };
    }

    return null;
  }

  /**
   * 【機能概要】: ゲームクリア判定
   * 【実装方針】: currentRank === GuildRank.S の場合にGameEndConditionを返す
   * 【テスト対応】: T-0017-06 ゲームクリア条件の判定が正しい
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @returns ゲームクリアの場合GameEndCondition、未到達の場合null
   */
  checkGameClear(): GameEndCondition | null {
    // 【実装内容】: 現在のゲーム状態を取得
    // 【処理方針】: StateManagerからゲーム状態を取得
    // 🔵 信頼性レベル: 設計文書に明記
    const state = this.stateManager.getState();

    // 【実装内容】: ゲームクリア条件をチェック
    // 【処理方針】: Sランク到達の場合
    // 🔵 信頼性レベル: 設計文書に明記
    if (state.currentRank === GuildRank.S) {
      return {
        type: 'game_clear',
        reason: 's_rank_achieved',
        finalRank: GuildRank.S,
        totalDays: state.currentDay,
      };
    }

    return null;
  }

  // =============================================================================
  // アクション
  // =============================================================================

  /**
   * 【機能概要】: 休憩アクション（AP消費なしで日を進める）
   * 【実装方針】: 手札を2枚捨てて2枚ドロー→endDay()を呼び出す
   * 【ゲームバランス】: APを使わずに日を進めることができる戦略的選択肢を提供
   * 【プレイヤー体験】: 状況が不利な時に次の日に進むための手段
   * 【テスト対応】: T-0017-10 rest()でAP消費なしで日が進む
   * 🟡 信頼性レベル: タスク定義から推測
   */
  rest(): void {
    // 【実装内容】: 手札を捨てて再補充
    // 【処理方針】: DeckServiceのrefillHand()で手札の入れ替えを実行
    // 【ゲームメカニクス】: 現在の手札をすべて捨て札にして、山札から新しい手札をドロー
    // 【戦略性】: 不要なカードを捨てて新しいカードを引くことができる
    // 🟡 信頼性レベル: タスク定義から推測
    this.deckService.refillHand();

    // 【実装内容】: AP消費なしで日終了処理を実行
    // 【処理方針】: endDay()を呼び出す
    // 【ゲームバランス】: AP消費なしで日を進めることができる
    // 【注意点】: 期限切れ依頼の処理、残り日数の減少などは通常通り実行される
    // 🟡 信頼性レベル: タスク定義から推測
    this.endDay();
  }

  // =============================================================================
  // 状態取得
  // =============================================================================

  /**
   * 【機能概要】: 現在のフェーズを取得
   * 【実装方針】: StateManager.getState().currentPhaseを返す
   * 【テスト対応】: T-0017-08 getCurrentPhase()で現在のフェーズを取得できる
   * 🟡 信頼性レベル: 要件定義書から推測
   *
   * @returns 現在のフェーズ
   */
  getCurrentPhase(): GamePhase {
    // 【実装内容】: StateManagerから現在のフェーズを取得
    // 【処理方針】: getState().currentPhaseを返す
    // 🟡 信頼性レベル: 要件定義書から推測
    return this.stateManager.getState().currentPhase;
  }

  /**
   * 【機能概要】: 次のフェーズに進めるかを判定
   * 【実装方針】: 現在のフェーズの必須アクションが完了しているかをチェック
   * 【設計方針】: 基本的には進行可能とし、将来的にフェーズごとの制約を追加可能な設計
   * 【保守性】: フェーズごとの判定ロジックを追加しやすいように構造化
   * 【拡張性の考慮】: 現在は常にtrueだが、ゲーム仕様の進化に合わせて柔軟に制約を追加可能
   * 🟡 信頼性レベル: 要件定義書から推測
   *
   * @returns 進める場合true
   */
  canAdvancePhase(): boolean {
    // 【実装内容】: フェーズ進行の可否を判定
    // 【処理方針】: 現在は常にtrueを返すが、将来的にフェーズごとの制約を追加可能
    // 【拡張性】: フェーズごとの判定ロジックをここに追加できる設計
    // 【ゲームデザイン】: プレイヤーの自由度を優先し、強制的な制約は設けない方針
    // 🟡 信頼性レベル: 要件定義書から推測

    // 【将来的な実装例】:
    // 以下のようなフェーズごとの制約を追加できる設計になっている
    //
    // switch (currentPhase) {
    //   case GamePhase.QUEST_ACCEPT:
    //     // 【制約例】: 最低1つの依頼を受注している必要がある
    //     // 【実装方法】: QuestServiceに hasAcceptedQuests() メソッドを追加
    //     // return this.questService.hasAcceptedQuests();
    //     return true;
    //
    //   case GamePhase.GATHERING:
    //     // 【制約例】: 最低1つの素材を採取している必要がある
    //     // 【実装方法】: GatheringServiceに hasGatheredMaterials() メソッドを追加
    //     // return this.gatheringService.hasGatheredMaterials();
    //     return true;
    //
    //   case GamePhase.ALCHEMY:
    //     // 【制約例】: 最低1つのアイテムを調合している必要がある
    //     // 【実装方法】: AlchemyServiceに hasCraftedItems() メソッドを追加
    //     // return this.alchemyService.hasCraftedItems();
    //     return true;
    //
    //   case GamePhase.DELIVERY:
    //     // 【制約例】: 特になし（納品フェーズは常に進行可能）
    //     return true;
    //
    //   default:
    //     return true;
    // }

    // 【現在の実装】: 全てのフェーズで進行可能
    // 【理由】: ゲーム仕様上、プレイヤーの自由度を優先
    // 【ゲームバランス】: プレイヤーが自由にフェーズを進められることで、戦略性を高める
    // 【今後の拡張】: ゲームバランス調整の結果に応じて、必要な制約を追加予定
    // 🟡 信頼性レベル: 要件定義書から推測
    return true;
  }
}
