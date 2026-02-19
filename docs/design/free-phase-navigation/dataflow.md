# フェーズ自由遷移システム データフロー図

**作成日**: 2026-02-19
**関連アーキテクチャ**: [architecture.md](architecture.md)
**関連要件定義**: [requirements.md](../../spec/free-phase-navigation/requirements.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: EARS要件定義書・設計文書・ユーザヒアリングを参考にした確実なフロー
- 🟡 **黄信号**: EARS要件定義書・設計文書・ユーザヒアリングから妥当な推測によるフロー
- 🔴 **赤信号**: EARS要件定義書・設計文書・ユーザヒアリングにない推測によるフロー

---

## 1. システム全体のデータフロー 🔵

**信頼性**: 🔵 *既存設計 `docs/design/atelier-guild-rank/dataflow.md` v2.0.0・要件定義より*

```mermaid
flowchart TD
    subgraph User["ユーザー操作"]
        TabClick[タブクリック]
        ActionExec[行動実行<br>採取/調合]
        DayEndBtn[日終了ボタン]
    end

    subgraph Presentation["Presentation層"]
        PhaseTab[PhaseTabUI]
        MainScene[MainScene]
        PhaseUIs[各フェーズUI]
        APPreview[AP超過プレビュー]
        DayNotify[日進行通知]
    end

    subgraph Application["Application層"]
        GFM[GameFlowManager]
        SM[StateManager]
        EB[EventBus]
    end

    subgraph Domain["Domain層"]
        APOS[APOverflowService]
        GatherS[GatheringService]
        AlchemyS[AlchemyService]
        QuestS[QuestService]
        QuestBoard[QuestBoardService]
    end

    TabClick --> PhaseTab
    PhaseTab -->|switchPhase| GFM
    GFM -->|setPhase| SM
    SM -->|PHASE_CHANGED| EB
    EB --> MainScene
    MainScene -->|showPhase| PhaseUIs

    ActionExec --> PhaseUIs
    PhaseUIs -->|consumeAP| GFM
    GFM -->|calculate| APOS
    APOS -->|超過あり| APPreview
    APPreview -->|確認後| GFM
    GFM -->|endDay| SM
    SM -->|DAY_ENDED/DAY_STARTED| EB
    EB --> DayNotify

    DayEndBtn --> GFM
    GFM -->|endDay| SM
```

---

## 2. フェーズ自由遷移フロー 🔵

**信頼性**: 🔵 *REQ-001・REQ-001-01〜REQ-001-03・ヒアリングQ1より*

### 2.1 通常のフェーズ切り替え

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant Tab as PhaseTabUI
    participant GFM as GameFlowManager
    participant SM as StateManager
    participant EB as EventBus
    participant MS as MainScene

    U->>Tab: タブクリック（例: 調合）
    Tab->>GFM: switchPhase(ALCHEMY)
    GFM->>GFM: validatePhaseSwitch()
    Note over GFM: 進行中の操作チェック

    alt 操作なし
        GFM->>SM: setPhase(ALCHEMY)
        SM->>SM: canTransitionTo(ALCHEMY)
        SM->>SM: 状態更新（currentPhase = ALCHEMY）
        SM->>EB: emit(PHASE_CHANGED, {prev, new})
        EB->>MS: PHASE_CHANGED イベント
        MS->>MS: showPhase(ALCHEMY)
        MS->>Tab: updateActiveTab(ALCHEMY)
    end
```

**詳細ステップ**:
1. ユーザーがフッターのフェーズタブをクリック
2. PhaseTabUI が GameFlowManager.switchPhase() を呼び出し
3. GameFlowManager が現在の進行中操作をチェック
4. 操作がなければ StateManager.setPhase() で状態更新
5. PHASE_CHANGED イベントが EventBus 経由で全コンポーネントに通知
6. MainScene が showPhase() で対応するフェーズUIを表示

### 2.2 採取セッション中のフェーズ切り替え 🟡

**信頼性**: 🟡 *EDGE-001・REQ-001-03から妥当な推測*

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant Tab as PhaseTabUI
    participant GFM as GameFlowManager
    participant Dialog as 確認ダイアログ
    participant Gather as GatheringPhaseUI
    participant SM as StateManager
    participant EB as EventBus
    participant MS as MainScene

    U->>Tab: タブクリック（例: 依頼）
    Tab->>GFM: switchPhase(QUEST_ACCEPT)
    GFM->>GFM: validatePhaseSwitch()
    Note over GFM: 採取セッション進行中を検出

    GFM->>Dialog: 中断確認表示
    Dialog->>U: 「採取を中断しますか？」

    alt 中断する
        U->>Dialog: 「中断する」
        Dialog->>Gather: abortSession()
        Gather->>Gather: セッション破棄
        GFM->>SM: setPhase(QUEST_ACCEPT)
        SM->>EB: emit(PHASE_CHANGED)
        EB->>MS: PHASE_CHANGED
        MS->>MS: showPhase(QUEST_ACCEPT)
    else キャンセル
        U->>Dialog: 「キャンセル」
        Note over GFM: フェーズ切り替えを中止
    end
```

---

## 3. AP超過自動日進行フロー 🔵

**信頼性**: 🔵 *REQ-003・REQ-003-01〜REQ-003-06・ヒアリングQ2/Q5/Q10より*

### 3.1 採取でのAP超過 🔵

**信頼性**: 🔵 *REQ-003-05・ヒアリングQ2/Q3より*

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant Gather as GatheringPhaseUI
    participant GS as GatheringService
    participant APOS as APOverflowService
    participant Preview as APOverflowPreview
    participant GFM as GameFlowManager
    participant SM as StateManager
    participant EB as EventBus

    U->>Gather: 採取完了
    Gather->>GS: endGathering(sessionId)
    GS->>GS: calculateGatheringCost()
    GS-->>Gather: {actionPointCost, result}

    Gather->>APOS: calculateOverflow(currentAP, actionPointCost)
    APOS-->>Gather: {hasOverflow, daysConsumed, nextDayAP}

    alt AP超過あり
        Gather->>Preview: show(消費AP, 翌日AP, 消費日数)
        Preview->>U: プレビュー表示
        U->>Preview: 確認
        Preview->>GFM: processAPOverflow(daysConsumed, nextDayAP)

        loop 消費日数分
            GFM->>GFM: endDay()
            GFM->>SM: 日終了処理
            SM->>EB: emit(DAY_ENDED)
            GFM->>GFM: startDay()
            SM->>EB: emit(DAY_STARTED)
        end

        GFM->>SM: updateState({actionPoints: nextDayAP})
        GFM->>GFM: checkGameOver()
    else AP超過なし
        Gather->>SM: spendActionPoints(actionPointCost)
    end
```

### 3.2 調合でのAP超過 🔵

**信頼性**: 🔵 *REQ-003-06・ヒアリングQ8より*

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant Alchemy as AlchemyPhaseUI
    participant AS as AlchemyService
    participant APOS as APOverflowService
    participant Preview as APOverflowPreview
    participant GFM as GameFlowManager
    participant SM as StateManager

    U->>Alchemy: 調合実行
    Alchemy->>AS: getAlchemyCost(recipeId)
    AS-->>Alchemy: apCost

    Alchemy->>APOS: calculateOverflow(currentAP, apCost)
    APOS-->>Alchemy: {hasOverflow, daysConsumed, nextDayAP}

    alt AP超過あり
        Alchemy->>Preview: show(消費AP, 翌日AP, 消費日数)
        Preview->>U: プレビュー表示
        U->>Preview: 確認
        Preview->>GFM: processAPOverflow(daysConsumed, nextDayAP)
        Note over GFM: 日進行処理（採取と同じ）
        GFM->>AS: craft(recipeId, materials)
        AS-->>Alchemy: craftResult
    else AP超過なし
        Alchemy->>SM: spendActionPoints(apCost)
        Alchemy->>AS: craft(recipeId, materials)
        AS-->>Alchemy: craftResult
    end
```

### 3.3 複数日消費のケース 🟡

**信頼性**: 🟡 *REQ-003-03・EDGE-002から妥当な推測*

```mermaid
flowchart TD
    A[AP消費アクション] --> B{超過AP計算}
    B -->|超過なし| C[通常AP消費]
    B -->|超過あり| D[消費日数 = ceil超過AP / MAX_AP]

    D --> E{消費日数}
    E -->|1日| F[endDay x1]
    E -->|2日以上| G[endDay x N回<br>順次実行]

    F --> H[翌日AP設定]
    G --> H

    H --> I{ゲームオーバー判定}
    I -->|残日数 > 0| J[続行]
    I -->|残日数 <= 0| K[ゲームオーバー]
```

**各endDay()で実行される処理** 🔵:
1. 残り日数を1減算
2. 依頼期限を更新（`updateDeadlines()`）
3. 手札補充（`refillHand()`）
4. 掲示板更新（訪問依頼の更新判定）
5. ランク判定
6. セーブ

---

## 4. 採取2段階化フロー 🔵

**信頼性**: 🔵 *REQ-002・REQ-002-01〜REQ-002-05・ヒアリングQ4・既存設計より*

### 4.1 場所選択→ドラフト採取

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant Loc as LocationSelectUI
    participant DS as DeckService
    participant Gather as GatheringPhaseUI
    participant GS as GatheringService

    Note over U,GS: 採取フェーズ開始

    U->>Loc: 採取フェーズに遷移
    Loc->>DS: getHand()
    DS-->>Loc: 手札カード一覧
    Loc->>Loc: 採取地カードをフィルタ
    Loc->>U: マップ表示（採取地一覧）
    Note over Loc: 各採取地:<br>移動APコスト<br>採取可能素材プレビュー

    U->>Loc: 採取地を選択
    Loc->>Loc: 選択可能チェック（手札にカードあり）
    Loc->>Gather: startGathering(locationCardId)
    Gather->>GS: startDraftGathering(cardId)
    GS-->>Gather: draftSession

    Note over U,GS: 既存ドラフト採取フロー開始
    loop 採取ラウンド
        Gather->>U: 素材3つ提示
        U->>Gather: 素材選択 or スキップ
        Gather->>GS: selectMaterial() or skipSelection()
    end

    Gather->>GS: endGathering(sessionId)
    GS-->>Gather: gatheringResult
    Note over Gather: AP消費→超過チェックへ
```

### 4.2 場所選択画面の状態遷移 🔵

**信頼性**: 🔵 *REQ-002-01〜REQ-002-04・ヒアリングQ4より*

```mermaid
stateDiagram-v2
    [*] --> LocationSelect: 採取フェーズ進入

    LocationSelect --> LocationDetail: 採取地クリック
    LocationDetail --> LocationSelect: 戻るボタン
    LocationDetail --> DraftSession: 「採取開始」ボタン

    DraftSession --> GatherResult: 全ラウンド完了
    GatherResult --> LocationSelect: 「続けて採取」
    GatherResult --> [*]: フェーズ切り替え

    LocationSelect --> [*]: フェーズ切り替え
    DraftSession --> [*]: 中断確認→中断

    state LocationSelect {
        MapView: マップ表示
        CardFilter: 手札カードフィルタ
    }

    state LocationDetail {
        APCostDisplay: 移動APコスト
        MaterialPreview: 素材プレビュー
        StartButton: 採取開始ボタン
    }
```

---

## 5. 明示的日終了フロー 🔵

**信頼性**: 🔵 *REQ-004・REQ-004-01・ヒアリングQ7より*

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant Footer as FooterUI
    participant GFM as GameFlowManager
    participant SM as StateManager
    participant EB as EventBus
    participant QS as QuestService
    participant DS as DeckService

    U->>Footer: 「日終了」ボタンクリック
    Footer->>GFM: requestEndDay()
    GFM->>GFM: endDay()

    Note over GFM: 日終了処理

    GFM->>SM: updateState({remainingDays: -1})
    GFM->>QS: updateDeadlines()
    GFM->>DS: refillHand()
    GFM->>SM: updateState({actionPoints: MAX_AP})
    Note over SM: AP回復（超過なしの場合はMAX）
    GFM->>SM: updateState({currentDay: +1})
    SM->>EB: emit(DAY_ENDED, {day})

    GFM->>GFM: startDay()
    SM->>EB: emit(DAY_STARTED, {day, ap})

    GFM->>GFM: checkGameOver()
    alt ゲームオーバー
        GFM->>SM: シーン遷移（GameOverScene）
    else 続行
        Note over U: 新しい日で続行
    end
```

---

## 6. 依頼掲示板フロー 🔵

**信頼性**: 🔵 *REQ-005・REQ-005-01〜REQ-005-03・ヒアリングQ6より*

### 6.1 掲示板更新フロー

```mermaid
sequenceDiagram
    participant GFM as GameFlowManager
    participant QBS as QuestBoardService
    participant QS as QuestService
    participant SM as StateManager

    Note over GFM: 日開始処理内

    GFM->>QBS: updateBoard(currentDay)

    QBS->>QBS: 期限切れ依頼を除去
    QBS->>QBS: 訪問依頼の更新判定
    alt 更新タイミング（数日ごと）
        QBS->>QS: generateVisitorQuests(rank)
        QS-->>QBS: visitorQuests
        QBS->>QBS: 訪問依頼を差し替え
    end

    QBS->>QBS: 掲示板依頼の追加判定
    alt 掲示板枠に空きあり
        QBS->>QS: generateBoardQuests(rank, vacancies)
        QS-->>QBS: boardQuests
        QBS->>QBS: 掲示板に追加（累積）
    end

    QBS-->>SM: updateState({boardQuests, visitorQuests})
```

### 6.2 依頼受注フロー 🔵

**信頼性**: 🔵 *REQ-005・既存QuestService.acceptQuest()より*

```mermaid
flowchart TD
    A[依頼フェーズ表示] --> B{依頼元}
    B -->|掲示板| C[掲示板依頼一覧]
    B -->|訪問者| D[訪問依頼一覧]

    C --> E[依頼選択]
    D --> E

    E --> F{受注上限チェック<br>3件以下？}
    F -->|OK| G[依頼受注<br>acceptQuest]
    F -->|上限| H[受注不可メッセージ]

    G --> I[掲示板から削除]
    G --> J[受注済み依頼に追加]
```

---

## 7. IGameState 変更点 🔵

**信頼性**: 🔵 *既存設計・要件定義より*

### 新規追加フィールド 🟡

**信頼性**: 🟡 *要件から妥当な推測（具体的なフィールド名は推測）*

```typescript
// 既存フィールド（変更なし）
currentDay: number;
remainingDays: number;
currentPhase: GamePhase;
gold: number;
actionPoints: number;   // 既存（AP残量管理）

// 新規追加フィールド
apOverflow: number;            // 前日のAP超過分（翌日AP回復時に差し引き）
boardQuests: Quest[];          // 掲示板依頼（累積）
visitorQuests: Quest[];        // 訪問依頼
lastVisitorUpdateDay: number;  // 訪問依頼の最終更新日
```

### 削除・変更フィールド 🔵

**信頼性**: 🔵 *要件定義・既存設計より*

```typescript
// 変更なし
// currentPhaseは既存のまま（GamePhaseの4値）
// actionPointsの回復ロジックのみ変更（MAX_AP - apOverflow）
```

---

## 8. エラーハンドリングフロー 🟡

**信頼性**: 🟡 *既存実装パターン・EDGE-001〜EDGE-103から妥当な推測*

```mermaid
flowchart TD
    A[操作実行] --> B{エラー種別}

    B -->|AP不足| C{AP残量 = 0？}
    C -->|Yes| D[「日終了」を促すメッセージ<br>EDGE-101]
    C -->|No| E[AP超過プレビュー表示]

    B -->|採取中断| F[中断確認ダイアログ<br>EDGE-001]
    F -->|中断| G[セッション破棄]
    F -->|キャンセル| H[操作継続]

    B -->|採取地カードなし| I[「採取地カードがありません」<br>ショップ誘導<br>EDGE-103]

    B -->|ゲームオーバー| J[ゲームオーバーシーン遷移<br>REQ-003-04]

    B -->|依頼受注上限| K[受注不可メッセージ<br>REQ-401]
```

---

## 9. 状態管理フロー

### フェーズ状態遷移 🔵

**信頼性**: 🔵 *REQ-001・REQ-006より*

```mermaid
stateDiagram-v2
    [*] --> QUEST_ACCEPT: ゲーム開始 / 日開始

    QUEST_ACCEPT --> GATHERING: タブクリック
    QUEST_ACCEPT --> ALCHEMY: タブクリック
    QUEST_ACCEPT --> DELIVERY: タブクリック

    GATHERING --> QUEST_ACCEPT: タブクリック
    GATHERING --> ALCHEMY: タブクリック
    GATHERING --> DELIVERY: タブクリック

    ALCHEMY --> QUEST_ACCEPT: タブクリック
    ALCHEMY --> GATHERING: タブクリック
    ALCHEMY --> DELIVERY: タブクリック

    DELIVERY --> QUEST_ACCEPT: タブクリック
    DELIVERY --> GATHERING: タブクリック
    DELIVERY --> ALCHEMY: タブクリック

    QUEST_ACCEPT --> DayEnd: 日終了ボタン
    GATHERING --> DayEnd: 日終了ボタン / AP超過
    ALCHEMY --> DayEnd: 日終了ボタン / AP超過
    DELIVERY --> DayEnd: 日終了ボタン

    DayEnd --> QUEST_ACCEPT: startDay()
```

### AP状態遷移 🔵

**信頼性**: 🔵 *REQ-003・REQ-003-01・ヒアリングQ5より*

```mermaid
stateDiagram-v2
    [*] --> FullAP: 日開始（AP=3）
    [*] --> ReducedAP: 日開始（AP=3-超過分）

    FullAP --> PartialAP: 行動でAP消費
    ReducedAP --> PartialAP: 行動でAP消費
    PartialAP --> PartialAP: 行動でAP消費

    PartialAP --> ZeroAP: AP=0
    ZeroAP --> OverflowAP: 行動でAP超過

    OverflowAP --> DayAdvance: 自動日進行
    DayAdvance --> FullAP: 超過分=0
    DayAdvance --> ReducedAP: 超過分>0

    FullAP --> DayEnd: 明示的日終了
    PartialAP --> DayEnd: 明示的日終了
    ZeroAP --> DayEnd: 明示的日終了
    DayEnd --> FullAP: startDay()
```

---

## 関連文書

- **アーキテクチャ**: [architecture.md](architecture.md)
- **型定義**: [interfaces.ts](interfaces.ts)
- **要件定義**: [requirements.md](../../spec/free-phase-navigation/requirements.md)
- **ユーザストーリー**: [user-stories.md](../../spec/free-phase-navigation/user-stories.md)
- **受け入れ基準**: [acceptance-criteria.md](../../spec/free-phase-navigation/acceptance-criteria.md)

---

## 信頼性レベルサマリー

- 🔵 青信号: 18件 (82%)
- 🟡 黄信号: 4件 (18%)
- 🔴 赤信号: 0件 (0%)

**品質評価**: ✅ 高品質
