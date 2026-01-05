/**
 * ドラフト採取フェーズUIテスト
 * @description TASK-0126 ドラフト採取フェーズUI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GatheringPhaseUI,
  DraftCardData,
  GatheredMaterial,
} from '../../../../src/presentation/phases/GatheringPhaseUI';

describe('GatheringPhaseUI', () => {
  let phaseUI: GatheringPhaseUI;
  let container: HTMLElement;

  const mockDraftCards: DraftCardData[] = [
    {
      id: 'card-1',
      name: '近くの森',
      materials: [
        { name: '薬草', quantity: 2 },
        { name: '木の実', quantity: 1 },
      ],
    },
    {
      id: 'card-2',
      name: '川辺',
      materials: [
        { name: '清水', quantity: 3 },
        { name: '魚', quantity: 1 },
      ],
    },
    {
      id: 'card-3',
      name: '山麓の岩場',
      materials: [
        { name: '鉱石', quantity: 2 },
        { name: '宝石', quantity: 1 },
      ],
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    phaseUI = new GatheringPhaseUI();
  });

  afterEach(() => {
    phaseUI.destroy();
    document.body.removeChild(container);
  });

  describe('ドラフトカード表示', () => {
    it('ドラフトカード3枚が表示される', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.mount(container);

      // Assert
      const draftCards = container.querySelectorAll('.draft-card');
      expect(draftCards.length).toBe(3);
    });

    it('カードに採取地名と素材が表示される', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.mount(container);

      // Assert
      const firstCard = container.querySelector('.draft-card');
      expect(firstCard?.textContent).toContain('近くの森');
      expect(firstCard?.textContent).toContain('薬草');
      expect(firstCard?.textContent).toContain('2');
    });
  });

  describe('ラウンド表示', () => {
    it('ラウンド数が表示される', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.setRound(1, 3);
      phaseUI.mount(container);

      // Assert
      const roundDisplay = container.querySelector('.round-display');
      expect(roundDisplay).not.toBeNull();
      expect(roundDisplay?.textContent).toContain('1');
      expect(roundDisplay?.textContent).toContain('3');
    });

    it('ラウンドが更新される', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.setRound(1, 3);
      phaseUI.mount(container);

      // Act
      phaseUI.setRound(2, 3);

      // Assert
      const roundDisplay = container.querySelector('.round-display');
      expect(roundDisplay?.textContent).toContain('2');
    });
  });

  describe('カード選択', () => {
    it('カードを選択できる', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.mount(container);

      // Act
      const firstCard = container.querySelector('.draft-card') as HTMLElement;
      firstCard?.click();

      // Assert
      expect(phaseUI.getSelectedCardId()).toBe('card-1');
    });

    it('選択したカードがハイライトされる', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.mount(container);

      // Act
      const firstCard = container.querySelector('.draft-card') as HTMLElement;
      firstCard?.click();

      // Assert
      expect(firstCard?.classList.contains('selected')).toBe(true);
    });

    it('別のカードを選択すると前の選択が解除される', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.mount(container);
      const cards = container.querySelectorAll('.draft-card');

      // Act
      (cards[0] as HTMLElement).click();
      (cards[1] as HTMLElement).click();

      // Assert
      expect(cards[0].classList.contains('selected')).toBe(false);
      expect(cards[1].classList.contains('selected')).toBe(true);
      expect(phaseUI.getSelectedCardId()).toBe('card-2');
    });
  });

  describe('採取実行', () => {
    it('決定ボタンで素材獲得コールバックが呼ばれる', () => {
      // Arrange
      const onGather = vi.fn();
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.onGather(onGather);
      phaseUI.mount(container);

      // Act - カードを選択して採取
      const firstCard = container.querySelector('.draft-card') as HTMLElement;
      firstCard?.click();
      const gatherBtn = container.querySelector('.gather-btn') as HTMLButtonElement;
      gatherBtn?.click();

      // Assert
      expect(onGather).toHaveBeenCalledWith('card-1');
    });

    it('カード未選択時は決定ボタンが無効', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.mount(container);

      // Assert
      const gatherBtn = container.querySelector('.gather-btn') as HTMLButtonElement;
      expect(gatherBtn?.disabled).toBe(true);
    });
  });

  describe('獲得素材表示', () => {
    it('獲得素材がアニメーション表示される', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.mount(container);

      // Act
      const gatheredMaterials: GatheredMaterial[] = [
        { name: '薬草', quantity: 2 },
        { name: '木の実', quantity: 1 },
      ];
      phaseUI.showGatheredMaterials(gatheredMaterials);

      // Assert
      const gatheredDisplay = container.querySelector('.gathered-materials');
      expect(gatheredDisplay).not.toBeNull();
      expect(gatheredDisplay?.textContent).toContain('薬草');
      expect(gatheredDisplay?.textContent).toContain('2');
      expect(gatheredDisplay?.classList.contains('animating')).toBe(true);
    });

    it('獲得素材表示をクリアできる', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.mount(container);
      const gatheredMaterials: GatheredMaterial[] = [{ name: '薬草', quantity: 2 }];
      phaseUI.showGatheredMaterials(gatheredMaterials);

      // Act
      phaseUI.clearGatheredMaterials();

      // Assert
      const gatheredDisplay = container.querySelector('.gathered-materials');
      expect(gatheredDisplay?.children.length).toBe(0);
    });
  });

  describe('ラウンド進行', () => {
    it('次ラウンドへ進む', () => {
      // Arrange
      const onNextRound = vi.fn();
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.setRound(1, 3);
      phaseUI.onNextRound(onNextRound);
      phaseUI.mount(container);

      // Act - 次ラウンドボタンをクリック
      const nextRoundBtn = container.querySelector('.next-round-btn') as HTMLButtonElement;
      nextRoundBtn?.click();

      // Assert
      expect(onNextRound).toHaveBeenCalled();
    });

    it('全ラウンド終了で次フェーズボタンが表示される', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.setRound(3, 3); // 最終ラウンド
      phaseUI.setAllRoundsCompleted(true);
      phaseUI.mount(container);

      // Assert
      const nextPhaseBtn = container.querySelector('.next-phase-btn');
      expect(nextPhaseBtn).not.toBeNull();
      expect(nextPhaseBtn?.textContent).toContain('次のフェーズへ');
    });

    it('全ラウンド終了で次フェーズコールバックが呼ばれる', () => {
      // Arrange
      const onNextPhase = vi.fn();
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.setRound(3, 3);
      phaseUI.setAllRoundsCompleted(true);
      phaseUI.onNextPhase(onNextPhase);
      phaseUI.mount(container);

      // Act
      const nextPhaseBtn = container.querySelector('.next-phase-btn') as HTMLButtonElement;
      nextPhaseBtn?.click();

      // Assert
      expect(onNextPhase).toHaveBeenCalled();
    });
  });

  describe('フェーズタイトル', () => {
    it('フェーズタイトルが表示される', () => {
      // Arrange
      phaseUI.setDraftCards(mockDraftCards);
      phaseUI.mount(container);

      // Assert
      const title = container.querySelector('.phase-title');
      expect(title).not.toBeNull();
      expect(title?.textContent).toContain('ドラフト採取');
    });
  });
});
