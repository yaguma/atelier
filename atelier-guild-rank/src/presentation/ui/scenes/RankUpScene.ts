/**
 * RankUpSceneコンポーネント
 * TASK-0026 昇格試験画面実装
 *
 * @description
 * 昇格試験画面全体のUI管理を担当するコンポーネント。
 * 試験内容表示、試験受注、進捗管理、報酬選択を提供する。
 */

import type Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/** UI配置定数 */
const UI_LAYOUT = {
  /** コンポーネント初期X座標 */
  COMPONENT_X: 160,
  /** コンポーネント初期Y座標 */
  COMPONENT_Y: 80,
  /** タイトルX座標 */
  TITLE_X: 200,
  /** タイトルY座標 */
  TITLE_Y: 30,
  /** 課題パネルX座標 */
  TASK_PANEL_X: 200,
  /** 課題パネルY座標 */
  TASK_PANEL_Y: 120,
  /** ボタン群X座標 */
  BUTTONS_X: 200,
  /** ボタン群Y座標 */
  BUTTONS_Y: 300,
  /** 報酬選択X座標 */
  REWARD_X: 200,
  /** 報酬選択Y座標 */
  REWARD_Y: 150,
} as const;

/** エラーメッセージ定数 */
const ERROR_MESSAGES = {
  EVENT_BUS_NOT_AVAILABLE: 'EventBus is not available in scene.data',
  RANK_SERVICE_NOT_AVAILABLE: 'RankService is not available',
  TEST_NOT_AVAILABLE: 'No test is available',
  FAILED_TO_EMIT_EVENT: 'Failed to emit event:',
} as const;

/** UIテキスト定数 */
const UI_TEXT = {
  PHASE_TITLE: '🏆 昇格試験',
  RANK_UP_FORMAT: '{fromRank} → {toRank} ランクへの昇格',
  TEST_CONTENT_TITLE: '試験内容:',
  TIME_LIMIT_FORMAT: '期限: {days}日以内',
  START_TEST_BUTTON: '試験を受ける',
  DECLINE_TEST_BUTTON: '後で受ける',
  TEST_IN_PROGRESS: '【昇格試験中】',
  REMAINING_DAYS_FORMAT: '残り: {days}日',
  TASK_COMPLETED: '✓',
  TASK_PENDING: '○',
  TEST_CLEAR_TITLE: '昇格試験クリア！',
  REWARD_BONUS_FORMAT: '💰 ボーナスゴールド: +{gold}G',
  REWARD_SELECT_TITLE: 'アーティファクトを選択してください:',
  SELECT_ARTIFACT_BUTTON: '選択',
  TEST_FAILED_TITLE: '昇格試験失敗...',
  GAME_OVER: 'ゲームオーバー',
  TO_TITLE_BUTTON: 'タイトルへ',
} as const;

/** スタイル定数 */
const UI_STYLES = {
  TITLE: {
    fontSize: '28px',
    color: '#ffd700',
  },
  RANK_DISPLAY: {
    fontSize: '24px',
    color: '#ffffff',
  },
  TASK_TITLE: {
    fontSize: '18px',
    color: '#ffffff',
  },
  TASK_ITEM: {
    fontSize: '16px',
    color: '#cccccc',
  },
  TASK_COMPLETED: {
    fontSize: '16px',
    color: '#00ff00',
  },
  BUTTON_TEXT: {
    fontSize: '18px',
    color: '#ffffff',
  },
  REWARD_TEXT: {
    fontSize: '16px',
    color: '#ffd700',
  },
  ARTIFACT_NAME: {
    fontSize: '14px',
    color: '#ffffff',
  },
  ARTIFACT_EFFECT: {
    fontSize: '12px',
    color: '#aaaaaa',
  },
} as const;

/** キーボードショートカット定数 */
const KEYBOARD_KEYS = {
  /** 試験開始キー */
  START_TEST: 'Enter',
  /** 辞退キー */
  DECLINE: 'Escape',
  /** アーティファクト選択キー */
  SELECT_1: '1',
  SELECT_2: '2',
  SELECT_3: '3',
} as const;

