/**
 * サイドバーUIコンポーネント
 * TASK-0046 MainScene共通レイアウト実装
 * TASK-0047 共通UIコンポーネント視覚実装
 *
 * @description
 * 受注依頼、素材、完成品のアコーディオンセクションと保管容量を表示するサイドバー
 *
 * @信頼性レベル 🔵 requirements.md セクション2.3に基づく
 */

import { MAIN_LAYOUT } from '@shared/constants';
import type { ICraftedItem, IMaterialInstance } from '@shared/types/materials';
import type { IActiveQuest } from '@shared/types/quests';
import type Phaser from 'phaser';
import { BaseComponent } from './BaseComponent';

// =============================================================================
// セクション型定義
// =============================================================================

/** サイドバーセクションのUI要素 */
interface ISidebarSection {
  header: Phaser.GameObjects.Text | null;
  icon: Phaser.GameObjects.Text | null;
}

// =============================================================================
// 定数
// =============================================================================

/**
 * サイドバー用カラー定数
 */
const COLORS = {
  /** 背景色（半透明ダークグレー） */
  BACKGROUND: 0x1f2937,
  /** ボーダー色 */
  BORDER: 0x374151,
  /** セクションヘッダー背景 */
  SECTION_HEADER: 0x374151,
  /** テキスト色（明るいグレー） */
  TEXT: 0xe5e7eb,
  /** サブテキスト色 */
  TEXT_SECONDARY: 0x9ca3af,
  /** アクセント色（青系） */
  ACCENT: 0x6366f1,
  /** アクセントホバー色 */
  ACCENT_HOVER: 0x818cf8,
  /** 警告色 */
  WARNING: 0xfcd34d,
} as const;

/**
 * サイドバーレイアウト定数
 * Issue #486: 幅・ヘッダー高さは MAIN_LAYOUT から参照
 */
const SIDEBAR_LAYOUT = {
  /** サイドバー幅 */
  WIDTH: MAIN_LAYOUT.SIDEBAR_WIDTH,
  /** サイドバー高さ（画面高さ - ヘッダー高さ） — 注: 実際の画面高さは実行時依存 */
  HEIGHT: 768 - MAIN_LAYOUT.HEADER_HEIGHT,
  /** パディング */
  PADDING: 12,
  /** セクション間隔 */
  SECTION_GAP: 8,
  /** セクションヘッダー高さ */
  SECTION_HEADER_HEIGHT: 32,
} as const;

// =============================================================================
// 型定義
// =============================================================================

/**
 * SidebarUI更新データの型定義
 */
export interface ISidebarUIData {
  activeQuests: IActiveQuest[];
  materials: IMaterialInstance[];
  craftedItems: ICraftedItem[];
  currentStorage: number;
  maxStorage: number;
}

/**
 * サイドバーセクション名の型定義
 */
export type SidebarSectionName = 'quests' | 'materials' | 'craftedItems';

// =============================================================================
// SidebarUIクラス
// =============================================================================

/**
 * サイドバーUIコンポーネント
 *
 * 画面左側に配置され、以下の情報を表示する:
 * - 受注依頼一覧（アコーディオン）
 * - 素材一覧（アコーディオン）
 * - 完成品一覧（アコーディオン）
 * - 保管容量
 * - ショップボタン
 *
 * @信頼性レベル 🔵 requirements.md セクション2.3に基づく
 */
export class SidebarUI extends BaseComponent {
  // ===========================================================================
  // 内部状態
  // ===========================================================================

  /** 依頼データ */
  private _activeQuests: IActiveQuest[] = [];

  /** 素材データ */
  private _materials: IMaterialInstance[] = [];

  /** 完成品データ */
  private _craftedItems: ICraftedItem[] = [];

  /** 保管容量テキスト */
  private _storageText = '保管: 0/20';

  /** セクション折りたたみ状態 */
  private _sectionCollapsed: Record<SidebarSectionName, boolean> = {
    quests: false,
    materials: false,
    craftedItems: false,
  };

  /** ショップボタン */
  private _shopButton: Phaser.GameObjects.Rectangle | null = null;

  /** 依頼セクション */
  private _questsSection: ISidebarSection = { header: null, icon: null };

  /** 素材セクション */
  private _materialsSection: ISidebarSection = { header: null, icon: null };

  /** 完成品セクション */
  private _craftedItemsSection: ISidebarSection = { header: null, icon: null };

