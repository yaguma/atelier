# インフラストラクチャ・システム設計

本ドキュメントは、Atelierプロジェクトの実装基盤となるインフラストラクチャ層、状態管理、パフォーマンス、セキュリティなどの設計仕様をまとめたものなのだ。

## カードエフェクト実装例

### 具体的なCardEffect実装

```csharp
namespace Atelier.Domain
{
    using Atelier.Core;

    /// <summary>
    /// 属性値を倍化するエフェクト
    /// </summary>
    public class MultiplyAttributeEffect : CardEffect
    {
        public string TargetAttribute { get; set; } // "fire", "water", etc.
        public float Multiplier { get; set; }

        public override void Apply(IQuest quest)
        {
            switch (TargetAttribute.ToLower())
            {
                case "fire":
                    quest.Progress.CurrentAttributes.Fire =
                        (int)(quest.Progress.CurrentAttributes.Fire * Multiplier);
                    break;
                case "water":
                    quest.Progress.CurrentAttributes.Water =
                        (int)(quest.Progress.CurrentAttributes.Water * Multiplier);
                    break;
                case "earth":
                    quest.Progress.CurrentAttributes.Earth =
                        (int)(quest.Progress.CurrentAttributes.Earth * Multiplier);
                    break;
                case "wind":
                    quest.Progress.CurrentAttributes.Wind =
                        (int)(quest.Progress.CurrentAttributes.Wind * Multiplier);
                    break;
            }
        }
    }

    /// <summary>
    /// カードをドローするエフェクト
    /// </summary>
    public class DrawCardEffect : CardEffect
    {
        public int DrawCount { get; set; }

        public override void Apply(IQuest quest)
        {
            var deckManager = GameManager.Instance.DeckManager;
            deckManager.DrawCards(DrawCount);
        }
    }

    /// <summary>
    /// 安定値を増加させるエフェクト
    /// </summary>
    public class StabilizeEffect : CardEffect
    {
        public int StabilityBonus { get; set; }

        public override void Apply(IQuest quest)
        {
            quest.Progress.CurrentStability += StabilityBonus;
        }
    }

    /// <summary>
    /// 全属性値を増加させるエフェクト
    /// </summary>
    public class BoostAllAttributesEffect : CardEffect
    {
        public int BoostAmount { get; set; }

        public override void Apply(IQuest quest)
        {
            quest.Progress.CurrentAttributes.Fire += BoostAmount;
            quest.Progress.CurrentAttributes.Water += BoostAmount;
            quest.Progress.CurrentAttributes.Earth += BoostAmount;
            quest.Progress.CurrentAttributes.Wind += BoostAmount;
        }
    }

    /// <summary>
    /// エネルギーを回復するエフェクト
    /// </summary>
    public class RestoreEnergyEffect : CardEffect
    {
        public int EnergyAmount { get; set; }

        public override void Apply(IQuest quest)
        {
            // DeckManagerのcurrentEnergyに直接アクセスできないため、
            // イベントを発行してUI側で処理
            var eventBus = GameManager.Instance.EventBus;
            eventBus.Publish(new EnergyRestoredEvent(EnergyAmount));
        }
    }

    public class EnergyRestoredEvent : GameEvent
    {
        public int Amount { get; }

        public EnergyRestoredEvent(int amount)
        {
            Amount = amount;
        }
    }
}
```

---

## 状態管理・イベントシステム

### ゲーム状態遷移