/**
 * EventBusインターフェース
 */
interface IEventBus {
  emit(event: string, payload?: unknown): void;
  on(event: string, callback: (payload?: unknown) => void): void;
  off(event: string, callback: (payload?: unknown) => void): void;
  once(event: string, callback: (payload?: unknown) => void): void;
}

/**
 * 品質タイプ
 */
type Quality = 'C' | 'B' | 'A' | 'S';

/**
 * ランクタイプ
 */
type Rank = 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

/**
 * 試験状態タイプ
 */
type TestState = 'NotStarted' | 'InProgress' | 'Completed' | 'Failed';

/**
 * RankTestTaskインターフェース
 */
interface RankTestTask {
  taskId: string;
  description: string;
  itemId: string;
  count: number;
  qualityRequired?: Quality;
  completed: number;
  isCompleted: boolean;
}

/**
 * RankTestインターフェース
 */
interface RankTest {
  testId: string;
  fromRank: Rank;
  toRank: Rank;
  tasks: RankTestTask[];
  timeLimitDays: number;
  remainingDays: number;
  state: TestState;
}

/**
 * Artifactインターフェース
 */
interface Artifact {
  id: string;
  name: string;
  rarity: string;
  effect: string;
  description: string;
}

/**
 * RankUpRewardインターフェース
 */
interface RankUpReward {
  bonusGold: number;
  artifacts: Artifact[];
}

/**
 * IRankServiceインターフェース
 */
interface IRankService {
  getCurrentTest(): RankTest | null;
  startTest(testId: string): boolean;
  checkProgress(): RankTest;
  completeTest(): RankUpReward;
  failTest(): void;
  selectArtifact(artifactId: string): void;
}

/**
 * Buttonインターフェース
 */
interface Button {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  destroy(): void;
}

/**
 * ArtifactCardUIインターフェース
 */
interface ArtifactCardUI {
  artifact: Artifact;
  container: Phaser.GameObjects.Container;
  destroy(): void;
}

/**
 * GameEventType定義
 */
const GameEventType = {
  TEST_STARTED: 'TEST_STARTED',
  TEST_DECLINED: 'TEST_DECLINED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  TEST_CLEARED: 'TEST_CLEARED',
  TEST_FAILED: 'TEST_FAILED',
  ARTIFACT_SELECTED: 'ARTIFACT_SELECTED',
  RANK_UP_COMPLETED: 'RANK_UP_COMPLETED',
} as const;

/**
 * BaseComponentクラス（簡易実装）
 * UIコンポーネントの基底クラス
 */
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
  }

  public abstract create(): void;
  public abstract destroy(): void;

  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  public setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  public setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }
}

/**
 * RankUpSceneコンポーネント
 *
 * 昇格試験画面のUIを管理するコンポーネント。
 * 試験内容表示、試験開始、進捗管理、報酬選択を行う。
 */
export class RankUpScene extends BaseComponent {
  /** EventBus参照 */
  private eventBus: IEventBus | null = null;

  /** RankService参照 */
  private rankService: IRankService | null = null;

  /** 現在の試験 */
  private currentTest: RankTest | null = null;

  /** 試験状態 */
  private testState: TestState = 'NotStarted';

  /** タイトルテキスト */
  private titleText: Phaser.GameObjects.Text | null = null;

  /** ランク表示テキスト */
  private rankDisplayText: Phaser.GameObjects.Text | null = null;

  /** 課題パネル */
  private taskPanel: Phaser.GameObjects.Container | null = null;

  /** 試験開始ボタン */
  private startButton: Button | null = null;

  /** 辞退ボタン */
  private declineButton: Button | null = null;

  /** 報酬パネル */
  private rewardPanel: Phaser.GameObjects.Container | null = null;

  /** アーティファクトカードリスト */
  private artifactCards: ArtifactCardUI[] = [];

