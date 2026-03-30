/**
 * QuestAcceptPhaseUIコンポーネント
 * TASK-0022 依頼受注フェーズUI
 * TASK-0043 依頼詳細モーダル・受注アニメーション
 * TASK-0054 テーマ定数統一（カラー・アニメーション）
 *
 * @description
 * 依頼受注フェーズ全体のUI管理を担当するコンポーネント。
 * タイトル、依頼リスト、受注済みリストを表示する。
 *
 * @example
 * ```typescript
 * const phaseUI = new QuestAcceptPhaseUI(scene);
 * phaseUI.updateQuests(questList);
 * ```
 */

import { Quest } from '@domain/entities/Quest';
import { ScrollableContainer } from '@shared/components/ScrollableContainer';
import { MAIN_LAYOUT } from '@shared/constants';
import { getSelectionIndexFromKey, isKeyForAction } from '@shared/constants/keybindings';
import { GameEventType } from '@shared/types/events';
import type { IActiveQuest } from '@shared/types/quests';
import type Phaser from 'phaser';
import type { RexScrollablePanel } from '../../types/rexui';
import { BaseComponent } from '../components/BaseComponent';
import { QuestCardUI } from '../components/QuestCardUI';
import { QuestDetailModal } from '../components/QuestDetailModal';

/**
 * テスト用モックScrollablePanel型
 * TASK-0059: rexUI型定義と互換性を持つモック型
 */
interface MockScrollablePanel {
  childOuter: Phaser.GameObjects.Container[];
  destroy: () => void;
}

/**
 * EventBusインターフェース
 *
 * イベント駆動の通信を行うための共通インターフェース。
 * 層間の疎結合を実現するために使用する。
 */
interface IEventBus {
  /** イベントを発行 */
  emit(event: string, payload?: unknown): void;
  /** イベントを購読 */
  on(event: string, callback: (payload?: unknown) => void): void;
  /** イベント購読を解除 */
  off(event: string, callback: (payload?: unknown) => void): void;
  /** イベントを一度だけ購読 */
  once(event: string, callback: (payload?: unknown) => void): void;
}

/**
 * QuestAcceptPhaseUIコンポーネント
 *
 * 依頼受注フェーズのUIを管理するコンポーネント。
 * 日次依頼の表示、受注操作、受注済みリストの管理を行う。
 */
export class QuestAcceptPhaseUI extends BaseComponent {
  /** 依頼カードリスト（表示中のカードを保持） */
  private questCards: QuestCardUI[] = [];

  /**
   * 受注済みリスト（ScrollablePanel）
   * TASK-0059: rexUI型定義を適用（モック互換のユニオン型）
   */
  private acceptedList: RexScrollablePanel | MockScrollablePanel | null = null;

  /** 受注済み依頼のコンテナ（UIコンテナを保持） */
  private acceptedQuestsContainer: Phaser.GameObjects.Container[] = [];

  /** EventBus参照（層間通信用） */
  private eventBus: IEventBus | null = null;

  /** タイトルテキスト（フェーズ名を表示） */
  private titleText!: Phaser.GameObjects.Text;

  /** 現在表示中のモーダル（排他制御用） */
  private currentModal: QuestDetailModal | null = null;

  /** キーボードイベントハンドラ参照（Issue #135） */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  /** 現在の依頼リスト（キーボード選択用） */
  private currentQuests: Quest[] = [];

  /** 現在のフォーカスインデックス（キーボードナビゲーション用） */
  private focusedCardIndex = -1;

  // =============================================================================
  // スクロール関連プロパティ（Issue #355 → Issue #368: ScrollableContainerに統合）
  // =============================================================================

  /** スクロール可能なコンテナ（共通コンポーネント） */
  private scrollableContainer: ScrollableContainer | null = null;

  // =============================================================================
  // 掲示板・訪問依頼管理（TASK-0117）
  // =============================================================================

  /** アクティブなタブ（'board': 掲示板 / 'visitor': 訪問） */
  private _activeTab: 'board' | 'visitor' = 'board';

  /** 掲示板依頼リスト */
  private _boardQuests: Quest[] = [];

  /** 訪問依頼リスト */
  private _visitorQuests: Quest[] = [];

  /** 受注済み依頼数 */
  private _acceptedCount = 0;

  /** 受注上限 */
  private static readonly QUEST_ACCEPT_LIMIT = 3;

  /** アイテム名解決関数（itemId → 日本語名） */
  private itemNameResolver?: (itemId: string) => string;

  // =============================================================================
  // 受注済み依頼表示（Issue #431）
  // =============================================================================

  /** 受注済み依頼カードリスト */
  private acceptedQuestCards: QuestCardUI[] = [];

