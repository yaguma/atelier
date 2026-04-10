/**
 * RankUpScene.ts - 昇格試験シーン
 * TASK-0051: RankUpScene実装
 *
 * @description
 * 昇格試験画面を表示するシーン。
 * プレイヤーがランクアップするための試験システムを提供する。
 *
 * @信頼性レベル 🔵 TASK-0051.md セクション2に基づく
 */

import type { IRankService, PromotionResult } from '@features/rank';
import type { RexLabel, RexUIPlugin } from '@presentation/types/rexui';
import { THEME } from '@presentation/ui/theme';
import { isKeyForAction } from '@shared/constants/keybindings';
import type { IEventBus } from '@shared/services';
import { Container, ServiceKeys } from '@shared/services/di/container';
import { GameEventType, type GuildRank } from '@shared/types';
import Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/**
 * レイアウト定数
 */
const LAYOUT = {
  /** ヘッダー高さ */
  HEADER_HEIGHT: 60,
  /** フッター高さ */
  FOOTER_HEIGHT: 80,
  /** サイドパディング */
  SIDE_PADDING: 40,
  /** コンテンツエリアのパディング */
  CONTENT_PADDING: 30,
  /** ボタンの幅 */
  BUTTON_WIDTH: 160,
  /** ボタンの高さ */
  BUTTON_HEIGHT: 50,
  /** ボタンの角丸半径 */
  BUTTON_RADIUS: 8,
  /** カードの幅 */
  CARD_WIDTH: 400,
  /** カードの高さ */
  CARD_HEIGHT: 300,
  /** カードの角丸半径 */
  CARD_RADIUS: 12,
} as const;

/**
 * スタイル定数
 */
const STYLES = {
  /** ヘッダーフォントサイズ */
  HEADER_FONT_SIZE: '28px',
  /** ランク表示フォントサイズ */
  RANK_FONT_SIZE: '64px',
  /** ラベルフォントサイズ */
  LABEL_FONT_SIZE: '18px',
  /** 説明フォントサイズ */
  DESCRIPTION_FONT_SIZE: '16px',
  /** ボタンフォントサイズ */
  BUTTON_FONT_SIZE: '16px',
  /** 矢印フォントサイズ */
  ARROW_FONT_SIZE: '48px',
  /** 成功色 */
  SUCCESS_COLOR: '#228B22',
  /** 失敗色 */
  FAILURE_COLOR: '#8B0000',
} as const;

/**
 * テキスト定数
 */
const TEXT = {
  HEADER: '昇格試験',
  CURRENT_RANK: '現在ランク',
  NEXT_RANK: '次ランク',
  ARROW: '→',
  PROMOTION_CONDITIONS: '昇格条件',
  REQUIRED_CONTRIBUTION: '必要貢献度: ',
  CONTRIBUTION_UNIT: 'pt',
  START_TEST: '試験開始',
  BACK: '戻る',
  NEXT: '次へ',
  RESULT_PASS: '合格！',
  RESULT_FAIL: '不合格',
  MAX_RANK: '最高ランク達成！',
  BONUS_REWARD: 'ボーナス報酬: ',
  GOLD_UNIT: 'G',
} as const;

/**
 * アニメーション定数
 */
