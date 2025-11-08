# Phase 7: 基本シーンタスク

**期間**: Week 1-3 (9日間)
**総工数**: 72h
**タスク範囲**: TASK-0030 ~ TASK-0033
**タスクタイプ**: TDD中心

---

## TASK-0030: BootScene実装

**タスクID**: TASK-0030
**タスク名**: BootScene実装
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-007, NFR-001

### 依存タスク
- TASK-0026: GameManager実装
- TASK-0029: AudioManager実装
- TASK-0004: ConfigDataLoader実装

### 実装詳細

設計文書 `01-architecture.md` のBootScene定義を参照 🔵

#### BootScene の役割
- 設定データ読み込み 🔵
- セーブデータ確認 🔵
- DontDestroyOnLoad のマネージャー生成 🔵
- TitleSceneへ遷移 🔵

#### BootSceneController クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.SceneManagement;
    using Atelier.Application;
    using Atelier.Infrastructure;

    public class BootSceneController : MonoBehaviour
    {
        private async void Start()
        {
            await InitializeGame();
        }

        private async System.Threading.Tasks.Task InitializeGame()
        {
            // 1. GameManager生成
            CreateGameManager();

            // 2. AudioManager生成
            CreateAudioManager();

            // 3. InputManager生成
            CreateInputManager();

            // 4. 設定データ読み込み
            LoadConfigData();

            // 5. セーブデータ確認
            CheckSaveData();

            // 6. ローディング演出（最低500ms）
            await System.Threading.Tasks.Task.Delay(500);

            // 7. Titleシーンへ遷移
            SceneManager.LoadScene("TitleScene");
        }

        private void CreateGameManager()
        {
            if (GameManager.Instance == null)
            {
                var go = new GameObject("GameManager");
                go.AddComponent<GameManager>();
            }
        }

        private void CreateAudioManager()
        {
            if (AudioManager.Instance == null)
            {
                var go = new GameObject("AudioManager");
                go.AddComponent<AudioManager>();
            }
        }

        private void CreateInputManager()
        {
            if (InputManager.Instance == null)
            {
                var go = new GameObject("InputManager");
                go.AddComponent<InputManager>();
            }
        }

        private void LoadConfigData()
        {
            try
            {
                var cardConfig = ConfigDataLoader.LoadCardConfig();
                var questConfig = ConfigDataLoader.LoadQuestConfig();
                var styleConfig = ConfigDataLoader.LoadAlchemyStyleConfig();

                Debug.Log($"Loaded {cardConfig.Cards.Count} cards");
                Debug.Log($"Loaded {questConfig.Quests.Count} quests");
                Debug.Log($"Loaded {styleConfig.Styles.Count} styles");
            }
            catch (System.Exception ex)
            {
                ErrorHandler.HandleConfigLoadError("all", ex);
            }
        }

        private void CheckSaveData()
        {
            var saveRepo = new SaveDataRepository();

            for (int i = 0; i < 3; i++)
            {
                bool hasSave = saveRepo.HasSaveData(i);
                Debug.Log($"Save Slot {i}: {(hasSave ? "Exists" : "Empty")}");
            }
        }
    }
}
```

#### BootScene UI
- シンプルなローディング画面 🟡
- ゲームタイトルロゴ表示 🟡
- プログレスバー（オプション） 🔴

### 完了条件
- [ ] 起動から5秒以内にTitleSceneへ遷移する (REQ-007, NFR-001) 🔵
- [ ] 設定データが正しく読み込まれる 🔵
- [ ] セーブデータの存在確認ができる 🔵
- [ ] DontDestroyOnLoadマネージャーが生成される 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void InitializeGame_CreatesGameManager()
{
    var controller = new BootSceneController();

    // 初期化を実行
    controller.InitializeGame();

    Assert.IsNotNull(GameManager.Instance); // 失敗
}

[Test]
public void LoadConfigData_LoadsAllConfigs()
{
    var controller = new BootSceneController();

    controller.LoadConfigData();

    // 設定データが読み込まれていることを確認
    Assert.IsNotNull(GameManager.Instance.CardSystem); // 失敗
}
```

#### Green
- BootSceneControllerを実装

#### Refactor
- 非同期処理の最適化
- エラーハンドリングの改善

---

## TASK-0031: TitleScene実装

**タスクID**: TASK-0031
**タスク名**: TitleScene実装
**推定工数**: 20h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-012, REQ-040, REQ-041

