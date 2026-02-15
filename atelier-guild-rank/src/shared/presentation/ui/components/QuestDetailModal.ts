/**
 * QuestDetailModalコンポーネント
 * TASK-0043 依頼詳細モーダル・受注アニメーション
 *
 * @description
 * 依頼の詳細情報を表示するモーダルダイアログ。
 * 依頼者名、依頼内容、期限、報酬、難易度を表示し、
 * 受注・閉じるボタンを提供する。
 *
 * @example
 * ```typescript
 * const modal = new QuestDetailModal(scene, {
 *   quest: questData,
 *   onAccept: (quest) => console.log('受注:', quest),
 *   onClose: () => console.log('閉じる'),
 * });
 * modal.create();
 * ```
 */

import type { Quest } from '@domain/entities/Quest';
import type Phaser from 'phaser';
import { BaseComponent } from './BaseComponent';

/**
 * QuestDetailModalの設定インターフェース
 */
export interface QuestDetailModalConfig {
  /** 表示する依頼 */
  quest: Quest;
  /** 受注ボタンクリック時のコールバック */
  onAccept: (quest: Quest) => void;
  /** 閉じるボタンクリック時のコールバック */
  onClose: () => void;
}

/**
 * QuestDetailModalコンポーネント
 *
 * 依頼の詳細情報をモーダルダイアログで表示する。
 * オーバーレイ、パネル、依頼情報、受注・閉じるボタンを含む。
 */
export class QuestDetailModal extends BaseComponent {
  /** 設定（コールバック関数を含む） */
  private config: QuestDetailModalConfig;

  /** 表示対象の依頼エンティティ */
  private quest: Quest;

  /** オーバーレイ（背景の暗いエリア、クリックで閉じる） */
  private overlay!: Phaser.GameObjects.Rectangle;

  /** パネル（モーダル本体のコンテナ、子要素を全て保持） */
  private panel!: Phaser.GameObjects.Container;

  /** ESCキー（モーダルを閉じるショートカット） */
  private escKey: Phaser.Input.Keyboard.Key | null = null;

  /** アニメーション中フラグ（二重操作防止用） */
  private animating = false;

  /** 破棄済みフラグ（destroy後の操作防止用） */
  private isDestroyed = false;

  /** 受注完了テキスト（アニメーション用の一時的な要素） */
  private acceptCompleteText: Phaser.GameObjects.Text | null = null;

  // =============================================================================
  // レイアウト定数
  // =============================================================================

  /**
   * 【深度定数】: 各要素の描画順序を定義
   * 【設計意図】: オーバーレイ→パネル→完了テキストの順で前面に表示
   */
  private static readonly OVERLAY_DEPTH = 900;
  private static readonly PANEL_DEPTH = 1000;
  private static readonly ACCEPT_COMPLETE_DEPTH = 1100;

  /**
   * 【パネル寸法定数】: モーダルパネルのサイズを定義
   */
  private static readonly PANEL_WIDTH = 400;
  private static readonly PANEL_HEIGHT = 350;

  /**
   * 【アニメーション時間定数】: 各アニメーションの時間（ミリ秒）
   * 【設計意図】: 開く/閉じるアニメーションの速度を統一管理
   */
  private static readonly OPEN_OVERLAY_DURATION = 200;
  private static readonly OPEN_PANEL_DURATION = 300;
  private static readonly CLOSE_DURATION = 200;

  /**
   * 【パネル初期スケール定数】: 開くアニメーション開始時のスケール
   */
  private static readonly PANEL_INITIAL_SCALE = 0.8;

  /**
   * 【テキスト配置定数】: パネル内のテキスト要素の位置を定義
   */
  private static readonly TEXT_LEFT_MARGIN = -180;
  private static readonly CLIENT_NAME_Y = -150;
  private static readonly DEADLINE_Y = -100;
  private static readonly REWARD_Y = -50;
  private static readonly BUTTON_Y = 100;

  /**
   * 【ボタン配置定数】: 受注/閉じるボタンの位置を定義
   */
  private static readonly ACCEPT_BUTTON_X = -50;
  private static readonly CLOSE_BUTTON_X = 50;

  /**
   * 【色定数】: UIの色を定義
   */
  private static readonly PANEL_BG_COLOR = 0xffffff;
  private static readonly OVERLAY_COLOR = 0x000000;
  private static readonly OVERLAY_ALPHA = 0.7;
  private static readonly ACCEPT_BUTTON_BG_COLOR = '#4caf50';
  private static readonly CLOSE_BUTTON_BG_COLOR = '#9e9e9e';
  private static readonly ACCEPT_COMPLETE_COLOR = '#4caf50';

