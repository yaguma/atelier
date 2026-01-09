/**
 * PhaseIndicator
 *
 * ゲームフェーズを表示するインジケーターコンポーネント
 */

import Phaser from 'phaser';
import { GamePhase } from '../../../domain/common/types';
import { IPhaseIndicator, PhaseIndicatorOptions } from './IPhaseIndicator';
import {
  PhaseIndicatorLayout,
  PhaseInfo,
  PhaseColors,
} from './PhaseIndicatorConstants';

/**
 * フェーズアイテムデータ
 */
interface PhaseItemData {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Graphics;
  icon: Phaser.GameObjects.Text;
  label: Phaser.GameObjects.Text;
  phase: GamePhase;
  completed: boolean;
  enabled: boolean;
}

/**
 * PhaseIndicator実装
 */
export class PhaseIndicator implements IPhaseIndicator {
  public readonly container: Phaser.GameObjects.Container;

  private scene: Phaser.Scene;
  private phases: GamePhase[] = [
    GamePhase.QUEST_ACCEPT,
    GamePhase.GATHERING,
    GamePhase.ALCHEMY,
    GamePhase.DELIVERY,
  ];
  private phaseItems: Map<GamePhase, PhaseItemData> = new Map();
  private connectors: Phaser.GameObjects.Graphics[] = [];
  private currentPhase: GamePhase = GamePhase.QUEST_ACCEPT;

  private onPhaseClick?: (phase: GamePhase) => void;
  private clickable: boolean;

  constructor(scene: Phaser.Scene, options: PhaseIndicatorOptions = {}) {
    this.scene = scene;
    this.onPhaseClick = options.onPhaseClick;
    this.clickable = options.clickable ?? false;

    const x = options.x ?? PhaseIndicatorLayout.X;
    const y = options.y ?? PhaseIndicatorLayout.Y;

    this.container = scene.add.container(x, y);
    this.container.setDepth(300);

    this.createPhaseItems();
    this.createConnectors();
    this.setCurrentPhase(GamePhase.QUEST_ACCEPT, false);
  }

