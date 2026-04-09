/**
 * QuestDetailModal コンポーネント（SlidePanel 合成版）
 *
 * Issue #470: モーダル→SlidePanel 移行
 *
 * 依頼の詳細情報を右側スライドパネルで表示する。
 * 既存の public API（`QuestDetailModal`, `QuestDetailModalConfig`）は互換性のため維持しており、
 * 呼び出し側からは従来どおり `new QuestDetailModal(scene, config)` で利用できる。
 * 新しいエイリアス `QuestDetailSlidePanel` も同一クラスを再エクスポートしている。
 *
 * 内部実装は `shared/presentation/ui/components/composite/SlidePanel` を合成し、
 * パネル本体の枠線・背景・開閉アニメーションは SlidePanel に委譲する。
 * オーバーレイ（画面全体の半透明背景・クリックで閉じる）および ESC キー・受注完了アニメーションは
 * 従来の詳細モーダル挙動との互換性のためこのクラスで管理する。
 *
 * @example
 * ```typescript
 * const panel = new QuestDetailModal(scene, {
 *   quest: questData,
 *   onAccept: (quest) => console.log('受注:', quest),
 *   onClose: () => console.log('閉じる'),
 * });
 * panel.create();
 * ```
 */

import type { Quest } from '@domain/entities/Quest';
import { formatCondition } from '@shared/utils';
import type Phaser from 'phaser';
import { BaseComponent } from './BaseComponent';
import { SlidePanel } from './composite/SlidePanel';

/**
 * QuestDetailModal の設定インターフェース
 */
export interface QuestDetailModalConfig {
  /** 表示する依頼 */
  quest: Quest;
  /** 受注ボタンクリック時のコールバック */
  onAccept: (quest: Quest) => void;
  /** 閉じるボタンクリック時のコールバック */
  onClose: () => void;
  /** アイテム名解決関数（itemId → 日本語名） */
  itemNameResolver?: (itemId: string) => string;
  /** 閲覧専用モード（受注ボタンを非表示にする） */
  viewOnly?: boolean;
}

/**
 * 依頼詳細 SlidePanel コンポーネント
 *
 * クラス名は後方互換のため `QuestDetailModal` を維持しているが、
 * 内部は SlidePanel 合成の詳細スライドパネルである。
 */
export class QuestDetailModal extends BaseComponent {
  /** 設定（コールバック関数を含む） */
  private config: QuestDetailModalConfig;

  /** 表示対象の依頼エンティティ */
  private quest: Quest;

  /** オーバーレイ（背景の暗いエリア、クリックで閉じる） */
  private overlay!: Phaser.GameObjects.Rectangle;

  /** スライドパネル本体（SlidePanel composite） */
  private slidePanel!: SlidePanel;

  /** SlidePanel の内部コンテンツコンテナ（テキスト・ボタンを追加する先） */
  private panelContent!: Phaser.GameObjects.Container;

  /** ESC キー（パネルを閉じるショートカット） */
  private escKey: Phaser.Input.Keyboard.Key | null = null;

  /** アニメーション中フラグ（二重操作防止用） */
  private animating = false;

  /** 破棄済みフラグ（destroy 後の操作防止用） */
  private isDestroyed = false;

  /** 受注完了テキスト（アニメーション用の一時的な要素） */
  private acceptCompleteText: Phaser.GameObjects.Text | null = null;

  // =============================================================================
  // レイアウト定数
  // =============================================================================

  /** SlidePanel の幅 */
  private static readonly PANEL_WIDTH = 400;
  /** SlidePanel の高さ */
  private static readonly PANEL_HEIGHT = 500;

  /** オーバーレイ色・深度 */
  private static readonly OVERLAY_DEPTH = 900;
  private static readonly OVERLAY_COLOR = 0x000000;
  private static readonly OVERLAY_ALPHA = 0.7;
  private static readonly OPEN_OVERLAY_DURATION = 200;
  private static readonly CLOSE_DURATION = 200;

  /** 受注完了テキストの深度 */
  private static readonly ACCEPT_COMPLETE_DEPTH = 1100;

