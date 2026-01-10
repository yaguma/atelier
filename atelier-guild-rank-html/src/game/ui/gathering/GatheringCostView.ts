/**
 * GatheringCostView 実装
 *
 * TASK-0221: GatheringCostView実装
 * 採取フェーズでのAPコスト表示コンポーネント
 */

import Phaser from 'phaser';
import type { IGatheringCostView, GatheringCostViewOptions } from './IGatheringCostView';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';

/**
 * GatheringCostViewクラス
 *
 * 採取フェーズで必要APと現在APを視覚的に表示する。
 */
export class GatheringCostView implements IGatheringCostView {
  public readonly container: Phaser.GameObjects.Container;

  private scene: Phaser.Scene;
  private currentAP: number = 0;
  private maxAP: number = 10;
  private requiredAP: number = 0;

  // UI要素
  private background!: Phaser.GameObjects.Graphics;
  private costValue!: Phaser.GameObjects.Text;
  private remainingValue!: Phaser.GameObjects.Text;
  private warningText?: Phaser.GameObjects.Text;
  private apGauge!: Phaser.GameObjects.Graphics;

  constructor(options: GatheringCostViewOptions) {
    this.scene = options.scene;
    this.currentAP = options.currentAP ?? 0;
    this.maxAP = options.maxAP ?? 10;

    const x = options.x ?? 0;
    const y = options.y ?? 0;

    this.container = this.scene.add.container(x, y);
    this.create();
  }

  // =====================================================
  // 初期化
  // =====================================================

  private create(): void {
    // 背景
    this.background = this.scene.add.graphics();
    this.background.fillStyle(Colors.panelBackground, 0.95);
    this.background.fillRoundedRect(0, 0, 200, 120, 8);
    this.background.lineStyle(1, Colors.panelBorder);
    this.background.strokeRoundedRect(0, 0, 200, 120, 8);
    this.container.add(this.background);

    // タイトル
    const title = this.scene.add
      .text(100, 15, '⚡ 消費AP', {
        ...TextStyles.body,
        fontSize: '14px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);
    this.container.add(title);

    // 必要APコスト
    const costLabel = this.scene.add.text(20, 45, '必要:', {
      ...TextStyles.body,
      fontSize: '13px',
    });
    this.container.add(costLabel);

    this.costValue = this.scene.add
      .text(180, 45, '0 AP', {
        ...TextStyles.body,
        fontSize: '16px',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0);
    this.container.add(this.costValue);

    // 残りAP
    const remainingLabel = this.scene.add.text(20, 70, '残り:', {
      ...TextStyles.body,
      fontSize: '13px',
      color: '#aaaaaa',
    });
    this.container.add(remainingLabel);

    this.remainingValue = this.scene.add
      .text(180, 70, '0 AP', {
        ...TextStyles.body,
        fontSize: '13px',
        color: '#aaaaaa',
      })
      .setOrigin(1, 0);
    this.container.add(this.remainingValue);

    // APゲージ
    this.apGauge = this.scene.add.graphics();
    this.container.add(this.apGauge);
    this.updateAPGauge();
  }

  // =====================================================
  // AP設定
  // =====================================================

  setCurrentAP(current: number, max: number): void {
    this.currentAP = current;
    this.maxAP = max;
    this.updateDisplay();
  }

  setRequiredAP(cost: number): void {
    const previousCost = this.requiredAP;
    this.requiredAP = cost;
    this.updateDisplay();

    // コスト変更時のアニメーション
    if (previousCost !== cost) {
      this.animateCostChange();
    }
  }

  // =====================================================
  // 状態チェック
  // =====================================================

  canAfford(): boolean {
    return this.currentAP >= this.requiredAP;
  }

  getRequiredAP(): number {
    return this.requiredAP;
  }

  // =====================================================
  // 表示更新
  // =====================================================

  private updateDisplay(): void {
    // コスト表示
    this.costValue.setText(`${this.requiredAP} AP`);

    // 残りAP計算
    const remaining = this.currentAP - this.requiredAP;

    // 残り表示
    this.remainingValue.setText(`${remaining} AP`);

    // 色設定
    if (!this.canAfford()) {
      // AP不足
      this.costValue.setColor('#ff4444');
      this.remainingValue.setColor('#ff4444');
      this.showWarning();
    } else if (remaining <= 2) {
      // 残りわずか
      this.costValue.setColor('#ffaa00');
      this.remainingValue.setColor('#ffaa00');
      this.hideWarning();
    } else {
      // 十分
      this.costValue.setColor('#00ff00');
      this.remainingValue.setColor('#aaaaaa');
      this.hideWarning();
    }

    this.updateAPGauge();
  }

  private updateAPGauge(): void {
    const gaugeX = 20;
    const gaugeY = 95;
    const gaugeWidth = 160;
    const gaugeHeight = 12;

    this.apGauge.clear();

    // 背景
    this.apGauge.fillStyle(Colors.backgroundDark, 1);
    this.apGauge.fillRoundedRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, 4);

    // 消費後の残りAP
    const remainingRatio =
      this.maxAP > 0 ? Math.max(0, (this.currentAP - this.requiredAP) / this.maxAP) : 0;
    const remainingWidth = gaugeWidth * remainingRatio;

    if (remainingWidth > 0) {
      this.apGauge.fillStyle(0x00aaff, 1);
      this.apGauge.fillRoundedRect(gaugeX, gaugeY, remainingWidth, gaugeHeight, 4);
    }

    // 消費AP部分
    if (this.canAfford()) {
      const consumeRatio = this.maxAP > 0 ? this.requiredAP / this.maxAP : 0;
      const consumeWidth = gaugeWidth * consumeRatio;
      const consumeX = gaugeX + remainingWidth;

      if (consumeWidth > 0) {
        this.apGauge.fillStyle(0xff8800, 0.7);
        this.apGauge.fillRoundedRect(consumeX, gaugeY, consumeWidth, gaugeHeight, 4);
      }
    }

    // 枠線
    this.apGauge.lineStyle(1, Colors.panelBorder);
    this.apGauge.strokeRoundedRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, 4);
  }

  // =====================================================
  // 警告表示
  // =====================================================

  private showWarning(): void {
    if (this.warningText) return;

    this.warningText = this.scene.add
      .text(100, 130, '⚠️ APが不足しています', {
        ...TextStyles.body,
        fontSize: '11px',
        color: '#ff4444',
      })
      .setOrigin(0.5, 0);
    this.container.add(this.warningText);

    // 点滅アニメーション
    this.scene.tweens.add({
      targets: this.warningText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private hideWarning(): void {
    if (this.warningText) {
      this.warningText.destroy();
      this.warningText = undefined;
    }
  }

  // =====================================================
  // アニメーション
  // =====================================================

  private animateCostChange(): void {
    // コスト値のパルスアニメーション
    this.scene.tweens.add({
      targets: this.costValue,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2',
    });
  }

  // =====================================================
  // 表示制御
  // =====================================================

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  // =====================================================
  // 破棄
  // =====================================================

  destroy(): void {
    this.hideWarning();
    this.container.destroy();
  }
}
