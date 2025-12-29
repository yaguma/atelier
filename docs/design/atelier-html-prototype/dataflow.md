# データフロー図

## 概要

🔵 本ドキュメントは、「アトリエ」HTMLプロトタイプのゲームフロー・データフローを可視化する。

**参照元**: [docs/spec/atelier-game-requirements.md](../../spec/atelier-game-requirements.md) v5.1

---

## ゲーム全体フロー

🔵 **起動からゲーム終了まで**

```mermaid
flowchart TD
    Start[ゲーム起動] --> Boot[BootScene]
    Boot --> LoadAssets[アセット読込]
    LoadAssets --> LoadMaster[マスターデータ読込]
    LoadMaster --> Title[TitleScene]

    Title --> NewGame{新規ゲーム?}
    NewGame -->|Yes| InitGame[ゲーム初期化]
    NewGame -->|No| LoadSave[セーブ読込]
    LoadSave --> InitGame
    InitGame --> MainGame[MainGameScene]

    MainGame --> GameLoop[メインループ]
    GameLoop --> CheckWin{開拓度100%?}
    CheckWin -->|Yes| Win[勝利]
    CheckWin -->|No| CheckLose{消耗度100%?}
    CheckLose -->|Yes| Lose[敗北]
    CheckLose -->|No| GameLoop

    Win --> Result[ResultScene]
    Lose --> Result
    Result --> Title
```

---

## メインループ詳細

🔵 **プレイヤーの1ターン**

```mermaid
flowchart TD
    subgraph TurnStart["ターン開始"]
        A[状況把握] --> B[UI更新]
        B --> C[依頼期限チェック]
    end

    subgraph PlayerAction["プレイヤー行動選択"]
        C --> D{行動選択}
        D -->|依頼受注| E[QuestService.acceptQuest]
        D -->|依頼納品| F[QuestService.deliverQuest]
        D -->|採取| G[GatheringService.gather]
        D -->|調合| H[CraftingService.craft]
        D -->|買い物| I[ShopService.purchase]
        D -->|デッキ確認| J[デッキ表示のみ]
    end

    subgraph TurnEnd["ターン終了"]
        E --> K[ターン消費なし]
        F --> K
        G --> L[ターン消費]
        H --> L
        I --> L
        J --> K

        K --> M[消耗度更新]
        L --> M
        M --> N[勝敗判定]
    end

    N --> TurnStart
```

---

## 行動別データフロー

### 依頼受注フロー

🔵 **0ターン消費**

```mermaid
sequenceDiagram
    participant P as Player
    participant UI as UIManager
    participant QS as QuestService
    participant State as GameState

    P->>UI: 依頼タブを開く
    UI->>State: 受注可能な依頼を取得
    State-->>UI: quests.available
    UI-->>P: 依頼一覧を表示

    P->>UI: 依頼を選択して受注
    UI->>QS: acceptQuest(quest)
    QS->>QS: 受注上限チェック
    QS->>State: 依頼を available → active へ
    QS->>UI: QUEST_ACCEPTED イベント
    UI-->>P: 受注完了表示
```

### 依頼納品フロー

🔵 **0ターン消費**

```mermaid
sequenceDiagram
    participant P as Player
    participant UI as UIManager
    participant QS as QuestService
    participant AC as AttributeCalculator
    participant State as GameState

    P->>UI: 納品ボタンをクリック
    UI->>State: 調合済みアイテムを取得
    State-->>UI: craftedItems
    UI-->>P: 納品可能アイテム一覧

    P->>UI: アイテムを選択して納品
    UI->>QS: deliverQuest(quest, item)
    QS->>AC: 要件判定
    AC-->>QS: 判定結果

    alt 要件満たす
        QS->>State: 報酬適用（お金、開拓度、消耗度）
        QS->>State: 依頼を completed へ
        QS->>State: アイテムを消費
        QS->>UI: QUEST_DELIVERED イベント
        UI-->>P: 納品成功・報酬表示
    else 要件満たさない
        QS-->>UI: エラー
        UI-->>P: 要件不足メッセージ
    end
```

### 採取フロー

🔵 **1〜2ターン消費**

```mermaid
sequenceDiagram
    participant P as Player
    participant UI as UIManager
    participant GS as GatheringService
    participant RG as RandomGenerator
    participant State as GameState
    participant TM as TurnManager

    P->>UI: 採取タブを開く
    UI-->>P: 採取地一覧を表示

    P->>UI: 採取地を選択
    UI->>GS: gather(locationId)
    GS->>GS: デッキ上限チェック

    GS->>RG: カードをランダム選択
    RG-->>GS: 選択されたカードID

    GS->>State: カードをデッキに追加
    GS->>TM: ターン消費
    TM->>State: 消耗度更新
    TM->>TM: 勝敗判定

    GS->>UI: GATHERING_COMPLETE イベント
    UI-->>P: 獲得カード表示
```

### 調合フロー

🔵 **1〜2ターン消費**

```mermaid
sequenceDiagram
    participant P as Player
    participant UI as UIManager
    participant CS as CraftingService
    participant AC as AttributeCalculator
    participant State as GameState
    participant TM as TurnManager

    P->>UI: 調合タブを開く
    UI->>State: デッキのカードを取得
    State-->>UI: deck.cards
    UI-->>P: カード一覧を表示

    P->>UI: カードを選択（2〜5枚）
    UI->>UI: リアルタイムで属性合計表示

    P->>UI: 調合ボタンをクリック
    UI->>CS: craft(selectedCards)
    CS->>AC: 属性計算
    AC-->>CS: 合算属性

    CS->>CS: カテゴリ判定（武器/薬/道具）
    CS->>State: カードをデッキから削除
    CS->>State: 調合アイテムを追加

    CS->>TM: ターン消費
    TM->>State: 消耗度更新
    TM->>TM: 勝敗判定

    CS->>UI: CRAFTING_COMPLETE イベント
    UI-->>P: 調合結果表示
```

