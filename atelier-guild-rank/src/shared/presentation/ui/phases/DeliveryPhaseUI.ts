/**
 * DeliveryPhaseUIコンポーネント
 * TASK-0025 納品フェーズUI / TASK-0057 DeliveryPhaseUIリファクタリング
 *
 * @description
 * 納品フェーズ全体のUI管理を担当。依頼一覧、アイテム選択、報酬プレビュー、納品実行を統合管理。
 * サブコンポーネント: QuestDeliveryList, ItemSelector, ContributionPreview, DeliveryResultPanel
 */

import { THEME } from '@presentation/ui/theme';
import type Phaser from 'phaser';
import { BaseComponent } from '../components/BaseComponent';
import {
  ContributionPreview,
  DeliveryResultPanel,
  type IContributionCalculator,
  type IEventBus,
  type IInventoryService,
  type IQuestService,
  type ItemInstance,
  ItemSelector,
  type Quest,
  QuestDeliveryList,
} from './components/delivery';

// =============================================================================
// 定数
// =============================================================================

const UI_LAYOUT = {
  // Issue #116: コンテンツコンテナが既にオフセット済みなので(0, 0)を使用
  COMPONENT_X: 0,
  COMPONENT_Y: 0,
  /** タイトルX座標（コンテンツ領域の視覚的中央） */
  TITLE_X: 440,
  /** タイトルY座標 */
  TITLE_Y: 20,
  /** サブコンポーネントの左余白 */
  CONTENT_PADDING_X: 20,
  QUEST_LIST_Y: 60,
  ITEM_SELECTOR_Y: 390,
  PREVIEW_Y: 300,
  /** 納品ボタンX座標 */
  BUTTON_X: 250,
  BUTTON_Y: 350,
  RESULT_PANEL_X: 400,
  RESULT_PANEL_Y: 250,
} as const;

const ERROR_MESSAGES = {
  EVENT_BUS_NOT_AVAILABLE: 'EventBus is not available in scene.data',
  QUEST_SERVICE_NOT_AVAILABLE: 'QuestService is not available',
  INVENTORY_SERVICE_NOT_AVAILABLE: 'InventoryService is not available',
  CONTRIBUTION_CALCULATOR_NOT_AVAILABLE: 'ContributionCalculator is not available',
  FAILED_TO_EMIT_EVENT: 'Failed to emit event:',
} as const;

const UI_TEXT = {
  PHASE_TITLE: '📦 納品フェーズ',
  DELIVER_BUTTON: '納品する',
} as const;

const UI_STYLES = {
  TITLE: {
    fontSize: `${THEME.sizes.xlarge}px`,
    color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
    fontFamily: THEME.fonts.primary,
    fontStyle: 'bold',
  },
  LABEL: {
    fontSize: `${THEME.sizes.medium}px`,
    color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
    fontFamily: THEME.fonts.primary,
  },
  BUTTON_LABEL: {
    fontSize: `${THEME.sizes.medium}px`,
    color: THEME.colors.textOnPrimary,
    fontFamily: THEME.fonts.primary,
    fontStyle: 'bold',
  },
} as const;

const KEYBOARD_KEYS = {
  DELIVER_UPPER: 'D',
  DELIVER_LOWER: 'd',
  CANCEL: 'Escape',
  CONFIRM: 'Enter',
} as const;

const GameEventType = {
  QUEST_SELECTED_FOR_DELIVERY: 'QUEST_SELECTED_FOR_DELIVERY',
  ITEM_SELECTED_FOR_DELIVERY: 'ITEM_SELECTED_FOR_DELIVERY',
  CONTRIBUTION_PREVIEW_UPDATED: 'CONTRIBUTION_PREVIEW_UPDATED',
  DELIVERY_STARTED: 'DELIVERY_STARTED',
  DELIVERY_COMPLETED: 'DELIVERY_COMPLETED',
  DAY_END_REQUESTED: 'DAY_END_REQUESTED',
  PROMOTION_GAUGE_UPDATED: 'PROMOTION_GAUGE_UPDATED',
  PHASE_TRANSITION_REQUESTED: 'PHASE_TRANSITION_REQUESTED',
} as const;

interface Button {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  destroy(): void;
}

// =============================================================================
// DeliveryPhaseUI
// =============================================================================

export class DeliveryPhaseUI extends BaseComponent {
  private eventBus: IEventBus | null = null;
  private questService: IQuestService | null = null;
  private inventoryService: IInventoryService | null = null;
  private contributionCalculator: IContributionCalculator | null = null;

