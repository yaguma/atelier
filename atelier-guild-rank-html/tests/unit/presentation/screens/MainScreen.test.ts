/**
 * メイン画面レイアウトテスト
 * @description TASK-0123 メイン画面レイアウト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MainScreen, GamePhase } from '../../../../src/presentation/screens/MainScreen';

describe('MainScreen Layout', () => {
  let mainScreen: MainScreen;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mainScreen = new MainScreen();
  });

  afterEach(() => {
    mainScreen.destroy();
    document.body.removeChild(container);
  });

  describe('レイアウト構造', () => {
    it('ヘッダーエリアが表示される', () => {
      // Arrange
      mainScreen.mount(container);

      // Assert
      const header = container.querySelector('.main-header');
      expect(header).not.toBeNull();
    });

    it('メインコンテンツエリアが表示される', () => {
      // Arrange
      mainScreen.mount(container);

      // Assert
      const content = container.querySelector('.main-content');
      expect(content).not.toBeNull();
    });

    it('フッターエリアが表示される', () => {
      // Arrange
      mainScreen.mount(container);

      // Assert
      const footer = container.querySelector('.main-footer');
      expect(footer).not.toBeNull();
    });

    it('フェーズインジケーターが表示される', () => {
      // Arrange
      mainScreen.mount(container);

      // Assert
      const phaseIndicator = container.querySelector('.phase-indicator');
      expect(phaseIndicator).not.toBeNull();
    });
  });

  describe('フェーズ管理', () => {
    it('初期フェーズは依頼受注フェーズ', () => {
      // Arrange
      mainScreen.mount(container);

      // Assert
      expect(mainScreen.getCurrentPhase()).toBe('quest');
    });

    it('フェーズに応じてコンテンツが切り替わる', () => {
      // Arrange
      mainScreen.mount(container);

      // Act
      mainScreen.setPhase('gathering');

      // Assert
      expect(mainScreen.getCurrentPhase()).toBe('gathering');
      const content = container.querySelector('.main-content');
      expect(content?.getAttribute('data-phase')).toBe('gathering');
    });

    it('全てのゲームフェーズに切り替え可能', () => {
      // Arrange
      mainScreen.mount(container);
      const phases: GamePhase[] = ['quest', 'gathering', 'synthesis', 'delivery'];

      // Act & Assert
      phases.forEach((phase) => {
        mainScreen.setPhase(phase);
        expect(mainScreen.getCurrentPhase()).toBe(phase);
      });
    });

    it('フェーズインジケーターが現在のフェーズを表示', () => {
      // Arrange
      mainScreen.mount(container);

      // Act
      mainScreen.setPhase('synthesis');

      // Assert
      const indicator = container.querySelector('.phase-indicator');
      expect(indicator?.querySelector('.phase-item.active')?.getAttribute('data-phase')).toBe(
        'synthesis'
      );
    });
  });

  describe('ヘッダー情報スロット', () => {
    it('ヘッダーにコンテンツを設定できる', () => {
      // Arrange
      mainScreen.mount(container);
      const headerContent = document.createElement('div');
      headerContent.className = 'test-header-content';

      // Act
      mainScreen.setHeaderContent(headerContent);

      // Assert
      const header = container.querySelector('.main-header');
      expect(header?.querySelector('.test-header-content')).not.toBeNull();
    });
  });

  describe('フッター情報スロット', () => {
    it('フッターにコンテンツを設定できる', () => {
      // Arrange
      mainScreen.mount(container);
      const footerContent = document.createElement('div');
      footerContent.className = 'test-footer-content';

      // Act
      mainScreen.setFooterContent(footerContent);

      // Assert
      const footer = container.querySelector('.main-footer');
      expect(footer?.querySelector('.test-footer-content')).not.toBeNull();
    });
  });

  describe('フェーズコンテンツスロット', () => {
    it('フェーズ別コンテンツを登録できる', () => {
      // Arrange
      const questContent = document.createElement('div');
      questContent.className = 'quest-phase-content';

      // Act
      mainScreen.registerPhaseContent('quest', questContent);
      mainScreen.mount(container);

      // Assert
      const content = container.querySelector('.main-content');
      expect(content?.querySelector('.quest-phase-content')).not.toBeNull();
    });

    it('フェーズ切替時に対応するコンテンツが表示される', () => {
      // Arrange
      const questContent = document.createElement('div');
      questContent.className = 'quest-content';
      questContent.textContent = 'Quest Phase';

      const gatheringContent = document.createElement('div');
      gatheringContent.className = 'gathering-content';
      gatheringContent.textContent = 'Gathering Phase';

      mainScreen.registerPhaseContent('quest', questContent);
      mainScreen.registerPhaseContent('gathering', gatheringContent);
      mainScreen.mount(container);

      // Act
      mainScreen.setPhase('gathering');

      // Assert
      const content = container.querySelector('.main-content');
      expect(content?.querySelector('.gathering-content')).not.toBeNull();
      // 前のフェーズのコンテンツは非表示
      const questContentEl = content?.querySelector('.quest-content') as HTMLElement;
      expect(questContentEl?.style.display).toBe('none');
    });
  });

  describe('フェーズ変更イベント', () => {
    it('フェーズ変更時にコールバックが呼ばれる', () => {
      // Arrange
      const onPhaseChange = vi.fn();
      mainScreen.onPhaseChange(onPhaseChange);
      mainScreen.mount(container);

      // Act
      mainScreen.setPhase('gathering');

      // Assert
      expect(onPhaseChange).toHaveBeenCalledWith('gathering', 'quest');
    });
  });

  describe('Screen インターフェース', () => {
    it('画面IDが正しい', () => {
      expect(mainScreen.id).toBe('main');
    });

    it('画面名が正しい', () => {
      expect(mainScreen.name).toBe('メイン画面');
    });

    it('onEnter/onExitが呼び出し可能', () => {
      // Assert - エラーなく呼び出せることを確認
      expect(() => mainScreen.onEnter()).not.toThrow();
      expect(() => mainScreen.onExit()).not.toThrow();
    });
  });
});
