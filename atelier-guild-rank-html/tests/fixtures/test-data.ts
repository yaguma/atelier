/**
 * テスト用フィクスチャデータ
 * data-schema.md に基づいた包括的なテストデータを提供
 *
 * @see docs/design/atelier-guild-rank/data-schema.md
 */

import {
  GamePhase,
  GuildRank,
  CardType,
  Quality,
  Attribute,
  QuestType,
  Rarity,
  EnhancementTarget,
  EffectType,
  ItemCategory,
  ItemEffectType,
  SpecialRuleType,
} from '../../src/domain/common/types';

// =============================================================================
// 型定義（data-schema.mdに準拠）
// =============================================================================

/** セーブデータ全体 */
export interface TestSaveData {
  version: string;
  lastSaved: string;
  gameState: TestGameState;
  deckState: TestDeckState;
  inventoryState: TestInventoryState;
  questState: TestQuestState;
  artifacts: string[];
}

/** ゲーム進行状態 */
export interface TestGameState {
  currentRank: GuildRank;
  promotionGauge: number;
  requiredContribution: number;
  remainingDays: number;
  currentDay: number;
  currentPhase: GamePhase;
  gold: number;
  comboCount: number;
  actionPoints: number;
  isPromotionTest: boolean;
  promotionTestRemainingDays: number | null;
}

/** デッキ状態 */
export interface TestDeckState {
  deck: string[];
  hand: string[];
  discard: string[];
  ownedCards: string[];
}

/** インベントリ状態 */
export interface TestInventoryState {
  materials: TestMaterialInstance[];
  craftedItems: TestCraftedItem[];
  storageLimit: number;
}

/** 素材インスタンス */
export interface TestMaterialInstance {
  materialId: string;
  quality: Quality;
  quantity: number;
}

/** 調合済みアイテム */
export interface TestCraftedItem {
  itemId: string;
  quality: Quality;
  attributeValues: { attribute: Attribute; value: number }[];
  effectValues: { type: ItemEffectType; value: number }[];
  usedMaterials: TestUsedMaterial[];
}

/** 使用素材情報 */
export interface TestUsedMaterial {
  materialId: string;
  quantity: number;
  quality: Quality;
  isRare: boolean;
}

/** 依頼状態 */
export interface TestQuestState {
  activeQuests: TestActiveQuest[];
  todayClients: string[];
  todayQuests: TestQuest[];
  questLimit: number;
}

/** 受注中依頼 */
export interface TestActiveQuest {
  quest: TestQuest;
  remainingDays: number;
  acceptedDay: number;
}

/** 依頼データ */
export interface TestQuest {
  id: string;
  clientId: string;
  condition: TestQuestCondition;
  contribution: number;
  gold: number;
  deadline: number;
  difficulty: 'easy' | 'normal' | 'hard';
  flavorText: string;
}

/** 依頼条件 */
export interface TestQuestCondition {
  type: QuestType;
  category?: ItemCategory;
  itemId?: string;
  minQuality?: Quality;
  quantity?: number;
  attribute?: Attribute;
  attributeValue?: number;
}

// =============================================================================
// 採取地カード（gathering_cards.json）
// =============================================================================

export interface TestGatheringCard {
  id: string;
  name: string;
  type: CardType.GATHERING;
  baseCost: number;
  presentationCount: number;
  rareRate: number;
  materialPool: string[];
  rarity: Rarity;
  unlockRank: GuildRank;
  description: string;
}

export const testGatheringCards: TestGatheringCard[] = [
  {
    id: 'gathering_backyard',
    name: '裏庭',
    type: CardType.GATHERING,
    baseCost: 0,
    presentationCount: 2,
    rareRate: 0,
    materialPool: ['weed', 'water'],
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: 'いつでも使える、低品質',
  },
  {
    id: 'gathering_nearby_forest',
    name: '近くの森',
    type: CardType.GATHERING,
    baseCost: 0,
    presentationCount: 3,
    rareRate: 10,
    materialPool: ['herb', 'mushroom', 'wood', 'pure_water'],
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: '基本素材、安定',
  },
  {
    id: 'gathering_riverside',
    name: '川辺',
    type: CardType.GATHERING,
    baseCost: 0,
    presentationCount: 3,
    rareRate: 10,
    materialPool: ['fish', 'water_grass', 'sand', 'pure_water'],
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.F,
    description: '水属性特化',
  },
  {
    id: 'gathering_mountain_rocks',
    name: '山麓の岩場',
    type: CardType.GATHERING,
    baseCost: 1,
    presentationCount: 4,
    rareRate: 15,
    materialPool: ['ore', 'stone', 'rare_ore'],
    rarity: Rarity.UNCOMMON,
    unlockRank: GuildRank.E,
    description: '火・土属性',
  },
  {
    id: 'gathering_deep_cave',
    name: '奥地の洞窟',
    type: CardType.GATHERING,
    baseCost: 1,
    presentationCount: 4,
    rareRate: 20,
    materialPool: ['rare_moss', 'ore', 'magic_material'],
    rarity: Rarity.UNCOMMON,
    unlockRank: GuildRank.D,
    description: 'レア素材多め',
  },
  {
    id: 'gathering_volcano',
    name: '火山地帯',
    type: CardType.GATHERING,
    baseCost: 2,
    presentationCount: 5,
    rareRate: 25,
    materialPool: ['volcanic_stone', 'ash', 'lava_crystal'],
    rarity: Rarity.RARE,
    unlockRank: GuildRank.C,
    description: '火属性特化、高品質',
  },
  {
    id: 'gathering_ancient_ruins',
    name: '古代遺跡',
    type: CardType.GATHERING,
    baseCost: 2,
    presentationCount: 5,
    rareRate: 30,
    materialPool: ['magic_material', 'ancient_fragment'],
    rarity: Rarity.RARE,
    unlockRank: GuildRank.B,
    description: '特殊素材、最高品質',
  },
];

