/**
 * quest-service.ts - QuestService実装
 *
 * TASK-0013: 依頼エンティティ・QuestService実装
 *
 * @description
 * 依頼システムサービスの実装。
 * 依頼の生成、受注、納品、期限管理などの機能を提供する。
 *
 * @信頼性レベル 🔵
 * - 設計文書・要件定義書に基づいた実装
 * - 依頼タイプに応じた条件判定
 * - 報酬カード生成システム
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import { Quest } from '@domain/entities/Quest';
import type { IMasterDataRepository } from '@domain/interfaces/master-data-repository.interface';
import type {
  DailyQuestResult,
  DeliveryResult,
  FailedQuest,
  IQuestService,
  RewardCardCandidate,
} from '@domain/interfaces/quest-service.interface';
import type { IEventBus } from '@shared/services/event-bus';
import type { CardId, ClientId, GuildRank, QuestId } from '@shared/types';
import { toClientId, toQuestId } from '@shared/types';
import { ApplicationError, ErrorCodes } from '@shared/types/errors';
import { GameEventType } from '@shared/types/events';
import type { IActiveQuest, IClient, IQuest, IQuestCondition } from '@shared/types/quests';
import type { RandomFn } from '@shared/utils';
import { defaultRandomFn, generateUniqueId } from '@shared/utils';

// =============================================================================
// ランク別同時受注上限
// =============================================================================

/**
 * 【機能概要】: ランク別同時受注上限
 * 【実装方針】: ランクに応じて受注可能な依頼数を設定
 * 🔵 信頼性レベル: 設計文書に明記
 */
const QUEST_LIMIT_BY_RANK: Record<GuildRank, number> = {
  G: 2,
  F: 2,
  E: 3,
  D: 3,
  C: 4,
  B: 4,
  A: 5,
  S: 5,
};

/**
 * 【機能概要】: ランク別日次依頼生成数
 * 【実装方針】: ランクに応じて生成される依頼数を設定
 * 🔵 信頼性レベル: 設計文書に明記
 */
const DAILY_QUEST_COUNT_BY_RANK: Record<GuildRank, number> = {
  G: 3,
  F: 4,
  E: 4,
  D: 5,
  C: 5,
  B: 6,
  A: 6,
  S: 7,
};

/**
 * 【機能概要】: ランク別訪問依頼生成数（TASK-0109）
 * 【実装方針】: ランクに応じて訪問依頼の生成数を設定
 * 🔵 信頼性レベル: REQ-005より
 */
const VISITOR_QUEST_COUNT_BY_RANK: Record<GuildRank, number> = {
  G: 1,
  F: 1,
  E: 1,
  D: 2,
  C: 2,
  B: 2,
  A: 3,
  S: 3,
};

/**
 * 【機能概要】: ランク別依頼者出現数
 * 【実装方針】: ランクに応じて出現する依頼者数を設定
 * 🔵 信頼性レベル: 設計文書に明記
 */
const CLIENT_COUNT_BY_RANK: Record<GuildRank, number> = {
  G: 2,
  F: 2,
  E: 3,
  D: 3,
  C: 3,
  B: 4,
  A: 4,
  S: 5,
};

/**
 * 【機能概要】: QuestServiceクラス
 * 【実装方針】: 依頼の生成、受注、納品、期限管理を提供
 * 【テスト対応】: T-0013-S01 〜 T-0013-S16 を通すための実装
 * 🔵 信頼性レベル: 設計文書・要件定義書に明記
 */
export class QuestService implements IQuestService {
  /** ランダム関数（テスト時に差し替え可能） */
  private readonly randomFn: RandomFn;

  /**
   * 【プライベートプロパティ】: 利用可能な依頼リスト
   * 【実装内容】: 今日生成された依頼のリスト
   * 🔵 信頼性レベル: 設計文書に明記
   */
  private availableQuests: Map<QuestId, Quest> = new Map();

