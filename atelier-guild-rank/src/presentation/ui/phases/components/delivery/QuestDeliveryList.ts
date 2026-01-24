/**
 * QuestDeliveryListコンポーネント
 * TASK-0057 DeliveryPhaseUIリファクタリング
 *
 * @description
 * 納品対象の依頼一覧表示と選択を担当するコンポーネント
 */

import { Colors } from '@presentation/ui/theme';
import type Phaser from 'phaser';
import type { Quest, QuestDeliveryListCallbacks } from './types';

// =============================================================================
// 定数定義
// =============================================================================

/** UIレイアウト定数 */
const LAYOUT = {
  PANEL_WIDTH: 400,
  PANEL_HEIGHT: 90,
  PANEL_SPACING: 100,
  PANEL_OFFSET_X: 200,
} as const;

/** UIテキスト定数 */
const UI_TEXT = {
  NO_QUESTS: '納品可能な依頼がありません',
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
// 依頼パネルインターフェース
// =============================================================================

interface QuestPanel {
  quest: Quest;
  elements: Phaser.GameObjects.GameObject[];
  destroy: () => void;
}

// =============================================================================
// クラス定義
// =============================================================================

/**
 * 依頼リスト表示・選択コンポーネント
 */
export class QuestDeliveryList {
  private scene: Phaser.Scene;
  private callbacks: QuestDeliveryListCallbacks;
  private container: Phaser.GameObjects.Container;
  private questPanels: QuestPanel[] = [];
  private quests: Quest[] = [];
  private selectedQuestId: string | null = null;

  /**
   * コンストラクタ
   * @param scene - Phaserシーン
   * @param x - X座標
   * @param y - Y座標
   * @param callbacks - コールバック
   */
  constructor(scene: Phaser.Scene, x: number, y: number, callbacks: QuestDeliveryListCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.container = scene.add.container(x, y);
  }

  /**
   * UIコンポーネント初期化
   */
  public create(): void {
    // 初期状態では何も表示しない
  }

  /**
   * 依頼リストを設定
   * @param quests - 依頼配列
   */
  public setQuests(quests: Quest[]): void {
    // 既存パネルを破棄
    this.destroyQuestPanels();

    this.quests = quests;

    if (quests.length === 0) {
      // 空メッセージを表示
      this.showEmptyMessage();
      return;
    }

    // 依頼パネルを生成
    quests.forEach((quest, index) => {
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
  private createQuestPanel(quest: Quest, index: number): QuestPanel {
    const panelY = index * LAYOUT.PANEL_SPACING;
    const elements: Phaser.GameObjects.GameObject[] = [];

    // パネル背景
    const panelBg = this.scene.add.rectangle(
      LAYOUT.PANEL_OFFSET_X,
      panelY,
      LAYOUT.PANEL_WIDTH,
      LAYOUT.PANEL_HEIGHT,
      Colors.background.card,
      0.8,
    );
    panelBg.setStrokeStyle(2, Colors.border.primary);
    panelBg.setInteractive({ useHandCursor: true });
    panelBg.on('pointerdown', () => this.onQuestClick(quest));
    this.container.add(panelBg);
    elements.push(panelBg);

    // 依頼情報テキスト
    const questText = this.scene.add.text(
      20,
      panelY - 30,
      `${quest.description} - ${quest.clientName}`,
      UI_STYLES.LABEL,
    );
    this.container.add(questText);
    elements.push(questText);

    const requirementText = this.scene.add.text(
      20,
      panelY - 10,
      `要求: ${quest.requiredItem}`,
      UI_STYLES.DESCRIPTION,
    );
    this.container.add(requirementText);
    elements.push(requirementText);

    const rewardText = this.scene.add.text(
      20,
      panelY + 10,
      `報酬: 貢献度${quest.rewardContribution} + ${quest.rewardGold}G`,
      UI_STYLES.DESCRIPTION,
    );
    this.container.add(rewardText);
    elements.push(rewardText);

    const deadlineText = this.scene.add.text(
      300,
      panelY - 10,
      `期限: あと${quest.remainingDays}日`,
      UI_STYLES.DESCRIPTION,
    );
    this.container.add(deadlineText);
    elements.push(deadlineText);

    return {
      quest,
      elements,
      destroy: () => {
        for (const element of elements) {
          element.destroy();
        }
      },
    };
  }

  /**
   * 空メッセージを表示
   */
  private showEmptyMessage(): void {
    const emptyText = this.scene.add.text(0, 0, UI_TEXT.NO_QUESTS, UI_STYLES.DESCRIPTION);
    this.container.add(emptyText);
  }

  /**
   * 依頼クリック時の処理
   * @param quest - クリックされた依頼
   */
  private onQuestClick(quest: Quest): void {
    this.selectedQuestId = quest.id;
    this.callbacks.onQuestSelect(quest);
  }

  /**
   * 依頼を選択
   * @param questId - 依頼ID
   */
  public selectQuest(questId: string): void {
    this.selectedQuestId = questId;
  }

  /**
   * 選択中の依頼を取得
   * @returns 選択中の依頼またはnull
   */
  public getSelectedQuest(): Quest | null {
    if (!this.selectedQuestId) {
      return null;
    }
    return this.quests.find((q) => q.id === this.selectedQuestId) || null;
  }

  /**
   * 選択をクリア
   */
  public clearSelection(): void {
    this.selectedQuestId = null;
  }

  /**
   * 依頼数を取得
   * @returns 依頼数
   */
  public getQuestCount(): number {
    return this.quests.length;
  }

  /**
   * 依頼リストが空かどうか
   * @returns 空の場合true
   */
  public isEmpty(): boolean {
    return this.quests.length === 0;
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
   * 依頼パネルを全て破棄
   */
  private destroyQuestPanels(): void {
    for (const panel of this.questPanels) {
      panel.destroy();
    }
    this.questPanels = [];
  }

  /**
   * リソースを解放
   */
  public destroy(): void {
    this.destroyQuestPanels();
    this.container.destroy();
  }
}