// =============================================================================
// レシピカード（recipe_cards.json）
// =============================================================================

export interface TestRecipeCard {
  id: string;
  name: string;
  type: CardType.RECIPE;
  cost: number;
  requiredMaterials: { materialId: string; quantity: number; minQuality?: Quality }[];
  outputItemId: string;
  category: ItemCategory;
  rarity: Rarity;
  unlockRank: GuildRank;
  description: string;
}

export const testRecipeCards: TestRecipeCard[] = [
  {
    id: 'recipe_healing_potion',
    name: '回復薬',
    type: CardType.RECIPE,
    cost: 1,
    requiredMaterials: [
      { materialId: 'herb', quantity: 2 },
      { materialId: 'pure_water', quantity: 1 },
    ],
    outputItemId: 'healing_potion',
    category: ItemCategory.MEDICINE,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: '医療系の基本',
  },
  {
    id: 'recipe_antidote',
    name: '解毒剤',
    type: CardType.RECIPE,
    cost: 1,
    requiredMaterials: [
      { materialId: 'poison_mushroom', quantity: 1 },
      { materialId: 'pure_water', quantity: 2 },
    ],
    outputItemId: 'antidote',
    category: ItemCategory.MEDICINE,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.F,
    description: '医療系',
  },
  {
    id: 'recipe_nutrition',
    name: '栄養剤',
    type: CardType.RECIPE,
    cost: 1,
    requiredMaterials: [
      { materialId: 'herb', quantity: 1 },
      { materialId: 'fish', quantity: 1 },
      { materialId: 'water', quantity: 1 },
    ],
    outputItemId: 'nutrition',
    category: ItemCategory.MEDICINE,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: '医療系',
  },
  {
    id: 'recipe_bomb',
    name: '爆弾',
    type: CardType.RECIPE,
    cost: 2,
    requiredMaterials: [
      { materialId: 'volcanic_stone', quantity: 1 },
      { materialId: 'sulfur', quantity: 1 },
      { materialId: 'oil', quantity: 1 },
    ],
    outputItemId: 'bomb',
    category: ItemCategory.ADVENTURE,
    rarity: Rarity.UNCOMMON,
    unlockRank: GuildRank.E,
    description: '冒険者向け',
  },
  {
    id: 'recipe_steel_sword',
    name: '鋼の剣',
    type: CardType.RECIPE,
    cost: 2,
    requiredMaterials: [
      { materialId: 'ore', quantity: 3 },
      { materialId: 'wood', quantity: 1 },
    ],
    outputItemId: 'steel_sword',
    category: ItemCategory.WEAPON,
    rarity: Rarity.UNCOMMON,
    unlockRank: GuildRank.E,
    description: '武具系',
  },
  {
    id: 'recipe_magic_staff',
    name: '魔法の杖',
    type: CardType.RECIPE,
    cost: 2,
    requiredMaterials: [
      { materialId: 'magic_material', quantity: 2 },
      { materialId: 'wood', quantity: 1 },
    ],
    outputItemId: 'magic_staff',
    category: ItemCategory.MAGIC,
    rarity: Rarity.RARE,
    unlockRank: GuildRank.C,
    description: '魔法系',
  },
  {
    id: 'recipe_panacea',
    name: '万能薬',
    type: CardType.RECIPE,
    cost: 3,
    requiredMaterials: [
      { materialId: 'alpine_herb', quantity: 2 },
      { materialId: 'holy_water', quantity: 1 },
      { materialId: 'moon_drop', quantity: 1 },
    ],
    outputItemId: 'panacea',
    category: ItemCategory.MEDICINE,
    rarity: Rarity.RARE,
    unlockRank: GuildRank.B,
    description: '高級医療系',
  },
];

// =============================================================================
// 強化カード（enhancement_cards.json）
// =============================================================================

export interface TestEnhancementCard {
  id: string;
  name: string;
  type: CardType.ENHANCEMENT;
  cost: number;
  effect: { type: EffectType; value: number };
  targetAction: EnhancementTarget;
  rarity: Rarity;
  unlockRank: GuildRank;
  description: string;
}

