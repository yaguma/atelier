# データスキーマ設計書

**バージョン**: 1.1.0
**作成日**: 2026-01-01
**対象**: アトリエ錬金術ゲーム（ギルドランク制）HTML版

---

## 概要

本ドキュメントは、ゲームで使用するデータ構造の詳細設計を定義する。

### データ分類

| 分類 | 説明 | 保存先 |
|------|------|--------|
| **セーブデータ** | プレイヤーの進行状況 | localStorage |
| **マスターデータ** | ゲームの定義データ | JSONファイル |

### 信頼性レベル凡例

- 🔵 **青信号**: 要件定義書に詳細記載
- 🟡 **黄信号**: 要件定義書から妥当な推測
- 🔴 **赤信号**: 要件定義書にない推測

---

## 1. セーブデータ構造

### 1.1 SaveData（セーブデータ全体）🔵

```json
{
  "version": "1.0.0",
  "lastSaved": "2026-01-01T12:00:00.000Z",
  "gameState": { ... },
  "deckState": { ... },
  "inventoryState": { ... },
  "questState": { ... },
  "artifacts": ["artifact_id_1", "artifact_id_2"]
}
```

| フィールド | 型 | 説明 | 必須 |
|-----------|-----|------|------|
| version | string | セーブデータバージョン | ○ |
| lastSaved | string (ISO8601) | 最終保存日時 | ○ |
| gameState | GameState | ゲーム進行状態 | ○ |
| deckState | DeckState | デッキ状態 | ○ |
| inventoryState | InventoryState | インベントリ状態 | ○ |
| questState | QuestState | 依頼状態 | ○ |
| artifacts | string[] | 所持アーティファクトID | ○ |

### 1.2 GameState（ゲーム進行状態）🔵

```json
{
  "currentRank": "G",
  "rankHp": 85,
  "remainingDays": 28,
  "currentDay": 3,
  "currentPhase": "GATHERING",
  "gold": 150,
  "comboCount": 2,
  "actionPoints": 2,
  "isPromotionTest": false,
  "promotionTestRemainingDays": null
}
```

| フィールド | 型 | 説明 | デフォルト値 |
|-----------|-----|------|-------------|
| currentRank | GuildRank | 現在のギルドランク | "G" |
| rankHp | number | 現在のランクHP | 100（ランクによる） |
| remainingDays | number | ランクの残り日数 | 30（ランクによる） |
| currentDay | number | 現在の日数（1始まり） | 1 |
| currentPhase | GamePhase | 現在のフェーズ | "QUEST_ACCEPT" |
| gold | number | 所持金 | 100 |
| comboCount | number | 連続依頼達成数 | 0 |
| actionPoints | number | 残り行動ポイント | 3 |
| isPromotionTest | boolean | 昇格試験中フラグ | false |
| promotionTestRemainingDays | number \| null | 昇格試験残り日数 | null |

### 1.3 DeckState（デッキ状態）🔵

