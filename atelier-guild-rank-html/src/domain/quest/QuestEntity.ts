/**
 * 依頼エンティティ
 * TASK-0087: 依頼エンティティ
 *
 * 依頼テンプレート、生成された依頼、受注中の依頼エンティティを実装する
 * すべてのエンティティは不変オブジェクトとして設計されている
 */

import { GuildRank, QuestType } from '@domain/common/types';
import type { IQuestTemplate, IQuestCondition } from './Quest';

/**
 * 生成された依頼のインターフェース
 */
export interface IQuest {
  /** 依頼ID（ランタイムで生成） */
  id: string;
  /** 依頼者ID */
  clientId: string;
  /** 依頼条件 */
  condition: IQuestCondition;
  /** 貢献度（依頼者補正適用済み） */
  contribution: number;
  /** 報酬金（依頼者補正適用済み） */
  gold: number;
  /** 期限（依頼者補正適用済み） */
  deadline: number;
  /** 難易度 */
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  /** フレーバーテキスト */
  flavorText: string;
}

/**
 * 受注中の依頼のインターフェース
 */
export interface IActiveQuest {
  /** 依頼データ */
  quest: IQuest;
  /** 残り日数 */
  remainingDays: number;
  /** 受注日 */
  acceptedDay: number;
}

/**
 * 依頼条件を深くコピーするヘルパー関数
 */
function deepCopyCondition<T extends Partial<IQuestCondition>>(condition: T): T {
  const copy = { ...condition };
  if (condition.subConditions) {
    copy.subConditions = condition.subConditions.map((sub) =>
      deepCopyCondition(sub)
    );
  }
  return Object.freeze(copy) as T;
}

/**
 * 依頼テンプレートエンティティ
 * 依頼生成の基になるテンプレートを保持する不変オブジェクト
 */
export class QuestTemplate implements IQuestTemplate {
  public readonly id: string;
  public readonly type: QuestType;
  public readonly difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  public readonly baseContribution: number;
  public readonly baseGold: number;
  public readonly baseDeadline: number;
  private readonly _conditionTemplate: Readonly<Partial<IQuestCondition>>;
  public readonly unlockRank: GuildRank;
  public readonly flavorTextTemplate?: string;

  // IQuestTemplate互換のためのgetter
  get conditionTemplate(): Partial<IQuestCondition> {
    return this.getConditionTemplate();
  }

  constructor(data: IQuestTemplate) {
    this.id = data.id;
    this.type = data.type;
    this.difficulty = data.difficulty;
    this.baseContribution = data.baseContribution;
    this.baseGold = data.baseGold;
    this.baseDeadline = data.baseDeadline;
    // 不変性を保証するため、深いコピーを作成
    this._conditionTemplate = deepCopyCondition(data.conditionTemplate);
    this.unlockRank = data.unlockRank;
    this.flavorTextTemplate = data.flavorTextTemplate;
    Object.freeze(this);
  }

  /**
   * 難易度を取得する
   * @returns 難易度
   */
  getDifficulty(): 'easy' | 'normal' | 'hard' | 'extreme' {
    return this.difficulty;
  }

  /**
   * 基本報酬金を取得する
   * @returns 基本報酬金
   */
  getBaseGold(): number {
    return this.baseGold;
  }

  /**
   * 基本貢献度を取得する
   * @returns 基本貢献度
   */
  getBaseContribution(): number {
    return this.baseContribution;
  }

  /**
   * 基本期限を取得する
   * @returns 基本期限（日）
   */
  getBaseDeadline(): number {
    return this.baseDeadline;
  }

  /**
   * 条件テンプレートを取得する
   * 不変性を保証するため、コピーを返す
   * @returns 条件テンプレートのコピー
   */
  getConditionTemplate(): Partial<IQuestCondition> {
    return deepCopyCondition(this._conditionTemplate);
  }
}

/**
 * 生成された依頼エンティティ
 * 依頼者と依頼テンプレートから生成された実際の依頼を表す不変オブジェクト
 */