export const testEnhancementCards: TestEnhancementCard[] = [
  {
    id: 'enhance_sage_catalyst',
    name: '賢者の触媒',
    type: CardType.ENHANCEMENT,
    cost: 0,
    effect: { type: EffectType.QUALITY_UP, value: 1 },
    targetAction: EnhancementTarget.ALCHEMY,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: '調合品質+1ランク',
  },
  {
    id: 'enhance_alchemy_ash',
    name: '錬金の灰',
    type: CardType.ENHANCEMENT,
    cost: 0,
    effect: { type: EffectType.MATERIAL_SAVE, value: 1 },
    targetAction: EnhancementTarget.ALCHEMY,
    rarity: Rarity.UNCOMMON,
    unlockRank: GuildRank.E,
    description: '素材を1つ節約',
  },
  {
    id: 'enhance_spirit_guide',
    name: '精霊の導き',
    type: CardType.ENHANCEMENT,
    cost: 0,
    effect: { type: EffectType.GATHERING_BONUS, value: 1 },
    targetAction: EnhancementTarget.GATHERING,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: '提示回数+1回',
  },
  {
    id: 'enhance_lucky_charm',
    name: '幸運のお守り',
    type: CardType.ENHANCEMENT,
    cost: 0,
    effect: { type: EffectType.RARE_CHANCE_UP, value: 30 },
    targetAction: EnhancementTarget.GATHERING,
    rarity: Rarity.UNCOMMON,
    unlockRank: GuildRank.E,
    description: 'レア素材確率+30%',
  },
  {
    id: 'enhance_negotiation',
    name: '交渉術の書',
    type: CardType.ENHANCEMENT,
    cost: 0,
    effect: { type: EffectType.GOLD_BONUS, value: 50 },
    targetAction: EnhancementTarget.DELIVERY,
    rarity: Rarity.UNCOMMON,
    unlockRank: GuildRank.D,
    description: '報酬金+50%',
  },
  {
    id: 'enhance_guild_letter',
    name: 'ギルド推薦状',
    type: CardType.ENHANCEMENT,
    cost: 0,
    effect: { type: EffectType.CONTRIBUTION_BONUS, value: 30 },
    targetAction: EnhancementTarget.DELIVERY,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    description: '貢献度+30%',
  },
  {
    id: 'enhance_meditation',
    name: '集中の瞑想',
    type: CardType.ENHANCEMENT,
    cost: 0,
    effect: { type: EffectType.COST_REDUCTION, value: 1 },
    targetAction: EnhancementTarget.ALL,
    rarity: Rarity.RARE,
    unlockRank: GuildRank.C,
    description: '次の行動コスト-1',
  },
];

// =============================================================================
// 素材マスター（materials.json）
// =============================================================================

export interface TestMaterial {
  id: string;
  name: string;
  baseQuality: Quality;
  attributes: Attribute[];
  description: string;
}

export const testMaterials: TestMaterial[] = [
  {
    id: 'weed',
    name: '雑草',
    baseQuality: Quality.D,
    attributes: [Attribute.GRASS],
    description: 'どこにでもある草',
  },
  {
    id: 'water',
    name: '水',
    baseQuality: Quality.D,
    attributes: [Attribute.WATER],
    description: '普通の水',
  },
  {
    id: 'herb',
    name: '薬草',
    baseQuality: Quality.C,
    attributes: [Attribute.GRASS, Attribute.WATER],
    description: '薬の基本素材',
  },
  {
    id: 'pure_water',
    name: '清水',
    baseQuality: Quality.C,
    attributes: [Attribute.WATER],
    description: '澄んだ水',
  },
  {
    id: 'mushroom',
    name: 'キノコ',
    baseQuality: Quality.C,
    attributes: [Attribute.EARTH],
    description: '食用キノコ',
  },
  {
    id: 'poison_mushroom',
    name: '毒キノコ',
    baseQuality: Quality.C,
    attributes: [Attribute.EARTH],
    description: '毒を持つキノコ',
  },
  {
    id: 'fish',
    name: '魚',
    baseQuality: Quality.C,
    attributes: [Attribute.WATER],
    description: '川で獲れる魚',
  },
  {
    id: 'water_grass',
    name: '水草',
    baseQuality: Quality.C,
    attributes: [Attribute.WATER, Attribute.GRASS],
    description: '水辺に生える草',
  },
  {
    id: 'sand',
    name: '砂',
    baseQuality: Quality.D,
    attributes: [Attribute.EARTH],
    description: '川辺の砂',
  },
  {
    id: 'ore',
    name: '鉱石',
    baseQuality: Quality.C,
    attributes: [Attribute.FIRE, Attribute.EARTH],
    description: '金属の原石',
  },
  {
    id: 'stone',
    name: '石',
    baseQuality: Quality.D,
    attributes: [Attribute.EARTH],
    description: '普通の石',
  },
  {
    id: 'rare_ore',
    name: 'レア鉱石',
    baseQuality: Quality.B,
    attributes: [Attribute.FIRE, Attribute.EARTH],
    description: '希少な鉱石',
  },
  {
    id: 'wood',
    name: '木材',
    baseQuality: Quality.C,
    attributes: [Attribute.EARTH],
    description: '加工された木',
  },
  {
    id: 'volcanic_stone',
    name: '火山石',
    baseQuality: Quality.A,
    attributes: [Attribute.FIRE],
    description: '火山で採れる石',
  },
  {
    id: 'magic_material',
    name: '魔法素材',
    baseQuality: Quality.S,
    attributes: [Attribute.FIRE, Attribute.WATER, Attribute.EARTH, Attribute.WIND],
    description: '全属性を持つ素材',
  },
  {
    id: 'sulfur',
    name: '硫黄',
    baseQuality: Quality.C,
    attributes: [Attribute.FIRE],
    description: '火山由来の硫黄',
  },
  {
    id: 'oil',
    name: '油',
    baseQuality: Quality.C,
    attributes: [Attribute.FIRE],
    description: '可燃性の油',
  },
  {
    id: 'alpine_herb',
    name: '高山薬草',
    baseQuality: Quality.A,
    attributes: [Attribute.GRASS, Attribute.WATER],
    description: '高山に生える貴重な薬草',
  },
  {
    id: 'holy_water',
    name: '聖水',
    baseQuality: Quality.A,
    attributes: [Attribute.WATER],
    description: '清められた水',
  },
  {
    id: 'moon_drop',
    name: '月の雫',
    baseQuality: Quality.S,
    attributes: [Attribute.WATER],
    description: '月光を集めた雫',
  },
];

