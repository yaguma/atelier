/**
 * TitleDialogコンポーネント
 * TASK-0058 TitleSceneリファクタリング
 *
 * @description
 * タイトルシーンのダイアログを表示するコンポーネント
 * - 確認ダイアログ（はい/いいえ）
 * - 設定ダイアログ（OKのみ）
 * - エラーダイアログ（OKのみ）
 */

import type { RexDialog, RexLabel } from '@presentation/types/rexui';
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { THEME } from '@presentation/ui/theme';
import type Phaser from 'phaser';
import {
  type ITitleDialogConfig,
  TITLE_ANIMATION,
  TITLE_DEPTH,
  TITLE_SIZES,
  TITLE_STYLES,
  TITLE_TEXT,
} from './types';

/** デフォルト画面サイズ */
const DEFAULT_SCREEN = {
  WIDTH: 1280,
  HEIGHT: 720,
} as const;

/**
 * TitleDialogコンポーネント
 * タイトル画面のダイアログを担当
 */
export class TitleDialog extends BaseComponent {
  /** ダイアログ設定 */
  private config: ITitleDialogConfig;

  /** オーバーレイ */
  private overlay: Phaser.GameObjects.Rectangle | null = null;

  /**
   * ダイアログ参照
   * TASK-0059: rexUI型定義を適用
   */
  private dialog: RexDialog | null = null;

  /** クローズ済みフラグ */
  private isClosed = false;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param config ダイアログ設定
   */
  constructor(scene: Phaser.Scene, config: ITitleDialogConfig) {
    super(scene, 0, 0);

    // 入力バリデーション
    const validTypes = ['confirm', 'settings', 'error'];
    if (!validTypes.includes(config.type)) {
      throw new Error('TitleDialog: invalid dialog type');
    }

    this.config = config;
  }

  /**
   * コンポーネントを作成（ダミー実装）
   * show()を直接呼び出すことを想定
   */
  create(): void {
    // ダイアログはshow()で作成するため、ここでは何もしない
  }

  /**
   * ダイアログを表示
   */
  show(): void {
    if (this.isClosed) {
      return;
    }

    // オーバーレイを作成
    this.createOverlay();

    // ダイアログを作成
    this.createDialog();
  }

  /**
   * オーバーレイを作成
   */
  private createOverlay(): void {
    const sceneWidth = this.scene.scale?.width || DEFAULT_SCREEN.WIDTH;
    const sceneHeight = this.scene.scale?.height || DEFAULT_SCREEN.HEIGHT;

    this.overlay = this.scene.add.rectangle(
      sceneWidth / 2,
      sceneHeight / 2,
      sceneWidth,
      sceneHeight,
      0x000000,
    );
    this.overlay.setAlpha(TITLE_ANIMATION.OVERLAY_ALPHA);
    this.overlay.setDepth(TITLE_DEPTH.OVERLAY);
  }

