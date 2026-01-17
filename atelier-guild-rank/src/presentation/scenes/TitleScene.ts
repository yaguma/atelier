/**
 * TitleScene.ts - タイトルシーン
 * TASK-0019: TitleScene実装
 *
 * 【機能概要】
 * ゲームのタイトル画面を表示するシーン。
 * タイトルロゴ、サブタイトル、バージョン情報、メニューボタンを表示し、
 * ユーザー操作に応じてゲームの開始やセーブデータの管理を行う。
 *
 * 【実装方針】
 * 設計文書（docs/design/atelier-guild-rank/ui-design/screens/title.md）に基づいて
 * タイトルロゴ、サブタイトル、メニューボタンを表示する。
 *
 * 【テスト対応】
 * T-0019-01〜23のテストケースを通す
 *
 * @信頼性レベル 🔵 設計文書準拠
 * @see docs/design/atelier-guild-rank/ui-design/screens/title.md
 */

import Phaser from 'phaser';
import { THEME } from '../ui/theme';

// =============================================================================
// 定数定義
// =============================================================================

/**
 * タイトルシーンのレイアウト定数
 * @信頼性レベル 🔵 設計文書に基づく座標値
 */
const LAYOUT = {
  /** タイトルロゴのY座標 */
  TITLE_Y: 200,
  /** サブタイトルのY座標 */
  SUBTITLE_Y: 260,
  /** メニューボタンの開始Y座標 */
  BUTTON_START_Y: 400,
  /** メニューボタン間のスペーシング */
  BUTTON_SPACING: 60,
  /** バージョン情報の右下からのオフセット */
  VERSION_OFFSET: 20,
} as const;

/**
 * タイトルシーンのスタイル定数
 * @信頼性レベル 🔵 設計文書に基づくスタイル値
 */
const STYLES = {
  /** タイトルロゴのフォントサイズ */
  TITLE_FONT_SIZE: '48px',
  /** タイトルロゴの色（SaddleBrown） */
  TITLE_COLOR: '#8B4513',
  /** サブタイトルのフォントサイズ */
  SUBTITLE_FONT_SIZE: '24px',
  /** サブタイトルの色 */
  SUBTITLE_COLOR: '#666666',
  /** バージョン情報のフォントサイズ */
  VERSION_FONT_SIZE: '14px',
  /** バージョン情報の色 */
  VERSION_COLOR: '#999999',
  /** ボタンのフォントサイズ */
  BUTTON_FONT_SIZE: '16px',
  /** ダイアログタイトルのフォントサイズ */
  DIALOG_TITLE_FONT_SIZE: '20px',
  /** ダイアログ内容のフォントサイズ */
  DIALOG_CONTENT_FONT_SIZE: '16px',
} as const;

/**
 * ボタン・ダイアログのサイズ定数
 * @信頼性レベル 🔵 設計文書に基づくサイズ値
 */
const SIZES = {
  /** ボタンの幅 */
  BUTTON_WIDTH: 200,
  /** ボタンの高さ */
  BUTTON_HEIGHT: 50,
  /** ボタンの角丸半径 */
  BUTTON_RADIUS: 8,
  /** ダイアログボタンの幅 */
  DIALOG_BUTTON_WIDTH: 100,
  /** ダイアログボタンの高さ */
  DIALOG_BUTTON_HEIGHT: 40,
  /** ダイアログの角丸半径 */
  DIALOG_RADIUS: 12,
  /** 確認ダイアログの幅 */
  CONFIRM_DIALOG_WIDTH: 400,
  /** 確認ダイアログの高さ */
  CONFIRM_DIALOG_HEIGHT: 200,
  /** 設定ダイアログの幅 */
  SETTINGS_DIALOG_WIDTH: 300,
  /** 設定ダイアログの高さ */
  SETTINGS_DIALOG_HEIGHT: 150,
  /** エラーダイアログの幅 */
  ERROR_DIALOG_WIDTH: 400,
  /** エラーダイアログの高さ */
  ERROR_DIALOG_HEIGHT: 150,
} as const;

/**
 * Z-index（描画順序）定数
 * @信頼性レベル 🔵 設計文書に基づく値
 */
const DEPTH = {
  /** オーバーレイの描画深度 */
  OVERLAY: 300,
  /** ダイアログの描画深度 */
  DIALOG: 400,
} as const;