```csharp
namespace Atelier.Application
{
    public enum GameState
    {
        Boot,           // 起動中
        Title,          // タイトル画面
        StyleSelect,    // スタイル選択
        Map,            // マップ画面
        Quest,          // 依頼(戦闘)
        Merchant,       // 商人
        Experiment,     // 実験
        Monster,        // 魔物
        Result          // リザルト
    }

    public class GameStateManager
    {
        private GameState currentState;
        private Stack<GameState> stateHistory;

        public GameStateManager()
        {
            stateHistory = new Stack<GameState>();
            currentState = GameState.Boot;
        }

        public void TransitionTo(GameState newState)
        {
            stateHistory.Push(currentState);
            currentState = newState;

            OnStateEnter(newState);
        }

        public void TransitionBack()
        {
            if (stateHistory.Count > 0)
            {
                var previousState = stateHistory.Pop();
                currentState = previousState;
                OnStateEnter(previousState);
            }
        }

        private void OnStateEnter(GameState state)
        {
            // 状態ごとの初期化処理
            switch (state)
            {
                case GameState.Quest:
                    InitializeQuestState();
                    break;
                case GameState.Map:
                    InitializeMapState();
                    break;
                // ... 他の状態
            }
        }

        private void InitializeQuestState()
        {
            var questSystem = GameManager.Instance.QuestSystem;
            var mapNode = GameManager.Instance.MapSystem.GetCurrentNode();

            if (mapNode.Type == NodeType.Quest)
            {
                questSystem.GenerateQuests(mapNode.Level, new System.Random());
            }

            var deckManager = GameManager.Instance.DeckManager;
            deckManager.StartTurn();
        }

        private void InitializeMapState()
        {
            // マップの更新など
        }

        public GameState GetCurrentState()
        {
            return currentState;
        }
    }
}
```

---

## セーブデータ構造

### セーブデータクラス

```csharp
namespace Atelier.Infrastructure
{
    using System.Collections.Generic;
    using Atelier.Domain;

    /// <summary>
    /// セーブデータのルート構造
    /// </summary>
    [System.Serializable]
    public class SaveData
    {
        public int Version { get; set; }
        public string SaveDate { get; set; }
        public int SlotIndex { get; set; }

        public RunData CurrentRun { get; set; }
        public MetaProgressionData MetaData { get; set; }
        public SettingsData Settings { get; set; }

        public SaveData()
        {
            Version = 1;
            SaveDate = System.DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            CurrentRun = new RunData();
            MetaData = new MetaProgressionData();
            Settings = new SettingsData();
        }
    }

    /// <summary>
    /// 1プレイ分のデータ
    /// </summary>
    [System.Serializable]
    public class RunData
    {
        public string StyleId { get; set; }
        public int? Seed { get; set; }
        public int CurrentFloor { get; set; }
        public int Gold { get; set; }

        public DeckData DeckData { get; set; }
        public MapData MapData { get; set; }
        public List<string> AcquiredArtifacts { get; set; }

        public RunData()
        {
            DeckData = new DeckData();
            MapData = new MapData();
            AcquiredArtifacts = new List<string>();
        }
    }

    /// <summary>
    /// デッキデータ
    /// </summary>
    [System.Serializable]
    public class DeckData
    {
        public List<string> DrawPile { get; set; }
        public List<string> Hand { get; set; }
        public List<string> DiscardPile { get; set; }

        public DeckData()
        {
            DrawPile = new List<string>();
            Hand = new List<string>();
            DiscardPile = new List<string>();
        }
    }

    /// <summary>
    /// マップデータ
    /// </summary>
    [System.Serializable]
    public class MapData
    {
        public List<MapNode> Nodes { get; set; }
        public string CurrentNodeId { get; set; }

        public MapData()
        {
            Nodes = new List<MapNode>();
        }
    }

    /// <summary>
    /// 設定データ
    /// </summary>
    [System.Serializable]
    public class SettingsData
    {
        public float BgmVolume { get; set; }
        public float SeVolume { get; set; }
        public bool FullScreen { get; set; }

        public SettingsData()
        {
            BgmVolume = 0.7f;
            SeVolume = 0.8f;
            FullScreen = true;
        }
    }

    /// <summary>
    /// セーブデータリポジトリ
    /// </summary>
    public class SaveDataRepository : ISaveDataRepository
    {
        private const string SaveDirectory = "SaveData";
        private const string SaveFilePrefix = "save_slot_";
        private const string SaveFileExtension = ".json";

        public SaveData LoadSaveData(int slotIndex)
        {
            string filePath = GetSaveFilePath(slotIndex);

            if (!System.IO.File.Exists(filePath))
            {
                throw new System.IO.FileNotFoundException($"Save data not found: {filePath}");
            }

            try
            {
                string json = System.IO.File.ReadAllText(filePath);
                var saveData = UnityEngine.JsonUtility.FromJson<SaveData>(json);
                return saveData;
            }
            catch (System.Exception ex)
            {
                UnityEngine.Debug.LogError($"Failed to load save data: {ex.Message}");
                throw;
            }
        }

        public void SaveGameData(SaveData data, int slotIndex)
        {
            string directory = GetSaveDirectory();

            if (!System.IO.Directory.Exists(directory))
            {
                System.IO.Directory.CreateDirectory(directory);
            }

            string filePath = GetSaveFilePath(slotIndex);
            data.SlotIndex = slotIndex;
            data.SaveDate = System.DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

            try
            {
                string json = UnityEngine.JsonUtility.ToJson(data, true);
                System.IO.File.WriteAllText(filePath, json);
            }
            catch (System.Exception ex)
            {
                UnityEngine.Debug.LogError($"Failed to save game data: {ex.Message}");
                throw;
            }
        }

        public bool HasSaveData(int slotIndex)
        {
            string filePath = GetSaveFilePath(slotIndex);
            return System.IO.File.Exists(filePath);
        }

        public void DeleteSaveData(int slotIndex)
        {
            string filePath = GetSaveFilePath(slotIndex);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        private string GetSaveDirectory()
        {
            return System.IO.Path.Combine(UnityEngine.Application.persistentDataPath, SaveDirectory);
        }

        private string GetSaveFilePath(int slotIndex)
        {
            return System.IO.Path.Combine(GetSaveDirectory(), $"{SaveFilePrefix}{slotIndex}{SaveFileExtension}");
        }
    }
}
```

