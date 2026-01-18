/**
 * QuestCardUI.spec.ts - 依頼カードUIコンポーネントのテスト
 * TASK-0022 依頼受注フェーズUI
 *
 * @description
 * TC-001〜TC-010: QuestCardUIコンポーネントのユニットテスト
 * - TC-001: カード初期化と表示
 * - TC-002: 受注ボタンクリック処理
 * - TC-003: インタラクティブ動作（ホバー）
 * - TC-004: リソース解放
 * - TC-005: 無効なconfig（null）
 * - TC-006: 無効なconfig.quest（undefined）
 * - TC-007: 無効なonAccept（関数以外）
 * - TC-008: 長いテキストの依頼内容
 * - TC-009: 空文字列の依頼者名
 * - TC-010: 報酬0の依頼
 */

import type { Quest } from '@domain/entities/Quest';
import type { ClientType, QuestType } from '@shared/types';
import { toClientId, toQuestId } from '@shared/types/ids';
import type { IClient, IQuest, QuestDifficulty } from '@shared/types/quests';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QuestCardUI, type QuestCardUIConfig } from './QuestCardUI';

// =============================================================================
// モックヘルパー関数
// =============================================================================

/**
 * Phaserシーンのモックを作成
 */
function createMockScene(): Phaser.Scene {
  const mockScene = {
    add: {
      container: vi.fn().mockReturnValue({
        add: vi.fn(),
        setDepth: vi.fn(),
        destroy: vi.fn(),
        x: 0,
        y: 0,
        active: true,
      }),
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        active: true,
      }),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        emit: vi.fn(),
        listenerCount: vi.fn().mockReturnValue(0),
        active: true,
      }),
    },
    tweens: {
      add: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
      }),
    },
    data: {
      get: vi.fn().mockReturnValue(null),
    },
    plugins: {
      get: vi.fn().mockReturnValue({
        add: {
          sizer: vi.fn(),
        },
      }),
    },
  } as any;

  return mockScene;
}

/**
 * Questモックデータを作成
 */
function createMockQuest(overrides?: Partial<IQuest>): IQuest {
  return {
    id: toQuestId('Q001'),
    clientId: toClientId('C001'),
    condition: {
      type: 'SPECIFIC' as QuestType,
      itemId: 'healing-potion',
    },
    contribution: 50,
    gold: 100,
    deadline: 3,
    difficulty: 'easy' as QuestDifficulty,
    flavorText: 'これは依頼のセリフです',
    ...overrides,
  };
}

/**
 * Clientモックデータを作成
 */
function createMockClient(overrides?: any): IClient {
  const converted = overrides
    ? {
        ...overrides,
        id: overrides.id ? toClientId(overrides.id) : undefined,
      }
    : {};

  return {
    id: toClientId('C001'),
    name: '村人',
    type: 'VILLAGER' as ClientType,
    contributionMultiplier: 1.0,
    goldMultiplier: 1.0,
    deadlineModifier: 0,
    preferredQuestTypes: [],
    unlockRank: 'bronze-5' as any,
    ...converted,
  };
}

/**
 * Questエンティティのモックを作成
 */
function createMockQuestEntity(questData?: any, clientData?: any): Quest {
  // 型変換: idとclientIdを適切な型にキャスト
  const convertedQuestData = questData
    ? {
        ...questData,
        id: questData.id ? toQuestId(questData.id) : undefined,
        clientId: questData.clientId ? toClientId(questData.clientId) : undefined,
      }
    : undefined;

  const convertedClientData = clientData
    ? {
        ...clientData,
        id: clientData.id ? toClientId(clientData.id) : undefined,
      }
    : undefined;

  const mockQuestData = createMockQuest(convertedQuestData as Partial<IQuest>);
  const mockClientData = createMockClient(convertedClientData as Partial<IClient>);
  return {
    data: mockQuestData,
    client: mockClientData,
    id: mockQuestData.id,
    clientId: mockQuestData.clientId,
    condition: mockQuestData.condition,
    baseContribution: mockQuestData.contribution,
    baseGold: mockQuestData.gold,
    deadline: mockQuestData.deadline,
    difficulty: mockQuestData.difficulty,
    flavorText: mockQuestData.flavorText,
  } as Quest;
}

// =============================================================================
// テストスイート
// =============================================================================