/**
 * アニメーション定数
 * @信頼性レベル 🟡 実装者が決定
 */
const ANIMATION = {
  /** ダイアログポップアップの時間（ミリ秒） */
  DIALOG_POPUP_DURATION: 300,
  /** 無効化時のアルファ値 */
  DISABLED_ALPHA: 0.5,
  /** オーバーレイのアルファ値 */
  OVERLAY_ALPHA: 0.7,
} as const;

/**
 * デフォルト画面サイズ
 * @信頼性レベル 🔵 設計文書に基づく値
 */
const DEFAULT_SCREEN = {
  WIDTH: 1280,
  HEIGHT: 720,
} as const;

/**
 * テキスト定数
 * @信頼性レベル 🔵 設計文書に基づく文字列
 */
const TEXT = {
  TITLE: 'ATELIER GUILD',
  SUBTITLE: '錬金術師ギルド',
  VERSION: 'Version 1.0.0',
  NEW_GAME: '新規ゲーム',
  CONTINUE: 'コンティニュー',
  SETTINGS: '設定',
  CONFIRM_TITLE: '確認',
  CONFIRM_MESSAGE: 'セーブデータを削除して新規ゲームを開始しますか？',
  YES: 'はい',
  NO: 'いいえ',
  OK: 'OK',
  SETTINGS_TITLE: '設定',
  SETTINGS_STUB: '準備中です',
  ERROR_TITLE: 'エラー',
} as const;

// =============================================================================
// 型定義
// =============================================================================

/**
 * セーブデータリポジトリのインターフェース
 *
 * 【機能概要】
 * セーブデータの永続化操作を定義。
 * 実際の永続化処理はリポジトリ実装クラスで行う。
 *
 * @信頼性レベル 🔵 設計文書準拠
 */
export interface ISaveDataRepository {
  /**
   * セーブデータの存在確認
   * @returns セーブデータが存在する場合true
   */
  exists(): boolean;

  /**
   * セーブデータの読み込み
   * @returns セーブデータ（存在しない場合はnull）
   * @throws セーブデータが破損している場合
   */
  load(): Promise<SaveData | null>;

  /**
   * セーブデータの保存
   * @param data 保存するセーブデータ
   */
  save(data: SaveData): Promise<void>;

  /**
   * セーブデータの削除
   */
  delete(): Promise<void>;
}

/**
 * セーブデータの型定義
 *
 * @信頼性レベル 🔵 設計文書準拠
 */
export interface SaveData {
  /** プレイヤー名 */
  playerName: string;
  /** ギルドランク */
  rank: string;
  /** ゲーム内日数 */
  day: number;
}

/**
 * ダイアログ設定の型定義
 */
interface DialogConfig {
  /** ダイアログのタイトル */
  title: string;
  /** ダイアログの内容 */
  content: string;
  /** ダイアログの幅 */
  width: number;
  /** ダイアログの高さ */
  height: number;
  /** アクションボタン設定 */
  actions: Array<{
    text: string;
    color: number;
    onClick: () => void;
  }>;
  /** 背景色（エラー用など） */
  backgroundColor?: number;
}

// =============================================================================
// TitleSceneクラス
// =============================================================================

/**
 * TitleScene - タイトル画面シーン
 *
 * 【責務】
 * - タイトルロゴ「ATELIER GUILD」の表示
 * - サブタイトル「錬金術師ギルド」の表示
 * - バージョン情報の表示
 * - 新規ゲーム、コンティニュー、設定ボタンの表示
 * - ボタンアクションに応じたシーン遷移・ダイアログ表示
 *
 * @信頼性レベル 🔵 設計文書（docs/design/atelier-guild-rank/ui-design/screens/title.md）に基づく
 */
export class TitleScene extends Phaser.Scene {
  // ===========================================================================
  // プロパティ
  // ===========================================================================

  /**
   * rexUIプラグイン参照（テストでモックされる）
   * @remarks rexUIプラグインの型は複雑なため、anyを使用
   */
  // biome-ignore lint/suspicious/noExplicitAny: rexUIプラグインの型は複雑なため
  protected rexUI: any;

  /**
   * セーブデータリポジトリ（テストでモックされる）
   */
  protected saveDataRepository: ISaveDataRepository | null = null;