  /**
   * 【フォントサイズ定数】: テキストのフォントサイズを定義
   */
  private static readonly FONT_SIZE_TITLE = '16px';
  private static readonly FONT_SIZE_BODY = '14px';
  private static readonly FONT_SIZE_LARGE = '32px';

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @param config - モーダル設定
   * @throws {Error} sceneがnullの場合
   * @throws {Error} configがnullの場合
   * @throws {Error} config.questがnullの場合
   * @throws {Error} config.onAcceptが関数でない場合
   * @throws {Error} config.onCloseが関数でない場合
   */
  constructor(scene: Phaser.Scene, config: QuestDetailModalConfig) {
    // 【入力値検証】: sceneがnullの場合
    if (!scene) {
      throw new Error('QuestDetailModal: scene is required');
    }

    // 【入力値検証】: configがnullの場合
    if (!config) {
      throw new Error('QuestDetailModal: config is required');
    }

    // 【入力値検証】: config.questがnullの場合
    if (!config.quest) {
      throw new Error('QuestDetailModal: config.quest is required');
    }

    // 【入力値検証】: config.onAcceptが関数でない場合
    if (typeof config.onAccept !== 'function') {
      throw new Error('QuestDetailModal: config.onAccept must be a function');
    }

    // 【入力値検証】: config.onCloseが関数でない場合
    if (typeof config.onClose !== 'function') {
      throw new Error('QuestDetailModal: config.onClose must be a function');
    }

    // 【画面中央に配置】
    const centerX = scene.cameras?.main?.width ? scene.cameras.main.width / 2 : 640;
    const centerY = scene.cameras?.main?.height ? scene.cameras.main.height / 2 : 360;

    super(scene, centerX, centerY);

    this.config = config;
    this.quest = config.quest;
  }

  /**
   * モーダルUIを作成
   */
  public create(): void {
    this.createOverlay();
    this.createPanel();
    this.setupEscKey();
    this.playOpenAnimation();
  }

  /**
   * 【オーバーレイ作成】: 画面全体を覆う半透明のオーバーレイを作成
   *
   * 【設計意図】:
   * - 背景を暗くしてモーダルに注目させる
   * - オーバーレイクリックでモーダルを閉じる（UX向上）
   * - アルファは0から開始し、アニメーションでフェードイン
   */
  private createOverlay(): void {
    // 【画面サイズ取得】: カメラのサイズを取得（存在しない場合はデフォルト値）
    const width = this.scene.cameras?.main?.width || 1280;
    const height = this.scene.cameras?.main?.height || 720;

    // 【オーバーレイ作成】: アルファ0で作成し、アニメーションでフェードイン
    this.overlay = this.scene.add.rectangle(0, 0, width, height, QuestDetailModal.OVERLAY_COLOR, 0);
    this.overlay.setOrigin(0.5);

    // 【型安全性】: テストモックでsetDepthが定義されていない場合の対策
    if (this.overlay.setDepth) {
      this.overlay.setDepth(QuestDetailModal.OVERLAY_DEPTH);
    }

    // 【インタラクティブ設定】: オーバーレイクリックでモーダルを閉じる
    this.overlay.setInteractive();
    this.overlay.on('pointerdown', () => this.close());
    this.container.add(this.overlay);
  }

  /**
   * 【パネル作成】: モーダル本体のパネルを作成
   *
   * 【設計意図】:
   * - 依頼の詳細情報を見やすく整理して表示
   * - 受注/閉じるボタンを明確に配置
   * - アニメーション用にスケールとアルファを初期設定
   */
  private createPanel(): void {
    // 【パネルコンテナ作成】: 全ての子要素を保持するコンテナ
    this.panel = this.scene.add.container(0, 0);

    // 【型安全性】: テストモックでsetDepthが定義されていない場合の対策
    if (this.panel.setDepth) {
      this.panel.setDepth(QuestDetailModal.PANEL_DEPTH);
    }
    // 【アニメーション初期状態】: スケール0.8、アルファ0から開始
    if (this.panel.setScale) {
      this.panel.setScale(QuestDetailModal.PANEL_INITIAL_SCALE);
    }
    if (this.panel.setAlpha) {
      this.panel.setAlpha(0);
    }

    // 【パネル背景作成】: 白背景の矩形
    this.createPanelBackground();

    // 【依頼情報テキスト作成】: 依頼者名、期限、報酬を表示
    this.createQuestInfoTexts();

    // 【ボタン作成】: 受注/閉じるボタンを作成
    this.createActionButtons();

    // 【コンテナに追加】: パネルをメインコンテナに追加
    this.container.add(this.panel);
  }

