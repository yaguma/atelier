# Phase 2: ゲームシステム実装

## フェーズ概要

| 項目 | 値 |
|------|-----|
| フェーズ | Phase 2 |
| 期間 | 5週間 (25日) |
| タスク数 | 28タスク |
| 工数 | 200時間 |
| 目標 | ゲームの面白さを構成するコアシステムを実装する |
| 成果物 | マップ、デッキ、依頼、商人システム、全画面UI |
| 要件名 | atelier |

---

## 週次計画

### Week 1: マップ生成・ナビゲーション
- [ ] 目標達成: ノード進行型マップシステム
- 成果物: MapGenerator、MapNode、マップ画面UI
- タスク: TASK-0029 〜 TASK-0034 (6タスク / 36時間)

### Week 2: デッキ管理・カードシステム
- [ ] 目標達成: デッキ操作とカードプレイの基本機能
- 成果物: DeckService、カードドロー/プレイ、手札UI
- タスク: TASK-0035 〜 TASK-0040 (6タスク / 38時間)

### Week 3: 依頼システム・暴発判定
- [ ] 目標達成: 依頼達成と暴発メカニクス
- 成果物: QuestService、属性計算、暴発処理
- タスク: TASK-0041 〜 TASK-0046 (6タスク / 36時間)

### Week 4: 商人システム・UI統合
- [ ] 目標達成: 商人機能と全UI画面の統合
- 成果物: MerchantService、商人画面、依頼画面
- タスク: TASK-0047 〜 TASK-0054 (8タスク / 56時間)

### Week 5: 統合テスト・バグ修正
- [ ] 目標達成: ゲームループの動作確認
- 成果物: 統合テスト、バグ修正
- タスク: TASK-0055 〜 TASK-0056 (2タスク / 16時間)

---

## タスク一覧

### Week 1: マップ生成・ナビゲーション

---

#### TASK-0029: MapNodeエンティティの定義 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0029 |
| タスク名 | MapNodeエンティティの定義 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | ui-design/screens/map.md, balance-design.md |
| 依存タスク | Phase 1完了 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public enum NodeType
{
    Quest,      // 依頼
    Merchant,   // 商人
    Experiment, // 実験
    Monster,    // 魔物
    Boss        // ボス
}

public class MapNode
{
    public string NodeId { get; }
    public NodeType Type { get; }
    public int Level { get; }           // マップ上のレベル（0〜10）
    public List<string> ConnectedNodeIds { get; }
    public bool IsVisited { get; set; }
    public bool IsAccessible { get; }
}
```

**テスト要件**:
- [ ] ノード生成が正常に動作する
- [ ] 接続関係が正しく管理される
- [ ] 訪問状態が正しく更新される
- [ ] アクセス可能判定が正しく動作する

**完了条件**:
- [ ] MapNodeクラスと関連型が定義されている
- [ ] 全テストがパスしている

---

#### TASK-0030: MapGeneratorの実装 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0030 |
| タスク名 | MapGeneratorの実装 |
| タスクタイプ | TDD |
| 推定工数 | 8時間 |
| 要件リンク | balance-design.md |
| 依存タスク | TASK-0029 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IMapGenerator
{
    GameMap Generate(int seed, int levelCount = 10);
}

public class GameMap
{
    public List<MapNode> Nodes { get; }
    public string StartNodeId { get; }
    public string BossNodeId { get; }
    public MapNode CurrentNode { get; set; }
}
```

**ノード出現率** (balance-design.mdより):
- 依頼: 50%
- 商人: 20%
- 実験: 15%
- 魔物: 15%
- ボス: 最終ノードに固定

**テスト要件**:
- [ ] 同一シードで同一マップが生成される
- [ ] 30〜50ノードが生成される
- [ ] 全ノードがスタートから到達可能
- [ ] ノード出現率が設計通り
- [ ] ボスノードが最終レベルに配置される

**完了条件**:
- [ ] シード値による再現性のあるマップ生成が可能
- [ ] 全テストがパスしている