  /**
   * ボタン参照（破棄時に使用）
   * @remarks rexUI Labelコンポーネントの型は複雑なため、anyを使用
   */
  // biome-ignore lint/suspicious/noExplicitAny: rexUI Labelコンポーネントの型は複雑なため
  private buttons: any[] = [];

  /**
   * コンティニューボタン参照（有効/無効制御に使用）
   * @remarks rexUI Labelコンポーネントの型は複雑なため、anyを使用
   */
  // biome-ignore lint/suspicious/noExplicitAny: rexUI Labelコンポーネントの型は複雑なため
  private continueButton: any | null = null;

  /**
   * コンティニューボタン有効状態
   */
  private continueEnabled = false;

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  /**
   * TitleSceneのコンストラクタ
   */
  constructor() {
    super({ key: 'TitleScene' });
  }

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * create() - タイトル画面の生成
   *
   * 【機能概要】
   * タイトルロゴ、サブタイトル、メニューボタンを表示する。
   *
   * 【実装方針】
   * 設計文書に基づいた座標、スタイルで要素を配置。
   *
   * @信頼性レベル 🔵 testcases.mdのテストケースに準拠
   */
  create(): void {
    const centerX = this.cameras.main.centerX;

    // タイトルロゴ表示
    this.createTitleLogo(centerX);

    // サブタイトル表示
    this.createSubtitle(centerX);

    // バージョン情報表示
    this.createVersionInfo();

    // セーブデータ存在チェック
    const hasSaveData = this.saveDataRepository?.exists() ?? false;
    this.continueEnabled = hasSaveData;

    // メニューボタン表示
    this.createMenuButtons(centerX, hasSaveData);

    // セーブデータ破損チェック（非同期）
    this.checkSaveDataIntegrity();
  }

  /**
   * シャットダウン処理
   * シーン破棄時にリソースを解放する。
   */
  shutdown(): void {
    for (const button of this.buttons) {
      if (button) {
        button.destroy();
      }
    }
    this.buttons = [];
    this.continueButton = null;
  }

  // ===========================================================================
  // UI生成メソッド（プライベート）
  // ===========================================================================

  /**
   * タイトルロゴを生成する
   * @param centerX 画面中央X座標
   */
  private createTitleLogo(centerX: number): void {
    this.add
      .text(centerX, LAYOUT.TITLE_Y, TEXT.TITLE, {
        fontSize: STYLES.TITLE_FONT_SIZE,
        color: STYLES.TITLE_COLOR,
      })
      .setOrigin(0.5);
  }

  /**
   * サブタイトルを生成する
   * @param centerX 画面中央X座標
   */
  private createSubtitle(centerX: number): void {
    this.add
      .text(centerX, LAYOUT.SUBTITLE_Y, TEXT.SUBTITLE, {
        fontSize: STYLES.SUBTITLE_FONT_SIZE,
        color: STYLES.SUBTITLE_COLOR,
      })
      .setOrigin(0.5);
  }

  /**
   * バージョン情報を生成する
   */
  private createVersionInfo(): void {
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;
    this.add
      .text(
        cameraWidth - LAYOUT.VERSION_OFFSET,
        cameraHeight - LAYOUT.VERSION_OFFSET,
        TEXT.VERSION,
        {
          fontSize: STYLES.VERSION_FONT_SIZE,
          color: STYLES.VERSION_COLOR,
        },
      )
      .setOrigin(1, 1);
  }

  /**
   * メニューボタンを生成する
   * @param centerX 画面中央X座標
   * @param hasSaveData セーブデータが存在するか
   */
  private createMenuButtons(centerX: number, hasSaveData: boolean): void {
    // 新規ゲームボタン
    const newGameButton = this.createButton(
      centerX,
      LAYOUT.BUTTON_START_Y,
      TEXT.NEW_GAME,
      THEME.colors.primary,
      () => this.onNewGameClick(),
    );
    this.buttons.push(newGameButton);

    // コンティニューボタン
    this.continueButton = this.createButton(
      centerX,
      LAYOUT.BUTTON_START_Y + LAYOUT.BUTTON_SPACING,
      TEXT.CONTINUE,
      THEME.colors.primary,
      () => this.onContinueClick(),
    );
    if (!hasSaveData) {
      this.continueButton.setAlpha(ANIMATION.DISABLED_ALPHA);
    }
    this.buttons.push(this.continueButton);

    // 設定ボタン
    const settingsButton = this.createButton(
      centerX,
      LAYOUT.BUTTON_START_Y + LAYOUT.BUTTON_SPACING * 2,
      TEXT.SETTINGS,
      THEME.colors.secondary,
      () => this.onSettingsClick(),
    );
    this.buttons.push(settingsButton);
  }

