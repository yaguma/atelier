/**
 * HandDisplayコンポーネント
 * TASK-0021 カードUIコンポーネント
 *
 * @description
 * プレイヤーの手札を横並びで表示し、カード選択状態を管理するコンポーネント。
 * 最大5枚のカードを表示し、選択中のカードを強調表示する。
 */

import type Phaser from 'phaser';
import type { Card } from '../../../domain/entities/Card';
import { BaseComponent } from './BaseComponent';
import { CardUI } from './CardUI';

/**
 * 手札表示の設定
 */
export interface HandDisplayConfig {
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** 手札のカード配列 */
  cards: Card[];
  /** カードクリック時のコールバック */
  onCardClick?: (card: Card, index: number) => void;
}

/**
 * HandDisplayコンポーネント
 *
 * プレイヤーの手札を横並びで表示するコンポーネント。
 * カードの選択状態を管理し、選択中のカードを視覚的に強調表示する。
 */
export class HandDisplay extends BaseComponent {
  private config: HandDisplayConfig;
  private cardUIs: CardUI[] = [];
  private selectedIndex: number | null = null;

  /**
   * 手札表示の定数
   */
  private static readonly CARD_SPACING = 140; // カード間のスペース
  private static readonly MAX_HAND_SIZE = 5; // 最大手札枚数

  constructor(scene: Phaser.Scene, config: HandDisplayConfig) {
    super(scene, config.x, config.y);

    // バリデーション: cardsが必須
    if (!config.cards) {
      throw new Error('HandDisplay: cards array is required');
    }

    // バリデーション: 手札枚数チェック
    if (config.cards.length > HandDisplay.MAX_HAND_SIZE) {
      throw new Error(
        `HandDisplay: cards array exceeds maximum size of ${HandDisplay.MAX_HAND_SIZE}`,
      );
    }

    this.config = config;

    // 手札UIを生成
    this.create();
  }

  /**
   * 手札UIを生成する（BaseComponentの抽象メソッド実装）
   */
  public create(): void {
    this.createCardUIs();
  }

  /**
   * カードUIを生成し、横並びで配置
   */
  private createCardUIs(): void {
    const cardCount = this.config.cards.length;

    // カード配列の中央を基準に左右に配置するためのオフセット計算
    const totalWidth = (cardCount - 1) * HandDisplay.CARD_SPACING;
    const startX = -totalWidth / 2;

    this.config.cards.forEach((card, index) => {
      const cardX = startX + index * HandDisplay.CARD_SPACING;

      // CardUIを生成
      const cardUI = new CardUI(this.scene, {
        card,
        x: cardX,
        y: 0,
        interactive: true,
        onClick: (clickedCard) => this.handleCardClick(clickedCard, index),
      });

      // コンテナに追加
      this.container.add(cardUI.getContainer());

      this.cardUIs.push(cardUI);
    });
  }

  /**
   * カードクリック時の処理
   *
   * @param card - クリックされたカード
   * @param index - カードのインデックス
   */
  private handleCardClick(card: Card, index: number): void {
    // 選択状態を更新
    this.setSelectedIndex(index);

    // コールバックを実行
    this.config.onCardClick?.(card, index);
  }

  /**
   * 選択中のカードインデックスを設定
   *
   * @param index - 選択するカードのインデックス（nullで選択解除）
   */
  public setSelectedIndex(index: number | null): void {
    // 以前の選択を解除
    if (this.selectedIndex !== null && this.cardUIs[this.selectedIndex]) {
      this.clearSelection(this.selectedIndex);
    }

    // 新しい選択を適用
    this.selectedIndex = index;
    if (index !== null && this.cardUIs[index]) {
      this.highlightCard(index);
    }
  }

  /**
   * カードを強調表示
   *
   * @param index - 強調するカードのインデックス
   */
  private highlightCard(index: number): void {
    const cardUI = this.cardUIs[index];
    if (!cardUI) return;

    // 選択中のカードを少し上に移動
    this.scene.tweens.add({
      targets: cardUI.getContainer(),
      y: -20,
      duration: 150,
      ease: 'Power2',
    });
  }

  /**
   * カードの強調表示を解除
   *
   * @param index - 強調を解除するカードのインデックス
   */
  private clearSelection(index: number): void {
    const cardUI = this.cardUIs[index];
    if (!cardUI) return;

    // 元の位置に戻す
    this.scene.tweens.add({
      targets: cardUI.getContainer(),
      y: 0,
      duration: 150,
      ease: 'Power2',
    });
  }

  /**
   * 選択中のカードインデックスを取得
   *
   * @returns 選択中のカードインデックス（選択なしの場合はnull）
   */
  public getSelectedIndex(): number | null {
    return this.selectedIndex;
  }

  /**
   * 選択中のカードを取得
   *
   * @returns 選択中のカード（選択なしの場合はnull）
   */
  public getSelectedCard(): Card | null {
    if (this.selectedIndex === null) {
      return null;
    }
    return this.config.cards[this.selectedIndex] || null;
  }

  /**
   * 手札のカード配列を更新
   *
   * @param cards - 新しいカード配列
   */
  public updateCards(cards: Card[]): void {
    // バリデーション: 手札枚数チェック
    if (cards.length > HandDisplay.MAX_HAND_SIZE) {
      throw new Error(
        `HandDisplay: cards array exceeds maximum size of ${HandDisplay.MAX_HAND_SIZE}`,
      );
    }

    // 既存のCardUIを破棄
    for (const cardUI of this.cardUIs) {
      cardUI.destroy();
    }
    this.cardUIs = [];

    // 選択状態をリセット
    this.selectedIndex = null;

    // 新しいカード配列を設定
    this.config.cards = cards;

    // CardUIを再生成
    this.createCardUIs();
  }

  /**
   * コンポーネントを破棄する（BaseComponentの抽象メソッド実装）
   */
  public destroy(): void {
    // すべてのCardUIを破棄
    for (const cardUI of this.cardUIs) {
      cardUI.destroy();
    }
    this.cardUIs = [];

    // コンテナを破棄
    if (this.container) {
      this.container.destroy();
    }
  }

  /**
   * 手札のカード枚数を取得
   *
   * @returns カード枚数
   */
  public getCardCount(): number {
    return this.config.cards.length;
  }
}
