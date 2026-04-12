/**
 * GatheringResultPanel.ts - 獲得素材表示パネル
 * Issue #459: GatheringPhaseUIから分離
 *
 * @description
 * 採取セッションで獲得した素材のリスト表示を管理するコンポーネント。
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import { THEME, toColorStr } from '@presentation/ui/theme';
import { CONTENT_WORK_CENTER_X } from '@shared/constants/layout';
import type Phaser from 'phaser';

/** 獲得素材パネルのレイアウト定数 */
const RESULT_LAYOUT = {
  /** タイトルY */
  TITLE_Y: 370,
  /** 素材表示Y */
  DISPLAY_Y: 410,
  /** 列数 */
  COLUMNS: 4,
  /** 列間隔 */
  COLUMN_WIDTH: 130,
  /** アイテム開始X（4列を中央揃え: CONTENT_WORK_CENTER_X - 1.5 * COLUMN_WIDTH） */
  ITEM_START_X: CONTENT_WORK_CENTER_X - 1.5 * 130,
  /** 行高さ */
  LINE_HEIGHT: 30,
} as const;

/**
 * GatheringResultPanel - 獲得素材表示パネル
 *
 * 【責務】:
 * - 「獲得素材:」タイトルの表示
 * - 獲得した素材をグリッド形式で表示
 * - フェードインアニメーション
 */
export class GatheringResultPanel {
  private gatheredDisplay!: Phaser.GameObjects.Container;
  private gatheredMaterialTexts: Phaser.GameObjects.Text[] = [];

  constructor(
    private scene: Phaser.Scene,
    private container: Phaser.GameObjects.Container,
  ) {}

  /**
   * パネルを作成
   */
  create(): void {
    const gatheredTitle = this.scene.make
      .text({
        x: CONTENT_WORK_CENTER_X,
        y: RESULT_LAYOUT.TITLE_Y,
        text: '獲得素材:',
        style: {
          fontSize: `${THEME.sizes.medium}px`,
          color: toColorStr(THEME.colors.text),
          fontFamily: THEME.fonts.primary,
          fontStyle: 'bold',
        },
        add: false,
      })
      .setOrigin(0.5);

    this.gatheredDisplay = this.scene.make.container({
      x: 0,
      y: RESULT_LAYOUT.DISPLAY_Y,
      add: false,
    });
    this.gatheredDisplay.name = 'GatheringPhaseUI.gatheredDisplay';

    this.container.add(gatheredTitle);
    this.container.add(this.gatheredDisplay);
  }

  /**
   * 獲得素材を更新
   *
   * @param materials - 獲得した素材のリスト
   * @param getMaterialName - 素材ID→名前変換関数
   */
  updateMaterials(
    materials: MaterialInstance[],
    getMaterialName: (materialId: string) => string,
  ): void {
    // 既存の表示をクリア
    for (const text of this.gatheredMaterialTexts) {
      text.destroy();
    }
    this.gatheredMaterialTexts = [];
    this.gatheredDisplay.removeAll();

    // 素材を表示
    materials.forEach((material, index) => {
      const x =
        (index % RESULT_LAYOUT.COLUMNS) * RESULT_LAYOUT.COLUMN_WIDTH + RESULT_LAYOUT.ITEM_START_X;
      const y = Math.floor(index / RESULT_LAYOUT.COLUMNS) * RESULT_LAYOUT.LINE_HEIGHT;

      const materialText = this.scene.make
        .text({
          x,
          y,
          text: `[${getMaterialName(material.master.id)} ${material.quality}]`,
          style: {
            fontSize: `${THEME.sizes.small}px`,
            color: toColorStr(THEME.colors.text),
            fontFamily: THEME.fonts.primary,
          },
          add: false,
        })
        .setOrigin(0, 0.5);

      this.gatheredMaterialTexts.push(materialText);
      this.gatheredDisplay.add(materialText);

      // フェードインアニメーション
      materialText.setAlpha(0);
      this.scene.tweens.add({
        targets: materialText,
        alpha: 1,
        duration: 300,
        ease: 'Power2',
      });
    });
  }

  /**
   * リソースを破棄
   */
  destroy(): void {
    for (const text of this.gatheredMaterialTexts) {
      text.destroy();
    }
    this.gatheredMaterialTexts = [];
    this.gatheredDisplay?.destroy(true);
  }
}
