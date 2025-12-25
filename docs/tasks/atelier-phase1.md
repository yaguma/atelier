# Phase 1: ゲーム基盤部分の作成

## フェーズ概要

| 項目 | 値 |
|------|-----|
| フェーズ | Phase 1 |
| 期間 | 4週間 (20日) |
| タスク数 | 23タスク |
| 工数 | 160時間 |
| 目標 | ゲームの基盤システムを構築し、基本的なゲームフローを動作可能にする |
| 成果物 | シーン管理、UI基盤、データ管理、入力システム、基本画面 |
| 要件名 | atelier |

---

## 週次計画

### Week 1: プロジェクト基盤・アーキテクチャ構築
- [x] 目標達成: Clean Architectureベースのプロジェクト構造確立
- 成果物: フォルダ構造、基本インターフェース、EventBus
- タスク: TASK-0006 〜 TASK-0010 (5タスク / 18時間)

### Week 2: シーン管理・UI基盤
- [x] 目標達成: シーン遷移システムとUI共通コンポーネント
- 成果物: SceneManager、UIManager、共通UIパーツ
- タスク: TASK-0011 〜 TASK-0016 (6タスク / 31時間)

### Week 3: データ管理・永続化
- [x] 目標達成: マスターデータ読込とセーブ/ロード機能
- 成果物: エンティティ定義、SaveDataRepository、マスターデータJSON
- タスク: TASK-0017 〜 TASK-0022 (6タスク / 24時間)

### Week 4: 入力システム・基本画面
- [x] 目標達成: 入力管理とタイトル・スタイル選択画面
- 成果物: InputManager、CommandManager、タイトル画面、スタイル選択画面、AudioManager
- タスク: TASK-0023 〜 TASK-0028 (6タスク / 28時間)

---

## タスク一覧

### Week 1: プロジェクト基盤・アーキテクチャ構築

---

#### TASK-0006: プロジェクトフォルダ構造の作成 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0006 |
| タスク名 | プロジェクトフォルダ構造の作成 |
| タスクタイプ | DIRECT |
| 推定工数 | 2時間 |
| 要件リンク | architecture.md |
| 依存タスク | なし |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- Assets/Scripts/Presentation/ (UIManager, InputManager)
- Assets/Scripts/Application/ (Services)
- Assets/Scripts/Domain/ (Entities, ValueObjects)
- Assets/Scripts/Infrastructure/ (Repositories, DataLoaders)
- Assets/Resources/MasterData/
- Assets/Scenes/

**完了条件**:
- [x] 4層アーキテクチャに対応したフォルダ構造が作成されている
- [x] 各レイヤーにREADME.mdが配置されている
- [x] Unity Editorでコンパイルエラーがない

---

#### TASK-0007: EventBusの実装 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0007 |
| タスク名 | EventBusの実装 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | architecture.md, dataflow.md |
| 依存タスク | TASK-0006 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IEventBus
{
    void Publish<T>(T eventData) where T : IEvent;
    void Subscribe<T>(Action<T> handler) where T : IEvent;
    void Unsubscribe<T>(Action<T> handler) where T : IEvent;
}
```

**テスト要件**:
- [x] イベントの発行と購読が正常に動作する
- [x] 購読解除後はハンドラが呼ばれない
- [x] 複数のハンドラが同一イベントを購読できる
- [x] 異なるイベント型は独立して処理される

**完了条件**:
- [x] IEventBusインターフェースとEventBus実装クラスが作成されている
- [x] 全テストがパスしている
- [x] Unityエディタで動作確認済み

---

#### TASK-0008: 基本イベント定義 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0008 |
| タスク名 | 基本イベント定義 |
| タスクタイプ | TDD |
| 推定工数 | 3時間 |
| 要件リンク | dataflow.md |
| 依存タスク | TASK-0007 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- IEvent インターフェース
- CardPlayedEvent (カードプレイ完了時)
- QuestCompletedEvent (依頼達成時)
- TurnStartedEvent (ターン開始時)
- TurnEndedEvent (ターン終了時)
- ExplosionEvent (暴発発生時)
- GameOverEvent (ゲーム終了時)

**テスト要件**:
- [x] 各イベントが正しく生成できる
- [x] イベントデータが正しく保持される
- [x] EventBus経由で発行・購読できる

**完了条件**:
- [x] dataflow.mdに記載された全イベントが定義されている
- [x] 全テストがパスしている

---

#### TASK-0009: GameStateの定義 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0009 |
| タスク名 | GameStateの定義 |
| タスクタイプ | TDD |
| 推定工数 | 3時間 |
| 要件リンク | data-schema.md, dataflow.md |
| 依存タスク | TASK-0006 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public enum GamePhase
{
    Title,
    StyleSelect,
    Map,
    Quest,
    Merchant,
    Result
}

public class GameState
{
    public GamePhase CurrentPhase { get; set; }
    public int TurnCount { get; set; }
    public int Energy { get; set; }
    public int MaxEnergy { get; set; }
}
```

