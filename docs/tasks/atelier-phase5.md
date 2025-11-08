# Phase 5: アプリケーション層タスク

**期間**: Week 1-3 (9日間)
**総工数**: 72h
**タスク範囲**: TASK-0024 ~ TASK-0028
**タスクタイプ**: TDD中心

---

## TASK-0024: EventBus実装

**タスクID**: TASK-0024
**タスク名**: EventBus実装
**推定工数**: 12h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: なし（アーキテクチャ要件）

### 依存タスク
- TASK-0002: フォルダ構造作成

### 実装詳細

設計文書 `03-game-systems.md` のEventBus実装を参照 🔵

#### EventBus クラス
```csharp
namespace Atelier.Application
{
    using System;
    using System.Collections.Generic;

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

    public abstract class GameEvent
    {
        public DateTime Timestamp { get; }

        protected GameEvent()
        {
            Timestamp = DateTime.Now;
        }
    }
}
```

#### 主要なイベントクラス
```csharp
// カード関連イベント
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

public class CardDrawnEvent : GameEvent
{
    public ICard Card { get; }

    public CardDrawnEvent(ICard card)
    {
        Card = card;
    }
}

// 依頼関連イベント
public class QuestCompletedEvent : GameEvent
{
    public IQuest Quest { get; }

    public QuestCompletedEvent(IQuest quest)
    {
        Quest = quest;
    }
}

// マップ関連イベント
public class MapGeneratedEvent : GameEvent
{
    public List<MapNode> Nodes { get; }

    public MapGeneratedEvent(List<MapNode> nodes)
    {
        Nodes = nodes;
    }
}
```

### 完了条件
- [ ] Subscribe/Unsubscribe/Publishが動作する 🔵
- [ ] イベントが正しくハンドラに配信される 🔵
- [ ] 複数のハンドラに配信できる 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void Publish_CallsSubscribedHandler()
{
    var eventBus = new EventBus();
    bool handlerCalled = false;

    eventBus.Subscribe<TestEvent>(e => handlerCalled = true);
    eventBus.Publish(new TestEvent());

    Assert.IsTrue(handlerCalled); // 失敗
}

[Test]
public void Unsubscribe_RemovesHandler()
{
    var eventBus = new EventBus();
    bool handlerCalled = false;
    Action<TestEvent> handler = e => handlerCalled = true;

    eventBus.Subscribe(handler);
    eventBus.Unsubscribe(handler);
    eventBus.Publish(new TestEvent());

    Assert.IsFalse(handlerCalled); // 失敗
}
```

#### Green
- EventBusを実装

#### Refactor
- パフォーマンス最適化
- メモリリークの防止

---

## TASK-0025: GameStateManager実装

**タスクID**: TASK-0025
**タスク名**: GameStateManager実装
**推定工数**: 16h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: なし（アーキテクチャ要件）

### 依存タスク
- TASK-0024: EventBus実装

### 実装詳細

設計文書 `08-infrastructure.md` のGameStateManager実装を参照 🔵

#### GameState 列挙型
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
}
```

#### GameStateManager クラス
```csharp
namespace Atelier.Application
{
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

### 完了条件
- [ ] 状態遷移が正しく動作する 🔵
- [ ] 状態履歴が管理される 🔵
- [ ] 状態に応じた初期化処理が実行される 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void TransitionTo_ChangesCurrentState()
{
    var stateManager = new GameStateManager();

    stateManager.TransitionTo(GameState.Title);

    Assert.AreEqual(GameState.Title, stateManager.GetCurrentState()); // 失敗
}

[Test]
public void TransitionBack_RestoresPreviousState()
{
    var stateManager = new GameStateManager();
    stateManager.TransitionTo(GameState.Title);
    stateManager.TransitionTo(GameState.Map);

    stateManager.TransitionBack();

    Assert.AreEqual(GameState.Title, stateManager.GetCurrentState()); // 失敗
}
```

#### Green
- GameStateManagerを実装

#### Refactor
- 状態遷移ロジックの最適化

---

