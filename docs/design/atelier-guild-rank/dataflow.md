# データフロー設計書

**バージョン**: 2.0.0
**作成日**: 2026-01-14
**対象**: アトリエ錬金術ゲーム（ギルドランク制）HTML/Phaser版

---

## 概要

本ドキュメントは、Phaserを使用したゲームのデータフローを定義する。
レイヤー間のデータの流れ、イベント駆動のパターン、状態管理を中心に記載する。

### 信頼性レベル凡例

- 🔵 **青信号**: 要件定義書に詳細記載
- 🟡 **黄信号**: 要件定義書から妥当な推測
- 🔴 **赤信号**: 要件定義書にない推測

---

## 1. 全体データフロー 🟡

```mermaid
flowchart TB
    subgraph Presentation["Presentation Layer (Phaser)"]
        Scene[Phaser Scene]
        UI[UI Components]
        EventBus[EventBus]
    end

    subgraph Application["Application Layer"]
        UseCase[UseCases]
        StateManager[StateManager]
        FlowManager[GameFlowManager]
    end

    subgraph Domain["Domain Layer"]
        Services[Domain Services]
        Entities[Entities/ValueObjects]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        MasterData[MasterDataLoader]
        SaveData[SaveDataRepository]
        Random[RandomGenerator]
    end

    %% User Input Flow
    User((User)) --> Scene
    Scene --> UI
    UI -->|User Action| EventBus

    %% Event Flow
    EventBus -->|Domain Events| UseCase
    UseCase --> Services
    Services --> Entities

    %% State Update Flow
    Services -->|Result| UseCase
    UseCase -->|State Change| StateManager
    StateManager -->|State Event| EventBus
    EventBus -->|UI Update| UI

    %% Infrastructure Access
    Services --> MasterData
    Services --> Random
    FlowManager --> SaveData
```

---

## 2. ゲーム全体のフロー 🔵

### 2.1 起動からゲーム終了まで

```mermaid
flowchart TD
    Start([ゲーム起動]) --> LoadMaster[マスターデータ読み込み]
    LoadMaster --> CheckSave{セーブデータ存在?}
    CheckSave -->|Yes| Title[タイトル画面<br>コンティニュー有効]
    CheckSave -->|No| Title[タイトル画面<br>新規ゲームのみ]

    Title -->|新規ゲーム| InitGame[ゲーム初期化]
    Title -->|コンティニュー| LoadSave[セーブデータ読み込み]

    InitGame --> GameLoop[ゲームループ開始]
    LoadSave --> GameLoop

    GameLoop --> CheckWin{Sランク到達?}
    CheckWin -->|Yes| Victory[ゲームクリア画面]
    CheckWin -->|No| CheckLose{日数切れ?}
    CheckLose -->|Yes| GameOver[ゲームオーバー画面]
    CheckLose -->|No| GameLoop

    Victory --> Result[リザルト画面]
    GameOver --> Result
    Result --> Title
```

### 2.2 ゲームループ詳細フロー 🔵

```mermaid
flowchart TD
    subgraph "ランク攻略ループ"
        RankStart([ランク開始]) --> DayLoop[1日のループ開始]

        DayLoop --> QuestAccept[依頼受注フェーズ]
        QuestAccept --> Gathering[採取フェーズ]
        Gathering --> Alchemy[調合フェーズ]
        Alchemy --> Delivery[納品フェーズ]
        Delivery --> DayEnd[日終了処理]

        DayEnd --> CheckRankHp{ランクHP = 0?}
        CheckRankHp -->|No| CheckDayLimit{日数切れ?}
        CheckDayLimit -->|No| DayLoop
        CheckDayLimit -->|Yes| GameOver([ゲームオーバー])

        CheckRankHp -->|Yes| PromotionTest[昇格試験]
        PromotionTest --> CheckTestClear{試験クリア?}
        CheckTestClear -->|Yes| RankUp[ランクアップ]
        CheckTestClear -->|No| GameOver

        RankUp --> CheckSRank{Sランク?}
        CheckSRank -->|Yes| Victory([ゲームクリア])
        CheckSRank -->|No| RankStart
    end
```

---

## 3. ユーザーアクションフロー 🔵

### 3.1 カード使用フロー

```mermaid
sequenceDiagram
    participant U as User
    participant H as HandContainer
    participant EB as EventBus
    participant DUC as DeckUseCase
    participant DS as DeckService
    participant SM as StateManager

    U->>H: カードをクリック
    H->>EB: emit('deck:play:request', { cardId })

    EB->>DUC: onPlayCardRequest(cardId)
    DUC->>DS: playCard(cardId)
    DS-->>DUC: void

    DUC->>SM: setState({ actionPoints: current - cost })
    SM->>EB: emit('state:actionPoints', { actionPoints })

    DUC->>EB: emit('deck:play:complete', { cardId })
    EB-->>H: onCardPlayed(cardId)
    H->>H: removeCard(cardId)
```

