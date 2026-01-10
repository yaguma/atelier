/**
 * DeliveryContainer実装
 *
 * TASK-0232: DeliveryContainer設計
 * 納品フェーズコンテナを実装する。
 * 依頼リスト表示、納品可能な依頼の選択、報酬表示を行う。
 *
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0232.md
 */

import Phaser from 'phaser';
import { GamePhase, QuestType } from '../../../domain/common/types';
import { BasePhaseContainer } from './BasePhaseContainer';
import type {
  IDeliveryContainer,
  DeliveryContainerOptions,
  DeliveryResult,
} from './IDeliveryContainer';
import {
  DeliveryContainerLayout,
  DeliveryContainerColors,
} from './DeliveryContainerConstants';
import type { IActiveQuest } from '@domain/quest/QuestEntity';
import type { CraftedItem } from '@domain/item/ItemEntity';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';

/**
 * 依頼リストアイテムデータ
 */
interface QuestListItemData {
  container: Phaser.GameObjects.Container;
  quest: IActiveQuest;
  deliverable: boolean;
  bg: Phaser.GameObjects.Graphics;
}

/**
 * DeliveryContainerクラス
 *
 * 納品フェーズを管理するコンテナ。
 */
export class DeliveryContainer
  extends BasePhaseContainer
  implements IDeliveryContainer
{
  /** フェーズ種別 */
  public readonly phase = GamePhase.DELIVERY;

  /** 受注中の依頼リスト */
  private acceptedQuests: IActiveQuest[] = [];

  /** インベントリ（納品可否判定用） */
  private inventory: CraftedItem[] = [];

  /** 選択中の依頼 */
  private selectedQuest: IActiveQuest | null = null;

  // UI Components
  private questListItems: QuestListItemData[] = [];
  private detailPanel!: Phaser.GameObjects.Container;
  private detailBackground!: Phaser.GameObjects.Graphics;
  private detailTitle!: Phaser.GameObjects.Text;
  private detailContent!: Phaser.GameObjects.Text;
  private deliverButton!: Phaser.GameObjects.Container;
  private skipButton!: Phaser.GameObjects.Container;
  private emptyStateText?: Phaser.GameObjects.Text;

  // Callbacks
  private onDeliveryComplete?: (result: DeliveryResult) => void;
  private onSkip?: () => void;

  /**
   * コンストラクタ
   * @param options オプション
   */
  constructor(options: DeliveryContainerOptions) {
    super({
      scene: options.scene,
      eventBus: options.eventBus,
      x: options.x ?? 0,
      y: options.y ?? 0,
      width: DeliveryContainerLayout.WIDTH,
      height: DeliveryContainerLayout.HEIGHT,
    });

    this.onDeliveryComplete = options.onDeliveryComplete;
    this.onSkip = options.onSkip;
  }

  /**
   * コンテンツを作成
   */
  protected createContent(): void {
    this.createTitle('📦 納品フェーズ');
    this.createQuestListArea();
    this.createDetailPanel();
    this.createDeliveryActionButtons();
  }

  /**
   * 依頼リストエリアを作成
   */
  private createQuestListArea(): void {
    const { QUEST_LIST_AREA } = DeliveryContainerLayout;

    // エリアラベル
    const label = this.scene.add.text(
      QUEST_LIST_AREA.X,
      QUEST_LIST_AREA.Y - 25,
      '📋 受注中の依頼',
      {
        ...TextStyles.bodySmall,
        color: '#aaaaaa',
      }
    );
    this.container.add(label);

    // リスト背景
    const listBg = this.scene.add.graphics();
    listBg.fillStyle(0x1a1a3a, 0.8);
    listBg.fillRoundedRect(
      QUEST_LIST_AREA.X,
      QUEST_LIST_AREA.Y,
      QUEST_LIST_AREA.WIDTH,
      QUEST_LIST_AREA.HEIGHT,
      8
    );
    listBg.lineStyle(1, 0x3a3a5a);
    listBg.strokeRoundedRect(
      QUEST_LIST_AREA.X,
      QUEST_LIST_AREA.Y,
      QUEST_LIST_AREA.WIDTH,
      QUEST_LIST_AREA.HEIGHT,
      8
    );
    this.container.add(listBg);
  }

  /**
   * 詳細パネルを作成
   */
  private createDetailPanel(): void {
    const { DETAIL_PANEL } = DeliveryContainerLayout;

    // パネルコンテナ
    this.detailPanel = this.scene.add.container(DETAIL_PANEL.X, DETAIL_PANEL.Y);
    this.container.add(this.detailPanel);

    // 背景
    this.detailBackground = this.scene.add.graphics();
    this.detailBackground.fillStyle(0x1a1a3a, 0.8);
    this.detailBackground.fillRoundedRect(
      0,
      0,
      DETAIL_PANEL.WIDTH,
      DETAIL_PANEL.HEIGHT,
      8
    );
    this.detailBackground.lineStyle(1, 0x3a3a5a);
    this.detailBackground.strokeRoundedRect(
      0,
      0,
      DETAIL_PANEL.WIDTH,
      DETAIL_PANEL.HEIGHT,
      8
    );
    this.detailPanel.add(this.detailBackground);

    // タイトル
    this.detailTitle = this.scene.add.text(15, 15, '依頼を選択してください', {
      ...TextStyles.body,
      fontStyle: 'bold',
    });
    this.detailPanel.add(this.detailTitle);

    // 内容
    this.detailContent = this.scene.add.text(15, 50, '', {
      ...TextStyles.bodySmall,
      color: '#cccccc',
      wordWrap: { width: DETAIL_PANEL.WIDTH - 30 },
    });
    this.detailPanel.add(this.detailContent);
  }

  /**
   * アクションボタンを作成
   */
  private createDeliveryActionButtons(): void {
    const { ACTION_AREA, WIDTH } = DeliveryContainerLayout;
    const centerX = WIDTH / 2;

    // 納品ボタン
    this.deliverButton = this.createActionButton(
      centerX + 80,
      ACTION_AREA.Y,
      '📦 納品する',
      () => this.deliver(),
      true
    );
    this.deliverButton.setAlpha(0.5);
    this.container.add(this.deliverButton);

    // スキップボタン
    this.skipButton = this.createActionButton(
      centerX - 80,
      ACTION_AREA.Y,
      'スキップ',
      () => this.handleSkip(),
      false
    );
    this.container.add(this.skipButton);
  }

  /**
   * アクションボタンを作成するヘルパー
   */
  private createActionButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    primary: boolean
  ): Phaser.GameObjects.Container {
    const { ACTION_AREA } = DeliveryContainerLayout;
    const btn = this.scene.add.container(x, y);

    const halfWidth = ACTION_AREA.BUTTON_WIDTH / 2;
    const halfHeight = ACTION_AREA.BUTTON_HEIGHT / 2;

    const bg = this.scene.add.graphics();
    const bgColor = primary ? Colors.accent : 0x4a4a6a;
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(
      -halfWidth,
      -halfHeight,
      ACTION_AREA.BUTTON_WIDTH,
      ACTION_AREA.BUTTON_HEIGHT,
      8
    );
    btn.add(bg);

    const label = this.scene.add
      .text(0, 0, text, {
        ...TextStyles.body,
        fontSize: '14px',
      })
      .setOrigin(0.5);
    btn.add(label);

    btn.setInteractive(
      new Phaser.Geom.Rectangle(
        -halfWidth,
        -halfHeight,
        ACTION_AREA.BUTTON_WIDTH,
        ACTION_AREA.BUTTON_HEIGHT
      ),
      Phaser.Geom.Rectangle.Contains
    );

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(primary ? 0x7a7aff : 0x6a6a8a, 1);
      bg.fillRoundedRect(
        -halfWidth,
        -halfHeight,
        ACTION_AREA.BUTTON_WIDTH,
        ACTION_AREA.BUTTON_HEIGHT,
        8
      );
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(
        -halfWidth,
        -halfHeight,
        ACTION_AREA.BUTTON_WIDTH,
        ACTION_AREA.BUTTON_HEIGHT,
        8
      );
    });

    btn.on('pointerdown', onClick);

    return btn;
  }

  /**
   * 受注中の依頼を設定する
   */
  setAcceptedQuests(quests: IActiveQuest[]): void {
    this.acceptedQuests = quests;
    this.selectedQuest = null;
    this.updateQuestList();
    this.updateDetailPanel(null);
    this.updateDeliverButtonState();
  }

  /**
   * 受注中の依頼を取得する
   */
  getAcceptedQuests(): IActiveQuest[] {
    return [...this.acceptedQuests];
  }

  /**
   * インベントリを設定する
   */
  setInventory(items: CraftedItem[]): void {
    this.inventory = items;
    this.updateQuestList();
    this.updateDeliverButtonState();
  }

  /**
   * 依頼リストを更新
   */
  private updateQuestList(): void {
    // 既存のリストアイテムを破棄
    this.questListItems.forEach((item) => item.container.destroy());
    this.questListItems = [];

    // 空状態
    if (this.acceptedQuests.length === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();

    const { QUEST_LIST_AREA } = DeliveryContainerLayout;

    this.acceptedQuests.forEach((quest, index) => {
      const y =
        QUEST_LIST_AREA.Y +
        10 +
        index * (QUEST_LIST_AREA.ITEM_HEIGHT + QUEST_LIST_AREA.ITEM_SPACING);
      const itemData = this.createQuestListItem(
        quest,
        QUEST_LIST_AREA.X + 10,
        y
      );
      this.questListItems.push(itemData);
      this.container.add(itemData.container);
    });
  }

  /**
   * 依頼リストアイテムを作成
   */
  private createQuestListItem(
    activeQuest: IActiveQuest,
    x: number,
    y: number
  ): QuestListItemData {
    const { QUEST_LIST_AREA } = DeliveryContainerLayout;
    const itemWidth = QUEST_LIST_AREA.WIDTH - 20;
    const itemHeight = QUEST_LIST_AREA.ITEM_HEIGHT;
    const itemContainer = this.scene.add.container(x, y);

    const deliverable = this.canDeliver(activeQuest);
    const quest = activeQuest.quest;

    // 背景
    const bg = this.scene.add.graphics();
    this.drawQuestItemBackground(bg, itemWidth, itemHeight, deliverable, false);
    itemContainer.add(bg);

    // 納品可能インジケーター
    const indicator = this.scene.add.text(10, 10, deliverable ? '✅' : '⏳', {
      fontSize: '16px',
    });
    itemContainer.add(indicator);

    // 依頼名（conditionからタイプを表示）
    const questName = this.getQuestDisplayName(quest);
    const nameText = this.scene.add.text(40, 10, questName, {
      ...TextStyles.body,
      fontSize: '14px',
      fontStyle: 'bold',
    });
    itemContainer.add(nameText);

    // 期限
    const deadlineColor =
      activeQuest.remainingDays <= 3 ? '#ff4444' : '#aaaaaa';
    const deadlineText = this.scene.add.text(
      40,
      35,
      `残り ${activeQuest.remainingDays} 日`,
      {
        ...TextStyles.bodySmall,
        color: deadlineColor,
      }
    );
    itemContainer.add(deadlineText);

    // 報酬
    const rewardText = this.scene.add
      .text(itemWidth - 10, 25, `${quest.gold}G`, {
        ...TextStyles.body,
        fontSize: '12px',
        color: '#ffd700',
      })
      .setOrigin(1, 0);
    itemContainer.add(rewardText);

    // インタラクション
    itemContainer.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, itemWidth, itemHeight),
      Phaser.Geom.Rectangle.Contains
    );

    itemContainer.on('pointerover', () => {
      if (this.selectedQuest !== activeQuest) {
        this.drawQuestItemBackground(
          bg,
          itemWidth,
          itemHeight,
          deliverable,
          false,
          true
        );
      }
    });

    itemContainer.on('pointerout', () => {
      const isSelected = this.selectedQuest === activeQuest;
      this.drawQuestItemBackground(
        bg,
        itemWidth,
        itemHeight,
        deliverable,
        isSelected
      );
    });

    itemContainer.on('pointerdown', () => {
      this.selectQuest(activeQuest);
    });

    return {
      container: itemContainer,
      quest: activeQuest,
      deliverable,
      bg,
    };
  }

  /**
   * 依頼アイテムの背景を描画
   */
  private drawQuestItemBackground(
    bg: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    deliverable: boolean,
    selected: boolean,
    hover: boolean = false
  ): void {
    bg.clear();

    let fillColor: number;
    let strokeColor: number;
    let alpha: number;

    if (selected) {
      fillColor = Colors.accent;
      strokeColor = Colors.accent;
      alpha = DeliveryContainerColors.SELECTED_ALPHA;
    } else if (hover) {
      fillColor = deliverable
        ? DeliveryContainerColors.DELIVERABLE_HOVER_BG
        : DeliveryContainerColors.UNDELIVERABLE_HOVER_BG;
      strokeColor = deliverable
        ? DeliveryContainerColors.DELIVERABLE_HOVER_BORDER
        : DeliveryContainerColors.UNDELIVERABLE_HOVER_BORDER;
      alpha = DeliveryContainerColors.NORMAL_ALPHA;
    } else {
      fillColor = deliverable
        ? DeliveryContainerColors.DELIVERABLE_BG
        : DeliveryContainerColors.UNDELIVERABLE_BG;
      strokeColor = deliverable
        ? DeliveryContainerColors.DELIVERABLE_BORDER
        : DeliveryContainerColors.UNDELIVERABLE_BORDER;
      alpha = DeliveryContainerColors.NORMAL_ALPHA;
    }

    bg.fillStyle(fillColor, alpha);
    bg.fillRoundedRect(0, 0, width, height, 8);
    bg.lineStyle(selected ? 2 : 1, strokeColor);
    bg.strokeRoundedRect(0, 0, width, height, 8);
  }

  /**
   * 依頼の表示名を取得
   */
  private getQuestDisplayName(quest: IActiveQuest['quest']): string {
    const condition = quest.condition;
    if (condition.type === QuestType.SPECIFIC && condition.itemId) {
      return `納品依頼: ${condition.itemId}`;
    }
    return `依頼 #${quest.id.slice(-4)}`;
  }

  /**
   * 空状態を表示
   */
  private showEmptyState(): void {
    if (this.emptyStateText) return;

    const { QUEST_LIST_AREA } = DeliveryContainerLayout;
    this.emptyStateText = this.scene.add
      .text(
        QUEST_LIST_AREA.X + QUEST_LIST_AREA.WIDTH / 2,
        QUEST_LIST_AREA.Y + QUEST_LIST_AREA.HEIGHT / 2,
        '受注中の依頼はありません',
        {
          ...TextStyles.body,
          fontSize: '14px',
          color: '#666666',
        }
      )
      .setOrigin(0.5);
    this.container.add(this.emptyStateText);
  }

  /**
   * 空状態を非表示
   */
  private hideEmptyState(): void {
    if (this.emptyStateText) {
      this.emptyStateText.destroy();
      this.emptyStateText = undefined;
    }
  }

  /**
   * 選択中の依頼を取得する
   */
  getSelectedQuest(): IActiveQuest | null {
    return this.selectedQuest;
  }

  /**
   * 依頼を選択する
   */
  selectQuest(quest: IActiveQuest): void {
    this.selectedQuest = quest;

    // リストの表示更新
    const { QUEST_LIST_AREA } = DeliveryContainerLayout;
    const itemWidth = QUEST_LIST_AREA.WIDTH - 20;
    const itemHeight = QUEST_LIST_AREA.ITEM_HEIGHT;

    this.questListItems.forEach((item) => {
      const isSelected = item.quest === quest;
      this.drawQuestItemBackground(
        item.bg,
        itemWidth,
        itemHeight,
        item.deliverable,
        isSelected
      );
    });

    // 詳細パネル更新
    this.updateDetailPanel(quest);

    // ボタン状態更新
    this.updateDeliverButtonState();

    // イベント発火
    this.eventBus.emit('delivery:quest:selected' as any, { quest });
  }

  /**
   * 詳細パネルを更新
   */
  private updateDetailPanel(quest: IActiveQuest | null): void {
    // UIが初期化されていない場合は何もしない
    if (!this.detailTitle || !this.detailContent) {
      return;
    }

    if (!quest) {
      this.detailTitle.setText('依頼を選択してください');
      this.detailContent.setText('');
      return;
    }

    const q = quest.quest;
    const deliverable = this.canDeliver(quest);

    this.detailTitle.setText(this.getQuestDisplayName(q));

    const lines = [
      `難易度: ${this.getDifficultyLabel(q.difficulty)}`,
      `残り日数: ${quest.remainingDays} 日`,
      '',
      `報酬金: ${q.gold}G`,
      `貢献度: ${q.contribution}`,
      '',
      `フレーバー: ${q.flavorText || 'なし'}`,
      '',
      deliverable
        ? '✅ 納品可能です'
        : '⏳ 必要なアイテムが不足しています',
    ];

    this.detailContent.setText(lines.join('\n'));
  }

  /**
   * 難易度ラベルを取得
   */
  private getDifficultyLabel(
    difficulty: 'easy' | 'normal' | 'hard' | 'extreme'
  ): string {
    const labels: Record<string, string> = {
      easy: '★☆☆☆ 簡単',
      normal: '★★☆☆ 普通',
      hard: '★★★☆ 難しい',
      extreme: '★★★★ 極難',
    };
    return labels[difficulty] || difficulty;
  }

  /**
   * 納品可否を判定する
   */
  canDeliver(quest: IActiveQuest): boolean {
    const condition = quest.quest.condition;

    // SPECIFIC以外のタイプは常にtrue（現時点では簡易実装）
    if (condition.type !== QuestType.SPECIFIC) {
      return true;
    }

    // 要求アイテムがあるか確認
    if (!condition.itemId || !condition.quantity) {
      return true;
    }

    // インベントリから要求アイテムを検索（itemIdで比較）
    const matchingItems = this.inventory.filter(
      (item) => item.id === condition.itemId || item.itemId === condition.itemId
    );

    return matchingItems.length >= (condition.quantity || 1);
  }

  /**
   * 納品可能な依頼リストを取得
   */
  getDeliverableQuests(): IActiveQuest[] {
    return this.acceptedQuests.filter((q) => this.canDeliver(q));
  }

  /**
   * 納品ボタン状態を更新
   */
  private updateDeliverButtonState(): void {
    // UIが初期化されていない場合は何もしない
    if (!this.deliverButton) {
      return;
    }
    const canDeliver = this.selectedQuest && this.canDeliver(this.selectedQuest);
    this.deliverButton.setAlpha(canDeliver ? 1 : 0.5);
  }

  /**
   * 納品を実行する
   */
  async deliver(): Promise<void> {
    if (!this.selectedQuest || !this.canDeliver(this.selectedQuest)) {
      return;
    }

    const quest = this.selectedQuest;
    const q = quest.quest;

    // 操作無効化
    this.setButtonsEnabled(false);

    // 納品アニメーション（簡易）
    await this.playDeliveryAnimation();

    // 結果生成
    const result: DeliveryResult = {
      quest,
      deliveredItems: this.getDeliveredItems(quest),
      rewards: {
        gold: q.gold,
        contribution: q.contribution,
        rewardCards: undefined, // TASK-0233で実装
      },
    };

    // イベント発火
    this.eventBus.emit('delivery:complete' as any, result);

    // コールバック
    if (this.onDeliveryComplete) {
      this.onDeliveryComplete(result);
    }

    // 操作再有効化
    this.setButtonsEnabled(true);
  }

  /**
   * 納品するアイテムを取得
   */
  private getDeliveredItems(quest: IActiveQuest): CraftedItem[] {
    const condition = quest.quest.condition;
    if (condition.type !== QuestType.SPECIFIC || !condition.itemId) {
      return [];
    }

    const quantity = condition.quantity || 1;
    return this.inventory
      .filter(
        (item) =>
          item.id === condition.itemId || item.itemId === condition.itemId
      )
      .slice(0, quantity);
  }

  /**
   * 納品アニメーションを再生
   */
  private async playDeliveryAnimation(): Promise<void> {
    return new Promise((resolve) => {
      this.scene.time.delayedCall(500, resolve);
    });
  }

  /**
   * スキップ処理
   */
  private handleSkip(): void {
    this.eventBus.emit('delivery:skip' as any, {});
    if (this.onSkip) {
      this.onSkip();
    }
  }

  /**
   * ボタンの有効/無効を設定
   */
  private setButtonsEnabled(enabled: boolean): void {
    // UIが初期化されていない場合は何もしない
    if (!this.deliverButton || !this.skipButton) {
      return;
    }
    this.deliverButton.setAlpha(enabled ? 1 : 0.5);
    this.skipButton.setAlpha(enabled ? 1 : 0.5);
  }

  // =====================================================
  // BasePhaseContainer抽象メソッドの実装
  // =====================================================

  /**
   * フェーズ開始時の処理
   */
  protected async onEnter(): Promise<void> {
    this.selectedQuest = null;
    this.updateDetailPanel(null);
    this.updateDeliverButtonState();
  }

  /**
   * フェーズ終了時の処理
   */
  protected async onExit(): Promise<void> {
    // 特に追加処理なし
  }

  /**
   * 毎フレーム更新処理
   */
  protected onUpdate(_delta: number): void {
    // 特に追加処理なし
  }

  /**
   * 完了時の結果データを取得
   */
  protected getCompletionResult(): DeliveryResult | null {
    if (!this.selectedQuest || !this.canDeliver(this.selectedQuest)) {
      return null;
    }

    const quest = this.selectedQuest;
    const q = quest.quest;

    return {
      quest,
      deliveredItems: this.getDeliveredItems(quest),
      rewards: {
        gold: q.gold,
        contribution: q.contribution,
        rewardCards: undefined,
      },
    };
  }

  /**
   * 完了可能かどうか
   */
  canComplete(): boolean {
    return this.getDeliverableQuests().length > 0;
  }

  /**
   * 破棄
   */
  destroy(): void {
    this.questListItems.forEach((item) => item.container.destroy());
    this.detailPanel?.destroy();
    super.destroy();
  }
}
