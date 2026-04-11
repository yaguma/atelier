/**
 * HUDBar - ゴールド/AP/日数/ランク/昇格ゲージ 共通HUD composite
 * Issue #456: UI刷新 Phase 2
 * Issue #458: UI刷新 Phase 4 A準備 - HeaderUI 機能等価化
 *
 * @description
 * 画面上部に常駐するゲーム状態HUD。既存 `HeaderUI` の視覚・データ契約と等価なAPIを提供する。
 *
 * 主な機能:
 * - ランク表示
 * - 昇格ゲージ（値に応じた色: 赤/黄/緑/水色）
 * - 残り日数表示（色分け: 白/黄/赤/明るい赤+点滅）
 * - 所持ゴールド（Gアイコン付き）
 * - 行動ポイント（AP）
 * - 貢献度（Phase 2 HUDBarData 互換フィールド）
 *
 * データ契約:
 * - 新方式: `updateFromHeader(IHeaderUIData)` — HeaderUI とキー互換
 * - 旧方式: `update(Partial<HUDBarData>)` — Phase 2 初期実装との互換保持
 * - 双方向: `HUDBarData` は両者のフィールドをマージした superset で、alias
 *   (`day` ↔ `remainingDays`、`rank` ↔ `currentRank`) は常に同期される
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { MAIN_LAYOUT } from '@shared/constants';
import { DesignTokens } from '@shared/theme';
import type { GuildRank as GuildRankType } from '@shared/types/common';
import { GuildRank } from '@shared/types/common';
import type Phaser from 'phaser';

// =============================================================================
// 型定義
// =============================================================================

/**
 * HeaderUI の更新データ契約 (from @shared/components/HeaderUI.IHeaderUIData)
 * HUDBar が互換性を保つために参照する superset。
 */
export interface HUDHeaderData {
  currentRank: GuildRankType;
  promotionGauge: number;
  remainingDays: number;
  gold: number;
  actionPoints: number;
  maxActionPoints: number;
}

/**
 * HUDBar の内部データ表現
 * 既存 Phase 2 実装 (day/rank/contribution) と HeaderUI 互換
 * (currentRank/promotionGauge/remainingDays) の superset。
 */
export interface HUDBarData {
  gold: number;
  actionPoints: number;
  maxActionPoints: number;
  /** 残り日数 (HeaderUI 互換) */
  remainingDays: number;
  /** `remainingDays` のエイリアス（Phase 2 互換） */
  day: number;
  /** ランク (HeaderUI 互換) */
  currentRank: GuildRankType;
  /** `currentRank` のエイリアス（Phase 2 互換）。string で指定可 */
  rank: string;
  /** 昇格ゲージ値 (0-100) */
  promotionGauge: number;
  /** 貢献度（Phase 2 互換フィールド。表示は任意） */
  contribution: number;
}

export interface HUDBarOptions extends BaseComponentOptions {
  width?: number;
  data?: Partial<HUDBarData>;
}

// =============================================================================
// 定数
// =============================================================================

/** HUDBar 用カラー定数（HeaderUI と同じ値を使用） */
const HUD_COLORS = {
  RED: 0xff6b6b,
  YELLOW: 0xffd93d,
  GREEN: 0x6bcb77,
  CYAN: 0x4ecdc4,
  WHITE: 0xffffff,
  BRIGHT_RED: 0xff0000,
  BACKGROUND: 0x1f2937,
  BORDER: 0x374151,
} as const;

/** @deprecated Issue #486: MainSceneからwidthオプションで渡される。フォールバック用 */
const DEFAULT_WIDTH = MAIN_LAYOUT.GAME_WIDTH - MAIN_LAYOUT.SIDEBAR_WIDTH;
const HUD_HEIGHT = MAIN_LAYOUT.HUD_HEIGHT;
const GAUGE_WIDTH = 100;
const GAUGE_HEIGHT = 16;

/**
 * HUDBar 内部セクションの相対配置比率
 * HUDBar幅に対するパーセンテージで各セクション開始位置を定義する。
 * Issue #489: ハードコードされた絶対px座標をレスポンシブ化
 */
const HUD_SECTION_RATIOS = {
  /** ランクラベル開始位置 */
  RANK: 0.015,
  /** ランクテキスト開始位置 */
  RANK_TEXT: 0.07,
  /** 昇格ゲージ開始位置 */
  GAUGE: 0.13,
  /** 残り日数ラベル開始位置 */
  DAYS_LABEL: 0.24,
  /** 残り日数テキスト開始位置 */
  DAYS_TEXT: 0.29,
  /** ゴールドアイコン開始位置 */
  GOLD_ICON: 0.39,
  /** ゴールドテキスト開始位置 */
  GOLD_TEXT: 0.41,
  /** APラベル開始位置 */
  AP_LABEL: 0.5,
  /** APテキスト開始位置 */
  AP_TEXT: 0.54,
  /** 貢献度テキスト（右寄せ）: 右端からのオフセット比率 */
  CONTRIBUTION_RIGHT_OFFSET: 0.15,
} as const;