  /**
   * ボタンを生成する共通メソッド
   * @param x X座標
   * @param y Y座標
   * @param text ボタンテキスト
   * @param backgroundColor 背景色
   * @param onClick クリック時のコールバック
   * @returns 生成されたボタン（rexUI Labelコンポーネント）
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    backgroundColor: number,
    onClick: () => void,
    // biome-ignore lint/suspicious/noExplicitAny: rexUI Labelコンポーネントの型は複雑なため
  ): any {
    const buttonText = this.add.text(0, 0, text, {
      fontSize: STYLES.BUTTON_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    const buttonBackground = this.rexUI.add
      .roundRectangle({
        width: SIZES.BUTTON_WIDTH,
        height: SIZES.BUTTON_HEIGHT,
        radius: SIZES.BUTTON_RADIUS,
      })
      .setFillStyle(backgroundColor);

    const button = this.rexUI.add.label({
      background: buttonBackground,
      text: buttonText,
      align: 'center',
      x,
      y,
    });

    button.setInteractive();
    button.on('pointerdown', onClick);
    button.layout();

    return button;
  }

  // ===========================================================================
  // イベントハンドラ（プライベート）
  // ===========================================================================

  /**
   * 新規ゲームボタンクリック処理
   */
  private onNewGameClick(): void {
    const hasSaveData = this.saveDataRepository?.exists() ?? false;

    if (hasSaveData) {
      this.showConfirmDialog();
    } else {
      this.scene.start('MainScene');
    }
  }

  /**
   * コンティニューボタンクリック処理
   */
  private async onContinueClick(): Promise<void> {
    if (!this.continueEnabled) {
      return;
    }

    try {
      const saveData = await this.saveDataRepository?.load();
      if (saveData) {
        this.scene.start('MainScene', { saveData });
      }
    } catch (_error) {
      this.showErrorDialog('エラー: セーブデータの読み込みに失敗しました');
    }
  }

  /**
   * 設定ボタンクリック処理
   */
  private onSettingsClick(): void {
    this.showSettingsDialog();
  }

  // ===========================================================================
  // ダイアログ表示メソッド（プライベート）
  // ===========================================================================

  /**
   * 確認ダイアログを表示する
   */
  private showConfirmDialog(): void {
    const { overlay, centerX, centerY } = this.createDialogOverlay();

    const dialogConfig: DialogConfig = {
      title: TEXT.CONFIRM_TITLE,
      content: TEXT.CONFIRM_MESSAGE,
      width: SIZES.CONFIRM_DIALOG_WIDTH,
      height: SIZES.CONFIRM_DIALOG_HEIGHT,
      actions: [
        {
          text: TEXT.YES,
          color: THEME.colors.primary,
          onClick: () => {
            this.saveDataRepository?.delete();
            overlay.destroy();
            dialog.destroy();
            this.scene.start('MainScene');
          },
        },
        {
          text: TEXT.NO,
          color: THEME.colors.secondary,
          onClick: () => {
            overlay.destroy();
            dialog.destroy();
          },
        },
      ],
    };

    const dialog = this.createDialog(centerX, centerY, dialogConfig);
  }

  /**
   * 設定ダイアログを表示する（Phase 1スタブ）
   */
  private showSettingsDialog(): void {
    const { overlay, centerX, centerY } = this.createDialogOverlay();

    const dialogConfig: DialogConfig = {
      title: TEXT.SETTINGS_TITLE,
      content: TEXT.SETTINGS_STUB,
      width: SIZES.SETTINGS_DIALOG_WIDTH,
      height: SIZES.SETTINGS_DIALOG_HEIGHT,
      actions: [
        {
          text: TEXT.OK,
          color: THEME.colors.primary,
          onClick: () => {
            overlay.destroy();
            dialog.destroy();
          },
        },
      ],
    };

    const dialog = this.createDialog(centerX, centerY, dialogConfig);
  }

