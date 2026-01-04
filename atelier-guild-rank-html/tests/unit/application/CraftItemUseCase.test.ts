/**
 * CraftItemUseCaseテスト
 * TASK-0108: 調合実行ユースケース
 *
 * レシピカードを使用した調合処理をテストする
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CraftItemUseCase,
  createCraftItemUseCase,
  CraftItemResult,
} from '@application/CraftItemUseCase';
import { StateManager, createStateManager } from '@application/StateManager';
import { EventBus, createEventBus, GameEventType } from '@domain/events/GameEvents';
import {
  GuildRank,
  CardType,
  Rarity,
  ItemCategory,
  Quality,
  EnhancementTarget,
  EffectType,
} from '@domain/common/types';
import { RecipeCard, EnhancementCard, createRecipeCard, createEnhancementCard } from '@domain/card/CardEntity';
import { IRecipeCard, IEnhancementCard } from '@domain/card/Card';
import { MaterialInstance, createMaterialInstance } from '@domain/material/MaterialEntity';
import { createInventory } from '@domain/services/InventoryService';

describe('CraftItemUseCase', () => {
  let craftItemUseCase: CraftItemUseCase;
  let stateManager: StateManager;
  let eventBus: EventBus;

  // テスト用のレシピカードデータ
  const createTestRecipeCard = (id: string): IRecipeCard => ({
    id,
    name: `レシピ${id}`,
    type: CardType.RECIPE,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    cost: 1,
    requiredMaterials: [
      {
        materialId: 'material_1',
        quantity: 2,
      },
    ],
    outputItemId: `item_${id}`,
    category: ItemCategory.CONSUMABLE,
  });

  // テスト用の強化カードデータ
  const createTestEnhancementCard = (id: string): IEnhancementCard => ({
    id,
    name: `強化${id}`,
    type: CardType.ENHANCEMENT,
    rarity: Rarity.COMMON,
    unlockRank: GuildRank.G,
    cost: 0,
    effect: {
      type: EffectType.QUALITY_BOOST,
      value: 10,
    },
    targetAction: EnhancementTarget.CRAFT,
  });

  // テスト用の素材インスタンス
  const createTestMaterial = (id: string, quality: Quality, quantity: number): MaterialInstance =>
    createMaterialInstance({
      materialId: id,
      quality,
      quantity,
    });

  // テスト用レシピカード
  const testRecipeCard = createRecipeCard(createTestRecipeCard('recipe1'));
  const testEnhancementCard = createEnhancementCard(createTestEnhancementCard('enhance1'));

  beforeEach(() => {
    // イベントバスを生成
    eventBus = createEventBus();
    // ステートマネージャーを生成
    stateManager = createStateManager();

    // 初期状態を設定
    const playerState = stateManager.getPlayerState();
    stateManager.updatePlayerState({
      ...playerState,
      actionPoints: 3,
    });

    // デッキにカードを設定
    stateManager.updateDeckState({
      cards: [testRecipeCard, testEnhancementCard],
      hand: [],
      discardPile: [],
    });

    // インベントリに素材を設定
    const testMaterials = [
      createTestMaterial('material_1', Quality.C, 5),
    ];
    stateManager.updateInventoryState(
      createInventory(testMaterials, [], 50)
    );

    // ユースケースを生成
    craftItemUseCase = createCraftItemUseCase(stateManager, eventBus);
  });

  describe('調合実行', () => {
    it('レシピカードを選択して調合できる', async () => {
      const result = await craftItemUseCase.execute({
        recipeCardId: 'recipe1',
        materialSelections: [
          { materialId: 'material_1', quality: Quality.C, quantity: 2 },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('必要素材が消費される', async () => {
      const beforeInventory = stateManager.getInventoryState();
      const beforeCount = beforeInventory.materials.find(
        (m) => m.materialId === 'material_1' && m.quality === Quality.C
      )?.quantity;

      await craftItemUseCase.execute({
        recipeCardId: 'recipe1',
        materialSelections: [
          { materialId: 'material_1', quality: Quality.C, quantity: 2 },
        ],
      });

      const afterInventory = stateManager.getInventoryState();
      const afterCount = afterInventory.materials.find(
        (m) => m.materialId === 'material_1' && m.quality === Quality.C
      )?.quantity ?? 0;

      expect(afterCount).toBe((beforeCount ?? 0) - 2);
    });

    it('完成アイテムがインベントリに追加される', async () => {
      await craftItemUseCase.execute({
        recipeCardId: 'recipe1',
        materialSelections: [
          { materialId: 'material_1', quality: Quality.C, quantity: 2 },
        ],
      });

      const afterInventory = stateManager.getInventoryState();
      expect(afterInventory.items.length).toBeGreaterThan(0);
      expect(afterInventory.items[0].itemId).toBe('item_recipe1');
    });

    it('品質が計算される', async () => {
      const result = await craftItemUseCase.execute({
        recipeCardId: 'recipe1',
        materialSelections: [
          { materialId: 'material_1', quality: Quality.C, quantity: 2 },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.craftedItem).toBeDefined();
      expect(result.craftedItem!.quality).toBeDefined();
    });
  });

  describe('強化カード適用', () => {
    it('強化カードを適用できる', async () => {
      const result = await craftItemUseCase.execute({
        recipeCardId: 'recipe1',
        materialSelections: [
          { materialId: 'material_1', quality: Quality.C, quantity: 2 },
        ],
        enhancementCardIds: ['enhance1'],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('調合失敗', () => {
    it('素材不足で調合できない', async () => {
      // 素材を不足状態に
      stateManager.updateInventoryState(
        createInventory([createTestMaterial('material_1', Quality.C, 1)], [], 50)
      );

      const result = await craftItemUseCase.execute({
        recipeCardId: 'recipe1',
        materialSelections: [
          { materialId: 'material_1', quality: Quality.C, quantity: 2 },
        ],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_MATERIALS');
    });

    it('存在しないレシピで調合できない', async () => {
      const result = await craftItemUseCase.execute({
        recipeCardId: 'nonexistent',
        materialSelections: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('RECIPE_NOT_FOUND');
    });
  });

  describe('行動ポイント', () => {
    it('行動ポイントを消費する', async () => {
      const beforeAP = stateManager.getPlayerState().actionPoints;

      await craftItemUseCase.execute({
        recipeCardId: 'recipe1',
        materialSelections: [
          { materialId: 'material_1', quality: Quality.C, quantity: 2 },
        ],
      });

      const afterAP = stateManager.getPlayerState().actionPoints;
      expect(afterAP).toBe(beforeAP - testRecipeCard.cost);
    });

    it('行動ポイント不足で調合できない', async () => {
      // 行動ポイントを0に設定
      const playerState = stateManager.getPlayerState();
      stateManager.updatePlayerState({
        ...playerState,
        actionPoints: 0,
      });

      const result = await craftItemUseCase.execute({
        recipeCardId: 'recipe1',
        materialSelections: [
          { materialId: 'material_1', quality: Quality.C, quantity: 2 },
        ],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_ACTION_POINTS');
    });
  });

  describe('イベント発行', () => {
    it('調合成功イベントが発行される', async () => {
      const eventHandler = vi.fn();
      eventBus.subscribe(GameEventType.ITEM_CRAFTED, eventHandler);

      await craftItemUseCase.execute({
        recipeCardId: 'recipe1',
        materialSelections: [
          { materialId: 'material_1', quality: Quality.C, quantity: 2 },
        ],
      });

      expect(eventHandler).toHaveBeenCalled();
    });
  });
});