export class Quest implements IQuest {
  public readonly id: string;
  public readonly clientId: string;
  private readonly _condition: Readonly<IQuestCondition>;
  public readonly contribution: number;
  public readonly gold: number;
  public readonly deadline: number;
  public readonly difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  public readonly flavorText: string;

  // IQuest互換のためのgetter
  get condition(): IQuestCondition {
    return this.getCondition();
  }

  constructor(data: IQuest) {
    this.id = data.id;
    this.clientId = data.clientId;
    // 不変性を保証するため、深いコピーを作成
    this._condition = deepCopyCondition(data.condition);
    this.contribution = data.contribution;
    this.gold = data.gold;
    this.deadline = data.deadline;
    this.difficulty = data.difficulty;
    this.flavorText = data.flavorText;
    Object.freeze(this);
  }

  /**
   * 難易度を取得する
   * @returns 難易度
   */
  getDifficulty(): 'easy' | 'normal' | 'hard' | 'extreme' {
    return this.difficulty;
  }

  /**
   * 依頼条件を取得する
   * 不変性を保証するため、コピーを返す
   * @returns 依頼条件のコピー
   */
  getCondition(): IQuestCondition {
    return deepCopyCondition(this._condition);
  }

  /**
   * 報酬金を取得する
   * @returns 報酬金（補正適用済み）
   */
  getGold(): number {
    return this.gold;
  }

  /**
   * 貢献度を取得する
   * @returns 貢献度（補正適用済み）
   */
  getContribution(): number {
    return this.contribution;
  }

  /**
   * 期限を取得する
   * @returns 期限（日）（補正適用済み）
   */
  getDeadline(): number {
    return this.deadline;
  }
}

/**
 * 受注中の依頼エンティティ
 * 現在受注中の依頼と残り日数を管理する不変オブジェクト
 */
export class ActiveQuest implements IActiveQuest {
  private readonly _quest: Quest;
  public readonly remainingDays: number;
  public readonly acceptedDay: number;

  // IActiveQuest互換のためのgetter
  get quest(): IQuest {
    return this.getQuest();
  }

  constructor(data: IActiveQuest) {
    // Questインスタンスを作成（既にQuestインスタンスの場合はそのまま使用）
    this._quest =
      data.quest instanceof Quest
        ? data.quest
        : new Quest(data.quest);
    this.remainingDays = data.remainingDays;
    this.acceptedDay = data.acceptedDay;
    Object.freeze(this);
  }

  /**
   * 依頼データを取得する
   * @returns 依頼データ
   */
  getQuest(): Quest {
    return this._quest;
  }

  /**
   * 残り日数を取得する
   * @returns 残り日数
   */
  getRemainingDays(): number {
    return this.remainingDays;
  }

  /**
   * 受注日を取得する
   * @returns 受注日
   */
  getAcceptedDay(): number {
    return this.acceptedDay;
  }

  /**
   * 期限切れかどうかを判定する
   * @returns 期限切れの場合true
   */
  isExpired(): boolean {
    return this.remainingDays <= 0;
  }

  /**
   * 日数を1日進めた新しいインスタンスを作成する
   * @returns 新しいActiveQuest
   */
  advanceDay(): ActiveQuest {
    return new ActiveQuest({
      quest: this._quest,
      remainingDays: this.remainingDays - 1,
      acceptedDay: this.acceptedDay,
    });
  }
}

/**
 * 依頼テンプレートを生成するファクトリ関数
 * @param data 依頼テンプレートデータ
 * @returns QuestTemplateインスタンス
 */
export function createQuestTemplate(data: IQuestTemplate): QuestTemplate {
  return new QuestTemplate(data);
}

/**
 * 依頼を生成するファクトリ関数
 * @param data 依頼データ
 * @returns Questインスタンス
 */
export function createQuest(data: IQuest): Quest {
  return new Quest(data);
}

/**
 * 受注中の依頼を生成するファクトリ関数
 * @param data 受注中の依頼データ
 * @returns ActiveQuestインスタンス
 */
export function createActiveQuest(data: IActiveQuest): ActiveQuest {
  return new ActiveQuest(data);
}
