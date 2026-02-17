// @ts-nocheck
/**
 * DraggableCardUIコンポーネントのテスト
 * TASK-0042 カードドラッグ＆ドロップ機能
 *
 * @description
 * TC-001〜TC-018: DraggableCardUIの正常系テスト
 * TC-101〜TC-108: 異常系テスト
 * TC-201〜TC-206: 境界値テスト
 * TC-301〜TC-305: 統合テスト
 */

import { Card } from '@domain/entities/Card';
import { DraggableCardUI } from '@presentation/ui/components/DraggableCardUI';
import type { DropZone } from '@presentation/ui/components/DropZone';
import { DropZoneManager } from '@presentation/ui/components/DropZoneManager';
import type { CardId } from '@shared/types';
import { CardType } from '@shared/types/common';
import type { CardMaster } from '@shared/types/master-data';
import Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

interface MockTweens {
  add: ReturnType<typeof vi.fn>;
}

interface MockRectangle {
  setStrokeStyle: ReturnType<typeof vi.fn>;
  setInteractive: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

interface MockText {
  setOrigin: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

interface MockContainer {
  add: ReturnType<typeof vi.fn>;
  setVisible: ReturnType<typeof vi.fn>;
  setPosition: ReturnType<typeof vi.fn>;
  setScale: ReturnType<typeof vi.fn>;
  setAlpha: ReturnType<typeof vi.fn>;
  setDepth: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  x: number;
  y: number;
  visible: boolean;
  scaleX: number;
  scaleY: number;
  alpha: number;
  depth: number;
  list: unknown[];
}

interface MockInput {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
}

describe('DraggableCardUI', () => {
  let scene: Phaser.Scene;
  let mockContainer: MockContainer;
  let mockRectangle: MockRectangle;
  let mockText: MockText;
  let mockTweens: MockTweens;
  let mockInput: MockInput;
  let gatheringCard: Card;
  let recipeCard: Card;

  beforeEach(() => {
    // モックのRectangleコンポーネント
    mockRectangle = {
      setStrokeStyle: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };

    // モックのTextコンポーネント
    mockText = {
      setOrigin: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };

    // モックのContainer
    mockContainer = {
      add: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockImplementation(function (x, y) {
        this.x = x;
        this.y = y;
        return this;
      }),
      setScale: vi.fn().mockImplementation(function (x, y) {
        this.scaleX = x;
        this.scaleY = y ?? x;
        return this;
      }),
      setAlpha: vi.fn().mockImplementation(function (alpha) {
        this.alpha = alpha;
        return this;
      }),
      setDepth: vi.fn().mockImplementation(function (depth) {
        this.depth = depth;
        return this;
      }),
      destroy: vi.fn(),
      x: 0,
      y: 0,
      visible: true,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      depth: 0,
      list: [mockRectangle], // mockRectangleを最初の子要素として追加
    };

    // モックのTweens
    mockTweens = {
      add: vi.fn().mockImplementation((config) => {
        // アニメーション終了時のコールバックを即時実行（テスト用）
        if (config.onComplete) {
          config.onComplete();
        }
        return { stop: vi.fn() };
      }),
    };

    // モックのInput
    mockInput = {
      on: vi.fn(),
      off: vi.fn(),
    };

    // Phaser.GameObjects のコンストラクタモックをオーバーライド
    vi.mocked(Phaser.GameObjects.Rectangle).mockImplementation(function (this: unknown) {
      Object.assign(this, mockRectangle);
      return this as typeof mockRectangle;
    });

    // Phaserシーンのモックを作成
    scene = {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
      },
      make: {
        text: vi.fn().mockReturnValue(mockText),
      },
      tweens: mockTweens,
      input: mockInput,
    } as unknown as Phaser.Scene;

    // テスト用カードマスターデータ
    // @ts-expect-error - テスト用の簡易的なCardMaster定義
    const gatheringMaster: CardMaster = {
      id: 'gather_001',
      name: '採取カード',
      type: CardType.GATHERING,
      baseCost: 1,
      materialPool: ['herb', 'stone', 'wood'],
      baseQuantity: 3,
      rarity: 'COMMON',
    };

    // @ts-expect-error - テスト用の簡易的なCardMaster定義
    const recipeMaster: CardMaster = {
      id: 'recipe_001',
      name: 'レシピカード',
      type: CardType.RECIPE,
      cost: 2,
      requiredMaterials: ['herb', 'stone'],
      resultItemId: 'potion_001',
      rarity: 'COMMON',
    };

    // カードインスタンスを作成
    gatheringCard = new Card('card_001' as CardId, gatheringMaster as CardMaster);
    recipeCard = new Card('card_002' as CardId, recipeMaster as CardMaster);

    // DropZoneManagerをリセット
    DropZoneManager.resetInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
    DropZoneManager.resetInstance();
  });

  describe('TC-001: DraggableCardUIのインスタンス生成', () => {
    test('インスタンスが正常に生成される', () => {
      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
      });

      expect(cardUI).toBeInstanceOf(DraggableCardUI);
      expect(cardUI.getCard()).toBe(gatheringCard);

      cardUI.destroy();
    });
  });

