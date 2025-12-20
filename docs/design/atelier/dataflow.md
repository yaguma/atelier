# データフロー設計

## 概要

本ドキュメントは、ゲーム「アトリエ」のデータフローを定義するのだ。

**関連設計参照**: [01-architecture.md](../../spec/design/01-architecture.md)

---

## 全体データフロー

```mermaid
flowchart TD
    subgraph Input["入力"]
        A[マウス/キーボード]
    end

    subgraph Presentation["Presentation Layer"]
        B[UIManager]
        C[InputManager]
    end

    subgraph Application["Application Layer"]
        D[GameService]
        E[QuestService]
        F[DeckService]
        G[EventBus]
    end

    subgraph Domain["Domain Layer"]
        H[Card]
        I[Quest]
        J[Player]
        K[GameState]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        L[SaveDataRepository]
        M[ConfigDataLoader]
    end

    subgraph Storage["ストレージ"]
        N[(SaveData.json)]
        O[(MasterData/*.json)]
    end

    A --> C
    C --> D
    B <--> D
    D --> G
    G --> B
    D --> E
    D --> F
    E --> I
    F --> H
    D --> J
    D --> K
    D --> L
    D --> M
    L <--> N
    M --> O
```

---

## カードプレイデータフロー

```mermaid
sequenceDiagram
    participant U as UI
    participant I as InputManager
    participant G as GameService
    participant D as DeckService
    participant Q as QuestService
    participant E as EventBus

    U->>I: カードドラッグ
    I->>G: PlayCard(cardId, questId)
    G->>D: ValidatePlay(card)
    D-->>G: OK
    G->>D: PlayCard(card)
    D->>D: Hand.Remove(card)
    D->>D: Discard.Add(card)
    G->>Q: ApplyCard(card)
    Q->>Q: 属性値加算
    Q->>Q: 安定値更新
    Q-->>G: Progress
    G->>E: Publish(CardPlayedEvent)
    E->>U: 表示更新
```

---

## 依頼達成データフロー

```mermaid
sequenceDiagram
    participant G as GameService
    participant Q as QuestService
    participant P as Player
    participant S as SaveDataRepository
    participant E as EventBus

    G->>Q: CheckCompletion()
    Q->>Q: 条件判定
    Q-->>G: QuestCompleted
    G->>P: AddGold(reward)
    G->>P: AddFame(fame)
    G->>S: Save()
    G->>E: Publish(QuestCompletedEvent)
```

---

## ターン進行データフロー

```mermaid
sequenceDiagram
    participant U as UI
    participant G as GameService
    participant D as DeckService
    participant P as Player
    participant E as EventBus

    U->>G: EndTurn()
    G->>D: DiscardHand()
    D->>D: Hand → Discard
    G->>D: DrawCards(5)
    D->>D: Deck → Hand
    G->>P: AddEnergy(3)
    G->>G: TurnCount++
    G->>E: Publish(TurnStartedEvent)
    E->>U: 表示更新
```

---

## セーブ/ロードデータフロー

### セーブ

```mermaid
flowchart LR
    A[GameState] --> B[SaveDataRepository]
    B --> C[JSON Serialize]
    C --> D[SaveData.json]
```

### ロード

```mermaid
flowchart LR
    A[SaveData.json] --> B[JSON Deserialize]
    B --> C[SaveDataRepository]
    C --> D[GameState復元]
```

---

## イベント一覧

| イベント名 | 発行タイミング | 購読者 |
|-----------|---------------|--------|
| CardPlayedEvent | カードプレイ完了時 | UI, SoundManager |
| QuestCompletedEvent | 依頼達成時 | UI, SoundManager |
| TurnStartedEvent | ターン開始時 | UI |
| TurnEndedEvent | ターン終了時 | UI |
| ExplosionEvent | 暴発発生時 | UI, SoundManager |
| GameOverEvent | ゲーム終了時 | UI |

---

## データ検証フロー

```mermaid
flowchart TD
    A[入力データ] --> B{バリデーション}
    B -->|OK| C[処理実行]
    B -->|NG| D[エラーハンドリング]
    C --> E[状態更新]
    D --> F[エラー通知]
```

### 検証項目

| 検証対象 | 検証内容 |
|---------|---------|
| カードプレイ | エネルギー足りるか |
| カードプレイ | 手札にあるか |
| 依頼選択 | 有効な依頼か |
| セーブデータ | スキーマ整合性 |
| マスターデータ | 必須フィールド存在 |

---

## 参照

- [01-architecture.md](../../spec/design/01-architecture.md) - システムアーキテクチャ
- [07-data-schema.md](../../spec/design/07-data-schema.md) - データスキーマ
- [08-infrastructure.md](../../spec/design/08-infrastructure.md) - インフラストラクチャ

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2025-12-20 | 1.0 | 初版作成 |