  /** キーボードリスナー関数 */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  /** TASK_COMPLETEDイベントハンドラ */
  private taskCompletedHandler: ((payload?: unknown) => void) | null = null;

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   */
  constructor(scene: Phaser.Scene) {
    super(scene, UI_LAYOUT.COMPONENT_X, UI_LAYOUT.COMPONENT_Y);

    this.initializeServices();
    this.create();
  }

  /**
   * サービスを初期化
   */
  private initializeServices(): void {
    this.eventBus = this.scene.data.get('eventBus');
    if (!this.eventBus) {
      console.warn(ERROR_MESSAGES.EVENT_BUS_NOT_AVAILABLE);
    }

    this.rankService = this.scene.data.get('rankService');
    if (!this.rankService) {
      console.warn(ERROR_MESSAGES.RANK_SERVICE_NOT_AVAILABLE);
    }
  }

  /**
   * UIコンポーネント初期化
   */
  public create(): void {
    // 現在の試験を取得
    if (this.rankService) {
      this.currentTest = this.rankService.getCurrentTest();
    }

    if (!this.currentTest) {
      console.error(ERROR_MESSAGES.TEST_NOT_AVAILABLE);
      return;
    }

    this.testState = this.currentTest.state;

    // タイトルを作成
    this.createTitle();

    // ランク表示を作成
    this.createRankDisplay();

    // 状態に応じた画面を作成
    switch (this.testState) {
      case 'NotStarted':
        this.createTestStartScreen();
        break;
      case 'InProgress':
        this.createTestProgressScreen();
        break;
      case 'Completed':
        this.createTestClearScreen();
        break;
      case 'Failed':
        this.createTestFailedScreen();
        break;
    }

    // キーボードリスナーを登録
    this.setupKeyboardListener();

    // イベント購読
    this.subscribeToEvents();
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    this.titleText = this.scene.add.text(
      UI_LAYOUT.TITLE_X,
      UI_LAYOUT.TITLE_Y,
      UI_TEXT.PHASE_TITLE,
      UI_STYLES.TITLE,
    );
    this.titleText.setOrigin(0.5);
    if (this.container) {
      this.container.add(this.titleText);
    }
  }

  /**
   * ランク表示を作成
   */
  private createRankDisplay(): void {
    if (!this.currentTest) {
      return;
    }

    const rankText = UI_TEXT.RANK_UP_FORMAT.replace(
      '{fromRank}',
      this.currentTest.fromRank,
    ).replace('{toRank}', this.currentTest.toRank);

    this.rankDisplayText = this.scene.add.text(
      UI_LAYOUT.TITLE_X,
      UI_LAYOUT.TITLE_Y + 40,
      rankText,
      UI_STYLES.RANK_DISPLAY,
    );
    this.rankDisplayText.setOrigin(0.5);
    if (this.container) {
      this.container.add(this.rankDisplayText);
    }
  }

  /**
   * 試験開始画面を作成
   */
  private createTestStartScreen(): void {
    if (!this.currentTest) {
      return;
    }

    // 課題パネルを作成
    this.createTaskPanel();

    // ボタンを作成
    this.createActionButtons();
  }

  /**
   * 課題パネルを作成
   */
  private createTaskPanel(): void {
    if (!this.currentTest) {
      return;
    }

    this.taskPanel = this.scene.add.container(UI_LAYOUT.TASK_PANEL_X, UI_LAYOUT.TASK_PANEL_Y);

    // パネル背景
    const panelBg = this.scene.add.rectangle(0, 0, 500, 150, 0x333333, 0.9);
    panelBg.setStrokeStyle(2, 0x666666);
    this.taskPanel.add(panelBg);

    // 課題タイトル
    const taskTitle = this.scene.add.text(
      -230,
      -60,
      UI_TEXT.TEST_CONTENT_TITLE,
      UI_STYLES.TASK_TITLE,
    );
    this.taskPanel.add(taskTitle);

    // 課題リスト
    this.currentTest.tasks.forEach((task, index) => {
      const taskText = this.createTaskText(task, index);
      if (this.taskPanel) {
        this.taskPanel.add(taskText);
      }
    });

    // 期限表示
    const timeLimitText = UI_TEXT.TIME_LIMIT_FORMAT.replace(
      '{days}',
      this.currentTest.timeLimitDays.toString(),
    );
    const limitDisplay = this.scene.add.text(-230, 40, timeLimitText, UI_STYLES.TASK_ITEM);
    this.taskPanel.add(limitDisplay);

    if (this.container) {
      this.container.add(this.taskPanel);
    }
  }

