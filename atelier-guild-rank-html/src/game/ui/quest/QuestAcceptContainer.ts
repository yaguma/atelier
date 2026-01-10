/**
 * QuestAcceptContainer実装
 *
 * 依頼受注フェーズのコンテナクラス。
 * 利用可能な依頼の一覧表示と受注操作を行う。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0216.md
 */

import Phaser from 'phaser';
import { GamePhase } from '../../../domain/common/types';
import { Quest } from '../../../domain/quest/QuestEntity';
import { BasePhaseContainer } from '../phase/BasePhaseContainer';
import type { PhaseContainerConfig } from '../phase/IPhaseContainer';
import { QuestPanel } from './QuestPanel';
import { Colors } from '../../config/ColorPalette';
import { TextStyles } from '../../config/TextStyles';

/**
 * QuestAcceptContainer設定
 */
export interface QuestAcceptContainerConfig extends PhaseContainerConfig {
  /** 依頼受注時のコールバック */
  onQuestAccepted?: (quest: Quest) => void;
  /** スキップ時のコールバック */
  onSkip?: () => void;
}

/**
 * QuestAcceptContainerクラス
 *
 * 依頼受注フェーズのUIコンテナ。
 * 利用可能な依頼リストの表示と、依頼の選択・受注を管理する。
 */
export class QuestAcceptContainer extends BasePhaseContainer {
  // =====================================================
  // 抽象プロパティの実装
  // =====================================================

  public readonly phase: GamePhase = GamePhase.QUEST_ACCEPT;

  // =====================================================
  // プライベートプロパティ
  // =====================================================

  /** 利用可能な依頼リスト */
  private availableQuests: Quest[] = [];

  /** 選択中の依頼 */
  private selectedQuest: Quest | null = null;

  /** 受注した依頼 */
  private acceptedQuest: Quest | null = null;

  // UI要素
  private questListContainer!: Phaser.GameObjects.Container;
  private questPanel!: QuestPanel;
  private skipButton!: Phaser.GameObjects.Container;

  // コールバック
  private onQuestAccepted?: (quest: Quest) => void;
  private onSkip?: () => void;

  // =====================================================
  // コンストラクタ
  // =====================================================

  constructor(config: QuestAcceptContainerConfig) {
    super(config);
    this.onQuestAccepted = config.onQuestAccepted;
    this.onSkip = config.onSkip;
  }

  // =====================================================
  // 公開API
  // =====================================================

  /**
   * 利用可能な依頼リストを設定する
   * @param quests 依頼リスト
   */
  setAvailableQuests(quests: Quest[]): void {
    this.availableQuests = quests;
    this.updateQuestList();
  }

  /**
   * 選択中の依頼を取得する
   * @returns 選択中の依頼、または null
   */
  getSelectedQuest(): Quest | null {
    return this.selectedQuest;
  }

  /**
   * 依頼を選択する
   * @param quest 選択する依頼
   */
  selectQuest(quest: Quest): void {
    this.selectedQuest = quest;
    this.questPanel?.setQuest(quest);
    this.updateQuestListHighlight();
  }

  /**
   * 選択中の依頼を受注する
   */
  acceptSelectedQuest(): void {
    if (!this.selectedQuest) return;

    this.acceptedQuest = this.selectedQuest;

    if (this.onQuestAccepted) {
      this.onQuestAccepted(this.selectedQuest);
    }
  }

  /**
   * 依頼を受けずにスキップする
   */
  skip(): void {
    this.acceptedQuest = null;

    if (this.onSkip) {
      this.onSkip();
    }
  }

  // =====================================================
  // BasePhaseContainer実装
  // =====================================================

  protected createContent(): void {
    this.createTitle('📋 依頼受注');
    this.createDescription(
      'ギルドの依頼ボードから依頼を選択して受注しましょう。\n複数の依頼を同時に受けることができます。',
      50
    );

    this.createQuestListArea();
    this.createQuestDetailArea();
    this.createActionArea();
  }

  protected async onEnter(): Promise<void> {
    // フェーズ開始時の処理
    this.selectedQuest = null;
    this.acceptedQuest = null;
    this.questPanel?.setQuest(null);

    // 依頼リストを更新
    this.updateQuestList();
  }

  protected async onExit(): Promise<void> {
    // フェーズ終了時の処理
    this.clearState();
    this.selectedQuest = null;
  }

  protected onUpdate(_delta: number): void {
    // 毎フレーム処理（必要に応じて）
  }

  protected getCompletionResult(): unknown {
    return {
      acceptedQuest: this.acceptedQuest,
    };
  }

  canComplete(): boolean {
    // スキップも完了として扱う
    return true;
  }

  // =====================================================
  // UI作成
  // =====================================================

