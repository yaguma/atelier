/**
 * RankUpRequirements コンポーネント
 * TASK-0055 RankUpSceneリファクタリング
 *
 * @description
 * 昇格試験の課題一覧を表示するコンポーネント。
 * 課題の完了状態と期限を表示する。
 */

import { Colors } from '@presentation/ui/theme';
import { UIBackgroundBuilder } from '@presentation/ui/utils';
import type { RankTestTask } from './types';

// =============================================================================
// 定数定義
// =============================================================================

/** UIテキスト定数 */
const UI_TEXT = {
  TEST_CONTENT_TITLE: '試験内容:',
  TIME_LIMIT_FORMAT: '期限: {days}日以内',
  TASK_COMPLETED: '✓',
  TASK_PENDING: '○',
} as const;

/** スタイル定数 */
const UI_STYLES = {
  TASK_TITLE: {
    fontSize: '18px',
    color: '#ffffff',
  },
  TASK_ITEM: {
    fontSize: '16px',
    color: '#cccccc',
  },
  TASK_COMPLETED: {
    fontSize: '16px',
    color: '#00ff00',
  },
} as const;

/** レイアウト定数 */
const LAYOUT = {
  PANEL_WIDTH: 500,
  PANEL_HEIGHT: 150,
  TITLE_OFFSET_X: -230,
  TITLE_OFFSET_Y: -60,
  TASK_START_Y: -30,
  TASK_SPACING: 25,
  LIMIT_OFFSET_Y: 40,
} as const;

// =============================================================================
// RankUpRequirements クラス
// =============================================================================

/**
 * RankUpRequirements - 昇格条件コンポーネント
 *
 * 【責務】
 * - 課題一覧の表示
 * - 課題完了状態の表示（✓/○）
 * - 期限表示
 */
export class RankUpRequirements {
  /** Phaserシーン */
  private scene: Phaser.Scene;

  /** メインコンテナ */
  private container: Phaser.GameObjects.Container;

  /** 背景グラフィックス */
  private background: Phaser.GameObjects.Graphics | null = null;

  /** タイトルテキスト */
  private titleText: Phaser.GameObjects.Text | null = null;

  /** 期限テキスト */
  private timeLimitText: Phaser.GameObjects.Text | null = null;

  /** 課題テキストリスト */
  private taskTexts: Phaser.GameObjects.Text[] = [];

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   * @param x - X座標
   * @param y - Y座標
   */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
  }

  /**
   * UIコンポーネントを作成
   */
  public create(): void {
    this.createBackground();
    this.createTitle();
    this.createTimeLimitText();
  }

  /**
   * 背景パネルを作成
   */
  private createBackground(): void {
    this.background = new UIBackgroundBuilder(this.scene)
      .setPosition(-LAYOUT.PANEL_WIDTH / 2, -LAYOUT.PANEL_HEIGHT / 2)
      .setSize(LAYOUT.PANEL_WIDTH, LAYOUT.PANEL_HEIGHT)
      .setFill(Colors.background.primary, 0.9)
      .setBorder(Colors.border.primary, 2)
      .setRadius(8)
      .build();
    this.container.add(this.background);
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    this.titleText = this.scene.add.text(
      LAYOUT.TITLE_OFFSET_X,
      LAYOUT.TITLE_OFFSET_Y,
      UI_TEXT.TEST_CONTENT_TITLE,
      UI_STYLES.TASK_TITLE,
    );
    this.container.add(this.titleText);
  }

  /**
   * 期限テキストを作成
   */
  private createTimeLimitText(): void {
    this.timeLimitText = this.scene.add.text(
      LAYOUT.TITLE_OFFSET_X,
      LAYOUT.LIMIT_OFFSET_Y,
      '',
      UI_STYLES.TASK_ITEM,
    );
    this.container.add(this.timeLimitText);
  }

  /**
   * 課題リストを設定
   * @param tasks - 課題リスト
   * @param timeLimitDays - 期限日数（オプション）
   */
  public setTasks(tasks: RankTestTask[], timeLimitDays?: number): void {
    // 既存の課題テキストをクリア
    for (const text of this.taskTexts) {
      text.destroy();
    }
    this.taskTexts = [];

    // 新しい課題テキストを作成
    tasks.forEach((task, index) => {
      const taskText = this.createTaskText(task, index);
      this.taskTexts.push(taskText);
      this.container.add(taskText);
    });

    // 期限を設定
    if (timeLimitDays !== undefined) {
      this.setTimeLimit(timeLimitDays);
    }
  }

  /**
   * 課題テキストを作成
   * @param task - 課題情報
   * @param index - インデックス
   * @returns テキストオブジェクト
   */
  private createTaskText(task: RankTestTask, index: number): Phaser.GameObjects.Text {
    const icon = task.isCompleted ? UI_TEXT.TASK_COMPLETED : UI_TEXT.TASK_PENDING;
    const style = task.isCompleted ? UI_STYLES.TASK_COMPLETED : UI_STYLES.TASK_ITEM;
    const text = `${icon} ${task.description}`;

    return this.scene.add.text(
      LAYOUT.TITLE_OFFSET_X,
      LAYOUT.TASK_START_Y + index * LAYOUT.TASK_SPACING,
      text,
      style,
    );
  }

  /**
   * 期限を設定
   * @param days - 残り日数
   */
  public setTimeLimit(days: number): void {
    if (this.timeLimitText) {
      const limitText = UI_TEXT.TIME_LIMIT_FORMAT.replace('{days}', days.toString());
      this.timeLimitText.setText(limitText);
    }
  }

  /**
   * コンテナを取得
   * @returns コンテナオブジェクト
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * 表示状態を設定
   * @param visible - 表示状態
   */
  public setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  /**
   * 位置を設定
   * @param x - X座標
   * @param y - Y座標
   */
  public setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }

  /**
   * リソースを解放
   */
  public destroy(): void {
    for (const text of this.taskTexts) {
      text.destroy();
    }
    this.taskTexts = [];

    if (this.titleText) {
      this.titleText.destroy();
      this.titleText = null;
    }

    if (this.timeLimitText) {
      this.timeLimitText.destroy();
      this.timeLimitText = null;
    }

    if (this.background) {
      this.background.destroy();
      this.background = null;
    }

    if (this.container) {
      this.container.destroy();
    }
  }
}