  /**
   * 【プライベートプロパティ】: 受注中の依頼リスト
   * 【実装内容】: プレイヤーが受注した依頼のリスト
   * 🔵 信頼性レベル: 設計文書に明記
   */
  private activeQuests: Map<QuestId, IActiveQuest> = new Map();

  /**
   * 【プライベートプロパティ】: 今日の依頼者リスト
   * 【実装内容】: 今日出現した依頼者のリスト
   * 🔵 信頼性レベル: 設計文書に明記
   */
  private todayClients: Map<ClientId, IClient> = new Map();

  /**
   * 【プライベートプロパティ】: 現在のギルドランク
   * 【実装内容】: 依頼受注上限の判定に使用
   * 🔵 信頼性レベル: 設計文書に明記
   */
  private currentRank: GuildRank = 'G';

  /**
   * 【プライベートプロパティ】: 依頼受注上限（特殊ルールによる上書き用）
   * 【実装内容】: nullの場合はランク別デフォルト値を使用
   * 🔵 信頼性レベル: 設計文書に明記
   */
  private questLimitOverride: number | null = null;

  /**
   * 【機能概要】: QuestServiceのコンストラクタ
   * 【実装方針】: 依存性注入でMasterDataRepository、EventBusを受け取る
   * 🔵 信頼性レベル: 設計文書に明記
   *
   * @param masterDataRepo - マスターデータリポジトリ
   * @param eventBus - イベントバス
   */
  constructor(
    private readonly masterDataRepo: IMasterDataRepository,
    private readonly eventBus: IEventBus,
    randomFn?: RandomFn,
  ) {
    this.randomFn = randomFn ?? defaultRandomFn;
  }

  // =============================================================================
  // 日次依頼生成
  // =============================================================================

  /**
   * 【機能概要】: 日次依頼を生成
   * 【実装方針】: ランクに応じた依頼者と依頼を生成
   * 【処理フロー】:
   *   1. マスターデータ読み込みチェック
   *   2. 現在ランク保存
   *   3. 前日の利用可能依頼をクリア
   *   4. 依頼者生成
   *   5. 依頼生成
   *   6. DAILY_QUESTS_GENERATEDイベント発行
   * 🔵 信頼性レベル: 設計文書に明記
   */
  generateDailyQuests(rank: GuildRank): DailyQuestResult {
    // 【マスターデータ読み込みチェック】: マスターデータが読み込まれているか確認
    // 🟡 信頼性レベル: 要件定義書に記載あり
    if (!this.masterDataRepo.isLoaded()) {
      throw new ApplicationError(ErrorCodes.DATA_NOT_LOADED, 'Master data not loaded');
    }

    // 【現在ランク保存】: 依頼受注上限の判定に使用
    // 🔵 信頼性レベル: 設計文書に明記
    this.currentRank = rank;

    // 【前日の利用可能依頼をクリア】: 新しい日のため前日の依頼をクリア
    // 🔵 信頼性レベル: 設計文書に明記
    this.availableQuests.clear();
    this.todayClients.clear();

    // 【依頼者生成】: ランクに応じた依頼者を生成
    // 🔵 信頼性レベル: 設計文書に明記
    const clientCount = CLIENT_COUNT_BY_RANK[rank];
    const clients = this.generateClients(clientCount);

    // 【依頼生成】: 各依頼者から依頼を生成
    // 🔵 信頼性レベル: 設計文書に明記
    const questCount = DAILY_QUEST_COUNT_BY_RANK[rank];
    const quests = this.generateQuests(clients, questCount);

    // 【イベント発行】: DAILY_QUESTS_GENERATEDイベントを発行
    // 🔵 信頼性レベル: 設計文書に明記
    this.eventBus.emit(GameEventType.QUEST_GENERATED, {
      clients: clients.map((c) => c),
      quests: quests.map((q) => q.data),
    });

    // 【結果返却】: 依頼者と依頼のリストを返す
    // 🔵 信頼性レベル: 設計文書に明記
    return {
      clients: clients.map((c) => c),
      quests: quests.map((q) => q.data),
    };
  }

