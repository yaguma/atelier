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
import type { Card } from '@domain/card/Card';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';
import { RewardCardSelector } from '../reward/RewardCardSelector';

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
      this.showCannotDeliverFeedback();
      return;
    }

    const quest = this.selectedQuest;
    const q = quest.quest;

    // 操作無効化
    this.setButtonsEnabled(false);

    // 納品アニメーション
    await this.playDeliveryAnimation();

    // 結果生成
    const result: DeliveryResult = {
      quest,
      deliveredItems: this.getDeliveredItems(quest),
      rewards: {
        gold: q.gold,
        contribution: q.contribution,
        rewardCards: undefined, // 報酬カードは依頼データから取得（将来実装）
      },
    };

    // イベント発火
    this.eventBus.emit('delivery:complete' as any, result);

    // 報酬カード選択（あれば）
    if (result.rewards.rewardCards && result.rewards.rewardCards.length > 0) {
      await this.showRewardCardSelection(result.rewards.rewardCards);
    }

    // 成功表示
    await this.showDeliverySuccess(result);

    // 依頼リストから削除
    this.removeDeliveredQuest(quest);

    // 操作再有効化
    this.setButtonsEnabled(true);

    // コールバック
    if (this.onDeliveryComplete) {
      this.onDeliveryComplete(result);
    }
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
    const centerX = DeliveryContainerLayout.WIDTH / 2;
    const centerY = DeliveryContainerLayout.HEIGHT / 2;

    // 納品アイテムの取得
    const items = this.selectedQuest ? this.getDeliveredItems(this.selectedQuest) : [];

    // アイテムが飛んでいくアニメーション
    const itemPromises = items.slice(0, 3).map((item, index) =>
      this.animateItemDelivery(item, index, centerX, centerY)
    );

    await Promise.all(itemPromises);

    // チェックマークエフェクト
    await this.playCheckmarkEffect(centerX, centerY);
  }

  /**
   * アイテム納品アニメーション
   */
  private animateItemDelivery(
    _item: CraftedItem,
    index: number,
    _targetX: number,
    _targetY: number
  ): Promise<void> {
    return new Promise((resolve) => {
      // アイテムの開始位置
      const startX = 200;
      const startY = 200 + index * 40;

      // アイテムアイコン
      const itemIcon = this.scene.add.text(startX, startY, '📦', {
        fontSize: '32px',
      }).setOrigin(0.5);
      this.container.add(itemIcon);

      // 右側へ飛んでいく
      const targetOffsetX = 400;

      this.scene.tweens.add({
        targets: itemIcon,
        x: startX + targetOffsetX,
        alpha: 0,
        duration: 600,
        delay: index * 150,
        ease: 'Power2.easeIn',
        onComplete: () => {
          // パーティクル
          this.createDeliveryParticle(startX + targetOffsetX, startY);
          itemIcon.destroy();
          resolve();
        },
      });
    });
  }

  /**
   * 納品パーティクル作成
   */
  private createDeliveryParticle(x: number, y: number): void {
    // 星のパーティクル
    for (let i = 0; i < 5; i++) {
      const star = this.scene.add.text(x, y, '✨', {
        fontSize: '16px',
      }).setOrigin(0.5);
      this.container.add(star);

      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 30;

      this.scene.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        ease: 'Power2',
        onComplete: () => star.destroy(),
      });
    }
  }

  /**
   * チェックマークエフェクト
   */
  private async playCheckmarkEffect(x: number, y: number): Promise<void> {
    return new Promise((resolve) => {
      // 円形の背景
      const circle = this.scene.add.graphics();
      circle.fillStyle(0x00aa00, 0.9);
      circle.fillCircle(x, y, 0);
      this.container.add(circle);

      // 拡大
      this.scene.tweens.add({
        targets: { scale: 0 },
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut',
        onUpdate: (_tween, target) => {
          const scale = target.scale;
          circle.clear();
          circle.fillStyle(0x00aa00, 0.9);
          circle.fillCircle(x, y, 40 * scale);
        },
      });

      // チェックマーク
      const check = this.scene.add.text(x, y, '✓', {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      check.setAlpha(0);
      check.setScale(0);
      this.container.add(check);

      this.scene.time.delayedCall(150, () => {
        this.scene.tweens.add({
          targets: check,
          alpha: 1,
          scale: 1,
          duration: 200,
          ease: 'Back.easeOut',
          onComplete: () => {
            // フェードアウト
            this.scene.time.delayedCall(500, () => {
              this.scene.tweens.add({
                targets: [circle, check],
                alpha: 0,
                scale: 1.5,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                  circle.destroy();
                  check.destroy();
                  resolve();
                },
              });
            });
          },
        });
      });
    });
  }

  /**
   * 報酬表示ダイアログ
   */
  private async showDeliverySuccess(result: DeliveryResult): Promise<void> {
    return new Promise((resolve) => {
      const centerX = DeliveryContainerLayout.WIDTH / 2;
      const centerY = DeliveryContainerLayout.HEIGHT / 2;

      // 報酬パネル
      const panel = this.scene.add.container(centerX, centerY);

      // 背景
      const bg = this.scene.add.graphics();
      bg.fillStyle(0x1a1a3a, 0.95);
      bg.fillRoundedRect(-180, -120, 360, 240, 12);
      bg.lineStyle(2, 0xffd700);
      bg.strokeRoundedRect(-180, -120, 360, 240, 12);
      panel.add(bg);

      // タイトル
      const title = this.scene.add.text(0, -90, '🎉 納品完了！ 🎉', {
        ...TextStyles.titleSmall,
        fontSize: '22px',
        color: '#ffd700',
      }).setOrigin(0.5);
      panel.add(title);

      // 依頼名
      const questName = this.scene.add.text(
        0,
        -50,
        this.getQuestDisplayName(result.quest.quest),
        {
          ...TextStyles.body,
          fontSize: '16px',
        }
      ).setOrigin(0.5);
      panel.add(questName);

      // 報酬タイトル
      const rewardTitle = this.scene.add.text(0, -15, '― 報酬 ―', {
        ...TextStyles.body,
        fontSize: '12px',
        color: '#aaaaaa',
      }).setOrigin(0.5);
      panel.add(rewardTitle);

      // ゴールド
      const goldText = this.scene.add.text(-60, 15, `💰 ${result.rewards.gold} G`, {
        ...TextStyles.body,
        fontSize: '18px',
        color: '#ffd700',
      }).setOrigin(0, 0);
      panel.add(goldText);

      // 貢献度
      const contribText = this.scene.add.text(-60, 45, `⭐ ${result.rewards.contribution}`, {
        ...TextStyles.body,
        fontSize: '18px',
        color: '#00aaff',
      }).setOrigin(0, 0);
      panel.add(contribText);

      // カード報酬があれば表示
      if (result.rewards.rewardCards && result.rewards.rewardCards.length > 0) {
        const cardText = this.scene.add.text(
          -60,
          75,
          `🃏 カード x${result.rewards.rewardCards.length}`,
          {
            ...TextStyles.body,
            fontSize: '14px',
            color: '#aa88ff',
          }
        ).setOrigin(0, 0);
        panel.add(cardText);
      }

      // 閉じるボタン
      const closeBtn = this.scene.add.text(0, 100, '[ OK ]', {
        ...TextStyles.body,
        fontSize: '16px',
        color: '#aaaaaa',
      }).setOrigin(0.5).setInteractive();

      closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
      closeBtn.on('pointerout', () => closeBtn.setColor('#aaaaaa'));
      closeBtn.on('pointerdown', () => {
        this.scene.tweens.add({
          targets: panel,
          alpha: 0,
          scale: 0.8,
          duration: 200,
          onComplete: () => {
            panel.destroy();
            resolve();
          },
        });
      });
      panel.add(closeBtn);

      // 出現アニメーション
      panel.setAlpha(0);
      panel.setScale(0.8);
      this.container.add(panel);

      this.scene.tweens.add({
        targets: panel,
        alpha: 1,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut',
      });

      // 報酬カウントアップアニメーション
      this.animateRewardCountUp(goldText, 0, result.rewards.gold, '💰', 'G');
      this.animateRewardCountUp(contribText, 0, result.rewards.contribution, '⭐', '', 200);
    });
  }

  /**
   * 報酬カウントアップアニメーション
   */
  private animateRewardCountUp(
    textObject: Phaser.GameObjects.Text,
    from: number,
    to: number,
    prefix: string,
    suffix: string,
    delay: number = 0
  ): void {
    this.scene.time.delayedCall(delay, () => {
      const duration = 1000;
      const startTime = this.scene.time.now;

      const updateText = () => {
        const elapsed = this.scene.time.now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.floor(from + (to - from) * eased);

        textObject.setText(`${prefix} ${current} ${suffix}`);

        if (progress < 1) {
          this.scene.time.delayedCall(16, updateText);
        }
      };

      updateText();
    });
  }

  /**
   * 報酬カード選択UIを表示
   */
  private async showRewardCardSelection(cards: Card[]): Promise<Card> {
    return new Promise((resolve) => {
      const selector = new RewardCardSelector({
        scene: this.scene,
        cards: cards,
        title: '🎁 報酬カードを1枚選択',
        onSelect: (card) => {
          selector.destroy();
          this.eventBus.emit('delivery:reward:card:selected' as any, { card });
          resolve(card);
        },
      });
    });
  }

  /**
   * 納品済み依頼をリストから削除
   */
  private removeDeliveredQuest(quest: IActiveQuest): void {
    this.acceptedQuests = this.acceptedQuests.filter((q) => q !== quest);
    this.selectedQuest = null;
    this.updateQuestList();
    this.updateDetailPanel(null);
    this.updateDeliverButtonState();

    // 次の納品可能依頼を自動選択
    const deliverableQuests = this.getDeliverableQuests();
    if (deliverableQuests.length > 0) {
      this.selectQuest(deliverableQuests[0]);
    }
  }

  /**
   * 納品不可フィードバック
   */
  private showCannotDeliverFeedback(): void {
    // ボタン揺れアニメーション
    if (this.deliverButton) {
      const originalX = this.deliverButton.x;
      this.scene.tweens.add({
        targets: this.deliverButton,
        x: originalX + 5,
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.deliverButton.x = originalX;
        },
      });
    }

    // メッセージ表示
    const message = this.scene.add.text(
      DeliveryContainerLayout.WIDTH / 2,
      DeliveryContainerLayout.ACTION_AREA.Y - 30,
      '納品に必要なアイテムが不足しています',
      { ...TextStyles.body, fontSize: '12px', color: '#ff4444' }
    ).setOrigin(0.5);
    this.container.add(message);

    this.scene.tweens.add({
      targets: message,
      y: message.y - 20,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => message.destroy(),
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
