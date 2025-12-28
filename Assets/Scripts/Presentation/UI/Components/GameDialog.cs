using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace Atelier.Presentation.UI.Components
{
    /// <summary>
    /// ゲーム用のダイアログコンポーネント。
    /// モーダル背景とスケールアニメーションを持つ。
    /// </summary>
    public class GameDialog : MonoBehaviour
    {
        [Header("Dialog Settings")]
        [SerializeField] private DialogType _dialogType = DialogType.Confirm;
        [SerializeField] private bool _closeOnBackgroundClick = false;
        [SerializeField] private bool _closeOnEscape = true;

        [Header("UI References")]
        [SerializeField] private RectTransform _dialogPanel;
        [SerializeField] private Image _backgroundOverlay;
        [SerializeField] private Text _titleText;
        [SerializeField] private Text _messageText;
        [SerializeField] private InputField _inputField;
        [SerializeField] private Button _confirmButton;
        [SerializeField] private Button _cancelButton;
        [SerializeField] private Button _retryButton;
        [SerializeField] private Button _closeButton;

        [Header("Colors")]
        [SerializeField] private Color _overlayColor = new Color(0f, 0f, 0f, 0.5f);

        [Header("Animation")]
        [SerializeField] private float _showDuration = 0.2f;
        [SerializeField] private float _hideDuration = 0.15f;

        private Action<bool> _onResult;
        private Action<bool, string> _onInputResult;
        private bool _isAnimating;

        /// <summary>
        /// ダイアログのタイプ
        /// </summary>
        public DialogType DialogType => _dialogType;

        /// <summary>
        /// 入力フィールドのテキスト
        /// </summary>
        public string InputText => _inputField != null ? _inputField.text : string.Empty;

        private void Awake()
        {
            SetupButtons();
            SetupBackgroundClick();
        }

        private void Update()
        {
            if (_closeOnEscape && UnityEngine.Input.GetKeyDown(KeyCode.Escape) && !_isAnimating)
            {
                OnCancelClicked();
            }
        }

        private void SetupButtons()
        {
            if (_confirmButton != null)
            {
                _confirmButton.onClick.AddListener(OnConfirmClicked);
            }

            if (_cancelButton != null)
            {
                _cancelButton.onClick.AddListener(OnCancelClicked);
            }

            if (_retryButton != null)
            {
                _retryButton.onClick.AddListener(OnRetryClicked);
            }

            if (_closeButton != null)
            {
                _closeButton.onClick.AddListener(OnCloseClicked);
            }
        }

        private void SetupBackgroundClick()
        {
            if (_backgroundOverlay != null && _closeOnBackgroundClick)
            {
                var button = _backgroundOverlay.gameObject.AddComponent<Button>();
                button.onClick.AddListener(OnBackgroundClicked);
            }
        }

        /// <summary>
        /// ダイアログを初期化して表示する。
        /// </summary>
        public void Show(string title, string message, Action<bool> onResult = null)
        {
            if (_titleText != null) _titleText.text = title;
            if (_messageText != null) _messageText.text = message;
            _onResult = onResult;

            SetupButtonsForType();
            StartCoroutine(ShowAnimation());
        }

        /// <summary>
        /// 入力ダイアログを初期化して表示する。
        /// </summary>
        public void ShowInput(string title, string message, string defaultValue, Action<bool, string> onResult)
        {
            if (_titleText != null) _titleText.text = title;
            if (_messageText != null) _messageText.text = message;
            if (_inputField != null) _inputField.text = defaultValue ?? string.Empty;
            _onInputResult = onResult;

            SetupButtonsForType();
            StartCoroutine(ShowAnimation());
        }

        /// <summary>
        /// ダイアログを閉じる。
        /// </summary>
        public void Close(bool result)
        {
            if (_isAnimating) return;
            StartCoroutine(HideAnimation(result));
        }

        private void SetupButtonsForType()
        {
            // すべてのボタンを非表示にしてから、必要なものだけ表示
            if (_confirmButton != null) _confirmButton.gameObject.SetActive(false);
            if (_cancelButton != null) _cancelButton.gameObject.SetActive(false);
            if (_retryButton != null) _retryButton.gameObject.SetActive(false);
            if (_closeButton != null) _closeButton.gameObject.SetActive(false);
            if (_inputField != null) _inputField.gameObject.SetActive(false);

            switch (_dialogType)
            {
                case DialogType.Confirm:
                    if (_confirmButton != null) _confirmButton.gameObject.SetActive(true);
                    if (_cancelButton != null) _cancelButton.gameObject.SetActive(true);
                    break;

                case DialogType.Info:
                    if (_closeButton != null) _closeButton.gameObject.SetActive(true);
                    break;

                case DialogType.Error:
                    if (_closeButton != null) _closeButton.gameObject.SetActive(true);
                    if (_retryButton != null) _retryButton.gameObject.SetActive(true);
                    break;

                case DialogType.Input:
                    if (_inputField != null) _inputField.gameObject.SetActive(true);
                    if (_confirmButton != null) _confirmButton.gameObject.SetActive(true);
                    if (_cancelButton != null) _cancelButton.gameObject.SetActive(true);
                    break;
            }
        }

        private IEnumerator ShowAnimation()
        {
            _isAnimating = true;
            gameObject.SetActive(true);

            // 初期状態
            if (_dialogPanel != null) _dialogPanel.localScale = Vector3.zero;
            if (_backgroundOverlay != null)
            {
                var color = _overlayColor;
                color.a = 0;
                _backgroundOverlay.color = color;
            }

            // アニメーション
            var elapsed = 0f;
            while (elapsed < _showDuration)
            {
                elapsed += Time.deltaTime;
                var t = elapsed / _showDuration;

                // EaseOutBack
                var c1 = 1.70158f;
                var c3 = c1 + 1;
                var scale = 1 + c3 * Mathf.Pow(t - 1, 3) + c1 * Mathf.Pow(t - 1, 2);

                if (_dialogPanel != null) _dialogPanel.localScale = Vector3.one * scale;
                if (_backgroundOverlay != null)
                {
                    var color = _overlayColor;
                    color.a = _overlayColor.a * t;
                    _backgroundOverlay.color = color;
                }

                yield return null;
            }

            if (_dialogPanel != null) _dialogPanel.localScale = Vector3.one;
            if (_backgroundOverlay != null) _backgroundOverlay.color = _overlayColor;

            _isAnimating = false;
        }

        private IEnumerator HideAnimation(bool result)
        {
            _isAnimating = true;

            // アニメーション
            var elapsed = 0f;
            var startScale = _dialogPanel != null ? _dialogPanel.localScale : Vector3.one;
            var startAlpha = _backgroundOverlay != null ? _backgroundOverlay.color.a : _overlayColor.a;

            while (elapsed < _hideDuration)
            {
                elapsed += Time.deltaTime;
                var t = elapsed / _hideDuration;

                if (_dialogPanel != null)
                {
                    _dialogPanel.localScale = Vector3.Lerp(startScale, Vector3.zero, t);
                }

                if (_backgroundOverlay != null)
                {
                    var color = _overlayColor;
                    color.a = Mathf.Lerp(startAlpha, 0, t);
                    _backgroundOverlay.color = color;
                }

                yield return null;
            }

            _isAnimating = false;
            gameObject.SetActive(false);

            // コールバック呼び出し
            if (_dialogType == DialogType.Input)
            {
                _onInputResult?.Invoke(result, InputText);
            }
            else
            {
                _onResult?.Invoke(result);
            }
        }

        #region Button Handlers

        private void OnConfirmClicked()
        {
            Close(true);
        }

        private void OnCancelClicked()
        {
            Close(false);
        }

        private void OnRetryClicked()
        {
            Close(true); // リトライは true として扱う
        }

        private void OnCloseClicked()
        {
            Close(false);
        }

        private void OnBackgroundClicked()
        {
            if (_closeOnBackgroundClick)
            {
                Close(false);
            }
        }

        #endregion
    }
}
