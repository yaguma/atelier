/**
 * ヘッダーUIコンポーネント
 * TASK-0046 MainScene共通レイアウト実装
 * TASK-0047 共通UIコンポーネント視覚実装
 *
 * @description
 * ギルドランク、昇格ゲージ、残り日数、所持金、行動ポイントを表示するヘッダー
 *
 * @信頼性レベル 🔵 requirements.md セクション2.2に基づく
 */

import { GuildRank, type GuildRank as GuildRankType } from '@shared/types/common';
import Phaser from 'phaser';
import { BaseComponent } from './BaseComponent';

// =============================================================================
// カラー定数
// =============================================================================

/**
 * ヘッダーUI用カラー定数
 */
const COLORS = {
  /** 赤系（危険） - 昇格ゲージ0-29%、残り日数4-5日 */
  RED: 0xff6b6b,
  /** 黄系（警告） - 昇格ゲージ30-59%、残り日数6-10日 */
  YELLOW: 0xffd93d,
  /** 緑系（安全） - 昇格ゲージ60-99% */
  GREEN: 0x6bcb77,
  /** 水色（達成） - 昇格ゲージ100% */
  CYAN: 0x4ecdc4,
  /** 白 - 残り日数11日以上 */
  WHITE: 0xffffff,
  /** 明るい赤（点滅用） - 残り日数1-3日 */
  BRIGHT_RED: 0xff0000,
  /** 背景色（半透明ダークグレー） */
  BACKGROUND: 0x1f2937,
  /** ボーダー色 */
  BORDER: 0x374151,
  /** テキスト色（明るいグレー） */
  TEXT: 0xe5e7eb,
} as const;

/**
 * ヘッダーレイアウト定数
 */
