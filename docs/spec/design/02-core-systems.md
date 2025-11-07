# コアシステム設計

## C# クラス設計

### コアインターフェース

```csharp
// ============================================
// コアインターフェース定義
// ============================================

namespace Atelier.Core
{
    /// <summary>
    /// カードの基本インターフェース
    /// </summary>
    public interface ICard
    {
        string Id { get; }
        string Name { get; }
        CardType Type { get; }
        int Cost { get; }
        CardAttributes Attributes { get; }
        int Stability { get; }
        string Description { get; }

        void Play(IQuest targetQuest);
        bool CanPlay(int currentEnergy);
    }

    /// <summary>
    /// 依頼の基本インターフェース
    /// </summary>
    public interface IQuest
    {
        string Id { get; }
        string CustomerName { get; }
        QuestDifficulty Difficulty { get; }
        QuestRequirements Requirements { get; }
        QuestProgress Progress { get; }

        void ApplyCard(ICard card);
        bool IsCompleted();
        bool HasExploded();
    }

    /// <summary>
    /// デッキ管理インターフェース
    /// </summary>
    public interface IDeckManager
    {
        List<ICard> DrawPile { get; }
        List<ICard> Hand { get; }
        List<ICard> DiscardPile { get; }
        int HandSize { get; }

        void DrawCards(int count);
        void PlayCard(ICard card);
        void DiscardCard(ICard card);
        void Shuffle();
        void AddCardToDeck(ICard card);
        void RemoveCardFromDeck(string cardId);
    }

    /// <summary>
    /// セーブデータ管理インターフェース
    /// </summary>
    public interface ISaveDataRepository
    {
        SaveData LoadSaveData(int slotIndex);
        void SaveGameData(SaveData data, int slotIndex);
        bool HasSaveData(int slotIndex);
        void DeleteSaveData(int slotIndex);
    }
}
```

### ゲームマネージャー (Application Layer)

```csharp
// ============================================
// ゲームマネージャー (Application Layer)
// ============================================

namespace Atelier.Application
{
    using Atelier.Core;
    using Atelier.Domain;
    using UnityEngine;

    /// <summary>
    /// ゲーム全体を管理するシングルトンマネージャー
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        public GameStateManager StateManager { get; private set; }
        public EventBus EventBus { get; private set; }
        public CardSystem CardSystem { get; private set; }
        public QuestSystem QuestSystem { get; private set; }
        public DeckManager DeckManager { get; private set; }
        public MapSystem MapSystem { get; private set; }
        public MetaProgressionSystem MetaSystem { get; private set; }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeSystems();
        }

        private void InitializeSystems()
        {
            EventBus = new EventBus();
            StateManager = new GameStateManager();
            CardSystem = new CardSystem(EventBus);
            QuestSystem = new QuestSystem(EventBus);
            DeckManager = new DeckManager(EventBus);
            MapSystem = new MapSystem(EventBus);
            MetaSystem = new MetaProgressionSystem(EventBus);
        }

        public void StartNewGame(AlchemyStyle style, int? seed = null)
        {
            // 新規ゲーム開始処理
            MapSystem.GenerateMap(seed);
            DeckManager.InitializeDeck(style.InitialCards);
            StateManager.TransitionTo(GameState.Map);
        }

        public void LoadGame(int slotIndex)
        {
            // セーブデータ読み込み処理
            var saveRepo = new SaveDataRepository();
            var saveData = saveRepo.LoadSaveData(slotIndex);
            RestoreGameState(saveData);
        }

        private void RestoreGameState(SaveData data)
        {
            // ゲーム状態の復元
            DeckManager.RestoreDeck(data.DeckData);
            MapSystem.RestoreMap(data.MapData);
            MetaSystem.RestoreMetaData(data.MetaData);
        }
    }
}
```

### カードシステム (Domain Layer)

