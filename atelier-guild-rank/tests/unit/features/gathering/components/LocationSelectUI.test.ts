/**
 * LocationSelectUI コンポーネントテスト
 * TASK-0113: LocationSelectUI実装
 * Issue #288: 採取場所選択UIをマップ形式に変更（REQ-002-01）
 *
 * @description
 * 採取場所選択UIのテスト。マップ形式での場所ノード表示、AP表示、
 * 手札連動フィルタ、場所選択コールバック、空手札メッセージ、
 * マップ座標によるノード配置を検証する。
 *
 * @信頼性レベル 🔵 REQ-002-01・architecture.mdに基づく
 */

import type { IGatheringLocation, ILocationSelectResult } from '@features/gathering';
import { LocationSelectUI } from '@features/gathering/components/LocationSelectUI';
import type { CardId } from '@shared/types';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックヘルパー
// =============================================================================

function toCardId(id: string): CardId {
  return id as CardId;
}

function createMockLocations(): IGatheringLocation[] {
  return [
    {
      cardId: toCardId('gathering-forest'),
      name: '近くの森',
      movementAPCost: 1,
      availableMaterials: [
        { name: '薬草', rarity: 'Common', dropRate: 'high' },
        { name: '毒草', rarity: 'Common', dropRate: 'medium' },
        { name: '光る花', rarity: 'Uncommon', dropRate: 'low' },
      ],
      mapX: 100,
      mapY: 200,
      isSelectable: true,
    },
    {
      cardId: toCardId('gathering-mine'),
      name: '鉱山',
      movementAPCost: 1,
      availableMaterials: [
        { name: '鉄鉱石', rarity: 'Common', dropRate: 'high' },
        { name: '銅鉱石', rarity: 'Common', dropRate: 'medium' },
        { name: '銀鉱石', rarity: 'Uncommon', dropRate: 'low' },
      ],
      mapX: 300,
      mapY: 150,
      isSelectable: false,
    },
    {
      cardId: toCardId('gathering-ruins'),
      name: '古代遺跡',
      movementAPCost: 2,
      availableMaterials: [
        { name: '古代の欠片', rarity: 'Uncommon', dropRate: 'high' },
        { name: '魔法の粉', rarity: 'Rare', dropRate: 'medium' },
        { name: '賢者の石片', rarity: 'Legendary', dropRate: 'low' },
      ],
      mapX: 400,
      mapY: 100,
      isSelectable: true,
    },
  ];
}

function createMockContainer() {
  return {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    remove: vi.fn(),
    x: 0,
    y: 0,
    name: '',
  };
}

