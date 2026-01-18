/**
 * DeliveryPhaseUIコンポーネント
 * TASK-0025 納品フェーズUI
 *
 * @description
 * 納品フェーズ全体のUI管理を担当するコンポーネント。
 * 依頼一覧表示、アイテム選択、報酬プレビュー、納品実行を管理する。
 */

import type Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/** UI配置定数 */
const UI_LAYOUT = {
  /** コンポーネント初期X座標 */
  COMPONENT_X: 160,
  /** コンポーネント初期Y座標 */
  COMPONENT_Y: 80,
  /** 依頼リストX座標 */
  QUEST_LIST_X: 0,
  /** 依頼リストY座標 */
  QUEST_LIST_Y: 60,
  /** アイテムインベントリY座標 */
  ITEM_INVENTORY_Y: 450,
  /** タイトルX座標 */
  TITLE_X: 0,
  /** タイトルY座標 */
  TITLE_Y: 0,
  /** 終了ボタンY座標 */
  END_DAY_BUTTON_Y: 550,
} as const;

/** エラーメッセージ定数 */
const ERROR_MESSAGES = {
  EVENT_BUS_NOT_AVAILABLE: 'EventBus is not available in scene.data',
  QUEST_SERVICE_NOT_AVAILABLE: 'QuestService is not available',
  INVENTORY_SERVICE_NOT_AVAILABLE: 'InventoryService is not available',
  CONTRIBUTION_CALCULATOR_NOT_AVAILABLE: 'ContributionCalculator is not available',
  FAILED_TO_EMIT_EVENT: 'Failed to emit event:',
  NO_QUEST_SELECTED: 'No quest is selected',
  NO_ITEM_SELECTED: 'No item is selected',
} as const;

/** UIテキスト定数 */
const UI_TEXT = {
  PHASE_TITLE: '📦 納品フェーズ',
  SELECT_QUEST: '納品する依頼を選択してください',
  SELECT_ITEM: 'アイテムを選択してください',
  END_DAY: '日を終了する',
  DELIVER_BUTTON: '納品する',
  CANCEL_BUTTON: 'キャンセル',
  NO_QUESTS: '納品可能な依頼がありません',
  NO_ITEMS: '納品可能なアイテムがありません',
} as const;

/** スタイル定数 */
const UI_STYLES = {
  TITLE: {
    fontSize: '24px',
    color: '#ffffff',
  },
  LABEL: {
    fontSize: '16px',
    color: '#ffffff',
  },
  DESCRIPTION: {
    fontSize: '14px',
    color: '#cccccc',
  },
} as const;

/** キーボードショートカット定数 */
const KEYBOARD_KEYS = {
  /** 納品キー */
  DELIVER_UPPER: 'D',
  DELIVER_LOWER: 'd',
  /** 終了キー */
  END_UPPER: 'E',
  END_LOWER: 'e',
  /** キャンセルキー */
  CANCEL: 'Escape',
  /** 確定キー */
  CONFIRM: 'Enter',
} as const;

/**
 * EventBusインターフェース
 */
interface IEventBus {
  emit(event: string, payload?: unknown): void;
  on(event: string, callback: (payload?: unknown) => void): void;
  off(event: string, callback: (payload?: unknown) => void): void;
  once(event: string, callback: (payload?: unknown) => void): void;
}

/**
 * 品質タイプ
 */
type Quality = 'C' | 'B' | 'A' | 'S';

/**
 * Questインターフェース
 */
interface Quest {
  id: string;
  clientName: string;
  clientType: string;
  description: string;
  requiredItem: string;
  requiredCount: number;
  rewardContribution: number;
  rewardGold: number;
  remainingDays: number;
  status: 'available' | 'accepted' | 'completed' | 'failed';
}

/**
 * ItemInstanceインターフェース
 */
interface ItemInstance {
  instanceId: string;
  itemId: string;
  name: string;
  quality: Quality;
  attributes: { name: string; value: number }[];
}

/**
 * DeliveryResultインターフェース
 */
