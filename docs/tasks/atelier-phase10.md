# Phase 10: 統合テスト & 最終調整タスク

**期間**: Week 1-2 (5日間)
**総工数**: 40h
**タスク範囲**: TASK-0040 ~ TASK-0042
**タスクタイプ**: TDD & DIRECT混合

---

## TASK-0040: フルゲームプレイ統合テスト

**タスクID**: TASK-0040
**GitHub Issue**: [#42](https://github.com/yaguma/atelier/issues/42)
**タスク名**: フルゲームプレイ統合テスト
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: 全要件

### 依存タスク
- Phase 1~9の全タスク

### 実装詳細

#### 統合テストシナリオ

##### シナリオ1: 新規ゲームからクリアまでのフルフロー
```
1. Boot → Title → StyleSelect
2. スタイル選択 → 初期デッキ確認
3. Map表示 → 依頼ノードへ移動
4. Quest開始 → カードプレイ → 依頼達成
5. 報酬選択 → デッキに追加
6. Mapへ戻る → 商人ノードへ移動
7. Merchant → カード購入/強化/削除
8. Mapへ戻る → 実験ノードへ移動
9. Experiment → 成功/失敗
10. Mapへ戻る → 魔物ノードへ移動
11. Monster → 撃破 → 素材獲得
12. Mapへ戻る → ボスノードへ移動
13. Boss Quest → クリア
14. Result → メタ通貨獲得 → Title
```

##### シナリオ2: セーブ/ロードフロー
```
1. ゲーム途中でセーブ
2. タイトルへ戻る
3. コンティニュー → セーブスロット選択
4. ゲーム再開 → 状態が復元されている
```

##### シナリオ3: エラー処理フロー
```
1. 暴発発生 → ペナルティ処理
2. エネルギー不足でカードプレイ失敗
3. ゴールド不足で購入失敗
4. セーブデータ破損時の処理
```

#### 統合テストクラス
```csharp
namespace Atelier.Tests.Integration
{
    using NUnit.Framework;
    using UnityEngine;
    using UnityEngine.SceneManagement;
    using Atelier.Application;
    using Atelier.Domain;
    using System.Threading.Tasks;

    [TestFixture]
    public class FullGameplayIntegrationTests
    {
        [Test]
        public async Task FullGameFlow_NewGameToVictory()
        {
            // === Boot → Title ===
            SceneManager.LoadScene("BootScene");
            await WaitForSceneLoad("TitleScene");
            Assert.IsNotNull(GameManager.Instance);

            // === Title → StyleSelect ===
            var titleController = Object.FindObjectOfType<TitleSceneController>();
            titleController.OnNewGameClicked();
            await WaitForSceneLoad("StyleSelectScene");

            // === StyleSelect → Map ===
            var styleController = Object.FindObjectOfType<StyleSelectSceneController>();
            var style = styleController.availableStyles[0];
            styleController.SelectStyle(style);
            styleController.OnStartClicked();
            await WaitForSceneLoad("MapScene");

            // === Map → Quest ===
            var mapController = Object.FindObjectOfType<MapSceneController>();
            var questNode = FindQuestNode(mapController);
            mapController.OnNodeClicked(questNode);
            await WaitForSceneLoad("QuestScene");

            // === Quest ===
            var questController = Object.FindObjectOfType<QuestSceneController>();
            Assert.AreEqual(3, questController.questCards.Count);

            // カードプレイ
            var firstCard = questController.handCards[0];
            questController.OnCardClicked(firstCard.Card);

            // 依頼達成まで繰り返す
            // ...

            // === Quest → Map ===
            // 達成後、Mapへ戻る
            await WaitForSceneLoad("MapScene");

            // === Map → Merchant ===
            var merchantNode = FindMerchantNode(mapController);
            mapController.OnNodeClicked(merchantNode);
            await WaitForSceneLoad("MerchantScene");

            // === Merchant ===
            var merchantController = Object.FindObjectOfType<MerchantSceneController>();
            // 購入処理
            // ...

            merchantController.OnLeaveClicked();
            await WaitForSceneLoad("MapScene");

            // === ボスまで進行 ===
            // ...

            // === Result ===
            await WaitForSceneLoad("ResultScene");
            var resultController = Object.FindObjectOfType<ResultSceneController>();

            Assert.IsTrue(resultController.isVictory);
        }

        [Test]
        public async Task SaveLoadFlow_RestoresGameState()
        {
            // ゲーム開始
            await StartNewGame();

            // 状態を記録
            var originalDeckSize = GameManager.Instance.DeckManager.DrawPile.Count;
            var originalNodeId = GameManager.Instance.MapSystem.GetCurrentNode().Id;

            // セーブ
            GameManager.Instance.SaveGame(0);

            // タイトルへ戻る
            SceneManager.LoadScene("TitleScene");
            await WaitForSceneLoad("TitleScene");

            // ロード
            var titleController = Object.FindObjectOfType<TitleSceneController>();
            titleController.LoadSaveSlot(0);
            await WaitForSceneLoad("MapScene");

            // 状態が復元されているか確認
            Assert.AreEqual(originalDeckSize, GameManager.Instance.DeckManager.DrawPile.Count);
            Assert.AreEqual(originalNodeId, GameManager.Instance.MapSystem.GetCurrentNode().Id);
        }

        [Test]
        public void ExplosionFlow_AppliesPenalty()
        {
            // 暴発が発生する状況を作成
            var quest = new Quest
            {
                Progress = new QuestProgress { CurrentStability = 1 }
            };

            var card = new Card { Stability = -5 };

            // カード適用
            quest.ApplyCard(card);

            // 暴発が発生したか確認
            Assert.IsTrue(quest.HasExploded());
        }

        [Test]
        public void EnergyShortage_PreventsCardPlay()
        {
            var deckManager = new DeckManager(new EventBus());
            var card = new Card { Cost = 5 };

            // エネルギーが不足している状態
            // TODO: DeckManagerからエネルギーを取得

            // カードプレイが失敗することを確認
            Assert.Throws<System.InvalidOperationException>(() =>
            {
                deckManager.PlayCard(card);
            });
        }

        private async Task WaitForSceneLoad(string sceneName)
        {
            int timeout = 0;
            while (SceneManager.GetActiveScene().name != sceneName && timeout < 100)
            {
                await Task.Delay(100);
                timeout++;
            }

            if (timeout >= 100)
            {
                throw new System.TimeoutException($"Scene {sceneName} did not load");
            }
        }

        private MapNode FindQuestNode(MapSceneController controller)
        {
            var allNodes = GameManager.Instance.MapSystem.GetAllNodes();
            return allNodes.Find(n => n.Type == NodeType.Quest && n.IsAvailable);
        }

        private MapNode FindMerchantNode(MapSceneController controller)
        {
            var allNodes = GameManager.Instance.MapSystem.GetAllNodes();
            return allNodes.Find(n => n.Type == NodeType.Merchant && n.IsAvailable);
        }

        private async Task StartNewGame()
        {
            SceneManager.LoadScene("BootScene");
            await WaitForSceneLoad("TitleScene");

            var titleController = Object.FindObjectOfType<TitleSceneController>();
            titleController.OnNewGameClicked();
            await WaitForSceneLoad("StyleSelectScene");

            var styleController = Object.FindObjectOfType<StyleSelectSceneController>();
            styleController.OnStartClicked();
            await WaitForSceneLoad("MapScene");
        }
    }
}
```

### 完了条件
- [ ] フルゲームプレイシナリオが通る 🔵
- [ ] セーブ/ロードが正しく動作する 🔵
- [ ] エラー処理が正しく動作する 🔵
- [ ] すべての統合テストが通る 🔵
- [ ] ゲームが最初から最後まで一貫してプレイできる 🔵

### テスト要件（TDDタスク）
#### Red
- 各統合テストシナリオを作成（失敗）

#### Green
- シーン間のデータ受け渡しを修正
- エラーハンドリングを実装

#### Refactor
- パフォーマンスの最適化
- コードの整理

---

## TASK-0041: パフォーマンス最適化

**タスクID**: TASK-0041
**GitHub Issue**: [#43](https://github.com/yaguma/atelier/issues/43)
**タスク名**: パフォーマンス最適化
**推定工数**: 16h
**タスクタイプ**: DIRECT
**要件名**: atelier
**要件リンク**: NFR-001, NFR-002, NFR-003

### 依存タスク
- TASK-0040: フルゲームプレイ統合テスト

### 実装詳細

#### パフォーマンス目標（再掲）
| 項目 | 目標値 | 測定方法 |
|------|--------|---------|
| 起動時間 | 5秒以内 | Unity Profiler |
| フレームレート | 60 FPS以上 | Unity Profiler |
| メモリ使用量 | 2GB以下 | Unity Profiler |
| CPU使用率 | 50%以下 | Unity Profiler |
| カード操作応答時間 | 100ms以内 | カスタム計測 |

#### 最適化項目

##### 1. 起動時間最適化 (NFR-001)
```csharp
// BootSceneControllerの最適化
private async Task InitializeGame()
{
    // 並列読み込み
    var tasks = new List<Task>
    {
        Task.Run(() => CreateGameManager()),
        Task.Run(() => LoadConfigData()),
        Task.Run(() => CheckSaveData())
    };

    await Task.WhenAll(tasks);

    // 最低表示時間を確保（UX向上）
    await Task.Delay(500);
}
```

##### 2. UI描画最適化
```csharp
// CardUIのプーリング
public class CardUIPool
{
    private ObjectPool<CardUI> pool;

    public CardUIPool(CardUI prefab, int initialSize)
    {
        pool = new ObjectPool<CardUI>(prefab, initialSize);
    }

    public CardUI GetCard()
    {
        return pool.Get();
    }

    public void ReturnCard(CardUI card)
    {
        pool.Return(card);
    }
}
```

##### 3. イベントバスの最適化
```csharp
// EventBusのメモリリーク対策
public class EventBus
{
    // WeakReferenceを使用してメモリリーク防止
    private Dictionary<Type, List<WeakReference>> eventHandlers;

    public void Subscribe<T>(Action<T> handler) where T : GameEvent
    {
        var eventType = typeof(T);

        if (!eventHandlers.ContainsKey(eventType))
        {
            eventHandlers[eventType] = new List<WeakReference>();
        }

        eventHandlers[eventType].Add(new WeakReference(handler));

        // 定期的にガベージコレクション
        CleanupDeadReferences(eventType);
    }

    private void CleanupDeadReferences(Type eventType)
    {
        if (eventHandlers.ContainsKey(eventType))
        {
            eventHandlers[eventType].RemoveAll(wr => !wr.IsAlive);
        }
    }
}
```

##### 4. カード操作応答時間の最適化 (NFR-003)
```csharp
// カードクリックの応答時間計測
public class PerformanceMonitor
{
    private System.Diagnostics.Stopwatch stopwatch;

    public void MeasureCardPlayTime(Action cardPlayAction)
    {
        stopwatch = System.Diagnostics.Stopwatch.StartNew();

        cardPlayAction();

        stopwatch.Stop();

        if (stopwatch.ElapsedMilliseconds > 100)
        {
            Debug.LogWarning($"Card play took {stopwatch.ElapsedMilliseconds}ms");
        }
    }
}
```

### 完了条件
- [ ] 起動時間が5秒以内 (NFR-001) 🔵
- [ ] フレームレートが60FPS以上 (NFR-002) 🔵
- [ ] カード操作が100ms以内に応答 (NFR-003) 🔵
- [ ] メモリ使用量が2GB以下 🔵
- [ ] CPU使用率が50%以下 🔵

### テスト要件（DIRECTタスク）
#### パフォーマンステスト
- [ ] Unity Profilerで起動時間を計測
- [ ] Unity Profilerでフレームレートを計測
- [ ] Unity Profilerでメモリ使用量を計測
- [ ] Unity ProfilerでCPU使用率を計測
- [ ] カード操作時間を計測

#### ストレステスト
- [ ] 100枚以上のカードでデッキをテスト
- [ ] 長時間プレイでメモリリークがないか確認
- [ ] 高速連打でクラッシュしないか確認

---

## TASK-0042: 最終バグ修正とポリッシュ

**タスクID**: TASK-0042
**GitHub Issue**: [#44](https://github.com/yaguma/atelier/issues/44)
**タスク名**: 最終バグ修正とポリッシュ
**推定工数**: 8h
**タスクタイプ**: DIRECT
**要件名**: atelier
**要件リンク**: 全要件

### 依存タスク
- TASK-0040: フルゲームプレイ統合テスト
- TASK-0041: パフォーマンス最適化

### 実装詳細

#### バグ修正チェックリスト

##### 機能バグ
- [ ] カードプレイ時のエネルギー計算が正しい
- [ ] 暴発判定が正しく動作する
- [ ] 依頼達成判定が正しく動作する
- [ ] セーブ/ロードが正しく動作する
- [ ] アンドゥ機能が正しく動作する
- [ ] マップノード遷移が正しく動作する
- [ ] 商人の購入/強化/削除が正しく動作する
- [ ] 実験/魔物ノードが正しく動作する
- [ ] メタ進行が正しく保存される

##### UIバグ
- [ ] すべてのボタンが正しく動作する
- [ ] テキストが正しく表示される
- [ ] UIレイアウトが崩れていない
- [ ] 画面解像度1920x1080で正しく表示される
- [ ] カードUIが正しく表示される
- [ ] 依頼ボードが正しく表示される

##### 音声バグ
- [ ] BGMが正しく再生される
- [ ] SEが正しく再生される
- [ ] BGMフェードが正しく動作する
- [ ] 音量調整が正しく動作する

##### エラー処理バグ
- [ ] セーブデータ破損時にクラッシュしない
- [ ] 存在しないカードIDでクラッシュしない
- [ ] エネルギー不足時に適切なエラー表示
- [ ] ゴールド不足時に適切なエラー表示

#### ポリッシュ項目

##### UX改善
```csharp
// ローディング表示の追加
public class LoadingIndicator : MonoBehaviour
{
    [SerializeField] private GameObject loadingPanel;
    [SerializeField] private Text loadingText;

    public void Show(string message)
    {
        loadingPanel.SetActive(true);
        loadingText.text = message;
    }

    public void Hide()
    {
        loadingPanel.SetActive(false);
    }
}
```

##### アニメーション改善
- カードプレイ時のアニメーション追加 🟡
- 依頼達成時のエフェクト追加 🟡
- 暴発時のエフェクト追加 🟡
- ノード移動時のアニメーション追加 🟡

##### テキスト校正
- すべてのUIテキストを校正 🟡
- 誤字脱字の修正 🟡
- 説明文の統一 🟡

##### バランス調整
- カードコストのバランス調整 🟡
- 依頼難易度のバランス調整 🟡
- 報酬のバランス調整 🟡
- メタ通貨獲得量のバランス調整 🟡

### 完了条件
- [ ] すべての機能バグが修正されている 🔵
- [ ] すべてのUIバグが修正されている 🔵
- [ ] すべての音声バグが修正されている 🔵
- [ ] エラー処理が適切に実装されている 🔵
- [ ] ポリッシュ項目が完了している 🟡

### テスト要件（DIRECTタスク）
#### 最終テスト
- [ ] 新規ゲームからクリアまで1プレイ通して実行
- [ ] セーブ/ロードを複数回テスト
- [ ] すべてのノードタイプをテスト
- [ ] すべてのシーン遷移をテスト
- [ ] エラーケースをテスト

#### ユーザビリティテスト
- [ ] 第三者にプレイしてもらう
- [ ] フィードバックを収集
- [ ] 改善点を反映

---

## Phase 10 完了条件

### 全体完了条件
- [ ] すべてのタスク(TASK-0040~0042)が完了している
- [ ] フルゲームプレイ統合テストが通る
- [ ] パフォーマンス目標を達成している
- [ ] すべてのバグが修正されている
- [ ] ゲームがポリッシュされている

### MVP完成条件
- [ ] Phase 1~10のすべてのタスクが完了している
- [ ] すべての機能要件(REQ-001~050)が実装されている
- [ ] すべての非機能要件(NFR-001~010)が満たされている
- [ ] ゲームが最初から最後まで一貫してプレイできる
- [ ] ビルドが成功する

### リリース準備
#### ビルド設定
```
Build Settings:
- Target Platform: Windows x64
- Architecture: x86_64
- Compression Method: LZ4
- Development Build: OFF
```

#### リリースファイル構成
```
Atelier_v1.0/
├── Atelier.exe
├── UnityCrashHandler64.exe
├── UnityPlayer.dll
├── Atelier_Data/
│   ├── Managed/
│   ├── Resources/
│   ├── StreamingAssets/
│   └── ...
└── README.txt
```

#### README.txt
```
# Atelier - 錬金術デッキ構築ゲーム

## 動作環境
- OS: Windows 10以降
- CPU: Core i3相当以上
- メモリ: 4GB以上
- ストレージ: 500MB以上

## 操作方法
- マウス: カード選択、UI操作
- キーボード: ショートカット操作
  - Ctrl+Z: アンドゥ
  - Space: ターン終了
  - 1~5: カードスロット選択
  - Esc: メニュー表示

## セーブデータ
セーブデータは以下の場所に保存されます:
%APPDATA%\..\LocalLow\[CompanyName]\Atelier\SaveData\

## 問い合わせ
バグ報告や要望は[連絡先]まで
```

### 次ステップ（リリース後）
- ユーザーフィードバック収集 🟡
- バグ修正パッチリリース 🟡
- 追加スタイルの実装 (REQ-020) 🟡
- iOS・Android版への移植検討 (REQ-009) 🟡

---

## プロジェクト総括

### 総工数
```
Phase 1:  40h (インフラ基盤)
Phase 2:  72h (データ構造とカード/依頼)
Phase 3:  80h (デッキ/マップ/メタ進行)
Phase 4:  64h (報酬/商人/実験/魔物)
Phase 5:  72h (アプリケーション層)
Phase 6:  16h (オーディオ)
Phase 7:  72h (基本シーン)
Phase 8:  96h (ゲームプレイPart1)
Phase 9:  64h (ゲームプレイPart2)
Phase 10: 40h (統合テスト&最終調整)
-----------------------------------
合計:    616h (約77日間 @ 8h/日)
```

### タスク総数
```
TASK-0001 ~ TASK-0042
合計: 42タスク
```

### 技術スタック
- Unity 2021.3 LTS
- C# (.NET Standard 2.1)
- NUnit (テストフレームワーク)
- TextMeshPro (UI)

### アーキテクチャ
- レイヤードアーキテクチャ
  - Presentation Layer (UI/View)
  - Application Layer (GameManager, StateManager, EventBus)
  - Domain Layer (CardSystem, QuestSystem, DeckManager, etc.)
  - Infrastructure Layer (SaveDataRepository, ConfigDataLoader, etc.)
- デザインパターン
  - Singleton (GameManager, AudioManager, InputManager)
  - Command (アンドゥ機能)
  - Observer (EventBus)
  - Object Pool (CardUI, SE AudioSource)

---

**信頼性レベル凡例**:
- 🔵 青信号: 設計文書から明確
- 🟡 黄信号: 設計文書から妥当な推測
- 🔴 赤信号: 設計文書にない推測