### 買い物フロー

🟡 **1ターン消費**

```mermaid
sequenceDiagram
    participant P as Player
    participant UI as UIManager
    participant SS as ShopService
    participant State as GameState
    participant TM as TurnManager

    P->>UI: 買い物タブを開く
    UI->>SS: ショップラインナップ取得
    SS-->>UI: shopItems
    UI-->>P: 商品一覧を表示

    P->>UI: 商品を選択して購入
    UI->>SS: purchase(shopItem)
    SS->>SS: お金チェック
    SS->>SS: デッキ上限チェック

    alt 購入可能
        SS->>State: お金を減らす
        SS->>State: カードをデッキに追加
        SS->>TM: ターン消費
        TM->>State: 消耗度更新
        SS->>UI: SHOP_PURCHASE イベント
        UI-->>P: 購入完了表示
    else 購入不可
        SS-->>UI: エラー
        UI-->>P: エラーメッセージ
    end
```

---

## 状態遷移図

### ゲーム状態遷移

🔵

```mermaid
stateDiagram-v2
    [*] --> Boot
    Boot --> Title: アセット読込完了
    Title --> Playing: ゲーム開始
    Playing --> Win: 開拓度100%
    Playing --> Lose: 消耗度100%
    Win --> Title: タイトルへ
    Lose --> Title: タイトルへ
```

### 依頼状態遷移

🔵

```mermaid
stateDiagram-v2
    [*] --> Available: 依頼生成
    Available --> Active: 受注
    Active --> Completed: 納品成功
    Active --> Expired: 期限切れ
    Completed --> [*]
    Expired --> [*]
```

### タブ状態遷移

🟡

```mermaid
stateDiagram-v2
    [*] --> QuestTab
    QuestTab --> GatheringTab: タブクリック
    QuestTab --> CraftingTab: タブクリック
    QuestTab --> ShopTab: タブクリック
    QuestTab --> DeckTab: タブクリック

    GatheringTab --> QuestTab: タブクリック
    GatheringTab --> CraftingTab: タブクリック
    GatheringTab --> ShopTab: タブクリック
    GatheringTab --> DeckTab: タブクリック

    CraftingTab --> QuestTab: タブクリック
    CraftingTab --> GatheringTab: タブクリック
    CraftingTab --> ShopTab: タブクリック
    CraftingTab --> DeckTab: タブクリック

    ShopTab --> QuestTab: タブクリック
    ShopTab --> GatheringTab: タブクリック
    ShopTab --> CraftingTab: タブクリック
    ShopTab --> DeckTab: タブクリック

    DeckTab --> QuestTab: タブクリック
    DeckTab --> GatheringTab: タブクリック
    DeckTab --> CraftingTab: タブクリック
    DeckTab --> ShopTab: タブクリック
```

---

## イベントフロー図

🟡 **EventEmitterによる通知**

```mermaid
graph LR
    subgraph Services
        QS[QuestService]
        GS[GatheringService]
        CS[CraftingService]
        SS[ShopService]
        TM[TurnManager]
    end

    subgraph Events
        QA[QUEST_ACCEPTED]
        QD[QUEST_DELIVERED]
        GC[GATHERING_COMPLETE]
        CC[CRAFTING_COMPLETE]
        SP[SHOP_PURCHASE]
        EC[EXPLORATION_CHANGED]
        EXC[EXHAUSTION_CHANGED]
        MC[MONEY_CHANGED]
        GW[GAME_WIN]
        GL[GAME_LOSE]
    end

    subgraph UI
        SB[StatusBar]
        QT[QuestTab]
        GT[GatheringTab]
        CT[CraftingTab]
        ST[ShopTab]
        DT[DeckTab]
    end

    QS --> QA --> QT
    QS --> QD --> QT
    QS --> EC --> SB
    QS --> MC --> SB

    GS --> GC --> GT
    GS --> GC --> DT

    CS --> CC --> CT
    CS --> CC --> DT

    SS --> SP --> ST
    SS --> SP --> DT
    SS --> MC --> SB

    TM --> EXC --> SB
    TM --> GW --> Result[ResultScene]
    TM --> GL --> Result
```

---

## データ永続化フロー

🟡 **localStorageを使用**

```mermaid
sequenceDiagram
    participant Game as GameManager
    participant Repo as LocalStorageRepository
    participant LS as localStorage

    Note over Game,LS: セーブ時
    Game->>Repo: save(gameState)
    Repo->>Repo: JSON.stringify(state)
    Repo->>LS: setItem('atelier_save', json)

    Note over Game,LS: ロード時
    Game->>Repo: load()
    Repo->>LS: getItem('atelier_save')
    LS-->>Repo: json
    Repo->>Repo: JSON.parse(json)
    Repo-->>Game: gameState
```

---

## 参照

- [architecture.md](architecture.md) - システムアーキテクチャ
- [core-systems.md](core-systems.md) - コアシステム設計
- [game-mechanics.md](game-mechanics.md) - ゲームメカニクス設計

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2025-12-29 | 1.0 | 初版作成（HTMLプロトタイプ用） |
