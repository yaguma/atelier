/**
 * SidebarUI - サイドバーUIコンポーネント
 * TASK-0020 MainScene共通レイアウト
 *
 * @description
 * サイドバー領域のUIコンポーネント。
 * 受注依頼リスト、素材リスト、完成品リスト、保管容量、ショップボタンを表示する。
 *
 * TDD Refactorフェーズ: 定数抽出とスタイル統一
 */

import type Phaser from 'phaser';
import { BaseComponent } from '../components/BaseComponent';
import { THEME } from '../theme';

// =============================================================================
// レイアウト定数定義
// =============================================================================

/** サイドバーのX座標 */
const SIDEBAR_X = 0;

/** サイドバーのY座標（ヘッダー高さ） */
const SIDEBAR_Y = 60;

/** サイドバーの幅 */
const SIDEBAR_WIDTH = 200;

/** サイドバーの高さ（画面高さ - ヘッダー高さ - フッター高さ） */
const SIDEBAR_HEIGHT = 500;

/** セクションヘッダーのY座標オフセット */
const SECTION_HEADER_OFFSETS = {
  quest: 0,
  material: 100,
  item: 200,
} as const;

// =============================================================================
// スタイル定義
// =============================================================================

/**
 * セクションヘッダースタイル
 * 統一されたセクションヘッダーのテキストスタイル
 */
const SECTION_HEADER_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: THEME.fonts.primary,
  fontSize: `${THEME.sizes.medium}px`,
  color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
};

/**
 * セクションラベル定義
 * 各セクションの表示名
 */
const SECTION_LABELS = {
  quest: '【受注依頼】',
  material: '【素材】',
  item: '【完成品】',
} as const;

// =============================================================================
// サイドバーUIクラス
// =============================================================================

/**
 * サイドバーUIコンポーネントクラス
 *
 * 画面左側に配置され、インベントリとクエスト情報を表示する
 */
export class SidebarUI extends BaseComponent {
  // =========================================================================
  // プライベートフィールド
  // =========================================================================

  /** 背景Graphics */
  private background: Phaser.GameObjects.Graphics | null = null;

  /** 受注依頼セクションヘッダー */
  private questHeader: Phaser.GameObjects.Text | null = null;

  /** 素材セクションヘッダー */
  private materialHeader: Phaser.GameObjects.Text | null = null;

  /** 完成品セクションヘッダー */
  private itemHeader: Phaser.GameObjects.Text | null = null;

  /** 保管容量テキスト */
  private storageText: Phaser.GameObjects.Text | null = null;

  /** ショップボタン */
  private shopButton: Phaser.GameObjects.Container | null = null;

  // =========================================================================
  // コンストラクタ
  // =========================================================================

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @throws {Error} sceneがnullまたはundefinedの場合
   */
  constructor(scene: Phaser.Scene) {
    super(scene, SIDEBAR_X, SIDEBAR_Y);
  }

  // =========================================================================
  // パブリックメソッド
  // =========================================================================

  /**
   * UIを初期化して生成する
   */
  create(): void {
    // コンテナの深度を設定（サイドバーは depth 150）
    this.container.setDepth(150);

    // セクションヘッダーテキストを作成（統一スタイルを適用）
    this.questHeader = this.createSectionHeader(SECTION_LABELS.quest, SECTION_HEADER_OFFSETS.quest);
    this.materialHeader = this.createSectionHeader(
      SECTION_LABELS.material,
      SECTION_HEADER_OFFSETS.material,
    );
    this.itemHeader = this.createSectionHeader(SECTION_LABELS.item, SECTION_HEADER_OFFSETS.item);

    // コンテナに追加
    this.container.add([this.questHeader, this.materialHeader, this.itemHeader]);
  }

  /**
   * リソースを解放する
   */
  destroy(): void {
    // プライベートフィールドのGameObjectsを解放
    this.destroyGameObjects();

    // コンテナを破棄
    this.container.destroy();
  }

  // =========================================================================
  // プライベートメソッド
  // =========================================================================

  /**
   * セクションヘッダーを作成する
   *
   * @param label - セクションラベル
   * @param yOffset - Y座標オフセット
   * @returns 作成されたテキストオブジェクト
   */
  private createSectionHeader(label: string, yOffset: number): Phaser.GameObjects.Text {
    return this.scene.add.text(THEME.spacing.md, yOffset, label, SECTION_HEADER_STYLE);
  }

  /**
   * 保持しているGameObjectsを解放する
   */
  private destroyGameObjects(): void {
    if (this.background) {
      this.background.destroy();
      this.background = null;
    }
    if (this.questHeader) {
      this.questHeader.destroy();
      this.questHeader = null;
    }
    if (this.materialHeader) {
      this.materialHeader.destroy();
      this.materialHeader = null;
    }
    if (this.itemHeader) {
      this.itemHeader.destroy();
      this.itemHeader = null;
    }
    if (this.storageText) {
      this.storageText.destroy();
      this.storageText = null;
    }
    if (this.shopButton) {
      this.shopButton.destroy();
      this.shopButton = null;
    }
  }
}

// =============================================================================
// エクスポート（テスト用）
// =============================================================================

/** テスト用にレイアウト定数をエクスポート */
export { SIDEBAR_WIDTH, SIDEBAR_HEIGHT, SECTION_LABELS, SECTION_HEADER_STYLE };