```csharp
// ============================================
// カードシステム (Domain Layer)
// ============================================

namespace Atelier.Domain
{
    using System.Collections.Generic;
    using Atelier.Core;

    /// <summary>
    /// カードデータ構造
    /// </summary>
    [System.Serializable]
    public class Card : ICard
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public CardType Type { get; set; }
        public int Cost { get; set; }
        public CardAttributes Attributes { get; set; }
        public int Stability { get; set; }
        public string Description { get; set; }
        public int Level { get; set; }
        public List<CardEffect> Effects { get; set; }

        public bool CanPlay(int currentEnergy)
        {
            return Cost <= currentEnergy;
        }

        public void Play(IQuest targetQuest)
        {
            targetQuest.ApplyCard(this);

            // エフェクト適用
            foreach (var effect in Effects)
            {
                effect.Apply(targetQuest);
            }
        }
    }

    /// <summary>
    /// カード属性
    /// </summary>
    [System.Serializable]
    public class CardAttributes
    {
        public int Fire { get; set; }
        public int Water { get; set; }
        public int Earth { get; set; }
        public int Wind { get; set; }
        public int Poison { get; set; }
        public int Quality { get; set; }

        public CardAttributes()
        {
            Fire = 0;
            Water = 0;
            Earth = 0;
            Wind = 0;
            Poison = 0;
            Quality = 0;
        }

        public static CardAttributes operator +(CardAttributes a, CardAttributes b)
        {
            return new CardAttributes
            {
                Fire = a.Fire + b.Fire,
                Water = a.Water + b.Water,
                Earth = a.Earth + b.Earth,
                Wind = a.Wind + b.Wind,
                Poison = a.Poison + b.Poison,
                Quality = a.Quality + b.Quality
            };
        }
    }

    /// <summary>
    /// カードタイプ
    /// </summary>
    public enum CardType
    {
        Material,    // 素材カード
        Operation,   // 操作カード
        Catalyst,    // 触媒カード
        Knowledge,   // 知識カード
        Special,     // 特殊カード
        Artifact     // アーティファクト
    }

    /// <summary>
    /// カード効果の基底クラス
    /// </summary>
    public abstract class CardEffect
    {
        public string EffectName { get; set; }
        public string Description { get; set; }

        public abstract void Apply(IQuest quest);
    }

    /// <summary>
    /// カードシステム管理クラス
    /// </summary>
    public class CardSystem
    {
        private Dictionary<string, Card> cardDatabase;
        private EventBus eventBus;

        public CardSystem(EventBus eventBus)
        {
            this.eventBus = eventBus;
            LoadCardDatabase();
        }

        private void LoadCardDatabase()
        {
            // JSONからカードデータを読み込み
            var config = ConfigDataLoader.LoadCardConfig();
            cardDatabase = new Dictionary<string, Card>();

            foreach (var cardData in config.Cards)
            {
                cardDatabase[cardData.Id] = cardData;
            }
        }

        public Card GetCard(string cardId)
        {
            if (cardDatabase.TryGetValue(cardId, out var card))
            {
                return card;
            }
            throw new System.Exception($"Card not found: {cardId}");
        }

        public Card CreateCardInstance(string cardId)
        {
            var original = GetCard(cardId);
            // Deep copy
            return new Card
            {
                Id = original.Id,
                Name = original.Name,
                Type = original.Type,
                Cost = original.Cost,
                Attributes = new CardAttributes
                {
                    Fire = original.Attributes.Fire,
                    Water = original.Attributes.Water,
                    Earth = original.Attributes.Earth,
                    Wind = original.Attributes.Wind,
                    Poison = original.Attributes.Poison,
                    Quality = original.Attributes.Quality
                },
                Stability = original.Stability,
                Description = original.Description,
                Level = original.Level,
                Effects = new List<CardEffect>(original.Effects)
            };
        }

        public void EvolveCard(Card card)
        {
            // カード進化ロジック
            card.Level++;
            card.Attributes.Quality += 10;
            eventBus.Publish(new CardEvolvedEvent(card));
        }
    }
}
```

### 依頼システム (Domain Layer)

