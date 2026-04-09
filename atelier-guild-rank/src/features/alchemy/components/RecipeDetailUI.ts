/**
 * RecipeDetailUI コンポーネント（SlidePanel 合成版）
 *
 * Issue #474: レシピ詳細 SlidePanel を新規実装
 *
 * レシピの詳細情報（名前、行動コスト、必要素材、説明）をスライドパネルで表示する。
 *
 * 内部実装は `shared/presentation/ui/components/composite/SlidePanel` を合成し、
 * パネル本体の枠線・背景・開閉アニメーションは SlidePanel に委譲する。
 * オーバーレイ（画面全体の半透明背景・クリックで閉じる）および ESC キーは
 * このクラスで管理する。
 */

import { BaseComponent } from '@shared/components';
import { SlidePanel } from '@shared/presentation/ui/components/composite/SlidePanel';
import { DesignTokens, THEME } from '@shared/theme';
import type { IRecipeCardMaster } from '@shared/types/master-data';
import type Phaser from 'phaser';

// =============================================================================
// 定数
// =============================================================================

/** SlidePanel サイズ */
const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 380;

/** オーバーレイ */
const OVERLAY_COLOR = 0x000000;
const OVERLAY_ALPHA = 0.7;
const OVERLAY_DEPTH = 900;
const OPEN_OVERLAY_DURATION = 200;

/** テキスト配置（SlidePanel 左上基準） */
const TEXT_LEFT = 20;
const TEXT_RIGHT_MARGIN = 20;
const NAME_Y = 24;
const COST_Y = 64;
const MATERIALS_LABEL_Y = 104;
const MATERIALS_START_Y = 132;
const MATERIALS_LINE_HEIGHT = 24;
const DESCRIPTION_LABEL_OFFSET_Y = 16;
const DESCRIPTION_TEXT_OFFSET_Y = 28;

/** フォントサイズ */
const FONT_SIZE_TITLE = `${THEME.sizes.large}px`;
const FONT_SIZE_BODY = `${THEME.sizes.medium}px`;
const FONT_SIZE_SMALL = `${THEME.sizes.small}px`;

/** ボタン色 */
const CLOSE_BUTTON_BG_COLOR = '#9e9e9e';

// =============================================================================
// 型定義
// =============================================================================

/** RecipeDetailUI の設定 */
export interface RecipeDetailUIConfig {
  /** 表示するレシピ */
  recipe: IRecipeCardMaster;
  /** 素材IDから素材名を解決する関数（未指定時はmaterialIdをそのまま表示） */
  materialNameResolver?: (materialId: string) => string;
  /** 閉じる時のコールバック */
  onClose?: () => void;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * レシピ詳細スライドパネル
 *
 * 選択されたレシピの名前、行動コスト、必要素材、説明をスライドパネルで表示する。
 */
export class RecipeDetailUI extends BaseComponent {
  private config: RecipeDetailUIConfig;

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

  constructor(scene: Phaser.Scene, config: RecipeDetailUIConfig) {
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
    this.createDetailContent(this.config.recipe);
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

  private createDetailContent(recipe: IRecipeCardMaster): void {
    const contentWidth = PANEL_WIDTH - TEXT_LEFT - TEXT_RIGHT_MARGIN;

    // レシピ名
    const nameText = this.scene.add.text(TEXT_LEFT, NAME_Y, recipe.name, {
      fontSize: FONT_SIZE_TITLE,
      color: '#ffffff',
      fontStyle: 'bold',
      padding: { top: 4 },
    });
    this.panelContent.add(nameText);

    // 行動コスト
    const costText = this.scene.add.text(TEXT_LEFT, COST_Y, `行動コスト: ${recipe.cost}`, {
      fontSize: FONT_SIZE_BODY,
      color: '#cccccc',
      padding: { top: 4 },
    });
    this.panelContent.add(costText);

    // 必要素材ラベル
    const materialsLabel = this.scene.add.text(TEXT_LEFT, MATERIALS_LABEL_Y, '必要素材:', {
      fontSize: FONT_SIZE_SMALL,
      color: '#888888',
    });
    this.panelContent.add(materialsLabel);

    // 必要素材リスト
    const resolver = this.config.materialNameResolver;
    let materialEndY = MATERIALS_START_Y;

    for (let i = 0; i < recipe.requiredMaterials.length; i++) {
      const mat = recipe.requiredMaterials[i];
      const materialName = resolver ? resolver(mat.materialId) : mat.materialId;
      const qualityStr = mat.minQuality ? ` (${mat.minQuality}以上)` : '';
      const lineText = `・${materialName} x${mat.quantity}${qualityStr}`;
      const lineY = MATERIALS_START_Y + i * MATERIALS_LINE_HEIGHT;

      const matText = this.scene.add.text(TEXT_LEFT, lineY, lineText, {
        fontSize: FONT_SIZE_SMALL,
        color: '#aaaaaa',
      });
      this.panelContent.add(matText);
      materialEndY = lineY + MATERIALS_LINE_HEIGHT;
    }

    // 説明ラベル
    const descLabelY = materialEndY + DESCRIPTION_LABEL_OFFSET_Y;
    const descLabel = this.scene.add.text(TEXT_LEFT, descLabelY, '説明:', {
      fontSize: FONT_SIZE_SMALL,
      color: '#888888',
    });
    this.panelContent.add(descLabel);

    // 説明テキスト
    const descTextY = descLabelY + DESCRIPTION_TEXT_OFFSET_Y;
    const descText = this.scene.add.text(TEXT_LEFT, descTextY, recipe.description, {
      fontSize: FONT_SIZE_SMALL,
      color: '#aaaaaa',
      wordWrap: { width: contentWidth },
    });
    this.panelContent.add(descText);
  }

  private createCloseButton(): void {
    const closeBtn = this.scene.add.text(PANEL_WIDTH / 2, PANEL_HEIGHT - 40, '閉じる', {
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
}

/**
 * 新しい命名エイリアス: Issue #474 以降は `RecipeDetailSlidePanel` を推奨する。
 * 既存コードとの後方互換のため `RecipeDetailUI` も引き続きエクスポートする。
 */
export { RecipeDetailUI as RecipeDetailSlidePanel };
export type { RecipeDetailUIConfig as RecipeDetailSlidePanelConfig };
