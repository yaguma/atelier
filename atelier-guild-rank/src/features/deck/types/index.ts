/**
 * features/deck/types - デッキ機能型定義の公開エクスポート
 *
 * TASK-0068: features/deck/types作成
 *
 * @description
 * デッキ機能に関連する全ての型定義を一元管理する。
 * 外部からは @features/deck/types 経由でインポートすること。
 *
 * @example
 * ```typescript
 * import { Card, CardType, toCardId } from '@features/deck/types';
 * import type { CardId, IDeckService, ICard } from '@features/deck/types';
 * ```
 */

// --- カード関連型定義 ---
// --- カードマスターデータ型 ---
// --- カード関連の基本型 ---
export type {
  CardData,
  CardId,
  CardMaster,
  ICard,
  ICardEffect,
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
} from './card';
// --- Cardエンティティクラス ---
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
} from './card';

// --- DeckServiceインターフェース ---
export type { IDeckService } from './deck-service';
