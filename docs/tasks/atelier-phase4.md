# Phase 4: 報酬/商人/実験/魔物システムタスク

**期間**: Week 1-4 (8日間)
**総工数**: 64h
**タスク範囲**: TASK-0020 ~ TASK-0023
**タスクタイプ**: TDD中心

---

## TASK-0020: RewardSystem実装

**タスクID**: TASK-0020
**タスク名**: RewardSystem実装
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-036

### 依存タスク
- TASK-0013: CardSystem実装
- TASK-0015: DeckManager実装

### 実装詳細

設計文書 `05-merchant-experiment.md` のRewardSystem実装を参照 🔵

#### RewardSystem クラス
```csharp
namespace Atelier.Domain
{
    public class RewardSystem
    {
        private EventBus eventBus;
        private CardSystem cardSystem;
        private System.Random rng;

        public RewardSystem(EventBus eventBus, CardSystem cardSystem, System.Random rng)
        {
            this.eventBus = eventBus;
            this.cardSystem = cardSystem;
            this.rng = rng;
        }

        /// <summary>
        /// 依頼達成時のカード報酬を生成（3枚から1枚選択）
        /// </summary>
        public List<Card> GenerateCardRewards(Quest quest, int count = 3)
        {
            var rewards = new List<Card>();
            var difficulty = (int)quest.Difficulty;

            for (int i = 0; i < count; i++)
            {
                var rarity = DetermineRarity(difficulty);
                var card = GetRandomCardByRarity(rarity);
                rewards.Add(card);
            }

            return rewards;
        }

        private CardRarity DetermineRarity(int difficulty)
        {
            int roll = rng.Next(100);

            int uncommonThreshold = 50 + (difficulty * 5);
            int rareThreshold = 80 + (difficulty * 3);

            if (roll < uncommonThreshold)
                return CardRarity.Common;
            else if (roll < rareThreshold)
                return CardRarity.Uncommon;
            else
                return CardRarity.Rare;
        }

        private Card GetRandomCardByRarity(CardRarity rarity)
        {
            // カードデータベースから該当レアリティのカードを取得
            var allCards = cardSystem.GetAllCards();
            var cardsByRarity = allCards.Where(c => c.Rarity == rarity).ToList();

            if (cardsByRarity.Count == 0)
                return allCards[rng.Next(allCards.Count)];

            return cardsByRarity[rng.Next(cardsByRarity.Count)];
        }

        public void GiveRewardToPlayer(Card selectedCard, DeckManager deckManager)
        {
            deckManager.AddCardToDeck(selectedCard);
            eventBus.Publish(new RewardReceivedEvent(selectedCard));
        }
    }

    public enum CardRarity
    {
        Common,
        Uncommon,
        Rare,
        Epic,
        Legendary
    }
}
```

### 完了条件
- [ ] 依頼達成時に3枚のカード報酬が生成される (REQ-036) 🔵
- [ ] 難易度に応じてレアリティが調整される 🔵
- [ ] 選択したカードがデッキに追加される 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void GenerateCardRewards_Returns3Cards()
{
    var reward = new RewardSystem(new EventBus(), cardSystem, new System.Random(123));
    var quest = new Quest { Difficulty = QuestDifficulty.ThreeStar };

    var rewards = reward.GenerateCardRewards(quest);

    Assert.AreEqual(3, rewards.Count); // 失敗
}

