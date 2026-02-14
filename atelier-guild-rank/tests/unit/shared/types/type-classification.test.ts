/**
 * 型分類テスト
 * TASK-0064: shared/types移行と整理
 *
 * @description
 * 機能固有型と共通型の分類を検証する。
 * 共通型はshared/typesに残し、機能固有型は後で各featureに移動する準備を確認する。
 */
import { describe, expect, it } from 'vitest';

// =============================================================================
// 共通型のエクスポート確認
// =============================================================================

describe('shared/types 型分類', () => {
  describe('共通型（shared/typesに残す）', () => {
    it('基本列挙型がすべてエクスポートされていること', async () => {
      const types = await import('@shared/types');
      // ゲーム全体で使用される列挙型
      expect(types.GamePhase).toBeDefined();
      expect(types.GuildRank).toBeDefined();
      expect(types.CardType).toBeDefined();
      expect(types.Quality).toBeDefined();
      expect(types.Attribute).toBeDefined();
      expect(types.QuestType).toBeDefined();
      expect(types.ClientType).toBeDefined();
      expect(types.Rarity).toBeDefined();
      expect(types.EnhancementTarget).toBeDefined();
      expect(types.EffectType).toBeDefined();
      expect(types.ItemCategory).toBeDefined();
      expect(types.ItemEffectType).toBeDefined();
      expect(types.SpecialRuleType).toBeDefined();
    });

    it('VALID_GAME_PHASESがエクスポートされていること', async () => {
      const types = await import('@shared/types');
      expect(types.VALID_GAME_PHASES).toBeDefined();
      expect(types.VALID_GAME_PHASES).toHaveLength(4);
    });

    it('ブランドID型変換関数がすべてエクスポートされていること', async () => {
      const types = await import('@shared/types');
      expect(typeof types.toCardId).toBe('function');
      expect(typeof types.toMaterialId).toBe('function');
      expect(typeof types.toItemId).toBe('function');
      expect(typeof types.toQuestId).toBe('function');
      expect(typeof types.toArtifactId).toBe('function');
      expect(typeof types.toClientId).toBe('function');
      expect(typeof types.toRecipeId).toBe('function');
    });

    it('定数がすべてエクスポートされていること', async () => {
      const types = await import('@shared/types');
      expect(types.QualityValue).toBeDefined();
      expect(types.QualityMultiplier).toBeDefined();
      expect(types.RankOrder).toBeDefined();
      expect(types.InitialParameters).toBeDefined();
    });

    it('エラー型がすべてエクスポートされていること', async () => {
      const types = await import('@shared/types');
      expect(types.DomainError).toBeDefined();
      expect(types.ApplicationError).toBeDefined();
      expect(types.ErrorCodes).toBeDefined();
    });

    it('イベント型がエクスポートされていること', async () => {
      const types = await import('@shared/types');
      expect(types.GameEventType).toBeDefined();
      expect(types.GameEventType.PHASE_CHANGED).toBe('PHASE_CHANGED');
      expect(types.GameEventType.DAY_ENDED).toBe('DAY_ENDED');
      expect(types.GameEventType.GAME_OVER).toBe('GAME_OVER');
    });

    it('ユーティリティ型がエクスポートされていること', async () => {
      // DeepReadonly, RequiredFields, NonNullableFields は型のみ
      // TypeScriptコンパイル成功で確認
      const types = await import('@shared/types');
      expect(types).toBeDefined();
    });
  });

  describe('機能固有型（後で各featureに移動予定）', () => {
    it('カード型ガード関数がエクスポートされていること（→ features/deck/types）', async () => {
      const types = await import('@shared/types');
      // カード関連型は features/deck/types に移動予定
      expect(typeof types.isGatheringCard).toBe('function');
      expect(typeof types.isRecipeCard).toBe('function');
      expect(typeof types.isEnhancementCard).toBe('function');
    });

    it('マスターデータ型ガード関数がエクスポートされていること', async () => {
      const types = await import('@shared/types');
      // マスターデータ型は各featureのtypesに分散移動予定
      expect(typeof types.isGatheringCardMaster).toBe('function');
      expect(typeof types.isRecipeCardMaster).toBe('function');
      expect(typeof types.isEnhancementCardMaster).toBe('function');
    });
  });

  describe('@shared/typesパスエイリアス確認', () => {
    it('@shared/typesからインポートが正しく機能すること', async () => {
      // 動的インポートで確認
      const module = await import('@shared/types');
      expect(module).toBeDefined();

      // 値としてエクスポートされているものの数を確認
      const exportedKeys = Object.keys(module);
      // 列挙型(13) + 定数(4) + ID変換関数(7) + カード型ガード(3) + マスター型ガード(3)
      // + エラー(3) + イベント型(1) + VALID_GAME_PHASES(1) = 35以上
      expect(exportedKeys.length).toBeGreaterThanOrEqual(30);
    });
  });
});