  describe('TC-002: ドラッグ開始時のonDragStartコールバック呼び出し', () => {
    test('onDragStartコールバックが呼び出される', () => {
      const onDragStartMock = vi.fn();
      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
        onDragStart: onDragStartMock,
      });

      // dragstartイベントを発火
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        const mockPointer = { x: 100, y: 200 };
        callback(mockPointer, mockRectangle);
      }

      expect(onDragStartMock).toHaveBeenCalledWith(gatheringCard);

      cardUI.destroy();
    });
  });

  describe('TC-003: ドラッグ開始時の視覚効果適用', () => {
    test('コンテナのスケール、透明度、深度が変更される', () => {
      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
      });

      // dragstartイベントを発火
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        const mockPointer = { x: 100, y: 200 };
        callback(mockPointer, mockRectangle);
      }

      expect(mockContainer.setScale).toHaveBeenCalledWith(1.1);
      expect(mockContainer.setAlpha).toHaveBeenCalledWith(0.8);
      expect(mockContainer.setDepth).toHaveBeenCalledWith(100);

      cardUI.destroy();
    });
  });

  describe('TC-004: ドラッグ中の位置更新', () => {
    test('カードの位置がポインター位置に追従する', () => {
      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
      });

      // ドラッグ開始
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        callback({ x: 100, y: 200 }, mockRectangle);
      }

      // ドラッグ中
      const dragCall = mockInput.on.mock.calls.find((call) => call[0] === 'drag');

      if (dragCall) {
        const callback = dragCall[1];
        callback({ x: 300, y: 400 }, mockRectangle, 300, 400);
      }

      expect(mockContainer.setPosition).toHaveBeenCalled();

      cardUI.destroy();
    });
  });

  describe('TC-005: ドラッグ中のonDragコールバック呼び出し', () => {
    test('onDragコールバックが呼び出される', () => {
      const onDragMock = vi.fn();
      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
        onDrag: onDragMock,
      });

      // ドラッグ開始
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        callback({ x: 100, y: 200 }, mockRectangle);
      }

      // ドラッグ中
      const dragCall = mockInput.on.mock.calls.find((call) => call[0] === 'drag');

      if (dragCall) {
        const callback = dragCall[1];
        callback({ x: 300, y: 400 }, mockRectangle, 300, 400);
      }

      expect(onDragMock).toHaveBeenCalledWith(
        gatheringCard,
        expect.any(Number),
        expect.any(Number),
      );

      cardUI.destroy();
    });
  });

  describe('TC-006: ドラッグ終了時の視覚効果リセット', () => {
    test('コンテナのスケール、透明度、深度が元に戻る', () => {
      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
      });

      // ドラッグ開始
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        callback({ x: 100, y: 200 }, mockRectangle);
      }

      // ドラッグ終了
      const dragendCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragend');

      if (dragendCall) {
        const callback = dragendCall[1];
        callback({ x: 100, y: 200 }, mockRectangle);
      }

      expect(mockContainer.setScale).toHaveBeenCalledWith(1);
      expect(mockContainer.setAlpha).toHaveBeenCalledWith(1);
      expect(mockContainer.setDepth).toHaveBeenCalledWith(0);

      cardUI.destroy();
    });
  });

  describe('TC-007: ドラッグ開始位置の保存', () => {
    test('startPositionが保存される', () => {
      mockContainer.x = 100;
      mockContainer.y = 200;

      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
      });

      // ドラッグ開始
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        callback({ x: 100, y: 200 }, mockRectangle);
      }

      // startPositionが保存されているか確認（内部状態は直接確認できないため、ドロップ失敗時の動作で間接的に確認）
      // ドラッグ終了（ゾーン外）
      const dragendCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragend');

      if (dragendCall) {
        const callback = dragendCall[1];
        callback({ x: 50, y: 50 }, mockRectangle);
      }

      // Tweenが元の位置（100, 200）に戻るよう設定されているか確認
      expect(mockTweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 100,
          y: 200,
        }),
      );

      cardUI.destroy();
    });
  });

  describe('TC-008: isDragging状態の管理', () => {
    test('ドラッグ状態が正しく管理される', () => {
      const onDragMock = vi.fn();
      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
        onDrag: onDragMock,
      });

      // ドラッグ開始前にdragを発火しても何も起こらないことを確認
      const dragCall = mockInput.on.mock.calls.find((call) => call[0] === 'drag');

      if (dragCall) {
        const callback = dragCall[1];
        callback({ x: 300, y: 400 }, mockRectangle, 300, 400);
      }

      // ドラッグ開始前なのでonDragは呼ばれない
      expect(onDragMock).not.toHaveBeenCalled();

      // ドラッグ開始
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        callback({ x: 100, y: 200 }, mockRectangle);
      }

      // ドラッグ開始後にdragを発火
      if (dragCall) {
        const callback = dragCall[1];
        callback({ x: 300, y: 400 }, mockRectangle, 300, 400);
      }

      // ドラッグ開始後なのでonDragが呼ばれる
      expect(onDragMock).toHaveBeenCalled();

      cardUI.destroy();
    });
  });

  describe('TC-015: 有効なドロップゾーンへのドロップ成功', () => {
    test('onDropコールバックがゾーン情報と共に呼ばれる', () => {
      const onDropMock = vi.fn();
      const zoneOnDropMock = vi.fn();

      // DropZoneManagerを初期化
      const manager = DropZoneManager.getInstance();
      const mockZone: DropZone = {
        id: 'play-area',
        bounds: { contains: vi.fn().mockReturnValue(true) } as unknown as Phaser.Geom.Rectangle,
        accepts: vi.fn().mockReturnValue(true),
        onDrop: zoneOnDropMock,
      };
      manager.registerZone(mockZone);

      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
        onDrop: onDropMock,
      });

      // ドラッグ開始
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        callback({ x: 100, y: 200 }, mockRectangle);
      }

      // ドラッグ終了
      const dragendCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragend');

      if (dragendCall) {
        const callback = dragendCall[1];
        callback({ x: 300, y: 300 }, mockRectangle);
      }

      expect(onDropMock).toHaveBeenCalledWith(gatheringCard, mockZone);
      expect(zoneOnDropMock).toHaveBeenCalledWith(gatheringCard);

      cardUI.destroy();
    });
  });

  describe('TC-016: ドロップゾーン外でのドロップ', () => {
    test('onDropコールバックがnullと共に呼ばれる', () => {
      const onDropMock = vi.fn();

      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
        onDrop: onDropMock,
      });

      // ドラッグ開始
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        callback({ x: 100, y: 200 }, mockRectangle);
      }

      // ドラッグ終了（ゾーン外）
      const dragendCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragend');

      if (dragendCall) {
        const callback = dragendCall[1];
        callback({ x: 50, y: 50 }, mockRectangle);
      }

      expect(onDropMock).toHaveBeenCalledWith(gatheringCard, null);

      cardUI.destroy();
    });
  });

  describe('TC-017: 元の位置に戻るアニメーション', () => {
    test('Tweenアニメーションが開始される', () => {
      mockContainer.x = 100;
      mockContainer.y = 200;

      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
      });

      // ドラッグ開始
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        callback({ x: 100, y: 200 }, mockRectangle);
      }

      // ドラッグ終了（ゾーン外）
      const dragendCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragend');

      if (dragendCall) {
        const callback = dragendCall[1];
        callback({ x: 50, y: 50 }, mockRectangle);
      }

      expect(mockTweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 100,
          y: 200,
          duration: 200,
          ease: 'Power2',
        }),
      );

      cardUI.destroy();
    });
  });

  describe('TC-018: destroy時のイベントリスナー削除', () => {
    test('イベントリスナーが削除される', () => {
      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
      });

      cardUI.destroy();

      expect(mockInput.off).toHaveBeenCalledWith('dragstart', expect.any(Function), cardUI);
      expect(mockInput.off).toHaveBeenCalledWith('drag', expect.any(Function), cardUI);
      expect(mockInput.off).toHaveBeenCalledWith('dragend', expect.any(Function), cardUI);
    });
  });

  describe('TC-101: cardがnullの場合のコンストラクタ', () => {
    test('Errorがスローされる', () => {
      expect(() => {
        new DraggableCardUI(scene, {
          card: null as unknown as Card,
          x: 0,
          y: 0,
        });
      }).toThrow();
    });
  });

  describe('TC-105: interactive: falseの場合', () => {
    test('ドラッグイベントが発火しない', () => {
      const onDragStartMock = vi.fn();
      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: false,
        onDragStart: onDragStartMock,
      });

      // ドラッグイベントリスナーが登録されていないことを確認
      const dragstartCalls = mockInput.on.mock.calls.filter((call) => call[0] === 'dragstart');

      expect(dragstartCalls.length).toBe(0);

      cardUI.destroy();
    });
  });

  describe('TC-107: onDropコールバックが未設定の場合', () => {
    test('エラーがスローされない', () => {
      mockContainer.x = 100;
      mockContainer.y = 200;

      const cardUI = new DraggableCardUI(scene, {
        card: gatheringCard,
        x: 100,
        y: 200,
        interactive: true,
        // onDropは設定しない
      });

      // ドラッグ開始
      const dragstartCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragstart');

      if (dragstartCall) {
        const callback = dragstartCall[1];
        callback({ x: 100, y: 200 }, mockRectangle);
      }

      // ドラッグ終了（ゾーン外）- エラーがスローされないことを確認
      const dragendCall = mockInput.on.mock.calls.find((call) => call[0] === 'dragend');

      expect(() => {
        if (dragendCall) {
          const callback = dragendCall[1];
          callback({ x: 50, y: 50 }, mockRectangle);
        }
      }).not.toThrow();

      cardUI.destroy();
    });
  });
});
