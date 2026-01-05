/**
 * ゲームオーバー画面UIテスト
 * @description TASK-0132 リザルト画面UI（ゲームオーバー）
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GameOverScreen,
  GameOverReason,
  GameOverStatistics,
} from '../../../../src/presentation/screens/GameOverScreen';

describe('GameOverScreen', () => {
  let screen: GameOverScreen;
  let container: HTMLElement;

  const mockStatistics: GameOverStatistics = {
    totalDays: 45,
    totalQuests: 15,
    totalItems: 50,
    totalGold: 3000,
    reachedRank: 'D',
  };

  const mockReasons: GameOverReason[] = [
    {
      type: 'exam_failed',
      message: '昇格試験に失敗しました',
    },
    {
      type: 'deadline',
      message: '制限日数を超過しました',
    },
  ];

  const mockHints: string[] = [
    '素材は十分に集めてから調合に挑みましょう',
    '依頼の難易度と報酬のバランスを考慮しましょう',
    '強化カードを活用して品質を上げましょう',
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    screen = new GameOverScreen();
  });

  afterEach(() => {
    screen.destroy();
    document.body.removeChild(container);
  });

  describe('ゲームオーバーメッセージ', () => {
    it('「GAME OVER」が表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.mount(container);

      // Assert
      const gameOverMessage = container.querySelector('.game-over-message');
      expect(gameOverMessage).not.toBeNull();
      expect(gameOverMessage?.textContent).toContain('GAME OVER');
    });

    it('画面タイトルが表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.mount(container);

      // Assert
      const title = container.querySelector('.screen-title');
      expect(title).not.toBeNull();
      expect(title?.textContent).toContain('ゲームオーバー');
    });
  });

  describe('到達ランク表示', () => {
    it('到達ランクが表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.mount(container);

      // Assert
      const rankDisplay = container.querySelector('.reached-rank');
      expect(rankDisplay).not.toBeNull();
      expect(rankDisplay?.textContent).toContain('D');
    });

    it('ランクに応じたスタイルが適用される', () => {
      // Arrange
      screen.setReachedRank('C');
      screen.mount(container);

      // Assert
      const rankDisplay = container.querySelector('.reached-rank');
      expect(rankDisplay?.classList.contains('rank-c')).toBe(true);
    });
  });

  describe('ゲームオーバー理由', () => {
    it('ゲームオーバー理由が表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.setGameOverReasons(mockReasons);
      screen.mount(container);

      // Assert
      const reasonDisplay = container.querySelector('.game-over-reasons');
      expect(reasonDisplay).not.toBeNull();
    });

    it('理由メッセージが表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.setGameOverReasons(mockReasons);
      screen.mount(container);

      // Assert
      const reasonDisplay = container.querySelector('.game-over-reasons');
      expect(reasonDisplay?.textContent).toContain('昇格試験に失敗しました');
    });

    it('複数の理由が表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.setGameOverReasons(mockReasons);
      screen.mount(container);

      // Assert
      const reasonItems = container.querySelectorAll('.reason-item');
      expect(reasonItems.length).toBe(2);
    });
  });

  describe('プレイ統計表示', () => {
    it('プレイ統計が表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.setStatistics(mockStatistics);
      screen.mount(container);

      // Assert
      const statsDisplay = container.querySelector('.play-statistics');
      expect(statsDisplay).not.toBeNull();
    });

    it('プレイ日数が表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.setStatistics(mockStatistics);
      screen.mount(container);

      // Assert
      const statsDisplay = container.querySelector('.play-statistics');
      expect(statsDisplay?.textContent).toContain('45');
    });

    it('依頼完了数が表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.setStatistics(mockStatistics);
      screen.mount(container);

      // Assert
      const statsDisplay = container.querySelector('.play-statistics');
      expect(statsDisplay?.textContent).toContain('15');
    });

    it('調合アイテム数が表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.setStatistics(mockStatistics);
      screen.mount(container);

      // Assert
      const statsDisplay = container.querySelector('.play-statistics');
      expect(statsDisplay?.textContent).toContain('50');
    });
  });

  describe('次回へのヒント', () => {
    it('次回へのヒントが表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.setHints(mockHints);
      screen.mount(container);

      // Assert
      const hintsSection = container.querySelector('.hints-section');
      expect(hintsSection).not.toBeNull();
    });

    it('ヒント内容が表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.setHints(mockHints);
      screen.mount(container);

      // Assert
      const hintItems = container.querySelectorAll('.hint-item');
      expect(hintItems.length).toBe(3);
      expect(hintItems[0].textContent).toContain('素材は十分に集めてから');
    });
  });

  describe('タイトルへ戻る', () => {
    it('タイトルへ戻るボタンが表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.mount(container);

      // Assert
      const toTitleBtn = container.querySelector('.to-title-btn');
      expect(toTitleBtn).not.toBeNull();
      expect(toTitleBtn?.textContent).toContain('タイトルへ戻る');
    });

    it('タイトルへ戻るボタンクリックでコールバックが呼ばれる', () => {
      // Arrange
      const onToTitle = vi.fn();
      screen.setReachedRank('D');
      screen.onToTitle(onToTitle);
      screen.mount(container);

      // Act
      const toTitleBtn = container.querySelector('.to-title-btn') as HTMLButtonElement;
      toTitleBtn?.click();

      // Assert
      expect(onToTitle).toHaveBeenCalled();
    });
  });

  describe('リトライ', () => {
    it('リトライボタンが表示される', () => {
      // Arrange
      screen.setReachedRank('D');
      screen.mount(container);

      // Assert
      const retryBtn = container.querySelector('.retry-btn');
      expect(retryBtn).not.toBeNull();
      expect(retryBtn?.textContent).toContain('リトライ');
    });

    it('リトライボタンクリックでコールバックが呼ばれる', () => {
      // Arrange
      const onRetry = vi.fn();
      screen.setReachedRank('D');
      screen.onRetry(onRetry);
      screen.mount(container);

      // Act
      const retryBtn = container.querySelector('.retry-btn') as HTMLButtonElement;
      retryBtn?.click();

      // Assert
      expect(onRetry).toHaveBeenCalled();
    });
  });
});
