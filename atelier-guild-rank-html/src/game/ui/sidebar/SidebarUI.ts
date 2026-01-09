/**
 * SidebarUI実装
 *
 * メイン画面右側のサイドバーUI実装。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0205.md
 */

import Phaser from 'phaser';
import {
  ISidebarUI,
  SidebarUIOptions,
  QuestDisplayData,
  InventoryDisplayData,
} from './ISidebarUI';
import { SidebarLayout, SidebarColors, SidebarTab } from './SidebarConstants';

/**
 * 依頼リストアイテム
 */
class QuestListItem {
  public readonly container: Phaser.GameObjects.Container;
  public readonly questId: string;

  private scene: Phaser.Scene;
  private background: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private statusIndicator: Phaser.GameObjects.Graphics;
  private rewardText: Phaser.GameObjects.Text;

  private width: number;
  private selected: boolean = false;
  private canComplete: boolean;
  private onClick?: (quest: QuestDisplayData) => void;
  private questData: QuestDisplayData;

  constructor(
    scene: Phaser.Scene,
    quest: QuestDisplayData,
    x: number,
    y: number,
    width: number,
    onClick?: (quest: QuestDisplayData) => void
  ) {
    this.scene = scene;
    this.questId = quest.id;
    this.questData = quest;
    this.width = width;
    this.canComplete = quest.canComplete;
    this.onClick = onClick;

    this.container = scene.add.container(x, y);

    // 背景
    this.background = scene.add.graphics();
    this.drawBackground(false);
    this.container.add(this.background);

    // ステータスインジケーター
    this.statusIndicator = scene.add.graphics();
    this.updateStatusIndicator();
    this.container.add(this.statusIndicator);

    // 依頼名
    this.nameText = scene.add.text(15, 8, quest.name, {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#ffffff',
    });
    this.container.add(this.nameText);

    // 報酬テキスト
    const rewardStr = this.getRewardString(quest);
    this.rewardText = scene.add
      .text(width - 10, SidebarLayout.ITEM_HEIGHT / 2, rewardStr, {
        fontSize: '11px',
        fontFamily: 'Arial',
        color: '#ffd700',
      })
      .setOrigin(1, 0.5);
    this.container.add(this.rewardText);

    // インタラクション設定
    this.setupInteraction();
  }

  private setupInteraction(): void {
    this.container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.width, SidebarLayout.ITEM_HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );

    this.container.on('pointerover', () => {
      if (!this.selected) {
        this.drawBackground(true);
      }
    });

    this.container.on('pointerout', () => {
      if (!this.selected) {
        this.drawBackground(false);
      }
    });

    this.container.on('pointerdown', () => {
      if (this.onClick) {
        this.onClick(this.questData);
      }
    });
  }

  private drawBackground(hover: boolean): void {
    const height = SidebarLayout.ITEM_HEIGHT;
    const bgColor = this.selected
      ? SidebarColors.ITEM_SELECTED
      : hover
        ? SidebarColors.ITEM_HOVER
        : SidebarColors.ITEM_BACKGROUND;
    const alpha = this.selected ? 0.9 : 0.8;

    this.background.clear();
    this.background.fillStyle(bgColor, alpha);
    this.background.fillRoundedRect(0, 0, this.width, height, 6);

    if (this.selected) {
      this.background.lineStyle(2, 0x4a90d9);
      this.background.strokeRoundedRect(0, 0, this.width, height, 6);
    }
  }

  private updateStatusIndicator(): void {
    const height = SidebarLayout.ITEM_HEIGHT;
    const statusColor = this.canComplete ? 0x00ff00 : 0x0088ff;

    this.statusIndicator.clear();
    this.statusIndicator.fillStyle(statusColor, 1);
    this.statusIndicator.fillRoundedRect(0, 0, 4, height, {
      tl: 6,
      bl: 6,
      tr: 0,
      br: 0,
    });
  }

  private getRewardString(quest: QuestDisplayData): string {
    const parts: string[] = [];
    if (quest.rewardGold > 0) parts.push(`${quest.rewardGold}G`);
    if (quest.rewardExp > 0) parts.push(`${quest.rewardExp}EXP`);
    return parts.join(' / ');
  }

  setSelected(selected: boolean): void {
    this.selected = selected;
    this.drawBackground(false);
  }

  destroy(): void {
    this.container.destroy();
  }
}

