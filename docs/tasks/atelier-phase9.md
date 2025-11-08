# Phase 9: ゲームプレイシーン Part 2タスク

**期間**: Week 1-4 (8日間)
**総工数**: 64h
**タスク範囲**: TASK-0037 ~ TASK-0039
**タスクタイプ**: TDD中心

---

## TASK-0037: MerchantScene実装

**タスクID**: TASK-0037
**GitHub Issue**: [#39](https://github.com/yaguma/atelier/issues/39)
**タスク名**: MerchantScene実装
**推定工数**: 24h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-037

### 依存タスク
- TASK-0021: MerchantSystem実装
- TASK-0015: DeckManager実装

### 実装詳細

設計文書 `01-architecture.md` のMerchantScene定義を参照 🔵

#### MerchantScene の役割
- カード購入 🔵
- カード強化 🔵
- カード削除 🔵

#### MerchantSceneController クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using UnityEngine.SceneManagement;
    using Atelier.Application;
    using Atelier.Domain;
    using System.Collections.Generic;

    public class MerchantSceneController : MonoBehaviour
    {
        [Header("Shop Inventory")]
        [SerializeField] private Transform shopInventoryContainer;
        [SerializeField] private GameObject shopItemPrefab;

        [Header("Player Deck")]
        [SerializeField] private Transform playerDeckContainer;
        [SerializeField] private GameObject deckCardPrefab;

        [Header("Tabs")]
        [SerializeField] private Button purchaseTabButton;
        [SerializeField] private Button upgradeTabButton;
        [SerializeField] private Button removeTabButton;

        [Header("UI")]
        [SerializeField] private Text goldText;
        [SerializeField] private Button leaveButton;

        private MerchantSystem merchantSystem;
        private DeckManager deckManager;
        private List<GameObject> shopItems;
        private MerchantTab currentTab;

        private enum MerchantTab
        {
            Purchase,
            Upgrade,
            Remove
        }

        private void Start()
        {
            merchantSystem = GameManager.Instance.MerchantSystem;
            deckManager = GameManager.Instance.DeckManager;
            shopItems = new List<GameObject>();

            // BGM再生
            AudioManager.Instance.PlayBGM("merchant_theme");

            // UIセットアップ
            SetupTabs();
            ShowPurchaseTab();
            UpdateGoldDisplay();

            leaveButton.onClick.AddListener(OnLeaveClicked);
        }

        private void SetupTabs()
        {
            purchaseTabButton.onClick.AddListener(() => SwitchTab(MerchantTab.Purchase));
            upgradeTabButton.onClick.AddListener(() => SwitchTab(MerchantTab.Upgrade));
            removeTabButton.onClick.AddListener(() => SwitchTab(MerchantTab.Remove));
        }

        private void SwitchTab(MerchantTab tab)
        {
            AudioManager.Instance.PlaySE("button_click");

            currentTab = tab;

            // タブのハイライト
            purchaseTabButton.interactable = (tab != MerchantTab.Purchase);
            upgradeTabButton.interactable = (tab != MerchantTab.Upgrade);
            removeTabButton.interactable = (tab != MerchantTab.Remove);

            // コンテンツ表示
            switch (tab)
            {
                case MerchantTab.Purchase:
                    ShowPurchaseTab();
                    break;
                case MerchantTab.Upgrade:
                    ShowUpgradeTab();
                    break;
                case MerchantTab.Remove:
                    ShowRemoveTab();
                    break;
            }
        }

        private void ShowPurchaseTab()
        {
            ClearShopInventory();

            var currentNode = GameManager.Instance.MapSystem.GetCurrentNode();
            var inventory = merchantSystem.GenerateShopInventory(currentNode.Level);

            foreach (var item in inventory)
            {
                var shopItem = Instantiate(shopItemPrefab, shopInventoryContainer);
                var shopItemUI = shopItem.GetComponent<MerchantItemUI>();

                shopItemUI.SetItem(item);
                shopItemUI.OnPurchaseClicked += () => OnPurchaseClicked(item);

                shopItems.Add(shopItem);
            }
        }

        private void ShowUpgradeTab()
        {
            ClearShopInventory();

            // プレイヤーのデッキから強化可能なカードを表示
            foreach (var card in deckManager.DrawPile)
            {
                var shopItem = Instantiate(shopItemPrefab, shopInventoryContainer);
                var shopItemUI = shopItem.GetComponent<MerchantItemUI>();

                int upgradePrice = CalculateUpgradePrice(card);
                var item = new MerchantItem
                {
                    Card = card as Card,
                    Price = upgradePrice,
                    Type = MerchantItemType.Upgrade
                };

                shopItemUI.SetItem(item);
                shopItemUI.OnUpgradeClicked += () => OnUpgradeClicked(card as Card, upgradePrice);

                shopItems.Add(shopItem);
            }
        }

        private void ShowRemoveTab()
        {
            ClearShopInventory();

            // プレイヤーのデッキから削除可能なカードを表示
            foreach (var card in deckManager.DrawPile)
            {
                var shopItem = Instantiate(shopItemPrefab, shopInventoryContainer);
                var shopItemUI = shopItem.GetComponent<MerchantItemUI>();

                int removePrice = CalculateRemovePrice(card);
                var item = new MerchantItem
                {
                    Card = card as Card,
                    Price = removePrice,
                    Type = MerchantItemType.Remove
                };

                shopItemUI.SetItem(item);
                shopItemUI.OnRemoveClicked += () => OnRemoveClicked(card as Card, removePrice);

                shopItems.Add(shopItem);
            }
        }

        private void ClearShopInventory()
        {
            foreach (var item in shopItems)
            {
                Destroy(item);
            }
            shopItems.Clear();
        }

        private void OnPurchaseClicked(MerchantItem item)
        {
            bool success = merchantSystem.PurchaseCard(item.Card, item.Price, deckManager);

            if (success)
            {
                AudioManager.Instance.PlaySE("purchase");
                UpdateGoldDisplay();
                ShowPurchaseTab(); // 在庫を再生成
            }
            else
            {
                AudioManager.Instance.PlaySE("error");
                Debug.LogWarning("Not enough gold");
            }
        }

        private void OnUpgradeClicked(Card card, int price)
        {
            bool success = merchantSystem.UpgradeCard(card, price);

            if (success)
            {
                AudioManager.Instance.PlaySE("upgrade");
                UpdateGoldDisplay();
                ShowUpgradeTab(); // 表示を更新
            }
            else
            {
                AudioManager.Instance.PlaySE("error");
                Debug.LogWarning("Not enough gold");
            }
        }

        private void OnRemoveClicked(Card card, int price)
        {
            bool success = merchantSystem.RemoveCard(card, price, deckManager);

            if (success)
            {
                AudioManager.Instance.PlaySE("button_click");
                UpdateGoldDisplay();
                ShowRemoveTab(); // 表示を更新
            }
            else
            {
                AudioManager.Instance.PlaySE("error");
                Debug.LogWarning("Not enough gold");
            }
        }

        private int CalculateUpgradePrice(ICard card)
        {
            // カードレベルに応じた価格計算
            return 75 + (card.Level * 25);
        }

        private int CalculateRemovePrice(ICard card)
        {
            // 基本価格
            return 30;
        }

        private void UpdateGoldDisplay()
        {
            goldText.text = $"Gold: {merchantSystem.CurrentGold}";
        }

        private void OnLeaveClicked()
        {
            AudioManager.Instance.PlaySE("button_click");

            // MapSceneへ戻る
            GameManager.Instance.StateManager.TransitionTo(GameState.Map);
            SceneManager.LoadScene("MapScene");
        }
    }
}
```

#### MerchantItemUI クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using Atelier.Domain;
    using System;

    public class MerchantItemUI : MonoBehaviour
    {
        [SerializeField] private Text cardNameText;
        [SerializeField] private Text priceText;
        [SerializeField] private Button actionButton;
        [SerializeField] private Text buttonText;

        private MerchantItem item;

        public event Action OnPurchaseClicked;
        public event Action OnUpgradeClicked;
        public event Action OnRemoveClicked;

        public void SetItem(MerchantItem item)
        {
            this.item = item;

            cardNameText.text = item.Card.Name;
            priceText.text = $"{item.Price}G";

            switch (item.Type)
            {
                case MerchantItemType.Purchase:
                    buttonText.text = "Purchase";
                    actionButton.onClick.AddListener(() => OnPurchaseClicked?.Invoke());
                    break;
                case MerchantItemType.Upgrade:
                    buttonText.text = "Upgrade";
                    actionButton.onClick.AddListener(() => OnUpgradeClicked?.Invoke());
                    break;
                case MerchantItemType.Remove:
                    buttonText.text = "Remove";
                    actionButton.onClick.AddListener(() => OnRemoveClicked?.Invoke());
                    break;
            }
        }
    }
}
```

