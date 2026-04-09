/**
 * RankDetailUI コンポーネント（SlidePanel 合成版）
 *
 * Issue #475: ランク詳細 SlidePanel を新規実装
 *
 * ランクの詳細情報（必要貢献度、日数制限、特殊ルール、昇格ボーナス）を
 * スライドパネルで表示する。
 *
 * 内部実装は `shared/presentation/ui/components/composite/SlidePanel` を合成し、
 * パネル本体の枠線・背景・開閉アニメーションは SlidePanel に委譲する。
 * オーバーレイ（画面全体の半透明背景・クリックで閉じる）および ESC キーは
 * このクラスで管理する。
 */

import { BaseComponent } from '@shared/components';
import { PROMOTION_BONUS_BASE } from '@shared/constants';
import { SlidePanel } from '@shared/presentation/ui/components/composite/SlidePanel';
import { Colors, DesignTokens, RANK_COLORS, THEME } from '@shared/theme';
import type { IGuildRankMaster } from '@shared/types/master-data';
import type Phaser from 'phaser';
import { getNextRank, getRankOrder } from '../services/rank-operations';

// =============================================================================
// 定数
// =============================================================================

/** SlidePanel サイズ */
const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 440;

/** オーバーレイ */
const OVERLAY_COLOR = 0x000000;
const OVERLAY_ALPHA = 0.7;
const OVERLAY_DEPTH = 900;
const OPEN_OVERLAY_DURATION = 200;

/** テキスト配置（SlidePanel 左上基準） */
const TEXT_LEFT = 20;
const TEXT_RIGHT_MARGIN = 20;
const NAME_Y = 24;
const CONTRIBUTION_LABEL_Y = 68;
const CONTRIBUTION_VALUE_Y = 92;
const DAYLIMIT_Y = 124;
const RULES_LABEL_Y = 164;
const RULES_START_Y = 192;
const RULES_LINE_HEIGHT = 24;
const BONUS_OFFSET_Y = 16;
const CLOSE_BUTTON_BOTTOM_MARGIN = 40;

/** フォントサイズ */
const FONT_SIZE_TITLE = `${THEME.sizes.large}px`;
const FONT_SIZE_BODY = `${THEME.sizes.medium}px`;
const FONT_SIZE_SMALL = `${THEME.sizes.small}px`;

/** ボタン色 */
const CLOSE_BUTTON_BG_COLOR = '#9e9e9e';

// =============================================================================
// 型定義
// =============================================================================

/** RankDetailUI の設定 */
export interface RankDetailUIConfig {
  /** 表示するランクのマスターデータ */
  rankMaster: IGuildRankMaster;
  /** 現在の累積貢献度 */
  currentContribution: number;
  /** 閉じる時のコールバック */
  onClose?: () => void;
}

// =============================================================================
// コンポーネント
// =============================================================================

/**
 * ランク詳細スライドパネル
 *
 * 選択されたランクの詳細情報をスライドパネルで表示する。
 */
export class RankDetailUI extends BaseComponent {
  private config: RankDetailUIConfig;

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

