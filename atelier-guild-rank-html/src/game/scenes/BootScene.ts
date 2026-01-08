/**
 * BootScene - 起動・プリロードシーン
 *
 * ゲーム起動時に最初に実行されるシーン。
 * すべてのアセット（画像、音声、JSON）をプリロードし、
 * 完了後にTitleSceneへ遷移する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/architecture.md
 */

import { BaseGameScene, SceneInitData } from './BaseGameScene';
import { SceneKeys } from '../config/SceneKeys';
import { AllAssets, getTotalAssetCount, AssetLoadItem } from '../boot/AssetList';
import { SceneManager } from '../managers/SceneManager';

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

  /** ローディングテキスト */
  private loadingText: Phaser.GameObjects.Text | null = null;

  /** プログレスコールバック（TASK-0184で使用） */
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
   * TASK-0184のプログレスバーで使用
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
    // ローディングテキスト表示（プログレスバーはTASK-0184で実装）
    this.createLoadingText();

    // ローダーイベント設定
    this.setupLoaderEvents();

    // 全アセット読み込み開始
    this.loadAllAssets();
  }

  /**
   * UI構築処理
   * アセット読み込み完了後に呼ばれる
   */
  protected onCreate(_data?: SceneInitData): void {
    this._isLoadComplete = true;

    // ロードエラーがあればログ出力
    if (this.loadErrors.length > 0) {
      console.warn(
        `BootScene: ${this.loadErrors.length} asset(s) failed to load`,
        this.loadErrors
      );
    }

    // テストモードでなければTitleSceneへ遷移
    if (!this.skipTransition) {
      // 少し遅延させてから遷移（ローディング完了を表示するため）
      this.time.delayedCall(500, () => {
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
  // プライベートメソッド
  // =====================================================

  /**
   * ローディングテキストを作成
   */
  private createLoadingText(): void {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.loadingText = this.add
      .text(centerX, centerY, 'Loading... 0%', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5);
  }

  /**
   * ローダーイベントを設定
   */
  private setupLoaderEvents(): void {
    // プログレスイベント
    this.load.on('progress', (value: number) => {
      this.loadedCount = Math.round(value * this.totalCount);
      this.updateLoadingText(value);

      if (this.progressCallback) {
        this.progressCallback(value);
      }
    });

    // ファイル読み込み完了イベント
    this.load.on('filecomplete', (_key: string, _type: string, _data: unknown) => {
      // 個別ファイルの完了処理（必要に応じて拡張）
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
   * ローディングテキストを更新
   */
  private updateLoadingText(progress: number): void {
    if (this.loadingText) {
      const percent = Math.round(progress * 100);
      this.loadingText.setText(`Loading... ${percent}%`);
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
