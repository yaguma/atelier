/**
 * 手札コンテナ
 *
 * 手札の表示と管理を担当するコンポーネント。
 * カードの追加・削除、選択状態の管理、レイアウトの切り替えなどを行う。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0196.md
 */

import Phaser from 'phaser';
import { Card } from '@domain/card/Card';
import {
  IHandContainer,
  HandContainerOptions,
  CardSelectableFilter,
} from './IHandContainer';
import { ICardView } from '../card/ICardView';
import { HandLayout, HandLayoutType } from './HandConstants';
import { calculateCardPositions } from './HandLayoutUtils';
import { createCardView } from '../card/CardViewFactory';

/**
 * 手札コンテナクラス
 *
 * 手札の視覚的表現と操作を管理する。
 */
export class HandContainer implements IHandContainer {
  /** Phaserコンテナ */
  public readonly container: Phaser.GameObjects.Container;

  /** シーン参照 */
  private scene: Phaser.Scene;

  /** カードデータ配列 */
  private cards: Card[] = [];

  /** カードビュー配列 */
  private cardViews: ICardView[] = [];

  /** 選択中のカードインデックス */
  private selectedIndex: number = -1;

  /** レイアウトタイプ */
  private layoutType: HandLayoutType;

  /** 選択可能フラグ */
  private selectable: boolean = true;

  /** 中心X座標 */
  private centerX: number;

  /** 中心Y座標 */
  private centerY: number;

  /** カード選択コールバック */
  private onCardSelect?: (card: Card, index: number) => void;

  /** カード選択解除コールバック */
  private onCardDeselect?: (card: Card, index: number) => void;

  /** カード確定コールバック */
  private onCardConfirm?: (card: Card, index: number) => void;

  /** 選択フィルター */
  private selectableFilter?: CardSelectableFilter;

  /** キーボードナビゲーション有効フラグ */
  private keyboardEnabled: boolean = false;

  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param options オプション
   */
  constructor(scene: Phaser.Scene, options: HandContainerOptions = {}) {
    this.scene = scene;
    this.centerX = options.x ?? HandLayout.X;
    this.centerY = options.y ?? HandLayout.Y;
    this.layoutType = options.layoutType ?? 'horizontal';
    this.onCardSelect = options.onCardSelect;
    this.onCardDeselect = options.onCardDeselect;
    this.onCardConfirm = options.onCardConfirm;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(100);
  }

  // ========================================
  // 手札管理
  // ========================================

  /**
   * 手札を設定する
   */
  setCards(cards: Card[]): void {
    // 既存のカードビューを破棄
    this.clearCardViews();

    this.cards = [...cards];
    this.selectedIndex = -1;

    // カードビューを生成
    this.cards.forEach((card, index) => {
      const cardView = this.createCardViewForHand(card, index);
      this.cardViews.push(cardView);
      this.container.add(cardView.container);
    });

    // レイアウト適用
    this.applyLayout(false);
  }

  /**
   * カードを追加する
   */
  addCard(card: Card, animate: boolean = true): void {
    this.cards.push(card);
    const index = this.cards.length - 1;
    const cardView = this.createCardViewForHand(card, index);
    this.cardViews.push(cardView);
    this.container.add(cardView.container);

    if (animate) {
      // 画面外から登場
      cardView.setPosition(this.centerX + 400, this.centerY);
      cardView.setAlpha(0);
      this.applyLayout(true);
    } else {
      this.applyLayout(false);
    }
  }

  /**
   * カードを削除する
   */
  removeCard(cardOrIndex: Card | number, animate: boolean = true): void {
    const index =
      typeof cardOrIndex === 'number'
        ? cardOrIndex
        : this.cards.indexOf(cardOrIndex);

    if (index < 0 || index >= this.cards.length) return;

    const cardView = this.cardViews[index];

    if (animate) {
      this.scene.tweens.add({
        targets: cardView.container,
        y: cardView.container.y - 100,
        alpha: 0,
        duration: HandLayout.CARD_MOVE_DURATION,
        ease: 'Power2',
        onComplete: () => {
          this.removeCardAtIndex(index);
          this.applyLayout(true);
        },
      });
    } else {
      this.removeCardAtIndex(index);
      this.applyLayout(false);
    }
  }

  /**
   * 現在の手札を取得する
   */
  getCards(): Card[] {
    return [...this.cards];
  }

  /**
   * 手札のカード数を取得する
   */
  getCardCount(): number {
    return this.cards.length;
  }

  // ========================================
  // 選択管理
  // ========================================