  /**
   * ダイアログを作成
   */
  private createDialog(): void {
    if (!this.rexUI) {
      console.warn('TitleDialog: rexUI is not available');
      return;
    }

    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // ダイアログサイズを取得
    const { width, height, backgroundColor } = this.getDialogSize();

    // 背景
    const dialogBackground = this.rexUI.add.roundRectangle(
      0,
      0,
      width,
      height,
      TITLE_SIZES.DIALOG_RADIUS,
      backgroundColor,
    );

    // タイトル
    const titleText = this.scene.add.text(0, 0, this.config.title, {
      fontFamily: THEME.fonts.primary,
      fontSize: TITLE_STYLES.DIALOG_TITLE_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    // 内容
    const contentText = this.scene.add.text(0, 0, this.config.content, {
      fontFamily: THEME.fonts.primary,
      fontSize: TITLE_STYLES.DIALOG_CONTENT_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    // アクションボタン（nullを除外）
    const actionButtons = this.createActionButtons().filter((btn): btn is RexLabel => btn !== null);

    // ダイアログ
    this.dialog = this.rexUI.add.dialog({
      x: centerX,
      y: centerY,
      width,
      height,
      background: dialogBackground,
      title: titleText,
      content: contentText,
      actions: actionButtons,
    });

    this.dialog.layout();
    this.dialog.setDepth(TITLE_DEPTH.DIALOG);
    this.dialog.popUp(TITLE_ANIMATION.DIALOG_POPUP_DURATION);
  }

  /**
   * ダイアログサイズと背景色を取得
   */
  private getDialogSize(): { width: number; height: number; backgroundColor: number } {
    switch (this.config.type) {
      case 'confirm':
        return {
          width: TITLE_SIZES.CONFIRM_DIALOG_WIDTH,
          height: TITLE_SIZES.CONFIRM_DIALOG_HEIGHT,
          backgroundColor: THEME.colors.secondary,
        };
      case 'settings':
        return {
          width: TITLE_SIZES.SETTINGS_DIALOG_WIDTH,
          height: TITLE_SIZES.SETTINGS_DIALOG_HEIGHT,
          backgroundColor: THEME.colors.secondary,
        };
      case 'error':
        return {
          width: TITLE_SIZES.ERROR_DIALOG_WIDTH,
          height: TITLE_SIZES.ERROR_DIALOG_HEIGHT,
          backgroundColor: THEME.colors.error || THEME.colors.secondary,
        };
      default:
        return {
          width: TITLE_SIZES.CONFIRM_DIALOG_WIDTH,
          height: TITLE_SIZES.CONFIRM_DIALOG_HEIGHT,
          backgroundColor: THEME.colors.secondary,
        };
    }
  }

  /**
   * アクションボタンを作成
   * TASK-0059: rexUI型定義を適用
   */
  private createActionButtons(): Array<RexLabel | null> {
    if (this.config.type === 'confirm') {
      // 確認ダイアログ: はい/いいえ
      return [
        this.createButton(TITLE_TEXT.YES, THEME.colors.primary, () => {
          if (this.config.onConfirm) {
            this.config.onConfirm();
          }
          this.close();
        }),
        this.createButton(TITLE_TEXT.NO, THEME.colors.secondary, () => {
          this.close();
        }),
      ];
    }
    // 設定/エラーダイアログ: OKのみ
    return [
      this.createButton(TITLE_TEXT.OK, THEME.colors.primary, () => {
        this.close();
      }),
    ];
  }

  /**
   * ボタンを作成
   * TASK-0059: rexUI型定義を適用
   */
  private createButton(text: string, color: number, onClick: () => void): RexLabel | null {
    if (!this.rexUI) {
      return null;
    }

    const actionBg = this.rexUI.add.roundRectangle(
      0,
      0,
      TITLE_SIZES.DIALOG_BUTTON_WIDTH,
      TITLE_SIZES.DIALOG_BUTTON_HEIGHT,
      TITLE_SIZES.BUTTON_RADIUS,
      color,
    );

    const actionText = this.scene.add.text(0, 0, text, {
      fontFamily: THEME.fonts.primary,
      fontSize: TITLE_STYLES.BUTTON_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    const button = this.rexUI.add.label({
      width: TITLE_SIZES.DIALOG_BUTTON_WIDTH,
      height: TITLE_SIZES.DIALOG_BUTTON_HEIGHT,
      background: actionBg,
      text: actionText,
      align: 'center',
      space: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 5,
      },
    });

    button.setInteractive();
    button.on('pointerdown', onClick);
    button.layout();

    return button;
  }

  /**
   * ダイアログを閉じる
   */
  close(): void {
    if (this.isClosed) {
      return;
    }
    this.isClosed = true;

    // コールバックを呼び出す
    if (this.config.onClose) {
      this.config.onClose();
    }

    // リソースを破棄
    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = null;
    }
    if (this.dialog) {
      this.dialog.destroy();
      this.dialog = null;
    }
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    this.close();
    this.container.destroy();
  }
}