---

## パフォーマンス設計

### パフォーマンス目標

| 項目 | 目標値 | 測定方法 |
|------|--------|---------|
| 起動時間 | 5秒以内 | Unity Profiler |
| フレームレート | 60 FPS以上 | Unity Profiler |
| メモリ使用量 | 2GB以下 | Unity Profiler |
| CPU使用率 | 50%以下 | Unity Profiler |
| カード操作応答時間 | 100ms以内 | カスタム計測 |

### 最適化戦略

#### 1. オブジェクトプーリング

```csharp
namespace Atelier.Infrastructure
{
    using System.Collections.Generic;
    using UnityEngine;

    /// <summary>
    /// オブジェクトプール
    /// </summary>
    public class ObjectPool<T> where T : Component
    {
        private Queue<T> pool;
        private T prefab;
        private Transform parent;

        public ObjectPool(T prefab, int initialSize, Transform parent = null)
        {
            this.prefab = prefab;
            this.parent = parent;
            pool = new Queue<T>();

            for (int i = 0; i < initialSize; i++)
            {
                var obj = Object.Instantiate(prefab, parent);
                obj.gameObject.SetActive(false);
                pool.Enqueue(obj);
            }
        }

        public T Get()
        {
            if (pool.Count > 0)
            {
                var obj = pool.Dequeue();
                obj.gameObject.SetActive(true);
                return obj;
            }
            else
            {
                var obj = Object.Instantiate(prefab, parent);
                return obj;
            }
        }

        public void Return(T obj)
        {
            obj.gameObject.SetActive(false);
            pool.Enqueue(obj);
        }
    }
}
```

#### 2. 遅延読み込み

- カードデータはシーン遷移時に必要分のみ読み込む
- アセットはAddressablesを使用して動的ロード
- UIスプライトは表示時に読み込み、非表示時に解放

#### 3. バッチング

- UIは可能な限りスプライトアトラスにまとめる
- カードスプライトは1つのアトラスに統合
- Static Batching を有効化

---

## セキュリティ設計

### セキュリティ方針