const ANIMATION = {
  /** フェードイン・アウトの時間（ミリ秒） */
  FADE_DURATION: 300,
  /** 無効化時のアルファ値 */
  DISABLED_ALPHA: 0.5,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/**
 * StateManager インターフェース（依存注入用）
 */
interface IStateManager {
  getState(): {
    currentRank: GuildRank;
    promotionGauge: number;
  };
  updateState(partial: { currentRank?: GuildRank }): void;
}

// =============================================================================
// RankUpSceneクラス
// =============================================================================

/**
 * RankUpScene - 昇格試験画面シーン
 *
 * 【責務】:
 * - ランク情報の表示
 * - 昇格試験の開始・結果表示
 * - MainSceneへの戻り処理
 *
 * @信頼性レベル 🔵 TASK-0051.md セクション2に基づく
 */
export class RankUpScene extends Phaser.Scene {
  // ===========================================================================
  // 依存サービス
  // ===========================================================================

  /** 状態管理サービス */
  private stateManager!: IStateManager;

  /** ランクサービス */
  private rankService!: IRankService;

  /** イベントバス */
  private eventBus!: IEventBus;

  // ===========================================================================
  // UIコンポーネント
  // ===========================================================================

  /** 試験開始ボタン - TASK-0059: rexUI型定義を適用 */
  private startTestButton!: RexLabel;

  /** 戻るボタン - TASK-0059: rexUI型定義を適用 */
  private backButton!: RexLabel;

  /** 次へボタン - TASK-0059: rexUI型定義を適用 */
  private nextButton!: RexLabel;

  /** 結果表示テキスト */
  private resultText!: Phaser.GameObjects.Text;

  /** ボーナス報酬テキスト */
  private bonusText!: Phaser.GameObjects.Text;

  // ===========================================================================
  // rexUIプラグイン
  // ===========================================================================

  /** rexUIプラグイン参照 - TASK-0059: rexUI型定義を適用 */
  declare rexUI: RexUIPlugin;

  /** キーボードイベントハンドラ参照（Issue #135） */
  private keyboardHandler: ((event: { key: string }) => void) | null = null;

  /** 試験結果表示中フラグ */
  private showingResult = false;

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  constructor() {
    super({ key: 'RankUpScene' });
  }

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * create() - 昇格試験画面の生成
   *
   * @throws {Error} StateManagerが未初期化の場合
   * @throws {Error} RankServiceが未初期化の場合
   */
  create(): void {
    // DIコンテナからサービスを取得
    this.initializeServicesFromContainer();

    // サービスの検証
    this.validateServices();

    // UIコンポーネントの作成
    this.createHeader();
    this.createRankDisplay();
    this.createConditionsCard();
    this.createFooter();

    // キーボードリスナーを設定
    this.setupKeyboardListener();

    // フェードイン
    this.fadeIn();
  }

  /**
   * shutdown() - シーン終了時のクリーンアップ
   */
  shutdown(): void {
    this.removeKeyboardListener();
  }

  // ===========================================================================
  // プライベートメソッド - 初期化
  // ===========================================================================

  /**
   * DIコンテナからサービスを取得
   */
  private initializeServicesFromContainer(): void {
    const container = Container.getInstance();
    this.stateManager = container.resolve(ServiceKeys.StateManager);
    this.rankService = container.resolve(ServiceKeys.RankService);
    this.eventBus = container.resolve(ServiceKeys.EventBus);
  }

  /**
   * サービスの存在を検証
   *
   * @throws {Error} 必要なサービスが未初期化の場合
   */
  private validateServices(): void {
    if (!this.stateManager) {
      throw new Error('StateManager is required');
    }
    if (!this.rankService) {
      throw new Error('RankService is required');
    }
    if (!this.eventBus) {
      throw new Error('EventBus is required');
    }
  }

  // ===========================================================================
  // プライベートメソッド - UI作成
  // ===========================================================================

  /**
   * ヘッダーを作成
   */
  private createHeader(): void {
    // ヘッダー背景
    const headerBg = this.add.graphics();
    headerBg.fillStyle(THEME.colors.primary, 1);
    headerBg.fillRect(0, 0, this.cameras.main.width, LAYOUT.HEADER_HEIGHT);

    // タイトルテキスト
    this.add
      .text(this.cameras.main.centerX, LAYOUT.HEADER_HEIGHT / 2, TEXT.HEADER, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.HEADER_FONT_SIZE,
        color: THEME.colors.textOnPrimary,
      })
      .setOrigin(0.5, 0.5);
  }

  /**
   * ランク表示エリアを作成
   */
  private createRankDisplay(): void {
    const currentRank = this.rankService.getCurrentRank();
    const nextRank = this.rankService.getNextRank();
    const centerY = this.cameras.main.centerY - 80;

    // 現在ランクラベル
    this.add
      .text(this.cameras.main.centerX - 150, centerY - 60, TEXT.CURRENT_RANK, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.LABEL_FONT_SIZE,
        color: `#${THEME.colors.textLight.toString(16)}`,
      })
      .setOrigin(0.5, 0.5);

    // 現在ランク表示
    this.add
      .text(this.cameras.main.centerX - 150, centerY, currentRank, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.RANK_FONT_SIZE,
        color: `#${THEME.colors.primary.toString(16)}`,
      })
      .setOrigin(0.5, 0.5);

    // 矢印
    this.add
      .text(this.cameras.main.centerX, centerY, TEXT.ARROW, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.ARROW_FONT_SIZE,
        color: `#${THEME.colors.text.toString(16)}`,
      })
      .setOrigin(0.5, 0.5);

    // 次ランクラベル
    this.add
      .text(this.cameras.main.centerX + 150, centerY - 60, TEXT.NEXT_RANK, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.LABEL_FONT_SIZE,
        color: `#${THEME.colors.textLight.toString(16)}`,
      })
      .setOrigin(0.5, 0.5);

    // 次ランク表示（最高ランクの場合は「-」）
    const nextRankDisplay = nextRank ?? '-';
    this.add
      .text(this.cameras.main.centerX + 150, centerY, nextRankDisplay, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.RANK_FONT_SIZE,
        color: `#${THEME.colors.success.toString(16)}`,
      })
      .setOrigin(0.5, 0.5);
  }

  /**
   * 昇格条件カードを作成
   */
  private createConditionsCard(): void {
    const currentRank = this.rankService.getCurrentRank();
    const requirements = this.rankService.getRankRequirements(currentRank);
    const cardY = this.cameras.main.centerY + 80;

    // カード背景
    const cardBg = this.rexUI.add.roundRectangle(
      this.cameras.main.centerX,
      cardY,
      LAYOUT.CARD_WIDTH,
      LAYOUT.CARD_HEIGHT,
      LAYOUT.CARD_RADIUS,
      THEME.colors.background,
    );
    cardBg.setStrokeStyle(2, THEME.colors.primary);

    // 条件タイトル
    this.add
      .text(this.cameras.main.centerX, cardY - 100, TEXT.PROMOTION_CONDITIONS, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.LABEL_FONT_SIZE,
        color: `#${THEME.colors.text.toString(16)}`,
      })
      .setOrigin(0.5, 0.5);

    // 必要貢献度
    const requiredContribution = requirements?.requiredContribution ?? 0;
    const currentContribution = this.rankService.getAccumulatedContribution();
    const contributionText = `${TEXT.REQUIRED_CONTRIBUTION}${currentContribution} / ${requiredContribution}${TEXT.CONTRIBUTION_UNIT}`;
    this.add
      .text(this.cameras.main.centerX, cardY - 50, contributionText, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.DESCRIPTION_FONT_SIZE,
        color: `#${THEME.colors.text.toString(16)}`,
      })
      .setOrigin(0.5, 0.5);

    // 試験開始ボタン
    this.createStartTestButton(cardY + 20);

    // 結果表示テキスト（初期は非表示）
    this.resultText = this.add
      .text(this.cameras.main.centerX, cardY - 20, '', {
        fontFamily: THEME.fonts.primary,
        fontSize: '32px',
        color: STYLES.SUCCESS_COLOR,
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    // ボーナス報酬テキスト（初期は非表示）
    this.bonusText = this.add
      .text(this.cameras.main.centerX, cardY + 30, '', {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.DESCRIPTION_FONT_SIZE,
        color: `#${THEME.colors.text.toString(16)}`,
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);
  }

  /**
   * 試験開始ボタンを作成
   */
  private createStartTestButton(y: number): void {
    const canPromote = this.rankService.canPromote();

    const buttonBackground = this.rexUI.add.roundRectangle(
      0,
      0,
      LAYOUT.BUTTON_WIDTH,
      LAYOUT.BUTTON_HEIGHT,
      LAYOUT.BUTTON_RADIUS,
      canPromote ? THEME.colors.primary : THEME.colors.disabled,
    );

    const buttonText = this.add.text(0, 0, TEXT.START_TEST, {
      fontFamily: THEME.fonts.primary,
      fontSize: STYLES.BUTTON_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    this.startTestButton = this.rexUI.add.label({
      width: LAYOUT.BUTTON_WIDTH,
      height: LAYOUT.BUTTON_HEIGHT,
      background: buttonBackground,
      text: buttonText,
      align: 'center',
      space: {
        left: 10,
        right: 10,
        top: 5,
        bottom: 5,
      },
      x: this.cameras.main.centerX,
      y,
    });

    if (canPromote) {
      this.startTestButton.setInteractive();
      this.startTestButton.on('pointerdown', () => this.onStartTestClick());
    } else {
      this.startTestButton.setAlpha(ANIMATION.DISABLED_ALPHA);
    }

    this.startTestButton.layout();
  }

  /**
   * フッターを作成
   */
  private createFooter(): void {
    const footerY = this.cameras.main.height - LAYOUT.FOOTER_HEIGHT;

    // フッター背景
    const footerBg = this.add.graphics();
    footerBg.fillStyle(THEME.colors.primary, 1);
    footerBg.fillRect(0, footerY, this.cameras.main.width, LAYOUT.FOOTER_HEIGHT);

    // 戻るボタン
    this.createBackButton(footerY + LAYOUT.FOOTER_HEIGHT / 2);
  }

  /**
   * 戻るボタンを作成
   */
  private createBackButton(y: number): void {
    const buttonX = this.cameras.main.width - LAYOUT.SIDE_PADDING - LAYOUT.BUTTON_WIDTH / 2;

    const buttonBackground = this.rexUI.add.roundRectangle(
      0,
      0,
      LAYOUT.BUTTON_WIDTH,
      LAYOUT.BUTTON_HEIGHT,
      LAYOUT.BUTTON_RADIUS,
      THEME.colors.secondary,
    );

    const buttonText = this.add.text(0, 0, TEXT.BACK, {
      fontFamily: THEME.fonts.primary,
      fontSize: STYLES.BUTTON_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    this.backButton = this.rexUI.add.label({
      width: LAYOUT.BUTTON_WIDTH,
      height: LAYOUT.BUTTON_HEIGHT,
      background: buttonBackground,
      text: buttonText,
      align: 'center',
      space: {
        left: 10,
        right: 10,
        top: 5,
        bottom: 5,
      },
      x: buttonX,
      y,
    });

    this.backButton.setInteractive();
    this.backButton.on('pointerdown', () => this.onBackButtonClick());
    this.backButton.layout();
  }

  /**
   * 次へボタンを作成（試験合格後に表示）
   */
  private createNextButton(): void {
    const footerY = this.cameras.main.height - LAYOUT.FOOTER_HEIGHT;
    const buttonX = this.cameras.main.width - LAYOUT.SIDE_PADDING - LAYOUT.BUTTON_WIDTH / 2;

    // 戻るボタンを非表示
    if (this.backButton) {
      this.backButton.setVisible(false);
    }

    const buttonBackground = this.rexUI.add.roundRectangle(
      0,
      0,
      LAYOUT.BUTTON_WIDTH,
      LAYOUT.BUTTON_HEIGHT,
      LAYOUT.BUTTON_RADIUS,
      THEME.colors.success,
    );

    const buttonText = this.add.text(0, 0, TEXT.NEXT, {
      fontFamily: THEME.fonts.primary,
      fontSize: STYLES.BUTTON_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    this.nextButton = this.rexUI.add.label({
      width: LAYOUT.BUTTON_WIDTH,
      height: LAYOUT.BUTTON_HEIGHT,
      background: buttonBackground,
      text: buttonText,
      align: 'center',
      space: {
        left: 10,
        right: 10,
        top: 5,
        bottom: 5,
      },
      x: buttonX,
      y: footerY + LAYOUT.FOOTER_HEIGHT / 2,
    });

    this.nextButton.setInteractive();
    this.nextButton.on('pointerdown', () => this.onNextButtonClick());
    this.nextButton.layout();
  }

  // ===========================================================================
  // 試験処理
  // ===========================================================================

  /**
   * 試験開始ボタンクリック処理
   */
  onStartTestClick(): void {
    // 試験開始
    this.rankService.startPromotionTest();

    // 試験ボタンを無効化
    this.startTestButton.setAlpha(ANIMATION.DISABLED_ALPHA);
    this.startTestButton.removeInteractive();

    // 簡易的に即時判定（実際のゲームでは試験期間中にアイテムを納品する）
    // ここでは貢献度が100%以上なら合格とする
    const canPromote = this.rankService.canPromote();
    this.handleTestResult(canPromote);
  }

  /**
   * 試験結果を処理
   *
   * @param success - 試験成功の場合true
   * @returns 成功時は昇格結果、失敗時はnull
   */
  handleTestResult(success: boolean): PromotionResult | null {
    const result = this.rankService.completePromotionTest(success);

    // 結果を表示
    this.showTestResult(success, result);

    // 合格時はイベント発火
    if (success && result) {
      this.eventBus.emit(GameEventType.RANK_UP, {
        previousRank: result.previousRank,
        newRank: result.newRank,
      });
    }

    return result;
  }

  /**
   * 試験結果を表示
   */
  private showTestResult(success: boolean, result: PromotionResult | null): void {
    // 試験開始ボタンを非表示
    this.startTestButton.setVisible(false);

    // 結果テキストを表示
    this.resultText.setVisible(true);

    // 結果表示中フラグを設定
    this.showingResult = true;

    if (success && result) {
      this.resultText.setText(TEXT.RESULT_PASS);
      this.resultText.setColor(STYLES.SUCCESS_COLOR);

      // ボーナス報酬を表示
      this.bonusText.setText(`${TEXT.BONUS_REWARD}${result.bonusReward}${TEXT.GOLD_UNIT}`);
      this.bonusText.setVisible(true);

      // 次へボタンを表示
      this.createNextButton();
    } else {
      this.resultText.setText(TEXT.RESULT_FAIL);
      this.resultText.setColor(STYLES.FAILURE_COLOR);

      // 戻るボタンはそのまま表示
    }
  }

  // ===========================================================================
  // 公開メソッド（テスト用）
  // ===========================================================================

  /**
   * 現在ランクの表示を取得
   *
   * @returns 現在ランク文字列
   */
  getCurrentRankDisplay(): string {
    return this.rankService.getCurrentRank();
  }

  /**
   * 次ランクの表示を取得
   *
   * @returns 次ランク文字列、最高ランクの場合は'-'
   */
  getNextRankDisplay(): string {
    return this.rankService.getNextRank() ?? '-';
  }

  /**
   * 試験開始可能かを取得
   *
   * @returns 昇格可能な場合true
   */
  canStartTest(): boolean {
    return this.rankService.canPromote();
  }

  // ===========================================================================
  // シーン遷移
  // ===========================================================================

  /**
   * 戻るボタンクリック処理
   */
  onBackButtonClick(): void {
    this.fadeOutToScene('MainScene');
  }

  /**
   * 次へボタンクリック処理
   */
  onNextButtonClick(): void {
    this.fadeOutToScene('MainScene');
  }

  // ===========================================================================
  // アニメーション
  // ===========================================================================

  /**
   * フェードイン処理
   */
  private fadeIn(): void {
    this.cameras.main.fadeIn(ANIMATION.FADE_DURATION, 0, 0, 0);
  }

  /**
   * フェードアウト後にシーン遷移
   *
   * @param targetScene - 遷移先のシーン名
   */
  private fadeOutToScene(targetScene: string): void {
    this.cameras.main.fadeOut(ANIMATION.FADE_DURATION, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(targetScene);
    });
  }

  // ===========================================================================
  // Issue #135: キーボード操作
  // ===========================================================================

  /**
   * キーボードリスナーを設定
   */
  private setupKeyboardListener(): void {
    this.keyboardHandler = (event: { key: string }) => this.handleKeyboardInput(event);
    this.input?.keyboard?.on('keydown', this.keyboardHandler);
  }

  /**
   * キーボードリスナーを解除
   */
  private removeKeyboardListener(): void {
    if (this.keyboardHandler) {
      this.input?.keyboard?.off('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * キーボード入力を処理
   *
   * @param event - キーボードイベント
   */
  private handleKeyboardInput(event: { key: string }): void {
    const key = event.key;

    // 結果表示中
    if (this.showingResult) {
      // Enter/Spaceで次へまたは戻る
      if (isKeyForAction(key, 'CONFIRM')) {
        if (this.nextButton) {
          this.onNextButtonClick();
        } else {
          this.onBackButtonClick();
        }
      }
      // Escapeで戻る
      else if (isKeyForAction(key, 'CANCEL')) {
        this.onBackButtonClick();
      }
      return;
    }

    // 試験開始前
    // 1キーで試験開始
    if (key === '1' && this.rankService.canPromote()) {
      this.onStartTestClick();
    }
    // Enterで試験開始
    else if (isKeyForAction(key, 'CONFIRM') && this.rankService.canPromote()) {
      this.onStartTestClick();
    }
    // Escapeで戻る
    else if (isKeyForAction(key, 'CANCEL')) {
      this.onBackButtonClick();
    }
  }
}
