/**
 * HUDBar - ゴールド/AP/日数/ランク/昇格ゲージ 共通HUD composite
 * Issue #456: UI刷新 Phase 2
 * Issue #458: UI刷新 Phase 4 A準備 - HeaderUI 機能等価化
 * TASK-0002: UIモックアップ実装 - モック02〜05 `.header` 仕様へ作り直し
 *
 * @description
 * 画面上部に常駐するゲーム状態HUD。既存 `HeaderUI` の視覚・データ契約と等価なAPIを提供する。
 *
 * 主な機能:
 * - ランク表示（pill型バッジ）
 * - 昇格ゲージ（値に応じた色: 赤/黄/緑/水色、height 8px）
 * - 残り日数表示（色分け: 白/黄/赤/明るい赤+点滅）
 * - 所持ゴールド（値 + G 表記、accent色）
 * - 行動ポイント（AP）
 * - 貢献度（Phase 2 HUDBarData 互換フィールド）
 *
 * モック仕様（02〜05 `.header`）:
 * - 背景 surface.header / 下線 border.subtle 1px
 * - HUD項目フォント 12px にコンパクト化
 * - ランクは pill型バッジ（bg brand.secondary）
 * - 昇格ゲージ height 8px / max-width 120px
 * - セクション間に 1px×16px のセパレーター
 *
 * データ契約:
 * - 新方式: `updateFromHeader(IHeaderUIData)` — HeaderUI とキー互換
 * - 旧方式: `update(Partial<HUDBarData>)` — Phase 2 初期実装との互換保持
 * - 双方向: `HUDBarData` は両者のフィールドをマージした superset で、alias
 *   (`day` ↔ `remainingDays`、`rank` ↔ `currentRank`) は常に同期される
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { MAIN_LAYOUT } from '@shared/constants';
import { Colors, DesignTokens, toColorStr } from '@shared/theme';
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

/** HUDBar 用カラー定数 — design-guide.md §5.5 準拠 */
const HUD_COLORS = {
  RED: Colors.status.error,
  YELLOW: Colors.status.warning,
  GREEN: Colors.status.success,
  CYAN: Colors.status.info,
  WHITE: Colors.text.primary,
  BRIGHT_RED: 0xff0000,
  BACKGROUND: Colors.surface.header,
  BORDER: Colors.border.subtle,
} as const;

/** @deprecated Issue #486: MainSceneからwidthオプションで渡される。フォールバック用 */
const DEFAULT_WIDTH = MAIN_LAYOUT.GAME_WIDTH - MAIN_LAYOUT.SIDEBAR_WIDTH;
const HUD_HEIGHT = MAIN_LAYOUT.HUD_HEIGHT;

// --- モック 02〜05 `.header` 準拠のコンパクト寸法 ---
/** HUD 全項目の基準フォントサイズ（モック: 12px） */
const HUD_FONT_SIZE = '12px';
/** ラベル用フォントサイズ */
const HUD_LABEL_SIZE = '12px';
/** 昇格ゲージ寸法（モック: max-width 120px / height 8px） */
const GAUGE_WIDTH = 120;
const GAUGE_HEIGHT = 8;
const GAUGE_RADIUS = GAUGE_HEIGHT / 2;
/** セクション区切り線（モック: width 1px / height 16px） */
const SEPARATOR_WIDTH = 1;
const SEPARATOR_HEIGHT = 16;
/** ランクバッジ寸法（pill型） */
const RANK_BADGE_HEIGHT = 22;
const RANK_BADGE_MIN_WIDTH = 40;
const RANK_BADGE_RADIUS = RANK_BADGE_HEIGHT / 2;
/** バッジ内テキストの左右余白 */
const RANK_BADGE_PADDING_X = 16;

/**
 * HUD 各セクションの固定X座標（左パディング16pxからの左詰めフロー）。
 * 上部バーは左寄せ項目＋右寄せ貢献度で構成し、合計幅に依存しない。
 */
