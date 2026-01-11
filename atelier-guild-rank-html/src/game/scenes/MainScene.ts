/**
 * MainScene - メインゲーム画面シーン
 *
 * TASK-0235: MainScene基本レイアウト実装
 * TASK-0236: MainSceneフェーズ切替機能実装
 * TASK-0238: MainScene EventBus統合
 * ヘッダー、サイドバー、メインエリア、フッターの配置を行う。
 * フェーズコンテナの生成・表示・非表示・破棄を管理する。
 *
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */

import { BaseGameScene, SceneInitData } from './BaseGameScene';
import {
  MainSceneLayout,
  MainScenePhases,
  MainScenePhaseLabels,
  type MainScenePhase,
} from './MainSceneConstants';
import {
  MainSceneEvents,
  type PlayerDataUpdatePayload,
  type NotificationData,
  type NotificationType,
  type DeckUpdatePayload,
} from './MainSceneEvents';
import { SceneKeys } from '../config/SceneKeys';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';
import type { IPhaseContainer } from '../ui/phase/IPhaseContainer';
import { QuestAcceptContainer } from '../ui/quest/QuestAcceptContainer';
import { GatheringContainer } from '../ui/phase/GatheringContainer';
import { AlchemyContainer } from '../ui/phase/AlchemyContainer';
import { DeliveryContainer } from '../ui/phase/DeliveryContainer';
import { HandContainer } from '../ui/hand/HandContainer';
import { DeckView } from '../ui/deck/DeckView';
import { Card } from '@domain/card/Card';

/**
 * MainScene初期化データ
 */
export interface MainSceneData extends SceneInitData {
  /** プレイヤーデータ */
  playerData?: PlayerData;
  /** ゲーム状態 */
  gameState?: GameState;
}

/**
 * プレイヤーデータ
 */
export interface PlayerData {
  rank: string;
  exp: number;
  maxExp: number;
  day: number;
  maxDay: number;
  gold: number;
  ap: number;
  maxAP: number;
}

/**
 * ゲーム状態
 */
export interface GameState {
  currentPhase: MainScenePhase;
  quests?: unknown[];
  inventory?: unknown[];
}

/**
 * フェーズコンテナ情報
 */
interface PhaseContainerInfo {
  type: MainScenePhase;
  container: IPhaseContainer | null;
  isActive: boolean;
}

/**
 * MainScene
 *
 * ゲームのメイン画面を構成する。
 * - ヘッダー: ランク、経験値、日数、ゴールド、AP表示
 * - サイドバー: 依頼リスト、アイテムリスト
 * - メインエリア: フェーズコンテナ表示
 * - フッター: フェーズインジケーター
 */
export class MainScene extends BaseGameScene {
  // 現在のフェーズ
  private currentPhase: MainScenePhase = 'quest-accept';

  // フェーズコンテナ管理
  private phaseContainers: Map<MainScenePhase, PhaseContainerInfo> = new Map();
  private activePhaseContainer: IPhaseContainer | null = null;
  private isTransitioning: boolean = false;

  // プレースホルダーUI（後続タスクでHeaderUI等に置き換え）
  private headerContainer!: Phaser.GameObjects.Container;
  private sidebarContainer!: Phaser.GameObjects.Container;
  private footerContainer!: Phaser.GameObjects.Container;
  private mainAreaBg!: Phaser.GameObjects.Graphics;

  // ヘッダー表示テキスト（プレースホルダー）
  private headerTexts: {
    rank?: Phaser.GameObjects.Text;
    exp?: Phaser.GameObjects.Text;
    day?: Phaser.GameObjects.Text;
    gold?: Phaser.GameObjects.Text;
    ap?: Phaser.GameObjects.Text;
  } = {};

  // フェーズインジケーター（プレースホルダー）
  private phaseIndicators: Phaser.GameObjects.Text[] = [];

  // フェーズインジケーター背景（更新用）
  private phaseIndicatorBgs: Phaser.GameObjects.Graphics[] = [];

  // 手札・デッキ管理
  private handContainer!: HandContainer;
  private deckView!: DeckView;
  private currentHand: Card[] = [];
  private deckCards: Card[] = [];
  private discardCount: number = 0;

  // 通知管理
  private notificationQueue: NotificationData[] = [];
  private isShowingNotification: boolean = false;

  // イベントリスナー登録状態
  private eventListenersSetup: boolean = false;

  constructor() {
    super(SceneKeys.MAIN);
  }

  protected onInit(_data?: MainSceneData): void {
    // 初期化処理
  }

  protected onPreload(): void {
    // アセット読み込み（必要に応じて）
  }