### 3.2 依頼受注フェーズ

```mermaid
sequenceDiagram
    participant Player as プレイヤー
    participant UI as UI Layer
    participant PM as PhaseManager
    participant QS as QuestService
    participant MDL as MasterDataLoader
    participant RG as RandomGenerator

    Note over Player,RG: 依頼受注フェーズ開始

    PM->>QS: generateDailyQuests()
    QS->>MDL: getClients()
    MDL-->>QS: clients[]
    QS->>RG: selectRandom(clients, 1-3)
    RG-->>QS: selectedClients[]

    loop 各依頼者
        QS->>QS: generateQuestForClient(client)
    end

    QS-->>PM: { clients, quests }
    PM-->>UI: 依頼者・依頼表示

    Player->>UI: 依頼を選択
    UI->>QS: acceptQuest(questId)
    QS->>QS: activeQuests.add(quest)
    QS-->>UI: 受注成功

    Player->>UI: フェーズ終了
    UI->>PM: nextPhase()
```

### 3.3 採取フェーズ

```mermaid
sequenceDiagram
    participant U as User
    participant GC as GatheringContainer
    participant EB as EventBus
    participant GUC as GatheringUseCase
    participant GS as GatheringService
    participant MS as MaterialService
    participant DS as DeckService
    participant IS as InventoryService
    participant RG as RandomGenerator

    Note over U,RG: 採取開始
    U->>GC: 採取地カードを使用
    GC->>EB: emit('gathering:start', { cardId })

    EB->>GUC: onStartGathering(cardId)
    GUC->>DS: canPlayCard(cardId)
    DS-->>GUC: true/false
    GUC->>GS: startDraftGathering(cardId)
    GS-->>GUC: IDraftSession

    GUC->>EB: emit('gathering:options', { options })
    EB-->>GC: showMaterialOptions(options)

    Note over U,RG: 素材選択ループ
    loop 各ラウンド
        U->>GC: 素材を選択
        GC->>EB: emit('gathering:select', { index })

        EB->>GUC: onSelectMaterial(index)
        GUC->>GS: selectMaterial(sessionId, index)
        GS->>RG: chance(probability)
        RG-->>GS: true/false
        GS->>MS: determineMaterialQuality(materialId, bonuses)
        MS-->>GS: quality
        GS-->>GUC: IMaterialInstance

        GUC->>EB: emit('gathering:selected', { material })
        EB-->>GC: addToSelectedMaterials(material)

        alt 次のラウンドあり
            GUC->>EB: emit('gathering:options', { options })
            EB-->>GC: showMaterialOptions(options)
        end
    end

    Note over U,RG: 採取終了
    U->>GC: 終了ボタン
    GC->>EB: emit('gathering:end')

    EB->>GUC: onEndGathering()
    GUC->>GS: endGathering(sessionId)
    GS-->>GUC: IGatheringResult

    loop 各素材
        GUC->>IS: addMaterial(material)
        IS-->>GUC: success
    end

    GUC->>DS: playCard(cardId)
    DS->>DS: hand.remove(cardId)
    DS->>DS: discard.add(cardId)

    GUC->>EB: emit('gathering:complete', { result })
    GUC->>EB: emit('ui:inventory:update', { materials })
    EB-->>GC: showGatheringResult(result)
```

### 3.4 調合フェーズ

