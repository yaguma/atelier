# ゲームシステム

## マップシステム

### MapSystem (Domain Layer)

```csharp
namespace Atelier.Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using UnityEngine;
    using Atelier.Application;

    /// <summary>
    /// マップシステム
    /// </summary>
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

            // レベルごとにノードを生成
            for (int level = 0; level < levels; level++)
            {
                GenerateNodesForLevel(level);
            }

            // 最終ボスノードを追加
            AddBossNode(levels);

            // ノード間の接続を生成
            ConnectNodes();

            // 開始ノードを設定
            currentNode = nodes[0];
            currentNode.IsAvailable = true;

            eventBus.Publish(new MapGeneratedEvent(nodes));
        }

        private void GenerateNodesForLevel(int level)
        {
            int nodeCount = NodesPerLevel;

            for (int i = 0; i < nodeCount; i++)
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
            // レベルに応じてノードタイプの出現確率を調整
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

        private void AddBossNode(int level)
        {
            var bossNode = new MapNode
            {
                Id = System.Guid.NewGuid().ToString(),
                Type = NodeType.Boss,
                Level = level,
                Position = new Vector2Int(2, level)
            };

            nodes.Add(bossNode);
        }

        private void ConnectNodes()
        {
            // 最大レベルを事前に計算（最適化）
            int maxLevel = nodes.Max(n => n.Level);

            // 各ノードを次のレベルのノードと接続
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

            // 接続されたノードを利用可能にする
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

        public List<MapNode> GetAvailableNodes()
        {
            return nodes.Where(n => n.IsAvailable && !n.IsVisited).ToList();
        }

        public MapNode GetCurrentNode()
        {
            return currentNode;
        }

        public void RestoreMap(MapData data)
        {
            nodes = data.Nodes;
            currentNode = nodes.FirstOrDefault(n => n.Id == data.CurrentNodeId);
        }
    }
}
```

## メタ進行システム

### MetaProgressionData (Domain Layer)

```csharp
namespace Atelier.Domain
{
    using System.Collections.Generic;

    /// <summary>
    /// メタ進行データ
    /// </summary>
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

    /// <summary>
    /// メタ進行システム
    /// </summary>
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

        public void RestoreMetaData(MetaProgressionData savedData)
        {
            data = savedData;
        }
    }
}
```

## イベントバス

### EventBus (Application Layer)

```csharp
namespace Atelier.Application
{
    using System;
    using System.Collections.Generic;

    /// <summary>
    /// イベントバス - Pub/Subパターン
    /// </summary>
    public class EventBus
    {
        private Dictionary<Type, List<Delegate>> eventHandlers;

        public EventBus()
        {
            eventHandlers = new Dictionary<Type, List<Delegate>>();
        }

        public void Subscribe<T>(Action<T> handler) where T : GameEvent
        {
            var eventType = typeof(T);

            if (!eventHandlers.ContainsKey(eventType))
            {
                eventHandlers[eventType] = new List<Delegate>();
            }

            eventHandlers[eventType].Add(handler);
        }

        public void Unsubscribe<T>(Action<T> handler) where T : GameEvent
        {
            var eventType = typeof(T);

            if (eventHandlers.ContainsKey(eventType))
            {
                eventHandlers[eventType].Remove(handler);
            }
        }

        public void Publish<T>(T gameEvent) where T : GameEvent
        {
            var eventType = typeof(T);

            if (eventHandlers.ContainsKey(eventType))
            {
                foreach (var handler in eventHandlers[eventType])
                {
                    (handler as Action<T>)?.Invoke(gameEvent);
                }
            }
        }
    }

    /// <summary>
    /// ゲームイベントの基底クラス
    /// </summary>
    public abstract class GameEvent
    {
        public DateTime Timestamp { get; }

        protected GameEvent()
        {
            Timestamp = DateTime.Now;
        }
    }

    // イベントクラス例
    public class CardPlayedEvent : GameEvent
    {
        public ICard Card { get; }
        public int RemainingEnergy { get; }

        public CardPlayedEvent(ICard card, int remainingEnergy)
        {
            Card = card;
            RemainingEnergy = remainingEnergy;
        }
    }

    public class QuestCompletedEvent : GameEvent
    {
        public IQuest Quest { get; }

        public QuestCompletedEvent(IQuest quest)
        {
            Quest = quest;
        }
    }
}
```
