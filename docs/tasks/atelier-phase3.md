# Phase 3: デッキ/マップ/メタ進行システムタスク

**期間**: Week 1-4 (10日間)
**総工数**: 80h
**タスク範囲**: TASK-0015 ~ TASK-0019
**タスクタイプ**: TDD中心

---

## TASK-0015: DeckManager実装

**タスクID**: TASK-0015
**タスク名**: DeckManager実装
**推定工数**: 20h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-024, REQ-026, REQ-026-1, REQ-026-2, REQ-026-3

### 依存タスク
- TASK-0008: コアインターフェース定義
- TASK-0010: Card クラス実装
- TASK-0005: RandomGenerator実装

### 実装詳細

設計文書 `02-core-systems.md` のDeckManager実装を参照 🔵

#### DeckManager クラス
```csharp
namespace Atelier.Domain
{
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
            currentEnergy = System.Math.Min(currentEnergy + EnergyPerTurn, MaxEnergy);
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
    }
}
```

### 完了条件
- [ ] 手札サイズが5枚である (REQ-026-1) 🔵
- [ ] ターン開始時にエネルギー+3される (REQ-024-1) 🔵
- [ ] エネルギー最大値が10である (REQ-024-2) 🔵
- [ ] 毎ターン手札が5枚になるようドローする (REQ-026-2) 🔵
- [ ] カード削除機能が動作する (REQ-026-3) 🔵
- [ ] シャッフル機能が正しく動作する 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void StartTurn_IncreasesEnergyBy3()
{
    var deck = new DeckManager(new EventBus());
    deck.currentEnergy = 0;

    deck.StartTurn();

    Assert.AreEqual(3, deck.currentEnergy); // 失敗
}

[Test]
public void DrawCards_DrawsFromDrawPile()
{
    var deck = new DeckManager(new EventBus());
    deck.DrawPile.Add(new Card());

    deck.DrawCards(1);

    Assert.AreEqual(1, deck.Hand.Count); // 失敗
    Assert.AreEqual(0, deck.DrawPile.Count);
}

[Test]
public void DrawCards_ShufflesDiscardPile_WhenDrawPileEmpty()
{
    var deck = new DeckManager(new EventBus(), seed: 123);
    deck.DiscardPile.Add(new Card { Id = "A" });
    deck.DiscardPile.Add(new Card { Id = "B" });

    deck.DrawCards(2);

    Assert.AreEqual(2, deck.Hand.Count); // 失敗
    Assert.AreEqual(0, deck.DiscardPile.Count);
}

[Test]
public void RemoveCardFromDeck_RemovesSpecifiedCard()
{
    var deck = new DeckManager(new EventBus());
    var card = new Card { Id = "test-card" };
    deck.DrawPile.Add(card);

    deck.RemoveCardFromDeck("test-card");

    Assert.AreEqual(0, deck.DrawPile.Count); // 失敗
}
```

#### Green
- DeckManagerを実装
- すべてのメソッドを実装

#### Refactor
- エネルギー管理の分離
- シャッフルアルゴリズムの最適化

---

## TASK-0016: MapSystem / MapNode実装

**タスクID**: TASK-0016
**タスク名**: MapSystem / MapNode実装
**推定工数**: 20h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-015, REQ-015-1, REQ-016

### 依存タスク
- TASK-0005: RandomGenerator実装

### 実装詳細

設計文書 `03-game-systems.md` のMapSystem実装を参照 🔵

#### MapNode クラス
```csharp
namespace Atelier.Domain
{
    [System.Serializable]
    public class MapNode
    {
        public string Id { get; set; }
        public NodeType Type { get; set; }
        public int Level { get; set; }
        public Vector2Int Position { get; set; }
        public List<string> ConnectedNodeIds { get; set; }
        public bool IsVisited { get; set; }
        public bool IsAvailable { get; set; }

        public MapNode()
        {
            ConnectedNodeIds = new List<string>();
            IsVisited = false;
            IsAvailable = false;
        }
    }