  private questList: QuestDeliveryList | null = null;
  private itemSelector: ItemSelector | null = null;
  private contributionPreview: ContributionPreview | null = null;
  private resultPanel: DeliveryResultPanel | null = null;

  private deliverButton: Button | null = null;
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    // Issue #137: 親コンテナに追加されるため、シーンには直接追加しない
    super(scene, UI_LAYOUT.COMPONENT_X, UI_LAYOUT.COMPONENT_Y, { addToScene: false });
    this.initializeServices();
    this.create();
  }

  private initializeServices(): void {
    this.eventBus = this.scene.data.get('eventBus');
    if (!this.eventBus) console.warn(ERROR_MESSAGES.EVENT_BUS_NOT_AVAILABLE);
    this.questService = this.scene.data.get('questService');
    if (!this.questService) console.warn(ERROR_MESSAGES.QUEST_SERVICE_NOT_AVAILABLE);
    this.inventoryService = this.scene.data.get('inventoryService');
    if (!this.inventoryService) console.warn(ERROR_MESSAGES.INVENTORY_SERVICE_NOT_AVAILABLE);
    this.contributionCalculator = this.scene.data.get('contributionCalculator');
    if (!this.contributionCalculator)
      console.warn(ERROR_MESSAGES.CONTRIBUTION_CALCULATOR_NOT_AVAILABLE);
  }

  public create(): void {
    this.createTitle();
    this.createSubComponents();
    this.createButtons();
    this.setupKeyboardListener();
    this.loadInitialData();
  }

  private createTitle(): void {
    const title = this.scene.add.text(
      UI_LAYOUT.TITLE_X,
      UI_LAYOUT.TITLE_Y,
      UI_TEXT.PHASE_TITLE,
      UI_STYLES.TITLE,
    );
    title.setOrigin(0.5, 0);
    this.container.add(title);
  }

  private createSubComponents(): void {
    this.questList = new QuestDeliveryList(
      this.scene,
      UI_LAYOUT.CONTENT_PADDING_X,
      UI_LAYOUT.QUEST_LIST_Y,
      {
        onQuestSelect: (quest: Quest) => this.onQuestSelect(quest),
      },
    );
    this.questList.create();
    this.container.add(this.questList.getContainer());

    this.itemSelector = new ItemSelector(
      this.scene,
      UI_LAYOUT.CONTENT_PADDING_X,
      UI_LAYOUT.ITEM_SELECTOR_Y,
      {
        onItemSelect: (item: ItemInstance) => this.onItemSelect(item),
      },
    );
    this.itemSelector.create();
    this.container.add(this.itemSelector.getContainer());

    this.contributionPreview = new ContributionPreview(
      this.scene,
      UI_LAYOUT.CONTENT_PADDING_X,
      UI_LAYOUT.PREVIEW_Y,
    );
    this.contributionPreview.create();
    this.container.add(this.contributionPreview.getContainer());

    this.resultPanel = new DeliveryResultPanel(
      this.scene,
      UI_LAYOUT.RESULT_PANEL_X,
      UI_LAYOUT.RESULT_PANEL_Y,
      { onClose: () => this.onResultPanelClose() },
    );
    this.resultPanel.create();
  }

  private createButtons(): void {
    const deliverRect = this.scene.add.rectangle(
      UI_LAYOUT.BUTTON_X,
      UI_LAYOUT.BUTTON_Y,
      120,
      40,
      0x4caf50,
    );
    deliverRect.setInteractive({ useHandCursor: true });
    deliverRect.on('pointerdown', () => this.onDeliver());
    const deliverText = this.scene.add.text(
      UI_LAYOUT.BUTTON_X,
      UI_LAYOUT.BUTTON_Y,
      UI_TEXT.DELIVER_BUTTON,
      UI_STYLES.BUTTON_LABEL,
    );
    deliverText.setOrigin(0.5);
    this.container.add([deliverRect, deliverText]);

    this.deliverButton = {
      isEnabled: () => this.canDeliver(),
      setEnabled: (enabled: boolean) => {
        deliverRect.setAlpha(enabled ? 1 : 0.5);
        if (enabled) deliverRect.setInteractive({ useHandCursor: true });
        else deliverRect.disableInteractive();
      },
      destroy: () => {
        deliverRect.destroy();
        deliverText.destroy();
      },
    };

    this.deliverButton.setEnabled(false);
  }

  private loadInitialData(): void {
    if (this.questService && this.questList) {
      this.questList.setQuests(this.questService.getAcceptedQuests());
    }
    if (this.inventoryService && this.itemSelector) {
      this.itemSelector.setItems(this.inventoryService.getItems());
    }
  }

  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => this.handleKeyboardInput(event);
    this.scene?.input?.keyboard?.on('keydown', this.keyboardHandler);
  }

  private onQuestSelect(quest: Quest): void {
    this.updatePreview();
    this.emitEvent(GameEventType.QUEST_SELECTED_FOR_DELIVERY, { questId: quest.id });
  }

  private onItemSelect(item: ItemInstance): void {
    this.updatePreview();
    this.emitEvent(GameEventType.ITEM_SELECTED_FOR_DELIVERY, {
      questId: this.questList?.getSelectedQuest()?.id,
      itemId: item.itemId,
    });
  }

  private updatePreview(): void {
    const selectedQuest = this.questList?.getSelectedQuest() ?? null;
    const selectedItem = this.itemSelector?.getSelectedItem() ?? null;

    if (!selectedQuest) {
      this.contributionPreview?.showSelectQuestMessage();
      this.deliverButton?.setEnabled(false);
      return;
    }
    if (!selectedItem) {
      this.contributionPreview?.showSelectItemMessage();
      this.deliverButton?.setEnabled(false);
      return;
    }
    if (this.contributionCalculator) {
      const preview = this.contributionCalculator.calculatePreview(selectedQuest, [selectedItem]);
      this.contributionPreview?.update(selectedQuest, selectedItem, preview);
      this.deliverButton?.setEnabled(true);
      this.emitEvent(GameEventType.CONTRIBUTION_PREVIEW_UPDATED, {
        questId: selectedQuest.id,
        preview,
      });
    }
  }

  private onDeliver(): void {
    const selectedQuest = this.questList?.getSelectedQuest();
    const selectedItem = this.itemSelector?.getSelectedItem();
    if (!this.canDeliver() || !selectedQuest || !selectedItem || !this.questService) return;

    this.emitEvent(GameEventType.DELIVERY_STARTED, {
      questId: selectedQuest.id,
      itemId: selectedItem.itemId,
      enhancements: [],
    });

    const result = this.questService.deliver(selectedQuest.id, [selectedItem]);
    if (result.success) {
      this.resultPanel?.show(result, selectedQuest.description);
      this.refreshData();
      this.emitEvent(GameEventType.DELIVERY_COMPLETED, {
        questId: selectedQuest.id,
        contribution: result.contribution,
        gold: result.gold,
        cardId: null,
      });
      this.emitEvent(GameEventType.PROMOTION_GAUGE_UPDATED, {
        current: result.newPromotionGauge,
        max: result.promotionGaugeMax,
        added: result.contribution,
      });
      this.reset();
    }
  }

  private onResultPanelClose(): void {
    this.refreshData();
  }

  private refreshData(): void {
    if (this.questService && this.questList)
      this.questList.setQuests(this.questService.getAcceptedQuests());
    if (this.inventoryService && this.itemSelector)
      this.itemSelector.setItems(this.inventoryService.getItems());
  }

  private reset(): void {
    this.questList?.clearSelection();
    this.itemSelector?.clearSelection();
    this.contributionPreview?.showSelectQuestMessage();
    this.deliverButton?.setEnabled(false);
  }

  private canDeliver(): boolean {
    const selectedQuest = this.questList?.getSelectedQuest();
    const selectedItem = this.itemSelector?.getSelectedItem();
    if (!selectedQuest || !selectedItem || !this.questService) return false;
    return this.questService.canDeliver(selectedQuest.id, [selectedItem]);
  }

  private handleKeyboardInput(event: { key: string }): void {
    switch (event.key) {
      case KEYBOARD_KEYS.DELIVER_UPPER:
      case KEYBOARD_KEYS.DELIVER_LOWER:
      case KEYBOARD_KEYS.CONFIRM:
        if (this.canDeliver()) this.onDeliver();
        break;
      case KEYBOARD_KEYS.CANCEL:
        this.reset();
        break;
    }
  }

  private emitEvent(eventType: string, payload: unknown): void {
    if (!this.eventBus) return;
    try {
      this.eventBus.emit(eventType, payload);
    } catch (error) {
      console.error(ERROR_MESSAGES.FAILED_TO_EMIT_EVENT, eventType, error);
    }
  }

  private removeKeyboardListener(): void {
    if (this.keyboardHandler) {
      this.scene?.input?.keyboard?.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  public destroy(): void {
    this.removeKeyboardListener();
    this.questList?.destroy();
    this.itemSelector?.destroy();
    this.contributionPreview?.destroy();
    this.resultPanel?.destroy();
    this.deliverButton?.destroy();
    this.container?.destroy();
  }
}
