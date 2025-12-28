using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace Atelier.Presentation.UI
{
    /// <summary>
    /// 画面トランジション管理の実装クラス。
    /// フェードイン/アウト、クロスフェードなどの画面遷移アニメーションを提供する。
    /// </summary>
    public class TransitionManager : MonoBehaviour, ITransitionManager
    {
        private static TransitionManager _instance;

        [Header("Fade Settings")]
        [SerializeField] private Image _fadeOverlay;
        [SerializeField] private Color _fadeColor = Color.black;
        [SerializeField] private float _defaultFadeDuration = 0.3f;

        private Canvas _canvas;
        private Coroutine _currentTransition;
        private bool _isTransitioning;

        /// <summary>
        /// シングルトンインスタンス
        /// </summary>
        public static TransitionManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    var go = new GameObject("TransitionManager");
                    _instance = go.AddComponent<TransitionManager>();
                    _instance.Initialize();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        /// <inheritdoc/>
        public bool IsTransitioning => _isTransitioning;

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
            // Canvas作成
            if (_canvas == null)
            {
                var canvasGo = new GameObject("TransitionCanvas");
                canvasGo.transform.SetParent(transform);
                _canvas = canvasGo.AddComponent<Canvas>();
                _canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                _canvas.sortingOrder = 999; // 最前面

                var scaler = canvasGo.AddComponent<CanvasScaler>();
                scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
                scaler.referenceResolution = new Vector2(1920, 1080);

                canvasGo.AddComponent<GraphicRaycaster>();
            }

            // フェードオーバーレイ作成
            if (_fadeOverlay == null)
            {
                var overlayGo = new GameObject("FadeOverlay");
                overlayGo.transform.SetParent(_canvas.transform);

                var rectTransform = overlayGo.AddComponent<RectTransform>();
                rectTransform.anchorMin = Vector2.zero;
                rectTransform.anchorMax = Vector2.one;
                rectTransform.sizeDelta = Vector2.zero;
                rectTransform.anchoredPosition = Vector2.zero;

                _fadeOverlay = overlayGo.AddComponent<Image>();
                _fadeOverlay.color = new Color(_fadeColor.r, _fadeColor.g, _fadeColor.b, 0);
                _fadeOverlay.raycastTarget = false;
            }

            // 初期状態では透明
            SetFadeAlpha(0);
        }

        /// <inheritdoc/>
        public void FadeIn(float duration = 0.3f, Action onComplete = null)
        {
            if (_isTransitioning)
            {
                Debug.LogWarning("[TransitionManager] Transition is already in progress.");
                return;
            }

            CancelCurrentTransition();
            _currentTransition = StartCoroutine(FadeInCoroutine(duration, onComplete));
        }

        /// <inheritdoc/>
        public void FadeOut(float duration = 0.3f, Action onComplete = null)
        {
            if (_isTransitioning)
            {
                Debug.LogWarning("[TransitionManager] Transition is already in progress.");
                return;
            }

            CancelCurrentTransition();
            _currentTransition = StartCoroutine(FadeOutCoroutine(duration, onComplete));
        }

        /// <inheritdoc/>
        public void CrossFade(Action onMiddle, float duration = 0.6f)
        {
            if (_isTransitioning)
            {
                Debug.LogWarning("[TransitionManager] Transition is already in progress.");
                return;
            }

            CancelCurrentTransition();
            _currentTransition = StartCoroutine(CrossFadeCoroutine(onMiddle, duration));
        }

        private IEnumerator FadeInCoroutine(float duration, Action onComplete)
        {
            _isTransitioning = true;
            EnableInputBlock(true);

            // 完全に黒い状態から開始
            SetFadeAlpha(1);

            // 徐々に透明に
            var elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                var t = elapsed / duration;
                SetFadeAlpha(1 - t);
                yield return null;
            }

            SetFadeAlpha(0);
            EnableInputBlock(false);
            _isTransitioning = false;

            onComplete?.Invoke();
        }

        private IEnumerator FadeOutCoroutine(float duration, Action onComplete)
        {
            _isTransitioning = true;
            EnableInputBlock(true);

            // 透明な状態から開始
            SetFadeAlpha(0);

            // 徐々に黒く
            var elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                var t = elapsed / duration;
                SetFadeAlpha(t);
                yield return null;
            }

            SetFadeAlpha(1);
            EnableInputBlock(false);
            _isTransitioning = false;

            onComplete?.Invoke();
        }

        private IEnumerator CrossFadeCoroutine(Action onMiddle, float duration)
        {
            _isTransitioning = true;
            EnableInputBlock(true);

            var halfDuration = duration / 2f;

            // フェードアウト
            SetFadeAlpha(0);
            var elapsed = 0f;
            while (elapsed < halfDuration)
            {
                elapsed += Time.deltaTime;
                var t = elapsed / halfDuration;
                SetFadeAlpha(t);
                yield return null;
            }
            SetFadeAlpha(1);

            // 中間処理
            onMiddle?.Invoke();

            // 1フレーム待機（シーンロードなどの処理を待つ）
            yield return null;

            // フェードイン
            elapsed = 0f;
            while (elapsed < halfDuration)
            {
                elapsed += Time.deltaTime;
                var t = elapsed / halfDuration;
                SetFadeAlpha(1 - t);
                yield return null;
            }
            SetFadeAlpha(0);

            EnableInputBlock(false);
            _isTransitioning = false;
        }

        private void SetFadeAlpha(float alpha)
        {
            if (_fadeOverlay != null)
            {
                var color = _fadeColor;
                color.a = alpha;
                _fadeOverlay.color = color;
            }
        }

        private void EnableInputBlock(bool block)
        {
            if (_fadeOverlay != null)
            {
                _fadeOverlay.raycastTarget = block;
            }
        }

        private void CancelCurrentTransition()
        {
            if (_currentTransition != null)
            {
                StopCoroutine(_currentTransition);
                _currentTransition = null;
                _isTransitioning = false;
                EnableInputBlock(false);
            }
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
