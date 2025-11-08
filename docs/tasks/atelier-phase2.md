# Phase 2: データ構造とカード/依頼システムタスク

**期間**: Week 1-3 (9日間)
**総工数**: 72h
**タスク範囲**: TASK-0008 ~ TASK-0014
**タスクタイプ**: TDD中心

---

## TASK-0008: コアインターフェース定義

**タスクID**: TASK-0008
**タスク名**: コアインターフェース定義
**推定工数**: 8h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-022, REQ-029, REQ-030

### 依存タスク
- TASK-0002: フォルダ構造作成

### 実装詳細

設計文書 `02-core-systems.md` のコアインターフェース定義を参照 🔵

#### インターフェース一覧
```csharp
namespace Atelier.Core
{
    // ICard - カードの基本インターフェース
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

    // IQuest - 依頼の基本インターフェース
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

    // IDeckManager - デッキ管理インターフェース
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

    // ISaveDataRepository - セーブデータ管理インターフェース
    public interface ISaveDataRepository
    {
        SaveData LoadSaveData(int slotIndex);
        void SaveGameData(SaveData data, int slotIndex);
        bool HasSaveData(int slotIndex);
        void DeleteSaveData(int slotIndex);
    }
}
```

### 完了条件
- [ ] 4つのコアインターフェースが定義されている 🔵
- [ ] インターフェースがコンパイルエラーなく定義されている 🔵
- [ ] XML文書コメントが記述されている 🟡

### テスト要件（TDDタスク）
#### Red
- インターフェースの存在確認テスト
- 必要なメソッド/プロパティの定義確認テスト

#### Green
- インターフェースをモック実装してテストを通す

#### Refactor
- XML文書コメントを追加
- 命名規則の統一

---

## TASK-0009: CardAttributes / CardType実装

**タスクID**: TASK-0009
**タスク名**: CardAttributes / CardType実装
**推定工数**: 8h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-023

### 依存タスク
- TASK-0008: コアインターフェース定義

### 実装詳細

設計文書 `02-core-systems.md` のCardAttributes実装を参照 🔵

#### CardAttributes クラス
```csharp
namespace Atelier.Domain
{
    [System.Serializable]
    public class CardAttributes
    {
        public int Fire { get; set; }
        public int Water { get; set; }
        public int Earth { get; set; }
        public int Wind { get; set; }
        public int Poison { get; set; }
        public int Quality { get; set; }

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
}
```

#### CardType 列挙型
```csharp
namespace Atelier.Domain
{
    public enum CardType
    {
        Material,    // 素材カード
        Operation,   // 操作カード
        Catalyst,    // 触媒カード
        Knowledge,   // 知識カード
        Special,     // 特殊カード
        Artifact     // アーティファクト
    }
}
```

### 完了条件
- [ ] CardAttributesが6つの属性を持つ 🔵
- [ ] +演算子オーバーロードが実装されている 🔵
- [ ] CardTypeが6つのタイプを定義している 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
- CardAttributesの属性値加算テスト（失敗）
- CardAttributesのデフォルト値テスト（失敗）
- CardTypeの列挙値確認テスト（失敗）

#### Green
- CardAttributesクラスを実装
- +演算子オーバーロードを実装
- CardType列挙型を実装

#### Refactor
- コンストラクタの追加
- 不変性の検討（必要に応じて）

---

## TASK-0010: Card クラス実装

**タスクID**: TASK-0010
**タスク名**: Card クラス実装
**推定工数**: 12h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-022, REQ-023, REQ-024

### 依存タスク
- TASK-0008: コアインターフェース定義
- TASK-0009: CardAttributes / CardType実装

### 実装詳細

設計文書 `02-core-systems.md` のCardクラス実装を参照 🔵

#### Card クラス
```csharp
namespace Atelier.Domain
{
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

            foreach (var effect in Effects)
            {
                effect.Apply(targetQuest);
            }
        }
    }
}
```

