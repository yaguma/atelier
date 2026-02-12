/**
 * DeliveryQuestPanel コンポーネントテスト
 * TASK-0082: features/quest/components作成
 */

import type { DeliveryQuestPanelConfig } from '@features/quest/components/DeliveryQuestPanel';
import { DeliveryQuestPanel } from '@features/quest/components/DeliveryQuestPanel';
import type { IQuest } from '@shared/types/quests';
import type Phaser from 'phaser';
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
    flavorText: 'テスト依頼',
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
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
    },
    cameras: {
      main: { width: 1280, height: 720 },
    },
  } as unknown as Phaser.Scene;

  return scene;
}

// =============================================================================
// テスト
// =============================================================================

describe('DeliveryQuestPanel', () => {
  let mockScene: Phaser.Scene;
  let mockQuest: IQuest;
  let mockOnDeliver: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
    mockQuest = createMockQuest();
    mockOnDeliver = vi.fn();
  });

  describe('コンストラクタ', () => {
    it('インスタンスを生成できる', () => {
      const config: DeliveryQuestPanelConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
        clientName: '村人A',
        remainingDays: 5,
        onDeliver: mockOnDeliver,
      };

      const panel = new DeliveryQuestPanel(mockScene, config);
      expect(panel).toBeDefined();
    });
  });

  describe('create', () => {
    it('create()でコンテナが生成される', () => {
      const config: DeliveryQuestPanelConfig = {
        quest: mockQuest,
        x: 100,
        y: 200,
        clientName: '村人A',
        remainingDays: 5,
        onDeliver: mockOnDeliver,
      };

      const panel = new DeliveryQuestPanel(mockScene, config);
      panel.create();

      expect(mockScene.add.container).toHaveBeenCalledWith(100, 200);
      expect(mockScene.add.rectangle).toHaveBeenCalled();
      expect(mockScene.add.text).toHaveBeenCalled();
    });
  });

  describe('選択状態', () => {
    it('初期状態は未選択', () => {
      const config: DeliveryQuestPanelConfig = {
        quest: mockQuest,
        x: 0,
        y: 0,
        clientName: '村人A',
        remainingDays: 5,
        onDeliver: mockOnDeliver,
      };

      const panel = new DeliveryQuestPanel(mockScene, config);
      expect(panel.isQuestSelected()).toBe(false);
    });

    it('setSelected(true)で選択状態になる', () => {
      const config: DeliveryQuestPanelConfig = {
        quest: mockQuest,
        x: 0,
        y: 0,
        clientName: '村人A',
        remainingDays: 5,
        onDeliver: mockOnDeliver,
      };

      const panel = new DeliveryQuestPanel(mockScene, config);
      panel.create();
      panel.setSelected(true);

      expect(panel.isQuestSelected()).toBe(true);
    });

    it('setSelected(false)で未選択に戻る', () => {
      const config: DeliveryQuestPanelConfig = {
        quest: mockQuest,
        x: 0,
        y: 0,
        clientName: '村人A',
        remainingDays: 5,
        onDeliver: mockOnDeliver,
      };

      const panel = new DeliveryQuestPanel(mockScene, config);
      panel.create();
      panel.setSelected(true);
      panel.setSelected(false);

      expect(panel.isQuestSelected()).toBe(false);
    });
  });

  describe('getQuest', () => {
    it('設定した依頼を取得できる', () => {
      const config: DeliveryQuestPanelConfig = {
        quest: mockQuest,
        x: 0,
        y: 0,
        clientName: '村人A',
        remainingDays: 5,
        onDeliver: mockOnDeliver,
      };

      const panel = new DeliveryQuestPanel(mockScene, config);
      expect(panel.getQuest()).toBe(mockQuest);
    });
  });

  describe('期限表示', () => {
    it('期限が5日の場合は通常色で表示される', () => {
      const config: DeliveryQuestPanelConfig = {
        quest: mockQuest,
        x: 0,
        y: 0,
        clientName: '村人A',
        remainingDays: 5,
        onDeliver: mockOnDeliver,
      };

      const panel = new DeliveryQuestPanel(mockScene, config);
      panel.create();

      // textが呼ばれていて、期限テキストが含まれていること
      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const deadlineCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('あと5日'),
      );
      expect(deadlineCall).toBeDefined();
    });

    it('期限が1日の場合は危険色で表示される', () => {
      const config: DeliveryQuestPanelConfig = {
        quest: mockQuest,
        x: 0,
        y: 0,
        clientName: '村人A',
        remainingDays: 1,
        onDeliver: mockOnDeliver,
      };

      const panel = new DeliveryQuestPanel(mockScene, config);
      panel.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const deadlineCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('あと1日'),
      );
      expect(deadlineCall).toBeDefined();
      // 危険色(#f44336)のスタイルが使用されている
      if (deadlineCall) {
        const style = deadlineCall[3] as { color?: string };
        expect(style.color).toBe('#f44336');
      }
    });
  });

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const config: DeliveryQuestPanelConfig = {
        quest: mockQuest,
        x: 0,
        y: 0,
        clientName: '村人A',
        remainingDays: 5,
        onDeliver: mockOnDeliver,
      };

      const panel = new DeliveryQuestPanel(mockScene, config);
      panel.create();
      expect(() => panel.destroy()).not.toThrow();
    });

    it('create前にdestroy()しても例外を投げない', () => {
      const config: DeliveryQuestPanelConfig = {
        quest: mockQuest,
        x: 0,
        y: 0,
        clientName: '村人A',
        remainingDays: 5,
        onDeliver: mockOnDeliver,
      };

      const panel = new DeliveryQuestPanel(mockScene, config);
      expect(() => panel.destroy()).not.toThrow();
    });
  });
});