function createMockScene(): Phaser.Scene {
  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    text: '',
  };

  const scene = {
    add: {
      container: vi.fn().mockImplementation(() => createMockContainer()),
      rectangle: vi.fn().mockImplementation(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
      circle: vi.fn().mockImplementation(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
      text: vi.fn().mockReturnValue({ ...mockText }),
    },
    make: {
      text: vi.fn().mockImplementation(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setText: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        setVisible: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        text: '',
      })),
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

describe('LocationSelectUI（Issue #288: マップ形式）', () => {
  let mockScene: Phaser.Scene;
  let mockLocations: IGatheringLocation[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
    mockLocations = createMockLocations();
  });

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  describe('コンストラクタ', () => {
    it('正しい引数でインスタンスを生成できる', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      expect(ui).toBeDefined();
    });

    it('sceneがnullの場合エラーを投げる', () => {
      expect(() => new LocationSelectUI(null as unknown as Phaser.Scene, 0, 0)).toThrow();
    });

    it('座標にNaNを渡した場合エラーを投げる', () => {
      expect(() => new LocationSelectUI(mockScene, Number.NaN, 0)).toThrow();
    });
  });

  // ===========================================================================
  // マップ形式の初期化
  // ===========================================================================

  describe('マップ形式の初期化', () => {
    it('create()でマップ背景が生成される', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();

      // マップ背景としてrectangleが生成されていること
      expect(mockScene.add.rectangle).toHaveBeenCalled();
    });

    it('create()でマップタイトルが表示される', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const titleTexts = textCalls
        .filter(
          (call: unknown[]) =>
            call[0] && typeof (call[0] as Record<string, unknown>).text === 'string',
        )
        .map((call: unknown[]) => (call[0] as Record<string, string>).text);

      expect(titleTexts).toContain('採取地マップ');
    });

    it('create()を2回呼んでも重複生成されない', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      const firstCallCount = (mockScene.add.rectangle as ReturnType<typeof vi.fn>).mock.calls
        .length;

      ui.create();
      const secondCallCount = (mockScene.add.rectangle as ReturnType<typeof vi.fn>).mock.calls
        .length;

      expect(secondCallCount).toBe(firstCallCount);
    });
  });

  // ===========================================================================
  // テストケース1: マップ上の場所ノード表示
  // ===========================================================================

  describe('マップ上の場所ノード表示', () => {
    it('T-0113-01: 3つの採取地データで3つの場所ノードが表示される', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);

      expect(ui.getLocationCount()).toBe(3);
    });

    it('場所リストが空の場合、ノード数は0', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations([]);

      expect(ui.getLocationCount()).toBe(0);
    });

    it('場所名が正しく表示される', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const locationNames = textCalls
        .filter(
          (call: unknown[]) =>
            call[0] && typeof (call[0] as Record<string, unknown>).text === 'string',
        )
        .map((call: unknown[]) => (call[0] as Record<string, string>).text);

      expect(locationNames).toContain('近くの森');
      expect(locationNames).toContain('鉱山');
      expect(locationNames).toContain('古代遺跡');
    });

    it('場所ノードは円形（circle）で描画される', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);

      // 3つの場所ノード分のcircle呼び出しがあること
      expect(mockScene.add.circle).toHaveBeenCalledTimes(3);
    });

    it('場所ノードはmapX, mapY座標に基づいて配置される', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);

      // containerが各ノード用に生成されること（1つ目はルートコンテナ、残りはノード用）
      const containerCalls = (mockScene.add.container as ReturnType<typeof vi.fn>).mock.calls;
      // ルートコンテナ(0,0) + ノードコンテナ3つ = 4回以上
      expect(containerCalls.length).toBeGreaterThanOrEqual(4);

      // ノード用コンテナの座標がそれぞれ異なること（マップ配置）
      // ルートコンテナ以外の座標を取得
      const nodePositions = containerCalls
        .slice(1) // ルートコンテナを除外
        .map((call: unknown[]) => ({ x: call[0] as number, y: call[1] as number }));

      // 少なくとも3つのノードコンテナがあること
      expect(nodePositions.length).toBeGreaterThanOrEqual(3);

      // 各ノードの座標が異なること（マップ座標に基づく配置）
      const uniquePositions = new Set(
        nodePositions.map((p: { x: number; y: number }) => `${p.x},${p.y}`),
      );
      expect(uniquePositions.size).toBeGreaterThanOrEqual(3);
    });
  });

  // ===========================================================================
  // テストケース2: APコスト・素材プレビュー表示
  // ===========================================================================

  describe('APコスト・素材プレビュー表示', () => {
    it('T-0113-02: APコストが正しく表示される', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const apTexts = textCalls
        .filter(
          (call: unknown[]) =>
            call[0] &&
            typeof (call[0] as Record<string, unknown>).text === 'string' &&
            ((call[0] as Record<string, string>).text as string).includes('AP'),
        )
        .map((call: unknown[]) => (call[0] as Record<string, string>).text);

      // AP:1 と AP:2 のテキストが含まれることを確認
      expect(apTexts.some((t: string) => t.includes('1'))).toBe(true);
      expect(apTexts.some((t: string) => t.includes('2'))).toBe(true);
    });

    it('素材プレビューが表示される', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const materialTexts = textCalls
        .filter(
          (call: unknown[]) =>
            call[0] && typeof (call[0] as Record<string, unknown>).text === 'string',
        )
        .map((call: unknown[]) => (call[0] as Record<string, string>).text);

      // 素材名が含まれることを確認
      expect(materialTexts.some((t: string) => t.includes('薬草'))).toBe(true);
      expect(materialTexts.some((t: string) => t.includes('鉄鉱石'))).toBe(true);
    });
  });

  // ===========================================================================
  // テストケース3: 手札カードによる選択可否
  // ===========================================================================

  describe('手札カードによる選択可否', () => {
    it('T-0113-03: isSelectable=falseの場所ノードはグレーアウトされる', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);

      // 選択不可のカードがある（鉱山: isSelectable=false）
      const selectableCount = mockLocations.filter((l) => l.isSelectable).length;
      const unselectableCount = mockLocations.filter((l) => !l.isSelectable).length;

      expect(selectableCount).toBe(2);
      expect(unselectableCount).toBe(1);

      // getSelectableLocationCount()で選択可能な場所数を確認
      expect(ui.getSelectableLocationCount()).toBe(2);
    });
  });

  // ===========================================================================
  // テストケース4: 場所選択コールバック
  // ===========================================================================

  describe('場所選択コールバック', () => {
    it('T-0113-04: 選択可能な場所を選択するとコールバックが発火する', () => {
      const callback = vi.fn();
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);
      ui.onLocationSelect(callback);

      // 選択可能な場所（近くの森）を選択
      ui.simulateLocationSelect(toCardId('gathering-forest'));

      expect(callback).toHaveBeenCalledTimes(1);
      const result: ILocationSelectResult = callback.mock.calls[0][0];
      expect(result.cardId).toBe(toCardId('gathering-forest'));
      expect(result.locationName).toBe('近くの森');
      expect(result.movementAPCost).toBe(1);
    });

    it('選択不可の場所を選択してもコールバックは発火しない', () => {
      const callback = vi.fn();
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);
      ui.onLocationSelect(callback);

      // 選択不可の場所（鉱山）を選択
      ui.simulateLocationSelect(toCardId('gathering-mine'));

      expect(callback).not.toHaveBeenCalled();
    });

    it('存在しない場所IDを選択してもコールバックは発火しない', () => {
      const callback = vi.fn();
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);
      ui.onLocationSelect(callback);

      ui.simulateLocationSelect(toCardId('non-existent'));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // テストケース5: 空手札メッセージ
  // ===========================================================================

  describe('空手札メッセージ', () => {
    it('T-0113-05: 全ての場所がisSelectable=falseの場合、メッセージが表示される', () => {
      const allUnselectable: IGatheringLocation[] = mockLocations.map((l) => ({
        ...l,
        isSelectable: false,
      }));

      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(allUnselectable);

      expect(ui.hasEmptyHandMessage()).toBe(true);
    });

    it('選択可能な場所がある場合、メッセージは表示されない', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);

      expect(ui.hasEmptyHandMessage()).toBe(false);
    });

    it('場所リストが空の場合、メッセージが表示される', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations([]);

      expect(ui.hasEmptyHandMessage()).toBe(true);
    });
  });

  // ===========================================================================
  // TC-EDGE-101-01: AP残量0で採取試行（EDGE-101）
  // ===========================================================================

  describe('TC-EDGE-101-01: AP残量0で採取場所選択の振る舞い（EDGE-101）', () => {
    it('AP不足で全場所がisSelectable=falseの場合、空手札メッセージが表示される', () => {
      const allUnselectable: IGatheringLocation[] = [
        {
          cardId: toCardId('gathering-forest'),
          name: '近くの森',
          movementAPCost: 1,
          availableMaterials: [{ name: '薬草', rarity: 'Common', dropRate: 'high' }],
          mapX: 100,
          mapY: 200,
          isSelectable: false,
        },
        {
          cardId: toCardId('gathering-mine'),
          name: '鉱山',
          movementAPCost: 1,
          availableMaterials: [{ name: '鉄鉱石', rarity: 'Common', dropRate: 'high' }],
          mapX: 300,
          mapY: 150,
          isSelectable: false,
        },
      ];

      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(allUnselectable);

      expect(ui.hasEmptyHandMessage()).toBe(true);
      expect(ui.getSelectableLocationCount()).toBe(0);
      expect(ui.getLocationCount()).toBe(2);
    });

    it('AP不足の場所をクリックしてもコールバックは発火しない', () => {
      const callback = vi.fn();
      const unselectableLocations: IGatheringLocation[] = [
        {
          cardId: toCardId('gathering-forest'),
          name: '近くの森',
          movementAPCost: 1,
          availableMaterials: [{ name: '薬草', rarity: 'Common', dropRate: 'high' }],
          mapX: 100,
          mapY: 200,
          isSelectable: false,
        },
      ];

      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(unselectableLocations);
      ui.onLocationSelect(callback);

      ui.simulateLocationSelect(toCardId('gathering-forest'));

      expect(callback).not.toHaveBeenCalled();
    });

    it('AP不足の場所が存在しても、AP十分な場所は選択可能', () => {
      const callback = vi.fn();
      const mixedLocations: IGatheringLocation[] = [
        {
          cardId: toCardId('gathering-forest'),
          name: '近くの森',
          movementAPCost: 1,
          availableMaterials: [{ name: '薬草', rarity: 'Common', dropRate: 'high' }],
          mapX: 100,
          mapY: 200,
          isSelectable: true,
        },
        {
          cardId: toCardId('gathering-ruins'),
          name: '古代遺跡',
          movementAPCost: 2,
          availableMaterials: [{ name: '古代の欠片', rarity: 'Uncommon', dropRate: 'high' }],
          mapX: 400,
          mapY: 100,
          isSelectable: false,
        },
      ];

      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mixedLocations);
      ui.onLocationSelect(callback);

      expect(ui.hasEmptyHandMessage()).toBe(false);
      expect(ui.getSelectableLocationCount()).toBe(1);

      ui.simulateLocationSelect(toCardId('gathering-forest'));
      expect(callback).toHaveBeenCalledTimes(1);

      ui.simulateLocationSelect(toCardId('gathering-ruins'));
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // destroy
  // ===========================================================================

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      ui.create();
      ui.updateLocations(mockLocations);

      expect(() => ui.destroy()).not.toThrow();
    });

    it('create()前にdestroy()を呼んでもエラーにならない', () => {
      const ui = new LocationSelectUI(mockScene, 0, 0);
      expect(() => ui.destroy()).not.toThrow();
    });
  });
});