  /** 最後に受け取った受注済み依頼データ（グリッド再配置用） */
  private lastActiveQuests: IActiveQuest[] = [];

  /** 受注済み依頼セクションタイトル */
  private acceptedSectionTitle: Phaser.GameObjects.Text | null = null;

  /** 受注済み依頼セクション区切り線 */
  private acceptedSectionDivider: Phaser.GameObjects.Rectangle | null = null;

  // =============================================================================
  // レイアウト定数
  // =============================================================================

  /**
   * 【グリッド配置定数】: 依頼カードのグリッド配置を定義
   * 【設計方針】: 定数化により、将来的なデザイン変更時の保守性を向上
   */
  private static readonly GRID_COLUMNS = 3;
  private static readonly GRID_START_X = 200;
  private static readonly GRID_START_Y = 150;
  private static readonly GRID_SPACING_X = 300;
  private static readonly GRID_SPACING_Y = 200;

  /**
   * 【コンポーネント配置定数】: UIコンポーネントの配置位置
   * Issue #116: コンテンツコンテナが既にオフセット済みなので(0, 0)を使用
   */
  private static readonly COMPONENT_X = 0;
  private static readonly COMPONENT_Y = 0;

  /**
   * 【スクロール関連定数】: カードエリアのスクロール設定
   * Issue #355: フッター被り防止のためスクロール機能を追加
   */
  private static readonly CARD_AREA_OFFSET_Y = 60;
  private static readonly SCROLL_SPEED = 0.5;
  private static readonly CARD_HEIGHT = 180;
  private static readonly ACCEPTED_SECTION_MARGIN = 30;

  /**
   * 【タイトルスタイル定数】: タイトルテキストのスタイル
   */
  private static readonly TITLE_FONT_SIZE = '24px';
  private static readonly TITLE_COLOR = '#000000';
  private static readonly TITLE_TEXT = '📋 本日の依頼';

  /**
   * 【受注済みセクション定数】: 受注済み依頼の表示レイアウト（Issue #431）
   */
  private static readonly ACCEPTED_SECTION_TITLE = '📌 受注済み依頼';
  private static readonly ACCEPTED_SECTION_FONT_SIZE = '20px';
  private static readonly ACCEPTED_SECTION_COLOR = '#333333';
  private static readonly ACCEPTED_CARD_START_X = 200;
  private static readonly ACCEPTED_CARD_SPACING_X = 300;

  /**
   * 【コンストラクタ】: 依頼受注フェーズUIを初期化
   *
   * 【設計意図】:
   * - コンポーネントの配置位置を定数で管理
   * - EventBusの取得とバリデーション
   * - UIコンポーネントの初期化
   *
   * @param scene - Phaserシーンインスタンス
   * @param options - オプション設定
   */
  constructor(
    scene: Phaser.Scene,
    options?: {
      itemNameResolver?: (itemId: string) => string;
    },
  ) {
    // Issue #137: 親コンテナに追加されるため、シーンには直接追加しない
    super(scene, QuestAcceptPhaseUI.COMPONENT_X, QuestAcceptPhaseUI.COMPONENT_Y, {
      addToScene: false,
    });

    // Issue #424: アイテム名解決関数を保持
    this.itemNameResolver = options?.itemNameResolver;

    // 【EventBusの取得】: シーンデータからEventBusを取得
    this.initializeEventBus();

    // 【UIコンポーネント初期化】: タイトル、依頼リスト、受注済みリストを作成
    this.create();
  }

  /**
   * 【EventBus初期化】: シーンデータからEventBusを取得
   *
   * 【設計意図】:
   * - EventBusが存在しない場合でも動作を継続
   * - 警告ログで問題を可視化
   */
  private initializeEventBus(): void {
    this.eventBus = this.scene.data.get('eventBus');
    if (!this.eventBus) {
      console.warn('EventBus is not available in scene.data');
    }
  }

  /**
   * 【UIコンポーネント初期化】: タイトル、依頼リスト、受注済みリストを作成
   *
   * 【BaseComponentの抽象メソッド実装】: create()メソッドを実装
   */
  public create(): void {
    this.createTitle();
    this.createCardScrollArea();
    this.createQuestList();
    this.createAcceptedList();
    this.setupKeyboardListener();
  }

  /**
   * 【タイトル表示作成】: フェーズ名を表示
   *
   * 【設計意図】:
   * - 現在のフェーズを明示し、プレイヤーの状況認識を向上
   * - 定数化されたスタイルで統一感を保つ
   */
  private createTitle(): void {
    this.titleText = this.scene.add.text(440, 20, QuestAcceptPhaseUI.TITLE_TEXT, {
      fontSize: QuestAcceptPhaseUI.TITLE_FONT_SIZE,
      color: QuestAcceptPhaseUI.TITLE_COLOR,
      fontStyle: 'bold',
    });
    this.titleText.setOrigin(0.5, 0);
    this.container.add(this.titleText);
  }

