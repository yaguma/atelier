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
import { createAcceptQuestUseCase } from './application/AcceptQuestUseCase';
import { HeaderUI } from './presentation/components/HeaderUI';
import { QuestAcceptPhaseUI, QuestData } from './presentation/phases/QuestAcceptPhaseUI';
import { GatheringPhaseUI } from './presentation/phases/GatheringPhaseUI';
import { AlchemyPhaseUI } from './presentation/phases/AlchemyPhaseUI';
import { DeliveryPhaseUI } from './presentation/phases/DeliveryPhaseUI';
import { GuildRank, GamePhase, QuestType } from './domain/common/types';
import { MasterDataLoader } from './infrastructure/loader/MasterDataLoader';
import { IQuestTemplate } from './domain/quest/Quest';
import { IQuest, createQuest } from './domain/quest/QuestEntity';
import { IItem } from './domain/item/Item';

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

/** MasterDataLoader */
let masterDataLoader = new MasterDataLoader('/data/master');

/** アイテムマスターデータマップ（ID → Item） */
let itemsMap: Map<string, IItem> = new Map();

/** クエストテンプレートマスターデータ */
let questTemplates: IQuestTemplate[] = [];

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
 * ランク順序マップ
 */
const RankOrder: Record<GuildRank, number> = {
  [GuildRank.G]: 0,
  [GuildRank.F]: 1,
  [GuildRank.E]: 2,
  [GuildRank.D]: 3,
  [GuildRank.C]: 4,
  [GuildRank.B]: 5,
  [GuildRank.A]: 6,
  [GuildRank.S]: 7,
};

/**
 * マスターデータをロードする
 */
async function loadMasterData(): Promise<void> {
  try {
    // クエストテンプレートをロード
    questTemplates = await masterDataLoader.load<IQuestTemplate[]>('quests.json');
    console.log(`クエストテンプレート ${questTemplates.length} 件ロード`);

    // アイテムデータをロード
    const items = await masterDataLoader.load<IItem[]>('items.json');
    itemsMap.clear();
    items.forEach(item => itemsMap.set(item.id, item));
    console.log(`アイテム ${items.length} 件ロード`);
  } catch (error) {
    console.error('マスターデータロードエラー:', error);
  }
}

/**
 * クエストIDを生成する
 */
function generateQuestId(): string {
  return `quest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * プレイヤーランクに基づいて利用可能なクエストを生成する
 * @param playerRank プレイヤーの現在のランク
 * @param count 生成するクエスト数
 * @returns 生成されたクエスト一覧
 */
function generateAvailableQuests(playerRank: GuildRank, count: number = 5): IQuest[] {
  const playerRankOrder = RankOrder[playerRank];

  // プレイヤーランク以下のクエストをフィルタ
  const availableTemplates = questTemplates.filter(template => {
    const templateRankOrder = RankOrder[template.unlockRank as GuildRank];
    return templateRankOrder <= playerRankOrder;
  });

  if (availableTemplates.length === 0) {
    console.warn('利用可能なクエストテンプレートがありません');
    return [];
  }

  // ランダムに選択（重複なし）
  const shuffled = [...availableTemplates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // IQuestに変換
  return selected.map(template => {
    const condition = {
      type: template.type as QuestType,
      ...template.conditionTemplate,
    };

    return createQuest({
      id: generateQuestId(),
      clientId: 'default_client',
      condition: condition as any,
      contribution: template.baseContribution,
      gold: template.baseGold,
      deadline: template.baseDeadline,
      difficulty: template.difficulty,
      flavorText: template.flavorTextTemplate || '',
    });
  });
}

/**
 * IQuestをQuestData（UI用）に変換する
 */
function convertQuestToQuestData(quest: IQuest): QuestData {
  // アイテム名を取得
  let requiredItem = '不明';
  let requiredQuantity = 1;

  if (quest.condition.itemId) {
    const item = itemsMap.get(quest.condition.itemId);
    requiredItem = item?.name || quest.condition.itemId;
    requiredQuantity = quest.condition.quantity || 1;
  } else if (quest.condition.category) {
    requiredItem = `${quest.condition.category}系アイテム`;
    requiredQuantity = quest.condition.quantity || 1;
  }

  // 難易度を数値に変換
  const difficultyMap: Record<string, number> = {
    'easy': 1,
    'normal': 2,
    'hard': 3,
    'extreme': 5,
  };

  return {
    id: quest.id,
    name: quest.flavorText.slice(0, 20) || `依頼: ${requiredItem}`,
    description: quest.flavorText,
    reward: quest.gold,
    requiredItem,
    requiredQuantity,
    difficulty: difficultyMap[quest.difficulty] || 2,
  };
}

/**
 * クエストUIを更新する
 */
function updateQuestUI(): void {
  if (!questPhaseUI) return;

  const questState = stateManager.getQuestState();

  // availableQuestsをQuestDataに変換
  const availableQuestData = questState.availableQuests.map(q => convertQuestToQuestData(q));
  questPhaseUI.setAvailableQuests(availableQuestData);

  // activeQuestsをQuestDataに変換
  const acceptedQuestData = questState.activeQuests.map(aq => convertQuestToQuestData(aq.quest));
  questPhaseUI.setAcceptedQuests(acceptedQuestData);
}

/**
 * ゲーム開始処理
 */
async function startNewGame(): Promise<void> {
  console.log('新規ゲーム開始');

  // マスターデータをロード
  await loadMasterData();

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
    // 利用可能なクエストを生成
    const playerState = stateManager.getPlayerState();
    const availableQuests = generateAvailableQuests(playerState.rank);
    console.log(`利用可能なクエスト ${availableQuests.length} 件生成`);

    // クエスト状態を更新
    stateManager.updateQuestState({
      activeQuests: [],
      availableQuests: availableQuests,
    });

    // メイン画面に遷移
    await screenManager?.goTo('main', 'fade');

    // メイン画面がマウントされた後にUIを設定
    if (mainScreen && headerUI) {
      mainScreen.setHeaderContent(headerUI.getElement());

      // フッターUIを追加
      mainScreen.setFooterContent(createFooterUI());

      // クエストUIにデータを設定（マウント前に行う必要あり）
      updateQuestUI();

      // クエスト受注コールバックを設定
      const acceptQuestUseCase = createAcceptQuestUseCase(stateManager, eventBus);
      questPhaseUI!.onQuestAccept(async (questId: string) => {
        console.log('クエスト受注:', questId);
        const result = await acceptQuestUseCase.execute(questId);
        if (result.success) {
          console.log('クエスト受注成功');
          // UIを再構築して更新を反映
          updateQuestUI();
          // QuestAcceptPhaseUIを再マウントして表示を更新
          const dummyContainer = document.createElement('div');
          questPhaseUI!.mount(dummyContainer);
          mainScreen!.registerPhaseContent('quest', questPhaseUI!.getElement());
        } else {
          console.error('クエスト受注失敗:', result.error);
        }
      });

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
