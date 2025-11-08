# Phase 8: ゲームプレイシーン Part 1タスク

**期間**: Week 1-4 (12日間)
**総工数**: 96h
**タスク範囲**: TASK-0034 ~ TASK-0036
**タスクタイプ**: TDD中心

---

## TASK-0034: MapScene実装

**タスクID**: TASK-0034
**タスク名**: MapScene実装
**推定工数**: 32h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-015, REQ-016, REQ-046

### 依存タスク
- TASK-0016: MapSystem / MapNode実装
- TASK-0026: GameManager実装

### 実装詳細

設計文書 `01-architecture.md` のMapScene定義を参照 🔵

#### MapScene の役割
- ノード配置 🔵
- ルート選択 🔵
- 現在位置表示 🔵

#### MapSceneController クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using UnityEngine.SceneManagement;
    using Atelier.Application;
    using Atelier.Domain;
    using System.Collections.Generic;

    public class MapSceneController : MonoBehaviour
    {
        [SerializeField] private Transform mapContainer;
        [SerializeField] private GameObject nodeButtonPrefab;
        [SerializeField] private Button menuButton;

        [SerializeField] private Text floorText;
        [SerializeField] private Text goldText;

        private MapSystem mapSystem;
        private Dictionary<string, GameObject> nodeButtons;

        private void Start()
        {
            mapSystem = GameManager.Instance.MapSystem;
            nodeButtons = new Dictionary<string, GameObject>();

            // BGM再生
            AudioManager.Instance.PlayBGM("map_theme");

            // UIセットアップ
            SetupMap();
            UpdateUI();

            // イベント購読
            GameManager.Instance.EventBus.Subscribe<NodeVisitedEvent>(OnNodeVisited);

            menuButton.onClick.AddListener(OnMenuClicked);
        }

        private void SetupMap()
        {
            var allNodes = mapSystem.GetAllNodes();

            foreach (var node in allNodes)
            {
                CreateNodeButton(node);
            }

            // ノード間の接続線を描画
            DrawConnections(allNodes);
        }

        private void CreateNodeButton(MapNode node)
        {
            var nodeButton = Instantiate(nodeButtonPrefab, mapContainer);

            // ノードの位置を設定（レイアウト）
            var rectTransform = nodeButton.GetComponent<RectTransform>();
            rectTransform.anchoredPosition = CalculateNodePosition(node.Position);

            // ノードのビジュアル設定
            var nodeUI = nodeButton.GetComponent<MapNodeUI>();
            nodeUI.SetNodeType(node.Type);
            nodeUI.SetVisited(node.IsVisited);
            nodeUI.SetAvailable(node.IsAvailable);

            // ボタンイベント
            var button = nodeButton.GetComponent<Button>();
            button.onClick.AddListener(() => OnNodeClicked(node));
            button.interactable = node.IsAvailable && !node.IsVisited;

            nodeButtons[node.Id] = nodeButton;
        }

        private Vector2 CalculateNodePosition(Vector2Int gridPos)
        {
            float horizontalSpacing = 200f;
            float verticalSpacing = 150f;

            return new Vector2(
                gridPos.X * horizontalSpacing,
                -gridPos.Y * verticalSpacing
            );
        }

        private void DrawConnections(List<MapNode> allNodes)
        {
            // ノード間の接続線を描画
            foreach (var node in allNodes)
            {
                foreach (var connectedId in node.ConnectedNodeIds)
                {
                    var connectedNode = allNodes.Find(n => n.Id == connectedId);
                    if (connectedNode != null)
                    {
                        DrawLine(
                            CalculateNodePosition(node.Position),
                            CalculateNodePosition(connectedNode.Position)
                        );
                    }
                }
            }
        }

        private void DrawLine(Vector2 start, Vector2 end)
        {
            // UnityのLineRendererまたはUIで線を描画
            // TODO: 実装
        }

        private void OnNodeClicked(MapNode node)
        {
            AudioManager.Instance.PlaySE("button_click");

            if (!node.IsAvailable || node.IsVisited)
            {
                AudioManager.Instance.PlaySE("error");
                return;
            }

            // ノードへ移動
            mapSystem.MoveToNode(node.Id);

            // ノードタイプに応じてシーン遷移
            switch (node.Type)
            {
                case NodeType.Quest:
                    GameManager.Instance.StateManager.TransitionTo(GameState.Quest);
                    SceneManager.LoadScene("QuestScene");
                    break;
                case NodeType.Merchant:
                    GameManager.Instance.StateManager.TransitionTo(GameState.Merchant);
                    SceneManager.LoadScene("MerchantScene");
                    break;
                case NodeType.Experiment:
                    GameManager.Instance.StateManager.TransitionTo(GameState.Experiment);
                    // 実験ノード処理（MapScene内で完結）
                    HandleExperimentNode();
                    break;
                case NodeType.Monster:
                    GameManager.Instance.StateManager.TransitionTo(GameState.Monster);
                    // 魔物ノード処理（MapScene内で完結）
                    HandleMonsterNode();
                    break;
                case NodeType.Boss:
                    GameManager.Instance.StateManager.TransitionTo(GameState.Quest);
                    SceneManager.LoadScene("QuestScene");
                    break;
            }
        }

        private void HandleExperimentNode()
        {
            // 実験ノードのポップアップ表示
            // TODO: ExperimentSystemを使用
        }

        private void HandleMonsterNode()
        {
            // 魔物ノードのポップアップ表示
            // TODO: MonsterSystemを使用
        }

        private void OnNodeVisited(NodeVisitedEvent e)
        {
            // ノードUIを更新
            if (nodeButtons.TryGetValue(e.Node.Id, out var button))
            {
                var nodeUI = button.GetComponent<MapNodeUI>();
                nodeUI.SetVisited(true);
            }

            // 接続されたノードを利用可能にする
            foreach (var connectedId in e.Node.ConnectedNodeIds)
            {
                if (nodeButtons.TryGetValue(connectedId, out var connectedButton))
                {
                    var nodeUI = connectedButton.GetComponent<MapNodeUI>();
                    nodeUI.SetAvailable(true);
                    connectedButton.GetComponent<Button>().interactable = true;
                }
            }

            UpdateUI();
        }

        private void UpdateUI()
        {
            var currentNode = mapSystem.GetCurrentNode();
            floorText.text = $"Floor: {currentNode.Level + 1}";

            // TODO: ゴールド表示
        }

        private void OnMenuClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            // メニュー表示
        }

        private void OnDestroy()
        {
            GameManager.Instance.EventBus.Unsubscribe<NodeVisitedEvent>(OnNodeVisited);
        }
    }
}
```

#### MapNodeUI クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using Atelier.Domain;

    public class MapNodeUI : MonoBehaviour
    {
        [SerializeField] private Image nodeIcon;
        [SerializeField] private Image visitedOverlay;
        [SerializeField] private GameObject availableIndicator;

        [SerializeField] private Sprite questIcon;
        [SerializeField] private Sprite merchantIcon;
        [SerializeField] private Sprite experimentIcon;
        [SerializeField] private Sprite monsterIcon;
        [SerializeField] private Sprite bossIcon;

        public void SetNodeType(NodeType type)
        {
            switch (type)
            {
                case NodeType.Quest:
                    nodeIcon.sprite = questIcon;
                    break;
                case NodeType.Merchant:
                    nodeIcon.sprite = merchantIcon;
                    break;
                case NodeType.Experiment:
                    nodeIcon.sprite = experimentIcon;
                    break;
                case NodeType.Monster:
                    nodeIcon.sprite = monsterIcon;
                    break;
                case NodeType.Boss:
                    nodeIcon.sprite = bossIcon;
                    break;
            }
        }

        public void SetVisited(bool visited)
        {
            visitedOverlay.gameObject.SetActive(visited);
        }

        public void SetAvailable(bool available)
        {
            availableIndicator.SetActive(available);
        }
    }
}
```