[Test]
public void DetermineRarity_HigherDifficultyIncreaseRareChance()
{
    var reward = new RewardSystem(new EventBus(), cardSystem, new System.Random(123));

    var rarity1 = reward.DetermineRarity(1);
    var rarity5 = reward.DetermineRarity(5);

    // 難易度5の方が高レアリティが出やすい
    Assert.IsTrue(rarity5 >= rarity1); // 失敗
}
```

#### Green
- RewardSystemを実装

#### Refactor
- レアリティ判定ロジックの最適化
- カード選択ロジックの改善

---

## TASK-0021: MerchantSystem実装

**タスクID**: TASK-0021
**タスク名**: MerchantSystem実装
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-037

### 依存タスク
- TASK-0013: CardSystem実装
- TASK-0015: DeckManager実装

### 実装詳細

設計文書 `05-merchant-experiment.md` のMerchantSystem実装を参照 🔵

#### MerchantSystem クラス
```csharp
namespace Atelier.Domain
{
    public class MerchantSystem
    {
        private EventBus eventBus;
        private CardSystem cardSystem;
        private System.Random rng;

        private const int BasePurchasePrice = 50;
        private const int BaseUpgradePrice = 75;
        private const int BaseRemovePrice = 30;

        public int CurrentGold { get; private set; }

        public MerchantSystem(EventBus eventBus, CardSystem cardSystem, System.Random rng)
        {
            this.eventBus = eventBus;
            this.cardSystem = cardSystem;
            this.rng = rng;
        }

        /// <summary>
        /// 商人の在庫を生成（5〜7枚）
        /// </summary>
        public List<MerchantItem> GenerateShopInventory(int mapLevel)
        {
            var inventory = new List<MerchantItem>();
            int itemCount = rng.Next(5, 8);

            for (int i = 0; i < itemCount; i++)
            {
                var card = GenerateRandomCard(mapLevel);
                int price = CalculatePrice(card, mapLevel);

                inventory.Add(new MerchantItem
                {
                    Card = card,
                    Price = price,
                    Type = MerchantItemType.Purchase
                });
            }

            return inventory;
        }

        private Card GenerateRandomCard(int level)
        {
            var allCards = cardSystem.GetAllCards();
            return allCards[rng.Next(allCards.Count)];
        }

        private int CalculatePrice(Card card, int level)
        {
            return BasePurchasePrice + (level * 10);
        }

        /// <summary>
        /// カードを購入
        /// </summary>
        public bool PurchaseCard(Card card, int price, DeckManager deckManager)
        {
            if (CurrentGold >= price)
            {
                CurrentGold -= price;
                deckManager.AddCardToDeck(card);
                eventBus.Publish(new CardPurchasedEvent(card, price));
                return true;
            }
            return false;
        }

        /// <summary>
        /// カードを強化（レベルアップ）
        /// </summary>
        public bool UpgradeCard(Card card, int price)
        {
            if (CurrentGold >= price)
            {
                CurrentGold -= price;
                cardSystem.EvolveCard(card);
                eventBus.Publish(new CardUpgradedEvent(card, price));
                return true;
            }
            return false;
        }

        /// <summary>
        /// カードをデッキから削除
        /// </summary>
        public bool RemoveCard(Card card, int price, DeckManager deckManager)
        {
            if (CurrentGold >= price)
            {
                CurrentGold -= price;
                deckManager.RemoveCardFromDeck(card.Id);
                eventBus.Publish(new CardRemovedEvent(card, price));
                return true;
            }
            return false;
        }

        public void AddGold(int amount)
        {
            CurrentGold += amount;
        }
    }

    public class MerchantItem
    {
        public Card Card { get; set; }
        public int Price { get; set; }
        public MerchantItemType Type { get; set; }
    }

