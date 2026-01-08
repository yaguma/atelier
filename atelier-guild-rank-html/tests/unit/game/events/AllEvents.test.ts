/**
 * 全イベントテスト
 *
 * 定義された全イベントについて、発行・購読が正しく動作することを検証する。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventBus } from '@game/events/EventBus';
import { UIActionEvents, StateUpdateEvents, UIDialogEvents, SceneEvents } from '@game/events/EventTypes';
import type {
  QuestSelectedPayload,
  QuestAcceptedPayload,
  GatheringCardSelectedPayload,
  MaterialOptionSelectedPayload,
  RecipeCardSelectedPayload,
  MaterialSlotSelectedPayload,
  DeliveryItemSelectedPayload,
  RewardCardSelectedPayload,
  ShopItemPurchasedPayload,
  GameStateChangedPayload,
  PhaseChangedPayload,
  DayChangedPayload,
  GoldChangedPayload,
  APChangedPayload,
  RankChangedPayload,
  ContributionChangedPayload,
  HandUpdatedPayload,
  DeckUpdatedPayload,
  InventoryUpdatedPayload,
  QuestsUpdatedPayload,
  ActiveQuestsUpdatedPayload,
  DialogOpenedPayload,
  DialogClosedPayload,
  ToastShownPayload,
} from '@game/events/EventPayloads';

describe('全イベントテスト', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    EventBus.resetInstance();
    eventBus = EventBus.getInstance();
  });

  afterEach(() => {
    EventBus.resetInstance();
  });

  describe('UIActionEvents - ゲーム開始', () => {
    it('NEW_GAME_CLICKEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.NEW_GAME_CLICKED, callback);
      eventBus.emitVoid(UIActionEvents.NEW_GAME_CLICKED);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('CONTINUE_CLICKEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.CONTINUE_CLICKED, callback);
      eventBus.emitVoid(UIActionEvents.CONTINUE_CLICKED);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('UIActionEvents - 依頼受注フェーズ', () => {
    it('QUEST_SELECTEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: QuestSelectedPayload = { questId: 'quest-001' };
      eventBus.on(UIActionEvents.QUEST_SELECTED, callback);
      eventBus.emit(UIActionEvents.QUEST_SELECTED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('QUEST_ACCEPTEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: QuestAcceptedPayload = { questId: 'quest-002' };
      eventBus.on(UIActionEvents.QUEST_ACCEPTED, callback);
      eventBus.emit(UIActionEvents.QUEST_ACCEPTED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('QUEST_PHASE_COMPLETEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.QUEST_PHASE_COMPLETED, callback);
      eventBus.emitVoid(UIActionEvents.QUEST_PHASE_COMPLETED);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('UIActionEvents - 採取フェーズ', () => {
    it('GATHERING_CARD_SELECTEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: GatheringCardSelectedPayload = { cardId: 'gather-001' };
      eventBus.on(UIActionEvents.GATHERING_CARD_SELECTED, callback);
      eventBus.emit(UIActionEvents.GATHERING_CARD_SELECTED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('MATERIAL_OPTION_SELECTEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: MaterialOptionSelectedPayload = { optionIndex: 2 };
      eventBus.on(UIActionEvents.MATERIAL_OPTION_SELECTED, callback);
      eventBus.emit(UIActionEvents.MATERIAL_OPTION_SELECTED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('GATHERING_CONFIRMEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.GATHERING_CONFIRMED, callback);
      eventBus.emitVoid(UIActionEvents.GATHERING_CONFIRMED);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('GATHERING_SKIPPEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.GATHERING_SKIPPED, callback);
      eventBus.emitVoid(UIActionEvents.GATHERING_SKIPPED);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('UIActionEvents - 調合フェーズ', () => {
    it('RECIPE_CARD_SELECTEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: RecipeCardSelectedPayload = { cardId: 'recipe-001' };
      eventBus.on(UIActionEvents.RECIPE_CARD_SELECTED, callback);
      eventBus.emit(UIActionEvents.RECIPE_CARD_SELECTED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('MATERIAL_SLOT_SELECTEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: MaterialSlotSelectedPayload = { slotIndex: 0, materialId: 'mat-001' };
      eventBus.on(UIActionEvents.MATERIAL_SLOT_SELECTED, callback);
      eventBus.emit(UIActionEvents.MATERIAL_SLOT_SELECTED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('ALCHEMY_CONFIRMEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.ALCHEMY_CONFIRMED, callback);
      eventBus.emitVoid(UIActionEvents.ALCHEMY_CONFIRMED);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('ALCHEMY_SKIPPEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.ALCHEMY_SKIPPED, callback);
      eventBus.emitVoid(UIActionEvents.ALCHEMY_SKIPPED);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('UIActionEvents - 納品フェーズ', () => {
    it('DELIVERY_ITEM_SELECTEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: DeliveryItemSelectedPayload = { itemId: 'item-001', questId: 'quest-001' };
      eventBus.on(UIActionEvents.DELIVERY_ITEM_SELECTED, callback);
      eventBus.emit(UIActionEvents.DELIVERY_ITEM_SELECTED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('DELIVERY_CONFIRMEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.DELIVERY_CONFIRMED, callback);
      eventBus.emitVoid(UIActionEvents.DELIVERY_CONFIRMED);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('REWARD_CARD_SELECTEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: RewardCardSelectedPayload = { cardId: 'card-reward-001' };
      eventBus.on(UIActionEvents.REWARD_CARD_SELECTED, callback);
      eventBus.emit(UIActionEvents.REWARD_CARD_SELECTED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });
  });

  describe('UIActionEvents - ショップ', () => {
    it('SHOP_ITEM_PURCHASEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: ShopItemPurchasedPayload = { itemId: 'shop-001', itemType: 'card' };
      eventBus.on(UIActionEvents.SHOP_ITEM_PURCHASED, callback);
      eventBus.emit(UIActionEvents.SHOP_ITEM_PURCHASED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('SHOP_CLOSEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.SHOP_CLOSED, callback);
      eventBus.emitVoid(UIActionEvents.SHOP_CLOSED);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('UIActionEvents - 日終了', () => {
    it('DAY_END_CONFIRMEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.DAY_END_CONFIRMED, callback);
      eventBus.emitVoid(UIActionEvents.DAY_END_CONFIRMED);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('UIActionEvents - セーブ・ロード', () => {
    it('SAVE_REQUESTEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.SAVE_REQUESTED, callback);
      eventBus.emitVoid(UIActionEvents.SAVE_REQUESTED);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('LOAD_REQUESTEDが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(UIActionEvents.LOAD_REQUESTED, callback);
      eventBus.emitVoid(UIActionEvents.LOAD_REQUESTED);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('StateUpdateEvents - ゲーム状態', () => {
    it('GAME_STATE_CHANGEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: GameStateChangedPayload = { state: 'playing' };
      eventBus.on(StateUpdateEvents.GAME_STATE_CHANGED, callback);
      eventBus.emit(StateUpdateEvents.GAME_STATE_CHANGED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('PHASE_CHANGEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: PhaseChangedPayload = { phase: 'GATHERING', previousPhase: 'QUEST_ACCEPT' };
      eventBus.on(StateUpdateEvents.PHASE_CHANGED, callback);
      eventBus.emit(StateUpdateEvents.PHASE_CHANGED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('DAY_CHANGEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: DayChangedPayload = { day: 5, maxDays: 30 };
      eventBus.on(StateUpdateEvents.DAY_CHANGED, callback);
      eventBus.emit(StateUpdateEvents.DAY_CHANGED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });
  });

  describe('StateUpdateEvents - リソース', () => {
    it('GOLD_CHANGEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: GoldChangedPayload = { gold: 1500, delta: 100 };
      eventBus.on(StateUpdateEvents.GOLD_CHANGED, callback);
      eventBus.emit(StateUpdateEvents.GOLD_CHANGED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('AP_CHANGEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: APChangedPayload = { ap: 3, maxAP: 5 };
      eventBus.on(StateUpdateEvents.AP_CHANGED, callback);
      eventBus.emit(StateUpdateEvents.AP_CHANGED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('RANK_CHANGEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: RankChangedPayload = { rank: 'D', previousRank: 'E' };
      eventBus.on(StateUpdateEvents.RANK_CHANGED, callback);
      eventBus.emit(StateUpdateEvents.RANK_CHANGED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('CONTRIBUTION_CHANGEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: ContributionChangedPayload = { contribution: 75, maxContribution: 100 };
      eventBus.on(StateUpdateEvents.CONTRIBUTION_CHANGED, callback);
      eventBus.emit(StateUpdateEvents.CONTRIBUTION_CHANGED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });
  });

  describe('StateUpdateEvents - 手札・デッキ', () => {
    it('HAND_UPDATEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: HandUpdatedPayload = { cardIds: ['card-001', 'card-002', 'card-003'] };
      eventBus.on(StateUpdateEvents.HAND_UPDATED, callback);
      eventBus.emit(StateUpdateEvents.HAND_UPDATED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('DECK_UPDATEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: DeckUpdatedPayload = { deckCount: 15, discardCount: 5 };
      eventBus.on(StateUpdateEvents.DECK_UPDATED, callback);
      eventBus.emit(StateUpdateEvents.DECK_UPDATED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });
  });

  describe('StateUpdateEvents - インベントリ', () => {
    it('INVENTORY_UPDATEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: InventoryUpdatedPayload = {
        materialIds: ['mat-001', 'mat-002'],
        itemIds: ['item-001'],
      };
      eventBus.on(StateUpdateEvents.INVENTORY_UPDATED, callback);
      eventBus.emit(StateUpdateEvents.INVENTORY_UPDATED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });
  });

  describe('StateUpdateEvents - 依頼', () => {
    it('QUESTS_UPDATEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: QuestsUpdatedPayload = { questIds: ['quest-001', 'quest-002'] };
      eventBus.on(StateUpdateEvents.QUESTS_UPDATED, callback);
      eventBus.emit(StateUpdateEvents.QUESTS_UPDATED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('ACTIVE_QUESTS_UPDATEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: ActiveQuestsUpdatedPayload = { questIds: ['quest-001'] };
      eventBus.on(StateUpdateEvents.ACTIVE_QUESTS_UPDATED, callback);
      eventBus.emit(StateUpdateEvents.ACTIVE_QUESTS_UPDATED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });
  });

  describe('UIDialogEvents', () => {
    it('DIALOG_OPENEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: DialogOpenedPayload = { dialogType: 'confirm', data: { message: 'test' } };
      eventBus.on(UIDialogEvents.DIALOG_OPENED, callback);
      eventBus.emit(UIDialogEvents.DIALOG_OPENED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('DIALOG_CLOSEDがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: DialogClosedPayload = { dialogType: 'confirm' };
      eventBus.on(UIDialogEvents.DIALOG_CLOSED, callback);
      eventBus.emit(UIDialogEvents.DIALOG_CLOSED, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it('TOAST_SHOWNがペイロード付きで発行できる', () => {
      const callback = vi.fn();
      const payload: ToastShownPayload = { message: 'Success!', type: 'success', duration: 3000 };
      eventBus.on(UIDialogEvents.TOAST_SHOWN, callback);
      eventBus.emit(UIDialogEvents.TOAST_SHOWN, payload);
      expect(callback).toHaveBeenCalledWith(payload);
    });
  });

  describe('SceneEvents', () => {
    it('SCENE_READYが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(SceneEvents.SCENE_READY, callback);
      eventBus.emitVoid(SceneEvents.SCENE_READY);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('SCENE_SHUTDOWNが発行できる', () => {
      const callback = vi.fn();
      eventBus.onVoid(SceneEvents.SCENE_SHUTDOWN, callback);
      eventBus.emitVoid(SceneEvents.SCENE_SHUTDOWN);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('イベント完全性チェック', () => {
    it('UIActionEventsは21種類ある', () => {
      const count = Object.keys(UIActionEvents).length;
      expect(count).toBe(21);
    });

    it('StateUpdateEventsは12種類ある', () => {
      const count = Object.keys(StateUpdateEvents).length;
      expect(count).toBe(12);
    });

    it('UIDialogEventsは3種類ある', () => {
      const count = Object.keys(UIDialogEvents).length;
      expect(count).toBe(3);
    });

    it('SceneEventsは2種類ある', () => {
      const count = Object.keys(SceneEvents).length;
      expect(count).toBe(2);
    });

    it('合計38イベントが定義されている', () => {
      const total =
        Object.keys(UIActionEvents).length +
        Object.keys(StateUpdateEvents).length +
        Object.keys(UIDialogEvents).length +
        Object.keys(SceneEvents).length;
      expect(total).toBe(38);
    });

    it('すべてのイベントキーがユニークである', () => {
      const allKeys = [
        ...Object.values(UIActionEvents),
        ...Object.values(StateUpdateEvents),
        ...Object.values(UIDialogEvents),
        ...Object.values(SceneEvents),
      ];
      const uniqueKeys = new Set(allKeys);
      expect(uniqueKeys.size).toBe(allKeys.length);
    });
  });
});
