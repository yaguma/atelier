# データスキーマ設計書

**バージョン**: 1.2.0
**作成日**: 2026-01-01
**更新日**: 2026-01-02
**対象**: アトリエ錬金術ゲーム（ギルドランク制）HTML版

---

## 概要

# データスキーマ設計書 - カードマスターデータ

このドキュメントは [データスキーマ設計書](data-schema.md) の一部なのだ。

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


---

## 関連文書

- [← セーブデータ](data-schema-save.md)
- [→ ゲームマスターデータ](data-schema-master-game.md)
- [データフロー](data-schema-flow.md)
