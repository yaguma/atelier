using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

namespace Atelier.Presentation.UI.Components
{
    /// <summary>
    /// ゲーム用のカスタムボタンコンポーネント。
    /// ホバー/クリックアニメーションと重複クリック防止機能を持つ。
    /// </summary>
    [RequireComponent(typeof(Button))]
    [RequireComponent(typeof(Image))]
    public class GameButton : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler, IPointerDownHandler, IPointerUpHandler, ISelectHandler, IDeselectHandler
    {
        [Header("Button Settings")]
        [SerializeField] private ButtonType _buttonType = ButtonType.Primary;
        [SerializeField] private Text _buttonText;
        [SerializeField] private Image _buttonImage;

        [Header("Colors")]
        [SerializeField] private Color _primaryColor = new Color(0.545f, 0.271f, 0.075f, 1f); // #8B4513
        [SerializeField] private Color _secondaryColor = new Color(0.5f, 0.5f, 0.5f, 1f);    // Gray
        [SerializeField] private Color _dangerColor = new Color(0.8f, 0.2f, 0.2f, 1f);       // Red
        [SerializeField] private Color _ghostColor = new Color(1f, 1f, 1f, 0f);              // Transparent
        [SerializeField] private Color _disabledColor = new Color(0.5f, 0.5f, 0.5f, 0.5f);   // Gray + Alpha

        [Header("Animation")]
        [SerializeField] private float _hoverScale = 1.05f;
        [SerializeField] private float _clickScale = 0.95f;
        [SerializeField] private float _animationDuration = 0.1f;

        [Header("Focus")]
        [SerializeField] private Image _focusOutline;
        [SerializeField] private Color _focusColor = new Color(1f, 0.84f, 0f, 1f); // Gold

        [Header("Debounce")]
        [SerializeField] private float _debounceTime = 0.1f;

        private Button _button;
        private RectTransform _rectTransform;
        private Vector3 _originalScale;
        private bool _isHovered;
        private bool _isPressed;
        private bool _isFocused;
        private float _lastClickTime;

        public event Action OnClick;

        /// <summary>
        /// ボタンのタイプ
        /// </summary>
        public ButtonType ButtonType
        {
            get => _buttonType;
            set
            {
                _buttonType = value;
                ApplyButtonStyle();
            }
        }

        /// <summary>
        /// ボタンが有効かどうか
        /// </summary>
        public bool Interactable
        {
            get => _button != null && _button.interactable;
            set
            {
                if (_button != null)
                {
                    _button.interactable = value;
                    ApplyButtonStyle();
                }
            }
        }

        private void Awake()
        {
            _button = GetComponent<Button>();
            _rectTransform = GetComponent<RectTransform>();
            _buttonImage = GetComponent<Image>();
            _originalScale = transform.localScale;

            if (_button != null)
            {
                _button.onClick.AddListener(HandleClick);
            }
        }

        private void Start()
        {
            ApplyButtonStyle();
        }

        private void OnDestroy()
        {
            if (_button != null)
            {
                _button.onClick.RemoveListener(HandleClick);
            }
        }

        /// <summary>
        /// ボタンのテキストを設定する。
        /// </summary>
        public void SetText(string text)
        {
            if (_buttonText != null)
            {
                _buttonText.text = text;
            }
        }

        private void HandleClick()
        {
            // デバウンス処理
            if (Time.time - _lastClickTime < _debounceTime)
            {
                return;
            }
            _lastClickTime = Time.time;

            OnClick?.Invoke();
        }

        private void ApplyButtonStyle()
        {
            if (_buttonImage == null) return;

            Color targetColor;
            if (!Interactable)
            {
                targetColor = _disabledColor;
            }
            else
            {
                targetColor = _buttonType switch
                {
                    ButtonType.Primary => _primaryColor,
                    ButtonType.Secondary => _secondaryColor,
                    ButtonType.Danger => _dangerColor,
                    ButtonType.Ghost => _ghostColor,
                    _ => _primaryColor
                };
            }

            _buttonImage.color = targetColor;
        }

        private void AnimateScale(float targetScale)
        {
            if (_rectTransform == null) return;

            // 簡易アニメーション（実際はDOTweenなどを使用推奨）
            StopAllCoroutines();
            StartCoroutine(ScaleCoroutine(targetScale));
        }

        private System.Collections.IEnumerator ScaleCoroutine(float targetScale)
        {
            var startScale = transform.localScale;
            var endScale = _originalScale * targetScale;
            var elapsed = 0f;

            while (elapsed < _animationDuration)
            {
                elapsed += Time.deltaTime;
                var t = elapsed / _animationDuration;
                transform.localScale = Vector3.Lerp(startScale, endScale, t);
                yield return null;
            }

            transform.localScale = endScale;
        }

        #region Event Handlers

        public void OnPointerEnter(PointerEventData eventData)
        {
            if (!Interactable) return;

            _isHovered = true;
            AnimateScale(_hoverScale);
        }

        public void OnPointerExit(PointerEventData eventData)
        {
            _isHovered = false;
            if (!_isPressed)
            {
                AnimateScale(1f);
            }
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            if (!Interactable) return;

            _isPressed = true;
            AnimateScale(_clickScale);
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            _isPressed = false;
            if (_isHovered)
            {
                AnimateScale(_hoverScale);
            }
            else
            {
                AnimateScale(1f);
            }
        }

        public void OnSelect(BaseEventData eventData)
        {
            _isFocused = true;
            if (_focusOutline != null)
            {
                _focusOutline.enabled = true;
                _focusOutline.color = _focusColor;
            }
        }

        public void OnDeselect(BaseEventData eventData)
        {
            _isFocused = false;
            if (_focusOutline != null)
            {
                _focusOutline.enabled = false;
            }
        }

        #endregion
    }
}
