/**
 * GameClearScene.ts - ゲームクリアシーン
 * TASK-0027: リザルト画面（GameOver/GameClear）
 *
 * 【機能概要】
 * ゲームクリア時のリザルト画面を表示するシーン。
 * プレイ統計（クリア日数、総納品数、獲得ゴールド）を表示し、
 * タイトルへ戻る・NEW GAME+のボタンを提供する。
 *
 * 【実装方針】
 * 設計文書（TASK-0027.md）に基づいてゲームクリア画面を実装。
 * GameOverSceneのスタイルを参考にしながら、お祝いの雰囲気を演出。
 *
 * @信頼性レベル 🔵 設計文書準拠
 * @see docs/tasks/atelier-guild-rank/phase-3/TASK-0027.md
 */

import type { RexLabel, RexUIPlugin } from '@presentation/types/rexui';
import { THEME } from '@presentation/ui/theme';
import type { GameEndStats } from '@shared/types';
import Phaser from 'phaser';

// =============================================================================
// 定数定義
// =============================================================================

/**
 * ゲームクリアシーンのレイアウト定数
 * @信頼性レベル 🟡 実装者が決定
 */
const LAYOUT = {
  /** タイトルのY座標 */
  TITLE_Y: 120,
  /** メッセージのY座標 */
  MESSAGE_Y: 220,
  /** 統計情報の開始Y座標 */
  STATS_START_Y: 320,
  /** 統計情報の行間 */
  STATS_LINE_SPACING: 35,
  /** ボタンの開始Y座標 */
  BUTTON_START_Y: 550,
  /** ボタン間のスペーシング（ボタン幅180 + 余白20） */
  BUTTON_SPACING: 200,
} as const;

/**
 * スタイル定数
 * @信頼性レベル 🟡 実装者が決定
 */
const STYLES = {
  /** タイトルのフォントサイズ */
  TITLE_FONT_SIZE: '42px',
  /** タイトルの色（ゴールド） */
  TITLE_COLOR: '#DAA520',
  /** メッセージのフォントサイズ */
  MESSAGE_FONT_SIZE: '20px',
  /** メッセージの色 */
  MESSAGE_COLOR: '#666666',
  /** 統計情報のフォントサイズ */
  STATS_FONT_SIZE: '18px',
  /** 統計情報の色 */
  STATS_COLOR: '#333333',
  /** ボタンのフォントサイズ */
  BUTTON_FONT_SIZE: '16px',
} as const;

/**
 * ボタンのサイズ定数
 * @信頼性レベル 🟡 実装者が決定
 */
const SIZES = {
  /** ボタンの幅 */
  BUTTON_WIDTH: 180,
  /** ボタンの高さ */
  BUTTON_HEIGHT: 50,
  /** ボタンの角丸半径 */
  BUTTON_RADIUS: 8,
} as const;

/**
 * テキスト定数
 * @信頼性レベル 🔵 設計文書に基づく
 */
const TEXT = {
  TITLE: '🎉 CONGRATULATIONS! 🎉',
  MESSAGE_LINE1: 'Sランク錬金術師に',
  MESSAGE_LINE2: '昇格しました!',
  TO_TITLE: 'タイトルへ',
  NEW_GAME_PLUS: 'NEW GAME+',
} as const;

// =============================================================================
// GameClearSceneクラス
// =============================================================================

/**
 * GameClearScene - ゲームクリア画面シーン
 *
 * 【責務】
 * - ゲームクリアタイトルの表示
 * - 成功メッセージの表示
 * - プレイ統計情報の表示
 * - タイトルへ戻る・NEW GAME+ボタンの提供
 *
 * @信頼性レベル 🔵 設計文書（TASK-0027.md）に基づく
 */
export class GameClearScene extends Phaser.Scene {
  // ===========================================================================
  // プロパティ
  // ===========================================================================

  /**
   * rexUIプラグイン参照（テストでモックされる）
   * TASK-0059: rexUI型定義を適用
   */
  declare rexUI: RexUIPlugin;

  /**
   * ゲーム終了時の統計情報
   */
  private stats!: GameEndStats;

  /**
   * ボタン参照（破棄時に使用）
   * TASK-0059: rexUI型定義を適用
   */
  private buttons: RexLabel[] = [];

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  /**
   * GameClearSceneのコンストラクタ
   */
  constructor() {
    super({ key: 'GameClearScene' });
  }

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * init() - シーン初期化
   *
   * 【機能概要】
   * 前のシーンから受け取った統計情報を保存する。
   *
   * @param data シーン初期化データ
   */
  init(data: { stats: GameEndStats }): void {
    this.stats = data.stats;
  }

  /**
   * create() - ゲームクリア画面の生成
   *
   * 【機能概要】
   * ゲームクリア画面を構築し、統計情報とボタンを表示する。
   *
   * @信頼性レベル 🔵 設計文書に準拠
   */
  create(): void {
    const centerX = this.cameras.main.centerX;

    // 背景
    this.createBackground();

    // タイトル表示
    this.createTitle(centerX);

    // メッセージ表示
    this.createMessage(centerX);

    // 統計情報表示
    this.createStats(centerX);

    // ボタン表示
    this.createButtons(centerX);

    // クリア演出（将来実装）
    // this.playClearAnimation();

    // クリア音楽再生（将来実装）
    // this.playClearMusic();
  }

