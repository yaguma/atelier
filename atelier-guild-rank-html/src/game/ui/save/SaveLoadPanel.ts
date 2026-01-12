/**
 * セーブ・ロードパネルコンポーネント
 *
 * TASK-0255: セーブ・ロード Phaser対応
 * セーブスロットの選択UIを提供する。
 */

import Phaser from 'phaser';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';
import type { SaveSlotInfo } from '../../save/PhaserSaveLoadManager';

/**
 * SaveLoadPanelオプション
 */
export interface SaveLoadPanelOptions {
  /** シーン */
  scene: Phaser.Scene;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** モード */
  mode: 'save' | 'load';
  /** スロット情報配列 */
  slots: SaveSlotInfo[];
  /** スロット選択コールバック */
  onSlotSelect: (slotId: number) => void;
  /** 閉じるコールバック */
  onClose: () => void;
}

/**
 * セーブ・ロードパネル
 *
 * セーブまたはロード用のスロット選択UIを提供する。
 *
 * @example
 * ```typescript
 * const panel = new SaveLoadPanel({
 *   scene: this,
 *   x: 640,
 *   y: 360,
 *   mode: 'save',
 *   slots: saveLoadManager.getSaveSlots(),
 *   onSlotSelect: (slotId) => saveLoadManager.save(slotId),
 *   onClose: () => panel.destroy(),
 * });
 * ```
 */
export class SaveLoadPanel extends Phaser.GameObjects.Container {
  private mode: 'save' | 'load';
  private slots: SaveSlotInfo[];
  private onSlotSelect: (slotId: number) => void;
  private onClose: () => void;

  constructor(options: SaveLoadPanelOptions) {
    super(options.scene, options.x, options.y);

    this.mode = options.mode;
    this.slots = options.slots;
    this.onSlotSelect = options.onSlotSelect;
    this.onClose = options.onClose;

    this.createPanel();
    options.scene.add.existing(this);
  }

  private createPanel(): void {
    const width = 400;
    const height = 350;

    // 背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(Colors.panelBackground, 0.95);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    bg.lineStyle(2, Colors.primary);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    this.add(bg);

    // タイトル
    const title = this.scene.add
      .text(0, -height / 2 + 30, this.mode === 'save' ? 'セーブ' : 'ロード', {
        ...TextStyles.titleSmall,
        fontSize: '24px',
      })
      .setOrigin(0.5);
    this.add(title);

    // スロット一覧
    this.slots.forEach((slot, index) => {
      const slotY = -height / 2 + 80 + index * 80;
      const slotItem = this.createSlotItem(slot, 0, slotY);
      this.add(slotItem);
    });

    // 閉じるボタン
    const closeBtn = this.createButton(0, height / 2 - 40, 120, 40, '閉じる');
    closeBtn.on('pointerdown', () => this.onClose());
    this.add(closeBtn);
  }

  private createSlotItem(
    slot: SaveSlotInfo,
    x: number,
    y: number
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const width = 350;
    const height = 70;

    // 背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(slot.exists ? Colors.panelBackgroundLight : 0x333333, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    container.add(bg);

    // スロット番号
    const slotNum = this.scene.add
      .text(-width / 2 + 20, -10, `スロット ${slot.slotId}`, {
        ...TextStyles.body,
        fontSize: '16px',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);
    container.add(slotNum);

    if (slot.exists) {
      // 日数・ランク
      const info = this.scene.add
        .text(
          -width / 2 + 20,
          15,
          `${slot.day ?? '?'}日目 / ランク ${slot.rank ?? '?'}`,
          {
            ...TextStyles.bodySmall,
            fontSize: '12px',
            color: '#aaaaaa',
          }
        )
        .setOrigin(0, 0);
      container.add(info);

      // 保存日時
      const dateStr = slot.timestamp
        ? new Date(slot.timestamp).toLocaleString('ja-JP')
        : '';
      const date = this.scene.add
        .text(width / 2 - 20, -10, dateStr, {
          ...TextStyles.bodySmall,
          fontSize: '11px',
          color: '#888888',
        })
        .setOrigin(1, 0.5);
      container.add(date);

      // プレイ時間
      const playtimeStr = this.formatPlaytime(slot.playtime ?? 0);
      const playtime = this.scene.add
        .text(width / 2 - 20, 10, playtimeStr, {
          ...TextStyles.bodySmall,
          fontSize: '11px',
          color: '#888888',
        })
        .setOrigin(1, 0.5);
      container.add(playtime);
    } else {
      // 空きスロット
      const empty = this.scene.add
        .text(0, 0, '空きスロット', {
          ...TextStyles.body,
          fontSize: '14px',
          color: '#666666',
        })
        .setOrigin(0.5);
      container.add(empty);
    }

    // インタラクション
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Colors.primaryHover, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(slot.exists ? Colors.panelBackgroundLight : 0x333333, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    container.on('pointerdown', () => {
      // ロードモードで空スロットは選択不可
      if (this.mode === 'load' && !slot.exists) {
        return;
      }
      this.onSlotSelect(slot.slotId);
    });

    return container;
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(Colors.secondary, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    container.add(bg);

    const label = this.scene.add
      .text(0, 0, text, {
        ...TextStyles.body,
        fontSize: '14px',
      })
      .setOrigin(0.5);
    container.add(label);

    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Colors.secondaryHover, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(Colors.secondary, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    });

    return container;
  }

  private formatPlaytime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `プレイ時間: ${hours}時間${minutes}分`;
    }
    return `プレイ時間: ${minutes}分`;
  }
}