### 完了条件
- [ ] マップが正しく表示される (REQ-015) 🔵
- [ ] ノードタイプが視覚的に区別できる (REQ-046) 🔵
- [ ] ノードクリックで各シーンに遷移する (REQ-016) 🔵
- [ ] 現在位置が表示される 🔵
- [ ] 利用可能なノードのみクリック可能 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void SetupMap_CreatesNodeButtons()
{
    var controller = CreateMapSceneController();

    controller.SetupMap();

    Assert.IsTrue(controller.nodeButtons.Count > 0); // 失敗
}

[Test]
public void OnNodeClicked_TransitionsToQuestScene()
{
    var controller = CreateMapSceneController();
    var questNode = new MapNode { Type = NodeType.Quest, IsAvailable = true };

    controller.OnNodeClicked(questNode);

    Assert.AreEqual("QuestScene", GetLoadedSceneName()); // 失敗
}
```

#### Green
- MapSceneControllerを実装
- MapNodeUIを実装

#### Refactor
- ノード配置アルゴリズムの最適化
- UI生成の共通化

---

## TASK-0035: QuestScene実装

**タスクID**: TASK-0035
**タスク名**: QuestScene実装
**推定工数**: 48h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-029, REQ-030, REQ-033, REQ-034, REQ-045, REQ-047

### 依存タスク
- TASK-0014: QuestSystem実装
- TASK-0015: DeckManager実装
- TASK-0028: CommandManager実装

### 実装詳細

設計文書 `01-architecture.md` のQuestScene定義を参照 🔵

#### QuestScene の役割
- 依頼ボード(3件) 🔵
- 手札表示 🔵
- デッキ/捨て札状態 🔵
- 錬金釜エリア 🔵

#### QuestSceneController クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using UnityEngine.SceneManagement;
    using Atelier.Application;
    using Atelier.Domain;
    using System.Collections.Generic;

    public class QuestSceneController : MonoBehaviour
    {
        [Header("Quest Board")]
        [SerializeField] private Transform questBoardContainer;
        [SerializeField] private GameObject questCardPrefab;
        private List<QuestCardUI> questCards;

        [Header("Hand Area")]
        [SerializeField] private Transform handContainer;
        [SerializeField] private GameObject cardPrefab;
        private List<CardUI> handCards;

        [Header("Deck Info")]
        [SerializeField] private Text drawPileCountText;
        [SerializeField] private Text discardPileCountText;
        [SerializeField] private Text energyText;

        [Header("Buttons")]
        [SerializeField] private Button endTurnButton;
        [SerializeField] private Button undoButton;
        [SerializeField] private Button menuButton;

        private QuestSystem questSystem;
        private DeckManager deckManager;
        private CommandManager commandManager;
        private Quest selectedQuest;

        private void Start()
        {
            questSystem = GameManager.Instance.QuestSystem;
            deckManager = GameManager.Instance.DeckManager;
            commandManager = new CommandManager();

            questCards = new List<QuestCardUI>();
            handCards = new List<CardUI>();

            // BGM再生
            AudioManager.Instance.PlayBGM("quest_battle");

            // 依頼生成
            var currentNode = GameManager.Instance.MapSystem.GetCurrentNode();
            questSystem.GenerateQuests(currentNode.Level, new System.Random());

            // UIセットアップ
            SetupQuestBoard();
            SetupHand();

            // ターン開始
            deckManager.StartTurn();
            UpdateUI();

            // イベント購読
            GameManager.Instance.EventBus.Subscribe<CardPlayedEvent>(OnCardPlayed);
            GameManager.Instance.EventBus.Subscribe<CardDrawnEvent>(OnCardDrawn);
            GameManager.Instance.EventBus.Subscribe<QuestCompletedEvent>(OnQuestCompleted);

            // ボタンイベント
            endTurnButton.onClick.AddListener(OnEndTurnClicked);
            undoButton.onClick.AddListener(OnUndoClicked);
            menuButton.onClick.AddListener(OnMenuClicked);

            // 入力イベント
            InputManager.Instance.OnUndoRequest += OnUndoRequested;
        }

        private void SetupQuestBoard()
        {
            var quests = questSystem.GetActiveQuests();

            foreach (var quest in quests)
            {
                var questCard = Instantiate(questCardPrefab, questBoardContainer);
                var questUI = questCard.GetComponent<QuestCardUI>();
                questUI.SetQuest(quest);
                questUI.OnQuestSelected += SelectQuest;

                questCards.Add(questUI);
            }

            // 最初の依頼を選択
            if (questCards.Count > 0)
            {
                SelectQuest(quests[0]);
            }
        }

        private void SetupHand()
        {
            UpdateHandDisplay();
        }

        private void UpdateHandDisplay()
        {
            // 既存の手札UIをクリア
            foreach (var card in handCards)
            {
                Destroy(card.gameObject);
            }
            handCards.Clear();

            // 手札を表示
            foreach (var card in deckManager.Hand)
            {
                var cardUI = Instantiate(cardPrefab, handContainer);
                var cardComponent = cardUI.GetComponent<CardUI>();
                cardComponent.SetCard(card);
                cardComponent.OnCardClicked += OnCardClicked;

                handCards.Add(cardComponent);
            }
        }

        private void SelectQuest(Quest quest)
        {
            selectedQuest = quest;

            // 依頼カードのハイライト
            foreach (var questUI in questCards)
            {
                questUI.SetHighlighted(questUI.Quest == quest);
            }
        }

        private void OnCardClicked(ICard card)
        {
            AudioManager.Instance.PlaySE("card_play");

            if (selectedQuest == null)
            {
                Debug.LogWarning("No quest selected");
                AudioManager.Instance.PlaySE("error");
                return;
            }

            if (!card.CanPlay(GetCurrentEnergy()))
            {
                Debug.LogWarning("Not enough energy");
                AudioManager.Instance.PlaySE("error");
                return;
            }

            // コマンドパターンでカードプレイ
            var command = new PlayCardCommand(card, selectedQuest, deckManager);
            commandManager.ExecuteCommand(command);

            // UI更新
            UpdateHandDisplay();
            UpdateQuestDisplay(selectedQuest);
            UpdateUI();

            // 暴発チェック
            if (selectedQuest.HasExploded())
            {
                AudioManager.Instance.PlaySE("explosion");
                HandleExplosion(selectedQuest);
            }

            // 達成チェック
            if (selectedQuest.IsCompleted())
            {
                AudioManager.Instance.PlaySE("quest_complete");
                CompleteQuest(selectedQuest);
            }
        }

        private void UpdateQuestDisplay(Quest quest)
        {
            var questUI = questCards.Find(q => q.Quest == quest);
            if (questUI != null)
            {
                questUI.UpdateProgress();
            }
        }

        private void HandleExplosion(Quest quest)
        {
            // 暴発演出
            // ペナルティ処理
            // TODO: 実装
        }

        private void CompleteQuest(Quest quest)
        {
            questSystem.CompleteQuest(quest.Id);

            // 報酬選択へ
            // TODO: 報酬シーンへ遷移
        }

        private void OnEndTurnClicked()
        {
            AudioManager.Instance.PlaySE("button_click");

            // ターン終了処理
            deckManager.StartTurn();
            UpdateHandDisplay();
            UpdateUI();

            commandManager.Clear(); // ターン終了でアンドゥ履歴をクリア
        }

        private void OnUndoClicked()
        {
            OnUndoRequested();
        }

        private void OnUndoRequested()
        {
            if (commandManager.CanUndo)
            {
                AudioManager.Instance.PlaySE("button_click");

                commandManager.Undo();
                UpdateHandDisplay();
                UpdateQuestDisplay(selectedQuest);
                UpdateUI();
            }
            else
            {
                AudioManager.Instance.PlaySE("error");
            }
        }

        private void UpdateUI()
        {
            drawPileCountText.text = $"Deck: {deckManager.DrawPile.Count}";
            discardPileCountText.text = $"Discard: {deckManager.DiscardPile.Count}";
            energyText.text = $"Energy: {GetCurrentEnergy()}";

            undoButton.interactable = commandManager.CanUndo;
        }

        private int GetCurrentEnergy()
        {
            // TODO: DeckManagerからエネルギーを取得
            return 0;
        }

        private void OnCardPlayed(CardPlayedEvent e)
        {
            UpdateUI();
        }

        private void OnCardDrawn(CardDrawnEvent e)
        {
            UpdateHandDisplay();
        }

        private void OnQuestCompleted(QuestCompletedEvent e)
        {
            // 報酬選択シーンへ
            SceneManager.LoadScene("ResultScene");
        }

        private void OnMenuClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            // メニュー表示
        }

        private void OnDestroy()
        {
            GameManager.Instance.EventBus.Unsubscribe<CardPlayedEvent>(OnCardPlayed);
            GameManager.Instance.EventBus.Unsubscribe<CardDrawnEvent>(OnCardDrawn);
            GameManager.Instance.EventBus.Unsubscribe<QuestCompletedEvent>(OnQuestCompleted);

            InputManager.Instance.OnUndoRequest -= OnUndoRequested;
        }
    }
}
```