    public enum NodeType
    {
        Quest,      // 依頼ノード
        Merchant,   // 商人ノード
        Experiment, // 実験ノード
        Monster,    // 魔物ノード
        Boss        // ボスノード
    }
}
```

#### MapSystem クラス
```csharp
namespace Atelier.Domain
{
    public class MapSystem
    {
        private List<MapNode> nodes;
        private MapNode currentNode;
        private EventBus eventBus;
        private System.Random rng;

        private const int MinNodes = 30;
        private const int MaxNodes = 50;
        private const int NodesPerLevel = 5;

        public MapSystem(EventBus eventBus)
        {
            this.eventBus = eventBus;
            nodes = new List<MapNode>();
        }

        public void GenerateMap(int? seed = null)
        {
            rng = seed.HasValue ? new System.Random(seed.Value) : new System.Random();

            nodes.Clear();
            int totalNodes = rng.Next(MinNodes, MaxNodes + 1);
            int levels = totalNodes / NodesPerLevel;

            for (int level = 0; level < levels; level++)
            {
                GenerateNodesForLevel(level);
            }

            AddBossNode(levels);
            ConnectNodes();

            currentNode = nodes[0];
            currentNode.IsAvailable = true;

            eventBus.Publish(new MapGeneratedEvent(nodes));
        }

        private void GenerateNodesForLevel(int level)
        {
            for (int i = 0; i < NodesPerLevel; i++)
            {
                var node = new MapNode
                {
                    Id = System.Guid.NewGuid().ToString(),
                    Type = GetRandomNodeType(level),
                    Level = level,
                    Position = new Vector2Int(i, level)
                };
                nodes.Add(node);
            }
        }

        private NodeType GetRandomNodeType(int level)
        {
            int roll = rng.Next(100);

            if (roll < 50)
                return NodeType.Quest;
            else if (roll < 70)
                return NodeType.Merchant;
            else if (roll < 85)
                return NodeType.Experiment;
            else
                return NodeType.Monster;
        }

        public void MoveToNode(string nodeId)
        {
            var node = nodes.FirstOrDefault(n => n.Id == nodeId);

            if (node == null || !node.IsAvailable)
            {
                throw new System.InvalidOperationException("Node not available");
            }

            currentNode.IsVisited = true;
            currentNode = node;
            currentNode.IsVisited = true;

            foreach (var connectedId in currentNode.ConnectedNodeIds)
            {
                var connectedNode = nodes.FirstOrDefault(n => n.Id == connectedId);
                if (connectedNode != null)
                {
                    connectedNode.IsAvailable = true;
                }
            }

            eventBus.Publish(new NodeVisitedEvent(currentNode));
        }
    }
}
```

### 完了条件
- [ ] 30〜50個のノードが生成される (REQ-015-1) 🔵
- [ ] 5種類のノードタイプが存在する (REQ-016) 🔵
- [ ] ノード間の接続が正しく生成される 🔵
- [ ] シード値で再現可能 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void GenerateMap_CreatesNodesBetween30And50()
{
    var mapSystem = new MapSystem(new EventBus());

    mapSystem.GenerateMap(seed: 123);

    Assert.IsTrue(mapSystem.GetAllNodes().Count >= 30); // 失敗
    Assert.IsTrue(mapSystem.GetAllNodes().Count <= 50);
}

[Test]
public void GenerateMap_CreatesBossNodeAtEnd()
{
    var mapSystem = new MapSystem(new EventBus());

    mapSystem.GenerateMap(seed: 456);

    var bossNode = mapSystem.GetAllNodes().Find(n => n.Type == NodeType.Boss);
    Assert.IsNotNull(bossNode); // 失敗
}
```

#### Green
- MapSystemとMapNodeを実装

#### Refactor
- ノード生成ロジックの分離
- 接続アルゴリズムの最適化

---

## TASK-0017: MetaProgressionSystem実装

**タスクID**: TASK-0017
**タスク名**: MetaProgressionSystem実装
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-039, REQ-039-1, REQ-039-2, REQ-040, REQ-041

### 依存タスク
- なし

### 実装詳細

設計文書 `03-game-systems.md` のMetaProgressionSystem実装を参照 🔵