```mermaid
sequenceDiagram
    participant U as User
    participant AC as AlchemyContainer
    participant EB as EventBus
    participant AUC as AlchemyUseCase
    participant AS as AlchemyService
    participant MS as MaterialService
    participant DS as DeckService
    participant IS as InventoryService

    Note over U,IS: レシピ選択
    U->>AC: レシピカードを選択
    AC->>EB: emit('alchemy:recipe:select', { recipeId })

    EB->>AUC: onRecipeSelect(recipeId)
    AUC->>AS: canCraft(recipeId)
    AS->>DS: getHand()
    DS-->>AS: hand[]
    AS-->>AUC: boolean
    AUC->>IS: hasMaterials(recipeId)
    IS-->>AUC: boolean

    AUC->>EB: emit('alchemy:recipe:validated', { canCraft, hasMaterials })
    EB-->>AC: updateCraftButton(canCraft && hasMaterials)

    Note over U,IS: 素材選択
    U->>AC: 素材を選択
    AC->>EB: emit('alchemy:materials:select', { materials })

    EB->>AUC: onMaterialsSelect(materials)
    AUC->>AS: previewQuality(recipeId, materials)
    AS->>MS: calculateAverageQuality(materials)
    MS-->>AS: avgQuality
    AS-->>AUC: Quality

    AUC->>EB: emit('alchemy:preview', { quality })
    EB-->>AC: showQualityPreview(quality)

    Note over U,IS: 強化カード選択（任意）
    U->>AC: 強化カードを選択
    AC->>EB: emit('alchemy:enhancement:select', { enhancementIds })

    Note over U,IS: 調合実行
    U->>AC: 調合ボタン
    AC->>EB: emit('alchemy:craft', { recipeId, materials, enhancementIds })

    EB->>AUC: onCraft(recipeId, materials, enhancementIds)
    AUC->>AS: craft(recipeId, materials, enhancementIds)

    AS->>MS: calculateAverageQuality(materials)
    MS-->>AS: avgQuality
    AS->>AS: calculateQuality(avgQuality, enhancements)
    AS->>MS: calculateTotalAttributes(materials)
    MS-->>AS: attributeValues[]
    AS->>AS: calculateEffects(item, quality)

    AS->>IS: removeMaterial(...) (内部で消費)
    loop 使用素材
        IS->>IS: materials.decrement(...)
    end

    AS-->>AUC: ICraftedItem

    AUC->>IS: addItem(item)
    AUC->>DS: playCard(recipeId)
    DS->>DS: hand.remove(recipeId)
    DS->>DS: discard.add(recipeId)

    AUC->>EB: emit('alchemy:complete', { item })
    AUC->>EB: emit('ui:inventory:update', { materials, items })

    EB-->>AC: showCraftResult(item)
```

### 3.5 納品フェーズ

```mermaid
sequenceDiagram
    participant U as User
    participant DC as DeliveryContainer
    participant EB as EventBus
    participant QUC as QuestUseCase
    participant QS as QuestService
    participant CC as ContributionCalculator
    participant RS as RankService
    participant DS as DeckService
    participant IS as InventoryService
    participant SM as StateManager

    Note over U,SM: 依頼・アイテム選択
    U->>DC: 依頼を選択
    DC->>EB: emit('delivery:quest:select', { questId })

    U->>DC: アイテムを選択
    DC->>EB: emit('delivery:item:select', { itemId })

    EB->>QUC: onItemSelect(questId, itemId)
    QUC->>QS: canDeliver(questId, item)
    QS->>QS: checkCondition(condition, item)
    QS-->>QUC: boolean

    QUC->>EB: emit('delivery:validated', { canDeliver })
    EB-->>DC: updateDeliverButton(canDeliver)

    Note over U,SM: 強化カード選択（任意）
    U->>DC: 強化カードを選択
    DC->>EB: emit('delivery:enhancement:select', { enhancementIds })

    Note over U,SM: 納品実行
    U->>DC: 納品ボタン
    DC->>EB: emit('delivery:deliver', { questId, itemId, enhancementIds })

    EB->>QUC: onDeliver(questId, itemId, enhancementIds)
    QUC->>QS: deliver(questId, item, enhancementIds)

    QS->>CC: calculate(params)
    CC->>CC: applyModifiers(...)
    CC-->>QS: contribution

    QS->>QS: generateRewardCards(quest, client)
    QS->>IS: removeItem(item)
    IS-->>QS: item

    QS-->>QUC: IDeliveryResult

    QUC->>RS: addContribution(result.contribution)
    RS->>RS: promotionGauge += contribution

    QUC->>SM: setState({ gold: +reward, comboCount: +1 })
    SM->>EB: emit('state:gold', { gold })
    SM->>EB: emit('state:comboCount', { comboCount })

    QUC->>EB: emit('delivery:complete', { result })
    QUC->>EB: emit('quest:completed')
    QUC->>EB: emit('rank:damaged')
    EB-->>DC: showDeliveryResult(result)

    Note over U,SM: 報酬カード選択
    DC->>DC: showRewardCardSelector(result.rewardCandidates)
    U->>DC: カードを選択
    DC->>EB: emit('deck:add', { cardId })
    EB->>DS: addCard(selectedCardId)
```

### 3.6 日終了処理

```mermaid
sequenceDiagram
    participant PM as PhaseManager
    participant SM as StateManager
    participant QS as QuestService
    participant DS as DeckService
    participant RS as RankService
    participant SDR as SaveDataRepository
    participant EB as EventBus

    Note over PM,EB: 日終了処理

    PM->>SM: decrementRemainingDays()
    SM->>SM: remainingDays--

    PM->>QS: updateDeadlines()
    QS->>QS: activeQuests.forEach(q => q.remainingDays--)
    QS->>QS: removeExpiredQuests()

    PM->>DS: refillHand()
    DS->>DS: while (hand.length < 5) draw(1)

    PM->>SM: resetActionPoints()
    SM->>SM: actionPoints = 3

    PM->>RS: checkDayLimit()
    alt 日数切れ
        RS->>EB: publish(GAME_OVER)
    else HP0
        RS->>EB: publish(RANK_HP_ZERO)
    else 継続
        PM->>SDR: save(gameState)
        SDR->>SDR: localStorage.setItem(...)
        PM->>EB: publish(DAY_ENDED)
    end
```