const HEADER_LAYOUT = {
  /** ヘッダー幅（画面幅 - サイドバー幅） */
  WIDTH: 1024 - 200,
  /** ヘッダー高さ */
  HEIGHT: 60,
  /** パディング */
  PADDING: 16,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/**
 * HeaderUI更新データの型定義
 */
export interface IHeaderUIData {
  currentRank: GuildRankType;
  promotionGauge: number;
  remainingDays: number;
  gold: number;
  actionPoints: number;
  maxActionPoints: number;
}

/**
 * 有効なGuildRankかどうかを検証
 * @param value - 検証する値
 * @returns 有効なGuildRankの場合true
 */
const isValidGuildRank = (value: unknown): value is GuildRankType => {
  return Object.values(GuildRank).includes(value as GuildRankType);
};

// =============================================================================
// HeaderUIクラス
// =============================================================================

/**
 * ヘッダーUIコンポーネント
 *
 * 画面上部に配置され、ゲーム状態の主要情報を表示する。
 * - ギルドランク
 * - 昇格ゲージ（プログレスバー）
 * - 残り日数
 * - 所持金
 * - 行動ポイント
 *
 * @信頼性レベル 🔵 requirements.md セクション2.2に基づく
 */
export class HeaderUI extends BaseComponent {
  // ===========================================================================
  // 内部状態
  // ===========================================================================

  /** ランク表示テキスト */
  private _rankText = '';

  /** 昇格ゲージ値 */
  private _promotionGaugeValue = 0;

  /** 昇格ゲージテキスト */
  private _promotionGaugeText = '0/100';

  /** 昇格ゲージ色 */
  private _promotionGaugeColor: number = COLORS.RED;

  /** 残り日数テキスト */
  private _remainingDaysText = '残り: 0日';

  /** 残り日数の色 */
  private _remainingDaysColor: number = COLORS.WHITE;

  /** 残り日数点滅フラグ */
  private _remainingDaysBlinking = false;

  /** 所持金テキスト */
  private _goldText = '0G';

  /** 行動ポイントテキスト */
  private _actionPointsText = '0/0 AP';

  // ===========================================================================
  // 視覚要素（Phaserオブジェクト）
  // ===========================================================================

  /** ランク表示テキストオブジェクト */
  private _rankTextElement: Phaser.GameObjects.Text | null = null;

  /** 昇格ゲージ背景グラフィックス */
  private _gaugeBackground: Phaser.GameObjects.Graphics | null = null;

  /** 昇格ゲージフィルグラフィックス */
  private _gaugeFill: Phaser.GameObjects.Graphics | null = null;

  /** 残り日数テキストオブジェクト */
  private _daysTextElement: Phaser.GameObjects.Text | null = null;

  /** 所持金テキストオブジェクト */
  private _goldTextElement: Phaser.GameObjects.Text | null = null;

  /** 行動ポイントテキストオブジェクト */
  private _actionPointsTextElement: Phaser.GameObjects.Text | null = null;

  /** 点滅Tween */
  private _blinkingTween: Phaser.Tweens.Tween | null = null;

  /** 背景パネル */
  private _backgroundPanel: Phaser.GameObjects.Rectangle | null = null;

  /** ゲージ幅 */
  private readonly GAUGE_WIDTH = 100;

  /** ゲージ高さ */
  private readonly GAUGE_HEIGHT = 16;

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @param x - X座標
   * @param y - Y座標
   * @throws {Error} sceneがnullまたはundefinedの場合
   */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // BaseComponentでも検証するが、テストで期待する具体的なエラーメッセージのため
    if (!scene) {
      throw new Error('scene is required');
    }
    super(scene, x, y);
  }

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * コンポーネントの初期化処理
   * TASK-0047: 視覚要素を生成
   */
  create(): void {
    // 背景パネルを生成（半透明のダークグレー）
    this._backgroundPanel = new Phaser.GameObjects.Rectangle(
      this.scene,
      HEADER_LAYOUT.WIDTH / 2,
      HEADER_LAYOUT.HEIGHT / 2,
      HEADER_LAYOUT.WIDTH,
      HEADER_LAYOUT.HEIGHT,
      COLORS.BACKGROUND,
      0.95,
    ).setName('HeaderUI.backgroundPanel');
    this.container.add(this._backgroundPanel);

    // 下部ボーダーライン
    const borderLine = new Phaser.GameObjects.Rectangle(
      this.scene,
      HEADER_LAYOUT.WIDTH / 2,
      HEADER_LAYOUT.HEIGHT - 1,
      HEADER_LAYOUT.WIDTH,
      2,
      COLORS.BORDER,
      1,
    ).setName('HeaderUI.borderLine');
    this.container.add(borderLine);

    // ランクラベルを生成
    const rankLabel = this.scene.make.text({
      x: HEADER_LAYOUT.PADDING,
      y: 12,
      text: 'ランク:',
      style: { fontSize: '14px', color: '#9CA3AF' },
      add: false,
    });
    this.container.add(rankLabel);

    // ランクテキストを生成
    this._rankTextElement = this.scene.make.text({
      x: HEADER_LAYOUT.PADDING + 60,
      y: 10,
      text: '',
      style: { fontSize: '18px', color: '#F9FAFB', fontStyle: 'bold' },
      add: false,
    });
    this.container.add(this._rankTextElement);

    // 昇格ゲージ背景を生成
    this._gaugeBackground = new Phaser.GameObjects.Graphics(this.scene);
    this._gaugeBackground.fillStyle(0x374151, 1);
    this._gaugeBackground.fillRoundedRect(140, 14, this.GAUGE_WIDTH, this.GAUGE_HEIGHT, 4);
    this.container.add(this._gaugeBackground);

    // 昇格ゲージフィルを生成
    this._gaugeFill = new Phaser.GameObjects.Graphics(this.scene);
    this.container.add(this._gaugeFill);

    // 残り日数ラベル
    const daysLabel = this.scene.make.text({
      x: 260,
      y: 12,
      text: '残り:',
      style: { fontSize: '14px', color: '#9CA3AF' },
      add: false,
    });
    this.container.add(daysLabel);

    // 残り日数テキストを生成
    this._daysTextElement = this.scene.make.text({
      x: 310,
      y: 10,
      text: '',
      style: { fontSize: '18px', color: '#F9FAFB', fontStyle: 'bold' },
      add: false,
    });
    this.container.add(this._daysTextElement);

    // 所持金アイコン（コインの絵文字の代わりにGマーク）
    const goldIcon = this.scene.make.text({
      x: 420,
      y: 12,
      text: 'G',
      style: { fontSize: '16px', color: '#FCD34D', fontStyle: 'bold' },
      add: false,
    });
    this.container.add(goldIcon);

    // 所持金テキストを生成
    this._goldTextElement = this.scene.make.text({
      x: 440,
      y: 10,
      text: '',
      style: { fontSize: '18px', color: '#FCD34D', fontStyle: 'bold' },
      add: false,
    });
    this.container.add(this._goldTextElement);

    // 行動ポイントラベル
    const apLabel = this.scene.make.text({
      x: 540,
      y: 12,
      text: 'AP:',
      style: { fontSize: '14px', color: '#9CA3AF' },
      add: false,
    });
    this.container.add(apLabel);

    // 行動ポイントテキストを生成
    this._actionPointsTextElement = this.scene.make.text({
      x: 580,
      y: 10,
      text: '',
      style: { fontSize: '18px', color: '#60A5FA', fontStyle: 'bold' },
      add: false,
    });
    this.container.add(this._actionPointsTextElement);
  }

  /**
   * コンポーネントの破棄処理
   * TASK-0047: 視覚要素も破棄
   */
  destroy(): void {
    // 点滅Tweenを停止
    if (this._blinkingTween) {
      this._blinkingTween.stop();
      this._blinkingTween = null;
    }

    // 視覚要素の参照をクリア
    this._rankTextElement = null;
    this._gaugeBackground = null;
    this._gaugeFill = null;
    this._daysTextElement = null;
    this._goldTextElement = null;
    this._actionPointsTextElement = null;

    this.container.destroy();
  }

  // ===========================================================================
  // 更新メソッド
  // ===========================================================================

  /**
   * ヘッダー情報を更新
   * TASK-0047: 視覚要素を更新
   *
   * @param data - 更新データ
   */
  update(data: IHeaderUIData): void {
    // 以前の点滅状態を保持
    const wasBlinking = this._remainingDaysBlinking;

    // ランク表示（防御的チェック: 無効な値の場合はデフォルト値Gを使用）
    const validRank = isValidGuildRank(data.currentRank) ? data.currentRank : GuildRank.G;
    this._rankText = `ランク: ${validRank}`;

    // 昇格ゲージ
    this._promotionGaugeValue = data.promotionGauge;
    this._promotionGaugeText = `${data.promotionGauge}/100`;
    this._promotionGaugeColor = this.calculatePromotionGaugeColor(data.promotionGauge);

    // 残り日数
    this._remainingDaysText = `残り: ${data.remainingDays}日`;
    const daysColorInfo = this.calculateRemainingDaysColor(data.remainingDays);
    this._remainingDaysColor = daysColorInfo.color;
    this._remainingDaysBlinking = daysColorInfo.blinking;

    // 所持金
    this._goldText = `${data.gold}G`;

    // 行動ポイント
    this._actionPointsText = `${data.actionPoints}/${data.maxActionPoints} AP`;

    // TASK-0047: 視覚要素の更新
    this.updateVisualElements(wasBlinking);
  }

  // ===========================================================================
  // 視覚更新メソッド
  // ===========================================================================

  /**
   * 視覚要素を更新
   * @param wasBlinking - 以前の点滅状態
   */
  private updateVisualElements(wasBlinking: boolean): void {
    // ランクテキスト更新
    if (this._rankTextElement) {
      this._rankTextElement.setText(this._rankText);
    }

    // 昇格ゲージ更新
    this.updatePromotionGauge();

    // 残り日数テキスト更新
    if (this._daysTextElement) {
      this._daysTextElement.setText(this._remainingDaysText);
      // 色を16進数からCSS形式に変換
      const colorHex = this._remainingDaysColor.toString(16).padStart(6, '0');
      this._daysTextElement.setColor(`#${colorHex.toUpperCase()}`);
    }

    // 点滅処理
    this.updateBlinking(wasBlinking);

    // 所持金テキスト更新
    if (this._goldTextElement) {
      this._goldTextElement.setText(this._goldText);
    }

    // 行動ポイントテキスト更新
    if (this._actionPointsTextElement) {
      this._actionPointsTextElement.setText(this._actionPointsText);
    }
  }

  /**
   * 昇格ゲージを更新
   */
  private updatePromotionGauge(): void {
    if (this._gaugeFill) {
      this._gaugeFill.clear();
      this._gaugeFill.fillStyle(this._promotionGaugeColor, 1);
      const fillWidth = (this._promotionGaugeValue / 100) * this.GAUGE_WIDTH;
      this._gaugeFill.fillRect(120, 10, fillWidth, this.GAUGE_HEIGHT);
    }
  }

  /**
   * 点滅Tweenを更新
   * @param wasBlinking - 以前の点滅状態
   */
  private updateBlinking(wasBlinking: boolean): void {
    if (this._remainingDaysBlinking && !wasBlinking) {
      // 点滅開始
      this.startBlinkingTween();
    } else if (!this._remainingDaysBlinking && wasBlinking) {
      // 点滅停止
      this.stopBlinkingTween();
    }
  }

  /**
   * 点滅Tweenを開始
   */
  private startBlinkingTween(): void {
    if (this._daysTextElement && this.scene.tweens) {
      this._blinkingTween = this.scene.tweens.add({
        targets: this._daysTextElement,
        alpha: { from: 1, to: 0.3 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /**
   * 点滅Tweenを停止
   */
  private stopBlinkingTween(): void {
    if (this._blinkingTween) {
      this._blinkingTween.stop();
      this._blinkingTween = null;
    }
    if (this._daysTextElement) {
      this._daysTextElement.setAlpha(1);
    }
    // killTweensOfも呼び出し
    if (this._daysTextElement && this.scene.tweens) {
      this.scene.tweens.killTweensOf(this._daysTextElement);
    }
  }

  // ===========================================================================
  // ゲッターメソッド
  // ===========================================================================

  /**
   * ランクテキストを取得
   */
  getRankText(): string {
    return this._rankText;
  }

  /**
   * 昇格ゲージ値を取得
   */
  getPromotionGaugeValue(): number {
    return this._promotionGaugeValue;
  }

  /**
   * 昇格ゲージテキストを取得
   */
  getPromotionGaugeText(): string {
    return this._promotionGaugeText;
  }

  /**
   * 昇格ゲージ色を取得
   */
  getPromotionGaugeColor(): number {
    return this._promotionGaugeColor;
  }

  /**
   * 残り日数テキストを取得
   */
  getRemainingDaysText(): string {
    return this._remainingDaysText;
  }

  /**
   * 残り日数の色を取得
   */
  getRemainingDaysColor(): number {
    return this._remainingDaysColor;
  }

  /**
   * 残り日数が点滅中かを取得
   */
  isRemainingDaysBlinking(): boolean {
    return this._remainingDaysBlinking;
  }

  /**
   * 所持金テキストを取得
   */
  getGoldText(): string {
    return this._goldText;
  }

  /**
   * 行動ポイントテキストを取得
   */
  getActionPointsText(): string {
    return this._actionPointsText;
  }

  // ===========================================================================
  // プライベートメソッド
  // ===========================================================================

  /**
   * 昇格ゲージの値に応じた色を計算
   *
   * - 0-29%: 赤系色 (0xFF6B6B)
   * - 30-59%: 黄系色 (0xFFD93D)
   * - 60-99%: 緑系色 (0x6BCB77)
   * - 100%: 水色 (0x4ECDC4)
   *
   * @param value - 昇格ゲージ値（0-100）
   * @returns カラーコード
   */
  private calculatePromotionGaugeColor(value: number): number {
    if (value >= 100) {
      return COLORS.CYAN; // 100%: 水色
    }
    if (value >= 60) {
      return COLORS.GREEN; // 60-99%: 緑系
    }
    if (value >= 30) {
      return COLORS.YELLOW; // 30-59%: 黄系
    }
    return COLORS.RED; // 0-29%: 赤系
  }

  /**
   * 残り日数に応じた色と点滅フラグを計算
   *
   * - 1-3日: 明るい赤 + 点滅 (0xFF0000)
   * - 4-5日: 赤色 (0xFF6B6B)
   * - 6-10日: 黄色 (0xFFD93D)
   * - 11日以上: 白 (0xFFFFFF)
   *
   * @param days - 残り日数
   * @returns 色と点滅フラグのオブジェクト
   */
  private calculateRemainingDaysColor(days: number): { color: number; blinking: boolean } {
    if (days <= 3) {
      // 1-3日: 明るい赤 + 点滅
      return { color: COLORS.BRIGHT_RED, blinking: true };
    }
    if (days <= 5) {
      // 4-5日: 赤色
      return { color: COLORS.RED, blinking: false };
    }
    if (days <= 10) {
      // 6-10日: 黄色
      return { color: COLORS.YELLOW, blinking: false };
    }
    // 11日以上: 白
    return { color: COLORS.WHITE, blinking: false };
  }
}
