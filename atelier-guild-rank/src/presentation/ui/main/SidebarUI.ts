/**
 * SidebarUI - サイドバーUIコンポーネント
 * TASK-0020 MainScene共通レイアウト
 * TASK-0040 サイドバー折りたたみアニメーション
 *
 * @description
 * サイドバー領域のUIコンポーネント。
 * 受注依頼リスト、素材リスト、完成品リスト、保管容量、ショップボタンを表示する。
 * 各セクションは折りたたみ可能で、アニメーション付き（高さ変化 + アルファ変化 + アイコン回転）。
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

/** セクションヘッダーのY座標オフセット（初期値） */
const SECTION_HEADER_OFFSETS = {
  quest: 0,
  material: 160,
  item: 320,
} as const;

/** セクションヘッダーの高さ */
const SECTION_HEADER_HEIGHT = 30;

/** セクションコンテンツの高さ */
const SECTION_CONTENT_HEIGHT = 120;

/** アニメーション設定 */
const ANIMATION_CONFIG = {
  duration: 200,
  ease: 'Power2',
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
// 型定義
// =============================================================================

/**
 * サイドバーセクション構造
 */
interface SidebarSection {
  /** セクションID */
  id: string;
  /** ヘッダーコンテナ */
  header: Phaser.GameObjects.Container;
  /** 折りたたみアイコン */
  icon: Phaser.GameObjects.Text;
  /** タイトルテキスト */
  title: Phaser.GameObjects.Text;
  /** コンテンツコンテナ */
  content: Phaser.GameObjects.Container;
  /** 元の高さ */
  originalHeight: number;
  /** ヘッダーの初期Y座標 */
  initialY: number;
}

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

  /** 受注依頼セクション */
  private questSection: SidebarSection | null = null;

  /** 素材セクション */
  private materialSection: SidebarSection | null = null;

  /** 完成品セクション */
  private itemSection: SidebarSection | null = null;

  /** 保管容量テキスト */
  private storageText: Phaser.GameObjects.Text | null = null;

  /** ショップボタン */
  private shopButton: Phaser.GameObjects.Container | null = null;

  /** 折りたたまれているセクションIDのSet */
  private collapsedSections: Set<string> = new Set();

  /** アニメーション中のセクションIDのSet */
  private animatingSections: Set<string> = new Set();

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

    // 折りたたみ状態を復元
    this.loadCollapsedState();

    // セクションを作成
    this.questSection = this.createSection(
      'quest',
      SECTION_LABELS.quest,
      SECTION_HEADER_OFFSETS.quest,
    );
    this.materialSection = this.createSection(
      'material',
      SECTION_LABELS.material,
      SECTION_HEADER_OFFSETS.material,
    );
    this.itemSection = this.createSection('item', SECTION_LABELS.item, SECTION_HEADER_OFFSETS.item);

    // コンテナに追加
    this.container.add([
      this.questSection.header,
      this.questSection.content,
      this.materialSection.header,
      this.materialSection.content,
      this.itemSection.header,
      this.itemSection.content,
    ]);

    // 初期位置を折りたたみ状態に応じて設定
    this.applySectionPositionsImmediate();
  }

  /**
   * セクションの位置を即座に適用する（初期化用）
   */
  private applySectionPositionsImmediate(): void {
    const sections = [this.questSection, this.materialSection, this.itemSection];
    let currentY = 0;

    for (const section of sections) {
      if (!section) continue;

      // 即座に位置を設定
      section.header.setY(currentY);
      section.content.setY(currentY + SECTION_HEADER_HEIGHT);

      // 次のセクションのY位置を計算
      if (this.collapsedSections.has(section.id)) {
        // 折りたたまれている場合はヘッダーの高さのみ
        currentY += SECTION_HEADER_HEIGHT + THEME.spacing.sm;
      } else {
        // 展開されている場合はヘッダー + コンテンツの高さ
        currentY += SECTION_HEADER_HEIGHT + section.originalHeight + THEME.spacing.sm;
      }
    }
  }

  /**
   * リソースを解放する
   */
  destroy(): void {
    // 折りたたみ状態を保存
    this.saveCollapsedState();

    // プライベートフィールドのGameObjectsを解放
    this.destroyGameObjects();

    // コンテナを破棄
    this.container.destroy();
  }

  // =========================================================================
  // プライベートメソッド
  // =========================================================================

  /**
   * セクションを作成する
   *
   * @param id - セクションID
   * @param label - セクションラベル
   * @param yOffset - Y座標オフセット
   * @returns 作成されたセクション
   */
  private createSection(id: string, label: string, yOffset: number): SidebarSection {
    // ヘッダーコンテナを作成
    const header = this.scene.add.container(THEME.spacing.md, yOffset);

    // アイコン（▼/▶）
    const icon = this.scene.add.text(0, 0, '▼', {
      fontFamily: THEME.fonts.primary,
      fontSize: `${THEME.sizes.small}px`,
      color: `#${THEME.colors.text.toString(16).padStart(6, '0')}`,
    });

    // タイトル
    const title = this.scene.add.text(20, 0, label, SECTION_HEADER_STYLE);

    header.add([icon, title]);
    header.setSize(SIDEBAR_WIDTH - THEME.spacing.md * 2, THEME.sizes.medium);
    header.setInteractive({ useHandCursor: true });

    // コンテンツコンテナを作成
    const content = this.scene.add.container(THEME.spacing.md, yOffset + 20);
    const contentText = this.scene.add.text(0, 0, '（コンテンツ）', {
      fontFamily: THEME.fonts.primary,
      fontSize: `${THEME.sizes.small}px`,
      color: `#${THEME.colors.textLight.toString(16).padStart(6, '0')}`,
    });
    content.add(contentText);

    // セクション構造
    const section: SidebarSection = {
      id,
      header,
      icon,
      title,
      content,
      originalHeight: SECTION_CONTENT_HEIGHT,
      initialY: yOffset,
    };

    // クリックイベント
    header.on('pointerdown', () => this.toggleSection(section));

    // 折りたたまれている場合は初期状態を設定
    if (this.collapsedSections.has(id)) {
      content.setVisible(false);
      content.setAlpha(0);
      content.setScale(1, 0);
      icon.setText('▶');
    }

    return section;
  }

  /**
   * セクションの折りたたみ/展開を切り替える
   *
   * @param section - 対象セクション
   */
  private toggleSection(section: SidebarSection): void {
    // アニメーション中は無視
    if (this.animatingSections.has(section.id)) {
      return;
    }

    const isCollapsed = this.collapsedSections.has(section.id);

    if (isCollapsed) {
      this.expandSection(section);
    } else {
      this.collapseSection(section);
    }
  }

  /**
   * セクションを折りたたむ
   *
   * @param section - 対象セクション
   */
  private collapseSection(section: SidebarSection): void {
    this.animatingSections.add(section.id);

    // コンテンツのアルファ変化 + 高さ（scaleY）変化アニメーション
    this.scene.tweens.add({
      targets: section.content,
      alpha: 0,
      scaleY: 0,
      duration: ANIMATION_CONFIG.duration,
      ease: ANIMATION_CONFIG.ease,
      onComplete: () => {
        section.content.setVisible(false);
        this.animatingSections.delete(section.id);
      },
    });

    // アイコン回転アニメーション
    this.scene.tweens.add({
      targets: section.icon,
      angle: -90,
      duration: ANIMATION_CONFIG.duration,
      ease: ANIMATION_CONFIG.ease,
      onComplete: () => {
        section.icon.setText('▶');
        section.icon.setAngle(0);
      },
    });

    this.collapsedSections.add(section.id);
    this.saveCollapsedState();

    // 後続セクションの位置を更新
    this.updateSectionPositions();
  }

  /**
   * セクションを展開する
   *
   * @param section - 対象セクション
   */
  private expandSection(section: SidebarSection): void {
    this.animatingSections.add(section.id);

    section.content.setVisible(true);
    section.content.setScale(1, 0); // 開始時はscaleY=0

    // コンテンツのアルファ変化 + 高さ（scaleY）変化アニメーション
    this.scene.tweens.add({
      targets: section.content,
      alpha: 1,
      scaleY: 1,
      duration: ANIMATION_CONFIG.duration,
      ease: ANIMATION_CONFIG.ease,
      onComplete: () => {
        this.animatingSections.delete(section.id);
      },
    });

    // アイコン回転アニメーション
    this.scene.tweens.add({
      targets: section.icon,
      angle: 90,
      duration: ANIMATION_CONFIG.duration,
      ease: ANIMATION_CONFIG.ease,
      onComplete: () => {
        section.icon.setText('▼');
        section.icon.setAngle(0);
      },
    });

    this.collapsedSections.delete(section.id);
    this.saveCollapsedState();

    // 後続セクションの位置を更新
    this.updateSectionPositions();
  }

  /**
   * セクションの位置をアニメーションで更新する
   * 折りたたまれたセクションの高さを考慮して後続セクションの位置を調整
   */
  private updateSectionPositions(): void {
    const sections = [this.questSection, this.materialSection, this.itemSection];
    let currentY = 0;

    for (const section of sections) {
      if (!section) continue;

      const targetHeaderY = currentY;
      const targetContentY = currentY + SECTION_HEADER_HEIGHT;

      // ヘッダーと内容の位置をアニメーション
      this.scene.tweens.add({
        targets: section.header,
        y: targetHeaderY,
        duration: ANIMATION_CONFIG.duration,
        ease: ANIMATION_CONFIG.ease,
      });

      this.scene.tweens.add({
        targets: section.content,
        y: targetContentY,
        duration: ANIMATION_CONFIG.duration,
        ease: ANIMATION_CONFIG.ease,
      });

      // 次のセクションのY位置を計算
      if (this.collapsedSections.has(section.id)) {
        // 折りたたまれている場合はヘッダーの高さのみ
        currentY += SECTION_HEADER_HEIGHT + THEME.spacing.sm;
      } else {
        // 展開されている場合はヘッダー + コンテンツの高さ
        currentY += SECTION_HEADER_HEIGHT + section.originalHeight + THEME.spacing.sm;
      }
    }
  }

  /**
   * 折りたたみ状態を保存する
   */
  private saveCollapsedState(): void {
    const state = Array.from(this.collapsedSections);
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(state));
    } catch (error) {
      // localStorageが使えない環境では無視
      console.warn('Failed to save collapsed state:', error);
    }
  }

  /**
   * 折りたたみ状態を復元する
   */
  private loadCollapsedState(): void {
    try {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved) {
        const state = JSON.parse(saved) as string[];
        this.collapsedSections = new Set(state);
      }
    } catch (error) {
      // localStorageが使えない環境では無視
      console.warn('Failed to load collapsed state:', error);
      this.collapsedSections = new Set();
    }
  }

  /**
   * 保持しているGameObjectsを解放する
   */
  private destroyGameObjects(): void {
    if (this.background) {
      this.background.destroy();
      this.background = null;
    }
    if (this.questSection) {
      this.questSection.header.destroy();
      this.questSection.content.destroy();
      this.questSection = null;
    }
    if (this.materialSection) {
      this.materialSection.header.destroy();
      this.materialSection.content.destroy();
      this.materialSection = null;
    }
    if (this.itemSection) {
      this.itemSection.header.destroy();
      this.itemSection.content.destroy();
      this.itemSection = null;
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
