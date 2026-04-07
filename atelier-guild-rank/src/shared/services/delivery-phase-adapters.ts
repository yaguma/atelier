/**
 * delivery-phase-adapters.ts
 *
 * Issue #453: DeliveryPhaseUI が期待するインターフェース（IQuestService / IInventoryService /
 * IContributionCalculator / IDeckService、`presentation/ui/phases/components/delivery/types.ts`）と
 * 実サービス（QuestService / InventoryService / ContributionCalculator / DeckService）のシグネチャが
 * 食い違っているため、実サービスをラップして DeliveryPhaseUI に渡す形に整える。
 *
 * 本来は DeliveryPhaseUI 側を実サービスへ直接依存させるべきだが、影響範囲が大きいため
 * Issue #453 のスコープでは表示崩れを解消するためのアダプターのみを提供する。
 */

import type { IQuestService } from '@shared/domain/interfaces/quest-service.interface';
import type { ContributionCalculator } from '@shared/domain/services/contribution-calculator';
import type { DeckService } from '@shared/services/deck-service';
import type { InventoryService } from '@shared/services/inventory-service';
import type { ClientType } from '@shared/types/common';

interface AdapterQuest {
  id: string;
  clientName: string;
  clientType: string;
  description: string;
  requiredItem: string;
  requiredCount: number;
  rewardContribution: number;
  rewardGold: number;
  remainingDays: number;
  status: 'available' | 'accepted' | 'completed' | 'failed';
}

interface AdapterItem {
  instanceId: string;
  itemId: string;
  name: string;
  quality: 'C' | 'B' | 'A' | 'S';
}

/**
 * QuestService → DeliveryPhaseUI 用 IQuestService アダプター
 */
export function createQuestServiceAdapter(real: IQuestService) {
  return {
    getAcceptedQuests(): AdapterQuest[] {
      return real.getActiveQuests().map((aq) => ({
        id: String(aq.quest.id),
        clientName: aq.client.name,
        clientType: String(aq.client.type),
        description: aq.quest.flavorText,
        requiredItem: aq.quest.condition.itemId ?? '',
        requiredCount: aq.quest.condition.quantity ?? 1,
        rewardContribution: aq.quest.contribution,
        rewardGold: aq.quest.gold,
        remainingDays: aq.remainingDays,
        status: 'accepted' as const,
      }));
    },
    canDeliver(questId: string, items: AdapterItem[]): boolean {
      const item = items[0];
      if (!item) return false;
      // 実サービスは ItemInstance クラスを期待するが、表示判定では duck typing で十分
      return real.canDeliver(questId as never, item as never);
    },
    deliver(questId: string, items: AdapterItem[]) {
      const item = items[0];
      const result = real.deliver(questId as never, item as never);
      return {
        success: result.success,
        questId,
        itemId: item?.itemId ?? '',
        contribution: result.contribution,
        gold: result.gold,
        rewardCards: (result.rewardCards ?? []).map((rc) => ({
          id: String(rc.cardId),
          name: String(rc.cardId),
          rarity: (rc.rarity ?? 'common') as 'common' | 'uncommon' | 'rare',
          cardType: 'gathering' as const,
          description: '',
        })),
        // 昇格ゲージ情報は別系統管理のため、Issue #453 では 0 を返してダイアログ表示崩れを防ぐ
        newPromotionGauge: 0,
        promotionGaugeMax: 0,
        questCompleted: result.success,
      };
    },
  };
}

/**
 * InventoryService → DeliveryPhaseUI 用 IInventoryService アダプター
 */
export function createInventoryServiceAdapter(real: InventoryService) {
  return {
    getItems(): AdapterItem[] {
      return real.getItems().map((it) => ({
        instanceId: it.instanceId,
        itemId: String(it.itemId),
        name: it.name,
        quality: it.quality as 'C' | 'B' | 'A' | 'S',
      }));
    },
    removeItems(itemIds: string[]): void {
      for (const id of itemIds) {
        real.removeItem(id);
      }
    },
  };
}

/**
 * ContributionCalculator → DeliveryPhaseUI 用 IContributionCalculator アダプター
 */
export function createContributionCalculatorAdapter(real: ContributionCalculator) {
  return {
    calculatePreview(quest: AdapterQuest, items: AdapterItem[]) {
      const item = items[0];
      if (!item) {
        return {
          baseReward: quest.rewardContribution,
          qualityModifier: 1,
          qualityBonus: 0,
          totalContribution: quest.rewardContribution,
        };
      }
      const total = real.calculate({
        baseContribution: quest.rewardContribution,
        itemQuality: item.quality as never,
        clientType: quest.clientType as ClientType,
        deliveryCount: 1,
      });
      return {
        baseReward: quest.rewardContribution,
        qualityModifier: real.getQualityModifier(item.quality as never),
        qualityBonus: total - quest.rewardContribution,
        totalContribution: total,
      };
    },
  };
}

/**
 * DeckService → DeliveryPhaseUI 用 IDeckService アダプター
 * （addCard のシグネチャは互換だがキー型のため薄いラッパーを通す）
 */
export function createDeckServiceAdapter(real: DeckService) {
  return {
    addCard(cardId: string): void {
      real.addCard(cardId as never);
    },
  };
}