interface DeliveryResult {
  success: boolean;
  questId: string;
  itemId: string;
  contribution: number;
  gold: number;
  rewardCards: RewardCard[];
  newPromotionGauge: number;
  promotionGaugeMax: number;
  questCompleted: boolean;
}

/**
 * RewardCardインターフェース
 */
interface RewardCard {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare';
  cardType: 'gathering' | 'recipe' | 'enhancement';
  description: string;
  effectDescription: string;
}

/**
 * ContributionPreviewインターフェース
 */
interface ContributionPreview {
  baseReward: number;
  qualityModifier: number;
  qualityBonus: number;
  totalContribution: number;
}

/**
 * IQuestServiceインターフェース
 */
interface IQuestService {
  getAcceptedQuests(): Quest[];
  deliver(questId: string, items: ItemInstance[]): DeliveryResult;
  canDeliver(questId: string, items: ItemInstance[]): boolean;
}

/**
 * IInventoryServiceインターフェース
 */
interface IInventoryService {
  getItems(): ItemInstance[];
  removeItems(itemIds: string[]): void;
}

/**
 * ContributionCalculatorインターフェース
 */
interface IContributionCalculator {
  calculatePreview(
    quest: Quest,
    items: ItemInstance[],
  ): ContributionPreview;
}

/**
 * DeliveryQuestPanelインターフェース
 */
interface DeliveryQuestPanel {
  quest: Quest;
  destroy(): void;
}

/**
 * ItemInventoryUIインターフェース
 */
interface ItemInventoryUI {
  destroy(): void;
}

/**
 * Buttonインターフェース
 */
interface Button {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  destroy(): void;
}

/**
 * GameEventType定義
 */
const GameEventType = {
  QUEST_SELECTED_FOR_DELIVERY: 'QUEST_SELECTED_FOR_DELIVERY',
  ITEM_SELECTED_FOR_DELIVERY: 'ITEM_SELECTED_FOR_DELIVERY',
  CONTRIBUTION_PREVIEW_UPDATED: 'CONTRIBUTION_PREVIEW_UPDATED',
  DELIVERY_STARTED: 'DELIVERY_STARTED',
  DELIVERY_COMPLETED: 'DELIVERY_COMPLETED',
  REWARD_CARD_SELECTED: 'REWARD_CARD_SELECTED',
  REWARD_CARD_SKIPPED: 'REWARD_CARD_SKIPPED',
  DAY_END_REQUESTED: 'DAY_END_REQUESTED',
  PROMOTION_GAUGE_UPDATED: 'PROMOTION_GAUGE_UPDATED',
  PHASE_TRANSITION_REQUESTED: 'PHASE_TRANSITION_REQUESTED',
} as const;

/**
 * BaseComponentクラス（簡易実装）
 * UIコンポーネントの基底クラス
 */
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
  }

  public abstract create(): void;
  public abstract destroy(): void;

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  public setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  public setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }
}

/**
 * DeliveryPhaseUIコンポーネント
 *
 * 納品フェーズのUIを管理するコンポーネント。
 * 依頼一覧表示、アイテム選択、報酬プレビュー、納品実行を行う。
 */
export class DeliveryPhaseUI extends BaseComponent {
  /** EventBus参照 */
  private eventBus: IEventBus | null = null;

  /** QuestService参照 */
  private questService: IQuestService | null = null;

  /** InventoryService参照 */
  private inventoryService: IInventoryService | null = null;

  /** ContributionCalculator参照 */
  private contributionCalculator: IContributionCalculator | null = null;

  /** 依頼パネルリスト */
  private questPanels: DeliveryQuestPanel[] = [];

  /** アイテムインベントリUI */
  private itemInventory: ItemInventoryUI | null = null;

  /** 納品ボタン */
  private deliverButton: Button | null = null;

  /** 日終了ボタン */
  private endDayButton: Button | null = null;

  /** 選択中の依頼 */
  private selectedQuest: Quest | null = null;

  /** 選択中のアイテム */
  private selectedItem: ItemInstance | null = null;

