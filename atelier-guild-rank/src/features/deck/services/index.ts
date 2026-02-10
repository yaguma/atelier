/**
 * features/deck/services - デッキサービス純粋関数
 *
 * TASK-0069: features/deck/services作成（DeckService純粋関数化）
 *
 * @description
 * Functional Core, Imperative Shell（FCIS）原則に従った純粋関数群。
 * 副作用を持たず、テスト容易性と保守性を確保。
 *
 * @example
 * ```typescript
 * import { shuffle, draw, playCard } from '@features/deck/services';
 *
 * // シャッフル
 * const shuffled = shuffle(deck, seed);
 *
 * // ドロー
 * const [drawn, remaining] = draw(shuffled, 5);
 *
 * // カードプレイ
 * const result = playCard(state, cardId);
 * ```
 */

// ドロー関数
export { draw } from './draw';
export type { DeckState, PlayCardError, PlayCardErrorCode, Result } from './play-card';

// カードプレイ関数
export { playCard } from './play-card';
// シャッフル関数
export { createSeededRandom, shuffle } from './shuffle';
