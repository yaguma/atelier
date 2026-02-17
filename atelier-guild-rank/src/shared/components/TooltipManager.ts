/**
 * TooltipManager - ツールチップ表示システム
 * TASK-0041 Phase 5 UI強化・ポリッシュ
 *
 * @description
 * ゲーム全体で使用可能なツールチップ表示システム。
 * シングルトンパターンで実装し、シーン間で再利用可能。
 */

import type Phaser from 'phaser';

/**
 * ツールチップ設定インターフェース
 */
export interface TooltipConfig {
  /** 表示するテキスト内容 */
  content: string;
  /** 表示位置X座標 */
  x: number;
  /** 表示位置Y座標 */
  y: number;
  /** 表示遅延（ms）、デフォルト500ms */
  delay?: number;
  /** 最大幅（px）、デフォルト200px */
  maxWidth?: number;
}

/** デフォルト遅延時間（ms） */
const DEFAULT_DELAY = 500;
/** デフォルト最大幅（px） */
const DEFAULT_MAX_WIDTH = 200;
/** 最小マージン（px） */
const MINIMUM_MARGIN = 10;
/** パディング（px） */
const PADDING = 8;
/** ツールチップの深度 */
const TOOLTIP_DEPTH = 1000;
/** 背景色 */
const BACKGROUND_COLOR = 0x333333;
/** 背景の透明度 */
const BACKGROUND_ALPHA = 0.9;
/** テキストスタイル設定 */
const TEXT_STYLE = {
  fontSize: '14px',
  color: '#ffffff',
} as const;

/**
 * TooltipManagerクラス - シングルトンパターン
 *
 * ゲーム全体で使用可能なツールチップ表示システム。
 * シングルトンパターンで実装し、シーン間で再利用可能。
 */
export class TooltipManager {
  /** シングルトンインスタンス */
  private static instance: TooltipManager | null = null;

  /** Phaserシーン参照 */
  private scene: Phaser.Scene | null = null;

  /** ツールチップコンテナ */
  private container: Phaser.GameObjects.Container | null = null;

  /** 背景Rectangle */
  private background: Phaser.GameObjects.Rectangle | null = null;

  /** テキストオブジェクト */
  private text: Phaser.GameObjects.Text | null = null;

  /** 表示遅延タイマーID */
  private showTimeout: ReturnType<typeof setTimeout> | null = null;

  /** 初期化済みフラグ */
  private _isInitialized = false;

  /** 表示中フラグ */
  private _isVisible = false;

  /** プライベートコンストラクタ（シングルトンパターン） */
  private constructor() {
    // シングルトンパターンのためプライベート
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): TooltipManager {
    if (!TooltipManager.instance) {
      TooltipManager.instance = new TooltipManager();
    }
    return TooltipManager.instance;
  }

  /**
   * テスト用: インスタンスをリセット
   */
  static resetInstance(): void {
    if (TooltipManager.instance) {
      TooltipManager.instance.destroy();
    }
    TooltipManager.instance = null;
  }

  /**
   * シーンを紐付けて初期化
   * @param scene - Phaserシーン
   * @throws Error sceneがnullまたはundefinedの場合
   * @throws Error scene.add.containerがない場合
   */
  initialize(scene: Phaser.Scene): void {
    // sceneの検証
    if (!scene) {
      throw new Error('TooltipManager.initialize(): scene is required');
    }

    if (!scene.add || typeof scene.add.container !== 'function') {
      throw new Error('TooltipManager.initialize(): scene.add.container is required');
    }

    // 既に初期化済みの場合は前のコンテナを破棄
    if (this._isInitialized && this.container) {
      this.container.destroy();
    }

    // シーン参照を保存
    this.scene = scene;

    // ツールチップコンテナを作成
    this.container = scene.add.container(0, 0);
    this.container.name = 'TooltipManager';
    this.container.setVisible(false);
    this.container.setDepth(TOOLTIP_DEPTH);

    // 背景Rectangleを作成
    this.background = scene.add.rectangle(0, 0, DEFAULT_MAX_WIDTH, 50, BACKGROUND_COLOR);
    this.background.setOrigin(0, 0);
    this.background.setFillStyle(BACKGROUND_COLOR, BACKGROUND_ALPHA);

    // テキストオブジェクトを作成
    this.text = scene.add.text(PADDING, PADDING, '', TEXT_STYLE);
    this.text.setOrigin(0, 0);
    this.text.setWordWrapWidth(DEFAULT_MAX_WIDTH - PADDING * 2);

    // コンテナに追加
    this.container.add([this.background, this.text]);

    // 初期化完了
    this._isInitialized = true;
    this._isVisible = false;
  }

