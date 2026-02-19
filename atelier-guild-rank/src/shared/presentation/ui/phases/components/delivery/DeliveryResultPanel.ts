/**
 * DeliveryResultPanelコンポーネント
 * TASK-0057 DeliveryPhaseUIリファクタリング
 *
 * @description
 * 納品成功時の結果パネル表示を担当するコンポーネント
 */

import { Colors, THEME } from '@presentation/ui/theme';
import { AnimationPresets } from '@presentation/ui/utils/AnimationPresets';
import type Phaser from 'phaser';
import type { DeliveryResult, DeliveryResultPanelCallbacks } from './types';

// =============================================================================
// 定数定義
// =============================================================================

/** UIレイアウト定数 */
const LAYOUT = {
  PANEL_WIDTH: 400,
  PANEL_HEIGHT: 200,
  TITLE_OFFSET_Y: 20,
  CONTENT_OFFSET_Y: 60,
  CLOSE_BUTTON_OFFSET_Y: 160,
} as const;

/** UIテキスト定数 */
const UI_TEXT = {
  SUCCESS_TITLE: '納品成功！',
  CLOSE_BUTTON: '閉じる',
} as const;

/** UIスタイル定数 */
const UI_STYLES = {
  TITLE: {
    fontSize: `${THEME.sizes.large}px`,
    color: THEME.colors.textOnPrimary,
    fontFamily: THEME.fonts.primary,
    fontStyle: 'bold',
  },
  CONTENT: {
    fontSize: `${THEME.sizes.medium}px`,
    color: THEME.colors.textOnPrimary,
    fontFamily: THEME.fonts.primary,
  },
  BUTTON: {
    fontSize: `${THEME.sizes.small}px`,
    color: THEME.colors.textOnPrimary,
    fontFamily: THEME.fonts.primary,
  },
} as const;

// =============================================================================
// クラス定義
// =============================================================================

/**
 * 納品結果パネルコンポーネント
 */
export class DeliveryResultPanel {
  private scene: Phaser.Scene;
  private callbacks: DeliveryResultPanelCallbacks | undefined;
  private container: Phaser.GameObjects.Container;
  private visible: boolean = false;
  private elements: Phaser.GameObjects.GameObject[] = [];

  /**
   * コンストラクタ
   * @param scene - Phaserシーン
   * @param x - X座標
   * @param y - Y座標
   * @param callbacks - コールバック（オプション）
   */
  constructor(scene: Phaser.Scene, x: number, y: number, callbacks?: DeliveryResultPanelCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.container = scene.add.container(x, y);
    this.container.setVisible(false);
    this.container.setAlpha(0);
  }

  /**
   * UIコンポーネント初期化
   */
  public create(): void {
    // 初期化時はパネルを非表示
  }

  /**
   * パネルを表示
   * @param result - 納品結果
   * @param questDescription - 依頼説明
   */
  public show(result: DeliveryResult, questDescription: string): void {
    // 既存要素をクリア
    this.clearElements();

    // パネル背景
    const background = this.scene.add.rectangle(
      0,
      0,
      LAYOUT.PANEL_WIDTH,
      LAYOUT.PANEL_HEIGHT,
      Colors.background.card,
      0.95,
    );
    background.setStrokeStyle(2, Colors.border.gold);
    this.container.add(background);
    this.elements.push(background);

    // タイトル
    const title = this.scene.add.text(
      0,
      -LAYOUT.PANEL_HEIGHT / 2 + LAYOUT.TITLE_OFFSET_Y,
      UI_TEXT.SUCCESS_TITLE,
      UI_STYLES.TITLE,
    );
    title.setOrigin(0.5);
    this.container.add(title);
    this.elements.push(title);

    // 報酬情報
    const contentText =
      `依頼: ${questDescription}\n` +
      `獲得報酬:\n` +
      `  貢献度: +${result.contribution}\n` +
      `  お金: +${result.gold}G`;

    const content = this.scene.add.text(
      0,
      -LAYOUT.PANEL_HEIGHT / 2 + LAYOUT.CONTENT_OFFSET_Y,
      contentText,
      UI_STYLES.CONTENT,
    );
    content.setOrigin(0.5, 0);
    this.container.add(content);
    this.elements.push(content);

    // 閉じるボタン
    const closeButton = this.scene.add.text(
      0,
      -LAYOUT.PANEL_HEIGHT / 2 + LAYOUT.CLOSE_BUTTON_OFFSET_Y,
      UI_TEXT.CLOSE_BUTTON,
      UI_STYLES.BUTTON,
    );
    closeButton.setOrigin(0.5);
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.on('pointerdown', () => this.onCloseClick());
    this.container.add(closeButton);
    this.elements.push(closeButton);

    // パネル表示
    this.container.setVisible(true);
    this.visible = true;

    // フェードインアニメーション
    this.scene.tweens.add({
      targets: this.container,
      ...AnimationPresets.fade.in,
    });
  }

  /**
   * 閉じるボタンクリック時の処理
   */
  private onCloseClick(): void {
    this.hide();
    if (this.callbacks?.onClose) {
      this.callbacks.onClose();
    }
  }

  /**
   * パネルを非表示
   */
  public hide(): void {
    this.container.setVisible(false);
    this.container.setAlpha(0);
    this.visible = false;
    this.clearElements();
  }

  /**
   * 表示状態を取得
   * @returns 表示中の場合true
   */
  public isVisible(): boolean {
    return this.visible;
  }

  /**
   * コンテナを取得
   * @returns コンテナ
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
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
   * 要素をクリア
   */
  private clearElements(): void {
    for (const element of this.elements) {
      element.destroy();
    }
    this.elements = [];
  }

  /**
   * リソースを解放
   */
  public destroy(): void {
    this.clearElements();
    this.container.destroy();
  }
}
