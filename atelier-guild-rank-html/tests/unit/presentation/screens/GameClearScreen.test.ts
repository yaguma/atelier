/**
 * ゲームクリア画面UIテスト
 * @description TASK-0131 リザルト画面UI（クリア）
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GameClearScreen,
  GameStatistics,
  Achievement,
} from '../../../../src/presentation/screens/GameClearScreen';

describe('GameClearScreen', () => {
  let screen: GameClearScreen;
  let container: HTMLElement;

  const mockStatistics: GameStatistics = {
    totalDays: 120,
    totalQuests: 45,
    totalItems: 200,
    totalGold: 15000,
    highestQuality: 98,
  };

  const mockAchievements: Achievement[] = [
    {
      id: 'ach-1',
      name: 'マスターアルケミスト',
      description: 'Sランクに到達',
      icon: '🏆',
    },
    {
      id: 'ach-2',
      name: '納品王',
      description: '100個以上のアイテムを納品',
      icon: '📦',
    },
    {
      id: 'ach-3',
      name: '品質マニア',
      description: '品質90以上のアイテムを作成',
      icon: '✨',
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    screen = new GameClearScreen();
  });

  afterEach(() => {
    screen.destroy();
    document.body.removeChild(container);
  });

  describe('クリアメッセージ', () => {
    it('「CONGRATULATIONS!」が表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.mount(container);

      // Assert
      const congratsMessage = container.querySelector('.congrats-message');
      expect(congratsMessage).not.toBeNull();
      expect(congratsMessage?.textContent).toContain('CONGRATULATIONS');
    });

    it('クリアタイトルが表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.mount(container);

      // Assert
      const title = container.querySelector('.screen-title');
      expect(title).not.toBeNull();
      expect(title?.textContent).toContain('ゲームクリア');
    });
  });

  describe('最終ランク表示', () => {
    it('最終ランク（S）が表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.mount(container);

      // Assert
      const rankDisplay = container.querySelector('.final-rank');
      expect(rankDisplay).not.toBeNull();
      expect(rankDisplay?.textContent).toContain('S');
    });

    it('ランクに応じたスタイルが適用される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.mount(container);

      // Assert
      const rankDisplay = container.querySelector('.final-rank');
      expect(rankDisplay?.classList.contains('rank-s')).toBe(true);
    });
  });

  describe('プレイ統計表示', () => {
    it('プレイ統計が表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.setStatistics(mockStatistics);
      screen.mount(container);

      // Assert
      const statsDisplay = container.querySelector('.play-statistics');
      expect(statsDisplay).not.toBeNull();
    });

    it('総プレイ日数が表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.setStatistics(mockStatistics);
      screen.mount(container);

      // Assert
      const statsDisplay = container.querySelector('.play-statistics');
      expect(statsDisplay?.textContent).toContain('120');
    });

    it('依頼完了数が表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.setStatistics(mockStatistics);
      screen.mount(container);

      // Assert
      const statsDisplay = container.querySelector('.play-statistics');
      expect(statsDisplay?.textContent).toContain('45');
    });

    it('調合アイテム数が表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.setStatistics(mockStatistics);
      screen.mount(container);

      // Assert
      const statsDisplay = container.querySelector('.play-statistics');
      expect(statsDisplay?.textContent).toContain('200');
    });

    it('獲得ゴールドが表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.setStatistics(mockStatistics);
      screen.mount(container);

      // Assert
      const statsDisplay = container.querySelector('.play-statistics');
      expect(statsDisplay?.textContent).toContain('15000');
    });

    it('最高品質が表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.setStatistics(mockStatistics);
      screen.mount(container);

      // Assert
      const statsDisplay = container.querySelector('.play-statistics');
      expect(statsDisplay?.textContent).toContain('98');
    });
  });

  describe('称号表示', () => {
    it('称号が表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.setAchievements(mockAchievements);
      screen.mount(container);

      // Assert
      const achievementCards = container.querySelectorAll('.achievement-card');
      expect(achievementCards.length).toBe(3);
    });

    it('称号名と説明が表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.setAchievements(mockAchievements);
      screen.mount(container);

      // Assert
      const firstAchievement = container.querySelector('.achievement-card');
      expect(firstAchievement?.textContent).toContain('マスターアルケミスト');
      expect(firstAchievement?.textContent).toContain('Sランクに到達');
    });

    it('称号アイコンが表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.setAchievements(mockAchievements);
      screen.mount(container);

      // Assert
      const achievementIcon = container.querySelector('.achievement-icon');
      expect(achievementIcon?.textContent).toContain('🏆');
    });
  });

  describe('祝福エフェクト', () => {
    it('祝福エフェクトが再生される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.mount(container);

      // Assert
      const celebrationEffect = container.querySelector('.celebration-effect');
      expect(celebrationEffect).not.toBeNull();
      expect(celebrationEffect?.classList.contains('playing')).toBe(true);
    });
  });

  describe('タイトルへ戻る', () => {
    it('タイトルへ戻るボタンが表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.mount(container);

      // Assert
      const toTitleBtn = container.querySelector('.to-title-btn');
      expect(toTitleBtn).not.toBeNull();
      expect(toTitleBtn?.textContent).toContain('タイトルへ戻る');
    });

    it('タイトルへ戻るボタンクリックでコールバックが呼ばれる', () => {
      // Arrange
      const onToTitle = vi.fn();
      screen.setFinalRank('S');
      screen.onToTitle(onToTitle);
      screen.mount(container);

      // Act
      const toTitleBtn = container.querySelector('.to-title-btn') as HTMLButtonElement;
      toTitleBtn?.click();

      // Assert
      expect(onToTitle).toHaveBeenCalled();
    });
  });

  describe('ニューゲーム', () => {
    it('ニューゲームボタンが表示される', () => {
      // Arrange
      screen.setFinalRank('S');
      screen.mount(container);

      // Assert
      const newGameBtn = container.querySelector('.new-game-btn');
      expect(newGameBtn).not.toBeNull();
      expect(newGameBtn?.textContent).toContain('ニューゲーム');
    });

    it('ニューゲームボタンクリックでコールバックが呼ばれる', () => {
      // Arrange
      const onNewGame = vi.fn();
      screen.setFinalRank('S');
      screen.onNewGame(onNewGame);
      screen.mount(container);

      // Act
      const newGameBtn = container.querySelector('.new-game-btn') as HTMLButtonElement;
      newGameBtn?.click();

      // Assert
      expect(onNewGame).toHaveBeenCalled();
    });
  });
});