// =============================================================================
// アイテムマスター（items.json）
// =============================================================================

export interface TestItem {
  id: string;
  name: string;
  category: ItemCategory;
  effects: { type: ItemEffectType; baseValue: number }[];
  description: string;
}

export const testItems: TestItem[] = [
  {
    id: 'healing_potion',
    name: '回復薬',
    category: ItemCategory.MEDICINE,
    effects: [{ type: ItemEffectType.HP_RECOVERY, baseValue: 30 }],
    description: 'HPを回復する薬',
  },
  {
    id: 'antidote',
    name: '解毒剤',
    category: ItemCategory.MEDICINE,
    effects: [{ type: ItemEffectType.CURE_POISON, baseValue: 1 }],
    description: '毒を治療する薬',
  },
  {
    id: 'nutrition',
    name: '栄養剤',
    category: ItemCategory.MEDICINE,
    effects: [{ type: ItemEffectType.HP_RECOVERY, baseValue: 20 }],
    description: '栄養を補給する',
  },
  {
    id: 'bomb',
    name: '爆弾',
    category: ItemCategory.ADVENTURE,
    effects: [{ type: ItemEffectType.EXPLOSION, baseValue: 50 }],
    description: '爆発して敵にダメージ',
  },
  {
    id: 'steel_sword',
    name: '鋼の剣',
    category: ItemCategory.WEAPON,
    effects: [{ type: ItemEffectType.ATTACK_UP, baseValue: 10 }],
    description: '攻撃力を上げる剣',
  },
  {
    id: 'magic_staff',
    name: '魔法の杖',
    category: ItemCategory.MAGIC,
    effects: [{ type: ItemEffectType.ATTACK_UP, baseValue: 15 }],
    description: '魔法攻撃力を上げる杖',
  },
  {
    id: 'panacea',
    name: '万能薬',
    category: ItemCategory.MEDICINE,
    effects: [
      { type: ItemEffectType.HP_RECOVERY, baseValue: 100 },
      { type: ItemEffectType.CURE_POISON, baseValue: 1 },
    ],
    description: 'あらゆる状態を回復する',
  },
];

// =============================================================================
// ギルドランクマスター（guild_ranks.json）
// =============================================================================

export interface TestGuildRank {
  id: GuildRank;
  name: string;
  requiredContribution: number;
  dayLimit: number;
  specialRules: { type: SpecialRuleType; value?: number; condition?: string; description: string }[];
  promotionTest: {
    requirements: { itemId: string; quantity: number; minQuality?: Quality }[];
    dayLimit: number;
  } | null;
  unlockedGatheringCards: string[];
  unlockedRecipeCards: string[];
}