#### MetaProgressionData クラス
```csharp
namespace Atelier.Domain
{
    [System.Serializable]
    public class MetaProgressionData
    {
        public int Fame { get; set; }
        public int KnowledgePoints { get; set; }
        public int AscensionLevel { get; set; }
        public List<string> UnlockedCards { get; set; }
        public List<string> UnlockedMaterials { get; set; }
        public List<string> UnlockedCustomers { get; set; }
        public Dictionary<string, int> WorkshopLevels { get; set; }

        public MetaProgressionData()
        {
            Fame = 0;
            KnowledgePoints = 0;
            AscensionLevel = 0;
            UnlockedCards = new List<string>();
            UnlockedMaterials = new List<string>();
            UnlockedCustomers = new List<string>();
            WorkshopLevels = new Dictionary<string, int>();
        }
    }
}
```

#### MetaProgressionSystem クラス
```csharp
namespace Atelier.Domain
{
    public class MetaProgressionSystem
    {
        private MetaProgressionData data;
        private EventBus eventBus;

        public MetaProgressionSystem(EventBus eventBus)
        {
            this.eventBus = eventBus;
            data = new MetaProgressionData();
        }

        public void AddFame(int amount)
        {
            data.Fame += amount;
            eventBus.Publish(new FameGainedEvent(amount, data.Fame));
        }

        public void AddKnowledgePoints(int amount)
        {
            data.KnowledgePoints += amount;
            eventBus.Publish(new KnowledgeGainedEvent(amount, data.KnowledgePoints));
        }

        public bool UnlockCard(string cardId, int cost)
        {
            if (data.KnowledgePoints >= cost && !data.UnlockedCards.Contains(cardId))
            {
                data.KnowledgePoints -= cost;
                data.UnlockedCards.Add(cardId);
                eventBus.Publish(new CardUnlockedEvent(cardId));
                return true;
            }
            return false;
        }

        public void IncreaseAscensionLevel()
        {
            data.AscensionLevel++;
            eventBus.Publish(new AscensionLevelIncreasedEvent(data.AscensionLevel));
        }

        public MetaProgressionData GetData()
        {
            return data;
        }
    }
}
```

### 完了条件
- [ ] 名声と知識ポイントを管理できる (REQ-039) 🔵
- [ ] 依頼達成時に名声を獲得できる (REQ-039-1) 🟡
- [ ] クリア時に知識ポイントを獲得できる (REQ-039-2) 🟡
- [ ] カード/素材のアンロックができる (REQ-040) 🔵
- [ ] アセンションレベルを管理できる (REQ-041) 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void AddFame_IncreasesFame()
{
    var system = new MetaProgressionSystem(new EventBus());

    system.AddFame(10);

    Assert.AreEqual(10, system.GetData().Fame); // 失敗
}

