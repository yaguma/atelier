/**
 * PhaseRail - フェーズ進行常時表示バー composite
 * Issue #456: UI刷新 Phase 2
 * Issue #458: UI刷新 Phase 4 A準備 - PhaseTabUI 機能等価化
 *
 * @description
 * 画面上部に常駐するフェーズナビゲーション。既存 `PhaseTabUI` のタブ状態管理・
 * クリック遷移・Issue #434 の採取セッション中タブ無効化（setTabsDisabled）を
 * 維持する API を提供する。
 *
 * 既存の薄い Phase 2 実装 (単一行ラベル描画) との後方互換性のため、
 * 以下は継続サポートする:
 * - 追加のサービス注入無しに `new PhaseRail(scene, x, y)` で生成可能
 * - `setCurrent(string)` / `getCurrent()` — 文字列フェーズ名での操作
 * - `destroy()` の冪等性
 *
 * Phase 4 A でレイアウト再編が完了するまで、click 連携（EventBus / GameFlowManager）
 * はオプショナルで注入する設計にし、MainScene 側からは既存 PhaseTabUI の
 * 振る舞いをそのまま差し替えられるようにする。
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { DesignTokens } from '@shared/theme';
import type { GamePhase } from '@shared/types/common';
import { VALID_GAME_PHASES } from '@shared/types/common';
import type Phaser from 'phaser';

// =============================================================================
// 型定義
// =============================================================================

/** PhaseRail クリックコールバック */
export type PhaseRailClickHandler = (phase: GamePhase | string) => void;

export interface PhaseRailOptions extends BaseComponentOptions {
  /** 表示するフェーズ一覧。未指定時は `VALID_GAME_PHASES` (4フェーズ) */
  phases?: readonly (GamePhase | string)[];
  /** 初期アクティブフェーズ */
  current?: GamePhase | string;
  /** バー全体の幅 */
  width?: number;
  /** バー高さ */
  height?: number;
  /** タブクリック時のコールバック（Phase 4 A までは MainScene から注入） */
  onPhaseClick?: PhaseRailClickHandler;
  /** 遷移拒否通知コールバック（未指定時は内部のテキスト通知） */
  onDeniedClick?: (phase: GamePhase | string, reason: string) => void;
}

// =============================================================================
// 定数
// =============================================================================

/** タブ用カラー定数（PhaseTabUI と同じ値） */
const RAIL_COLORS = {
  ACTIVE: 0x6366f1,
  INACTIVE: 0x374151,
  DISABLED: 0x1f2937,
  BACKGROUND: 0x111827,
  BORDER: 0x374151,
  ACTIVE_TEXT: '#FFFFFF',
  INACTIVE_TEXT: '#9CA3AF',
  DISABLED_TEXT: '#4B5563',
  NOTIFICATION_TEXT: '#F87171',
} as const;

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 48;
const TAB_HEIGHT = 40;
const TAB_SPACING = 8;
const PADDING_X = 16;

/** フェーズラベル（日本語表示） */
const PHASE_LABELS: Record<string, string> = {
  QUEST_ACCEPT: '依頼',
  GATHERING: '採取',
  ALCHEMY: '調合',
  DELIVERY: '納品',
  DAY_END: '翌日',
};

// =============================================================================
// PhaseRail
// =============================================================================

export class PhaseRail extends BaseComponent {
  private readonly phases: readonly (GamePhase | string)[];
  private readonly width: number;
  private readonly height: number;
  private readonly onPhaseClick?: PhaseRailClickHandler;
  private readonly onDeniedClick?: (phase: GamePhase | string, reason: string) => void;

  private current: GamePhase | string;
  private tabsDisabled = false;
  private destroyed = false;

