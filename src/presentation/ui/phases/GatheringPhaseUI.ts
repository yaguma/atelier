/**
 * GatheringPhaseUIコンポーネント
 * TASK-0023 採取フェーズUI（ドラフト採取）
 *
 * @description
 * 採取フェーズ全体のUI管理を担当するコンポーネント。
 * ドラフト採取システムのUIを提供し、素材選択、スキップ、終了処理を管理する。
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
  /** ラウンドインジケーターX座標 */
  ROUND_INDICATOR_X: 0,
  /** ラウンドインジケーターY座標 */
  ROUND_INDICATOR_Y: 40,
  /** コスト表示X座標 */
  COST_DISPLAY_X: 200,
  /** コスト表示Y座標 */
  COST_DISPLAY_Y: 40,
  /** タイトルX座標 */
  TITLE_X: 0,
  /** タイトルY座標 */
  TITLE_Y: 0,
} as const;

/** 素材選択関連定数 */
const MATERIAL_SELECTION = {
  /** 最小素材インデックス */
  MIN_INDEX: 0,
  /** 最大素材インデックス */
  MAX_INDEX: 2,
  /** 選択肢の数 */
  OPTIONS_COUNT: 3,
} as const;

/** エラーメッセージ定数 */
const ERROR_MESSAGES = {
  EVENT_BUS_NOT_AVAILABLE: 'EventBus is not available in scene.data',
  GATHERING_SERVICE_NOT_AVAILABLE: 'GatheringService is not available',
  FAILED_TO_EMIT_EVENT: 'Failed to emit event:',
  INVALID_MATERIAL_INDEX: 'Invalid material index:',
} as const;

/** UIテキスト定数 */
const UI_TEXT = {
  PHASE_TITLE: '🌿 採取フェーズ',
  ROUND_INDICATOR_DEFAULT: 'ラウンド -/-',
  NO_MATERIALS_SELECTED: '獲得素材なし',
} as const;

/** スタイル定数 */
const UI_STYLES = {
  TITLE: {
    fontSize: '24px',
    color: '#ffffff',
  },
  ROUND_INDICATOR: {
    fontSize: '18px',
    color: '#cccccc',
  },
} as const;

