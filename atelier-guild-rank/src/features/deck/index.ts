/**
 * Deck Feature Module - デッキ機能公開API
 *
 * features/deckモジュールの唯一の公開インターフェース。
 * 外部からのアクセスはこのファイル経由で行うこと。
 * 内部実装への直接アクセスは禁止。
 *
 * TASK-0068: features/deck/types作成
 * TASK-0071: features/deck/index.ts公開API作成
 *
 * @example
 * ```typescript
 * import { shuffle, draw, playCard, CardUI, HandDisplay, Card } from '@features/deck';
 * import type { DeckState, CardUIConfig, CardId, IDeckService } from '@features/deck';
 * ```
 */

// --- Components（UIコンポーネント） ---
export type { CardUIConfig, DraggableCardConfig, HandDisplayConfig } from './components';
export { CardUI, DraggableCardUI, HandDisplay } from './components';
// --- Types（サービス由来の型定義） ---
export type { DeckState, PlayCardError, PlayCardErrorCode, Result } from './services';
// --- Services（純粋関数） ---
export { createSeededRandom, draw, playCard, shuffle } from './services';
export type {
  CardData,
  CardId,
  CardMaster,
  ICard,
  ICardEffect,
  IDeckService,
  IEnhancementCard,
  IEnhancementCardMaster,
  IEnhancementEffect,
  IGatheringCard,
  IGatheringCardMaster,
  IGatheringMaterial,
  IRecipeCard,
  IRecipeCardMaster,
  IRecipeRequiredMaterial,
  IRequiredMaterial,
} from './types';
// --- Types（型定義） ---
export {
  Card,
  CardType,
  isEnhancementCard,
  isEnhancementCardMaster,
  isGatheringCard,
  isGatheringCardMaster,
  isRecipeCard,
  isRecipeCardMaster,
  toCardId,
} from './types';