  /**
   * 【パネル背景作成】: モーダルパネルの背景矩形を作成
   */
  private createPanelBackground(): void {
    const panelBg = this.scene.add.rectangle(
      0,
      0,
      QuestDetailModal.PANEL_WIDTH,
      QuestDetailModal.PANEL_HEIGHT,
      QuestDetailModal.PANEL_BG_COLOR,
    );
    this.panel.add(panelBg);
  }

  /**
   * 【依頼情報テキスト作成】: 依頼者名、期限、報酬を表示するテキスト要素を作成
   *
   * 【設計意図】:
   * - 依頼者名は太字で目立たせる
   * - 期限と報酬は通常スタイルで表示
   * - 全てのテキストをパネルに追加
   */
  private createQuestInfoTexts(): void {
    // 【依頼者名】: 太字で表示、不明な場合はデフォルト値
    const clientName = this.quest.client?.name || '不明な依頼者';
    const clientNameText = this.scene.add.text(
      QuestDetailModal.TEXT_LEFT_MARGIN,
      QuestDetailModal.CLIENT_NAME_Y,
      `依頼者: ${clientName}`,
      {
        fontSize: QuestDetailModal.FONT_SIZE_TITLE,
        color: '#000000',
        fontStyle: 'bold',
      },
    );
    this.panel.add(clientNameText);

    // 【期限】: 「○日以内」形式で表示
    const deadline = this.quest.deadline || 0;
    const deadlineText = this.scene.add.text(
      QuestDetailModal.TEXT_LEFT_MARGIN,
      QuestDetailModal.DEADLINE_Y,
      `期限: ${deadline}日以内`,
      {
        fontSize: QuestDetailModal.FONT_SIZE_BODY,
        color: '#333333',
      },
    );
    this.panel.add(deadlineText);

    // 【報酬】: 「○G / ○貢献度」形式で表示
    const gold = this.quest.baseGold || 0;
    const contribution = this.quest.baseContribution || 0;
    const rewardText = this.scene.add.text(
      QuestDetailModal.TEXT_LEFT_MARGIN,
      QuestDetailModal.REWARD_Y,
      `報酬: ${gold}G / ${contribution}貢献度`,
      {
        fontSize: QuestDetailModal.FONT_SIZE_BODY,
        color: '#333333',
      },
    );
    this.panel.add(rewardText);
  }

  /**
   * 【アクションボタン作成】: 受注/閉じるボタンを作成
   *
   * 【設計意図】:
   * - 受注ボタンは緑色で目立たせる（アクション誘導）
   * - 閉じるボタンはグレーで控えめに
   * - 両方のボタンにハンドカーソルを設定
   */
  private createActionButtons(): void {
    // 【受注ボタン作成】
    const acceptBtn = this.createButton(
      QuestDetailModal.ACCEPT_BUTTON_X,
      QuestDetailModal.BUTTON_Y,
      '受注する',
      QuestDetailModal.ACCEPT_BUTTON_BG_COLOR,
      () => this.handleAccept(),
    );
    this.panel.add(acceptBtn);

    // 【閉じるボタン作成】
    const closeBtn = this.createButton(
      QuestDetailModal.CLOSE_BUTTON_X,
      QuestDetailModal.BUTTON_Y,
      '閉じる',
      QuestDetailModal.CLOSE_BUTTON_BG_COLOR,
      () => this.close(),
    );
    this.panel.add(closeBtn);
  }

  /**
   * 【ボタン作成ヘルパー】: テキストボタンを作成する共通処理
   *
   * @param x - X座標
   * @param y - Y座標
   * @param label - ボタンのラベルテキスト
   * @param bgColor - 背景色
   * @param onClick - クリック時のコールバック
   * @returns 作成したテキストオブジェクト
   */
  private createButton(
    x: number,
    y: number,
    label: string,
    bgColor: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const btn = this.scene.add.text(x, y, label, {
      fontSize: QuestDetailModal.FONT_SIZE_TITLE,
      color: '#ffffff',
      backgroundColor: bgColor,
      padding: { x: 16, y: 8 },
    });
    btn.setOrigin(0.5);

    // 【型安全性】: テストモックでsetInteractive/onが定義されていない場合の対策
    if (btn.setInteractive) {
      btn.setInteractive({ useHandCursor: true });
    }
    if (btn.on) {
      btn.on('pointerdown', onClick);
    }

    return btn;
  }