  /**
   * 課題テキストを作成
   * @param task - 課題情報
   * @param index - インデックス
   * @returns テキストオブジェクト
   */
  private createTaskText(task: RankTestTask, index: number): Phaser.GameObjects.Text {
    const icon = task.isCompleted ? UI_TEXT.TASK_COMPLETED : UI_TEXT.TASK_PENDING;
    const style = task.isCompleted ? UI_STYLES.TASK_COMPLETED : UI_STYLES.TASK_ITEM;
    const text = `${icon} ${task.description}`;

    return this.scene.add.text(-230, -30 + index * 25, text, style);
  }

  /**
   * アクションボタンを作成
   */
  private createActionButtons(): void {
    // 試験開始ボタン
    this.createStartButton();

    // 辞退ボタン
    this.createDeclineButton();
  }

  /**
   * 試験開始ボタンを作成
   */
  private createStartButton(): void {
    const buttonX = UI_LAYOUT.BUTTONS_X - 70;
    const buttonY = UI_LAYOUT.BUTTONS_Y;

    const buttonRect = this.scene.add.rectangle(buttonX, buttonY, 150, 50, 0xff9800);
    buttonRect.setInteractive({ useHandCursor: true });
    buttonRect.on('pointerdown', () => this.onStartTest());

    const buttonText = this.scene.add.text(
      buttonX,
      buttonY,
      UI_TEXT.START_TEST_BUTTON,
      UI_STYLES.BUTTON_TEXT,
    );
    buttonText.setOrigin(0.5);

    if (this.container) {
      this.container.add([buttonRect, buttonText]);
    }

    this.startButton = {
      isEnabled: () => true,
      setEnabled: (enabled: boolean) => {
        buttonRect.setAlpha(enabled ? 1 : 0.5);
        buttonRect.setInteractive(enabled);
      },
      destroy: () => {
        buttonRect.destroy();
        buttonText.destroy();
      },
    };
  }

  /**
   * 辞退ボタンを作成
   */
  private createDeclineButton(): void {
    const buttonX = UI_LAYOUT.BUTTONS_X + 90;
    const buttonY = UI_LAYOUT.BUTTONS_Y;

    const buttonRect = this.scene.add.rectangle(buttonX, buttonY, 150, 50, 0x666666);
    buttonRect.setInteractive({ useHandCursor: true });
    buttonRect.on('pointerdown', () => this.onDeclineTest());

    const buttonText = this.scene.add.text(
      buttonX,
      buttonY,
      UI_TEXT.DECLINE_TEST_BUTTON,
      UI_STYLES.BUTTON_TEXT,
    );
    buttonText.setOrigin(0.5);

    if (this.container) {
      this.container.add([buttonRect, buttonText]);
    }

    this.declineButton = {
      isEnabled: () => true,
      setEnabled: () => {},
      destroy: () => {
        buttonRect.destroy();
        buttonText.destroy();
      },
    };
  }

  /**
   * 試験進行中画面を作成
   */
  private createTestProgressScreen(): void {
    if (!this.currentTest) {
      return;
    }

    // 進行中インジケーター
    const progressText = `${UI_TEXT.TEST_IN_PROGRESS} ${this.currentTest.fromRank}→${this.currentTest.toRank}ランク  ${UI_TEXT.REMAINING_DAYS_FORMAT.replace('{days}', this.currentTest.remainingDays.toString())}`;
    const indicator = this.scene.add.text(
      UI_LAYOUT.TITLE_X,
      UI_LAYOUT.TITLE_Y - 30,
      progressText,
      UI_STYLES.TASK_TITLE,
    );
    indicator.setOrigin(0.5);
    if (this.container) {
      this.container.add(indicator);
    }

    // 課題パネルを作成
    this.createTaskPanel();
  }