  /**
   * エラーダイアログを表示する
   * @param message エラーメッセージ
   */
  private showErrorDialog(message: string): void {
    const { overlay, centerX, centerY } = this.createDialogOverlay();

    const dialogConfig: DialogConfig = {
      title: TEXT.ERROR_TITLE,
      content: message,
      width: SIZES.ERROR_DIALOG_WIDTH,
      height: SIZES.ERROR_DIALOG_HEIGHT,
      backgroundColor: THEME.colors.error || THEME.colors.secondary,
      actions: [
        {
          text: TEXT.OK,
          color: THEME.colors.primary,
          onClick: () => {
            overlay.destroy();
            dialog.destroy();
          },
        },
      ],
    };

    const dialog = this.createDialog(centerX, centerY, dialogConfig);
  }

  /**
   * ダイアログ用オーバーレイを作成する
   * @returns オーバーレイと中央座標
   */
  private createDialogOverlay(): {
    overlay: Phaser.GameObjects.Rectangle;
    centerX: number;
    centerY: number;
  } {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const sceneWidth = this.scale?.width || DEFAULT_SCREEN.WIDTH;
    const sceneHeight = this.scale?.height || DEFAULT_SCREEN.HEIGHT;

    const overlay = this.add.rectangle(
      sceneWidth / 2,
      sceneHeight / 2,
      sceneWidth,
      sceneHeight,
      0x000000,
    );
    overlay.setAlpha(ANIMATION.OVERLAY_ALPHA);
    overlay.setDepth(DEPTH.OVERLAY);

    return { overlay, centerX, centerY };
  }

  /**
   * ダイアログを作成する共通メソッド
   * @param centerX 中央X座標
   * @param centerY 中央Y座標
   * @param config ダイアログ設定
   * @returns 生成されたダイアログ
   */
  // biome-ignore lint/suspicious/noExplicitAny: rexUI Dialogコンポーネントの型は複雑なため
  private createDialog(centerX: number, centerY: number, config: DialogConfig): any {
    const titleText = this.add.text(0, 0, config.title, {
      fontSize: STYLES.DIALOG_TITLE_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    const contentText = this.add.text(0, 0, config.content, {
      fontSize: STYLES.DIALOG_CONTENT_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    const actionButtons = config.actions.map((action) => {
      const button = this.rexUI.add.label({
        background: this.rexUI.add
          .roundRectangle({
            width: SIZES.DIALOG_BUTTON_WIDTH,
            height: SIZES.DIALOG_BUTTON_HEIGHT,
            radius: SIZES.BUTTON_RADIUS,
          })
          .setFillStyle(action.color),
        text: this.add.text(0, 0, action.text, {
          fontSize: STYLES.BUTTON_FONT_SIZE,
          color: THEME.colors.textOnPrimary,
        }),
        align: 'center',
      });

      button.setInteractive();
      button.on('pointerdown', action.onClick);
      button.layout();

      return button;
    });

    const dialog = this.rexUI.add.dialog({
      x: centerX,
      y: centerY,
      width: config.width,
      height: config.height,
      background: this.rexUI.add
        .roundRectangle({
          width: config.width,
          height: config.height,
          radius: SIZES.DIALOG_RADIUS,
        })
        .setFillStyle(config.backgroundColor ?? THEME.colors.secondary),
      title: titleText,
      content: contentText,
      actions: actionButtons,
    });

    dialog.layout();
    dialog.setDepth(DEPTH.DIALOG);
    dialog.popUp(ANIMATION.DIALOG_POPUP_DURATION);

    return dialog;
  }

  // ===========================================================================
  // ユーティリティメソッド（プライベート）
  // ===========================================================================

  /**
   * セーブデータの整合性チェック（破損チェック）
   * 破損している場合はコンティニューボタンを無効化する。
   */
  private async checkSaveDataIntegrity(): Promise<void> {
    if (!this.saveDataRepository?.exists()) {
      return;
    }

    try {
      await this.saveDataRepository.load();
    } catch (_error) {
      console.warn('Save data is corrupted:', _error);
      this.continueEnabled = false;
      if (this.continueButton) {
        this.continueButton.setAlpha(ANIMATION.DISABLED_ALPHA);
      }
    }
  }
}
