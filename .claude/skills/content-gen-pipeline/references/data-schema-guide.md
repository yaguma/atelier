# データスキーマ参照ガイド

## 概要

マスターデータの型定義とJSON構造の参照ガイド。各エージェントはこのドキュメントに従いデータを生成する。

---

## 型定義ファイルの場所

| 型定義 | ファイルパス |
|--------|------------|
| カードマスター | `src/shared/types/master-data.ts` |
| 素材・アイテム | `src/shared/types/materials.ts` |
| 依頼・依頼者 | `src/shared/types/quests.ts` |
| 列挙型（共通） | `src/shared/types/common.ts` |
| ブランド型ID | `src/shared/types/ids.ts` |

---

## JSONファイルとスキーマ対応

### cards.json

配列形式。各要素は `CardMaster`（ユニオン型）。

#### 採取カード（IGatheringCardMaster）

```json
{
  "id": "gathering_backyard",
  "name": "裏庭",
  "type": "GATHERING",
  "baseCost": 1,
  "presentationCount": 3,
  "rareRate": 5,
  "materialPool": ["mat_herb", "mat_mushroom", "mat_water"],
  "rarity": "COMMON",
  "unlockRank": "G",
  "description": "自宅の裏庭。基本的な素材が見つかる"
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| id | CardId (string) | Yes | `gathering_` プレフィックス |
| name | string | Yes | |
| type | `"GATHERING"` | Yes | 固定値 |
| baseCost | number | Yes | 1以上 |
| presentationCount | number | Yes | 1以上 |
| rareRate | number | Yes | 0〜100（%） |
| materialPool | string[] | Yes | materials.jsonに存在するID |
| rarity | Rarity | Yes | COMMON/UNCOMMON/RARE/EPIC/LEGENDARY |
| unlockRank | GuildRank | Yes | G/F/E/D/C/B/A/S |
| description | string | Yes | |

#### レシピカード（IRecipeCardMaster）

```json
{
  "id": "recipe_healing_potion",
  "name": "回復薬",
  "type": "RECIPE",
  "cost": 1,
  "requiredMaterials": [
    { "materialId": "mat_herb", "quantity": 2 },
    { "materialId": "mat_water", "quantity": 1 }
  ],
  "outputItemId": "item_healing_potion",
  "category": "MEDICINE",
  "rarity": "COMMON",
  "unlockRank": "G",
  "description": "基本的な回復薬を調合する"
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| id | CardId (string) | Yes | `recipe_` プレフィックス |
| name | string | Yes | |
| type | `"RECIPE"` | Yes | 固定値 |
| cost | number | Yes | 1以上 |
| requiredMaterials | IRecipeRequiredMaterial[] | Yes | 1つ以上 |
| outputItemId | string | Yes | recipes.jsonのitemsに存在するID |
| category | ItemCategory | Yes | MEDICINE/WEAPON/MAGIC/ADVENTURE/LUXURY |
| rarity | Rarity | Yes | |
| unlockRank | GuildRank | Yes | |
| description | string | Yes | |

#### 強化カード（IEnhancementCardMaster）

```json
{
  "id": "enhance_sage_catalyst",
  "name": "賢者の触媒",
  "type": "ENHANCEMENT",
  "cost": 0,
  "effect": { "type": "QUALITY_UP", "value": 10 },
  "targetAction": "ALCHEMY",
  "rarity": "UNCOMMON",
  "unlockRank": "G",
  "description": "調合時の品質を向上させる"
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| id | CardId (string) | Yes | `enhance_` プレフィックス |
| name | string | Yes | |
| type | `"ENHANCEMENT"` | Yes | 固定値 |
| cost | `0` | Yes | 固定値 |
| effect | IEnhancementEffect | Yes | type: EffectType, value: number |
| targetAction | EnhancementTarget | Yes | GATHERING/ALCHEMY/DELIVERY/ALL |
| rarity | Rarity | Yes | |
| unlockRank | GuildRank | Yes | |
| description | string | Yes | |

### materials.json

配列形式。各要素は `MaterialMaster`（= `IMaterial`）。

```json
{
  "id": "mat_herb",
  "name": "薬草",
  "baseQuality": "D",
  "attributes": ["GRASS"],
  "description": "どこにでも生えている基本的な薬草"
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| id | MaterialId (string) | Yes | `mat_` プレフィックス |
| name | string | Yes | |
| baseQuality | Quality | Yes | D/C/B/A/S |
| attributes | Attribute[] | Yes | FIRE/WATER/EARTH/WIND/GRASS |
| description | string | No | |

### recipes.json

オブジェクト形式。`items` キーにアイテム配列を持つ。

```json
{
  "items": [
    {
      "id": "item_healing_potion",
      "name": "回復薬",
      "category": "MEDICINE",
      "effects": [{ "type": "HP_RECOVERY", "baseValue": 30 }],
      "description": "HPを回復する基本的な薬"
    }
  ]
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| id | ItemId (string) | Yes | `item_` プレフィックス |
| name | string | Yes | |
| category | ItemCategory | Yes | MEDICINE/WEAPON/MAGIC/ADVENTURE/LUXURY |
| effects | IItemEffect[] | Yes | type: ItemEffectType, baseValue: number |
| description | string | No | |

### quests.json

オブジェクト形式。`clients` と `templates` の2キーを持つ。

#### 依頼者（IClient）

```json
{
  "id": "client_villager_anna",
  "name": "村人アンナ",
  "type": "VILLAGER",
  "contributionMultiplier": 1.0,
  "goldMultiplier": 0.8,
  "deadlineModifier": 2,
  "preferredQuestTypes": ["SPECIFIC", "CATEGORY"],
  "unlockRank": "G",
  "dialoguePatterns": ["お願いがあるの…"]
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| id | ClientId (string) | Yes | `client_` プレフィックス |
| name | string | Yes | |
| type | ClientType | Yes | VILLAGER/ADVENTURER/MERCHANT/NOBLE/GUILD |
| contributionMultiplier | number | Yes | 0より大きい |
| goldMultiplier | number | Yes | 0より大きい |
| deadlineModifier | number | Yes | 正負の整数 |
| preferredQuestTypes | QuestType[] | Yes | 1つ以上 |
| unlockRank | GuildRank | Yes | |
| dialoguePatterns | string[] | No | |

#### 依頼テンプレート（IQuest）

```json
{
  "id": "quest_herb_delivery",
  "clientId": "client_villager_anna",
  "condition": {
    "type": "SPECIFIC",
    "itemId": "item_healing_potion",
    "quantity": 1
  },
  "contribution": 20,
  "gold": 30,
  "deadline": 3,
  "difficulty": "easy",
  "flavorText": "風邪をひいてしまって…回復薬が必要なの"
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| id | QuestId (string) | Yes | `quest_` プレフィックス |
| clientId | ClientId (string) | Yes | quests.jsonのclientsに存在 |
| condition | IQuestCondition | Yes | type: QuestType |
| contribution | number | Yes | 1以上 |
| gold | number | Yes | 0以上 |
| deadline | number | Yes | 1以上（日数） |
| difficulty | QuestDifficulty | Yes | easy/normal/hard |
| flavorText | string | Yes | |

### artifacts.json

配列形式。各要素は `IArtifactMaster`。

```json
{
  "id": "artifact_golden_mortar",
  "name": "黄金のすり鉢",
  "effect": { "type": "QUALITY_UP", "value": 5 },
  "rarity": "RARE",
  "description": "調合品質を永続的に向上させる"
}
```

| フィールド | 型 | 必須 | 制約 |
|-----------|-----|------|------|
| id | ArtifactId (string) | Yes | `artifact_` プレフィックス |
| name | string | Yes | |
| effect | IArtifactEffect | Yes | type: EffectType, value: number |
| rarity | Rarity | Yes | |
| description | string | Yes | |

### ranks.json

配列形式。各要素は `IGuildRankMaster`。

```json
{
  "id": "G",
  "name": "Gランク",
  "requiredContribution": 0,
  "dayLimit": 5,
  "specialRules": [],
  "promotionTest": { "requirements": [...], "dayLimit": 5 },
  "unlockedGatheringCards": ["gathering_backyard"],
  "unlockedRecipeCards": ["recipe_healing_potion"]
}
```

---

## 列挙型の有効値一覧

| 列挙型 | 有効値 |
|--------|--------|
| GuildRank | G, F, E, D, C, B, A, S |
| Quality | D, C, B, A, S |
| Rarity | COMMON, UNCOMMON, RARE, EPIC, LEGENDARY |
| Attribute | FIRE, WATER, EARTH, WIND, GRASS |
| CardType | GATHERING, RECIPE, ENHANCEMENT |
| ItemCategory | MEDICINE, WEAPON, MAGIC, ADVENTURE, LUXURY |
| QuestType | SPECIFIC, CATEGORY, QUALITY, QUANTITY, ATTRIBUTE, EFFECT, MATERIAL, COMPOUND |
| ClientType | VILLAGER, ADVENTURER, MERCHANT, NOBLE, GUILD |
| QuestDifficulty | easy, normal, hard |
| EffectType | QUALITY_UP, MATERIAL_SAVE, GATHERING_BONUS, RARE_CHANCE_UP, GOLD_BONUS, CONTRIBUTION_BONUS, COST_REDUCTION, STORAGE_EXPANSION, ACTION_POINT_BONUS, ALCHEMY_COST_REDUCTION, ALL_BONUS |
| EnhancementTarget | GATHERING, ALCHEMY, DELIVERY, ALL |
| ItemEffectType | HP_RECOVERY, ATTACK_UP, DEFENSE_UP, CURE_POISON, EXPLOSION |
| SpecialRuleType | QUEST_LIMIT, QUALITY_PENALTY, DEADLINE_REDUCTION, QUALITY_REQUIRED |

---

## 参照整合性ルール

| 参照元 | フィールド | 参照先 |
|--------|-----------|--------|
| cards.json（GATHERING） | materialPool[] | materials.json の id |
| cards.json（RECIPE） | requiredMaterials[].materialId | materials.json の id |
| cards.json（RECIPE） | outputItemId | recipes.json の items[].id |
| quests.json（templates） | clientId | quests.json の clients[].id |
| quests.json（templates） | condition.itemId | recipes.json の items[].id |
| ranks.json | unlockedGatheringCards[] | cards.json の id（type=GATHERING） |
| ranks.json | unlockedRecipeCards[] | cards.json の id（type=RECIPE） |