### 完了条件
- [ ] ICardインターフェースを実装している 🔵
- [ ] CanPlay()が正しくエネルギー判定する 🔵
- [ ] Play()が依頼にカードを適用する 🔵
- [ ] エフェクトが正しく適用される 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void CanPlay_WhenEnergyIsEnough_ReturnsTrue()
{
    // Arrange
    var card = new Card { Cost = 3 };

    // Act
    var result = card.CanPlay(5);

    // Assert
    Assert.IsTrue(result); // 失敗
}

[Test]
public void Play_AppliesCardToQuest()
{
    // Arrange
    var card = new Card { /* ... */ };
    var quest = new MockQuest();

    // Act
    card.Play(quest);

    // Assert
    Assert.IsTrue(quest.WasApplied); // 失敗
}
```

#### Green
- Cardクラスを実装
- CanPlay()とPlay()を実装

#### Refactor
- エフェクト適用ロジックの最適化
- 不要な依存関係の削除

---

## TASK-0011: CardEffect 基底クラスと具体実装

**タスクID**: TASK-0011
**タスク名**: CardEffect 基底クラスと具体実装
**推定工数**: 12h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-023

### 依存タスク
- TASK-0010: Card クラス実装

### 実装詳細

設計文書 `02-core-systems.md` と `08-infrastructure.md` のCardEffect実装を参照 🔵

#### CardEffect 基底クラス
```csharp
namespace Atelier.Domain
{
    public abstract class CardEffect
    {
        public string EffectName { get; set; }
        public string Description { get; set; }

        public abstract void Apply(IQuest quest);
    }
}
```

#### 具体的なエフェクト実装
```csharp
// 属性倍化エフェクト
public class MultiplyAttributeEffect : CardEffect
{
    public string TargetAttribute { get; set; }
    public float Multiplier { get; set; }

    public override void Apply(IQuest quest) { /* ... */ }
}

// カードドローエフェクト
public class DrawCardEffect : CardEffect
{
    public int DrawCount { get; set; }

    public override void Apply(IQuest quest) { /* ... */ }
}

// 安定値増加エフェクト
public class StabilizeEffect : CardEffect
{
    public int StabilityBonus { get; set; }

    public override void Apply(IQuest quest) { /* ... */ }
}

// 全属性増加エフェクト
public class BoostAllAttributesEffect : CardEffect
{
    public int BoostAmount { get; set; }

    public override void Apply(IQuest quest) { /* ... */ }
}
```

### 完了条件
- [ ] CardEffect基底クラスが実装されている 🔵
- [ ] 4種類以上の具体エフェクトが実装されている 🔵
- [ ] 各エフェクトのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
- 各エフェクトの適用テスト（失敗）
- エフェクトの連鎖適用テスト（失敗）

#### Green
- 各具体エフェクトを実装

#### Refactor
- エフェクト適用の共通処理を基底クラスに移動

---

## TASK-0012: Quest / QuestRequirements実装

**タスクID**: TASK-0012
**タスク名**: Quest / QuestRequirements実装
**推定工数**: 12h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-030, REQ-031, REQ-033, REQ-034

### 依存タスク
- TASK-0008: コアインターフェース定義
- TASK-0009: CardAttributes / CardType実装

### 実装詳細

設計文書 `02-core-systems.md` のQuest実装を参照 🔵

#### Quest クラス
```csharp
namespace Atelier.Domain
{
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
            Progress.CurrentAttributes += card.Attributes;
            Progress.CurrentStability += card.Stability;

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
        }
    }

    public enum QuestDifficulty
    {
        OneStar = 1,
        TwoStar = 2,
        ThreeStar = 3,
        FourStar = 4,
        FiveStar = 5
    }
}
```

#### QuestRequirements クラス
```csharp
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
```

### 完了条件
- [ ] Questクラスが実装されている 🔵
- [ ] 暴発判定が正しく動作する (REQ-033) 🔵
- [ ] 難易度が1〜5星で表現される (REQ-031) 🔵
- [ ] 依頼達成判定が正しく動作する (REQ-034) 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void ApplyCard_UpdatesAttributes()
{
    var quest = new Quest { /* ... */ };
    var card = new Card { Attributes = new CardAttributes { Fire = 5 } };

    quest.ApplyCard(card);

    Assert.AreEqual(5, quest.Progress.CurrentAttributes.Fire); // 失敗
}

[Test]
public void ApplyCard_TriggersExplosion_WhenStabilityBelowZero()
{
    var quest = new Quest { Progress = new QuestProgress { CurrentStability = 1 } };
    var card = new Card { Stability = -2 };

    quest.ApplyCard(card);

    Assert.IsTrue(quest.HasExploded()); // 失敗
}
```

