import type { GameState } from '../types/game-window.types';
import { BasePage } from './base.page';

/**
 * フェーズフロー操作のPage Object
 *
 * @description
 * キャンバス座標ベースでフェーズ操作を行う。
 * ゲーム解像度1280x720固定のUI配置座標に基づいてクリック操作する。
 *
 * @example
 * ```typescript
 * const flow = new PhaseFlowPage(page);
 * await flow.playFullDay();
 * ```
 */
export class PhaseFlowPage extends BasePage {
  // =============================================================================
  // 座標定数
  // =============================================================================

  /** 共通UI座標 */
  static readonly COORDS = {
    // MainScene共通
    NEXT_BUTTON: { x: 1144, y: 660 },
    SIDEBAR_SHOP_BUTTON: { x: 100, y: 504 },

    // QuestAcceptPhase 依頼カード（QuestAcceptPhaseUIのグリッド座標）
    QUEST_CARD_1: { x: 400, y: 290 },
    QUEST_CARD_2: { x: 700, y: 290 },
    QUEST_CARD_3: { x: 1000, y: 290 },
    QUEST_CARD_4: { x: 400, y: 490 },
    QUEST_CARD_5: { x: 700, y: 490 },

    // GatheringPhase ドラフトカード（推定 - コンテンツエリア内）
    DRAFT_CARD_1: { x: 450, y: 300 },
    DRAFT_CARD_2: { x: 700, y: 300 },
    DRAFT_CARD_3: { x: 950, y: 300 },
    GATHERING_END_BUTTON: { x: 650, y: 550 },

    // AlchemyPhase（推定）
    RECIPE_1: { x: 500, y: 200 },
    RECIPE_2: { x: 500, y: 260 },
    ALCHEMY_SYNTHESIZE_BUTTON: { x: 700, y: 480 },
    ALCHEMY_RESULT_CLOSE: { x: 700, y: 500 },

    // DeliveryPhase
    DELIVERY_QUEST_1: { x: 400, y: 200 },
    DELIVERY_ITEM_1: { x: 700, y: 350 },
    DELIVERY_BUTTON: { x: 400, y: 480 },
    DELIVERY_REWARD_CLOSE: { x: 700, y: 500 },
    END_DAY_BUTTON: { x: 400, y: 630 },

    // TitleScene
    TITLE_NEW_GAME: { x: 640, y: 400 },
    TITLE_CONTINUE: { x: 640, y: 460 },
    TITLE_SETTINGS: { x: 640, y: 520 },
    TITLE_DIALOG_YES: { x: 570, y: 420 },
    TITLE_DIALOG_NO: { x: 710, y: 420 },

    // GameClear/GameOver
    RESULT_TO_TITLE: { x: 565, y: 550 },
    RESULT_RETRY: { x: 715, y: 550 },
  } as const;

  /** アニメーション待機時間（ミリ秒） */
  static readonly WAIT = {
    SHORT: 200,
    MEDIUM: 500,
    LONG: 1000,
    SCENE_TRANSITION: 2000,
    PHASE_TRANSITION: 1000,
  } as const;

  // =============================================================================
  // フェーズ操作メソッド
  // =============================================================================