  /**
   * 選択中のカードを取得する
   */
  getSelectedCard(): Card | null {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.cards.length) {
      return this.cards[this.selectedIndex];
    }
    return null;
  }

  /**
   * 選択中のインデックスを取得する
   */
  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  /**
   * カードを選択する
   */
  selectCard(cardOrIndex: Card | number): void {
    const index =
      typeof cardOrIndex === 'number'
        ? cardOrIndex
        : this.cards.indexOf(cardOrIndex);

    if (!this.selectable || index < 0 || index >= this.cards.length) return;

    // フィルターで選択不可の場合は何もしない
    if (!this.isCardSelectable(index)) return;

    // 既存の選択を解除
    if (this.selectedIndex >= 0 && this.selectedIndex !== index) {
      this.cardViews[this.selectedIndex]?.setSelected(false);
    }

    this.selectedIndex = index;
    this.cardViews[index]?.setSelected(true);

    if (this.onCardSelect) {
      this.onCardSelect(this.cards[index], index);
    }
  }

  /**
   * 選択を解除する
   */
  deselectCard(): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.cardViews.length) {
      const card = this.cards[this.selectedIndex];
      const index = this.selectedIndex;

      this.cardViews[this.selectedIndex].setSelected(false);
      this.selectedIndex = -1;

      if (this.onCardDeselect) {
        this.onCardDeselect(card, index);
      }
    }
  }

  /**
   * 選択可能状態を設定する
   */
  setSelectable(selectable: boolean): void {
    this.selectable = selectable;
    this.updateCardSelectability();
  }

  /**
   * 選択フィルターを設定する
   */
  setSelectableFilter(filter: CardSelectableFilter): void {
    this.selectableFilter = filter;

    // 選択中のカードがフィルターで無効になった場合は選択解除
    if (
      this.selectedIndex >= 0 &&
      !this.isCardSelectable(this.selectedIndex)
    ) {
      this.deselectCard();
    }

    this.updateCardSelectability();
  }

  /**
   * 選択フィルターを解除する
   */
  clearSelectableFilter(): void {
    this.selectableFilter = undefined;
    this.updateCardSelectability();
  }

  /**
   * 指定インデックスのカードが選択可能かを確認する
   */
  isCardSelectable(index: number): boolean {
    if (index < 0 || index >= this.cards.length) return false;

    if (!this.selectableFilter) return true;

    return this.selectableFilter(this.cards[index], index);
  }

  /**
   * カードの選択可能状態を更新する
   */
  private updateCardSelectability(): void {
    this.cardViews.forEach((cardView, index) => {
      const canSelect = this.selectable && this.isCardSelectable(index);
      cardView.setInteractive(canSelect);
    });
  }

  // ========================================
  // キーボード操作
  // ========================================

  /**
   * キーボードナビゲーションを有効化する
   */
  enableKeyboardNavigation(): void {
    if (this.keyboardEnabled) return;
    this.keyboardEnabled = true;

    this.scene.input.keyboard?.on('keydown-LEFT', this.handleKeyLeft, this);
    this.scene.input.keyboard?.on('keydown-RIGHT', this.handleKeyRight, this);
    this.scene.input.keyboard?.on('keydown-ENTER', this.handleKeyEnter, this);
    this.scene.input.keyboard?.on('keydown-ESC', this.handleKeyEscape, this);
  }

  /**
   * キーボードナビゲーションを無効化する
   */
  disableKeyboardNavigation(): void {
    if (!this.keyboardEnabled) return;
    this.keyboardEnabled = false;

    this.scene.input.keyboard?.off('keydown-LEFT', this.handleKeyLeft, this);
    this.scene.input.keyboard?.off('keydown-RIGHT', this.handleKeyRight, this);
    this.scene.input.keyboard?.off('keydown-ENTER', this.handleKeyEnter, this);
    this.scene.input.keyboard?.off('keydown-ESC', this.handleKeyEscape, this);
  }

  /**
   * 左キーハンドラ
   */
  private handleKeyLeft = (): void => {
    if (!this.selectable || this.cards.length === 0) return;

    if (this.selectedIndex < 0) {
      // 未選択時は最初のカードを選択
      this.selectFirstSelectableCard();
    } else {
      const newIndex =
        this.selectedIndex <= 0
          ? this.cards.length - 1
          : this.selectedIndex - 1;
      this.selectCard(newIndex);
    }
  };

  /**
   * 右キーハンドラ
   */
  private handleKeyRight = (): void => {
    if (!this.selectable || this.cards.length === 0) return;

    if (this.selectedIndex < 0) {
      // 未選択時は最初のカードを選択
      this.selectFirstSelectableCard();
    } else {
      const newIndex =
        this.selectedIndex >= this.cards.length - 1
          ? 0
          : this.selectedIndex + 1;
      this.selectCard(newIndex);
    }
  };

  /**
   * ENTERキーハンドラ
   */
  private handleKeyEnter = (): void => {
    if (this.selectedIndex >= 0 && this.onCardConfirm) {
      this.onCardConfirm(this.cards[this.selectedIndex], this.selectedIndex);
    }
  };

  /**
   * ESCキーハンドラ
   */
  private handleKeyEscape = (): void => {
    this.deselectCard();
  };

  /**
   * 最初の選択可能なカードを選択する
   */
  private selectFirstSelectableCard(): void {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.isCardSelectable(i)) {
        this.selectCard(i);
        return;
      }
    }
  }

  // ========================================
  // レイアウト
  // ========================================

  /**
   * レイアウトタイプを設定する
   */
  setLayoutType(type: HandLayoutType): void {
    this.layoutType = type;
    this.applyLayout(true);
  }

  /**
   * 現在のレイアウトタイプを取得する
   */
  getLayoutType(): HandLayoutType {
    return this.layoutType;
  }

  /**
   * レイアウトを更新する
   */
  refresh(): void {
    this.applyLayout(false);
  }

  // ========================================
  // 表示
  // ========================================

  /**
   * 表示・非表示を設定する
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * 位置を設定する
   */
  setPosition(x: number, y: number): void {
    this.centerX = x;
    this.centerY = y;
    this.applyLayout(false);
  }

  // ========================================
  // ライフサイクル
  // ========================================

  /**
   * リソースを破棄する
   */
  destroy(): void {
    this.disableKeyboardNavigation();
    this.clearCardViews();
    this.container.destroy();
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * 手札用のカードビューを作成する
   */
  private createCardViewForHand(card: Card, index: number): ICardView {
    const cardView = createCardView(this.scene, {
      card,
      x: this.centerX,
      y: this.centerY,
      size: 'STANDARD',
      state: 'normal',
      interactive: this.selectable,
      onClick: () => this.handleCardClick(index),
      onHover: (_, isHovering) => this.handleCardHover(index, isHovering),
    });
    return cardView;
  }

  /**
   * カードクリックハンドラ
   */
  private handleCardClick(index: number): void {
    if (!this.selectable) return;

    if (this.selectedIndex === index) {
      // 既に選択中のカードをクリック → 選択解除
      this.deselectCard();
    } else {
      this.selectCard(index);
    }
  }

  /**
   * カードホバーハンドラ
   */
  private handleCardHover(index: number, isHovering: boolean): void {
    if (!this.selectable || this.selectedIndex === index) return;

    const cardView = this.cardViews[index];
    if (!cardView) return;

    const positions = calculateCardPositions(
      this.cards.length,
      this.layoutType,
      this.centerX,
      this.centerY
    );
    const pos = positions[index];

    if (isHovering) {
      // ホバー時に少し上に移動
      this.scene.tweens.add({
        targets: cardView.container,
        y: pos.y + HandLayout.CARD_HOVER_OFFSET,
        duration: 100,
        ease: 'Power2',
      });
    } else {
      this.scene.tweens.add({
        targets: cardView.container,
        y: pos.y,
        duration: 100,
        ease: 'Power2',
      });
    }
  }

  /**
   * レイアウトを適用する
   */
  private applyLayout(animate: boolean): void {
    const positions = calculateCardPositions(
      this.cards.length,
      this.layoutType,
      this.centerX,
      this.centerY
    );

    this.cardViews.forEach((cardView, index) => {
      const pos = positions[index];
      if (!pos) return;

      if (animate) {
        this.scene.tweens.add({
          targets: cardView.container,
          x: pos.x,
          y: pos.y,
          rotation: pos.rotation,
          alpha: 1,
          duration: HandLayout.CARD_MOVE_DURATION,
          ease: 'Power2',
        });
      } else {
        cardView.setPosition(pos.x, pos.y);
        cardView.container.setRotation(pos.rotation);
        cardView.setAlpha(1);
      }

      cardView.container.setDepth(100 + pos.depth);
    });
  }

  /**
   * 指定インデックスのカードを削除する
   */
  private removeCardAtIndex(index: number): void {
    const cardView = this.cardViews[index];
    cardView.destroy();

    this.cards.splice(index, 1);
    this.cardViews.splice(index, 1);

    // 選択インデックスの調整
    if (this.selectedIndex === index) {
      this.selectedIndex = -1;
    } else if (this.selectedIndex > index) {
      this.selectedIndex--;
    }
  }

  /**
   * カードビューをすべてクリアする
   */
  private clearCardViews(): void {
    this.cardViews.forEach((cv) => cv.destroy());
    this.cardViews = [];
    this.cards = [];
    this.selectedIndex = -1;
  }
}
