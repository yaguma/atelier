/**
 * GameFlowManager テストケース
 * TASK-0017: GameFlowManager実装
 *
 * @description
 * TDD Red フェーズ - 失敗するテストケースを作成
 * T-0017-01 〜 T-0017-10: 正常系テストケース（10件）
 * T-0017-E01 〜 T-0017-E02: 異常系テストケース（2件）
 * T-0017-B01 〜 T-0017-B02: 境界値テストケース（2件）
 * 合計: 14件
 */

import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import type { IQuestService } from '@domain/interfaces/quest-service.interface';
import type { IAPOverflowResult } from '@features/gathering';
import type { IEventBus } from '@shared/services/event-bus';
import type { IGameFlowManager } from '@shared/services/game-flow';
import type { IStateManager } from '@shared/services/state-manager';
import {
  ApplicationError,
  ErrorCodes,
  GameEventType,
  GamePhase,
  GuildRank,
  type ISaveData,
  PhaseSwitchFailureReason,
} from '@shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックの型定義
// =============================================================================

type MockedFunction<T> = ReturnType<typeof vi.fn<T>>;

interface MockedStateManager extends Partial<IStateManager> {
  initialize: MockedFunction<IStateManager['initialize']>;
  updateState: MockedFunction<IStateManager['updateState']>;
  getState: MockedFunction<IStateManager['getState']>;
  setPhase: MockedFunction<IStateManager['setPhase']>;
  advanceDay: MockedFunction<IStateManager['advanceDay']>;
}

interface MockedDeckService extends Partial<IDeckService> {
  initialize: MockedFunction<IDeckService['initialize']>;
  refillHand: MockedFunction<IDeckService['refillHand']>;
}

interface MockedQuestService extends Partial<IQuestService> {
  generateDailyQuests: MockedFunction<IQuestService['generateDailyQuests']>;
  generateBoardQuests: MockedFunction<IQuestService['generateBoardQuests']>;
  generateVisitorQuests: MockedFunction<IQuestService['generateVisitorQuests']>;
  updateDeadlines: MockedFunction<IQuestService['updateDeadlines']>;
}

interface MockedEventBus extends Partial<IEventBus> {
  emit: MockedFunction<IEventBus['emit']>;
  on: MockedFunction<IEventBus['on']>;
}

// =============================================================================
// テストスイート
// =============================================================================

