using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Atelier.Infrastructure;
using Atelier.Infrastructure.DataLoaders;
using Atelier.Domain.Entities;
using Atelier.Presentation.Scenes;
using Atelier.Presentation.Input;

namespace Atelier.Presentation.Screens
{
    /// <summary>
    /// スタイル選択画面のUI管理クラス。
    /// </summary>
    public class StyleSelectScreen : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private Button _backButton;
        [SerializeField] private Button _startButton;
        [SerializeField] private Button[] _styleButtons;
        [SerializeField] private Text _styleNameText;
        [SerializeField] private Text _styleDescriptionText;
        [SerializeField] private Transform _deckPreviewContainer;
        [SerializeField] private InputField _seedInputField;
        [SerializeField] private Button _seedDialogButton;

        [Header("Style Button Colors")]
        [SerializeField] private Color _selectedColor = new Color(1f, 0.8f, 0.2f);
        [SerializeField] private Color _normalColor = Color.white;
        [SerializeField] private Color _disabledColor = new Color(0.5f, 0.5f, 0.5f);

        private int _selectedStyleIndex = 0;
        private List<Style> _styles;
        private ConfigDataLoader _dataLoader;
        private ISceneManager _sceneManager;
        private IInputManager _inputManager;

        /// <summary>
        /// 選択されているスタイルID
        /// </summary>
        public string SelectedStyleId => _styles != null && _selectedStyleIndex < _styles.Count
            ? _styles[_selectedStyleIndex].StyleId
            : string.Empty;

        /// <summary>
        /// ゲームシード値
        /// </summary>
        public int GameSeed { get; private set; }

        /// <summary>
        /// スタイル選択時のイベント
        /// </summary>
        public event Action<string> OnStyleSelected;

        /// <summary>
        /// ゲーム開始時のイベント
        /// </summary>
        public event Action<string, int> OnGameStart;

        /// <summary>
        /// 戻る時のイベント
        /// </summary>
        public event Action OnBack;

        private void Awake()
        {
            SetupButtons();
        }

        private void Start()
        {
            // 依存サービスの取得
            _dataLoader = new ConfigDataLoader();
            _sceneManager = ServiceLocator.GetOrDefault<ISceneManager>();
            _inputManager = ServiceLocator.GetOrDefault<IInputManager>();

            // スタイルデータの読み込み
            LoadStyles();

            // 入力イベントの購読
            SubscribeToInputEvents();

            // ランダムシードを生成
            GenerateRandomSeed();
        }

        private void OnDestroy()
        {
            UnsubscribeFromInputEvents();
        }

        private void SetupButtons()
        {
            if (_backButton != null)
            {
                _backButton.onClick.AddListener(OnBackClicked);
            }

            if (_startButton != null)
            {
                _startButton.onClick.AddListener(OnStartClicked);
            }

            if (_seedDialogButton != null)
            {
                _seedDialogButton.onClick.AddListener(ShowSeedDialog);
            }

            // スタイルボタンの設定
            if (_styleButtons != null)
            {
                for (int i = 0; i < _styleButtons.Length; i++)
                {
                    int index = i;
                    if (_styleButtons[i] != null)
                    {
                        _styleButtons[i].onClick.AddListener(() => SelectStyle(index));
                    }
                }
            }
        }

        private void SubscribeToInputEvents()
        {
            if (_inputManager != null)
            {
                _inputManager.OnConfirm += HandleConfirm;
                _inputManager.OnCancel += HandleCancel;
                _inputManager.OnMoveLeft += HandleMoveLeft;
                _inputManager.OnMoveRight += HandleMoveRight;
            }
        }

        private void UnsubscribeFromInputEvents()
        {
            if (_inputManager != null)
            {
                _inputManager.OnConfirm -= HandleConfirm;
                _inputManager.OnCancel -= HandleCancel;
                _inputManager.OnMoveLeft -= HandleMoveLeft;
                _inputManager.OnMoveRight -= HandleMoveRight;
            }
        }

        private void HandleConfirm()
        {
            OnStartClicked();
        }

        private void HandleCancel()
        {
            OnBackClicked();
        }

        private void HandleMoveLeft()
        {
            if (_styles != null && _styles.Count > 0)
            {
                int newIndex = (_selectedStyleIndex - 1 + _styles.Count) % _styles.Count;
                SelectStyle(newIndex);
            }
        }

        private void HandleMoveRight()
        {
            if (_styles != null && _styles.Count > 0)
            {
                int newIndex = (_selectedStyleIndex + 1) % _styles.Count;
                SelectStyle(newIndex);
            }
        }

