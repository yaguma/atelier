# システムアーキテクチャ設計

## システムアーキテクチャ

### レイヤー構造

```
┌─────────────────────────────────────────────┐
│          Presentation Layer                 │
│  (UI/View/MonoBehaviour Components)         │
│  - SceneControllers                         │
│  - UIViews                                  │
│  - AnimationControllers                     │
└─────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────┐
│         Application Layer                   │
│  (Game Logic/State Management)              │
│  - GameManager                              │
│  - StateManager                             │
│  - EventBus                                 │
└─────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────┐
│           Domain Layer                      │
│  (Business Logic/Core Systems)              │
│  - CardSystem                               │
│  - QuestSystem (顧客依頼)                   │
│  - DeckSystem                               │
│  - AlchemySystem (錬金システム)              │
│  - MapSystem                                │
│  - MetaProgressionSystem                    │
└─────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────┐
│      Infrastructure Layer                   │
│  (Data Access/External Systems)             │
│  - SaveDataRepository                       │
│  - ConfigDataLoader                         │
│  - RandomGenerator (シード管理)              │
│  - AudioManager                             │
└─────────────────────────────────────────────┘
```

### コンポーネント図

```mermaid
graph TB
    subgraph "Presentation"
        UI[UIManager]
        Scene[SceneController]
    end

    subgraph "Application"
        GM[GameManager]
        SM[StateManager]
        EB[EventBus]
    end

    subgraph "Domain"
        CardSys[CardSystem]
        QuestSys[QuestSystem]
        DeckSys[DeckSystem]
        AlchemySys[AlchemySystem]
        MapSys[MapSystem]
        MetaSys[MetaProgressionSystem]
    end

    subgraph "Infrastructure"
        SaveRepo[SaveDataRepository]
        Config[ConfigDataLoader]
        RNG[RandomGenerator]
        Audio[AudioManager]
    end

    UI --> GM
    Scene --> GM
    GM --> SM
    GM --> EB
    SM --> CardSys
    SM --> QuestSys
    SM --> DeckSys
    SM --> AlchemySys
    SM --> MapSys
    SM --> MetaSys
    CardSys --> SaveRepo
    DeckSys --> SaveRepo
    MetaSys --> SaveRepo
    CardSys --> Config
    QuestSys --> Config
    MapSys --> RNG
    UI --> Audio
```

## データフロー図

### ゲーム全体のデータフロー

```mermaid
flowchart TD
    Start[ゲーム起動] --> LoadConfig[設定データ読み込み]
    LoadConfig --> LoadSave{セーブデータ存在?}
    LoadSave -->|Yes| LoadData[セーブデータ読み込み]
    LoadSave -->|No| NewGame[新規ゲームデータ作成]
    LoadData --> Title[タイトル画面]
    NewGame --> Title

    Title --> StyleSelect[スタイル選択]
    StyleSelect --> InitDeck[初期デッキ生成]
    InitDeck --> MapGen[マップ生成]
    MapGen --> MapView[マップ画面]

    MapView --> NodeSelect{ノード選択}
    NodeSelect -->|依頼| QuestNode[依頼ノード]
    NodeSelect -->|商人| MerchantNode[商人ノード]
    NodeSelect -->|実験| ExperimentNode[実験ノード]
    NodeSelect -->|魔物| MonsterNode[魔物ノード]
    NodeSelect -->|ボス| BossNode[ボス依頼]

    QuestNode --> Battle[戦闘フェーズ]
    Battle --> CheckComplete{依頼達成?}
    CheckComplete -->|Yes| Reward[報酬獲得]
    CheckComplete -->|No| CheckExplosion{暴発発生?}
    CheckExplosion -->|Yes| Penalty[ペナルティ]
    CheckExplosion -->|No| MapView
    Reward --> MapView
    Penalty --> MapView

    MerchantNode --> Shop[ショップ画面]
    Shop --> MapView

    BossNode --> BossBattle[ボス戦闘]
    BossBattle --> CheckWin{クリア?}
    CheckWin -->|Yes| Victory[勝利]
    CheckWin -->|No| Defeat[敗北]

    Victory --> MetaReward[メタ通貨獲得]
    Defeat --> MetaReward
    MetaReward --> SaveGame[セーブ]
    SaveGame --> Title
```

### カードプレイのデータフロー

```mermaid
sequenceDiagram
    participant Player
    participant UI
    participant CardSystem
    participant QuestSystem
    participant AlchemySystem
    participant DeckSystem

    Player->>UI: カードを選択
    UI->>CardSystem: PlayCard(cardId, questId)
    CardSystem->>DeckSystem: RemoveFromHand(cardId)
    CardSystem->>AlchemySystem: ApplyCardEffect(card, quest)
    AlchemySystem->>QuestSystem: UpdateQuestProgress(questId, attributes)
    QuestSystem->>AlchemySystem: CalculateStability()
    AlchemySystem-->>QuestSystem: stability
    QuestSystem->>QuestSystem: CheckExplosion()
    alt 暴発発生
        QuestSystem->>Player: ExplosionEvent
        QuestSystem->>DeckSystem: LoseRandomCard()
    else 安定
        QuestSystem->>QuestSystem: UpdateProgress()
    end
    QuestSystem-->>UI: UpdateQuestUI()
```

## Unityシーン構成

### シーン一覧

| シーン名 | 説明 | 主要な要素 |
|---------|------|-----------|
| **BootScene** | 初期化・ロード画面 | - 設定データ読み込み<br>- セーブデータ確認<br>- DontDestroyOnLoad のマネージャー生成 |
| **TitleScene** | タイトル画面 | - 新規ゲーム<br>- コンティニュー<br>- 設定<br>- メタアンロック画面 |
| **StyleSelectScene** | スタイル選択 | - スタイル一覧表示<br>- 初期デッキプレビュー |
| **MapScene** | マップ進行 | - ノード配置<br>- ルート選択<br>- 現在位置表示 |
| **QuestScene** | 依頼達成(戦闘) | - 依頼ボード(3件)<br>- 手札表示<br>- デッキ/捨て札状態<br>- 錬金釜エリア |
| **MerchantScene** | 商人ノード | - カード購入<br>- カード強化<br>- カード削除 |
| **ResultScene** | リザルト画面 | - 獲得報酬表示<br>- メタ通貨獲得<br>- 統計情報 |

### シーン遷移図

```mermaid
stateDiagram-v2
    [*] --> BootScene
    BootScene --> TitleScene
    TitleScene --> StyleSelectScene: 新規ゲーム
    TitleScene --> MapScene: コンティニュー
    StyleSelectScene --> MapScene
    MapScene --> QuestScene: 依頼ノード
    MapScene --> MerchantScene: 商人ノード
    MapScene --> ResultScene: ボスクリア/敗北
    QuestScene --> MapScene: 依頼完了
    MerchantScene --> MapScene
    ResultScene --> TitleScene
```