const DEFAULT_DATA: HUDBarData = {
  gold: 0,
  actionPoints: 0,
  maxActionPoints: 0,
  remainingDays: 0,
  day: 0,
  currentRank: GuildRank.G,
  rank: GuildRank.G,
  promotionGauge: 0,
  contribution: 0,
};

// =============================================================================
// ヘルパ
// =============================================================================

const isValidGuildRank = (value: unknown): value is GuildRankType =>
  Object.values(GuildRank).includes(value as GuildRankType);

/** 昇格ゲージ値に応じた色を計算 */
const calcPromotionGaugeColor = (value: number): number => {
  if (value >= 100) return HUD_COLORS.CYAN;
  if (value >= 60) return HUD_COLORS.GREEN;
  if (value >= 30) return HUD_COLORS.YELLOW;
  return HUD_COLORS.RED;
};

/** 残り日数に応じた色と点滅フラグを計算 */
const calcRemainingDaysStyle = (days: number): { color: number; blinking: boolean } => {
  if (days <= 3) return { color: HUD_COLORS.BRIGHT_RED, blinking: true };
  if (days <= 5) return { color: HUD_COLORS.RED, blinking: false };
  if (days <= 10) return { color: HUD_COLORS.YELLOW, blinking: false };
  return { color: HUD_COLORS.WHITE, blinking: false };
};

const colorNumberToCss = (value: number): string =>
  `#${value.toString(16).padStart(6, '0').toUpperCase()}`;

// =============================================================================
// HUDBar
// =============================================================================

export class HUDBar extends BaseComponent {
  // 設定
  private readonly width: number;

  // 状態
  private data: HUDBarData;
  private remainingDaysBlinking = false;