---

#### TASK-0031: MapServiceの実装 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0031 |
| タスク名 | MapServiceの実装 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/screens/map.md |
| 依存タスク | TASK-0030 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IMapService
{
    GameMap CurrentMap { get; }
    List<MapNode> GetAccessibleNodes();
    void MoveToNode(string nodeId);
    bool CanMoveToNode(string nodeId);
    event Action<MapNode> OnNodeVisited;
}
```

**テスト要件**:
- [ ] アクセス可能ノードの取得が動作する
- [ ] ノード移動が動作する
- [ ] 移動可否判定が動作する
- [ ] ノード訪問イベントが発火する

**完了条件**:
- [ ] マップナビゲーション機能が実装されている
- [ ] 全テストがパスしている

---

#### TASK-0032: マップ画面UIの基本レイアウト 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0032 |
| タスク名 | マップ画面UIの基本レイアウト |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/screens/map.md |
| 依存タスク | TASK-0031 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- ヘッダー（レベル、名声、ゴールド、メニューボタン）
- マップ表示エリア（ノード描画、接続線）
- ノードプレビューパネル
- デッキ確認・進むボタン

**ノードアイコン** (色覚多様性対応):
| ノードタイプ | アイコン | 色 | 形状 |
|-------------|---------|-----|------|
| 依頼 | 📋 | 青 | 四角 |
| 商人 | 🛒 | 黄 | 六角 |
| 実験 | ⚗️ | 紫 | ひし形 |
| 魔物 | 👹 | 赤 | 円 |
| ボス | 👑 | 金 | 星 |

**テスト要件**:
- [ ] ノードが正しく描画される
- [ ] 接続線が正しく描画される
- [ ] 現在位置が強調表示される
- [ ] アクセス可能ノードがハイライトされる

**UI/UX要件**:
- 解像度: 1920x1080固定
- ノードアイコンのホバー時拡大（1.1倍）
- 現在位置ノードのパルスアニメーション
- 接続線のグラデーション（訪問済み→明るい、未訪問→暗い）
- ノードタイプ別の色+形状による色覚多様性対応

**エラーハンドリング**:
- マップデータ不整合時のフォールバック表示
- ノードが見つからない場合のログ警告
- 描画範囲外ノードのクリッピング処理

**完了条件**:
- [ ] マップ画面が設計書通りに表示される
- [ ] 全テストがパスしている

---

#### TASK-0033: マップ画面の操作・遷移 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0033 |
| タスク名 | マップ画面の操作・遷移 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/screens/map.md |
| 依存タスク | TASK-0032 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- ノードホバーでプレビュー表示
- ノードクリックで選択
- 「進む」ボタンで対応画面へ遷移
  - 依頼ノード → Quest画面
  - 商人ノード → Merchant画面
  - ボスノード → Quest画面（ボス戦）
- ESCキーでポーズメニュー

**テスト要件**:
- [ ] ノード選択でプレビューが更新される
- [ ] 各ノードタイプから正しい画面へ遷移する
- [ ] キーボード操作（矢印キー、Enter）が動作する
- [ ] ポーズメニューが表示される

**UI/UX要件**:
- ノード選択時のハイライトアニメーション
- プレビューパネルのスライドイン表示
- キーボードナビゲーション（矢印キーでノード選択）
- 進むボタンのツールチップ（遷移先表示）

**エラーハンドリング**:
- 存在しないノードIDへのアクセス防止
- シーン遷移失敗時のリトライ処理
- 無効なノードタイプへのフォールバック

**完了条件**:
- [ ] マップ画面の全操作が動作する
- [ ] 全テストがパスしている

---

#### TASK-0034: デッキ確認オーバーレイ 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0034 |
| タスク名 | デッキ確認オーバーレイ |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | ui-design/screens/map.md |
| 依存タスク | TASK-0032 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- デッキ内カード一覧表示
- カードホバーで詳細表示
- 閉じるボタン

**テスト要件**:
- [ ] デッキ内全カードが表示される
- [ ] カード詳細が正しく表示される
- [ ] ESCキーまたは閉じるボタンで閉じる

**UI/UX要件**:
- オーバーレイ表示時のフェードイン（0.2秒）
- カードグリッド表示（3列×nスクロール）
- カード詳細のポップアップ表示
- スクロールバー表示（10枚以上時）

**エラーハンドリング**:
- 空デッキ時のメッセージ表示
- カードデータ取得失敗時のプレースホルダー表示

**完了条件**:
- [ ] デッキ確認オーバーレイが動作する
- [ ] 全テストがパスしている

---

### Week 2: デッキ管理・カードシステム

---

#### TASK-0035: DeckServiceの実装 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0035 |
| タスク名 | DeckServiceの実装 |
| タスクタイプ | TDD |
| 推定工数 | 8時間 |
| 要件リンク | core-systems.md, game-mechanics.md |
| 依存タスク | Phase 1完了 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IDeckService
{
    List<Card> DrawPile { get; }
    List<Card> Hand { get; }
    List<Card> DiscardPile { get; }

    void InitializeDeck(List<string> cardIds);
    void Shuffle();
    List<Card> DrawCards(int count);
    void DiscardCard(Card card);
    void DiscardHand();
    void AddCardToDeck(Card card);
    void RemoveCardFromDeck(Card card);
}
```