/**
 * インベントリリストアイテム
 */
class InventoryListItem {
  public readonly container: Phaser.GameObjects.Container;
  public readonly itemId: string;

  private scene: Phaser.Scene;
  private background: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private countText: Phaser.GameObjects.Text;

  private width: number;
  private selected: boolean = false;
  private onClick?: (item: InventoryDisplayData) => void;
  private itemData: InventoryDisplayData;

  constructor(
    scene: Phaser.Scene,
    item: InventoryDisplayData,
    x: number,
    y: number,
    width: number,
    onClick?: (item: InventoryDisplayData) => void
  ) {
    this.scene = scene;
    this.itemId = item.id;
    this.itemData = item;
    this.width = width;
    this.onClick = onClick;

    this.container = scene.add.container(x, y);

    // 背景
    this.background = scene.add.graphics();
    this.drawBackground(false);
    this.container.add(this.background);

    // アイテム名
    this.nameText = scene.add.text(10, 8, item.name, {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#ffffff',
    });
    this.container.add(this.nameText);

    // 所持数
    this.countText = scene.add
      .text(width - 10, SidebarLayout.ITEM_HEIGHT / 2, `x${item.count}`, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#aaaaaa',
      })
      .setOrigin(1, 0.5);
    this.container.add(this.countText);

    // インタラクション設定
    this.setupInteraction();
  }

  private setupInteraction(): void {
    this.container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.width, SidebarLayout.ITEM_HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );

    this.container.on('pointerover', () => {
      if (!this.selected) {
        this.drawBackground(true);
      }
    });

    this.container.on('pointerout', () => {
      if (!this.selected) {
        this.drawBackground(false);
      }
    });

    this.container.on('pointerdown', () => {
      if (this.onClick) {
        this.onClick(this.itemData);
      }
    });
  }

  private drawBackground(hover: boolean): void {
    const height = SidebarLayout.ITEM_HEIGHT;
    const bgColor = this.selected
      ? SidebarColors.ITEM_SELECTED
      : hover
        ? SidebarColors.ITEM_HOVER
        : SidebarColors.ITEM_BACKGROUND;
    const alpha = this.selected ? 0.9 : 0.8;

    this.background.clear();
    this.background.fillStyle(bgColor, alpha);
    this.background.fillRoundedRect(0, 0, this.width, height, 6);

    if (this.selected) {
      this.background.lineStyle(2, 0x4a90d9);
      this.background.strokeRoundedRect(0, 0, this.width, height, 6);
    }
  }

  setSelected(selected: boolean): void {
    this.selected = selected;
    this.drawBackground(false);
  }

  destroy(): void {
    this.container.destroy();
  }
}

/**
 * SidebarUI実装
 */
export class SidebarUI implements ISidebarUI {
  public readonly container: Phaser.GameObjects.Container;

  private scene: Phaser.Scene;
  private activeTab: SidebarTab = 'quests';

  // 背景
  private background: Phaser.GameObjects.Graphics;

  // タブ
  private questsTab: Phaser.GameObjects.Container;
  private inventoryTab: Phaser.GameObjects.Container;

  // コンテンツ
  private questsContainer: Phaser.GameObjects.Container;
  private inventoryContainer: Phaser.GameObjects.Container;

  // リストアイテム
  private questItems: QuestListItem[] = [];
  private inventoryItems: InventoryListItem[] = [];

  // データ
  private quests: QuestDisplayData[] = [];
  private inventory: InventoryDisplayData[] = [];

  // 選択状態
  private selectedQuestId: string | null = null;
  private selectedItemId: string | null = null;

  // コールバック
  private onQuestSelect?: (quest: QuestDisplayData) => void;
  private onItemSelect?: (item: InventoryDisplayData) => void;

