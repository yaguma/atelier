# 報酬・商人・実験・魔物ノードシステム

このドキュメントでは、ゲーム内の報酬配布システム、商人との取引システム、実験ノード、魔物戦闘システムについて説明するのだ。

## 報酬・商人システム (RewardSystem, MerchantSystem)

### RewardSystem (Domain Layer) - REQ-036

```csharp
namespace Atelier.Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using Atelier.Core;

    /// <summary>
    /// 報酬選択システム
    /// </summary>
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

            // 難易度に応じたレアリティ調整
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

            // 難易度が高いほど高レアリティが出やすい
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
            // （実装の詳細は省略）
            return new Card(); // プレースホルダー
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

    public class RewardReceivedEvent : GameEvent
    {
        public Card RewardCard { get; }

        public RewardReceivedEvent(Card card)
        {
            RewardCard = card;
        }
    }
}
```

### MerchantSystem (Domain Layer) - REQ-037

```csharp
namespace Atelier.Domain
{
    using System.Collections.Generic;
    using Atelier.Core;

    /// <summary>
    /// 商人システム - カード購入・強化・削除
    /// </summary>
    public class MerchantSystem
    {
        private EventBus eventBus;
        private CardSystem cardSystem;
        private System.Random rng;

        // 価格設定
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
            // レベルに応じたカードを生成
            // （実装の詳細は省略）
            return new Card();
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

    public class CardPurchasedEvent : GameEvent
    {
        public Card Card { get; }
        public int Price { get; }

        public CardPurchasedEvent(Card card, int price)
        {
            Card = card;
            Price = price;
        }
    }

    public class CardUpgradedEvent : GameEvent
    {
        public Card Card { get; }
        public int Price { get; }

        public CardUpgradedEvent(Card card, int price)
        {
            Card = card;
            Price = price;
        }
    }

    public class CardRemovedEvent : GameEvent
    {
        public Card Card { get; }
        public int Price { get; }

        public CardRemovedEvent(Card card, int price)
        {
            Card = card;
            Price = price;
        }
    }
}
```

---

## 実験・魔物ノードシステム (ExperimentSystem, MonsterSystem)

### ExperimentSystem (Domain Layer) - REQ-016-1

```csharp
namespace Atelier.Domain
{
    using Atelier.Core;

    /// <summary>
    /// 実験ノードシステム - ランダムイベント
    /// </summary>
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
            // 成功時: 強力なカードまたはアーティファクトを獲得
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
            // 失敗時: 暴発（ランダムでカードを1枚ロスト）
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

    public class ExperimentSuccessEvent : GameEvent
    {
        public ExperimentResult Result { get; }

        public ExperimentSuccessEvent(ExperimentResult result)
        {
            Result = result;
        }
    }

    public class ExperimentFailureEvent : GameEvent
    {
        public ExperimentResult Result { get; }

        public ExperimentFailureEvent(ExperimentResult result)
        {
            Result = result;
        }
    }
}
```

### MonsterSystem (Domain Layer) - REQ-016-2

```csharp
namespace Atelier.Domain
{
    using System.Collections.Generic;
    using Atelier.Core;

    /// <summary>
    /// 魔物ノードシステム - 素材入手のための戦闘
    /// </summary>
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

            // 魔物タイプに応じた素材カードをドロップ
            switch (type)
            {
                case MonsterType.Slime:
                    // 水属性素材
                    drops.Add(CreateMaterialCard("スライムの核", 0, 5, 0, 0));
                    break;
                case MonsterType.Golem:
                    // 地属性素材
                    drops.Add(CreateMaterialCard("ゴーレムの欠片", 0, 0, 5, 0));
                    break;
                case MonsterType.Dragon:
                    // 火属性素材
                    drops.Add(CreateMaterialCard("ドラゴンの鱗", 5, 0, 0, 0));
                    break;
                case MonsterType.Spirit:
                    // 風属性素材
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

    public class MonsterDefeatedEvent : GameEvent
    {
        public MonsterEncounter Monster { get; }

        public MonsterDefeatedEvent(MonsterEncounter monster)
        {
            Monster = monster;
        }
    }
}
```
