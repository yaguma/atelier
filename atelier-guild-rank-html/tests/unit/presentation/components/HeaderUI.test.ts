/**
 * ヘッダーUIテスト
 * @description TASK-0124 ヘッダーUI（ランク・日数・ゴールド）
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HeaderUI, HeaderState } from '../../../../src/presentation/components/HeaderUI';

describe('HeaderUI', () => {
  let headerUI: HeaderUI;
  let container: HTMLElement;

  const defaultState: HeaderState = {
    rankName: 'G',
    rankProgress: 120,
    rankProgressMax: 300,
    remainingDays: 15,
    gold: 100,
    actionPoints: 3,
    maxActionPoints: 3,
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    headerUI = new HeaderUI();
  });

  afterEach(() => {
    headerUI.destroy();
    document.body.removeChild(container);
  });

  describe('表示要素', () => {
    it('現在ランクが表示される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Assert
      const rankElement = container.querySelector('.header-rank');
      expect(rankElement).not.toBeNull();
      expect(rankElement?.textContent).toContain('G');
    });

    it('昇格ゲージが表示される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Assert
      const progressBar = container.querySelector('.rank-progress-bar');
      expect(progressBar).not.toBeNull();
      const progressFill = container.querySelector('.rank-progress-fill') as HTMLElement;
      expect(progressFill).not.toBeNull();
      // 120/300 = 40%
      expect(progressFill?.style.width).toBe('40%');
    });

    it('昇格ゲージの数値が表示される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Assert
      const progressText = container.querySelector('.rank-progress-text');
      expect(progressText).not.toBeNull();
      expect(progressText?.textContent).toContain('120');
      expect(progressText?.textContent).toContain('300');
    });

    it('ランク維持日数が表示される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Assert
      const daysElement = container.querySelector('.header-days');
      expect(daysElement).not.toBeNull();
      expect(daysElement?.textContent).toContain('15');
      expect(daysElement?.textContent).toContain('日');
    });

    it('所持ゴールドが表示される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Assert
      const goldElement = container.querySelector('.header-gold');
      expect(goldElement).not.toBeNull();
      expect(goldElement?.textContent).toContain('100');
      expect(goldElement?.textContent).toContain('G');
    });

    it('行動ポイントが表示される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Assert
      const apElement = container.querySelector('.header-action-points');
      expect(apElement).not.toBeNull();
      const apIcons = container.querySelectorAll('.action-point-icon.active');
      expect(apIcons.length).toBe(3);
    });

    it('行動ポイントが減少した場合の表示', () => {
      // Arrange
      headerUI.setState({ ...defaultState, actionPoints: 1 });
      headerUI.mount(container);

      // Assert
      const activeIcons = container.querySelectorAll('.action-point-icon.active');
      const inactiveIcons = container.querySelectorAll('.action-point-icon:not(.active)');
      expect(activeIcons.length).toBe(1);
      expect(inactiveIcons.length).toBe(2);
    });
  });

  describe('状態更新', () => {
    it('状態変更時にUIが更新される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Act - 状態を更新
      headerUI.setState({
        rankName: 'F',
        rankProgress: 200,
        rankProgressMax: 400,
        remainingDays: 10,
        gold: 250,
        actionPoints: 2,
        maxActionPoints: 3,
      });

      // Assert
      expect(container.querySelector('.header-rank')?.textContent).toContain('F');
      expect(container.querySelector('.header-days')?.textContent).toContain('10');
      expect(container.querySelector('.header-gold')?.textContent).toContain('250');
      const activeIcons = container.querySelectorAll('.action-point-icon.active');
      expect(activeIcons.length).toBe(2);
    });

    it('ランクが更新される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Act
      headerUI.setRank('F');

      // Assert
      expect(container.querySelector('.header-rank')?.textContent).toContain('F');
    });

    it('昇格ポイントが更新される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Act
      headerUI.setRankProgress(250, 300);

      // Assert
      const progressFill = container.querySelector('.rank-progress-fill') as HTMLElement;
      expect(progressFill?.style.width).toBe('83.33%');
      expect(container.querySelector('.rank-progress-text')?.textContent).toContain('250');
    });

    it('残り日数が更新される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Act
      headerUI.setRemainingDays(5);

      // Assert
      expect(container.querySelector('.header-days')?.textContent).toContain('5');
    });

    it('ゴールドが更新される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Act
      headerUI.setGold(999);

      // Assert
      expect(container.querySelector('.header-gold')?.textContent).toContain('999');
    });

    it('行動ポイントが更新される', () => {
      // Arrange
      headerUI.setState(defaultState);
      headerUI.mount(container);

      // Act
      headerUI.setActionPoints(0, 3);

      // Assert
      const activeIcons = container.querySelectorAll('.action-point-icon.active');
      expect(activeIcons.length).toBe(0);
    });
  });

  describe('警告表示', () => {
    it('残り日数が少ない場合に警告スタイルが適用される', () => {
      // Arrange
      headerUI.setState({ ...defaultState, remainingDays: 3 });
      headerUI.mount(container);

      // Assert
      const daysElement = container.querySelector('.header-days');
      expect(daysElement?.classList.contains('warning')).toBe(true);
    });

    it('行動ポイントが0の場合に警告スタイルが適用される', () => {
      // Arrange
      headerUI.setState({ ...defaultState, actionPoints: 0 });
      headerUI.mount(container);

      // Assert
      const apElement = container.querySelector('.header-action-points');
      expect(apElement?.classList.contains('depleted')).toBe(true);
    });
  });
});