```csharp
// ============================================
// 依頼システム (Domain Layer)
// ============================================

namespace Atelier.Domain
{
    using System.Collections.Generic;
    using Atelier.Core;

    /// <summary>
    /// 依頼データ構造
    /// </summary>
    [System.Serializable]
    public class Quest : IQuest
    {
        public string Id { get; set; }
        public string CustomerName { get; set; }
        public QuestDifficulty Difficulty { get; set; }
        public QuestRequirements Requirements { get; set; }
        public QuestProgress Progress { get; set; }

        public void ApplyCard(ICard card)
        {
            // 属性値の加算
            Progress.CurrentAttributes += card.Attributes;

            // 安定値の計算（Progress.CurrentStabilityに統一）
            Progress.CurrentStability += card.Stability;

            // 暴発チェック
            if (Progress.CurrentStability < 0)
            {
                TriggerExplosion();
            }
        }

        public bool IsCompleted()
        {
            return Requirements.IsMetBy(Progress.CurrentAttributes) &&
                   !Progress.HasExploded;
        }

        public bool HasExploded()
        {
            return Progress.HasExploded;
        }

        private void TriggerExplosion()
        {
            Progress.HasExploded = true;
            // ペナルティ処理
        }
    }

    /// <summary>
    /// 依頼の必要条件
    /// </summary>
    [System.Serializable]
    public class QuestRequirements
    {
        public CardAttributes RequiredAttributes { get; set; }
        public int MinQuality { get; set; }
        public int MinStability { get; set; }

        public bool IsMetBy(CardAttributes current)
        {
            return current.Fire >= RequiredAttributes.Fire &&
                   current.Water >= RequiredAttributes.Water &&
                   current.Earth >= RequiredAttributes.Earth &&
                   current.Wind >= RequiredAttributes.Wind &&
                   current.Quality >= MinQuality;
        }
    }

    /// <summary>
    /// 依頼の進行状況
    /// </summary>
    [System.Serializable]
    public class QuestProgress
    {
        public CardAttributes CurrentAttributes { get; set; }
        public int CurrentStability { get; set; }
        public bool HasExploded { get; set; }
        public float SatisfactionGauge { get; set; }

        public QuestProgress()
        {
            CurrentAttributes = new CardAttributes();
            CurrentStability = 0;
            HasExploded = false;
            SatisfactionGauge = 0f;
        }
    }

    /// <summary>
    /// 依頼難易度
    /// </summary>
    public enum QuestDifficulty
    {
        OneStar = 1,
        TwoStar = 2,
        ThreeStar = 3,
        FourStar = 4,
        FiveStar = 5
    }

    /// <summary>
    /// 依頼システム管理クラス
    /// </summary>
    public class QuestSystem
    {
        private List<Quest> activeQuests;
        private Dictionary<string, Quest> questDatabase;
        private EventBus eventBus;
        private const int MaxActiveQuests = 3;

        public QuestSystem(EventBus eventBus)
        {
            this.eventBus = eventBus;
            activeQuests = new List<Quest>();
            LoadQuestDatabase();
        }

        private void LoadQuestDatabase()
        {
            var config = ConfigDataLoader.LoadQuestConfig();
            questDatabase = new Dictionary<string, Quest>();

            foreach (var questData in config.Quests)
            {
                questDatabase[questData.Id] = questData;
            }
        }

        public void GenerateQuests(int mapLevel, System.Random rng)
        {
            activeQuests.Clear();

            for (int i = 0; i < MaxActiveQuests; i++)
            {
                var quest = GenerateRandomQuest(mapLevel, rng);
                activeQuests.Add(quest);
            }

            eventBus.Publish(new QuestsGeneratedEvent(activeQuests));
        }

        private Quest GenerateRandomQuest(int level, System.Random rng)
        {
            // ランダムな依頼生成ロジック
            var difficulty = (QuestDifficulty)(rng.Next(1, 6));

            return new Quest
            {
                Id = System.Guid.NewGuid().ToString(),
                CustomerName = GetRandomCustomer(rng),
                Difficulty = difficulty,
                Requirements = GenerateRequirements(difficulty),
                Progress = new QuestProgress()
            };
        }

        private QuestRequirements GenerateRequirements(QuestDifficulty difficulty)
        {
            int multiplier = (int)difficulty;

            return new QuestRequirements
            {
                RequiredAttributes = new CardAttributes
                {
                    Fire = 5 * multiplier,
                    Water = 3 * multiplier,
                    Quality = 10 * multiplier
                },
                MinQuality = 10 * multiplier,
                MinStability = 0
            };
        }

        private string GetRandomCustomer(System.Random rng)
        {
            var customers = new List<string> { "村人A", "魔法使い", "騎士", "商人", "錬金術師" };
            return customers[rng.Next(customers.Count)];
        }

        public List<Quest> GetActiveQuests()
        {
            return new List<Quest>(activeQuests);
        }

        public void CompleteQuest(string questId)
        {
            var quest = activeQuests.Find(q => q.Id == questId);
            if (quest != null && quest.IsCompleted())
            {
                activeQuests.Remove(quest);
                eventBus.Publish(new QuestCompletedEvent(quest));
            }
        }
    }
}
```

### デッキマネージャー (Domain Layer)