#### Green
- Quest, QuestRequirements, QuestProgressを実装

#### Refactor
- 暴発ロジックの分離
- 達成判定の最適化

---

## TASK-0013: CardSystem実装

**タスクID**: TASK-0013
**タスク名**: CardSystem実装
**推定工数**: 12h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-025, REQ-036

### 依存タスク
- TASK-0010: Card クラス実装
- TASK-0004: ConfigDataLoader実装

### 実装詳細

設計文書 `02-core-systems.md` のCardSystem実装を参照 🔵

#### CardSystem クラス
```csharp
namespace Atelier.Domain
{
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
            return new Card { /* ... */ };
        }

        public void EvolveCard(Card card)
        {
            card.Level++;
            card.Attributes.Quality += 10;
            eventBus.Publish(new CardEvolvedEvent(card));
        }
    }
}
```

### 完了条件
- [ ] カードデータベースが読み込まれる 🔵
- [ ] GetCard()でカードを取得できる 🔵
- [ ] CreateCardInstance()でディープコピーされる 🔵
- [ ] EvolveCard()でカード進化が動作する (REQ-025) 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
- カードデータベース読み込みテスト
- カードインスタンス作成テスト
- カード進化テスト

#### Green
- CardSystemを実装
- ディープコピーロジックを実装

#### Refactor
- カードデータベースのキャッシング最適化

---

## TASK-0014: QuestSystem実装

**タスクID**: TASK-0014
**タスク名**: QuestSystem実装
**推定工数**: 8h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-029, REQ-032

### 依存タスク
- TASK-0012: Quest / QuestRequirements実装
- TASK-0004: ConfigDataLoader実装

### 実装詳細

設計文書 `02-core-systems.md` のQuestSystem実装を参照 🔵

#### QuestSystem クラス
```csharp
namespace Atelier.Domain
{
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

### 完了条件
- [ ] 同時に3件の依頼を管理できる (REQ-029) 🔵
- [ ] ランダムに依頼を生成できる 🔵
- [ ] 依頼完了処理が動作する 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void GenerateQuests_Creates3Quests()
{
    var system = new QuestSystem(new EventBus());

    system.GenerateQuests(1, new System.Random(123));

    Assert.AreEqual(3, system.GetActiveQuests().Count); // 失敗
}
```

#### Green
- QuestSystemを実装

#### Refactor
- 依頼生成ロジックの最適化

---

## Phase 2 完了条件

### 全体完了条件
- [ ] すべてのタスク(TASK-0008~0014)が完了している
- [ ] カードシステムの基本機能が動作する
- [ ] 依頼システムの基本機能が動作する
- [ ] すべてのユニットテストが通る
- [ ] TDDサイクル(Red-Green-Refactor)が適切に実施されている

### 次フェーズへの引き継ぎ事項
- Cardクラスがデッキシステムで使用可能
- Questクラスが戦闘シーンで使用可能
- CardEffectが拡張可能な設計になっている
- QuestSystemが依頼生成に使用可能

---

**信頼性レベル凡例**:
- 🔵 青信号: 設計文書から明確
- 🟡 黄信号: 設計文書から妥当な推測
- 🔴 赤信号: 設計文書にない推測
