/**
 * card.ts - デッキ機能のカード関連型定義
 *
 * TASK-0068: features/deck/types作成
 *
 * @description
 * カードエンティティクラスの実体と、shared/typesのカード関連型を
 * features/deck/types経由でアクセス可能にする。
 *
 * Card クラスは domain/entities/Card.ts から移動。
 * カード関連の型定義は shared/types からの再エクスポート。
 */

import type {
  CardId,
  CardMaster,
  IEnhancementCardMaster,
  IGatheringCardMaster,
  IRecipeCardMaster,
} from '@shared/types';

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

// =============================================================================
// Card エンティティクラス
// =============================================================================

/**
 * カードエンティティクラス
 *
 * カードのインスタンスを表すエンティティ。
 * カードマスターデータへの参照を保持し、カードの属性を公開する。
 */
export class Card {
  constructor(
    public readonly id: CardId,
    public readonly master: CardMaster,
  ) {}

  get name(): string {
    return this.master.name;
  }

  get type(): string {
    return this.master.type;
  }

  get cost(): number {
    if (this.master.type === 'GATHERING') {
      return this.master.baseCost;
    }
    return this.master.cost;
  }

  isGatheringCard(): this is Card & { master: IGatheringCardMaster } {
    return this.master.type === 'GATHERING';
  }

  isRecipeCard(): this is Card & { master: IRecipeCardMaster } {
    return this.master.type === 'RECIPE';
  }

  isEnhancementCard(): this is Card & { master: IEnhancementCardMaster } {
    return this.master.type === 'ENHANCEMENT';
  }
}
