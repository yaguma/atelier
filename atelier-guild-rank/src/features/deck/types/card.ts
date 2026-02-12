/**
 * card.ts - デッキ機能のカード関連型定義
 *
 * TASK-0068: features/deck/types作成
 *
 * @description
 * カードエンティティクラスと型定義を集約するモジュール。
 * domain/entities/Card.tsのCardクラスと、shared/typesのカード関連型を
 * features/deck/types経由でアクセス可能にする。
 *
 * TODO(TASK-0068): Phase 11で型定義の実体をこのファイルに移動し、
 * domain/entities/Card.ts と shared/types 側を後方互換の再エクスポートに変更する。
 */

// Cardエンティティクラス（domain層からの再エクスポート）
export { Card } from '@domain/entities/Card';
// カード関連型定義（shared/typesからの再エクスポート）
// カードマスターデータ型（shared/typesからの再エクスポート）
// カード関連の基本型（shared/typesからの再エクスポート）
export type {
  Card as CardData,
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
} from '@shared/types';
export {
  CardType,
  isEnhancementCard,
  isEnhancementCardMaster,
  isGatheringCard,
  isGatheringCardMaster,
  isRecipeCard,
  isRecipeCardMaster,
  toCardId,
} from '@shared/types';
