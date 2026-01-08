/**
 * UIFactory基盤クラス
 *
 * rexUIを使用したUI要素の生成を一元管理する。
 * 各コンポーネント生成メソッドは後続タスクで実装予定。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import Phaser from 'phaser';
import type UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';
import type Label from 'phaser3-rex-plugins/templates/ui/label/Label';
import type RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle';
import type {
  ButtonOptions,
  LabelOptions,
  PanelOptions,
  DialogOptions,
  ProgressBarOptions,
  ScrollPanelOptions,
  GridButtonsOptions,
  ToastOptions,
  TooltipOptions,
  UIBaseStyle,
  UIPadding,
} from './UITypes';

/**
 * デフォルトスタイル設定
 */
export const DefaultUIStyles = {
  /** ボタンのデフォルトスタイル */
  button: {
    backgroundColor: Colors.primary,
    cornerRadius: 8,
    padding: { top: 10, bottom: 10, left: 20, right: 20 },
  } satisfies UIBaseStyle,

  /** パネルのデフォルトスタイル */
  panel: {
    backgroundColor: Colors.panelBackground,
    borderColor: Colors.panelBorder,
    borderWidth: 2,
    cornerRadius: 12,
    padding: 16,
  } satisfies UIBaseStyle,

  /** ダイアログのデフォルトスタイル */
  dialog: {
    backgroundColor: Colors.panelBackground,
    borderColor: Colors.gold,
    borderWidth: 2,
    cornerRadius: 16,
    padding: 24,
  } satisfies UIBaseStyle,

  /** プログレスバーのデフォルトスタイル */
  progressBar: {
    backgroundColor: Colors.backgroundDark,
    cornerRadius: 4,
  } satisfies UIBaseStyle,
} as const;

/**
 * UIFactory基盤クラス
 *
 * シーン内でのUI要素生成を一元管理し、以下の機能を提供：
 * - 共通スタイルの適用
 * - rexUIコンポーネントの生成
 * - ユーティリティメソッド
 *
 * @example
 * ```typescript
 * // BaseGameSceneのcreate()で使用
 * const uiFactory = new UIFactory(this, this.rexUI);
 *
 * const button = uiFactory.createButton({
 *   x: 640,
 *   y: 400,
 *   text: 'Start Game',
 *   onClick: () => this.goToScene(SceneKeys.MAIN),
 * });
 * ```
 */
export class UIFactory {
  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param rexUI rexUIプラグイン
   */
  constructor(
    protected scene: Phaser.Scene,
    protected rexUI: UIPlugin
  ) {}

  // =====================================================
  // コンポーネント生成メソッド（後続タスクで実装）
  // =====================================================