describe('QuestCardUI', () => {
  let mockScene: Phaser.Scene;
  let mockQuest: Quest;

  beforeEach(() => {
    // 各テスト実行前にモックを初期化
    mockScene = createMockScene();
    mockQuest = createMockQuestEntity();
  });

  describe('TC-001: カード初期化と表示', () => {
    // 【テスト目的】: QuestCardUIが正しく初期化され、依頼情報が表示されること
    // 【信頼性】: 🔵

    test('QuestCardUIがエラーなく初期化される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
        interactive: true,
        onAccept: vi.fn(),
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      expect(questCard).toBeDefined();
      expect(questCard.getContainer()).toBeDefined();
    });

    test('container.x = 100, container.y = 200 に配置される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      expect(mockScene.add.container).toHaveBeenCalledWith(100, 200);
    });

    test('依頼者名「村人」が表示される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      expect(mockScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('村人'),
        expect.any(Object),
      );
    });

    test('報酬情報「50貢献度 / 100G」が表示される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      expect(mockScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('50'),
        expect.any(Object),
      );
    });

    test('期限「3日」が表示される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      expect(mockScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('3'),
        expect.any(Object),
      );
    });

    test('「受注する」ボタンが表示される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      expect(mockScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('受注'),
        expect.any(Object),
      );
    });
  });

  describe('TC-002: 受注ボタンクリック処理', () => {
    // 【テスト目的】: 受注ボタンをクリックすると、onAcceptコールバックが呼び出されること
    // 【信頼性】: 🔵

    test('onAcceptコールバックが1回呼び出される', () => {
      const mockOnAccept = vi.fn();
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
        onAccept: mockOnAccept,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      // 受注ボタンを取得
      const acceptButton = (questCard as any).acceptButton;
      acceptButton.emit('pointerdown');

      expect(mockOnAccept).toHaveBeenCalledTimes(1);
    });

    test('onAcceptの引数にquestが渡される', () => {
      const mockOnAccept = vi.fn();
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
        onAccept: mockOnAccept,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      const acceptButton = (questCard as any).acceptButton;
      acceptButton.emit('pointerdown');

      expect(mockOnAccept).toHaveBeenCalledWith(mockQuest);
    });
  });

  describe('TC-003: インタラクティブ動作（ホバー）', () => {
    // 【テスト目的】: カードにホバーすると、スケールが1.05倍に拡大されること
    // 【信頼性】: 🟡

    test('Tweenが作成される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
        interactive: true,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      const background = (questCard as any).background;
      background.emit('pointerover');

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    test('スケールが1.05倍になるTweenが実行される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
        interactive: true,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      const background = (questCard as any).background;
      background.emit('pointerover');

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: expect.any(Object),
          scale: 1.05,
          duration: 150,
          ease: 'Quad.Out',
        }),
      );
    });
  });

  describe('TC-004: リソース解放', () => {
    // 【テスト目的】: destroy()が呼ばれると、すべてのGameObjectsが破棄されること
    // 【信頼性】: 🔵

    test('container.destroy()が呼ばれる', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      questCard.destroy();

      expect(questCard.getContainer().destroy).toHaveBeenCalledTimes(1);
    });

    test('すべてのGameObjectsのdestroy()が呼ばれる', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      questCard.destroy();

      expect((questCard as any).background.destroy).toHaveBeenCalled();
      expect((questCard as any).clientNameText.destroy).toHaveBeenCalled();
      expect((questCard as any).dialogueText.destroy).toHaveBeenCalled();
      expect((questCard as any).rewardText.destroy).toHaveBeenCalled();
      expect((questCard as any).acceptButton.destroy).toHaveBeenCalled();
    });
  });

  describe('TC-005: 無効なconfig（null）', () => {
    // 【テスト目的】: configがnullの場合、エラーがスローされること
    // 【信頼性】: 🔵

    test('エラーがスローされる', () => {
      const invalidConfig: any = null;

      const createCard = () => new QuestCardUI(mockScene, invalidConfig);

      expect(createCard).toThrow();
    });

    test('エラーメッセージに「config is required」が含まれる', () => {
      const invalidConfig: any = null;

      const createCard = () => new QuestCardUI(mockScene, invalidConfig);

      expect(createCard).toThrow('config is required');
    });
  });

  describe('TC-006: 無効なconfig.quest（undefined）', () => {
    // 【テスト目的】: config.questがundefinedの場合、エラーがスローされること
    // 【信頼性】: 🔵

    test('エラーがスローされる', () => {
      const invalidConfig: any = {
        x: 100,
        y: 200,
        quest: undefined,
      };

      const createCard = () => new QuestCardUI(mockScene, invalidConfig);

      expect(createCard).toThrow();
    });

    test('エラーメッセージに「config.quest is required」が含まれる', () => {
      const invalidConfig: any = {
        x: 100,
        y: 200,
        quest: undefined,
      };

      const createCard = () => new QuestCardUI(mockScene, invalidConfig);

      expect(createCard).toThrow('config.quest is required');
    });
  });

  describe('TC-007: 無効なonAccept（関数以外）', () => {
    // 【テスト目的】: onAcceptが関数でない場合、警告が出るか無視されること
    // 【信頼性】: 🟡

    test('エラーはスローされない', () => {
      const invalidConfig: any = {
        quest: mockQuest,
        x: 100,
        y: 200,
        onAccept: 'not-a-function',
      };

      const createCard = () => {
        const questCard = new QuestCardUI(mockScene, invalidConfig);
        questCard.create();
      };

      expect(createCard).not.toThrow();
    });

    test('クリックしても何も起きない', () => {
      const invalidConfig: any = {
        quest: mockQuest,
        x: 100,
        y: 200,
        onAccept: 'not-a-function',
      };

      const questCard = new QuestCardUI(mockScene, invalidConfig);
      questCard.create();

      const acceptButton = questCard['acceptButton'];
      const clickButton = () => acceptButton.emit('pointerdown');

      expect(clickButton).not.toThrow();
    });
  });

  describe('TC-008: 長いテキストの依頼内容', () => {
    // 【テスト目的】: 依頼内容が長い場合でも、正しく表示されること
    // 【信頼性】: 🟡

    test('エラーなくカードが作成される', () => {
      const longDialogue = 'これは非常に長い依頼のセリフです。'.repeat(10);
      const mockQuestLongText = createMockQuestEntity({
        id: 'Q002',
        clientId: 'C001',
        flavorText: longDialogue,
      });

      const config: QuestCardUIConfig = {
        quest: mockQuestLongText,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);

      expect(() => questCard.create()).not.toThrow();
      expect(questCard).toBeDefined();
    });

    test('テキストが表示される（wordWrapが有効）', () => {
      const longDialogue = 'これは非常に長い依頼のセリフです。'.repeat(10);
      const mockQuestLongText = createMockQuestEntity({
        id: 'Q002',
        clientId: 'C001',
        flavorText: longDialogue,
      });

      const config: QuestCardUIConfig = {
        quest: mockQuestLongText,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      expect(mockScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining(longDialogue),
        expect.objectContaining({
          wordWrap: { width: expect.any(Number) },
        }),
      );
    });
  });

  describe('TC-009: 空文字列の依頼者名', () => {
    // 【テスト目的】: 依頼者名が空文字列の場合、デフォルト値が表示されること
    // 【信頼性】: 🟡

    test('エラーなくカードが作成される', () => {
      const mockClientEmpty = createMockClient({
        id: 'C002',
        name: '',
      });
      const mockQuestEmpty = createMockQuestEntity(undefined, mockClientEmpty);

      const config: QuestCardUIConfig = {
        quest: mockQuestEmpty,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);

      expect(() => questCard.create()).not.toThrow();
      expect(questCard).toBeDefined();
    });

    test('デフォルト値「不明な依頼者」が表示される', () => {
      const mockClientEmpty = createMockClient({
        id: 'C002',
        name: '',
      });
      const mockQuestEmpty = createMockQuestEntity(undefined, mockClientEmpty);

      const config: QuestCardUIConfig = {
        quest: mockQuestEmpty,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      expect(mockScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        '不明な依頼者',
        expect.any(Object),
      );
    });
  });

  describe('TC-010: 報酬0の依頼', () => {
    // 【テスト目的】: 報酬が0の依頼でも正しく表示されること
    // 【信頼性】: 🟡

    test('エラーなくカードが作成される', () => {
      const mockQuestNoReward = createMockQuestEntity({
        id: 'Q003',
        clientId: 'C001',
        contribution: 0,
        gold: 0,
      });

      const config: QuestCardUIConfig = {
        quest: mockQuestNoReward,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);

      expect(() => questCard.create()).not.toThrow();
      expect(questCard).toBeDefined();
    });

    test('報酬情報「0貢献度 / 0G」が表示される', () => {
      const mockQuestNoReward = createMockQuestEntity({
        id: 'Q003',
        clientId: 'C001',
        contribution: 0,
        gold: 0,
      });

      const config: QuestCardUIConfig = {
        quest: mockQuestNoReward,
        x: 100,
        y: 200,
      };

      const questCard = new QuestCardUI(mockScene, config);
      questCard.create();

      expect(mockScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.stringContaining('0'),
        expect.any(Object),
      );
    });
  });
});