  // =============================================================================
  // 掲示板・訪問依頼生成（TASK-0109）
  // =============================================================================

  /**
   * 【機能概要】: 掲示板用依頼を生成（TASK-0109）
   * 【実装方針】: 空き枠数に応じた依頼を生成しavailableQuestsに追加
   * 🔵 信頼性レベル: REQ-005・architecture.mdより
   */
  generateBoardQuests(rank: GuildRank, vacancies: number): IQuest[] {
    if (!this.masterDataRepo.isLoaded()) {
      throw new ApplicationError(ErrorCodes.DATA_NOT_LOADED, 'Master data not loaded');
    }

    if (vacancies <= 0) {
      return [];
    }

    this.currentRank = rank;
    const clients = this.ensureClients(rank);
    const quests = this.generateQuests(clients, vacancies);
    return quests.map((q) => q.data);
  }

  /**
   * 【機能概要】: 訪問依頼を生成（TASK-0109）
   * 【実装方針】: ランクに応じた訪問依頼を生成しavailableQuestsに追加
   * 🔵 信頼性レベル: REQ-005・architecture.mdより
   */
  generateVisitorQuests(rank: GuildRank): IQuest[] {
    if (!this.masterDataRepo.isLoaded()) {
      throw new ApplicationError(ErrorCodes.DATA_NOT_LOADED, 'Master data not loaded');
    }

    this.currentRank = rank;
    const clients = this.ensureClients(rank);
    const visitorCount = VISITOR_QUEST_COUNT_BY_RANK[rank];
    const quests = this.generateQuests(clients, visitorCount);
    return quests.map((q) => q.data);
  }

  // =============================================================================
  // 依頼受注・キャンセル
  // =============================================================================

  /**
   * 【機能概要】: 依頼を受注
   * 【実装方針】: 依頼をアクティブリストに追加
   * 【エラー】: 依頼上限超過時、依頼未発見時
   * 🔵 信頼性レベル: 設計文書に明記
   */
  acceptQuest(questId: QuestId): boolean {
    // 【重複受注チェック】: 既に受注済みの場合は早期リターン
    // Issue #137: イベント重複発行による二重受注を防止
    if (this.activeQuests.has(questId)) {
      console.warn(`Quest already accepted: ${questId}`);
      return false;
    }

    // 【依頼存在チェック】: 利用可能な依頼から検索
    // 🔵 信頼性レベル: 設計文書に明記
    const quest = this.availableQuests.get(questId);
    if (!quest) {
      // 既に受注処理が完了している可能性があるため、警告のみ出力
      console.warn(`Quest not found (may already be accepted): ${questId}`);
      return false;
    }

    // 【上限チェック】: 受注中の依頼数が上限に達しているか確認
    // 🔵 信頼性レベル: 設計文書に明記
    const limit = this.getQuestLimit();
    if (this.activeQuests.size >= limit) {
      throw new ApplicationError(
        ErrorCodes.QUEST_LIMIT_EXCEEDED,
        `Quest limit exceeded: ${this.activeQuests.size}/${limit}`,
      );
    }

    // 【アクティブリストに追加】: 受注中依頼として追加
    // 🔵 信頼性レベル: 設計文書に明記
    const activeQuest: IActiveQuest = {
      quest: quest.data,
      client: quest.client,
      acceptedDay: 0, // 現在の日数（GameFlowManagerから設定される想定）
      remainingDays: quest.deadline,
    };

    this.activeQuests.set(questId, activeQuest);

    // 【利用可能リストから削除】: 受注した依頼は利用可能リストから削除
    // 🔵 信頼性レベル: 設計文書に明記
    this.availableQuests.delete(questId);

    // Note: QUEST_ACCEPTEDイベントはUI層（QuestAcceptPhaseUI）から発行されるため、
    // ここでは発行しない。二重発行を防止するため。(Issue #137)

    return true;
  }