  /** プレビューテキスト */
  private previewText: Phaser.GameObjects.Text | null = null;

  /** キーボードリスナー関数 */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   */
  constructor(scene: Phaser.Scene) {
    super(scene, UI_LAYOUT.COMPONENT_X, UI_LAYOUT.COMPONENT_Y);

    this.initializeServices();
    this.create();
  }

  /**
   * サービスを初期化
   */
  private initializeServices(): void {
    this.eventBus = this.scene.data.get('eventBus');
    if (!this.eventBus) {
      console.warn(ERROR_MESSAGES.EVENT_BUS_NOT_AVAILABLE);
    }

    this.questService = this.scene.data.get('questService');
    if (!this.questService) {
      console.warn(ERROR_MESSAGES.QUEST_SERVICE_NOT_AVAILABLE);
    }

    this.inventoryService = this.scene.data.get('inventoryService');
    if (!this.inventoryService) {
      console.warn(ERROR_MESSAGES.INVENTORY_SERVICE_NOT_AVAILABLE);
    }

    this.contributionCalculator = this.scene.data.get('contributionCalculator');
    if (!this.contributionCalculator) {
      console.warn(ERROR_MESSAGES.CONTRIBUTION_CALCULATOR_NOT_AVAILABLE);
    }
  }

  /**
   * UIコンポーネント初期化
   */
  public create(): void {
    // タイトルを作成
    this.createTitle();

    // 依頼パネルを作成
    this.createQuestPanels();

    // アイテムインベントリを作成
    this.createItemInventory();

    // プレビューエリアを作成
    this.createPreviewArea();

    // ボタンを作成
    this.createButtons();

    // キーボードリスナーを登録
    this.setupKeyboardListener();
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    const title = this.scene.add.text(
      UI_LAYOUT.TITLE_X,
      UI_LAYOUT.TITLE_Y,
      UI_TEXT.PHASE_TITLE,
      UI_STYLES.TITLE,
    );
    this.container.add(title);
  }

  /**
   * 依頼パネルを作成
   */
  private createQuestPanels(): void {
    if (!this.questService) {
      return;
    }

    const acceptedQuests = this.questService.getAcceptedQuests();

    if (acceptedQuests.length === 0) {
      const noQuestsText = this.scene.add.text(
        UI_LAYOUT.QUEST_LIST_X,
        UI_LAYOUT.QUEST_LIST_Y,
        UI_TEXT.NO_QUESTS,
        UI_STYLES.DESCRIPTION,
      );
      this.container.add(noQuestsText);
      return;
    }

    this.destroyQuestPanels();

    acceptedQuests.forEach((quest, index) => {
      const panel = this.createQuestPanel(quest, index);
      this.questPanels.push(panel);
    });
  }

  /**
   * 依頼パネルを作成
   * @param quest - 依頼データ
   * @param index - インデックス
   * @returns 依頼パネル
   */
  private createQuestPanel(quest: Quest, index: number): DeliveryQuestPanel {
    const panelY = UI_LAYOUT.QUEST_LIST_Y + index * 100;

    // パネル背景
    const panelBg = this.scene.add.rectangle(
      UI_LAYOUT.QUEST_LIST_X + 200,
      panelY,
      400,
      90,
      0x333333,
      0.8,
    );
    panelBg.setStrokeStyle(2, 0x4caf50);
    panelBg.setInteractive({ useHandCursor: true });
    panelBg.on('pointerdown', () => this.onQuestSelect(quest));
    this.container.add(panelBg);

    // 依頼情報テキスト
    const questText = this.scene.add.text(
      UI_LAYOUT.QUEST_LIST_X + 20,
      panelY - 30,
      `${quest.description} - ${quest.clientName}`,
      UI_STYLES.LABEL,
    );
    this.container.add(questText);

    const requirementText = this.scene.add.text(
      UI_LAYOUT.QUEST_LIST_X + 20,
      panelY - 10,
      `要求: ${quest.requiredItem}`,
      UI_STYLES.DESCRIPTION,
    );
    this.container.add(requirementText);

    const rewardText = this.scene.add.text(
      UI_LAYOUT.QUEST_LIST_X + 20,
      panelY + 10,
      `報酬: 貢献度${quest.rewardContribution} + ${quest.rewardGold}G`,
      UI_STYLES.DESCRIPTION,
    );
    this.container.add(rewardText);

    const deadlineText = this.scene.add.text(
      UI_LAYOUT.QUEST_LIST_X + 300,
      panelY - 10,
      `期限: あと${quest.remainingDays}日`,
      UI_STYLES.DESCRIPTION,
    );
    this.container.add(deadlineText);

    return {
      quest,
      destroy: () => {
        panelBg.destroy();
        questText.destroy();
        requirementText.destroy();
        rewardText.destroy();
        deadlineText.destroy();
      },
    };
  }

