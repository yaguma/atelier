/**
 * TitleMenuコンポーネント
 * TASK-0058 TitleSceneリファクタリング
 *
 * @description
 * タイトルシーンのメニューボタンを表示するコンポーネント
 * - 新規ゲームボタン
 * - コンティニューボタン
 * - 設定ボタン
 */

import type { RexLabel } from '@presentation/types/rexui';
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { Colors, THEME, toColorStr } from '@presentation/ui/theme';
import type Phaser from 'phaser';
import {
  type ITitleMenuConfig,
  TITLE_ANIMATION,
  TITLE_LAYOUT,
  TITLE_SIZES,
  TITLE_STYLES,
  TITLE_TEXT,
} from './types';

/**
 * TitleMenuコンポーネント
 * タイトル画面のメニューボタンを担当
 */
export class TitleMenu extends BaseComponent {
  /** メニュー設定 */
  private config: ITitleMenuConfig;

  /**
   * ボタン参照（破棄時に使用）
   * TASK-0059: rexUI型定義を適用
   */
  private buttons: RexLabel[] = [];

  /**
   * コンティニューボタン参照
   * TASK-0059: rexUI型定義を適用
   */
  private continueButton: RexLabel | null = null;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param x X座標
   * @param y Y座標
   * @param config メニュー設定
   */
  constructor(scene: Phaser.Scene, x: number, y: number, config: ITitleMenuConfig) {
    super(scene, x, y);

    // 入力バリデーション
    if (!config.onNewGame) {
      throw new Error('TitleMenu: onNewGame callback is required');
    }

    this.config = config;
  }

  /**
   * コンポーネントを作成
   */
  create(): void {
    const centerX = this.container.x;

    // 新規ゲームボタン（プライマリ）
    const newGameButton = this.createButton(
      centerX,
      TITLE_LAYOUT.BUTTON_START_Y,
      TITLE_TEXT.NEW_GAME,
      'primary',
      () => this.handleNewGameClick(),
    );
    if (newGameButton) {
      this.buttons.push(newGameButton);
    }

    // コンティニューボタン（セカンダリ: 透明＋枠線2px）
    this.continueButton = this.createButton(
      centerX,
      TITLE_LAYOUT.BUTTON_START_Y + TITLE_LAYOUT.BUTTON_SPACING,
      TITLE_TEXT.CONTINUE,
      'secondary',
      () => this.handleContinueClick(),
    );
    if (this.continueButton) {
      if (!this.config.hasSaveData) {
        this.continueButton.setAlpha(TITLE_ANIMATION.DISABLED_ALPHA);
      }
      this.buttons.push(this.continueButton);
    }

    // 設定ボタン（TASK-0001 第3スタイル: ターシャリ）
    const settingsButton = this.createButton(
      centerX,
      TITLE_LAYOUT.BUTTON_START_Y + TITLE_LAYOUT.BUTTON_SPACING * 2,
      TITLE_TEXT.SETTINGS,
      'tertiary',
      () => this.handleSettingsClick(),
    );
    if (settingsButton) {
      this.buttons.push(settingsButton);
    }
  }

  /**
   * ボタンを生成する共通メソッド
   * TASK-0059: rexUI型定義を適用
   * @param x X座標
   * @param y Y座標
   * @param text ボタンテキスト
   * @param backgroundColor 背景色
   * @param onClick クリック時のコールバック
   * @returns 生成されたボタン
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    variant: 'primary' | 'secondary' | 'tertiary',
    onClick: () => void,
  ): RexLabel | null {
    if (!this.rexUI) {
      console.warn('TitleMenu: rexUI is not available');
      return null;
    }

    // バリアント別スタイル（モック01・design-guide §ボタン準拠）
    // primary: 草色塗り＋白文字 / secondary: 透明＋枠線2px / tertiary: 透明＋枠線1.5px＋ミューテッド文字
    const fillColor = variant === 'primary' ? THEME.colors.primary : Colors.surface.card;
    const stroke =
      variant === 'secondary'
        ? { width: 2, color: Colors.border.default }
        : variant === 'tertiary'
          ? { width: 1.5, color: Colors.border.subtle }
          : null;
    const textColor =
      variant === 'primary'
        ? THEME.colors.textOnPrimary
        : variant === 'tertiary'
          ? toColorStr(Colors.text.muted)
          : toColorStr(Colors.text.primary);
    const fontSize = variant === 'tertiary' ? '13px' : TITLE_STYLES.BUTTON_FONT_SIZE;

    const buttonBackground = this.rexUI.add.roundRectangle(
      0,
      0,
      TITLE_SIZES.BUTTON_WIDTH,
      TITLE_SIZES.BUTTON_HEIGHT,
      TITLE_SIZES.BUTTON_RADIUS,
      fillColor,
    );
    if (stroke && buttonBackground.setStrokeStyle) {
      buttonBackground.setStrokeStyle(stroke.width, stroke.color);
    }

    const buttonText = this.scene.add.text(0, 0, text, {
      fontFamily: THEME.fonts.primary,
      fontSize,
      color: textColor,
    });

    const button = this.rexUI.add.label({
      width: TITLE_SIZES.BUTTON_WIDTH,
      height: TITLE_SIZES.BUTTON_HEIGHT,
      background: buttonBackground,
      text: buttonText,
      align: 'center',
      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
      x,
      y,
    });

    button.setInteractive();
    button.on('pointerdown', onClick);
    button.layout();

    return button;
  }

  /**
   * 新規ゲームボタンクリック処理
   * テストから呼び出し可能
   */
  handleNewGameClick(): void {
    this.config.onNewGame();
  }

  /**
   * コンティニューボタンクリック処理
   * テストから呼び出し可能
   */
  handleContinueClick(): void {
    if (!this.config.hasSaveData) {
      return;
    }
    this.config.onContinue();
  }

  /**
   * 設定ボタンクリック処理
   * テストから呼び出し可能
   */
  handleSettingsClick(): void {
    this.config.onSettings();
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    for (const button of this.buttons) {
      if (button) {
        button.destroy();
      }
    }
    this.buttons = [];
    this.continueButton = null;
    this.container.destroy();
  }
}
