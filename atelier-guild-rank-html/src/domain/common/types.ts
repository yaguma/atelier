/**
 * 共通列挙型定義
 * ゲーム全体で使用する列挙型
 */

/**
 * ゲームフェーズ
 * 1日の流れを4つのフェーズで管理
 */
export enum GamePhase {
  /** 依頼受注フェーズ */
  QUEST_ACCEPT = 'QUEST_ACCEPT',
  /** 採取フェーズ */
  GATHERING = 'GATHERING',
  /** 調合フェーズ */
  ALCHEMY = 'ALCHEMY',
  /** 納品フェーズ */
  DELIVERY = 'DELIVERY',
}

/**
 * ギルドランク
 * G（見習い）からS（伝説）までの8段階
 */
export enum GuildRank {
  G = 'G',
  F = 'F',
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
}

/**
 * カード種別
 * 3系統のカードシステム
 */
export enum CardType {
  /** 採取地カード */
  GATHERING = 'GATHERING',
  /** レシピカード */
  RECIPE = 'RECIPE',
  /** 強化カード */
  ENHANCEMENT = 'ENHANCEMENT',
}

/**
 * 品質ランク
 * 素材・アイテムの品質を表す
 */
export enum Quality {
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
}

/**
 * 属性
 * 素材・アイテムが持つ属性
 */
export enum Attribute {
  FIRE = 'FIRE',
  WATER = 'WATER',
  EARTH = 'EARTH',
  WIND = 'WIND',
  /** 草属性（薬草など） */
  GRASS = 'GRASS',
}

/**
 * 依頼タイプ
 * 8種類の依頼条件
 */
export enum QuestType {
  /** 具体的指定: 特定アイテムを指定 */
  SPECIFIC = 'SPECIFIC',
  /** カテゴリ: カテゴリで指定 */
  CATEGORY = 'CATEGORY',
  /** 品質条件: 品質値で指定 */
  QUALITY = 'QUALITY',
  /** 数量重視: 数量で指定 */
  QUANTITY = 'QUANTITY',
  /** 属性条件: 属性値で指定 */
  ATTRIBUTE = 'ATTRIBUTE',
  /** 効果ベース: 効果で指定 */
  EFFECT = 'EFFECT',
  /** 素材消費: 使用素材で指定 */
  MATERIAL = 'MATERIAL',
  /** 複合条件: 複数条件を組み合わせ */
  COMPOUND = 'COMPOUND',
}

/**
 * レアリティ
 * カード・アーティファクトのレア度
 */
export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

/**
 * 強化カードの対象行動
 */
export enum EnhancementTarget {
  /** 採取行動を強化 */
  GATHERING = 'GATHERING',
  /** 調合行動を強化 */
  ALCHEMY = 'ALCHEMY',
  /** 納品行動を強化 */
  DELIVERY = 'DELIVERY',
  /** 全行動を強化 */
  ALL = 'ALL',
}

/**
 * 効果タイプ
 * 強化カード・アーティファクトの効果種別
 */
export enum EffectType {
  /** 品質アップ */
  QUALITY_UP = 'QUALITY_UP',
  /** 素材節約 */
  MATERIAL_SAVE = 'MATERIAL_SAVE',
  /** 獲得素材+1 */
  GATHERING_BONUS = 'GATHERING_BONUS',
  /** レア素材確率アップ */
  RARE_CHANCE_UP = 'RARE_CHANCE_UP',
  /** 報酬金アップ */
  GOLD_BONUS = 'GOLD_BONUS',
  /** 貢献度アップ */
  CONTRIBUTION_BONUS = 'CONTRIBUTION_BONUS',
  /** 行動コスト軽減 */
  COST_REDUCTION = 'COST_REDUCTION',
  /** 素材保管上限アップ */
  STORAGE_EXPANSION = 'STORAGE_EXPANSION',
  /** 行動ポイント追加 */
  ACTION_POINT_BONUS = 'ACTION_POINT_BONUS',
  /** 調合コスト軽減 */
  ALCHEMY_COST_REDUCTION = 'ALCHEMY_COST_REDUCTION',
  /** 全効果アップ */
  ALL_BONUS = 'ALL_BONUS',
}

/**
 * アイテムカテゴリ
 * 調合品のカテゴリ分類
 */
export enum ItemCategory {
  /** 医療系（回復薬、解毒剤など） */
  MEDICINE = 'MEDICINE',
  /** 武具系（鋼の剣など） */
  WEAPON = 'WEAPON',
  /** 魔法系（魔法の杖など） */
  MAGIC = 'MAGIC',
  /** 冒険者向け（爆弾など） */
  ADVENTURE = 'ADVENTURE',
  /** 高級品 */
  LUXURY = 'LUXURY',
}

/**
 * アイテム効果タイプ
 * 調合品が持つ効果の種別
 */
export enum ItemEffectType {
  /** HP回復 */
  HP_RECOVERY = 'HP_RECOVERY',
  /** 攻撃力アップ */
  ATTACK_UP = 'ATTACK_UP',
  /** 防御力アップ */
  DEFENSE_UP = 'DEFENSE_UP',
  /** 解毒 */
  CURE_POISON = 'CURE_POISON',
  /** 爆発ダメージ */
  EXPLOSION = 'EXPLOSION',
}

/**
 * 特殊ルールタイプ
 * ランクごとの特殊ルール
 */
export enum SpecialRuleType {
  /** 同時受注上限制限 */
  QUEST_LIMIT = 'QUEST_LIMIT',
  /** 品質制限（貢献度半減） */
  QUALITY_PENALTY = 'QUALITY_PENALTY',
  /** 期限短縮 */
  DEADLINE_REDUCTION = 'DEADLINE_REDUCTION',
  /** 品質必須 */
  QUALITY_REQUIRED = 'QUALITY_REQUIRED',
}
