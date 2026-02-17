/**
 * ShopHeaderコンポーネント
 * TASK-0056 ShopSceneリファクタリング
 *
 * @description
 * ショップのヘッダー部分を表示するコンポーネント
 * - タイトル「ショップ」
 * - 所持金表示
 * - 戻るボタン
 */

import type { RexLabel } from '@presentation/types/rexui';
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { Colors, THEME } from '@presentation/ui/theme';
import type Phaser from 'phaser';
import type { OnBackClickCallback } from './types';

/** ShopHeaderオプション */
interface ShopHeaderOptions {
  /** 戻るボタンクリック時のコールバック */
  onBackClick?: OnBackClickCallback;
}

/**
 * ShopHeaderコンポーネント
 * ショップ画面のヘッダー部分を担当
 */
export class ShopHeader extends BaseComponent {
  /** 所持金テキスト */
  private goldText: Phaser.GameObjects.Text | null = null;

  /** 現在の所持金 */
  private currentGold: number = 0;

  /** オプション */
  private options: ShopHeaderOptions;

  /**
   * 戻るボタン
   * TASK-0059: rexUI型定義を適用
   */
  private backButton: RexLabel | null = null;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param x X座標
   * @param y Y座標
   * @param options オプション設定
   */
  constructor(scene: Phaser.Scene, x: number, y: number, options?: ShopHeaderOptions) {
    super(scene, x, y);
    this.options = options || {};
  }

  /**
   * コンポーネントを作成
   */
  create(): void {
    // タイトルテキスト
    const titleText = this.scene.make.text({
      x: 50,
      y: 20,
      text: 'ショップ',
      style: {
        fontSize: `${THEME.sizes.xlarge}px`,
        color: `#${Colors.text.primary.toString(16).padStart(6, '0')}`,
      },
      add: false,
    });
    titleText.setOrigin(0, 0.5);
    this.container.add(titleText);

    // 所持金テキスト
    this.goldText = this.scene.make.text({
      x: 300,
      y: 20,
      text: `所持金: ${this.currentGold}G`,
      style: {
        fontSize: `${THEME.sizes.medium}px`,
        color: `#${Colors.text.accent.toString(16).padStart(6, '0')}`,
      },
      add: false,
    });
    this.goldText.setOrigin(0, 0.5);
    this.container.add(this.goldText);

    // 戻るボタン
    this.createBackButton();
  }

  /**
   * 戻るボタンを作成
   */
  private createBackButton(): void {
    if (!this.rexUI) {
      return;
    }

    // rexUIラベルで戻るボタンを作成
    this.backButton = this.rexUI.add.label({
      x: 700,
      y: 20,
      width: 80,
      height: 32,
      background: this.scene.add
        .graphics()
        .fillStyle(Colors.ui.button.normal, 1)
        .fillRoundedRect(0, 0, 80, 32, 4),
      text: this.scene.add.text(0, 0, '戻る', {
        fontSize: `${THEME.sizes.medium}px`,
        color: `#${Colors.text.primary.toString(16).padStart(6, '0')}`,
      }),
      align: 'center',
    });

    this.backButton.setInteractive();
    this.backButton.on('pointerdown', () => {
      if (this.options.onBackClick) {
        this.options.onBackClick();
      }
    });

    this.container.add(this.backButton);
  }

  /**
   * 所持金を設定
   * @param gold 所持金
   */
  setGold(gold: number): void {
    this.currentGold = gold;
    if (this.goldText) {
      this.goldText.setText(`所持金: ${gold}G`);
    }
  }

  /**
   * 所持金を更新
   * @param gold 新しい所持金
   */
  updateGold(gold: number): void {
    this.setGold(gold);
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    if (this.backButton) {
      this.backButton.destroy();
      this.backButton = null;
    }
    if (this.goldText) {
      this.goldText.destroy();
      this.goldText = null;
    }
    this.container.destroy();
  }
}