  /**
   * 【依頼リスト作成】: 依頼カードのリストを作成
   *
   * 【設計意図】:
   * - 依頼リストは updateQuests() で動的に作成されるため、ここでは何もしない
   * - 将来的な初期化処理のためのプレースホルダー
   */
  private createQuestList(): void {
    // 依頼リストは updateQuests() で動的に作成されるため、ここでは何もしない
  }

  /**
   * 【受注済みリスト作成】: 受注済み依頼を表示するScrollablePanelを作成
   *
   * 【設計意図】:
   * - テスト環境ではrexUIが動作しないため、シンプルなコンテナとして実装
   * - エラーが発生してもacceptedListを初期化し、アプリケーションを停止させない
   * - destroy()メソッドで全てのコンテナを破棄しメモリリークを防止
   */
  private createAcceptedList(): void {
    try {
      this.acceptedList = this.createAcceptedListMock();
    } catch (error) {
      // 【エラーハンドリング】: エラーが発生してもacceptedListを初期化
      console.error('Failed to create accepted list:', error);
      this.acceptedList = this.createFallbackAcceptedList();
    }
  }

  /**
   * 【受注済みリストモック作成】: テスト環境用のモックオブジェクトを作成
   *
   * @returns 受注済みリストのモックオブジェクト
   */
  private createAcceptedListMock(): {
    childOuter: Phaser.GameObjects.Container[];
    destroy: () => void;
  } {
    return {
      childOuter: this.acceptedQuestsContainer,
      destroy: () => this.destroyAcceptedQuestsContainers(),
    };
  }

  /**
   * 【フォールバック受注済みリスト作成】: エラー時の最小限の実装
   *
   * @returns 最小限のdestroy機能を持つオブジェクト
   */
  private createFallbackAcceptedList(): {
    childOuter: Phaser.GameObjects.Container[];
    destroy: () => void;
  } {
    return {
      childOuter: this.acceptedQuestsContainer,
      destroy: () => {},
    };
  }

  /**
   * 【受注済みコンテナ破棄】: 受注済み依頼のコンテナを全て破棄
   *
   * 【メモリリーク防止】: 各コンテナを個別に破棄
   */
  private destroyAcceptedQuestsContainers(): void {
    for (const container of this.acceptedQuestsContainer) {
      if (container?.destroy) {
        container.destroy();
      }
    }
    this.acceptedQuestsContainer = [];
  }

  /**
   * 【依頼リスト更新】: 依頼カードを新しいリストで置き換える
   *
   * 【設計意図】:
   * - 既存のカードを破棄し、新しいカードを3列グリッド配置で作成
   * - nullチェック、Array.isArray()でバリデーション
   * - メモリリーク防止のため既存のカードを個別に破棄
   *
   * @param quests - 更新する依頼リスト
   */
  public updateQuests(quests: Quest[]): void {
    // 【既存カード破棄】: メモリリーク防止
    this.destroyExistingCards();

    // 【入力検証】: null/undefined/非配列をガード
    if (!quests || !Array.isArray(quests)) {
      this.currentQuests = [];
      return;
    }

    // 【新しいカードを作成】: 3列グリッド配置で依頼カードを配置
    this.createQuestCards(quests);

    // 【キーボード選択用】: 依頼リストを保持
    this.currentQuests = quests;
    this.focusedCardIndex = quests.length > 0 ? 0 : -1;
    this.updateCardFocus();
  }

  /**
   * 【既存カード破棄】: 現在表示中のカードを全て破棄
   *
   * 【メモリリーク防止】: 各カードを個別に破棄
   */
  private destroyExistingCards(): void {
    for (const card of this.questCards) {
      if (card?.destroy) {
        card.destroy();
      }
    }
    this.questCards = [];
  }

  /**
   * 【依頼カード作成】: 依頼リストからカードを作成
   *
   * @param quests - 依頼リスト
   */
  private createQuestCards(quests: Quest[]): void {
    // Issue #355: スクロール位置をリセット
    this.resetScroll();

    const targetContainer = this.scrollableContainer?.getScrollContainer() ?? this.container;
    for (let i = 0; i < quests.length; i++) {
      const quest = quests[i];
      const position = this.calculateCardPosition(i);
      const questCard = this.createQuestCard(quest, position);
      targetContainer.add(questCard.getContainer());
      this.setupCardClickHandler(questCard, quest);
      this.questCards.push(questCard);
    }

    // Issue #368: ScrollableContainerにコンテンツ高さを通知
    this.scrollableContainer?.setContentHeight(this.getTotalCardContentHeight());

    // Issue #441: グリッドカード作成後、受注済みカードを正しいY位置に再配置
    if (this.lastActiveQuests.length > 0) {
      this.updateAcceptedQuests(this.lastActiveQuests);
    }
  }

