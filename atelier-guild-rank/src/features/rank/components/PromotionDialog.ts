/**
 * PromotionDialog コンポーネント
 * TASK-0093: features/rank/components作成
 *
 * 昇格時のダイアログを表示するコンポーネント。
 * 新ランク情報、ボーナス報酬、解放される特殊ルールを表示する。
 */

import { BaseComponent } from '@shared/components';
import { Colors, THEME } from '@shared/theme';
import type { GuildRank } from '@shared/types';
import type { ISpecialRule } from '@shared/types/master-data';
import Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** ダイアログ寸法 */
const DIALOG = {
  WIDTH: 400,
  HEIGHT: 300,
  PADDING: 20,
} as const;

/** テキストスタイル */
const TEXT_STYLES = {
  TITLE: { fontSize: `${THEME.sizes.xlarge}px`, color: '#ffd700', fontStyle: 'bold' },
  RANK: { fontSize: `${THEME.sizes.large}px`, color: '#ffffff' },
  BONUS: { fontSize: `${THEME.sizes.medium}px`, color: '#44ff44' },
  RULE_HEADER: { fontSize: `${THEME.sizes.medium}px`, color: '#ffffff' },
  RULE_ITEM: { fontSize: `${THEME.sizes.small}px`, color: '#cccccc' },
} as const;

/** レイアウトオフセット */
const OFFSET = {
  TITLE_Y: -110,
  RANK_Y: -60,
  BONUS_Y: -20,
  RULES_HEADER_Y: 20,
  RULES_START_Y: 50,
  RULE_LINE_HEIGHT: 22,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/** PromotionDialogの設定 */
export interface PromotionDialogConfig {
  /** 昇格前のランク */
  fromRank: GuildRank;
  /** 昇格後のランク */
  toRank: GuildRank;
  /** ボーナス報酬（ゴールド） */
  bonusGold: number;
  /** 解放される特殊ルール */
  unlockedRules?: readonly ISpecialRule[];
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * 昇格ダイアログ
 *
 * ランク昇格時に表示されるダイアログ。
 * 新ランク、ボーナス報酬、特殊ルールの解放情報を表示する。
 */
export class PromotionDialog extends BaseComponent {
  private config: PromotionDialogConfig;
  private created = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PromotionDialogConfig) {
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

    this.createBackground();
    this.createTitle();
    this.createRankDisplay();
    this.createBonusDisplay();
    this.createRulesDisplay();
  }

  destroy(): void {
    this.container.destroy(true);
  }

  // ===========================================================================
  // private
  // ===========================================================================

  private createBackground(): void {
    const bg = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      DIALOG.WIDTH,
      DIALOG.HEIGHT,
      Colors.background.primary,
    );
    bg.setStrokeStyle(2, Colors.border.gold);
    this.container.add(bg);
  }

  private createTitle(): void {
    const titleText = this.scene.make.text({
      x: 0,
      y: OFFSET.TITLE_Y,
      text: '昇格おめでとう!',
      style: TEXT_STYLES.TITLE,
      add: false,
    });
    titleText.setOrigin(0.5);
    this.container.add(titleText);
  }

  private createRankDisplay(): void {
    const rankStr = `${this.config.fromRank} → ${this.config.toRank}`;
    const rankText = this.scene.make.text({
      x: 0,
      y: OFFSET.RANK_Y,
      text: rankStr,
      style: TEXT_STYLES.RANK,
      add: false,
    });
    rankText.setOrigin(0.5);
    this.container.add(rankText);
  }

  private createBonusDisplay(): void {
    const bonusStr = `ボーナス: ${this.config.bonusGold} G`;
    const bonusText = this.scene.make.text({
      x: 0,
      y: OFFSET.BONUS_Y,
      text: bonusStr,
      style: TEXT_STYLES.BONUS,
      add: false,
    });
    bonusText.setOrigin(0.5);
    this.container.add(bonusText);
  }

  private createRulesDisplay(): void {
    const rules = this.config.unlockedRules;
    if (!rules || rules.length === 0) {
      return;
    }

    const headerText = this.scene.make.text({
      x: 0,
      y: OFFSET.RULES_HEADER_Y,
      text: '解放された特殊ルール:',
      style: TEXT_STYLES.RULE_HEADER,
      add: false,
    });
    headerText.setOrigin(0.5);
    this.container.add(headerText);

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (!rule) continue;
      const ruleText = this.scene.make.text({
        x: 0,
        y: OFFSET.RULES_START_Y + i * OFFSET.RULE_LINE_HEIGHT,
        text: `・${rule.description}`,
        style: TEXT_STYLES.RULE_ITEM,
        add: false,
      });
      ruleText.setOrigin(0.5);
      this.container.add(ruleText);
    }
  }
}
