/**
 * PhaseIndicatorConstants テスト
 *
 * フェーズインジケーター定数のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  PhaseIndicatorLayout,
  PhaseColors,
  PhaseInfo,
} from '../../../../../src/game/ui/phases/PhaseIndicatorConstants';
import { GamePhase } from '../../../../../src/domain/common/types';

describe('PhaseIndicatorConstants', () => {
  describe('PhaseIndicatorLayout', () => {
    it('基本レイアウト定数が定義されている', () => {
      expect(PhaseIndicatorLayout.X).toBeTypeOf('number');
      expect(PhaseIndicatorLayout.Y).toBeTypeOf('number');
      expect(PhaseIndicatorLayout.ITEM_WIDTH).toBeTypeOf('number');
      expect(PhaseIndicatorLayout.ITEM_HEIGHT).toBeTypeOf('number');
    });

    it('アイテムサイズが正の数', () => {
      expect(PhaseIndicatorLayout.ITEM_WIDTH).toBeGreaterThan(0);
      expect(PhaseIndicatorLayout.ITEM_HEIGHT).toBeGreaterThan(0);
    });

    it('間隔が0以上', () => {
      expect(PhaseIndicatorLayout.ITEM_SPACING).toBeGreaterThanOrEqual(0);
    });

    it('コネクタサイズが定義されている', () => {
      expect(PhaseIndicatorLayout.CONNECTOR_WIDTH).toBeGreaterThan(0);
      expect(PhaseIndicatorLayout.CONNECTOR_HEIGHT).toBeGreaterThan(0);
    });

    it('4つのフェーズが横並びで配置できる', () => {
      const totalWidth =
        PhaseIndicatorLayout.ITEM_WIDTH * 4 +
        PhaseIndicatorLayout.ITEM_SPACING * 3 +
        PhaseIndicatorLayout.CONNECTOR_WIDTH * 3;
      expect(totalWidth).toBeGreaterThan(0);
      expect(totalWidth).toBeLessThanOrEqual(1280); // 画面幅内に収まる
    });
  });

  describe('PhaseColors', () => {
    it('アクティブ色が定義されている', () => {
      expect(PhaseColors.ACTIVE_BG).toBeTypeOf('number');
      expect(PhaseColors.ACTIVE_BORDER).toBeTypeOf('number');
    });

    it('非アクティブ色が定義されている', () => {
      expect(PhaseColors.INACTIVE_BG).toBeTypeOf('number');
      expect(PhaseColors.INACTIVE_BORDER).toBeTypeOf('number');
    });

    it('完了色が定義されている', () => {
      expect(PhaseColors.COMPLETED_BG).toBeTypeOf('number');
    });

    it('コネクタ色が定義されている', () => {
      expect(PhaseColors.CONNECTOR_ACTIVE).toBeTypeOf('number');
      expect(PhaseColors.CONNECTOR_INACTIVE).toBeTypeOf('number');
    });

    it('アクティブ色と非アクティブ色は異なる', () => {
      expect(PhaseColors.ACTIVE_BG).not.toBe(PhaseColors.INACTIVE_BG);
      expect(PhaseColors.ACTIVE_BORDER).not.toBe(PhaseColors.INACTIVE_BORDER);
    });
  });

  describe('PhaseInfo', () => {
    it('全フェーズの情報が定義されている', () => {
      expect(PhaseInfo[GamePhase.QUEST_ACCEPT]).toBeDefined();
      expect(PhaseInfo[GamePhase.GATHERING]).toBeDefined();
      expect(PhaseInfo[GamePhase.ALCHEMY]).toBeDefined();
      expect(PhaseInfo[GamePhase.DELIVERY]).toBeDefined();
    });

    it('各フェーズにラベルがある', () => {
      expect(PhaseInfo[GamePhase.QUEST_ACCEPT].label).toBe('依頼受注');
      expect(PhaseInfo[GamePhase.GATHERING].label).toBe('採取');
      expect(PhaseInfo[GamePhase.ALCHEMY].label).toBe('調合');
      expect(PhaseInfo[GamePhase.DELIVERY].label).toBe('納品');
    });

    it('各フェーズにアイコンがある', () => {
      expect(PhaseInfo[GamePhase.QUEST_ACCEPT].icon).toBeTypeOf('string');
      expect(PhaseInfo[GamePhase.GATHERING].icon).toBeTypeOf('string');
      expect(PhaseInfo[GamePhase.ALCHEMY].icon).toBeTypeOf('string');
      expect(PhaseInfo[GamePhase.DELIVERY].icon).toBeTypeOf('string');
    });

    it('アイコンが空でない', () => {
      expect(PhaseInfo[GamePhase.QUEST_ACCEPT].icon.length).toBeGreaterThan(0);
      expect(PhaseInfo[GamePhase.GATHERING].icon.length).toBeGreaterThan(0);
      expect(PhaseInfo[GamePhase.ALCHEMY].icon.length).toBeGreaterThan(0);
      expect(PhaseInfo[GamePhase.DELIVERY].icon.length).toBeGreaterThan(0);
    });
  });
});
