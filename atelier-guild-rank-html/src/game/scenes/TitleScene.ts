/**
 * TitleScene - タイトル画面シーン
 *
 * ゲームのタイトル画面を表示するシーン。
 * タイトルロゴ、サブタイトル、メニューボタンを表示し、
 * BGMを再生する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { SceneKeys } from '../config/SceneKeys';
import { ImageKeys, AudioKeys } from '../assets/AssetKeys';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';
import { UIFactory } from '../ui/UIFactory';
import { UIActionEvents } from '../events/EventTypes';
import { SceneManager } from '../managers/SceneManager';
import type Label from 'phaser3-rex-plugins/templates/ui/label/Label';

/**
 * タイトル画面のレイアウト設定
 */
const LAYOUT = {
  /** タイトルテキストのY座標 */
  titleY: 180,
  /** サブタイトルテキストのY座標 */
  subtitleY: 250,
  /** メニューコンテナのY座標 */
  menuY: 450,
  /** バージョン表示のマージン */
  versionMargin: 10,
  /** フェードイン時間（ミリ秒） */
  fadeInDuration: 500,
  /** BGM音量 */
  bgmVolume: 0.5,
  /** ボタンの幅 */
  buttonWidth: 200,
  /** ボタンの高さ */
  buttonHeight: 50,
  /** 新規ゲームボタンのY位置（メニューコンテナ内） */
  newGameButtonY: 0,
  /** コンティニューボタンのY位置（メニューコンテナ内） */
  continueButtonY: 70,
  /** セーブデータなしメッセージのY座標 */
  noSaveDataMessageY: 530,
} as const;

/**
 * セーブデータのLocalStorageキー
 */
const SAVE_DATA_KEY = 'atelier-guild-rank-save';

/**
 * TitleScene - タイトル画面シーン
 *
 * @example
 * ```typescript
 * // BootSceneから遷移
 * SceneManager.getInstance().goTo(SceneKeys.TITLE);
 * ```
 */
export class TitleScene extends BaseGameScene {
  /** タイトルテキスト */
  private titleText: Phaser.GameObjects.Text | null = null;

  /** サブタイトルテキスト */
  private subtitleText: Phaser.GameObjects.Text | null = null;

  /** メニューコンテナ */
  private menuContainer: Phaser.GameObjects.Container | null = null;

  /** バージョンテキスト */
  private versionText: Phaser.GameObjects.Text | null = null;

  /** 背景画像 */
  private backgroundImage: Phaser.GameObjects.Image | null = null;

  /** BGMがロードされているか */
  private _hasBgm = false;

  /** 背景画像がロードされているか */
  private _hasBackground = false;

  /** UIFactory */
  private uiFactory: UIFactory | null = null;

  /** 新規ゲームボタン */
  private newGameButton: Label | null = null;

  /** コンティニューボタン */
  private continueButton: Label | null = null;

  /** セーブデータなしメッセージ */
  private noSaveDataText: Phaser.GameObjects.Text | null = null;

  /** 遷移中フラグ（連打防止） */
  private _isTransitioning = false;

  /** セーブデータがあるか */
  private _hasSaveData = false;

  /**
   * コンストラクタ
   */
  constructor() {
    super(SceneKeys.TITLE);
  }

  /**
   * BGMがロードされているか
   */
  get hasBgm(): boolean {
    return this._hasBgm;
  }

  /**
   * 背景画像がロードされているか
   */
  get hasBackground(): boolean {
    return this._hasBackground;
  }

  /**
   * 遷移中かどうか
   */
  get isTransitioning(): boolean {
    return this._isTransitioning;
  }

  /**
   * 新規ゲームボタンを取得
   * @returns 新規ゲームボタン（null の場合もある）
   */
  getNewGameButton(): Label | null {
    return this.newGameButton;
  }

  /**
   * コンティニューボタンを取得
   * @returns コンティニューボタン（null の場合もある）
   */
  getContinueButton(): Label | null {
    return this.continueButton;
  }

  /**
   * セーブデータがあるか
   */
  get hasSaveData(): boolean {
    return this._hasSaveData;
  }

  // =====================================================
  // BaseGameScene ライフサイクル実装
  // =====================================================