  /**
   * フェーズアイテムを作成
   */
  private createPhaseItems(): void {
    const { ITEM_WIDTH, ITEM_HEIGHT, ITEM_SPACING, CONNECTOR_WIDTH } =
      PhaseIndicatorLayout;

    this.phases.forEach((phase, index) => {
      const x = index * (ITEM_WIDTH + ITEM_SPACING + CONNECTOR_WIDTH);
      const itemContainer = this.scene.add.container(x, 0);

      // 背景
      const background = this.scene.add.graphics();
      background.fillStyle(PhaseColors.INACTIVE_BG, 1);
      background.fillRoundedRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 8);
      background.lineStyle(2, PhaseColors.INACTIVE_BORDER);
      background.strokeRoundedRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 8);
      itemContainer.add(background);

      // アイコン
      const info = PhaseInfo[phase];
      const icon = this.scene.add
        .text(15, ITEM_HEIGHT / 2, info.icon, {
          fontSize: '24px',
        })
        .setOrigin(0, 0.5);
      itemContainer.add(icon);

      // ラベル
      const label = this.scene.add
        .text(50, ITEM_HEIGHT / 2, info.label, {
          fontSize: '14px',
          color: '#ffffff',
        })
        .setOrigin(0, 0.5);
      itemContainer.add(label);

      // インタラクション
      if (this.clickable) {
        itemContainer.setInteractive(
          new Phaser.Geom.Rectangle(0, 0, ITEM_WIDTH, ITEM_HEIGHT),
          Phaser.Geom.Rectangle.Contains
        );
        itemContainer.on('pointerdown', () => this.handlePhaseClick(phase));
        itemContainer.on('pointerover', () =>
          this.handlePhaseHover(phase, true)
        );
        itemContainer.on('pointerout', () =>
          this.handlePhaseHover(phase, false)
        );
      }

      this.container.add(itemContainer);

      this.phaseItems.set(phase, {
        container: itemContainer,
        background,
        icon,
        label,
        phase,
        completed: false,
        enabled: true,
      });
    });
  }

  /**
   * コネクタを作成
   */
  private createConnectors(): void {
    const {
      ITEM_WIDTH,
      ITEM_SPACING,
      CONNECTOR_WIDTH,
      CONNECTOR_HEIGHT,
      ITEM_HEIGHT,
    } = PhaseIndicatorLayout;

    for (let i = 0; i < this.phases.length - 1; i++) {
      const x =
        (i + 1) * ITEM_WIDTH +
        i * (ITEM_SPACING + CONNECTOR_WIDTH) +
        ITEM_SPACING / 2;
      const y = ITEM_HEIGHT / 2 - CONNECTOR_HEIGHT / 2;

      const connector = this.scene.add.graphics();
      connector.fillStyle(PhaseColors.CONNECTOR_INACTIVE, 1);
      connector.fillRect(x, y, CONNECTOR_WIDTH, CONNECTOR_HEIGHT);
      this.container.add(connector);
      this.connectors.push(connector);
    }
  }

  /**
   * 現在フェーズを設定
   */
  setCurrentPhase(phase: GamePhase, animate: boolean = true): void {
    this.currentPhase = phase;

    // 全フェーズの表示を更新
    this.phases.forEach((p, index) => {
      const item = this.phaseItems.get(p);
      if (!item) return;

      const isCurrent = p === phase;
      const isPrevious = this.phases.indexOf(p) < this.phases.indexOf(phase);

      this.updatePhaseItemVisual(item, isCurrent, isPrevious);

      // コネクタの更新
      if (index < this.connectors.length) {
        this.updateConnector(index, isPrevious || isCurrent);
      }
    });

    // アニメーション
    if (animate) {
      const currentItem = this.phaseItems.get(phase);
      if (currentItem) {
        this.animatePhaseChange(currentItem);
      }
    }
  }

  /**
   * フェーズアイテムのビジュアルを更新
   */
  private updatePhaseItemVisual(
    item: PhaseItemData,
    isCurrent: boolean,
    isCompleted: boolean
  ): void {
    const { ITEM_WIDTH, ITEM_HEIGHT } = PhaseIndicatorLayout;

    let bgColor: number;
    let borderColor: number;

    if (isCurrent) {
      bgColor = PhaseColors.ACTIVE_BG;
      borderColor = PhaseColors.ACTIVE_BORDER;
    } else if (isCompleted || item.completed) {
      bgColor = PhaseColors.COMPLETED_BG;
      borderColor = PhaseColors.ACTIVE_BORDER;
    } else {
      bgColor = PhaseColors.INACTIVE_BG;
      borderColor = PhaseColors.INACTIVE_BORDER;
    }

    item.background.clear();
    item.background.fillStyle(bgColor, item.enabled ? 1 : 0.5);
    item.background.fillRoundedRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 8);
    item.background.lineStyle(2, borderColor);
    item.background.strokeRoundedRect(0, 0, ITEM_WIDTH, ITEM_HEIGHT, 8);

    item.label.setAlpha(item.enabled ? 1 : 0.5);
    item.icon.setAlpha(item.enabled ? 1 : 0.5);
  }

  /**
   * コネクタを更新
   */
  private updateConnector(index: number, active: boolean): void {
    const connector = this.connectors[index];
    const {
      ITEM_WIDTH,
      ITEM_SPACING,
      CONNECTOR_WIDTH,
      CONNECTOR_HEIGHT,
      ITEM_HEIGHT,
    } = PhaseIndicatorLayout;

    const x =
      (index + 1) * ITEM_WIDTH +
      index * (ITEM_SPACING + CONNECTOR_WIDTH) +
      ITEM_SPACING / 2;
    const y = ITEM_HEIGHT / 2 - CONNECTOR_HEIGHT / 2;

    connector.clear();
    connector.fillStyle(
      active ? PhaseColors.CONNECTOR_ACTIVE : PhaseColors.CONNECTOR_INACTIVE,
      1
    );
    connector.fillRect(x, y, CONNECTOR_WIDTH, CONNECTOR_HEIGHT);
  }

  /**
   * フェーズ変更アニメーション
   */
  private animatePhaseChange(item: PhaseItemData): void {
    // パルスアニメーション
    this.scene.tweens.add({
      targets: item.container,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 150,
      yoyo: true,
      ease: 'Power2',
    });
  }

  /**
   * 現在フェーズを取得
   */
  getCurrentPhase(): GamePhase {
    return this.currentPhase;
  }

  /**
   * フェーズを完了としてマーク
   */
  markPhaseCompleted(phase: GamePhase): void {
    const item = this.phaseItems.get(phase);
    if (item) {
      item.completed = true;
      this.updatePhaseItemVisual(item, phase === this.currentPhase, true);
    }
  }

  /**
   * 完了フェーズをクリア
   */
  clearCompletedPhases(): void {
    this.phaseItems.forEach((item) => {
      item.completed = false;
    });
    this.setCurrentPhase(this.currentPhase, false);
  }

  /**
   * フェーズの有効/無効を設定
   */
  setPhaseEnabled(phase: GamePhase, enabled: boolean): void {
    const item = this.phaseItems.get(phase);
    if (item) {
      item.enabled = enabled;
      this.updatePhaseItemVisual(
        item,
        phase === this.currentPhase,
        item.completed
      );
    }
  }

  /**
   * フェーズクリック処理
   */
  private handlePhaseClick(phase: GamePhase): void {
    const item = this.phaseItems.get(phase);
    if (!item?.enabled) return;

    if (this.onPhaseClick) {
      this.onPhaseClick(phase);
    }
  }

  /**
   * フェーズホバー処理
   */
  private handlePhaseHover(phase: GamePhase, hovering: boolean): void {
    const item = this.phaseItems.get(phase);
    if (!item?.enabled || phase === this.currentPhase) return;

    // ホバーエフェクト
    this.scene.tweens.add({
      targets: item.container,
      scaleX: hovering ? 1.02 : 1,
      scaleY: hovering ? 1.02 : 1,
      duration: 100,
      ease: 'Power2',
    });
  }

  /**
   * 表示/非表示を設定
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    this.container.destroy();
  }
}
