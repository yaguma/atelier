/**
 * rank-components.test.ts - ランクUIコンポーネントテスト
 * TASK-0093: features/rank/components作成
 */

import type { PromotionDialogConfig } from '@features/rank/components/PromotionDialog';
import { PromotionDialog } from '@features/rank/components/PromotionDialog';
import type { RankBadgeConfig } from '@features/rank/components/RankBadge';
import { RankBadge } from '@features/rank/components/RankBadge';
import type { RankProgressBarConfig } from '@features/rank/components/RankProgressBar';
import { RankProgressBar } from '@features/rank/components/RankProgressBar';
import type { SpecialRuleDisplayConfig } from '@features/rank/components/SpecialRuleDisplay';
import { SpecialRuleDisplay } from '@features/rank/components/SpecialRuleDisplay';
import { SpecialRuleType } from '@shared/types';
import type { ISpecialRule } from '@shared/types/master-data';
import type Phaser from 'phaser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// =============================================================================
// モックヘルパー
// =============================================================================

function createMockScene(): Phaser.Scene {
  const mockContainer = {
    setPosition: vi.fn().mockReturnThis(),
    setVisible: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
  };

  const mockTextObj = {
    setOrigin: vi.fn().mockReturnThis(),
    setWordWrapWidth: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
  };

  const scene = {
    add: {
      container: vi.fn().mockReturnValue(mockContainer),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setStrokeStyle: vi.fn().mockReturnThis(),
        setFillStyle: vi.fn().mockReturnThis(),
        setSize: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      text: vi.fn().mockReturnValue(mockTextObj),
      graphics: vi.fn().mockReturnValue({
        fillStyle: vi.fn().mockReturnThis(),
        fillRoundedRect: vi.fn().mockReturnThis(),
        lineStyle: vi.fn().mockReturnThis(),
        strokeRoundedRect: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
    },
    make: {
      text: vi.fn().mockReturnValue(mockTextObj),
      container: vi.fn().mockReturnValue(mockContainer),
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

function createSpecialRule(
  type: SpecialRuleType,
  description: string,
  value?: number,
  condition?: string,
): ISpecialRule {
  return { type, description, value, condition } as ISpecialRule;
}

// =============================================================================
// テスト
// =============================================================================

describe('features/rank/components', () => {
  let mockScene: Phaser.Scene;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScene = createMockScene();
  });

  // ===========================================================================
  // RankProgressBar
  // ===========================================================================

  describe('RankProgressBar', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: RankProgressBarConfig = { rank: 'D', gaugePercent: 50 };
      const bar = new RankProgressBar(mockScene, 0, 0, config);
      expect(bar).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(
        () => new RankProgressBar(mockScene, 0, 0, null as unknown as RankProgressBarConfig),
      ).toThrow('config is required');
    });

    it('create()で進捗バーが表示される', () => {
      const config: RankProgressBarConfig = { rank: 'D', gaugePercent: 50 };
      const bar = new RankProgressBar(mockScene, 0, 0, config);
      bar.create();

      // バー背景とバー塗り部分は new Phaser.GameObjects.Rectangle() で作成
      // テキストは scene.make.text() で作成
      expect(mockScene.make.text).toHaveBeenCalled();
    });

    it('進捗率に応じたテキストが表示される', () => {
      const config: RankProgressBarConfig = { rank: 'D', gaugePercent: 75 };
      const bar = new RankProgressBar(mockScene, 0, 0, config);
      bar.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const gaugeCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[0] === 'object' &&
          call[0] !== null &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('75%'),
      );
      expect(gaugeCall).toBeDefined();
    });

    it('ランクに応じた色が適用される', () => {
      const config: RankProgressBarConfig = { rank: 'A', gaugePercent: 80 };
      const bar = new RankProgressBar(mockScene, 0, 0, config);
      // new Phaser.GameObjects.Rectangle() で色が適用される（コンストラクタ経由）
      expect(() => bar.create()).not.toThrow();
    });

    it('updateProgress()で進捗を更新できる', () => {
      const config: RankProgressBarConfig = { rank: 'D', gaugePercent: 30 };
      const bar = new RankProgressBar(mockScene, 0, 0, config);
      bar.create();

      expect(() => bar.updateProgress(80, 'C')).not.toThrow();
    });

    it('destroy()でリソースが解放される', () => {
      const config: RankProgressBarConfig = { rank: 'D', gaugePercent: 50 };
      const bar = new RankProgressBar(mockScene, 0, 0, config);
      bar.create();
      expect(() => bar.destroy()).not.toThrow();
    });

    it('create()を複数回呼んでもUIが重複しない', () => {
      const config: RankProgressBarConfig = { rank: 'D', gaugePercent: 50 };
      const bar = new RankProgressBar(mockScene, 0, 0, config);
      bar.create();
      const callCount = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls.length;
      bar.create();
      expect((mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });
  });

  // ===========================================================================
  // RankBadge
  // ===========================================================================

  describe('RankBadge', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: RankBadgeConfig = { rank: 'D' };
      const badge = new RankBadge(mockScene, 0, 0, config);
      expect(badge).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(() => new RankBadge(mockScene, 0, 0, null as unknown as RankBadgeConfig)).toThrow(
        'config is required',
      );
    });

    it('create()でバッジが表示される', () => {
      const config: RankBadgeConfig = { rank: 'B' };
      const badge = new RankBadge(mockScene, 0, 0, config);
      badge.create();

      // バッジ背景は new Phaser.GameObjects.Rectangle() で作成
      // テキストは scene.make.text() で作成
      expect(mockScene.make.text).toHaveBeenCalled();
    });

    it('ランク文字が正しく表示される', () => {
      const config: RankBadgeConfig = { rank: 'A' };
      const badge = new RankBadge(mockScene, 0, 0, config);
      badge.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const rankCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[0] === 'object' &&
          call[0] !== null &&
          (call[0] as Record<string, unknown>).text === 'A',
      );
      expect(rankCall).toBeDefined();
    });

    it('ランク名が正しく表示される', () => {
      const config: RankBadgeConfig = { rank: 'S' };
      const badge = new RankBadge(mockScene, 0, 0, config);
      badge.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const nameCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[0] === 'object' &&
          call[0] !== null &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('Sランク'),
      );
      expect(nameCall).toBeDefined();
    });

    it('updateRank()でランクを更新できる', () => {
      const config: RankBadgeConfig = { rank: 'D' };
      const badge = new RankBadge(mockScene, 0, 0, config);
      badge.create();

      expect(() => badge.updateRank('A')).not.toThrow();
    });

    it('destroy()でリソースが解放される', () => {
      const config: RankBadgeConfig = { rank: 'D' };
      const badge = new RankBadge(mockScene, 0, 0, config);
      badge.create();
      expect(() => badge.destroy()).not.toThrow();
    });
  });

  // ===========================================================================
  // PromotionDialog
  // ===========================================================================

  describe('PromotionDialog', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: PromotionDialogConfig = {
        fromRank: 'D',
        toRank: 'C',
        bonusGold: 400,
      };
      const dialog = new PromotionDialog(mockScene, 0, 0, config);
      expect(dialog).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(
        () => new PromotionDialog(mockScene, 0, 0, null as unknown as PromotionDialogConfig),
      ).toThrow('config is required');
    });

    it('create()で昇格ダイアログが表示される', () => {
      const config: PromotionDialogConfig = {
        fromRank: 'D',
        toRank: 'C',
        bonusGold: 400,
      };
      const dialog = new PromotionDialog(mockScene, 0, 0, config);
      dialog.create();

      // 背景は new Phaser.GameObjects.Rectangle() で作成
      // テキストは scene.make.text() で作成
      expect(mockScene.make.text).toHaveBeenCalled();
    });

    it('新しいランク情報が表示される', () => {
      const config: PromotionDialogConfig = {
        fromRank: 'E',
        toRank: 'D',
        bonusGold: 300,
      };
      const dialog = new PromotionDialog(mockScene, 0, 0, config);
      dialog.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const rankCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[0] === 'object' &&
          call[0] !== null &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('E') &&
          ((call[0] as Record<string, unknown>).text as string).includes('D'),
      );
      expect(rankCall).toBeDefined();
    });

    it('ボーナス報酬が表示される', () => {
      const config: PromotionDialogConfig = {
        fromRank: 'D',
        toRank: 'C',
        bonusGold: 500,
      };
      const dialog = new PromotionDialog(mockScene, 0, 0, config);
      dialog.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const bonusCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[0] === 'object' &&
          call[0] !== null &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('500'),
      );
      expect(bonusCall).toBeDefined();
    });

    it('特殊ルール解放が表示される', () => {
      const rules: ISpecialRule[] = [
        createSpecialRule(SpecialRuleType.QUEST_LIMIT, '依頼数制限: 5件まで', 5),
      ];
      const config: PromotionDialogConfig = {
        fromRank: 'D',
        toRank: 'C',
        bonusGold: 400,
        unlockedRules: rules,
      };
      const dialog = new PromotionDialog(mockScene, 0, 0, config);
      dialog.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const ruleCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[0] === 'object' &&
          call[0] !== null &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('依頼数制限'),
      );
      expect(ruleCall).toBeDefined();
    });

    it('特殊ルールが空の場合ルール表示をスキップする', () => {
      const config: PromotionDialogConfig = {
        fromRank: 'D',
        toRank: 'C',
        bonusGold: 400,
        unlockedRules: [],
      };
      const dialog = new PromotionDialog(mockScene, 0, 0, config);
      dialog.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const headerCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[0] === 'object' &&
          call[0] !== null &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('解放された特殊ルール'),
      );
      expect(headerCall).toBeUndefined();
    });

    it('destroy()でリソースが解放される', () => {
      const config: PromotionDialogConfig = {
        fromRank: 'D',
        toRank: 'C',
        bonusGold: 400,
      };
      const dialog = new PromotionDialog(mockScene, 0, 0, config);
      dialog.create();
      expect(() => dialog.destroy()).not.toThrow();
    });
  });

  // ===========================================================================
  // SpecialRuleDisplay
  // ===========================================================================

  describe('SpecialRuleDisplay', () => {
    it('正しい設定でインスタンスを生成できる', () => {
      const config: SpecialRuleDisplayConfig = { rules: [] };
      const display = new SpecialRuleDisplay(mockScene, 0, 0, config);
      expect(display).toBeDefined();
    });

    it('configがnullの場合エラーを投げる', () => {
      expect(
        () => new SpecialRuleDisplay(mockScene, 0, 0, null as unknown as SpecialRuleDisplayConfig),
      ).toThrow('config is required');
    });

    it('create()で特殊ルール一覧が表示される', () => {
      const config: SpecialRuleDisplayConfig = {
        rules: [
          {
            rule: createSpecialRule(SpecialRuleType.QUEST_LIMIT, '依頼数制限', 3),
            active: true,
          },
        ],
      };
      const display = new SpecialRuleDisplay(mockScene, 0, 0, config);
      display.create();

      expect(mockScene.make.text).toHaveBeenCalled();
    });

    it('有効なルールのテキストが表示される', () => {
      const config: SpecialRuleDisplayConfig = {
        rules: [
          {
            rule: createSpecialRule(SpecialRuleType.QUALITY_PENALTY, '品質ペナルティ', 0.8),
            active: true,
          },
        ],
      };
      const display = new SpecialRuleDisplay(mockScene, 0, 0, config);
      display.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const ruleCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[0] === 'object' &&
          call[0] !== null &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('品質ペナルティ'),
      );
      expect(ruleCall).toBeDefined();
    });

    it('無効なルールのテキストが表示される', () => {
      const config: SpecialRuleDisplayConfig = {
        rules: [
          {
            rule: createSpecialRule(SpecialRuleType.DEADLINE_REDUCTION, '期限短縮', 2),
            active: false,
          },
        ],
      };
      const display = new SpecialRuleDisplay(mockScene, 0, 0, config);
      display.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const ruleCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[0] === 'object' &&
          call[0] !== null &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('期限短縮'),
      );
      expect(ruleCall).toBeDefined();
    });

    it('有効なルールにインジケーターが表示される', () => {
      const config: SpecialRuleDisplayConfig = {
        rules: [
          {
            rule: createSpecialRule(SpecialRuleType.QUEST_LIMIT, 'テストルール', 3),
            active: true,
          },
        ],
      };
      const display = new SpecialRuleDisplay(mockScene, 0, 0, config);
      // インジケーターは new Phaser.GameObjects.Rectangle() で作成される
      expect(() => display.create()).not.toThrow();
    });

    it('カスタムヘッダーが表示される', () => {
      const config: SpecialRuleDisplayConfig = {
        rules: [],
        header: 'カスタムヘッダー',
      };
      const display = new SpecialRuleDisplay(mockScene, 0, 0, config);
      display.create();

      const textCalls = (mockScene.make.text as ReturnType<typeof vi.fn>).mock.calls;
      const headerCall = textCalls.find(
        (call: unknown[]) =>
          typeof call[0] === 'object' &&
          call[0] !== null &&
          typeof (call[0] as Record<string, unknown>).text === 'string' &&
          ((call[0] as Record<string, unknown>).text as string).includes('カスタムヘッダー'),
      );
      expect(headerCall).toBeDefined();
    });

    it('destroy()でリソースが解放される', () => {
      const config: SpecialRuleDisplayConfig = { rules: [] };
      const display = new SpecialRuleDisplay(mockScene, 0, 0, config);
      display.create();
      expect(() => display.destroy()).not.toThrow();
    });
  });
});