**デッキ仕様** (game-mechanics.mdより):
- 手札上限: 5枚
- 山札が空の場合、捨て札をシャッフルして補充

**テスト要件**:
- [ ] デッキ初期化が動作する
- [ ] シャッフルが動作する
- [ ] カードドローが動作する
- [ ] 山札枯渇時に捨て札がシャッフルされる
- [ ] カード追加/削除が動作する

**完了条件**:
- [ ] デッキ管理機能が実装されている
- [ ] 全テストがパスしている

---

#### TASK-0036: EnergySystemの実装 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0036 |
| タスク名 | EnergySystemの実装 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | game-mechanics.md |
| 依存タスク | Phase 1完了 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IEnergySystem
{
    int CurrentEnergy { get; }
    int MaxEnergy { get; }
    int EnergyPerTurn { get; }

    void ResetForNewTurn();
    bool CanSpend(int amount);
    void Spend(int amount);
    void Restore(int amount);
}
```

**エネルギー仕様** (確定値):
- 初期エネルギー: 3
- 最大エネルギー: 10
- 毎ターン獲得: 3

**テスト要件**:
- [ ] ターン開始時にエネルギーが回復する
- [ ] 最大値を超えないように制限される
- [ ] エネルギー消費が動作する
- [ ] エネルギー不足判定が動作する

**完了条件**:
- [ ] エネルギーシステムが実装されている
- [ ] 全テストがパスしている

---

#### TASK-0037: CardPlayServiceの実装 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0037 |
| タスク名 | CardPlayServiceの実装 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | core-systems.md, game-mechanics.md |
| 依存タスク | TASK-0035, TASK-0036 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface ICardPlayService
{
    bool CanPlayCard(Card card, Quest targetQuest);
    void PlayCard(Card card, Quest targetQuest);
    event Action<Card, Quest> OnCardPlayed;
}
```

**カードプレイフロー**:
1. エネルギー確認
2. 手札から削除
3. 捨て札に追加
4. 依頼に属性値加算
5. 安定値更新
6. イベント発行

**テスト要件**:
- [ ] カードプレイ可否判定が動作する
- [ ] 属性値が正しく加算される
- [ ] 安定値が正しく更新される
- [ ] エネルギーが消費される
- [ ] CardPlayedEventが発行される

**完了条件**:
- [ ] カードプレイ機能が実装されている
- [ ] 全テストがパスしている

---