## TASK-0026: GameManager実装

**タスクID**: TASK-0026
**タスク名**: GameManager実装
**推定工数**: 20h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-012

### 依存タスク
- TASK-0024: EventBus実装
- TASK-0025: GameStateManager実装
- TASK-0013: CardSystem実装
- TASK-0014: QuestSystem実装
- TASK-0015: DeckManager実装
- TASK-0016: MapSystem実装
- TASK-0017: MetaProgressionSystem実装

### 実装詳細

設計文書 `02-core-systems.md` のGameManager実装を参照 🔵

#### GameManager クラス
```csharp
namespace Atelier.Application
{
    using Atelier.Core;
    using Atelier.Domain;
    using UnityEngine;

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
            MapSystem.GenerateMap(seed);
            DeckManager.InitializeDeck(style.InitialCards);
            StateManager.TransitionTo(GameState.Map);
        }

        public void LoadGame(int slotIndex)
        {
            var saveRepo = new SaveDataRepository();
            var saveData = saveRepo.LoadSaveData(slotIndex);
            RestoreGameState(saveData);
        }

        private void RestoreGameState(SaveData data)
        {
            DeckManager.RestoreDeck(data.CurrentRun.DeckData);
            MapSystem.RestoreMap(data.CurrentRun.MapData);
            MetaSystem.RestoreMetaData(data.MetaData);
        }

        public void SaveGame(int slotIndex)
        {
            var saveData = new SaveData
            {
                CurrentRun = new RunData
                {
                    DeckData = CreateDeckData(),
                    MapData = CreateMapData()
                },
                MetaData = MetaSystem.GetData()
            };

            var saveRepo = new SaveDataRepository();
            saveRepo.SaveGameData(saveData, slotIndex);
        }

        private DeckData CreateDeckData()
        {
            return new DeckData
            {
                DrawPile = DeckManager.DrawPile.Select(c => c.Id).ToList(),
                Hand = DeckManager.Hand.Select(c => c.Id).ToList(),
                DiscardPile = DeckManager.DiscardPile.Select(c => c.Id).ToList()
            };
        }

        private MapData CreateMapData()
        {
            return new MapData
            {
                Nodes = MapSystem.GetAllNodes(),
                CurrentNodeId = MapSystem.GetCurrentNode().Id
            };
        }
    }
}
```

### 完了条件
- [ ] シングルトンパターンが実装されている 🔵
- [ ] 各システムが正しく初期化される 🔵
- [ ] 新規ゲーム開始が動作する 🔵
- [ ] セーブ/ロードが動作する (REQ-012) 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void Awake_CreatesInstance()
{
    var go = new GameObject();
    var gm = go.AddComponent<GameManager>();

    Assert.IsNotNull(GameManager.Instance); // 失敗
}

[Test]
public void StartNewGame_InitializesSystems()
{
    var go = new GameObject();
    var gm = go.AddComponent<GameManager>();
    var style = new AlchemyStyle { /* ... */ };

    gm.StartNewGame(style, seed: 123);

    Assert.IsNotNull(gm.MapSystem); // 失敗
    Assert.IsNotNull(gm.DeckManager);
}
```

#### Green
- GameManagerを実装

#### Refactor
- 初期化順序の最適化
- 依存関係の整理

---

## TASK-0027: InputManager実装

**タスクID**: TASK-0027
**タスク名**: InputManager実装
**推定工数**: 12h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-005

### 依存タスク
- TASK-0002: フォルダ構造作成

### 実装詳細

設計文書 `04-ui-input.md` のInputManager実装を参照 🔵

#### InputManager クラス
```csharp
namespace Atelier.Application
{
    using UnityEngine;
    using System;
    using System.Collections.Generic;

    public class InputManager : MonoBehaviour
    {
        public static InputManager Instance { get; private set; }

        private Dictionary<string, KeyCode> keyBindings;

        public event Action<Vector2> OnMouseClick;
        public event Action<KeyCode> OnKeyPress;
        public event Action OnEscapePress;
        public event Action OnUndoRequest; // Ctrl+Z

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeKeyBindings();
        }