        private void LoadStyles()
        {
            _styles = _dataLoader.LoadAllStyles();

            if (_styles == null || _styles.Count == 0)
            {
                Debug.LogWarning("[StyleSelectScreen] No styles loaded");
                return;
            }

            // ボタンの状態を更新
            UpdateStyleButtons();

            // 初期スタイルを選択
            SelectStyle(0);
        }

        private void UpdateStyleButtons()
        {
            if (_styleButtons == null || _styles == null) return;

            for (int i = 0; i < _styleButtons.Length; i++)
            {
                if (_styleButtons[i] == null) continue;

                bool isAvailable = i < _styles.Count;
                _styleButtons[i].interactable = isAvailable;

                // MVP時は火のスタイル（インデックス0）のみ有効
                // TODO: 他のスタイルの解放条件を実装
                if (i > 0)
                {
                    _styleButtons[i].interactable = false;
                }

                var image = _styleButtons[i].GetComponent<Image>();
                if (image != null)
                {
                    image.color = _styleButtons[i].interactable ? _normalColor : _disabledColor;
                }
            }
        }

        /// <summary>
        /// スタイルを選択する。
        /// </summary>
        /// <param name="index">スタイルインデックス</param>
        public void SelectStyle(int index)
        {
            if (_styles == null || index < 0 || index >= _styles.Count) return;

            _selectedStyleIndex = index;

            // ボタンの選択状態を更新
            for (int i = 0; i < _styleButtons.Length; i++)
            {
                if (_styleButtons[i] == null) continue;

                var image = _styleButtons[i].GetComponent<Image>();
                if (image != null)
                {
                    if (i == _selectedStyleIndex)
                    {
                        image.color = _selectedColor;
                    }
                    else if (_styleButtons[i].interactable)
                    {
                        image.color = _normalColor;
                    }
                    else
                    {
                        image.color = _disabledColor;
                    }
                }
            }

            // 詳細パネルを更新
            UpdateStyleDetail(_styles[_selectedStyleIndex]);

            OnStyleSelected?.Invoke(SelectedStyleId);
        }

        /// <summary>
        /// スタイル詳細パネルを更新する。
        /// </summary>
        /// <param name="style">表示するスタイル</param>
        public void UpdateStyleDetail(Style style)
        {
            if (style == null) return;

            if (_styleNameText != null)
            {
                _styleNameText.text = style.Name;
            }

            if (_styleDescriptionText != null)
            {
                _styleDescriptionText.text = style.Description;
            }

            // 初期デッキプレビューの更新
            UpdateDeckPreview(style);
        }

        private void UpdateDeckPreview(Style style)
        {
            if (_deckPreviewContainer == null || style == null) return;

            // TODO: 初期デッキカードのプレビューを表示
            Debug.Log($"[StyleSelectScreen] Deck preview: {string.Join(", ", style.StartingDeckCardIds)}");
        }

        /// <summary>
        /// シード入力ダイアログを表示する。
        /// </summary>
        public void ShowSeedDialog()
        {
            if (_seedInputField != null)
            {
                _seedInputField.gameObject.SetActive(true);
                _seedInputField.Select();
            }
        }

        private void GenerateRandomSeed()
        {
            GameSeed = UnityEngine.Random.Range(1, int.MaxValue);
            Debug.Log($"[StyleSelectScreen] Generated seed: {GameSeed}");
        }

        /// <summary>
        /// 戻るボタンクリック時の処理。
        /// </summary>
        public void OnBackClicked()
        {
            Debug.Log("[StyleSelectScreen] Back clicked");
            OnBack?.Invoke();

            _sceneManager?.LoadSceneAsync(GameScene.Title);
        }

        /// <summary>
        /// ゲーム開始ボタンクリック時の処理。
        /// </summary>
        public void OnStartClicked()
        {
            if (string.IsNullOrEmpty(SelectedStyleId))
            {
                Debug.LogWarning("[StyleSelectScreen] No style selected");
                return;
            }

            // シード入力がある場合はパース
            if (_seedInputField != null && !string.IsNullOrEmpty(_seedInputField.text))
            {
                if (int.TryParse(_seedInputField.text, out int parsedSeed))
                {
                    GameSeed = parsedSeed;
                }
                else
                {
                    // 文字列をハッシュ化
                    GameSeed = _seedInputField.text.GetHashCode();
                }
            }

            Debug.Log($"[StyleSelectScreen] Starting game with style: {SelectedStyleId}, seed: {GameSeed}");
            OnGameStart?.Invoke(SelectedStyleId, GameSeed);

            // マップ画面へ遷移
            _sceneManager?.LoadSceneAsync(GameScene.Map);
        }
    }
}
