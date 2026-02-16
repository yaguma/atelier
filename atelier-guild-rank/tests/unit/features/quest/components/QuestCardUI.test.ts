/**
 * QuestCardUI コンポーネントテスト
 * TASK-0082: features/quest/components作成
 */

import type { QuestCardUIConfig } from '@features/quest/components/QuestCardUI';
import { QuestCardUI } from '@features/quest/components/QuestCardUI';
import type { IQuest } from '@shared/types/quests';
import Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックヘルパー
// =============================================================================

function createMockQuest(): IQuest {
  return {
    id: 'quest-001' as IQuest['id'],
    clientId: 'client-001' as IQuest['clientId'],
    condition: { type: 'QUANTITY', quantity: 1 },
    gold: 100,
    contribution: 50,
    deadline: 5,
    difficulty: 'normal',
    flavorText: 'テスト用のフレーバーテキスト',
  };
}

function createMockScene(): Phaser.Scene {
  const mockContainer = {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      text: vi.fn().mockReturnValue(mockText),
    },
    make: {
      text: vi.fn().mockReturnValue(mockText),
    },
    cameras: {
      main: { width: 1280, height: 720 },
    },
    children: {
      remove: vi.fn(),
    },
    rexUI: undefined,
  } as unknown as Phaser.Scene;

  return scene;
}

// =============================================================================
// テスト
// =============================================================================

describe('QuestCardUI', () => {
  let mockScene: Phaser.Scene;
  let mockQuest: IQuest;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
    mockQuest = createMockQuest();
  });

  describe('コンストラクタ', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '村人A',
        x: 100,
        y: 200,
      };

      const card = new QuestCardUI(mockScene, config);
      expect(card).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(() => new QuestCardUI(mockScene, null as unknown as QuestCardUIConfig)).toThrow(
        'config is required',
      );
    });

    it('questがnullの場合エラーを投げる', () => {
      const config = {
        quest: null as unknown as IQuest,
        clientName: '村人A',
        x: 100,
        y: 200,
      };

      expect(() => new QuestCardUI(mockScene, config)).toThrow('config.quest is required');
    });
  });

  describe('create', () => {
    it('create()で背景・テキスト要素が生成される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '村人A',
        x: 100,
        y: 200,
      };

      // コンストラクタ内でcreate()が自動呼び出し
      new QuestCardUI(mockScene, config);

      // textが呼ばれている（依頼者名、セリフ、報酬、期限）
      expect(mockScene.make.text).toHaveBeenCalled();
    });

    it('create()が二重に呼ばれてもUI要素が二重作成されない', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '村人A',
        x: 100,
        y: 200,
      };

      const card = new QuestCardUI(mockScene, config);
      const textCallCount = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls.length;

      card.create();

      // 2回目のcreateでは追加のUI要素が生成されない
      expect((mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
        textCallCount,
      );
    });
  });

  describe('依頼者名表示', () => {
    it('依頼者名が表示される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '村人A',
        x: 0,
        y: 0,
      };

      new QuestCardUI(mockScene, config);

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const clientNameCall = textCalls.find(
        (call: unknown[]) => call[0] && (call[0] as Record<string, unknown>).text === '村人A',
      );
      expect(clientNameCall).toBeDefined();
    });

    it('依頼者名が空文字の場合「不明な依頼者」が表示される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '',
        x: 0,
        y: 0,
      };

      new QuestCardUI(mockScene, config);

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const clientNameCall = textCalls.find(
        (call: unknown[]) =>
          call[0] && (call[0] as Record<string, unknown>).text === '不明な依頼者',
      );
      expect(clientNameCall).toBeDefined();
    });
  });

  describe('報酬表示', () => {
    it('報酬情報が表示される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '村人A',
        x: 0,
        y: 0,
      };

      new QuestCardUI(mockScene, config);

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const rewardCall = textCalls.find(
        (call: unknown[]) =>
          call[0] &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('50貢献度') &&
          ((call[0] as Record<string, unknown>).text as string).includes('100G'),
      );
      expect(rewardCall).toBeDefined();
    });
  });

  describe('フレーバーテキスト表示', () => {
    it('フレーバーテキストが表示される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '村人A',
        x: 0,
        y: 0,
      };

      new QuestCardUI(mockScene, config);

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const flavorCall = textCalls.find(
        (call: unknown[]) =>
          call[0] && (call[0] as Record<string, unknown>).text === 'テスト用のフレーバーテキスト',
      );
      expect(flavorCall).toBeDefined();
    });
  });

  describe('インタラクション', () => {
    it('デフォルトでinteractiveが有効', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '村人A',
        x: 0,
        y: 0,
      };

      new QuestCardUI(mockScene, config);

      const RectMock = Phaser.GameObjects.Rectangle as unknown as ReturnType<typeof vi.fn>;
      const mockRect = RectMock.mock.results[0]?.value;
      expect(mockRect?.setInteractive).toHaveBeenCalled();
    });

    it('interactive=falseでインタラクションが無効', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '村人A',
        x: 0,
        y: 0,
        interactive: false,
      };

      new QuestCardUI(mockScene, config);

      const RectMock = Phaser.GameObjects.Rectangle as unknown as ReturnType<typeof vi.fn>;
      const mockRect = RectMock.mock.results[0]?.value;
      expect(mockRect?.setInteractive).not.toHaveBeenCalled();
    });
  });

  describe('getQuest', () => {
    it('設定した依頼を取得できる', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '村人A',
        x: 0,
        y: 0,
      };

      const card = new QuestCardUI(mockScene, config);
      expect(card.getQuest()).toBe(mockQuest);
    });
  });

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const config: QuestCardUIConfig = {
        quest: mockQuest,
        clientName: '村人A',
        x: 0,
        y: 0,
      };

      const card = new QuestCardUI(mockScene, config);
      expect(() => card.destroy()).not.toThrow();
    });
  });
});
