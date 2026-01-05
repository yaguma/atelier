/**
 * 納品フェーズUIテスト
 * @description TASK-0128 納品フェーズUI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DeliveryPhaseUI,
  AcceptedQuestData,
  InventoryItem,
  DeliveryResult,
} from '../../../../src/presentation/phases/DeliveryPhaseUI';

describe('DeliveryPhaseUI', () => {
  let phaseUI: DeliveryPhaseUI;
  let container: HTMLElement;

  const mockAcceptedQuests: AcceptedQuestData[] = [
    {
      id: 'quest-1',
      name: '回復薬を3個納品',
      requiredItem: '回復薬',
      requiredQuantity: 3,
      reward: 100,
    },
    {
      id: 'quest-2',
      name: '魔力草エキスを2個納品',
      requiredItem: '魔力草エキス',
      requiredQuantity: 2,
      reward: 150,
    },
    {
      id: 'quest-3',
      name: 'エリクサーを1個納品',
      requiredItem: 'エリクサー',
      requiredQuantity: 1,
      reward: 500,
    },
  ];

  const mockInventory: InventoryItem[] = [
    { name: '回復薬', quantity: 5, quality: 60 },
    { name: '魔力草エキス', quantity: 1, quality: 70 },
    { name: '薬草', quantity: 10, quality: 50 },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    phaseUI = new DeliveryPhaseUI();
  });

  afterEach(() => {
    phaseUI.destroy();
    document.body.removeChild(container);
  });

  describe('依頼一覧表示', () => {
    it('受注中依頼一覧が表示される', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.mount(container);

      // Assert
      const questCards = container.querySelectorAll('.quest-card');
      expect(questCards.length).toBe(3);
    });

    it('依頼に名前と必要アイテムが表示される', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.mount(container);

      // Assert
      const firstQuest = container.querySelector('.quest-card');
      expect(firstQuest?.textContent).toContain('回復薬を3個納品');
      expect(firstQuest?.textContent).toContain('回復薬');
      expect(firstQuest?.textContent).toContain('3');
    });
  });

  describe('所持アイテム表示', () => {
    it('所持アイテムが表示される', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.setInventory(mockInventory);
      phaseUI.mount(container);

      // Assert
      const inventoryList = container.querySelector('.inventory-list');
      expect(inventoryList).not.toBeNull();
      expect(inventoryList?.textContent).toContain('回復薬');
      expect(inventoryList?.textContent).toContain('5');
    });

    it('アイテムの品質が表示される', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.setInventory(mockInventory);
      phaseUI.mount(container);

      // Assert
      const inventoryItem = container.querySelector('.inventory-item');
      expect(inventoryItem?.textContent).toContain('60');
    });
  });

  describe('依頼選択', () => {
    it('依頼を選択できる', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.mount(container);

      // Act
      const firstQuest = container.querySelector('.quest-card') as HTMLElement;
      firstQuest?.click();

      // Assert
      expect(phaseUI.getSelectedQuestId()).toBe('quest-1');
    });

    it('選択した依頼がハイライトされる', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.mount(container);

      // Act
      const firstQuest = container.querySelector('.quest-card') as HTMLElement;
      firstQuest?.click();

      // Assert
      expect(firstQuest?.classList.contains('selected')).toBe(true);
    });
  });

  describe('納品可否判定', () => {
    it('納品可能か判定結果が表示される', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.setInventory(mockInventory);
      phaseUI.mount(container);

      // Act - 依頼を選択
      const firstQuest = container.querySelector('.quest-card') as HTMLElement;
      firstQuest?.click();

      // Assert - 回復薬は5個所持、3個必要 → 納品可能
      const deliveryStatus = container.querySelector('.delivery-status');
      expect(deliveryStatus).not.toBeNull();
      expect(deliveryStatus?.classList.contains('can-deliver')).toBe(true);
    });

    it('納品不可の場合に警告が表示される', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.setInventory(mockInventory);
      phaseUI.mount(container);

      // Act - 魔力草エキスは1個所持、2個必要 → 納品不可
      const quests = container.querySelectorAll('.quest-card');
      (quests[1] as HTMLElement).click();

      // Assert
      const deliveryStatus = container.querySelector('.delivery-status');
      expect(deliveryStatus?.classList.contains('cannot-deliver')).toBe(true);
    });
  });

  describe('納品実行', () => {
    it('納品ボタンで納品実行コールバックが呼ばれる', () => {
      // Arrange
      const onDeliver = vi.fn();
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.setInventory(mockInventory);
      phaseUI.onDeliver(onDeliver);
      phaseUI.mount(container);

      // Act - 依頼を選択して納品
      const firstQuest = container.querySelector('.quest-card') as HTMLElement;
      firstQuest?.click();
      const deliverBtn = container.querySelector('.deliver-btn') as HTMLButtonElement;
      deliverBtn?.click();

      // Assert
      expect(onDeliver).toHaveBeenCalledWith('quest-1');
    });

    it('納品不可の場合は納品ボタンが無効', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.setInventory(mockInventory);
      phaseUI.mount(container);

      // Act - 魔力草エキスは不足
      const quests = container.querySelectorAll('.quest-card');
      (quests[1] as HTMLElement).click();

      // Assert
      const deliverBtn = container.querySelector('.deliver-btn') as HTMLButtonElement;
      expect(deliverBtn?.disabled).toBe(true);
    });
  });

  describe('報酬表示', () => {
    it('報酬獲得がアニメーション表示される', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.mount(container);

      // Act
      const result: DeliveryResult = {
        questId: 'quest-1',
        reward: 100,
        rankPoints: 50,
        success: true,
      };
      phaseUI.showDeliveryResult(result);

      // Assert
      const resultDisplay = container.querySelector('.delivery-result');
      expect(resultDisplay).not.toBeNull();
      expect(resultDisplay?.classList.contains('animating')).toBe(true);
      expect(resultDisplay?.textContent).toContain('100');
    });

    it('ランクポイント獲得が表示される', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.mount(container);

      // Act
      const result: DeliveryResult = {
        questId: 'quest-1',
        reward: 100,
        rankPoints: 50,
        success: true,
      };
      phaseUI.showDeliveryResult(result);

      // Assert
      const rankPointsDisplay = container.querySelector('.rank-points-gained');
      expect(rankPointsDisplay?.textContent).toContain('50');
    });
  });

  describe('1日を終える', () => {
    it('「1日を終える」ボタンが表示される', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.mount(container);

      // Assert
      const endDayBtn = container.querySelector('.end-day-btn');
      expect(endDayBtn).not.toBeNull();
      expect(endDayBtn?.textContent).toContain('1日を終える');
    });

    it('「1日を終える」クリックでコールバックが呼ばれる', () => {
      // Arrange
      const onEndDay = vi.fn();
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.onEndDay(onEndDay);
      phaseUI.mount(container);

      // Act
      const endDayBtn = container.querySelector('.end-day-btn') as HTMLButtonElement;
      endDayBtn?.click();

      // Assert
      expect(onEndDay).toHaveBeenCalled();
    });
  });

  describe('フェーズタイトル', () => {
    it('フェーズタイトルが表示される', () => {
      // Arrange
      phaseUI.setAcceptedQuests(mockAcceptedQuests);
      phaseUI.mount(container);

      // Assert
      const title = container.querySelector('.phase-title');
      expect(title).not.toBeNull();
      expect(title?.textContent).toContain('納品');
    });
  });
});
