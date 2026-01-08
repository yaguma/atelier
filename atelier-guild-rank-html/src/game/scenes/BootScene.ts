/**
 * BootScene - 起動・プリロードシーン
 *
 * ゲーム起動時に最初に実行されるシーン。
 * すべてのアセット（画像、音声、JSON）をプリロードし、
 * 視覚的な進捗バーで読み込み状況を表示する。
 * 完了後にフェードアウトしてTitleSceneへ遷移する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */

import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { SceneKeys } from '../config/SceneKeys';
import { AllAssets, getTotalAssetCount, AssetLoadItem } from '../boot/AssetList';
import { SceneManager } from '../managers/SceneManager';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';

/**
 * プログレスコールバック型
 */
export type ProgressCallback = (progress: number) => void;

/**
 * アセットロードエラー情報
 */
export interface AssetLoadError {
  /** アセットキー */
  key: string;
  /** アセットURL */
  url: string;
  /** エラーメッセージ */
  message: string;
}

/**
 * プログレスバー設定
 */
const PROGRESS_BAR_CONFIG = {
  width: 400,
  height: 30,
  padding: 4,
  cornerRadius: 15,
} as const;

/**
 * BootScene - 起動・プリロードシーン
 *
 * @example
 * ```typescript
 * // ゲーム設定でBootSceneを最初のシーンとして登録
 * const config: Phaser.Types.Core.GameConfig = {
 *   scene: [BootScene, TitleScene, MainScene],
 *   // ...
 * };
 * ```
 */
export class BootScene extends BaseGameScene {
  /** 読み込み済みアセット数 */
  private loadedCount = 0;

  /** アセット総数 */
  private totalCount = 0;

  /** プログレスバー背景 */
  private progressBox: Phaser.GameObjects.Graphics | null = null;

  /** プログレスバー */
  private progressBar: Phaser.GameObjects.Graphics | null = null;

  /** タイトルテキスト */
  private titleText: Phaser.GameObjects.Text | null = null;

  /** サブタイトルテキスト */
  private subtitleText: Phaser.GameObjects.Text | null = null;

  /** パーセントテキスト */
  private percentText: Phaser.GameObjects.Text | null = null;

  /** ローディングテキスト */
  private loadingText: Phaser.GameObjects.Text | null = null;

  /** アセット名テキスト */
  private assetText: Phaser.GameObjects.Text | null = null;

  /** ローディングドットアニメーションタイマー */
  private loadingDotTimer: Phaser.Time.TimerEvent | null = null;

  /** プログレスコールバック */
  private progressCallback: ProgressCallback | null = null;

  /** ロードエラー一覧 */
  private loadErrors: AssetLoadError[] = [];

  /** ロード完了フラグ */
  private _isLoadComplete = false;

  /** シーン遷移を行わないフラグ（テスト用） */
  private skipTransition = false;

  /**
   * コンストラクタ
   */
  constructor() {
    super(SceneKeys.BOOT);
  }

  /**
   * ロード完了状態を取得
   */
  get isLoadComplete(): boolean {
    return this._isLoadComplete;
  }

  /**
   * ロードエラー一覧を取得
   */
  getLoadErrors(): AssetLoadError[] {
    return [...this.loadErrors];
  }