### 完了条件
- [ ] カード購入が動作する (REQ-037) 🔵
- [ ] カード強化が動作する (REQ-037) 🔵
- [ ] カード削除が動作する (REQ-037) 🔵
- [ ] ゴールド管理が正しく動作する 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void ShowPurchaseTab_DisplaysShopInventory()
{
    var controller = CreateMerchantSceneController();

    controller.ShowPurchaseTab();

    Assert.IsTrue(controller.shopItems.Count >= 5); // 失敗
    Assert.IsTrue(controller.shopItems.Count <= 7);
}
```

#### Green
- MerchantSceneControllerを実装

#### Refactor
- タブ切り替えロジックの最適化

---

## TASK-0038: ResultScene実装

**タスクID**: TASK-0038
**GitHub Issue**: [#40](https://github.com/yaguma/atelier/issues/40)
**タスク名**: ResultScene実装
**推定工数**: 24h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-036, REQ-039-1, REQ-039-2

### 依存タスク
- TASK-0020: RewardSystem実装
- TASK-0017: MetaProgressionSystem実装

### 実装詳細

設計文書 `01-architecture.md` のResultScene定義を参照 🔵

#### ResultScene の役割
- 獲得報酬表示 🔵
- メタ通貨獲得 🔵
- 統計情報 🔵

#### ResultSceneController クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using UnityEngine.SceneManagement;
    using Atelier.Application;
    using Atelier.Domain;
    using System.Collections.Generic;

    public class ResultSceneController : MonoBehaviour
    {
        [Header("Result Display")]
        [SerializeField] private Text resultTitleText;
        [SerializeField] private GameObject victoryPanel;
        [SerializeField] private GameObject defeatPanel;

        [Header("Rewards")]
        [SerializeField] private Transform rewardCardsContainer;
        [SerializeField] private GameObject rewardCardPrefab;

        [Header("Meta Currency")]
        [SerializeField] private Text fameGainedText;
        [SerializeField] private Text knowledgeGainedText;

        [Header("Stats")]
        [SerializeField] private Text questsCompletedText;
        [SerializeField] private Text cardsPlayedText;
        [SerializeField] private Text explosionsText;

        [Header("Buttons")]
        [SerializeField] private Button continueButton;
        [SerializeField] private Button returnToTitleButton;

        private RewardSystem rewardSystem;
        private MetaProgressionSystem metaSystem;
        private bool isVictory;

        private void Start()
        {
            rewardSystem = GameManager.Instance.RewardSystem;
            metaSystem = GameManager.Instance.MetaSystem;

            // BGM再生
            AudioManager.Instance.PlayBGM("result_theme");

            // 勝敗判定
            CheckVictoryCondition();

            // UIセットアップ
            DisplayResults();
            DisplayRewards();
            DisplayMetaCurrency();
            DisplayStats();

            // ボタンイベント
            continueButton.onClick.AddListener(OnContinueClicked);
            returnToTitleButton.onClick.AddListener(OnReturnToTitleClicked);
        }

        private void CheckVictoryCondition()
        {
            // 最終ボスをクリアしたか判定
            var currentNode = GameManager.Instance.MapSystem.GetCurrentNode();
            isVictory = (currentNode.Type == NodeType.Boss);

            // TODO: 敗北条件の判定
        }

        private void DisplayResults()
        {
            if (isVictory)
            {
                resultTitleText.text = "Victory!";
                victoryPanel.SetActive(true);
                defeatPanel.SetActive(false);
            }
            else
            {
                resultTitleText.text = "Defeat...";
                victoryPanel.SetActive(false);
                defeatPanel.SetActive(true);
            }
        }

        private void DisplayRewards()
        {
            if (!isVictory)
                return;

            // 依頼達成報酬のカード選択
            var completedQuests = GameManager.Instance.QuestSystem.GetCompletedQuests();

            foreach (var quest in completedQuests)
            {
                var rewardCards = rewardSystem.GenerateCardRewards(quest);

                foreach (var card in rewardCards)
                {
                    var rewardCardUI = Instantiate(rewardCardPrefab, rewardCardsContainer);
                    var cardUI = rewardCardUI.GetComponent<CardUI>();

                    cardUI.SetCard(card);
                    cardUI.OnCardClicked += (c) => SelectReward(c as Card);
                }
            }
        }

        private void SelectReward(Card card)
        {
            AudioManager.Instance.PlaySE("button_click");

            // 報酬カードをデッキに追加
            rewardSystem.GiveRewardToPlayer(card, GameManager.Instance.DeckManager);

            Debug.Log($"Reward selected: {card.Name}");

            // 報酬カードUIを非表示
            // TODO: 実装
        }

        private void DisplayMetaCurrency()
        {
            int fameGained = CalculateFameGained();
            int knowledgeGained = CalculateKnowledgeGained();

            metaSystem.AddFame(fameGained);
            metaSystem.AddKnowledgePoints(knowledgeGained);

            fameGainedText.text = $"+{fameGained} Fame";
            knowledgeGainedText.text = $"+{knowledgeGained} Knowledge";
        }

        private int CalculateFameGained()
        {
            if (!isVictory)
                return 0;

            // 依頼達成数に応じた名声計算
            var completedQuests = GameManager.Instance.QuestSystem.GetCompletedQuests();
            int fame = 0;

            foreach (var quest in completedQuests)
            {
                fame += (int)quest.Difficulty;
            }

            return fame;
        }

        private int CalculateKnowledgeGained()
        {
            if (!isVictory)
                return 0;

            // 勝利時に固定値
            return 10;
        }

        private void DisplayStats()
        {
            // TODO: 統計情報の表示
            questsCompletedText.text = "Quests: 3";
            cardsPlayedText.text = "Cards: 15";
            explosionsText.text = "Explosions: 1";
        }

        private void OnContinueClicked()
        {
            AudioManager.Instance.PlaySE("button_click");

            if (isVictory)
            {
                // セーブして次の階層へ
                // または勝利後の処理
                ReturnToTitle();
            }
            else
            {
                // 敗北後の処理
                ReturnToTitle();
            }
        }

        private void OnReturnToTitleClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            ReturnToTitle();
        }

        private void ReturnToTitle()
        {
            // セーブ
            GameManager.Instance.SaveGame(0); // TODO: スロット選択

            // タイトルへ
            GameManager.Instance.StateManager.TransitionTo(GameState.Title);
            SceneManager.LoadScene("TitleScene");
        }
    }
}
```