---

## 4. 状態管理フロー 🟡

### 4.1 StateManager データフロー

```mermaid
flowchart LR
    subgraph Sources["状態変更元"]
        UC1[GatheringUseCase]
        UC2[AlchemyUseCase]
        UC3[QuestUseCase]
        UC4[PhaseManager]
    end

    subgraph StateManager["StateManager"]
        State[(Game State)]
        Notify[notifyChange]
    end

    subgraph Subscribers["購読者"]
        EB[EventBus]
        Header[HeaderUI]
        Sidebar[SidebarUI]
    end

    UC1 -->|setState| State
    UC2 -->|setState| State
    UC3 -->|setState| State
    UC4 -->|setState| State

    State --> Notify
    Notify -->|emit| EB
    EB --> Header
    EB --> Sidebar
```

### 4.2 状態オブジェクト構造

```typescript
interface IGameState {
    // 日付・時間
    currentDay: number;           // 現在の日
    remainingDays: number;        // 残り日数
    currentPhase: Phase;          // 現在のフェーズ

    // ランク
    currentRank: GuildRank;       // 現在のギルドランク
    promotionGauge: number;       // 昇格ゲージ（0-100%）
    requiredContribution: number; // 昇格に必要な貢献度

    // リソース
    gold: number;                 // 所持金
    actionPoints: number;         // 行動ポイント（1日3）

    // ゲームプレイ
    comboCount: number;           // 連続納品数
    isPromotionTest: boolean;     // 昇格試験中フラグ

    // UI状態
    selectedQuestId: string | null;
    selectedCardId: string | null;
}
```

### 4.3 状態変更パターン

```mermaid
sequenceDiagram
    participant UC as UseCase
    participant SM as StateManager
    participant EB as EventBus
    participant UI as UI Component

    UC->>SM: setState({ gold: newGold })

    Note over SM: 状態比較
    SM->>SM: oldGold !== newGold?

    alt 変更あり
        SM->>SM: state.gold = newGold
        SM->>EB: emit('state:gold', { gold: newGold })
        EB-->>UI: onGoldChanged(newGold)
        UI->>UI: updateGoldDisplay(newGold)
    end
```

---

## 5. フェーズ遷移フロー 🔵

### 5.1 画面遷移

```mermaid
stateDiagram-v2
    [*] --> BootScreen: ゲーム起動
    BootScreen --> TitleScreen: 読み込み完了

    TitleScreen --> MainScreen: 新規ゲーム/コンティニュー

    MainScreen --> ShopScreen: ショップ選択
    ShopScreen --> MainScreen: 戻る

    MainScreen --> RankUpScreen: ランクHP0
    RankUpScreen --> MainScreen: 試験クリア
    RankUpScreen --> ResultScreen: 試験失敗

    MainScreen --> ResultScreen: ゲームオーバー
    MainScreen --> ResultScreen: Sランク到達

    ResultScreen --> TitleScreen: タイトルへ
```

### 5.2 フェーズ遷移（メイン画面内）

```mermaid
stateDiagram-v2
    [*] --> DayStart: 日開始

    DayStart --> QuestAcceptPhase: 日開始処理完了

    QuestAcceptPhase --> GatheringPhase: 受注完了/スキップ

    GatheringPhase --> AlchemyPhase: 採取完了/スキップ
    GatheringPhase --> ShopModal: 買い物

    AlchemyPhase --> DeliveryPhase: 調合完了/スキップ
    AlchemyPhase --> ShopModal: 買い物

    DeliveryPhase --> DayEnd: 納品完了/スキップ
    DeliveryPhase --> ShopModal: 買い物

    ShopModal --> GatheringPhase: 戻る（採取中）
    ShopModal --> AlchemyPhase: 戻る（調合中）
    ShopModal --> DeliveryPhase: 戻る（納品中）

    DayEnd --> [*]: 日終了
```

### 5.3 1日のフェーズサイクル

```mermaid
flowchart TB
    Start([日開始]) --> QA[依頼受注フェーズ]

    QA -->|受注完了/スキップ| G[採取フェーズ]
    G -->|採取完了/スキップ| A[調合フェーズ]
    A -->|調合完了/スキップ| D[納品フェーズ]
    D -->|納品完了/スキップ| End([日終了])

    End -->|残り日数 > 0| Start
    End -->|残り日数 = 0| GameOver([ゲームオーバー判定])
    End -->|Sランク到達| GameClear([ゲームクリア])
```