  /**
   * 【機能概要】: 依頼をキャンセル
   * 【実装方針】: アクティブリストから依頼を削除
   * 【エラー】: 依頼未発見時
   * 🔵 信頼性レベル: 設計文書に明記
   */
  cancelQuest(questId: QuestId): void {
    // 【依頼存在チェック】: アクティブリストから検索
    // 🔵 信頼性レベル: 設計文書に明記
    const activeQuest = this.activeQuests.get(questId);
    if (!activeQuest) {
      throw new ApplicationError(ErrorCodes.QUEST_NOT_FOUND, `Active quest not found: ${questId}`);
    }

    // 【アクティブリストから削除】: キャンセル
    // 🔵 信頼性レベル: 設計文書に明記
    this.activeQuests.delete(questId);

    // 【イベント発行】: QUEST_CANCELLEDイベントを発行
    // 🔵 信頼性レベル: 設計文書に明記
    this.eventBus.emit(GameEventType.QUEST_CANCELLED, { questId });
  }

  // =============================================================================
  // 納品
  // =============================================================================

  /**
   * 【機能概要】: 納品可能かどうかを判定
   * 【実装方針】: アイテムが依頼条件を満たすか判定
   * 🔵 信頼性レベル: 設計文書に明記
   */
  canDeliver(questId: QuestId, item: ItemInstance): boolean {
    // 【依頼存在チェック】: アクティブリストから検索
    // 🔵 信頼性レベル: 設計文書に明記
    const activeQuest = this.activeQuests.get(questId);
    if (!activeQuest) {
      return false;
    }

    // 【Questエンティティ作成】: 条件判定用
    // 🔵 信頼性レベル: 設計文書に明記
    const quest = new Quest(activeQuest.quest, activeQuest.client);
    return quest.canDeliver(item);
  }

  /**
   * 【機能概要】: 納品を実行
   * 【実装方針】: 条件を満たすアイテムを納品し報酬を計算
   * 【エラー】: 条件未達成時、依頼未発見時
   * 🔵 信頼性レベル: 設計文書に明記
   */
  deliver(questId: QuestId, item: ItemInstance, _enhancementIds?: CardId[]): DeliveryResult {
    // 【依頼存在チェック】: アクティブリストから検索
    // 🔵 信頼性レベル: 設計文書に明記
    const activeQuest = this.activeQuests.get(questId);
    if (!activeQuest) {
      throw new ApplicationError(ErrorCodes.QUEST_NOT_FOUND, `Active quest not found: ${questId}`);
    }

    // 【Questエンティティ作成】: 条件判定・報酬計算用
    // 🔵 信頼性レベル: 設計文書に明記
    const quest = new Quest(activeQuest.quest, activeQuest.client);

    // 【条件チェック】: 納品可能か確認
    // 🔵 信頼性レベル: 設計文書に明記
    if (!quest.canDeliver(item)) {
      return {
        success: false,
        contribution: 0,
        gold: 0,
        rewardCards: [],
        consumedItems: [],
      };
    }

    // 【報酬計算】: 貢献度とゴールドを計算
    // 🔵 信頼性レベル: 設計文書に明記
    const contribution = quest.calculateContribution(item);
    const gold = quest.calculateGold(item);

    // 【報酬カード生成】: 依頼者タイプと依頼タイプに応じたカード候補を生成
    // 🔵 信頼性レベル: 設計文書に明記
    const rewardCards = this.generateRewardCards(quest);

    // 【アクティブリストから削除】: 納品完了
    // 🔵 信頼性レベル: 設計文書に明記
    this.activeQuests.delete(questId);

    // 【イベント発行】: QUEST_COMPLETEDイベントを発行
    // 🔵 信頼性レベル: 設計文書に明記
    this.eventBus.emit(GameEventType.QUEST_COMPLETED, {
      quest: quest.data,
      contribution,
      gold,
      rewardCards,
    });

    return {
      success: true,
      contribution,
      gold,
      rewardCards,
      consumedItems: [item],
    };
  }