```json
{
  "deck": ["gathering_nearby_forest", "recipe_healing_potion", ...],
  "hand": ["gathering_backyard", "enhance_sage_catalyst", ...],
  "discard": ["gathering_riverside"],
  "ownedCards": ["gathering_nearby_forest", "gathering_backyard", ...]
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| deck | string[] | 山札（カードID） |
| hand | string[] | 手札（カードID） |
| discard | string[] | 捨て札（カードID） |
| ownedCards | string[] | 所持している全カード（カードID） |

### 1.4 InventoryState（インベントリ状態）🔵

```json
{
  "materials": [
    { "materialId": "herb", "quality": "C", "quantity": 5 },
    { "materialId": "pure_water", "quality": "C", "quantity": 3 }
  ],
  "craftedItems": [
    {
      "itemId": "healing_potion",
      "quality": "B",
      "attributeValues": [{ "attribute": "WATER", "value": 8 }],
      "effectValues": [{ "type": "HP_RECOVERY", "value": 45 }],
      "usedMaterials": [
        { "materialId": "herb", "quantity": 2, "quality": "C", "isRare": false },
        { "materialId": "pure_water", "quantity": 1, "quality": "B", "isRare": false }
      ]
    }
  ],
  "storageLimit": 20
}
```

#### MaterialInstance（素材インスタンス）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| materialId | string | 素材マスターID |
| quality | Quality | 品質 |
| quantity | number | 所持数 |

#### CraftedItem（調合済みアイテム）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| itemId | string | アイテムマスターID |
| quality | Quality | 品質 |
| attributeValues | AttributeValue[] | 属性値 |
| effectValues | EffectValue[] | 効果値 |
| usedMaterials | UsedMaterial[] | 使用した素材情報 |

### 1.5 QuestState（依頼状態）🔵

```json
{
  "activeQuests": [
    {
      "quest": {
        "id": "quest_001",
        "clientId": "villager",
        "condition": { "type": "CATEGORY", "category": "MEDICINE" },
        "contribution": 12,
        "gold": 24,
        "deadline": 5,
        "difficulty": "easy",
        "flavorText": "何か薬が欲しいんだ"
      },
      "remainingDays": 4,
      "acceptedDay": 2
    }
  ],
  "todayClients": ["villager", "adventurer"],
  "todayQuests": [...],
  "questLimit": 3
}
```

#### ActiveQuest（受注中依頼）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| quest | Quest | 依頼データ |
| remainingDays | number | 残り日数 |
| acceptedDay | number | 受注した日 |

---

## 2. マスターデータ構造

### 2.1 ディレクトリ構成

```
data/
├── cards/
│   ├── gathering_cards.json    # 採取地カード
│   ├── recipe_cards.json       # レシピカード
│   └── enhancement_cards.json  # 強化カード
├── items/
│   ├── materials.json          # 素材マスター
│   └── items.json              # アイテムマスター
├── quests/
│   ├── clients.json            # 依頼者マスター
│   └── quest_templates.json    # 依頼テンプレート
├── ranks/
│   └── guild_ranks.json        # ギルドランクマスター
├── artifacts/
│   └── artifacts.json          # アーティファクトマスター
└── shop/
    └── shop_items.json         # ショップアイテム
