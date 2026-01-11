/**
 * Phase3 統合テストシーン
 *
 * TASK-0239: Phase3統合テスト
 * Phase 3で実装したすべてのコンポーネントを手動でテストするためのシーン。
 * フェーズコンテナの連携、MainSceneの動作、EventBusの通信を検証する。
 */

import Phaser from 'phaser';
import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { MainSceneLayout, MainScenePhases, MainScenePhaseLabels } from './MainSceneConstants';
import type { MainScenePhase } from './MainSceneConstants';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';
import type { IPhaseContainer } from '../ui/phase/IPhaseContainer';
import { QuestAcceptContainer } from '../ui/quest/QuestAcceptContainer';
import { GatheringContainer } from '../ui/phase/GatheringContainer';
import { AlchemyContainer } from '../ui/phase/AlchemyContainer';
import { DeliveryContainer } from '../ui/phase/DeliveryContainer';
import { HandContainer } from '../ui/hand/HandContainer';
import { DeckView } from '../ui/deck/DeckView';

/**
 * Phase3 テストシーン
 *
 * 機能：
 * - 全フェーズコンテナの手動テスト
 * - フェーズ切り替えテスト
 * - EventBus通信テスト
 * - 手札・デッキ連携テスト
 */
export class Phase3TestScene extends BaseGameScene {
  // 現在のフェーズ
  private currentPhase: MainScenePhase = 'quest-accept';

  // フェーズコンテナ
  private currentPhaseContainer: IPhaseContainer | null = null;

  // UI要素
  private headerTexts: {
    rank?: Phaser.GameObjects.Text;
    exp?: Phaser.GameObjects.Text;
    day?: Phaser.GameObjects.Text;
    gold?: Phaser.GameObjects.Text;
    ap?: Phaser.GameObjects.Text;
  } = {};
  private phaseIndicatorBgs: Phaser.GameObjects.Graphics[] = [];

  // 手札・デッキ
  private handContainer!: HandContainer;
  private deckView!: DeckView;

  // テストパネル
  private testPanel!: Phaser.GameObjects.Container;
  private logPanel!: Phaser.GameObjects.Container;
  private logTexts: Phaser.GameObjects.Text[] = [];
  private logIndex = 0;

  constructor() {
    super('Phase3TestScene');
  }

  protected onInit(_data?: SceneInitData): void {
    // 初期化
  }

  protected onPreload(): void {
    // アセット読み込み（必要に応じて）
  }

  protected onCreate(_data?: SceneInitData): void {
    this.createBackground();
    this.createHeader();
    this.createSidebar();
    this.createFooter();
    this.createHandAndDeck();
    this.createTestControls();
    this.createLogPanel();

    // 初期データ設定
    this.setTestData();

    // 初期フェーズ表示
    this.showPhase('quest-accept');

    this.log('Phase3TestScene: 初期化完了');
  }