  /**
   * アイテムインベントリを作成
   */
  private createItemInventory(): void {
    if (!this.inventoryService) {
      return;
    }

    const inventoryContainer = this.scene.add.container(
      0,
      UI_LAYOUT.ITEM_INVENTORY_Y,
    );

    // 所持アイテムラベル
    const label = this.scene.add.text(0, 0, '所持アイテム:', UI_STYLES.LABEL);
    inventoryContainer.add(label);

    // 所持アイテム一覧
    const items = this.inventoryService.getItems();
    const itemsText =
      items.length > 0
        ? items.map((i) => `[${i.name}(${i.quality})]`).join(' ')
        : UI_TEXT.NO_ITEMS;

    const itemsDisplay = this.scene.add.text(
      0,
      25,
      itemsText,
      UI_STYLES.DESCRIPTION,
    );
    itemsDisplay.setInteractive({ useHandCursor: true });

    // アイテムクリック処理（簡易実装）
    items.forEach((item, index) => {
      const itemButton = this.scene.add.text(
        index * 120,
        50,
        `${item.name}(${item.quality})`,
        UI_STYLES.DESCRIPTION,
      );
      itemButton.setInteractive({ useHandCursor: true });
      itemButton.on('pointerdown', () => this.onItemSelect(item));
      inventoryContainer.add(itemButton);
    });

    inventoryContainer.add(itemsDisplay);
    this.container.add(inventoryContainer);

    this.itemInventory = {
      destroy: () => inventoryContainer.destroy(),
    };
  }

  /**
   * プレビューエリアを作成
   */
  private createPreviewArea(): void {
    this.previewText = this.scene.add.text(
      0,
      350,
      UI_TEXT.SELECT_QUEST,
      UI_STYLES.DESCRIPTION,
    );
    this.container.add(this.previewText);
  }

  /**
   * ボタンを作成
   */
  private createButtons(): void {
    // 納品ボタン
    const deliverButtonRect = this.scene.add.rectangle(
      200,
      400,
      120,
      40,
      0x4caf50,
    );
    deliverButtonRect.setInteractive({ useHandCursor: true });
    deliverButtonRect.on('pointerdown', () => this.onDeliver());

    const deliverButtonText = this.scene.add.text(
      200,
      400,
      UI_TEXT.DELIVER_BUTTON,
      UI_STYLES.LABEL,
    );
    deliverButtonText.setOrigin(0.5);

    this.container.add([deliverButtonRect, deliverButtonText]);

    this.deliverButton = {
      isEnabled: () => this.canDeliver(),
      setEnabled: (enabled: boolean) => {
        deliverButtonRect.setAlpha(enabled ? 1 : 0.5);
        deliverButtonRect.setInteractive(enabled);
      },
      destroy: () => {
        deliverButtonRect.destroy();
        deliverButtonText.destroy();
      },
    };

    // 日終了ボタン
    const endDayButtonRect = this.scene.add.rectangle(
      200,
      UI_LAYOUT.END_DAY_BUTTON_Y,
      200,
      48,
      0x9c27b0,
    );
    endDayButtonRect.setInteractive({ useHandCursor: true });
    endDayButtonRect.on('pointerdown', () => this.onEndDay());

    const endDayButtonText = this.scene.add.text(
      200,
      UI_LAYOUT.END_DAY_BUTTON_Y,
      UI_TEXT.END_DAY,
      UI_STYLES.LABEL,
    );
    endDayButtonText.setOrigin(0.5);

    this.container.add([endDayButtonRect, endDayButtonText]);

    this.endDayButton = {
      isEnabled: () => true,
      setEnabled: () => {},
      destroy: () => {
        endDayButtonRect.destroy();
        endDayButtonText.destroy();
      },
    };

    // 初期状態は納品ボタン無効
    this.deliverButton.setEnabled(false);
  }