### 完了条件
- [ ] 3件の依頼が表示される (REQ-029) 🔵
- [ ] 手札が表示される (REQ-047) 🔵
- [ ] カードプレイが動作する 🔵
- [ ] 暴発判定が動作する (REQ-033) 🔵
- [ ] 依頼達成判定が動作する (REQ-034) 🔵
- [ ] アンドゥ機能が動作する (REQ-047-1) 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void SetupQuestBoard_Creates3Quests()
{
    var controller = CreateQuestSceneController();

    controller.SetupQuestBoard();

    Assert.AreEqual(3, controller.questCards.Count); // 失敗
}
```

#### Green
- QuestSceneControllerを実装

#### Refactor
- UI更新ロジックの最適化

---

## TASK-0036: カードUI/アニメーション実装

**タスクID**: TASK-0036
**タスク名**: カードUI/アニメーション実装
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: NFR-003

### 依存タスク
- TASK-0010: Card クラス実装

### 実装詳細

#### CardUI クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using UnityEngine.EventSystems;
    using Atelier.Core;
    using System;

    public class CardUI : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
    {
        [SerializeField] private Text cardNameText;
        [SerializeField] private Text costText;
        [SerializeField] private Text descriptionText;
        [SerializeField] private Image cardImage;

        [Header("Attributes")]
        [SerializeField] private Text fireText;
        [SerializeField] private Text waterText;
        [SerializeField] private Text earthText;
        [SerializeField] private Text windText;
        [SerializeField] private Text qualityText;
        [SerializeField] private Text stabilityText;

        private ICard card;
        private Animator animator;

        public event Action<ICard> OnCardClicked;

        private void Awake()
        {
            animator = GetComponent<Animator>();
        }

        public void SetCard(ICard card)
        {
            this.card = card;

            cardNameText.text = card.Name;
            costText.text = card.Cost.ToString();
            descriptionText.text = card.Description;

            // 属性値表示
            fireText.text = card.Attributes.Fire.ToString();
            waterText.text = card.Attributes.Water.ToString();
            earthText.text = card.Attributes.Earth.ToString();
            windText.text = card.Attributes.Wind.ToString();
            qualityText.text = card.Attributes.Quality.ToString();
            stabilityText.text = card.Stability.ToString();

            // カード画像
            // TODO: スプライト読み込み
        }

        public void OnPointerEnter(PointerEventData eventData)
        {
            // ホバー時のアニメーション
            if (animator != null)
            {
                animator.SetTrigger("Hover");
            }

            // カードを拡大表示
            transform.localScale = Vector3.one * 1.1f;
        }

        public void OnPointerExit(PointerEventData eventData)
        {
            // 元のサイズに戻す
            transform.localScale = Vector3.one;
        }

        public void OnClick()
        {
            OnCardClicked?.Invoke(card);

            // クリック時のアニメーション
            if (animator != null)
            {
                animator.SetTrigger("Click");
            }
        }
    }
}
```

### 完了条件
- [ ] カードUIが正しく表示される 🔵
- [ ] ホバー時にアニメーションする 🔵
- [ ] クリック時に応答する (NFR-003: 100ms以内) 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void SetCard_DisplaysCardInfo()
{
    var cardUI = CreateCardUI();
    var card = new Card { Name = "Test Card", Cost = 2 };

    cardUI.SetCard(card);

    Assert.AreEqual("Test Card", cardUI.cardNameText.text); // 失敗
}
```

#### Green
- CardUIを実装

#### Refactor
- アニメーションの最適化

---

## Phase 8 完了条件

### 全体完了条件
- [ ] すべてのタスク(TASK-0034~0036)が完了している
- [ ] MapSceneが動作する
- [ ] QuestSceneが動作する
- [ ] カードUI/アニメーションが動作する
- [ ] すべてのテストが通る

### 次フェーズへの引き継ぎ事項
- MapSceneが完成している
- QuestSceneでカードプレイができる
- カードUIが再利用可能

---

**信頼性レベル凡例**:
- 🔵 青信号: 設計文書から明確
- 🟡 黄信号: 設計文書から妥当な推測
- 🔴 赤信号: 設計文書にない推測