  /** 現在/最大保管容量 */
  private _currentStorage = 0;
  private _maxStorage = 20;

  // ===========================================================================
  // 視覚要素（Phaserオブジェクト）
  // ===========================================================================

  /** 依頼セクションヘッダー */
  private _questsHeaderText: Phaser.GameObjects.Text | null = null;
  /** 依頼セクションアイコン */
  private _questsIconText: Phaser.GameObjects.Text | null = null;

  /** 素材セクションヘッダー */
  private _materialsHeaderText: Phaser.GameObjects.Text | null = null;
  /** 素材セクションアイコン */
  private _materialsIconText: Phaser.GameObjects.Text | null = null;

  /** 完成品セクションヘッダー */
  private _craftedItemsHeaderText: Phaser.GameObjects.Text | null = null;
  /** 完成品セクションアイコン */
  private _craftedItemsIconText: Phaser.GameObjects.Text | null = null;

  /** 保管容量テキスト要素 */
  private _storageTextElement: Phaser.GameObjects.Text | null = null;

  /** 依頼リスト表示用テキスト要素 */
  private _questListTexts: Phaser.GameObjects.Text[] = [];

  /** 依頼リストのY座標開始位置 */
  private _questListStartY = 0;

  /** 素材リスト表示用テキスト要素 */
  private _materialsListTexts: Phaser.GameObjects.Text[] = [];

  /** 素材リストのY座標開始位置 */
  private _materialsListStartY = 0;

  /** 完成品リスト表示用テキスト要素 */
  private _craftedItemsListTexts: Phaser.GameObjects.Text[] = [];

  /** 完成品リストのY座標開始位置 */
  private _craftedItemsListStartY = 0;

  /** ショップボタン背景 */
  private _shopButtonBackground: Phaser.GameObjects.Rectangle | null = null;
  /** ショップボタンテキスト */
  private _shopButtonText: Phaser.GameObjects.Text | null = null;

  /** 背景パネル */
  private _backgroundPanel: Phaser.GameObjects.Rectangle | null = null;

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  /** 素材名解決関数（materialId → 日本語名） */
  private materialNameResolver?: (materialId: string) => string;