/** キーボードショートカット定数 */
const KEYBOARD_KEYS = {
  /** 素材選択キー（1-3） */
  MATERIAL_SELECT_1: '1',
  MATERIAL_SELECT_2: '2',
  MATERIAL_SELECT_3: '3',
  /** スキップキー */
  SKIP_UPPER: 'S',
  SKIP_LOWER: 's',
  SKIP_NUMBER: '0',
  /** 終了キー */
  END_UPPER: 'E',
  END_LOWER: 'e',
  /** キャンセルキー */
  CANCEL: 'Escape',
  /** 確定キー */
  CONFIRM: 'Enter',
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
 * 警告レベルタイプ
 */
type WarningLevel = 'none' | 'warning' | 'danger';

/**
 * MaterialOptionインターフェース
 */
interface MaterialOption {
  materialId: string;
  name: string;
  icon: string;
  quality: Quality;
  isRare: boolean;
}

/**
 * MaterialInstanceインターフェース
 */
interface MaterialInstance {
  instanceId: string;
  materialId: string;
  name: string;
  quality: Quality;
  isRare: boolean;
}

/**
 * GatheringCardインターフェース
 */
interface GatheringCard {
  id: string;
  name: string;
  type: string;
  baseCost: number;
  maxRounds: number;
  rareRate: number;
  materials: string[];
}

/**
 * DraftSessionインターフェース
 */
interface DraftSession {
  sessionId: string;
  card: GatheringCard;
  currentRound: number;
  maxRounds: number;
  selectedMaterials: MaterialInstance[];
  currentOptions: MaterialOption[];
  isComplete: boolean;
}

/**
 * GatheringResultインターフェース
 */
interface GatheringResult {
  locationId: string;
  materials: MaterialInstance[];
  baseCost: number;
  additionalCost: number;
  totalCost: number;
  extraDay: boolean;
}

/**
 * GatheringCostResultインターフェース
 */
interface GatheringCostResult {
  baseCost: number;
  additionalCost: number;
  totalCost: number;
  extraDay: boolean;
  warningLevel: WarningLevel;
}

/**
 * IGatheringServiceインターフェース
 */
interface IGatheringService {
  startDraftGathering(card: GatheringCard, enhancementCards?: unknown[]): DraftSession;
  selectMaterial(sessionId: string, materialIndex: number): MaterialInstance;
  skipSelection(sessionId: string): void;
  endGathering(sessionId: string): GatheringResult;
  getCurrentSession(): DraftSession | null;
  canGather(card: GatheringCard): boolean;
  calculateGatheringCost(baseCost: number, selectedCount: number): GatheringCostResult;
}

/**
 * MaterialCardUIインターフェース
 */
interface MaterialCardUI {
  material: MaterialOption;
  destroy(): void;
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
 * Panelインターフェース
 */
interface Panel {
  isVisible(): boolean;
  setVisible(visible: boolean): void;
  destroy(): void;
}

/**
 * GameEventType定義
 */
const GameEventType = {
  GATHERING_STARTED: 'GATHERING_STARTED',
  MATERIAL_PRESENTED: 'MATERIAL_PRESENTED',
  MATERIAL_SELECTED: 'MATERIAL_SELECTED',
  ROUND_SKIPPED: 'ROUND_SKIPPED',
  GATHERING_COMPLETED: 'GATHERING_COMPLETED',
  GATHERING_CANCELLED: 'GATHERING_CANCELLED',
  ACTION_POINTS_CHANGED: 'ACTION_POINTS_CHANGED',
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
 * GatheringPhaseUIコンポーネント
 *
 * 採取フェーズのUIを管理するコンポーネント。
 * ドラフト採取の表示、素材選択、スキップ、終了処理を行う。
 */
export class GatheringPhaseUI extends BaseComponent {
  /** EventBus参照 */
  private eventBus: IEventBus | null = null;

  /** GatheringService参照 */
  private gatheringService: IGatheringService | null = null;

  /** 現在のセッション */
  private currentSession: DraftSession | null = null;

  /** 素材カードリスト */
  private materialCards: MaterialCardUI[] = [];

  /** ラウンドインジケーター */
  private roundIndicator: Phaser.GameObjects.Text | null = null;

  /** コスト表示パネル */
  private costDisplay: Phaser.GameObjects.Container | null = null;

  /** 現在の状態 */
  private currentState: string = 'Idle';

  /** 現在の行動ポイント */
  private currentActionPoints = 10;

  /** 開始ボタン */
  private startButton: Button | null = null;

  /** 採取地詳細パネル */
  private locationDetailPanel: Panel | null = null;

  /** 結果パネル */
  private resultPanel: Panel | null = null;

  /** 現在表示中のカード */
  private currentCard: GatheringCard | null = null;

  /** キーボードリスナー関数 */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  /** ACTION_POINTS_CHANGEDイベントハンドラ */
  private actionPointsHandler: ((payload?: unknown) => void) | null = null;

  /**
   * コンストラクタ
   * @param scene - Phaserシーンインスタンス
   */
  constructor(scene: Phaser.Scene) {
    super(scene, UI_LAYOUT.COMPONENT_X, UI_LAYOUT.COMPONENT_Y);

    this.initializeEventBus();
    this.create();
  }

  /**
   * EventBusを初期化
   */
  private initializeEventBus(): void {
    this.eventBus = this.scene.data.get('eventBus');
    if (!this.eventBus) {
      console.warn(ERROR_MESSAGES.EVENT_BUS_NOT_AVAILABLE);
    }
  }

  /**
   * UIコンポーネント初期化
   */
  public create(): void {
    // タイトルを作成
    this.createTitle();

    // ラウンドインジケーターを作成
    this.createRoundIndicator();

    // コスト表示パネルを作成
    this.createCostDisplay();

    // 採取地詳細パネルを作成
    this.createLocationDetailPanel();

    // 結果パネルを作成
    this.createResultPanel();

    // キーボードリスナーを登録
    this.setupKeyboardListener();

    // ACTION_POINTS_CHANGEDイベントを購読
    this.subscribeToEvents();
  }

  /**
   * タイトルを作成
   */
  private createTitle(): void {
    this.scene.add.text(
      UI_LAYOUT.TITLE_X,
      UI_LAYOUT.TITLE_Y,
      UI_TEXT.PHASE_TITLE,
      UI_STYLES.TITLE,
    );
  }

  /**
   * ラウンドインジケーターを作成
   */
  private createRoundIndicator(): void {
    this.roundIndicator = this.scene.add.text(
      UI_LAYOUT.ROUND_INDICATOR_X,
      UI_LAYOUT.ROUND_INDICATOR_Y,
      UI_TEXT.ROUND_INDICATOR_DEFAULT,
      UI_STYLES.ROUND_INDICATOR,
    );
    this.container.add(this.roundIndicator);
  }

  /**
   * コスト表示パネルを作成
   */
  private createCostDisplay(): void {
    this.costDisplay = this.scene.add.container(
      UI_LAYOUT.COST_DISPLAY_X,
      UI_LAYOUT.COST_DISPLAY_Y,
    );
    this.container.add(this.costDisplay);
  }

  /**
   * 汎用パネルを作成
   * @returns 作成されたパネル
   */
  private createPanel(): Panel {
    const panelState = { _visible: false };
    return {
      isVisible: () => panelState._visible,
      setVisible: (visible: boolean) => {
        panelState._visible = visible;
      },
      destroy: () => {},
    } as Panel;
  }

  /**
   * 採取地詳細パネルを作成
   */
  private createLocationDetailPanel(): void {
    this.locationDetailPanel = this.createPanel();
  }

  /**
   * 結果パネルを作成
   */
  private createResultPanel(): void {
    this.resultPanel = this.createPanel();
  }

  /**
   * キーボードリスナーを設定
   */
  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => {
      this.handleKeyboardInput(event);
    };
    this.scene.input.keyboard.on('keydown', this.keyboardHandler);
  }

  /**
   * イベント購読を設定
   */
  private subscribeToEvents(): void {
    if (this.eventBus) {
      this.actionPointsHandler = (payload?: unknown) => {
        if (typeof payload === 'number') {
          this.currentActionPoints = payload;
        }
      };
      this.eventBus.on(GameEventType.ACTION_POINTS_CHANGED, this.actionPointsHandler);
    }
  }

  /**
   * 素材カードを全て破棄
   */
  private destroyMaterialCards(): void {
    for (const card of this.materialCards) {
      card?.destroy?.();
    }
    this.materialCards = [];
  }

  /**
   * キーボードリスナーを解除
   */
  private removeKeyboardListener(): void {
    if (this.keyboardHandler) {
      this.scene.input.keyboard.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * イベント購読を解除
   */
  private unsubscribeFromEvents(): void {
    if (this.eventBus && this.actionPointsHandler) {
      this.eventBus.off(GameEventType.ACTION_POINTS_CHANGED, this.actionPointsHandler);
      this.actionPointsHandler = null;
    }
  }

  /**
   * リソース解放
   */
  public destroy(): void {
    this.destroyMaterialCards();
    this.removeKeyboardListener();
    this.unsubscribeFromEvents();

    if (this.container) {
      this.container.destroy();
    }
  }

  /**
   * GatheringServiceの存在を検証
   * @returns GatheringServiceが利用可能な場合true
   */
  private validateGatheringService(): boolean {
    if (!this.gatheringService) {
      console.error(ERROR_MESSAGES.GATHERING_SERVICE_NOT_AVAILABLE);
      return false;
    }
    return true;
  }

  /**
   * 採取セッションを開始
   * @param card - 採取地カード
   * @param enhancementCards - 強化カード（任意）
   */
  public startGathering(card: GatheringCard, enhancementCards?: unknown[]): void {
    if (!this.validateGatheringService()) {
      return;
    }

    this.currentSession = this.gatheringService.startDraftGathering(card, enhancementCards);
    this.currentCard = card;
    this.currentState = 'MaterialSelect';

    // GATHERING_STARTEDイベントを発行
    this.emitEvent(GameEventType.GATHERING_STARTED, {
      locationId: card.id,
      presentationCount: this.currentSession.maxRounds,
    });

    // 素材カードを作成
    this.createMaterialCards(this.currentSession.currentOptions);

    // ラウンドインジケーターを更新
    this.updateRoundIndicator();
  }

  /**
   * 素材カードを作成
   * @param options - 素材選択肢
   */
  private createMaterialCards(options: MaterialOption[]): void {
    this.destroyMaterialCards();

    this.materialCards = options.map((option) => ({
      material: option,
      destroy: () => {},
    }));
  }

  /**
   * ラウンドインジケーターを更新
   */
  private updateRoundIndicator(): void {
    if (this.roundIndicator && this.currentSession) {
      const text = `ラウンド ${this.currentSession.currentRound}/${this.currentSession.maxRounds}`;
      this.roundIndicator.setText(text);
    }
  }

  /**
   * 採取地詳細を表示
   * @param card - 採取地カード
   */
  public showLocationDetail(card: GatheringCard): void {
    this.currentCard = card;

    // 採取地詳細パネルを表示
    if (this.locationDetailPanel) {
      this.locationDetailPanel.setVisible(true);
    }

    // 開始ボタンを作成・設定
    const canStart = this.currentActionPoints >= card.baseCost;
    this.startButton = {
      isEnabled: () => canStart,
      setEnabled: () => {},
      destroy: () => {},
    };
  }

  /**
   * 素材インデックスが有効か検証
   * @param index - 検証するインデックス
   * @returns 有効な場合true
   */
  private isValidMaterialIndex(index: number): boolean {
    return index >= MATERIAL_SELECTION.MIN_INDEX && index <= MATERIAL_SELECTION.MAX_INDEX;
  }

  /**
   * 素材選択処理
   * @param index - 素材インデックス（0, 1, 2）
   */
  private onMaterialSelected(index: number): void {
    if (!this.currentSession) {
      return;
    }

    if (!this.isValidMaterialIndex(index)) {
      throw new Error(`${ERROR_MESSAGES.INVALID_MATERIAL_INDEX} ${index}`);
    }

    if (!this.validateGatheringService()) {
      return;
    }

    // 素材を選択
    const material = this.gatheringService.selectMaterial(this.currentSession.sessionId, index);

    // MATERIAL_SELECTEDイベントを発行
    this.emitEvent(GameEventType.MATERIAL_SELECTED, {
      round: this.currentSession.currentRound,
      materialId: material.materialId,
    });

    // UIを更新
    this.updateSelectedMaterialsDisplay();
    this.updateCostDisplay(this.currentSession.selectedMaterials.length);

    // 素材カードを再作成（次ラウンドの選択肢）
    if (this.currentSession.currentOptions) {
      this.createMaterialCards(this.currentSession.currentOptions);
    }

    // ラウンドインジケーターを更新
    this.updateRoundIndicator();

    // 完了チェック
    if (this.currentSession.isComplete) {
      this.finalizeGathering();
    }
  }

  /**
   * ラウンドスキップ処理
   */
  private onSkipRound(): void {
    if (!this.currentSession) {
      return;
    }

    if (!this.validateGatheringService()) {
      return;
    }

    const currentRound = this.currentSession.currentRound;

    // スキップを実行
    this.gatheringService.skipSelection(this.currentSession.sessionId);

    // ROUND_SKIPPEDイベントを発行
    this.emitEvent(GameEventType.ROUND_SKIPPED, {
      round: currentRound,
    });

    // 素材カードを再作成（次ラウンドの選択肢）
    if (this.currentSession.currentOptions) {
      this.createMaterialCards(this.currentSession.currentOptions);
    }

    // ラウンドインジケーターを更新
    this.updateRoundIndicator();

    // 完了チェック
    if (this.currentSession.isComplete) {
      this.finalizeGathering();
    }
  }

  /**
   * 採取終了処理
   * @returns 採取結果
   */
  private onEndGathering(): GatheringResult {
    // GatheringServiceの確認
    if (!this.gatheringService || !this.currentSession) {
      return {
        locationId: this.currentCard?.id ?? '',
        materials: [],
        baseCost: this.currentCard?.baseCost ?? 0,
        additionalCost: 0,
        totalCost: this.currentCard?.baseCost ?? 0,
        extraDay: false,
      };
    }

    // コスト計算
    const selectedCount = this.currentSession.selectedMaterials.length;
    this.gatheringService.calculateGatheringCost(
      this.currentCard?.baseCost ?? 0,
      selectedCount,
    );

    // 採取終了
    const result = this.gatheringService.endGathering(this.currentSession.sessionId);

    // GATHERING_COMPLETEDイベントを発行
    this.emitEvent(GameEventType.GATHERING_COMPLETED, {
      locationId: result.locationId,
      materials: result.materials,
      totalCost: result.totalCost,
      extraDay: result.extraDay,
    });

    // 状態更新
    this.currentState = 'SessionEnd';

    // 結果パネルを表示
    if (this.resultPanel) {
      this.resultPanel.setVisible(true);
    }

    return result;
  }

  /**
   * 採取を完了する（内部処理）
   */
  private finalizeGathering(): void {
    this.onEndGathering();
  }

  /**
   * 獲得済み素材リストを更新
   * @remarks 将来的に獲得素材の表示UIを実装
   */
  private updateSelectedMaterialsDisplay(): void {
    // 将来の実装: 獲得素材リストのUI更新
  }

  /**
   * 獲得済み素材の表示テキストを取得
   * @returns 表示テキスト
   */
  private getSelectedMaterialsDisplayText(): string {
    if (!this.currentSession) {
      return '';
    }

    const materials = this.currentSession.selectedMaterials;
    if (materials.length === 0) {
      return UI_TEXT.NO_MATERIALS_SELECTED;
    }

    return materials.map((m) => `${m.name}(${m.quality})`).join(', ');
  }

  /**
   * コスト表示を更新
   * @param _selectedCount - 選択済み素材数（将来の拡張用）
   * @remarks 将来的にコスト表示のスタイル更新を実装
   */
  private updateCostDisplay(_selectedCount: number): void {
    if (!this.costDisplay || !this.currentCard) {
      return;
    }

    // 将来の実装: 警告レベルに応じたスタイル更新
    this.calculateCurrentCost();
  }

  /**
   * 現在のコストを計算
   * @returns コスト計算結果
   */
  private calculateCurrentCost(): GatheringCostResult {
    if (!this.gatheringService || !this.currentSession || !this.currentCard) {
      return {
        baseCost: 0,
        additionalCost: 0,
        totalCost: 0,
        extraDay: false,
        warningLevel: 'none',
      };
    }

    const selectedCount = this.currentSession.selectedMaterials.length;
    return this.gatheringService.calculateGatheringCost(
      this.currentCard.baseCost,
      selectedCount,
    );
  }

  /**
   * キーボード入力を処理
   * @param event - キーボードイベント
   */
  private handleKeyboardInput(event: { key: string }): void {
    const { key } = event;

    if (this.handleLocationDetailInput(key)) {
      return;
    }

    this.handleSessionInput(key);
  }

  /**
   * 採取地詳細表示中のキー入力を処理
   * @param key - 押されたキー
   * @returns 入力が処理された場合true
   */
  private handleLocationDetailInput(key: string): boolean {
    if (!this.locationDetailPanel?.isVisible() || this.currentSession) {
      return false;
    }

    if (key === KEYBOARD_KEYS.CONFIRM && this.currentCard) {
      this.startGathering(this.currentCard);
      return true;
    }

    return false;
  }

  /**
   * セッション中のキー入力を処理
   * @param key - 押されたキー
   */
  private handleSessionInput(key: string): void {
    if (!this.currentSession) {
      return;
    }

    switch (key) {
      case KEYBOARD_KEYS.MATERIAL_SELECT_1:
        this.onMaterialSelected(0);
        break;
      case KEYBOARD_KEYS.MATERIAL_SELECT_2:
        this.onMaterialSelected(1);
        break;
      case KEYBOARD_KEYS.MATERIAL_SELECT_3:
        this.onMaterialSelected(2);
        break;
      case KEYBOARD_KEYS.SKIP_UPPER:
      case KEYBOARD_KEYS.SKIP_LOWER:
      case KEYBOARD_KEYS.SKIP_NUMBER:
        this.onSkipRound();
        break;
      case KEYBOARD_KEYS.END_UPPER:
      case KEYBOARD_KEYS.END_LOWER:
        this.onEndGathering();
        break;
      case KEYBOARD_KEYS.CANCEL:
        this.handleCancelInput();
        break;
    }
  }

  /**
   * キャンセル入力を処理
   */
  private handleCancelInput(): void {
    if (!this.currentSession) {
      return;
    }

    if (this.currentSession.selectedMaterials.length === 0) {
      this.emitEvent(GameEventType.GATHERING_CANCELLED, {
        sessionId: this.currentSession.sessionId,
      });
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
   * 採取地詳細テキストを取得
   * @returns 詳細テキスト
   */
  private getLocationDetailText(): string {
    if (!this.currentCard) {
      return '';
    }

    return `${this.currentCard.name}\n基本コスト: ${this.currentCard.baseCost}\n提示回数: ${this.currentCard.maxRounds}`;
  }

  /**
   * 結果表示テキストを取得
   * @returns 結果テキスト
   */
  private getResultDisplayText(): string {
    const materialsText = this.getSelectedMaterialsDisplayText();
    const costResult = this.calculateCurrentCost();

    return `獲得素材: ${materialsText}\nコスト: ${costResult.totalCost}`;
  }
}
