/**
 * MainScene - メインゲーム画面シーン
 *
 * TASK-0235: MainScene基本レイアウト実装
 * ヘッダー、サイドバー、メインエリア、フッターの配置を行う。
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
import { SceneKeys } from '../config/SceneKeys';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';

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
      this.footerContainer.add(bg);

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
    // 背景の更新が必要だが、プレースホルダー実装では省略
    // 将来的にはPhaseIndicatorコンポーネントで実装
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

  protected setupEventListeners(): void {
    // EventBusのグローバルイベントリスナー（後続タスクで実装）
  }
}