  /**
   * 【カード位置計算】: インデックスからグリッド上の位置を計算
   *
   * @param index - カードのインデックス
   * @returns { x, y } 座標
   */
  private calculateCardPosition(index: number): { x: number; y: number } {
    const col = index % QuestAcceptPhaseUI.GRID_COLUMNS;
    const row = Math.floor(index / QuestAcceptPhaseUI.GRID_COLUMNS);
    return {
      x: QuestAcceptPhaseUI.GRID_START_X + col * QuestAcceptPhaseUI.GRID_SPACING_X,
      y: QuestAcceptPhaseUI.GRID_START_Y + row * QuestAcceptPhaseUI.GRID_SPACING_Y,
    };
  }

  /**
   * 【依頼カード作成】: 単一の依頼カードを作成
   *
   * @param quest - 依頼データ
   * @param position - 配置位置
   * @returns 作成したカード
   */
  private createQuestCard(quest: Quest, position: { x: number; y: number }): QuestCardUI {
    return new QuestCardUI(this.scene, {
      quest,
      x: position.x,
      y: position.y,
      interactive: true,
      itemNameResolver: this.itemNameResolver,
    });
  }

  /**
   * 【カードクリックハンドラ設定】: カードクリック時にモーダルを開く
   *
   * @param questCard - カードUI
   * @param quest - 依頼データ
   */
  private setupCardClickHandler(questCard: QuestCardUI, quest: Quest): void {
    const background = questCard.getBackground();
    if (background?.on) {
      background.on('pointerdown', () => {
        this.openQuestDetailModal(quest);
      });
    }
  }

  /**
   * 【依頼受注処理】: 受注ボタンクリック時にQUEST_ACCEPTEDイベントを発行
   *
   * 【設計意図】:
   * - EventBusを通じて、他のコンポーネントに依頼受注を通知
   * - EventBusがnullの場合はエラーログを出力して早期リターン
   * - emit()でエラーが発生した場合もエラーログを出力
   *
   * @param quest - 受注する依頼
   */
  private onAcceptQuest(quest: Quest): void {
    // 【ガード】: EventBusがnullの場合、エラーログを出力して早期リターン
    if (!this.eventBus) {
      console.error('EventBus is not available. Cannot emit QUEST_ACCEPTED event.');
      return;
    }

    // 【イベント発行】: エラーハンドリング付き
    try {
      this.eventBus.emit(GameEventType.QUEST_ACCEPTED, { quest });
    } catch (error) {
      console.error(`EventBus error: Failed to emit QUEST_ACCEPTED event: ${error}`);
    }
  }

  /**
   * 【リソース解放】: すべてのGameObjectsを破棄
   *
   * 【設計意図】:
   * - メモリリークを防止するため、全ての要素を適切に破棄
   * - 破棄順序: キーボードリスナー → カード → 受注済みリスト → タイトル → モーダル → コンテナ
   */
  public destroy(): void {
    // 【キーボードリスナー破棄】
    this.removeKeyboardListener();

    // 【カード破棄】: すべてのQuestCardUIを破棄
    this.destroyExistingCards();

    // 【受注済みリスト破棄】
    this.destroyAcceptedList();

    // 【受注済み依頼カード破棄】Issue #431
    this.destroyAcceptedQuestCards();
    this.destroyAcceptedSectionHeader();

    // 【タイトルテキスト破棄】
    this.destroyTitleText();

    // 【モーダル破棄】
    this.destroyModal();

    // 【スクロールエリア破棄】Issue #355
    this.destroyCardScrollArea();

    // 【コンテナ破棄】: 最後にコンテナ自体を破棄
    if (this.container) {
      this.container.destroy();
    }
  }

  /**
   * 【受注済みリスト破棄】: acceptedListを破棄
   */
  private destroyAcceptedList(): void {
    if (this.acceptedList?.destroy) {
      this.acceptedList.destroy();
    }
  }

  /**
   * 【タイトルテキスト破棄】: titleTextを破棄
   */
  private destroyTitleText(): void {
    if (this.titleText) {
      this.titleText.destroy();
    }
  }

  /**
   * 【モーダル破棄】: currentModalを破棄
   */
  private destroyModal(): void {
    if (this.currentModal) {
      this.currentModal.destroy();
      this.currentModal = null;
    }
  }

  // =============================================================================
  // TASK-0043: モーダル連携メソッド
  // =============================================================================

