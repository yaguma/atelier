/**
 * HeaderUI - ヘッダーUIコンポーネント
 * TASK-0020 MainScene共通レイアウト
 *
 * @description
 * ヘッダー領域のUIコンポーネント。
 * ランク表示、昇格ゲージ、残り日数、所持金、行動ポイントを表示する。
 *
 * TDD Refactorフェーズ: 定数抽出とリソース管理改善
 */

import type Phaser from 'phaser';
import type { GuildRank } from '../../../shared/types/common';
import type { IGameState } from '../../../shared/types/game-state';
import { BaseComponent } from '../components/BaseComponent';
import { THEME } from '../theme';

// =============================================================================
// 定数定義
// =============================================================================

/** ヘッダーのY座標 */
const HEADER_Y = 0;

/** ヘッダーのX座標 */
const HEADER_X = 0;

/** ヘッダーの高さ */
const HEADER_HEIGHT = 60;

/**
 * ランク別カラー定義
 * ランクに応じた色を設定し、視覚的な識別を容易にする
 */
const RANK_COLORS: Record<GuildRank, number> = {
  G: 0x808080, // グレー（最低ランク）
  F: 0xa0522d, // シエナ
  E: 0xcd853f, // ペルー
  D: 0x228b22, // フォレストグリーン
  C: 0x4169e1, // ロイヤルブルー
  B: 0x9932cc, // ダークオーキッド
  A: 0xffd700, // ゴールド
  S: 0xff4500, // オレンジレッド（最高ランク）
} as const;

/**
 * ゲージカラー閾値定義
 * 昇格ゲージの進捗に応じた色分け
 */
const GAUGE_COLORS = {
  /** 低進捗（0-33%）: 警告色 */
  low: { threshold: 0, color: THEME.colors.error },
  /** 中進捗（34-66%）: 注意色 */
  medium: { threshold: 34, color: THEME.colors.warning },
  /** 高進捗（67-100%）: 成功色 */
  high: { threshold: 67, color: THEME.colors.success },
} as const;

/**
 * 日数警告色定義
 * 残り日数に応じた警告色
 */
const DAYS_COLORS = {
  /** 危険（残り3日以下）: エラー色 */
  danger: { threshold: 3, color: THEME.colors.error },
  /** 警告（残り7日以下）: 警告色 */
  warning: { threshold: 7, color: THEME.colors.warning },
  /** 通常（8日以上）: 通常テキスト色 */
  normal: { threshold: Infinity, color: THEME.colors.text },
} as const;

// =============================================================================
// ヘッダーUIクラス
// =============================================================================

/**
 * ヘッダーUIコンポーネントクラス
 *
 * 画面上部に配置され、ゲームステータスを表示する
 */
export class HeaderUI extends BaseComponent {
  // =========================================================================
  // プライベートフィールド
  // =========================================================================

  /** 背景Graphics */
  private background: Phaser.GameObjects.Graphics | null = null;

  /** ランク表示テキスト */
  private rankText: Phaser.GameObjects.Text | null = null;

  /** 昇格ゲージ背景 */
  private gaugeBackground: Phaser.GameObjects.Graphics | null = null;

  /** 昇格ゲージ本体 */
  private gaugeFill: Phaser.GameObjects.Graphics | null = null;

  /** 残り日数テキスト */
  private daysText: Phaser.GameObjects.Text | null = null;

  /** 所持金テキスト */
  private goldText: Phaser.GameObjects.Text | null = null;

  /** 行動ポイントテキスト */
  private actionPointsText: Phaser.GameObjects.Text | null = null;

  // =========================================================================
  // コンストラクタ
  // =========================================================================

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @throws {Error} sceneがnullまたはundefinedの場合
   */
  constructor(scene: Phaser.Scene) {
    super(scene, HEADER_X, HEADER_Y);
  }

  // =========================================================================
  // パブリックメソッド
  // =========================================================================

  /**
   * UIを初期化して生成する
   */
  create(): void {
    this.container.setDepth(200);
    this.container.add([]);
  }

  /**
   * リソースを解放する
   */
  destroy(): void {
    // プライベートフィールドのGameObjectsを解放
    this.destroyGameObjects();

    // コンテナを破棄
    this.container.destroy();
  }

  /**
   * ゲーム状態に基づいてUIを更新する
   *
   * @param _state - ゲーム状態
   */
  update(_state: IGameState): void {
    // 将来の実装でstateに基づいてUI要素を更新する
  }

  // =========================================================================
  // プライベートメソッド
  // =========================================================================

  /**
   * 保持しているGameObjectsを解放する
   */
  private destroyGameObjects(): void {
    if (this.background) {
      this.background.destroy();
      this.background = null;
    }
    if (this.rankText) {
      this.rankText.destroy();
      this.rankText = null;
    }
    if (this.gaugeBackground) {
      this.gaugeBackground.destroy();
      this.gaugeBackground = null;
    }
    if (this.gaugeFill) {
      this.gaugeFill.destroy();
      this.gaugeFill = null;
    }
    if (this.daysText) {
      this.daysText.destroy();
      this.daysText = null;
    }
    if (this.goldText) {
      this.goldText.destroy();
      this.goldText = null;
    }
    if (this.actionPointsText) {
      this.actionPointsText.destroy();
      this.actionPointsText = null;
    }
  }
}

// =============================================================================
// エクスポート（テスト用）
// =============================================================================

/** テスト用にヘッダー高さをエクスポート */
export { HEADER_HEIGHT, RANK_COLORS, GAUGE_COLORS, DAYS_COLORS };
