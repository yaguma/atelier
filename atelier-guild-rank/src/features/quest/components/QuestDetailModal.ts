/**
 * QuestDetailModal コンポーネント
 * TASK-0082: features/quest/components作成
 *
 * 依頼の詳細情報を表示するモーダルダイアログ。
 * 依頼者名、依頼内容、期限、報酬、難易度を表示し、
 * 受注・閉じるボタンを提供する。
 *
 * TODO(TASK-0082): このファイルは407行で300行上限を超過している。
 * パネル描画ロジック（createPanel/createButtons等）を別ファイルに分離を検討する。
 */

import { BaseComponent } from '@shared/components';
import type { IQuest } from '@shared/types/quests';
import type Phaser from 'phaser';

// =============================================================================
// 型定義
// =============================================================================

/** QuestDetailModalの設定 */
export interface QuestDetailModalConfig {
  /** 表示する依頼 */
  quest: IQuest;
  /** 依頼者名 */
  clientName: string;
  /** 受注ボタンクリック時のコールバック */
  onAccept: (quest: IQuest) => void;
  /** 閉じるボタンクリック時のコールバック */
  onClose: () => void;
}

// =============================================================================
// 定数
// =============================================================================

/** 深度定数 */
const DEPTH = {
  OVERLAY: 900,
  PANEL: 1000,
  ACCEPT_COMPLETE: 1100,
} as const;

/** パネル寸法 */
const PANEL = {
  WIDTH: 400,
  HEIGHT: 350,
  INITIAL_SCALE: 0.8,
} as const;

/** アニメーション時間（ms） */
const ANIMATION = {
  OPEN_OVERLAY: 200,
  OPEN_PANEL: 300,
  CLOSE: 200,
  ACCEPT_SCALE_IN: 300,
  ACCEPT_FADE_DELAY: 500,
  ACCEPT_FADE_OUT: 200,
} as const;

/** テキスト配置 */
const TEXT_POSITION = {
  LEFT_MARGIN: -180,
  CLIENT_NAME_Y: -150,
  DEADLINE_Y: -100,
  REWARD_Y: -50,
  BUTTON_Y: 100,
} as const;

/** ボタン配置 */
const BUTTON_POSITION = {
  ACCEPT_X: -50,
  CLOSE_X: 50,
} as const;

/** 色定数 */
const COLORS = {
  PANEL_BG: 0xffffff,
  OVERLAY: 0x000000,
  OVERLAY_ALPHA: 0.7,
  ACCEPT_BUTTON_BG: '#4caf50',
  CLOSE_BUTTON_BG: '#9e9e9e',
  ACCEPT_COMPLETE: '#4caf50',
} as const;

/** フォントサイズ */
const FONT_SIZE = {
  TITLE: '16px',
  BODY: '14px',
  LARGE: '32px',
} as const;

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * 依頼詳細モーダルコンポーネント
 *
 * 依頼の詳細情報をモーダルダイアログで表示する。
 * オーバーレイ、パネル、依頼情報、受注・閉じるボタンを含む。
 */
