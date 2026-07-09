# atelier-alchemy-core データフロー図

**作成日**: 2026-07-09
**関連アーキテクチャ**: [architecture.md](architecture.md)
**関連要件定義**: [requirements.md](../../spec/atelier-alchemy-core/requirements.md)

**【信頼性レベル凡例】**:
- 🔵 **青信号**: 要件定義書・ヒアリングを参考にした確実なフロー
- 🟡 **黄信号**: 要件定義書・ヒアリングから妥当な推測によるフロー
- 🔴 **赤信号**: 要件定義書・ヒアリングにない推測によるフロー

---

## システム全体のデータフロー（1ターンの流れ） 🟡

**信頼性**: 🟡 *要件定義書のメインループ（庭→調合→納品→ランク進行）をGodotのシーン/Autoload構成に翻訳*

```mermaid
flowchart TD
    A[ターン開始] --> B[GameState: 日替わり指定調合物を確認]
    B --> C{庭で操作する?}
    C -->|種を植える| D[GardenPanel → GameState.garden_slots更新]
    C -->|収穫する| E[GrowthCalculator: 成熟/枯死判定]
    E --> F[TraitRoll: 特性乱数付与]
    F --> G[GameState.inventoryに素材追加]
    C -->|しない| H
    D --> H{調合する?}
    G --> H
    H -->|する| I[AlchemyBench: 投入枠に素材配置]
    I --> J[QualityCalculator: 平均品質算出]
    J --> K[TraitActivation: 閾値発現判定]
    K --> L[ValueCalculator: 貢献度/報酬算出]
    L --> M[GameState: 完成品を自動納品]
    M --> N[GameState.rank_hp減算 / gold加算]
    H -->|しない| O
    N --> O{ランクHP<=0?}
    O -->|Yes| P[昇格試験へ / workshop: 恒久投資選択]
    O -->|No| Q{残りターン<=0?}
    Q -->|Yes| R[降格処理]
    Q -->|No| S[次ターンへ]
    P --> S
    R --> S
```

## 主要機能のデータフロー

### 機能1: 庭での仕込み〜収穫 🔵

**信頼性**: 🔵 *ユーザーストーリー1.1, 1.2・要件REQ-001〜REQ-008より*

**関連要件**: REQ-001, REQ-004, REQ-005, REQ-006, REQ-007

```mermaid
sequenceDiagram
    participant P as プレイヤー
    participant UI as GardenPanel (ui/garden_panel.gd)
    participant GS as GameState (Autoload)
    participant GC as GrowthCalculator (logic, 純粋関数)
    participant TR as TraitRoll (logic, 純粋関数)

    P->>UI: 種を選択して植える
    UI->>GS: plant_seed(seed_definition, slot_index)
    GS-->>UI: signal garden_updated

    Note over GS: ターン経過ごとに成熟度が進行

    P->>UI: 収穫を実行
    UI->>GC: is_matured(planted_material, current_turn)
    GC-->>UI: 成熟済み / 枯死 の判定結果
    UI->>TR: roll_trait(seed_definition, rng_seed)
    TR-->>UI: 付与された特性タグ（分散のみ、期待値は不変）
    UI->>GS: harvest(slot_index, quality, trait)
    GS-->>UI: signal inventory_updated
```

### 機能2: 調合（投入枠への配置〜完成品生成）★核心 🔵

**信頼性**: 🔵 *ユーザーストーリー2.1, 2.2・要件REQ-101〜REQ-112, REQ-115より*

**関連要件**: REQ-105, REQ-106, REQ-109, REQ-110, REQ-111, REQ-112, REQ-115

**2026-07-09修正（Godotアーキテクトレビュー Warning#2対応）**: UIが計算ロジック（品質・特性・数値算出）を個別に直接オーケストレーションする旧設計は、ビジネスロジックのUI漏れを招くため、`GameState.craft()`（内部で純粋関数`AlchemyResolver.craft()`を1回呼ぶだけ）に処理を集約する設計へ変更した。

```mermaid
sequenceDiagram
    participant P as プレイヤー
    participant UI as AlchemyBench (ui/alchemy_bench.gd)
    participant GS as GameState (Autoload)
    participant AR as AlchemyResolver (logic, 純粋関数)

    P->>UI: 在庫から素材を投入枠(4枠)に配置
    UI->>GS: get_inventory()
    GS-->>UI: 在庫一覧（品質・特性タグ付き）
    P->>UI: 調合を実行
    UI->>GS: craft(投入素材)
    Note over GS: GameStateは自身のcurrent_rank.trait_reveal_levelとtoday_requestを<br/>引数としてAlchemyResolver.craftに渡す（Autoload参照をFunctional Coreに漏らさない）
    GS->>AR: craft(投入素材, reveal_level, daily_request)
    Note right of AR: 内部処理（すべて純粋関数の合成）:<br/>1. calculate_base_quality(投入素材) — REQ-105<br/>2. resolve_activated_traits(投入素材, reveal_level) — REQ-106,112<br/>   同一特性2個以上のみ発現。同一系統内は複数同時発現可(REQ-112)<br/>3. resolve_category_conflict(発現特性) — REQ-115<br/>   貢献度系/報酬系が同時に条件を満たす場合、枚数の多い系統のみ採用<br/>4. apply_trait_penalty(基礎品質, 最終発現特性) — REQ-111<br/>   発現特性1個につき品質-1段（加算的）、補助系(触媒)は事後+1段<br/>5. calculate_contribution / calculate_reward — REQ-109,110<br/>   最終品質・最終発現特性・指定合致ボーナスを用いて算出
    AR-->>GS: CraftResult（最終品質, 発現特性, 貢献度, 報酬）
    GS->>GS: consume_materials(投入素材) + add_completed_item(完成品)
    GS-->>UI: signal item_crafted
```