  /** アイテム名解決関数（itemId → 日本語名） */
  private itemNameResolver?: (itemId: string) => string;

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @param x - X座標
   * @param y - Y座標
   * @param options - オプション設定
   * @throws {Error} sceneがnullまたはundefinedの場合
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options?: {
      materialNameResolver?: (materialId: string) => string;
      itemNameResolver?: (itemId: string) => string;
    },
  ) {
    // BaseComponentでも検証するが、テストで期待する具体的なエラーメッセージのため
    if (!scene) {
      throw new Error('scene is required');
    }
    super(scene, x, y);
    this.materialNameResolver = options?.materialNameResolver;
    this.itemNameResolver = options?.itemNameResolver;
  }

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * コンポーネントの初期化処理
   * TASK-0047: 視覚要素を生成
   */
  create(): void {
    // 背景パネルを生成（半透明のダークグレー）
    this._backgroundPanel = this.scene.add
      .rectangle(
        SIDEBAR_LAYOUT.WIDTH / 2,
        SIDEBAR_LAYOUT.HEIGHT / 2,
        SIDEBAR_LAYOUT.WIDTH,
        SIDEBAR_LAYOUT.HEIGHT,
        COLORS.BACKGROUND,
        0.95,
      )
      .setName('SidebarUI.backgroundPanel');
    this.container.add(this._backgroundPanel);

    // 右側ボーダーライン
    const borderLine = this.scene.add
      .rectangle(
        SIDEBAR_LAYOUT.WIDTH - 1,
        SIDEBAR_LAYOUT.HEIGHT / 2,
        2,
        SIDEBAR_LAYOUT.HEIGHT,
        COLORS.BORDER,
        1,
      )
      .setName('SidebarUI.borderLine');
    this.container.add(borderLine);

    let currentY = SIDEBAR_LAYOUT.PADDING;

    // 依頼セクションヘッダー背景
    const questsHeaderBg = this.scene.add.rectangle(
      SIDEBAR_LAYOUT.WIDTH / 2,
      currentY + SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT / 2,
      SIDEBAR_LAYOUT.WIDTH - SIDEBAR_LAYOUT.PADDING * 2,
      SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT,
      COLORS.SECTION_HEADER,
      0.8,
    );
    questsHeaderBg.setName('SidebarUI.questsHeaderBg');
    questsHeaderBg.setInteractive({ useHandCursor: true });
    questsHeaderBg.on('pointerover', () => questsHeaderBg.setFillStyle(0x4b5563, 0.9));
    questsHeaderBg.on('pointerout', () => questsHeaderBg.setFillStyle(COLORS.SECTION_HEADER, 0.8));
    questsHeaderBg.on('pointerdown', () => this.toggleSection('quests'));
    this.container.add(questsHeaderBg);

    // 依頼セクションヘッダーを生成
    this._questsIconText = this.scene.add.text(SIDEBAR_LAYOUT.PADDING, currentY + 8, '▼', {
      fontSize: '14px',
      color: '#9CA3AF',
    });
    this.container.add(this._questsIconText);

    this._questsHeaderText = this.scene.add.text(
      SIDEBAR_LAYOUT.PADDING + 20,
      currentY + 6,
      '受注依頼',
      {
        fontSize: '14px',
        color: '#F9FAFB',
        fontStyle: 'bold',
      },
    );
    this.container.add(this._questsHeaderText);

    // 依頼リストの開始位置を記録
    currentY += SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT;
    this._questListStartY = currentY;

    currentY += 80 + SIDEBAR_LAYOUT.SECTION_GAP;

    // 素材セクションヘッダー背景
    const materialsHeaderBg = this.scene.add.rectangle(
      SIDEBAR_LAYOUT.WIDTH / 2,
      currentY + SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT / 2,
      SIDEBAR_LAYOUT.WIDTH - SIDEBAR_LAYOUT.PADDING * 2,
      SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT,
      COLORS.SECTION_HEADER,
      0.8,
    );
    materialsHeaderBg.setName('SidebarUI.materialsHeaderBg');
    materialsHeaderBg.setInteractive({ useHandCursor: true });
    materialsHeaderBg.on('pointerover', () => materialsHeaderBg.setFillStyle(0x4b5563, 0.9));
    materialsHeaderBg.on('pointerout', () =>
      materialsHeaderBg.setFillStyle(COLORS.SECTION_HEADER, 0.8),
    );
    materialsHeaderBg.on('pointerdown', () => this.toggleSection('materials'));
    this.container.add(materialsHeaderBg);

    // 素材セクションヘッダーを生成
    this._materialsIconText = this.scene.add.text(SIDEBAR_LAYOUT.PADDING, currentY + 8, '▼', {
      fontSize: '14px',
      color: '#9CA3AF',
    });
    this.container.add(this._materialsIconText);

    this._materialsHeaderText = this.scene.add.text(
      SIDEBAR_LAYOUT.PADDING + 20,
      currentY + 6,
      '素材',
      {
        fontSize: '14px',
        color: '#F9FAFB',
        fontStyle: 'bold',
      },
    );
    this.container.add(this._materialsHeaderText);

    // 素材リストの開始位置を記録
    this._materialsListStartY = currentY + SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT;

    currentY += SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT + 80 + SIDEBAR_LAYOUT.SECTION_GAP;

    // 完成品セクションヘッダー背景
    const craftedItemsHeaderBg = this.scene.add.rectangle(
      SIDEBAR_LAYOUT.WIDTH / 2,
      currentY + SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT / 2,
      SIDEBAR_LAYOUT.WIDTH - SIDEBAR_LAYOUT.PADDING * 2,
      SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT,
      COLORS.SECTION_HEADER,
      0.8,
    );
    craftedItemsHeaderBg.setName('SidebarUI.craftedItemsHeaderBg');
    craftedItemsHeaderBg.setInteractive({ useHandCursor: true });
    craftedItemsHeaderBg.on('pointerover', () => craftedItemsHeaderBg.setFillStyle(0x4b5563, 0.9));
    craftedItemsHeaderBg.on('pointerout', () =>
      craftedItemsHeaderBg.setFillStyle(COLORS.SECTION_HEADER, 0.8),
    );
    craftedItemsHeaderBg.on('pointerdown', () => this.toggleSection('craftedItems'));
    this.container.add(craftedItemsHeaderBg);

    // 完成品セクションヘッダーを生成
    this._craftedItemsIconText = this.scene.add.text(SIDEBAR_LAYOUT.PADDING, currentY + 8, '▼', {
      fontSize: '14px',
      color: '#9CA3AF',
    });
    this.container.add(this._craftedItemsIconText);

    this._craftedItemsHeaderText = this.scene.add.text(
      SIDEBAR_LAYOUT.PADDING + 20,
      currentY + 6,
      '完成品',
      {
        fontSize: '14px',
        color: '#F9FAFB',
        fontStyle: 'bold',
      },
    );
    this.container.add(this._craftedItemsHeaderText);

    // 完成品リストの開始位置を記録
    this._craftedItemsListStartY = currentY + SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT;

    currentY += SIDEBAR_LAYOUT.SECTION_HEADER_HEIGHT + 80 + SIDEBAR_LAYOUT.SECTION_GAP;

    // 保管容量テキストを生成
    this._storageTextElement = this.scene.add.text(SIDEBAR_LAYOUT.PADDING, currentY, '保管: 0/20', {
      fontSize: '14px',
      color: '#D1D5DB',
    });
    this.container.add(this._storageTextElement);

    currentY += 40;

    // ショップボタンを生成
    this._shopButtonBackground = this.scene.add.rectangle(
      SIDEBAR_LAYOUT.WIDTH / 2,
      currentY + 18,
      SIDEBAR_LAYOUT.WIDTH - SIDEBAR_LAYOUT.PADDING * 2,
      36,
      COLORS.ACCENT,
    );
    this._shopButtonBackground.setName('SidebarUI.shopButtonBg');
    this._shopButtonBackground.setInteractive({ useHandCursor: true });
    this._shopButtonBackground.on('pointerover', () => {
      this._shopButtonBackground?.setFillStyle(COLORS.ACCENT_HOVER);
    });
    this._shopButtonBackground.on('pointerout', () => {
      this._shopButtonBackground?.setFillStyle(COLORS.ACCENT);
    });
    this.container.add(this._shopButtonBackground);

    this._shopButtonText = this.scene.add.text(
      SIDEBAR_LAYOUT.WIDTH / 2 - 30,
      currentY + 8,
      'ショップ',
      {
        fontSize: '14px',
        color: '#FFFFFF',
        fontStyle: 'bold',
      },
    );
    this.container.add(this._shopButtonText);

    // ダミーオブジェクトを更新
    this._questsSection = { header: this._questsHeaderText, icon: this._questsIconText };
    this._materialsSection = { header: this._materialsHeaderText, icon: this._materialsIconText };
    this._craftedItemsSection = {
      header: this._craftedItemsHeaderText,
      icon: this._craftedItemsIconText,
    };
    this._shopButton = this._shopButtonBackground;
  }

  /**
   * コンポーネントの破棄処理
   */
  destroy(): void {
    // 依頼リストのテキスト要素を破棄
    for (const text of this._questListTexts) {
      text.destroy();
    }
    this._questListTexts = [];

    // 素材リストのテキスト要素を破棄
    for (const text of this._materialsListTexts) {
      text.destroy();
    }
    this._materialsListTexts = [];

    // 完成品リストのテキスト要素を破棄
    for (const text of this._craftedItemsListTexts) {
      text.destroy();
    }
    this._craftedItemsListTexts = [];

    this.container.destroy();
  }

  // ===========================================================================
  // 更新メソッド
  // ===========================================================================

  /**
   * サイドバー情報を更新
   * TASK-0047: 視覚要素を更新
   *
   * @param data - 更新データ
   */
  update(data: ISidebarUIData): void {
    // 依頼データ
    this._activeQuests = data.activeQuests;

    // 素材データ
    this._materials = data.materials;

    // 完成品データ
    this._craftedItems = data.craftedItems;

    // 保管容量
    this._currentStorage = data.currentStorage;
    this._maxStorage = data.maxStorage;
    this._storageText = `保管: ${data.currentStorage}/${data.maxStorage}`;

    // TASK-0047: 視覚要素の更新
    this.updateVisualElements();

    // Issue #137: 依頼リストUIを更新
    this.updateQuestListUI();

    // 素材リストUIを更新
    this.updateMaterialsListUI();

    // 完成品リストUIを更新
    this.updateCraftedItemsListUI();

    // セクションヘッダーに件数を反映
    if (this._materialsHeaderText) {
      this._materialsHeaderText.setText(`素材 (${this._materials.length})`);
    }
    if (this._craftedItemsHeaderText) {
      this._craftedItemsHeaderText.setText(`完成品 (${this._craftedItems.length})`);
    }
  }

  /**
   * 受注済み依頼リストを更新
   * Issue #137: 依頼受注時にサイドバーの依頼リストを更新する
   *
   * @param quests - 受注済み依頼リスト
   */
  updateAcceptedQuests(quests: IActiveQuest[]): void {
    this._activeQuests = quests;

    // 依頼セクションヘッダーに件数を表示
    if (this._questsHeaderText) {
      this._questsHeaderText.setText(`受注依頼 (${quests.length})`);
    }

    // 依頼リストのUI更新
    this.updateQuestListUI();
  }

  /**
   * 依頼リストのUI要素を更新
   * Issue #137: 受注した依頼をサイドバーに表示する
   */
  private updateQuestListUI(): void {
    // 既存のリスト要素を削除
    for (const text of this._questListTexts) {
      text.destroy();
    }
    this._questListTexts = [];

    // セクションが折りたたまれている場合は表示しない
    if (this._sectionCollapsed.quests) {
      return;
    }

    // 依頼リストを表示（最大3件）
    const displayQuests = this._activeQuests.slice(0, 3);
    let y = this._questListStartY + 4;

    for (const activeQuest of displayQuests) {
      // 依頼者名と残り日数を表示
      const questText = this.scene.add.text(
        SIDEBAR_LAYOUT.PADDING + 4,
        y,
        `${activeQuest.client.name} (${activeQuest.remainingDays}日)`,
        {
          fontSize: '12px',
          color: '#D1D5DB',
        },
      );
      this.container.add(questText);
      this._questListTexts.push(questText);

      y += 20;
    }

    // 3件を超える場合は「...」を表示
    if (this._activeQuests.length > 3) {
      const moreText = this.scene.add.text(
        SIDEBAR_LAYOUT.PADDING + 4,
        y,
        `他${this._activeQuests.length - 3}件...`,
        {
          fontSize: '11px',
          color: '#9CA3AF',
        },
      );
      this.container.add(moreText);
      this._questListTexts.push(moreText);
    }
  }

  /**
   * 素材リストのUI要素を更新
   */
  private updateMaterialsListUI(): void {
    // 既存のリスト要素を削除
    for (const text of this._materialsListTexts) {
      text.destroy();
    }
    this._materialsListTexts = [];

    // セクションが折りたたまれている場合は表示しない
    if (this._sectionCollapsed.materials) {
      return;
    }

    // 素材リストを表示（最大3件）
    const displayMaterials = this._materials.slice(0, 3);
    let y = this._materialsListStartY + 4;

    for (const material of displayMaterials) {
      const matText = this.scene.add.text(
        SIDEBAR_LAYOUT.PADDING + 4,
        y,
        `${this.resolveMaterialName(material.materialId)} (${material.quality})`,
        {
          fontSize: '12px',
          color: '#D1D5DB',
        },
      );
      this.container.add(matText);
      this._materialsListTexts.push(matText);

      y += 20;
    }

    // 3件を超える場合は「...」を表示
    if (this._materials.length > 3) {
      const moreText = this.scene.add.text(
        SIDEBAR_LAYOUT.PADDING + 4,
        y,
        `他${this._materials.length - 3}件...`,
        {
          fontSize: '11px',
          color: '#9CA3AF',
        },
      );
      this.container.add(moreText);
      this._materialsListTexts.push(moreText);
    }
  }

  /**
   * 完成品リストのUI要素を更新
   */
  private updateCraftedItemsListUI(): void {
    // 既存のリスト要素を削除
    for (const text of this._craftedItemsListTexts) {
      text.destroy();
    }
    this._craftedItemsListTexts = [];

    // セクションが折りたたまれている場合は表示しない
    if (this._sectionCollapsed.craftedItems) {
      return;
    }

    // 完成品リストを表示（最大3件）
    const displayItems = this._craftedItems.slice(0, 3);
    let y = this._craftedItemsListStartY + 4;

    for (const item of displayItems) {
      const itemText = this.scene.add.text(
        SIDEBAR_LAYOUT.PADDING + 4,
        y,
        `${this.resolveItemName(item.itemId)} (${item.quality})`,
        {
          fontSize: '12px',
          color: '#D1D5DB',
        },
      );
      this.container.add(itemText);
      this._craftedItemsListTexts.push(itemText);

      y += 20;
    }

    // 3件を超える場合は「...」を表示
    if (this._craftedItems.length > 3) {
      const moreText = this.scene.add.text(
        SIDEBAR_LAYOUT.PADDING + 4,
        y,
        `他${this._craftedItems.length - 3}件...`,
        {
          fontSize: '11px',
          color: '#9CA3AF',
        },
      );
      this.container.add(moreText);
      this._craftedItemsListTexts.push(moreText);
    }
  }

  // ===========================================================================
  // 視覚更新メソッド
  // ===========================================================================

  /**
   * 視覚要素を更新
   */
  private updateVisualElements(): void {
    // 保管容量テキスト更新
    if (this._storageTextElement) {
      this._storageTextElement.setText(this._storageText);

      // 80%以上で警告色
      const ratio = this._currentStorage / this._maxStorage;
      if (ratio >= 0.8) {
        this._storageTextElement.setColor('#FFD93D');
      } else {
        this._storageTextElement.setColor('#FFFFFF');
      }
    }
  }

  // ===========================================================================
  // ゲッターメソッド
  // ===========================================================================

  /**
   * 依頼セクションを取得
   */
  getQuestsSection(): ISidebarSection {
    return this._questsSection;
  }

  /**
   * 依頼数を取得
   */
  getQuestsCount(): number {
    return this._activeQuests.length;
  }

  /**
   * 素材セクションを取得
   */
  getMaterialsSection(): ISidebarSection {
    return this._materialsSection;
  }

  /**
   * 素材数を取得
   */
  getMaterialsCount(): number {
    return this._materials.length;
  }

  /**
   * 完成品セクションを取得
   */
  getCraftedItemsSection(): ISidebarSection {
    return this._craftedItemsSection;
  }

  /**
   * 完成品数を取得
   */
  getCraftedItemsCount(): number {
    return this._craftedItems.length;
  }

  /**
   * 保管容量テキストを取得
   */
  getStorageText(): string {
    return this._storageText;
  }

  /**
   * ショップボタンを取得
   */
  getShopButton(): Phaser.GameObjects.Rectangle | null {
    return this._shopButton;
  }

  /**
   * セクションが折りたたまれているかを取得
   *
   * @param sectionName - セクション名
   * @returns 折りたたみ状態
   */
  isSectionCollapsed(sectionName: SidebarSectionName): boolean {
    return this._sectionCollapsed[sectionName];
  }

  /**
   * セクションの折りたたみ状態を切り替え
   * TASK-0047: アイコンの視覚更新を追加
   *
   * @param sectionName - セクション名
   */
  toggleSection(sectionName: SidebarSectionName): void {
    this._sectionCollapsed[sectionName] = !this._sectionCollapsed[sectionName];

    // アイコンを更新
    const isCollapsed = this._sectionCollapsed[sectionName];
    const iconText = isCollapsed ? '▶' : '▼';

    switch (sectionName) {
      case 'quests':
        if (this._questsIconText) {
          this._questsIconText.setText(iconText);
        }
        // Issue #137: 折りたたみ状態に応じて依頼リストを更新
        this.updateQuestListUI();
        break;
      case 'materials':
        if (this._materialsIconText) {
          this._materialsIconText.setText(iconText);
        }
        this.updateMaterialsListUI();
        break;
      case 'craftedItems':
        if (this._craftedItemsIconText) {
          this._craftedItemsIconText.setText(iconText);
        }
        this.updateCraftedItemsListUI();
        break;
    }
  }

  // ===========================================================================
  // 名前解決メソッド
  // ===========================================================================

  /**
   * 素材IDから日本語名を解決する
   * materialNameResolverが設定されていない場合はIDをそのまま返す
   *
   * @param materialId - 素材ID
   * @returns 日本語名またはID
   */
  private resolveMaterialName(materialId: string): string {
    if (this.materialNameResolver) {
      return this.materialNameResolver(materialId);
    }
    return materialId;
  }

  /**
   * アイテムIDから日本語名を解決する
   * itemNameResolverが設定されていない場合はIDをそのまま返す
   *
   * @param itemId - アイテムID
   * @returns 日本語名またはID
   */
  private resolveItemName(itemId: string): string {
    if (this.itemNameResolver) {
      return this.itemNameResolver(itemId);
    }
    return itemId;
  }
}
