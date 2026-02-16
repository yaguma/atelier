/**
 * QuestDetailModal コンポーネントテスト
 * TASK-0082: features/quest/components作成
 */

import type { QuestDetailModalConfig } from '@features/quest/components/QuestDetailModal';
import { QuestDetailModal } from '@features/quest/components/QuestDetailModal';
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

function createMockContainer() {
  const container = {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
    visible: true,
  };
  return container;
}

function createMockScene(): Phaser.Scene {
  const mockContainer = createMockContainer();

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setScale: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      text: vi.fn().mockReturnValue(mockText),
    },
    make: {
      text: vi.fn().mockReturnValue(mockText),
      container: vi.fn().mockReturnValue(mockContainer),
    },
    cameras: {
      main: { width: 1280, height: 720 },
    },
    tweens: {
      add: vi.fn().mockReturnValue({ stop: vi.fn() }),
      killTweensOf: vi.fn(),
    },
    input: {
      keyboard: {
        addKey: vi.fn().mockReturnValue({
          on: vi.fn(),
          off: vi.fn(),
        }),
        removeKey: vi.fn(),
      },
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

describe('QuestDetailModal', () => {
  let mockScene: Phaser.Scene;
  let mockQuest: IQuest;
  let mockOnAccept: ReturnType<typeof vi.fn>;
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
    mockQuest = createMockQuest();
    mockOnAccept = vi.fn();
    mockOnClose = vi.fn();
  });

  describe('コンストラクタ', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      expect(modal).toBeDefined();
    });

    it('sceneがnullの場合エラーを投げる', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      expect(() => new QuestDetailModal(null as unknown as Phaser.Scene, config)).toThrow(
        'QuestDetailModal: scene is required',
      );
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(
        () => new QuestDetailModal(mockScene, null as unknown as QuestDetailModalConfig),
      ).toThrow('QuestDetailModal: config is required');
    });

    it('questがnullの場合エラーを投げる', () => {
      const config = {
        quest: null as unknown as IQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      expect(() => new QuestDetailModal(mockScene, config)).toThrow(
        'QuestDetailModal: config.quest is required',
      );
    });

    it('onAcceptが関数でない場合エラーを投げる', () => {
      const config = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: 'not a function' as unknown as (quest: IQuest) => void,
        onClose: mockOnClose,
      };

      expect(() => new QuestDetailModal(mockScene, config)).toThrow(
        'QuestDetailModal: config.onAccept must be a function',
      );
    });

    it('onCloseが関数でない場合エラーを投げる', () => {
      const config = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: 'not a function' as unknown as () => void,
      };

      expect(() => new QuestDetailModal(mockScene, config)).toThrow(
        'QuestDetailModal: config.onClose must be a function',
      );
    });
  });

  describe('create', () => {
    it('create()でオーバーレイ・パネル・ボタンが生成される', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      modal.create();

      // make.textが呼ばれている（依頼者名、期限、報酬、ボタン2つ）
      expect(mockScene.make.text).toHaveBeenCalled();
      // make.containerが呼ばれている（パネル）
      expect(mockScene.make.container).toHaveBeenCalled();
      // tweenが呼ばれている（アニメーション）
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('handleAccept', () => {
    it('受注処理でonAcceptが呼ばれる', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      modal.create();
      modal.handleAccept();

      expect(mockOnAccept).toHaveBeenCalledWith(mockQuest);
    });

    it('アニメーション中は受注処理がスキップされる', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      modal.create();
      modal.setAnimating(true);
      modal.handleAccept();

      expect(mockOnAccept).not.toHaveBeenCalled();
    });
  });

  describe('handleEscKey', () => {
    it('ESCキーでclose()が呼ばれる', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      modal.create();

      // close内でtweens.addが呼ばれるはず
      const tweenCallsBefore = (mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls.length;
      modal.handleEscKey();
      const tweenCallsAfter = (mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls.length;

      expect(tweenCallsAfter).toBeGreaterThan(tweenCallsBefore);
    });

    it('アニメーション中はESCキーが無視される', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      modal.create();
      modal.setAnimating(true);

      const tweenCallsBefore = (mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls.length;
      modal.handleEscKey();
      const tweenCallsAfter = (mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls.length;

      expect(tweenCallsAfter).toBe(tweenCallsBefore);
    });
  });

  describe('formatDifficulty', () => {
    it('難易度3で★★★☆☆を返す', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      expect(modal.formatDifficulty(3)).toBe('\u2605\u2605\u2605\u2606\u2606');
    });

    it('難易度0で☆☆☆☆☆を返す', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      expect(modal.formatDifficulty(0)).toBe('\u2606\u2606\u2606\u2606\u2606');
    });

    it('難易度5で★★★★★を返す', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      expect(modal.formatDifficulty(5)).toBe('\u2605\u2605\u2605\u2605\u2605');
    });

    it('範囲外の値はクランプされる', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      expect(modal.formatDifficulty(-1)).toBe('\u2606\u2606\u2606\u2606\u2606');
      expect(modal.formatDifficulty(10)).toBe('\u2605\u2605\u2605\u2605\u2605');
    });
  });

  describe('isAnimating', () => {
    it('初期状態ではfalse', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      expect(modal.isAnimating()).toBe(false);
    });

    it('setAnimating(true)でtrueになる', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      modal.setAnimating(true);
      expect(modal.isAnimating()).toBe(true);
    });
  });

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const config: QuestDetailModalConfig = {
        quest: mockQuest,
        clientName: 'テスト依頼者',
        onAccept: mockOnAccept,
        onClose: mockOnClose,
      };

      const modal = new QuestDetailModal(mockScene, config);
      modal.create();

      // destroyが例外を投げないことを確認
      expect(() => modal.destroy()).not.toThrow();
    });
  });
});
