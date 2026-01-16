/**
 * ids.ts テストケース
 * ブランド型ID・ID変換関数の型安全性テスト
 *
 * @description
 * TC-IDS-001 〜 TC-IDS-031 を実装
 */

// 型インポート（TDD Red: これらの型はまだ存在しない）
import type {
  ArtifactId,
  CardId,
  ClientId,
  ItemId,
  MaterialId,
  QuestId,
  RecipeId,
} from '@shared/types';
// ID変換関数インポート
import {
  toArtifactId,
  toCardId,
  toClientId,
  toItemId,
  toMaterialId,
  toQuestId,
  toRecipeId,
} from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// 3.1 ブランド型定義
// =============================================================================

describe('ids.ts', () => {
  describe('ブランド型定義', () => {
    // TC-IDS-001
    it('CardId型がインポート可能', () => {
      const cardId: CardId = toCardId('card-001');
      expect(cardId).toBeDefined();
    });

    // TC-IDS-002
    it('MaterialId型がインポート可能', () => {
      const materialId: MaterialId = toMaterialId('mat-001');
      expect(materialId).toBeDefined();
    });

    // TC-IDS-003
    it('ItemId型がインポート可能', () => {
      const itemId: ItemId = toItemId('item-001');
      expect(itemId).toBeDefined();
    });

    // TC-IDS-004
    it('QuestId型がインポート可能', () => {
      const questId: QuestId = toQuestId('quest-001');
      expect(questId).toBeDefined();
    });

    // TC-IDS-005
    it('ArtifactId型がインポート可能', () => {
      const artifactId: ArtifactId = toArtifactId('artifact-001');
      expect(artifactId).toBeDefined();
    });

    // TC-IDS-006
    it('ClientId型がインポート可能', () => {
      const clientId: ClientId = toClientId('client-001');
      expect(clientId).toBeDefined();
    });

    // TC-IDS-007
    it('RecipeId型がインポート可能', () => {
      const recipeId: RecipeId = toRecipeId('recipe-001');
      expect(recipeId).toBeDefined();
    });
  });

  // =============================================================================
  // 3.2 ID型の型安全性
  // =============================================================================

  describe('ID型の型安全性', () => {
    // TC-IDS-008
    it('CardIdにMaterialIdを代入できない', () => {
      const materialId: MaterialId = toMaterialId('mat-001');
      // @ts-expect-error - CardIdにMaterialIdは代入不可
      const cardId: CardId = materialId;
      expect(cardId).toBeDefined();
    });

    // TC-IDS-009
    it('MaterialIdにCardIdを代入できない', () => {
      const cardId: CardId = toCardId('card-001');
      // @ts-expect-error - MaterialIdにCardIdは代入不可
      const materialId: MaterialId = cardId;
      expect(materialId).toBeDefined();
    });

    // TC-IDS-010
    it('ItemIdにQuestIdを代入できない', () => {
      const questId: QuestId = toQuestId('quest-001');
      // @ts-expect-error - ItemIdにQuestIdは代入不可
      const itemId: ItemId = questId;
      expect(itemId).toBeDefined();
    });

    // TC-IDS-011
    it('QuestIdにItemIdを代入できない', () => {
      const itemId: ItemId = toItemId('item-001');
      // @ts-expect-error - QuestIdにItemIdは代入不可
      const questId: QuestId = itemId;
      expect(questId).toBeDefined();
    });

    // TC-IDS-012
    it('ArtifactIdにClientIdを代入できない', () => {
      const clientId: ClientId = toClientId('client-001');
      // @ts-expect-error - ArtifactIdにClientIdは代入不可
      const artifactId: ArtifactId = clientId;
      expect(artifactId).toBeDefined();
    });

    // TC-IDS-013
    it('ClientIdにArtifactIdを代入できない', () => {
      const artifactId: ArtifactId = toArtifactId('artifact-001');
      // @ts-expect-error - ClientIdにArtifactIdは代入不可
      const clientId: ClientId = artifactId;
      expect(clientId).toBeDefined();
    });

    // TC-IDS-014
    it('RecipeIdにCardIdを代入できない', () => {
      const cardId: CardId = toCardId('card-001');
      // @ts-expect-error - RecipeIdにCardIdは代入不可
      const recipeId: RecipeId = cardId;
      expect(recipeId).toBeDefined();
    });

    // TC-IDS-015
    it('生の文字列をCardIdに代入できない', () => {
      // @ts-expect-error - 生の文字列はCardIdに代入不可
      const cardId: CardId = 'card-001';
      expect(cardId).toBeDefined();
    });
  });

  // =============================================================================
  // 3.3 ID変換関数
  // =============================================================================

  describe('ID変換関数', () => {
    // TC-IDS-016
    it('toCardId関数が存在する', () => {
      expect(toCardId).toBeDefined();
      expect(typeof toCardId).toBe('function');
    });

    // TC-IDS-017
    it('toCardIdがCardId型を返す', () => {
      const result: CardId = toCardId('card-001');
      expect(result).toBeDefined();
    });

    // TC-IDS-018
    it('toCardIdが入力値をそのまま返す', () => {
      const input = 'card-001';
      const result = toCardId(input);
      expect(result).toBe(input);
    });

    // TC-IDS-019
    it('toMaterialId関数が存在する', () => {
      expect(toMaterialId).toBeDefined();
      expect(typeof toMaterialId).toBe('function');
    });

    // TC-IDS-020
    it('toMaterialIdがMaterialId型を返す', () => {
      const result: MaterialId = toMaterialId('mat-001');
      expect(result).toBeDefined();
    });

    // TC-IDS-021
    it('toMaterialIdが入力値をそのまま返す', () => {
      const input = 'mat-001';
      const result = toMaterialId(input);
      expect(result).toBe(input);
    });

    // TC-IDS-022
    it('toItemId関数が存在する', () => {
      expect(toItemId).toBeDefined();
      expect(typeof toItemId).toBe('function');
    });

    // TC-IDS-023
    it('toItemIdが入力値をそのまま返す', () => {
      const input = 'item-001';
      const result = toItemId(input);
      expect(result).toBe(input);
    });

    // TC-IDS-024
    it('toQuestId関数が存在する', () => {
      expect(toQuestId).toBeDefined();
      expect(typeof toQuestId).toBe('function');
    });

    // TC-IDS-025
    it('toQuestIdが入力値をそのまま返す', () => {
      const input = 'quest-001';
      const result = toQuestId(input);
      expect(result).toBe(input);
    });

    // TC-IDS-026
    it('toArtifactId関数が存在する', () => {
      expect(toArtifactId).toBeDefined();
      expect(typeof toArtifactId).toBe('function');
    });

    // TC-IDS-027
    it('toArtifactIdが入力値をそのまま返す', () => {
      const input = 'artifact-001';
      const result = toArtifactId(input);
      expect(result).toBe(input);
    });

    // TC-IDS-028
    it('toClientId関数が存在する', () => {
      expect(toClientId).toBeDefined();
      expect(typeof toClientId).toBe('function');
    });

    // TC-IDS-029
    it('toClientIdが入力値をそのまま返す', () => {
      const input = 'client-001';
      const result = toClientId(input);
      expect(result).toBe(input);
    });

    // TC-IDS-030
    it('toRecipeId関数が存在する', () => {
      expect(toRecipeId).toBeDefined();
      expect(typeof toRecipeId).toBe('function');
    });

    // TC-IDS-031
    it('toRecipeIdが入力値をそのまま返す', () => {
      const input = 'recipe-001';
      const result = toRecipeId(input);
      expect(result).toBe(input);
    });
  });
});