### 5.4 フェーズ遷移シーケンス

```mermaid
sequenceDiagram
    participant PM as PhaseManager
    participant SM as StateManager
    participant EB as EventBus
    participant MS as MainScene
    participant PC as PhaseContainer

    Note over PM,PC: フェーズ完了
    PM->>PM: currentPhase = 'GATHERING'
    PM->>EB: emit('phase:complete', { phase: 'QUEST_ACCEPT' })

    Note over PM,PC: 次フェーズへ遷移
    PM->>SM: setState({ currentPhase: 'GATHERING' })
    SM->>EB: emit('state:currentPhase', { phase: 'GATHERING' })

    PM->>EB: emit('phase:change', { phase: 'GATHERING' })
    EB-->>MS: onPhaseChange({ phase: 'GATHERING' })

    MS->>PC: currentContainer.hide()
    MS->>MS: currentContainer = gatheringContainer
    MS->>PC: currentContainer.show()

    Note over PM,PC: フェーズ初期化
    PM->>EB: emit('gathering:init')
```

### 5.5 ランク状態遷移

```mermaid
stateDiagram-v2
    [*] --> Rank_G: ゲーム開始

    Rank_G --> Rank_G_Test: HP0
    Rank_G_Test --> Rank_F: 試験クリア
    Rank_G_Test --> GameOver: 試験失敗

    Rank_F --> Rank_F_Test: HP0
    Rank_F_Test --> Rank_E: 試験クリア
    Rank_F_Test --> GameOver: 試験失敗

    Rank_E --> Rank_E_Test: HP0
    Rank_E_Test --> Rank_D: 試験クリア

    Rank_D --> Rank_D_Test: HP0
    Rank_D_Test --> Rank_C: 試験クリア

    Rank_C --> Rank_C_Test: HP0
    Rank_C_Test --> Rank_B: 試験クリア

    Rank_B --> Rank_B_Test: HP0
    Rank_B_Test --> Rank_A: 試験クリア

    Rank_A --> Rank_A_Test: HP0
    Rank_A_Test --> Rank_S: 試験クリア

    Rank_S --> Victory: Sランク到達

    Rank_G --> GameOver: 日数切れ
    Rank_F --> GameOver: 日数切れ
    Rank_E --> GameOver: 日数切れ
    Rank_D --> GameOver: 日数切れ
    Rank_C --> GameOver: 日数切れ
    Rank_B --> GameOver: 日数切れ
    Rank_A --> GameOver: 日数切れ

    GameOver --> [*]
    Victory --> [*]
```

---

## 6. データ変換フロー 🟡

### 6.1 素材→アイテム変換

```mermaid
flowchart LR
    subgraph "入力"
        M1[素材1<br>薬草×2]
        M2[素材2<br>清水×1]
        R[レシピカード<br>回復薬]
        E[強化カード<br>賢者の触媒]
    end

    subgraph "処理"
        QC[品質計算<br>素材平均+強化]
        AC[属性計算<br>素材属性合算]
        EC[効果計算<br>基礎×品質補正]
    end

    subgraph "出力"
        I[調合アイテム<br>回復薬 品質B]
    end

    M1 --> QC
    M2 --> QC
    E --> QC
    QC --> I

    M1 --> AC
    M2 --> AC
    AC --> I

    R --> EC
    QC --> EC
    EC --> I
```

### 6.2 アイテム→貢献度変換

```mermaid
flowchart LR
    subgraph "入力"
        I[調合アイテム<br>回復薬 品質B]
        Q[依頼<br>カテゴリ: 薬]
        C[依頼者<br>冒険者]
        E[強化カード<br>ギルド推薦状]
        CB[コンボ数<br>3連続]
    end

    subgraph "処理"
        BC[基本貢献度<br>依頼から取得]
        QM[品質補正<br>×1.5]
        TM[タイプ補正<br>×0.8]
        CM[依頼者補正<br>×1.0]
        CBM[コンボ補正<br>×1.2]
        EM[強化補正<br>×1.3]
    end

    subgraph "出力"
        CO[最終貢献度]
        G[ゴールド]
        RC[報酬カード×3]
    end

    Q --> BC
    I --> QM
    BC --> QM
    Q --> TM
    QM --> TM
    C --> CM
    TM --> CM
    CB --> CBM
    CM --> CBM
    E --> EM
    CBM --> EM
    EM --> CO

    Q --> G
    C --> G

    Q --> RC
    C --> RC
```

---

## 7. セーブ・ロードフロー 🔵

### 7.1 セーブフロー

