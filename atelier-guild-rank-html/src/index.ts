/**
 * アトリエギルドランク - エントリーポイント
 *
 * @description ギルドランク制のデッキ構築型錬金術RPGのメインエントリーポイント
 */

import { ScreenManager } from './presentation/ScreenManager';
import { TitleScreen } from './presentation/screens/TitleScreen';
import { MainScreen } from './presentation/screens/MainScreen';
import { ShopScreen } from './presentation/screens/ShopScreen';
import { SaveDataRepository } from './infrastructure/repository/SaveDataRepository';
import { createEventBus, GameEventType } from './domain/events/GameEvents';
import { createStateManager } from './application/StateManager';
import { createGameFlowManager } from './application/GameFlowManager';
import { DeckService } from './domain/services/DeckService';
import { createNewGameUseCase } from './application/NewGameUseCase';
import { HeaderUI } from './presentation/components/HeaderUI';
import { QuestAcceptPhaseUI } from './presentation/phases/QuestAcceptPhaseUI';
import { GatheringPhaseUI } from './presentation/phases/GatheringPhaseUI';
import { AlchemyPhaseUI } from './presentation/phases/AlchemyPhaseUI';
import { DeliveryPhaseUI } from './presentation/phases/DeliveryPhaseUI';
import { GuildRank, GamePhase } from './domain/common/types';

console.log('アトリエギルドランク 起動中...');

/** グローバルなScreenManagerインスタンス */
let screenManager: ScreenManager | null = null;

/** グローバルなSaveDataRepositoryインスタンス */
let saveDataRepository: SaveDataRepository | null = null;

/** EventBus */
let eventBus = createEventBus();

/** StateManager */
let stateManager = createStateManager();

/** GameFlowManager */
let gameFlowManager = createGameFlowManager(eventBus);

/** DeckService */
let deckService = new DeckService();

/** HeaderUI */
let headerUI: HeaderUI | null = null;

/** MainScreen */
let mainScreen: MainScreen | null = null;

/** ShopScreen */
let shopScreen: ShopScreen | null = null;

/** フェーズUI */
let questPhaseUI: QuestAcceptPhaseUI | null = null;
let gatheringPhaseUI: GatheringPhaseUI | null = null;
let alchemyPhaseUI: AlchemyPhaseUI | null = null;
let deliveryPhaseUI: DeliveryPhaseUI | null = null;

/**
 * フッターUIを作成
 */
function createFooterUI(): HTMLElement {
  const footer = document.createElement('div');
  footer.className = 'footer-ui';

  const shopButton = document.createElement('button');
  shopButton.className = 'footer-btn shop-btn';
  shopButton.textContent = 'ショップ';
  shopButton.dataset.testid = 'shop-button';
  shopButton.addEventListener('click', () => goToShop());
  footer.appendChild(shopButton);

  return footer;
}

/**
 * ショップ画面に遷移
 */
async function goToShop(): Promise<void> {
  if (!screenManager || !shopScreen) return;

  // ショップの初期データを設定
  const playerState = stateManager.getPlayerState();
  shopScreen.setPlayerGold(playerState.gold);

  // カテゴリを設定
  shopScreen.setCategories([
    { id: 'cards', name: 'カード' },
    { id: 'artifacts', name: 'アーティファクト' },
  ]);

  // サンプル商品を設定（実際はマスターデータから取得）
  shopScreen.setItems([
    { id: 'card-001', name: '森の採取', description: '森林エリアで素材を採取できるカード', price: 50, category: 'cards' },
    { id: 'card-002', name: '発酵促進', description: '調合の成功率を上げる強化カード', price: 80, category: 'cards' },
    { id: 'artifact-001', name: '錬金術師の指輪', description: '調合品質+10%', price: 200, category: 'artifacts' },
  ]);

  await screenManager.goTo('shop', 'fade');
}

/**
 * ヘッダーUIを更新
 */
function updateHeaderUI(): void {
  if (!headerUI) return;

  const playerState = stateManager.getPlayerState();
  const gameState = stateManager.getGameState();

  headerUI.setState({
    rankName: playerState.rank,
    rankProgress: playerState.promotionGauge,
    rankProgressMax: playerState.promotionGaugeMax,
    remainingDays: playerState.rankDaysRemaining,
    gold: playerState.gold,
    actionPoints: playerState.actionPoints,
    maxActionPoints: playerState.actionPointsMax,
  });
}

/**
 * フェーズUIを更新
 */
