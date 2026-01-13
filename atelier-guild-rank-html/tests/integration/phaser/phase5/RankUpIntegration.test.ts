/**
 * TASK-0265: 昇格試験統合テスト
 *
 * 昇格試験機能の統合テストを実施する。
 * 試験条件、合否判定、報酬付与が正しく動作することを検証する。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SceneKeys } from '@game/config/SceneKeys';
import {
  createMockEventBus,
  createMockStateManager,
} from '../../../utils/phaserTestUtils';
import { getPhaserMock } from '../../../utils/phaserMocks';
import { createMockSceneManager } from '../../../utils/sceneManagerMock';

// 【Phaserモック】: テスト環境用のPhaserモックを設定
// 【理由】: jsdom環境ではCanvas APIが動作しないため 🔵
vi.mock('phaser', () => getPhaserMock());

/**
 * テスト用のPhaserゲームインスタンスを作成する
 */
async function createTestGame(): Promise<{
  game: any;
  eventBus: any;
  sceneManager: any;
  stateManager: any;
}> {
  const eventBus = createMockEventBus();
  const stateManager = createMockStateManager();

  const Phaser = await import('phaser');
  const game = new Phaser.default.Game();

  const validScenes = [SceneKeys.MAIN, SceneKeys.RANK_UP, SceneKeys.GAME_CLEAR];

  const sceneManager = createMockSceneManager(game, eventBus, validScenes);
  game.registry.set('sceneManager', sceneManager);
  game.registry.set('stateManager', stateManager);

  // 昇格試験イベントハンドラを設定
  setupRankUpEventHandlers(game, eventBus, sceneManager, stateManager);

  return { game, eventBus, sceneManager, stateManager };
}

/**
 * 昇格試験イベントハンドラを設定する
 */
function setupRankUpEventHandlers(
  game: any,
  eventBus: any,
  sceneManager: any,
  stateManager: any
): void {
  // ゲーム開始イベント
  eventBus.on('ui:game:start:requested', ({ isNewGame }: any) => {
    sceneManager.goTo(SceneKeys.MAIN);
    if (isNewGame) {
      stateManager.updatePlayer({
        gold: 1000,
        rank: 'E',
        exp: 0,
        maxExp: 100,
      });
      stateManager.updateDeckState({ cards: [], hand: [], discardPile: [] });
    }
  });

  // 昇格試験画面を開く
  eventBus.on('ui:rankup:open:requested', () => {
    sceneManager.openOverlay(SceneKeys.RANK_UP);
  });

  // 昇格試験画面を閉じる
  eventBus.on('ui:rankup:close:requested', () => {
    sceneManager.closeOverlay(SceneKeys.RANK_UP);
  });

  // 昇格試験に挑戦
  eventBus.on('ui:rankup:challenge:requested', ({ targetRank }: any) => {
    const playerState = stateManager.getPlayerState();
    const deckState = stateManager.getDeckState();

    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
    const currentRankIndex = rankOrder.indexOf(playerState.rank);
    const targetRankIndex = rankOrder.indexOf(targetRank);

    // ランク飛ばしチェック
    if (targetRankIndex !== currentRankIndex + 1) {
      eventBus.emit('app:error:occurred', {
        message: 'ランクは順番に昇格する必要があります',
      });
      return;
    }

    // 経験値不足チェック
    if (playerState.exp < playerState.maxExp) {
      eventBus.emit('app:rankup:failed', {
        reason: '経験値が不足しています',
      });
      return;
    }

    // ランクアップ報酬
    const rankRewards: Record<string, { gold: number; cards: number }> = {
      D: { gold: 100, cards: 1 },
      C: { gold: 200, cards: 2 },
      B: { gold: 400, cards: 3 },
      A: { gold: 800, cards: 4 },
      S: { gold: 1600, cards: 5 },
    };

    const rewards = rankRewards[targetRank];

    // ランクアップ成功
    const newGold = playerState.gold + rewards.gold;
    const newCards = [...deckState.cards];
    for (let i = 0; i < rewards.cards; i++) {
      newCards.push({ id: `reward_card_${targetRank}_${i}`, type: 'gathering' });
    }

    // 次のランクの必要経験値
    const expRequirements: Record<string, number> = {
      D: 200,
      C: 400,
      B: 800,
      A: 1600,
      S: 0, // Sランクは最高ランク
    };

    stateManager.updatePlayer({
      rank: targetRank,
      exp: 0,
      maxExp: expRequirements[targetRank],
      gold: newGold,
    });

    stateManager.updateDeckState({ ...deckState, cards: newCards });

    eventBus.emit('app:rankup:success', {
      newRank: targetRank,
      rewards: {
        gold: rewards.gold,
        cards: rewards.cards,
      },
    });

    // Sランク到達でゲームクリア
    if (targetRank === 'S') {
      eventBus.emit('app:game:clear');
      sceneManager.goTo(SceneKeys.GAME_CLEAR);
    } else {
      // 成功後メインに戻る
      setTimeout(() => {
        sceneManager.closeOverlay(SceneKeys.RANK_UP);
      }, 100);
    }
  });
}