  /**
   * 【依頼詳細モーダルを開く】: 依頼カードクリック時にモーダルを表示
   *
   * 【設計意図】:
   * - 既にモーダルが開いている場合は何もしない（排他制御）
   * - 受注時はイベント発行とモーダル閉じを両方実行
   * - 閉じる時はモーダルを破棄
   *
   * @param quest - 表示する依頼
   */
  private openQuestDetailModal(quest: Quest): void {
    // 【排他制御】: 既にモーダルが開いている場合は何もしない
    if (this.currentModal) {
      return;
    }

    this.currentModal = new QuestDetailModal(this.scene, {
      quest,
      onAccept: (acceptedQuest) => {
        this.onAcceptQuest(acceptedQuest);
        this.closeQuestDetailModal();
      },
      onClose: () => {
        this.closeQuestDetailModal();
      },
      itemNameResolver: this.itemNameResolver,
    });
    this.currentModal.create();
  }

  /**
   * 【依頼詳細モーダルを閉じる】: モーダルを破棄
   *
   * 【設計意図】:
   * - モーダルが存在する場合のみ破棄
   * - 参照をnullに設定して次回開けるようにする
   */
  private closeQuestDetailModal(): void {
    if (this.currentModal) {
      this.currentModal.destroy();
      this.currentModal = null;
    }
  }

  /**
   * 【クリーンアップ】: フェーズ遷移時に呼び出されるクリーンアップ処理
   *
   * Issue #120: フェーズ遷移時にモーダルを閉じる
   *
   * 【設計意図】:
   * - setVisible(false)時に呼び出され、開いているモーダルを閉じる
   * - UIを非表示にする際に不要な表示要素を確実にクリーンアップ
   */
  public cleanup(): void {
    this.closeQuestDetailModal();
    this.focusedCardIndex = -1;
    this.updateCardFocus();
  }

  /**
   * 【可視性設定オーバーライド】: 表示/非表示切り替え時にクリーンアップを実行
   *
   * Issue #120: 非表示時にモーダルを閉じる
   *
   * 【設計意図】:
   * - 親クラスのsetVisibleを呼び出しつつ、非表示時はcleanup()を実行
   * - フェーズ遷移で依頼カードやモーダルが残らないようにする
   *
   * @param visible - 表示するかどうか
   * @returns this（チェイン可能）
   */
  public override setVisible(visible: boolean): this {
    if (!visible) {
      this.cleanup();
    }
    super.setVisible(visible);
    return this;
  }

  // =============================================================================
  // 掲示板・訪問依頼管理メソッド（TASK-0117）
  // =============================================================================

  /**
   * 【機能概要】: 掲示板依頼リストを更新
   * 【実装方針】: 掲示板依頼を保持し、掲示板タブがアクティブなら表示更新
   * 🟡 信頼性レベル: REQ-005・dataflow.md セクション6から妥当な推測
   *
   * @param quests - 掲示板依頼リスト
   */
  public updateBoardQuests(quests: Quest[]): void {
    this._boardQuests = quests || [];
    if (this._activeTab === 'board') {
      this.updateQuests(this._boardQuests);
    }
  }

  /**
   * 【機能概要】: 訪問依頼リストを更新
   * 【実装方針】: 訪問依頼を保持し、訪問タブがアクティブなら表示更新
   * 🟡 信頼性レベル: REQ-005・dataflow.md セクション6から妥当な推測
   *
   * @param quests - 訪問依頼リスト
   */
  public updateVisitorQuests(quests: Quest[]): void {
    this._visitorQuests = quests || [];
    if (this._activeTab === 'visitor') {
      this.updateQuests(this._visitorQuests);
    }
  }

  /**
   * 【機能概要】: タブ切り替え
   * 【実装方針】: アクティブタブを変更し、対応する依頼リストを表示
   * 🟡 信頼性レベル: REQ-005から妥当な推測
   *
   * @param tab - 切り替え先のタブ
   */
  public switchTab(tab: 'board' | 'visitor'): void {
    this._activeTab = tab;
    const quests = tab === 'board' ? this._boardQuests : this._visitorQuests;
    this.updateQuests(quests);
  }

  /**
   * 【機能概要】: アクティブタブを取得
   * @returns アクティブなタブ名
   */
  public getActiveTab(): 'board' | 'visitor' {
    return this._activeTab;
  }

  /**
   * 【機能概要】: 表示中の依頼件数を取得
   * @returns 表示中の依頼カード数
   */
  public getDisplayedQuestCount(): number {
    return this.questCards.length;
  }