        private void InitializeKeyBindings()
        {
            keyBindings = new Dictionary<string, KeyCode>
            {
                { "Confirm", KeyCode.Return },
                { "Cancel", KeyCode.Escape },
                { "Undo", KeyCode.Z },
                { "CardSlot1", KeyCode.Alpha1 },
                { "CardSlot2", KeyCode.Alpha2 },
                { "CardSlot3", KeyCode.Alpha3 },
                { "CardSlot4", KeyCode.Alpha4 },
                { "CardSlot5", KeyCode.Alpha5 },
                { "NextQuest", KeyCode.Tab },
                { "EndTurn", KeyCode.Space }
            };
        }

        private void Update()
        {
            HandleMouseInput();
            HandleKeyboardInput();
        }

        private void HandleMouseInput()
        {
            if (Input.GetMouseButtonDown(0))
            {
                Vector2 mousePos = Input.mousePosition;
                OnMouseClick?.Invoke(mousePos);
            }
        }

        private void HandleKeyboardInput()
        {
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                OnEscapePress?.Invoke();
            }

            if ((Input.GetKey(KeyCode.LeftControl) || Input.GetKey(KeyCode.RightControl)) &&
                Input.GetKeyDown(KeyCode.Z))
            {
                OnUndoRequest?.Invoke();
            }

            foreach (var binding in keyBindings)
            {
                if (Input.GetKeyDown(binding.Value))
                {
                    OnKeyPress?.Invoke(binding.Value);
                }
            }
        }

        public bool IsKeyDown(string actionName)
        {
            if (keyBindings.TryGetValue(actionName, out KeyCode key))
            {
                return Input.GetKeyDown(key);
            }
            return false;
        }

        public void RebindKey(string actionName, KeyCode newKey)
        {
            if (keyBindings.ContainsKey(actionName))
            {
                keyBindings[actionName] = newKey;
            }
        }
    }
}
```

### 完了条件
- [ ] マウス入力が検出される (REQ-005) 🔵
- [ ] キーボード入力が検出される (REQ-005) 🔵
- [ ] キーバインドが設定できる 🔵
- [ ] Ctrl+Zでアンドゥイベントが発行される 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void OnMouseClick_FiresEvent_WhenMouseClicked()
{
    var go = new GameObject();
    var inputManager = go.AddComponent<InputManager>();
    bool eventFired = false;

    inputManager.OnMouseClick += (pos) => eventFired = true;

    // マウスクリックをシミュレート
    // （Unityの入力テストは困難なため、手動テストも必要）

    Assert.IsTrue(eventFired); // 失敗
}
```

#### Green
- InputManagerを実装

#### Refactor
- 入力処理の最適化

---

## TASK-0028: CommandManager (アンドゥ機能)実装

**タスクID**: TASK-0028
**タスク名**: CommandManager (アンドゥ機能)実装
**推定工数**: 12h
**タスクタイプ**: TDD
**要件名**: atelier
**要件リンク**: REQ-047-1

### 依存タスク
- TASK-0010: Card クラス実装
- TASK-0012: Quest / QuestRequirements実装

### 実装詳細

設計文書 `04-ui-input.md` のCommandManager実装を参照 🔵

#### CommandManager クラス
```csharp
namespace Atelier.Application
{
    using System.Collections.Generic;
    using Atelier.Core;

    public class CommandManager
    {
        private Stack<ICommand> undoStack;
        private Stack<ICommand> redoStack;
        private const int MaxHistorySize = 50;

        public bool CanUndo => undoStack.Count > 0;
        public bool CanRedo => redoStack.Count > 0;

        public CommandManager()
        {
            undoStack = new Stack<ICommand>();
            redoStack = new Stack<ICommand>();
        }

        public void ExecuteCommand(ICommand command)
        {
            command.Execute();
            undoStack.Push(command);
            redoStack.Clear();

            if (undoStack.Count > MaxHistorySize)
            {
                var stack = new Stack<ICommand>(MaxHistorySize);
                for (int i = 0; i < MaxHistorySize; i++)
                {
                    stack.Push(undoStack.Pop());
                }
                undoStack = new Stack<ICommand>(stack);
            }
        }

        public void Undo()
        {
            if (CanUndo)
            {
                var command = undoStack.Pop();
                command.Undo();
                redoStack.Push(command);
            }
        }

        public void Redo()
        {
            if (CanRedo)
            {
                var command = redoStack.Pop();
                command.Execute();
                undoStack.Push(command);
            }
        }

        public void Clear()
        {
            undoStack.Clear();
            redoStack.Clear();
        }
    }

    public interface ICommand
    {
        void Execute();
        void Undo();
    }
}
```

