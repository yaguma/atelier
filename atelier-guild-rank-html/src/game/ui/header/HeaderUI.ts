/**
 * HeaderUI実装
 *
 * ゲーム画面上部のヘッダー情報を表示・管理するUIコンポーネント。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0202.md
 */

import Phaser from 'phaser';
import { GuildRank } from '@domain/common/types';
import { IHeaderUI, HeaderUIData, HeaderUIOptions } from './IHeaderUI';
import { HeaderLayout, HeaderColors, RankColors } from './HeaderConstants';
import { getRankColor, formatGold, formatDay, formatAP, formatExp } from './HeaderUtils';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';

/**
 * HeaderUIコンポーネント
 */
export class HeaderUI implements IHeaderUI {
  public readonly container: Phaser.GameObjects.Container;

  private scene: Phaser.Scene;
  private background!: Phaser.GameObjects.Graphics;

  // ランク表示
  private rankContainer!: Phaser.GameObjects.Container;
  private rankText!: Phaser.GameObjects.Text;
  private rankBadge!: Phaser.GameObjects.Graphics;

  // 経験値ゲージ
  private expGaugeBackground!: Phaser.GameObjects.Graphics;
  private expGaugeFill!: Phaser.GameObjects.Graphics;
  private expText!: Phaser.GameObjects.Text;

  // 日数・ゴールド・AP
  private dayText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private apGaugeBackground!: Phaser.GameObjects.Graphics;
  private apGaugeFill!: Phaser.GameObjects.Graphics;
  private apText!: Phaser.GameObjects.Text;

  // メニューボタン
  private menuButton!: Phaser.GameObjects.Container;

  private currentData: HeaderUIData | null = null;
  private onMenuClick?: () => void;