**テスト要件**:
- [x] フェーズ遷移が正しく動作する
- [x] ターン数の増減が正しく動作する
- [x] エネルギー管理が正しく動作する

**完了条件**:
- [x] GameStateクラスが定義されている
- [x] 全テストがパスしている

---

#### TASK-0010: DIコンテナ/サービスロケーターの設定 🟡
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0010 |
| タスク名 | DIコンテナ/サービスロケーターの設定 |
| タスクタイプ | DIRECT |
| 推定工数 | 6時間 |
| 要件リンク | architecture.md |
| 依存タスク | TASK-0006, TASK-0007 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public static class ServiceLocator
{
    public static void Register<T>(T instance);
    public static T Get<T>();
    public static void Clear();
}
```

**完了条件**:
- [x] サービスの登録・取得が可能
- [x] Bootstrapシーンで初期化される
- [x] テストでモック注入可能

---

### Week 2: シーン管理・UI基盤

---

#### TASK-0011: GameSceneEnumの定義 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0011 |
| タスク名 | GameSceneEnumの定義 |
| タスクタイプ | DIRECT |
| 推定工数 | 1時間 |
| 要件リンク | ui-design/overview.md |
| 依存タスク | TASK-0006 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public enum GameScene
{
    Boot,
    Title,
    StyleSelect,
    Map,
    Quest,
    Merchant,
    Result
}
```

**完了条件**:
- [x] UI設計書に記載された全画面に対応するEnum値が定義されている
- [x] コンパイルエラーがない

---

#### TASK-0012: SceneManagerの実装 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0012 |
| タスク名 | SceneManagerの実装 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/overview.md |
| 依存タスク | TASK-0011 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface ISceneManager
{
    GameScene CurrentScene { get; }
    void LoadScene(GameScene scene);
    void LoadSceneAsync(GameScene scene, Action onComplete = null);
    void ReloadCurrentScene();
}
```

**テスト要件**:
- [x] シーン遷移が正常に動作する
- [x] 遷移完了コールバックが呼ばれる
- [x] 現在シーンが正しく取得できる
- [x] シーンリロードが動作する

**完了条件**:
- [x] ISceneManagerインターフェースと実装が作成されている
- [x] 全テストがパスしている

---

#### TASK-0013: UIManagerの基本実装 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0013 |
| タスク名 | UIManagerの基本実装 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/overview.md |
| 依存タスク | TASK-0007, TASK-0012 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IUIManager
{
    void ShowScreen(string screenId);
    void HideScreen(string screenId);
    void ShowDialog(string dialogId, Action<bool> onResult = null);
    void HideDialog(string dialogId);
    void ShowLoading();
    void HideLoading();
}
```

**テスト要件**:
- [x] 画面表示/非表示が動作する
- [x] ダイアログ表示とコールバックが動作する
- [x] ローディング表示が動作する

**UI/UX要件**:
- ローディング画面のスピナーアニメーション
- 画面遷移中の入力ブロック
- 画面スタック管理（戻る操作対応）

**エラーハンドリング**:
- 存在しないscreenIdの参照時のログ警告
- 画面プレハブ読み込み失敗時のフォールバック
- ダイアログコールバックのnull安全呼び出し

**完了条件**:
- [x] 基本的なUI管理機能が実装されている
- [x] 全テストがパスしている

---

#### TASK-0014: 共通UIコンポーネント - ボタン 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0014 |
| タスク名 | 共通UIコンポーネント - ボタン |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | ui-design/overview.md |
| 依存タスク | TASK-0013 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- PrimaryButton (決定・開始) - 背景色: #8B4513
- SecondaryButton (キャンセル・戻る) - 背景色: グレー
- DangerButton (削除) - 背景色: 赤
- GhostButton (補助) - 背景色: 透明
- ホバー/クリックアニメーション (スケール 1.05/0.95)

