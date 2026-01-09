/**
 * カードビューファクトリー
 *
 * カード種別に応じた適切なCardViewインスタンスを生成する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0196.md
 */

import Phaser from 'phaser';
import { Card } from '@domain/card/Card';
import { CardType } from '@domain/common/types';
import { ICardView, CardViewOptions } from './ICardView';
import { GatheringCardView } from './GatheringCardView';
import { RecipeCardView } from './RecipeCardView';
import { EnhancementCardView } from './EnhancementCardView';

/**
 * CardViewクラスの型定義
 */
type CardViewConstructor = new (
  scene: Phaser.Scene,
  options: CardViewOptions
) => ICardView;

/**
 * カード種別に対応するCardViewクラスを取得する
 *
 * @param cardType カード種別
 * @returns CardViewクラス
 */
export const getCardViewClass = (cardType: CardType): CardViewConstructor => {
  switch (cardType) {
    case CardType.GATHERING:
      return GatheringCardView;
    case CardType.RECIPE:
      return RecipeCardView;
    case CardType.ENHANCEMENT:
      return EnhancementCardView;
    default:
      // デフォルトは採取地カードビュー
      return GatheringCardView;
  }
};

/**
 * カードデータに応じた適切なCardViewを生成する
 *
 * @param scene Phaserシーン
 * @param options カードビューオプション
 * @returns 生成されたカードビュー
 */
export const createCardView = (
  scene: Phaser.Scene,
  options: CardViewOptions
): ICardView => {
  const { card } = options;
  const ViewClass = getCardViewClass(card.type);
  return new ViewClass(scene, options);
};
