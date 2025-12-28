using UnityEngine;
using Atelier.Infrastructure;
using Atelier.Application.Events;
using Atelier.Domain.Entities;

namespace Atelier.Presentation.Bootstrap
{
    /// <summary>
    /// ゲーム起動時の初期化を行うブートストラッパー。
    /// Bootstrapシーンに配置し、サービスの登録を行う。
    /// </summary>
    public class GameBootstrapper : MonoBehaviour
    {
        private static bool _isInitialized = false;

        private void Awake()
        {
            if (_isInitialized)
            {
                Destroy(gameObject);
                return;
            }

            _isInitialized = true;
            DontDestroyOnLoad(gameObject);

            InitializeServices();
        }

        /// <summary>
        /// サービスの初期化と登録を行う。
        /// </summary>
        private void InitializeServices()
        {
            Debug.Log("[GameBootstrapper] Initializing services...");

            // 既存の登録をクリア（テスト時のリセット用）
            ServiceLocator.Clear();

            // EventBusの登録
            var eventBus = new EventBus();
            ServiceLocator.Register<IEventBus>(eventBus);

            // GameStateの登録
            var gameState = new GameState();
            ServiceLocator.Register<GameState>(gameState);

            Debug.Log("[GameBootstrapper] Services initialized successfully.");
        }

        /// <summary>
        /// アプリケーション終了時のクリーンアップ。
        /// </summary>
        private void OnApplicationQuit()
        {
            ServiceLocator.Clear();
            _isInitialized = false;
        }

#if UNITY_EDITOR
        /// <summary>
        /// エディタでの再初期化用（テスト時に使用）。
        /// </summary>
        public static void ResetForTesting()
        {
            _isInitialized = false;
            ServiceLocator.Clear();
        }
#endif
    }
}
