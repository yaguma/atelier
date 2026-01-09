/**
 * カード種別別表示オプション定義
 *
 * カード種別ごとの表示オプション（色、アイコン等）を定義する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import { CardType } from '@domain/common/types';
import { CardTypeColors } from '../../config/ColorPalette';

/**
 * カード種別別の表示オプション
 */
export interface CardTypeDisplayOption {
  /** 背景色（数値形式） */
  backgroundColor: number;
  /** ボーダー色（数値形式） */
  borderColor: number;
  /** アイコンキー（アセット名） */
  iconKey: string;
  /** ラベル色（CSS形式） */
  labelColor: string;
  /** アクセント色（数値形式） */
  accentColor: number;
  /** 種別名（日本語） */
  typeName: string;
}

/**
 * カード種別から表示オプションを取得する
 * @param type カード種別
 * @returns 表示オプション
 */
export const getCardTypeDisplayOption = (type: CardType): CardTypeDisplayOption => {
  switch (type) {
    case CardType.GATHERING:
      return {
        backgroundColor: CardTypeColors.gathering.background,
        borderColor: CardTypeColors.gathering.border,
        iconKey: 'icon-card-gathering',
        labelColor: CardTypeColors.gathering.text,
        accentColor: CardTypeColors.gathering.accent,
        typeName: '採取地',
      };
    case CardType.RECIPE:
      return {
        backgroundColor: CardTypeColors.recipe.background,
        borderColor: CardTypeColors.recipe.border,
        iconKey: 'icon-card-recipe',
        labelColor: CardTypeColors.recipe.text,
        accentColor: CardTypeColors.recipe.accent,
        typeName: 'レシピ',
      };
    case CardType.ENHANCEMENT:
      return {
        backgroundColor: CardTypeColors.enhancement.background,
        borderColor: CardTypeColors.enhancement.border,
        iconKey: 'icon-card-enhancement',
        labelColor: CardTypeColors.enhancement.text,
        accentColor: CardTypeColors.enhancement.accent,
        typeName: '強化',
      };
  }
};

/**
 * すべてのカード種別の表示オプションを取得する
 * @returns カード種別をキーとする表示オプションのマップ
 */
export const getAllCardTypeDisplayOptions = (): Record<CardType, CardTypeDisplayOption> => {
  return {
    [CardType.GATHERING]: getCardTypeDisplayOption(CardType.GATHERING),
    [CardType.RECIPE]: getCardTypeDisplayOption(CardType.RECIPE),
    [CardType.ENHANCEMENT]: getCardTypeDisplayOption(CardType.ENHANCEMENT),
  };
};