### 完了条件
- [ ] 報酬カード選択が動作する (REQ-036) 🔵
- [ ] 名声が獲得される (REQ-039-1) 🔵
- [ ] 知識ポイントが獲得される (REQ-039-2) 🔵
- [ ] 統計情報が表示される 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void DisplayMetaCurrency_IncreasesMetaData()
{
    var controller = CreateResultSceneController();
    int initialFame = GameManager.Instance.MetaSystem.GetData().Fame;

    controller.DisplayMetaCurrency();

    int newFame = GameManager.Instance.MetaSystem.GetData().Fame;
    Assert.IsTrue(newFame > initialFame); // 失敗
}
```

#### Green
- ResultSceneControllerを実装

#### Refactor
- 報酬計算ロジックの最適化

---

## TASK-0039: ExperimentNode / MonsterNode UI実装

**タスクID**: TASK-0039
**GitHub Issue**: [#41](https://github.com/yaguma/atelier/issues/41)
**タスク名**: ExperimentNode / MonsterNode UI実装
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-016-1, REQ-016-2

### 依存タスク
- TASK-0022: ExperimentSystem実装
- TASK-0023: MonsterSystem実装
- TASK-0034: MapScene実装

### 実装詳細

#### ExperimentNodePanel クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using Atelier.Application;
    using Atelier.Domain;

    public class ExperimentNodePanel : MonoBehaviour
    {
        [SerializeField] private Text titleText;
        [SerializeField] private Text descriptionText;
        [SerializeField] private Text successChanceText;
        [SerializeField] private Button acceptButton;
        [SerializeField] private Button declineButton;

        [SerializeField] private GameObject resultPanel;
        [SerializeField] private Text resultMessageText;
        [SerializeField] private Button continueButton;

        private ExperimentSystem experimentSystem;
        private int nodeLevel;

        public void Show(int level)
        {
            nodeLevel = level;
            experimentSystem = GameManager.Instance.ExperimentSystem;

            gameObject.SetActive(true);

            titleText.text = "Experiment Node";
            descriptionText.text = "危険な実験を試みますか？成功すれば強力な報酬が得られますが、失敗すればカードを失います。";

            int successChance = 50 + (level * 2);
            successChanceText.text = $"Success Chance: {successChance}%";

            acceptButton.onClick.AddListener(OnAcceptClicked);
            declineButton.onClick.AddListener(OnDeclineClicked);

            resultPanel.SetActive(false);
        }

        private void OnAcceptClicked()
        {
            AudioManager.Instance.PlaySE("button_click");

            var deckManager = GameManager.Instance.DeckManager;
            var result = experimentSystem.RunExperiment(nodeLevel, deckManager);

            ShowResult(result);
        }

        private void ShowResult(ExperimentResult result)
        {
            resultPanel.SetActive(true);
            resultMessageText.text = result.Message;

            if (result.Success)
            {
                // 成功演出
                AudioManager.Instance.PlaySE("quest_complete");
            }
            else
            {
                // 失敗演出
                AudioManager.Instance.PlaySE("explosion");
            }

            continueButton.onClick.AddListener(OnContinueClicked);
        }

        private void OnDeclineClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            Close();
        }

        private void OnContinueClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            Close();
        }

        private void Close()
        {
            gameObject.SetActive(false);
        }
    }
}
```