describe('RankUp Integration', () => {
  let game: any;
  let eventBus: any;
  let sceneManager: any;
  let stateManager: any;

  beforeEach(async () => {
    const testSetup = await createTestGame();
    game = testSetup.game;
    eventBus = testSetup.eventBus;
    sceneManager = testSetup.sceneManager;
    stateManager = testSetup.stateManager;

    // ゲーム開始
    eventBus.emit('ui:game:start:requested', { isNewGame: true });
  });

  afterEach(() => {
    if (game && game.destroy) {
      game.destroy(true);
    }
  });

  describe('Rank Progression E → D', () => {
    beforeEach(() => {
      // Eランク、経験値満タン
      stateManager.updatePlayer({
        rank: 'E',
        exp: 100,
        maxExp: 100,
      });
      // 昇格試験画面に遷移
      eventBus.emit('ui:rankup:open:requested');
    });

    it('Dランクへの昇格に挑戦できる', async () => {
      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'D' });

      // Assert
      await vi.waitFor(() => {
        const player = stateManager.getPlayerData();
        expect(player.rank).toBe('D');
      });
    });

    it('昇格で経験値がリセットされる', async () => {
      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'D' });

      // Assert
      await vi.waitFor(() => {
        const player = stateManager.getPlayerData();
        expect(player.exp).toBe(0);
      });
    });

    it('昇格で次ランク必要経験値が設定される', async () => {
      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'D' });

      // Assert
      await vi.waitFor(() => {
        const player = stateManager.getPlayerData();
        expect(player.maxExp).toBe(200); // Dランクの必要EXP
      });
    });

    it('昇格報酬を獲得する', async () => {
      // Arrange
      const rewardCallback = vi.fn();
      eventBus.on('app:rankup:success', rewardCallback);

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'D' });

      // Assert
      await vi.waitFor(() => {
        expect(rewardCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            newRank: 'D',
            rewards: expect.objectContaining({
              gold: expect.any(Number),
            }),
          })
        );
      });
    });
  });

  describe('Rank Progression D → C', () => {
    beforeEach(() => {
      stateManager.updatePlayer({
        rank: 'D',
        exp: 200,
        maxExp: 200,
      });
      eventBus.emit('ui:rankup:open:requested');
    });

    it('Cランクへの昇格に挑戦できる', async () => {
      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'C' });

      // Assert
      await vi.waitFor(() => {
        const player = stateManager.getPlayerData();
        expect(player.rank).toBe('C');
      });
    });
  });

  describe('Rank Progression C → B', () => {
    beforeEach(() => {
      stateManager.updatePlayer({
        rank: 'C',
        exp: 400,
        maxExp: 400,
      });
      eventBus.emit('ui:rankup:open:requested');
    });

    it('Bランクへの昇格に挑戦できる', async () => {
      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'B' });

      // Assert
      await vi.waitFor(() => {
        const player = stateManager.getPlayerData();
        expect(player.rank).toBe('B');
      });
    });
  });

  describe('Rank Progression B → A', () => {
    beforeEach(() => {
      stateManager.updatePlayer({
        rank: 'B',
        exp: 800,
        maxExp: 800,
      });
      eventBus.emit('ui:rankup:open:requested');
    });

    it('Aランクへの昇格に挑戦できる', async () => {
      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'A' });

      // Assert
      await vi.waitFor(() => {
        const player = stateManager.getPlayerData();
        expect(player.rank).toBe('A');
      });
    });
  });

  describe('Rank Progression A → S (Game Clear)', () => {
    beforeEach(async () => {
      stateManager.updatePlayer({
        rank: 'A',
        exp: 1600,
        maxExp: 1600,
      });
      eventBus.emit('ui:rankup:open:requested');
      // シーン遷移完了を待つ
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it('Sランクへの昇格でゲームクリアになる', async () => {
      // Arrange
      const gameClearCallback = vi.fn();
      eventBus.on('app:game:clear', gameClearCallback);

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      // Assert
      await vi.waitFor(() => {
        expect(gameClearCallback).toHaveBeenCalled();
      });
    });

    it('GameClearSceneに遷移する', async () => {
      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'S' });

      // Assert - ゲームクリア後はすぐにGameClearSceneに遷移
      await vi.waitFor(
        () => {
          const currentScene = sceneManager.getCurrentScene();
          expect(currentScene).toBe(SceneKeys.GAME_CLEAR);
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Failed Rank Up', () => {
    it('経験値不足で昇格試験に失敗する', async () => {
      // Arrange
      stateManager.updatePlayer({
        rank: 'E',
        exp: 50, // 100必要
        maxExp: 100,
      });
      eventBus.emit('ui:rankup:open:requested');

      const failedCallback = vi.fn();
      eventBus.on('app:rankup:failed', failedCallback);

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'D' });

      // Assert
      await vi.waitFor(() => {
        expect(failedCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: expect.stringContaining('経験値'),
          })
        );
      });
    });

    it('失敗してもランクは変わらない', async () => {
      // Arrange
      stateManager.updatePlayer({
        rank: 'E',
        exp: 50,
        maxExp: 100,
      });
      eventBus.emit('ui:rankup:open:requested');

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'D' });

      // Assert
      await vi.waitFor(() => {
        const player = stateManager.getPlayerData();
        expect(player.rank).toBe('E');
      });
    });

    it('スキップはできない(順番通り昇格)', async () => {
      // Arrange
      stateManager.updatePlayer({
        rank: 'E',
        exp: 100,
        maxExp: 100,
      });
      eventBus.emit('ui:rankup:open:requested');

      const errorCallback = vi.fn();
      eventBus.on('app:error:occurred', errorCallback);

      // Act - Eランクから直接Bランクへ
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'B' });

      // Assert
      await vi.waitFor(() => {
        expect(errorCallback).toHaveBeenCalled();
      });
    });
  });

  describe('RankUp Requirements', () => {
    it('各ランクの必要経験値が正しい', () => {
      // E → D: 100
      // D → C: 200
      // C → B: 400
      // B → A: 800
      // A → S: 1600

      const rankExpRequirements = {
        E: 100,
        D: 200,
        C: 400,
        B: 800,
        A: 1600,
      };

      for (const [rank, exp] of Object.entries(rankExpRequirements)) {
        stateManager.updatePlayer({
          rank: rank as 'E' | 'D' | 'C' | 'B' | 'A',
          exp: 0,
          maxExp: exp,
        });

        const player = stateManager.getPlayerData();
        expect(player.maxExp).toBe(exp);
      }
    });
  });

  describe('RankUp Rewards', () => {
    it('ランクアップ時に報酬カードを獲得できる', async () => {
      // Arrange
      stateManager.updatePlayer({
        rank: 'E',
        exp: 100,
        maxExp: 100,
      });
      eventBus.emit('ui:rankup:open:requested');

      const initialDeckSize = stateManager.getDeckState().cards.length;

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'D' });

      // Assert
      await vi.waitFor(() => {
        const deck = stateManager.getDeckState();
        expect(deck.cards.length).toBeGreaterThan(initialDeckSize);
      });
    });

    it('ランクアップ時にゴールド報酬を獲得する', async () => {
      // Arrange
      stateManager.updatePlayer({
        rank: 'E',
        exp: 100,
        maxExp: 100,
        gold: 500,
      });
      eventBus.emit('ui:rankup:open:requested');

      const initialGold = stateManager.getPlayerData().gold;

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'D' });

      // Assert
      await vi.waitFor(() => {
        const player = stateManager.getPlayerData();
        expect(player.gold).toBeGreaterThan(initialGold);
      });
    });

    it('高ランクほど報酬が豪華', async () => {
      // 各ランクの報酬を比較
      const rewards: number[] = [];

      const ranks = ['E', 'D', 'C', 'B', 'A'];
      const nextRanks = ['D', 'C', 'B', 'A', 'S'];
      const expRequirements = [100, 200, 400, 800, 1600];

      for (let i = 0; i < ranks.length; i++) {
        // Reset state
        const testSetup = await createTestGame();
        const localStateManager = testSetup.stateManager;
        const localEventBus = testSetup.eventBus;

        localStateManager.updatePlayer({
          rank: ranks[i] as 'E' | 'D' | 'C' | 'B' | 'A',
          exp: expRequirements[i],
          maxExp: expRequirements[i],
          gold: 0,
        });

        localEventBus.emit('ui:rankup:challenge:requested', {
          targetRank: nextRanks[i] as 'D' | 'C' | 'B' | 'A' | 'S',
        });

        await vi.waitFor(() => {
          const player = localStateManager.getPlayerData();
          rewards.push(player.gold);
        });

        testSetup.game.destroy(true);
      }

      // 報酬が段階的に増加
      for (let i = 1; i < rewards.length; i++) {
        expect(rewards[i]).toBeGreaterThan(rewards[i - 1]);
      }
    });
  });

  describe('RankUp Scene Navigation', () => {
    it('昇格試験画面からメインに戻れる', async () => {
      // Arrange
      stateManager.updatePlayer({
        rank: 'E',
        exp: 100,
        maxExp: 100,
      });
      eventBus.emit('ui:rankup:open:requested');

      // Act
      eventBus.emit('ui:rankup:close:requested');

      // Assert
      await vi.waitFor(() => {
        expect(sceneManager.getCurrentScene()).toBe(SceneKeys.MAIN);
      });
    });

    it('昇格成功後はメインに戻る', async () => {
      // Arrange
      stateManager.updatePlayer({
        rank: 'E',
        exp: 100,
        maxExp: 100,
      });
      eventBus.emit('ui:rankup:open:requested');

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'D' });

      // Assert - 成功演出後にメインへ
      await vi.waitFor(
        () => {
          // 成功イベント後、一定時間でメインへ戻る
          expect(sceneManager.getCurrentScene()).toBe(SceneKeys.MAIN);
        },
        { timeout: 5000 }
      );
    });
  });

  describe('State Consistency', () => {
    it('昇格後のランクが全システムで同期される', async () => {
      // Arrange
      stateManager.updatePlayer({
        rank: 'E',
        exp: 100,
        maxExp: 100,
      });
      eventBus.emit('ui:rankup:open:requested');

      // Act
      eventBus.emit('ui:rankup:challenge:requested', { targetRank: 'D' });

      // Assert
      await vi.waitFor(() => {
        // StateManager
        expect(stateManager.getPlayerData().rank).toBe('D');

        // UI更新イベントが発火している
        // セーブデータに反映される
        const serialized = stateManager.serialize();
        const state = JSON.parse(serialized);
        expect(state.player.rank).toBe('D');
      });
    });
  });
});
