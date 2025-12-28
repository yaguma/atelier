using System;
using UnityEngine;
using UnityEngine.UI;
using Atelier.Infrastructure;
using Atelier.Infrastructure.Repositories;
using Atelier.Presentation.Scenes;
using Atelier.Presentation.Input;

namespace Atelier.Presentation.Screens
{
    /// <summary>
    /// タイトル画面のUI管理クラス。
    /// </summary>
    public class TitleScreen : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private Text _titleText;
        [SerializeField] private Text _subtitleText;
        [SerializeField] private Button _newGameButton;
        [SerializeField] private Button _continueButton;
        [SerializeField] private Button _settingsButton;
        [SerializeField] private Button _exitButton;
        [SerializeField] private Text _versionText;
        [SerializeField] private Text _copyrightText;

        [Header("Button Focus")]
        [SerializeField] private Image _focusIndicator;

        private Button[] _menuButtons;
        private int _selectedButtonIndex;
        private ISaveDataRepository _saveDataRepository;
        private ISceneManager _sceneManager;
        private IInputManager _inputManager;

        /// <summary>
        /// 新規ゲーム開始時のイベント
        /// </summary>
        public event Action OnNewGame;

        /// <summary>
        /// コンティニュー時のイベント
        /// </summary>
        public event Action OnContinue;

        /// <summary>
        /// 設定画面表示時のイベント
        /// </summary>
        public event Action OnSettings;

        /// <summary>
        /// ゲーム終了時のイベント
        /// </summary>
        public event Action OnExit;

        private void Awake()
        {
            SetupButtons();
            SetupVersionInfo();
        }

        private void Start()
        {
            // 依存サービスの取得
            _saveDataRepository = ServiceLocator.GetOrDefault<ISaveDataRepository>();
            _sceneManager = ServiceLocator.GetOrDefault<ISceneManager>();
            _inputManager = ServiceLocator.GetOrDefault<IInputManager>();

            // コンティニューボタンの状態を更新
            UpdateContinueButtonState();

            // 初期選択
            SelectInitialButton();

            // 入力イベントの購読
            SubscribeToInputEvents();
        }

        private void OnDestroy()
        {
            UnsubscribeFromInputEvents();
        }

        private void SetupButtons()
        {
            _menuButtons = new Button[]
            {
                _newGameButton,
                _continueButton,
                _settingsButton,
                _exitButton
            };

            if (_newGameButton != null)
            {
                _newGameButton.onClick.AddListener(OnNewGameClicked);
            }

            if (_continueButton != null)
            {
                _continueButton.onClick.AddListener(OnContinueClicked);
            }

            if (_settingsButton != null)
            {
                _settingsButton.onClick.AddListener(OnSettingsClicked);
            }

            if (_exitButton != null)
            {
                _exitButton.onClick.AddListener(OnExitClicked);
            }
        }

        private void SetupVersionInfo()
        {
            if (_versionText != null)
            {
                _versionText.text = $"Version {UnityEngine.Application.version}";
            }

            if (_copyrightText != null)
            {
                _copyrightText.text = $"© {DateTime.Now.Year} Atelier Project";
            }
        }

        private void SubscribeToInputEvents()
        {
            if (_inputManager != null)
            {
                _inputManager.OnConfirm += HandleConfirm;
                _inputManager.OnMoveUp += HandleMoveUp;
                _inputManager.OnMoveDown += HandleMoveDown;
            }
        }

        private void UnsubscribeFromInputEvents()
        {
            if (_inputManager != null)
            {
                _inputManager.OnConfirm -= HandleConfirm;
                _inputManager.OnMoveUp -= HandleMoveUp;
                _inputManager.OnMoveDown -= HandleMoveDown;
            }
        }

        private void HandleConfirm()
        {
            if (_menuButtons != null && _selectedButtonIndex >= 0 && _selectedButtonIndex < _menuButtons.Length)
            {
                var button = _menuButtons[_selectedButtonIndex];
                if (button != null && button.interactable)
                {
                    button.onClick.Invoke();
                }
            }
        }