#### MonsterNodePanel クラス
```csharp
namespace Atelier.Presentation
{
    using UnityEngine;
    using UnityEngine.UI;
    using Atelier.Application;
    using Atelier.Domain;

    public class MonsterNodePanel : MonoBehaviour
    {
        [SerializeField] private Text monsterNameText;
        [SerializeField] private Text monsterHPText;
        [SerializeField] private Slider hpSlider;

        [SerializeField] private Button attackButton;
        [SerializeField] private Button fleeButton;

        [SerializeField] private GameObject victoryPanel;
        [SerializeField] private Transform dropsContainer;
        [SerializeField] private Button continueButton;

        private MonsterSystem monsterSystem;
        private MonsterEncounter currentEncounter;

        public void Show(int level)
        {
            monsterSystem = GameManager.Instance.MonsterSystem;

            gameObject.SetActive(true);

            currentEncounter = monsterSystem.GenerateEncounter(level);

            monsterNameText.text = currentEncounter.MonsterName;
            UpdateHPDisplay();

            attackButton.onClick.AddListener(OnAttackClicked);
            fleeButton.onClick.AddListener(OnFleeClicked);

            victoryPanel.SetActive(false);
        }

        private void OnAttackClicked()
        {
            AudioManager.Instance.PlaySE("card_play");

            // 固定ダメージ（簡易実装）
            int damage = 10;
            bool defeated = monsterSystem.DealDamage(currentEncounter, damage);

            UpdateHPDisplay();

            if (defeated)
            {
                ShowVictory();
            }
        }

        private void UpdateHPDisplay()
        {
            monsterHPText.text = $"HP: {currentEncounter.CurrentHP} / {currentEncounter.MaxHP}";
            hpSlider.value = (float)currentEncounter.CurrentHP / currentEncounter.MaxHP;
        }

        private void ShowVictory()
        {
            AudioManager.Instance.PlaySE("quest_complete");

            victoryPanel.SetActive(true);

            // ドロップ表示
            foreach (var card in currentEncounter.Drops)
            {
                // カードUIを生成
                // TODO: 実装
            }

            // ドロップをデッキに追加
            var deckManager = GameManager.Instance.DeckManager;
            foreach (var card in currentEncounter.Drops)
            {
                deckManager.AddCardToDeck(card);
            }

            continueButton.onClick.AddListener(OnContinueClicked);
        }

        private void OnFleeClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            Close();
        }

        private void OnContinueClicked()
        {
            AudioManager.Instance.PlaySE("button_click");
            Close();
        }

        private void Close()
        {
            gameObject.SetActive(false);
        }
    }
}
```

