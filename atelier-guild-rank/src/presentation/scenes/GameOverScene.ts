/**
 * GameOverScene.ts - ゲームオーバーシーン
 * TASK-0027: リザルト画面（GameOver/GameClear）
 *
 * 【機能概要】
 * ゲームオーバー時のリザルト画面を表示するシーン。
 * プレイ統計（最終ランク、経過日数、総納品数、獲得ゴールド）を表示し、
 * タイトルへ戻る・リトライのボタンを提供する。
 *
 * 【実装方針】
 * 設計文書（TASK-0027.md）に基づいてゲームオーバー画面を実装。
 * TitleSceneのスタイルを参考にしながら、シンプルで読みやすい画面を作成。
 *
 * @信頼性レベル 🔵 設計文書準拠
 * @see docs/tasks/atelier-guild-rank/phase-3/TASK-0027.md
 */

import Phaser from 'phaser';
import type { GameEndStats } from '../../shared/types';
import { THEME } from '../ui/theme';

// =============================================================================
// 定数定義
// =============================================================================

/**
 * ゲームオーバーシーンのレイアウト定数
 * @信頼性レベル 🟡 実装者が決定
 */
const LAYOUT = {
  /** タイトルのY座標 */
  TITLE_Y: 150,
  /** メッセージのY座標 */
  MESSAGE_Y: 220,
  /** 統計情報の開始Y座標 */
  STATS_START_Y: 320,
  /** 統計情報の行間 */
  STATS_LINE_SPACING: 35,
  /** ボタンの開始Y座標 */
  BUTTON_START_Y: 550,
  /** ボタン間のスペーシング */
  BUTTON_SPACING: 150,
} as const;

/**
 * スタイル定数
 * @信頼性レベル 🟡 実装者が決定
 */
const STYLES = {
  /** タイトルのフォントサイズ */
  TITLE_FONT_SIZE: '48px',
  /** タイトルの色（赤） */
  TITLE_COLOR: '#8B0000',
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
  TITLE: '💀 GAME OVER',
  MESSAGE_LINE1: '期限までにSランクに',
  MESSAGE_LINE2: '到達できませんでした',
  TO_TITLE: 'タイトルへ',
  RETRY: 'リトライ',
} as const;

// =============================================================================
// GameOverSceneクラス
// =============================================================================

/**
 * GameOverScene - ゲームオーバー画面シーン
 *
 * 【責務】
 * - ゲームオーバータイトルの表示
 * - 失敗メッセージの表示
 * - プレイ統計情報の表示
 * - タイトルへ戻る・リトライボタンの提供
 *
 * @信頼性レベル 🔵 設計文書（TASK-0027.md）に基づく
 */
export class GameOverScene extends Phaser.Scene {
  // ===========================================================================
  // プロパティ
  // ===========================================================================

  /**
   * rexUIプラグイン参照（テストでモックされる）
   * @remarks rexUIプラグインの型は複雑なため、anyを使用
   */
  // biome-ignore lint/suspicious/noExplicitAny: rexUIプラグインの型は複雑なため
  protected rexUI: any;

  /**
   * ゲーム終了時の統計情報
   */
  private stats!: GameEndStats;

  /**
   * ボタン参照（破棄時に使用）
   * @remarks rexUI Labelコンポーネントの型は複雑なため、anyを使用
   */
  // biome-ignore lint/suspicious/noExplicitAny: rexUI Labelコンポーネントの型は複雑なため
  private buttons: any[] = [];

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  /**
   * GameOverSceneのコンストラクタ
   */
  constructor() {
    super({ key: 'GameOverScene' });
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
   * create() - ゲームオーバー画面の生成
   *
   * 【機能概要】
   * ゲームオーバー画面を構築し、統計情報とボタンを表示する。
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

    // ゲームオーバー音楽再生（将来実装）
    // this.playGameOverMusic();
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
        fontSize: STYLES.TITLE_FONT_SIZE,
        color: STYLES.TITLE_COLOR,
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
        fontSize: STYLES.MESSAGE_FONT_SIZE,
        color: STYLES.MESSAGE_COLOR,
        align: 'center',
      })
      .setOrigin(0.5);
  }

  /**
   * 統計情報を生成する
   * @param centerX 画面中央X座標
   */
  private createStats(centerX: number): void {
    const statsLines = [
      `最終ランク: ${this.stats.finalRank}`,
      `経過日数: ${this.stats.totalDays}日`,
      `総納品数: ${this.stats.totalDeliveries}`,
      `獲得ゴールド: ${this.stats.totalGold.toLocaleString()}G`,
    ];

    statsLines.forEach((line, index) => {
      this.add
        .text(centerX, LAYOUT.STATS_START_Y + index * LAYOUT.STATS_LINE_SPACING, line, {
          fontSize: STYLES.STATS_FONT_SIZE,
          color: STYLES.STATS_COLOR,
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

    // リトライボタン
    const retryButton = this.createButton(
      centerX + LAYOUT.BUTTON_SPACING / 2,
      LAYOUT.BUTTON_START_Y,
      TEXT.RETRY,
      THEME.colors.primary,
      () => this.onRetryClick(),
    );
    this.buttons.push(retryButton);
  }

  /**
   * ボタンを生成する共通メソッド
   * @param x X座標
   * @param y Y座標
   * @param text ボタンテキスト
   * @param backgroundColor 背景色
   * @param onClick クリック時のコールバック
   * @returns 生成されたボタン（rexUI Labelコンポーネント）
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    backgroundColor: number,
    onClick: () => void,
    // biome-ignore lint/suspicious/noExplicitAny: rexUI Labelコンポーネントの型は複雑なため
  ): any {
    const buttonText = this.add.text(0, 0, text, {
      fontSize: STYLES.BUTTON_FONT_SIZE,
      color: THEME.colors.textOnPrimary,
    });

    const buttonBackground = this.rexUI.add
      .roundRectangle({
        width: SIZES.BUTTON_WIDTH,
        height: SIZES.BUTTON_HEIGHT,
        radius: SIZES.BUTTON_RADIUS,
      })
      .setFillStyle(backgroundColor);

    const button = this.rexUI.add.label({
      background: buttonBackground,
      text: buttonText,
      align: 'center',
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
   * リトライボタンクリック処理
   */
  private onRetryClick(): void {
    this.scene.start('MainScene');
  }
}
