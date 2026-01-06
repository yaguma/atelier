import { test as base, expect } from '@playwright/test';
import { TitlePage, MainPage, ShopPage, RankUpPage, ResultPage } from '../pages';

/**
 * E2Eテスト用カスタムフィクスチャ
 * 各Page Objectを自動的に注入
 */

// フィクスチャの型定義
type TestFixtures = {
  titlePage: TitlePage;
  mainPage: MainPage;
  shopPage: ShopPage;
  rankUpPage: RankUpPage;
  resultPage: ResultPage;
};

// カスタムテストを拡張
export const test = base.extend<TestFixtures>({
  titlePage: async ({ page }, use) => {
    await use(new TitlePage(page));
  },
  mainPage: async ({ page }, use) => {
    await use(new MainPage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  rankUpPage: async ({ page }, use) => {
    await use(new RankUpPage(page));
  },
  resultPage: async ({ page }, use) => {
    await use(new ResultPage(page));
  },
});

// expectをre-export
export { expect };

/**
 * テストデータ定義
 */
export const testData = {
  // 初期ゴールド
  initialGold: 100,

  // 初期ランク
  initialRank: 'G',

  // ランク一覧（昇順）
  ranks: ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'],

  // 最終ランク
  finalRank: 'S',

  // デフォルト日数
  defaultTotalDays: 30,

  // フェーズ名（UIに表示されるテキスト）
  phases: {
    QUEST_ACCEPT: '依頼',
    GATHERING: '採取',
    ALCHEMY: '調合',
    DELIVERY: '納品',
  },
};