const HUD_LAYOUT = {
  PADDING_X: 16,
  RANK_BADGE_X: 16,
  GAUGE_X: 80,
  SEP_1_X: 220,
  DAYS_X: 240,
  SEP_2_X: 360,
  GOLD_X: 380,
  SEP_3_X: 500,
  AP_X: 520,
  CONTRIBUTION_RIGHT_PADDING: 16,
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
  private rankBadge: Phaser.GameObjects.Graphics | null = null;
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
    const w = this.width;
    const centerX = w / 2;
    const centerY = HUD_HEIGHT / 2;
    const L = HUD_LAYOUT;

    // 背景パネル（surface.header）
    const bg = this.scene.add.rectangle(
      centerX,
      centerY,
      w,
      HUD_HEIGHT,
      HUD_COLORS.BACKGROUND,
      0.95,
    );
    if (bg.setName) bg.setName('HUDBar.backgroundPanel');
    this.container.add(bg);

    // 下線 1px（border.subtle）
    const borderLine = this.scene.add.rectangle(
      centerX,
      HUD_HEIGHT - 1,
      w,
      1,
      HUD_COLORS.BORDER,
      1,
    );
    if (borderLine.setName) borderLine.setName('HUDBar.borderLine');
    this.container.add(borderLine);

    this.container.setDepth(DesignTokens.zIndex.hud);

    // ランクバッジ（pill型背景。サイズは updateRankBadge で確定）
    this.rankBadge = this.scene.add.graphics();
    if (this.rankBadge.setName) this.rankBadge.setName('HUDBar.rankBadge');
    this.container.add(this.rankBadge);

    // ランクテキスト（バッジ中央・白）
    this.rankTextEl = this.scene.make.text({
      x: L.RANK_BADGE_X + RANK_BADGE_MIN_WIDTH / 2,
      y: centerY,
      text: '',
      style: {
        fontSize: HUD_FONT_SIZE,
        color: toColorStr(Colors.text.light),
        fontStyle: 'bold',
        padding: { top: 2 },
      },
      add: false,
    });
    if (this.rankTextEl.setOrigin) this.rankTextEl.setOrigin(0.5, 0.5);
    if (this.rankTextEl.setName) this.rankTextEl.setName('HUDBar.rankText');
    this.container.add(this.rankTextEl);

    // 昇格ゲージ背景（静的・border.subtle）
    this.gaugeBackground = this.scene.add.graphics();
    if (this.gaugeBackground.fillStyle) {
      this.gaugeBackground.fillStyle(Colors.border.subtle, 1);
      const gaugeY = centerY - GAUGE_HEIGHT / 2;
      if (this.gaugeBackground.fillRoundedRect) {
        this.gaugeBackground.fillRoundedRect(
          L.GAUGE_X,
          gaugeY,
          GAUGE_WIDTH,
          GAUGE_HEIGHT,
          GAUGE_RADIUS,
        );
      } else if (this.gaugeBackground.fillRect) {
        this.gaugeBackground.fillRect(L.GAUGE_X, gaugeY, GAUGE_WIDTH, GAUGE_HEIGHT);
      }
    }
    if (this.gaugeBackground.setName) this.gaugeBackground.setName('HUDBar.gaugeBackground');
    this.container.add(this.gaugeBackground);

    // 昇格ゲージフィル（update で塗り直し）
    this.gaugeFill = this.scene.add.graphics();
    if (this.gaugeFill.setName) this.gaugeFill.setName('HUDBar.gaugeFill');
    this.container.add(this.gaugeFill);

    // セパレーター（1px×16px）
    this.addSeparator(L.SEP_1_X, centerY, 'HUDBar.separator1');
    this.addSeparator(L.SEP_2_X, centerY, 'HUDBar.separator2');
    this.addSeparator(L.SEP_3_X, centerY, 'HUDBar.separator3');

    // 残り日数（ラベル + 値を1テキストにまとめてコンパクト化）
    this.daysTextEl = this.makeHudText(L.DAYS_X, centerY, '', {
      color: toColorStr(Colors.text.primary),
      bold: true,
    });
    if (this.daysTextEl.setName) this.daysTextEl.setName('HUDBar.daysText');
    this.container.add(this.daysTextEl);

    // ゴールド（値 + G、accent色）
    this.goldTextEl = this.makeHudText(L.GOLD_X, centerY, '', {
      color: toColorStr(Colors.text.accent),
      bold: true,
    });
    if (this.goldTextEl.setName) this.goldTextEl.setName('HUDBar.goldText');
    this.container.add(this.goldTextEl);

    // AP（info色）
    this.apTextEl = this.makeHudText(L.AP_X, centerY, '', {
      color: toColorStr(Colors.status.info),
      bold: true,
    });
    if (this.apTextEl.setName) this.apTextEl.setName('HUDBar.apText');
    this.container.add(this.apTextEl);

    // 貢献度テキスト（Phase 2 互換フィールド、右寄せ）
    this.contributionTextEl = this.scene.make.text({
      x: w - L.CONTRIBUTION_RIGHT_PADDING,
      y: centerY,
      text: '',
      style: {
        fontSize: HUD_LABEL_SIZE,
        color: toColorStr(Colors.text.muted),
        fontStyle: 'normal',
      },
      add: false,
    });
    if (this.contributionTextEl.setOrigin) this.contributionTextEl.setOrigin(1, 0.5);
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

    this.rankBadge = null;
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
  // 内部: 生成ヘルパ
  // ===========================================================================

  /** 左寄せ・縦中央のHUDテキストを生成 */
  private makeHudText(
    x: number,
    centerY: number,
    text: string,
    opts: { color: string; bold?: boolean },
  ): Phaser.GameObjects.Text {
    const el = this.scene.make.text({
      x,
      y: centerY,
      text,
      style: {
        fontSize: HUD_FONT_SIZE,
        color: opts.color,
        fontStyle: opts.bold ? 'bold' : 'normal',
        padding: { top: 2 },
      },
      add: false,
    });
    if (el.setOrigin) el.setOrigin(0, 0.5);
    return el;
  }

  /** セクション区切り線（1px×16px）を生成して container に追加 */
  private addSeparator(x: number, centerY: number, name: string): void {
    const sep = this.scene.add.rectangle(
      x,
      centerY,
      SEPARATOR_WIDTH,
      SEPARATOR_HEIGHT,
      Colors.border.subtle,
      1,
    );
    if (sep.setName) sep.setName(name);
    this.container.add(sep);
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

    // ランク（pill型バッジ）
    const validRank = isValidGuildRank(d.currentRank) ? d.currentRank : GuildRank.G;
    this.updateRankBadge(validRank);

    // 昇格ゲージ
    this.updatePromotionGauge();

    // 残り日数
    const daysStyle = calcRemainingDaysStyle(d.remainingDays);
    this.remainingDaysBlinking = daysStyle.blinking;
    if (this.daysTextEl) {
      this.daysTextEl.setText(`残り ${d.remainingDays}日`);
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

  /** ランクバッジを描画し、テキストをバッジ中央へ配置 */
  private updateRankBadge(rank: string): void {
    this.rankTextEl?.setText(rank);

    if (!this.rankBadge) return;
    const centerY = HUD_HEIGHT / 2;
    const textWidth = this.rankTextEl?.width ?? 0;
    const badgeWidth = Math.max(RANK_BADGE_MIN_WIDTH, textWidth + RANK_BADGE_PADDING_X);

    if (this.rankBadge.clear) this.rankBadge.clear();
    if (this.rankBadge.fillStyle) {
      this.rankBadge.fillStyle(Colors.brand.secondary, 1);
      const badgeY = centerY - RANK_BADGE_HEIGHT / 2;
      if (this.rankBadge.fillRoundedRect) {
        this.rankBadge.fillRoundedRect(
          HUD_LAYOUT.RANK_BADGE_X,
          badgeY,
          badgeWidth,
          RANK_BADGE_HEIGHT,
          RANK_BADGE_RADIUS,
        );
      } else if (this.rankBadge.fillRect) {
        this.rankBadge.fillRect(HUD_LAYOUT.RANK_BADGE_X, badgeY, badgeWidth, RANK_BADGE_HEIGHT);
      }
    }

    // テキストをバッジ中央へ
    if (this.rankTextEl?.setPosition) {
      this.rankTextEl.setPosition(HUD_LAYOUT.RANK_BADGE_X + badgeWidth / 2, centerY);
    }
  }

  private updatePromotionGauge(): void {
    if (!this.gaugeFill) return;
    if (this.gaugeFill.clear) this.gaugeFill.clear();
    if (!this.gaugeFill.fillStyle) return;
    const color = calcPromotionGaugeColor(this.data.promotionGauge);
    this.gaugeFill.fillStyle(color, 1);
    const ratio = Math.max(0, Math.min(100, this.data.promotionGauge)) / 100;
    const fillWidth = ratio * GAUGE_WIDTH;
    if (fillWidth <= 0) return;
    const gaugeY = HUD_HEIGHT / 2 - GAUGE_HEIGHT / 2;
    if (this.gaugeFill.fillRoundedRect) {
      this.gaugeFill.fillRoundedRect(
        HUD_LAYOUT.GAUGE_X,
        gaugeY,
        fillWidth,
        GAUGE_HEIGHT,
        GAUGE_RADIUS,
      );
    } else if (this.gaugeFill.fillRect) {
      this.gaugeFill.fillRect(HUD_LAYOUT.GAUGE_X, gaugeY, fillWidth, GAUGE_HEIGHT);
    }
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