export const testGuildRanks: TestGuildRank[] = [
  {
    id: GuildRank.G,
    name: '見習い',
    requiredContribution: 100,
    dayLimit: 30,
    specialRules: [],
    promotionTest: {
      requirements: [{ itemId: 'healing_potion', quantity: 2 }],
      dayLimit: 5,
    },
    unlockedGatheringCards: ['gathering_backyard', 'gathering_nearby_forest'],
    unlockedRecipeCards: ['recipe_healing_potion', 'recipe_nutrition'],
  },
  {
    id: GuildRank.F,
    name: '新人',
    requiredContribution: 200,
    dayLimit: 30,
    specialRules: [
      { type: SpecialRuleType.QUEST_LIMIT, value: 2, description: '同時受注2件まで' },
    ],
    promotionTest: {
      requirements: [
        { itemId: 'healing_potion', quantity: 3, minQuality: Quality.B },
        { itemId: 'antidote', quantity: 2 },
      ],
      dayLimit: 5,
    },
    unlockedGatheringCards: ['gathering_riverside'],
    unlockedRecipeCards: ['recipe_antidote'],
  },
  {
    id: GuildRank.E,
    name: '一人前',
    requiredContribution: 350,
    dayLimit: 35,
    specialRules: [
      { type: SpecialRuleType.QUALITY_PENALTY, condition: 'D', description: '品質D以下は貢献度半減' },
    ],
    promotionTest: {
      requirements: [
        { itemId: 'bomb', quantity: 2 },
        { itemId: 'steel_sword', quantity: 1 },
      ],
      dayLimit: 4,
    },
    unlockedGatheringCards: ['gathering_mountain_rocks'],
    unlockedRecipeCards: ['recipe_bomb', 'recipe_steel_sword'],
  },
  {
    id: GuildRank.D,
    name: '中堅',
    requiredContribution: 500,
    dayLimit: 35,
    specialRules: [
      { type: SpecialRuleType.DEADLINE_REDUCTION, value: 1, description: '全依頼の期限-1日' },
    ],
    promotionTest: {
      requirements: [
        { itemId: 'healing_potion', quantity: 1, minQuality: Quality.A },
        { itemId: 'bomb', quantity: 1, minQuality: Quality.B },
        { itemId: 'steel_sword', quantity: 1, minQuality: Quality.B },
      ],
      dayLimit: 4,
    },
    unlockedGatheringCards: ['gathering_deep_cave'],
    unlockedRecipeCards: [],
  },
  {
    id: GuildRank.C,
    name: '熟練',
    requiredContribution: 700,
    dayLimit: 35,
    specialRules: [
      { type: SpecialRuleType.QUALITY_REQUIRED, condition: 'C', description: '品質C以上でないと受理されない' },
    ],
    promotionTest: {
      requirements: [{ itemId: 'healing_potion', quantity: 5, minQuality: Quality.B }],
      dayLimit: 3,
    },
    unlockedGatheringCards: ['gathering_volcano'],
    unlockedRecipeCards: ['recipe_magic_staff'],
  },
  {
    id: GuildRank.B,
    name: '上級',
    requiredContribution: 1000,
    dayLimit: 35,
    specialRules: [
      { type: SpecialRuleType.QUALITY_REQUIRED, condition: 'B', description: '品質B以上必須' },
      { type: SpecialRuleType.DEADLINE_REDUCTION, value: 1, description: '期限-1日' },
    ],
    promotionTest: {
      requirements: [
        { itemId: 'panacea', quantity: 1 },
        { itemId: 'magic_staff', quantity: 1, minQuality: Quality.A },
        { itemId: 'bomb', quantity: 2, minQuality: Quality.A },
      ],
      dayLimit: 3,
    },
    unlockedGatheringCards: ['gathering_ancient_ruins'],
    unlockedRecipeCards: ['recipe_panacea'],
  },
  {
    id: GuildRank.A,
    name: '最上級',
    requiredContribution: 1500,
    dayLimit: 35,
    specialRules: [
      { type: SpecialRuleType.QUALITY_REQUIRED, condition: 'A', description: '品質A以上必須' },
      { type: SpecialRuleType.DEADLINE_REDUCTION, value: 2, description: '期限-2日' },
    ],
    promotionTest: {
      requirements: [{ itemId: 'legendary_item', quantity: 1, minQuality: Quality.S }],
      dayLimit: 0,
    },
    unlockedGatheringCards: [],
    unlockedRecipeCards: [],
  },
  {
    id: GuildRank.S,
    name: '伝説',
    requiredContribution: 0,
    dayLimit: 0,
    specialRules: [],
    promotionTest: null,
    unlockedGatheringCards: [],
    unlockedRecipeCards: [],
  },
];

// =============================================================================
// 依頼者マスター（clients.json）
// =============================================================================

export interface TestClient {
  id: string;
  name: string;
  type: 'VILLAGER' | 'ADVENTURER' | 'MERCHANT' | 'NOBLE' | 'GUILD';
  contributionMultiplier: number;
  goldMultiplier: number;
  deadlineModifier: number;
  preferredQuestTypes: QuestType[];
  unlockRank: GuildRank;
  dialoguePatterns: string[];
}