```

### 2.2 採取地カード（gathering_cards.json）🔵

```json
[
  {
    "id": "gathering_backyard",
    "name": "裏庭",
    "type": "GATHERING",
    "baseCost": 0,
    "presentationCount": 2,
    "rareRate": 0,
    "materialPool": ["weed", "water"],
    "rarity": "COMMON",
    "unlockRank": "G",
    "description": "いつでも使える、低品質"
  },
  {
    "id": "gathering_nearby_forest",
    "name": "近くの森",
    "type": "GATHERING",
    "baseCost": 0,
    "presentationCount": 3,
    "rareRate": 10,
    "materialPool": ["herb", "mushroom", "wood", "pure_water"],
    "rarity": "COMMON",
    "unlockRank": "G",
    "description": "基本素材、安定"
  },
  {
    "id": "gathering_riverside",
    "name": "川辺",
    "type": "GATHERING",
    "baseCost": 0,
    "presentationCount": 3,
    "rareRate": 10,
    "materialPool": ["fish", "water_grass", "sand", "pure_water"],
    "rarity": "COMMON",
    "unlockRank": "F",
    "description": "水属性特化"
  },
  {
    "id": "gathering_mountain_rocks",
    "name": "山麓の岩場",
    "type": "GATHERING",
    "baseCost": 1,
    "presentationCount": 4,
    "rareRate": 15,
    "materialPool": ["ore", "stone", "rare_ore"],
    "rarity": "UNCOMMON",
    "unlockRank": "E",
    "description": "火・土属性"
  },
  {
    "id": "gathering_deep_cave",
    "name": "奥地の洞窟",
    "type": "GATHERING",
    "baseCost": 1,
    "presentationCount": 4,
    "rareRate": 20,
    "materialPool": ["rare_moss", "ore", "magic_material"],
    "rarity": "UNCOMMON",
    "unlockRank": "D",
    "description": "レア素材多め"
  },
  {
    "id": "gathering_volcano",
    "name": "火山地帯",
    "type": "GATHERING",
    "baseCost": 2,
    "presentationCount": 5,
    "rareRate": 25,
    "materialPool": ["volcanic_stone", "ash", "lava_crystal"],
    "rarity": "RARE",
    "unlockRank": "C",
    "description": "火属性特化、高品質"
  },
  {
    "id": "gathering_ancient_ruins",
    "name": "古代遺跡",
    "type": "GATHERING",
    "baseCost": 2,
    "presentationCount": 5,
    "rareRate": 30,
    "materialPool": ["magic_material", "ancient_fragment"],
    "rarity": "RARE",
    "unlockRank": "B",
    "description": "特殊素材、最高品質"
  }
]
```

#### 採取地カードフィールド説明

| フィールド | 型 | 説明 | 必須 |
|-----------|-----|------|------|
| id | string | カードID | ○ |
| name | string | 表示名 | ○ |
| type | string | カード種別（"GATHERING"固定） | ○ |
| baseCost | number | 基本コスト（採取地の距離） | ○ |
| presentationCount | number | 提示回数（ドラフト採取で何回素材が提示されるか） | ○ |
| rareRate | number | レア素材出現率（%） | ○ |
| materialPool | string[] | この採取地で獲得可能な素材ID一覧 | ○ |
| rarity | string | カードのレアリティ | ○ |
| unlockRank | string | 解放されるギルドランク | ○ |
| description | string | カードの説明 | ○ |

### 2.3 レシピカード（recipe_cards.json）🔵

```json
[
  {
    "id": "recipe_healing_potion",
    "name": "回復薬",
    "type": "RECIPE",
    "cost": 1,
    "requiredMaterials": [
      { "materialId": "herb", "quantity": 2 },
      { "materialId": "pure_water", "quantity": 1 }
    ],
    "outputItemId": "healing_potion",
    "category": "MEDICINE",
    "rarity": "COMMON",
    "unlockRank": "G",
    "description": "医療系の基本"
  },
  {
    "id": "recipe_antidote",
    "name": "解毒剤",
    "type": "RECIPE",
    "cost": 1,
    "requiredMaterials": [
      { "materialId": "poison_mushroom", "quantity": 1 },
      { "materialId": "pure_water", "quantity": 2 }
    ],
    "outputItemId": "antidote",
    "category": "MEDICINE",
    "rarity": "COMMON",
    "unlockRank": "F",
    "description": "医療系"
  },
  {
    "id": "recipe_nutrition",
    "name": "栄養剤",
    "type": "RECIPE",
    "cost": 1,
    "requiredMaterials": [
      { "materialId": "herb", "quantity": 1 },
      { "materialId": "fish", "quantity": 1 },
      { "materialId": "water", "quantity": 1 }
    ],
    "outputItemId": "nutrition",
    "category": "MEDICINE",
    "rarity": "COMMON",
    "unlockRank": "G",
    "description": "医療系"
  },
  {
    "id": "recipe_bomb",
    "name": "爆弾",
    "type": "RECIPE",
    "cost": 2,
    "requiredMaterials": [
      { "materialId": "volcanic_stone", "quantity": 1 },
      { "materialId": "sulfur", "quantity": 1 },
      { "materialId": "oil", "quantity": 1 }
    ],
    "outputItemId": "bomb",
    "category": "ADVENTURE",
    "rarity": "UNCOMMON",
    "unlockRank": "E",
    "description": "冒険者向け"
  },
  {
    "id": "recipe_steel_sword",
    "name": "鋼の剣",
    "type": "RECIPE",
    "cost": 2,
    "requiredMaterials": [
      { "materialId": "ore", "quantity": 3 },
      { "materialId": "wood", "quantity": 1 }
    ],
    "outputItemId": "steel_sword",
    "category": "WEAPON",
    "rarity": "UNCOMMON",
    "unlockRank": "E",
    "description": "武具系"
  },
  {
    "id": "recipe_magic_staff",
    "name": "魔法の杖",
    "type": "RECIPE",
    "cost": 2,
    "requiredMaterials": [
      { "materialId": "magic_material", "quantity": 2 },
      { "materialId": "wood", "quantity": 1 }
    ],
    "outputItemId": "magic_staff",
    "category": "MAGIC",
    "rarity": "RARE",
    "unlockRank": "C",
    "description": "魔法系"
  },
  {
    "id": "recipe_panacea",
    "name": "万能薬",
    "type": "RECIPE",
    "cost": 3,
    "requiredMaterials": [
      { "materialId": "alpine_herb", "quantity": 2 },
      { "materialId": "holy_water", "quantity": 1 },
      { "materialId": "moon_drop", "quantity": 1 }
    ],
    "outputItemId": "panacea",
    "category": "MEDICINE",
    "rarity": "RARE",
    "unlockRank": "B",
    "description": "高級医療系"
  }
]
```

### 2.4 強化カード（enhancement_cards.json）🔵

```json
[
  {
    "id": "enhance_sage_catalyst",
    "name": "賢者の触媒",
    "type": "ENHANCEMENT",
    "cost": 0,
    "effect": { "type": "QUALITY_UP", "value": 1 },
    "targetAction": "ALCHEMY",
    "rarity": "COMMON",
    "unlockRank": "G",
    "description": "調合品質+1ランク"
  },
  {
    "id": "enhance_alchemy_ash",
    "name": "錬金の灰",
    "type": "ENHANCEMENT",
    "cost": 0,
    "effect": { "type": "MATERIAL_SAVE", "value": 1 },
    "targetAction": "ALCHEMY",
    "rarity": "UNCOMMON",
    "unlockRank": "E",
    "description": "素材を1つ節約"
  },
  {
    "id": "enhance_spirit_guide",
    "name": "精霊の導き",
    "type": "ENHANCEMENT",
    "cost": 0,
    "effect": { "type": "PRESENTATION_BONUS", "value": 1 },
    "targetAction": "GATHERING",
    "rarity": "COMMON",
    "unlockRank": "G",
    "description": "提示回数+1回"
  },
  {
    "id": "enhance_lucky_charm",
    "name": "幸運のお守り",
    "type": "ENHANCEMENT",
    "cost": 0,
    "effect": { "type": "RARE_CHANCE_UP", "value": 30 },
    "targetAction": "GATHERING",
    "rarity": "UNCOMMON",
    "unlockRank": "E",
    "description": "レア素材確率+30%"
  },
  {
    "id": "enhance_negotiation",
    "name": "交渉術の書",
    "type": "ENHANCEMENT",
    "cost": 0,
    "effect": { "type": "GOLD_BONUS", "value": 50 },
    "targetAction": "DELIVERY",
    "rarity": "UNCOMMON",
    "unlockRank": "D",
    "description": "報酬金+50%"
  },
  {
    "id": "enhance_guild_letter",
    "name": "ギルド推薦状",
    "type": "ENHANCEMENT",
    "cost": 0,
    "effect": { "type": "CONTRIBUTION_BONUS", "value": 30 },
    "targetAction": "DELIVERY",
    "rarity": "COMMON",
    "unlockRank": "G",
    "description": "貢献度+30%"
  },
  {
    "id": "enhance_meditation",
    "name": "集中の瞑想",
    "type": "ENHANCEMENT",
    "cost": 0,
    "effect": { "type": "COST_REDUCTION", "value": 1 },
    "targetAction": "ALL",
    "rarity": "RARE",
    "unlockRank": "C",
    "description": "次の行動コスト-1"
  }
]
```

### 2.5 素材マスター（materials.json）🔵

```json
[
  {
    "id": "weed",
    "name": "雑草",
    "baseQuality": "D",
    "attributes": ["GRASS"],
    "description": "どこにでもある草"
  },
  {
    "id": "water",
    "name": "水",
    "baseQuality": "D",
    "attributes": ["WATER"],
    "description": "普通の水"
  },
  {
    "id": "herb",
    "name": "薬草",
    "baseQuality": "C",
    "attributes": ["GRASS", "WATER"],
    "description": "薬の基本素材"
  },
  {
    "id": "pure_water",
    "name": "清水",
    "baseQuality": "C",
    "attributes": ["WATER"],
    "description": "澄んだ水"
  },
  {
    "id": "mushroom",
    "name": "キノコ",
    "baseQuality": "C",
    "attributes": ["EARTH"],
    "description": "食用キノコ"
  },
  {
    "id": "poison_mushroom",
    "name": "毒キノコ",
    "baseQuality": "C",
    "attributes": ["EARTH"],
    "description": "毒を持つキノコ"
  },
  {
    "id": "fish",
    "name": "魚",
    "baseQuality": "C",
    "attributes": ["WATER"],
    "description": "川で獲れる魚"
  },
  {
    "id": "water_grass",
    "name": "水草",
    "baseQuality": "C",
    "attributes": ["WATER", "GRASS"],
    "description": "水辺に生える草"
  },
  {
    "id": "sand",
    "name": "砂",
    "baseQuality": "D",
    "attributes": ["EARTH"],
    "description": "川辺の砂"
  },
  {
    "id": "ore",
    "name": "鉱石",
    "baseQuality": "C",
    "attributes": ["FIRE", "EARTH"],
    "description": "金属の原石"
  },
  {
    "id": "stone",
    "name": "石",
    "baseQuality": "D",
    "attributes": ["EARTH"],
    "description": "普通の石"
  },
  {
    "id": "rare_ore",
    "name": "レア鉱石",
    "baseQuality": "B",
    "attributes": ["FIRE", "EARTH"],
    "description": "希少な鉱石"
  },
  {
    "id": "rare_moss",
    "name": "レア苔",
    "baseQuality": "B",
    "attributes": ["WATER", "EARTH"],
    "description": "洞窟に生える苔"
  },
  {
    "id": "volcanic_stone",
    "name": "火山石",
    "baseQuality": "A",
    "attributes": ["FIRE"],
    "description": "火山で採れる石"
  },
  {
    "id": "ash",
    "name": "灰",
    "baseQuality": "C",
    "attributes": ["FIRE"],
    "description": "火山の灰"
  },
  {
    "id": "lava_crystal",
    "name": "溶�ite",
    "baseQuality": "A",
    "attributes": ["FIRE"],
    "description": "溶岩の結晶"
  },
  {
    "id": "magic_material",
    "name": "魔法素材",
    "baseQuality": "S",
    "attributes": ["FIRE", "WATER", "EARTH", "WIND"],
    "description": "全属性を持つ素材"
  },
  {
    "id": "ancient_fragment",
    "name": "古代の欠片",
    "baseQuality": "A",
    "attributes": ["EARTH"],
    "description": "古代遺跡の遺物"
  },
  {
    "id": "alpine_herb",
    "name": "高山薬草",
    "baseQuality": "A",
    "attributes": ["GRASS", "WATER"],
    "description": "高山に生える貴重な薬草"
  },
  {
    "id": "holy_water",
    "name": "聖水",
    "baseQuality": "A",
    "attributes": ["WATER"],
    "description": "清められた水"
  },
  {
    "id": "moon_drop",
    "name": "月の雫",
    "baseQuality": "S",
    "attributes": ["WATER"],
    "description": "月光を集めた雫"
  },
  {
    "id": "wood",
    "name": "木材",
    "baseQuality": "C",
    "attributes": ["EARTH"],
    "description": "加工された木"
  },
  {
    "id": "sulfur",
    "name": "硫黄",
    "baseQuality": "C",
    "attributes": ["FIRE"],
    "description": "火山由来の硫黄"
  },
  {
    "id": "oil",
    "name": "油",
    "baseQuality": "C",
    "attributes": ["FIRE"],
    "description": "可燃性の油"
  }
]
```

### 2.6 アイテムマスター（items.json）🔵

```json
[
  {
    "id": "healing_potion",
    "name": "回復薬",
    "category": "MEDICINE",
    "effects": [{ "type": "HP_RECOVERY", "baseValue": 30 }],
    "description": "HPを回復する薬"
  },
  {
    "id": "antidote",
    "name": "解毒剤",
    "category": "MEDICINE",
    "effects": [{ "type": "CURE_POISON", "baseValue": 1 }],
    "description": "毒を治療する薬"
  },
  {
    "id": "nutrition",
    "name": "栄養剤",
    "category": "MEDICINE",
    "effects": [{ "type": "HP_RECOVERY", "baseValue": 20 }],
    "description": "栄養を補給する"
  },
  {
    "id": "bomb",
    "name": "爆弾",
    "category": "ADVENTURE",
    "effects": [{ "type": "EXPLOSION", "baseValue": 50 }],
    "description": "爆発して敵にダメージ"
  },
  {
    "id": "steel_sword",
    "name": "鋼の剣",
    "category": "WEAPON",
    "effects": [{ "type": "ATTACK_UP", "baseValue": 10 }],
    "description": "攻撃力を上げる剣"
  },
  {
    "id": "magic_staff",
    "name": "魔法の杖",
    "category": "MAGIC",
    "effects": [{ "type": "ATTACK_UP", "baseValue": 15 }],
    "description": "魔法攻撃力を上げる杖"
  },
  {
    "id": "panacea",
    "name": "万能薬",
    "category": "MEDICINE",
    "effects": [
      { "type": "HP_RECOVERY", "baseValue": 100 },
      { "type": "CURE_POISON", "baseValue": 1 }
    ],
    "description": "あらゆる状態を回復する"
  }
]
```

### 2.7 ギルドランクマスター（guild_ranks.json）🔵

```json
[
  {
    "id": "G",
    "name": "見習い",
    "hp": 100,
    "dayLimit": 30,
    "specialRules": [],
    "promotionTest": {
      "requirements": [{ "itemId": "healing_potion", "quantity": 2 }],
      "dayLimit": 5
    },
    "unlockedGatheringCards": ["gathering_backyard", "gathering_nearby_forest"],
    "unlockedRecipeCards": ["recipe_healing_potion", "recipe_nutrition"]
  },
  {
    "id": "F",
    "name": "新人",
    "hp": 200,
    "dayLimit": 30,
    "specialRules": [
      { "type": "QUEST_LIMIT", "value": 2, "description": "同時受注2件まで" }
    ],
    "promotionTest": {
      "requirements": [
        { "itemId": "healing_potion", "quantity": 3, "minQuality": "B" },
        { "itemId": "antidote", "quantity": 2 }
      ],
      "dayLimit": 5
    },
    "unlockedGatheringCards": ["gathering_riverside"],
    "unlockedRecipeCards": ["recipe_antidote"]
  },
  {
    "id": "E",
    "name": "一人前",
    "hp": 350,
    "dayLimit": 35,
    "specialRules": [
      { "type": "QUALITY_PENALTY", "condition": "D", "description": "品質D以下は貢献度半減" }
    ],
    "promotionTest": {
      "requirements": [
        { "itemId": "bomb", "quantity": 2 },
        { "itemId": "steel_sword", "quantity": 1 }
      ],
      "dayLimit": 4
    },
    "unlockedGatheringCards": ["gathering_mountain_rocks"],
    "unlockedRecipeCards": ["recipe_bomb", "recipe_steel_sword"]
  },
  {
    "id": "D",
    "name": "中堅",
    "hp": 500,
    "dayLimit": 35,
    "specialRules": [
      { "type": "DEADLINE_REDUCTION", "value": 1, "description": "全依頼の期限-1日" }
    ],
    "promotionTest": {
      "requirements": [
        { "itemId": "healing_potion", "quantity": 1, "minQuality": "A" },
        { "itemId": "bomb", "quantity": 1, "minQuality": "B" },
        { "itemId": "steel_sword", "quantity": 1, "minQuality": "B" }
      ],
      "dayLimit": 4
    },
    "unlockedGatheringCards": ["gathering_deep_cave"],
    "unlockedRecipeCards": []
  },
  {
    "id": "C",
    "name": "熟練",
    "hp": 700,
    "dayLimit": 35,
    "specialRules": [
      { "type": "QUALITY_REQUIRED", "condition": "C", "description": "品質C以上でないと受理されない" }
    ],
    "promotionTest": {
      "requirements": [
        { "itemId": "healing_potion", "quantity": 5, "minQuality": "B" }
      ],
      "dayLimit": 3
    },
    "unlockedGatheringCards": ["gathering_volcano"],
    "unlockedRecipeCards": ["recipe_magic_staff"]
  },
  {
    "id": "B",
    "name": "上級",
    "hp": 1000,
    "dayLimit": 35,
    "specialRules": [
      { "type": "QUALITY_REQUIRED", "condition": "B", "description": "品質B以上必須" },
      { "type": "DEADLINE_REDUCTION", "value": 1, "description": "期限-1日" }
    ],
    "promotionTest": {
      "requirements": [
        { "itemId": "panacea", "quantity": 1 },
        { "itemId": "magic_staff", "quantity": 1, "minQuality": "A" },
        { "itemId": "bomb", "quantity": 2, "minQuality": "A" }
      ],
      "dayLimit": 3
    },
    "unlockedGatheringCards": ["gathering_ancient_ruins"],
    "unlockedRecipeCards": ["recipe_panacea"]
  },
  {
    "id": "A",
    "name": "最上級",
    "hp": 1500,
    "dayLimit": 35,
    "specialRules": [
      { "type": "QUALITY_REQUIRED", "condition": "A", "description": "品質A以上必須" },
      { "type": "DEADLINE_REDUCTION", "value": 2, "description": "期限-2日" }
    ],
    "promotionTest": {
      "requirements": [
        { "itemId": "legendary_item", "quantity": 1, "minQuality": "S" }
      ],
      "dayLimit": 0
    },
    "unlockedGatheringCards": [],
    "unlockedRecipeCards": []
  },
  {
    "id": "S",
    "name": "伝説",
    "hp": 0,
    "dayLimit": 0,
    "specialRules": [],
    "promotionTest": null,
    "unlockedGatheringCards": [],
    "unlockedRecipeCards": []
  }
]
```

### 2.8 依頼者マスター（clients.json）🔵

```json
[
  {
    "id": "villager",
    "name": "村人",
    "type": "VILLAGER",
    "contributionMultiplier": 0.8,
    "goldMultiplier": 0.8,
    "deadlineModifier": 1,
    "preferredQuestTypes": ["CATEGORY", "QUANTITY"],
    "unlockRank": "G",
    "dialoguePatterns": [
      "何か薬が欲しいんだ",
      "薬を{quantity}個欲しいんだ",
      "{item}が欲しいんだけど..."
    ]
  },
  {
    "id": "adventurer",
    "name": "冒険者",
    "type": "ADVENTURER",
    "contributionMultiplier": 1.0,
    "goldMultiplier": 1.0,
    "deadlineModifier": 0,
    "preferredQuestTypes": ["ATTRIBUTE", "EFFECT"],
    "unlockRank": "G",
    "dialoguePatterns": [
      "{item}が欲しい！",
      "火属性{value}以上の武器を頼む",
      "HP{value}回復できるものをくれ"
    ]
  },
  {
    "id": "merchant",
    "name": "商人",
    "type": "MERCHANT",
    "contributionMultiplier": 1.2,
    "goldMultiplier": 1.5,
    "deadlineModifier": -1,
    "preferredQuestTypes": ["QUALITY", "COMPOUND"],
    "unlockRank": "E",
    "dialoguePatterns": [
      "品質{quality}以上のアイテムを",
      "高品質な{category}を探している",
      "いい品を頼むよ"
    ]
  },
  {
    "id": "noble",
    "name": "貴族",
    "type": "NOBLE",
    "contributionMultiplier": 1.5,
    "goldMultiplier": 2.0,
    "deadlineModifier": -2,
    "preferredQuestTypes": ["COMPOUND", "MATERIAL"],
    "unlockRank": "C",
    "dialoguePatterns": [
      "最高品質のものを用意せよ",
      "レア素材を使った逸品を",
      "{quality}以上で{attribute}属性{value}以上のものを"
    ]
  },
  {
    "id": "guild",
    "name": "ギルド",
    "type": "GUILD",
    "contributionMultiplier": 1.3,
    "goldMultiplier": 1.0,
    "deadlineModifier": 0,
    "preferredQuestTypes": ["SPECIFIC"],
    "unlockRank": "G",
    "dialoguePatterns": [
      "昇格試験の課題だ",
      "{item}を{quantity}個納品せよ"
    ]
  }
]
```

### 2.9 アーティファクトマスター（artifacts.json）🔵

```json
[
  {
    "id": "artifact_alchemist_glasses",
    "name": "錬金術師の眼鏡",
    "effect": { "type": "QUALITY_UP", "value": 1 },
    "rarity": "COMMON",
    "description": "調合品質+1"
  },
  {
    "id": "artifact_storage_bag",
    "name": "採取袋の拡張",
    "effect": { "type": "STORAGE_EXPANSION", "value": 5 },
    "rarity": "COMMON",
    "description": "素材保管+5枠"
  },
  {
    "id": "artifact_merchant_ring",
    "name": "商人の指輪",
    "effect": { "type": "GOLD_BONUS", "value": 20 },
    "rarity": "COMMON",
    "description": "報酬金+20%"
  },
  {
    "id": "artifact_four_leaf",
    "name": "幸運の四つ葉",
    "effect": { "type": "RARE_CHANCE_UP", "value": 15 },
    "rarity": "COMMON",
    "description": "レア素材確率+15%"
  },
  {
    "id": "artifact_hourglass",
    "name": "時の砂時計",
    "effect": { "type": "ACTION_POINT_BONUS", "value": 1 },
    "rarity": "RARE",
    "description": "行動ポイント+1/日"
  },
  {
    "id": "artifact_fake_stone",
    "name": "賢者の石（偽）",
    "effect": { "type": "QUALITY_UP", "value": 1 },
    "rarity": "RARE",
    "description": "全調合品質+1"
  },
  {
    "id": "artifact_guildmaster_seal",
    "name": "ギルドマスターの印",
    "effect": { "type": "CONTRIBUTION_BONUS", "value": 20 },
    "rarity": "RARE",
    "description": "貢献度+20%"
  },
  {
    "id": "artifact_legendary_cauldron",
    "name": "伝説の釜",
    "effect": { "type": "ALCHEMY_COST_REDUCTION", "value": 1 },
    "rarity": "EPIC",
    "description": "調合コスト-1"
  },
  {
    "id": "artifact_ancient_map",
    "name": "古代の地図",
    "effect": { "type": "PRESENTATION_BONUS", "value": 1 },
    "rarity": "EPIC",
    "description": "採取の提示回数+1"
  },
  {
    "id": "artifact_alchemy_crown",
    "name": "錬金王の冠",
    "effect": { "type": "ALL_BONUS", "value": 10 },
    "rarity": "LEGENDARY",
    "description": "全効果+10%"
  }
]
```

### 2.10 ショップアイテム（shop_items.json）🟡

```json
[
  {
    "type": "card",
    "itemId": "gathering_riverside",
    "price": 80,
    "stock": -1,
    "unlockRank": "F"
  },
  {
    "type": "card",
    "itemId": "gathering_mountain_rocks",
    "price": 150,
    "stock": -1,
    "unlockRank": "E"
  },
  {
    "type": "card",
    "itemId": "recipe_antidote",
    "price": 100,
    "stock": -1,
    "unlockRank": "F"
  },
  {
    "type": "card",
    "itemId": "enhance_sage_catalyst",
    "price": 80,
    "stock": 3,
    "unlockRank": "G"
  },
  {
    "type": "material",
    "itemId": "herb",
    "price": 15,
    "stock": 5,
    "unlockRank": "G"
  },
  {
    "type": "material",
    "itemId": "pure_water",
    "price": 20,
    "stock": 5,
    "unlockRank": "G"
  },
  {
    "type": "artifact",
    "itemId": "artifact_alchemist_glasses",
    "price": 300,
    "stock": 1,
    "unlockRank": "F"
  },
  {
    "type": "artifact",
    "itemId": "artifact_hourglass",
    "price": 500,
    "stock": 1,
    "unlockRank": "D"
  }
]
```

---

## 3. データフロー

### 3.1 ロードタイミング

| データ種別 | タイミング | 備考 |
|-----------|-----------|------|
| マスターデータ | ゲーム起動時 | 全データをメモリに保持 |
| セーブデータ（存在確認） | タイトル画面表示時 | コンティニュー可否判定 |
| セーブデータ（読み込み） | ゲーム開始時 | 選択されたスロットを読み込み |

### 3.2 セーブタイミング

| タイミング | トリガー | 備考 |
|-----------|----------|------|
| 日終了時 | フェーズ完了 | 自動セーブ |
| ランクアップ時 | 昇格試験クリア | 自動セーブ |
| 手動セーブ | メニューから | 任意タイミング |

### 3.3 バージョン管理

セーブデータのバージョンが異なる場合のマイグレーション戦略：

| 旧バージョン | 新バージョン | 対応 |
|-------------|-------------|------|
| 1.0.x | 1.0.x | 互換性あり |
| 1.0.x | 1.1.x | マイグレーション実行 |
| 1.x.x | 2.x.x | 非互換、新規作成を促す |

---

## 4. 初期デッキ構成

### 4.1 初期デッキ（15枚）🔵

| カードID | カード名 | 種別 | 枚数 |
|---------|---------|------|------|
| gathering_backyard | 裏庭 | 採取地 | 2 |
| gathering_nearby_forest | 近くの森 | 採取地 | 3 |
| gathering_riverside | 川辺 | 採取地 | 2 |
| recipe_healing_potion | 回復薬 | レシピ | 2 |
| recipe_nutrition | 栄養剤 | レシピ | 2 |
| recipe_antidote | 解毒剤 | レシピ | 1 |
| enhance_sage_catalyst | 賢者の触媒 | 強化 | 1 |
| enhance_spirit_guide | 精霊の導き | 強化 | 1 |
| enhance_guild_letter | ギルド推薦状 | 強化 | 1 |

**合計**: 採取地7枚 + レシピ5枚 + 強化3枚 = 15枚

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-01 | 1.0.0 | 初版作成 |
| 2026-01-01 | 1.1.0 | 採取地カード構造をドラフト採取方式に対応。baseCost/presentationCount/rareRate/materialPoolフィールドを追加。強化カード「精霊の導き」の効果をPRESENTATION_BONUS（提示回数+1）に変更。アーティファクト「古代の地図」の効果をPRESENTATION_BONUS（提示回数+1）に変更。 |