  /**
   * 【機能概要】: 受注済み依頼を表示リストから除外
   * Issue #356: 受注後にgetAvailableQuests()で全依頼を再取得せず、
   * 現在の掲示板/訪問リストから該当依頼を除外して表示更新する
   *
   * @param questId - 除外する依頼のID
   */
  public removeAcceptedQuest(questId: string): void {
    this._boardQuests = this._boardQuests.filter((q) => q.data.id !== questId);
    this._visitorQuests = this._visitorQuests.filter((q) => q.data.id !== questId);

    const quests = this._activeTab === 'board' ? this._boardQuests : this._visitorQuests;
    this.updateQuests(quests);
  }

  /**
   * 【機能概要】: 受注済み数を設定
   * 【実装方針】: 外部から受注済み数を受け取り、上限チェックに使用
   * 🟡 信頼性レベル: REQ-005から妥当な推測
   *
   * @param count - 受注済み依頼数
   */
  public setAcceptedCount(count: number): void {
    this._acceptedCount = count;
  }

  /**
   * 【機能概要】: 追加受注が可能かどうかを判定
   * @returns 受注可能ならtrue
   */
  public canAcceptMore(): boolean {
    return this._acceptedCount < QuestAcceptPhaseUI.QUEST_ACCEPT_LIMIT;
  }

  // =============================================================================
  // Issue #431: 受注済み依頼表示
  // =============================================================================

  /**
   * 【受注済み依頼表示更新】: 受注済み依頼をカード形式でメインコンテンツエリアに表示
   *
   * 【設計意図】:
   * - 受注済み依頼の詳細（必要素材、報酬、期限等）をカード形式で確認可能にする
   * - 新規依頼リストの下に「受注済み依頼」セクションとして表示
   * - IActiveQuestからQuestエンティティを復元してQuestCardUIで表示
   *
   * @param activeQuests - 受注済み依頼リスト
   */
  public updateAcceptedQuests(activeQuests: IActiveQuest[]): void {
    // 受注済み依頼データを保持（グリッド再構築時の再配置用）
    this.lastActiveQuests = activeQuests || [];

    // 既存の受注済みカードを破棄
    this.destroyAcceptedQuestCards();

    if (!activeQuests || activeQuests.length === 0) {
      this.destroyAcceptedSectionHeader();
      return;
    }

    const targetContainer = this.scrollableContainer?.getScrollContainer() ?? this.container;

    // 受注済みセクションのY位置を計算（新規依頼カードの下）
    const acceptedSectionY = this.calculateAcceptedSectionY();

    // セクションタイトルを作成
    this.createAcceptedSectionHeader(targetContainer, acceptedSectionY);

    // 受注済み依頼カードを横一列で配置
    // カードは中央配置のためCARD_HEIGHT/2分下にオフセットが必要
    const sectionHeaderHeight = 60;
    const cardStartY = acceptedSectionY + sectionHeaderHeight + QuestAcceptPhaseUI.CARD_HEIGHT / 2;
    for (let i = 0; i < activeQuests.length; i++) {
      const activeQuest = activeQuests[i];
      const quest = new Quest(activeQuest.quest, activeQuest.client);
      const x =
        QuestAcceptPhaseUI.ACCEPTED_CARD_START_X + i * QuestAcceptPhaseUI.ACCEPTED_CARD_SPACING_X;

      const questCard = new QuestCardUI(this.scene, {
        quest,
        x,
        y: cardStartY,
        interactive: true,
        itemNameResolver: this.itemNameResolver,
      });
      targetContainer.add(questCard.getContainer());

      // クリックで詳細モーダルを開く（受注ボタンなし、閲覧のみ）
      const background = questCard.getBackground();
      if (background?.on) {
        background.on('pointerdown', () => {
          this.openAcceptedQuestDetailModal(quest, activeQuest.remainingDays);
        });
      }

      this.acceptedQuestCards.push(questCard);
    }

    // スクロールコンテンツ高さを更新
    this.scrollableContainer?.setContentHeight(this.getTotalContentHeight());
  }

  /**
   * 【受注済み依頼詳細モーダルを開く】: 受注済み依頼の詳細を閲覧専用モーダルで表示
   *
   * 【設計意図】:
   * - 受注済み依頼は受注ボタンを表示せず、閲覧のみ可能にする
   * - 残り日数の情報を確認できるようにする
   *
   * @param quest - 依頼エンティティ
   * @param remainingDays - 残り日数
   */
  private openAcceptedQuestDetailModal(quest: Quest, remainingDays: number): void {
    if (this.currentModal) {
      return;
    }

    // 残り日数を反映したQuestデータを作成
    const questWithRemainingDays = new Quest(
      { ...quest.data, deadline: remainingDays },
      quest.client,
    );

    this.currentModal = new QuestDetailModal(this.scene, {
      quest: questWithRemainingDays,
      onAccept: () => {
        // 受注済みの場合は受注ボタンを押しても閉じるだけ
        this.closeQuestDetailModal();
      },
      onClose: () => {
        this.closeQuestDetailModal();
      },
      itemNameResolver: this.itemNameResolver,
    });
    this.currentModal.create();
  }