```mermaid
sequenceDiagram
    participant U as User
    participant MS as MainScene
    participant EB as EventBus
    participant GFM as GameFlowManager
    participant SM as StateManager
    participant SDR as SaveDataRepository
    participant DS as DeckService
    participant IS as InventoryService
    participant QS as QuestService

    U->>MS: メニュー→セーブ
    MS->>EB: emit('game:save')

    EB->>GFM: onSaveRequest()

    par 各サービスから状態取得
        GFM->>SM: getState()
        SM-->>GFM: IGameState
    and
        GFM->>DS: getDeckState()
        DS-->>GFM: IDeckState
    and
        GFM->>IS: getInventoryState()
        IS-->>GFM: IInventoryState
    and
        GFM->>QS: getQuestState()
        QS-->>GFM: IQuestState
    end

    GFM->>GFM: createSaveData()
    GFM->>SDR: save(saveData)
    SDR->>SDR: JSON.stringify(saveData)
    SDR->>SDR: localStorage.setItem(key, json)
    SDR-->>GFM: success

    GFM->>EB: emit('game:saved')
    EB-->>MS: showSaveComplete()
```

### 7.2 ロードフロー

```mermaid
sequenceDiagram
    participant U as User
    participant TS as TitleScene
    participant EB as EventBus
    participant GFM as GameFlowManager
    participant SDR as SaveDataRepository
    participant DS as DeckService
    participant IS as InventoryService
    participant QS as QuestService
    participant SM as StateManager
    participant ScM as SceneManager

    U->>TS: コンティニュー
    TS->>EB: emit('game:load')

    EB->>GFM: onLoadRequest()
    GFM->>SDR: load()
    SDR->>SDR: localStorage.getItem(key)
    SDR->>SDR: JSON.parse(json)
    SDR-->>GFM: ISaveData

    par 各サービスに状態復元
        GFM->>DS: restoreState(saveData.deckState)
    and
        GFM->>IS: restoreState(saveData.inventoryState)
    and
        GFM->>QS: restoreState(saveData.questState)
    and
        GFM->>SM: setState(saveData.gameState)
    end

    GFM->>EB: emit('game:loaded')
    GFM->>ScM: transition('TitleScene', 'MainScene', { loaded: true })
```

---

## 8. マスターデータフロー 🔵

### 8.1 マスターデータロード

```mermaid
sequenceDiagram
    participant BS as BootScene
    participant MDL as MasterDataLoader
    participant FS as FileSystem/Fetch
    participant Cache as メモリキャッシュ

    BS->>MDL: loadAll()

    par 並列ロード
        MDL->>FS: fetch('data/master/cards.json')
        FS-->>MDL: cardsData
    and
        MDL->>FS: fetch('data/master/gathering_cards.json')
        FS-->>MDL: gatheringCardsData
    and
        MDL->>FS: fetch('data/master/recipe_cards.json')
        FS-->>MDL: recipeCardsData
    and
        MDL->>FS: fetch('data/master/enhancement_cards.json')
        FS-->>MDL: enhancementCardsData
    and
        MDL->>FS: fetch('data/master/materials.json')
        FS-->>MDL: materialsData
    and
        MDL->>FS: fetch('data/master/items.json')
        FS-->>MDL: itemsData
    and
        MDL->>FS: fetch('data/master/clients.json')
        FS-->>MDL: clientsData
    and
        MDL->>FS: fetch('data/master/guild_ranks.json')
        FS-->>MDL: ranksData
    and
        MDL->>FS: fetch('data/master/artifacts.json')
        FS-->>MDL: artifactsData
    and
        MDL->>FS: fetch('data/master/shop_items.json')
        FS-->>MDL: shopItemsData
    end

    loop 各データ
        MDL->>Cache: set(key, data)
    end

    MDL->>MDL: indexData()
    MDL-->>BS: loaded
```

### 8.2 マスターデータアクセスパターン

```mermaid
flowchart LR
    subgraph Services["Domain Services"]
        GS[GatheringService]
        AS[AlchemyService]
        QS[QuestService]
        MS[MaterialService]
    end

    subgraph MDL["MasterDataLoader"]
        Cards[(Cards)]
        Materials[(Materials)]
        Items[(Items)]
        Quests[(Quests)]
        Ranks[(Ranks)]
        Artifacts[(Artifacts)]
    end

    GS -->|getCard| Cards
    GS -->|getMaterial| Materials
    AS -->|getRecipe| Cards
    AS -->|getItem| Items
    QS -->|getQuest| Quests
    QS -->|getClient| Quests
    MS -->|getMaterial| Materials
```

---

## 9. インベントリデータフロー 🔵

### 9.1 素材追加フロー