    public enum MerchantItemType
    {
        Purchase,
        Upgrade,
        Remove
    }
}
```

### 完了条件
- [ ] 商人在庫が5〜7枚生成される 🔵
- [ ] カード購入機能が動作する (REQ-037) 🔵
- [ ] カード強化機能が動作する (REQ-037) 🔵
- [ ] カード削除機能が動作する (REQ-037) 🔵
- [ ] ゴールド管理が正しく動作する 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void GenerateShopInventory_Returns5To7Items()
{
    var merchant = new MerchantSystem(new EventBus(), cardSystem, new System.Random(123));

    var inventory = merchant.GenerateShopInventory(mapLevel: 1);

    Assert.IsTrue(inventory.Count >= 5); // 失敗
    Assert.IsTrue(inventory.Count <= 7);
}

[Test]
public void PurchaseCard_DeductsGold_AndAddsCardToDeck()
{
    var merchant = new MerchantSystem(new EventBus(), cardSystem, new System.Random());
    merchant.AddGold(100);
    var card = new Card();
    var deckManager = new DeckManager(new EventBus());

    bool result = merchant.PurchaseCard(card, 50, deckManager);

    Assert.IsTrue(result); // 失敗
    Assert.AreEqual(50, merchant.CurrentGold);
    Assert.AreEqual(1, deckManager.DrawPile.Count);
}

[Test]
public void RemoveCard_DeductsGold_AndRemovesCardFromDeck()
{
    var merchant = new MerchantSystem(new EventBus(), cardSystem, new System.Random());
    merchant.AddGold(100);
    var card = new Card { Id = "test-card" };
    var deckManager = new DeckManager(new EventBus());
    deckManager.AddCardToDeck(card);

    bool result = merchant.RemoveCard(card, 30, deckManager);

    Assert.IsTrue(result); // 失敗
    Assert.AreEqual(70, merchant.CurrentGold);
    Assert.AreEqual(0, deckManager.DrawPile.Count);
}
```

#### Green
- MerchantSystemを実装

#### Refactor
- 価格計算ロジックの分離
- 在庫生成の最適化

---

## TASK-0022: ExperimentSystem実装

**タスクID**: TASK-0022
**タスク名**: ExperimentSystem実装
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-016-1

### 依存タスク
- TASK-0015: DeckManager実装

### 実装詳細

設計文書 `05-merchant-experiment.md` のExperimentSystem実装を参照 🔵

#### ExperimentSystem クラス
```csharp
namespace Atelier.Domain
{
    public class ExperimentSystem
    {
        private EventBus eventBus;
        private System.Random rng;

        public ExperimentSystem(EventBus eventBus, System.Random rng)
        {
            this.eventBus = eventBus;
            this.rng = rng;
        }

        /// <summary>
        /// 実験イベントを実行
        /// </summary>
        public ExperimentResult RunExperiment(int level, DeckManager deckManager)
        {
            // 成功率は50〜70% (レベルによって変動)
            int successChance = 50 + (level * 2);
            int roll = rng.Next(100);

            if (roll < successChance)
            {
                return HandleSuccess(level, deckManager);
            }
            else
            {
                return HandleFailure(deckManager);
            }
        }

        private ExperimentResult HandleSuccess(int level, DeckManager deckManager)
        {
            var result = new ExperimentResult
            {
                Success = true,
                Message = "実験は成功した！強力なカードを獲得した。",
                RewardType = ExperimentRewardType.RareCard
            };

            eventBus.Publish(new ExperimentSuccessEvent(result));
            return result;
        }

        private ExperimentResult HandleFailure(DeckManager deckManager)
        {
            if (deckManager.DrawPile.Count > 0)
            {
                int randomIndex = rng.Next(deckManager.DrawPile.Count);
                var lostCard = deckManager.DrawPile[randomIndex];
                deckManager.DrawPile.RemoveAt(randomIndex);

                var result = new ExperimentResult
                {
                    Success = false,
                    Message = $"実験は失敗し、暴発した！{lostCard.Name}を失った。",
                    LostCard = lostCard
                };

                eventBus.Publish(new ExperimentFailureEvent(result));
                return result;
            }

            return new ExperimentResult
            {
                Success = false,
                Message = "実験は失敗したが、幸いカードは失わなかった。"
            };
        }
    }

    public class ExperimentResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public ExperimentRewardType RewardType { get; set; }
        public ICard LostCard { get; set; }
    }

    public enum ExperimentRewardType
    {
        None,
        RareCard,
        Artifact,
        Gold
    }
}
```