  /** テキスト配置定数（SlidePanel の左上を起点とした相対座標） */
  private static readonly TEXT_LEFT = 20;
  private static readonly CLIENT_NAME_Y = 30;
  private static readonly CONDITION_Y = 70;
  private static readonly DEADLINE_Y = 120;
  private static readonly REWARD_Y = 160;
  private static readonly BUTTON_Y = 420;

  /** ボタン配置定数 */
  private static readonly ACCEPT_BUTTON_X = 120;
  private static readonly CLOSE_BUTTON_X = 260;

  /** 色定数 */
  private static readonly ACCEPT_BUTTON_BG_COLOR = '#4caf50';
  private static readonly CLOSE_BUTTON_BG_COLOR = '#9e9e9e';
  private static readonly ACCEPT_COMPLETE_COLOR = '#4caf50';

  /** フォントサイズ */
  private static readonly FONT_SIZE_TITLE = '16px';
  private static readonly FONT_SIZE_BODY = '14px';
  private static readonly FONT_SIZE_LARGE = '32px';

  /**
   * コンストラクタ
   *
   * @throws {Error} scene/config/quest/onAccept/onClose の検証エラー時
   */
  constructor(scene: Phaser.Scene, config: QuestDetailModalConfig) {
    if (!scene) {
      throw new Error('QuestDetailModal: scene is required');
    }
    if (!config) {
      throw new Error('QuestDetailModal: config is required');
    }
    if (!config.quest) {
      throw new Error('QuestDetailModal: config.quest is required');
    }
    if (typeof config.onAccept !== 'function') {
      throw new Error('QuestDetailModal: config.onAccept must be a function');
    }
    if (typeof config.onClose !== 'function') {
      throw new Error('QuestDetailModal: config.onClose must be a function');
    }

    // このコンポーネント自体はオーバーレイ配置の都合上、画面中央を基準にする
    const centerX = scene.cameras?.main?.width ? scene.cameras.main.width / 2 : 640;
    const centerY = scene.cameras?.main?.height ? scene.cameras.main.height / 2 : 360;

    super(scene, centerX, centerY);

    this.config = config;
    this.quest = config.quest;
  }

  /** UI を作成して開くアニメーションを再生する */
  public create(): void {
    this.createOverlay();
    this.createSlidePanel();
    this.setupEscKey();
    this.playOpenAnimation();
  }

  /**
   * オーバーレイ作成: 画面全体を覆う半透明のオーバーレイ。
   * クリックでパネルを閉じる。
   */
  private createOverlay(): void {
    const width = this.scene.cameras?.main?.width || 1280;
    const height = this.scene.cameras?.main?.height || 720;

    this.overlay = this.scene.add.rectangle(0, 0, width, height, QuestDetailModal.OVERLAY_COLOR, 0);
    this.overlay.setOrigin(0.5);

    if (this.overlay.setDepth) {
      this.overlay.setDepth(QuestDetailModal.OVERLAY_DEPTH);
    }

    this.overlay.setInteractive();
    this.overlay.on('pointerdown', () => this.close());
    this.container.add(this.overlay);
  }

  /**
   * SlidePanel 本体を作成し、依頼情報・アクションボタンを追加する。
   * SlidePanel はスクリーン右寄りに配置する。
   */
  private createSlidePanel(): void {
    const cameraWidth = this.scene.cameras?.main?.width || 1280;
    const cameraHeight = this.scene.cameras?.main?.height || 720;
    // SlidePanel は画面右側にフラッシュ（右端から 20px 内側）
    const panelX = cameraWidth - QuestDetailModal.PANEL_WIDTH - 20;
    const panelY = (cameraHeight - QuestDetailModal.PANEL_HEIGHT) / 2;

    // SlidePanel を合成する。親（このモーダル）の container 基準で配置するため
    // absolute 座標ではなく、オーバーレイと同じ BaseComponent 座標系にオフセットする。
    this.slidePanel = new SlidePanel(
      this.scene,
      panelX - this.container.x,
      panelY - this.container.y,
      {
        width: QuestDetailModal.PANEL_WIDTH,
        height: QuestDetailModal.PANEL_HEIGHT,
        addToScene: false,
      },
    );
    this.slidePanel.create();
    this.panelContent = this.slidePanel.getContentContainer();
    this.container.add(this.panelContent);

    this.createQuestInfoTexts();
    this.createActionButtons();
  }