export const testClients: TestClient[] = [
  {
    id: 'villager',
    name: '村人',
    type: 'VILLAGER',
    contributionMultiplier: 0.8,
    goldMultiplier: 0.8,
    deadlineModifier: 1,
    preferredQuestTypes: [QuestType.CATEGORY, QuestType.QUANTITY],
    unlockRank: GuildRank.G,
    dialoguePatterns: ['何か薬が欲しいんだ', '薬を{quantity}個欲しいんだ', '{item}が欲しいんだけど...'],
  },
  {
    id: 'adventurer',
    name: '冒険者',
    type: 'ADVENTURER',
    contributionMultiplier: 1.0,
    goldMultiplier: 1.0,
    deadlineModifier: 0,
    preferredQuestTypes: [QuestType.ATTRIBUTE, QuestType.EFFECT],
    unlockRank: GuildRank.G,
    dialoguePatterns: ['{item}が欲しい！', '火属性{value}以上の武器を頼む', 'HP{value}回復できるものをくれ'],
  },
  {
    id: 'merchant',
    name: '商人',
    type: 'MERCHANT',
    contributionMultiplier: 1.2,
    goldMultiplier: 1.5,
    deadlineModifier: -1,
    preferredQuestTypes: [QuestType.QUALITY, QuestType.COMPOUND],
    unlockRank: GuildRank.E,
    dialoguePatterns: ['品質{quality}以上のアイテムを', '高品質な{category}を探している', 'いい品を頼むよ'],
  },
  {
    id: 'noble',
    name: '貴族',
    type: 'NOBLE',
    contributionMultiplier: 1.5,
    goldMultiplier: 2.0,
    deadlineModifier: -2,
    preferredQuestTypes: [QuestType.COMPOUND, QuestType.MATERIAL],
    unlockRank: GuildRank.C,
    dialoguePatterns: ['最高品質のものを用意せよ', 'レア素材を使った逸品を'],
  },
  {
    id: 'guild',
    name: 'ギルド',
    type: 'GUILD',
    contributionMultiplier: 1.3,
    goldMultiplier: 1.0,
    deadlineModifier: 0,
    preferredQuestTypes: [QuestType.SPECIFIC],
    unlockRank: GuildRank.G,
    dialoguePatterns: ['昇格試験の課題だ', '{item}を{quantity}個納品せよ'],
  },
];

// =============================================================================
// アーティファクトマスター（artifacts.json）
// =============================================================================

export interface TestArtifact {
  id: string;
  name: string;
  effect: { type: EffectType; value: number };
  rarity: Rarity;
  description: string;
}

export const testArtifacts: TestArtifact[] = [
  {
    id: 'artifact_alchemist_glasses',
    name: '錬金術師の眼鏡',
    effect: { type: EffectType.QUALITY_UP, value: 1 },
    rarity: Rarity.COMMON,
    description: '調合品質+1',
  },
  {
    id: 'artifact_storage_bag',
    name: '採取袋の拡張',
    effect: { type: EffectType.STORAGE_EXPANSION, value: 5 },
    rarity: Rarity.COMMON,
    description: '素材保管+5枠',
  },
  {
    id: 'artifact_merchant_ring',
    name: '商人の指輪',
    effect: { type: EffectType.GOLD_BONUS, value: 20 },
    rarity: Rarity.COMMON,
    description: '報酬金+20%',
  },
  {
    id: 'artifact_four_leaf',
    name: '幸運の四つ葉',
    effect: { type: EffectType.RARE_CHANCE_UP, value: 15 },
    rarity: Rarity.COMMON,
    description: 'レア素材確率+15%',
  },
  {
    id: 'artifact_hourglass',
    name: '時の砂時計',
    effect: { type: EffectType.ACTION_POINT_BONUS, value: 1 },
    rarity: Rarity.RARE,
    description: '行動ポイント+1/日',
  },
  {
    id: 'artifact_fake_stone',
    name: '賢者の石（偽）',
    effect: { type: EffectType.QUALITY_UP, value: 1 },
    rarity: Rarity.RARE,
    description: '全調合品質+1',
  },
  {
    id: 'artifact_guildmaster_seal',
    name: 'ギルドマスターの印',
    effect: { type: EffectType.CONTRIBUTION_BONUS, value: 20 },
    rarity: Rarity.RARE,
    description: '貢献度+20%',
  },
  {
    id: 'artifact_legendary_cauldron',
    name: '伝説の釜',
    effect: { type: EffectType.ALCHEMY_COST_REDUCTION, value: 1 },
    rarity: Rarity.EPIC,
    description: '調合コスト-1',
  },
  {
    id: 'artifact_ancient_map',
    name: '古代の地図',
    effect: { type: EffectType.GATHERING_BONUS, value: 1 },
    rarity: Rarity.EPIC,
    description: '採取の提示回数+1',
  },
  {
    id: 'artifact_alchemy_crown',
    name: '錬金王の冠',
    effect: { type: EffectType.ALL_BONUS, value: 10 },
    rarity: Rarity.LEGENDARY,
    description: '全効果+10%',
  },
];

// =============================================================================
// 初期デッキ構成（15枚）
// =============================================================================