### 依存タスク
- TASK-0030: BootScene実装
- TASK-0026: GameManager実装
- TASK-0003: SaveDataRepository実装

### 実装詳細

設計文書 `01-architecture.md` のTitleScene定義を参照 🔵

#### TitleScene の役割
- 新規ゲーム 🔵
- コンティニュー 🔵
- 設定 🔵
- メタアンロック画面 🔵

#### TitleSceneController クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using UnityEngine.SceneManagement;
    using Atelier.Application;
    using Atelier.Infrastructure;

    public class TitleSceneController : MonoBehaviour
    {
        [SerializeField] private Button newGameButton;
        [SerializeField] private Button continueButton;
        [SerializeField] private Button metaProgressButton;
        [SerializeField] private Button settingsButton;
        [SerializeField] private Button exitButton;

        [SerializeField] private GameObject saveSlotPanel;
        [SerializeField] private Button[] saveSlotButtons;

        private SaveDataRepository saveRepo;

        private void Start()
        {
            saveRepo = new SaveDataRepository();

            // BGM再生
            AudioManager.Instance.PlayBGM("title_theme");

            // ボタンイベント設定
            newGameButton.onClick.AddListener(OnNewGameClicked);
            continueButton.onClick.AddListener(OnContinueClicked);
            metaProgressButton.onClick.AddListener(OnMetaProgressClicked);
            settingsButton.onClick.AddListener(OnSettingsClicked);
            exitButton.onClick.AddListener(OnExitClicked);

            // コンティニューボタンの有効/無効
            UpdateContinueButton();
        }

        private void UpdateContinueButton()
        {
            bool hasSaveData = false;
            for (int i = 0; i < 3; i++)
            {
                if (saveRepo.HasSaveData(i))
                {
                    hasSaveData = true;
                    break;
                }
            }

            continueButton.interactable = hasSaveData;
        }

        private void OnNewGameClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            SceneManager.LoadScene("StyleSelectScene");
        }

        private void OnContinueClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            ShowSaveSlotPanel();
        }

        private void ShowSaveSlotPanel()
        {
            saveSlotPanel.SetActive(true);

            for (int i = 0; i < saveSlotButtons.Length; i++)
            {
                int slotIndex = i;
                saveSlotButtons[i].onClick.RemoveAllListeners();
                saveSlotButtons[i].onClick.AddListener(() => LoadSaveSlot(slotIndex));

                // スロット情報の表示
                bool hasSave = saveRepo.HasSaveData(slotIndex);
                saveSlotButtons[i].interactable = hasSave;

                if (hasSave)
                {
                    var saveData = saveRepo.LoadSaveData(slotIndex);
                    // スロット情報を表示（日時、進行度など）
                    UpdateSaveSlotDisplay(slotIndex, saveData);
                }
            }
        }

        private void LoadSaveSlot(int slotIndex)
        {
            AudioManager.Instance.PlaySE("button_click");

            try
            {
                GameManager.Instance.LoadGame(slotIndex);
                SceneManager.LoadScene("MapScene");
            }
            catch (System.Exception ex)
            {
                ErrorHandler.HandleLoadError(ex);
            }
        }

        private void OnMetaProgressClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            // メタアンロック画面を表示
            ShowMetaProgressPanel();
        }

        private void ShowMetaProgressPanel()
        {
            // メタ進行状況の表示
            var metaData = GameManager.Instance.MetaSystem.GetData();
            Debug.Log($"Fame: {metaData.Fame}");
            Debug.Log($"Knowledge: {metaData.KnowledgePoints}");
            Debug.Log($"Ascension: {metaData.AscensionLevel}");
        }

        private void OnSettingsClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            // 設定画面を表示
        }

        private void OnExitClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            Application.Quit();
        }
    }
}
```

#### TitleScene UI構成
- タイトルロゴ 🟡
- メインメニューボタン群 🔵
- セーブスロット選択パネル 🔵
- メタ進行状況パネル 🔵
- 設定パネル 🔵

### 完了条件
- [ ] 新規ゲーム開始が動作する 🔵
- [ ] コンティニューが動作する (REQ-012) 🔵
- [ ] セーブスロット選択が動作する 🔵
- [ ] メタ進行状況が表示される (REQ-040, REQ-041) 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void OnNewGameClicked_LoadsStyleSelectScene()
{
    var controller = CreateTitleSceneController();

    controller.OnNewGameClicked();

    // シーン遷移を確認
    Assert.AreEqual("StyleSelectScene", GetLoadedSceneName()); // 失敗
}
```

