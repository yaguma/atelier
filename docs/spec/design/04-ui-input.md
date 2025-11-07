# UI入力・アンドゥ機能

## 入力システム

### InputManager (Application Layer)

```csharp
namespace Atelier.Application
{
    using UnityEngine;
    using System;
    using System.Collections.Generic;

    /// <summary>
    /// 入力管理システム - マウス・キーボード対応 (REQ-005)
    /// </summary>
    public class InputManager : MonoBehaviour
    {
        public static InputManager Instance { get; private set; }

        // キーバインド設定
        private Dictionary<string, KeyCode> keyBindings;

        // イベント
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
                { "Undo", KeyCode.Z }, // Ctrl+Z で検出
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
            if (Input.GetMouseButtonDown(0)) // 左クリック
            {
                Vector2 mousePos = Input.mousePosition;
                OnMouseClick?.Invoke(mousePos);
            }
        }

        private void HandleKeyboardInput()
        {
            // Escapeキー
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                OnEscapePress?.Invoke();
            }

            // Undo (Ctrl+Z)
            if ((Input.GetKey(KeyCode.LeftControl) || Input.GetKey(KeyCode.RightControl)) &&
                Input.GetKeyDown(KeyCode.Z))
            {
                OnUndoRequest?.Invoke();
            }

            // その他のキーバインド
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

## UIアンドゥ機能

### CommandManager (Application Layer) - REQ-047-1

```csharp
namespace Atelier.Application
{
    using System.Collections.Generic;
    using Atelier.Core;

    /// <summary>
    /// Commandパターンによるアンドゥ機能実装
    /// </summary>
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
            redoStack.Clear(); // 新しいコマンド実行でredoスタックをクリア

            // 履歴サイズ制限
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

    /// <summary>
    /// コマンドインターフェース
    /// </summary>
    public interface ICommand
    {
        void Execute();
        void Undo();
    }

    /// <summary>
    /// カードプレイコマンド
    /// </summary>
    public class PlayCardCommand : ICommand
    {
        private readonly ICard card;
        private readonly IQuest targetQuest;
        private readonly DeckManager deckManager;

        // 状態保存用
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
            // 現在の状態を保存
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

            // カードをプレイ
            deckManager.PlayCard(card);
            card.Play(targetQuest);
        }

        public void Undo()
        {
            // 状態を復元
            targetQuest.Progress.CurrentAttributes = previousAttributes;
            targetQuest.Progress.CurrentStability = previousStability;

            // カードを手札に戻す（捨て札から手札へ）
            deckManager.DiscardPile.Remove(card);
            deckManager.Hand.Add(card);
        }
    }
}
```
