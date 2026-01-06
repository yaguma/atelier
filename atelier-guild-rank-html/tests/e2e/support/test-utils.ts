import { Page } from '@playwright/test';
import { TitlePage, MainPage, ShopPage, RankUpPage, ResultPage } from '../pages';

/**
 * E2Eテスト用ユーティリティ関数
 */

// ローカルストレージのキー（アプリケーションと一致させる）
const SAVE_DATA_KEY = 'atelier_save_data';

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
    version: '1.0.0',
    lastSaved: new Date().toISOString(),
    gameState: {
      currentRank: 'G',
      promotionGauge: 0,
      requiredContribution: 100,
      remainingDays: 30,
      currentDay: 1,
      currentPhase: 'QUEST_ACCEPT',
      gold: 100,
      comboCount: 0,
      actionPoints: 3,
      isPromotionTest: false,
      promotionTestRemainingDays: null,
    },
    deckState: {
      deck: [],
      hand: [],
      discard: [],
      ownedCards: [],
    },
    inventoryState: {
      materials: [],
      craftedItems: [],
      storageLimit: 20,
    },
    questState: {
      activeQuests: [],
      todayClients: [],
      questLimit: 3,
    },
    artifacts: [],
  };
}

/**
 * カスタムゴールドでセーブデータを作成
 */
export function createSaveDataWithGold(gold: number): object {
  const saveData = createDefaultSaveData() as { gameState: { gold: number } };
  saveData.gameState.gold = gold;
  return saveData;
}

/**
 * 特定のランクでセーブデータを作成
 */
export function createSaveDataWithRank(rank: string): object {
  const saveData = createDefaultSaveData() as { gameState: { currentRank: string } };
  saveData.gameState.currentRank = rank;
  return saveData;
}

/**
 * 昇格ゲージ満タン近くのセーブデータを作成
 */
export function createSaveDataNearPromotion(): object {
  const saveData = createDefaultSaveData() as { gameState: { promotionGauge: number } };
  saveData.gameState.promotionGauge = 95;
  return saveData;
}

/**
 * 日数残り1日のセーブデータを作成
 */
export function createSaveDataWithOneDayRemaining(): object {
  const saveData = createDefaultSaveData() as { gameState: { currentDay: number; remainingDays: number } };
  saveData.gameState.currentDay = 29;
  saveData.gameState.remainingDays = 1;
  return saveData;
}

/**
 * Aランクでのセーブデータを作成（ゲームクリアテスト用）
 */
export function createSaveDataAtRankA(): object {
  const saveData = createDefaultSaveData() as { gameState: { currentRank: string; gold: number; promotionGauge: number } };
  saveData.gameState.currentRank = 'A';
  saveData.gameState.gold = 10000;
  saveData.gameState.promotionGauge = 95;
  return saveData;
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
    return save.deckState?.ownedCards?.length || 0;
  }, SAVE_DATA_KEY);
}

/**
 * ゴールドを取得
 */
export async function getGold(page: Page): Promise<number> {
  return await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key) || '{}');
    return save.gameState?.gold || 0;
  }, SAVE_DATA_KEY);
}

/**
 * 現在の日数を取得
 */
export async function getCurrentDay(page: Page): Promise<number> {
  return await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key) || '{}');
    return save.gameState?.currentDay || 1;
  }, SAVE_DATA_KEY);
}

/**
 * 行動ポイントを取得
 */
export async function getActionPoints(page: Page): Promise<number> {
  return await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key) || '{}');
    return save.gameState?.actionPoints || 0;
  }, SAVE_DATA_KEY);
}

/**
 * 昇格ゲージを満タンにする
 */
export async function fillPromotionGauge(page: Page): Promise<void> {
  await page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key) || '{}');
    if (save.gameState) {
      save.gameState.promotionGauge = 100;
    }
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
      if (save.gameState) {
        save.gameState.gold = (save.gameState.gold || 0) + goldAmount;
      }
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
      if (save.gameState) {
        save.gameState.currentDay = day;
      }
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
