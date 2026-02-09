/**
 * QuestAcceptPhaseUI.spec.ts - 依頼受注フェーズUIコンポーネントのテスト
 * TASK-0022 依頼受注フェーズUI
 *
 * @description
 * TC-101〜TC-110: QuestAcceptPhaseUIコンポーネントのユニットテスト
 * - TC-101: フェーズUI初期化
 * - TC-102: 依頼リスト更新（通常ケース）
 * - TC-103: 依頼受注処理
 * - TC-104: リソース解放
 * - TC-105: EventBus未初期化
 * - TC-106: 無効なデータ（null依頼リスト）
 * - TC-107: イベント発行失敗（EventBusエラー）
 * - TC-108: 依頼0件
 * - TC-109: 依頼最大件数（7件）
 * - TC-110: 依頼リスト更新時の既存カード破棄
 */

import type { Quest } from '@domain/entities/Quest';
import { QuestAcceptPhaseUI } from '@presentation/ui/phases/QuestAcceptPhaseUI';
import type { ClientType, QuestType } from '@shared/types';
import { GameEventType } from '@shared/types/events';
import { toClientId, toQuestId } from '@shared/types/ids';
import type { IClient, IQuest, QuestDifficulty } from '@shared/types/quests';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

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
        setVisible: vi.fn(),
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
    // biome-ignore lint/suspicious/noExplicitAny: テストでPhaserシーンをモック化するために必要
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
// biome-ignore lint/suspicious/noExplicitAny: テストで柔軟なオーバーライドを許可するために必要
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
    // biome-ignore lint/suspicious/noExplicitAny: テストでRank型をモック化するために必要
    unlockRank: 'bronze-5' as any,
    ...converted,
  };
}

/**
 * Questエンティティのモックを作成
 */
// biome-ignore lint/suspicious/noExplicitAny: テストで柔軟なオーバーライドを許可するために必要
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

/**
 * EventBusのモックを作成
 */
function createMockEventBus() {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  };
}

// =============================================================================
// テストスイート
// =============================================================================