  /**
   * 試験クリア画面を作成
   */
  private createTestClearScreen(): void {
    if (!this.currentTest || !this.rankService) {
      return;
    }

    // クリアタイトル
    if (this.titleText) {
      this.titleText.setText(UI_TEXT.TEST_CLEAR_TITLE);
    }

    // 報酬を取得
    const reward = this.rankService.completeTest();

    // 報酬パネルを作成
    this.createRewardPanel(reward);

    // TEST_CLEAREDイベントを発行
    this.emitEvent(GameEventType.TEST_CLEARED, {
      testId: this.currentTest.testId,
      toRank: this.currentTest.toRank,
    });
  }

  /**
   * 報酬パネルを作成
   * @param reward - 報酬情報
   */
  private createRewardPanel(reward: RankUpReward): void {
    this.rewardPanel = this.scene.add.container(UI_LAYOUT.REWARD_X, UI_LAYOUT.REWARD_Y);

    // ボーナスゴールド表示
    const bonusText = UI_TEXT.REWARD_BONUS_FORMAT.replace('{gold}', reward.bonusGold.toString());
    const bonusDisplay = this.scene.add.text(0, 0, bonusText, UI_STYLES.REWARD_TEXT);
    bonusDisplay.setOrigin(0.5);
    this.rewardPanel.add(bonusDisplay);

    // アーティファクト選択タイトル
    const selectTitle = this.scene.add.text(
      0,
      40,
      UI_TEXT.REWARD_SELECT_TITLE,
      UI_STYLES.TASK_TITLE,
    );
    selectTitle.setOrigin(0.5);
    this.rewardPanel.add(selectTitle);

    // アーティファクトカードを作成
    reward.artifacts.forEach((artifact, index) => {
      const cardX = (index - 1) * 150;
      const cardY = 120;
      const cardUI = this.createArtifactCard(artifact, cardX, cardY);
      this.artifactCards.push(cardUI);
      if (this.rewardPanel) {
        this.rewardPanel.add(cardUI.container);
      }
    });

    if (this.container) {
      this.container.add(this.rewardPanel);
    }
  }

  /**
   * アーティファクトカードを作成
   * @param artifact - アーティファクト情報
   * @param x - X座標
   * @param y - Y座標
   * @returns アーティファクトカードUI
   */
  private createArtifactCard(artifact: Artifact, x: number, y: number): ArtifactCardUI {
    const cardContainer = this.scene.add.container(x, y);

    // カード背景
    const cardBg = this.scene.add.rectangle(0, 0, 130, 180, 0x444444, 0.9);
    cardBg.setStrokeStyle(2, 0xcccccc);
    cardContainer.add(cardBg);

    // レアリティ表示
    const rarityText = this.scene.add.text(0, -75, `★ ${artifact.rarity}`, UI_STYLES.ARTIFACT_NAME);
    rarityText.setOrigin(0.5);
    cardContainer.add(rarityText);

    // 名前
    const nameText = this.scene.add.text(0, -50, artifact.name, UI_STYLES.ARTIFACT_NAME);
    nameText.setOrigin(0.5);
    nameText.setWordWrapWidth(110);
    cardContainer.add(nameText);

    // 効果
    const effectText = this.scene.add.text(0, -10, artifact.effect, UI_STYLES.ARTIFACT_EFFECT);
    effectText.setOrigin(0.5);
    effectText.setWordWrapWidth(110);
    cardContainer.add(effectText);

    // 選択ボタン
    const selectButton = this.scene.add.rectangle(0, 60, 100, 30, 0xff9800);
    selectButton.setInteractive({ useHandCursor: true });
    selectButton.on('pointerdown', () => this.onSelectArtifact(artifact));
    cardContainer.add(selectButton);

    const selectText = this.scene.add.text(
      0,
      60,
      UI_TEXT.SELECT_ARTIFACT_BUTTON,
      UI_STYLES.BUTTON_TEXT,
    );
    selectText.setOrigin(0.5);
    cardContainer.add(selectText);

    // ホバーエフェクト
    cardBg.setInteractive({ useHandCursor: true });
    cardBg.on('pointerover', () => cardBg.setStrokeStyle(2, 0xffd700));
    cardBg.on('pointerout', () => cardBg.setStrokeStyle(2, 0xcccccc));

    return {
      artifact,
      container: cardContainer,
      destroy: () => cardContainer.destroy(),
    };
  }