  // AP点滅アニメーション用
  private apBlinkTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, options: HeaderUIOptions = {}) {
    this.scene = scene;
    this.onMenuClick = options.onMenuClick;

    const x = options.x ?? HeaderLayout.X;
    const y = options.y ?? HeaderLayout.Y;
    const width = options.width ?? HeaderLayout.WIDTH;

    this.container = scene.add.container(x, y);
    this.container.setDepth(500);

    this.createBackground(width);
    this.createRankDisplay();
    this.createExpGauge();
    this.createDayDisplay();
    this.createGoldDisplay();
    this.createAPGauge();
    this.createMenuButton();
  }

  /**
   * 背景を作成する
   */
  private createBackground(width: number): void {
    this.background = this.scene.add.graphics();
    this.background.fillStyle(HeaderColors.BACKGROUND, HeaderColors.BACKGROUND_ALPHA);
    this.background.fillRect(0, 0, width, HeaderLayout.HEIGHT);
    this.background.lineStyle(1, HeaderColors.BORDER);
    this.background.strokeRect(0, 0, width, HeaderLayout.HEIGHT);
    this.container.add(this.background);
  }

  /**
   * ランク表示を作成する
   */
  private createRankDisplay(): void {
    this.rankContainer = this.scene.add.container(HeaderLayout.RANK_X + 30, HeaderLayout.HEIGHT / 2);

    // ランクバッジ背景
    this.rankBadge = this.scene.add.graphics();
    this.rankBadge.fillStyle(RankColors[GuildRank.G], 1);
    this.rankBadge.fillRoundedRect(-30, -25, 60, 50, 8);
    this.rankContainer.add(this.rankBadge);

    // ランクテキスト
    this.rankText = this.scene.add.text(0, 0, 'F', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.rankContainer.add(this.rankText);

    // 「Rank」ラベル
    const rankLabel = this.scene.add.text(0, -35, 'Rank', {
      ...TextStyles.bodySmall,
      fontSize: '10px',
    }).setOrigin(0.5);
    this.rankContainer.add(rankLabel);

    this.container.add(this.rankContainer);
  }

  /**
   * 経験値ゲージを作成する
   */
  private createExpGauge(): void {
    const gaugeX = HeaderLayout.EXP_GAUGE_X;
    const gaugeY = HeaderLayout.HEIGHT / 2;
    const gaugeWidth = HeaderLayout.EXP_GAUGE_WIDTH;
    const gaugeHeight = HeaderLayout.EXP_GAUGE_HEIGHT;

    // 経験値ラベル
    const expLabel = this.scene.add.text(gaugeX, gaugeY - 25, '昇格ポイント', {
      ...TextStyles.bodySmall,
      fontSize: '11px',
    });
    this.container.add(expLabel);

    // ゲージ背景
    this.expGaugeBackground = this.scene.add.graphics();
    this.expGaugeBackground.fillStyle(HeaderColors.GAUGE_BACKGROUND, 1);
    this.expGaugeBackground.fillRoundedRect(gaugeX, gaugeY - gaugeHeight / 2, gaugeWidth, gaugeHeight, 4);
    this.expGaugeBackground.lineStyle(1, Colors.panelBorder);
    this.expGaugeBackground.strokeRoundedRect(gaugeX, gaugeY - gaugeHeight / 2, gaugeWidth, gaugeHeight, 4);
    this.container.add(this.expGaugeBackground);

    // ゲージ塗り
    this.expGaugeFill = this.scene.add.graphics();
    this.container.add(this.expGaugeFill);

    // 数値テキスト
    this.expText = this.scene.add.text(gaugeX + gaugeWidth / 2, gaugeY, '0/0', {
      ...TextStyles.body,
      fontSize: '12px',
    }).setOrigin(0.5);
    this.container.add(this.expText);
  }

  /**
   * 日数表示を作成する
   */
  private createDayDisplay(): void {
    // 日数ラベル
    const dayLabel = this.scene.add.text(HeaderLayout.DAY_X, HeaderLayout.HEIGHT / 2 - 25, '日数', {
      ...TextStyles.bodySmall,
      fontSize: '11px',
    });
    this.container.add(dayLabel);

    this.dayText = this.scene.add.text(HeaderLayout.DAY_X, HeaderLayout.HEIGHT / 2, 'Day 1/30', {
      ...TextStyles.dayCount,
    }).setOrigin(0, 0.5);
    this.container.add(this.dayText);
  }

  /**
   * ゴールド表示を作成する
   */
  private createGoldDisplay(): void {
    // ゴールドラベル
    const goldLabel = this.scene.add.text(HeaderLayout.GOLD_X, HeaderLayout.HEIGHT / 2 - 25, 'ゴールド', {
      ...TextStyles.bodySmall,
      fontSize: '11px',
    });
    this.container.add(goldLabel);

    // ゴールドアイコン
    const goldIcon = this.scene.add.text(HeaderLayout.GOLD_X, HeaderLayout.HEIGHT / 2, '💰', {
      fontSize: '20px',
    }).setOrigin(0, 0.5);
    this.container.add(goldIcon);

    this.goldText = this.scene.add.text(HeaderLayout.GOLD_X + 30, HeaderLayout.HEIGHT / 2, '0', {
      ...TextStyles.gold,
    }).setOrigin(0, 0.5);
    this.container.add(this.goldText);
  }

  /**
   * APゲージを作成する
   */
  private createAPGauge(): void {
    const gaugeX = HeaderLayout.AP_X;
    const gaugeY = HeaderLayout.HEIGHT / 2;
    const gaugeWidth = HeaderLayout.AP_GAUGE_WIDTH;
    const gaugeHeight = HeaderLayout.AP_GAUGE_HEIGHT;

    // APラベル
    const apLabel = this.scene.add.text(gaugeX, gaugeY - 25, 'AP', {
      ...TextStyles.bodySmall,
      fontSize: '11px',
    });
    this.container.add(apLabel);

    // ゲージ背景
    this.apGaugeBackground = this.scene.add.graphics();
    this.apGaugeBackground.fillStyle(HeaderColors.GAUGE_BACKGROUND, 1);
    this.apGaugeBackground.fillRoundedRect(gaugeX, gaugeY - gaugeHeight / 2, gaugeWidth, gaugeHeight, 4);
    this.apGaugeBackground.lineStyle(1, Colors.panelBorder);
    this.apGaugeBackground.strokeRoundedRect(gaugeX, gaugeY - gaugeHeight / 2, gaugeWidth, gaugeHeight, 4);
    this.container.add(this.apGaugeBackground);

    // ゲージ塗り
    this.apGaugeFill = this.scene.add.graphics();
    this.container.add(this.apGaugeFill);

    // 数値テキスト
    this.apText = this.scene.add.text(gaugeX + gaugeWidth / 2, gaugeY, 'AP 0/0', {
      ...TextStyles.ap,
      fontSize: '14px',
    }).setOrigin(0.5);
    this.container.add(this.apText);
  }

  /**
   * メニューボタンを作成する
   */
  private createMenuButton(): void {
    this.menuButton = this.scene.add.container(HeaderLayout.MENU_X, HeaderLayout.HEIGHT / 2);

    const buttonBg = this.scene.add.graphics();
    buttonBg.fillStyle(Colors.backgroundDark, 1);
    buttonBg.fillRoundedRect(-20, -20, 40, 40, 8);
    this.menuButton.add(buttonBg);

    const menuIcon = this.scene.add.text(0, 0, '☰', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.menuButton.add(menuIcon);

    this.menuButton.setInteractive(
      new Phaser.Geom.Rectangle(-20, -20, 40, 40),
      Phaser.Geom.Rectangle.Contains
    );
    this.menuButton.on('pointerdown', () => {
      if (this.onMenuClick) this.onMenuClick();
    });

    this.container.add(this.menuButton);
  }

  // ========================================
  // 個別更新メソッド
  // ========================================

  /**
   * ランク表示を更新する
   */
  updateRank(rank: GuildRank): void {
    const color = getRankColor(rank);

    // テキスト更新
    this.rankText.setText(rank);

    // バッジ色更新
    this.rankBadge.clear();
    this.rankBadge.fillStyle(color, 1);
    this.rankBadge.fillRoundedRect(-30, -25, 60, 50, 8);

    // アニメーション
    this.scene.tweens.add({
      targets: this.rankContainer,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Power2',
    });
  }

  /**
   * 経験値ゲージを更新する
   */
  updateExp(current: number, required: number): void {
    const gaugeX = HeaderLayout.EXP_GAUGE_X;
    const gaugeY = HeaderLayout.HEIGHT / 2;
    const gaugeWidth = HeaderLayout.EXP_GAUGE_WIDTH;
    const gaugeHeight = HeaderLayout.EXP_GAUGE_HEIGHT;

    const ratio = required > 0 ? Math.min(current / required, 1) : 0;
    const fillWidth = (gaugeWidth - 4) * ratio;

    // ゲージ更新
    this.expGaugeFill.clear();
    if (fillWidth > 0) {
      this.expGaugeFill.fillStyle(HeaderColors.GAUGE_EXP, 1);
      this.expGaugeFill.fillRoundedRect(
        gaugeX + 2,
        gaugeY - gaugeHeight / 2 + 2,
        fillWidth,
        gaugeHeight - 4,
        2
      );
    }

    // テキスト更新
    this.expText.setText(formatExp(current, required));
  }

  /**
   * 日数表示を更新する
   */
  updateDay(current: number, max: number): void {
    this.dayText.setText(formatDay(current, max));

    // 残り日数に応じた警告色
    const remaining = max - current;
    if (remaining <= 5) {
      this.dayText.setColor('#ff4444'); // 危険: 赤
    } else if (remaining <= 10) {
      this.dayText.setColor('#ffaa00'); // 注意: オレンジ
    } else {
      this.dayText.setColor('#ffffff'); // 通常: 白
    }
  }

  /**
   * ゴールド表示を更新する
   */
  updateGold(gold: number): void {
    this.goldText.setText(formatGold(gold));
  }

  /**
   * AP表示を更新する
   */
  updateAP(current: number, max: number): void {
    const gaugeX = HeaderLayout.AP_X;
    const gaugeY = HeaderLayout.HEIGHT / 2;
    const gaugeWidth = HeaderLayout.AP_GAUGE_WIDTH;
    const gaugeHeight = HeaderLayout.AP_GAUGE_HEIGHT;

    const ratio = max > 0 ? Math.min(current / max, 1) : 0;
    const fillWidth = (gaugeWidth - 4) * ratio;

    // AP残量に応じた色を決定
    let gaugeColor: number = HeaderColors.GAUGE_AP;
    if (current === 0) {
      gaugeColor = HeaderColors.GAUGE_AP_EMPTY;
    } else if (current <= max * 0.33) {
      gaugeColor = HeaderColors.GAUGE_AP_LOW;
    }

    // ゲージ更新
    this.apGaugeFill.clear();
    if (fillWidth > 0) {
      this.apGaugeFill.fillStyle(gaugeColor, 1);
      this.apGaugeFill.fillRoundedRect(
        gaugeX + 2,
        gaugeY - gaugeHeight / 2 + 2,
        fillWidth,
        gaugeHeight - 4,
        2
      );
    }

    // テキスト更新
    this.apText.setText(formatAP(current, max));

    // APが少ない場合は点滅
    if (ratio <= 0.25 && current > 0) {
      this.startAPWarningBlink();
    } else {
      this.stopAPWarningBlink();
    }
  }

  /**
   * AP警告点滅を開始する
   */
  private startAPWarningBlink(): void {
    if (this.apBlinkTween) return;

    this.apBlinkTween = this.scene.tweens.add({
      targets: this.apText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * AP警告点滅を停止する
   */
  private stopAPWarningBlink(): void {
    if (this.apBlinkTween) {
      this.apBlinkTween.stop();
      this.apBlinkTween = undefined;
      this.apText.setAlpha(1);
    }
  }

  // ========================================
  // 一括更新
  // ========================================

  /**
   * すべての表示を一括更新する
   */
  updateAll(data: HeaderUIData): void {
    this.currentData = data;
    this.updateRank(data.rank);
    this.updateExp(data.currentExp, data.requiredExp);
    this.updateDay(data.currentDay, data.maxDay);
    this.updateGold(data.gold);
    this.updateAP(data.currentAP, data.maxAP);
  }

  // ========================================
  // アニメーション付き更新
  // ========================================

  /**
   * 経験値獲得アニメーション
   */
  animateExpGain(amount: number): void {
    const floatText = this.scene.add.text(
      HeaderLayout.EXP_GAUGE_X + HeaderLayout.EXP_GAUGE_WIDTH / 2,
      HeaderLayout.HEIGHT / 2 - 30,
      `+${amount} EXP`,
      {
        ...TextStyles.success,
        fontSize: '14px',
      }
    ).setOrigin(0.5);

    this.scene.tweens.add({
      targets: floatText,
      y: floatText.y - 30,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => floatText.destroy(),
    });
  }

  /**
   * ゴールド変化アニメーション
   */
  animateGoldChange(amount: number): void {
    const isGain = amount > 0;
    const text = isGain ? `+${amount.toLocaleString()}` : `${amount.toLocaleString()}`;
    const style = isGain ? TextStyles.success : TextStyles.warning;

    const floatText = this.scene.add.text(
      HeaderLayout.GOLD_X + 50,
      HeaderLayout.HEIGHT / 2 - 30,
      text,
      {
        ...style,
        fontSize: '14px',
      }
    ).setOrigin(0.5);

    this.scene.tweens.add({
      targets: floatText,
      y: floatText.y - 20,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => floatText.destroy(),
    });

    // ゴールドテキストのパルスアニメーション
    this.scene.tweens.add({
      targets: this.goldText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2',
    });
  }

  /**
   * AP変化アニメーション
   */
  animateAPChange(amount: number): void {
    const isGain = amount > 0;
    const text = isGain ? `+${amount}` : `${amount}`;
    const style = isGain ? TextStyles.success : TextStyles.warning;

    const floatText = this.scene.add.text(
      HeaderLayout.AP_X + HeaderLayout.AP_GAUGE_WIDTH / 2,
      HeaderLayout.HEIGHT / 2 - 30,
      `${text} AP`,
      {
        ...style,
        fontSize: '14px',
      }
    ).setOrigin(0.5);

    this.scene.tweens.add({
      targets: floatText,
      y: floatText.y - 20,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => floatText.destroy(),
    });
  }

  /**
   * 日送りアニメーション
   * @returns アニメーション完了時に解決するPromise
   */
  animateDayAdvance(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.dayText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 200,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * AP不足時の視覚効果を表示する
   */
  showAPInsufficient(): void {
    // APゲージを赤く点滅
    this.scene.tweens.add({
      targets: this.apGaugeFill,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
      ease: 'Power2',
    });

    // テキストを振動
    const originalX = this.apText.x;
    this.scene.tweens.add({
      targets: this.apText,
      x: originalX + 5,
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Power2',
      onComplete: () => this.apText.setX(originalX),
    });
  }

  // ========================================
  // 表示制御
  // ========================================

  /**
   * 表示・非表示を設定する
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  // ========================================
  // ライフサイクル
  // ========================================

  /**
   * リソースを破棄する
   */
  destroy(): void {
    // AP点滅アニメーションを停止
    this.stopAPWarningBlink();
    this.container.destroy();
  }
}