**テスト要件**:
- [x] 各ボタンタイプが正しいスタイルで表示される
- [x] ホバー時にスケール拡大アニメーションが再生される
- [x] クリック時に縮小アニメーションが再生される
- [x] 無効状態でクリックが無効化される

**UI/UX要件**:
- 解像度: 1920x1080固定
- フォーカス状態の視覚的フィードバック（枠線ハイライト）
- 無効状態はグレーアウト＋半透明表示
- タッチ/マウス両対応
- アクセシビリティ: フォーカス順序の設定

**エラーハンドリング**:
- ボタンのnullチェック（OnClick前）
- 重複クリック防止（debounce: 0.1秒）

**完了条件**:
- [x] 4種類のボタンプレハブが作成されている
- [x] 全テストがパスしている

---

#### TASK-0015: 共通UIコンポーネント - ダイアログ 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0015 |
| タスク名 | 共通UIコンポーネント - ダイアログ |
| タスクタイプ | TDD |
| 推定工数 | 5時間 |
| 要件リンク | ui-design/overview.md |
| 依存タスク | TASK-0013, TASK-0014 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- ConfirmDialog (OK/キャンセル)
- InfoDialog (閉じるのみ)
- ErrorDialog (閉じる/リトライ)
- InputDialog (入力フィールド + 決定/キャンセル)
- モーダル背景とアニメーション (スケールイン 0.2秒)

**テスト要件**:
- [x] 各ダイアログタイプが正しく表示される
- [x] ボタン押下で適切なコールバックが呼ばれる
- [x] ESCキーでキャンセル動作する
- [x] モーダル背景クリックで閉じる（設定可能）

**UI/UX要件**:
- モーダル背景: 半透明黒（rgba(0,0,0,0.5)）
- 表示アニメーション: スケールイン 0.2秒（EaseOutBack）
- 非表示アニメーション: フェードアウト 0.15秒
- ESCキーでキャンセル（設定可能）
- キーボードフォーカストラップ（ダイアログ外へフォーカス移動不可）

**エラーハンドリング**:
- ダイアログスタック管理（多重表示対応）
- ダイアログ表示中の背後の入力ブロック
- コールバックnullチェック

**完了条件**:
- [x] 4種類のダイアログプレハブが作成されている
- [x] 全テストがパスしている

---

#### TASK-0016: 画面トランジションの実装 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0016 |
| タスク名 | 画面トランジションの実装 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | ui-design/overview.md |
| 依存タスク | TASK-0012 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface ITransitionManager
{
    void FadeIn(float duration = 0.3f, Action onComplete = null);
    void FadeOut(float duration = 0.3f, Action onComplete = null);
    void CrossFade(Action onMiddle, float duration = 0.6f);
}
```

**テスト要件**:
- [x] フェードアニメーションが指定時間で完了する
- [x] スケールアニメーションが指定時間で完了する
- [x] アニメーション完了コールバックが呼ばれる
- [x] CrossFadeの中間コールバックが呼ばれる

**UI/UX要件**:
- フェードイン/フェードアウト: 黒画面からの遷移
- CrossFade: 前画面フェードアウト→新画面フェードイン
- トランジション中の入力無効化

**エラーハンドリング**:
- 遷移コルーチンのキャンセル処理
- 多重トランジション呼び出しの防止
- onComplete/onMiddleコールバックのnull安全呼び出し

**完了条件**:
- [x] TransitionManagerが実装されている
- [x] 全テストがパスしている

---

### Week 3: データ管理・永続化

---

#### TASK-0017: カードエンティティの定義 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0017 |
| タスク名 | カードエンティティの定義 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | data-schema.md, core-systems.md |
| 依存タスク | TASK-0006 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public class Card
{
    public string CardId { get; }
    public string Name { get; }
    public CardType Type { get; }
    public CardRarity Rarity { get; }
    public int Cost { get; }
    public CardAttributes Attributes { get; }
    public int Stability { get; }
    public string Description { get; }
}

public struct CardAttributes
{
    public int Fire { get; }
    public int Water { get; }
    public int Earth { get; }
    public int Wind { get; }
    public int Poison { get; }
    public int Quality { get; }
}

public enum CardType { Material, Tool, Technique, Catalyst }
public enum CardRarity { Common, Uncommon, Rare, Epic, Legendary }
```

