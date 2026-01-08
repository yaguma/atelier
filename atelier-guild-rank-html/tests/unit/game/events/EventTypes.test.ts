/**
 * EventTypes テスト
 *
 * イベント型定義の網羅性と一貫性を検証する。
 */

import { describe, it, expect } from 'vitest';
import {
  UIActionEvents,
  StateUpdateEvents,
  UIDialogEvents,
  SceneEvents,
  AllEventKeys,
} from '@game/events/EventTypes';

describe('EventTypes', () => {
  describe('UIActionEvents', () => {
    it('ゲーム開始イベントが定義されている', () => {
      expect(UIActionEvents.NEW_GAME_CLICKED).toBe('ui:newGame:clicked');
      expect(UIActionEvents.CONTINUE_CLICKED).toBe('ui:continue:clicked');
    });

    it('依頼受注フェーズイベントが定義されている', () => {
      expect(UIActionEvents.QUEST_SELECTED).toBe('ui:quest:selected');
      expect(UIActionEvents.QUEST_ACCEPTED).toBe('ui:quest:accepted');
      expect(UIActionEvents.QUEST_PHASE_COMPLETED).toBe(
        'ui:questPhase:completed'
      );
    });

    it('採取フェーズイベントが定義されている', () => {
      expect(UIActionEvents.GATHERING_CARD_SELECTED).toBe(
        'ui:gatheringCard:selected'
      );
      expect(UIActionEvents.MATERIAL_OPTION_SELECTED).toBe(
        'ui:materialOption:selected'
      );
      expect(UIActionEvents.GATHERING_CONFIRMED).toBe('ui:gathering:confirmed');
      expect(UIActionEvents.GATHERING_SKIPPED).toBe('ui:gathering:skipped');
    });

    it('調合フェーズイベントが定義されている', () => {
      expect(UIActionEvents.RECIPE_CARD_SELECTED).toBe(
        'ui:recipeCard:selected'
      );
      expect(UIActionEvents.MATERIAL_SLOT_SELECTED).toBe(
        'ui:materialSlot:selected'
      );
      expect(UIActionEvents.ALCHEMY_CONFIRMED).toBe('ui:alchemy:confirmed');
      expect(UIActionEvents.ALCHEMY_SKIPPED).toBe('ui:alchemy:skipped');
    });

    it('納品フェーズイベントが定義されている', () => {
      expect(UIActionEvents.DELIVERY_ITEM_SELECTED).toBe(
        'ui:deliveryItem:selected'
      );
      expect(UIActionEvents.DELIVERY_CONFIRMED).toBe('ui:delivery:confirmed');
      expect(UIActionEvents.REWARD_CARD_SELECTED).toBe(
        'ui:rewardCard:selected'
      );
    });

    it('ショップイベントが定義されている', () => {
      expect(UIActionEvents.SHOP_ITEM_PURCHASED).toBe('ui:shopItem:purchased');
      expect(UIActionEvents.SHOP_CLOSED).toBe('ui:shop:closed');
    });

    it('日終了イベントが定義されている', () => {
      expect(UIActionEvents.DAY_END_CONFIRMED).toBe('ui:dayEnd:confirmed');
    });

    it('セーブ・ロードイベントが定義されている', () => {
      expect(UIActionEvents.SAVE_REQUESTED).toBe('ui:save:requested');
      expect(UIActionEvents.LOAD_REQUESTED).toBe('ui:load:requested');
    });

    it('UIActionEventsは21種類のイベントを持つ', () => {
      const eventCount = Object.keys(UIActionEvents).length;
      expect(eventCount).toBe(21);
    });
  });

  describe('StateUpdateEvents', () => {
    it('ゲーム状態イベントが定義されている', () => {
      expect(StateUpdateEvents.GAME_STATE_CHANGED).toBe('state:game:changed');
      expect(StateUpdateEvents.PHASE_CHANGED).toBe('state:phase:changed');
      expect(StateUpdateEvents.DAY_CHANGED).toBe('state:day:changed');
    });

    it('リソースイベントが定義されている', () => {
      expect(StateUpdateEvents.GOLD_CHANGED).toBe('state:gold:changed');
      expect(StateUpdateEvents.AP_CHANGED).toBe('state:ap:changed');
      expect(StateUpdateEvents.RANK_CHANGED).toBe('state:rank:changed');
      expect(StateUpdateEvents.CONTRIBUTION_CHANGED).toBe(
        'state:contribution:changed'
      );
    });

    it('手札・デッキイベントが定義されている', () => {
      expect(StateUpdateEvents.HAND_UPDATED).toBe('state:hand:updated');
      expect(StateUpdateEvents.DECK_UPDATED).toBe('state:deck:updated');
    });

    it('インベントリイベントが定義されている', () => {
      expect(StateUpdateEvents.INVENTORY_UPDATED).toBe(
        'state:inventory:updated'
      );
    });

    it('依頼イベントが定義されている', () => {
      expect(StateUpdateEvents.QUESTS_UPDATED).toBe('state:quests:updated');
      expect(StateUpdateEvents.ACTIVE_QUESTS_UPDATED).toBe(
        'state:activeQuests:updated'
      );
    });

    it('StateUpdateEventsは12種類のイベントを持つ', () => {
      const eventCount = Object.keys(StateUpdateEvents).length;
      expect(eventCount).toBe(12);
    });
  });

  describe('UIDialogEvents', () => {
    it('ダイアログイベントが定義されている', () => {
      expect(UIDialogEvents.DIALOG_OPENED).toBe('ui:dialog:opened');
      expect(UIDialogEvents.DIALOG_CLOSED).toBe('ui:dialog:closed');
      expect(UIDialogEvents.TOAST_SHOWN).toBe('ui:toast:shown');
    });

    it('UIDialogEventsは3種類のイベントを持つ', () => {
      const eventCount = Object.keys(UIDialogEvents).length;
      expect(eventCount).toBe(3);
    });
  });

  describe('SceneEvents', () => {
    it('シーンイベントが定義されている', () => {
      expect(SceneEvents.SCENE_READY).toBe('scene:ready');
      expect(SceneEvents.SCENE_SHUTDOWN).toBe('scene:shutdown');
    });

    it('SceneEventsは2種類のイベントを持つ', () => {
      const eventCount = Object.keys(SceneEvents).length;
      expect(eventCount).toBe(2);
    });
  });

  describe('AllEventKeys', () => {
    it('すべてのイベントキーを含む配列が存在する', () => {
      expect(Array.isArray(AllEventKeys)).toBe(true);
    });

    it('合計38種類のイベントが定義されている', () => {
      // UIAction: 21 + StateUpdate: 12 + Dialog: 3 + Scene: 2 = 38
      expect(AllEventKeys.length).toBe(38);
    });

    it('すべてのイベントキーが一意である', () => {
      const uniqueKeys = new Set(AllEventKeys);
      expect(uniqueKeys.size).toBe(AllEventKeys.length);
    });

    it('すべてのイベントキーがnamespace:entity:action形式またはnamespace:action形式に従う', () => {
      // namespace:entity:action 形式（例: ui:quest:selected）
      // または namespace:action 形式（例: scene:ready）
      const pattern = /^(ui|state|scene):[a-zA-Z]+(?::[a-zA-Z]+)?$/;
      AllEventKeys.forEach((key) => {
        expect(key).toMatch(pattern);
      });
    });
  });
});