  constructor(scene: Phaser.Scene, options: SidebarUIOptions = {}) {
    this.scene = scene;
    this.onQuestSelect = options.onQuestSelect;
    this.onItemSelect = options.onItemSelect;

    const x = options.x ?? SidebarLayout.X;
    const y = options.y ?? SidebarLayout.Y;
    const width = options.width ?? SidebarLayout.WIDTH;
    const height = options.height ?? SidebarLayout.HEIGHT;

    this.container = scene.add.container(x, y);
    this.container.setDepth(400);

    // 背景
    this.background = scene.add.graphics();
    this.background.fillStyle(
      SidebarColors.BACKGROUND,
      SidebarColors.BACKGROUND_ALPHA
    );
    this.background.fillRoundedRect(0, 0, width, height, 8);
    this.background.lineStyle(1, SidebarColors.BORDER);
    this.background.strokeRoundedRect(0, 0, width, height, 8);
    this.container.add(this.background);

    // タブ作成
    this.questsTab = this.createTab('依頼', 0, () => this.setActiveTab('quests'));
    this.container.add(this.questsTab);

    this.inventoryTab = this.createTab('所持品', SidebarLayout.TAB_WIDTH, () =>
      this.setActiveTab('inventory')
    );
    this.container.add(this.inventoryTab);

    // コンテンツエリア作成
    this.questsContainer = scene.add.container(
      SidebarLayout.PADDING,
      SidebarLayout.CONTENT_Y
    );
    this.container.add(this.questsContainer);

    this.inventoryContainer = scene.add.container(
      SidebarLayout.PADDING,
      SidebarLayout.CONTENT_Y
    );
    this.inventoryContainer.setVisible(false);
    this.container.add(this.inventoryContainer);

    // 初期タブ
    this.setActiveTab('quests');
  }

  private createTab(
    label: string,
    offsetX: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const tab = this.scene.add.container(
      SidebarLayout.PADDING + offsetX,
      SidebarLayout.PADDING
    );

    const bg = this.scene.add.graphics();
    bg.fillStyle(SidebarColors.TAB_INACTIVE, 1);
    bg.fillRoundedRect(0, 0, SidebarLayout.TAB_WIDTH, SidebarLayout.TAB_HEIGHT, {
      tl: 8,
      tr: 8,
      bl: 0,
      br: 0,
    });
    tab.add(bg);

    const text = this.scene.add
      .text(
        SidebarLayout.TAB_WIDTH / 2,
        SidebarLayout.TAB_HEIGHT / 2,
        label,
        {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#ffffff',
        }
      )
      .setOrigin(0.5);
    tab.add(text);

    tab.setInteractive(
      new Phaser.Geom.Rectangle(
        0,
        0,
        SidebarLayout.TAB_WIDTH,
        SidebarLayout.TAB_HEIGHT
      ),
      Phaser.Geom.Rectangle.Contains
    );
    tab.on('pointerdown', onClick);

    tab.setData('bg', bg);
    tab.setData('text', text);

    return tab;
  }

  private updateTabVisual(
    tab: Phaser.GameObjects.Container,
    active: boolean
  ): void {
    const bg = tab.getData('bg') as Phaser.GameObjects.Graphics;
    bg.clear();
    bg.fillStyle(
      active ? SidebarColors.TAB_ACTIVE : SidebarColors.TAB_INACTIVE,
      1
    );
    bg.fillRoundedRect(0, 0, SidebarLayout.TAB_WIDTH, SidebarLayout.TAB_HEIGHT, {
      tl: 8,
      tr: 8,
      bl: 0,
      br: 0,
    });
  }

  // ========================================
  // タブ切り替え
  // ========================================

  setActiveTab(tab: SidebarTab): void {
    this.activeTab = tab;

    this.updateTabVisual(this.questsTab, tab === 'quests');
    this.updateTabVisual(this.inventoryTab, tab === 'inventory');

    this.questsContainer.setVisible(tab === 'quests');
    this.inventoryContainer.setVisible(tab === 'inventory');
  }

  getActiveTab(): SidebarTab {
    return this.activeTab;
  }