export class QuestDetailModal extends BaseComponent {
  private config: QuestDetailModalConfig;
  private overlay!: Phaser.GameObjects.Rectangle;
  private panel!: Phaser.GameObjects.Container;
  private escKey: Phaser.Input.Keyboard.Key | null = null;
  private animating = false;
  private isDestroyed = false;
  private acceptCompleteText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, config: QuestDetailModalConfig) {
    if (!scene) {
      throw new Error('QuestDetailModal: scene is required');
    }
    if (!config) {
      throw new Error('QuestDetailModal: config is required');
    }
    if (!config.quest) {
      throw new Error('QuestDetailModal: config.quest is required');
    }
    if (typeof config.onAccept !== 'function') {
      throw new Error('QuestDetailModal: config.onAccept must be a function');
    }
    if (typeof config.onClose !== 'function') {
      throw new Error('QuestDetailModal: config.onClose must be a function');
    }

    const centerX = scene.cameras?.main?.width ? scene.cameras.main.width / 2 : 640;
    const centerY = scene.cameras?.main?.height ? scene.cameras.main.height / 2 : 360;

    super(scene, centerX, centerY);
    this.config = config;
  }

  public create(): void {
    this.createOverlay();
    this.createPanel();
    this.setupEscKey();
    this.playOpenAnimation();
  }

  private createOverlay(): void {
    const width = this.scene.cameras?.main?.width || 1280;
    const height = this.scene.cameras?.main?.height || 720;

    this.overlay = this.scene.add.rectangle(0, 0, width, height, COLORS.OVERLAY, 0);
    this.overlay.setOrigin(0.5);

    if (this.overlay.setDepth) {
      this.overlay.setDepth(DEPTH.OVERLAY);
    }

    this.overlay.setInteractive();
    this.overlay.on('pointerdown', () => this.close());
    this.container.add(this.overlay);
  }

  private createPanel(): void {
    this.panel = this.scene.add.container(0, 0);

    if (this.panel.setDepth) {
      this.panel.setDepth(DEPTH.PANEL);
    }
    if (this.panel.setScale) {
      this.panel.setScale(PANEL.INITIAL_SCALE);
    }
    if (this.panel.setAlpha) {
      this.panel.setAlpha(0);
    }

    this.createPanelBackground();
    this.createQuestInfoTexts();
    this.createActionButtons();
    this.container.add(this.panel);
  }

  private createPanelBackground(): void {
    const panelBg = this.scene.add.rectangle(0, 0, PANEL.WIDTH, PANEL.HEIGHT, COLORS.PANEL_BG);
    this.panel.add(panelBg);
  }

  private createQuestInfoTexts(): void {
    const { quest, clientName } = this.config;
    const displayName = clientName || '不明な依頼者';

    const clientNameText = this.scene.add.text(
      TEXT_POSITION.LEFT_MARGIN,
      TEXT_POSITION.CLIENT_NAME_Y,
      `依頼者: ${displayName}`,
      { fontSize: FONT_SIZE.TITLE, color: '#000000', fontStyle: 'bold' },
    );
    this.panel.add(clientNameText);

    const deadline = quest.deadline || 0;
    const deadlineText = this.scene.add.text(
      TEXT_POSITION.LEFT_MARGIN,
      TEXT_POSITION.DEADLINE_Y,
      `期限: ${deadline}日以内`,
      { fontSize: FONT_SIZE.BODY, color: '#333333' },
    );
    this.panel.add(deadlineText);

    const gold = quest.gold || 0;
    const contribution = quest.contribution || 0;
    const rewardText = this.scene.add.text(
      TEXT_POSITION.LEFT_MARGIN,
      TEXT_POSITION.REWARD_Y,
      `報酬: ${gold}G / ${contribution}貢献度`,
      { fontSize: FONT_SIZE.BODY, color: '#333333' },
    );
    this.panel.add(rewardText);
  }

  private createActionButtons(): void {
    const acceptBtn = this.createButton(
      BUTTON_POSITION.ACCEPT_X,
      TEXT_POSITION.BUTTON_Y,
      '受注する',
      COLORS.ACCEPT_BUTTON_BG,
      () => this.handleAccept(),
    );
    this.panel.add(acceptBtn);

    const closeBtn = this.createButton(
      BUTTON_POSITION.CLOSE_X,
      TEXT_POSITION.BUTTON_Y,
      '閉じる',
      COLORS.CLOSE_BUTTON_BG,
      () => this.close(),
    );
    this.panel.add(closeBtn);
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    bgColor: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const btn = this.scene.add.text(x, y, label, {
      fontSize: FONT_SIZE.TITLE,
      color: '#ffffff',
      backgroundColor: bgColor,
      padding: { x: 16, y: 8 },
    });
    btn.setOrigin(0.5);

    if (btn.setInteractive) {
      btn.setInteractive({ useHandCursor: true });
    }
    if (btn.on) {
      btn.on('pointerdown', onClick);
    }

    return btn;
  }

  private setupEscKey(): void {
    if (this.scene.input?.keyboard) {
      this.escKey = this.scene.input.keyboard.addKey('ESC');
      this.escKey.on('down', () => this.handleEscKey());
    }
  }

  private playOpenAnimation(): void {
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: COLORS.OVERLAY_ALPHA,
      duration: ANIMATION.OPEN_OVERLAY,
      ease: 'Linear',
    });

    this.scene.tweens.add({
      targets: this.panel,
      scale: 1,
      alpha: 1,
      duration: ANIMATION.OPEN_PANEL,
      ease: 'Back.Out',
    });
  }

  /** 難易度を星表示にフォーマットする */
  public formatDifficulty(difficulty: number): string {
    const maxStars = 5;
    const clamped = Math.max(0, Math.min(maxStars, difficulty));
    const filled = '\u2605'.repeat(clamped);
    const empty = '\u2606'.repeat(maxStars - clamped);
    return filled + empty;
  }

  /** 受注処理 */
  public handleAccept(): void {
    if (this.animating) return;
    this.config.onAccept(this.config.quest);
  }

  /** ESCキー処理 */
  public handleEscKey(): void {
    if (this.animating) return;
    this.close();
  }

  /** 受注成功アニメーション再生 */
  public playAcceptAnimation(): void {
    this.animating = true;

    this.acceptCompleteText = this.scene.add.text(0, 0, '受注完了!', {
      fontSize: FONT_SIZE.LARGE,
      color: COLORS.ACCEPT_COMPLETE,
      fontStyle: 'bold',
    });
    this.acceptCompleteText.setOrigin(0.5);
    this.acceptCompleteText.setDepth(DEPTH.ACCEPT_COMPLETE);
    this.acceptCompleteText.setScale(0);

    this.scene.tweens.add({
      targets: this.acceptCompleteText,
      scale: 1,
      duration: ANIMATION.ACCEPT_SCALE_IN,
      ease: 'Back.Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.acceptCompleteText,
          alpha: 0,
          duration: ANIMATION.ACCEPT_FADE_OUT,
          delay: ANIMATION.ACCEPT_FADE_DELAY,
          onComplete: () => {
            this.animating = false;
          },
        });
      },
    });
  }

  /** モーダルを閉じる */
  public close(): void {
    if (this.isDestroyed) return;
    if (this.animating) return;

    this.animating = true;

    this.scene.tweens.add({
      targets: [this.overlay, this.panel],
      alpha: 0,
      duration: ANIMATION.CLOSE,
      ease: 'Linear',
      onComplete: () => {
        this.animating = false;
        this.config.onClose();
      },
    });
  }

  /** アニメーション中フラグ設定 */
  public setAnimating(value: boolean): void {
    this.animating = value;
  }

  /** アニメーション中フラグ取得 */
  public isAnimating(): boolean {
    return this.animating;
  }

  /** リソース解放 */
  public destroy(): void {
    this.isDestroyed = true;

    // Tweenのキャンセル
    if (this.overlay && this.scene.tweens?.killTweensOf) {
      this.scene.tweens.killTweensOf(this.overlay);
    }
    if (this.panel && this.scene.tweens?.killTweensOf) {
      this.scene.tweens.killTweensOf(this.panel);
    }
    if (this.acceptCompleteText) {
      if (this.scene.tweens?.killTweensOf) {
        this.scene.tweens.killTweensOf(this.acceptCompleteText);
      }
      this.acceptCompleteText.destroy();
      this.acceptCompleteText = null;
    }

    // ESCキーリスナー解除
    if (this.escKey) {
      this.escKey.off('down');
      if (this.scene.input?.keyboard) {
        this.scene.input.keyboard.removeKey('ESC');
      }
      this.escKey = null;
    }

    // オーバーレイ破棄
    if (this.overlay) {
      this.overlay.off('pointerdown');
      this.overlay.destroy();
    }

    // パネル破棄
    if (this.panel) {
      this.panel.destroy();
    }

    // コンテナ破棄
    if (this.container) {
      this.container.destroy();
    }
  }
}