  /**
   * 試験失敗画面を作成
   */
  private createTestFailedScreen(): void {
    if (!this.currentTest) {
      return;
    }

    // 失敗タイトル
    if (this.titleText) {
      this.titleText.setText(UI_TEXT.TEST_FAILED_TITLE);
    }

    // ゲームオーバーメッセージ
    const gameOverText = this.scene.add.text(
      UI_LAYOUT.TITLE_X,
      UI_LAYOUT.TITLE_Y + 60,
      UI_TEXT.GAME_OVER,
      UI_STYLES.RANK_DISPLAY,
    );
    gameOverText.setOrigin(0.5);
    if (this.container) {
      this.container.add(gameOverText);
    }

    // タイトルへボタン
    this.createToTitleButton();

    // TEST_FAILEDイベントを発行
    this.emitEvent(GameEventType.TEST_FAILED, {
      testId: this.currentTest.testId,
    });
  }

  /**
   * タイトルへボタンを作成
   */
  private createToTitleButton(): void {
    const buttonX = UI_LAYOUT.BUTTONS_X;
    const buttonY = UI_LAYOUT.BUTTONS_Y;

    const buttonRect = this.scene.add.rectangle(buttonX, buttonY, 150, 50, 0x666666);
    buttonRect.setInteractive({ useHandCursor: true });
    buttonRect.on('pointerdown', () => this.onToTitle());

    const buttonText = this.scene.add.text(
      buttonX,
      buttonY,
      UI_TEXT.TO_TITLE_BUTTON,
      UI_STYLES.BUTTON_TEXT,
    );
    buttonText.setOrigin(0.5);

    if (this.container) {
      this.container.add([buttonRect, buttonText]);
    }
  }

  /**
   * 試験開始処理
   */
  private onStartTest(): void {
    if (!this.currentTest || !this.rankService) {
      return;
    }

    const success = this.rankService.startTest(this.currentTest.testId);

    if (success) {
      this.testState = 'InProgress';

      // TEST_STARTEDイベントを発行
      this.emitEvent(GameEventType.TEST_STARTED, {
        testId: this.currentTest.testId,
        fromRank: this.currentTest.fromRank,
        toRank: this.currentTest.toRank,
      });

      // 画面を更新（実際の実装では画面遷移）
      this.setVisible(false);
    }
  }

  /**
   * 試験辞退処理
   */
  private onDeclineTest(): void {
    if (!this.currentTest) {
      return;
    }

    // TEST_DECLINEDイベントを発行
    this.emitEvent(GameEventType.TEST_DECLINED, {
      testId: this.currentTest.testId,
    });

    // 画面を閉じる
    this.setVisible(false);
  }

  /**
   * アーティファクト選択処理
   * @param artifact - 選択されたアーティファクト
   */
  private onSelectArtifact(artifact: Artifact): void {
    if (!this.rankService || !this.currentTest) {
      return;
    }

    this.rankService.selectArtifact(artifact.id);

    // ARTIFACT_SELECTEDイベントを発行
    this.emitEvent(GameEventType.ARTIFACT_SELECTED, {
      artifactId: artifact.id,
    });

    // RANK_UP_COMPLETEDイベントを発行
    this.emitEvent(GameEventType.RANK_UP_COMPLETED, {
      newRank: this.currentTest.toRank,
      artifact: artifact,
    });

    // 画面を閉じる
    this.setVisible(false);
  }