  // =============================================================================
  // 状態取得
  // =============================================================================

  /**
   * 【機能概要】: 受注中の依頼を取得
   * 【実装方針】: アクティブな依頼リストを返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getActiveQuests(): IActiveQuest[] {
    return Array.from(this.activeQuests.values());
  }

  /**
   * 【機能概要】: 利用可能な依頼を取得
   * 【実装方針】: 今日生成された未受注の依頼リストを返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getAvailableQuests(): IQuest[] {
    return Array.from(this.availableQuests.values()).map((q) => q.data);
  }

  // =============================================================================
  // 期限管理
  // =============================================================================

  /**
   * 【機能概要】: 依頼の期限を更新（日終了処理）
   * 【実装方針】: 全依頼の残り日数を-1し、期限切れを判定
   * 🔵 信頼性レベル: 設計文書に明記
   */
  updateDeadlines(): FailedQuest[] {
    const failedQuests: FailedQuest[] = [];

    // 【期限更新】: 全アクティブ依頼の残り日数を-1
    // 🔵 信頼性レベル: 設計文書に明記
    for (const [questId, activeQuest] of this.activeQuests.entries()) {
      activeQuest.remainingDays--;

      // 【期限切れ判定】: 残り日数が0以下で失敗
      // 🔵 信頼性レベル: 設計文書に明記
      if (activeQuest.remainingDays <= 0) {
        failedQuests.push({
          quest: activeQuest.quest,
          reason: 'deadline_expired',
        });

        // 【アクティブリストから削除】: 失敗した依頼を削除
        // 🔵 信頼性レベル: 設計文書に明記
        this.activeQuests.delete(questId);

        // 【イベント発行】: QUEST_FAILEDイベントを発行
        // 🔵 信頼性レベル: 設計文書に明記
        this.eventBus.emit(GameEventType.QUEST_FAILED, {
          quest: activeQuest.quest,
          reason: 'deadline_expired',
        });
      }
    }

    return failedQuests;
  }

  // =============================================================================
  // 条件判定
  // =============================================================================

  /**
   * 【機能概要】: 依頼条件を判定
   * 【実装方針】: 依頼タイプに応じた条件判定を実行
   * 🔵 信頼性レベル: 設計文書に明記
   */
  checkCondition(condition: IQuestCondition, item: ItemInstance): boolean {
    // 【ダミーQuestで判定】: Questエンティティの判定ロジックを利用
    // 🟡 信頼性レベル: 設計文書から妥当に推測
    const dummyQuest: IQuest = {
      id: toQuestId('dummy'),
      clientId: toClientId('dummy'),
      condition,
      contribution: 0,
      gold: 0,
      deadline: 0,
      difficulty: 'normal',
      flavorText: '',
    };
    const dummyClient: IClient = {
      id: toClientId('dummy'),
      name: 'dummy',
      type: 'VILLAGER',
      contributionMultiplier: 1.0,
      goldMultiplier: 1.0,
      deadlineModifier: 0,
      preferredQuestTypes: ['QUANTITY'],
      unlockRank: 'G',
    };
    const quest = new Quest(dummyQuest, dummyClient);
    return quest.checkCondition(condition, item);
  }

  // =============================================================================
  // 上限管理
  // =============================================================================

  /**
   * 【機能概要】: 依頼の同時受注上限を取得
   * 【実装方針】: ランクに応じた上限を返す
   * 🔵 信頼性レベル: 設計文書に明記
   */
  getQuestLimit(): number {
    if (this.questLimitOverride !== null) {
      return this.questLimitOverride;
    }
    return QUEST_LIMIT_BY_RANK[this.currentRank];
  }

