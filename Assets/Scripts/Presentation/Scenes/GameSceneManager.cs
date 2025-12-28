using System;
using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Atelier.Presentation.Scenes
{
    /// <summary>
    /// シーン管理の実装クラス。
    /// UnityのSceneManagerをラップしてシーン遷移を管理する。
    /// </summary>
    public class GameSceneManager : MonoBehaviour, ISceneManager
    {
        private static GameSceneManager _instance;
        private GameScene _currentScene = GameScene.Boot;
        private bool _isLoading = false;

        /// <summary>
        /// シングルトンインスタンス
        /// </summary>
        public static GameSceneManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    var go = new GameObject("GameSceneManager");
                    _instance = go.AddComponent<GameSceneManager>();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        /// <inheritdoc/>
        public GameScene CurrentScene => _currentScene;

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            DontDestroyOnLoad(gameObject);

            // 初期シーンを設定
            var activeSceneName = SceneManager.GetActiveScene().name;
            if (Enum.TryParse<GameScene>(activeSceneName, out var scene))
            {
                _currentScene = scene;
            }
        }

        /// <inheritdoc/>
        public void LoadScene(GameScene scene)
        {
            if (_isLoading)
            {
                Debug.LogWarning("[GameSceneManager] Scene is already loading. Ignoring request.");
                return;
            }

            var sceneName = GetSceneName(scene);
            Debug.Log($"[GameSceneManager] Loading scene: {sceneName}");

            _isLoading = true;
            SceneManager.LoadScene(sceneName);
            _currentScene = scene;
            _isLoading = false;
        }

        /// <inheritdoc/>
        public void LoadSceneAsync(GameScene scene, Action onComplete = null)
        {
            if (_isLoading)
            {
                Debug.LogWarning("[GameSceneManager] Scene is already loading. Ignoring request.");
                return;
            }

            StartCoroutine(LoadSceneAsyncCoroutine(scene, onComplete));
        }

        /// <inheritdoc/>
        public void ReloadCurrentScene()
        {
            LoadScene(_currentScene);
        }

        private IEnumerator LoadSceneAsyncCoroutine(GameScene scene, Action onComplete)
        {
            _isLoading = true;
            var sceneName = GetSceneName(scene);
            Debug.Log($"[GameSceneManager] Loading scene async: {sceneName}");

            var asyncOperation = SceneManager.LoadSceneAsync(sceneName);
            if (asyncOperation == null)
            {
                Debug.LogError($"[GameSceneManager] Failed to load scene: {sceneName}");
                _isLoading = false;
                yield break;
            }

            while (!asyncOperation.isDone)
            {
                yield return null;
            }

            _currentScene = scene;
            _isLoading = false;

            Debug.Log($"[GameSceneManager] Scene loaded: {sceneName}");
            onComplete?.Invoke();
        }

        /// <summary>
        /// GameSceneからシーン名を取得する。
        /// </summary>
        /// <param name="scene">シーン</param>
        /// <returns>シーン名</returns>
        private string GetSceneName(GameScene scene)
        {
            return scene.ToString();
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

        /// <summary>
        /// テスト用に現在のシーンを設定する。
        /// </summary>
        public void SetCurrentSceneForTesting(GameScene scene)
        {
            _currentScene = scene;
        }
#endif
    }
}
