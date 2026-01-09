/**
 * カードUIコンポーネント
 *
 * カードの視覚表現に関するインターフェース、定数、ユーティリティをエクスポートする。
 */

// 定数
export {
  CardSize,
  CardLayout,
  getCardScale,
  getCardSize,
  type CardSizeType,
  type CardSizeValue,
} from './CardConstants';

// 状態
export {
  CardStateStyles,
  getCardStateStyle,
  isCardInteractive,
  type CardState,
  type CardStateStyle,
} from './CardState';

// インターフェース
export { type ICardView, type CardViewOptions } from './ICardView';

// カード種別オプション
export {
  getCardTypeDisplayOption,
  getAllCardTypeDisplayOptions,
  type CardTypeDisplayOption,
} from './CardTypeOptions';

// カードビュー実装
export { GatheringCardView, type GatheringCardViewOptions } from './GatheringCardView';
export { RecipeCardView, type RecipeCardViewOptions } from './RecipeCardView';
export { EnhancementCardView, type EnhancementCardViewOptions } from './EnhancementCardView';