  /**
   * 次へボタンをクリックしてフェーズを進める
   */
  async clickNextPhase(): Promise<void> {
    await this.clickCanvas(PhaseFlowPage.COORDS.NEXT_BUTTON.x, PhaseFlowPage.COORDS.NEXT_BUTTON.y);
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.PHASE_TRANSITION);
  }

  /**
   * 依頼受注フェーズ: 最初の依頼を受注する
   *
   * @description
   * 依頼カード1をクリックして受注。デバッグフォールバックあり。
   */
  async acceptFirstQuest(): Promise<void> {
    const phase = await this.getStateProperty('currentPhase', '');
    if (!phase.includes('QUEST') && phase !== 'QuestAccept') {
      throw new Error(`Expected QuestAccept phase, but got: ${phase}`);
    }

    // 依頼カード1をクリック
    await this.clickCanvas(
      PhaseFlowPage.COORDS.QUEST_CARD_1.x,
      PhaseFlowPage.COORDS.QUEST_CARD_1.y,
    );
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.SHORT);
  }

  /**
   * 採取フェーズ: ドラフトカードを選択する
   *
   * @description
   * ドラフトカード1をクリックして素材を獲得。
   */
  async performGathering(): Promise<void> {
    // ドラフトカード1を選択
    await this.clickCanvas(
      PhaseFlowPage.COORDS.DRAFT_CARD_1.x,
      PhaseFlowPage.COORDS.DRAFT_CARD_1.y,
    );
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.MEDIUM);
  }

  /**
   * 調合フェーズ: レシピを選択して調合する
   *
   * @description
   * 最初のレシピを選択して調合を実行。
   */
  async performAlchemy(): Promise<void> {
    // レシピ1を選択
    await this.clickCanvas(PhaseFlowPage.COORDS.RECIPE_1.x, PhaseFlowPage.COORDS.RECIPE_1.y);
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.SHORT);

    // 調合ボタンクリック
    await this.clickCanvas(
      PhaseFlowPage.COORDS.ALCHEMY_SYNTHESIZE_BUTTON.x,
      PhaseFlowPage.COORDS.ALCHEMY_SYNTHESIZE_BUTTON.y,
    );
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.MEDIUM);
  }

  /**
   * 納品フェーズ: 依頼にアイテムを納品する
   *
   * @description
   * 最初の依頼を選択してアイテムを納品。
   */
  async performDelivery(): Promise<void> {
    // 納品対象依頼を選択
    await this.clickCanvas(
      PhaseFlowPage.COORDS.DELIVERY_QUEST_1.x,
      PhaseFlowPage.COORDS.DELIVERY_QUEST_1.y,
    );
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.SHORT);

    // 納品ボタンクリック
    await this.clickCanvas(
      PhaseFlowPage.COORDS.DELIVERY_BUTTON.x,
      PhaseFlowPage.COORDS.DELIVERY_BUTTON.y,
    );
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.MEDIUM);
  }

  /**
   * 日を終了する（座標クリック版）
   */
  async clickEndDay(): Promise<void> {
    await this.clickCanvas(
      PhaseFlowPage.COORDS.END_DAY_BUTTON.x,
      PhaseFlowPage.COORDS.END_DAY_BUTTON.y,
    );
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.SCENE_TRANSITION);
  }

  /**
   * デバッグツールでフェーズをスキップする
   */
  async skipCurrentPhase(): Promise<void> {
    await this.executeDebugAction('skipPhase');
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.PHASE_TRANSITION);
  }

  /**
   * デバッグツールで日を終了する
   */
  async debugEndDay(): Promise<void> {
    await this.executeDebugAction('endDay');
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.SCENE_TRANSITION);
  }

  // =============================================================================
  // 複合操作メソッド
  // =============================================================================

  /**
   * 1日分の全フェーズをデバッグスキップで進める
   *
   * @returns 日終了前後のゲーム状態
   */
  async skipFullDay(): Promise<{ before: GameState; after: GameState }> {
    const before = await this.getGameState();

    // 4フェーズをスキップ: QuestAccept → Gathering → Alchemy → Delivery
    for (let i = 0; i < 4; i++) {
      await this.skipCurrentPhase();
    }

    const after = await this.getGameState();
    return { before, after };
  }

  /**
   * 1日分の全フェーズを座標クリックで操作する
   *
   * @description
   * 依頼受注→採取→調合→納品の全フェーズを座標クリックで操作。
   * 各フェーズで最低限の操作を行い、次のフェーズへ進む。
   *
   * @returns 日開始時と終了時のゲーム状態
   */
  async playFullDay(): Promise<{ before: GameState; after: GameState }> {
    const before = await this.getGameState();

    // Phase 1: 依頼受注
    await this.acceptFirstQuest();
    await this.clickNextPhase();

    // Phase 2: 採取
    await this.performGathering();
    await this.clickNextPhase();

    // Phase 3: 調合
    await this.performAlchemy();
    await this.clickNextPhase();

    // Phase 4: 納品
    await this.performDelivery();
    await this.clickEndDay();

    const after = await this.getGameState();
    return { before, after };
  }

  /**
   * 1日分のフェーズをハイブリッド操作する（座標クリック＋デバッグスキップ）
   *
   * @description
   * 依頼受注は座標クリック、残りはデバッグスキップで進める。
   */
  async playHybridDay(): Promise<{ before: GameState; after: GameState }> {
    const before = await this.getGameState();

    // 依頼受注フェーズは座標クリック
    await this.acceptFirstQuest();
    await this.clickNextPhase();

    // 残りフェーズはスキップ
    for (let i = 0; i < 3; i++) {
      await this.skipCurrentPhase();
    }

    const after = await this.getGameState();
    return { before, after };
  }

  // =============================================================================
  // TitleScene操作
  // =============================================================================

  /**
   * タイトル画面で新規ゲームをキャンバスクリックで開始
   */
  async clickTitleNewGame(): Promise<void> {
    await this.clickCanvas(
      PhaseFlowPage.COORDS.TITLE_NEW_GAME.x,
      PhaseFlowPage.COORDS.TITLE_NEW_GAME.y,
    );
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.SCENE_TRANSITION);
  }

  /**
   * リザルト画面からタイトルへキャンバスクリックで戻る
   */
  async clickResultToTitle(): Promise<void> {
    await this.clickCanvas(
      PhaseFlowPage.COORDS.RESULT_TO_TITLE.x,
      PhaseFlowPage.COORDS.RESULT_TO_TITLE.y,
    );
    await this.page.waitForTimeout(PhaseFlowPage.WAIT.SCENE_TRANSITION);
  }
}