  /**
   * ボタンを生成
   *
   * rexUIのLabelコンポーネントを使用してボタンを生成する。
   * ホバー、プレス、無効状態をサポートし、クリックイベントを設定可能。
   *
   * @param options ボタンオプション
   * @returns rexUI Labelオブジェクト
   *
   * @example
   * ```typescript
   * const button = uiFactory.createButton({
   *   x: 640,
   *   y: 400,
   *   text: 'Start Game',
   *   onClick: () => console.log('clicked!'),
   * });
   * ```
   */
  createButton(options: ButtonOptions): Label {
    const {
      x,
      y,
      text,
      width,
      height,
      style,
      textStyle,
      onClick,
      disabled = false,
      icon,
      iconSize,
    } = options;

    // スタイル設定を取得
    const normalColor = style?.normal ?? style?.backgroundColor ?? Colors.primary;
    const hoverColor = style?.hover ?? Colors.primaryHover;
    const pressedColor = style?.pressed ?? Colors.primaryActive;
    const disabledColor = style?.disabled ?? Colors.disabled;
    const cornerRadius = style?.cornerRadius ?? DefaultUIStyles.button.cornerRadius;

    // パディング設定を取得
    const padding = this.getPadding(
      style?.padding ?? DefaultUIStyles.button.padding
    );

    // 現在の背景色（状態管理用）
    const currentColor = disabled ? disabledColor : normalColor;

    // 背景の角丸四角形を生成
    const background = this.rexUI.add.roundRectangle(
      0,
      0,
      width ?? 150,
      height ?? 44,
      cornerRadius,
      currentColor
    ) as RoundRectangle;

    // テキストオブジェクトを生成
    const textObject = this.scene.add.text(
      0,
      0,
      text,
      textStyle ?? TextStyles.button
    );

    // アイコンオブジェクトを生成（オプション）
    let iconObject: Phaser.GameObjects.Image | undefined;
    if (icon) {
      iconObject = this.scene.add.image(0, 0, icon);
      if (iconSize) {
        iconObject.setDisplaySize(iconSize, iconSize);
      }
    }

    // Labelを生成
    const button = this.rexUI.add.label({
      x,
      y,
      width: width ?? undefined,
      height: height ?? undefined,
      background,
      icon: iconObject,
      text: textObject,
      space: {
        left: padding.left,
        right: padding.right,
        top: padding.top,
        bottom: padding.bottom,
        icon: iconObject ? 8 : 0,
      },
      align: 'center',
    }) as Label;

    // レイアウトを適用
    button.layout();

    // インタラクションを設定（無効でない場合）
    if (!disabled) {
      button.setInteractive({ useHandCursor: true });

      // ホバー時
      button.on('pointerover', () => {
        background.setFillStyle(hoverColor);
      });

      // ホバー解除時
      button.on('pointerout', () => {
        background.setFillStyle(normalColor);
      });

      // プレス時
      button.on('pointerdown', () => {
        background.setFillStyle(pressedColor);
        this.scene.tweens.add({
          targets: button,
          scaleX: 0.95,
          scaleY: 0.95,
          duration: 50,
        });
      });

      // リリース時
      button.on('pointerup', () => {
        background.setFillStyle(hoverColor);
        this.scene.tweens.add({
          targets: button,
          scaleX: 1,
          scaleY: 1,
          duration: 50,
          onComplete: () => {
            if (onClick) {
              onClick();
            }
          },
        });
      });
    }

    return button;
  }

  /**
   * プライマリボタンを生成（デフォルトスタイル）
   * @param options ボタンオプション（styleを除く）
   * @returns rexUI Labelオブジェクト
   */
  createPrimaryButton(options: Omit<ButtonOptions, 'style'>): Label {
    return this.createButton({
      ...options,
      style: {
        backgroundColor: Colors.primary,
        normal: Colors.primary,
        hover: Colors.primaryHover,
        pressed: Colors.primaryActive,
        cornerRadius: 8,
      },
    });
  }

  /**
   * セカンダリボタンを生成
   * @param options ボタンオプション（styleを除く）
   * @returns rexUI Labelオブジェクト
   */
  createSecondaryButton(options: Omit<ButtonOptions, 'style'>): Label {
    return this.createButton({
      ...options,
      style: {
        backgroundColor: Colors.secondary,
        normal: Colors.secondary,
        hover: Colors.secondaryHover,
        pressed: Colors.secondary,
        cornerRadius: 8,
      },
    });
  }

  /**
   * 危険ボタンを生成（削除などの操作用）
   * @param options ボタンオプション（styleを除く）
   * @returns rexUI Labelオブジェクト
   */
  createDangerButton(options: Omit<ButtonOptions, 'style'>): Label {
    return this.createButton({
      ...options,
      style: {
        backgroundColor: Colors.danger,
        normal: Colors.danger,
        hover: 0xec4555, // 少し明るい赤
        pressed: 0xcc2535, // 少し暗い赤
        cornerRadius: 8,
      },
    });
  }

  /**
   * ボタンの有効/無効を切り替える
   * @param button 対象のボタン
   * @param enabled 有効状態
   */
  setButtonEnabled(button: Label, enabled: boolean): void {
    const background = (button as unknown as { getElement(name: string): RoundRectangle }).getElement('background');
    if (enabled) {
      button.setInteractive({ useHandCursor: true });
      background.setFillStyle(Colors.primary);
    } else {
      button.disableInteractive();
      background.setFillStyle(Colors.disabled);
    }
  }

