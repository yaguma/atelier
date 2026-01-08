/**
 * UIFactory基盤クラス
 *
 * rexUIを使用したUI要素の生成を一元管理する。
 * 各コンポーネント生成メソッドは後続タスクで実装予定。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import Phaser from 'phaser';
import type UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import { Colors, OverlayAlpha } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';
import type Label from 'phaser3-rex-plugins/templates/ui/label/Label';
import type RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle';
import type Dialog from 'phaser3-rex-plugins/templates/ui/dialog/Dialog';
import type {
  ButtonOptions,
  LabelOptions,
  PanelOptions,
  DialogOptions,
  ProgressBarOptions,
  ProgressBarObject,
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
   *
   * rexUIのDialogコンポーネントを使用してモーダルダイアログを生成する。
   * タイトル、コンテンツ、ボタン配置をサポートし、ESCキーでの閉じる動作も対応。
   *
   * @param options ダイアログオプション
   * @returns Dialogオブジェクトとモーダル背景を含む構造体
   *
   * @example
   * ```typescript
   * const { dialog, close } = uiFactory.createDialog({
   *   title: '確認',
   *   content: '保存しますか？',
   *   modal: true,
   *   buttons: [
   *     { text: 'キャンセル', onClick: () => console.log('cancel') },
   *     { text: '保存', onClick: () => console.log('save'), primary: true },
   *   ],
   * });
   * ```
   */
  createDialog(options: DialogOptions): { dialog: Dialog; close: () => void; modalBackground?: Phaser.GameObjects.Rectangle } {
    const {
      title,
      content,
      buttons,
      width = 400,
      modal = true,
      closeOnBackgroundClick = true,
    } = options;

    // モーダル背景
    let modalBackground: Phaser.GameObjects.Rectangle | undefined;
    if (modal) {
      modalBackground = this.scene.add.rectangle(
        this.scene.cameras.main.centerX,
        this.scene.cameras.main.centerY,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
        Colors.overlay,
        OverlayAlpha.medium
      );
      modalBackground.setInteractive();
      modalBackground.setDepth(999);
    }

    // closeDialog関数を先に定義
    const closeDialog = (): void => {
      if (this.escKeyHandler) {
        this.scene.input.keyboard?.off('keydown-ESC', this.escKeyHandler);
        this.escKeyHandler = undefined;
      }
      dialog.destroy();
      if (modalBackground) {
        modalBackground.destroy();
      }
    };

    // 背景クリックで閉じる
    if (modal && modalBackground && closeOnBackgroundClick) {
      modalBackground.on('pointerdown', closeDialog);
    }

    // タイトルテキスト
    const titleText = this.scene.add.text(0, 0, title, TextStyles.titleSmall);

    // コンテンツ
    let contentObject: Phaser.GameObjects.Text | Phaser.GameObjects.GameObject;
    if (typeof content === 'string') {
      contentObject = this.scene.add.text(0, 0, content, {
        ...TextStyles.body,
        wordWrap: { width: width - 40 },
      });
    } else {
      contentObject = content;
    }

    // アクションボタン
    const actionButtons = buttons?.map(btn => {
      return this.createButton({
        x: 0,
        y: 0,
        text: btn.text,
        width: 100,
        height: 36,
        style: {
          backgroundColor: btn.primary ? Colors.primary : Colors.secondary,
          normal: btn.primary ? Colors.primary : Colors.secondary,
          hover: btn.primary ? Colors.primaryHover : Colors.secondaryHover,
          cornerRadius: 6,
        },
        onClick: () => {
          btn.onClick();
          closeDialog();
        },
      });
    });

    // ダイアログ本体
    const dialog = this.rexUI.add.dialog({
      x: this.scene.cameras.main.centerX,
      y: this.scene.cameras.main.centerY,
      width,
      background: this.rexUI.add.roundRectangle(
        0, 0, 0, 0, 12, Colors.panelBackground
      ),
      title: titleText,
      content: contentObject,
      actions: actionButtons ?? [],
      space: {
        title: 20,
        content: 20,
        action: 10,
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      },
      align: {
        actions: 'right',
      },
    }) as Dialog;

    dialog.layout();
    dialog.setDepth(1000);

    // ESCキーで閉じる
    this.escKeyHandler = closeDialog;
    this.scene.input.keyboard?.once('keydown-ESC', this.escKeyHandler);

    return { dialog, close: closeDialog, modalBackground };
  }

  /**
   * ESCキーハンドラ（ダイアログ用）
   */
  private escKeyHandler?: () => void;

  /**
   * 確認ダイアログを生成
   *
   * @param options 確認ダイアログオプション
   * @returns Dialogオブジェクトとclose関数
   */
  createConfirmDialog(options: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }): { dialog: Dialog; close: () => void } {
    return this.createDialog({
      title: options.title,
      content: options.message,
      modal: true,
      buttons: [
        {
          text: options.cancelText ?? 'キャンセル',
          onClick: () => options.onCancel?.(),
        },
        {
          text: options.confirmText ?? '確認',
          onClick: options.onConfirm,
          primary: true,
        },
      ],
    });
  }

  /**
   * 情報ダイアログを生成
   *
   * @param options 情報ダイアログオプション
   * @returns Dialogオブジェクトとclose関数
   */
  createAlertDialog(options: {
    title: string;
    message: string;
    onClose?: () => void;
    buttonText?: string;
  }): { dialog: Dialog; close: () => void } {
    return this.createDialog({
      title: options.title,
      content: options.message,
      modal: true,
      buttons: [
        {
          text: options.buttonText ?? 'OK',
          onClick: () => options.onClose?.(),
          primary: true,
        },
      ],
    });
  }

  /**
   * プログレスバーを生成
   *
   * Graphicsを使用してプログレスバーを生成する。
   * 値の即時更新とアニメーション付き更新をサポート。
   *
   * @param options プログレスバーオプション
   * @returns ProgressBarオブジェクト
   *
   * @example
   * ```typescript
   * const progressBar = uiFactory.createProgressBar({
   *   x: 640,
   *   y: 400,
   *   width: 200,
   *   height: 20,
   *   value: 50,
   *   maxValue: 100,
   *   showText: true,
   * });
   *
   * // 値を更新（アニメーションなし）
   * progressBar.setValue(75);
   *
   * // 値を更新（アニメーション付き）
   * progressBar.setValue(100, true);
   * ```
   */
  createProgressBar(options: ProgressBarOptions): ProgressBarObject {
    const {
      x,
      y,
      width,
      height,
      value,
      maxValue,
      barColor,
      backgroundColor,
      showText = false,
      textFormat,
    } = options;

    const bgColor = backgroundColor ?? Colors.backgroundDark;
    const fillColor = barColor ?? Colors.primary;
    const radius = height / 2;

    // コンテナ
    const container = this.scene.add.container(x, y);

    // 背景
    const background = this.scene.add.graphics();
    background.fillStyle(bgColor);
    background.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    container.add(background);

    // バー
    const bar = this.scene.add.graphics();
    container.add(bar);

    // テキスト
    let textObj: Phaser.GameObjects.Text | undefined;
    if (showText) {
      textObj = this.scene.add.text(0, 0, '', TextStyles.bodySmall)
        .setOrigin(0.5);
      container.add(textObj);
    }

    // 状態管理
    let currentValue = value;
    let currentMaxValue = maxValue;
    let currentTween: Phaser.Tweens.Tween | undefined;

    // テキストフォーマット関数
    const formatText = textFormat ?? ((val: number, max: number) => `${Math.round(val)}/${max}`);

    // バー更新関数
    const updateBar = (val: number, animate: boolean = false): void => {
      // 値をクランプ
      const clampedValue = Math.max(0, Math.min(val, currentMaxValue));
      const percent = currentMaxValue > 0 ? clampedValue / currentMaxValue : 0;
      const barWidth = (width - 4) * percent;

      // 既存のTweenをキャンセル
      if (currentTween) {
        currentTween.stop();
        currentTween = undefined;
      }

      if (animate && this.scene.tweens) {
        // アニメーション更新
        currentTween = this.scene.tweens.addCounter({
          from: currentValue,
          to: clampedValue,
          duration: 300,
          onUpdate: (tween) => {
            const tweenValue = tween.getValue() ?? 0;
            const tweenPercent = currentMaxValue > 0 ? tweenValue / currentMaxValue : 0;
            const tweenWidth = (width - 4) * tweenPercent;

            bar.clear();
            bar.fillStyle(fillColor);
            if (tweenWidth > 0) {
              bar.fillRoundedRect(
                -width / 2 + 2,
                -height / 2 + 2,
                tweenWidth,
                height - 4,
                Math.max(0, radius - 2)
              );
            }

            if (textObj) {
              textObj.setText(formatText(tweenValue, currentMaxValue));
            }
          },
          onComplete: () => {
            currentTween = undefined;
          },
        });
      } else {
        // 即時更新
        bar.clear();
        bar.fillStyle(fillColor);
        if (barWidth > 0) {
          bar.fillRoundedRect(
            -width / 2 + 2,
            -height / 2 + 2,
            barWidth,
            height - 4,
            Math.max(0, radius - 2)
          );
        }

        if (textObj) {
          textObj.setText(formatText(clampedValue, currentMaxValue));
        }
      }

      currentValue = clampedValue;
    };

    // 初期描画
    updateBar(value, false);

    return {
      container,
      background,
      bar,
      text: textObj,
      getValue: () => currentValue,
      setValue: (val: number, animate: boolean = false) => updateBar(val, animate),
      setMaxValue: (max: number) => {
        currentMaxValue = max;
        updateBar(currentValue, false);
      },
    };
  }

  /**
   * ランクゲージを生成（特殊なプログレスバー）
   *
   * @param options ランクゲージオプション
   * @returns ProgressBarオブジェクト
   */
  createRankGauge(options: {
    x: number;
    y: number;
    width: number;
    height: number;
    contribution: number;
    maxContribution: number;
  }): ProgressBarObject {
    return this.createProgressBar({
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
      value: options.contribution,
      maxValue: options.maxContribution,
      barColor: Colors.gold,
      backgroundColor: Colors.backgroundDark,
      showText: true,
    });
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