要件定義により、以下の方針を採用するのだ:

- **セーブデータ暗号化**: 不要 (REQ-013, NFR-004)
- **チート対策**: 不要 (オフラインゲームのため)
- **データ整合性**: 最小限のバリデーション

### エラーハンドリング

```csharp
namespace Atelier.Infrastructure
{
    using System;
    using UnityEngine;

    /// <summary>
    /// エラーハンドラー
    /// </summary>
    public static class ErrorHandler
    {
        public static void HandleSaveError(Exception ex)
        {
            Debug.LogError($"Save Error: {ex.Message}");
            // ユーザーにエラーメッセージを表示
            ShowErrorDialog("セーブデータの保存に失敗しました。ディスク容量を確認してください。");
        }

        public static void HandleLoadError(Exception ex)
        {
            Debug.LogError($"Load Error: {ex.Message}");
            // セーブデータ破損時の処理
            ShowErrorDialog("セーブデータが破損しています。新規ゲームとして開始します。");
        }

        private static void ShowErrorDialog(string message)
        {
            // UIマネージャー経由でエラーダイアログを表示
            // (実装は省略)
        }
    }
}
```

---

## Vector2Int 定義

```csharp
namespace Atelier.Domain
{
    /// <summary>
    /// 2D整数ベクトル (Unity標準のVector2Intの代替)
    /// </summary>
    [System.Serializable]
    public struct Vector2Int
    {
        public int X { get; set; }
        public int Y { get; set; }

        public Vector2Int(int x, int y)
        {
            X = x;
            Y = y;
        }

        public static Vector2Int Zero => new Vector2Int(0, 0);

        public override string ToString()
        {
            return $"({X}, {Y})";
        }
    }
}
```

---

## ConfigDataLoader 実装

```csharp
namespace Atelier.Infrastructure
{
    using UnityEngine;
    using System.Collections.Generic;
    using Atelier.Domain;

    /// <summary>
    /// 設定データローダー
    /// </summary>
    public static class ConfigDataLoader
    {
        private const string ConfigPath = "Config/";

        public static CardConfig LoadCardConfig()
        {
            var jsonAsset = Resources.Load<TextAsset>($"{ConfigPath}card_config");
            if (jsonAsset == null)
            {
                Debug.LogError("Failed to load card_config.json");
                return new CardConfig();
            }

            return JsonUtility.FromJson<CardConfig>(jsonAsset.text);
        }

        public static QuestConfig LoadQuestConfig()
        {
            var jsonAsset = Resources.Load<TextAsset>($"{ConfigPath}quest_config");
            if (jsonAsset == null)
            {
                Debug.LogError("Failed to load quest_config.json");
                return new QuestConfig();
            }

            return JsonUtility.FromJson<QuestConfig>(jsonAsset.text);
        }

        public static AlchemyStyleConfig LoadAlchemyStyleConfig()
        {
            var jsonAsset = Resources.Load<TextAsset>($"{ConfigPath}alchemy_style_config");
            if (jsonAsset == null)
            {
                Debug.LogError("Failed to load alchemy_style_config.json");
                return new AlchemyStyleConfig();
            }

            return JsonUtility.FromJson<AlchemyStyleConfig>(jsonAsset.text);
        }
    }

    [System.Serializable]
    public class CardConfig
    {
        public List<Card> Cards;
    }

    [System.Serializable]
    public class QuestConfig
    {
        public List<Quest> Quests;
    }

    [System.Serializable]
    public class AlchemyStyleConfig
    {
        public List<AlchemyStyle> Styles;
    }

    [System.Serializable]
    public class AlchemyStyle
    {
        public string Id;
        public string Name;
        public string Description;
        public List<string> InitialCards;
        public int StartingGold;
        public string Sprite;
    }
}
```

---

このドキュメントは、Atelierプロジェクトの技術設計書から抽出されたインフラストラクチャ層の詳細仕様をまとめたものなのだ。実装時には本設計に従い、段階的に機能を構築していくのだ。
