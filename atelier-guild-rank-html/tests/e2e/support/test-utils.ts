import { Page } from '@playwright/test';
import { TitlePage, MainPage, ShopPage, RankUpPage, ResultPage } from '../pages';

/**
 * E2Eテスト用ユーティリティ関数
 */

// ローカルストレージのキー
const SAVE_DATA_KEY = 'atelier-guild-rank-save';

/**
 * セーブデータをクリアする
 */
export async function clearSaveData(page: Page): Promise<void> {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, SAVE_DATA_KEY);
}

/**
 * セーブデータを設定する
 */
export async function setupSaveData(page: Page, saveData: object): Promise<void> {
  await page.evaluate(
    ({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: SAVE_DATA_KEY, data: saveData }
  );
}

/**
 * デフォルトのセーブデータを作成
 */
export function createDefaultSaveData(): object {
  return {
    version: 1,
    currentDay: 1,
    totalDays: 30,
    gold: 100,
    rank: 'G',
    promotionGauge: 0,
    phase: 'QUEST_ACCEPT',
    inventory: [],
    deck: [],
    activeQuests: [],
    completedQuests: [],
  };
}

/**
 * カスタムゴールドでセーブデータを作成
 */
export function createSaveDataWithGold(gold: number): object {
  return {
    ...createDefaultSaveData(),
    gold,
  };
}

/**
 * 特定のランクでセーブデータを作成
 */
export function createSaveDataWithRank(rank: string): object {
  return {
    ...createDefaultSaveData(),
    rank,
  };
}

/**
 * 昇格ゲージ満タン近くのセーブデータを作成
 */
export function createSaveDataNearPromotion(): object {
  return {
    ...createDefaultSaveData(),
    promotionGauge: 95,
  };
}

/**
 * 日数残り1日のセーブデータを作成
 */
export function createSaveDataWithOneDayRemaining(): object {
  return {
    ...createDefaultSaveData(),
    currentDay: 29,
    totalDays: 30,
  };
}

/**
 * Aランクでのセーブデータを作成（ゲームクリアテスト用）
 */
export function createSaveDataAtRankA(): object {
  return {
    ...createDefaultSaveData(),
    rank: 'A',
    gold: 10000,
    promotionGauge: 95,
  };
}

/**
 * 新規ゲームを開始する
 */
export async function startNewGame(page: Page): Promise<MainPage> {
  const titlePage = new TitlePage(page);
  await titlePage.goto();
  await titlePage.waitForTitleScreen();
  await titlePage.clickNewGame();

  const mainPage = new MainPage(page);
  await mainPage.waitForMainScreen();
  return mainPage;
}

/**
 * 特定のゴールドで新規ゲームを開始する
 */
export async function startNewGameWithGold(page: Page, gold: number): Promise<MainPage> {
  await clearSaveData(page);
  await page.goto('/');

  // ゲーム開始後にゴールドを設定
  await page.evaluate(
    ({ key, goldAmount }) => {
      const save = JSON.parse(localStorage.getItem(key) || '{}');
      save.gold = goldAmount;
      localStorage.setItem(key, JSON.stringify(save));
    },
    { key: SAVE_DATA_KEY, goldAmount: gold }
  );

  await page.reload();

  const mainPage = new MainPage(page);
  await mainPage.waitForMainScreen();
  return mainPage;
}

/**
 * デッキ枚数を取得
 */
export async function getDeckCount(page: Page): Promise<number> {
  return await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key) || '{}');
    return save.deck?.length || 0;
  }, SAVE_DATA_KEY);
}

/**
 * ゴールドを取得
 */
export async function getGold(page: Page): Promise<number> {
  return await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key) || '{}');
    return save.gold || 0;
  }, SAVE_DATA_KEY);
}

/**
 * 現在の日数を取得
 */
export async function getCurrentDay(page: Page): Promise<number> {
  return await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key) || '{}');
    return save.currentDay || 1;
  }, SAVE_DATA_KEY);
}

/**
 * 行動ポイントを取得
 */
export async function getActionPoints(page: Page): Promise<number> {
  return await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key) || '{}');
    return save.actionPoints || 0;
  }, SAVE_DATA_KEY);
}

/**
 * 昇格ゲージを満タンにする
 */
export async function fillPromotionGauge(page: Page): Promise<void> {
  await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key) || '{}');
    save.promotionGauge = 100;
    localStorage.setItem(key, JSON.stringify(save));
  }, SAVE_DATA_KEY);
  await page.reload();
}

/**
 * ゴールドを増加させる
 */
export async function earnGold(page: Page, amount: number): Promise<void> {
  await page.evaluate(
    ({ key, goldAmount }) => {
      const save = JSON.parse(localStorage.getItem(key) || '{}');
      save.gold = (save.gold || 0) + goldAmount;
      localStorage.setItem(key, JSON.stringify(save));
    },
    { key: SAVE_DATA_KEY, goldAmount: amount }
  );
}

/**
 * 特定の日数まで進める
 */
export async function advanceToDay(page: Page, targetDay: number): Promise<void> {
  await page.evaluate(
    ({ key, day }) => {
      const save = JSON.parse(localStorage.getItem(key) || '{}');
      save.currentDay = day;
      localStorage.setItem(key, JSON.stringify(save));
    },
    { key: SAVE_DATA_KEY, day: targetDay }
  );
  await page.reload();
}

/**
 * Page Objectを作成するヘルパー
 */
export function createPageObjects(page: Page) {
  return {
    title: new TitlePage(page),
    main: new MainPage(page),
    shop: new ShopPage(page),
    rankUp: new RankUpPage(page),
    result: new ResultPage(page),
  };
}
