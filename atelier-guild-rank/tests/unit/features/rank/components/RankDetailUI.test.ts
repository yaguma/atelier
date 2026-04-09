/**
 * RankDetailUI コンポーネントテスト
 * Issue #475: ランク詳細 SlidePanel を新規実装
 */

import { RankDetailUI, type RankDetailUIConfig } from '@features/rank/components/RankDetailUI';
import type { GuildRank } from '@shared/types';
import type { IGuildRankMaster, ISpecialRule } from '@shared/types/master-data';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックヘルパー
// =============================================================================

function createMockRankMaster(
  rank: GuildRank,
  options: {
    name?: string;
    requiredContribution?: number;
    dayLimit?: number;
    specialRules?: ISpecialRule[];
  } = {},
): IGuildRankMaster {
  return {
    id: rank,
    name: options.name ?? `${rank}ランク`,
    requiredContribution: options.requiredContribution ?? 100,
    dayLimit: options.dayLimit ?? 30,
    specialRules: options.specialRules ?? [],
    promotionTest: null,
    unlockedGatheringCards: [],
    unlockedRecipeCards: [],
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

describe('RankDetailUI', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
  });

  describe('コンストラクタ', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      expect(ui).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(() => new RankDetailUI(mockScene, null as unknown as RankDetailUIConfig)).toThrow(
        'config is required',
      );
    });
  });

  describe('create', () => {
    it('create()でオーバーレイが作成される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      expect(mockScene.add.rectangle).toHaveBeenCalled();
    });

    it('create()でランク名が表示される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('C', { name: 'Cランク' }),
        currentContribution: 80,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const nameCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('Cランク'),
      );
      expect(nameCall).toBeDefined();
    });

    it('必要貢献度が表示される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D', { requiredContribution: 200 }),
        currentContribution: 80,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const contribCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('200'),
      );
      expect(contribCall).toBeDefined();
    });

    it('現在の貢献度が表示される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D', { requiredContribution: 200 }),
        currentContribution: 80,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const currentCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('80'),
      );
      expect(currentCall).toBeDefined();
    });

    it('日数制限が表示される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D', { dayLimit: 25 }),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const dayCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('25'),
      );
      expect(dayCall).toBeDefined();
    });

    it('特殊ルールが表示される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('C', {
          specialRules: [{ type: 'QUEST_LIMIT', description: '同時受注数: 2件まで', value: 2 }],
        }),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const ruleCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[2] === 'string' && (call[2] as string).includes('同時受注数: 2件まで'),
      );
      expect(ruleCall).toBeDefined();
    });

    it('特殊ルールが無い場合は「なし」が表示される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('E', { specialRules: [] }),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const noneCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string) === 'なし',
      );
      expect(noneCall).toBeDefined();
    });

    it('昇格ボーナスが表示される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const bonusCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[2] === 'string' && (call[2] as string).includes('昇格ボーナス'),
      );
      expect(bonusCall).toBeDefined();
    });

    it('ESCキーリスナーが登録される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      expect(mockScene.input.keyboard?.addKey).toHaveBeenCalledWith('ESC');
    });

    it('閉じるボタンが作成される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      const textCalls = (mockScene.add.text as ReturnType<typeof vi.fn>).mock.calls;
      const closeCall = textCalls.find(
        (call: unknown[]) => typeof call[2] === 'string' && (call[2] as string).includes('閉じる'),
      );
      expect(closeCall).toBeDefined();
    });

    it('開くアニメーションが再生される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('close()でアニメーションが実行される', () => {
      const onClose = vi.fn();
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose,
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      (mockScene.tweens.add as ReturnType<typeof vi.fn>).mockClear();

      ui.close();

      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    it('close()のonCompleteでonCloseコールバックが呼ばれる', () => {
      const onClose = vi.fn();
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose,
      };

      const ui = new RankDetailUI(mockScene, config);
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
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose,
      };

      const ui = new RankDetailUI(mockScene, config);
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
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      (mockScene.tweens.add as ReturnType<typeof vi.fn>).mockClear();

      ui.close();

      const callCountAfterFirstClose = (mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls
        .length;

      ui.close(); // 2回目は無視されるべき

      expect((mockScene.tweens.add as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
        callCountAfterFirstClose,
      );
    });
  });

  describe('destroy', () => {
    it('destroy()でリソースが解放される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();

      expect(() => ui.destroy()).not.toThrow();
    });

    it('create()前にdestroy()を呼んでもエラーにならない', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);

      expect(() => ui.destroy()).not.toThrow();
    });

    it('ESCキーリスナーが解除される', () => {
      const config: RankDetailUIConfig = {
        rankMaster: createMockRankMaster('D'),
        currentContribution: 50,
        onClose: vi.fn(),
      };

      const ui = new RankDetailUI(mockScene, config);
      ui.create();
      ui.destroy();

      expect(mockScene.input.keyboard?.removeKey).toHaveBeenCalledWith('ESC');
    });
  });
});