  private createQuestListArea(): void {
    // 依頼リストエリア（左側）
    this.questListContainer = this.scene.add.container(20, 100);

    // エリア背景
    const listBg = this.scene.add.graphics();
    listBg.fillStyle(0x1a1a2e, 0.8);
    listBg.fillRoundedRect(0, 0, 350, 350, 8);
    this.questListContainer.add(listBg);

    // ヘッダー
    const header = this.scene.add.text(10, 10, '利用可能な依頼', {
      ...TextStyles.body,
      fontSize: '14px',
      fontStyle: 'bold',
    });
    this.questListContainer.add(header);

    this.container.add(this.questListContainer);
  }

  private createQuestDetailArea(): void {
    // 依頼詳細エリア（右側）
    this.questPanel = new QuestPanel(this.scene, {
      x: 400,
      y: 100,
      width: 380,
      height: 350,
      onAccept: (quest) => this.handleQuestAccept(quest),
    });
    this.container.add(this.questPanel.container);
  }

  private createActionArea(): void {
    // スキップボタン
    this.skipButton = this.createButton(
      this.width / 2,
      this.height - 40,
      '依頼を受けずに次へ',
      () => this.handleSkip(),
      false
    );
    this.container.add(this.skipButton);
  }

  // =====================================================
  // 依頼リスト更新
  // =====================================================

  private updateQuestList(): void {
    // コンテナが初期化されていない場合は何もしない
    if (!this.questListContainer) return;

    // 既存のリストアイテムをクリア（ヘッダー以外）
    this.clearQuestListItems();

    this.availableQuests.forEach((quest, index) => {
      const item = this.createQuestListItem(quest, index);
      this.questListContainer.add(item);
    });
  }

  private clearQuestListItems(): void {
    // コンテナが初期化されていない場合は何もしない
    if (!this.questListContainer) return;

    // ヘッダー（背景とタイトル）以外を削除
    // 背景(0)とヘッダーテキスト(1)を残す
    while (this.questListContainer.length > 2) {
      const item = this.questListContainer.getAt(this.questListContainer.length - 1);
      if (item && typeof (item as any).destroy === 'function') {
        (item as any).destroy();
      }
      this.questListContainer.removeAt(this.questListContainer.length - 1);
    }
  }

  private createQuestListItem(quest: Quest, index: number): Phaser.GameObjects.Container {
    const y = 40 + index * 60;
    const itemContainer = this.scene.add.container(10, y);

    // 背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2a2a4a, 0.9);
    bg.fillRoundedRect(0, 0, 330, 55, 6);
    itemContainer.add(bg);

    // 依頼名
    const nameText = this.scene.add.text(10, 8, quest.flavorText || '依頼', {
      ...TextStyles.body,
      fontSize: '13px',
    });
    itemContainer.add(nameText);

    // 期限
    const deadlineText = this.scene.add.text(10, 30, `期限: ${quest.deadline}日`, {
      ...TextStyles.bodySmall,
      fontSize: '11px',
      color: '#aaaaaa',
    });
    itemContainer.add(deadlineText);

    // 報酬
    const rewardText = this.scene.add.text(200, 20, `💰${quest.gold}`, {
      ...TextStyles.bodySmall,
      fontSize: '11px',
      color: '#ffd700',
    });
    itemContainer.add(rewardText);

    // インタラクション
    itemContainer.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 330, 55),
      Phaser.Geom.Rectangle.Contains
    );
    itemContainer.on('pointerdown', () => this.selectQuest(quest));
    itemContainer.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x3a3a5a, 0.9);
      bg.fillRoundedRect(0, 0, 330, 55, 6);
    });
    itemContainer.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(quest === this.selectedQuest ? 0x4a4a8a : 0x2a2a4a, 0.9);
      bg.fillRoundedRect(0, 0, 330, 55, 6);
    });

    itemContainer.setData('quest', quest);
    itemContainer.setData('bg', bg);

    return itemContainer;
  }

  // =====================================================
  // ハイライト更新
  // =====================================================

  private updateQuestListHighlight(): void {
    // コンテナが初期化されていない場合は何もしない
    if (!this.questListContainer) return;

    // questListContainerの各アイテムを走査
    for (let i = 2; i < this.questListContainer.length; i++) {
      const child = this.questListContainer.getAt(i) as Phaser.GameObjects.Container;
      if (!child || !child.getData) continue;

      const quest = child.getData('quest') as Quest | undefined;
      const bg = child.getData('bg') as Phaser.GameObjects.Graphics | undefined;

      if (quest && bg) {
        bg.clear();
        bg.fillStyle(quest === this.selectedQuest ? 0x4a4a8a : 0x2a2a4a, 0.9);
        bg.fillRoundedRect(0, 0, 330, 55, 6);
      }
    }
  }

  // =====================================================
  // イベントハンドラ
  // =====================================================

  private handleQuestAccept(quest: Quest): void {
    this.acceptedQuest = quest;

    if (this.onQuestAccepted) {
      this.onQuestAccepted(quest);
    }

    this.complete();
  }

  private handleSkip(): void {
    this.acceptedQuest = null;

    if (this.onSkip) {
      this.onSkip();
    }

    this.complete();
  }
}
