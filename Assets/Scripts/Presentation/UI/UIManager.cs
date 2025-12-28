using System;
using System.Collections.Generic;
using UnityEngine;

namespace Atelier.Presentation.UI
{
    /// <summary>
    /// UI管理の実装クラス。
    /// 画面表示、ダイアログ、ローディングの制御を行う。
    /// </summary>
    public class UIManager : MonoBehaviour, IUIManager
    {
        private static UIManager _instance;

        [Header("UI Roots")]
        [SerializeField] private Transform _screenRoot;
        [SerializeField] private Transform _dialogRoot;
        [SerializeField] private Transform _loadingRoot;

        [Header("Prefab Paths")]
        [SerializeField] private string _screenPrefabPath = "Prefabs/Screens";
        [SerializeField] private string _dialogPrefabPath = "Prefabs/Dialogs";
        [SerializeField] private string _loadingPrefabPath = "Prefabs/Loading";

        private readonly Dictionary<string, GameObject> _activeScreens = new Dictionary<string, GameObject>();
        private readonly Dictionary<string, GameObject> _activeDialogs = new Dictionary<string, GameObject>();
        private readonly Dictionary<string, Action<bool>> _dialogCallbacks = new Dictionary<string, Action<bool>>();
        private readonly Stack<string> _screenStack = new Stack<string>();

        private GameObject _loadingScreen;
        private bool _isInputBlocked;
        private int _inputBlockCount;

        /// <summary>
        /// シングルトンインスタンス
        /// </summary>
        public static UIManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    var go = new GameObject("UIManager");
                    _instance = go.AddComponent<UIManager>();
                    _instance.Initialize();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        /// <inheritdoc/>
        public bool IsInputBlocked => _isInputBlocked;

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
            if (_screenRoot == null)
            {
                var screenGo = new GameObject("ScreenRoot");
                screenGo.transform.SetParent(transform);
                _screenRoot = screenGo.transform;
            }

            if (_dialogRoot == null)
            {
                var dialogGo = new GameObject("DialogRoot");
                dialogGo.transform.SetParent(transform);
                _dialogRoot = dialogGo.transform;
            }

            if (_loadingRoot == null)
            {
                var loadingGo = new GameObject("LoadingRoot");
                loadingGo.transform.SetParent(transform);
                _loadingRoot = loadingGo.transform;
            }
        }

        /// <inheritdoc/>
        public void ShowScreen(string screenId)
        {
            if (string.IsNullOrEmpty(screenId))
            {
                Debug.LogWarning("[UIManager] screenId is null or empty.");
                return;
            }

            if (_activeScreens.ContainsKey(screenId))
            {
                Debug.LogWarning($"[UIManager] Screen '{screenId}' is already visible.");
                return;
            }

            var prefab = LoadPrefab($"{_screenPrefabPath}/{screenId}");
            if (prefab == null)
            {
                Debug.LogWarning($"[UIManager] Screen prefab not found: {screenId}");
                return;
            }

            var screenGo = Instantiate(prefab, _screenRoot);
            screenGo.name = screenId;
            _activeScreens[screenId] = screenGo;
            _screenStack.Push(screenId);

            Debug.Log($"[UIManager] Screen shown: {screenId}");
        }

        /// <inheritdoc/>
        public void HideScreen(string screenId)
        {
            if (string.IsNullOrEmpty(screenId))
            {
                Debug.LogWarning("[UIManager] screenId is null or empty.");
                return;
            }

            if (!_activeScreens.TryGetValue(screenId, out var screenGo))
            {
                Debug.LogWarning($"[UIManager] Screen '{screenId}' is not visible.");
                return;
            }

            _activeScreens.Remove(screenId);
            Destroy(screenGo);

            // スタックから削除（トップでなくても削除できるようにリビルド）
            var tempStack = new Stack<string>();
            while (_screenStack.Count > 0)
            {
                var id = _screenStack.Pop();
                if (id != screenId)
                {
                    tempStack.Push(id);
                }
            }
            while (tempStack.Count > 0)
            {
                _screenStack.Push(tempStack.Pop());
            }

            Debug.Log($"[UIManager] Screen hidden: {screenId}");
        }