  /**
   * ラベルを生成
   *
   * rexUIのLabelコンポーネントを使用してアイコン付きラベルを生成する。
   * アイコンの有無、配置方向（水平/垂直）をサポート。
   *
   * @param options ラベルオプション
   * @returns rexUI Labelオブジェクト
   *
   * @example
   * ```typescript
   * // テキストのみのラベル
   * const label = uiFactory.createLabel({
   *   x: 100,
   *   y: 100,
   *   text: 'Hello World',
   * });
   *
   * // アイコン付きラベル
   * const iconLabel = uiFactory.createLabel({
   *   x: 100,
   *   y: 150,
   *   text: '100',
   *   icon: 'icon-gold',
   *   iconSize: 24,
   * });
   * ```
   */
  createLabel(options: LabelOptions): Label {
    const {
      x,
      y,
      text,
      icon,
      iconSize,
      textStyle,
      orientation = 'horizontal',
      space = 8,
      align = 'center',
    } = options;

    // ラベル設定オブジェクト
    const labelConfig: Record<string, unknown> = {
      x,
      y,
      orientation,
      space: { icon: space },
      align,
    };

    // アイコンオブジェクトを生成（オプション）
    if (icon) {
      const iconObject = this.scene.add.image(0, 0, icon);
      if (iconSize) {
        iconObject.setDisplaySize(iconSize, iconSize);
      }
      labelConfig.icon = iconObject;
    }

    // テキストオブジェクトを生成
    const textObject = this.scene.add.text(
      0,
      0,
      text,
      textStyle ?? TextStyles.body
    );
    labelConfig.text = textObject;

    // Labelを生成してレイアウト適用
    const label = this.rexUI.add.label(labelConfig) as Label;
    label.layout();

    return label;
  }

  /**
   * 値表示用ラベル（アイコン + 値）を生成
   *
   * @param options 値ラベルオプション
   * @returns rexUI Labelオブジェクト
   *
   * @example
   * ```typescript
   * const goldLabel = uiFactory.createValueLabel({
   *   x: 100,
   *   y: 100,
   *   icon: 'icon-gold',
   *   value: 1000,
   * });
   * ```
   */
  createValueLabel(options: {
    x: number;
    y: number;
    icon: string;
    value: number | string;
    iconSize?: number;
    valueStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  }): Label {
    const { x, y, icon, value, iconSize = 24, valueStyle } = options;

    return this.createLabel({
      x,
      y,
      icon,
      iconSize,
      text: String(value),
      textStyle: valueStyle ?? TextStyles.number,
      orientation: 'horizontal',
      space: 8,
    });
  }

  /**
   * タイトルラベルを生成
   *
   * @param options タイトルラベルオプション
   * @returns Phaserテキストオブジェクト
   */
  createTitleLabel(options: {
    x: number;
    y: number;
    text: string;
    size?: 'large' | 'medium' | 'small';
  }): Phaser.GameObjects.Text {
    const { x, y, text, size = 'medium' } = options;

    const styleKey = size === 'large' ? 'titleLarge' :
                     size === 'small' ? 'titleSmall' : 'titleMedium';

    return this.scene.add.text(x, y, text, TextStyles[styleKey])
      .setOrigin(0.5);
  }

  /**
   * 説明ラベルを生成
   *
   * @param options 説明ラベルオプション
   * @returns Phaserテキストオブジェクト
   */
  createDescriptionLabel(options: {
    x: number;
    y: number;
    text: string;
    width?: number;
  }): Phaser.GameObjects.Text {
    const { x, y, text, width } = options;

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      ...TextStyles.body,
    };

    if (width) {
      style.wordWrap = { width };
    }