describe('QuestAcceptPhaseUI', () => {
  let mockScene: Phaser.Scene;
  let mockEventBus: ReturnType<typeof createMockEventBus>;

  beforeEach(() => {
    // 各テスト実行前にモックを初期化
    mockScene = createMockScene();
    mockEventBus = createMockEventBus();
    mockScene.data.get = vi.fn().mockReturnValue(mockEventBus);
  });

  describe('TC-101: フェーズUI初期化', () => {
    // 【テスト目的】: QuestAcceptPhaseUIが正しく初期化され、タイトルと受注済みリストが表示されること
    // 【信頼性】: 🔵

    test('QuestAcceptPhaseUIがエラーなく初期化される', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      expect(phaseUI).toBeDefined();
      expect(phaseUI.getContainer()).toBeDefined();
    });

    test('container.x = 0, container.y = 0 に配置される（Issue #116: コンテンツコンテナが既にオフセット済み）', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      expect(mockScene.add.container).toHaveBeenCalledWith(0, 0);
    });

    test('タイトル「📋 本日の依頼」が表示される', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      expect(mockScene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        '📋 本日の依頼',
        expect.any(Object),
      );
    });

    test('受注済みリスト（ScrollablePanel）が作成される', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).acceptedList).toBeDefined();
    });
  });

  describe('TC-102: 依頼リスト更新（通常ケース）', () => {
    // 【テスト目的】: updateQuests()を呼ぶと、依頼カードが正しく表示されること
    // 【信頼性】: 🔵

    test('3つのQuestCardUIが作成される', () => {
      const mockQuests = [
        createMockQuestEntity({ id: 'Q001' }),
        createMockQuestEntity({ id: 'Q002' }),
        createMockQuestEntity({ id: 'Q003' }),
      ];

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests(mockQuests);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards.length).toBe(3);
    });

    test('各カードが正しい位置に配置される', () => {
      const mockQuests = [
        createMockQuestEntity({ id: 'Q001' }),
        createMockQuestEntity({ id: 'Q002' }),
        createMockQuestEntity({ id: 'Q003' }),
      ];

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests(mockQuests);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[0].getContainer().x).toBe(200);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[0].getContainer().y).toBe(150);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[1].getContainer().x).toBe(500);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[1].getContainer().y).toBe(150);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[2].getContainer().x).toBe(800);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[2].getContainer().y).toBe(150);
    });
  });

  describe('TC-103: 依頼受注処理', () => {
    // 【テスト目的】: 依頼を受注すると、QUEST_ACCEPTEDイベントが発行されること
    // 【信頼性】: 🔵

    test('EventBus.emit()が呼ばれる', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const questCard = (phaseUI as any).questCards[0];
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const acceptButton = (questCard as any).acceptButton;
      acceptButton.emit('pointerdown');

      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
    });

    test('イベント名はGameEventType.QUEST_ACCEPTED', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const questCard = (phaseUI as any).questCards[0];
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const acceptButton = (questCard as any).acceptButton;
      acceptButton.emit('pointerdown');

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.QUEST_ACCEPTED,
        expect.any(Object),
      );
    });

    test('ペイロードに{ quest: mockQuest }が含まれる', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const questCard = (phaseUI as any).questCards[0];
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const acceptButton = (questCard as any).acceptButton;
      acceptButton.emit('pointerdown');

      expect(mockEventBus.emit).toHaveBeenCalledWith(GameEventType.QUEST_ACCEPTED, {
        quest: mockQuest,
      });
    });
  });

  describe('TC-104: リソース解放', () => {
    // 【テスト目的】: destroy()が呼ばれると、すべてのQuestCardUIとコンテナが破棄されること
    // 【信頼性】: 🔵

    test('すべてのQuestCardUIのdestroy()が呼ばれる', () => {
      const mockQuests = [
        createMockQuestEntity({ id: 'Q001' }),
        createMockQuestEntity({ id: 'Q002' }),
      ];

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests(mockQuests);

      // 【テスト修正】: destroy()前にカードを保存し、スパイ化する
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const card0 = (phaseUI as any).questCards[0];
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const card1 = (phaseUI as any).questCards[1];
      const destroySpy0 = vi.spyOn(card0, 'destroy');
      const destroySpy1 = vi.spyOn(card1, 'destroy');

      phaseUI.destroy();

      expect(destroySpy0).toHaveBeenCalledTimes(1);
      expect(destroySpy1).toHaveBeenCalledTimes(1);
    });

    test('questCards配列が空になる', () => {
      const mockQuests = [
        createMockQuestEntity({ id: 'Q001' }),
        createMockQuestEntity({ id: 'Q002' }),
      ];

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests(mockQuests);

      phaseUI.destroy();

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards.length).toBe(0);
    });

    test('container.destroy()が呼ばれる', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      phaseUI.destroy();

      expect(phaseUI.getContainer().destroy).toHaveBeenCalledTimes(1);
    });

    test('acceptedList.destroy()が呼ばれる（存在する場合）', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      // 【テスト修正】: acceptedList.destroyをスパイ化する
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      if ((phaseUI as any).acceptedList) {
        // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
        const destroySpy = vi.spyOn((phaseUI as any).acceptedList, 'destroy');

        phaseUI.destroy();

        expect(destroySpy).toHaveBeenCalled();
      }
    });
  });

  describe('TC-105: EventBus未初期化', () => {
    // 【テスト目的】: EventBusがscene.dataに存在しない場合、警告が出ること
    // 【信頼性】: 🔵

    test('エラーはスローされない', () => {
      const sceneWithoutEventBus = createMockScene();
      sceneWithoutEventBus.data.get = vi.fn().mockReturnValue(null);

      const createPhaseUI = () => {
        const phaseUI = new QuestAcceptPhaseUI(sceneWithoutEventBus);
        phaseUI.create();
      };

      expect(createPhaseUI).not.toThrow();
    });

    test('console.warnが呼ばれる', () => {
      const sceneWithoutEventBus = createMockScene();
      sceneWithoutEventBus.data.get = vi.fn().mockReturnValue(null);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const phaseUI = new QuestAcceptPhaseUI(sceneWithoutEventBus);
      phaseUI.create();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('EventBus is not available'),
      );

      consoleWarnSpy.mockRestore();
    });

    test('警告メッセージに「EventBus is not available」が含まれる', () => {
      const sceneWithoutEventBus = createMockScene();
      sceneWithoutEventBus.data.get = vi.fn().mockReturnValue(null);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const phaseUI = new QuestAcceptPhaseUI(sceneWithoutEventBus);
      phaseUI.create();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('EventBus is not available'),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('TC-106: 無効なデータ（null依頼リスト）', () => {
    // 【テスト目的】: updateQuests(null)を呼んでもエラーが発生しないこと
    // 【信頼性】: 🟡

    test('エラーはスローされない', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      // biome-ignore lint/suspicious/noExplicitAny: テストでnull入力をテストするために必要
      const updateWithNull = () => phaseUI.updateQuests(null as any);

      expect(updateWithNull).not.toThrow();
    });

    test('questCards配列は空のまま', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      // biome-ignore lint/suspicious/noExplicitAny: テストでnull入力をテストするために必要
      phaseUI.updateQuests(null as any);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards.length).toBe(0);
    });
  });

  describe('TC-107: イベント発行失敗（EventBusエラー）', () => {
    // 【テスト目的】: EventBus.emit()でエラーが発生しても、アプリケーションが停止しないこと
    // 【信頼性】: 🟡

    test('エラーがキャッチされる', () => {
      const mockEventBusWithError = createMockEventBus();
      mockEventBusWithError.emit = vi.fn().mockImplementation(() => {
        throw new Error('EventBus error');
      });

      const sceneWithErrorEventBus = createMockScene();
      sceneWithErrorEventBus.data.get = vi.fn().mockReturnValue(mockEventBusWithError);

      const phaseUI = new QuestAcceptPhaseUI(sceneWithErrorEventBus);
      phaseUI.create();

      const mockQuest = createMockQuestEntity({ id: 'Q001' });
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      const acceptQuest = () => (phaseUI as any).onAcceptQuest(mockQuest);

      expect(acceptQuest).not.toThrow();
    });

    test('console.errorが呼ばれる', () => {
      const mockEventBusWithError = createMockEventBus();
      mockEventBusWithError.emit = vi.fn().mockImplementation(() => {
        throw new Error('EventBus error');
      });

      const sceneWithErrorEventBus = createMockScene();
      sceneWithErrorEventBus.data.get = vi.fn().mockReturnValue(mockEventBusWithError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const phaseUI = new QuestAcceptPhaseUI(sceneWithErrorEventBus);
      phaseUI.create();

      const mockQuest = createMockQuestEntity({ id: 'Q001' });
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).onAcceptQuest(mockQuest);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('EventBus error'));

      consoleErrorSpy.mockRestore();
    });

    test('アプリケーションが停止しない', () => {
      const mockEventBusWithError = createMockEventBus();
      mockEventBusWithError.emit = vi.fn().mockImplementation(() => {
        throw new Error('EventBus error');
      });

      const sceneWithErrorEventBus = createMockScene();
      sceneWithErrorEventBus.data.get = vi.fn().mockReturnValue(mockEventBusWithError);

      const phaseUI = new QuestAcceptPhaseUI(sceneWithErrorEventBus);
      phaseUI.create();

      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      expect(() => (phaseUI as any).onAcceptQuest(mockQuest)).not.toThrow();
    });
  });

  describe('TC-108: 依頼0件', () => {
    // 【テスト目的】: 依頼が0件の場合でも正しく動作すること
    // 【信頼性】: 🟡

    test('エラーはスローされない', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      const updateWithEmpty = () => phaseUI.updateQuests([]);

      expect(updateWithEmpty).not.toThrow();
    });

    test('questCards配列は空', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      phaseUI.updateQuests([]);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards.length).toBe(0);
    });
  });

  describe('TC-109: 依頼最大件数（7件）', () => {
    // 【テスト目的】: 依頼が最大件数（7件）の場合でも正しく表示されること
    // 【信頼性】: 🟡

    test('7つのQuestCardUIが作成される', () => {
      const mockQuests = Array.from({ length: 7 }, (_, i) =>
        createMockQuestEntity({ id: `Q00${i + 1}` }),
      );

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests(mockQuests);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards.length).toBe(7);
    });

    test('カードが3列×3行で配置される', () => {
      const mockQuests = Array.from({ length: 7 }, (_, i) =>
        createMockQuestEntity({ id: `Q00${i + 1}` }),
      );

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests(mockQuests);

      // Quest 1-3: y=150
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[0].getContainer().x).toBe(200);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[0].getContainer().y).toBe(150);
      // Quest 4-6: y=350
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[3].getContainer().x).toBe(200);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[3].getContainer().y).toBe(350);
      // Quest 7: y=550
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[6].getContainer().x).toBe(200);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[6].getContainer().y).toBe(550);
    });
  });

  describe('TC-110: 依頼リスト更新時の既存カード破棄', () => {
    // 【テスト目的】: updateQuests()を2回呼ぶと、既存のカードが破棄され、新しいカードが作成されること
    // 【信頼性】: 🔵

    test('最初のカードのdestroy()が呼ばれる', () => {
      const mockQuests1 = [
        createMockQuestEntity({ id: 'Q001' }),
        createMockQuestEntity({ id: 'Q002' }),
      ];

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests(mockQuests1);

      // 【テスト修正】: カードを保存し、スパイ化する
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const firstCards = [...(phaseUI as any).questCards];
      const destroySpy0 = vi.spyOn(firstCards[0], 'destroy');
      const destroySpy1 = vi.spyOn(firstCards[1], 'destroy');

      const mockQuests2 = [createMockQuestEntity({ id: 'Q003' })];
      phaseUI.updateQuests(mockQuests2);

      expect(destroySpy0).toHaveBeenCalledTimes(1);
      expect(destroySpy1).toHaveBeenCalledTimes(1);
    });

    test('questCards配列の要素数が1になる', () => {
      const mockQuests1 = [
        createMockQuestEntity({ id: 'Q001' }),
        createMockQuestEntity({ id: 'Q002' }),
      ];

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests(mockQuests1);

      const mockQuests2 = [createMockQuestEntity({ id: 'Q003' })];
      phaseUI.updateQuests(mockQuests2);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards.length).toBe(1);
    });

    test('新しいカードが作成される', () => {
      const mockQuests1 = [
        createMockQuestEntity({ id: 'Q001' }),
        createMockQuestEntity({ id: 'Q002' }),
      ];

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests(mockQuests1);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const firstCards = [...(phaseUI as any).questCards];

      const mockQuests2 = [createMockQuestEntity({ id: 'Q003' })];
      phaseUI.updateQuests(mockQuests2);

      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards[0]).not.toBe(firstCards[0]);
    });
  });

  // =============================================================================
  // TASK-0043: モーダル連携テストケース
  // =============================================================================

  describe('TC-601: カードクリック時のモーダル表示', () => {
    // 【テスト目的】: 依頼カードクリックでQuestDetailModalが表示されることを確認
    // 【対応要件】: FR-001, AC-001
    // 🔵 信頼性レベル: requirements.md セクション3 FR-001に明記

    test('依頼カードクリックでQuestDetailModalが表示される', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // カードクリックをシミュレート
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const questCard = (phaseUI as any).questCards[0];
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      const background = (questCard as any).background;
      background.emit('pointerdown');

      // QuestDetailModalが表示されることを確認
      // （実装がないため、このテストは失敗する）
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).currentModal).toBeDefined();
    });
  });

  describe('TC-602: モーダル受注後のイベント発行', () => {
    // 【テスト目的】: モーダルで受注するとQUEST_ACCEPTEDイベントが発行されることを確認
    // 【対応要件】: AC-003
    // 🔵 信頼性レベル: requirements.md セクション5 AC-003に明記

    test('モーダルで受注するとQUEST_ACCEPTEDイベントが発行される', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // モーダルを開いて受注をシミュレート
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).openQuestDetailModal(mockQuest);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).onAcceptQuest(mockQuest);

      // QUEST_ACCEPTEDイベントが発行されることを確認
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEventType.QUEST_ACCEPTED,
        expect.objectContaining({ quest: mockQuest }),
      );
    });
  });

  describe('TC-603: モーダル閉じた後のカード状態', () => {
    // 【テスト目的】: モーダルを閉じた後もカードは残っていることを確認
    // 【対応要件】: AC-004
    // 🟡 信頼性レベル: requirements.md セクション5 AC-004に明記

    test('モーダルを閉じた後もカードは残っている', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // モーダルを開いて閉じる
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).openQuestDetailModal(mockQuest);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).closeQuestDetailModal();

      // カードが残っていることを確認
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).questCards.length).toBe(1);
    });
  });

  // =============================================================================
  // TASK-0043: カード移動アニメーションテストケース
  // =============================================================================

  describe('TC-701: 受注後のカード移動アニメーション', () => {
    // 【テスト目的】: 受注後にカードがサイドバーへ移動するアニメーションが再生されることを確認
    // 【対応要件】: FR-007, AC-008
    // 🔵 信頼性レベル: requirements.md セクション3 FR-007に明記

    test('受注後にカードがサイドバーへ移動するアニメーションが再生される', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // 受注をシミュレート
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドとプロパティにアクセスするために必要
      (phaseUI as any).animateCardToSidebar(mockQuest, (phaseUI as any).questCards[0]);

      // カードがX=80pxへ移動し、scale=0.6になるアニメーションが再生されることを確認
      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: expect.any(Object),
          x: 80,
          scale: 0.6,
          duration: 400,
          ease: 'Power2',
        }),
      );
    });
  });

  describe('TC-702: カード移動後のサイドバーリスト更新', () => {
    // 【テスト目的】: カード移動アニメーション完了後にサイドバーリストが更新されることを確認
    // 【対応要件】: FR-007
    // 🟡 信頼性レベル: requirements.md セクション3 FR-007に明記

    test('カード移動アニメーション完了後にサイドバーリストが更新される', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // 受注をシミュレート
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).updateAcceptedList(mockQuest);

      // サイドバーの受注済みリストに依頼が追加されることを確認
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).acceptedQuests).toContain(mockQuest);
    });
  });

  describe('TC-703: 複数依頼受注時のカード配置', () => {
    // 【テスト目的】: 複数の依頼を受注すると、カードが縦に並んで配置されることを確認
    // 【対応要件】: FR-007
    // 🟡 信頼性レベル: requirements.md セクション3 FR-007に明記

    test('複数の依頼を受注すると、カードが縦に並んで配置される', () => {
      const mockQuest1 = createMockQuestEntity({ id: 'Q001' });
      const mockQuest2 = createMockQuestEntity({ id: 'Q002' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest1, mockQuest2]);

      // 1件目の受注
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).updateAcceptedList(mockQuest1);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      const targetY1 = (phaseUI as any).calculateAcceptedCardY(0);

      // 2件目の受注
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).updateAcceptedList(mockQuest2);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      const targetY2 = (phaseUI as any).calculateAcceptedCardY(1);

      // 2件目のカードが1件目の下に配置されることを確認
      expect(targetY2).toBeGreaterThan(targetY1);
    });
  });

  // =============================================================================
  // Issue #120: フェーズ遷移時のクリーンアップテストケース
  // =============================================================================

  describe('TC-801: setVisible(false)時のクリーンアップ', () => {
    // 【テスト目的】: setVisible(false)が呼ばれるとモーダルが閉じられることを確認
    // 【対応Issue】: Issue #120 - 採取フェーズに移動しても依頼カードの表示が消えない
    // 🔵 信頼性レベル: Issue #120に明記

    test('setVisible(false)でモーダルが閉じられる', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // モーダルを開く
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).openQuestDetailModal(mockQuest);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).currentModal).not.toBeNull();

      // setVisible(false)を呼ぶ
      phaseUI.setVisible(false);

      // モーダルが閉じられていることを確認
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).currentModal).toBeNull();
    });

    test('setVisible(true)ではcleanup()が呼ばれない', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // モーダルを開く
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).openQuestDetailModal(mockQuest);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).currentModal).not.toBeNull();

      // setVisible(true)を呼ぶ
      phaseUI.setVisible(true);

      // モーダルが開いたままであることを確認
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).currentModal).not.toBeNull();
    });
  });

  describe('TC-802: cleanup()メソッドの動作', () => {
    // 【テスト目的】: cleanup()がモーダルを閉じることを確認
    // 【対応Issue】: Issue #120
    // 🔵 信頼性レベル: Issue #120に明記

    test('cleanup()がモーダルを閉じる', () => {
      const mockQuest = createMockQuestEntity({ id: 'Q001' });

      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();
      phaseUI.updateQuests([mockQuest]);

      // モーダルを開く
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateメソッドにアクセスするために必要
      (phaseUI as any).openQuestDetailModal(mockQuest);
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).currentModal).not.toBeNull();

      // cleanup()を呼ぶ
      phaseUI.cleanup();

      // モーダルが閉じられていることを確認
      // biome-ignore lint/suspicious/noExplicitAny: テストでprivateプロパティにアクセスするために必要
      expect((phaseUI as any).currentModal).toBeNull();
    });

    test('モーダルが開いていない場合もcleanup()はエラーにならない', () => {
      const phaseUI = new QuestAcceptPhaseUI(mockScene);
      phaseUI.create();

      // モーダルを開かずにcleanup()を呼ぶ
      expect(() => phaseUI.cleanup()).not.toThrow();
    });
  });
});
