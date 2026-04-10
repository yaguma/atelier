/** 調合実行ボタン・品質プレビュー (Issue #459) */

import type { RexRoundRectangle, RexUIPlugin } from '@presentation/types/rexui';
import { THEME } from '@presentation/ui/theme';
import { MAIN_LAYOUT } from '@shared/constants';
import type { Quality } from '@shared/types';
import type Phaser from 'phaser';

export interface AlchemyCraftPanelCallbacks {
  onExecuteCraft: () => void;
}

export class AlchemyCraftPanel {
  private craftButtonContainer: Phaser.GameObjects.Container | null = null;
  private craftButtonBg: RexRoundRectangle | null = null;
  private qualityPreviewText: Phaser.GameObjects.Text | null = null;

  constructor(
    private scene: Phaser.Scene,
    private container: Phaser.GameObjects.Container,
    private rexUI: RexUIPlugin,
    private callbacks: AlchemyCraftPanelCallbacks,
  ) {}

  create(): void {
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;
    const buttonWidth = 180;
    const buttonHeight = 44;
    const buttonX = gameWidth - MAIN_LAYOUT.SIDEBAR_WIDTH - buttonWidth / 2 - 20;
    const buttonY = gameHeight - MAIN_LAYOUT.HEADER_HEIGHT - MAIN_LAYOUT.FOOTER_HEIGHT - 30;

    this.craftButtonContainer = this.scene.add.container(buttonX, buttonY);

    const bg = this.rexUI.add
      .roundRectangle({ width: buttonWidth, height: buttonHeight, radius: 10 })
      .setFillStyle(THEME.colors.primary);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.callbacks.onExecuteCraft());
    this.craftButtonBg = bg;

    const buttonText = this.scene.make.text({
      x: 0,
      y: 0,
      text: '調合実行',
      style: {
        fontSize: `${THEME.sizes.large}px`,
        color: '#ffffff',
        fontFamily: THEME.fonts.primary,
        fontStyle: 'bold',
      },
      add: false,
    });
    buttonText.setOrigin(0.5);

    this.craftButtonContainer.add([bg, buttonText]);

    this.qualityPreviewText = this.scene.make.text({
      x: 0,
      y: -35,
      text: '',
      style: {
        fontSize: `${THEME.sizes.medium}px`,
        color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
        fontFamily: THEME.fonts.primary,
      },
      add: false,
    });
    this.qualityPreviewText.setOrigin(0.5);
    this.craftButtonContainer.add(this.qualityPreviewText);

    this.container.add(this.craftButtonContainer);
    this.craftButtonContainer.setVisible(false);
  }

  updateVisibility(enabled: boolean, quality: Quality | null): void {
    if (!this.craftButtonContainer) return;
    this.craftButtonContainer.setVisible(enabled);
    if (enabled && quality !== null) {
      this.qualityPreviewText?.setText(`品質: ${quality}`);
    } else {
      this.qualityPreviewText?.setText('');
    }
  }

  destroy(): void {
    if (this.craftButtonBg) {
      this.craftButtonBg.off('pointerdown');
      this.craftButtonBg = null;
    }
    if (this.craftButtonContainer) {
      this.craftButtonContainer.destroy(true);
      this.craftButtonContainer = null;
    }
    this.qualityPreviewText = null;
  }
}
