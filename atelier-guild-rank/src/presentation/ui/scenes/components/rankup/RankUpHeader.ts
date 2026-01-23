/**
 * RankUpHeader コンポーネント
 * TASK-0055 RankUpSceneリファクタリング
 *
 * @description
 * 昇格試験画面のヘッダー部分を担当するコンポーネント。
 * タイトル表示とランク情報の表示を行う。
 */

// =============================================================================
// 定数定義
// =============================================================================

/** UIテキスト定数 */
const UI_TEXT = {
  PHASE_TITLE: '🏆 昇格試験',
  RANK_UP_FORMAT: '{fromRank} → {toRank} ランクへの昇格',
} as const;

/** スタイル定数 */
const UI_STYLES = {
  TITLE: {
    fontSize: '28px',
    color: '#ffd700',
  },
  RANK_DISPLAY: {
    fontSize: '24px',
    color: '#ffffff',
  },
} as const;

/** レイアウト定数 */
const LAYOUT = {
  TITLE_Y: 0,
  RANK_Y: 40,
} as const;

// =============================================================================
// RankUpHeader クラス
// =============================================================================

/**
 * RankUpHeader - ヘッダーコンポーネント
 *
 * 【責務】
 * - タイトル「🏆 昇格試験」の表示
 * - 現在ランク → 目標ランクの表示
 * - ランク情報の更新
 */
export class RankUpHeader {
  /** Phaserシーン */
  private scene: Phaser.Scene;

  /** メインコンテナ */
  private container: Phaser.GameObjects.Container;

  /** タイトルテキスト */
  private titleText: Phaser.GameObjects.Text | null = null;

  /** ランク表示テキスト */
  private rankDisplayText: Phaser.GameObjects.Text | null = null;

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
    this.createTitle();
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    this.titleText = this.scene.add.text(0, LAYOUT.TITLE_Y, UI_TEXT.PHASE_TITLE, UI_STYLES.TITLE);
    this.titleText.setOrigin(0.5, 0);
    this.container.add(this.titleText);
  }

  /**
   * ランク表示を更新
   * @param fromRank - 現在のランク
   * @param toRank - 目標ランク
   */
  public updateRank(fromRank: string, toRank: string): void {
    const rankText = UI_TEXT.RANK_UP_FORMAT.replace('{fromRank}', fromRank).replace(
      '{toRank}',
      toRank,
    );

    if (this.rankDisplayText) {
      this.rankDisplayText.setText(rankText);
    } else {
      this.rankDisplayText = this.scene.add.text(
        0,
        LAYOUT.RANK_Y,
        rankText,
        UI_STYLES.RANK_DISPLAY,
      );
      this.rankDisplayText.setOrigin(0.5, 0);
      this.container.add(this.rankDisplayText);
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
    if (this.titleText) {
      this.titleText.destroy();
      this.titleText = null;
    }
    if (this.rankDisplayText) {
      this.rankDisplayText.destroy();
      this.rankDisplayText = null;
    }
    if (this.container) {
      this.container.destroy();
    }
  }
}
