# データスキーマ設計書

**バージョン**: 1.2.0
**作成日**: 2026-01-01
**更新日**: 2026-01-02
**対象**: アトリエ錬金術ゲーム（ギルドランク制）HTML版

---

## 概要

# データスキーマ設計書 - ゲームマスターデータ

このドキュメントは [データスキーマ設計書](data-schema.md) の一部なのだ。

---

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
    "requiredContribution": 100,
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
    "requiredContribution": 200,
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
    "requiredContribution": 350,
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
    "requiredContribution": 500,
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
    "requiredContribution": 700,
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
    "requiredContribution": 1000,
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
    "requiredContribution": 1500,
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
    "requiredContribution": 0,
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


---

## 関連文書

- [← カードマスターデータ](data-schema-master-cards.md)
- [→ データフロー](data-schema-flow.md)
- [セーブデータ](data-schema-save.md)