        /// <inheritdoc/>
        public void ShowDialog(string dialogId, Action<bool> onResult = null)
        {
            if (string.IsNullOrEmpty(dialogId))
            {
                Debug.LogWarning("[UIManager] dialogId is null or empty.");
                return;
            }

            if (_activeDialogs.ContainsKey(dialogId))
            {
                Debug.LogWarning($"[UIManager] Dialog '{dialogId}' is already visible.");
                return;
            }

            var prefab = LoadPrefab($"{_dialogPrefabPath}/{dialogId}");
            if (prefab == null)
            {
                Debug.LogWarning($"[UIManager] Dialog prefab not found: {dialogId}");
                onResult?.Invoke(false);
                return;
            }

            var dialogGo = Instantiate(prefab, _dialogRoot);
            dialogGo.name = dialogId;
            _activeDialogs[dialogId] = dialogGo;
            _dialogCallbacks[dialogId] = onResult;

            // 入力をブロック
            BlockInput();

            Debug.Log($"[UIManager] Dialog shown: {dialogId}");
        }

        /// <inheritdoc/>
        public void HideDialog(string dialogId)
        {
            HideDialogInternal(dialogId, false, false);
        }

        /// <summary>
        /// ダイアログを閉じて結果を通知する。
        /// </summary>
        public void CloseDialogWithResult(string dialogId, bool result)
        {
            HideDialogInternal(dialogId, true, result);
        }

        private void HideDialogInternal(string dialogId, bool notifyResult, bool result)
        {
            if (string.IsNullOrEmpty(dialogId))
            {
                Debug.LogWarning("[UIManager] dialogId is null or empty.");
                return;
            }

            if (!_activeDialogs.TryGetValue(dialogId, out var dialogGo))
            {
                Debug.LogWarning($"[UIManager] Dialog '{dialogId}' is not visible.");
                return;
            }

            _activeDialogs.Remove(dialogId);
            Destroy(dialogGo);

            // コールバックを呼び出し
            if (notifyResult && _dialogCallbacks.TryGetValue(dialogId, out var callback))
            {
                _dialogCallbacks.Remove(dialogId);
                callback?.Invoke(result);
            }
            else
            {
                _dialogCallbacks.Remove(dialogId);
            }

            // 入力ブロックを解除
            UnblockInput();

            Debug.Log($"[UIManager] Dialog hidden: {dialogId}");
        }

        /// <inheritdoc/>
        public void ShowLoading()
        {
            if (_loadingScreen != null)
            {
                return;
            }

            var prefab = LoadPrefab($"{_loadingPrefabPath}/Loading");
            if (prefab != null)
            {
                _loadingScreen = Instantiate(prefab, _loadingRoot);
                _loadingScreen.name = "Loading";
            }
            else
            {
                // フォールバック：シンプルなローディング表示
                _loadingScreen = new GameObject("Loading");
                _loadingScreen.transform.SetParent(_loadingRoot);
            }

            BlockInput();
            Debug.Log("[UIManager] Loading shown.");
        }

        /// <inheritdoc/>
        public void HideLoading()
        {
            if (_loadingScreen == null)
            {
                return;
            }

            Destroy(_loadingScreen);
            _loadingScreen = null;

            UnblockInput();
            Debug.Log("[UIManager] Loading hidden.");
        }

        /// <inheritdoc/>
        public void BlockInput()
        {
            _inputBlockCount++;
            _isInputBlocked = true;
        }

        /// <inheritdoc/>
        public void UnblockInput()
        {
            _inputBlockCount = Mathf.Max(0, _inputBlockCount - 1);
            _isInputBlocked = _inputBlockCount > 0;
        }

        /// <summary>
        /// 前の画面に戻る。
        /// </summary>
        public bool GoBack()
        {
            if (_screenStack.Count <= 1)
            {
                return false;
            }

            var currentScreen = _screenStack.Pop();
            HideScreen(currentScreen);

            return true;
        }

        /// <summary>
        /// 現在表示中の画面IDを取得する。
        /// </summary>
        public string CurrentScreen => _screenStack.Count > 0 ? _screenStack.Peek() : null;

        private GameObject LoadPrefab(string path)
        {
            var prefab = Resources.Load<GameObject>(path);
            if (prefab == null)
            {
                Debug.LogWarning($"[UIManager] Failed to load prefab at path: {path}");
            }
            return prefab;
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