  constructor(scene: Phaser.Scene, config: RankDetailUIConfig) {
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
    this.createDetailContent(this.config.rankMaster);
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

  private createDetailContent(rankMaster: IGuildRankMaster): void {
    const contentWidth = PANEL_WIDTH - TEXT_LEFT - TEXT_RIGHT_MARGIN;
    const rankColor = RANK_COLORS[rankMaster.id] ?? Colors.text.primary;
    const rankColorHex = `#${rankColor.toString(16).padStart(6, '0')}`;

    // ランク名
    const nameText = this.scene.add.text(TEXT_LEFT, NAME_Y, rankMaster.name, {
      fontSize: FONT_SIZE_TITLE,
      color: rankColorHex,
      fontStyle: 'bold',
      padding: { top: 4 },
    });
    this.panelContent.add(nameText);

    // 貢献度ラベル
    const contribLabel = this.scene.add.text(TEXT_LEFT, CONTRIBUTION_LABEL_Y, '貢献度:', {
      fontSize: FONT_SIZE_SMALL,
      color: '#888888',
    });
    this.panelContent.add(contribLabel);

    // 貢献度値（現在 / 必要）
    const contribStr = `${this.config.currentContribution} / ${rankMaster.requiredContribution}`;
    const contribText = this.scene.add.text(TEXT_LEFT, CONTRIBUTION_VALUE_Y, contribStr, {
      fontSize: FONT_SIZE_BODY,
      color: '#cccccc',
      padding: { top: 4 },
    });
    this.panelContent.add(contribText);

    // 日数制限
    const dayLimitStr = `日数制限: ${rankMaster.dayLimit}日`;
    const dayLimitText = this.scene.add.text(TEXT_LEFT, DAYLIMIT_Y, dayLimitStr, {
      fontSize: FONT_SIZE_BODY,
      color: '#cccccc',
      padding: { top: 4 },
    });
    this.panelContent.add(dayLimitText);

    // 特殊ルールラベル
    const rulesLabel = this.scene.add.text(TEXT_LEFT, RULES_LABEL_Y, '特殊ルール:', {
      fontSize: FONT_SIZE_SMALL,
      color: '#888888',
    });
    this.panelContent.add(rulesLabel);

    // 特殊ルールリスト
    let rulesEndY = RULES_START_Y;
    if (rankMaster.specialRules.length === 0) {
      const noneText = this.scene.add.text(TEXT_LEFT, RULES_START_Y, 'なし', {
        fontSize: FONT_SIZE_SMALL,
        color: '#aaaaaa',
      });
      this.panelContent.add(noneText);
      rulesEndY = RULES_START_Y + RULES_LINE_HEIGHT;
    } else {
      for (let i = 0; i < rankMaster.specialRules.length; i++) {
        const rule = rankMaster.specialRules[i];
        if (!rule) continue;
        const lineY = RULES_START_Y + i * RULES_LINE_HEIGHT;
        const ruleText = this.scene.add.text(TEXT_LEFT, lineY, rule.description, {
          fontSize: FONT_SIZE_SMALL,
          color: '#aaaaaa',
          wordWrap: { width: contentWidth },
        });
        this.panelContent.add(ruleText);
        rulesEndY = lineY + RULES_LINE_HEIGHT;
      }
    }

    // 昇格ボーナス
    const nextRank = getNextRank(rankMaster.id);
    if (nextRank) {
      const bonusGold = PROMOTION_BONUS_BASE * (getRankOrder(nextRank) + 1);
      const bonusLabelY = rulesEndY + BONUS_OFFSET_Y;
      const accentColor = `#${Colors.text.accent.toString(16).padStart(6, '0')}`;
      const bonusText = this.scene.add.text(TEXT_LEFT, bonusLabelY, `昇格ボーナス: ${bonusGold}G`, {
        fontSize: FONT_SIZE_BODY,
        color: accentColor,
        padding: { top: 4 },
      });
      this.panelContent.add(bonusText);
    }
  }

  private createCloseButton(): void {
    const closeBtn = this.scene.add.text(
      PANEL_WIDTH / 2,
      PANEL_HEIGHT - CLOSE_BUTTON_BOTTOM_MARGIN,
      '閉じる',
      {
        fontSize: FONT_SIZE_BODY,
        color: '#ffffff',
        backgroundColor: CLOSE_BUTTON_BG_COLOR,
        padding: { x: 16, y: 8 },
      },
    );
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
 * 新しい命名エイリアス: Issue #475 以降は `RankDetailSlidePanel` を推奨する。
 * 既存コードとの後方互換のため `RankDetailUI` も引き続きエクスポートする。
 */
export { RankDetailUI as RankDetailSlidePanel };
export type { RankDetailUIConfig as RankDetailSlidePanelConfig };