#### PlayCardCommand クラス
```csharp
public class PlayCardCommand : ICommand
{
    private readonly ICard card;
    private readonly IQuest targetQuest;
    private readonly DeckManager deckManager;

    private CardAttributes previousAttributes;
    private int previousStability;

    public PlayCardCommand(ICard card, IQuest targetQuest, DeckManager deckManager)
    {
        this.card = card;
        this.targetQuest = targetQuest;
        this.deckManager = deckManager;
    }

    public void Execute()
    {
        previousAttributes = new CardAttributes
        {
            Fire = targetQuest.Progress.CurrentAttributes.Fire,
            Water = targetQuest.Progress.CurrentAttributes.Water,
            Earth = targetQuest.Progress.CurrentAttributes.Earth,
            Wind = targetQuest.Progress.CurrentAttributes.Wind,
            Poison = targetQuest.Progress.CurrentAttributes.Poison,
            Quality = targetQuest.Progress.CurrentAttributes.Quality
        };
        previousStability = targetQuest.Progress.CurrentStability;

        deckManager.PlayCard(card);
        card.Play(targetQuest);
    }

    public void Undo()
    {
        targetQuest.Progress.CurrentAttributes = previousAttributes;
        targetQuest.Progress.CurrentStability = previousStability;

        deckManager.DiscardPile.Remove(card);
        deckManager.Hand.Add(card);
    }
}
```

### 完了条件
- [ ] Undo/Redoが動作する (REQ-047-1) 🔵
- [ ] PlayCardCommandが実装されている 🔵
- [ ] 履歴サイズが制限されている 🔵
- [ ] すべてのテストが通る 🔵

### テスト要件（TDDタスク）
#### Red
```csharp
[Test]
public void ExecuteCommand_AddsToUndoStack()
{
    var cmdManager = new CommandManager();
    var cmd = new MockCommand();

    cmdManager.ExecuteCommand(cmd);

    Assert.IsTrue(cmdManager.CanUndo); // 失敗
}

[Test]
public void Undo_RevertsCommand()
{
    var cmdManager = new CommandManager();
    var cmd = new MockCommand();
    cmdManager.ExecuteCommand(cmd);

    cmdManager.Undo();

    Assert.IsTrue(cmd.WasUndone); // 失敗
    Assert.IsTrue(cmdManager.CanRedo);
}
```

#### Green
- CommandManagerを実装
- PlayCardCommandを実装

#### Refactor
- コマンドパターンの最適化

---

## Phase 5 完了条件

### 全体完了条件
- [ ] すべてのタスク(TASK-0024~0028)が完了している
- [ ] EventBusが動作する
- [ ] ゲーム状態管理が動作する
- [ ] GameManagerが正しく初期化される
- [ ] 入力管理が動作する
- [ ] アンドゥ機能が動作する
- [ ] すべてのユニットテストが通る

### 次フェーズへの引き継ぎ事項
- EventBusが全システムで使用可能
- GameManagerがシーン間で使用可能
- InputManagerがUI操作で使用可能
- CommandManagerがカードプレイで使用可能

---

**信頼性レベル凡例**:
- 🔵 青信号: 設計文書から明確
- 🟡 黄信号: 設計文書から妥当な推測
- 🔴 赤信号: 設計文書にない推測
