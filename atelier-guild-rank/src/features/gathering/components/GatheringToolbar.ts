/**
 * GatheringToolbar.ts - 採取フェーズツールバーコンポーネント
 * Issue #459: GatheringPhaseUIから分離
 *
 * @description
 * リロールボタンと採取終了ボタンを管理するツールバーコンポーネント。
 */

import type { IGatheringService } from '@domain/interfaces/gathering-service.interface';
import { Button } from '@presentation/ui/components/Button';
import { GATHERING_REROLL } from '@shared/constants';
import type Phaser from 'phaser';

/** ツールバーのレイアウト定数 */
const TOOLBAR_LAYOUT = {
  /** リロールボタンX */
  REROLL_BUTTON_X: 360,
  /** リロールボタンY */
  REROLL_BUTTON_Y: 510,
  /** 採取終了ボタンX */
  END_BUTTON_X: 520,
  /** 採取終了ボタンY */
  END_BUTTON_Y: 510,
} as const;

/** ツールバーのコールバック */
export interface GatheringToolbarCallbacks {
  /** 採取終了時のコールバック */
  onEndGathering: () => void;
  /** リロール時のAP消費コールバック（成功時true、AP不足時false） */
  onRerollAP?: (apCost: number) => boolean;
  /** セッション取得関数 */
  getSessionId: () => string | null;
}

/**
 * GatheringToolbar - リロール/採取終了ボタン
 *
 * 【責務】:
 * - リロールボタンの表示・操作
 * - 採取終了ボタンの表示・操作
 */
export class GatheringToolbar {
  private rerollButton!: Button;
  private endButton!: Button;

  constructor(
    private scene: Phaser.Scene,
    private container: Phaser.GameObjects.Container,
    private gatheringService: IGatheringService,
    private callbacks: GatheringToolbarCallbacks,
  ) {}

  /**
   * ツールバーを作成
   */
  create(): void {
    this.createRerollButton();
    this.createEndButton();
  }

  /**
   * リロール処理を実行
   * Issue #445: AP消費コールバックを呼び、成功時にGatheringServiceでリロールを実行
   */
  handleReroll(): void {
    const sessionId = this.callbacks.getSessionId();
    if (!sessionId) return;

    if (this.callbacks.onRerollAP) {
      const success = this.callbacks.onRerollAP(GATHERING_REROLL.AP_COST);
      if (!success) {
        this.rerollButton?.setEnabled(false);
        return;
      }
    }

    try {
      this.gatheringService.rerollOptions(sessionId);
    } catch (_error) {
      this.rerollButton?.setEnabled(false);
    }
  }

  /**
   * リロールボタンの有効/無効を設定
   */
  setRerollEnabled(enabled: boolean): void {
    this.rerollButton?.setEnabled(enabled);
  }

  /**
   * すべてのボタンの表示/非表示を設定
   */
  setVisible(visible: boolean): void {
    if (this.rerollButton) this.rerollButton.setVisible(visible);
    if (this.endButton) this.endButton.setVisible(visible);
  }

  /**
   * リソースを破棄
   */
  destroy(): void {
    if (this.rerollButton) this.rerollButton.destroy();
    if (this.endButton) this.endButton.destroy();
  }

  private createRerollButton(): void {
    this.rerollButton = new Button(
      this.scene,
      TOOLBAR_LAYOUT.REROLL_BUTTON_X,
      TOOLBAR_LAYOUT.REROLL_BUTTON_Y,
      {
        text: `🔄 更新 (${GATHERING_REROLL.AP_COST}AP)`,
        onClick: () => {
          this.handleReroll();
        },
        width: 140,
        height: 40,
        addToScene: false,
      },
    );
    this.container.add(this.rerollButton.getContainer());
  }

  private createEndButton(): void {
    this.endButton = new Button(
      this.scene,
      TOOLBAR_LAYOUT.END_BUTTON_X,
      TOOLBAR_LAYOUT.END_BUTTON_Y,
      {
        text: '採取終了',
        onClick: () => {
          this.callbacks.onEndGathering();
        },
        width: 120,
        height: 40,
        addToScene: false,
      },
    );
    this.container.add(this.endButton.getContainer());
  }
}