  /**
   * シャットダウン処理
   * シーン破棄時にリソースを解放する。
   */
  shutdown(): void {
    for (const button of this.buttons) {
      if (button) {
        button.destroy();
      }
    }
    this.buttons = [];
  }

  // ===========================================================================
  // UI生成メソッド（プライベート）
  // ===========================================================================

  /**
   * 背景を生成する
   */
  private createBackground(): void {
    const sceneWidth = this.scale?.width || 1280;
    const sceneHeight = this.scale?.height || 720;

    this.add.rectangle(
      sceneWidth / 2,
      sceneHeight / 2,
      sceneWidth,
      sceneHeight,
      THEME.colors.background,
    );
  }

  /**
   * タイトルを生成する
   * @param centerX 画面中央X座標
   */
  private createTitle(centerX: number): void {
    this.add
      .text(centerX, LAYOUT.TITLE_Y, TEXT.TITLE, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.TITLE_FONT_SIZE,
        color: STYLES.TITLE_COLOR,
        padding: { top: 4 },
      })
      .setOrigin(0.5);
  }

  /**
   * メッセージを生成する
   * @param centerX 画面中央X座標
   */
  private createMessage(centerX: number): void {
    const message = `${TEXT.MESSAGE_LINE1}\n${TEXT.MESSAGE_LINE2}`;
    this.add
      .text(centerX, LAYOUT.MESSAGE_Y, message, {
        fontFamily: THEME.fonts.primary,
        fontSize: STYLES.MESSAGE_FONT_SIZE,
        color: STYLES.MESSAGE_COLOR,
        align: 'center',
        padding: { top: 4 },
      })
      .setOrigin(0.5);
  }

  /**
   * 統計情報を生成する
   * @param centerX 画面中央X座標
   */
  private createStats(centerX: number): void {
    const statsLines = [
      `クリア日数: ${this.stats.totalDays}日`,
      `総納品数: ${this.stats.totalDeliveries}`,
      `獲得ゴールド: ${this.stats.totalGold.toLocaleString()}G`,
    ];

    statsLines.forEach((line, index) => {
      this.add
        .text(centerX, LAYOUT.STATS_START_Y + index * LAYOUT.STATS_LINE_SPACING, line, {
          fontFamily: THEME.fonts.primary,
          fontSize: STYLES.STATS_FONT_SIZE,
          color: STYLES.STATS_COLOR,
          padding: { top: 4 },
        })
        .setOrigin(0.5);
    });
  }

  /**
   * ボタンを生成する
   * @param centerX 画面中央X座標
   */
  private createButtons(centerX: number): void {
    // タイトルへボタン
    const toTitleButton = this.createButton(
      centerX - LAYOUT.BUTTON_SPACING / 2,
      LAYOUT.BUTTON_START_Y,
      TEXT.TO_TITLE,
      THEME.colors.secondary,
      () => this.onToTitleClick(),
    );
    this.buttons.push(toTitleButton);

    // NEW GAME+ボタン（将来実装のためスタブ）
    const newGamePlusButton = this.createButton(
      centerX + LAYOUT.BUTTON_SPACING / 2,
      LAYOUT.BUTTON_START_Y,
      TEXT.NEW_GAME_PLUS,
      THEME.colors.primary,
      () => this.onNewGamePlusClick(),
    );
    this.buttons.push(newGamePlusButton);
  }

  /**
   * ボタンを生成する共通メソッド
   * @param x X座標
   * @param y Y座標
   * @param text ボタンテキスト
   * @param backgroundColor 背景色
   * @param onClick クリック時のコールバック
   * @returns 生成されたボタン（rexUI Labelコンポーネント）
   * 【修正内容】: W-001への対応
   * 【修正理由】: TitleSceneと同様にRexLabel型を適用
   * 🔵 信頼性レベル: TitleSceneのcreateButtonメソッドに準拠
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    backgroundColor: number,
    onClick: () => void,
  ): RexLabel {
    const buttonBackground = this.rexUI.add.roundRectangle(
      0,
      0,
      SIZES.BUTTON_WIDTH,
      SIZES.BUTTON_HEIGHT,
      SIZES.BUTTON_RADIUS,
      backgroundColor,
    );
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: THEME.fonts.primary,
      fontSize: STYLES.BUTTON_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    const button = this.rexUI.add.label({
      width: SIZES.BUTTON_WIDTH,
      height: SIZES.BUTTON_HEIGHT,
      background: buttonBackground,
      text: buttonText,
      align: 'center',
      space: { left: 10, right: 10, top: 10, bottom: 10 },
      x,
      y,
    });

    button.setInteractive();
    button.on('pointerdown', onClick);
    button.layout();

    return button;
  }

  // ===========================================================================
  // イベントハンドラ（プライベート）
  // ===========================================================================

  /**
   * タイトルへボタンクリック処理
   */
  private onToTitleClick(): void {
    this.scene.start('TitleScene');
  }

  /**
   * NEW GAME+ボタンクリック処理
   * 🔴 拡張機能: Phase 1では新規ゲームとして実装
   */
  private onNewGamePlusClick(): void {
    // 将来実装: NEW GAME+の引き継ぎ処理
    this.scene.start('MainScene');
  }
}