#### Green
- TitleSceneControllerを実装

#### Refactor
- UI表示ロジックの分離

---

## TASK-0032: StyleSelectScene実装

**タスクID**: TASK-0032
**タスク名**: StyleSelectScene実装
**推定工数**: 20h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-014, REQ-019, REQ-042

### 依存タスク
- TASK-0031: TitleScene実装
- TASK-0004: ConfigDataLoader実装

### 実装詳細

設計文書 `01-architecture.md` のStyleSelectScene定義を参照 🔵

#### StyleSelectScene の役割
- スタイル一覧表示 🔵
- 初期デッキプレビュー 🔵
- シード値入力（オプション） 🔵

#### StyleSelectSceneController クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using UnityEngine.SceneManagement;
    using Atelier.Application;
    using Atelier.Infrastructure;
    using System.Collections.Generic;

    public class StyleSelectSceneController : MonoBehaviour
    {
        [SerializeField] private Transform styleListContainer;
        [SerializeField] private GameObject styleButtonPrefab;
        [SerializeField] private Button startButton;
        [SerializeField] private Button backButton;

        [SerializeField] private Text styleNameText;
        [SerializeField] private Text styleDescriptionText;
        [SerializeField] private Transform deckPreviewContainer;

        [SerializeField] private InputField seedInputField;
        [SerializeField] private Toggle useSeedToggle;

        private List<AlchemyStyle> availableStyles;
        private AlchemyStyle selectedStyle;
        private int? inputSeed;

        private void Start()
        {
            LoadAvailableStyles();
            SetupUI();
        }

        private void LoadAvailableStyles()
        {
            var config = ConfigDataLoader.LoadAlchemyStyleConfig();
            availableStyles = config.Styles;

            // メタ進行でアンロックされたスタイルのみ表示
            var metaData = GameManager.Instance.MetaSystem.GetData();
            // TODO: アンロック判定
        }

        private void SetupUI()
        {
            // スタイル一覧ボタンを生成
            foreach (var style in availableStyles)
            {
                var button = Instantiate(styleButtonPrefab, styleListContainer);
                button.GetComponentInChildren<Text>().text = style.Name;
                button.GetComponent<Button>().onClick.AddListener(() => SelectStyle(style));
            }

            startButton.onClick.AddListener(OnStartClicked);
            backButton.onClick.AddListener(OnBackClicked);

            // 最初のスタイルを選択
            if (availableStyles.Count > 0)
            {
                SelectStyle(availableStyles[0]);
            }
        }

        private void SelectStyle(AlchemyStyle style)
        {
            AudioManager.Instance.PlaySE("button_click");

            selectedStyle = style;

            // スタイル情報を表示
            styleNameText.text = style.Name;
            styleDescriptionText.text = style.Description;

            // 初期デッキプレビューを表示
            ShowDeckPreview(style.InitialCards);
        }

        private void ShowDeckPreview(List<string> cardIds)
        {
            // 既存のプレビューをクリア
            foreach (Transform child in deckPreviewContainer)
            {
                Destroy(child.gameObject);
            }

            // カードプレビューを生成
            var cardSystem = GameManager.Instance.CardSystem;
            foreach (var cardId in cardIds)
            {
                var card = cardSystem.GetCard(cardId);
                // カードUIを生成
                // TODO: CardUIプレハブを使用
            }
        }

        private void OnStartClicked()
        {
            AudioManager.Instance.PlaySE("button_click");

            if (selectedStyle == null)
            {
                Debug.LogWarning("No style selected");
                return;
            }

            // シード値の取得
            inputSeed = null;
            if (useSeedToggle.isOn && !string.IsNullOrEmpty(seedInputField.text))
            {
                if (int.TryParse(seedInputField.text, out int seed))
                {
                    inputSeed = seed;
                }
            }

            // ゲーム開始
            GameManager.Instance.StartNewGame(selectedStyle, inputSeed);

            SceneManager.LoadScene("MapScene");
        }

        private void OnBackClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            SceneManager.LoadScene("TitleScene");
        }
    }
}
```

### 完了条件
- [ ] 錬金スタイルが選択できる (REQ-014) 🔵
- [ ] 最低1つのスタイルが利用可能 (REQ-019) 🔵
- [ ] 初期デッキがプレビュー表示される 🔵
- [ ] シード値を入力できる (REQ-042) 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void SelectStyle_DisplaysStyleInfo()
{
    var controller = CreateStyleSelectController();
    var style = new AlchemyStyle { Name = "Fire", Description = "Test" };

    controller.SelectStyle(style);

    Assert.AreEqual("Fire", controller.styleNameText.text); // 失敗
}
```