export const testInitialDeck: string[] = [
  // 採取地カード（7枚）
  'gathering_backyard',
  'gathering_backyard',
  'gathering_nearby_forest',
  'gathering_nearby_forest',
  'gathering_nearby_forest',
  'gathering_riverside',
  'gathering_riverside',
  // レシピカード（5枚）
  'recipe_healing_potion',
  'recipe_healing_potion',
  'recipe_nutrition',
  'recipe_nutrition',
  'recipe_antidote',
  // 強化カード（3枚）
  'enhance_sage_catalyst',
  'enhance_spirit_guide',
  'enhance_guild_letter',
];

// =============================================================================
// サンプルセーブデータ
// =============================================================================

export const testSaveDataInitial: TestSaveData = {
  version: '1.0.0',
  lastSaved: '2026-01-01T12:00:00.000Z',
  gameState: {
    currentRank: GuildRank.G,
    promotionGauge: 0,
    requiredContribution: 100,
    remainingDays: 30,
    currentDay: 1,
    currentPhase: GamePhase.QUEST_ACCEPT,
    gold: 100,
    comboCount: 0,
    actionPoints: 3,
    isPromotionTest: false,
    promotionTestRemainingDays: null,
  },
  deckState: {
    deck: testInitialDeck,
    hand: [],
    discard: [],
    ownedCards: testInitialDeck,
  },
  inventoryState: {
    materials: [],
    craftedItems: [],
    storageLimit: 20,
  },
  questState: {
    activeQuests: [],
    todayClients: ['villager', 'adventurer'],
    todayQuests: [],
    questLimit: 3,
  },
  artifacts: [],
};

export const testSaveDataMidGame: TestSaveData = {
  version: '1.0.0',
  lastSaved: '2026-01-03T15:30:00.000Z',
  gameState: {
    currentRank: GuildRank.G,
    promotionGauge: 35,
    requiredContribution: 100,
    remainingDays: 28,
    currentDay: 3,
    currentPhase: GamePhase.GATHERING,
    gold: 150,
    comboCount: 2,
    actionPoints: 2,
    isPromotionTest: false,
    promotionTestRemainingDays: null,
  },
  deckState: {
    deck: ['gathering_nearby_forest', 'recipe_healing_potion', 'enhance_sage_catalyst'],
    hand: ['gathering_backyard', 'recipe_nutrition', 'enhance_spirit_guide', 'enhance_guild_letter'],
    discard: ['gathering_riverside'],
    ownedCards: testInitialDeck,
  },
  inventoryState: {
    materials: [
      { materialId: 'herb', quality: Quality.C, quantity: 5 },
      { materialId: 'pure_water', quality: Quality.C, quantity: 3 },
    ],
    craftedItems: [
      {
        itemId: 'healing_potion',
        quality: Quality.B,
        attributeValues: [{ attribute: Attribute.WATER, value: 8 }],
        effectValues: [{ type: ItemEffectType.HP_RECOVERY, value: 45 }],
        usedMaterials: [
          { materialId: 'herb', quantity: 2, quality: Quality.C, isRare: false },
          { materialId: 'pure_water', quantity: 1, quality: Quality.B, isRare: false },
        ],
      },
    ],
    storageLimit: 20,
  },
  questState: {
    activeQuests: [
      {
        quest: {
          id: 'quest_001',
          clientId: 'villager',
          condition: { type: QuestType.CATEGORY, category: ItemCategory.MEDICINE },
          contribution: 12,
          gold: 24,
          deadline: 5,
          difficulty: 'easy',
          flavorText: '何か薬が欲しいんだ',
        },
        remainingDays: 4,
        acceptedDay: 2,
      },
    ],
    todayClients: ['villager', 'adventurer'],
    todayQuests: [],
    questLimit: 3,
  },
  artifacts: [],
};

export const testSaveDataPromotionTest: TestSaveData = {
  version: '1.0.0',
  lastSaved: '2026-01-10T18:00:00.000Z',
  gameState: {
    currentRank: GuildRank.G,
    promotionGauge: 100,
    requiredContribution: 100,
    remainingDays: 20,
    currentDay: 10,
    currentPhase: GamePhase.QUEST_ACCEPT,
    gold: 250,
    comboCount: 5,
    actionPoints: 3,
    isPromotionTest: true,
    promotionTestRemainingDays: 5,
  },
  deckState: {
    deck: testInitialDeck,
    hand: [],
    discard: [],
    ownedCards: testInitialDeck,
  },
  inventoryState: {
    materials: [
      { materialId: 'herb', quality: Quality.B, quantity: 10 },
      { materialId: 'pure_water', quality: Quality.B, quantity: 8 },
    ],
    craftedItems: [
      {
        itemId: 'healing_potion',
        quality: Quality.B,
        attributeValues: [{ attribute: Attribute.WATER, value: 10 }],
        effectValues: [{ type: ItemEffectType.HP_RECOVERY, value: 50 }],
        usedMaterials: [
          { materialId: 'herb', quantity: 2, quality: Quality.B, isRare: false },
          { materialId: 'pure_water', quantity: 1, quality: Quality.B, isRare: false },
        ],
      },
    ],
    storageLimit: 20,
  },
  questState: {
    activeQuests: [],
    todayClients: ['guild'],
    todayQuests: [],
    questLimit: 3,
  },
  artifacts: ['artifact_alchemist_glasses'],
};