  /**
   * 依頼者名・条件・期限・報酬のテキストを生成して SlidePanel に追加する。
   */
  private createQuestInfoTexts(): void {
    const clientName = this.quest.client?.name || '不明な依頼者';
    const clientNameText = this.scene.add.text(
      QuestDetailModal.TEXT_LEFT,
      QuestDetailModal.CLIENT_NAME_Y,
      `依頼者: ${clientName}`,
      {
        fontSize: QuestDetailModal.FONT_SIZE_TITLE,
        color: '#ffffff',
        fontStyle: 'bold',
      },
    );
    this.panelContent.add(clientNameText);

    const conditionLabel = formatCondition(this.quest.condition, {
      itemNameResolver: this.config.itemNameResolver,
    });
    const conditionText = this.scene.add.text(
      QuestDetailModal.TEXT_LEFT,
      QuestDetailModal.CONDITION_Y,
      `条件: ${conditionLabel}`,
      {
        fontSize: QuestDetailModal.FONT_SIZE_BODY,
        color: '#8fd3ff',
        fontStyle: 'bold',
      },
    );
    this.panelContent.add(conditionText);

    const deadline = this.quest.deadline || 0;
    const deadlineText = this.scene.add.text(
      QuestDetailModal.TEXT_LEFT,
      QuestDetailModal.DEADLINE_Y,
      `期限: ${deadline}日以内`,
      {
        fontSize: QuestDetailModal.FONT_SIZE_BODY,
        color: '#e0e0e0',
      },
    );
    this.panelContent.add(deadlineText);

    const gold = this.quest.baseGold || 0;
    const contribution = this.quest.baseContribution || 0;
    const rewardText = this.scene.add.text(
      QuestDetailModal.TEXT_LEFT,
      QuestDetailModal.REWARD_Y,
      `報酬: ${gold}G / ${contribution}貢献度`,
      {
        fontSize: QuestDetailModal.FONT_SIZE_BODY,
        color: '#e0e0e0',
      },
    );
    this.panelContent.add(rewardText);
  }

  /**
   * 受注・閉じるボタンを作成する。viewOnly の場合は受注ボタンを表示しない。
   */
  private createActionButtons(): void {
    if (!this.config.viewOnly) {
      const acceptBtn = this.createButton(
        QuestDetailModal.ACCEPT_BUTTON_X,
        QuestDetailModal.BUTTON_Y,
        '受注する',
        QuestDetailModal.ACCEPT_BUTTON_BG_COLOR,
        () => this.handleAccept(),
      );
      this.panelContent.add(acceptBtn);
    }

    const closeX = this.config.viewOnly
      ? QuestDetailModal.PANEL_WIDTH / 2
      : QuestDetailModal.CLOSE_BUTTON_X;
    const closeBtn = this.createButton(
      closeX,
      QuestDetailModal.BUTTON_Y,
      '閉じる',
      QuestDetailModal.CLOSE_BUTTON_BG_COLOR,
      () => this.close(),
    );
    this.panelContent.add(closeBtn);
  }

  /**
   * テキストボタンを作成するヘルパー
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

    if (btn.setInteractive) {
      btn.setInteractive({ useHandCursor: true });
    }
    if (btn.on) {
      btn.on('pointerdown', onClick);
    }

    return btn;
  }

  /** ESC キーリスナーを設定する */
  private setupEscKey(): void {
    if (this.scene.input?.keyboard) {
      this.escKey = this.scene.input.keyboard.addKey('ESC');
      this.escKey.on('down', () => this.handleEscKey());
    }
  }

