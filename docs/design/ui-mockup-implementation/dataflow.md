# UIモックアップ実装 データフロー図

**作成日**: 2026-06-17  
**関連アーキテクチャ**: [architecture.md](architecture.md)  
**関連モックアップ計画**: [mockup-implementation-plan.md](../atelier-guild-rank/ui-design/mockup-implementation-plan.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: 既存実装・設計文書・モックアップを参考にした確実なフロー
- 🟡 **黄信号**: 既存実装・設計文書・モックアップから妥当な推測によるフロー
- 🔴 **赤信号**: 既存実装・設計文書・モックアップにない推測によるフロー

---

## フェーズ遷移フロー 🔵

**信頼性**: 🔵 *game-mechanics.md・state-management.md より*

```mermaid
flowchart TD
    TITLE[TitleScene<br/>01-title.html] -->|新規ゲーム| MAIN[MainScene]
    MAIN --> QA[QuestAcceptPhaseUI<br/>02-quest-accept.html]
    QA -->|受注確定| GA[GatheringPhaseUI<br/>03-gathering.html]
    GA -->|採取完了| AL[AlchemyPhaseUI<br/>04-alchemy.html]
    AL -->|調合完了| DE[DeliveryPhaseUI<br/>05-delivery.html]
    DE -->|日終了| DAY_END[DAY_END]
    DAY_END -->|次の日| QA
    DAY_END -->|ランク昇格試験| RANKUP[RankUpScene<br/>08-rank-up.html]
    RANKUP -->|合格| QA
    RANKUP -->|不合格| TITLE
    DE -->|ショップ| SHOP[ShopScene<br/>07-shop.html]
    SHOP -->|閉じる| DE
    DAY_END -->|ゲームクリア| CLEAR[GameClearScene<br/>06-game-clear.html]
    CLEAR -->|タイトルへ| TITLE
    CLEAR -->|もう一度挑戦| TITLE
```

---

## HUDBar データフロー 🔵

**信頼性**: 🔵 *既存 HUDBar 実装・state-management.md より*

```mermaid
sequenceDiagram
    participant SM as StateManager
    participant EB as EventBus
    participant MS as MainScene
    participant HUD as HUDBar

    SM->>EB: emit(GOLD_CHANGED, {gold})
    EB->>HUD: on(GOLD_CHANGED) → update({gold})
    HUD->>HUD: refreshVisuals()

    SM->>EB: emit(PHASE_CHANGED, {newPhase})
    EB->>HUD: on(PHASE_CHANGED) → 不要（HUDは変化なし）

    MS->>HUD: updateFromHeader(IHeaderUIData)
    HUD->>HUD: mergeData() → refreshVisuals()
```

**更新タイミング**:
- ゴールド変動時: `GameEventType.GOLD_CHANGED`
- AP変動時: `GameEventType.AP_CHANGED`
- 日数変動時: `GameEventType.DAY_ADVANCED`
- ランク変動時: `GameEventType.RANK_CHANGED`

---

## SidebarUI データフロー 🔵

**信頼性**: 🔵 *既存 SidebarUI・state-management.md より*

```mermaid
sequenceDiagram
    participant EB as EventBus
    participant Sidebar as SidebarUI
    participant Shop as ShopScene

    Note over Sidebar: create()時に購読登録
    EB-->>Sidebar: QUEST_ACCEPTED → addQuestCard(quest)
    EB-->>Sidebar: QUEST_COMPLETED → removeQuestCard(questId)
    EB-->>Sidebar: ITEM_CRAFTED → updateInventory(item)

    Sidebar->>EB: emit(SHOP_REQUESTED)
    EB->>Shop: scene.launch('ShopScene')
```

---

## PhaseRail（フェーズタブ）データフロー 🔵

**信頼性**: 🔵 *既存 PhaseRail・state-management.md より*

```mermaid
sequenceDiagram
    participant Player as プレイヤー
    participant Rail as PhaseRail
    participant PM as PhaseManager
    participant EB as EventBus

    Player->>Rail: タブクリック(phase)
    Rail->>EB: emit(PHASE_TAB_CLICKED, {phase})
    EB->>PM: onPhaseTabClicked(phase)
    PM->>PM: showPhase(phase)
    PM->>EB: emit(PHASE_CHANGED, {newPhase})
    EB->>Rail: on(PHASE_CHANGED) → setActiveTab(phase)
```

---

## QuestAcceptPhaseUI データフロー 🔵

**信頼性**: 🔵 *既存 QuestAcceptPhaseUI・モックアップ 02 より*

```mermaid
sequenceDiagram
    participant Player as プレイヤー
    participant QAUI as QuestAcceptPhaseUI
    participant Card as QuestCardUI
    participant EB as EventBus
    participant QS as QuestService

    Note over QAUI: create()時に依頼リストを取得
    QS-->>QAUI: getAvailableQuests()
    QAUI->>Card: 依頼カードを3列グリッド表示

    Player->>Card: カードクリック
    Card->>QAUI: onQuestSelect(quest)
    QAUI->>QAUI: 選択状態更新（枠線強調）
    QAUI->>QAUI: 詳細パネル更新

    Player->>QAUI: 受注ボタンクリック
    QAUI->>EB: emit(QUEST_ACCEPTED, {quest})
    EB->>QS: acceptQuest(questId)
    QAUI->>QAUI: 受注済みリスト更新
```

**UI状態遷移**:
```
未選択 → 選択（border-color: #B8A9D4 3px + チェックマーク）→ 受注済み（バッジ表示）
```

---

## DeliveryPhaseUI データフロー 🔵

**信頼性**: 🔵 *既存 DeliveryPhaseUI・モックアップ 05 より*

```mermaid
sequenceDiagram
    participant Player as プレイヤー
    participant DUI as DeliveryPhaseUI
    participant QDL as QuestDeliveryList
    participant IS as ItemSelector
    participant CP as ContributionPreview
    participant EB as EventBus

    DUI->>DUI: refreshData()
    DUI->>QDL: 受注依頼リストを表示
    DUI->>IS: 所持アイテムチップを表示

    Player->>QDL: 依頼カードクリック
    QDL->>DUI: onQuestSelect(quest)
    DUI->>CP: updatePreview()

    Player->>IS: アイテムチップクリック
    IS->>DUI: onItemSelect(item)
    DUI->>CP: updatePreview()
    CP->>CP: ゲージ更新（fill + 追加分 #7BAE7F）

    Player->>DUI: 納品ボタンクリック
    DUI->>EB: emit(ITEM_DELIVERED, {quest, item})
    DUI->>DUI: 納品結果パネル表示
```

---

## TitleScene データフロー 🔵

**信頼性**: 🔵 *既存 TitleScene・モックアップ 01 より*

```mermaid
sequenceDiagram
    participant Player as プレイヤー
    participant TS as TitleScene
    participant SM as StateManager

    TS->>TS: create()
    TS->>TS: 装飾円・エンブレム・タイトルカード描画
    TS->>SM: hasSaveData() 確認
    alt セーブデータあり
        TS->>TS: 「コンティニュー」ボタン有効化
    else なし
        TS->>TS: 「コンティニュー」ボタン非活性
    end

    Player->>TS: 「新規ゲーム」クリック
    TS->>SM: resetState()
    TS->>TS: scene.start('MainScene')

    Player->>TS: 「コンティニュー」クリック
    TS->>SM: loadSaveData()
    TS->>TS: scene.start('MainScene')
```

---

## GameClearScene データフロー 🔵

**信頼性**: 🔵 *既存 GameClearScene・モックアップ 06 より*

```mermaid
sequenceDiagram
    participant GCS as GameClearScene
    participant SM as StateManager

    Note over GCS: init(data) でクリアデータを受け取る
    GCS->>SM: getFinalStats()
    GCS->>GCS: 統計パネル描画（3グリッド + 4行リスト）

    Note over GCS: 統計項目（モックアップ 06 準拠）
    GCS->>GCS: グリッド: 総プレイ日数・達成依頼数・総獲得G
    GCS->>GCS: リスト: 調合回数・採取素材数・S品質作成数・最終貢献度
```

**統計項目の確定**（事前確認事項 B 解決済み）:
- 「もう一度挑戦」ボタンを実装する（TitleScene へ遷移）
- 統計項目はモックアップ 06 の 6 項目で実装する

---

## ShopScene データフロー 🔵

**信頼性**: 🔵 *既存 ShopScene・モックアップ 07 より*

```mermaid
sequenceDiagram
    participant Player as プレイヤー
    participant SS as ShopScene
    participant SM as StateManager
    participant EB as EventBus

    EB->>SS: emit(SHOP_REQUESTED)
    SS->>SS: scene.launch('ShopScene') / overlay表示
    SS->>SM: getGold() / getShopItems()
    SS->>SS: カテゴリサイドバー + 商品グリッド描画

    Player->>SS: カテゴリ選択
    SS->>SS: 商品グリッドフィルタ

    Player->>SS: 商品カード選択
    SS->>SS: 詳細バー更新（価格・購入ボタン）
    SS->>SS: 所持Gold と比較 → 購入可否判定

    Player->>SS: 購入ボタンクリック
    SS->>SM: spendGold(price) / addItem(item)
    SM->>EB: emit(GOLD_CHANGED) / emit(ITEM_ACQUIRED)
    SS->>SS: 商品グリッド更新

    Player->>SS: 閉じるボタンクリック
    SS->>SS: scene.stop('ShopScene')
```

---

## コンポーネントライフサイクル 🔵

**信頼性**: 🔵 *BaseComponent パターン・phaser-best-practices.md より*

```mermaid
stateDiagram-v2
    [*] --> 未初期化: new Component(scene, x, y)
    未初期化 --> 初期化済み: create()
    初期化済み --> 更新中: update() / EventBus受信
    更新中 --> 初期化済み: 更新完了
    初期化済み --> 非表示: setVisible(false)
    非表示 --> 初期化済み: setVisible(true)
    初期化済み --> 破棄済み: destroy()
    [*] --> 破棄済み
```

**destroy() 必須チェックリスト**:
- [ ] EventBus 購読解除 (`unsubscribe?.()`)
- [ ] Tween 停止 (`this.scene.tweens.killTweensOf(target)`)
- [ ] タイマー削除 (`this.scene.time.removeAllEvents()`)
- [ ] コンテナ破棄 (`this.container.destroy(true)`)

---

## 関連文書

- **アーキテクチャ**: [architecture.md](architecture.md)
- **型定義**: [interfaces.ts](interfaces.ts)
- **ヒアリング記録**: [design-interview.md](design-interview.md)

---

## 信頼性レベルサマリー

- 🔵 青信号: 10件 (91%)
- 🟡 黄信号: 1件 (9%)
- 🔴 赤信号: 0件 (0%)

**品質評価**: ✅ 高品質