### 完了条件
- [ ] 実験ノードUIが動作する (REQ-016-1) 🔵
- [ ] 魔物ノードUIが動作する (REQ-016-2) 🔵
- [ ] 実験成功/失敗の演出が表示される 🔵
- [ ] 魔物撃破時にドロップが表示される 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void ExperimentNode_OnAccept_RunsExperiment()
{
    var panel = CreateExperimentNodePanel();

    panel.Show(level: 1);
    panel.OnAcceptClicked();

    Assert.IsTrue(panel.resultPanel.activeSelf); // 失敗
}
```

#### Green
- ExperimentNodePanelを実装
- MonsterNodePanelを実装

#### Refactor
- UI演出の最適化

---

## Phase 9 完了条件

### 全体完了条件
- [ ] すべてのタスク(TASK-0037~0039)が完了している
- [ ] MerchantSceneが動作する
- [ ] ResultSceneが動作する
- [ ] 実験/魔物ノードUIが動作する
- [ ] すべてのテストが通る

### 次フェーズへの引き継ぎ事項
- MerchantSceneが完成している
- ResultSceneでメタ通貨を獲得できる
- 実験/魔物ノードが動作する

---

**信頼性レベル凡例**:
- 🔵 青信号: 設計文書から明確
- 🟡 黄信号: 設計文書から妥当な推測
- 🔴 赤信号: 設計文書にない推測