        private void HandleMoveUp()
        {
            MoveSelection(-1);
        }

        private void HandleMoveDown()
        {
            MoveSelection(1);
        }

        private void MoveSelection(int direction)
        {
            if (_menuButtons == null || _menuButtons.Length == 0) return;

            int newIndex = _selectedButtonIndex;
            int attempts = 0;

            do
            {
                newIndex = (newIndex + direction + _menuButtons.Length) % _menuButtons.Length;
                attempts++;
            }
            while (!_menuButtons[newIndex].interactable && attempts < _menuButtons.Length);

            if (_menuButtons[newIndex].interactable)
            {
                SelectButton(newIndex);
            }
        }

        private void SelectInitialButton()
        {
            // セーブデータがあればコンティニュー、なければ新規ゲームを選択
            bool hasSaveData = _saveDataRepository?.HasSaveData() ?? false;
            int initialIndex = hasSaveData ? 1 : 0;

            if (_menuButtons != null && _menuButtons[initialIndex] != null && _menuButtons[initialIndex].interactable)
            {
                SelectButton(initialIndex);
            }
            else
            {
                SelectButton(0);
            }
        }

        /// <summary>
        /// コンティニューボタンの状態を更新する。
        /// </summary>
        public void UpdateContinueButtonState()
        {
            if (_continueButton == null) return;

            bool hasSaveData = _saveDataRepository?.HasSaveData() ?? false;
            _continueButton.interactable = hasSaveData;
        }

        /// <summary>
        /// 指定したインデックスのボタンを選択する。
        /// </summary>
        /// <param name="index">ボタンインデックス</param>
        public void SelectButton(int index)
        {
            if (_menuButtons == null || index < 0 || index >= _menuButtons.Length) return;

            _selectedButtonIndex = index;

            // フォーカスインジケーターの位置を更新
            if (_focusIndicator != null && _menuButtons[index] != null)
            {
                _focusIndicator.transform.position = _menuButtons[index].transform.position;
                _focusIndicator.gameObject.SetActive(true);
            }

            // ボタンを選択状態に
            if (_menuButtons[index] != null)
            {
                _menuButtons[index].Select();
            }
        }

        /// <summary>
        /// 新規ゲームボタンクリック時の処理。
        /// </summary>
        public void OnNewGameClicked()
        {
            Debug.Log("[TitleScreen] New Game clicked");
            OnNewGame?.Invoke();

            // スタイル選択画面へ遷移
            _sceneManager?.LoadSceneAsync(GameScene.StyleSelect);
        }

        /// <summary>
        /// コンティニューボタンクリック時の処理。
        /// </summary>
        public void OnContinueClicked()
        {
            Debug.Log("[TitleScreen] Continue clicked");

            if (_saveDataRepository == null || !_saveDataRepository.HasSaveData())
            {
                Debug.LogWarning("[TitleScreen] No save data available");
                return;
            }

            OnContinue?.Invoke();

            // セーブデータを読み込んでマップ画面へ遷移
            var saveData = _saveDataRepository.Load();
            if (saveData != null)
            {
                _sceneManager?.LoadSceneAsync(GameScene.Map);
            }
        }

        /// <summary>
        /// 設定ボタンクリック時の処理。
        /// </summary>
        public void OnSettingsClicked()
        {
            Debug.Log("[TitleScreen] Settings clicked");
            OnSettings?.Invoke();

            // TODO: 設定ダイアログを表示
        }

        /// <summary>
        /// 終了ボタンクリック時の処理。
        /// </summary>
        public void OnExitClicked()
        {
            Debug.Log("[TitleScreen] Exit clicked");
            OnExit?.Invoke();

            // TODO: 確認ダイアログを表示
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            UnityEngine.Application.Quit();
#endif
        }
    }
}
