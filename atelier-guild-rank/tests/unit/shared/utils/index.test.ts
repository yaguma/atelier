/**
 * shared/utils エクスポートテスト
 * TASK-0065: shared/utils移行
 *
 * @description
 * shared/utilsから必要な関数が正しくエクスポートされていることを確認する。
 * 純粋関数ユーティリティの存在と動作を検証する。
 */
import { describe, expect, it } from 'vitest';

describe('shared/utils エクスポート', () => {
  describe('純粋関数ユーティリティ', () => {
    it('generateUniqueIdがエクスポートされていること', async () => {
      const utils = await import('@shared/utils');
      expect(typeof utils.generateUniqueId).toBe('function');
    });

    it('generateUniqueIdが期待するフォーマットのIDを生成すること', async () => {
      const { generateUniqueId } = await import('@shared/utils');
      const id = generateUniqueId('test');
      expect(id).toMatch(/^test_\d+_\d+$/);
    });
  });

  describe('開発ツール', () => {
    it('DebugToolsがエクスポートされていること', async () => {
      const utils = await import('@shared/utils');
      expect(utils.DebugTools).toBeDefined();
    });
  });

  describe('ユーティリティ分類', () => {
    it('共通ユーティリティ（純粋関数）: generateUniqueId', async () => {
      // generateUniqueIdは全featureから使用される共通ID生成関数
      // shared/utilsに残すべき
      const { generateUniqueId } = await import('@shared/utils');
      const id1 = generateUniqueId('material');
      const id2 = generateUniqueId('item');
      expect(id1).toMatch(/^material_/);
      expect(id2).toMatch(/^item_/);
    });

    it('開発ツール（副作用あり）: DebugTools', async () => {
      // DebugToolsは開発環境専用のデバッグツール
      // 副作用あり（StateManager操作、localStorage操作）
      // shared/utilsに配置するのは適切（開発専用共通ツール）
      const utils = await import('@shared/utils');
      expect(utils.DebugTools).toBeDefined();
    });
  });
});
