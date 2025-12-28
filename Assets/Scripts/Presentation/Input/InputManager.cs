using System;
using System.Collections.Generic;
using UnityEngine;

namespace Atelier.Presentation.Input
{
    /// <summary>
    /// 入力管理の実装クラス。
    /// キーボード入力を監視し、イベントを発火する。
    /// </summary>
    public class InputManager : MonoBehaviour, IInputManager
    {
        private static InputManager _instance;

        /// <summary>シングルトンインスタンス</summary>
        public static InputManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    var go = new GameObject("InputManager");
                    _instance = go.AddComponent<InputManager>();
                    _instance.Initialize();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        /// <inheritdoc/>
        public event Action OnConfirm;

        /// <inheritdoc/>
        public event Action OnCancel;

        /// <inheritdoc/>
        public event Action OnUndo;

        /// <inheritdoc/>
        public event Action<int> OnCardSlotSelected;

        /// <inheritdoc/>
        public event Action OnEndTurn;

        /// <inheritdoc/>
        public event Action OnMoveUp;

        /// <inheritdoc/>
        public event Action OnMoveDown;

        /// <inheritdoc/>
        public event Action OnMoveLeft;

        /// <inheritdoc/>
        public event Action OnMoveRight;

        /// <inheritdoc/>
        public bool IsInputEnabled { get; private set; } = true;

        // デフォルトキーバインド
        private Dictionary<InputAction, KeyCode> _keyBindings;
        private Dictionary<string, InputAction> _actionNameMap;

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            DontDestroyOnLoad(gameObject);
            Initialize();
        }

        private void Initialize()
        {
            // デフォルトキーバインドの設定
            _keyBindings = new Dictionary<InputAction, KeyCode>
            {
                { InputAction.Confirm, KeyCode.Return },
                { InputAction.Cancel, KeyCode.Escape },
                { InputAction.Undo, KeyCode.Z },
                { InputAction.EndTurn, KeyCode.Space },
                { InputAction.CardSlot1, KeyCode.Alpha1 },
                { InputAction.CardSlot2, KeyCode.Alpha2 },
                { InputAction.CardSlot3, KeyCode.Alpha3 },
                { InputAction.CardSlot4, KeyCode.Alpha4 },
                { InputAction.CardSlot5, KeyCode.Alpha5 },
                { InputAction.MoveUp, KeyCode.UpArrow },
                { InputAction.MoveDown, KeyCode.DownArrow },
                { InputAction.MoveLeft, KeyCode.LeftArrow },
                { InputAction.MoveRight, KeyCode.RightArrow }
            };

            // アクション名マッピング
            _actionNameMap = new Dictionary<string, InputAction>
            {
                { "Confirm", InputAction.Confirm },
                { "Cancel", InputAction.Cancel },
                { "Undo", InputAction.Undo },
                { "EndTurn", InputAction.EndTurn },
                { "CardSlot1", InputAction.CardSlot1 },
                { "CardSlot2", InputAction.CardSlot2 },
                { "CardSlot3", InputAction.CardSlot3 },
                { "CardSlot4", InputAction.CardSlot4 },
                { "CardSlot5", InputAction.CardSlot5 },
                { "MoveUp", InputAction.MoveUp },
                { "MoveDown", InputAction.MoveDown },
                { "MoveLeft", InputAction.MoveLeft },
                { "MoveRight", InputAction.MoveRight }
            };
        }

        private void Update()
        {
            if (!IsInputEnabled) return;

            ProcessInput();
        }

        private void ProcessInput()
        {
            // 修飾キーの状態を確認
            var ctrlHeld = UnityEngine.Input.GetKey(KeyCode.LeftControl) || UnityEngine.Input.GetKey(KeyCode.RightControl);

            // Undo（Ctrl+Z）
            if (ctrlHeld && UnityEngine.Input.GetKeyDown(_keyBindings[InputAction.Undo]))
            {
                OnUndo?.Invoke();
                return;
            }

            // 決定
            if (UnityEngine.Input.GetKeyDown(_keyBindings[InputAction.Confirm]))
            {
                OnConfirm?.Invoke();
                return;
            }

            // キャンセル
            if (UnityEngine.Input.GetKeyDown(_keyBindings[InputAction.Cancel]))
            {
                OnCancel?.Invoke();
                return;
            }

            // ターン終了
            if (UnityEngine.Input.GetKeyDown(_keyBindings[InputAction.EndTurn]))
            {
                OnEndTurn?.Invoke();
                return;
            }

            // カードスロット選択
            for (int i = 1; i <= 5; i++)
            {
                var action = (InputAction)((int)InputAction.CardSlot1 + i - 1);
                if (UnityEngine.Input.GetKeyDown(_keyBindings[action]))
                {
                    OnCardSlotSelected?.Invoke(i);
                    return;
                }
            }

            // 方向キー
            if (UnityEngine.Input.GetKeyDown(_keyBindings[InputAction.MoveUp]))
            {
                OnMoveUp?.Invoke();
            }
            if (UnityEngine.Input.GetKeyDown(_keyBindings[InputAction.MoveDown]))
            {
                OnMoveDown?.Invoke();
            }
            if (UnityEngine.Input.GetKeyDown(_keyBindings[InputAction.MoveLeft]))
            {
                OnMoveLeft?.Invoke();
            }
            if (UnityEngine.Input.GetKeyDown(_keyBindings[InputAction.MoveRight]))
            {
                OnMoveRight?.Invoke();
            }
        }

        /// <inheritdoc/>
        public bool IsKeyDown(string actionName)
        {
            if (!IsInputEnabled) return false;

            if (_actionNameMap.TryGetValue(actionName, out var action))
            {
                if (_keyBindings.TryGetValue(action, out var keyCode))
                {
                    // Undoの場合はCtrlも確認
                    if (action == InputAction.Undo)
                    {
                        var ctrlHeld = UnityEngine.Input.GetKey(KeyCode.LeftControl) || UnityEngine.Input.GetKey(KeyCode.RightControl);
                        return ctrlHeld && UnityEngine.Input.GetKeyDown(keyCode);
                    }
                    return UnityEngine.Input.GetKeyDown(keyCode);
                }
            }

            Debug.LogWarning($"[InputManager] Unknown action: {actionName}");
            return false;
        }

        /// <inheritdoc/>
        public void RebindKey(string actionName, KeyCode newKey)
        {
            if (_actionNameMap.TryGetValue(actionName, out var action))
            {
                _keyBindings[action] = newKey;
                Debug.Log($"[InputManager] Rebound {actionName} to {newKey}");
            }
            else
            {
                Debug.LogWarning($"[InputManager] Unknown action for rebind: {actionName}");
            }
        }

        /// <inheritdoc/>
        public void SetInputEnabled(bool enabled)
        {
            IsInputEnabled = enabled;
            Debug.Log($"[InputManager] Input enabled: {enabled}");
        }

        /// <summary>
        /// 現在のキーバインドを取得する。
        /// </summary>
        /// <param name="action">アクション</param>
        /// <returns>バインドされているキー</returns>
        public KeyCode GetKeyBinding(InputAction action)
        {
            return _keyBindings.TryGetValue(action, out var keyCode) ? keyCode : KeyCode.None;
        }

#if UNITY_EDITOR
        /// <summary>
        /// テスト用にインスタンスをリセットする。
        /// </summary>
        public static void ResetForTesting()
        {
            if (_instance != null)
            {
                DestroyImmediate(_instance.gameObject);
                _instance = null;
            }
        }
#endif
    }
}