**テスト要件**:
- [x] カード生成が正常に動作する
- [x] 属性値が正しく保持される
- [x] 不変オブジェクトとして動作する

**完了条件**:
- [x] Cardクラスと関連型が定義されている
- [x] 全テストがパスしている

---

#### TASK-0018: 依頼エンティティの定義 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0018 |
| タスク名 | 依頼エンティティの定義 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | data-schema.md, core-systems.md |
| 依存タスク | TASK-0017 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public class Quest
{
    public string QuestId { get; }
    public string Name { get; }
    public string Customer { get; }
    public int Difficulty { get; }
    public QuestRequirements Requirements { get; }
    public QuestRewards Rewards { get; }
}

public class QuestProgress
{
    public CardAttributes CurrentAttributes { get; set; }
    public int CurrentStability { get; set; }
    public bool HasExploded { get; set; }
    public bool IsCompleted();
}
```

**テスト要件**:
- [x] 依頼生成が正常に動作する
- [x] 進捗管理が正しく動作する
- [x] 達成判定が正しく動作する

**完了条件**:
- [x] Questクラスと関連型が定義されている
- [x] 全テストがパスしている

---

#### TASK-0019: プレイヤー・スタイルエンティティの定義 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0019 |
| タスク名 | プレイヤー・スタイルエンティティの定義 |
| タスクタイプ | TDD |
| 推定工数 | 3時間 |
| 要件リンク | data-schema.md |
| 依存タスク | TASK-0017 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public class Player
{
    public int Gold { get; set; }
    public int Fame { get; set; }
    public int KnowledgePoints { get; set; }
    public void AddGold(int amount);
    public void AddFame(int amount);
    public bool CanAfford(int cost);
}

public class Style
{
    public string StyleId { get; }
    public string Name { get; }
    public string Description { get; }
    public List<string> StartingDeckCardIds { get; }
    public StylePassiveBonus PassiveBonus { get; }
}
```

**テスト要件**:
- [x] ゴールド・名声の加減算が正しく動作する
- [x] 購入可能判定が正しく動作する
- [x] スタイルから初期デッキ情報が取得できる

**完了条件**:
- [x] Player, Styleクラスが定義されている
- [x] 全テストがパスしている

---

#### TASK-0020: SaveDataRepositoryの実装 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0020 |
| タスク名 | SaveDataRepositoryの実装 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | data-schema.md, dataflow.md |
| 依存タスク | TASK-0017, TASK-0018, TASK-0019 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface ISaveDataRepository
{
    bool HasSaveData();
    SaveData Load();
    void Save(SaveData data);
    void Delete();
}

