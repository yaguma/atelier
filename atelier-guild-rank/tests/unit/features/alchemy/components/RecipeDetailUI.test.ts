/**
 * RecipeDetailUI コンポーネントテスト
 * Issue #474: レシピ詳細 SlidePanel を新規実装
 */

// テスト対象は実装後にインポートする
import {
  RecipeDetailUI,
  type RecipeDetailUIConfig,
} from '@features/alchemy/components/RecipeDetailUI';
import type { CardId } from '@shared/types';
import type { IRecipeRequiredMaterial } from '@shared/types/master-data';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックヘルパー
// =============================================================================

function createMockRecipe(
  id: string,
  options: {
    name?: string;
    cost?: number;
    description?: string;
    requiredMaterials?: IRecipeRequiredMaterial[];
    outputItemId?: string;
    category?: string;
    rarity?: string;
    unlockRank?: string;
  } = {},
) {
  return {
    id: id as CardId,
    name: options.name ?? '回復薬',
    type: 'RECIPE' as const,
    cost: options.cost ?? 2,
    requiredMaterials: options.requiredMaterials ?? [
      { materialId: 'herb', quantity: 2 },
      { materialId: 'water', quantity: 1, minQuality: 'C' as const },
    ],
    outputItemId: options.outputItemId ?? 'healing_potion',
    category: options.category ?? 'CONSUMABLE',
    rarity: options.rarity ?? 'COMMON',
    unlockRank: options.unlockRank ?? 'E',
    description: options.description ?? '体力を回復する薬',
  };
}

function createMockScene(): Phaser.Scene {
  const mockContainer = {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 640,
    y: 360,
  };

  const mockText = {
    setOrigin: vi.fn().mockReturnThis(),
    setWordWrapWidth: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const mockTween = {
    stop: vi.fn(),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
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
    tweens: {
      add: vi.fn().mockReturnValue(mockTween),
      killTweensOf: vi.fn(),
    },
    input: {
      keyboard: {
        addKey: vi.fn().mockReturnValue({
          on: vi.fn().mockReturnThis(),
          off: vi.fn().mockReturnThis(),
        }),
        removeKey: vi.fn(),
      },
    },
    rexUI: undefined,
  } as unknown as Phaser.Scene;

  return scene;
}

// =============================================================================
// テスト
// =============================================================================

describe('RecipeDetailUI', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
  });

  describe('コンストラクタ', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      expect(ui).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(() => new RecipeDetailUI(mockScene, null as unknown as RecipeDetailUIConfig)).toThrow(
        'config is required',
      );
    });
  });

  describe('create', () => {
    it('create()でオーバーレイが作成される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      expect(mockScene.add.rectangle).toHaveBeenCalled();
    });

    it('create()でレシピ名が表示される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001', { name: '万能薬' }),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const nameCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('万能薬'),
      );
      expect(nameCall).toBeDefined();
    });

    it('行動コストが表示される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001', { cost: 3 }),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const costCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('3'),
      );
      expect(costCall).toBeDefined();
    });

    it('必要素材が表示される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001', {
          requiredMaterials: [
            { materialId: 'herb', quantity: 2 },
            { materialId: 'water', quantity: 1, minQuality: 'C' as const },
          ],
        }),
        materialNameResolver: (id: string) => (id === 'herb' ? '薬草' : '水'),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const herbCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('薬草'),
      );
      expect(herbCall).toBeDefined();
    });

    it('説明文が表示される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001', { description: '体力を回復する薬' }),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const descCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[2] === 'string' && (call[2] as string).includes('体力を回復する薬'),
      );
      expect(descCall).toBeDefined();
    });

    it('ESCキーリスナーが登録される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      expect(mockScene.input.keyboard?.addKey).toHaveBeenCalledWith('ESC');
    });

    it('閉じるボタンが作成される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const closeCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('閉じる'),
      );
      expect(closeCall).toBeDefined();
    });

    it('開くアニメーションが再生される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('materialNameResolverが無い場合はmaterialIdが表示される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001', {
          requiredMaterials: [{ materialId: 'herb', quantity: 2 }],
        }),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const herbCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('herb'),
      );
      expect(herbCall).toBeDefined();
    });
  });

  describe('close', () => {
    it('close()でアニメーションが実行される', () => {
      const onClose = vi.fn();
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose,
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      (mockScene.tweens.add as ReturnType<typeof vi.fn>).mockClear();

      ui.close();

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('close()のonCompleteでonCloseコールバックが呼ばれる', () => {
      const onClose = vi.fn();
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose,
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      (mockScene.tweens.add as ReturnType<typeof vi.fn>).mockImplementation(
        (tweenConfig: { onComplete?: () => void }) => {
          tweenConfig.onComplete?.();
          return { stop: vi.fn() };
        },
      );

      ui.close();

      expect(onClose).toHaveBeenCalledOnce();
    });

    it('destroy後にclose()のonCompleteが実行されてもonCloseは呼ばれない', () => {
      const onClose = vi.fn();
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose,
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      let capturedOnComplete: (() => void) | undefined;
      (mockScene.tweens.add as ReturnType<typeof vi.fn>).mockImplementation(
        (tweenConfig: { onComplete?: () => void }) => {
          capturedOnComplete = tweenConfig.onComplete;
          return { stop: vi.fn() };
        },
      );

      ui.close();
      ui.destroy();

      capturedOnComplete?.();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('アニメーション中にclose()を重複呼びしても1回だけ実行される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      (mockScene.tweens.add as ReturnType<typeof vi.fn>).mockClear();

      ui.close();

      const callCountAfterFirstClose = (mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls
        .length;

      ui.close(); // 2回目は無視されるべき

      // 2回目の close() では tweens.add が追加されない
      expect((mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
        callCountAfterFirstClose,
      );
    });
  });

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();

      expect(() => ui.destroy()).not.toThrow();
    });

    it('create()前にdestroy()を呼んでもエラーにならない', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);

      expect(() => ui.destroy()).not.toThrow();
    });

    it('ESCキーリスナーが解除される', () => {
      const config: RecipeDetailUIConfig = {
        recipe: createMockRecipe('recipe-001'),
        onClose: vi.fn(),
      };

      const ui = new RecipeDetailUI(mockScene, config);
      ui.create();
      ui.destroy();

      expect(mockScene.input.keyboard?.removeKey).toHaveBeenCalledWith('ESC');
    });
  });
});