  /**
   * 【受注済みセクションのY位置を計算】: 新規依頼カードの下の位置を返す
   */
  private calculateAcceptedSectionY(): number {
    if (this.questCards.length === 0) {
      return QuestAcceptPhaseUI.GRID_START_Y;
    }
    const rows = Math.ceil(this.questCards.length / QuestAcceptPhaseUI.GRID_COLUMNS);
    return (
      QuestAcceptPhaseUI.GRID_START_Y +
      rows * QuestAcceptPhaseUI.GRID_SPACING_Y +
      QuestAcceptPhaseUI.ACCEPTED_SECTION_MARGIN
    );
  }

  /**
   * 【受注済みセクションヘッダー作成】: タイトルと区切り線を作成
   */
  private createAcceptedSectionHeader(
    targetContainer: Phaser.GameObjects.Container,
    sectionY: number,
  ): void {
    this.destroyAcceptedSectionHeader();

    // 区切り線（タイトルの上に十分な余白を確保）
    this.acceptedSectionDivider = this.scene.add.rectangle(440, sectionY, 700, 2, 0xcccccc);
    targetContainer.add(this.acceptedSectionDivider);

    // セクションタイトル（区切り線の下に配置）
    this.acceptedSectionTitle = this.scene.add.text(
      440,
      sectionY + 30,
      QuestAcceptPhaseUI.ACCEPTED_SECTION_TITLE,
      {
        fontSize: QuestAcceptPhaseUI.ACCEPTED_SECTION_FONT_SIZE,
        color: QuestAcceptPhaseUI.ACCEPTED_SECTION_COLOR,
        fontStyle: 'bold',
      },
    );
    this.acceptedSectionTitle.setOrigin(0.5, 0);
    targetContainer.add(this.acceptedSectionTitle);
  }

  /**
   * 【受注済みセクションヘッダー破棄】
   */
  private destroyAcceptedSectionHeader(): void {
    if (this.acceptedSectionTitle) {
      this.acceptedSectionTitle.destroy();
      this.acceptedSectionTitle = null;
    }
    if (this.acceptedSectionDivider) {
      this.acceptedSectionDivider.destroy();
      this.acceptedSectionDivider = null;
    }
  }

  /**
   * 【受注済み依頼カード破棄】: 受注済み依頼のカードを全て破棄
   */
  private destroyAcceptedQuestCards(): void {
    for (const card of this.acceptedQuestCards) {
      if (card?.destroy) {
        card.destroy();
      }
    }
    this.acceptedQuestCards = [];
  }

  /**
   * 【全コンテンツ高さ取得】: 新規依頼 + 受注済み依頼を含む総高さ
   */
  private getTotalContentHeight(): number {
    const baseHeight = this.getTotalCardContentHeight();
    if (this.acceptedQuestCards.length === 0) {
      return baseHeight;
    }
    // 受注済みセクション: ヘッダー(30) + カード全高(180) + マージン(10)
    const sectionHeaderHeight = 60;
    return (
      this.calculateAcceptedSectionY() + sectionHeaderHeight + QuestAcceptPhaseUI.CARD_HEIGHT + 10
    );
  }

  /**
   * 【受注済み依頼カード数取得】: テスト用アクセサ
   */
  public getAcceptedQuestCount(): number {
    return this.acceptedQuestCards.length;
  }

  // =============================================================================
  // Issue #355 → Issue #368: スクロール機能（ScrollableContainerに統合）
  // =============================================================================

  /**
   * 【カードスクロールエリア作成】: ScrollableContainerを使用してスクロール可能エリアを作成
   */
  private createCardScrollArea(): void {
    const gameWidth = this.scene.cameras?.main?.width ?? 1280;
    const gameHeight = this.scene.cameras?.main?.height ?? 720;

    this.scrollableContainer = new ScrollableContainer(this.scene, this.container, {
      maskBounds: {
        x: MAIN_LAYOUT.SIDEBAR_WIDTH,
        y: MAIN_LAYOUT.HEADER_HEIGHT + QuestAcceptPhaseUI.CARD_AREA_OFFSET_Y,
        width: gameWidth - MAIN_LAYOUT.SIDEBAR_WIDTH,
        height:
          gameHeight -
          MAIN_LAYOUT.HEADER_HEIGHT -
          MAIN_LAYOUT.FOOTER_HEIGHT -
          QuestAcceptPhaseUI.CARD_AREA_OFFSET_Y,
      },
      scrollSpeed: QuestAcceptPhaseUI.SCROLL_SPEED,
      isScrollEnabled: () => this.container.visible,
    });
    this.scrollableContainer.create();
  }