### 完了条件
- [ ] 実験成功時に報酬を獲得できる (REQ-016-1) 🔵
- [ ] 実験失敗時にカードをロストする (REQ-016-1) 🔵
- [ ] 成功率がレベルに応じて変動する 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void RunExperiment_Success_ReturnsSuccessResult()
{
    var experiment = new ExperimentSystem(new EventBus(), new System.Random(123));
    var deckManager = new DeckManager(new EventBus());

    // 成功するシードを使用
    var result = experiment.RunExperiment(level: 10, deckManager);

    Assert.IsTrue(result.Success); // 失敗
}

[Test]
public void RunExperiment_Failure_LosesCard()
{
    var experiment = new ExperimentSystem(new EventBus(), new System.Random(456));
    var deckManager = new DeckManager(new EventBus());
    deckManager.AddCardToDeck(new Card { Name = "Test Card" });

    // 失敗するシードを使用
    var result = experiment.RunExperiment(level: 1, deckManager);

    Assert.IsFalse(result.Success); // 失敗
    Assert.IsNotNull(result.LostCard);
    Assert.AreEqual(0, deckManager.DrawPile.Count);
}
```

#### Green
- ExperimentSystemを実装

#### Refactor
- 成功率計算の調整
- 報酬生成ロジックの改善

---

## TASK-0023: MonsterSystem実装

**タスクID**: TASK-0023
**タスク名**: MonsterSystem実装
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-016-2

### 依存タスク
- TASK-0010: Card クラス実装

### 実装詳細

設計文書 `05-merchant-experiment.md` のMonsterSystem実装を参照 🔵

#### MonsterSystem クラス
```csharp
namespace Atelier.Domain
{
    public class MonsterSystem
    {
        private EventBus eventBus;
        private System.Random rng;

        public MonsterSystem(EventBus eventBus, System.Random rng)
        {
            this.eventBus = eventBus;
            this.rng = rng;
        }

        /// <summary>
        /// 魔物戦闘を生成
        /// </summary>
        public MonsterEncounter GenerateEncounter(int level)
        {
            var monsterType = GetRandomMonsterType();
            var hp = 20 + (level * 5);

            return new MonsterEncounter
            {
                MonsterName = GetMonsterName(monsterType),
                MonsterType = monsterType,
                CurrentHP = hp,
                MaxHP = hp,
                Level = level,
                Drops = GenerateDrops(monsterType, level)
            };
        }

        private MonsterType GetRandomMonsterType()
        {
            var types = System.Enum.GetValues(typeof(MonsterType));
            return (MonsterType)types.GetValue(rng.Next(types.Length));
        }

        private string GetMonsterName(MonsterType type)
        {
            switch (type)
            {
                case MonsterType.Slime: return "スライム";
                case MonsterType.Golem: return "ゴーレム";
                case MonsterType.Dragon: return "ドラゴン";
                case MonsterType.Spirit: return "精霊";
                default: return "魔物";
            }
        }

        private List<Card> GenerateDrops(MonsterType type, int level)
        {
            var drops = new List<Card>();

            switch (type)
            {
                case MonsterType.Slime:
                    drops.Add(CreateMaterialCard("スライムの核", 0, 5, 0, 0));
                    break;
                case MonsterType.Golem:
                    drops.Add(CreateMaterialCard("ゴーレムの欠片", 0, 0, 5, 0));
                    break;
                case MonsterType.Dragon:
                    drops.Add(CreateMaterialCard("ドラゴンの鱗", 5, 0, 0, 0));
                    break;
                case MonsterType.Spirit:
                    drops.Add(CreateMaterialCard("精霊の涙", 0, 0, 0, 5));
                    break;
            }

            return drops;
        }