#### TASK-0038: PlayCardCommandの実装（アンドゥ対応） 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0038 |
| タスク名 | PlayCardCommandの実装 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | ui-design/input-system.md |
| 依存タスク | TASK-0037, TASK-0024 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public class PlayCardCommand : ICommand
{
    private Card _card;
    private Quest _targetQuest;
    private CardAttributes _previousAttributes;
    private int _previousStability;
    private int _previousEnergy;

    public void Execute();
    public void Undo();
}
```

**テスト要件**:
- [ ] Execute後にUndo可能
- [ ] Undoで属性値が復元される
- [ ] Undoで安定値が復元される
- [ ] Undoでエネルギーが復元される
- [ ] Undoでカードが手札に戻る

**完了条件**:
- [ ] カードプレイのアンドゥが動作する
- [ ] 全テストがパスしている

---

#### TASK-0039: TurnServiceの実装 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0039 |
| タスク名 | TurnServiceの実装 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | game-mechanics.md, dataflow.md |
| 依存タスク | TASK-0035, TASK-0036 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface ITurnService
{
    int CurrentTurn { get; }
    void StartTurn();
    void EndTurn();
    event Action OnTurnStarted;
    event Action OnTurnEnded;
}
```

**ターン開始処理**:
1. ターン数インクリメント
2. エネルギー回復
3. 手札補充（5枚まで）
4. TurnStartedEvent発行

**ターン終了処理**:
1. 手札を捨て札へ
2. アンドゥ履歴クリア
3. TurnEndedEvent発行

**テスト要件**:
- [ ] ターン開始処理が動作する
- [ ] ターン終了処理が動作する
- [ ] 手札が5枚になるまでドローされる
- [ ] イベントが正しく発行される

**完了条件**:
- [ ] ターン管理機能が実装されている
- [ ] 全テストがパスしている

---

#### TASK-0040: 手札UI表示 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0040 |
| タスク名 | 手札UI表示 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/screens/quest.md |
| 依存タスク | TASK-0035 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- 手札カード表示（5枚）
- カードホバーで拡大表示
- 山札/捨て札枚数表示
- カード選択状態の表示
- エネルギー不足カードのグレーアウト

**テスト要件**:
- [ ] 手札カードが正しく表示される
- [ ] ホバー時にカードが拡大される
- [ ] 山札/捨て札枚数が正しく表示される
- [ ] エネルギー不足カードが識別できる

**UI/UX要件**:
- カード表示アニメーション（ドロー時のスライドイン）
- ホバー時のカード拡大表示（1.5倍、画面中央にオーバーレイ）
- エネルギー不足カードの赤枠+グレーアウト
- 山札/捨て札のクリックで詳細オーバーレイ表示
- カード選択状態の光エフェクト

**エラーハンドリング**:
- カードデータ不整合時のフォールバック表示
- 手札上限超過時の自動破棄処理

**完了条件**:
- [ ] 手札UIが設計書通りに表示される
- [ ] 全テストがパスしている

---

### Week 3: 依頼システム・暴発判定

---

#### TASK-0041: QuestServiceの実装 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0041 |
| タスク名 | QuestServiceの実装 |
| タスクタイプ | TDD |
| 推定工数 | 8時間 |
| 要件リンク | core-systems.md, game-mechanics.md |
| 依存タスク | TASK-0018 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IQuestService
{
    List<Quest> ActiveQuests { get; }
    Quest SelectedQuest { get; }

    void GenerateQuests(int count = 3, int difficulty = 1);
    void SelectQuest(Quest quest);
    void ApplyCard(Card card, Quest quest);
    bool CheckCompletion(Quest quest);
    void CompleteQuest(Quest quest);
    event Action<Quest> OnQuestCompleted;
}
```

**同時進行依頼数**: 最大3件

**テスト要件**:
- [ ] 依頼生成が動作する
- [ ] 依頼選択が動作する
- [ ] カード効果適用が動作する
- [ ] 達成判定が動作する
- [ ] 依頼達成イベントが発行される

**完了条件**:
- [ ] 依頼システムが実装されている
- [ ] 全テストがパスしている

---

#### TASK-0042: 属性値計算・達成判定 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0042 |
| タスク名 | 属性値計算・達成判定 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | game-mechanics.md |
| 依存タスク | TASK-0041 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
// 属性値加算
Progress.CurrentAttributes.Fire += Card.Attributes.Fire;

// 達成判定
public bool IsCompleted()
{
    return Requirements.IsMetBy(Progress.CurrentAttributes) &&
           !Progress.HasExploded;
}

public bool IsMetBy(CardAttributes current)
{
    return current.Fire >= RequiredAttributes.Fire &&
           current.Water >= RequiredAttributes.Water &&
           // ... 他属性
           current.Quality >= MinQuality;
}
```