  /**
   * 【スクロールリセット】: スクロール位置を先頭に戻す
   */
  private resetScroll(): void {
    this.scrollableContainer?.resetScroll();
  }

  /**
   * 【カードコンテンツ総高さ取得】: 全カードを含む領域の高さ
   */
  private getTotalCardContentHeight(): number {
    if (this.questCards.length === 0) return 0;
    const rows = Math.ceil(this.questCards.length / QuestAcceptPhaseUI.GRID_COLUMNS);
    return (
      QuestAcceptPhaseUI.GRID_START_Y +
      (rows - 1) * QuestAcceptPhaseUI.GRID_SPACING_Y +
      QuestAcceptPhaseUI.CARD_HEIGHT / 2
    );
  }

  /**
   * 【スクロールエリア破棄】
   */
  private destroyCardScrollArea(): void {
    if (this.scrollableContainer) {
      this.scrollableContainer.destroy();
      this.scrollableContainer = null;
    }
  }

  // =============================================================================
  // Issue #135: キーボード操作
  // =============================================================================

  /**
   * 【キーボードリスナー設定】: キーボード入力を監視
   */
  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => this.handleKeyboardInput(event);
    this.scene?.input?.keyboard?.on('keydown', this.keyboardHandler);
  }

  /**
   * 【キーボードリスナー解除】
   */
  private removeKeyboardListener(): void {
    if (this.keyboardHandler) {
      this.scene?.input?.keyboard?.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * 【キーボード入力処理】
   *
   * @param event - キーボードイベント
   */
  private handleKeyboardInput(event: { key: string }): void {
    // モーダルが開いている場合はモーダル操作のみ
    if (this.currentModal) {
      if (isKeyForAction(event.key, 'CANCEL')) {
        this.closeQuestDetailModal();
      } else if (isKeyForAction(event.key, 'CONFIRM')) {
        // モーダル内で受注ボタンがフォーカスされていれば受注
        const quest = this.currentQuests[this.focusedCardIndex];
        if (quest) {
          this.onAcceptQuest(quest);
          this.closeQuestDetailModal();
        }
      }
      return;
    }

    // 数字キーで依頼カードを直接選択（1-5）
    const selectionIndex = getSelectionIndexFromKey(event.key);
    if (selectionIndex !== null && selectionIndex <= this.currentQuests.length) {
      this.focusedCardIndex = selectionIndex - 1;
      this.updateCardFocus();
      const quest = this.currentQuests[this.focusedCardIndex];
      if (quest) {
        this.openQuestDetailModal(quest);
      }
      return;
    }

    // 矢印キーでナビゲーション
    if (isKeyForAction(event.key, 'LEFT')) {
      this.moveFocus(-1);
    } else if (isKeyForAction(event.key, 'RIGHT')) {
      this.moveFocus(1);
    } else if (isKeyForAction(event.key, 'UP')) {
      this.moveFocus(-QuestAcceptPhaseUI.GRID_COLUMNS);
    } else if (isKeyForAction(event.key, 'DOWN')) {
      this.moveFocus(QuestAcceptPhaseUI.GRID_COLUMNS);
    }
    // Enter/Spaceで選択中のカードのモーダルを開く
    else if (isKeyForAction(event.key, 'CONFIRM')) {
      if (this.focusedCardIndex >= 0 && this.focusedCardIndex < this.currentQuests.length) {
        const quest = this.currentQuests[this.focusedCardIndex];
        if (quest) {
          this.openQuestDetailModal(quest);
        }
      }
    }
  }

  /**
   * 【フォーカス移動】
   *
   * @param delta - 移動量
   */
  private moveFocus(delta: number): void {
    if (this.currentQuests.length === 0) return;

    let newIndex = this.focusedCardIndex + delta;

    // 範囲内に収める
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= this.currentQuests.length) {
      newIndex = this.currentQuests.length - 1;
    }

    if (newIndex !== this.focusedCardIndex) {
      this.focusedCardIndex = newIndex;
      this.updateCardFocus();
    }
  }

  /**
   * 【カードフォーカス更新】: フォーカス中のカードを視覚的にハイライト
   */
  private updateCardFocus(): void {
    const FOCUSED_SCALE = 1.05;
    const DEFAULT_SCALE = 1.0;

    this.questCards.forEach((card, index) => {
      const container = card.getContainer();
      if (!container) return;

      // setScaleメソッドが存在する場合のみスケール変更
      if (typeof container.setScale === 'function') {
        if (index === this.focusedCardIndex) {
          container.setScale(FOCUSED_SCALE);
        } else {
          container.setScale(DEFAULT_SCALE);
        }
      }
    });
  }
}