#### Green
- StyleSelectSceneControllerを実装

#### Refactor
- UI生成ロジックの最適化

---

## TASK-0033: シーン遷移統合テスト

**タスクID**: TASK-0033
**タスク名**: シーン遷移統合テスト
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: なし（統合テスト）

### 依存タスク
- TASK-0030: BootScene実装
- TASK-0031: TitleScene実装
- TASK-0032: StyleSelectScene実装

### 実装詳細

#### 統合テストシナリオ

##### シナリオ1: 新規ゲーム開始フロー
```
Boot → Title → StyleSelect → Map
```

##### シナリオ2: コンティニューフロー
```
Boot → Title → (SaveSlot選択) → Map
```

##### シナリオ3: メタ進行確認フロー
```
Boot → Title → MetaProgress → Title
```

#### 統合テストクラス
```csharp
namespace Atelier.Tests.Integration
{
    using NUnit.Framework;
    using UnityEngine;
    using UnityEngine.SceneManagement;

    [TestFixture]
    public class SceneTransitionIntegrationTests
    {
        [Test]
        public async System.Threading.Tasks.Task NewGameFlow_TransitionsCorrectly()
        {
            // Boot → Title
            SceneManager.LoadScene("BootScene");
            await WaitForSceneLoad("TitleScene");

            // Title → StyleSelect
            var titleController = Object.FindObjectOfType<TitleSceneController>();
            titleController.OnNewGameClicked();
            await WaitForSceneLoad("StyleSelectScene");

            // StyleSelect → Map
            var styleController = Object.FindObjectOfType<StyleSelectSceneController>();
            styleController.OnStartClicked();
            await WaitForSceneLoad("MapScene");

            Assert.AreEqual("MapScene", SceneManager.GetActiveScene().name);
        }

        [Test]
        public async System.Threading.Tasks.Task ContinueFlow_LoadsSaveData()
        {
            // セーブデータを作成
            var saveRepo = new SaveDataRepository();
            var saveData = new SaveData { /* ... */ };
            saveRepo.SaveGameData(saveData, 0);

            // Boot → Title
            SceneManager.LoadScene("BootScene");
            await WaitForSceneLoad("TitleScene");

            // Title → Continue → Map
            var titleController = Object.FindObjectOfType<TitleSceneController>();
            titleController.LoadSaveSlot(0);
            await WaitForSceneLoad("MapScene");

            Assert.IsNotNull(GameManager.Instance.DeckManager.DrawPile);
        }

        private async System.Threading.Tasks.Task WaitForSceneLoad(string sceneName)
        {
            while (SceneManager.GetActiveScene().name != sceneName)
            {
                await System.Threading.Tasks.Task.Delay(100);
            }
        }
    }
}
```

### 完了条件
- [ ] Boot→Title遷移が正しく動作する 🔵
- [ ] Title→StyleSelect遷移が正しく動作する 🔵
- [ ] StyleSelect→Map遷移が正しく動作する 🔵
- [ ] セーブ/ロード後のシーン遷移が正しく動作する 🔵
- [ ] すべてのシーンでBGMが再生される 🔵
- [ ] すべての統合テストが通る 🔵

### テスト要件（TDDタスク）
#### Red
- 各シナリオの統合テストを作成（失敗）

#### Green
- シーン間のデータ受け渡しを実装
- 遷移ロジックを修正

#### Refactor
- シーン遷移の共通化
- データ永続化の最適化

---

## Phase 7 完了条件

### 全体完了条件
- [ ] すべてのタスク(TASK-0030~0033)が完了している
- [ ] BootSceneが動作する
- [ ] TitleSceneが動作する
- [ ] StyleSelectSceneが動作する
- [ ] シーン遷移が正しく動作する
- [ ] すべてのテストが通る

### 次フェーズへの引き継ぎ事項
- シーン遷移の仕組みが確立されている
- セーブ/ロード機能が動作している
- スタイル選択からゲーム開始できる
- MapSceneへの遷移準備が整っている

---

**信頼性レベル凡例**:
- 🔵 青信号: 設計文書から明確
- 🟡 黄信号: 設計文書から妥当な推測
- 🔴 赤信号: 設計文書にない推測
