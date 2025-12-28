using System;

namespace Atelier.Presentation.UI
{
    /// <summary>
    /// 画面トランジション管理のインターフェース。
    /// フェードイン/アウト、クロスフェードなどの画面遷移アニメーションを提供する。
    /// </summary>
    public interface ITransitionManager
    {
        /// <summary>
        /// フェードイン（黒画面から徐々に表示）を実行する。
        /// </summary>
        /// <param name="duration">アニメーション時間（秒）</param>
        /// <param name="onComplete">完了コールバック</param>
        void FadeIn(float duration = 0.3f, Action onComplete = null);

        /// <summary>
        /// フェードアウト（画面から徐々に黒画面へ）を実行する。
        /// </summary>
        /// <param name="duration">アニメーション時間（秒）</param>
        /// <param name="onComplete">完了コールバック</param>
        void FadeOut(float duration = 0.3f, Action onComplete = null);

        /// <summary>
        /// クロスフェード（フェードアウト→中間処理→フェードイン）を実行する。
        /// </summary>
        /// <param name="onMiddle">フェードアウト完了後に呼ばれるコールバック</param>
        /// <param name="duration">全体のアニメーション時間（秒）</param>
        void CrossFade(Action onMiddle, float duration = 0.6f);

        /// <summary>
        /// トランジション中かどうか
        /// </summary>
        bool IsTransitioning { get; }
    }
}