  // 視覚要素
  private rankTextEl: Phaser.GameObjects.Text | null = null;
  private gaugeBackground: Phaser.GameObjects.Graphics | null = null;
  private gaugeFill: Phaser.GameObjects.Graphics | null = null;
  private daysTextEl: Phaser.GameObjects.Text | null = null;
  private goldTextEl: Phaser.GameObjects.Text | null = null;
  private apTextEl: Phaser.GameObjects.Text | null = null;
  private contributionTextEl: Phaser.GameObjects.Text | null = null;
  private blinkingTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, options: HUDBarOptions = {}) {
    super(scene, x, y, options);
    this.width = options.width ?? DEFAULT_WIDTH;
    this.data = this.mergeData(DEFAULT_DATA, options.data ?? {});
  }

  // ===========================================================================
  // ライフサイクル
  // ===========================================================================

  create(): void {
    const centerX = this.width / 2;
    const centerY = HUD_HEIGHT / 2;

    // 背景パネル
    const bg = this.scene.add.rectangle(
      centerX,
      centerY,
      this.width,
      HUD_HEIGHT,
      HUD_COLORS.BACKGROUND,
      0.95,
    );
    if (bg.setName) bg.setName('HUDBar.backgroundPanel');
    this.container.add(bg);

    // 下部ボーダー
    const borderLine = this.scene.add.rectangle(
      centerX,
      HUD_HEIGHT - 1,
      this.width,
      2,
      HUD_COLORS.BORDER,
      1,
    );
    if (borderLine.setName) borderLine.setName('HUDBar.borderLine');
    this.container.add(borderLine);

    this.container.setDepth(DesignTokens.zIndex.hud);

    // セクションX座標を幅から算出
    const w = this.width;
    const sections = HUD_SECTION_RATIOS;

    // ランクラベル
    const rankLabel = this.scene.make.text({
      x: w * sections.RANK,
      y: 12,
      text: 'ランク:',
      style: { fontSize: '14px', color: '#9CA3AF' },
      add: false,
    });
    if (rankLabel.setName) rankLabel.setName('HUDBar.rankLabel');
    this.container.add(rankLabel);

    // ランクテキスト
    this.rankTextEl = this.scene.make.text({
      x: w * sections.RANK_TEXT,
      y: 10,
      text: '',
      style: { fontSize: '18px', color: '#F9FAFB', fontStyle: 'bold' },
      add: false,
    });
    if (this.rankTextEl.setName) this.rankTextEl.setName('HUDBar.rankText');
    this.container.add(this.rankTextEl);

    // 昇格ゲージ背景（静的）
    this.gaugeBackground = this.scene.add.graphics();
    if (this.gaugeBackground.fillStyle) {
      const gaugeX = w * sections.GAUGE;
      this.gaugeBackground.fillStyle(0x374151, 1);
      if (this.gaugeBackground.fillRoundedRect) {
        this.gaugeBackground.fillRoundedRect(gaugeX, 14, GAUGE_WIDTH, GAUGE_HEIGHT, 4);
      } else if (this.gaugeBackground.fillRect) {
        this.gaugeBackground.fillRect(gaugeX, 14, GAUGE_WIDTH, GAUGE_HEIGHT);
      }
    }
    if (this.gaugeBackground.setName) this.gaugeBackground.setName('HUDBar.gaugeBackground');
    this.container.add(this.gaugeBackground);

    // 昇格ゲージフィル（update で塗り直し）
    this.gaugeFill = this.scene.add.graphics();
    if (this.gaugeFill.setName) this.gaugeFill.setName('HUDBar.gaugeFill');
    this.container.add(this.gaugeFill);

    // 残り日数ラベル
    const daysLabel = this.scene.make.text({
      x: w * sections.DAYS_LABEL,
      y: 12,
      text: '残り:',
      style: { fontSize: '14px', color: '#9CA3AF' },
      add: false,
    });
    if (daysLabel.setName) daysLabel.setName('HUDBar.daysLabel');
    this.container.add(daysLabel);

    // 残り日数テキスト
    this.daysTextEl = this.scene.make.text({
      x: w * sections.DAYS_TEXT,
      y: 10,
      text: '',
      style: { fontSize: '18px', color: '#F9FAFB', fontStyle: 'bold' },
      add: false,
    });
    if (this.daysTextEl.setName) this.daysTextEl.setName('HUDBar.daysText');
    this.container.add(this.daysTextEl);

    // ゴールドアイコン
    const goldIcon = this.scene.make.text({
      x: w * sections.GOLD_ICON,
      y: 12,
      text: 'G',
      style: { fontSize: '16px', color: '#FCD34D', fontStyle: 'bold' },
      add: false,
    });
    if (goldIcon.setName) goldIcon.setName('HUDBar.goldIcon');
    this.container.add(goldIcon);

    // ゴールドテキスト
    this.goldTextEl = this.scene.make.text({
      x: w * sections.GOLD_TEXT,
      y: 10,
      text: '',
      style: { fontSize: '18px', color: '#FCD34D', fontStyle: 'bold' },
      add: false,
    });
    if (this.goldTextEl.setName) this.goldTextEl.setName('HUDBar.goldText');
    this.container.add(this.goldTextEl);

    // APラベル
    const apLabel = this.scene.make.text({
      x: w * sections.AP_LABEL,
      y: 12,
      text: 'AP:',
      style: { fontSize: '14px', color: '#9CA3AF' },
      add: false,
    });
    if (apLabel.setName) apLabel.setName('HUDBar.apLabel');
    this.container.add(apLabel);

    // APテキスト
    this.apTextEl = this.scene.make.text({
      x: w * sections.AP_TEXT,
      y: 10,
      text: '',
      style: { fontSize: '18px', color: '#60A5FA', fontStyle: 'bold' },
      add: false,
    });
    if (this.apTextEl.setName) this.apTextEl.setName('HUDBar.apText');
    this.container.add(this.apTextEl);

    // 貢献度テキスト（Phase 2 互換フィールド、右側寄せ）
    this.contributionTextEl = this.scene.make.text({
      x: w * (1 - sections.CONTRIBUTION_RIGHT_OFFSET),
      y: 12,
      text: '',
      style: { fontSize: '14px', color: '#9CA3AF', fontStyle: 'normal' },
      add: false,
    });
    if (this.contributionTextEl.setName) this.contributionTextEl.setName('HUDBar.contributionText');
    this.container.add(this.contributionTextEl);

    // 初期表示
    this.refreshVisuals(false);
  }

  destroy(): void {
    // 点滅Tween停止
    if (this.blinkingTween) {
      this.blinkingTween.stop();
      this.blinkingTween = null;
    }

    this.rankTextEl = null;
    this.gaugeBackground = null;
    this.gaugeFill = null;
    this.daysTextEl = null;
    this.goldTextEl = null;
    this.apTextEl = null;
    this.contributionTextEl = null;

    this.container.destroy(true);
  }

  // ===========================================================================
  // 公開API
  // ===========================================================================

  /**
   * 部分更新（Phase 2 互換 + HeaderUI 互換）
   * `day` / `remainingDays`、`rank` / `currentRank` は相互に同期される。
   */
  update(patch: Partial<HUDBarData>): this {
    const previouslyBlinking = this.remainingDaysBlinking;
    this.data = this.mergeData(this.data, patch);
    this.refreshVisuals(previouslyBlinking);
    return this;
  }

  /**
   * HeaderUI 互換の完全更新
   * 既存 `HeaderUI.update(data)` の置き換えとしてそのまま呼び出せる。
   */
  updateFromHeader(data: HUDHeaderData): this {
    return this.update({
      currentRank: data.currentRank,
      rank: data.currentRank,
      promotionGauge: data.promotionGauge,
      remainingDays: data.remainingDays,
      day: data.remainingDays,
      gold: data.gold,
      actionPoints: data.actionPoints,
      maxActionPoints: data.maxActionPoints,
    });
  }

  getData(): HUDBarData {
    return this.data;
  }

  getRemainingDaysBlinking(): boolean {
    return this.remainingDaysBlinking;
  }

  // ===========================================================================
  // 内部: マージ（alias 同期）
  // ===========================================================================

  private mergeData(base: HUDBarData, patch: Partial<HUDBarData>): HUDBarData {
    const merged: HUDBarData = { ...base, ...patch };

    // day / remainingDays の同期（patch で指定された方を優先）
    if (patch.remainingDays !== undefined) {
      merged.day = patch.remainingDays;
    } else if (patch.day !== undefined) {
      merged.remainingDays = patch.day;
    }

    // rank / currentRank の同期
    if (patch.currentRank !== undefined) {
      merged.rank = patch.currentRank;
    } else if (patch.rank !== undefined) {
      if (isValidGuildRank(patch.rank)) {
        merged.currentRank = patch.rank;
      }
    }

    return merged;
  }

  // ===========================================================================
  // 内部: 視覚更新
  // ===========================================================================

  private refreshVisuals(previouslyBlinking: boolean): void {
    const d = this.data;

    // ランク
    const validRank = isValidGuildRank(d.currentRank) ? d.currentRank : GuildRank.G;
    this.rankTextEl?.setText(`ランク: ${validRank}`);

    // 昇格ゲージ
    this.updatePromotionGauge();

    // 残り日数
    const daysStyle = calcRemainingDaysStyle(d.remainingDays);
    this.remainingDaysBlinking = daysStyle.blinking;
    if (this.daysTextEl) {
      this.daysTextEl.setText(`残り: ${d.remainingDays}日`);
      if (this.daysTextEl.setColor) {
        this.daysTextEl.setColor(colorNumberToCss(daysStyle.color));
      }
    }
    this.updateBlinking(previouslyBlinking);

    // ゴールド
    this.goldTextEl?.setText(`${d.gold}G`);

    // AP
    this.apTextEl?.setText(`${d.actionPoints}/${d.maxActionPoints} AP`);

    // 貢献度
    this.contributionTextEl?.setText(d.contribution ? `貢献 ${d.contribution}` : '');
  }

  private updatePromotionGauge(): void {
    if (!this.gaugeFill) return;
    if (this.gaugeFill.clear) this.gaugeFill.clear();
    if (!this.gaugeFill.fillStyle || !this.gaugeFill.fillRect) return;
    const color = calcPromotionGaugeColor(this.data.promotionGauge);
    this.gaugeFill.fillStyle(color, 1);
    const ratio = Math.max(0, Math.min(100, this.data.promotionGauge)) / 100;
    const fillWidth = ratio * GAUGE_WIDTH;
    const gaugeX = this.width * HUD_SECTION_RATIOS.GAUGE;
    this.gaugeFill.fillRect(gaugeX, 14, fillWidth, GAUGE_HEIGHT);
  }

  private updateBlinking(previouslyBlinking: boolean): void {
    if (this.remainingDaysBlinking && !previouslyBlinking) {
      this.startBlinkingTween();
    } else if (!this.remainingDaysBlinking && previouslyBlinking) {
      this.stopBlinkingTween();
    }
  }

  private startBlinkingTween(): void {
    if (!this.daysTextEl || !this.scene.tweens) return;
    this.blinkingTween = this.scene.tweens.add({
      targets: this.daysTextEl,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    }) as Phaser.Tweens.Tween;
  }

  private stopBlinkingTween(): void {
    if (this.blinkingTween) {
      this.blinkingTween.stop();
      this.blinkingTween = null;
    }
    if (this.daysTextEl?.setAlpha) {
      this.daysTextEl.setAlpha(1);
    }
    if (this.daysTextEl && this.scene.tweens?.killTweensOf) {
      this.scene.tweens.killTweensOf(this.daysTextEl);
    }
  }
}