  /**
   * 開くアニメーション再生: オーバーレイのフェードインと SlidePanel の open。
   */
  private playOpenAnimation(): void {
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: QuestDetailModal.OVERLAY_ALPHA,
      duration: QuestDetailModal.OPEN_OVERLAY_DURATION,
      ease: 'Linear',
    });

    // SlidePanel の open() が内部で tween を走らせる
    this.slidePanel.open();
  }

  /**
   * 難易度を星表示にフォーマットする
   *
   * @param difficulty - 難易度（1-5）
   * @returns 星表示文字列（例: ★★★☆☆）
   */
  public formatDifficulty(difficulty: number): string {
    const maxStars = 5;
    const clamped = Math.max(0, Math.min(maxStars, difficulty));
    const filled = '★'.repeat(clamped);
    const empty = '☆'.repeat(maxStars - clamped);
    return filled + empty;
  }

  /** 受注ボタン押下時の処理 */
  public handleAccept(): void {
    if (this.animating) return;
    this.config.onAccept(this.quest);
  }

  /** ESC キー押下時の処理 */
  public handleEscKey(): void {
    if (this.animating) return;
    this.close();
  }

  /** 受注成功アニメーション: 「受注完了!」テキストをフェードイン・アウト表示する */
  public playAcceptAnimation(): void {
    this.animating = true;

    this.acceptCompleteText = this.scene.add.text(0, 0, '受注完了!', {
      fontSize: QuestDetailModal.FONT_SIZE_LARGE,
      color: QuestDetailModal.ACCEPT_COMPLETE_COLOR,
      fontStyle: 'bold',
    });
    this.acceptCompleteText.setOrigin(0.5);
    this.acceptCompleteText.setDepth(QuestDetailModal.ACCEPT_COMPLETE_DEPTH);
    this.acceptCompleteText.setScale(0);

    const scaleInDuration = 300;
    const fadeOutDelay = 500;
    const fadeOutDuration = 200;

    this.scene.tweens.add({
      targets: this.acceptCompleteText,
      scale: 1,
      duration: scaleInDuration,
      ease: 'Back.Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.acceptCompleteText,
          alpha: 0,
          duration: fadeOutDuration,
          delay: fadeOutDelay,
          onComplete: () => {
            this.animating = false;
          },
        });
      },
    });
  }

  /** パネルを閉じる */
  public close(): void {
    if (this.isDestroyed) return;
    if (this.animating) return;

    this.animating = true;

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration: QuestDetailModal.CLOSE_DURATION,
      ease: 'Linear',
      onComplete: () => {
        this.animating = false;
        this.config.onClose();
      },
    });

    // SlidePanel 側のフェードアウト
    this.slidePanel.close();
  }

  /** アニメーション中フラグ設定 */
  public setAnimating(value: boolean): void {
    this.animating = value;
  }

  /** アニメーション中フラグ取得 */
  public isAnimating(): boolean {
    return this.animating;
  }

  /** リソース解放 */
  public destroy(): void {
    this.isDestroyed = true;

    // Tween キャンセル
    if (this.overlay && this.scene.tweens?.killTweensOf) {
      this.scene.tweens.killTweensOf(this.overlay);
    }
    if (this.panelContent && this.scene.tweens?.killTweensOf) {
      this.scene.tweens.killTweensOf(this.panelContent);
    }
    if (this.acceptCompleteText) {
      if (this.scene.tweens?.killTweensOf) {
        this.scene.tweens.killTweensOf(this.acceptCompleteText);
      }
      this.acceptCompleteText.destroy();
      this.acceptCompleteText = null;
    }

    // ESC キーリスナー解除
    if (this.escKey) {
      this.escKey.off('down');
      if (this.scene.input?.keyboard) {
        this.scene.input.keyboard.removeKey('ESC');
      }
      this.escKey = null;
    }

    // オーバーレイ破棄
    if (this.overlay) {
      this.overlay.off('pointerdown');
      this.overlay.destroy();
    }

    // SlidePanel 破棄
    if (this.slidePanel) {
      this.slidePanel.destroy();
    }

    // コンテナ破棄
    if (this.container) {
      this.container.destroy();
    }
  }
}

/**
 * 新しい命名エイリアス: Issue #470 以降は `QuestDetailSlidePanel` を推奨する。
 * 既存コードとの後方互換のため `QuestDetailModal` も引き続きエクスポートする。
 */
export { QuestDetailModal as QuestDetailSlidePanel };
export type { QuestDetailModalConfig as QuestDetailSlidePanelConfig };