  /**
   * 【ESCキー設定】: ESCキーでモーダルを閉じる機能を設定
   *
   * 【設計意図】:
   * - キーボードユーザーのUXを向上
   * - ゲームの標準的なキャンセル操作に対応
   */
  private setupEscKey(): void {
    if (this.scene.input?.keyboard) {
      this.escKey = this.scene.input.keyboard.addKey('ESC');
      this.escKey.on('down', () => this.handleEscKey());
    }
  }

  /**
   * 【開くアニメーション再生】: オーバーレイのフェードインとパネルのスケールイン
   *
   * 【設計意図】:
   * - 開くアニメーション中でもボタン操作は許可する（UX向上のため）
   * - animatingはfalseのまま維持（閉じるアニメーションと受注アニメーションでのみtrueにする）
   * - オーバーレイは透明→半透明にフェードイン
   * - パネルは小さい状態→通常サイズにスケールイン
   */
  private playOpenAnimation(): void {
    // 【オーバーレイのフェードイン】: alpha 0→0.7
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: QuestDetailModal.OVERLAY_ALPHA,
      duration: QuestDetailModal.OPEN_OVERLAY_DURATION,
      ease: 'Linear',
    });

    // 【パネルのスケールイン】: scale 0.8→1, alpha 0→1
    this.scene.tweens.add({
      targets: this.panel,
      scale: 1,
      alpha: 1,
      duration: QuestDetailModal.OPEN_PANEL_DURATION,
      ease: 'Back.Out',
    });
  }

  /**
   * 【難易度フォーマット】: 数値を星表示に変換
   *
   * 【設計意図】:
   * - 難易度を視覚的にわかりやすく表現
   * - ★で埋まった星、☆で空の星を表示
   * - 0-5の範囲にクランプして不正値を防止
   *
   * @param difficulty - 難易度（1-5）
   * @returns 星表示文字列（例: ★★★☆☆）
   */
  public formatDifficulty(difficulty: number): string {
    // 【バリデーション】: 0-5の範囲にクランプ
    const maxStars = 5;
    const clamped = Math.max(0, Math.min(maxStars, difficulty));
    const filled = '★'.repeat(clamped);
    const empty = '☆'.repeat(maxStars - clamped);
    return filled + empty;
  }

  /**
   * 【受注処理】: 受注ボタンクリック時の処理
   *
   * 【設計意図】:
   * - アニメーション中は二重操作を防止
   * - コールバックを通じて親コンポーネントに通知
   */
  public handleAccept(): void {
    // 【二重操作防止】: アニメーション中は処理をスキップ
    if (this.animating) return;

    this.config.onAccept(this.quest);
  }

  /**
   * 【ESCキー処理】: ESCキー押下時の処理
   *
   * 【設計意図】:
   * - アニメーション中は二重操作を防止
   * - ESCキーでモーダルを閉じる標準的な操作に対応
   */
  public handleEscKey(): void {
    // 【二重操作防止】: アニメーション中は処理をスキップ
    if (this.animating) return;
    this.close();
  }

  /**
   * 【受注成功アニメーション再生】: 「受注完了！」テキスト表示
   *
   * 【設計意図】:
   * - 受注成功をユーザーに明確にフィードバック
   * - スケールインで注目を集め、フェードアウトで自然に消える
   * - アニメーション中は他の操作をブロック
   */
  public playAcceptAnimation(): void {
    // 【アニメーション開始】: 他の操作をブロック
    this.animating = true;

    // 【完了テキスト作成】: 画面中央に配置
    this.acceptCompleteText = this.scene.add.text(0, 0, '受注完了!', {
      fontSize: QuestDetailModal.FONT_SIZE_LARGE,
      color: QuestDetailModal.ACCEPT_COMPLETE_COLOR,
      fontStyle: 'bold',
    });
    this.acceptCompleteText.setOrigin(0.5);
    this.acceptCompleteText.setDepth(QuestDetailModal.ACCEPT_COMPLETE_DEPTH);
    this.acceptCompleteText.setScale(0);

    // 【スケールインアニメーション】: 0→1にスケールイン
    const scaleInDuration = 300;
    const fadeOutDelay = 500;
    const fadeOutDuration = 200;

    this.scene.tweens.add({
      targets: this.acceptCompleteText,
      scale: 1,
      duration: scaleInDuration,
      ease: 'Back.Out',
      onComplete: () => {
        // 【フェードアウトアニメーション】: 表示後にフェードアウト
        this.scene.tweens.add({
          targets: this.acceptCompleteText,
          alpha: 0,
          duration: fadeOutDuration,
          delay: fadeOutDelay,
          onComplete: () => {
            // 【アニメーション完了】: 操作を再度許可
            this.animating = false;
          },
        });
      },
    });
  }

  /**
   * 【閉じる処理】: モーダルを閉じる
   *
   * 【設計意図】:
   * - 破棄済み・アニメーション中は処理をスキップ
   * - フェードアウトアニメーションで自然に閉じる
   * - 完了後にコールバックを呼び出して親に通知
   */
  public close(): void {
    // 【ガード】: 既に破棄済みの場合は何もしない
    if (this.isDestroyed) return;

    // 【二重操作防止】: アニメーション中は処理をスキップ
    if (this.animating) return;

    // 【アニメーション開始】: 他の操作をブロック
    this.animating = true;

    // 【フェードアウトアニメーション】: オーバーレイとパネルを同時にフェードアウト
    this.scene.tweens.add({
      targets: [this.overlay, this.panel],
      alpha: 0,
      duration: QuestDetailModal.CLOSE_DURATION,
      ease: 'Linear',
      onComplete: () => {
        // 【アニメーション完了】: 操作を再度許可し、コールバックを呼び出す
        this.animating = false;
        this.config.onClose();
      },
    });
  }

  /**
   * 【アニメーション中フラグ設定】: 外部からアニメーション状態を制御
   *
   * @param value - 設定するフラグ値
   */
  public setAnimating(value: boolean): void {
    this.animating = value;
  }

  /**
   * 【アニメーション中フラグ取得】: 現在のアニメーション状態を取得
   *
   * @returns アニメーション中かどうか
   */
  public isAnimating(): boolean {
    return this.animating;
  }

  /**
   * 【リソース解放】: すべてのGameObjectsを破棄
   *
   * 【設計意図】:
   * - メモリリークを防止するため、全ての要素を適切に破棄
   * - Tweenを先にキャンセルして、完了コールバックが呼ばれるのを防止
   * - イベントリスナーを解除してから破棄
   * - 破棄順序: Tween → イベントリスナー → 子要素 → コンテナ
   */
  public destroy(): void {
    // 【破棄済みフラグ設定】: 二重破棄を防止
    this.isDestroyed = true;

    // 【Tweenのキャンセル】: アニメーション中に破棄された場合の対策
    this.cancelTweens();

    // 【ESCキーリスナー解除】: キーボードイベントをクリーンアップ
    this.cleanupEscKey();

    // 【オーバーレイを破棄】: イベントリスナーを解除してから破棄
    this.destroyOverlay();

    // 【パネルを破棄】: 子要素も含めて破棄
    this.destroyPanel();

    // 【コンテナを破棄】: 最後にコンテナ自体を破棄
    if (this.container) {
      this.container.destroy();
    }
  }

  /**
   * 【Tweenキャンセル】: 実行中のTweenをキャンセル
   */
  private cancelTweens(): void {
    // 【型安全性】: テストモックでkillTweensOfが定義されていない場合の対策
    if (this.overlay && this.scene.tweens?.killTweensOf) {
      this.scene.tweens.killTweensOf(this.overlay);
    }
    if (this.panel && this.scene.tweens?.killTweensOf) {
      this.scene.tweens.killTweensOf(this.panel);
    }

    // 【完了テキストの破棄】: 存在する場合はTweenキャンセル後に破棄
    if (this.acceptCompleteText) {
      if (this.scene.tweens?.killTweensOf) {
        this.scene.tweens.killTweensOf(this.acceptCompleteText);
      }
      this.acceptCompleteText.destroy();
      this.acceptCompleteText = null;
    }
  }

  /**
   * 【ESCキーリスナー解除】: キーボードイベントをクリーンアップ
   */
  private cleanupEscKey(): void {
    if (this.escKey) {
      this.escKey.off('down');
      if (this.scene.input?.keyboard) {
        this.scene.input.keyboard.removeKey('ESC');
      }
      this.escKey = null;
    }
  }

  /**
   * 【オーバーレイ破棄】: オーバーレイのイベントリスナーを解除し破棄
   */
  private destroyOverlay(): void {
    if (this.overlay) {
      this.overlay.off('pointerdown');
      this.overlay.destroy();
    }
  }

  /**
   * 【パネル破棄】: パネルとその子要素を破棄
   */
  private destroyPanel(): void {
    if (this.panel) {
      this.panel.destroy();
    }
  }
}