  // =====================================================
  // 背景・レイアウト
  // =====================================================

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(Colors.backgroundDark, 1);
    bg.fillRect(0, 0, MainSceneLayout.SCREEN_WIDTH, MainSceneLayout.SCREEN_HEIGHT);
  }

  private createHeader(): void {
    const { HEADER } = MainSceneLayout;

    const headerContainer = this.add.container(HEADER.X, HEADER.Y);

    // 背景
    const headerBg = this.add.graphics();
    headerBg.fillStyle(Colors.backgroundLight, 1);
    headerBg.fillRect(0, 0, HEADER.WIDTH, HEADER.HEIGHT);
    headerBg.lineStyle(1, Colors.panelBorder);
    headerBg.strokeRect(0, 0, HEADER.WIDTH, HEADER.HEIGHT);
    headerContainer.add(headerBg);

    // タイトル
    const title = this.add.text(20, 20, 'Phase3 テストシーン', TextStyles.titleSmall);
    headerContainer.add(title);

    // ステータス
    const statusX = 250;
    const statusY = 20;
    const spacing = 110;

    this.headerTexts.rank = this.add.text(statusX, statusY, 'Rank: G', TextStyles.bodySmall);
    headerContainer.add(this.headerTexts.rank);

    this.headerTexts.exp = this.add.text(statusX + spacing, statusY, 'EXP: 0/100', TextStyles.bodySmall);
    headerContainer.add(this.headerTexts.exp);

    this.headerTexts.day = this.add.text(statusX + spacing * 2, statusY, 'Day: 1/30', TextStyles.bodySmall);
    headerContainer.add(this.headerTexts.day);

    this.headerTexts.gold = this.add.text(statusX + spacing * 3, statusY, 'Gold: 0', TextStyles.bodySmall);
    this.headerTexts.gold.setColor('#ffd700');
    headerContainer.add(this.headerTexts.gold);

    this.headerTexts.ap = this.add.text(statusX + spacing * 4, statusY, 'AP: 3/3', TextStyles.bodySmall);
    headerContainer.add(this.headerTexts.ap);
  }

  private createSidebar(): void {
    const { SIDEBAR } = MainSceneLayout;

    const sidebarContainer = this.add.container(SIDEBAR.X, SIDEBAR.Y);

    // 背景
    const sidebarBg = this.add.graphics();
    sidebarBg.fillStyle(Colors.panelBackground, 1);
    sidebarBg.fillRect(0, 0, SIDEBAR.WIDTH, SIDEBAR.HEIGHT);
    sidebarBg.lineStyle(1, Colors.panelBorder);
    sidebarBg.strokeRect(0, 0, SIDEBAR.WIDTH, SIDEBAR.HEIGHT);
    sidebarContainer.add(sidebarBg);

    // タイトル
    const title = this.add.text(10, 10, 'Quest List', TextStyles.bodySmall);
    sidebarContainer.add(title);

    // プレースホルダー
    const placeholder = this.add.text(10, 40, '依頼リスト\n(テスト用)', TextStyles.bodySmall);
    placeholder.setAlpha(0.5);
    sidebarContainer.add(placeholder);
  }

  private createFooter(): void {
    const { FOOTER } = MainSceneLayout;

    const footerContainer = this.add.container(FOOTER.X, FOOTER.Y);

    // 背景
    const footerBg = this.add.graphics();
    footerBg.fillStyle(Colors.backgroundLight, 1);
    footerBg.fillRect(0, 0, FOOTER.WIDTH, FOOTER.HEIGHT);
    footerContainer.add(footerBg);

    // フェーズインジケーター
    const indicatorWidth = 150;
    const indicatorSpacing = 20;
    const startX = (FOOTER.WIDTH - (indicatorWidth * MainScenePhases.length + indicatorSpacing * (MainScenePhases.length - 1))) / 2;

    MainScenePhases.forEach((phase, index) => {
      const x = startX + index * (indicatorWidth + indicatorSpacing);
      const y = FOOTER.HEIGHT / 2;

      // インジケーター背景
      const bg = this.add.graphics();
      bg.fillStyle(phase === this.currentPhase ? Colors.primary : Colors.panelBackground, 1);
      bg.fillRoundedRect(x, y - 15, indicatorWidth, 30, 5);
      bg.lineStyle(1, Colors.panelBorder);
      bg.strokeRoundedRect(x, y - 15, indicatorWidth, 30, 5);
      bg.setData('x', x);
      bg.setData('y', y);
      bg.setData('width', indicatorWidth);
      bg.setData('phase', phase);
      footerContainer.add(bg);
      this.phaseIndicatorBgs.push(bg);

      // フェーズ名
      const label = this.add.text(x + indicatorWidth / 2, y, MainScenePhaseLabels[phase], TextStyles.bodySmall);
      label.setOrigin(0.5);
      footerContainer.add(label);

      // クリック判定
      const hitArea = this.add.rectangle(x + indicatorWidth / 2, y, indicatorWidth, 30, 0x000000, 0);
      hitArea.setInteractive({ cursor: 'pointer' });
      hitArea.on('pointerdown', () => this.handlePhaseClick(phase));
      footerContainer.add(hitArea);
    });
  }

  // =====================================================
  // 手札・デッキ
  // =====================================================

  private createHandAndDeck(): void {
    const { HAND_AREA, DECK_AREA } = MainSceneLayout;

    // 手札コンテナ
    this.handContainer = new HandContainer(this, {
      x: HAND_AREA.X + HAND_AREA.WIDTH / 2,
      y: HAND_AREA.Y + HAND_AREA.HEIGHT / 2,
      layoutType: 'horizontal',
      onCardSelect: (card, index) => this.handleCardSelect(card, index),
    });

    // デッキビュー
    this.deckView = new DeckView(this, {
      x: DECK_AREA.X + DECK_AREA.WIDTH / 2,
      y: DECK_AREA.Y + DECK_AREA.HEIGHT / 2,
      onClick: () => this.handleDeckClick(),
    });
  }

  // =====================================================
  // テストコントロール
  // =====================================================

  private createTestControls(): void {
    this.testPanel = this.add.container(10, 600);

    // タイトル
    const title = this.add.text(0, 0, 'テストコントロール', {
      fontSize: '12px',
      color: '#ffffff',
    });
    this.testPanel.add(title);

    // フェーズ切替ボタン
    MainScenePhases.forEach((phase, index) => {
      const btn = this.createTestButton(
        index * 100,
        25,
        phase.substring(0, 8),
        () => this.showPhase(phase)
      );
      this.testPanel.add(btn);
    });

    // アクションボタン
    const actions = [
      { label: 'ドロー', action: () => this.testDraw() },
      { label: 'AP+', action: () => this.testAddAP() },
      { label: 'Gold+', action: () => this.testAddGold() },
      { label: 'Notify', action: () => this.testNotification() },
      { label: 'Log Clear', action: () => this.clearLog() },
    ];

    actions.forEach((item, index) => {
      const btn = this.createTestButton(index * 80, 55, item.label, item.action);
      this.testPanel.add(btn);
    });
  }

  private createTestButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x333366, 1);
    bg.fillRoundedRect(0, 0, 75, 25, 4);
    btn.add(bg);

    const text = this.add.text(37, 12, label, {
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5);
    btn.add(text);

    btn.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 75, 25),
      Phaser.Geom.Rectangle.Contains
    );
    btn.on('pointerdown', onClick);

    return btn;
  }

  // =====================================================
  // ログパネル
  // =====================================================

  private createLogPanel(): void {
    this.logPanel = this.add.container(450, 600);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.9);
    bg.fillRoundedRect(0, 0, 370, 150, 5);
    bg.lineStyle(1, 0x444488);
    bg.strokeRoundedRect(0, 0, 370, 150, 5);
    this.logPanel.add(bg);

    // タイトル
    const title = this.add.text(10, 5, 'イベントログ', {
      fontSize: '11px',
      color: '#aaaaff',
    });
    this.logPanel.add(title);

    // ログテキスト用エリア
    for (let i = 0; i < 7; i++) {
      const logText = this.add.text(10, 25 + i * 17, '', {
        fontSize: '10px',
        color: '#cccccc',
      });
      this.logPanel.add(logText);
      this.logTexts.push(logText);
    }
  }

  private log(message: string): void {
    console.log(`[Phase3Test] ${message}`);

    // ログをシフト
    for (let i = this.logTexts.length - 1; i > 0; i--) {
      this.logTexts[i].setText(this.logTexts[i - 1].text);
    }

    // 新しいログを追加
    const timestamp = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.logTexts[0].setText(`[${timestamp}] ${message}`);
    this.logIndex++;
  }

  private clearLog(): void {
    this.logTexts.forEach((t) => t.setText(''));
    this.logIndex = 0;
    this.log('ログをクリアしました');
  }

  // =====================================================
  // フェーズ切り替え
  // =====================================================

  private showPhase(phase: MainScenePhase): void {
    // 前のコンテナを破棄
    if (this.currentPhaseContainer) {
      this.currentPhaseContainer.destroy();
      this.currentPhaseContainer = null;
    }

    this.currentPhase = phase;
    this.updatePhaseIndicators();
    this.log(`フェーズ変更: ${MainScenePhaseLabels[phase]}`);

    // 新しいコンテナを作成
    const bounds = {
      x: MainSceneLayout.PHASE_CONTAINER.X,
      y: MainSceneLayout.PHASE_CONTAINER.Y,
      width: MainSceneLayout.PHASE_CONTAINER.WIDTH,
      height: MainSceneLayout.PHASE_CONTAINER.HEIGHT,
    };

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
        const questContainer = new QuestAcceptContainer({
          ...baseOptions,
          onQuestAccepted: (quest) => this.log(`依頼受注: ${JSON.stringify(quest)}`),
          onSkip: () => this.log('依頼受注スキップ'),
        });
        questContainer.setAvailableQuests(this.createTestQuests());
        this.currentPhaseContainer = questContainer;
        break;

      case 'gathering':
        const gatheringContainer = new GatheringContainer({
          ...baseOptions,
          onGatheringComplete: (result) => this.log(`採取完了: ${JSON.stringify(result)}`),
          onSkip: () => this.log('採取スキップ'),
        });
        gatheringContainer.setCurrentAP(8, 10);
        gatheringContainer.setMaterialOptions(this.createTestMaterialOptions());
        this.currentPhaseContainer = gatheringContainer;
        break;

      case 'alchemy':
        const alchemyContainer = new AlchemyContainer({
          ...baseOptions,
          onAlchemyComplete: (result) => this.log(`調合完了: ${JSON.stringify(result)}`),
          onSkip: () => this.log('調合スキップ'),
        });
        alchemyContainer.setRecipeCards(this.createTestRecipes() as any);
        alchemyContainer.setAvailableMaterials(this.createTestMaterials());
        this.currentPhaseContainer = alchemyContainer;
        break;

      case 'delivery':
        const deliveryContainer = new DeliveryContainer({
          ...baseOptions,
          onDeliveryComplete: (result) => this.log(`納品完了: ${JSON.stringify(result)}`),
          onSkip: () => this.log('納品スキップ'),
        });
        deliveryContainer.setAcceptedQuests(this.createTestQuests());
        deliveryContainer.setInventory(this.createTestItems());
        this.currentPhaseContainer = deliveryContainer;
        break;
    }

    this.currentPhaseContainer?.enter();
  }

  private updatePhaseIndicators(): void {
    this.phaseIndicatorBgs.forEach((bg) => {
      const phase = bg.getData('phase') as MainScenePhase;
      const x = bg.getData('x') as number;
      const y = bg.getData('y') as number;
      const width = bg.getData('width') as number;

      bg.clear();
      bg.fillStyle(phase === this.currentPhase ? Colors.primary : Colors.panelBackground, 1);
      bg.fillRoundedRect(x, y - 15, width, 30, 5);
      bg.lineStyle(1, Colors.panelBorder);
      bg.strokeRoundedRect(x, y - 15, width, 30, 5);
    });
  }

  private handlePhaseClick(phase: MainScenePhase): void {
    this.log(`フェーズクリック: ${phase}`);
    this.showPhase(phase);
  }

  // =====================================================
  // テストデータ
  // =====================================================

  private setTestData(): void {
    // ヘッダーデータ
    if (this.headerTexts.rank) this.headerTexts.rank.setText('Rank: Silver');
    if (this.headerTexts.exp) this.headerTexts.exp.setText('EXP: 150/200');
    if (this.headerTexts.day) this.headerTexts.day.setText('Day: 5/30');
    if (this.headerTexts.gold) this.headerTexts.gold.setText('Gold: 500');
    if (this.headerTexts.ap) this.headerTexts.ap.setText('AP: 8/10');

    // デッキ・手札
    this.deckView.setCount(20);
    this.handContainer.setCards(this.createTestCards());
  }

  private createTestQuests(): any[] {
    return [
      {
        id: 'q1',
        name: '薬草の依頼',
        remainingDays: 5,
        difficulty: 'easy',
        reward: { gold: 100, exp: 20 },
        requiredItems: [{ name: '回復薬', quantity: 2 }],
      },
      {
        id: 'q2',
        name: '爆弾の依頼',
        remainingDays: 3,
        difficulty: 'normal',
        reward: { gold: 200, exp: 40 },
        requiredItems: [{ name: '爆弾', quantity: 1 }],
      },
      {
        id: 'q3',
        name: '魔法薬の依頼',
        remainingDays: 7,
        difficulty: 'hard',
        reward: { gold: 500, exp: 100 },
        requiredItems: [{ name: '魔法薬', quantity: 1 }],
      },
    ];
  }

  private createTestItems(): any[] {
    return [
      { id: 'i1', name: '回復薬', quality: 'normal' },
      { id: 'i2', name: '回復薬', quality: 'good' },
      { id: 'i3', name: '爆弾', quality: 'normal' },
    ];
  }

  private createTestCards(): any[] {
    return [
      { id: 'c1', name: '森の採取地', type: 'gathering' },
      { id: 'c2', name: '回復薬のレシピ', type: 'recipe' },
      { id: 'c3', name: '山の採取地', type: 'gathering' },
    ];
  }

  private createTestMaterialOptions(): any[] {
    return [
      { material: { id: 'm1', name: '薬草', category: 'plant', quality: 'normal' }, quantity: 3, probability: 0.8 },
      { material: { id: 'm2', name: '鉄鉱石', category: 'mineral', quality: 'normal' }, quantity: 2, probability: 0.5 },
      { material: { id: 'm3', name: '希少鉱石', category: 'mineral', quality: 'rare' }, quantity: 1, probability: 0.1 },
    ];
  }

  private createTestRecipes(): any[] {
    return [
      { id: 'r1', name: '回復薬', type: 'recipe', requiredCategories: ['plant'], requiredMaterialCount: 2 },
      { id: 'r2', name: '爆弾', type: 'recipe', requiredCategories: ['mineral', 'powder'], requiredMaterialCount: 3 },
    ];
  }

  private createTestMaterials(): any[] {
    return [
      { id: 'm1', name: '薬草', category: 'plant', quality: 'normal' },
      { id: 'm2', name: '赤い花', category: 'plant', quality: 'good' },
      { id: 'm3', name: '鉄鉱石', category: 'mineral', quality: 'normal' },
      { id: 'm4', name: '火薬', category: 'powder', quality: 'normal' },
    ];
  }

  // =====================================================
  // テストアクション
  // =====================================================

  private testDraw(): void {
    this.log('ドローテスト');
    // ドローリクエストをログに記録
    this.log('イベント発火: ui:card:draw:requested { count: 1 }');
  }

  private testAddAP(): void {
    if (this.headerTexts.ap) {
      this.headerTexts.ap.setText('AP: 10/10');
    }
    this.log('AP追加テスト');
  }

  private testAddGold(): void {
    if (this.headerTexts.gold) {
      this.headerTexts.gold.setText('Gold: 1000');
    }
    this.log('Gold追加テスト');
  }

  private testNotification(): void {
    this.log('通知テスト発火');
    this.log('イベント発火: app:notification:show { message: テスト通知, type: info }');
  }

  // =====================================================
  // イベントハンドラ
  // =====================================================

  private handleCardSelect(card: any, index: number): void {
    this.log(`カード選択: ${card?.name ?? 'unknown'} (index: ${index})`);
  }

  private handleDeckClick(): void {
    this.log('デッキクリック');
  }

  protected setupEventListeners(): void {
    // イベントリスナーを設定
    // Phase3TestSceneでは実際のEventBusイベントは発火しないが、
    // UIコンポーネントからのコールバックで動作を確認する
    // 将来的にはEventPayloadsに定義されたイベントを購読する

    // シーン準備完了イベント
    this.subscribe(
      this.eventBus.onVoid('scene:ready', () => {
        this.log('イベント[scene:ready]: シーン準備完了');
      })
    );

    // シーンシャットダウンイベント
    this.subscribe(
      this.eventBus.onVoid('scene:shutdown', () => {
        this.log('イベント[scene:shutdown]: シーンシャットダウン');
      })
    );
  }

  protected onShutdown(): void {
    if (this.currentPhaseContainer) {
      this.currentPhaseContainer.destroy();
      this.currentPhaseContainer = null;
    }
  }
}