public class SaveData
{
    public string Version { get; set; }
    public DateTime Timestamp { get; set; }
    public PlayerSaveData Player { get; set; }
    public MetaSaveData Meta { get; set; }
    public CurrentRunSaveData CurrentRun { get; set; }
}
```

**テスト要件**:
- [x] セーブデータの保存が動作する
- [x] セーブデータの読込が動作する
- [x] セーブデータの削除が動作する
- [x] 存在確認が正しく動作する
- [x] バージョン管理が動作する

**エラーハンドリング**:
- ファイル読み込み失敗時の例外処理
- JSON パース失敗時のエラーログ出力
- バージョン不整合時のマイグレーション処理
- ディスク容量不足時のエラー通知
- セーブデータ破損時のバックアップからの復旧

**完了条件**:
- [x] Application.persistentDataPathへの保存/読込が実装されている
- [x] 全テストがパスしている

---

#### TASK-0021: マスターデータJSONの作成 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0021 |
| タスク名 | マスターデータJSONの作成 |
| タスクタイプ | DIRECT |
| 推定工数 | 4時間 |
| 要件リンク | data-schema.md |
| 依存タスク | TASK-0017, TASK-0018, TASK-0019 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- Resources/MasterData/cards.json (初期カード10枚程度)
  - 火の鉱石、水の草、混合、加熱、石炭など
- Resources/MasterData/quests.json (初期依頼5件程度)
  - 回復薬、魔力の薬など
- Resources/MasterData/styles.json (火の錬金術師1種)

**完了条件**:
- [x] 各JSONファイルが作成されている
- [x] ConfigDataLoaderで読み込めることを確認
- [x] データスキーマに準拠している

---

#### TASK-0022: マスターデータ読込検証 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0022 |
| タスク名 | マスターデータ読込検証 |
| タスクタイプ | TDD |
| 推定工数 | 3時間 |
| 要件リンク | data-schema.md |
| 依存タスク | TASK-0021 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- ConfigDataLoaderからカード、依頼、スタイルが読み込めることを確認
- エンティティへの正しいマッピングを確認

**テスト要件**:
- [x] cards.jsonから全カードが読み込める
- [x] quests.jsonから全依頼が読み込める
- [x] styles.jsonから全スタイルが読み込める
- [x] 各フィールドが正しくマッピングされる

**完了条件**:
- [x] 全マスターデータの読込テストがパスしている

---

### Week 4: 入力システム・基本画面

---

#### TASK-0023: InputManagerの実装 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0023 |
| タスク名 | InputManagerの実装 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/input-system.md |
| 依存タスク | TASK-0007 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IInputManager
{
    event Action OnConfirm;       // Enter
    event Action OnCancel;        // Escape
    event Action OnUndo;          // Ctrl+Z
    event Action<int> OnCardSlotSelected;  // 1-5
    event Action OnEndTurn;       // Space

    bool IsKeyDown(string actionName);
    void RebindKey(string actionName, KeyCode newKey);
    void SetInputEnabled(bool enabled);
}
```

**テスト要件**:
- [x] キー押下イベントが発火する
- [x] カスタムキーバインドが動作する
- [x] 入力無効化が動作する
- [x] 修飾キー（Ctrl+Z）が動作する

**完了条件**:
- [x] デフォルトキーバインドが設定されている
- [x] 全テストがパスしている

---

#### TASK-0024: CommandManagerの実装（アンドゥ用） 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0024 |
| タスク名 | CommandManagerの実装 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | ui-design/input-system.md |
| 依存タスク | TASK-0023 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface ICommand
{
    void Execute();
    void Undo();
}

