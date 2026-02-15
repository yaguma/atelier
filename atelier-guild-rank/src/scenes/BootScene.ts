/**
 * BootScene.ts - ブートシーン
 * TASK-0008: Phaser基本設定とBootScene
 *
 * 【機能概要】: ゲーム起動時のアセット読み込みと初期化を行うシーン 🔵
 * 【実装方針】: テストを通すための最小限の実装を行う 🔵
 * 【テスト対応】: T-0008-01, T-0008-02, T-0008-03のテストケースを通すための実装 🔵
 */

import { initializeServices } from '@shared/services/di/setup';
import Phaser from 'phaser';

/**
 * BootScene - ゲーム起動時の初期化シーン
 *
 * 【責務】:
 * - マスターデータの読み込み
 * - アセットのプリロード
 * - ローディングプログレスバーの表示
 * - TitleSceneへの遷移
 *
 * 🔵 信頼性レベル: 要件定義書（atelier-guild-rank-requirements.md）に明記
 */
export class BootScene extends Phaser.Scene {
  /** プログレスバー（背景） */
  private progressBox!: Phaser.GameObjects.Graphics;
  /** プログレスバー（本体） */
  private progressBar!: Phaser.GameObjects.Graphics;
  /** ローディングテキスト */
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BootScene' });
  }

  /**
   * preload() - アセット読み込み
   *
   * 【機能概要】: マスターデータJSONファイルを読み込み、プログレスバーを表示する
   * 【実装方針】: Phaserのローダーを使用してJSONファイルを非同期で読み込む
   * 【テスト対応】: T-0008-DATA-1（マスターデータ読み込み）、T-0008-PROG-*（プログレスバー）のテストを通す
   * 🔵 信頼性レベル: 要件定義書のpreload()処理内容に明記
   */
  preload(): void {
    // 【プログレスバー作成】: ローディング表示のためのUIを生成 🔵
    this.createProgressBar();

    // 【マスターデータ読み込み】: 6種類のマスターデータJSONファイルを読み込む 🔵
    // 【実装内容】: this.load.json()でファイルを非同期読み込み
    this.load.json('cards', '/data/cards.json');
    this.load.json('materials', '/data/materials.json');
    this.load.json('recipes', '/data/recipes.json');
    this.load.json('quests', '/data/quests.json');
    this.load.json('ranks', '/data/ranks.json');
    this.load.json('artifacts', '/data/artifacts.json');

    // 【プログレスイベント購読】: 読み込み進捗を監視してプログレスバーを更新 🔵
    // 【実装内容】: Phaserローダーのprogressイベントとcompleteイベントを購読
    this.load.on('progress', this.updateProgressBar, this);
    this.load.on('complete', this.destroyProgressBar, this);

    // 【エラーハンドリング】: ファイル読み込み失敗時のエラー処理 🟡
    this.load.on('loaderror', this.handleLoadError, this);
  }

  /**
   * create() - シーン初期化
   *
   * 【機能概要】: サービスを初期化し、TitleSceneへ遷移する
   * 【実装方針】: サービス初期化を行い、完了後にTitleSceneへ遷移
   * 【テスト対応】: T-0008-02（シーン遷移）、T-0008-CACHE-1（キャッシュ取得）のテストを通す
   * 🔵 信頼性レベル: 要件定義書のcreate()処理内容に明記
   */
  create(): void {
    // 【マスターデータ検証】: キャッシュからマスターデータを取得して検証 🔵
    // 【実装内容】: this.cache.json.get()で各マスターデータにアクセス
    // 【データ整合性】: 読み込みが正常に完了したことを確認
    const cards = this.cache.json.get('cards');
    const materials = this.cache.json.get('materials');
    const recipes = this.cache.json.get('recipes');
    const quests = this.cache.json.get('quests');
    const ranks = this.cache.json.get('ranks');
    const artifacts = this.cache.json.get('artifacts');

    // 【データ検証】: 各マスターデータが正しく読み込まれたことを確認 🔵
    // 【エラー処理】: データが存在しない場合は警告を表示
    if (!cards || !materials || !recipes || !quests || !ranks || !artifacts) {
      console.warn('Some master data failed to load');
    }

    // 【サービス初期化】: DIコンテナにサービスを登録する 🔵
    // 【実装内容】: initializeServicesを非同期で呼び出し、完了後にシーン遷移
    // 【エラーハンドリング】: 初期化失敗時もTitleSceneへ遷移（警告を出力）
    this.initializeAndTransition();
  }

  /**
   * initializeAndTransition() - サービス初期化とシーン遷移
   *
   * 【機能概要】: サービスを非同期で初期化し、完了後にTitleSceneへ遷移する
   * 【実装方針】: async/awaitで初期化を待ち、エラー時も遷移は行う
   * 🔵 信頼性レベル: 設計文書（architecture-phaser.md）に基づく
   */
  private async initializeAndTransition(): Promise<void> {
    try {
      // サービス初期化を実行
      await initializeServices();
      console.log('Services initialized successfully');
    } catch (error) {
      // 初期化失敗時は警告を出力してもシーン遷移は行う
      console.warn('Service initialization failed:', error);
    }

    // 【シーン遷移】: TitleSceneへ自動遷移 🔵
    // 【実装内容】: this.scene.start()でTitleSceneを開始
    // 【遷移タイミング】: サービス初期化完了後（または失敗後）に遷移
    this.scene.start('TitleScene');
  }

  /**
   * createProgressBar() - プログレスバー作成
   *
   * 【機能概要】: ローディング中のプログレスバーとテキストを作成する
   * 【実装方針】: Phaserのadd.graphics()とadd.text()を使用
   * 【テスト対応】: T-0008-PROG-2, T-0008-PROG-3のテストを通す
   * 🔵 信頼性レベル: note.mdのプログレスバー実装例に記載
   */
  private createProgressBar(): void {
    // 【プログレスボックス作成】: プログレスバーの背景を作成 🔵
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(240, 270, 800, 50);

    // 【プログレスバー作成】: 進捗を表示するバーを作成 🔵
    this.progressBar = this.add.graphics();

    // 【ローディングテキスト作成】: "Loading..."テキストを表示 🔵
    // 【実装内容】: 画面中央にテキストを配置
    const centerX = this.cameras.main.centerX;
    this.loadingText = this.add
      .text(centerX, 240, 'Loading...', {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }

  /**
   * updateProgressBar() - プログレスバー更新
   *
   * 【機能概要】: 読み込み進捗に応じてプログレスバーを更新する
   * 【実装方針】: progressイベントから渡される進捗率（0.0〜1.0）でバーの幅を変更
   * 【テスト対応】: T-0008-PROG-1のテストを通す
   * 🔵 信頼性レベル: note.mdのプログレスバー実装例に記載
   *
   * @param value - 進捗率（0.0〜1.0）
   */
  private updateProgressBar(value: number): void {
    // 【プログレスバー更新】: 進捗率に応じてバーの幅を変更 🔵
    // 【実装内容】: Graphics.clear()で前の描画をクリアし、新しい幅でfillRect()
    this.progressBar.clear();
    this.progressBar.fillStyle(0xdaa520, 1); // ゴールド色
    this.progressBar.fillRect(250, 280, 780 * value, 30);
  }

  /**
   * destroyProgressBar() - プログレスバー破棄
   *
   * 【機能概要】: 読み込み完了時にプログレスバーを破棄する
   * 【実装方針】: Graphics.destroy()でリソースを解放
   * 【テスト対応】: T-0008-PROG-4のテストを通す
   * 🔵 信頼性レベル: note.mdのプログレスバー実装例に記載
   */
  private destroyProgressBar(): void {
    // 【リソース解放】: プログレスバーとテキストを破棄 🔵
    // 【実装内容】: destroy()でGraphicsオブジェクトを削除
    this.progressBar.destroy();
    this.progressBox.destroy();
    this.loadingText.destroy();
  }

  /**
   * handleLoadError() - 読み込みエラーハンドリング
   *
   * 【機能概要】: ファイル読み込み失敗時のエラー処理
   * 【実装方針】: コンソールにエラーログを出力
   * 【テスト対応】: T-0008-ERR-1のテストを通す
   * 🟡 信頼性レベル: note.mdのエラーハンドリングセクションから妥当な推測
   *
   * @param file - 読み込みに失敗したファイル情報
   */
  private handleLoadError(file: { key: string; url: string }): void {
    // 【エラーログ出力】: ファイル読み込み失敗をコンソールに出力 🟡
    // 【実装内容】: console.error()でエラー情報を記録
    console.error('Failed to load file:', file.key, file.url);

    // 【エラーダイアログ表示】: ユーザーにエラーを通知（将来実装） 🔴
    // 【実装内容】: 最小限の実装では省略
  }
}
