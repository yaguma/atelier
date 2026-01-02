/**
 * 依頼関連インターフェース定義
 */

import {
  Attribute,
  GuildRank,
  ItemCategory,
  ItemEffectType,
  Quality,
  QuestType,
} from '@domain/common/types';

/**
 * 依頼条件
 * 依頼タイプに応じた条件を表現
 */
export interface IQuestCondition {
  /** 依頼タイプ */
  type: QuestType;
  /** 具体的指定: アイテムID */
  itemId?: string;
  /** カテゴリ: アイテムカテゴリ */
  category?: ItemCategory;
  /** 品質条件: 最低品質 */
  minQuality?: Quality;
  /** 数量条件: 必要数 */
  quantity?: number;
  /** 属性条件: 属性 */
  attribute?: Attribute;
  /** 属性条件: 最低属性値 */
  minAttributeValue?: number;
  /** 効果条件: 効果タイプ */
  effectType?: ItemEffectType;
  /** 効果条件: 最低効果値 */
  minEffectValue?: number;
  /** 素材消費: レア素材使用数 */
  rareMaterialCount?: number;
  /** 素材消費: 特定素材ID */
  requiredMaterialId?: string;
  /** 複合条件: 子条件リスト */
  subConditions?: IQuestCondition[];
}

/**
 * 依頼マスターデータ（テンプレート）
 */
export interface IQuestTemplate {
  /** 依頼テンプレートID */
  id: string;
  /** 依頼タイプ */
  type: QuestType;
  /** 難易度（簡単/普通/難しい/最難関） */
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  /** 基本貢献度 */
  baseContribution: number;
  /** 基本報酬金 */
  baseGold: number;
  /** 基本期限（日） */
  baseDeadline: number;
  /** 条件テンプレート */
  conditionTemplate: Partial<IQuestCondition>;
  /** 解放ランク */
  unlockRank: GuildRank;
  /** フレーバーテキストテンプレート */
  flavorTextTemplate?: string;
}