```mermaid
sequenceDiagram
    participant GS as GatheringService
    participant IS as InventoryService
    participant AFS as ArtifactService
    participant EB as EventBus

    GS->>IS: addMaterial(material)

    IS->>IS: getStorageLimit()
    IS->>AFS: getStorageBonus()
    AFS-->>IS: bonus

    IS->>IS: storageLimit = 20 + bonus

    alt 容量に空きあり
        IS->>IS: materials.push(material)
        IS->>IS: consolidateMaterials()
        IS-->>GS: true

        IS->>EB: emit('ui:inventory:update')
    else 容量満杯
        IS-->>GS: false
        IS->>EB: emit('ui:toast:show', { message: '倉庫が満杯です', type: 'warning' })
    end
```

### 9.2 アイテム消費フロー

```mermaid
sequenceDiagram
    participant QS as QuestService
    participant IS as InventoryService
    participant EB as EventBus

    QS->>IS: removeItem(itemId)

    IS->>IS: findItem(itemId)

    alt アイテムあり
        IS->>IS: craftedItems.splice(index, 1)
        IS-->>QS: ICraftedItem

        IS->>EB: emit('ui:inventory:update')
    else アイテムなし
        IS-->>QS: null
    end
```

---

## 10. ランク・貢献度フロー 🔵

### 10.1 貢献度加算フロー

```mermaid
sequenceDiagram
    participant QS as QuestService
    participant CC as ContributionCalculator
    participant RS as RankService
    participant SM as StateManager
    participant EB as EventBus

    QS->>CC: calculate(params)
    CC-->>QS: contribution

    QS->>RS: addContribution(contribution)

    RS->>RS: promotionGauge += contribution

    alt ゲージが100%に到達
        RS->>EB: emit('rank:promotionReady')
        RS->>SM: setState({ isPromotionTest: true })
    else ゲージ更新のみ
        RS->>SM: setState({ promotionGauge })
        SM->>EB: emit('state:promotionGauge', { gauge })
    end
```

### 10.2 昇格フロー

```mermaid
sequenceDiagram
    participant U as User
    participant RUS as RankUpScene
    participant EB as EventBus
    participant RS as RankService
    participant SM as StateManager
    participant ScM as SceneManager

    Note over U,ScM: 昇格試験クリア
    U->>RUS: 試験完了
    RUS->>EB: emit('rank:test:complete')

    EB->>RS: completePromotionTest()
    RS->>RS: currentRank = getNextRank()
    RS->>RS: promotionGauge = 0
    RS->>RS: requiredContribution = getNewRequired()

    RS->>SM: setState({
        currentRank: newRank,
        promotionGauge: 0,
        requiredContribution: newRequired
    })

    SM->>EB: emit('state:currentRank', { rank: newRank })

    alt Sランク到達
        RS->>EB: emit('game:clear')
        EB->>ScM: transition('RankUpScene', 'GameClearScene')
    else 次のランクへ
        RS->>EB: emit('rank:up', { newRank })
        EB->>ScM: transition('RankUpScene', 'MainScene')
    end
```

---

## 11. イベントフロー 🟡

### 11.1 イベント一覧

| イベント名 | 発生タイミング | 購読者 |
|-----------|--------------|--------|
| GAME_STARTED | ゲーム開始時 | UI全体 |
| DAY_STARTED | 日開始時 | MainScene |
| PHASE_CHANGED | フェーズ変更時 | PhaseIndicator |
| QUEST_ACCEPTED | 依頼受注時 | QuestView |
| MATERIALS_ACQUIRED | 素材獲得時 | InventoryView |
| ITEM_CRAFTED | アイテム調合時 | InventoryView |
| QUEST_COMPLETED | 依頼完了時 | QuestView, RankProgressView |
| RANK_DAMAGED | ランクHPダメージ時 | RankProgressView |
| RANK_HP_ZERO | ランクHP0時 | GameFlowManager |
| DAY_ENDED | 日終了時 | DayCounter, HandView |
| RANK_UP | ランクアップ時 | RankProgressView |
| GAME_OVER | ゲームオーバー時 | ScreenManager |
| GAME_CLEARED | ゲームクリア時 | ScreenManager |

### 11.2 イベント発行フロー

```mermaid
sequenceDiagram
    participant Service as Domain Service
    participant EventBus
    participant UI1 as UI Component 1
    participant UI2 as UI Component 2

    Note over Service,UI2: イベント発行

    Service->>EventBus: publish(EVENT_TYPE, data)
    EventBus->>EventBus: getSubscribers(EVENT_TYPE)

    par 並行処理
        EventBus->>UI1: handler(event)
        UI1->>UI1: update()
    and
        EventBus->>UI2: handler(event)
        UI2->>UI2: update()
    end
```

---

## 12. システム間通信パターン 🟡

### 12.1 同期通信（メソッド呼び出し）