```csharp
// ============================================
// デッキマネージャー (Domain Layer)
// ============================================

namespace Atelier.Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using Atelier.Core;

    /// <summary>
    /// デッキ管理クラス
    /// </summary>
    public class DeckManager : IDeckManager
    {
        public List<ICard> DrawPile { get; private set; }
        public List<ICard> Hand { get; private set; }
        public List<ICard> DiscardPile { get; private set; }
        public int HandSize { get; private set; }

        private int currentEnergy;
        private const int MaxEnergy = 10;
        private const int EnergyPerTurn = 3;
        private const int DefaultHandSize = 5;

        private EventBus eventBus;
        private System.Random rng;

        public DeckManager(EventBus eventBus, int? seed = null)
        {
            this.eventBus = eventBus;
            DrawPile = new List<ICard>();
            Hand = new List<ICard>();
            DiscardPile = new List<ICard>();
            HandSize = DefaultHandSize;

            // rngを初期化（シード値が指定されていれば使用）
            rng = seed.HasValue ? new System.Random(seed.Value) : new System.Random();
        }

        public void InitializeDeck(List<string> initialCardIds)
        {
            DrawPile.Clear();
            Hand.Clear();
            DiscardPile.Clear();

            var cardSystem = GameManager.Instance.CardSystem;
            foreach (var cardId in initialCardIds)
            {
                var card = cardSystem.CreateCardInstance(cardId);
                DrawPile.Add(card);
            }

            Shuffle();
        }

        public void StartTurn()
        {
            // ターン開始時の処理
            currentEnergy = System.Math.Min(currentEnergy + EnergyPerTurn, MaxEnergy);

            // 手札を規定枚数まで補充
            int cardsToDraw = HandSize - Hand.Count;
            DrawCards(cardsToDraw);

            eventBus.Publish(new TurnStartedEvent(currentEnergy));
        }

        public void DrawCards(int count)
        {
            for (int i = 0; i < count; i++)
            {
                if (DrawPile.Count == 0)
                {
                    // 捨て札をシャッフルして山札に戻す
                    DrawPile.AddRange(DiscardPile);
                    DiscardPile.Clear();
                    Shuffle();
                }

                if (DrawPile.Count > 0)
                {
                    var card = DrawPile[0];
                    DrawPile.RemoveAt(0);
                    Hand.Add(card);
                    eventBus.Publish(new CardDrawnEvent(card));
                }
            }
        }

        public void PlayCard(ICard card)
        {
            if (!Hand.Contains(card))
            {
                throw new System.InvalidOperationException("Card not in hand");
            }

            if (!card.CanPlay(currentEnergy))
            {
                throw new System.InvalidOperationException("Not enough energy");
            }

            Hand.Remove(card);
            currentEnergy -= card.Cost;
            DiscardPile.Add(card);

            eventBus.Publish(new CardPlayedEvent(card, currentEnergy));
        }

        public void DiscardCard(ICard card)
        {
            if (Hand.Contains(card))
            {
                Hand.Remove(card);
                DiscardPile.Add(card);
                eventBus.Publish(new CardDiscardedEvent(card));
            }
        }

        public void Shuffle()
        {
            // Fisher-Yates shuffle
            for (int i = DrawPile.Count - 1; i > 0; i--)
            {
                int j = rng.Next(i + 1);
                var temp = DrawPile[i];
                DrawPile[i] = DrawPile[j];
                DrawPile[j] = temp;
            }
        }

        public void AddCardToDeck(ICard card)
        {
            DrawPile.Add(card);
            eventBus.Publish(new CardAddedToDeckEvent(card));
        }

        public void RemoveCardFromDeck(string cardId)
        {
            var card = DrawPile.FirstOrDefault(c => c.Id == cardId);
            if (card != null)
            {
                DrawPile.Remove(card);
                eventBus.Publish(new CardRemovedFromDeckEvent(card));
            }
        }

        public void RestoreDeck(DeckData data)
        {
            // セーブデータからデッキを復元
            DrawPile = data.DrawPile.Select(id =>
                GameManager.Instance.CardSystem.CreateCardInstance(id)).ToList<ICard>();
            Hand = data.Hand.Select(id =>
                GameManager.Instance.CardSystem.CreateCardInstance(id)).ToList<ICard>();
            DiscardPile = data.DiscardPile.Select(id =>
                GameManager.Instance.CardSystem.CreateCardInstance(id)).ToList<ICard>();
        }
    }
}
```
