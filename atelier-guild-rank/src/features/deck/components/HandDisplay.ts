/**
 * HandDisplayコンポーネント
 * TASK-0021 カードUIコンポーネント
 * TASK-0070 features/deck/components作成
 *
 * @description
 * プレイヤーの手札を横並びで表示し、カード選択状態を管理するコンポーネント。
 * 最大5枚のカードを表示し、選択中のカードを強調表示する。
 */

import type { Card } from '@domain/entities/Card';
import { BaseComponent } from '@shared/components';
import type Phaser from 'phaser';
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
   * 【手札表示の定数】: 手札UIのレイアウトと動作を定義する定数
   * 【設計方針】: マジックナンバーを排除し、調整可能な設定値として定義
   */
  private static readonly CARD_SPACING = 140; // 【カード間隔】: カードを横並びにする際の間隔
  private static readonly MAX_HAND_SIZE = 5; // 【最大手札枚数】: ゲーム仕様による上限

  /**
   * 【アニメーション設定定数】: カード選択時のアニメーション効果の定義
   * 【設計方針】: マジックナンバーを排除し、UX調整を容易にする
   * 【パフォーマンス】: 150msの短時間アニメーションで軽快な操作感を実現
   * 🔵 信頼性レベル: 既存実装のマジックナンバーを定数化
   */
  private static readonly HIGHLIGHT_OFFSET_Y = -20; // 【選択時の上昇距離】: カードを上に移動させて選択を強調
  private static readonly ANIMATION_DURATION = 150; // 【アニメーション時間】: 150msで素早く滑らかな動き

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
   * 【カードの強調表示】: 選択中のカードを視覚的に強調
   * 【アニメーション効果】: カードを上に移動させて選択状態を明示
   * 【UX設計】: 他のカードとの視覚的差別化により、選択意図を明確化
   * 🔵 信頼性レベル: 実装ファイルに基づく
   *
   * @param index - 強調するカードのインデックス
   */
  private highlightCard(index: number): void {
    const cardUI = this.cardUIs[index];
    // 【防御的プログラミング】: 無効なインデックスの場合は何もしない
    if (!cardUI) return;

    // 【選択アニメーション】: カードを上に移動して選択状態を視覚化
    // 【アニメーション設計】:
    //   - Y座標: -20px上に移動（他のカードより高い位置で目立たせる）
    //   - 時間: 150ms（素早く反応し、待ち時間を感じさせない）
    //   - イージング: Power2（自然な加速・減速で滑らかな動き）
    // 【UX効果】: 選択中のカードを物理的に「持ち上げる」メタファーを実現
    // 🔵 信頼性レベル: 実装ファイルに基づく
    this.scene.tweens.add({
      targets: cardUI.getContainer(),
      y: HandDisplay.HIGHLIGHT_OFFSET_Y, // 【Y座標】: 定数化された上昇距離
      duration: HandDisplay.ANIMATION_DURATION, // 【時間】: 統一されたアニメーション時間
      ease: 'Power2', // 【イージング】: 自然な動きを実現
    });
  }

  /**
   * 【カードの強調表示解除】: 選択を解除し、カードを元の位置に戻す
   * 【アニメーション効果】: カードを下に移動させて通常状態に復帰
   * 【UX設計】: 他のカードとの視覚的統一性を回復
   * 🔵 信頼性レベル: 実装ファイルに基づく
   *
   * @param index - 強調を解除するカードのインデックス
   */
  private clearSelection(index: number): void {
    const cardUI = this.cardUIs[index];
    // 【防御的プログラミング】: 無効なインデックスの場合は何もしない
    if (!cardUI) return;

    // 【選択解除アニメーション】: カードを元の位置に戻す
    // 【アニメーション設計】:
    //   - Y座標: 0（元の基準位置に復帰）
    //   - 時間: 150ms（選択時と同じ時間で統一感を確保）
    //   - イージング: Power2（選択時と同じイージングで自然な動き）
    // 【UX効果】: カードを「置く」動作のメタファーで視覚的整合性を保つ
    // 🔵 信頼性レベル: 実装ファイルに基づく
    this.scene.tweens.add({
      targets: cardUI.getContainer(),
      y: 0, // 【Y座標】: 元の基準位置に復帰
      duration: HandDisplay.ANIMATION_DURATION, // 【時間】: highlightCardと統一
      ease: 'Power2', // 【イージング】: highlightCardと統一
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