describe('GameFlowManager', () => {
  let gameFlowManager: IGameFlowManager;
  let mockStateManager: MockedStateManager;
  let mockDeckService: MockedDeckService;
  let mockQuestService: MockedQuestService;
  let mockEventBus: MockedEventBus;

  beforeEach(async () => {
    // 【テスト前準備】: 各テスト実行前にモックを初期化し、GameFlowManagerのインスタンスを作成
    // 【環境初期化】: 各テストが独立して実行できるようクリーンな状態を作成

    // モックStateManagerの作成
    mockStateManager = {
      initialize: vi.fn(),
      updateState: vi.fn(),
      getState: vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.QUEST_ACCEPT,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      })),
      setPhase: vi.fn(),
      advanceDay: vi.fn(),
    };

    // モックDeckServiceの作成
    mockDeckService = {
      initialize: vi.fn(),
      refillHand: vi.fn(),
    };

    // モックQuestServiceの作成
    mockQuestService = {
      generateDailyQuests: vi.fn(),
      generateBoardQuests: vi.fn(() => []),
      generateVisitorQuests: vi.fn(() => []),
      updateDeadlines: vi.fn(() => []),
    };

    // モックEventBusの作成
    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
    };

    // GameFlowManagerのインスタンス化
    const { GameFlowManager } = await import('@shared/services/game-flow');
    gameFlowManager = new GameFlowManager(
      mockStateManager as IStateManager,
      mockDeckService as IDeckService,
      mockQuestService as IQuestService,
      mockEventBus as IEventBus,
    );
  });

  // =============================================================================
  // 正常系テストケース
  // =============================================================================

  describe('正常系テストケース', () => {
    it('T-0017-01: 新規ゲーム開始時の初期化処理が正しく実行される', () => {
      // 【テスト目的】: 新規ゲーム開始時の初期化処理が正しく実行されることを確認
      // 【テスト内容】: startNewGame()メソッドを呼び出し、StateManagerとDeckServiceの初期化、日開始処理が順番に実行されることをテスト
      // 【期待される動作】: StateManager.initialize()、DeckService.initialize()、startDay()が順番に呼び出される
      // 🔵 テストケースの信頼性: 要件定義書・設計文書に明確に記載

      // 【実際の処理実行】: gameFlowManager.startNewGame()を呼び出す
      // 【処理内容】: 新規ゲーム開始処理（初期化→日開始）を実行
      gameFlowManager.startNewGame();

      // 【結果検証】: StateManager.initialize()が1回呼び出されたことを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockStateManager.initialize).toHaveBeenCalledTimes(1); // 【確認内容】: 初期化処理が1回のみ実行されることを確認

      // 【期待値確認】: DeckService.initialize()が1回呼び出されたことを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockDeckService.initialize).toHaveBeenCalledTimes(1); // 【確認内容】: デッキ初期化処理が1回実行されることを確認

      // 【期待値確認】: DAY_STARTEDイベントが発行されることを確認（startDay()の一部）
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.DAY_STARTED,
        expect.objectContaining({
          day: 1,
        }),
      ); // 【確認内容】: 日開始イベントが発行されることを確認
    });

    it('T-0017-01b: 初期デッキがバランス設計書に準拠した15枚で構成される', () => {
      gameFlowManager.startNewGame();

      const initializeCall = mockDeckService.initialize.mock.calls[0];
      const cardIds = initializeCall[0] as string[];

      // balance-design.md セクション3.3: 初期デッキ構成（15枚）
      expect(cardIds).toHaveLength(15);

      // 採取地カード7枚 (47%)
      const gatheringCards = cardIds.filter((id) => id.startsWith('gathering_'));
      expect(gatheringCards).toHaveLength(7);

      // レシピカード5枚 (33%)
      const recipeCards = cardIds.filter((id) => id.startsWith('recipe_'));
      expect(recipeCards).toHaveLength(5);

      // 強化カード3枚 (20%)
      const enhancementCards = cardIds.filter((id) => id.startsWith('enhance_'));
      expect(enhancementCards).toHaveLength(3);
    });

    it('T-0017-02: 日開始処理が正しく実行される（日終了後のケース）', () => {
      // 【テスト目的】: 日開始時のAP回復、依頼生成、イベント発行、フェーズ遷移が正しく動作することを確認
      // 【テスト内容】: startDay()メソッドを呼び出し、各処理が順番に実行されることをテスト
      // 【期待される動作】: AP回復→依頼生成→イベント発行→依頼受注フェーズへの遷移が順番に実行される
      // 🔵 テストケースの信頼性: 要件定義書・設計文書に明確に記載

      // 【Issue #111修正】: 日終了後の状態をシミュレート（currentPhase = DELIVERY）
      // 実際のゲームフローでは、endDay()後にstartDay()が呼ばれるケースをテスト
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.DELIVERY, // 日終了後の状態
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // 【実際の処理実行】: gameFlowManager.startDay()を呼び出す
      // 【処理内容】: 日開始処理を実行
      gameFlowManager.startDay();

      // 【結果検証】: APが最大値に回復されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        expect.objectContaining({
          actionPoints: 3,
        }),
      ); // 【確認内容】: APが3に回復されることを確認

      // 【結果検証】: 日次依頼が生成されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockQuestService.generateDailyQuests).toHaveBeenCalledTimes(1); // 【確認内容】: 日次依頼生成が呼び出されることを確認

      // 【結果検証】: DAY_STARTEDイベントが発行されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.DAY_STARTED,
        expect.objectContaining({
          day: 1,
        }),
      ); // 【確認内容】: 日開始イベントが発行されることを確認

      // 【結果検証】: 依頼受注フェーズに遷移することを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockStateManager.setPhase).toHaveBeenCalledWith(GamePhase.QUEST_ACCEPT); // 【確認内容】: 依頼受注フェーズに遷移することを確認
    });

    it('T-0017-02b: 新規ゲーム開始時は既にQUEST_ACCEPTの場合setPhaseをスキップする', () => {
      // 【テスト目的】: 新規ゲーム開始時（currentPhase = QUEST_ACCEPT）にsetPhase()が呼ばれないことを確認
      // 【テスト内容】: initialize()後にstartDay()が呼ばれた場合、既にQUEST_ACCEPTなのでsetPhase()不要
      // 【Issue #111修正】: 同じフェーズへの遷移エラーを防ぐための修正を検証

      // モックの状態はbeforeEach()でQUEST_ACCEPTに設定済み

      // 【実際の処理実行】: gameFlowManager.startDay()を呼び出す
      gameFlowManager.startDay();

      // 【結果検証】: setPhase()が呼ばれないことを確認
      expect(mockStateManager.setPhase).not.toHaveBeenCalled();
    });

    it('T-0017-03: フェーズが順番に進行する', () => {
      // 【テスト目的】: フェーズが依頼受注→採取→調合→納品の順に正しく遷移することを確認
      // 【テスト内容】: startPhase()メソッドで各フェーズへ遷移することをテスト
      // 【期待される動作】: QUEST_ACCEPT → GATHERING → ALCHEMY → DELIVERY の順に遷移
      // 🔵 テストケースの信頼性: 要件定義書・設計文書に明確に記載

      // 【実際の処理実行】: 採取フェーズに遷移
      // 【処理内容】: 依頼受注フェーズから採取フェーズへの遷移
      gameFlowManager.startPhase(GamePhase.GATHERING);

      // 【結果検証】: StateManager.setPhase()が採取フェーズで呼び出されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockStateManager.setPhase).toHaveBeenCalledWith(GamePhase.GATHERING); // 【確認内容】: 採取フェーズに遷移することを確認

      // 【実際の処理実行】: 調合フェーズに遷移
      gameFlowManager.startPhase(GamePhase.ALCHEMY);

      // 【結果検証】: StateManager.setPhase()が調合フェーズで呼び出されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockStateManager.setPhase).toHaveBeenCalledWith(GamePhase.ALCHEMY); // 【確認内容】: 調合フェーズに遷移することを確認

      // 【実際の処理実行】: 納品フェーズに遷移
      gameFlowManager.startPhase(GamePhase.DELIVERY);

      // 【結果検証】: StateManager.setPhase()が納品フェーズで呼び出されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockStateManager.setPhase).toHaveBeenCalledWith(GamePhase.DELIVERY); // 【確認内容】: 納品フェーズに遷移することを確認
    });

    it('T-0017-04: endPhase()で次のフェーズに遷移する', () => {
      // 【テスト目的】: endPhase()メソッドが現在のフェーズから次のフェーズに正しく遷移することを確認
      // 【テスト内容】: endPhase()メソッドが自動的に次のフェーズへ遷移することをテスト
      // 【期待される動作】: 各フェーズから次のフェーズへの自動遷移、納品フェーズからは日終了処理へ
      // 🟡 テストケースの信頼性: 要件定義書から妥当に推測

      // 【初期条件設定】: 現在のフェーズを依頼受注フェーズに設定
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.QUEST_ACCEPT,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // 【実際の処理実行】: endPhase()を呼び出す
      // 【処理内容】: 現在のフェーズを終了し、次のフェーズへ遷移
      gameFlowManager.endPhase();

      // 【結果検証】: 採取フェーズに遷移することを確認
      // 🟡 信頼性: 要件定義書から妥当に推測
      expect(mockStateManager.setPhase).toHaveBeenCalledWith(GamePhase.GATHERING); // 【確認内容】: 依頼受注フェーズから採取フェーズに遷移することを確認
    });

    it('T-0017-05: 日終了処理が正しく実行される', () => {
      // 【テスト目的】: 日終了処理の各ステップが正しい順序で実行されることを確認
      // 【テスト内容】: endDay()メソッドを呼び出し、期限処理、日数更新、イベント発行、終了判定が順番に実行されることをテスト
      // 【期待される動作】: 期限処理→日数更新→イベント発行→終了判定→次の日へ（または終了）の順に実行される
      // 🔵 テストケースの信頼性: 要件定義書・設計文書に明確に記載

      // 【初期条件設定】: ゲーム継続状態（Sランク未到達、残り日数あり）
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.DELIVERY,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // 【実際の処理実行】: gameFlowManager.endDay()を呼び出す
      // 【処理内容】: 日終了処理を実行
      gameFlowManager.endDay();

      // 【結果検証】: QuestService.updateDeadlines()が呼び出されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockQuestService.updateDeadlines).toHaveBeenCalledTimes(1); // 【確認内容】: 期限切れ依頼処理が実行されることを確認

      // 【結果検証】: StateManager.updateState()で残り日数が-1、現在の日が+1されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        expect.objectContaining({
          remainingDays: 149,
          currentDay: 2,
        }),
      ); // 【確認内容】: 残り日数が減少し、現在の日が増加することを確認

      // 【結果検証】: DAY_ENDEDイベントが発行されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.DAY_ENDED,
        expect.objectContaining({
          failedQuests: [],
          remainingDays: 149,
        }),
      ); // 【確認内容】: 日終了イベントが発行されることを確認
    });

    it('T-0017-06: ゲームクリア条件の判定が正しい', () => {
      // 【テスト目的】: ゲームクリア判定ロジックの正確性を確認
      // 【テスト内容】: checkGameClear()メソッドがSランク到達時に正しく判定することをテスト
      // 【期待される動作】: Sランク到達時にGameEndConditionを返す
      // 🔵 テストケースの信頼性: 要件定義書・設計文書に明確に記載

      // 【初期条件設定】: Sランク到達
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.S,
        rankHp: 100,
        remainingDays: 50,
        currentDay: 100,
        gold: 1000,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.QUEST_ACCEPT,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // 【実際の処理実行】: checkGameClear()を呼び出す
      // 【処理内容】: ゲームクリア判定を実行
      const result = gameFlowManager.checkGameClear();

      // 【結果検証】: GameEndConditionオブジェクトが返されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(result).not.toBeNull(); // 【確認内容】: nullではないことを確認
      expect(result?.type).toBe('game_clear'); // 【確認内容】: typeが'game_clear'であることを確認
      expect(result?.reason).toBe('s_rank_achieved'); // 【確認内容】: reasonが's_rank_achieved'であることを確認
      expect(result?.finalRank).toBe(GuildRank.S); // 【確認内容】: finalRankがSであることを確認
      expect(result?.totalDays).toBe(100); // 【確認内容】: totalDaysが100であることを確認
    });

    it('T-0017-07: ゲームクリア後に次の日に進まない', () => {
      // 【テスト目的】: ゲームクリア時の終了処理の正確性を確認
      // 【テスト内容】: ゲームクリア時にイベントが発行され、次の日の処理が実行されないことをテスト
      // 【期待される動作】: ゲームクリア時にイベントが発行され、次の日の処理が実行されない
      // 🟡 テストケースの信頼性: 要件定義書から妥当に推測

      // 【初期条件設定】: Sランク到達
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.S,
        rankHp: 100,
        remainingDays: 50,
        currentDay: 100,
        gold: 1000,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.DELIVERY,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // モックのリセット（初期化呼び出しをカウントしないように）
      mockStateManager.updateState?.mockClear();
      mockEventBus.emit?.mockClear();

      // 【実際の処理実行】: endDay()を呼び出す
      // 【処理内容】: 日終了処理を実行（ゲームクリア判定含む）
      gameFlowManager.endDay();

      // 【結果検証】: GAME_CLEAREDイベントが発行されることを確認
      // 🟡 信頼性: 要件定義書から妥当に推測
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.GAME_CLEARED,
        expect.objectContaining({
          type: 'game_clear',
          reason: 's_rank_achieved',
          finalRank: GuildRank.S,
        }),
      ); // 【確認内容】: ゲームクリアイベントが発行されることを確認

      // 【結果検証】: startDay()が呼び出されない（DAY_STARTEDイベントが発行されない）ことを確認
      // 🟡 信頼性: 要件定義書から妥当に推測
      expect(mockEventBus.emit).not.toHaveBeenCalledWith(
        GameEventType.DAY_STARTED,
        expect.anything(),
      ); // 【確認内容】: 次の日が開始されないことを確認
    });

    it('T-0017-08: getCurrentPhase()で現在のフェーズを取得できる', () => {
      // 【テスト目的】: 現在フェーズの取得処理の正確性を確認
      // 【テスト内容】: getCurrentPhase()メソッドが正しく動作することをテスト
      // 【期待される動作】: StateManagerの現在のフェーズを返す
      // 🟡 テストケースの信頼性: 要件定義書から妥当に推測

      // 【初期条件設定】: 現在のフェーズを採取フェーズに設定
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.GATHERING,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // 【実際の処理実行】: getCurrentPhase()を呼び出す
      // 【処理内容】: 現在のフェーズを取得
      const currentPhase = gameFlowManager.getCurrentPhase();

      // 【結果検証】: 採取フェーズが返されることを確認
      // 🟡 信頼性: 要件定義書から妥当に推測
      expect(currentPhase).toBe(GamePhase.GATHERING); // 【確認内容】: 現在のフェーズが採取フェーズであることを確認
    });

    it('T-0017-09: skipPhase()でフェーズをスキップできる', () => {
      // 【テスト目的】: フェーズスキップ処理の正確性を確認
      // 【テスト内容】: skipPhase()メソッドが正しく動作することをテスト
      // 【期待される動作】: 現在のフェーズをスキップして次のフェーズへ遷移
      // 🟡 テストケースの信頼性: 要件定義書から妥当に推測

      // 【初期条件設定】: 現在のフェーズを採取フェーズに設定
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.GATHERING,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // 【実際の処理実行】: skipPhase()を呼び出す
      // 【処理内容】: 現在のフェーズをスキップ
      gameFlowManager.skipPhase();

      // 【結果検証】: 調合フェーズに遷移することを確認
      // 🟡 信頼性: 要件定義書から妥当に推測
      expect(mockStateManager.setPhase).toHaveBeenCalledWith(GamePhase.ALCHEMY); // 【確認内容】: 採取フェーズから調合フェーズに遷移することを確認
    });

    it('T-0017-10: rest()でAP消費なしで日が進む', () => {
      // 【テスト目的】: 休憩アクションの正確性を確認
      // 【テスト内容】: rest()メソッドが正しく動作することをテスト
      // 【期待される動作】: AP消費なしで日が進む、手札の入れ替え
      // 🟡 テストケースの信頼性: タスク定義から妥当に推測

      // 【初期条件設定】: ゲーム進行中
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.QUEST_ACCEPT,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // 【実際の処理実行】: rest()を呼び出す
      // 【処理内容】: 休憩アクションを実行
      gameFlowManager.rest();

      // 【結果検証】: QuestService.updateDeadlines()が呼び出されることを確認（endDay()の一部）
      // 🟡 信頼性: タスク定義から妥当に推測
      expect(mockQuestService.updateDeadlines).toHaveBeenCalledTimes(1); // 【確認内容】: 日終了処理が実行されることを確認

      // 【結果検証】: 手札の入れ替えが実行されることを確認
      // 🟡 信頼性: タスク定義から妥当に推測
      expect(mockDeckService.refillHand).toHaveBeenCalled(); // 【確認内容】: 手札が入れ替えられることを確認
    });
  });

  // =============================================================================
  // 異常系テストケース
  // =============================================================================

  describe('異常系テストケース', () => {
    it.skip('T-0017-E01: 無効なフェーズ遷移でエラーをスローする', () => {
      // 【スキップ理由】: フェーズ遷移のバリデーションはStateManager側で行うため、このテストは不要
      // 【テスト目的】: フェーズ遷移の整合性を保つエラーハンドリングを確認
      // 【テスト内容】: startPhase()で無効なフェーズ遷移を試みた場合にエラーをスローすることをテスト
      // 【期待される動作】: ApplicationErrorがスローされ、エラーコードがINVALID_PHASE_TRANSITIONである
      // 🟡 テストケースの信頼性: 要件定義書のエラーハンドリングから妥当に推測

      // 【初期条件設定】: 現在のフェーズを依頼受注フェーズに設定
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.QUEST_ACCEPT,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // 【実際の処理実行】: 無効なフェーズ遷移を試みる（依頼受注→納品）
      // 【処理内容】: フェーズの順序を無視した遷移
      // 【期待される動作】: ApplicationErrorがスローされる
      expect(() => {
        gameFlowManager.startPhase(GamePhase.DELIVERY);
      }).toThrow(ApplicationError); // 【確認内容】: ApplicationErrorがスローされることを確認

      // 【結果検証】: エラーコードがINVALID_PHASE_TRANSITIONであることを確認
      // 🟡 信頼性: 要件定義書のエラーハンドリングから妥当に推測
      try {
        gameFlowManager.startPhase(GamePhase.DELIVERY);
      } catch (error) {
        expect((error as ApplicationError).code).toBe(ErrorCodes.INVALID_PHASE_TRANSITION); // 【確認内容】: エラーコードが正しいことを確認
      }
    });

    it('T-0017-E02: 不正なセーブデータでエラーをスローする', () => {
      // 【テスト目的】: セーブデータの検証とエラーハンドリングを確認
      // 【テスト内容】: continueGame()で不正なセーブデータを渡すとエラーをスローすることをテスト
      // 【期待される動作】: ApplicationErrorがスローされ、エラーコードがINVALID_SAVE_DATAである
      // 🟡 テストケースの信頼性: 要件定義書のエラーハンドリングから妥当に推測

      // 【テストデータ準備】: 不正なセーブデータを作成
      // 【初期条件設定】: 必須フィールドが欠落したセーブデータ
      const invalidSaveData = { version: '0.0.0' } as unknown as ISaveData;

      // 【実際の処理実行】: continueGame()を呼び出す
      // 【処理内容】: 不正なセーブデータでゲームを再開しようとする
      // 【期待される動作】: ApplicationErrorがスローされる
      expect(() => {
        gameFlowManager.continueGame(invalidSaveData);
      }).toThrow(ApplicationError); // 【確認内容】: ApplicationErrorがスローされることを確認

      // 【結果検証】: エラーコードがINVALID_SAVE_DATAであることを確認
      // 🟡 信頼性: 要件定義書のエラーハンドリングから妥当に推測
      try {
        gameFlowManager.continueGame(invalidSaveData);
      } catch (error) {
        expect((error as ApplicationError).code).toBe(ErrorCodes.INVALID_SAVE_DATA); // 【確認内容】: エラーコードが正しいことを確認
      }
    });
  });

  // =============================================================================
  // 境界値テストケース
  // =============================================================================

  describe('境界値テストケース', () => {
    it('T-0017-B01: 残り日数が0でSランク未到達の場合、ゲームオーバー判定', () => {
      // 【テスト目的】: 時間切れによるゲームオーバー判定の正確性を確認
      // 【テスト内容】: checkGameOver()が残り日数0でSランク未到達時に正しく判定することをテスト
      // 【期待される動作】: 残り日数0の時点でゲームオーバー判定が確実に動作
      // 🔵 テストケースの信頼性: 要件定義書・設計文書に明確に記載されている

      // 【初期条件設定】: 残り日数が0でSランク未到達
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.A,
        rankHp: 100,
        remainingDays: 0,
        currentDay: 150,
        gold: 1000,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.QUEST_ACCEPT,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // 【実際の処理実行】: checkGameOver()を呼び出す
      // 【処理内容】: ゲームオーバー判定を実行
      const result = gameFlowManager.checkGameOver();

      // 【結果検証】: GameEndConditionオブジェクトが返されることを確認
      // 🔵 信頼性: 設計文書に明確に記載
      expect(result).not.toBeNull(); // 【確認内容】: nullではないことを確認
      expect(result?.type).toBe('game_over'); // 【確認内容】: typeが'game_over'であることを確認
      expect(result?.reason).toBe('time_expired'); // 【確認内容】: reasonが'time_expired'であることを確認
      expect(result?.finalRank).toBe(GuildRank.A); // 【確認内容】: finalRankがAであることを確認
      expect(result?.totalDays).toBe(150); // 【確認内容】: totalDaysが150であることを確認
    });

    it('T-0017-B02: 残り日数が1でSランク未到達の場合、ゲームは継続', () => {
      // 【テスト目的】: ゲームオーバー判定の境界値の正確性を確認
      // 【テスト内容】: checkGameOver()が残り日数1でSランク未到達時にnullを返すことをテスト
      // 【期待される動作】: 残り日数1ではゲームオーバーにならず、ゲームが継続する
      // 🟡 テストケースの信頼性: 要件定義書から妥当に推測

      // 【初期条件設定】: 残り日数が1でSランク未到達
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.C,
        rankHp: 100,
        remainingDays: 1,
        currentDay: 149,
        gold: 500,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.QUEST_ACCEPT,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // 【実際の処理実行】: checkGameOver()を呼び出す
      // 【処理内容】: ゲームオーバー判定を実行
      const result = gameFlowManager.checkGameOver();

      // 【結果検証】: nullが返されることを確認（ゲームオーバーではない）
      // 🟡 信頼性: 要件定義書から妥当に推測
      expect(result).toBeNull(); // 【確認内容】: ゲームオーバーではないことを確認
    });
  });

  // =============================================================================
  // switchPhase() テストケース（TASK-0106）
  // =============================================================================

  describe('switchPhase() - フェーズ自由遷移（TASK-0106）', () => {
    it('T-0106-01: 通常のフェーズ切り替えが成功する', async () => {
      // 【テスト目的】: 進行中操作がない場合のフェーズ切り替えが成功することを確認
      // 【テスト内容】: QUEST_ACCEPTからGATHERINGへの遷移
      // 🔵 信頼性レベル: 設計文書に明記

      const result = await gameFlowManager.switchPhase({
        targetPhase: GamePhase.GATHERING,
      });

      expect(result.success).toBe(true);
      expect(result.previousPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(result.newPhase).toBe(GamePhase.GATHERING);
      expect(result.failureReason).toBeUndefined();
      expect(mockStateManager.setPhase).toHaveBeenCalledWith(GamePhase.GATHERING);
    });

    it('T-0106-02: 採取セッション中にforceAbort=trueでフェーズ切り替えが成功する', async () => {
      // 【テスト目的】: 採取セッション進行中でもforceAbort=trueなら遷移可能なことを確認
      // 🟡 信頼性レベル: EDGE-001・REQ-001-03から妥当な推測

      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.GATHERING,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      // activeOperationChecker付きでGameFlowManagerを再作成
      const { GameFlowManager } = await import('@shared/services/game-flow');
      const activeChecker = vi.fn(() => true); // 採取セッション進行中
      const gfm = new GameFlowManager(
        mockStateManager as IStateManager,
        mockDeckService as IDeckService,
        mockQuestService as IQuestService,
        mockEventBus as IEventBus,
        activeChecker,
      );

      const result = await gfm.switchPhase({
        targetPhase: GamePhase.ALCHEMY,
        forceAbort: true,
      });

      expect(result.success).toBe(true);
      expect(result.previousPhase).toBe(GamePhase.GATHERING);
      expect(result.newPhase).toBe(GamePhase.ALCHEMY);
      expect(mockStateManager.setPhase).toHaveBeenCalledWith(GamePhase.ALCHEMY);
    });

    it('T-0106-02b: 採取セッション中にforceAbort=falseでフェーズ切り替えが失敗する', async () => {
      // 【テスト目的】: 進行中操作があり、forceAbort=falseの場合にSESSION_ABORT_REJECTEDで失敗することを確認
      // 🟡 信頼性レベル: EDGE-001・REQ-001-03から妥当な推測

      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.GATHERING,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      const { GameFlowManager } = await import('@shared/services/game-flow');
      const activeChecker = vi.fn(() => true); // 進行中操作あり
      const gfm = new GameFlowManager(
        mockStateManager as IStateManager,
        mockDeckService as IDeckService,
        mockQuestService as IQuestService,
        mockEventBus as IEventBus,
        activeChecker,
      );

      const result = await gfm.switchPhase({
        targetPhase: GamePhase.ALCHEMY,
      });

      expect(result.success).toBe(false);
      expect(result.previousPhase).toBe(GamePhase.GATHERING);
      expect(result.newPhase).toBe(GamePhase.GATHERING);
      expect(result.failureReason).toBe(PhaseSwitchFailureReason.SESSION_ABORT_REJECTED);
      expect(mockStateManager.setPhase).not.toHaveBeenCalled();
    });

    it('T-0106-03: 同じフェーズへの切り替えはno-opで成功する', async () => {
      // 【テスト目的】: 同一フェーズへの遷移がエラーにならず、no-opとして成功することを確認
      // 🔵 信頼性レベル: 設計文書に明記

      const result = await gameFlowManager.switchPhase({
        targetPhase: GamePhase.QUEST_ACCEPT,
      });

      expect(result.success).toBe(true);
      expect(result.previousPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(result.newPhase).toBe(GamePhase.QUEST_ACCEPT);
      expect(result.failureReason).toBeUndefined();
      // setPhase()は呼ばれない（no-op）
      expect(mockStateManager.setPhase).not.toHaveBeenCalled();
    });

    it('T-0106-04: フェーズ切り替え時にStateManager.setPhase()が呼ばれる', async () => {
      // 【テスト目的】: switchPhase()がStateManager.setPhase()経由でPHASE_CHANGEDイベント発行に繋がることを確認
      // 🔵 信頼性レベル: 設計文書に明記

      await gameFlowManager.switchPhase({
        targetPhase: GamePhase.GATHERING,
      });

      // StateManager.setPhase()が正しい引数で呼ばれることを確認
      // （PHASE_CHANGEDイベント発行はStateManager内部で行われる）
      expect(mockStateManager.setPhase).toHaveBeenCalledTimes(1);
      expect(mockStateManager.setPhase).toHaveBeenCalledWith(GamePhase.GATHERING);
    });

    it('T-0106-05: activeOperationCheckerが未設定の場合は進行中操作なしとして扱う', async () => {
      // 【テスト目的】: activeOperationCheckerが未設定（デフォルト）でもswitchPhaseが正常動作することを確認
      // 🔵 信頼性レベル: 設計文書に明記

      // beforeEachで作成されたインスタンスにはactiveOperationCheckerが未設定
      const result = await gameFlowManager.switchPhase({
        targetPhase: GamePhase.DELIVERY,
      });

      expect(result.success).toBe(true);
      expect(result.newPhase).toBe(GamePhase.DELIVERY);
    });
  });

  // =============================================================================
  // 掲示板連携テストケース（TASK-0110）
  // =============================================================================

  describe('掲示板連携 - startDay()での掲示板更新（TASK-0110）', () => {
    it('T-0110-01: startDay()で掲示板が更新される（期限切れ依頼が除去される）', () => {
      // 【テスト目的】: startDay()呼び出し時にupdateBoard()が実行され、期限切れ依頼が除去されることを確認
      // 🟡 信頼性レベル: dataflow.md セクション6.1から妥当な推測

      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 148,
        currentDay: 3,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.DELIVERY,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [
            { questId: 'expired-q1', postedDay: 1, expiryDay: 2 },
            { questId: 'active-q1', postedDay: 1, expiryDay: 5 },
          ],
          visitorQuests: [],
          lastVisitorUpdateDay: 1,
        },
      }));

      gameFlowManager.startDay();

      // updateStateがquestBoardを含む呼び出しを持つことを確認
      const questBoardCalls = mockStateManager.updateState.mock.calls.filter(
        (call) => call[0]?.questBoard !== undefined,
      );
      expect(questBoardCalls.length).toBeGreaterThanOrEqual(1);

      // 更新された掲示板に期限切れ依頼（expiryDay=2 < currentDay=3）が含まれないことを確認
      const lastBoardUpdate = questBoardCalls[questBoardCalls.length - 1]?.[0]?.questBoard;
      expect(lastBoardUpdate).toBeDefined();
      const expiredQuestIds = lastBoardUpdate.boardQuests
        .filter((q: { expiryDay: number }) => q.expiryDay < 3)
        .map((q: { questId: string }) => q.questId);
      expect(expiredQuestIds).not.toContain('expired-q1');

      // アクティブ依頼は残っていることを確認
      const activeQuestIds = lastBoardUpdate.boardQuests.map((q: { questId: string }) => q.questId);
      expect(activeQuestIds).toContain('active-q1');
    });

    it('T-0110-02: startDay()でgenerateBoardQuestsとgenerateVisitorQuestsが呼ばれる', () => {
      // 【テスト目的】: startDay()でQuestServiceの掲示板候補生成メソッドが呼ばれることを確認
      // 🟡 信頼性レベル: dataflow.md セクション6.1から妥当な推測

      gameFlowManager.startDay();

      expect(mockQuestService.generateBoardQuests).toHaveBeenCalledTimes(1);
      expect(mockQuestService.generateBoardQuests).toHaveBeenCalledWith(GuildRank.G, 5);
      expect(mockQuestService.generateVisitorQuests).toHaveBeenCalledTimes(1);
      expect(mockQuestService.generateVisitorQuests).toHaveBeenCalledWith(GuildRank.G);
    });

    it('T-0110-03: endDay()後のstartDay()でも掲示板が更新される', () => {
      // 【テスト目的】: endDay()→startDay()の自動日進行でも掲示板が正しく更新されることを確認
      // 🟡 信頼性レベル: dataflow.md セクション3.3から妥当な推測

      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 148,
        currentDay: 3,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.DELIVERY,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      gameFlowManager.endDay();

      // endDay()後にstartDay()が呼ばれ、その中でgenerateBoardQuestsが呼ばれることを確認
      expect(mockQuestService.generateBoardQuests).toHaveBeenCalled();
      expect(mockQuestService.generateVisitorQuests).toHaveBeenCalled();

      // questBoardの更新がStateに反映されることを確認
      const questBoardCalls = mockStateManager.updateState.mock.calls.filter(
        (call) => call[0]?.questBoard !== undefined,
      );
      expect(questBoardCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =============================================================================
  // processAPOverflow() テストケース（TASK-0107）
  // =============================================================================

  describe('processAPOverflow() - AP超過自動日進行（TASK-0107）', () => {
    /** テスト用のIAPOverflowResult生成ヘルパー */
    function createOverflowResult(overrides: Partial<IAPOverflowResult> = {}): IAPOverflowResult {
      return {
        hasOverflow: true,
        overflowAP: 1,
        daysConsumed: 1,
        nextDayAP: 2,
        remainingAP: 0,
        ...overrides,
      };
    }

    it('T-0107-01: 1日分のAP超過処理が正しく実行される', async () => {
      // 【テスト目的】: daysConsumed=1の場合にendDay相当処理が1回実行されることを確認
      // 🔵 信頼性レベル: 設計文書に明記

      const overflowResult = createOverflowResult({
        daysConsumed: 1,
        nextDayAP: 2,
      });

      const result = await gameFlowManager.processAPOverflow(overflowResult);

      expect(result.daysAdvanced).toBe(1);
      expect(result.newActionPoints).toBe(2);
      expect(result.isGameOver).toBe(false);
      expect(mockQuestService.updateDeadlines).toHaveBeenCalledTimes(1);
      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        expect.objectContaining({
          remainingDays: 149,
          currentDay: 2,
        }),
      );
    });

    it('T-0107-02: 複数日分のAP超過処理が正しく実行される', async () => {
      // 【テスト目的】: daysConsumed=2の場合にendDay相当処理が2回実行されることを確認
      // 🟡 信頼性レベル: タスク仕様から妥当な推測

      // getState()が呼ばれるたびに日数が進むようモックを設定
      let currentDay = 1;
      let remainingDays = 150;
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays,
        currentDay,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.QUEST_ACCEPT,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));
      mockStateManager.updateState = vi.fn((update) => {
        if (update.currentDay !== undefined) {
          currentDay = update.currentDay;
        }
        if (update.remainingDays !== undefined) {
          remainingDays = update.remainingDays;
        }
      });

      const overflowResult = createOverflowResult({
        daysConsumed: 2,
        nextDayAP: 2,
      });

      const result = await gameFlowManager.processAPOverflow(overflowResult);

      expect(result.daysAdvanced).toBe(2);
      expect(result.isGameOver).toBe(false);
      expect(mockQuestService.updateDeadlines).toHaveBeenCalledTimes(2);
      expect(mockEventBus.emit).toHaveBeenCalledWith(GameEventType.DAY_ENDED, expect.anything());
    });

    it('T-0107-03: AP超過中にゲームオーバーになった場合途中で停止する', async () => {
      // 【テスト目的】: remainingDays=1でdaysConsumed=2の場合、1回目のendDay後にゲームオーバーで停止
      // 🔵 信頼性レベル: 設計文書に明記

      let currentDay = 149;
      let remainingDays = 1;
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.A,
        rankHp: 100,
        remainingDays,
        currentDay,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.QUEST_ACCEPT,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));
      mockStateManager.updateState = vi.fn((update) => {
        if (update.currentDay !== undefined) {
          currentDay = update.currentDay;
        }
        if (update.remainingDays !== undefined) {
          remainingDays = update.remainingDays;
        }
      });

      const overflowResult = createOverflowResult({
        daysConsumed: 2,
        nextDayAP: 2,
      });

      const result = await gameFlowManager.processAPOverflow(overflowResult);

      expect(result.daysAdvanced).toBe(1);
      expect(result.isGameOver).toBe(true);
      expect(result.newActionPoints).toBe(0);
      // endDay相当処理は1回のみ（2回目は実行されない）
      expect(mockQuestService.updateDeadlines).toHaveBeenCalledTimes(1);
      // GAME_OVERイベントが発行される
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.GAME_OVER,
        expect.objectContaining({
          type: 'game_over',
        }),
      );
    });

    it('T-0107-04: 各endDay()で依頼期限が更新される', async () => {
      // 【テスト目的】: processAPOverflow中の各日でupdateDeadlines()が呼ばれることを確認
      // 🔵 信頼性レベル: 設計文書に明記

      let currentDay = 1;
      let remainingDays = 150;
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays,
        currentDay,
        gold: 100,
        actionPoints: 3,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.QUEST_ACCEPT,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));
      mockStateManager.updateState = vi.fn((update) => {
        if (update.currentDay !== undefined) {
          currentDay = update.currentDay;
        }
        if (update.remainingDays !== undefined) {
          remainingDays = update.remainingDays;
        }
      });

      const overflowResult = createOverflowResult({
        daysConsumed: 3,
        nextDayAP: 1,
      });

      const result = await gameFlowManager.processAPOverflow(overflowResult);

      expect(mockQuestService.updateDeadlines).toHaveBeenCalledTimes(3);
      expect(mockDeckService.refillHand).toHaveBeenCalledTimes(3);
      expect(result.daysAdvanced).toBe(3);
      expect(result.newActionPoints).toBe(1);
    });
  });

  // =============================================================================
  // startDay() AP超過対応 / requestEndDay() テストケース（TASK-0108）
  // =============================================================================

  describe('startDay() AP超過対応とrequestEndDay()（TASK-0108）', () => {
    it('T-0108-01: AP超過なしの場合はMAX_APで回復する', () => {
      // 🔵 信頼性レベル: REQ-003-01に明記
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 0,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.DELIVERY,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      gameFlowManager.startDay();

      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        expect.objectContaining({
          actionPoints: 3,
          apOverflow: 0,
        }),
      );
    });

    it('T-0108-02: AP超過ありの場合はMAX_AP - apOverflowで回復する', () => {
      // 🔵 信頼性レベル: REQ-003-01「AP超過分は翌日のAPから差し引かれる」
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 2,
        gold: 100,
        actionPoints: 0,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.DELIVERY,
        contribution: 0,
        apOverflow: 1,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      gameFlowManager.startDay();

      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        expect.objectContaining({
          actionPoints: 2,
          apOverflow: 0,
        }),
      );
    });

    it('T-0108-03: requestEndDay()で残AP破棄してendDay()が実行される', () => {
      // 🔵 信頼性レベル: REQ-004・REQ-004-01
      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays: 150,
        currentDay: 1,
        gold: 100,
        actionPoints: 2,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.DELIVERY,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));

      gameFlowManager.requestEndDay();

      // APが0にリセットされる
      expect(mockStateManager.updateState).toHaveBeenCalledWith(
        expect.objectContaining({
          actionPoints: 0,
          apOverflow: 0,
        }),
      );
      // endDay()が実行される（updateDeadlines呼び出しで確認）
      expect(mockQuestService.updateDeadlines).toHaveBeenCalledTimes(1);
      // DAY_ENDEDイベントが発行される
      expect(mockEventBus.emit).toHaveBeenCalledWith(GameEventType.DAY_ENDED, expect.anything());
    });

    it('TC-004-02: AP残量0でrequestEndDay()すると翌日AP=3で開始される', () => {
      // 【テスト目的】: AP残量0の状態で「日終了」クリック→翌日AP=3で開始
      // 🔵 信頼性レベル: REQ-004
      let currentDay = 5;
      let remainingDays = 146;

      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays,
        currentDay,
        gold: 200,
        actionPoints: 0,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase: GamePhase.ALCHEMY,
        contribution: 0,
        apOverflow: 0,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));
      mockStateManager.updateState = vi.fn((update) => {
        if (update.currentDay !== undefined) {
          currentDay = update.currentDay;
        }
        if (update.remainingDays !== undefined) {
          remainingDays = update.remainingDays;
        }
      });

      gameFlowManager.requestEndDay();

      const updateCalls = mockStateManager.updateState.mock.calls;

      // requestEndDay()でAP=0, apOverflow=0のリセットが呼ばれる
      expect(updateCalls[0][0]).toEqual(
        expect.objectContaining({ actionPoints: 0, apOverflow: 0 }),
      );

      // endDay()→startDay()でAP=3（MAX_AP）で回復される
      const startDayCall = updateCalls.find((call) => call[0].actionPoints === 3);
      expect(startDayCall).toBeDefined();

      // DAY_ENDEDとDAY_STARTEDイベントが発行される
      expect(mockEventBus.emit).toHaveBeenCalledWith(GameEventType.DAY_ENDED, expect.anything());
      expect(mockEventBus.emit).toHaveBeenCalledWith(GameEventType.DAY_STARTED, expect.anything());
    });

    it('T-0108-04: requestEndDay()でapOverflowがリセットされ次日はMAX_APで開始', () => {
      // 🔵 信頼性レベル: REQ-004・REQ-003-01
      let currentApOverflow = 1;
      let currentDay = 1;
      let remainingDays = 150;
      const currentPhase: GamePhase = GamePhase.DELIVERY;

      mockStateManager.getState = vi.fn(() => ({
        currentRank: GuildRank.G,
        rankHp: 100,
        remainingDays,
        currentDay,
        gold: 100,
        actionPoints: 2,
        maxActionPoints: 3,
        comboCount: 0,
        currentPhase,
        contribution: 0,
        apOverflow: currentApOverflow,
        isPromotionTest: false,
        promotionGauge: 0,
        questBoard: {
          boardQuests: [],
          visitorQuests: [],
          lastVisitorUpdateDay: 0,
        },
      }));
      mockStateManager.updateState = vi.fn((update) => {
        if (update.apOverflow !== undefined) {
          currentApOverflow = update.apOverflow;
        }
        if (update.currentDay !== undefined) {
          currentDay = update.currentDay;
        }
        if (update.remainingDays !== undefined) {
          remainingDays = update.remainingDays;
        }
      });

      gameFlowManager.requestEndDay();

      // requestEndDay内でapOverflowが0にリセットされる
      // その後endDay()→startDay()が呼ばれる
      // startDay()でapOverflow=0なのでMAX_AP(3)で回復する
      const updateCalls = mockStateManager.updateState.mock.calls;

      // 最初のupdateState: requestEndDay()でAP=0, apOverflow=0
      expect(updateCalls[0][0]).toEqual(
        expect.objectContaining({ actionPoints: 0, apOverflow: 0 }),
      );

      // startDay()のupdateState: actionPoints=3（apOverflow=0のため）
      const startDayCall = updateCalls.find((call) => call[0].actionPoints === 3);
      expect(startDayCall).toBeDefined();
    });
  });
});