  /**
   * ツールチップを表示
   * @param config - 表示設定
   */
  show(config: TooltipConfig): void {
    // 初期化前に呼び出された場合は何もしない
    if (!this._isInitialized || !this.scene || !this.container) {
      return;
    }

    // 既存のタイマーをキャンセル
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }

    // 座標の検証と補正
    let x = config.x;
    let y = config.y;

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      console.warn('TooltipManager.show(): Invalid coordinates detected, using (0, 0)');
      x = 0;
      y = 0;
    }

    const delay = config.delay ?? DEFAULT_DELAY;
    const maxWidth = config.maxWidth ?? DEFAULT_MAX_WIDTH;

    // 遅延なしの場合は即座に表示
    if (delay === 0) {
      this.displayTooltip(config.content, x, y, maxWidth);
    } else {
      // 遅延付きで表示
      this.showTimeout = setTimeout(() => {
        this.displayTooltip(config.content, x, y, maxWidth);
      }, delay);
    }
  }

  /**
   * ツールチップを実際に表示する内部メソッド
   */
  private displayTooltip(content: string, x: number, y: number, maxWidth: number): void {
    if (!this.container || !this.text || !this.background || !this.scene) {
      return;
    }

    // テキストを更新し、背景サイズを調整
    this.updateContent(content, maxWidth);

    // 位置調整（コンテナのサイズを使用）
    const containerBounds = this.container.getBounds();
    const adjustedPosition = this.adjustPosition(
      x,
      y,
      containerBounds.width,
      containerBounds.height,
    );

    // 位置を設定し、深度を確保して表示
    this.container.setPosition(adjustedPosition.x, adjustedPosition.y);
    this.container.setDepth(TOOLTIP_DEPTH);
    this.container.setVisible(true);
    this._isVisible = true;
  }

  /**
   * テキストコンテンツと背景サイズを更新
   */
  private updateContent(content: string, maxWidth: number): void {
    if (!this.text || !this.background) {
      return;
    }

    // テキストを更新
    this.text.setText(content);
    this.text.setWordWrapWidth(maxWidth);

    // テキストサイズに基づいて背景サイズを調整
    const textBounds = this.text.getBounds();
    const bgWidth = textBounds.width + PADDING * 2;
    const bgHeight = textBounds.height + PADDING * 2;
    this.background.setSize(bgWidth, bgHeight);
  }

  /**
   * 表示位置を自動調整
   */
  private adjustPosition(
    x: number,
    y: number,
    width: number,
    height: number,
  ): { x: number; y: number } {
    if (!this.scene) {
      return { x, y };
    }

    const camera = this.scene.cameras.main;
    const cameraWidth = camera.width;
    const cameraHeight = camera.height;

    let adjustedX = x;
    let adjustedY = y;

    // 右端からはみ出す場合は左方向にシフト
    if (adjustedX + width > cameraWidth - MINIMUM_MARGIN) {
      adjustedX = cameraWidth - width - MINIMUM_MARGIN;
    }

    // 下端からはみ出す場合は上方向にシフト
    if (adjustedY + height > cameraHeight - MINIMUM_MARGIN) {
      adjustedY = cameraHeight - height - MINIMUM_MARGIN;
    }

    // 最小マージンを確保
    adjustedX = Math.max(MINIMUM_MARGIN, adjustedX);
    adjustedY = Math.max(MINIMUM_MARGIN, adjustedY);

    return { x: adjustedX, y: adjustedY };
  }

  /**
   * ツールチップを非表示
   */
  hide(): void {
    // 初期化前に呼び出された場合は何もしない
    if (!this._isInitialized) {
      return;
    }

    // タイマーをキャンセル
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }

    // コンテナを非表示
    if (this.container) {
      this.container.setVisible(false);
    }

    this._isVisible = false;
  }

  /**
   * リソースを破棄
   */
  destroy(): void {
    // タイマーをキャンセル
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }

    // コンテナを破棄
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    // 参照をクリア
    this.background = null;
    this.text = null;
    this.scene = null;

    // フラグをリセット
    this._isInitialized = false;
    this._isVisible = false;
  }

  /**
   * 初期化済みかどうか
   */
  isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * 現在表示中かどうか
   */
  isVisible(): boolean {
    return this._isVisible;
  }
}