public interface ICommandManager
{
    bool CanUndo { get; }
    bool CanRedo { get; }
    void ExecuteCommand(ICommand command);
    void Undo();
    void Redo();
    void Clear();
}
```

**テスト要件**:
- [x] コマンド実行が動作する
- [x] アンドゥが動作する
- [x] リドゥが動作する
- [x] 履歴クリアが動作する
- [x] 最大50履歴を保持する

**完了条件**:
- [x] アンドゥ/リドゥ機能が実装されている
- [x] 全テストがパスしている

---

#### TASK-0025: タイトル画面UIの作成 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0025 |
| タスク名 | タイトル画面UIの作成 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/screens/title.md |
| 依存タスク | TASK-0012, TASK-0013, TASK-0014, TASK-0020 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- タイトルロゴ表示 (ATELIER / 錬金術工房)
- 新規ゲームボタン (btn-newgame)
- コンティニューボタン (btn-continue) - セーブデータ存在時のみ有効
- 設定ボタン (btn-settings)
- 終了ボタン (btn-exit)
- バージョン・著作権表示

**テスト要件**:
- [x] 新規ゲームボタンでスタイル選択画面へ遷移
- [x] コンティニューボタンがセーブデータ存在時のみ有効
- [x] 設定ボタンで設定ダイアログ表示
- [x] 終了ボタンで確認ダイアログ表示
- [x] キーボード操作（↑↓Enter）が動作する

**UI/UX要件**:
- 解像度: 1920x1080固定
- ボタン間のキーボードナビゲーション（↑↓）
- 初期フォーカス: セーブデータあり→コンティニュー、なし→新規ゲーム
- ボタンホバー時のSE再生（SE_BUTTON_HOVER）
- ボタン押下時のSE再生（SE_BUTTON_CLICK）
- ローディング表示: BGM読み込み中等

**エラーハンドリング**:
- セーブデータ読み込みエラー時のエラーダイアログ表示
- セーブデータ破損時のリカバリー処理
- シーン遷移失敗時のエラー通知

**完了条件**:
- [x] タイトル画面が設計書通りに表示される
- [x] 全操作が動作する
- [x] 全テストがパスしている

---

#### TASK-0026: スタイル選択画面UIの作成 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0026 |
| タスク名 | スタイル選択画面UIの作成 |
| タスクタイプ | TDD |
| 推定工数 | 6時間 |
| 要件リンク | ui-design/screens/style-select.md |
| 依存タスク | TASK-0019, TASK-0021, TASK-0025 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- 戻るボタン (btn-back)
- スタイル選択ボタン×4（火/水/毒/鉱、MVP時は火のみ有効）
- スタイル詳細パネル（名前、説明、特殊能力）
- 初期デッキプレビュー
- シード入力ダイアログ
- ゲーム開始ボタン (btn-start)

**テスト要件**:
- [x] スタイル選択で詳細パネルが更新される
- [x] シード入力ダイアログが動作する
- [x] ゲーム開始でマップ画面へ遷移
- [x] 戻るボタンでタイトル画面へ遷移
- [x] キーボード操作（←→Enter）が動作する

**UI/UX要件**:
- 解像度: 1920x1080固定
- スタイル選択時のハイライトアニメーション
- 初期デッキプレビューのカードホバーでカード詳細表示
- スタイル間のキーボードナビゲーション（←→）
- シード入力のバリデーション（英数字のみ、最大20文字）
- ローディング表示: マスターデータ読み込み中

**エラーハンドリング**:
- マスターデータ読み込みエラー時のエラーダイアログ
- 無効なシード入力時のエラー表示
- スタイルデータ不整合時のフォールバック

**完了条件**:
- [x] スタイル選択画面が設計書通りに表示される
- [x] 全操作が動作する
- [x] 全テストがパスしている

---

#### TASK-0027: AudioManagerの基本実装 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0027 |
| タスク名 | AudioManagerの基本実装 |
| タスクタイプ | TDD |
| 推定工数 | 4時間 |
| 要件リンク | audio-design.md |
| 依存タスク | TASK-0007 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
```csharp
public interface IAudioManager
{
    void PlayBGM(string bgmId, bool loop = true);
    void StopBGM(float fadeOutDuration = 0.5f);
    void PlaySE(string seId);
    void SetMasterVolume(float volume);  // 0-100
    void SetBGMVolume(float volume);     // 0-100
    void SetSEVolume(float volume);      // 0-100
}
```

**テスト要件**:
- [x] BGM再生/停止が動作する
- [x] SE再生が動作する
- [x] ボリューム設定が動作する (0-100)
- [x] BGMフェードが動作する

**エラーハンドリング**:
- 存在しないBGM/SE IDのフォールバック（無音再生）
- AudioClip読み込み失敗時のログ警告
- 同時再生数制限（SE: 最大8音）
- ボリューム値の範囲制限（0-100のクランプ）

**完了条件**:
- [x] 基本的なオーディオ管理機能が実装されている
- [x] 全テストがパスしている

---

#### TASK-0028: SE/BGMプレースホルダーの設定 🔵
- [x] 完了

| 項目 | 内容 |
|------|------|
| タスクID | TASK-0028 |
| タスク名 | SE/BGMプレースホルダーの設定 |
| タスクタイプ | DIRECT |
| 推定工数 | 2時間 |
| 要件リンク | audio-design.md |
| 依存タスク | TASK-0027 |
| 要件名 | atelier |
| GitHub Issue | - |

**実装詳細**:
- Resources/Audio/BGM/ にプレースホルダーBGM配置
  - BGM_TITLE, BGM_MAP 等
- Resources/Audio/SE/ にプレースホルダーSE配置
  - SE_BUTTON_CLICK, SE_BUTTON_HOVER 等
- AudioIdConstants.cs (ID定数クラス)

**完了条件**:
- [x] 基本的なBGM/SE用フォルダ構造が作成されている
- [x] 最低限のプレースホルダー音源が配置されている
- [x] AudioManagerで読み込めることを確認

---

## フェーズ完了条件

- [x] 全23タスクが完了している
- [x] タイトル画面からスタイル選択画面への遷移が動作する
- [x] セーブ/ロード機能が動作する
- [x] マスターデータの読み込みが動作する
- [x] EventBusによるイベント通信が動作する
- [x] 入力システム（キーボード・マウス）が動作する
- [x] 基本的なUI/オーディオが動作する
- [x] 全ユニットテストがパスしている

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2025-12-21 | 1.0 | 初版作成 |