**テスト要件**:
- [ ] 属性値加算が正しく動作する
- [ ] 全属性を満たした場合にtrueを返す
- [ ] 1つでも不足があればfalseを返す
- [ ] 暴発後はfalseを返す

**完了条件**:
- [ ] 属性値計算と達成判定が実装されている
- [ ] 全テストがパスしている

---

#### TASK-0043: 暴発システムの実装 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0043 |
| タスク名 | 暴発システムの実装 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | core-systems.md, game-mechanics.md |
| 依存タスク | TASK-0041 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IExplosionHandler
{
    bool CheckExplosion(QuestProgress progress);
    void TriggerExplosion(Quest quest);
    event Action<Quest> OnExplosion;
}

// 暴発条件
if (Progress.CurrentStability < 0)
{
    TriggerExplosion();
}
```

**暴発ペナルティ**:
- 依頼失敗
- 名声 -1
- 50%確率でランダムカード1枚ロスト

**テスト要件**:
- [ ] 安定値0以上では暴発しない
- [ ] 安定値負で暴発が発生する
- [ ] 名声減少が適用される
- [ ] カードロストが確率で発生する
- [ ] ExplosionEventが発行される

**完了条件**:
- [ ] 暴発システムが実装されている
- [ ] 全テストがパスしている

---

#### TASK-0044: 依頼報酬の処理 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0044 |
| タスク名 | 依頼報酬の処理 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | game-mechanics.md, balance-design.md |
| 依存タスク | TASK-0041 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public class RewardService
{
    public void GrantReward(Quest quest, Player player)
    {
        player.AddGold(quest.Rewards.Gold);
        player.AddFame(quest.Rewards.Fame);
        // カード報酬選択画面へ
    }
}
```

**報酬テーブル** (balance-design.mdより):
| 難易度 | 報酬ゴールド |
|--------|-------------|
| ⭐ | 30G |
| ⭐⭐ | 50G |
| ⭐⭐⭐ | 80G |
| ⭐⭐⭐⭐ | 120G |
| ⭐⭐⭐⭐⭐ | 180G |

**テスト要件**:
- [ ] ゴールドが正しく付与される
- [ ] 名声が正しく付与される
- [ ] 難易度に応じた報酬が計算される

**完了条件**:
- [ ] 報酬システムが実装されている
- [ ] 全テストがパスしている

---

#### TASK-0045: 依頼画面UIの基本レイアウト 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0045 |
| タスク名 | 依頼画面UIの基本レイアウト |
| タスクタイプ | TDD |
| 推定工数 | 8時間 |
| 要件リンク | ui-design/screens/quest.md |
| 依存タスク | TASK-0040, TASK-0041 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- ヘッダー（エネルギー、ターン数、ポーズボタン）
- 依頼ボード（3件表示）
  - 顧客名、難易度、属性進捗、安定値、進捗バー
- 錬金釜エリア（ドロップターゲット）
- 手札エリア（TASK-0040で作成済み）
- フッター（デッキ確認、捨て札確認、アンドゥ、ターン終了）

**テスト要件**:
- [ ] 依頼カードが3件表示される
- [ ] 属性進捗が正しく表示される
- [ ] 安定値が正しく表示される
- [ ] 進捗バーがアニメーションする

