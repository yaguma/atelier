/**
 * アトリエ錬金術ゲーム TypeScriptインターフェース定義
 *
 * @version 1.0.0
 * @description ギルドランク制デッキ構築RPGのドメインモデル型定義
 * @see docs/spec/atelier-guild-rank-requirements.md
 */

// ============================================================================
// 列挙型定義
// ============================================================================

/**
 * ゲームフェーズ
 * 1日の流れを4つのフェーズで管理
 * 🔵 青信号: 要件定義書 Section 1.2 に詳細記載
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
 * 🔵 青信号: 要件定義書 Section 4.7 に詳細記載
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
 * 🔵 青信号: 要件定義書 Section 4.1 に詳細記載
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
 * 🔵 青信号: 要件定義書 Section 4.5 に詳細記載
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
 * 🔵 青信号: 要件定義書 Section 4.5 に詳細記載
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
 * 🔵 青信号: 要件定義書 Section 4.6, 4.12 に詳細記載
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
 * 依頼者タイプ
 * 5種類の依頼者
 * 🔵 青信号: 要件定義書 Section 4.11 に詳細記載
 */
export enum ClientType {
  /** 村人: 日常的な依頼 */
  VILLAGER = 'VILLAGER',
  /** 冒険者: 武器・爆弾系 */
  ADVENTURER = 'ADVENTURER',
  /** 商人: 品質重視 */
  MERCHANT = 'MERCHANT',
  /** 貴族: 高品質・レア品 */
  NOBLE = 'NOBLE',
  /** ギルド: 昇格試験用 */
  GUILD = 'GUILD',
}

/**
 * レアリティ
 * カード・アーティファクトのレア度
 * 🔵 青信号: 要件定義書 Section 4.10 に詳細記載
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
 * 🔵 青信号: 要件定義書 Section 4.4 に詳細記載
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
 * 🔵 青信号: 要件定義書 Section 4.4, 4.10 に詳細記載
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
 * 🔵 青信号: 要件定義書 Section 4.3, 4.12 に詳細記載
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
 * 🔵 青信号: 要件定義書 Section 4.12 に詳細記載
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
 * 🔵 青信号: 要件定義書 Section 4.7 に詳細記載
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

/**
 * 画面種別
 * ゲーム内の各画面
 * 🟡 黄信号: アーキテクチャ設計として妥当な推測
 */
export enum ScreenType {
  TITLE = 'TITLE',
  MAIN = 'MAIN',
  SHOP = 'SHOP',
  RANK_UP = 'RANK_UP',
  RESULT = 'RESULT',
}


/**
 * このファイルは interfaces.ts から分割されたのだ
 * @see interfaces/cards.ts
 * @see interfaces/materials.ts
 * @see interfaces/quests.ts
 * @see interfaces/game-state.ts
 */
