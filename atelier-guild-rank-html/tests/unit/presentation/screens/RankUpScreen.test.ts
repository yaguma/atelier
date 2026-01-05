/**
 * 昇格試験画面UIテスト
 * @description TASK-0130 昇格試験画面UI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  RankUpScreen,
  ExamChallenge,
  ArtifactChoice,
  ExamResult,
} from '../../../../src/presentation/screens/RankUpScreen';

describe('RankUpScreen', () => {
  let screen: RankUpScreen;
  let container: HTMLElement;

  const mockChallenge: ExamChallenge = {
    targetRank: 'C',
    description: '高品質な回復薬を5個納品せよ',
    targetItem: '回復薬',
    requiredQuantity: 5,
    requiredQuality: 70,
    timeLimitDays: 7,
  };

  const mockArtifacts: ArtifactChoice[] = [
    {
      id: 'artifact-1',
      name: '炎の護符',
      description: '火属性素材の採取確率アップ',
      effect: '+10% 火属性素材',
    },
    {
      id: 'artifact-2',
      name: '水晶の瓶',
      description: '調合品質ボーナス',
      effect: '+5 品質',
    },
    {
      id: 'artifact-3',
      name: '商人の指輪',
      description: '売却価格アップ',
      effect: '+10% 売却価格',
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    screen = new RankUpScreen();
  });

  afterEach(() => {
    screen.destroy();
    document.body.removeChild(container);
  });

  describe('試験課題表示', () => {
    it('試験課題が表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.mount(container);

      // Assert
      const challengeDisplay = container.querySelector('.exam-challenge');
      expect(challengeDisplay).not.toBeNull();
      expect(challengeDisplay?.textContent).toContain('高品質な回復薬を5個納品せよ');
    });

    it('目標ランクが表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.mount(container);

      // Assert
      const targetRank = container.querySelector('.target-rank');
      expect(targetRank).not.toBeNull();
      expect(targetRank?.textContent).toContain('C');
    });

    it('課題の詳細条件が表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.mount(container);

      // Assert
      const requirements = container.querySelector('.exam-requirements');
      expect(requirements).not.toBeNull();
      expect(requirements?.textContent).toContain('回復薬');
      expect(requirements?.textContent).toContain('5');
      expect(requirements?.textContent).toContain('70');
    });
  });

  describe('制限日数表示', () => {
    it('制限日数が表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.mount(container);

      // Assert
      const timeLimitDisplay = container.querySelector('.time-limit');
      expect(timeLimitDisplay).not.toBeNull();
      expect(timeLimitDisplay?.textContent).toContain('7');
    });

    it('残り日数が表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.setRemainingDays(5);
      screen.mount(container);

      // Assert
      const remainingDays = container.querySelector('.remaining-days');
      expect(remainingDays).not.toBeNull();
      expect(remainingDays?.textContent).toContain('5');
    });
  });

  describe('試験開始', () => {
    it('「試験を開始する」ボタンが表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.mount(container);

      // Assert
      const startBtn = container.querySelector('.start-exam-btn');
      expect(startBtn).not.toBeNull();
      expect(startBtn?.textContent).toContain('試験を開始する');
    });

    it('試験開始ボタンクリックでコールバックが呼ばれる', () => {
      // Arrange
      const onStartExam = vi.fn();
      screen.setExamChallenge(mockChallenge);
      screen.onStartExam(onStartExam);
      screen.mount(container);

      // Act
      const startBtn = container.querySelector('.start-exam-btn') as HTMLButtonElement;
      startBtn?.click();

      // Assert
      expect(onStartExam).toHaveBeenCalled();
    });
  });

  describe('試験クリア時報酬表示', () => {
    it('試験クリア時に報酬画面が表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.mount(container);

      // Act
      const result: ExamResult = {
        success: true,
        newRank: 'C',
        rankPoints: 100,
      };
      screen.showExamResult(result);

      // Assert
      const rewardDisplay = container.querySelector('.exam-reward');
      expect(rewardDisplay).not.toBeNull();
      expect(rewardDisplay?.textContent).toContain('C');
    });

    it('昇格報酬のランクポイントが表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.mount(container);

      // Act
      const result: ExamResult = {
        success: true,
        newRank: 'C',
        rankPoints: 100,
      };
      screen.showExamResult(result);

      // Assert
      const rankPointsDisplay = container.querySelector('.reward-rank-points');
      expect(rankPointsDisplay).not.toBeNull();
      expect(rankPointsDisplay?.textContent).toContain('100');
    });
  });

  describe('アーティファクト選択', () => {
    it('アーティファクト選択肢が表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.setArtifactChoices(mockArtifacts);
      screen.mount(container);

      // Act - クリア結果を表示
      const result: ExamResult = {
        success: true,
        newRank: 'C',
        rankPoints: 100,
      };
      screen.showExamResult(result);

      // Assert
      const artifactCards = container.querySelectorAll('.artifact-card');
      expect(artifactCards.length).toBe(3);
    });

    it('アーティファクトを選択できる', () => {
      // Arrange
      const onSelectArtifact = vi.fn();
      screen.setExamChallenge(mockChallenge);
      screen.setArtifactChoices(mockArtifacts);
      screen.onSelectArtifact(onSelectArtifact);
      screen.mount(container);

      // Act - クリア結果を表示してからアーティファクトを選択
      const result: ExamResult = {
        success: true,
        newRank: 'C',
        rankPoints: 100,
      };
      screen.showExamResult(result);

      const firstArtifact = container.querySelector('.artifact-card') as HTMLElement;
      firstArtifact?.click();

      // Assert
      expect(onSelectArtifact).toHaveBeenCalledWith('artifact-1');
    });

    it('選択したアーティファクトがハイライトされる', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.setArtifactChoices(mockArtifacts);
      screen.mount(container);

      // Act - クリア結果を表示してからアーティファクトを選択
      const result: ExamResult = {
        success: true,
        newRank: 'C',
        rankPoints: 100,
      };
      screen.showExamResult(result);

      const firstArtifact = container.querySelector('.artifact-card') as HTMLElement;
      firstArtifact?.click();

      // Assert - 再構築後の要素を取得
      const selectedArtifact = container.querySelector('.artifact-card.selected');
      expect(selectedArtifact).not.toBeNull();
    });

    it('アーティファクトの効果説明が表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.setArtifactChoices(mockArtifacts);
      screen.mount(container);

      // Act - クリア結果を表示
      const result: ExamResult = {
        success: true,
        newRank: 'C',
        rankPoints: 100,
      };
      screen.showExamResult(result);

      // Assert
      const artifactCards = container.querySelectorAll('.artifact-card');
      expect(artifactCards[0].textContent).toContain('炎の護符');
      expect(artifactCards[0].textContent).toContain('+10% 火属性素材');
    });
  });

  describe('試験失敗', () => {
    it('試験失敗時にゲームオーバー画面へのコールバックが呼ばれる', () => {
      // Arrange
      const onExamFailed = vi.fn();
      screen.setExamChallenge(mockChallenge);
      screen.onExamFailed(onExamFailed);
      screen.mount(container);

      // Act
      const result: ExamResult = {
        success: false,
        newRank: 'D',
        rankPoints: 0,
      };
      screen.showExamResult(result);

      // Assert
      expect(onExamFailed).toHaveBeenCalled();
    });

    it('試験失敗時に失敗メッセージが表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.mount(container);

      // Act
      const result: ExamResult = {
        success: false,
        newRank: 'D',
        rankPoints: 0,
      };
      screen.showExamResult(result);

      // Assert
      const failMessage = container.querySelector('.exam-failed');
      expect(failMessage).not.toBeNull();
    });
  });

  describe('画面タイトル', () => {
    it('画面タイトルが表示される', () => {
      // Arrange
      screen.setExamChallenge(mockChallenge);
      screen.mount(container);

      // Assert
      const title = container.querySelector('.screen-title');
      expect(title).not.toBeNull();
      expect(title?.textContent).toContain('昇格試験');
    });
  });

  describe('戻るボタン', () => {
    it('戻るボタンでメイン画面へ遷移できる', () => {
      // Arrange
      const onBack = vi.fn();
      screen.setExamChallenge(mockChallenge);
      screen.onBack(onBack);
      screen.mount(container);

      // Act
      const backBtn = container.querySelector('.back-btn') as HTMLButtonElement;
      backBtn?.click();

      // Assert
      expect(onBack).toHaveBeenCalled();
    });
  });
});
