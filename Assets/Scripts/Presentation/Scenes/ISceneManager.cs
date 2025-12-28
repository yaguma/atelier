using System;

namespace Atelier.Presentation.Scenes
{
    /// <summary>
    /// シーン管理のインターフェース。
    /// シーン遷移の制御を提供する。
    /// </summary>
    public interface ISceneManager
    {
        /// <summary>
        /// 現在のシーン
        /// </summary>
        GameScene CurrentScene { get; }

        /// <summary>
        /// シーンを同期的にロードする。
        /// </summary>
        /// <param name="scene">ロードするシーン</param>
        void LoadScene(GameScene scene);

        /// <summary>
        /// シーンを非同期でロードする。
        /// </summary>
        /// <param name="scene">ロードするシーン</param>
        /// <param name="onComplete">ロード完了時のコールバック</param>
        void LoadSceneAsync(GameScene scene, Action onComplete = null);

        /// <summary>
        /// 現在のシーンをリロードする。
        /// </summary>
        void ReloadCurrentScene();
    }
}