  /**
   * タイトルへ遷移処理
   */
  private onToTitle(): void {
    // 実際の実装ではタイトル画面へ遷移
    this.setVisible(false);
  }

  /**
   * 進捗を更新
   */
  public updateProgress(): void {
    if (!this.rankService) {
      return;
    }

    this.currentTest = this.rankService.checkProgress();

    if (this.currentTest && this.currentTest.state !== this.testState) {
      this.testState = this.currentTest.state;

      // 画面を再構築
      if (this.container) {
        this.container.removeAll(true);
      }
      this.create();
    }
  }

  /**
   * キーボードリスナーを設定
   */
  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => {
      this.handleKeyboardInput(event);
    };
    if (this.scene?.input?.keyboard) {
      this.scene.input.keyboard.on('keydown', this.keyboardHandler);
    }
  }

  /**
   * イベント購読を設定
   */
  private subscribeToEvents(): void {
    if (this.eventBus) {
      this.taskCompletedHandler = () => {
        this.updateProgress();
      };
      this.eventBus.on(GameEventType.TASK_COMPLETED, this.taskCompletedHandler);
    }
  }

  /**
   * キーボード入力を処理
   * @param event - キーボードイベント
   */
  private handleKeyboardInput(event: { key: string }): void {
    const { key } = event;

    switch (this.testState) {
      case 'NotStarted':
        if (key === KEYBOARD_KEYS.START_TEST) {
          this.onStartTest();
        } else if (key === KEYBOARD_KEYS.DECLINE) {
          this.onDeclineTest();
        }
        break;
      case 'Completed':
        if (key === KEYBOARD_KEYS.SELECT_1 && this.artifactCards[0]) {
          this.onSelectArtifact(this.artifactCards[0].artifact);
        } else if (key === KEYBOARD_KEYS.SELECT_2 && this.artifactCards[1]) {
          this.onSelectArtifact(this.artifactCards[1].artifact);
        } else if (key === KEYBOARD_KEYS.SELECT_3 && this.artifactCards[2]) {
          this.onSelectArtifact(this.artifactCards[2].artifact);
        }
        break;
    }
  }

  /**
   * イベントを安全に発行
   * @param eventType - イベントタイプ
   * @param payload - ペイロード
   */
  private emitEvent(eventType: string, payload: unknown): void {
    if (!this.eventBus) {
      return;
    }

    try {
      this.eventBus.emit(eventType, payload);
    } catch (error) {
      console.error(ERROR_MESSAGES.FAILED_TO_EMIT_EVENT, eventType, error);
    }
  }

  /**
   * アーティファクトカードを全て破棄
   */
  private destroyArtifactCards(): void {
    for (const card of this.artifactCards) {
      card?.destroy?.();
    }
    this.artifactCards = [];
  }

  /**
   * キーボードリスナーを解除
   */
  private removeKeyboardListener(): void {
    if (this.keyboardHandler && this.scene?.input?.keyboard) {
      this.scene.input.keyboard.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * イベント購読を解除
   */
  private unsubscribeFromEvents(): void {
    if (this.eventBus && this.taskCompletedHandler) {
      this.eventBus.off(GameEventType.TASK_COMPLETED, this.taskCompletedHandler);
      this.taskCompletedHandler = null;
    }
  }

  /**
   * リソース解放
   */
  public destroy(): void {
    this.destroyArtifactCards();
    this.removeKeyboardListener();
    this.unsubscribeFromEvents();

    if (this.startButton) {
      this.startButton.destroy();
      this.startButton = null;
    }

    if (this.declineButton) {
      this.declineButton.destroy();
      this.declineButton = null;
    }

    if (this.taskPanel) {
      this.taskPanel.destroy();
      this.taskPanel = null;
    }

    if (this.rewardPanel) {
      this.rewardPanel.destroy();
      this.rewardPanel = null;
    }

    if (this.container) {
      this.container.destroy();
    }
  }
}
