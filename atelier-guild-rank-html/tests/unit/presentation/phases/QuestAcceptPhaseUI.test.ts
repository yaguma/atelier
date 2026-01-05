/**
 * 依頼受注フェーズUIテスト
 * @description TASK-0125 依頼受注フェーズUI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  QuestAcceptPhaseUI,
  QuestData,
} from '../../../../src/presentation/phases/QuestAcceptPhaseUI';

describe('QuestAcceptPhaseUI', () => {
  let phaseUI: QuestAcceptPhaseUI;
  let container: HTMLElement;

  const mockQuests: QuestData[] = [
    {
      id: 'quest-1',
      name: '回復薬を3個納品',
      description: '初心者向けの依頼です',
      reward: 100,
      requiredItem: '回復薬',
      requiredQuantity: 3,
      difficulty: 1,
    },
    {
      id: 'quest-2',
      name: '魔力草を5個納品',
      description: '素材集めの依頼です',
      reward: 150,
      requiredItem: '魔力草',
      requiredQuantity: 5,
      difficulty: 2,
    },
    {
      id: 'quest-3',
      name: 'エリクサーを1個納品',
      description: '上級者向けの依頼です',
      reward: 500,
      requiredItem: 'エリクサー',
      requiredQuantity: 1,
      difficulty: 3,
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    phaseUI = new QuestAcceptPhaseUI();
  });

  afterEach(() => {
    phaseUI.destroy();
    document.body.removeChild(container);
  });

  describe('依頼一覧表示', () => {
    it('利用可能な依頼一覧が表示される', () => {
      // Arrange
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.mount(container);

      // Assert
      const questCards = container.querySelectorAll('.quest-card');
      expect(questCards.length).toBe(3);
    });

    it('依頼カードに詳細情報が表示される', () => {
      // Arrange
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.mount(container);

      // Assert
      const firstCard = container.querySelector('.quest-card');
      expect(firstCard?.textContent).toContain('回復薬を3個納品');
      expect(firstCard?.textContent).toContain('100');
      expect(firstCard?.querySelector('.quest-reward')).not.toBeNull();
    });

    it('依頼の難易度が表示される', () => {
      // Arrange
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.mount(container);

      // Assert
      const difficultyElements = container.querySelectorAll('.quest-difficulty');
      expect(difficultyElements.length).toBe(3);
    });
  });

  describe('依頼選択', () => {
    it('依頼を選択できる', () => {
      // Arrange
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.mount(container);

      // Act
      const firstCard = container.querySelector('.quest-card') as HTMLElement;
      firstCard?.click();

      // Assert
      expect(phaseUI.getSelectedQuestId()).toBe('quest-1');
    });

    it('選択した依頼がハイライトされる', () => {
      // Arrange
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.mount(container);

      // Act
      const firstCard = container.querySelector('.quest-card') as HTMLElement;
      firstCard?.click();

      // Assert
      expect(firstCard?.classList.contains('selected')).toBe(true);
    });

    it('別の依頼を選択すると前の選択が解除される', () => {
      // Arrange
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.mount(container);
      const cards = container.querySelectorAll('.quest-card');

      // Act
      (cards[0] as HTMLElement).click();
      (cards[1] as HTMLElement).click();

      // Assert
      expect(cards[0].classList.contains('selected')).toBe(false);
      expect(cards[1].classList.contains('selected')).toBe(true);
      expect(phaseUI.getSelectedQuestId()).toBe('quest-2');
    });
  });

  describe('依頼受注', () => {
    it('依頼を受注できる', () => {
      // Arrange
      const onAccept = vi.fn();
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.onQuestAccept(onAccept);
      phaseUI.mount(container);

      // Act - 依頼を選択して受注
      const firstCard = container.querySelector('.quest-card') as HTMLElement;
      firstCard?.click();
      const acceptBtn = container.querySelector('.accept-quest-btn') as HTMLButtonElement;
      acceptBtn?.click();

      // Assert
      expect(onAccept).toHaveBeenCalledWith('quest-1');
    });

    it('受注済み依頼が表示される', () => {
      // Arrange
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.setAcceptedQuests([mockQuests[0]]);
      phaseUI.mount(container);

      // Assert
      const acceptedList = container.querySelector('.accepted-quests');
      expect(acceptedList).not.toBeNull();
      expect(acceptedList?.textContent).toContain('回復薬を3個納品');
    });

    it('受注済み依頼は受注ボタンが無効', () => {
      // Arrange
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.setAcceptedQuests([mockQuests[0]]);
      phaseUI.mount(container);

      // Act
      const firstCard = container.querySelector('.quest-card[data-quest-id="quest-1"]');

      // Assert
      expect(firstCard?.classList.contains('accepted')).toBe(true);
    });
  });

  describe('受注上限', () => {
    it('同時受注上限に達するとボタン非活性', () => {
      // Arrange
      phaseUI.setMaxAcceptableQuests(2);
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.setAcceptedQuests([mockQuests[0], mockQuests[1]]);
      phaseUI.mount(container);

      // Act - 3つ目の依頼を選択
      const thirdCard = container.querySelector(
        '.quest-card[data-quest-id="quest-3"]'
      ) as HTMLElement;
      thirdCard?.click();

      // Assert
      const acceptBtn = container.querySelector('.accept-quest-btn') as HTMLButtonElement;
      expect(acceptBtn?.disabled).toBe(true);
    });

    it('受注数が上限未満なら受注可能', () => {
      // Arrange
      phaseUI.setMaxAcceptableQuests(3);
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.setAcceptedQuests([mockQuests[0]]);
      phaseUI.mount(container);

      // Act
      const secondCard = container.querySelector(
        '.quest-card[data-quest-id="quest-2"]'
      ) as HTMLElement;
      secondCard?.click();

      // Assert
      const acceptBtn = container.querySelector('.accept-quest-btn') as HTMLButtonElement;
      expect(acceptBtn?.disabled).toBe(false);
    });
  });

  describe('次フェーズ遷移', () => {
    it('「次のフェーズへ」ボタンが表示される', () => {
      // Arrange
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.mount(container);

      // Assert
      const nextPhaseBtn = container.querySelector('.next-phase-btn');
      expect(nextPhaseBtn).not.toBeNull();
      expect(nextPhaseBtn?.textContent).toContain('次のフェーズへ');
    });

    it('「次のフェーズへ」クリックでコールバックが呼ばれる', () => {
      // Arrange
      const onNextPhase = vi.fn();
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.setAcceptedQuests([mockQuests[0]]); // 依頼を1つ受注している状態
      phaseUI.onNextPhase(onNextPhase);
      phaseUI.mount(container);

      // Act
      const nextPhaseBtn = container.querySelector('.next-phase-btn') as HTMLButtonElement;
      nextPhaseBtn?.click();

      // Assert
      expect(onNextPhase).toHaveBeenCalled();
    });

    it('依頼を1つも受注していない場合は次フェーズへ進めない', () => {
      // Arrange
      phaseUI.setAvailableQuests(mockQuests);
      phaseUI.setAcceptedQuests([]);
      phaseUI.mount(container);

      // Assert
      const nextPhaseBtn = container.querySelector('.next-phase-btn') as HTMLButtonElement;
      expect(nextPhaseBtn?.disabled).toBe(true);
    });
  });
});