[Test]
public void UnlockCard_DeductsKnowledgePoints()
{
    var system = new MetaProgressionSystem(new EventBus());
    system.AddKnowledgePoints(100);

    bool result = system.UnlockCard("card-001", 50);

    Assert.IsTrue(result); // 失敗
    Assert.AreEqual(50, system.GetData().KnowledgePoints);
}
```

#### Green
- MetaProgressionSystemを実装

#### Refactor
- アンロック処理の共通化

---

## TASK-0018: マップ生成アルゴリズム実装

**タスクID**: TASK-0018
**タスク名**: マップ生成アルゴリズム実装
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-015

### 依存タスク
- TASK-0016: MapSystem / MapNode実装

### 実装詳細

設計文書 `03-game-systems.md` のマップ生成アルゴリズムを参照 🔵

#### ノード接続アルゴリズム
```csharp
private void ConnectNodes()
{
    int maxLevel = nodes.Max(n => n.Level);

    for (int level = 0; level < maxLevel; level++)
    {
        var currentLevelNodes = nodes.Where(n => n.Level == level).ToList();
        var nextLevelNodes = nodes.Where(n => n.Level == level + 1).ToList();

        foreach (var node in currentLevelNodes)
        {
            // 2〜3個の次ノードに接続
            int connectionCount = rng.Next(2, 4);
            var shuffled = nextLevelNodes.OrderBy(x => rng.Next()).ToList();

            for (int i = 0; i < System.Math.Min(connectionCount, shuffled.Count); i++)
            {
                node.ConnectedNodeIds.Add(shuffled[i].Id);
            }
        }
    }
}
```

#### ノードタイプ出現率調整
```csharp
private NodeType GetRandomNodeType(int level)
{
    int roll = rng.Next(100);

    // レベルに応じて出現率を調整
    if (roll < 50)
        return NodeType.Quest;
    else if (roll < 70)
        return NodeType.Merchant;
    else if (roll < 85)
        return NodeType.Experiment;
    else
        return NodeType.Monster;
}
```

### 完了条件
- [ ] 各ノードが2〜3個の次ノードに接続される 🔵
- [ ] レベルに応じてノードタイプの出現率が調整される 🟡
- [ ] すべてのノードが到達可能である 🟡
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void ConnectNodes_AllNodesAreReachable()
{
    var mapSystem = new MapSystem(new EventBus());
    mapSystem.GenerateMap(seed: 789);

    // 全ノードが到達可能かチェック
    bool allReachable = CheckAllNodesReachable(mapSystem);
    Assert.IsTrue(allReachable); // 失敗
}
```

#### Green
- 接続アルゴリズムを実装

#### Refactor
- 到達可能性チェックの最適化

---

## TASK-0019: シード値管理とRNG統合

**タスクID**: TASK-0019
**タスク名**: シード値管理とRNG統合
**推定工数**: 8h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-042

### 依存タスク
- TASK-0005: RandomGenerator実装
- TASK-0015: DeckManager実装
- TASK-0016: MapSystem / MapNode実装

### 実装詳細

#### シード値の一元管理
```csharp
namespace Atelier.Application
{
    public class GameManager
    {
        private int? currentSeed;
        private System.Random masterRng;

        public void StartNewGame(AlchemyStyle style, int? seed = null)
        {
            currentSeed = seed ?? GenerateRandomSeed();
            masterRng = new System.Random(currentSeed.Value);

            // マップ生成
            MapSystem.GenerateMap(currentSeed);

            // デッキ初期化（同じシードを使用）
            DeckManager.InitializeDeck(style.InitialCards);
        }

        private int GenerateRandomSeed()
        {
            return System.DateTime.Now.Ticks.GetHashCode();
        }

        public int? GetCurrentSeed()
        {
            return currentSeed;
        }
    }
}
```

### 完了条件
- [ ] シード値入力で同じマップが生成される 🔵
- [ ] シード値入力で同じデッキシャッフルになる 🔵
- [ ] シード値を取得できる (REQ-042) 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void StartNewGame_WithSameSeed_GeneratesSameMap()
{
    var gm1 = new GameManager();
    var gm2 = new GameManager();

    gm1.StartNewGame(style, seed: 12345);
    var map1 = gm1.MapSystem.GetAllNodes();

    gm2.StartNewGame(style, seed: 12345);
    var map2 = gm2.MapSystem.GetAllNodes();

    Assert.AreEqual(map1.Count, map2.Count); // 失敗
}
```

#### Green
- シード値管理を実装

#### Refactor
- RNG管理の一元化

---

## Phase 3 完了条件

### 全体完了条件
- [ ] すべてのタスク(TASK-0015~0019)が完了している
- [ ] デッキ管理システムが動作する
- [ ] マップ生成システムが動作する
- [ ] メタ進行システムが動作する
- [ ] シード値による再現性が確保される
- [ ] すべてのユニットテストが通る

### 次フェーズへの引き継ぎ事項
- DeckManagerがゲームプレイで使用可能
- MapSystemが進行管理で使用可能
- MetaProgressionSystemがクリア報酬で使用可能
- シード値管理が統合されている

---

**信頼性レベル凡例**:
- 🔵 青信号: 設計文書から明確
- 🟡 黄信号: 設計文書から妥当な推測
- 🔴 赤信号: 設計文書にない推測
