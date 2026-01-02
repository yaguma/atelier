/**
 * セーブデータ関連インターフェース定義
 */

import {
  GamePhase,
  GuildRank,
  Quality,
  Attribute,
  ItemEffectType,
} from '@domain/common/types';

/**
 * ゲーム進行状態
 */
export interface IGameState {
  /** 現在のギルドランク */
  currentRank: GuildRank;
  /** 昇格ゲージ（累計貢献度） */
  promotionGauge: number;
  /** 昇格に必要な貢献度 */
  requiredContribution: number;
  /** ランクの残り日数 */
  remainingDays: number;
  /** 現在の日数（1始まり） */
  currentDay: number;
  /** 現在のフェーズ */
  currentPhase: GamePhase;
  /** 所持金 */
  gold: number;
  /** 連続依頼達成数（コンボ） */
  comboCount: number;
  /** 残り行動ポイント */
  actionPoints: number;
  /** 昇格試験中フラグ */
  isPromotionTest: boolean;
  /** 昇格試験残り日数（null = 試験中でない） */
  promotionTestRemainingDays: number | null;
}

/**
 * デッキ状態
 */
export interface IDeckState {
  /** 山札（カードID） */
  deck: string[];
  /** 手札（カードID） */
  hand: string[];
  /** 捨て札（カードID） */
  discard: string[];
  /** 所持している全カード（カードID） */
  ownedCards: string[];
}

/**
 * 素材インスタンス
 */
export interface IMaterialInstance {
  /** 素材マスターID */
  materialId: string;
  /** 品質 */
  quality: Quality;
  /** 所持数 */
  quantity: number;
}

/**
 * 属性値
 */
export interface IAttributeValue {
  /** 属性 */
  attribute: Attribute;
  /** 値 */
  value: number;
}

/**
 * 効果値
 */
export interface IEffectValue {
  /** 効果タイプ */
  type: ItemEffectType;
  /** 値 */
  value: number;
}

/**
 * 使用された素材の情報
 */
export interface IUsedMaterial {
  /** 素材ID */
  materialId: string;
  /** 使用数 */
  quantity: number;
  /** 品質 */
  quality: Quality;
  /** レア素材かどうか */
  isRare: boolean;
}

/**
 * 調合済みアイテム
 */
export interface ICraftedItem {
  /** アイテムマスターID */
  itemId: string;
  /** 品質 */
  quality: Quality;
  /** 属性値リスト */
  attributeValues: IAttributeValue[];
  /** 効果値リスト */
  effectValues: IEffectValue[];
  /** 使用した素材情報 */
  usedMaterials: IUsedMaterial[];
}

/**
 * インベントリ状態
 */
export interface IInventoryState {
  /** 素材リスト */
  materials: IMaterialInstance[];
  /** 調合済みアイテムリスト */
  craftedItems: ICraftedItem[];
  /** 保管上限 */
  storageLimit: number;
}

/**
 * 依頼状態
 */
export interface IQuestState {
  /** 受注中の依頼 */
  activeQuests: IActiveQuest[];
  /** 今日の依頼者リスト（ID） */
  todayClients: string[];
  /** 同時受注上限 */
  questLimit: number;
}

/**
 * 受注中依頼
 */
export interface IActiveQuest {
  /** 依頼ID */
  questId: string;
  /** 残り日数 */
  remainingDays: number;
  /** 受注した日 */
  acceptedDay: number;
}

/**
 * セーブデータ全体
 */
export interface ISaveData {
  /** セーブデータバージョン */
  version: string;
  /** 最終保存日時（ISO8601） */
  lastSaved: string;
  /** ゲーム進行状態 */
  gameState: IGameState;
  /** デッキ状態 */
  deckState: IDeckState;
  /** インベントリ状態 */
  inventoryState: IInventoryState;
  /** 依頼状態 */
  questState: IQuestState;
  /** 所持アーティファクトID */
  artifacts: string[];
}