  /**
   * 【機能概要】: 依頼の同時受注上限を設定
   * 【実装方針】: ランク特殊ルールによる上限変更
   * 🔵 信頼性レベル: 設計文書に明記
   */
  setQuestLimit(limit: number): void {
    this.questLimitOverride = limit;
  }

  // =============================================================================
  // プライベートメソッド
  // =============================================================================

  /**
   * 【機能概要】: 依頼者を確保（TASK-0109）
   * 【実装方針】: todayClientsが空の場合は新規生成、既に存在する場合は再利用
   * 🔵 信頼性レベル: REQ-005より
   */
  private ensureClients(rank: GuildRank): IClient[] {
    if (this.todayClients.size === 0) {
      const clientCount = CLIENT_COUNT_BY_RANK[rank];
      this.generateClients(clientCount);
    }
    return Array.from(this.todayClients.values());
  }

  /**
   * 【機能概要】: 依頼者を生成
   * 【実装方針】: マスターデータからランダムに依頼者を選択
   * 🔵 信頼性レベル: 設計文書に明記
   */
  private generateClients(count: number): IClient[] {
    const clients: IClient[] = [];
    const allClients = this.masterDataRepo.getAllClients();

    if (allClients.length === 0) {
      // 【フォールバック】: マスターデータがない場合はデフォルト依頼者を生成
      // 🟡 信頼性レベル: 設計文書から妥当に推測
      for (let i = 0; i < count; i++) {
        const client: IClient = {
          id: toClientId(generateUniqueId('client')),
          name: `依頼者${i + 1}`,
          type: 'VILLAGER',
          contributionMultiplier: 1.0,
          goldMultiplier: 1.0,
          deadlineModifier: 0,
          preferredQuestTypes: ['QUANTITY'],
          unlockRank: 'G',
        };
        clients.push(client);
        this.todayClients.set(client.id, client);
      }
      return clients;
    }

    // 【ランダム選択】: Fisher-Yatesアルゴリズムで公平にシャッフル
    // 🔵 信頼性レベル: 設計文書に明記
    const shuffled = this.fisherYatesShuffle([...allClients]);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    for (const client of selected) {
      clients.push(client);
      this.todayClients.set(client.id, client);
    }

    return clients;
  }

  /**
   * 【機能概要】: 依頼を生成
   * 【実装方針】: 依頼者ごとに依頼を生成
   * 🔵 信頼性レベル: 設計文書に明記
   */
  private generateQuests(clients: IClient[], count: number): Quest[] {
    const quests: Quest[] = [];
    const allQuestTemplates = this.masterDataRepo.getAllQuests();

    if (allQuestTemplates.length === 0 || clients.length === 0) {
      // 【フォールバック】: マスターデータがない場合はデフォルト依頼を生成
      // 🟡 信頼性レベル: 設計文書から妥当に推測
      for (let i = 0; i < count; i++) {
        const client = clients[i % clients.length];
        const questData: IQuest = {
          id: toQuestId(generateUniqueId('quest')),
          clientId: client.id,
          condition: { type: 'QUANTITY', quantity: 1 },
          contribution: 50 + Math.floor(this.randomFn() * 50),
          gold: 30 + Math.floor(this.randomFn() * 30),
          deadline: 5 + Math.floor(this.randomFn() * 3),
          difficulty: 'normal',
          flavorText: `${client.name}からの依頼`,
        };
        const quest = new Quest(questData, client);
        quests.push(quest);
        this.availableQuests.set(questData.id, quest);
      }
      return quests;
    }

    // 【ランダム選択】: Fisher-Yatesアルゴリズムで公平にシャッフル
    // 🔵 信頼性レベル: 設計文書に明記
    const shuffled = this.fisherYatesShuffle([...allQuestTemplates]);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    for (let i = 0; i < selected.length; i++) {
      const template = selected[i];
      const client = clients[i % clients.length];

      // 【テンプレートから依頼生成】: clientIdを差し替えて生成
      // 🔵 信頼性レベル: 設計文書に明記
      const questData: IQuest = {
        ...template,
        id: toQuestId(generateUniqueId('quest')),
        clientId: client.id,
      };
      const quest = new Quest(questData, client);
      quests.push(quest);
      this.availableQuests.set(questData.id, quest);
    }

    return quests;
  }

