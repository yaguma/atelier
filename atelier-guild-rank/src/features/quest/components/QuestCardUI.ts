/**
 * QuestCardUI コンポーネント
 * TASK-0082: features/quest/components作成
 *
 * 個別依頼をカード形式で表示するコンポーネント。
 * 依頼者名、セリフ、報酬情報を表示する。
 * カードクリックで詳細モーダルを開き、そこから受注する。
 */

import { BaseComponent } from '@shared/components';
import { Colors } from '@shared/theme';
import type { IQuest } from '@shared/types/quests';
import Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** カード寸法 */
const CARD = {
  WIDTH: 280,
  HEIGHT: 180,
  PADDING: 12,
} as const;

/** テキスト配置オフセット */
const TEXT_OFFSET = {
  DIALOGUE: 25,
  REWARD: 60,
  DEADLINE: 40,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/** QuestCardUIの設定 */
export interface QuestCardUIConfig {
  /** 表示する依頼 */
  quest: IQuest;
  /** 依頼者名 */
  clientName: string;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** インタラクティブにするか（デフォルト: true） */
  interactive?: boolean;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * 依頼カードUIコンポーネント
 *
 * 依頼の視覚的表現を管理するコンポーネント。
 * 依頼者名、セリフ、報酬を表示し、カードクリックで詳細を開く。
 */
export class QuestCardUI extends BaseComponent {
  private config: QuestCardUIConfig;
  private quest: IQuest;
  private background!: Phaser.GameObjects.Rectangle;
  private clientNameText!: Phaser.GameObjects.Text;
  private dialogueText!: Phaser.GameObjects.Text;
  private rewardText!: Phaser.GameObjects.Text;
  private deadlineText!: Phaser.GameObjects.Text;
  private isCreated = false;

  constructor(scene: Phaser.Scene, config: QuestCardUIConfig) {
    if (!config) {
      throw new Error('config is required');
    }
    if (!config.quest) {
      throw new Error('config.quest is required');
    }

    super(scene, config.x, config.y, { addToScene: false });

    this.config = {
      ...config,
      interactive: config.interactive ?? true,
    };
    this.quest = config.quest;

    this.create();
  }

  /** 依頼カードUIを生成する */
  public create(): void {
    if (this.isCreated) return;
    this.isCreated = true;

    this.createBackground();
    this.createClientName();
    this.createDialogue();
    this.createRewardInfo();
    this.createDeadline();
    this.setupInteraction();
  }

  private createBackground(): void {
    this.background = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      CARD.WIDTH,
      CARD.HEIGHT,
      Colors.background.parchment,
    );
    if (this.background.setStrokeStyle) {
      this.background.setStrokeStyle(2, Colors.border.quest);
    }
    this.container.add(this.background);
  }

  private createClientName(): void {
    const { clientName } = this.config;
    const displayName = clientName.trim() === '' ? '不明な依頼者' : clientName;
    const nameY = -CARD.HEIGHT / 2 + CARD.PADDING;

    this.clientNameText = this.scene.make.text({
      x: -CARD.WIDTH / 2 + CARD.PADDING,
      y: nameY,
      text: displayName,
      style: { fontSize: '14px', color: '#000000', fontStyle: 'bold' },
      add: false,
    });
    this.clientNameText.setOrigin(0, 0);
    this.container.add(this.clientNameText);
  }

  private createDialogue(): void {
    const dialogue = this.quest.flavorText || '';
    const dialogueY = -CARD.HEIGHT / 2 + CARD.PADDING + TEXT_OFFSET.DIALOGUE;

    this.dialogueText = this.scene.make.text({
      x: -CARD.WIDTH / 2 + CARD.PADDING,
      y: dialogueY,
      text: dialogue,
      style: {
        fontSize: '12px',
        color: '#333333',
        wordWrap: { width: CARD.WIDTH - CARD.PADDING * 2 },
      },
      add: false,
    });
    this.dialogueText.setOrigin(0, 0);
    this.container.add(this.dialogueText);
  }

  private createRewardInfo(): void {
    const contribution = this.quest.contribution || 0;
    const gold = this.quest.gold || 0;
    const rewardLabel = `${contribution}貢献度 / ${gold}G`;
    const rewardY = CARD.HEIGHT / 2 - CARD.PADDING - TEXT_OFFSET.REWARD;

    this.rewardText = this.scene.make.text({
      x: -CARD.WIDTH / 2 + CARD.PADDING,
      y: rewardY,
      text: rewardLabel,
      style: { fontSize: '12px', color: '#000000' },
      add: false,
    });
    this.rewardText.setOrigin(0, 0);
    this.container.add(this.rewardText);
  }

  private createDeadline(): void {
    const deadline = this.quest.deadline || 0;
    const deadlineLabel = `期限: ${deadline}日`;
    const deadlineY = CARD.HEIGHT / 2 - CARD.PADDING - TEXT_OFFSET.DEADLINE;

    this.deadlineText = this.scene.make.text({
      x: -CARD.WIDTH / 2 + CARD.PADDING,
      y: deadlineY,
      text: deadlineLabel,
      style: { fontSize: '12px', color: '#666666' },
      add: false,
    });
    this.deadlineText.setOrigin(0, 0);
    this.container.add(this.deadlineText);
  }

  private setupInteraction(): void {
    if (!this.config.interactive) return;
    this.background.setInteractive({ useHandCursor: true });
  }

  /** 依頼データを取得 */
  public getQuest(): IQuest {
    return this.quest;
  }

  /** リソース解放 */
  public destroy(): void {
    if (this.background) {
      this.background.destroy();
    }
    if (this.clientNameText) {
      this.clientNameText.destroy();
    }
    if (this.dialogueText) {
      this.dialogueText.destroy();
    }
    if (this.rewardText) {
      this.rewardText.destroy();
    }
    if (this.deadlineText) {
      this.deadlineText.destroy();
    }
    if (this.container) {
      this.container.destroy();
    }
  }
}