function updatePhaseUI(): void {
  const gameState = stateManager.getGameState();

  // MainScreenのフェーズを更新
  if (mainScreen) {
    const phaseMap: Record<GamePhase, 'quest' | 'gathering' | 'synthesis' | 'delivery'> = {
      [GamePhase.QUEST_ACCEPT]: 'quest',
      [GamePhase.GATHERING]: 'gathering',
      [GamePhase.ALCHEMY]: 'synthesis',
      [GamePhase.DELIVERY]: 'delivery',
    };
    mainScreen.setPhase(phaseMap[gameState.currentPhase]);
  }
}

/**
 * ゲーム開始処理
 */
async function startNewGame(): Promise<void> {
  console.log('新規ゲーム開始');

  // NewGameUseCaseを実行
  const newGameUseCase = createNewGameUseCase(
    stateManager,
    gameFlowManager,
    saveDataRepository!,
    eventBus,
    deckService
  );

  const result = await newGameUseCase.execute({ forceOverwrite: true });

  if (result.success) {
    // メイン画面に遷移
    await screenManager?.goTo('main', 'fade');

    // メイン画面がマウントされた後にUIを設定
    if (mainScreen && headerUI) {
      mainScreen.setHeaderContent(headerUI.getElement());

      // フッターUIを追加
      mainScreen.setFooterContent(createFooterUI());

      // フェーズUIをダミーコンテナにマウントしてビルドを完了させる
      const dummyContainer = document.createElement('div');
      questPhaseUI!.mount(dummyContainer);
      gatheringPhaseUI!.mount(dummyContainer);
      alchemyPhaseUI!.mount(dummyContainer);
      deliveryPhaseUI!.mount(dummyContainer);

      // フェーズコンテンツを登録
      mainScreen.registerPhaseContent('quest', questPhaseUI!.getElement());
      mainScreen.registerPhaseContent('gathering', gatheringPhaseUI!.getElement());
      mainScreen.registerPhaseContent('synthesis', alchemyPhaseUI!.getElement());
      mainScreen.registerPhaseContent('delivery', deliveryPhaseUI!.getElement());
    }

    // UIを更新
    updateHeaderUI();
    updatePhaseUI();
  } else {
    console.error('ゲーム開始に失敗:', result.error);
  }
}

/**
 * ゲーム継続処理
 */
async function continueGame(): Promise<void> {
  console.log('続きから');

  // TODO: セーブデータからゲーム状態を復元
  // 現時点では新規ゲームと同様の処理
  await startNewGame();
}

/**
 * アプリケーション初期化
 * ゲーム起動時の初期化処理を行う
 */
async function initializeApp(): Promise<void> {
  const screenContainer = document.getElementById('screen-container');
  if (!screenContainer) {
    throw new Error('画面コンテナが見つかりません');
  }

  // リポジトリの初期化
  saveDataRepository = new SaveDataRepository();

  // ScreenManagerの初期化
  screenManager = new ScreenManager(screenContainer);

  // タイトル画面の設定
  const titleScreen = new TitleScreen();

  // メイン画面の設定
  mainScreen = new MainScreen();

  // ヘッダーUIの作成
  headerUI = new HeaderUI();

  // フェーズUIの作成
  questPhaseUI = new QuestAcceptPhaseUI();
  gatheringPhaseUI = new GatheringPhaseUI();
  alchemyPhaseUI = new AlchemyPhaseUI();
  deliveryPhaseUI = new DeliveryPhaseUI();

  // ショップ画面の作成
  shopScreen = new ShopScreen();
  shopScreen.onBack(async () => {
    await screenManager?.goTo('main', 'fade');
  });

  // 画面の登録
  screenManager.registerScreen(titleScreen);
  screenManager.registerScreen(mainScreen);
  screenManager.registerScreen(shopScreen);

  // セーブデータの有無をチェック
  const saveDataExists = saveDataRepository.exists();
  titleScreen.setSaveDataExists(saveDataExists);

  // タイトル画面のコールバック設定
  titleScreen.onNewGame(startNewGame);
  titleScreen.onContinue(continueGame);

  // イベント購読
  eventBus.subscribe(GameEventType.PHASE_CHANGED, () => {
    updatePhaseUI();
  });

  eventBus.subscribe(GameEventType.GAME_STARTED, () => {
    console.log('ゲーム開始イベント受信');
  });

  // タイトル画面を表示
  await screenManager.goTo('title');

  console.log('アトリエギルドランク 初期化完了');
}

// DOMContentLoaded後にアプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeApp().catch((error) => {
    console.error('アプリケーション初期化エラー:', error);
  });
});
