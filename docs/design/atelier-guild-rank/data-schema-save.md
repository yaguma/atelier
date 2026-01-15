# データスキーマ設計書

**バージョン**: 1.2.0
**作成日**: 2026-01-01
**更新日**: 2026-01-02
**対象**: アトリエ錬金術ゲーム（ギルドランク制）HTML版

---

## 概要

# データスキーマ設計書 - セーブデータ

このドキュメントは [データスキーマ設計書](data-schema.md) の一部なのだ。

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
  "promotionGauge": 35,
  "requiredContribution": 100,
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
| promotionGauge | number | 現在の昇格ゲージ（累計貢献度） | 0 |
| requiredContribution | number | 昇格に必要な貢献度 | 100（ランクによる） |
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


---

## 関連文書

- [→ カードマスターデータ](data-schema-master-cards.md)
- [ゲームマスターデータ](data-schema-master-game.md)
- [データフロー](data-schema-flow.md)