  /**
   * 初期化処理
   */
  protected onInit(_data?: SceneInitData): void {
    this._hasBgm = false;
    this._hasBackground = false;
    this._isTransitioning = false;
    this._hasSaveData = this.checkSaveData();
  }

  /**
   * アセット読み込み処理
   * BootSceneでプリロード済みのため何もしない
   */
  protected onPreload(): void {
    // BootSceneでプリロード済み
  }

  /**
   * UI構築処理
   */
  protected onCreate(_data?: SceneInitData): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;

    // UIFactory初期化
    this.uiFactory = new UIFactory(this, this.rexUI);

    // 背景色設定
    this.cameras.main.setBackgroundColor(Colors.background);

    // 背景画像（存在する場合）
    this.createBackground(centerX, height);

    // タイトル
    this.createTitleText(centerX);

    // メニューコンテナ
    this.createMenuContainer(centerX);

    // メニューボタン作成
    this.createMenuButtons();

    // バージョン表示
    this.createVersionText(width, height);

    // フェードイン
    this.cameras.main.fadeIn(LAYOUT.fadeInDuration, 0, 0, 0);

    // BGM再生
    this.playBgm();
  }

  /**
   * イベントリスナー設定
   * TitleSceneではゲーム状態のイベントは不要
   */
  protected setupEventListeners(): void {
    // TitleSceneではゲーム状態のイベントは不要
  }

  /**
   * シーン終了時のクリーンアップ
   */
  protected onShutdown(): void {
    // BGM停止
    this.stopBgm();
  }

  // =====================================================
  // パブリックメソッド
  // =====================================================

  /**
   * メニューにボタンを追加
   * 後続タスク（TASK-0186, TASK-0187）で使用
   * @param button 追加するボタン
   * @param yOffset Y方向のオフセット
   */
  addMenuButton(button: Phaser.GameObjects.GameObject, yOffset: number): void {
    if (this.menuContainer) {
      // GameObjectがTransformコンポーネントを持っているか確認
      if ('setPosition' in button && typeof (button as { setPosition: unknown }).setPosition === 'function') {
        (button as unknown as { setPosition: (x: number, y: number) => void }).setPosition(0, yOffset);
      }
      this.menuContainer.add(button);
    }
  }

  /**
   * メニューコンテナを取得
   * @returns メニューコンテナ（null の場合もある）
   */
  getMenuContainer(): Phaser.GameObjects.Container | null {
    return this.menuContainer;
  }

  // =====================================================
  // プライベートメソッド
  // =====================================================

  /**
   * 背景を作成
   */
  private createBackground(centerX: number, height: number): void {
    // 背景画像（存在する場合）
    if (this.textures.exists(ImageKeys.BG_TITLE)) {
      this._hasBackground = true;
      this.backgroundImage = this.add
        .image(centerX, height / 2, ImageKeys.BG_TITLE)
        .setDisplaySize(this.cameras.main.width, height);
    }
  }

  /**
   * タイトルテキストを作成
   */
  private createTitleText(centerX: number): void {
    // メインタイトル
    this.titleText = this.add
      .text(centerX, LAYOUT.titleY, 'Atelier Guild Rank', {
        ...TextStyles.titleLarge,
        fontSize: '56px',
      })
      .setOrigin(0.5);

    // サブタイトル
    this.subtitleText = this.add
      .text(centerX, LAYOUT.subtitleY, '〜錬金術師ギルド物語〜', {
        ...TextStyles.titleMedium,
        fontSize: '24px',
      })
      .setOrigin(0.5);
  }

  /**
   * メニューコンテナを作成
   */
  private createMenuContainer(centerX: number): void {
    this.menuContainer = this.add.container(centerX, LAYOUT.menuY);
  }

  /**
   * メニューボタンを作成
   */
  private createMenuButtons(): void {
    if (!this.uiFactory || !this.menuContainer) {
      return;
    }

    // 新規ゲームボタン
    this.newGameButton = this.uiFactory.createPrimaryButton({
      x: 0,
      y: LAYOUT.newGameButtonY,
      text: '新規ゲーム',
      width: LAYOUT.buttonWidth,
      height: LAYOUT.buttonHeight,
      onClick: () => this.onNewGameClick(),
    });
    this.menuContainer.add(this.newGameButton);

    // コンティニューボタン
    this.continueButton = this.uiFactory.createButton({
      x: 0,
      y: LAYOUT.continueButtonY,
      text: 'コンティニュー',
      width: LAYOUT.buttonWidth,
      height: LAYOUT.buttonHeight,
      onClick: () => this.onContinueClick(),
      disabled: !this._hasSaveData,
    });
    this.menuContainer.add(this.continueButton);

    // セーブデータがない場合のヒント表示
    if (!this._hasSaveData) {
      this.noSaveDataText = this.add
        .text(
          this.cameras.main.centerX,
          LAYOUT.noSaveDataMessageY,
          'セーブデータがありません',
          {
            ...TextStyles.bodySmall,
            color: '#888888',
          }
        )
        .setOrigin(0.5);
    }
  }

  /**
   * 新規ゲームボタンクリック時の処理
   */
  private onNewGameClick(): void {
    // 連打防止
    if (this._isTransitioning) {
      return;
    }
    this._isTransitioning = true;

    // SE再生
    if (this.cache.audio.exists(AudioKeys.SE_CLICK)) {
      this.sound.play(AudioKeys.SE_CLICK);
    }

    // BGM停止
    this.sound.stopAll();

    // イベント発行
    this.eventBus.emitVoid(UIActionEvents.NEW_GAME_CLICKED);

    // MainSceneへ遷移
    SceneManager.getInstance().goTo(SceneKeys.MAIN, {
      isNewGame: true,
    });
  }

  /**
   * コンティニューボタンクリック時の処理
   */
  private onContinueClick(): void {
    // セーブデータがない場合は何もしない
    if (!this._hasSaveData) {
      return;
    }

    // 連打防止
    if (this._isTransitioning) {
      return;
    }
    this._isTransitioning = true;

    // SE再生
    if (this.cache.audio.exists(AudioKeys.SE_CLICK)) {
      this.sound.play(AudioKeys.SE_CLICK);
    }

    // BGM停止
    this.sound.stopAll();

    // イベント発行
    this.eventBus.emitVoid(UIActionEvents.CONTINUE_CLICKED);

    // MainSceneへ遷移（ロードフラグ付き）
    SceneManager.getInstance().goTo(SceneKeys.MAIN, {
      isNewGame: false,
      loadSave: true,
    });
  }

  /**
   * セーブデータの存在確認
   * @returns セーブデータが存在するかどうか
   */
  private checkSaveData(): boolean {
    try {
      const saveData = localStorage.getItem(SAVE_DATA_KEY);
      return saveData !== null;
    } catch {
      // LocalStorageへのアクセスエラー（プライベートモードなど）
      return false;
    }
  }

  /**
   * コンティニューボタンの状態を更新
   * セーブデータの状態が変わった場合に呼び出す
   */
  updateContinueButtonState(): void {
    this._hasSaveData = this.checkSaveData();
    if (this.uiFactory && this.continueButton) {
      this.uiFactory.setButtonEnabled(this.continueButton, this._hasSaveData);
    }

    // ヒントテキストの表示/非表示
    if (this.noSaveDataText) {
      this.noSaveDataText.setVisible(!this._hasSaveData);
    }
  }

  /**
   * バージョンテキストを作成
   */
  private createVersionText(width: number, height: number): void {
    this.versionText = this.add
      .text(width - LAYOUT.versionMargin, height - LAYOUT.versionMargin, 'v0.1.0', {
        ...TextStyles.bodySmall,
        fontSize: '12px',
      })
      .setOrigin(1, 1);
  }

  /**
   * BGMを再生
   */
  private playBgm(): void {
    // BGMが存在し、まだ再生していない場合のみ再生
    if (this.cache.audio.exists(AudioKeys.BGM_TITLE)) {
      this._hasBgm = true;
      this.sound.play(AudioKeys.BGM_TITLE, {
        loop: true,
        volume: LAYOUT.bgmVolume,
      });
    }
  }

  /**
   * BGMを停止
   */
  private stopBgm(): void {
    if (this._hasBgm) {
      this.sound.stopByKey(AudioKeys.BGM_TITLE);
    }
  }
}