```mermaid
flowchart LR
    subgraph "呼び出し元"
        PM[PhaseManager]
    end

    subgraph "呼び出し先"
        GS[GatheringService]
        AS[AlchemyService]
        QS[QuestService]
    end

    PM -->|gather()| GS
    PM -->|craft()| AS
    PM -->|deliver()| QS

    GS -->|return| PM
    AS -->|return| PM
    QS -->|return| PM
```

### 12.2 非同期通信（イベント）

```mermaid
flowchart TB
    subgraph "発行者"
        GS[GatheringService]
        AS[AlchemyService]
        QS[QuestService]
    end

    subgraph "イベントバス"
        EB[EventBus]
    end

    subgraph "購読者"
        IV[InventoryView]
        RPV[RankProgressView]
        QV[QuestView]
    end

    GS -->|publish| EB
    AS -->|publish| EB
    QS -->|publish| EB

    EB -->|notify| IV
    EB -->|notify| RPV
    EB -->|notify| QV
```

---

## 13. エラーハンドリングフロー 🔴

### 13.1 エラー伝播パターン

```mermaid
flowchart TB
    subgraph Domain["Domain Layer"]
        DS[DomainService]
        Error1[DomainError]
    end

    subgraph Application["Application Layer"]
        UC[UseCase]
        Error2[ApplicationError]
    end

    subgraph Presentation["Presentation Layer"]
        EB[EventBus]
        UI[UI Component]
        Toast[Toast]
        Dialog[ErrorDialog]
    end

    DS -->|throw| Error1
    Error1 -->|catch| UC
    UC -->|wrap| Error2
    Error2 -->|emit| EB
    EB -->|error event| UI
    UI -->|軽微| Toast
    UI -->|重大| Dialog
```

### 13.2 エラーハンドリング例

```typescript
// UseCase内でのエラーハンドリング
class GatheringUseCase {
    async onStartGathering(data: { cardId: string }): Promise<void> {
        try {
            const session = this.gatheringService.startDraftGathering(data.cardId);
            EventBus.emit('gathering:session', { session });
        } catch (error) {
            if (error instanceof InsufficientActionPointsError) {
                EventBus.emit('ui:toast:show', {
                    message: '行動ポイントが足りません',
                    type: 'warning'
                });
            } else if (error instanceof CardNotInHandError) {
                EventBus.emit('ui:toast:show', {
                    message: 'カードが手札にありません',
                    type: 'error'
                });
            } else {
                // 予期しないエラー
                console.error('Unexpected error:', error);
                EventBus.emit('ui:dialog:open', {
                    type: 'error',
                    data: {
                        title: 'エラー',
                        message: '予期しないエラーが発生しました',
                        onClose: () => EventBus.emit('game:reset')
                    }
                });
            }
        }
    }
}
```

---

## 14. パフォーマンス最適化 🔴

### 14.1 イベントバッチング

```mermaid
sequenceDiagram
    participant UC as UseCase
    participant EB as EventBus
    participant UI as UI Components

    Note over UC,UI: バッチ開始
    UC->>EB: startBatch()

    UC->>EB: emit('state:gold')
    UC->>EB: emit('state:actionPoints')
    UC->>EB: emit('ui:inventory:update')

    Note over UC,UI: バッチ終了・一括通知
    UC->>EB: endBatch()
    EB->>UI: notifyAll([events])
```

### 14.2 遅延ロード

```mermaid
flowchart LR
    Boot[BootScene] -->|必須アセット| Title[TitleScene]
    Title -->|追加アセット| Main[MainScene]

    subgraph "必須アセット"
        Font[フォント]
        CommonUI[共通UI素材]
    end

    subgraph "追加アセット"
        Cards[カード画像]
        Materials[素材画像]
        Effects[エフェクト]
    end
```

---

## 関連文書

- **要件定義書**: [../../spec/atelier-guild-rank-requirements.md](../../spec/atelier-guild-rank-requirements.md)
- **アーキテクチャ設計書**: [architecture.md](architecture.md)
- **Phaserアーキテクチャ設計書**: [../atelier-guild-rank-phaser/architecture.md](../atelier-guild-rank-phaser/architecture.md)
- **コアシステム設計書**: [core-systems.md](core-systems.md)
- **データスキーマ設計書**: [data-schema.md](data-schema.md)
- **UI設計概要**: [../atelier-guild-rank-phaser/ui-design/overview.md](../atelier-guild-rank-phaser/ui-design/overview.md)

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-01 | 1.0.0 | 初版作成（HTML版） |
| 2026-01-01 | 1.1.0 | 採取・調合フェーズのシーケンス図にMaterialServiceを追加 |
| 2026-01-07 | 1.0.0 | Phaser版として作成 |
| 2026-01-14 | 2.0.0 | HTML版とPhaser版を統合、両方の詳細を含む統合版として再構成 |
