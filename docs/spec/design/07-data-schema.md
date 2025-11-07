# データスキーマ (JSON)

このドキュメントではゲーム内で使用されるJSONデータスキーマについて説明するのだ。カード定義、依頼定義、錬金スタイル、マップ生成設定など、重要な設定ファイルのフォーマットを記載しているのだ。

## データスキーマ (JSON)

### カード定義 (card_config.json)

```json
{
  "cards": [
    {
      "id": "card_fire_ore_001",
      "name": "火の鉱石",
      "type": "Material",
      "cost": 1,
      "attributes": {
        "fire": 5,
        "water": 0,
        "earth": 2,
        "wind": 0,
        "poison": 0,
        "quality": 3
      },
      "stability": 2,
      "description": "燃え盛る鉱石。火属性を大きく高める。",
      "level": 1,
      "effects": [],
      "rarity": "Common",
      "sprite": "cards/fire_ore_001"
    },
    {
      "id": "card_catalyst_flame_001",
      "name": "火炎触媒",
      "type": "Catalyst",
      "cost": 2,
      "attributes": {
        "fire": 0,
        "water": 0,
        "earth": 0,
        "wind": 0,
        "poison": 0,
        "quality": 0
      },
      "stability": -1,
      "description": "火属性を2倍にする触媒。安定性が低下する。",
      "level": 1,
      "effects": [
        {
          "type": "MultiplyAttribute",
          "target": "fire",
          "multiplier": 2.0
        }
      ],
      "rarity": "Uncommon",
      "sprite": "cards/catalyst_flame_001"
    }
  ]
}
```

### 依頼定義 (quest_config.json)

```json
{
  "quests": [
    {
      "id": "quest_beginner_potion_001",
      "customerName": "村人A",
      "customerType": "Villager",
      "difficulty": 1,
      "requirements": {
        "requiredAttributes": {
          "fire": 0,
          "water": 10,
          "earth": 0,
          "wind": 0,
          "poison": 0,
          "quality": 5
        },
        "minQuality": 5,
        "minStability": 0
      },
      "rewards": {
        "gold": 50,
        "fame": 1,
        "cardChoices": [
          "card_water_herb_001",
          "card_water_herb_002",
          "card_operation_mix_001"
        ]
      },
      "description": "簡単な回復薬を作ってほしい。",
      "sprite": "customers/villager_001"
    }
  ]
}
```

### 錬金スタイル定義 (alchemy_style_config.json)

```json
{
  "styles": [
    {
      "id": "style_fire_alchemist",
      "name": "火の錬金術師",
      "description": "火属性に特化した攻撃的なスタイル",
      "initialCards": [
        "card_fire_ore_001",
        "card_fire_ore_001",
        "card_fire_herb_001",
        "card_operation_heat_001",
        "card_operation_mix_001",
        "card_operation_mix_001",
        "card_catalyst_flame_001",
        "card_material_coal_001",
        "card_material_coal_001",
        "card_material_coal_001"
      ],
      "startingGold": 100,
      "specialAbility": {
        "name": "火炎強化",
        "description": "火属性カードのコストが1減少する",
        "effect": "ReduceFireCardCost"
      },
      "sprite": "styles/fire_alchemist"
    }
  ]
}
```

### マップ生成設定 (map_generation_config.json)

```json
{
  "mapGeneration": {
    "minNodes": 30,
    "maxNodes": 50,
    "nodesPerLevel": 5,
    "nodeTypeWeights": {
      "Quest": 50,
      "Merchant": 20,
      "Experiment": 15,
      "Monster": 15
    },
    "levelScaling": {
      "baseDifficulty": 1,
      "difficultyIncrease": 0.2
    }
  }
}
```
