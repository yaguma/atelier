/**
 * GatheringMaterialPool.ts - 素材プール管理コンポーネント
 * Issue #459: GatheringPhaseUIから分離
 *
 * @description
 * 6スロット（2行3列）の素材プール表示・更新・選択を管理する。
 */

import type { MaterialId, Quality } from '@shared/types';
import type Phaser from 'phaser';
import { type MaterialDisplay, MaterialSlotUI } from './MaterialSlotUI';

/** 素材プールのレイアウト定数 */
const POOL_LAYOUT = {
  START_X: 320,
  START_Y: 150,
  SPACING_X: 120,
  SPACING_Y: 120,
} as const;

/**
 * GatheringMaterialPool - 6スロット素材プール
 *
 * 【責務】:
 * - 2行3列の素材スロットグリッド管理
 * - 素材の表示・更新
 * - スロット選択の管理
 */
export class GatheringMaterialPool {
  private slots: MaterialSlotUI[] = [];

  constructor(
    private scene: Phaser.Scene,
    private container: Phaser.GameObjects.Container,
    private materialNameResolver?: (materialId: string) => string,
  ) {}

  /**
   * 素材プールを作成（2行3列グリッド）
   */
  create(onSelect: (material: MaterialDisplay) => void): void {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const x = POOL_LAYOUT.START_X + col * POOL_LAYOUT.SPACING_X;
        const y = POOL_LAYOUT.START_Y + row * POOL_LAYOUT.SPACING_Y;
        const slot = new MaterialSlotUI(this.scene, x, y, onSelect);
        slot.create();
        this.slots.push(slot);
        this.container.add(slot.getContainer());
      }
    }
  }

  /**
   * 素材プールを更新
   */
  updateOptions(
    options: Array<{ materialId: MaterialId; quality: Quality; quantity: number }>,
  ): void {
    options.forEach((option, index) => {
      if (index < this.slots.length) {
        const material: MaterialDisplay = {
          id: option.materialId,
          name: this.getMaterialName(option.materialId),
          type: option.materialId,
          quality: option.quality,
        };
        this.slots[index].setMaterial(material);
        this.slots[index].setInteractive(true);
      }
    });
    for (let i = options.length; i < this.slots.length; i++) {
      this.slots[i].setEmpty();
      this.slots[i].setInteractive(false);
    }
  }

  /**
   * 素材選択を無効化
   */
  disableSelection(): void {
    for (const slot of this.slots) {
      slot.setInteractive(false);
    }
  }

  /**
   * 全スロットの表示/非表示を設定
   */
  setVisible(visible: boolean): void {
    for (const slot of this.slots) {
      slot.setVisible(visible);
    }
  }

  /**
   * スロット一覧を取得（キーボードハンドラ用）
   */
  getSlots(): MaterialSlotUI[] {
    return this.slots;
  }

  /**
   * インデックスで素材選択用のMaterialDisplayを構築
   */
  buildMaterialDisplayAt(
    index: number,
    options: Array<{ materialId: MaterialId; quality: Quality; quantity: number }>,
  ): MaterialDisplay | null {
    if (index < 0 || index >= options.length) return null;
    const option = options[index];
    return {
      id: option.materialId,
      name: this.getMaterialName(option.materialId),
      type: option.materialId,
      quality: option.quality,
    };
  }

  /**
   * リソースを破棄
   */
  destroy(): void {
    for (const slot of this.slots) {
      slot.destroy();
    }
    this.slots = [];
  }

  private getMaterialName(materialId: MaterialId): string {
    if (this.materialNameResolver) {
      const resolvedName = this.materialNameResolver(materialId);
      if (resolvedName === materialId) {
        console.warn(
          `GatheringMaterialPool: materialNameResolver returned raw ID for "${materialId}".`,
        );
      }
      return resolvedName;
    }
    return materialId;
  }
}
