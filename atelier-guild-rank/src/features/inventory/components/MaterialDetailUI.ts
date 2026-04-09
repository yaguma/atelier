/**
 * MaterialDetailUI コンポーネント（SlidePanel 合成版）
 *
 * Issue #473: MaterialDetailUI を SlidePanel ベースに刷新
 *
 * 素材の詳細情報（名前、品質、属性）をスライドパネルで表示する。
 * 既存の public API（`MaterialDetailUI`, `MaterialDetailUIConfig`）は互換性のため維持しており、
 * 呼び出し側からは従来どおり `new MaterialDetailUI(scene, config)` で利用できる。
 * 新しいエイリアス `MaterialDetailSlidePanel` も同一クラスを再エクスポートしている。
 *
 * 内部実装は `shared/presentation/ui/components/composite/SlidePanel` を合成し、
 * パネル本体の枠線・背景・開閉アニメーションは SlidePanel に委譲する。
 * オーバーレイ（画面全体の半透明背景・クリックで閉じる）および ESC キーは
 * このクラスで管理する。
 */

import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import { BaseComponent } from '@shared/components';
import { SlidePanel } from '@shared/presentation/ui/components/composite/SlidePanel';
import { Colors, DesignTokens, THEME } from '@shared/theme';
import type Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** SlidePanel サイズ */
const PANEL_WIDTH = 280;
const PANEL_HEIGHT = 240;

/** オーバーレイ */
const OVERLAY_COLOR = 0x000000;
const OVERLAY_ALPHA = 0.7;
const OVERLAY_DEPTH = 900;
const OPEN_OVERLAY_DURATION = 200;

/** テキスト配置（SlidePanel 左上基準） */
const TEXT_LEFT = 20;
const NAME_Y = 30;
const QUALITY_Y = 70;
const ATTR_LABEL_Y = 110;
const ATTR_VALUE_Y = 140;
const CLOSE_BUTTON_Y = 200;

/** フォントサイズ */
const FONT_SIZE_TITLE = `${THEME.sizes.large}px`;
const FONT_SIZE_BODY = `${THEME.sizes.medium}px`;
const FONT_SIZE_SMALL = `${THEME.sizes.small}px`;

/** ボタン色 */
const CLOSE_BUTTON_BG_COLOR = '#9e9e9e';

// =============================================================================
// 型定義
// =============================================================================

/** MaterialDetailUIの設定 */
export interface MaterialDetailUIConfig {
  /** 表示する素材 */
  material: MaterialInstance;
  /** 閉じる時のコールバック */
  onClose?: () => void;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * 素材詳細スライドパネル
 *
 * 選択された素材の名前、品質、属性などの詳細情報をスライドパネルで表示する。
 * クラス名は後方互換のため `MaterialDetailUI` を維持している。
 */
export class MaterialDetailUI extends BaseComponent {
  private config: MaterialDetailUIConfig;

  /** オーバーレイ（背景の暗いエリア、クリックで閉じる） */
  private overlay!: Phaser.GameObjects.Rectangle;

  /** スライドパネル本体（SlidePanel composite） */
  private slidePanel!: SlidePanel;

  /** SlidePanel の内部コンテンツコンテナ */
  private panelContent!: Phaser.GameObjects.Container;

  /** ESC キー（パネルを閉じるショートカット） */
  private escKey: Phaser.Input.Keyboard.Key | null = null;

  /** アニメーション中フラグ（二重操作防止用） */
  private animating = false;

  /** 破棄済みフラグ */
  private isDestroyed = false;

  /** コンテンツ要素（updateMaterial 時に再作成するため追跡する） */
  private detailElements: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, config: MaterialDetailUIConfig) {
    if (!config) {
      throw new Error('config is required');
    }

    const centerX = scene.cameras?.main?.width ? scene.cameras.main.width / 2 : 640;
    const centerY = scene.cameras?.main?.height ? scene.cameras.main.height / 2 : 360;

    super(scene, centerX, centerY);
    this.config = config;
  }

  /** UI を作成して開くアニメーションを再生する */
  create(): void {
    this.createOverlay();
    this.createSlidePanel();
    this.createDetailContent(this.config.material);
    this.createCloseButton();
    this.setupEscKey();
    this.playOpenAnimation();
  }

  /** リソース解放 */
  destroy(): void {
    this.isDestroyed = true;

    // Tween キャンセル
    if (this.overlay && this.scene.tweens?.killTweensOf) {
      this.scene.tweens.killTweensOf(this.overlay);
    }
    if (this.panelContent && this.scene.tweens?.killTweensOf) {
      this.scene.tweens.killTweensOf(this.panelContent);
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

    // SlidePanel の tween/bg 参照のみクリアし、container の破棄は親に任せる
    if (this.slidePanel) {
      this.slidePanel.destroy(false);
    }

    // コンテナ破棄（panelContent を含む全子要素を連鎖破棄）
    if (this.container) {
      this.container.destroy(true);
    }
  }

  /** 表示する素材を更新 */
  updateMaterial(material: MaterialInstance): void {
    this.config = { ...this.config, material };
    this.destroyDetailElements();
    this.createDetailContent(material);
  }

  /** パネルを閉じる */
  close(): void {
    if (this.isDestroyed) return;
    if (this.animating) return;

    this.animating = true;

    // open tween が進行中の場合にも安全なよう、overlay の tween を先にキャンセルする
    if (this.scene.tweens?.killTweensOf) {
      this.scene.tweens.killTweensOf(this.overlay);
    }

    // overlay と SlidePanel のフェードアウトを同じ duration で同期させる
    const closeDuration = DesignTokens.motion.duration.base;

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration: closeDuration,
      ease: 'Linear',
      onComplete: () => {
        // destroy() が先に呼ばれた場合、破棄済みオブジェクトへのアクセスを防ぐ
        if (this.isDestroyed) return;
        this.animating = false;
        this.config.onClose?.();
      },
    });

