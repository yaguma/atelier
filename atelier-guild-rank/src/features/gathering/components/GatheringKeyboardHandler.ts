/**
 * GatheringKeyboardHandler.ts - 採取フェーズキーボード操作ハンドラ
 * Issue #459: GatheringPhaseUIから分離
 *
 * @description
 * 採取フェーズにおけるキーボード操作（数字キーによるスロット選択、
 * 矢印キーによるグリッドナビゲーション、ショートカットキー）を管理する。
 */

import { getSelectionIndexFromKey, isKeyForAction } from '@shared/constants/keybindings';
import type { MaterialSlotUI } from './MaterialSlotUI';

/** キーボードハンドラのコールバック */
export interface GatheringKeyboardCallbacks {
  /** スロット選択時のコールバック（optionIndex） */
  onSelectSlot: (index: number) => void;
  /** リロール要求時のコールバック */
  onReroll: () => void;
  /** 採取終了要求時のコールバック */
  onEndGathering: () => void;
}

/**
 * GatheringKeyboardHandler - 採取フェーズキーボード操作
 *
 * 【責務】:
 * - 数字キー(1-6)による素材スロット直接選択
 * - 矢印キーによる2行3列グリッドナビゲーション
 * - Enter/Spaceによるフォーカススロット選択
 * - Rキーによるリロール
 * - Nキーによる採取終了
 */
export class GatheringKeyboardHandler {
  private keyboardHandler: ((event: { key: string }) => void) | null = null;
  private focusedSlotIndex = 0;

  constructor(
    private scene: Phaser.Scene,
    private getSlots: () => MaterialSlotUI[],
    private callbacks: GatheringKeyboardCallbacks,
  ) {}

  /**
   * キーボードリスナーを設定
   */
  setup(): void {
    this.keyboardHandler = (event: { key: string }) => this.handleKeyboardInput(event);
    this.scene?.input?.keyboard?.on('keydown', this.keyboardHandler);
  }

  /**
   * キーボードリスナーを解除
   */
  teardown(): void {
    if (this.keyboardHandler) {
      this.scene?.input?.keyboard?.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * キーボード入力を処理
   */
  private handleKeyboardInput(event: { key: string }): void {
    const slots = this.getSlots();

    // 数字キーで素材スロットを直接選択（1-6）
    const selectionIndex = getSelectionIndexFromKey(event.key);
    if (selectionIndex !== null && selectionIndex <= slots.length) {
      const slot = slots[selectionIndex - 1];
      if (slot) {
        this.focusedSlotIndex = selectionIndex - 1;
        this.updateSlotFocus();
        this.callbacks.onSelectSlot(selectionIndex - 1);
      }
      return;
    }

    // 矢印キーでナビゲーション（2行3列グリッド）
    if (isKeyForAction(event.key, 'LEFT')) {
      this.moveFocus(-1, 0);
    } else if (isKeyForAction(event.key, 'RIGHT')) {
      this.moveFocus(1, 0);
    } else if (isKeyForAction(event.key, 'UP')) {
      this.moveFocus(0, -1);
    } else if (isKeyForAction(event.key, 'DOWN')) {
      this.moveFocus(0, 1);
    }
    // Enter/Spaceで選択中のスロットを選択
    else if (isKeyForAction(event.key, 'CONFIRM')) {
      this.callbacks.onSelectSlot(this.focusedSlotIndex);
    }
    // Rキーでリロール（Issue #445）
    else if (isKeyForAction(event.key, 'REROLL')) {
      this.callbacks.onReroll();
    }
    // Nキーで採取終了
    else if (isKeyForAction(event.key, 'NEXT_PHASE')) {
      this.callbacks.onEndGathering();
    }
  }

  /**
   * フォーカスを移動（2行3列グリッド）
   */
  private moveFocus(deltaCol: number, deltaRow: number): void {
    const COLS = 3;
    const ROWS = 2;
    const slots = this.getSlots();

    const currentCol = this.focusedSlotIndex % COLS;
    const currentRow = Math.floor(this.focusedSlotIndex / COLS);

    let newCol = currentCol + deltaCol;
    let newRow = currentRow + deltaRow;

    // 範囲内に収める
    if (newCol < 0) newCol = 0;
    if (newCol >= COLS) newCol = COLS - 1;
    if (newRow < 0) newRow = 0;
    if (newRow >= ROWS) newRow = ROWS - 1;

    const newIndex = newRow * COLS + newCol;
    if (newIndex !== this.focusedSlotIndex && newIndex < slots.length) {
      this.focusedSlotIndex = newIndex;
      this.updateSlotFocus();
    }
  }

  /**
   * スロットフォーカスを視覚的に更新
   */
  private updateSlotFocus(): void {
    const FOCUSED_SCALE = 1.1;
    const DEFAULT_SCALE = 1.0;
    const slots = this.getSlots();

    slots.forEach((slot, index) => {
      const container = slot.getContainer();
      if (!container) return;

      if (typeof container.setScale === 'function') {
        if (index === this.focusedSlotIndex) {
          container.setScale(FOCUSED_SCALE);
        } else {
          container.setScale(DEFAULT_SCALE);
        }
      }
    });
  }
}
