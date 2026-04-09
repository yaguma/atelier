/**
 * Modal - 確認モーダル（中央、2ボタン固定）composite
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens, toColorStr } from '@shared/theme';
import type Phaser from 'phaser';

export interface ModalOptions extends BaseComponentOptions {
  width?: number;
  height?: number;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export class Modal extends BaseComponent {
  private width: number;
  private height: number;
  private title: string;
  private message: string;
  private confirmLabel: string;
  private cancelLabel: string;
  private opened = false;
  private onConfirm?: () => void;
  private onCancel?: () => void;
  private overlay?: Phaser.GameObjects.Rectangle;
  private bg?: Phaser.GameObjects.Rectangle;
  private keydownHandler?: (event: KeyboardEvent) => void;
  private titleText?: Phaser.GameObjects.Text;
  private messageText?: Phaser.GameObjects.Text;
  private confirmBtn?: Phaser.GameObjects.Rectangle;
  private cancelBtn?: Phaser.GameObjects.Rectangle;
  private confirmBtnText?: Phaser.GameObjects.Text;
  private cancelBtnText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, options: ModalOptions = {}) {
    super(scene, x, y, options);
    this.width = options.width ?? 360;
    this.height = options.height ?? 200;
    this.title = options.title ?? '';
    this.message = options.message ?? '';
    this.confirmLabel = options.confirmLabel ?? 'OK';
    this.cancelLabel = options.cancelLabel ?? 'キャンセル';
  }

  create(): void {
    // 背面オーバーレイ（クリック貫通防止 + 背景クリックでキャンセル）
    const screenW = this.scene.scale?.width ?? 1280;
    const screenH = this.scene.scale?.height ?? 720;
    const overlay = this.scene.add.rectangle(
      0,
      0,
      screenW * 2,
      screenH * 2,
      Colors.background.overlay,
      DesignTokens.opacity.overlay,
    );
    overlay.setInteractive();
    overlay.on('pointerdown', () => this.cancel());
    this.overlay = overlay;
    this.container.add(overlay);

    const bg = this.scene.add.rectangle(0, 0, this.width, this.height, Colors.background.card);
    bg.setStrokeStyle(DesignTokens.border.thick, Colors.border.highlight);
    this.bg = bg;
    this.container.add(bg);
    this.container.setDepth(DesignTokens.zIndex.modal);
    this.container.setVisible(false);

    const titleText = this.scene.add.text(
      0,
      -this.height / 2 + DesignTokens.spacing.md,
      this.title,
      {
        fontFamily: DesignTokens.fonts.primary,
        fontSize: `${DesignTokens.sizes.large}px`,
        color: toColorStr(Colors.text.primary),
        padding: { top: 4 },
      },
    );
    titleText.setOrigin(0.5, 0);
    this.titleText = titleText;
    this.container.add(titleText);

    const messageText = this.scene.add.text(0, 0, this.message, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.medium}px`,
      color: toColorStr(Colors.text.secondary),
      padding: { top: 4 },
    });
    messageText.setOrigin(0.5);
    this.messageText = messageText;
    this.container.add(messageText);

    const btnW = 100;
    const btnH = 44;
    const btnY = this.height / 2 - btnH / 2 - DesignTokens.spacing.sm;
    // ボタン水平オフセット: 中央から btnW/2 + spacing.sm 離す
    const btnOffsetX = btnW / 2 + DesignTokens.spacing.sm;

    const cancelBtn = this.scene.add.rectangle(
      -btnOffsetX,
      btnY,
      btnW,
      btnH,
      Colors.ui.button.disabled,
    );
    cancelBtn.setStrokeStyle(DesignTokens.border.thin, Colors.border.dark);
    cancelBtn.setInteractive();
    cancelBtn.on('pointerdown', () => this.cancel());
    this.cancelBtn = cancelBtn;
    this.container.add(cancelBtn);

    const cancelBtnText = this.scene.add.text(-btnOffsetX, btnY, this.cancelLabel, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.small}px`,
      color: toColorStr(Colors.text.primary),
      padding: { top: 2 },
    });
    cancelBtnText.setOrigin(0.5);
    this.cancelBtnText = cancelBtnText;
    this.container.add(cancelBtnText);

    const confirmBtn = this.scene.add.rectangle(
      btnOffsetX,
      btnY,
      btnW,
      btnH,
      Colors.ui.button.normal,
    );
    confirmBtn.setStrokeStyle(DesignTokens.border.thin, Colors.border.highlight);
    confirmBtn.setInteractive();
    confirmBtn.on('pointerdown', () => this.confirm());
    this.confirmBtn = confirmBtn;
    this.container.add(confirmBtn);

    const confirmBtnText = this.scene.add.text(btnOffsetX, btnY, this.confirmLabel, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.small}px`,
      color: toColorStr(Colors.text.light),
      padding: { top: 2 },
    });
    confirmBtnText.setOrigin(0.5);
    this.confirmBtnText = confirmBtnText;
    this.container.add(confirmBtnText);
  }

  show(onConfirm?: () => void, onCancel?: () => void): this {
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;
    this.opened = true;
    this.container.setVisible(true);
    this.attachKeyboard();
    return this;
  }

  private attachKeyboard(): void {
    const keyboard = this.scene.input?.keyboard;
    if (!keyboard) return;
    this.detachKeyboard();
    const handler = (event: KeyboardEvent): void => {
      if (!this.opened) return;
      if (event.key === 'Escape') {
        this.cancel();
      } else if (event.key === 'Enter') {
        this.confirm();
      }
    };
    this.keydownHandler = handler;
    keyboard.on('keydown', handler);
  }

  private detachKeyboard(): void {
    const keyboard = this.scene.input?.keyboard;
    if (keyboard && this.keydownHandler) {
      keyboard.off('keydown', this.keydownHandler);
    }
    this.keydownHandler = undefined;
  }

  confirm(): this {
    if (!this.opened) return this;
    this.opened = false;
    this.container.setVisible(false);
    this.detachKeyboard();
    this.onConfirm?.();
    return this;
  }

  cancel(): this {
    if (!this.opened) return this;
    this.opened = false;
    this.container.setVisible(false);
    this.detachKeyboard();
    this.onCancel?.();
    return this;
  }

  isOpen(): boolean {
    return this.opened;
  }

  destroy(): void {
    this.detachKeyboard();
    this.overlay?.destroy();
    this.confirmBtnText?.destroy();
    this.cancelBtnText?.destroy();
    this.confirmBtn?.destroy();
    this.cancelBtn?.destroy();
    this.messageText?.destroy();
    this.titleText?.destroy();
    this.bg?.destroy();
    this.container.destroy(true);
  }
}