        private Card CreateMaterialCard(string name, int fire, int water, int earth, int wind)
        {
            return new Card
            {
                Id = System.Guid.NewGuid().ToString(),
                Name = name,
                Type = CardType.Material,
                Cost = 1,
                Attributes = new CardAttributes
                {
                    Fire = fire,
                    Water = water,
                    Earth = earth,
                    Wind = wind,
                    Quality = 3
                },
                Stability = 1,
                Description = $"{name}を手に入れた",
                Level = 1
            };
        }

        /// <summary>
        /// 魔物にダメージを与える
        /// </summary>
        public bool DealDamage(MonsterEncounter monster, int damage)
        {
            monster.CurrentHP -= damage;

            if (monster.CurrentHP <= 0)
            {
                eventBus.Publish(new MonsterDefeatedEvent(monster));
                return true; // 撃破
            }

            return false;
        }
    }

    public class MonsterEncounter
    {
        public string MonsterName { get; set; }
        public MonsterType MonsterType { get; set; }
        public int CurrentHP { get; set; }
        public int MaxHP { get; set; }
        public int Level { get; set; }
        public List<Card> Drops { get; set; }
    }

    public enum MonsterType
    {
        Slime,
        Golem,
        Dragon,
        Spirit
    }
}
```

### 完了条件
- [ ] 魔物エンカウントが生成される (REQ-016-2) 🔵
- [ ] 魔物タイプに応じた素材カードがドロップする 🔵
- [ ] ダメージ処理が正しく動作する 🔵
- [ ] HP0で撃破判定される 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void GenerateEncounter_CreatesMonsterWithHP()
{
    var monster = new MonsterSystem(new EventBus(), new System.Random(123));

    var encounter = monster.GenerateEncounter(level: 1);

    Assert.IsNotNull(encounter); // 失敗
    Assert.IsTrue(encounter.MaxHP > 0);
    Assert.AreEqual(encounter.MaxHP, encounter.CurrentHP);
}

[Test]
public void DealDamage_ReducesHP()
{
    var monsterSystem = new MonsterSystem(new EventBus(), new System.Random());
    var encounter = new MonsterEncounter { CurrentHP = 100, MaxHP = 100 };

    monsterSystem.DealDamage(encounter, 30);

    Assert.AreEqual(70, encounter.CurrentHP); // 失敗
}

[Test]
public void DealDamage_ReturnsTrue_WhenHPReachesZero()
{
    var monsterSystem = new MonsterSystem(new EventBus(), new System.Random());
    var encounter = new MonsterEncounter { CurrentHP = 10, MaxHP = 100 };

    bool defeated = monsterSystem.DealDamage(encounter, 20);

    Assert.IsTrue(defeated); // 失敗
}

[Test]
public void GenerateDrops_ReturnsCorrectMaterialForMonsterType()
{
    var monsterSystem = new MonsterSystem(new EventBus(), new System.Random(123));
    var encounter = monsterSystem.GenerateEncounter(level: 1);

    Assert.IsNotNull(encounter.Drops); // 失敗
    Assert.IsTrue(encounter.Drops.Count > 0);
}
```

#### Green
- MonsterSystemを実装

#### Refactor
- ドロップ生成ロジックの最適化
- 魔物タイプの追加拡張性の確保

---

## Phase 4 完了条件

### 全体完了条件
- [ ] すべてのタスク(TASK-0020~0023)が完了している
- [ ] 報酬システムが動作する
- [ ] 商人システムが動作する
- [ ] 実験システムが動作する
- [ ] 魔物システムが動作する
- [ ] すべてのユニットテストが通る

### 次フェーズへの引き継ぎ事項
- RewardSystemが依頼達成報酬で使用可能
- MerchantSystemが商人ノードで使用可能
- ExperimentSystemが実験ノードで使用可能
- MonsterSystemが魔物ノードで使用可能

---

**信頼性レベル凡例**:
- 🔵 青信号: 設計文書から明確
- 🟡 黄信号: 設計文書から妥当な推測
- 🔴 赤信号: 設計文書にない推測