  /**
   * プログレスコールバックを設定
   * @param callback プログレスコールバック（0-1の値を受け取る）
   */
  setProgressCallback(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * シーン遷移をスキップする設定（テスト用）
   * @param skip trueの場合、create後にTitleSceneへの遷移を行わない
   */
  setSkipTransition(skip: boolean): void {
    this.skipTransition = skip;
  }

  /**
   * 現在の進捗を取得（0-1）
   */
  getProgress(): number {
    if (this.totalCount === 0) return 0;
    return this.loadedCount / this.totalCount;
  }

  // =====================================================
  // BaseGameScene ライフサイクル実装
  // =====================================================

  /**
   * 初期化処理
   */
  protected onInit(_data?: SceneInitData): void {
    this.loadedCount = 0;
    this.totalCount = getTotalAssetCount();
    this.loadErrors = [];
    this._isLoadComplete = false;
  }

  /**
   * アセット読み込み処理
   */
  protected onPreload(): void {
    // 背景色設定
    this.cameras.main.setBackgroundColor(Colors.background);

    // UI構築
    this.createLoadingUI();

    // ローダーイベント設定
    this.setupLoaderEvents();

    // ローディングドットアニメーション開始
    this.startLoadingAnimation();

    // 全アセット読み込み開始
    this.loadAllAssets();
  }

  /**
   * UI構築処理
   * アセット読み込み完了後に呼ばれる
   */
  protected onCreate(_data?: SceneInitData): void {
    this._isLoadComplete = true;

    // ロード完了テキスト更新
    if (this.loadingText) {
      this.loadingText.setText('Ready');
    }
    if (this.assetText) {
      this.assetText.setText('Complete!');
    }

    // ローディングアニメーション停止
    this.stopLoadingAnimation();

    // ロードエラーがあればログ出力
    if (this.loadErrors.length > 0) {
      console.warn(
        `BootScene: ${this.loadErrors.length} asset(s) failed to load`,
        this.loadErrors
      );
    }

    // テストモードでなければTitleSceneへ遷移
    if (!this.skipTransition) {
      // フェードアウトしてから遷移
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.transitionToTitle();
      });
    }
  }

  /**
   * イベントリスナー設定
   * BootSceneではイベント購読は不要
   */
  protected setupEventListeners(): void {
    // BootSceneではイベントリスナーは不要
  }

  // =====================================================
  // プライベートメソッド - UI構築
  // =====================================================

  /**
   * ローディングUIを作成
   */
  private createLoadingUI(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // タイトル
    this.createTitleText(centerX, centerY);

    // プログレスバー
    this.createProgressBar(centerX, centerY);

    // ローディングテキスト類
    this.createLoadingTexts(centerX, centerY);
  }

  /**
   * タイトルテキストを作成
   */
  private createTitleText(centerX: number, centerY: number): void {
    // メインタイトル
    this.titleText = this.add
      .text(centerX, centerY - 100, 'Atelier Guild Rank', {
        ...TextStyles.titleLarge,
        fontSize: '42px',
      })
      .setOrigin(0.5);

    // サブタイトル
    this.subtitleText = this.add
      .text(centerX, centerY - 50, '〜錬金術師ギルド物語〜', {
        ...TextStyles.body,
        fontSize: '18px',
      })
      .setOrigin(0.5);
  }

  /**
   * プログレスバーを作成
   */
  private createProgressBar(centerX: number, centerY: number): void {
    const { width, height, cornerRadius } = PROGRESS_BAR_CONFIG;

    // プログレスボックス（背景）
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(Colors.backgroundDark);
    this.progressBox.fillRoundedRect(
      centerX - width / 2,
      centerY + 20,
      width,
      height,
      cornerRadius
    );

    // プログレスバー
    this.progressBar = this.add.graphics();
  }

  /**
   * ローディングテキスト類を作成
   */
  private createLoadingTexts(centerX: number, centerY: number): void {
    // パーセントテキスト
    this.percentText = this.add
      .text(centerX, centerY + 35, '0%', {
        ...TextStyles.body,
        fontSize: '16px',
      })
      .setOrigin(0.5);

    // ローディングテキスト
    this.loadingText = this.add
      .text(centerX, centerY + 70, 'Loading', {
        ...TextStyles.bodySmall,
      })
      .setOrigin(0.5);

    // アセット名テキスト
    this.assetText = this.add
      .text(centerX, centerY + 95, '', {
        ...TextStyles.bodySmall,
        fontSize: '12px',
      })
      .setOrigin(0.5);
  }

  // =====================================================
  // プライベートメソッド - アニメーション
  // =====================================================

  /**
   * ローディングドットアニメーションを開始
   */
  private startLoadingAnimation(): void {
    this.loadingDotTimer = this.time.addEvent({
      delay: 500,
      callback: () => {
        if (this.loadingText && !this._isLoadComplete) {
          const currentText = this.loadingText.text;
          const dots = (currentText.match(/\./g) || []).length;
          const newDots = (dots + 1) % 4;
          this.loadingText.setText('Loading' + '.'.repeat(newDots));
        }
      },
      loop: true,
    });
  }

  /**
   * ローディングアニメーションを停止
   */
  private stopLoadingAnimation(): void {
    if (this.loadingDotTimer) {
      this.loadingDotTimer.remove();
      this.loadingDotTimer = null;
    }
  }

  // =====================================================
  // プライベートメソッド - ローダー
  // =====================================================

  /**
   * ローダーイベントを設定
   */
  private setupLoaderEvents(): void {
    // プログレスイベント
    this.load.on('progress', (value: number) => {
      this.loadedCount = Math.round(value * this.totalCount);
      this.updateProgressBar(value);

      if (this.progressCallback) {
        this.progressCallback(value);
      }
    });

    // ファイル読み込み中イベント
    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      if (this.assetText) {
        this.assetText.setText(file.key);
      }
    });

    // 全ファイル読み込み完了イベント
    this.load.on('complete', () => {
      console.log('BootScene: All assets loaded successfully');
    });

    // エラーイベント
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      const error: AssetLoadError = {
        key: file.key,
        url: typeof file.url === 'string' ? file.url : '',
        message: `Failed to load asset: ${file.key}`,
      };
      this.loadErrors.push(error);
      console.error('BootScene: Load error:', error);
    });
  }

  /**
   * プログレスバーを更新
   */
  private updateProgressBar(value: number): void {
    if (!this.progressBar) return;

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const { width, height, padding, cornerRadius } = PROGRESS_BAR_CONFIG;

    // プログレスバーをクリアして再描画
    this.progressBar.clear();
    this.progressBar.fillStyle(Colors.primary);

    const fillWidth = (width - padding * 2) * value;
    const innerCornerRadius = cornerRadius - padding;

    if (fillWidth > 0) {
      this.progressBar.fillRoundedRect(
        centerX - width / 2 + padding,
        centerY + 20 + padding,
        fillWidth,
        height - padding * 2,
        innerCornerRadius > 0 ? innerCornerRadius : 0
      );
    }

    // パーセントテキスト更新
    if (this.percentText) {
      this.percentText.setText(`${Math.round(value * 100)}%`);
    }
  }

  /**
   * 全アセットを読み込む
   */
  private loadAllAssets(): void {
    AllAssets.forEach((asset) => {
      this.loadAsset(asset);
    });
  }

  /**
   * 単一アセットを読み込む
   */
  private loadAsset(asset: AssetLoadItem): void {
    switch (asset.type) {
      case 'image':
        this.load.image(asset.key, asset.path);
        break;
      case 'audio':
        this.load.audio(asset.key, asset.path);
        break;
      case 'json':
        this.load.json(asset.key, asset.path);
        break;
      case 'spritesheet':
        if (asset.frameConfig) {
          this.load.spritesheet(asset.key, asset.path, asset.frameConfig);
        } else {
          console.warn(`BootScene: Spritesheet ${asset.key} has no frameConfig`);
        }
        break;
      case 'atlas':
        // アトラスは画像とJSONが必要（将来の拡張用）
        console.warn(`BootScene: Atlas loading not yet implemented for ${asset.key}`);
        break;
    }
  }

  /**
   * TitleSceneへ遷移
   */
  private transitionToTitle(): void {
    SceneManager.getInstance().goTo(SceneKeys.TITLE);
  }
}
