/**
 * ContributionPreviewコンポーネント
 * TASK-0057 DeliveryPhaseUIリファクタリング
 *
 * @description
 * 貢献度計算結果のプレビュー表示を担当するコンポーネント
 */

import { THEME } from '@presentation/ui/theme';
import type Phaser from 'phaser';
import type { ContributionPreviewData, ItemInstance, Quest } from './types';

// =============================================================================
// 定数定義
// =============================================================================

/** UIテキスト定数 */
const UI_TEXT = {
  SELECT_QUEST: '納品する依頼を選択してください',
  SELECT_ITEM: 'アイテムを選択してください',
} as const;

/** UIスタイル定数 */
const UI_STYLES = {
  PREVIEW: {
    fontSize: `${THEME.sizes.small}px`,
    color: `#${THEME.colors.textLight.toString(16).padStart(6, '0')}`,
    fontFamily: THEME.fonts.primary,
  },
} as const;

// =============================================================================
// クラス定義
// =============================================================================

/**
 * 貢献度プレビューコンポーネント
 */
export class ContributionPreview {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private previewText: Phaser.GameObjects.Text | null = null;

  /**
   * コンストラクタ
   * @param scene - Phaserシーン
   * @param x - X座標
   * @param y - Y座標
   */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
  }

  /**
   * UIコンポーネント初期化
   */
  public create(): void {
    // 初期メッセージを表示
    this.previewText = this.scene.add.text(0, 0, UI_TEXT.SELECT_QUEST, UI_STYLES.PREVIEW);
    this.container.add(this.previewText);
  }

  /**
   * プレビューを更新
   * @param quest - 選択中の依頼
   * @param item - 選択中のアイテム
   * @param preview - 貢献度プレビューデータ
   */
  public update(
    quest: Quest | null,
    item: ItemInstance | null,
    preview: ContributionPreviewData | null,
  ): void {
    if (!this.previewText) {
      return;
    }

    if (!quest || !item || !preview) {
      return;
    }

    const bonusPercent = Math.round((preview.qualityModifier - 1) * 100);
    const previewStr =
      `貢献度計算プレビュー:\n` +
      `  基本報酬: ${preview.baseReward}\n` +
      `  品質ボーナス(${item.quality}): +${preview.qualityBonus} (+${bonusPercent}%)\n` +
      `  合計: ${preview.totalContribution} 貢献度`;

    this.previewText.setText(previewStr);
  }

  /**
   * 依頼選択メッセージを表示
   */
  public showSelectQuestMessage(): void {
    if (this.previewText) {
      this.previewText.setText(UI_TEXT.SELECT_QUEST);
    }
  }

  /**
   * アイテム選択メッセージを表示
   */
  public showSelectItemMessage(): void {
    if (this.previewText) {
      this.previewText.setText(UI_TEXT.SELECT_ITEM);
    }
  }

  /**
   * 表示をクリア
   */
  public clear(): void {
    if (this.previewText) {
      this.previewText.setText('');
    }
  }

  /**
   * コンテナを取得
   * @returns コンテナ
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 表示/非表示を設定
   * @param visible - 表示フラグ
   * @returns this
   */
  public setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  /**
   * 位置を設定
   * @param x - X座標
   * @param y - Y座標
   * @returns this
   */
  public setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }

  /**
   * リソースを解放
   */
  public destroy(): void {
    if (this.previewText) {
      this.previewText.destroy();
      this.previewText = null;
    }
    this.container.destroy();
  }
}
