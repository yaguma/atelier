# データスキーマ設計

## 概要

本ドキュメントは、ゲーム「アトリエ」のデータスキーマの概要を提供するのだ。

**詳細設計参照**: [07-data-schema.md](../../spec/design/07-data-schema.md)

---

## データ分類

| 分類 | 説明 | 保存場所 |
|------|------|---------|
| マスターデータ | 読み取り専用のゲームデータ | Resources/MasterData/ |
| セーブデータ | プレイヤー進行状況 | Application.persistentDataPath |
| ランタイムデータ | ゲーム中の一時データ | メモリ |

---

## マスターデータ

### カードマスター

```json
{
  "cards": [
    {
      "cardId": "CARD_001",
      "name": "火の鉱石",
      "type": "Material",
      "rarity": "Common",
      "cost": 1,
      "attributes": {
        "fire": 5,
        "water": 0,
        "earth": 0,
        "wind": 0,
        "poison": 0,
        "quality": 2
      },
      "stability": 0,
      "description": "基本的な火属性素材"
    }
  ]
}
```

### 依頼マスター

```json
{
  "quests": [
    {
      "questId": "QUEST_001",
      "name": "回復薬",
      "customer": "村人A",
      "difficulty": 1,
      "requirements": {
        "fire": 0,
        "water": 10,
        "earth": 0,
        "wind": 0,
        "quality": 5
      },
      "rewards": {
        "gold": 50,
        "fame": 5
      }
    }
  ]
}
```

### 錬金スタイルマスター

```json
{
  "styles": [
    {
      "styleId": "STYLE_001",
      "name": "炎の錬金術師",
      "description": "火属性に特化したスタイル",
      "startingDeck": ["CARD_001", "CARD_002", "CARD_003"],
      "passiveBonus": {
        "fireMultiplier": 1.2
      }
    }
  ]
}
```

---

## セーブデータ

### 構造

```json
{
  "version": "1.0",
  "timestamp": "2025-12-20T10:30:00Z",
  "player": {
    "gold": 250,
    "fame": 50,
    "knowledgePoints": 30
  },
  "meta": {
    "totalPlayTime": 3600,
    "runsCompleted": 5,
    "highestAscension": 3,
    "unlockedCards": ["CARD_001", "CARD_002"],
    "unlockedStyles": ["STYLE_001"]
  },
  "currentRun": {
    "styleId": "STYLE_001",
    "seed": 12345,
    "ascensionLevel": 1,
    "currentNode": 5,
    "deck": ["CARD_001", "CARD_002", "CARD_003"],
    "turn": 3,
    "energy": 5
  }
}
```

### バージョン管理

| バージョン | 変更内容 |
|-----------|---------|
| 1.0 | 初期スキーマ |

---

## ランタイムデータ

### ゲーム状態

| データ | 型 | 説明 |
|--------|-----|------|
| currentPhase | GamePhase | 現在のゲームフェーズ |
| turnCount | int | 現在ターン数 |
| energy | int | 現在エネルギー |
| hand | List&lt;Card&gt; | 手札 |
| deck | List&lt;Card&gt; | 山札 |
| discard | List&lt;Card&gt; | 捨て札 |
| activeQuests | List&lt;Quest&gt; | 進行中の依頼 |

---

## データ関連図

```mermaid
erDiagram
    Player ||--o{ SaveData : has
    SaveData ||--o{ CurrentRun : contains
    CurrentRun ||--o{ DeckCard : has

    Card ||--o{ DeckCard : references
    Style ||--o{ CurrentRun : uses
    Quest ||--o{ QuestProgress : generates

    Card {
        string cardId PK
        string name
        string type
        int cost
    }

    Quest {
        string questId PK
        string name
        int difficulty
    }

    Style {
        string styleId PK
        string name
    }

    SaveData {
        string version
        datetime timestamp
    }

    CurrentRun {
        string styleId FK
        int seed
        int currentNode
    }

    DeckCard {
        string cardId FK
        int level
    }
```

---

## 参照

- [07-data-schema.md](../../spec/design/07-data-schema.md) - データスキーマ詳細設計
- [08-infrastructure.md](../../spec/design/08-infrastructure.md) - インフラストラクチャ層

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2025-12-20 | 1.0 | 初版作成 |