  /**
   * キーボードリスナーを設定
   */
  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => {
      this.handleKeyboardInput(event);
    };
    this.scene.input.keyboard.on('keydown', this.keyboardHandler);
  }

  /**
   * 依頼選択時の処理
   * @param quest - 選択された依頼
   */
  private onQuestSelect(quest: Quest): void {
    this.selectedQuest = quest;

    // プレビューを更新
    this.updatePreview();

    // QUEST_SELECTED_FOR_DELIVERYイベントを発行
    this.emitEvent(GameEventType.QUEST_SELECTED_FOR_DELIVERY, {
      questId: quest.id,
    });
  }

  /**
   * アイテム選択時の処理
   * @param item - 選択されたアイテム
   */
  private onItemSelect(item: ItemInstance): void {
    this.selectedItem = item;

    // プレビューを更新
    this.updatePreview();

    // ITEM_SELECTED_FOR_DELIVERYイベントを発行
    this.emitEvent(GameEventType.ITEM_SELECTED_FOR_DELIVERY, {
      questId: this.selectedQuest?.id,
      itemId: item.itemId,
    });
  }

  /**
   * プレビューを更新
   */
  private updatePreview(): void {
    if (!this.previewText) {
      return;
    }

    if (!this.selectedQuest) {
      this.previewText.setText(UI_TEXT.SELECT_QUEST);
      this.deliverButton?.setEnabled(false);
      return;
    }

    if (!this.selectedItem) {
      this.previewText.setText(UI_TEXT.SELECT_ITEM);
      this.deliverButton?.setEnabled(false);
      return;
    }

    if (!this.contributionCalculator) {
      return;
    }

    // 貢献度プレビューを計算
    const preview = this.contributionCalculator.calculatePreview(
      this.selectedQuest,
      [this.selectedItem],
    );

    const previewText = `貢献度計算プレビュー:\n` +
      `  基本報酬: ${preview.baseReward}\n` +
      `  品質ボーナス(${this.selectedItem.quality}): +${preview.qualityBonus} (+${Math.round((preview.qualityModifier - 1) * 100)}%)\n` +
      `  合計: ${preview.totalContribution} 貢献度`;

    this.previewText.setText(previewText);
    this.deliverButton?.setEnabled(true);

    // CONTRIBUTION_PREVIEW_UPDATEDイベントを発行
    this.emitEvent(GameEventType.CONTRIBUTION_PREVIEW_UPDATED, {
      questId: this.selectedQuest.id,
      preview,
    });
  }

  /**
   * 納品実行
   */
  private onDeliver(): void {
    if (!this.canDeliver() || !this.selectedQuest || !this.selectedItem) {
      return;
    }

    if (!this.questService) {
      return;
    }

    // DELIVERY_STARTEDイベントを発行
    this.emitEvent(GameEventType.DELIVERY_STARTED, {
      questId: this.selectedQuest.id,
      itemId: this.selectedItem.itemId,
      enhancements: [],
    });

    // 納品を実行
    const result = this.questService.deliver(this.selectedQuest.id, [
      this.selectedItem,
    ]);

    if (result.success) {
      // 納品成功演出を表示
      this.showDeliveryResult(result);

      // 依頼パネルを更新
      this.updateQuestPanels();

      // DELIVERY_COMPLETEDイベントを発行
      this.emitEvent(GameEventType.DELIVERY_COMPLETED, {
        questId: this.selectedQuest.id,
        contribution: result.contribution,
        gold: result.gold,
        cardId: null,
      });

      // PROMOTION_GAUGE_UPDATEDイベントを発行
      this.emitEvent(GameEventType.PROMOTION_GAUGE_UPDATED, {
        current: result.newPromotionGauge,
        max: result.promotionGaugeMax,
        added: result.contribution,
      });

      // リセット
      this.reset();
    }
  }

  /**
   * 日終了処理
   */
  private onEndDay(): void {
    // DAY_END_REQUESTEDイベントを発行
    this.emitEvent(GameEventType.DAY_END_REQUESTED, {});

    // PHASE_TRANSITION_REQUESTEDイベントを発行
    this.emitEvent(GameEventType.PHASE_TRANSITION_REQUESTED, {
      from: 'delivery',
      to: 'dayEnd',
    });
  }

  /**
   * 納品結果を表示
   * @param result - 納品結果
   */
  private showDeliveryResult(result: DeliveryResult): void {
    if (!this.previewText) {
      return;
    }

    const resultText = `納品成功！\n` +
      `依頼: ${this.selectedQuest?.description}\n` +
      `獲得報酬:\n` +
      `  💫 貢献度: +${result.contribution}\n` +
      `  💰 お金: +${result.gold}G`;

    this.previewText.setText(resultText);
  }

  /**
   * 依頼パネルを更新
   */
  private updateQuestPanels(): void {
    this.createQuestPanels();
  }

  /**
   * リセット
   */
  private reset(): void {
    this.selectedQuest = null;
    this.selectedItem = null;

    if (this.previewText) {
      this.previewText.setText(UI_TEXT.SELECT_QUEST);
    }

    this.deliverButton?.setEnabled(false);
  }

  /**
   * 納品可能かチェック
   * @returns 納品可能な場合true
   */
  private canDeliver(): boolean {
    if (!this.selectedQuest || !this.selectedItem || !this.questService) {
      return false;
    }

    return this.questService.canDeliver(this.selectedQuest.id, [
      this.selectedItem,
    ]);
  }

  /**
   * キーボード入力を処理
   * @param event - キーボードイベント
   */
  private handleKeyboardInput(event: { key: string }): void {
    const { key } = event;

    switch (key) {
      case KEYBOARD_KEYS.DELIVER_UPPER:
      case KEYBOARD_KEYS.DELIVER_LOWER:
      case KEYBOARD_KEYS.CONFIRM:
        if (this.canDeliver()) {
          this.onDeliver();
        }
        break;
      case KEYBOARD_KEYS.END_UPPER:
      case KEYBOARD_KEYS.END_LOWER:
        this.onEndDay();
        break;
      case KEYBOARD_KEYS.CANCEL:
        this.reset();
        break;
    }
  }

  /**
   * イベントを安全に発行
   * @param eventType - イベントタイプ
   * @param payload - ペイロード
   */
  private emitEvent(eventType: string, payload: unknown): void {
    if (!this.eventBus) {
      return;
    }

    try {
      this.eventBus.emit(eventType, payload);
    } catch (error) {
      console.error(ERROR_MESSAGES.FAILED_TO_EMIT_EVENT, eventType, error);
    }
  }

  /**
   * 依頼パネルを全て破棄
   */
  private destroyQuestPanels(): void {
    for (const panel of this.questPanels) {
      panel?.destroy?.();
    }
    this.questPanels = [];
  }

  /**
   * キーボードリスナーを解除
   */
  private removeKeyboardListener(): void {
    if (this.keyboardHandler) {
      this.scene.input.keyboard.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * リソース解放
   */
  public destroy(): void {
    this.destroyQuestPanels();
    this.removeKeyboardListener();

    if (this.itemInventory) {
      this.itemInventory.destroy();
      this.itemInventory = null;
    }

    if (this.deliverButton) {
      this.deliverButton.destroy();
      this.deliverButton = null;
    }

    if (this.endDayButton) {
      this.endDayButton.destroy();
      this.endDayButton = null;
    }

    if (this.container) {
      this.container.destroy();
    }
  }
}