    // SlidePanel 側も同じ duration でフェードアウト
    this.slidePanel.close({ animate: true });
  }

  // ===========================================================================
  // private
  // ===========================================================================

  private createOverlay(): void {
    const width = this.scene.cameras?.main?.width || 1280;
    const height = this.scene.cameras?.main?.height || 720;

    this.overlay = this.scene.add.rectangle(0, 0, width, height, OVERLAY_COLOR, 0);
    this.overlay.setOrigin(0.5);

    this.overlay.setDepth(OVERLAY_DEPTH);
    this.overlay.setInteractive();
    this.overlay.on('pointerdown', () => this.close());
    this.container.add(this.overlay);
  }

  private createSlidePanel(): void {
    const cameraWidth = this.scene.cameras?.main?.width || 1280;
    const cameraHeight = this.scene.cameras?.main?.height || 720;
    const panelX = cameraWidth - PANEL_WIDTH - 20;
    const panelY = (cameraHeight - PANEL_HEIGHT) / 2;

    this.slidePanel = new SlidePanel(
      this.scene,
      panelX - this.container.x,
      panelY - this.container.y,
      {
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        addToScene: false,
      },
    );
    this.slidePanel.create();
    this.panelContent = this.slidePanel.getContentContainer();
    this.container.add(this.panelContent);
  }

  private createDetailContent(material: MaterialInstance): void {
    // 素材名
    const nameText = this.scene.add.text(TEXT_LEFT, NAME_Y, material.name, {
      fontSize: FONT_SIZE_TITLE,
      color: '#ffffff',
      fontStyle: 'bold',
      padding: { top: 4 },
    });
    this.panelContent.add(nameText);
    this.detailElements.push(nameText);

    // 品質表示
    const qualityColor = THEME.qualityColors[material.quality] ?? Colors.text.muted;
    const qualityText = this.scene.add.text(TEXT_LEFT, QUALITY_Y, `品質: ${material.quality}`, {
      fontSize: FONT_SIZE_BODY,
      color: `#${qualityColor.toString(16).padStart(6, '0')}`,
      padding: { top: 4 },
    });
    this.panelContent.add(qualityText);
    this.detailElements.push(qualityText);

    // 属性ラベル
    const attrLabel = this.scene.add.text(TEXT_LEFT, ATTR_LABEL_Y, '属性:', {
      fontSize: FONT_SIZE_SMALL,
      color: '#888888',
    });
    this.panelContent.add(attrLabel);
    this.detailElements.push(attrLabel);

    // 属性値
    const attrStr = material.attributes.join(', ');
    const attrText = this.scene.add.text(TEXT_LEFT, ATTR_VALUE_Y, attrStr || 'なし', {
      fontSize: FONT_SIZE_SMALL,
      color: '#aaaaaa',
    });
    this.panelContent.add(attrText);
    this.detailElements.push(attrText);
  }

  private createCloseButton(): void {
    const closeBtn = this.scene.add.text(PANEL_WIDTH / 2, CLOSE_BUTTON_Y, '閉じる', {
      fontSize: FONT_SIZE_BODY,
      color: '#ffffff',
      backgroundColor: CLOSE_BUTTON_BG_COLOR,
      padding: { x: 16, y: 8 },
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.close());

    this.panelContent.add(closeBtn);
  }

  private setupEscKey(): void {
    if (this.scene.input?.keyboard) {
      this.escKey = this.scene.input.keyboard.addKey('ESC');
      this.escKey.on('down', () => this.handleEscKey());
    }
  }

  private handleEscKey(): void {
    if (this.animating) return;
    this.close();
  }

  private playOpenAnimation(): void {
    this.scene.tweens.add({
      targets: this.overlay,
      alpha: OVERLAY_ALPHA,
      duration: OPEN_OVERLAY_DURATION,
      ease: 'Linear',
    });

    this.slidePanel.open();
  }

  private destroyDetailElements(): void {
    for (const element of this.detailElements) {
      if (this.panelContent) {
        this.panelContent.remove(element);
      }
      element.destroy();
    }
    this.detailElements = [];
  }
}

/**
 * 新しい命名エイリアス: Issue #473 以降は `MaterialDetailSlidePanel` を推奨する。
 * 既存コードとの後方互換のため `MaterialDetailUI` も引き続きエクスポートする。
 */
export { MaterialDetailUI as MaterialDetailSlidePanel };
export type { MaterialDetailUIConfig as MaterialDetailSlidePanelConfig };