  // ========================================
  // 依頼リスト
  // ========================================

  setQuests(quests: QuestDisplayData[]): void {
    this.quests = quests;

    // 既存アイテムをクリア
    this.questItems.forEach((item) => item.destroy());
    this.questItems = [];

    const itemWidth = SidebarLayout.WIDTH - SidebarLayout.PADDING * 2;

    // 新しいアイテムを生成
    quests.forEach((quest, index) => {
      const item = new QuestListItem(
        this.scene,
        quest,
        0,
        index * (SidebarLayout.ITEM_HEIGHT + SidebarLayout.ITEM_SPACING),
        itemWidth,
        (q) => this.handleQuestClick(q)
      );
      this.questsContainer.add(item.container);
      this.questItems.push(item);
    });

    // 選択状態を復元
    if (this.selectedQuestId) {
      this.highlightQuest(this.selectedQuestId);
    }
  }

  private handleQuestClick(quest: QuestDisplayData): void {
    this.selectedQuestId = quest.id;
    this.questItems.forEach((item) => {
      item.setSelected(item.questId === quest.id);
    });

    if (this.onQuestSelect) {
      this.onQuestSelect(quest);
    }
  }

  highlightQuest(questId: string): void {
    this.selectedQuestId = questId;
    this.questItems.forEach((item) => {
      item.setSelected(item.questId === questId);
    });

    const index = this.quests.findIndex((q) => q.id === questId);
    if (index >= 0) {
      this.scrollToItem(index);
    }
  }

  clearQuestHighlight(): void {
    this.selectedQuestId = null;
    this.questItems.forEach((item) => {
      item.setSelected(false);
    });
  }

  // ========================================
  // インベントリ
  // ========================================

  setInventory(items: InventoryDisplayData[]): void {
    this.inventory = items;

    // 既存アイテムをクリア
    this.inventoryItems.forEach((item) => item.destroy());
    this.inventoryItems = [];

    const itemWidth = SidebarLayout.WIDTH - SidebarLayout.PADDING * 2;

    // 新しいアイテムを生成
    items.forEach((inventoryItem, index) => {
      const item = new InventoryListItem(
        this.scene,
        inventoryItem,
        0,
        index * (SidebarLayout.ITEM_HEIGHT + SidebarLayout.ITEM_SPACING),
        itemWidth,
        (i) => this.handleItemClick(i)
      );
      this.inventoryContainer.add(item.container);
      this.inventoryItems.push(item);
    });

    // 選択状態を復元
    if (this.selectedItemId) {
      this.highlightItem(this.selectedItemId);
    }
  }

  private handleItemClick(item: InventoryDisplayData): void {
    this.selectedItemId = item.id;
    this.inventoryItems.forEach((invItem) => {
      invItem.setSelected(invItem.itemId === item.id);
    });

    if (this.onItemSelect) {
      this.onItemSelect(item);
    }
  }

  highlightItem(itemId: string): void {
    this.selectedItemId = itemId;
    this.inventoryItems.forEach((item) => {
      item.setSelected(item.itemId === itemId);
    });

    const index = this.inventory.findIndex((i) => i.id === itemId);
    if (index >= 0) {
      this.scrollToItem(index);
    }
  }

  clearItemHighlight(): void {
    this.selectedItemId = null;
    this.inventoryItems.forEach((item) => {
      item.setSelected(false);
    });
  }

  // ========================================
  // 表示制御
  // ========================================

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  setEnabled(enabled: boolean): void {
    this.container.setAlpha(enabled ? 1 : 0.5);
  }

  // ========================================
  // スクロール
  // ========================================

  scrollToTop(): void {
    // 基本実装ではスクロールなし
    // rexUIを使用する場合は拡張
  }

  scrollToItem(_index: number): void {
    // 基本実装ではスクロールなし
    // rexUIを使用する場合は拡張
  }

  // ========================================
  // ライフサイクル
  // ========================================

  destroy(): void {
    this.questItems.forEach((item) => item.destroy());
    this.inventoryItems.forEach((item) => item.destroy());
    this.container.destroy();
  }
}
