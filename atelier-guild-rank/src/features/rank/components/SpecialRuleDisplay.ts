/**
 * SpecialRuleDisplay コンポーネント
 * TASK-0093: features/rank/components作成
 *
 * 特殊ルール一覧を表示するコンポーネント。
 * 有効なルールのハイライト表示と説明文を提供する。
 */

import { BaseComponent } from '@shared/components';
import { Colors, THEME } from '@shared/theme';
import type { ISpecialRule } from '@shared/types/master-data';
import type Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** パネル寸法 */
const PANEL = {
  WIDTH: 320,
  ITEM_HEIGHT: 32,
  PADDING: 8,
} as const;

/** テキストスタイル */
const TEXT_STYLES = {
  HEADER: { fontSize: `${THEME.sizes.medium}px`, color: '#ffffff', fontStyle: 'bold' },
  RULE_ACTIVE: { fontSize: `${THEME.sizes.small}px`, color: '#ffffff' },
  RULE_INACTIVE: { fontSize: `${THEME.sizes.small}px`, color: '#666666' },
} as const;

/** レイアウトオフセット */
const OFFSET = {
  HEADER_Y: 0,
  RULES_START_Y: 30,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/** 表示用ルール情報 */
export interface DisplayRule {
  /** 特殊ルール */
  rule: ISpecialRule;
  /** 有効かどうか */
  active: boolean;
}

/** SpecialRuleDisplayの設定 */
export interface SpecialRuleDisplayConfig {
  /** 表示するルール一覧 */
  rules: readonly DisplayRule[];
  /** ヘッダーテキスト（省略時は「特殊ルール」） */
  header?: string;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * 特殊ルール表示
 *
 * ランクに適用される特殊ルールの一覧を表示する。
 * 有効なルールはハイライト、無効なルールはグレーアウトされる。
 */
export class SpecialRuleDisplay extends BaseComponent {
  private config: SpecialRuleDisplayConfig;
  private created = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: SpecialRuleDisplayConfig) {
    super(scene, x, y);
    if (!config) {
      throw new Error('config is required');
    }
    this.config = config;
  }

  create(): void {
    if (this.created) {
      return;
    }
    this.created = true;

    this.createHeader();
    this.createRuleList();
  }

  destroy(): void {
    this.container.destroy(true);
  }

  // ===========================================================================
  // private
  // ===========================================================================

  private createHeader(): void {
    const headerStr = this.config.header ?? '特殊ルール';
    const headerText = this.scene.add.text(
      -(PANEL.WIDTH / 2) + PANEL.PADDING,
      OFFSET.HEADER_Y,
      headerStr,
      TEXT_STYLES.HEADER,
    );
    headerText.setOrigin(0, 0);
    this.container.add(headerText);
  }

  private createRuleList(): void {
    for (let i = 0; i < this.config.rules.length; i++) {
      const displayRule = this.config.rules[i];
      if (!displayRule) continue;
      this.createRuleItem(displayRule, i);
    }
  }

  private createRuleItem(displayRule: DisplayRule, index: number): void {
    const y = OFFSET.RULES_START_Y + index * PANEL.ITEM_HEIGHT;

    // アクティブインジケーター
    const indicatorColor = displayRule.active ? Colors.text.success : Colors.text.muted;
    const indicator = this.scene.add.rectangle(
      -(PANEL.WIDTH / 2) + PANEL.PADDING,
      y + PANEL.ITEM_HEIGHT / 2,
      8,
      8,
      indicatorColor,
    );
    this.container.add(indicator);

    // ルール説明テキスト
    const style = displayRule.active ? TEXT_STYLES.RULE_ACTIVE : TEXT_STYLES.RULE_INACTIVE;
    const ruleText = this.scene.add.text(
      -(PANEL.WIDTH / 2) + PANEL.PADDING + 16,
      y + PANEL.ITEM_HEIGHT / 2,
      displayRule.rule.description,
      style,
    );
    ruleText.setOrigin(0, 0.5);
    this.container.add(ruleText);
  }
}
