/**
 * ItemSelectorコンポーネント
 * TASK-0057 DeliveryPhaseUIリファクタリング
 *
 * @description
 * 納品するアイテムの一覧表示と選択を担当するコンポーネント
 */

import { Colors } from '@presentation/ui/theme';
import type Phaser from 'phaser';
import type { ItemInstance, ItemSelectorCallbacks, Quality } from './types';

// =============================================================================
// 定数定義
// =============================================================================

/** UIレイアウト定数 */
const LAYOUT = {
  ITEM_SPACING_X: 120,
  ITEM_OFFSET_Y: 50,
} as const;

/** UIテキスト定数 */
const UI_TEXT = {
  NO_ITEMS: '納品可能なアイテムがありません',
  LABEL: '所持アイテム:',
} as const;

/** UIスタイル定数 */
const UI_STYLES = {
  LABEL: {
    fontSize: '16px',
    color: '#ffffff',
  },
  DESCRIPTION: {
    fontSize: '14px',
    color: '#cccccc',
  },
} as const;

// =============================================================================
// 品質カラーマッピング
// =============================================================================

/**
 * 品質に応じた色を取得
 * @param quality - 品質
 * @returns 16進数カラー
 */
const getQualityColor = (quality: Quality): string => {
  const colorMap: Record<Quality, number> = {
    C: Colors.quality.common,
    B: Colors.quality.rare,
    A: Colors.quality.epic,
    S: Colors.quality.legendary,
  };
  return `#${colorMap[quality].toString(16).padStart(6, '0')}`;
};

// =============================================================================
// アイテムボタンインターフェース
// =============================================================================

interface ItemButton {
  item: ItemInstance;
  element: Phaser.GameObjects.Text;
  destroy: () => void;
}

// =============================================================================
// クラス定義
// =============================================================================

/**
 * アイテム選択コンポーネント
 */
export class ItemSelector {
  private scene: Phaser.Scene;
  private callbacks: ItemSelectorCallbacks;
  private container: Phaser.GameObjects.Container;
  private itemButtons: ItemButton[] = [];
  private items: ItemInstance[] = [];
  private selectedItemId: string | null = null;
  /**
   * 【修正】空メッセージ要素の参照を保持
   * 🔵 信頼性レベル: コードレビュー指摘に基づく修正
   */
  private emptyMessageText: Phaser.GameObjects.Text | null = null;

  /**
   * コンストラクタ
   * @param scene - Phaserシーン
   * @param x - X座標
   * @param y - Y座標
   * @param callbacks - コールバック
   */
  constructor(scene: Phaser.Scene, x: number, y: number, callbacks: ItemSelectorCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.container = scene.add.container(x, y);
  }

  /**
   * UIコンポーネント初期化
   */
  public create(): void {
    // ラベル作成
    const label = this.scene.add.text(0, 0, UI_TEXT.LABEL, UI_STYLES.LABEL);
    this.container.add(label);
  }

  /**
   * アイテムリストを設定
   * @param items - アイテム配列
   */
  /**
   * アイテムリストを設定
   * 【修正】空メッセージ要素を適切にクリアするよう修正
   * @param items - アイテム配列
   */
  public setItems(items: ItemInstance[]): void {
    // 【修正ポイント】既存要素を破棄（空メッセージ含む）
    this.destroyItemButtons();
    this.destroyEmptyMessage();

    this.items = items;

    if (items.length === 0) {
      // 空メッセージを表示
      this.showEmptyMessage();
      return;
    }

    // アイテムボタンを生成
    items.forEach((item, index) => {
      const button = this.createItemButton(item, index);
      this.itemButtons.push(button);
    });
  }

  /**
   * アイテムボタンを作成
   * @param item - アイテムデータ
   * @param index - インデックス
   * @returns アイテムボタン
   */
  private createItemButton(item: ItemInstance, index: number): ItemButton {
    const itemText = this.scene.add.text(
      index * LAYOUT.ITEM_SPACING_X,
      LAYOUT.ITEM_OFFSET_Y,
      `${item.name}(${item.quality})`,
      UI_STYLES.DESCRIPTION,
    );

    // 品質に応じた色を設定
    const qualityColor = getQualityColor(item.quality);
    itemText.setColor(qualityColor);

    itemText.setInteractive({ useHandCursor: true });
    itemText.on('pointerdown', () => this.onItemClick(item));
    this.container.add(itemText);

    return {
      item,
      element: itemText,
      destroy: () => {
        itemText.destroy();
      },
    };
  }

  /**
   * 空メッセージを表示
   * 【修正】メンバー変数に参照を保持するよう修正
   */
  private showEmptyMessage(): void {
    this.emptyMessageText = this.scene.add.text(
      0,
      LAYOUT.ITEM_OFFSET_Y,
      UI_TEXT.NO_ITEMS,
      UI_STYLES.DESCRIPTION,
    );
    this.container.add(this.emptyMessageText);
  }

  /**
   * 空メッセージを破棄
   * 【修正】空メッセージ要素のリーク対策として追加
   * 🔵 信頼性レベル: コードレビュー指摘に基づく修正
   */
  private destroyEmptyMessage(): void {
    if (this.emptyMessageText) {
      this.emptyMessageText.destroy();
      this.emptyMessageText = null;
    }
  }

  /**
   * アイテムクリック時の処理
   * @param item - クリックされたアイテム
   */
  private onItemClick(item: ItemInstance): void {
    this.selectedItemId = item.instanceId;
    this.callbacks.onItemSelect(item);
  }

  /**
   * アイテムを選択
   * @param instanceId - アイテムインスタンスID
   */
  public selectItem(instanceId: string): void {
    this.selectedItemId = instanceId;
  }

  /**
   * 選択中のアイテムを取得
   * @returns 選択中のアイテムまたはnull
   */
  public getSelectedItem(): ItemInstance | null {
    if (!this.selectedItemId) {
      return null;
    }
    return this.items.find((i) => i.instanceId === this.selectedItemId) || null;
  }

  /**
   * 選択をクリア
   */
  public clearSelection(): void {
    this.selectedItemId = null;
  }

  /**
   * アイテム数を取得
   * @returns アイテム数
   */
  public getItemCount(): number {
    return this.items.length;
  }

  /**
   * アイテムリストが空かどうか
   * @returns 空の場合true
   */
  public isEmpty(): boolean {
    return this.items.length === 0;
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
   * アイテムボタンを全て破棄
   */
  private destroyItemButtons(): void {
    for (const button of this.itemButtons) {
      button.destroy();
    }
    this.itemButtons = [];
  }

  /**
   * リソースを解放
   * 【修正】空メッセージも破棄対象に追加
   */
  public destroy(): void {
    this.destroyItemButtons();
    this.destroyEmptyMessage();
    this.container.destroy();
  }
}