**UI/UX要件**:
- 依頼カードのスライドインアニメーション（画面右から）
- 属性進捗バーのリアルタイム更新アニメーション
- 安定値ゲージの色変化（緑→黄→赤）
- 錬金釜エリアのドロップ可能状態ハイライト
- エネルギー/ターン数の常時表示

**エラーハンドリング**:
- 依頼データ取得失敗時のリトライ
- 依頼表示数0の場合のフォールバック表示
- UI更新の同期エラー防止

**完了条件**:
- [ ] 依頼画面が設計書通りに表示される
- [ ] 全テストがパスしている

---

#### TASK-0046: ドラッグ＆ドロップ操作 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0046 |
| タスク名 | ドラッグ＆ドロップ操作 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/screens/quest.md |
| 依存タスク | TASK-0045, TASK-0037 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- 手札カードのドラッグ開始
- ドラッグ中のカード表示
- 依頼カードへのドロップ → その依頼にプレイ
- 錬金釜へのドロップ → 選択中依頼にプレイ
- ドロップ失敗時は元の位置に戻る
- ダブルクリックで選択中依頼にプレイ

**テスト要件**:
- [ ] ドラッグ開始が動作する
- [ ] 依頼へのドロップでカードがプレイされる
- [ ] 錬金釜へのドロップでカードがプレイされる
- [ ] 無効なドロップ位置で元に戻る
- [ ] ダブルクリックでプレイできる

**UI/UX要件**:
- ドラッグ中のカード半透明表示
- ドロップ可能エリアのハイライト表示
- ドロップ成功時のエフェクト（カード消滅）
- ドロップ失敗時のバウンスアニメーション
- ダブルクリックのビジュアルフィードバック

**エラーハンドリング**:
- ドラッグ中のシステム割り込み対応
- 不正なドロップ位置の無視
- カードプレイ失敗時のロールバック

**完了条件**:
- [ ] ドラッグ＆ドロップ操作が動作する
- [ ] 全テストがパスしている

---

### Week 4: 商人システム・UI統合

---

#### TASK-0047: MerchantServiceの実装 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0047 |
| タスク名 | MerchantServiceの実装 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/screens/merchant.md, balance-design.md |
| 依存タスク | Phase 1完了 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IMerchantService
{
    List<Card> CurrentStock { get; }
    void GenerateStock(int count = 6);
    bool CanPurchase(Card card, Player player);
    void Purchase(Card card, Player player);
    bool CanUpgrade(Card card, Player player);
    void Upgrade(Card card, Player player);
    bool CanRemove(Card card, Player player);
    void Remove(Card card, Player player);
}
```

**価格設計** (balance-design.mdより):
| アクション | 価格 |
|-----------|------|
| Common購入 | 50G |
| Uncommon購入 | 80G |
| Rare購入 | 120G |
| Epic購入 | 180G |
| カード強化 | 75G |
| カード削除 | 30G |

**テスト要件**:
- [ ] 在庫生成が動作する
- [ ] 購入可否判定が動作する
- [ ] 購入処理が動作する
- [ ] 強化処理が動作する
- [ ] 削除処理が動作する

**完了条件**:
- [ ] 商人システムが実装されている
- [ ] 全テストがパスしている

---

#### TASK-0048: 商人画面UIの作成 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0048 |
| タスク名 | 商人画面UIの作成 |
| タスクタイプ | TDD |
| 推定工数 | 8時間 |
| 要件リンク | ui-design/screens/merchant.md |
| 依存タスク | TASK-0047 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- ヘッダー（ゴールド表示、戻るボタン）
- 商人セリフエリア
- タブ（購入/強化/削除）
- 商品一覧（カードグリッド表示）
- 選択中アイテム詳細パネル
- アクションボタン（購入/強化/削除実行）

**テスト要件**:
- [ ] タブ切替が動作する
- [ ] 商品選択で詳細が表示される
- [ ] ゴールド不足時にグレーアウトされる
- [ ] 購入確認ダイアログが表示される
- [ ] 戻るボタンでマップ画面へ遷移する

**UI/UX要件**:
- タブ切替時のスライドアニメーション
- 商品カードのホバー時拡大表示
- ゴールド不足時の赤枠+価格赤字表示
- 購入成功時のコイン獲得エフェクト
- 商人セリフのタイプライター表示

**エラーハンドリング**:
- 在庫データ不整合時のフォールバック
- 購入処理失敗時のロールバック
- ゴールド計算の整合性チェック

**完了条件**:
- [ ] 商人画面が設計書通りに表示される
- [ ] 全テストがパスしている

---

#### TASK-0049: GameServiceの統合 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0049 |
| タスク名 | GameServiceの統合 |
| タスクタイプ | TDD |
| 推定工数 | 8時間 |
| 要件リンク | architecture.md, dataflow.md |
| 依存タスク | 全サービス完了 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IGameService
{
    GameState CurrentState { get; }
    Player CurrentPlayer { get; }

    void StartNewGame(string styleId, int seed);
    void ContinueGame();
    void SaveGame();
    void EndRun(bool victory);

    event Action<GamePhase> OnPhaseChanged;
}
```