### 機能3: ギルド納品（自動）〜ランク判定 🔵

**信頼性**: 🔵 *ユーザーストーリー3.1, 3.2, 3.3・要件REQ-201〜REQ-206より*

**関連要件**: REQ-201, REQ-202, REQ-203, REQ-204, REQ-205, REQ-206

```mermaid
sequenceDiagram
    participant AL as Alchemy機能
    participant GS as GameState (Autoload)
    participant DC as DeliveryCalculator (logic, 純粋関数)
    participant UI as DailyRequestBanner (ui)

    AL->>GS: item_crafted signal 発火
    GS->>DC: check_daily_request_match(完成品, 本日の指定調合物)
    DC-->>GS: 合致ボーナス倍率
    GS->>GS: rank_hp -= 貢献度 × 合致ボーナス
    GS->>GS: gold += 報酬 × 合致ボーナス
    GS-->>UI: signal guild_delivered(貢献度, 報酬)

    alt rank_hp <= 0
        GS-->>UI: signal rank_hp_depleted
        Note right of GS: 昇格試験へ（workshop機能に遷移）
    else 残りターン <= 0 かつ rank_hp > 0
        GS-->>UI: signal rank_failed
        Note right of GS: 降格処理（内容はTBD, REQ-206）
    end
```

### 機能4: 工房強化（恒久投資・消耗投資） 🔵

**信頼性**: 🔵 *ユーザーストーリー4.1, 4.2, 4.3・要件REQ-301〜REQ-306より*

**関連要件**: REQ-301, REQ-302, REQ-303, REQ-304, REQ-305

```mermaid
sequenceDiagram
    participant P as プレイヤー
    participant UI as PermanentUpgradeScreen / ConsumableShopPanel
    participant GS as GameState (Autoload)

    Note over UI: 恒久投資はランク間強化画面でのみ表示・購入可能(REQ-304)
    P->>UI: 恒久投資（投入枠+1等）を購入
    UI->>GS: purchase_permanent_upgrade(upgrade_id)
    GS->>GS: gold -= 価格 / permanent_upgrades.append(upgrade_id)
    GS-->>UI: signal upgrades_updated

    Note over UI: 消耗投資はターン中いつでも購入可能(REQ-305)
    P->>UI: 消耗投資（触媒・種の指名買い）を購入
    UI->>GS: purchase_consumable(item_id)
    GS->>GS: gold -= 価格 / inventory.append(item)
    GS-->>UI: signal inventory_updated

    Note over UI: ターン延長に相当する購入項目は存在しない(REQ-303)
```

## データ処理パターン

### 同期処理のみ 🔵

**信頼性**: 🔵 *ローカル完結・ターン制ゲームという性質より*

本ゲームは外部通信・非同期I/Oを持たないため、全ての処理は同期的な関数呼び出し（Functional Coreの純粋関数呼び出し）とGodotのsignalによる即時通知で完結します。バッチ処理・非同期処理・キャッシュ戦略は不要です。

### 状態変更の通知パターン 🟡

**信頼性**: 🟡 *Godot公式のsignalパターン（Connect to a Signal for Event Response）から妥当な推測*

- `GameState` は自身の状態を変更するメソッド（`plant_seed`, `harvest`, `consume_materials` 等）の末尾で対応するsignalを`emit()`する
- UIシーンは `_ready()` 内で `GameState.xxx_updated.connect(_on_xxx_updated)` のように購読する
- 現行TypeScript版のような専用`EventBus` Autoloadは設けず、Godotのネイティブsignalに一本化する（アーキテクチャ簡素化のための意図的な設計判断）

## エラーハンドリングフロー 🟡

**信頼性**: 🟡 *EDGE-001, EDGE-002（既存実装パターン・要件の妥当な推測）より*

```mermaid
flowchart TD
    A[プレイヤー操作] --> B{前提条件を満たすか}
    B -->|投入枠が空/EDGE-001| C[調合ボタンを非活性化し実行不可にする]
    B -->|庭スロット満杯/EDGE-002| D[植栽ボタンを非活性化し実行不可にする]
    B -->|満たす| E[処理を実行]
    E --> F[GameState更新 + signal発行]
```

- 本ゲームはユーザー入力エラー（不正な値の直接入力等）を持たないUI操作前提のため、例外的なエラー処理よりも「実行不可能な操作はそもそもUI上で選択させない」という予防的設計を基本方針とします 🟡

## 関連文書

- **アーキテクチャ**: [architecture.md](architecture.md)
- **データモデル**: [data-model.md](data-model.md)
- **要件定義**: [requirements.md](../../spec/atelier-alchemy-core/requirements.md)

## 信頼性レベルサマリー

- 🔵 青信号: 6件 (55%)
- 🟡 黄信号: 5件 (45%)
- 🔴 赤信号: 0件 (0%)

**品質評価**: 高品質（要件定義書のメインループが詳細なため、フロー自体は🔵中心。Godot固有の実装パターン部分のみ🟡）