  /**
   * 【機能概要】: 報酬カードを生成
   * 【実装方針】: 依頼者タイプと依頼タイプに応じたカード候補を生成
   * 🔵 信頼性レベル: 設計文書に明記
   */
  private generateRewardCards(quest: Quest): RewardCardCandidate[] {
    const cards: RewardCardCandidate[] = [];

    // 【依頼者タイプに応じたカード】: 依頼者の専門分野に関連するカード
    // 🔵 信頼性レベル: 設計文書に明記
    const clientTypeCard = this.getCardByClientType(quest.client.type);
    if (clientTypeCard) {
      cards.push({
        cardId: clientTypeCard,
        rarity: 'COMMON',
        reason: 'client_type',
      });
    }

    // 【依頼タイプに応じたカード】: 依頼の条件タイプに関連するカード
    // 🔵 信頼性レベル: 設計文書に明記
    const questTypeCard = this.getCardByQuestType(quest.condition.type);
    if (questTypeCard) {
      cards.push({
        cardId: questTypeCard,
        rarity: 'UNCOMMON',
        reason: 'quest_type',
      });
    }

    // 【ランダムカード】: 汎用的なカード
    // 🔵 信頼性レベル: 設計文書に明記
    const randomCard = this.getRandomRewardCard();
    if (randomCard) {
      cards.push({
        cardId: randomCard,
        rarity: 'COMMON',
        reason: 'random',
      });
    }

    return cards;
  }

  /**
   * 【機能概要】: 依頼者タイプに応じたカードIDを取得
   * 🟡 信頼性レベル: 設計文書から妥当に推測
   */
  private getCardByClientType(_clientType: string): CardId | null {
    // 【フォールバック】: マスターデータから適切なカードを選択（将来実装）
    // 🟡 信頼性レベル: 設計文書から妥当に推測
    const allCards = this.masterDataRepo.getAllCards();
    if (allCards.length === 0) {
      return null;
    }

    // 【ランダム選択】: 現時点では単純にランダム選択
    // 🟡 信頼性レベル: 将来的には依頼者タイプに応じた選択ロジックを実装
    const randomIndex = Math.floor(this.randomFn() * allCards.length);
    return allCards[randomIndex].id;
  }

  /**
   * 【機能概要】: 依頼タイプに応じたカードIDを取得
   * 🟡 信頼性レベル: 設計文書から妥当に推測
   */
  private getCardByQuestType(_questType: string): CardId | null {
    // 【フォールバック】: マスターデータから適切なカードを選択（将来実装）
    // 🟡 信頼性レベル: 設計文書から妥当に推測
    const allCards = this.masterDataRepo.getAllCards();
    if (allCards.length === 0) {
      return null;
    }

    // 【ランダム選択】: 現時点では単純にランダム選択
    // 🟡 信頼性レベル: 将来的には依頼タイプに応じた選択ロジックを実装
    const randomIndex = Math.floor(this.randomFn() * allCards.length);
    return allCards[randomIndex].id;
  }

  /**
   * 【機能概要】: ランダムな報酬カードIDを取得
   * 🟡 信頼性レベル: 設計文書から妥当に推測
   */
  private getRandomRewardCard(): CardId | null {
    const allCards = this.masterDataRepo.getAllCards();
    if (allCards.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(this.randomFn() * allCards.length);
    return allCards[randomIndex].id;
  }

  /**
   * 【機能概要】: Fisher-Yatesアルゴリズムで配列をシャッフル
   * 【実装方針】: 公平なシャッフルを保証（sort比較関数による偏りを回避）
   * 🔵 信頼性レベル: 標準的なアルゴリズム
   */
  private fisherYatesShuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomFn() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