**テスト要件**:
- [ ] 新規ゲーム開始が動作する
- [ ] ゲーム継続が動作する
- [ ] ゲーム保存が動作する
- [ ] ラン終了処理が動作する

**完了条件**:
- [ ] ゲーム全体の統合が完了している
- [ ] 全テストがパスしている

---

#### TASK-0050: 依頼画面の完成 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0050 |
| タスク名 | 依頼画面の完成 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/screens/quest.md |
| 依存タスク | TASK-0045, TASK-0046 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- 暴発エフェクト（画面シェイク + 爆発）
- 達成エフェクト（キラキラ）
- 報酬選択画面
- ターン終了確認
- キーボードショートカット（1-5, Tab, Space, Ctrl+Z, ESC）

**テスト要件**:
- [ ] 暴発時にエフェクトが再生される
- [ ] 達成時にエフェクトが再生される
- [ ] 報酬選択が動作する
- [ ] 全キーボードショートカットが動作する

**UI/UX要件**:
- 暴発エフェクト（画面シェイク0.5秒 + 爆発パーティクル）
- 達成エフェクト（キラキラパーティクル + ファンファーレ）
- 報酬選択画面のカード3枚選択UI
- ショートカットキーのオンスクリーンヒント表示

**エラーハンドリング**:
- エフェクト再生失敗時のスキップ処理
- 報酬選択タイムアウト処理
- キーボードショートカット競合防止

**完了条件**:
- [ ] 依頼画面が完全に動作する
- [ ] 全テストがパスしている

---

#### TASK-0051: マップ画面の完成 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0051 |
| タスク名 | マップ画面の完成 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | ui-design/screens/map.md |
| 依存タスク | TASK-0033, TASK-0034 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- ポーズメニュー（セーブ、設定、タイトルへ戻る）
- マップスクロール/ズーム（+/-キー）
- 訪問済みノードの表示更新
- ボスノードへの到達条件表示

**テスト要件**:
- [ ] ポーズメニューが動作する
- [ ] ズーム操作が動作する
- [ ] 訪問済みノードが正しく表示される

**UI/UX要件**:
- ポーズメニューのスライドイン表示
- ズーム操作のスムーズアニメーション
- ボスノードの特別なエフェクト（オーラ表示）
- ミニマップ表示（オプション）

**エラーハンドリング**:
- ポーズ中のゲーム状態保持
- ズーム範囲の制限（0.5〜2.0倍）
- セーブ失敗時のエラーダイアログ

**完了条件**:
- [ ] マップ画面が完全に動作する
- [ ] 全テストがパスしている

---