    return this.scene.add.text(x, y, text, style);
  }

  /**
   * ラベルのテキストを更新
   * @param label 対象のラベル
   * @param text 新しいテキスト
   */
  updateLabelText(label: Label, text: string): void {
    const textObj = (label as unknown as { getElement(name: string): Phaser.GameObjects.Text | undefined }).getElement('text');
    if (textObj) {
      textObj.setText(text);
      label.layout();
    }
  }

  /**
   * ラベルのアイコンを更新
   * @param label 対象のラベル
   * @param iconKey 新しいアイコンのアセットキー
   */
  updateLabelIcon(label: Label, iconKey: string): void {
    const iconObj = (label as unknown as { getElement(name: string): Phaser.GameObjects.Image | undefined }).getElement('icon');
    if (iconObj && iconObj instanceof Phaser.GameObjects.Image) {
      iconObj.setTexture(iconKey);
      label.layout();
    }
  }

  /**
   * パネルを生成
   * @param options パネルオプション
   * @returns rexUI Sizerオブジェクト
   * @see TASK-0175
   */
  createPanel(_options: PanelOptions): unknown {
    throw new Error('Not implemented - see TASK-0175');
  }

  /**
   * ダイアログを生成
   * @param options ダイアログオプション
   * @returns rexUI Dialogオブジェクト
   * @see TASK-0176
   */
  createDialog(_options: DialogOptions): unknown {
    throw new Error('Not implemented - see TASK-0176');
  }

  /**
   * プログレスバーを生成
   * @param options プログレスバーオプション
   * @returns rexUI ProgressBarオブジェクト
   * @see TASK-0177
   */
  createProgressBar(_options: ProgressBarOptions): unknown {
    throw new Error('Not implemented - see TASK-0177');
  }

  /**
   * スクロールパネルを生成
   * @param options スクロールパネルオプション
   * @returns rexUI ScrollablePanelオブジェクト
   * @see TASK-0178
   */
  createScrollPanel(_options: ScrollPanelOptions): unknown {
    throw new Error('Not implemented - see TASK-0178');
  }

  /**
   * グリッドボタンを生成
   * @param options グリッドボタンオプション
   * @returns rexUI GridButtonsオブジェクト
   * @see TASK-0179
   */
  createGridButtons(_options: GridButtonsOptions): unknown {
    throw new Error('Not implemented - see TASK-0179');
  }

  /**
   * トーストを表示
   * @param options トーストオプション
   * @see TASK-0180
   */
  showToast(_options: ToastOptions): void {
    throw new Error('Not implemented - see TASK-0180');
  }

  /**
   * ツールチップを追加
   * @param options ツールチップオプション
   * @see TASK-0180
   */
  addTooltip(_options: TooltipOptions): void {
    throw new Error('Not implemented - see TASK-0180');
  }

  // =====================================================
  // ユーティリティメソッド
  // =====================================================

  /**
   * パディング設定を正規化して取得
   * @param padding パディング設定（数値またはオブジェクト）
   * @returns 正規化されたパディングオブジェクト
   */
  protected getPadding(padding: number | UIPadding): Required<UIPadding> {
    if (typeof padding === 'number') {
      return { top: padding, bottom: padding, left: padding, right: padding };
    }
    return {
      top: padding.top ?? 0,
      bottom: padding.bottom ?? 0,
      left: padding.left ?? 0,
      right: padding.right ?? 0,
    };
  }

  /**
   * 角丸四角形を生成
   * @param x X座標
   * @param y Y座標
   * @param width 幅
   * @param height 高さ
   * @param color 塗りつぶし色
   * @param radius 角丸半径
   * @returns Graphics オブジェクト
   */
  createRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    radius: number = 8
  ): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    return graphics;
  }

  /**
   * 枠線付き角丸四角形を生成
   * @param x X座標
   * @param y Y座標
   * @param width 幅
   * @param height 高さ
   * @param fillColor 塗りつぶし色
   * @param strokeColor 枠線色
   * @param strokeWidth 枠線幅
   * @param radius 角丸半径
   * @returns Graphics オブジェクト
   */
  createRoundedRectWithStroke(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
    strokeColor: number,
    strokeWidth: number = 2,
    radius: number = 8
  ): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();

    // 塗りつぶし
    graphics.fillStyle(fillColor);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);

    // 枠線
    graphics.lineStyle(strokeWidth, strokeColor);
    graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius);

    return graphics;
  }

  /**
   * テキストを生成（共通スタイル適用）
   * @param x X座標
   * @param y Y座標
   * @param text テキスト内容
   * @param style スタイル（省略時はbody）
   * @returns Textオブジェクト
   */
  createText(
    x: number,
    y: number,
    text: string,
    style: keyof typeof TextStyles = 'body'
  ): Phaser.GameObjects.Text {
    return this.scene.add.text(x, y, text, TextStyles[style]).setOrigin(0.5);
  }

  /**
   * rexUIプラグインを取得
   */
  getRexUI(): UIPlugin {
    return this.rexUI;
  }

  /**
   * シーンを取得
   */
  getScene(): Phaser.Scene {
    return this.scene;
  }
}
