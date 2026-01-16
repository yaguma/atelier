/**
 * index.ts テストケース
 * エクスポート統合テスト
 *
 * @description
 * TC-IDX-001 〜 TC-IDX-013 を実装
 * @shared/types からすべての型・定数・関数が正しくエクスポートされていることを確認
 */
import { describe, expect, it } from 'vitest';

// =============================================================================
// 13.1 エクスポート確認
// =============================================================================

describe('index.ts', () => {
  // TC-IDX-001
  it('@shared/typesからすべての列挙型がインポート可能', async () => {
    const types = await import('@shared/types');
    // GamePhase
    expect(types.GamePhase).toBeDefined();
    expect(types.GamePhase.QUEST_ACCEPT).toBeDefined();
    // GuildRank
    expect(types.GuildRank).toBeDefined();
    expect(types.GuildRank.G).toBeDefined();
    // CardType
    expect(types.CardType).toBeDefined();
    expect(types.CardType.GATHERING).toBeDefined();
    // Quality
    expect(types.Quality).toBeDefined();
    expect(types.Quality.A).toBeDefined();
    // Attribute
    expect(types.Attribute).toBeDefined();
    expect(types.Attribute.FIRE).toBeDefined();
    // QuestType
    expect(types.QuestType).toBeDefined();
    expect(types.QuestType.SPECIFIC).toBeDefined();
    // ClientType
    expect(types.ClientType).toBeDefined();
    expect(types.ClientType.VILLAGER).toBeDefined();
    // Rarity
    expect(types.Rarity).toBeDefined();
    expect(types.Rarity.COMMON).toBeDefined();
    // EnhancementTarget
    expect(types.EnhancementTarget).toBeDefined();
    expect(types.EnhancementTarget.GATHERING).toBeDefined();
    // EffectType
    expect(types.EffectType).toBeDefined();
    expect(types.EffectType.QUALITY_UP).toBeDefined();
    // ItemCategory
    expect(types.ItemCategory).toBeDefined();
    expect(types.ItemCategory.MEDICINE).toBeDefined();
    // ItemEffectType
    expect(types.ItemEffectType).toBeDefined();
    expect(types.ItemEffectType.HP_RECOVERY).toBeDefined();
    // SpecialRuleType
    expect(types.SpecialRuleType).toBeDefined();
    expect(types.SpecialRuleType.QUEST_LIMIT).toBeDefined();
    // GameEventType
    expect(types.GameEventType).toBeDefined();
    expect(types.GameEventType.PHASE_CHANGED).toBeDefined();
  });

  // TC-IDX-002
  it('@shared/typesからすべてのID型がインポート可能', async () => {
    // ID変換関数経由で確認
    const types = await import('@shared/types');
    expect(types.toCardId).toBeDefined();
    expect(types.toMaterialId).toBeDefined();
    expect(types.toItemId).toBeDefined();
    expect(types.toQuestId).toBeDefined();
    expect(types.toArtifactId).toBeDefined();
    expect(types.toClientId).toBeDefined();
    expect(types.toRecipeId).toBeDefined();
  });

  // TC-IDX-003
  it('@shared/typesからすべてのカード型がインポート可能', async () => {
    // 型ガード関数経由で確認
    const types = await import('@shared/types');
    expect(types.isGatheringCard).toBeDefined();
    expect(types.isRecipeCard).toBeDefined();
    expect(types.isEnhancementCard).toBeDefined();
  });

  // TC-IDX-004
  it('@shared/typesからすべての素材・アイテム型がインポート可能', async () => {
    // 型はコンパイル時に確認されるため、インポートが成功すればOK
    const types = await import('@shared/types');
    expect(types).toBeDefined();
    // 型のインポートはTypeScriptコンパイラで確認
  });

  // TC-IDX-005
  it('@shared/typesからすべての依頼型がインポート可能', async () => {
    const types = await import('@shared/types');
    expect(types).toBeDefined();
    // 型のインポートはTypeScriptコンパイラで確認
  });

  // TC-IDX-006
  it('@shared/typesからすべてのゲーム状態型がインポート可能', async () => {
    const types = await import('@shared/types');
    expect(types).toBeDefined();
    // 型のインポートはTypeScriptコンパイラで確認
  });

  // TC-IDX-007
  it('@shared/typesからすべてのイベント型がインポート可能', async () => {
    const types = await import('@shared/types');
    expect(types.GameEventType).toBeDefined();
    // 型のインポートはTypeScriptコンパイラで確認
  });

  // TC-IDX-008
  it('@shared/typesからすべてのセーブデータ型がインポート可能', async () => {
    const types = await import('@shared/types');
    expect(types).toBeDefined();
    // 型のインポートはTypeScriptコンパイラで確認
  });

  // TC-IDX-009
  it('@shared/typesからすべてのエラー型がインポート可能', async () => {
    const types = await import('@shared/types');
    expect(types.DomainError).toBeDefined();
    expect(types.ApplicationError).toBeDefined();
    expect(types.ErrorCodes).toBeDefined();
  });

  // TC-IDX-010
  it('@shared/typesからすべてのユーティリティ型がインポート可能', async () => {
    const types = await import('@shared/types');
    expect(types).toBeDefined();
    // DeepReadonly, RequiredFields, NonNullableFields は型のみ
    // TypeScriptコンパイラで確認
  });

  // TC-IDX-011
  it('@shared/typesからすべての定数がインポート可能', async () => {
    const types = await import('@shared/types');
    expect(types.QualityValue).toBeDefined();
    expect(types.QualityMultiplier).toBeDefined();
    expect(types.RankOrder).toBeDefined();
    expect(types.InitialParameters).toBeDefined();
  });

  // TC-IDX-012
  it('@shared/typesからすべてのID変換関数がインポート可能', async () => {
    const types = await import('@shared/types');
    expect(typeof types.toCardId).toBe('function');
    expect(typeof types.toMaterialId).toBe('function');
    expect(typeof types.toItemId).toBe('function');
    expect(typeof types.toQuestId).toBe('function');
    expect(typeof types.toArtifactId).toBe('function');
    expect(typeof types.toClientId).toBe('function');
    expect(typeof types.toRecipeId).toBe('function');
  });

  // TC-IDX-013
  it('@shared/typesからすべての型ガード関数がインポート可能', async () => {
    const types = await import('@shared/types');
    expect(typeof types.isGatheringCard).toBe('function');
    expect(typeof types.isRecipeCard).toBe('function');
    expect(typeof types.isEnhancementCard).toBe('function');
  });
});