#### TASK-0052: GamePhaseControllerの実装 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0052 |
| タスク名 | GamePhaseControllerの実装 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | dataflow.md |
| 依存タスク | TASK-0049 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public class GamePhaseController
{
    public void TransitionTo(GamePhase phase);
    public void HandleNodeCompletion(MapNode node);
    public void HandleQuestCompletion(bool success);
    public void HandleBossDefeat();
}
```

**フェーズ遷移**:
- Title → StyleSelect → Map
- Map → Quest/Merchant
- Quest → Map (依頼完了時)
- Quest → Result (ゲーム終了時)

**テスト要件**:
- [ ] 各フェーズ間の遷移が動作する
- [ ] ノード完了後に正しい画面へ遷移する
- [ ] ゲーム終了条件を満たした時にリザルトへ遷移する

**完了条件**:
- [ ] フェーズ制御が実装されている
- [ ] 全テストがパスしている

---

#### TASK-0053: SE統合（ゲームプレイ） 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0053 |
| タスク名 | SE統合（ゲームプレイ） |
| タスクタイプ | DIRECT |
| 推定工数 | 4時間 |
| 要件リンク | audio-design.md |
| 依存タスク | TASK-0027 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- SE_CARD_DRAW: カードドロー時
- SE_CARD_PLAY: カードプレイ時
- SE_CARD_DISCARD: カード捨て時
- SE_QUEST_COMPLETE: 依頼達成時
- SE_EXPLOSION: 暴発発生時
- SE_TURN_END: ターン終了時
- SE_GOLD_GAIN: ゴールド獲得時

**完了条件**:
- [ ] 各アクションでSEが再生される
- [ ] 音量設定が反映される

---

#### TASK-0054: BGM統合（シーン別） 🔵
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0054 |
| タスク名 | BGM統合（シーン別） |
| タスクタイプ | DIRECT |
| 推定工数 | 4時間 |
| 要件リンク | audio-design.md |
| 依存タスク | TASK-0027 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- BGM_TITLE: タイトル画面
- BGM_MAP: マップ画面
- BGM_QUEST: 依頼画面
- BGM_MERCHANT: 商人画面
- BGM_BOSS: ボス戦

**完了条件**:
- [ ] 各画面で対応するBGMが再生される
- [ ] BGMフェードが動作する
- [ ] 音量設定が反映される

---

### Week 5: 統合テスト・バグ修正

---

#### TASK-0055: 統合テストの作成 🟡
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0055 |
| タスク名 | 統合テストの作成 |
| タスクタイプ | TDD |
| 推定工数 | 8時間 |
| 要件リンク | - |
| 依存タスク | 全機能実装完了 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- E2Eテストシナリオ作成
  - 新規ゲーム開始〜依頼1件達成
  - 暴発によるゲームオーバー
  - 商人での購入/強化/削除
  - ボス戦クリア

**テスト要件**:
- [ ] 基本ゲームループが動作する
- [ ] 暴発フローが動作する
- [ ] 商人フローが動作する
- [ ] 勝利/敗北フローが動作する

**完了条件**:
- [ ] 主要シナリオの統合テストがパスしている

---

#### TASK-0056: バグ修正・安定化 🟡
- [ ] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0056 |
| タスク名 | バグ修正・安定化 |
| タスクタイプ | DIRECT |
| 推定工数 | 8時間 |
| 要件リンク | - |
| 依存タスク | TASK-0055 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- 統合テストで発見されたバグの修正
- エッジケースの対応
- パフォーマンスの初期調整
- エラーハンドリングの強化

**完了条件**:
- [ ] 既知のバグが全て修正されている
- [ ] 全テストがパスしている
- [ ] ゲームが安定して動作する

---

## フェーズ完了条件

- [ ] 全28タスクが完了している
- [ ] マップ生成・ナビゲーションが動作する
- [ ] デッキ管理（ドロー、プレイ、捨て札）が動作する
- [ ] 依頼システム（属性加算、達成判定、暴発）が動作する
- [ ] 商人システム（購入、強化、削除）が動作する
- [ ] 全画面（マップ、依頼、商人）が動作する
- [ ] BGM/SEが適切に再生される
- [ ] 統合テストがパスしている

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2025-12-21 | 1.0 | 初版作成 |