  protected onCreate(data?: MainSceneData): void {
    this.createBackground();
    this.createAreas();
    this.createHeader();
    this.createSidebar();
    this.createFooter();
    this.createHandAndDeck();

    // フェーズコンテナ管理を初期化
    this.initPhaseContainers();

    // フェーズナビゲーションリスナーを設定
    this.setupPhaseNavigationListeners();

    // EventBusイベントリスナーを設定
    this.setupEventListeners();

    // 初期データ設定
    if (data?.playerData) {
      this.setPlayerData(data.playerData);
    }
    if (data?.gameState) {
      this.setGameState(data.gameState);
    }
  }

  /**
   * 背景を作成
   */
  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(Colors.backgroundDark, 1);
    bg.fillRect(
      0,
      0,
      MainSceneLayout.SCREEN_WIDTH,
      MainSceneLayout.SCREEN_HEIGHT
    );
  }

  /**
   * 各エリアの背景を作成
   */
  private createAreas(): void {
    const { MAIN_AREA, SIDEBAR, FOOTER } = MainSceneLayout;

    // メインエリア背景
    this.mainAreaBg = this.add.graphics();
    this.mainAreaBg.fillStyle(Colors.panelBackground, 1);
    this.mainAreaBg.fillRect(
      MAIN_AREA.X,
      MAIN_AREA.Y,
      MAIN_AREA.WIDTH,
      MAIN_AREA.HEIGHT
    );

    // サイドバー背景
    const sidebarBg = this.add.graphics();
    sidebarBg.fillStyle(Colors.panelBackground, 1);
    sidebarBg.fillRect(SIDEBAR.X, SIDEBAR.Y, SIDEBAR.WIDTH, SIDEBAR.HEIGHT);
    sidebarBg.lineStyle(1, Colors.panelBorder);
    sidebarBg.strokeRect(SIDEBAR.X, SIDEBAR.Y, SIDEBAR.WIDTH, SIDEBAR.HEIGHT);

    // フッターエリア背景
    const footerBg = this.add.graphics();
    footerBg.fillStyle(Colors.backgroundLight, 1);
    footerBg.fillRect(FOOTER.X, FOOTER.Y, FOOTER.WIDTH, FOOTER.HEIGHT);
  }

  /**
   * ヘッダーUI作成（プレースホルダー）
   */
  private createHeader(): void {
    const { HEADER } = MainSceneLayout;

    this.headerContainer = this.add.container(HEADER.X, HEADER.Y);

    // ヘッダー背景
    const headerBg = this.add.graphics();
    headerBg.fillStyle(Colors.backgroundLight, 1);
    headerBg.fillRect(0, 0, HEADER.WIDTH, HEADER.HEIGHT);
    headerBg.lineStyle(1, Colors.panelBorder);
    headerBg.strokeRect(0, 0, HEADER.WIDTH, HEADER.HEIGHT);
    this.headerContainer.add(headerBg);

    // ヘッダータイトル
    const title = this.add.text(20, 20, 'Atelier Guild', TextStyles.titleSmall);
    this.headerContainer.add(title);

    // ステータス表示（プレースホルダー）
    const statusX = 200;
    const statusY = 20;
    const statusSpacing = 120;

    this.headerTexts.rank = this.add.text(
      statusX,
      statusY,
      'Rank: G',
      TextStyles.bodySmall
    );
    this.headerContainer.add(this.headerTexts.rank);

    this.headerTexts.exp = this.add.text(
      statusX + statusSpacing,
      statusY,
      'EXP: 0/100',
      TextStyles.bodySmall
    );
    this.headerContainer.add(this.headerTexts.exp);

    this.headerTexts.day = this.add.text(
      statusX + statusSpacing * 2,
      statusY,
      'Day: 1/30',
      TextStyles.bodySmall
    );
    this.headerContainer.add(this.headerTexts.day);

    this.headerTexts.gold = this.add.text(
      statusX + statusSpacing * 3,
      statusY,
      'Gold: 0',
      TextStyles.bodySmall
    );
    this.headerTexts.gold.setColor('#ffd700');
    this.headerContainer.add(this.headerTexts.gold);

    this.headerTexts.ap = this.add.text(
      statusX + statusSpacing * 4,
      statusY,
      'AP: 3/3',
      TextStyles.bodySmall
    );
    this.headerContainer.add(this.headerTexts.ap);
  }

  /**
   * サイドバーUI作成（プレースホルダー）
   */
  private createSidebar(): void {
    const { SIDEBAR } = MainSceneLayout;

    this.sidebarContainer = this.add.container(SIDEBAR.X, SIDEBAR.Y);

    // サイドバータイトル
    const title = this.add.text(10, 10, 'Quest List', TextStyles.bodySmall);
    this.sidebarContainer.add(title);

    // プレースホルダーテキスト
    const placeholder = this.add.text(
      10,
      40,
      '依頼リスト\n(未実装)',
      TextStyles.bodySmall
    );
    placeholder.setAlpha(0.5);
    this.sidebarContainer.add(placeholder);
  }

  /**
   * フッターUI作成（プレースホルダー：フェーズインジケーター）
   */
  private createFooter(): void {
    const { FOOTER } = MainSceneLayout;

    this.footerContainer = this.add.container(FOOTER.X, FOOTER.Y);
    this.phaseIndicatorBgs = [];

    // フェーズインジケーター
    const indicatorWidth = 150;
    const indicatorSpacing = 20;
    const startX =
      (FOOTER.WIDTH -
        (indicatorWidth * MainScenePhases.length +
          indicatorSpacing * (MainScenePhases.length - 1))) /
      2;

    MainScenePhases.forEach((phase, index) => {
      const x = startX + index * (indicatorWidth + indicatorSpacing);
      const y = FOOTER.HEIGHT / 2;

      // インジケーター背景
      const bg = this.add.graphics();
      bg.fillStyle(
        phase === this.currentPhase ? Colors.primary : Colors.panelBackground,
        1
      );
      bg.fillRoundedRect(x, y - 15, indicatorWidth, 30, 5);
      bg.lineStyle(1, Colors.panelBorder);
      bg.strokeRoundedRect(x, y - 15, indicatorWidth, 30, 5);
      bg.setData('x', x);
      bg.setData('y', y);
      bg.setData('width', indicatorWidth);
      bg.setData('phase', phase);
      this.footerContainer.add(bg);
      this.phaseIndicatorBgs.push(bg);

      // フェーズ名
      const label = this.add.text(
        x + indicatorWidth / 2,
        y,
        MainScenePhaseLabels[phase],
        TextStyles.bodySmall
      );
      label.setOrigin(0.5);
      label.setData('phase', phase);
      this.footerContainer.add(label);
      this.phaseIndicators.push(label);

      // インタラクティブ（クリック可能）
      const hitArea = this.add.rectangle(
        x + indicatorWidth / 2,
        y,
        indicatorWidth,
        30,
        0x000000,
        0
      );
      hitArea.setInteractive({ cursor: 'pointer' });
      hitArea.on('pointerdown', () => this.handlePhaseClick(phase));
      this.footerContainer.add(hitArea);
    });
  }

  // =====================================================
  // データ設定メソッド
  // =====================================================

  /**
   * プレイヤーデータを設定
   */
  setPlayerData(playerData: PlayerData): void {
    if (this.headerTexts.rank) {
      this.headerTexts.rank.setText(`Rank: ${playerData.rank}`);
    }
    if (this.headerTexts.exp) {
      this.headerTexts.exp.setText(
        `EXP: ${playerData.exp}/${playerData.maxExp}`
      );
    }
    if (this.headerTexts.day) {
      this.headerTexts.day.setText(
        `Day: ${playerData.day}/${playerData.maxDay}`
      );
    }
    if (this.headerTexts.gold) {
      this.headerTexts.gold.setText(`Gold: ${playerData.gold}`);
    }
    if (this.headerTexts.ap) {
      this.headerTexts.ap.setText(`AP: ${playerData.ap}/${playerData.maxAP}`);
    }
  }

  /**
   * ゲーム状態を設定
   */
  setGameState(gameState: GameState): void {
    if (gameState.currentPhase) {
      this.setCurrentPhase(gameState.currentPhase);
    }
  }

  /**
   * 現在のフェーズを設定
   */
  setCurrentPhase(phase: MainScenePhase): void {
    this.currentPhase = phase;
    this.updatePhaseIndicators();
  }

  /**
   * 現在のフェーズを取得
   */
  getCurrentPhase(): MainScenePhase {
    return this.currentPhase;
  }

  /**
   * フェーズインジケーターを更新
   */
  private updatePhaseIndicators(): void {
    this.phaseIndicatorBgs.forEach((bg) => {
      const phase = bg.getData('phase') as MainScenePhase;
      const x = bg.getData('x') as number;
      const y = bg.getData('y') as number;
      const width = bg.getData('width') as number;

      bg.clear();
      bg.fillStyle(
        phase === this.currentPhase ? Colors.primary : Colors.panelBackground,
        1
      );
      bg.fillRoundedRect(x, y - 15, width, 30, 5);
      bg.lineStyle(1, Colors.panelBorder);
      bg.strokeRoundedRect(x, y - 15, width, 30, 5);
    });
  }

  // =====================================================
  // フェーズコンテナ管理
  // =====================================================

  /**
   * フェーズコンテナ管理を初期化
   */
  private initPhaseContainers(): void {
    MainScenePhases.forEach((phase) => {
      this.phaseContainers.set(phase, {
        type: phase,
        container: null,
        isActive: false,
      });
    });
  }

  /**
   * フェーズコンテナを作成
   */
  private createPhaseContainer(phase: MainScenePhase): IPhaseContainer {
    const bounds = this.getMainAreaBounds();
    const baseOptions = {
      scene: this,
      eventBus: this.eventBus,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };

    switch (phase) {
      case 'quest-accept':
        return new QuestAcceptContainer({
          ...baseOptions,
          onQuestAccepted: (quest) => this.handleQuestAccepted(quest),
          onSkip: () => this.handlePhaseComplete('quest-accept'),
        });

      case 'gathering':
        return new GatheringContainer({
          ...baseOptions,
          onGatheringComplete: (result) => this.handleGatheringComplete(result),
          onSkip: () => this.handlePhaseComplete('gathering'),
        });

      case 'alchemy':
        return new AlchemyContainer({
          ...baseOptions,
          onAlchemyComplete: (result) => this.handleAlchemyComplete(result),
          onSkip: () => this.handlePhaseComplete('alchemy'),
        });

      case 'delivery':
        return new DeliveryContainer({
          ...baseOptions,
          onDeliveryComplete: (result) => this.handleDeliveryComplete(result),
          onSkip: () => this.handlePhaseComplete('delivery'),
        });

      default:
        throw new Error(`Unknown phase: ${phase}`);
    }
  }

  /**
   * フェーズを切り替える
   */
  async switchToPhase(newPhase: MainScenePhase): Promise<void> {
    if (this.currentPhase === newPhase) return;
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    const previousPhase = this.currentPhase;

    try {
      // 前のフェーズを退出
      if (this.activePhaseContainer) {
        await this.exitPhase(previousPhase);
      }

      // フェーズを更新
      this.currentPhase = newPhase;

      // 新しいフェーズに入る
      await this.enterPhase(newPhase);

      // インジケーター更新
      this.updatePhaseIndicators();

      // イベント発火
      this.eventBus.emit('phase:changed' as any, {
        previousPhase,
        newPhase,
      });
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * フェーズを退出
   */
  private async exitPhase(phase: MainScenePhase): Promise<void> {
    const info = this.phaseContainers.get(phase);
    if (!info || !info.container) return;

    // 退出処理
    await info.container.exit();

    // 退出アニメーション
    await this.playPhaseExitAnimation(info.container);

    // コンテナ破棄
    info.container.destroy();
    info.container = null;
    info.isActive = false;
    this.activePhaseContainer = null;
  }

  /**
   * フェーズに入る
   */
  private async enterPhase(phase: MainScenePhase): Promise<void> {
    // コンテナ作成
    const container = this.createPhaseContainer(phase);

    // 情報更新
    const info = this.phaseContainers.get(phase)!;
    info.container = container;
    info.isActive = true;
    this.activePhaseContainer = container;

    // 手札表示を更新
    this.updateHandVisibilityForPhase(phase);

    // 入場アニメーション
    await this.playPhaseEnterAnimation(container);

    // 入場処理
    await container.enter();
  }

  /**
   * フェーズ退出アニメーション
   */
  private async playPhaseExitAnimation(container: IPhaseContainer): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: container.container,
        alpha: 0,
        x: container.container.x - 50,
        duration: 250,
        ease: 'Power2.easeIn',
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * フェーズ入場アニメーション
   */
  private async playPhaseEnterAnimation(container: IPhaseContainer): Promise<void> {
    return new Promise((resolve) => {
      // 初期状態
      container.container.setAlpha(0);
      const targetX = container.container.x;
      container.container.setX(targetX + 50);

      // フェードイン + 右からスライド
      this.tweens.add({
        targets: container.container,
        alpha: 1,
        x: targetX,
        duration: 300,
        ease: 'Power2.easeOut',
        onComplete: () => resolve(),
      });
    });
  }

  // =====================================================
  // フェーズ完了ハンドラ
  // =====================================================

  /**
   * 依頼受注完了時の処理
   */
  private handleQuestAccepted(quest: unknown): void {
    this.eventBus.emit('game:quest:accepted' as any, { quest });
  }

  /**
   * 採取完了時の処理
   */
  private handleGatheringComplete(result: unknown): void {
    this.eventBus.emit('game:gathering:complete' as any, result);
  }

  /**
   * 調合完了時の処理
   */
  private handleAlchemyComplete(result: unknown): void {
    this.eventBus.emit('game:alchemy:complete' as any, result);
  }

  /**
   * 納品完了時の処理
   */
  private handleDeliveryComplete(result: unknown): void {
    this.eventBus.emit('game:delivery:complete' as any, result);
  }

  /**
   * フェーズ完了時の処理（スキップ含む）
   */
  private handlePhaseComplete(phase: MainScenePhase): void {
    this.eventBus.emit('game:phase:complete' as any, { phase });
  }

  /**
   * フェーズナビゲーションリスナーを設定
   */
  private setupPhaseNavigationListeners(): void {
    this.eventBus.on('navigate:phase' as any, (data: { phase: MainScenePhase }) => {
      this.switchToPhase(data.phase);
    });

    this.eventBus.on('navigate:next-phase' as any, () => {
      const nextPhase = this.getNextPhase(this.currentPhase);
      if (nextPhase) {
        this.switchToPhase(nextPhase);
      }
    });
  }

  /**
   * 次のフェーズを取得
   */
  getNextPhase(current: MainScenePhase): MainScenePhase | null {
    const index = MainScenePhases.indexOf(current);
    return index < MainScenePhases.length - 1 ? MainScenePhases[index + 1] : null;
  }

  /**
   * 遷移中かどうかを取得
   */
  isPhaseTransitioning(): boolean {
    return this.isTransitioning;
  }

  /**
   * アクティブなフェーズコンテナを取得
   */
  getActivePhaseContainer(): IPhaseContainer | null {
    return this.activePhaseContainer;
  }

  // =====================================================
  // イベントハンドラ
  // =====================================================

  /**
   * フェーズクリック時の処理
   */
  private handlePhaseClick(phase: MainScenePhase): void {
    this.eventBus.emit('phase:indicator:clicked' as any, { phase });
  }

  // =====================================================
  // 手札・デッキ管理
  // =====================================================

  /**
   * 手札とデッキを作成する
   */
  private createHandAndDeck(): void {
    const { HAND_AREA, DECK_AREA } = MainSceneLayout;

    // 手札コンテナ
    this.handContainer = new HandContainer(this, {
      x: HAND_AREA.X + HAND_AREA.WIDTH / 2,
      y: HAND_AREA.Y + HAND_AREA.HEIGHT / 2,
      layoutType: 'horizontal',
      onCardSelect: (card, index) => this.handleHandCardSelect(card, index),
      onCardDeselect: (card, index) => this.handleHandCardDeselect(card, index),
      onCardConfirm: (card, index) => this.handleHandCardConfirm(card, index),
    });

    // 初期状態では非表示（依頼受注フェーズでは不要）
    this.handContainer.setVisible(false);

    // デッキビュー
    this.deckView = new DeckView(this, {
      x: DECK_AREA.X + DECK_AREA.WIDTH / 2,
      y: DECK_AREA.Y + DECK_AREA.HEIGHT / 2,
      onClick: () => this.handleDeckClick(),
    });
  }

  /**
   * 手札を設定する
   */
  setHand(cards: Card[]): void {
    this.currentHand = [...cards];
    this.handContainer.setCards(cards);
  }

  /**
   * 現在の手札を取得する
   */
  getHand(): Card[] {
    return [...this.currentHand];
  }

  /**
   * デッキを設定する
   */
  setDeck(cards: Card[], discardCount: number = 0): void {
    this.deckCards = [...cards];
    this.discardCount = discardCount;
    this.deckView.setCount(cards.length);
  }

  /**
   * 現在のデッキを取得する
   */
  getDeck(): Card[] {
    return [...this.deckCards];
  }

  /**
   * カードをドローする
   */
  async drawCards(count: number): Promise<Card[]> {
    const drawnCards: Card[] = [];

    for (let i = 0; i < count && this.deckCards.length > 0; i++) {
      const card = this.deckCards.shift()!;
      drawnCards.push(card);

      // ドローアニメーション
      await this.playDrawAnimation(card, i);
    }

    // 手札に追加
    this.currentHand.push(...drawnCards);
    this.handContainer.setCards(this.currentHand);

    // デッキ表示更新
    this.deckView.setCount(this.deckCards.length);

    this.eventBus.emit('cards:drawn' as any, { cards: drawnCards });

    return drawnCards;
  }

  /**
   * ドローアニメーションを再生
   */
  private async playDrawAnimation(_card: Card, index: number): Promise<void> {
    return new Promise((resolve) => {
      const { DECK_AREA, HAND_AREA } = MainSceneLayout;

      // 仮のカードオブジェクト
      const tempCard = this.add.graphics();
      tempCard.fillStyle(0x4a4a8a, 1);
      tempCard.fillRoundedRect(0, 0, 80, 120, 8);
      tempCard.x = DECK_AREA.X + DECK_AREA.WIDTH / 2;
      tempCard.y = DECK_AREA.Y + DECK_AREA.HEIGHT / 2;

      // 手札位置へ移動
      const targetX = HAND_AREA.X + 100 + (this.currentHand.length + index) * 110;
      const targetY = HAND_AREA.Y + 75;

      this.tweens.add({
        targets: tempCard,
        x: targetX,
        y: targetY,
        duration: 300,
        delay: index * 100,
        ease: 'Power2.easeOut',
        onComplete: () => {
          tempCard.destroy();
          resolve();
        },
      });
    });
  }

  /**
   * 捨て札をデッキにシャッフルする
   */
  async shuffleDiscardIntoDeck(): Promise<void> {
    // シャッフルアニメーション
    await this.deckView.animateShuffle();

    // 捨て札をデッキに戻す（ロジックはApplication層で管理）
    this.eventBus.emit('deck:shuffle:requested' as any, {});
  }

  /**
   * カードを使用する
   */
  async useCard(card: Card): Promise<void> {
    const index = this.currentHand.findIndex((c) => c === card);
    if (index < 0) return;

    // 手札から削除
    this.currentHand.splice(index, 1);
    this.handContainer.removeCard(index, true);

    // 捨て札に追加
    this.discardCount++;

    this.eventBus.emit('card:used' as any, { card });
  }

  /**
   * 手札カード選択ハンドラ
   */
  private handleHandCardSelect(card: Card, _index: number): void {
    // フェーズコンテナにカード選択を通知
    this.notifyPhaseContainerCardSelect(card);

    this.eventBus.emit('hand:card:selected' as any, { card });
  }

  /**
   * 手札カード選択解除ハンドラ
   */
  private handleHandCardDeselect(card: Card, _index: number): void {
    this.eventBus.emit('hand:card:deselected' as any, { card });
  }

  /**
   * 手札カード確定ハンドラ
   */
  private handleHandCardConfirm(card: Card, _index: number): void {
    this.eventBus.emit('hand:card:confirmed' as any, { card });
  }

  /**
   * デッキクリックハンドラ
   */
  private handleDeckClick(): void {
    // AP消費確認などを経てドロー
    this.eventBus.emit('deck:draw:requested' as any, { count: 1 });
  }

  /**
   * フェーズコンテナにカード選択を通知
   */
  private notifyPhaseContainerCardSelect(card: Card): void {
    if (!this.activePhaseContainer) return;

    const info = this.phaseContainers.get(this.currentPhase);
    if (!info || !info.container) return;

    // フェーズコンテナにカードを渡す
    // 各フェーズコンテナが独自のカード選択処理を持つ場合に拡張
    this.eventBus.emit('phase:card:selected' as any, {
      phase: this.currentPhase,
      card,
    });
  }

  /**
   * フェーズに応じた手札表示制御
   */
  private updateHandVisibilityForPhase(phase: MainScenePhase): void {
    switch (phase) {
      case 'quest-accept':
        // 依頼受注フェーズでは手札非表示
        this.handContainer.setVisible(false);
        break;

      case 'gathering':
        // 採取フェーズでは手札表示（採取地カードのみフィルタ）
        this.handContainer.setVisible(true);
        this.handContainer.setSelectableFilter((card) => card.type === 'gathering');
        break;

      case 'alchemy':
        // 調合フェーズでは手札表示（レシピカードのみフィルタ）
        this.handContainer.setVisible(true);
        this.handContainer.setSelectableFilter((card) => card.type === 'recipe');
        break;

      case 'delivery':
        // 納品フェーズでは手札非表示
        this.handContainer.setVisible(false);
        break;
    }
  }

  /**
   * HandContainerを取得
   */
  getHandContainer(): HandContainer {
    return this.handContainer;
  }

  /**
   * DeckViewを取得
   */
  getDeckView(): DeckView {
    return this.deckView;
  }

  // =====================================================
  // Getter
  // =====================================================

  /**
   * メインエリアの境界情報を取得
   */
  getMainAreaBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return {
      x: MainSceneLayout.PHASE_CONTAINER.X,
      y: MainSceneLayout.PHASE_CONTAINER.Y,
      width: MainSceneLayout.PHASE_CONTAINER.WIDTH,
      height: MainSceneLayout.PHASE_CONTAINER.HEIGHT,
    };
  }

  /**
   * ヘッダーコンテナを取得
   */
  getHeaderContainer(): Phaser.GameObjects.Container {
    return this.headerContainer;
  }

  /**
   * サイドバーコンテナを取得
   */
  getSidebarContainer(): Phaser.GameObjects.Container {
    return this.sidebarContainer;
  }

  /**
   * フッターコンテナを取得
   */
  getFooterContainer(): Phaser.GameObjects.Container {
    return this.footerContainer;
  }

  // =====================================================
  // EventBus連携
  // =====================================================

  protected setupEventListeners(): void {
    if (this.eventListenersSetup) return;

    this.setupApplicationEventListeners();
    this.setupUIEventForwarding();
    this.eventListenersSetup = true;
  }

  /**
   * Application層からのイベントリスナーを設定
   */
  private setupApplicationEventListeners(): void {
    const { APP_TO_UI } = MainSceneEvents;

    // ゲーム状態更新
    this.eventBus.on(APP_TO_UI.GAME_STATE_UPDATED as any, (data: any) => {
      this.handleGameStateUpdate(data);
    });

    // プレイヤーデータ更新
    this.eventBus.on(
      APP_TO_UI.PLAYER_DATA_UPDATED as any,
      (data: PlayerDataUpdatePayload) => {
        this.handlePlayerDataUpdate(data);
      }
    );

    // フェーズ変更
    this.eventBus.on(
      APP_TO_UI.PHASE_CHANGED as any,
      (data: { phase: string }) => {
        this.switchToPhase(data.phase as MainScenePhase);
      }
    );

    // フェーズデータロード
    this.eventBus.on(APP_TO_UI.PHASE_DATA_LOADED as any, (data: any) => {
      this.handlePhaseDataLoaded(data);
    });

    // 依頼リスト更新
    this.eventBus.on(
      APP_TO_UI.AVAILABLE_QUESTS_UPDATED as any,
      (data: { quests: any[] }) => {
        this.handleAvailableQuestsUpdate(data.quests);
      }
    );

    this.eventBus.on(
      APP_TO_UI.ACCEPTED_QUESTS_UPDATED as any,
      (data: { quests: any[] }) => {
        this.handleAcceptedQuestsUpdate(data.quests);
      }
    );

    // インベントリ更新
    this.eventBus.on(
      APP_TO_UI.INVENTORY_UPDATED as any,
      (data: { items: any[] }) => {
        this.handleInventoryUpdate(data.items);
      }
    );

    // 手札・デッキ更新
    this.eventBus.on(
      APP_TO_UI.HAND_UPDATED as any,
      (data: { cards: Card[] }) => {
        this.setHand(data.cards);
      }
    );

    this.eventBus.on(
      APP_TO_UI.DECK_UPDATED as any,
      (data: DeckUpdatePayload) => {
        this.deckView.setCount(data.deckCount);
        this.discardCount = data.discardCount;
      }
    );

    // 通知
    this.eventBus.on(APP_TO_UI.NOTIFICATION_SHOW as any, (data: NotificationData) => {
      this.showNotification(data.message, data.type);
    });

    // エラー
    this.eventBus.on(
      APP_TO_UI.ERROR_OCCURRED as any,
      (data: { message: string }) => {
        this.showError(data.message);
      }
    );
  }

  /**
   * UI層からのイベントを転送
   */
  private setupUIEventForwarding(): void {
    // フェーズコンテナからのイベントをApplication層向けに変換
    // フェーズ完了イベント
    this.eventBus.on('phase:complete' as any, (data: { phase: string }) => {
      this.eventBus.emit(MainSceneEvents.UI_TO_APP.PHASE_COMPLETE as any, data);
    });

    // フェーズスキップイベント
    this.eventBus.on('phase:skip' as any, (data: { phase: string }) => {
      this.eventBus.emit(MainSceneEvents.UI_TO_APP.PHASE_SKIP_REQUESTED as any, data);
    });
  }

  /**
   * イベントリスナーを解除
   */
  protected removeEventListeners(): void {
    const { APP_TO_UI } = MainSceneEvents;

    // すべてのイベントリスナーを解除
    Object.values(APP_TO_UI).forEach((event) => {
      this.eventBus.off(event as any);
    });

    // ローカルイベントも解除
    this.eventBus.off('phase:complete' as any);
    this.eventBus.off('phase:skip' as any);

    this.eventListenersSetup = false;
  }

  // =====================================================
  // イベントハンドラ
  // =====================================================

  /**
   * ゲーム状態更新ハンドラ
   */
  private handleGameStateUpdate(data: any): void {
    if (data.currentPhase) {
      this.currentPhase = data.currentPhase;
      this.updatePhaseIndicators();
    }

    if (data.playerData) {
      this.setPlayerData(data.playerData);
    }
  }

  /**
   * プレイヤーデータ更新ハンドラ
   */
  private handlePlayerDataUpdate(data: PlayerDataUpdatePayload): void {
    if (data.rank !== undefined && this.headerTexts.rank) {
      this.headerTexts.rank.setText(`Rank: ${data.rank}`);
    }
    if (data.exp !== undefined && data.maxExp !== undefined && this.headerTexts.exp) {
      this.headerTexts.exp.setText(`EXP: ${data.exp}/${data.maxExp}`);
    }
    if (data.day !== undefined && data.maxDay !== undefined && this.headerTexts.day) {
      this.headerTexts.day.setText(`Day: ${data.day}/${data.maxDay}`);
    }
    if (data.gold !== undefined && this.headerTexts.gold) {
      this.headerTexts.gold.setText(`Gold: ${data.gold}`);
    }
    if (data.ap !== undefined && data.maxAP !== undefined && this.headerTexts.ap) {
      this.headerTexts.ap.setText(`AP: ${data.ap}/${data.maxAP}`);
    }
  }

  /**
   * フェーズデータロードハンドラ
   */
  private handlePhaseDataLoaded(data: any): void {
    const info = this.phaseContainers.get(this.currentPhase);
    if (!info || !info.container) return;

    // フェーズコンテナにデータを設定
    switch (this.currentPhase) {
      case 'quest-accept':
        if (data.availableQuests) {
          const questContainer = info.container as QuestAcceptContainer;
          questContainer.setAvailableQuests(data.availableQuests);
        }
        break;

      case 'gathering':
        if (data.ap) {
          const gatheringContainer = info.container as GatheringContainer;
          gatheringContainer.setCurrentAP(data.ap.current, data.ap.max);
        }
        break;

      case 'alchemy':
        const alchemyContainer = info.container as AlchemyContainer;
        if (data.recipeCards) {
          alchemyContainer.setRecipeCards(data.recipeCards);
        }
        if (data.materials) {
          alchemyContainer.setAvailableMaterials(data.materials);
        }
        break;

      case 'delivery':
        const deliveryContainer = info.container as DeliveryContainer;
        if (data.acceptedQuests) {
          deliveryContainer.setAcceptedQuests(data.acceptedQuests);
        }
        if (data.inventory) {
          deliveryContainer.setInventory(data.inventory);
        }
        break;
    }
  }

  /**
   * 利用可能依頼更新ハンドラ
   */
  private handleAvailableQuestsUpdate(quests: any[]): void {
    if (this.currentPhase === 'quest-accept') {
      const info = this.phaseContainers.get('quest-accept');
      if (info?.container) {
        (info.container as QuestAcceptContainer).setAvailableQuests(quests);
      }
    }
  }

  /**
   * 受注済み依頼更新ハンドラ
   */
  private handleAcceptedQuestsUpdate(quests: any[]): void {
    // 納品フェーズの場合はコンテナも更新
    if (this.currentPhase === 'delivery') {
      const info = this.phaseContainers.get('delivery');
      if (info?.container) {
        (info.container as DeliveryContainer).setAcceptedQuests(quests);
      }
    }
  }

  /**
   * インベントリ更新ハンドラ
   */
  private handleInventoryUpdate(items: any[]): void {
    // 調合フェーズの場合はコンテナも更新
    if (this.currentPhase === 'alchemy') {
      const info = this.phaseContainers.get('alchemy');
      if (info?.container) {
        const materials = items.filter((i) => i.type === 'material');
        (info.container as AlchemyContainer).setAvailableMaterials(materials as any);
      }
    }

    // 納品フェーズの場合はコンテナも更新
    if (this.currentPhase === 'delivery') {
      const info = this.phaseContainers.get('delivery');
      if (info?.container) {
        (info.container as DeliveryContainer).setInventory(items);
      }
    }
  }

  // =====================================================
  // 通知・エラー表示
  // =====================================================

  /**
   * 通知を表示
   */
  showNotification(message: string, type: NotificationType): void {
    this.notificationQueue.push({ message, type });

    if (!this.isShowingNotification) {
      this.displayNextNotification();
    }
  }

  /**
   * 次の通知を表示
   */
  private async displayNextNotification(): Promise<void> {
    if (this.notificationQueue.length === 0) {
      this.isShowingNotification = false;
      return;
    }

    this.isShowingNotification = true;
    const { message, type } = this.notificationQueue.shift()!;

    const colors: Record<NotificationType, number> = {
      success: 0x00aa00,
      info: 0x0088ff,
      warning: 0xffaa00,
      error: 0xff4444,
    };

    const notification = this.add.container(
      MainSceneLayout.SCREEN_WIDTH / 2,
      MainSceneLayout.HEADER.HEIGHT + 20
    );

    const bg = this.add.graphics();
    bg.fillStyle(colors[type] ?? colors.info, 0.9);
    bg.fillRoundedRect(-200, -20, 400, 40, 8);
    notification.add(bg);

    const text = this.add.text(0, 0, message, {
      ...TextStyles.body,
      fontSize: '14px',
    });
    text.setOrigin(0.5);
    notification.add(text);

    notification.setAlpha(0);
    notification.setY(notification.y - 20);
    notification.setDepth(500);

    // 入場アニメーション
    await this.tweenPromise({
      targets: notification,
      alpha: 1,
      y: notification.y + 20,
      duration: 200,
      ease: 'Power2.easeOut',
    });

    // 表示維持
    await this.delay(2000);

    // 退場アニメーション
    await this.tweenPromise({
      targets: notification,
      alpha: 0,
      y: notification.y - 20,
      duration: 200,
      ease: 'Power2.easeIn',
    });

    notification.destroy();

    // 次の通知を表示
    this.displayNextNotification();
  }

  /**
   * エラーを表示
   */
  showError(message: string): void {
    this.showNotification(message, 'error');
  }

  /**
   * Tween完了をPromiseで待機
   */
  private tweenPromise(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        ...config,
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * 遅延待機
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }

  // =====================================================
  // シャットダウン
  // =====================================================

  /**
   * シーンシャットダウン処理
   */
  shutdown(): void {
    this.removeEventListeners();
    this.notificationQueue = [];

    // フェーズコンテナのクリーンアップ
    this.phaseContainers.forEach((info) => {
      if (info.container) {
        info.container.destroy();
      }
    });
    this.phaseContainers.clear();

    super.shutdown();
  }
}