// =============================================================================
// ファクトリ関数（テストデータ生成用）
// =============================================================================

/**
 * 素材インスタンスを生成
 */
export function createTestMaterialInstance(
  overrides: Partial<TestMaterialInstance> = {}
): TestMaterialInstance {
  return {
    materialId: 'herb',
    quality: Quality.C,
    quantity: 1,
    ...overrides,
  };
}

/**
 * 調合済みアイテムを生成
 */
export function createTestCraftedItem(
  overrides: Partial<TestCraftedItem> = {}
): TestCraftedItem {
  return {
    itemId: 'healing_potion',
    quality: Quality.C,
    attributeValues: [{ attribute: Attribute.WATER, value: 5 }],
    effectValues: [{ type: ItemEffectType.HP_RECOVERY, value: 30 }],
    usedMaterials: [
      { materialId: 'herb', quantity: 2, quality: Quality.C, isRare: false },
      { materialId: 'pure_water', quantity: 1, quality: Quality.C, isRare: false },
    ],
    ...overrides,
  };
}

/**
 * 依頼を生成
 */
export function createTestQuest(overrides: Partial<TestQuest> = {}): TestQuest {
  return {
    id: `quest_${Date.now()}`,
    clientId: 'villager',
    condition: { type: QuestType.CATEGORY, category: ItemCategory.MEDICINE },
    contribution: 10,
    gold: 20,
    deadline: 5,
    difficulty: 'easy',
    flavorText: '何か薬が欲しいんだ',
    ...overrides,
  };
}

/**
 * ゲーム状態を生成
 */
export function createTestGameState(overrides: Partial<TestGameState> = {}): TestGameState {
  return {
    currentRank: GuildRank.G,
    promotionGauge: 0,
    requiredContribution: 100,
    remainingDays: 30,
    currentDay: 1,
    currentPhase: GamePhase.QUEST_ACCEPT,
    gold: 100,
    comboCount: 0,
    actionPoints: 3,
    isPromotionTest: false,
    promotionTestRemainingDays: null,
    ...overrides,
  };
}

/**
 * セーブデータを生成
 */
export function createTestSaveData(overrides: Partial<TestSaveData> = {}): TestSaveData {
  return {
    ...testSaveDataInitial,
    ...overrides,
    lastSaved: new Date().toISOString(),
  };
}

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * IDから採取地カードを取得
 */
export function getGatheringCardById(id: string): TestGatheringCard | undefined {
  return testGatheringCards.find((card) => card.id === id);
}

/**
 * IDからレシピカードを取得
 */
export function getRecipeCardById(id: string): TestRecipeCard | undefined {
  return testRecipeCards.find((card) => card.id === id);
}

/**
 * IDから強化カードを取得
 */
export function getEnhancementCardById(id: string): TestEnhancementCard | undefined {
  return testEnhancementCards.find((card) => card.id === id);
}

/**
 * IDから素材を取得
 */
export function getMaterialById(id: string): TestMaterial | undefined {
  return testMaterials.find((mat) => mat.id === id);
}

/**
 * IDからアイテムを取得
 */
export function getItemById(id: string): TestItem | undefined {
  return testItems.find((item) => item.id === id);
}

/**
 * IDからギルドランクを取得
 */
export function getGuildRankById(id: GuildRank): TestGuildRank | undefined {
  return testGuildRanks.find((rank) => rank.id === id);
}

/**
 * IDから依頼者を取得
 */
export function getClientById(id: string): TestClient | undefined {
  return testClients.find((client) => client.id === id);
}

/**
 * IDからアーティファクトを取得
 */
export function getArtifactById(id: string): TestArtifact | undefined {
  return testArtifacts.find((artifact) => artifact.id === id);
}

/**
 * ランクで利用可能なカードを取得
 */
export function getCardsAvailableAtRank(rank: GuildRank): {
  gathering: TestGatheringCard[];
  recipe: TestRecipeCard[];
  enhancement: TestEnhancementCard[];
} {
  const rankOrder = [GuildRank.G, GuildRank.F, GuildRank.E, GuildRank.D, GuildRank.C, GuildRank.B, GuildRank.A, GuildRank.S];
  const rankIndex = rankOrder.indexOf(rank);

  return {
    gathering: testGatheringCards.filter(
      (card) => rankOrder.indexOf(card.unlockRank) <= rankIndex
    ),
    recipe: testRecipeCards.filter(
      (card) => rankOrder.indexOf(card.unlockRank) <= rankIndex
    ),
    enhancement: testEnhancementCards.filter(
      (card) => rankOrder.indexOf(card.unlockRank) <= rankIndex
    ),
  };
}