  // 視覚要素
  private tabBgs: Phaser.GameObjects.Rectangle[] = [];
  private tabTexts: Phaser.GameObjects.Text[] = [];
  private notificationText: Phaser.GameObjects.Text | null = null;
  private notificationTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, options: PhaseRailOptions = {}) {
    super(scene, x, y, options);
    this.phases = options.phases ?? VALID_GAME_PHASES;
    this.current = options.current ?? this.phases[0] ?? '';
    this.width = options.width ?? DEFAULT_WIDTH;
    this.height = options.height ?? DEFAULT_HEIGHT;
    this.onPhaseClick = options.onPhaseClick;
    this.onDeniedClick = options.onDeniedClick;
  }

  // ===========================================================================
  // ライフサイクル
  // ===========================================================================

  create(): void {
    // 背景パネル
    const bg = this.scene.add.rectangle(
      this.width / 2,
      this.height / 2,
      this.width,
      this.height,
      RAIL_COLORS.BACKGROUND,
      0.95,
    );
    if (bg.setName) bg.setName('PhaseRail.background');
    this.container.add(bg);

    // 下部ボーダー
    const borderLine = this.scene.add.rectangle(
      this.width / 2,
      this.height - 1,
      this.width,
      2,
      RAIL_COLORS.BORDER,
      1,
    );
    if (borderLine.setName) borderLine.setName('PhaseRail.border');
    this.container.add(borderLine);

    // タブ幅を計算（パディングと間隔を考慮して均等割り）
    const count = Math.max(1, this.phases.length);
    const available = this.width - PADDING_X * 2 - TAB_SPACING * (count - 1);
    const tabWidth = Math.max(60, Math.floor(available / count));
    const startX = PADDING_X;
    const tabY = this.height / 2;

    // 各フェーズタブを生成
    this.tabBgs = [];
    this.tabTexts = [];
    for (let i = 0; i < count; i++) {
      const phase = this.phases[i] as GamePhase | string;
      const cx = startX + tabWidth / 2 + i * (tabWidth + TAB_SPACING);
      const isActive = phase === this.current;

      const tabBg = this.scene.add.rectangle(
        cx,
        tabY,
        tabWidth,
        TAB_HEIGHT,
        isActive ? RAIL_COLORS.ACTIVE : RAIL_COLORS.INACTIVE,
      );
      if (tabBg.setName) tabBg.setName(`PhaseRail.tabBg${i}`);
      if (tabBg.setInteractive) {
        tabBg.setInteractive({ useHandCursor: true });
      }
      if (tabBg.on) {
        tabBg.on('pointerdown', () => this.handleTabClick(phase));
      }
      this.container.add(tabBg);
      this.tabBgs.push(tabBg);

      const label = PHASE_LABELS[phase as string] ?? String(phase);
      const text = this.scene.make.text({
        x: cx,
        y: tabY,
        text: label,
        style: {
          fontSize: '14px',
          color: isActive ? RAIL_COLORS.ACTIVE_TEXT : RAIL_COLORS.INACTIVE_TEXT,
          fontStyle: isActive ? 'bold' : 'normal',
        },
        add: false,
      });
      if (text.setOrigin) text.setOrigin(0.5);
      if (text.setName) text.setName(`PhaseRail.tabText${i}`);
      this.container.add(text);
      this.tabTexts.push(text);
    }

    this.container.setDepth(DesignTokens.zIndex.phaseRail);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.hideNotification();

    this.tabBgs = [];
    this.tabTexts = [];

    this.container.destroy(true);
  }

  // ===========================================================================
  // 公開API
  // ===========================================================================

  /** 現在のアクティブフェーズを取得 */
  getCurrent(): string {
    return this.current as string;
  }

  /** アクティブフェーズを設定（視覚を更新） */
  setCurrent(current: GamePhase | string): this {
    this.current = current;
    this.refreshTabStyles();
    return this;
  }

  /**
   * タブの有効/無効を設定する（Issue #434 互換）
   * 採取セッション中などで phase 遷移を抑制したい場面で利用する。
   */
  setTabsDisabled(disabled: boolean): this {
    this.tabsDisabled = disabled;
    this.refreshTabStyles();
    return this;
  }

  /** タブが無効化されているかを取得 */
  isTabsDisabled(): boolean {
    return this.tabsDisabled;
  }

  /** タブ数を取得 */
  getTabCount(): number {
    return this.phases.length;
  }

  /** テスト用: タブクリックをシミュレート */
  simulateTabClick(phase: GamePhase | string): void {
    this.handleTabClick(phase);
  }

  // ===========================================================================
  // 内部: クリック処理
  // ===========================================================================

  private handleTabClick(targetPhase: GamePhase | string): void {
    // 同じフェーズへの遷移はスキップ
    if (targetPhase === this.current) return;

    // 無効化中は拒否通知
    if (this.tabsDisabled) {
      const reason = '採取中は町に戻ってからフェーズを切り替えてください';
      if (this.onDeniedClick) {
        this.onDeniedClick(targetPhase, reason);
      } else {
        this.showNotification(reason);
      }
      return;
    }

    this.onPhaseClick?.(targetPhase);
  }

  // ===========================================================================
  // 内部: 視覚更新
  // ===========================================================================

  private refreshTabStyles(): void {
    for (let i = 0; i < this.phases.length; i++) {
      const phase = this.phases[i];
      const isActive = phase === this.current;
      const bg = this.tabBgs[i];
      const text = this.tabTexts[i];

      if (this.tabsDisabled && !isActive) {
        // 無効化スタイル（アクティブタブは通常色を維持）
        if (bg?.setFillStyle) bg.setFillStyle(RAIL_COLORS.DISABLED);
        if (text?.setStyle) {
          text.setStyle({
            fontSize: '14px',
            color: RAIL_COLORS.DISABLED_TEXT,
            fontStyle: 'normal',
          });
        }
        continue;
      }

      if (bg?.setFillStyle) {
        bg.setFillStyle(isActive ? RAIL_COLORS.ACTIVE : RAIL_COLORS.INACTIVE);
      }
      if (text?.setStyle) {
        text.setStyle({
          fontSize: '14px',
          color: isActive ? RAIL_COLORS.ACTIVE_TEXT : RAIL_COLORS.INACTIVE_TEXT,
          fontStyle: isActive ? 'bold' : 'normal',
        });
      }
    }
  }

  private showNotification(message: string): void {
    this.hideNotification();

    this.notificationText = this.scene.make.text({
      x: PADDING_X,
      y: this.height + 4,
      text: message,
      style: {
        fontSize: '12px',
        color: RAIL_COLORS.NOTIFICATION_TEXT,
        fontStyle: 'bold',
      },
      add: false,
    });
    if (this.notificationText.setName) this.notificationText.setName('PhaseRail.notification');
    this.container.add(this.notificationText);

    if (this.scene.time?.delayedCall) {
      this.notificationTimer = this.scene.time.delayedCall(3000, () => {
        this.hideNotification();
      });
    }
  }

  private hideNotification(): void {
    if (this.notificationText) {
      this.notificationText.destroy?.();
      this.notificationText = null;
    }
    if (this.notificationTimer) {
      this.notificationTimer.remove?.();
      this.notificationTimer = null;
    }
  }
}
