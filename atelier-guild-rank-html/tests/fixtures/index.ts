/**
 * テストフィクスチャ インデックス
 * テストで使用する全データのエクスポート
 */

// メインのテストデータをすべてエクスポート
export * from './test-data';

// 便利な名前空間エクスポート
export {
  // カードデータ
  testGatheringCards,
  testRecipeCards,
  testEnhancementCards,
  // マスターデータ
  testMaterials,
  testItems,
  testGuildRanks,
  testClients,
  testArtifacts,
  // 初期デッキ
  testInitialDeck,
  // サンプルセーブデータ
  testSaveDataInitial,
  testSaveDataMidGame,
  testSaveDataPromotionTest,
  // ファクトリ関数
  createTestMaterialInstance,
  createTestCraftedItem,
  createTestQuest,
  createTestGameState,
  createTestSaveData,
  // ヘルパー関数
  getGatheringCardById,
  getRecipeCardById,
  getEnhancementCardById,
  getMaterialById,
  getItemById,
  getGuildRankById,
  getClientById,
  getArtifactById,
  getCardsAvailableAtRank,
} from './test-data';

// 型もエクスポート
export type {
  TestSaveData,
  TestGameState,
  TestDeckState,
  TestInventoryState,
  TestMaterialInstance,
  TestCraftedItem,
  TestUsedMaterial,
  TestQuestState,
  TestActiveQuest,
  TestQuest,
  TestQuestCondition,
  TestGatheringCard,
  TestRecipeCard,
  TestEnhancementCard,
  TestMaterial,
  TestItem,
  TestGuildRank,
  TestClient,
  TestArtifact,
} from './test-data';
