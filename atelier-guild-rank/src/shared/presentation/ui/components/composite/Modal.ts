/**
 * Modal - 確認モーダル（中央、2ボタン固定）composite
 * Issue #456: UI刷新 Phase 2
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens } from '@shared/theme';
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
  private bg?: Phaser.GameObjects.Rectangle;
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
        color: '#333333',
        padding: { top: 4 },
      },
    );
    titleText.setOrigin(0.5, 0);
    this.titleText = titleText;
    this.container.add(titleText);

    const messageText = this.scene.add.text(0, 0, this.message, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.medium}px`,
      color: '#666666',
      padding: { top: 4 },
    });
    messageText.setOrigin(0.5);
    this.messageText = messageText;
    this.container.add(messageText);

    const btnW = 100;
    const btnH = 44;
    const btnY = this.height / 2 - btnH / 2 - DesignTokens.spacing.sm;

    const cancelBtn = this.scene.add.rectangle(-60, btnY, btnW, btnH, Colors.ui.button.disabled);
    cancelBtn.setStrokeStyle(DesignTokens.border.thin, Colors.border.dark);
    cancelBtn.setInteractive();
    cancelBtn.on('pointerdown', () => this.cancel());
    this.cancelBtn = cancelBtn;
    this.container.add(cancelBtn);

    const cancelBtnText = this.scene.add.text(-60, btnY, this.cancelLabel, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.small}px`,
      color: '#333333',
      padding: { top: 2 },
    });
    cancelBtnText.setOrigin(0.5);
    this.cancelBtnText = cancelBtnText;
    this.container.add(cancelBtnText);

    const confirmBtn = this.scene.add.rectangle(60, btnY, btnW, btnH, Colors.ui.button.normal);
    confirmBtn.setStrokeStyle(DesignTokens.border.thin, Colors.border.highlight);
    confirmBtn.setInteractive();
    confirmBtn.on('pointerdown', () => this.confirm());
    this.confirmBtn = confirmBtn;
    this.container.add(confirmBtn);

    const confirmBtnText = this.scene.add.text(60, btnY, this.confirmLabel, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.small}px`,
      color: '#ffffff',
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
    return this;
  }

  confirm(): this {
    if (!this.opened) return this;
    this.opened = false;
    this.container.setVisible(false);
    this.onConfirm?.();
    return this;
  }

  cancel(): this {
    if (!this.opened) return this;
    this.opened = false;
    this.container.setVisible(false);
    this.onCancel?.();
    return this;
  }

  isOpen(): boolean {
    return this.opened;
  }

  destroy(): void {
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
