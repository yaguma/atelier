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

import type { ICraftedItem, IMaterialInstance } from '@shared/types/materials';
import type { IActiveQuest } from '@shared/types/quests';
import type Phaser from 'phaser';
import { BaseComponent } from './BaseComponent';

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

  /** ショップボタン（ダミー） */
  private _shopButton = {};

  /** 依頼セクション（ダミー） */
  private _questsSection = {};

  /** 素材セクション（ダミー） */
  private _materialsSection = {};

  /** 完成品セクション（ダミー） */
  private _craftedItemsSection = {};

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

  /** ショップボタン背景 */
  private _shopButtonBackground: Phaser.GameObjects.Rectangle | null = null;
  /** ショップボタンテキスト */
  private _shopButtonText: Phaser.GameObjects.Text | null = null;

  // ===========================================================================
  // コンストラクタ
  // ===========================================================================

  /**
   * コンストラクタ
   *
   * @param scene - Phaserシーンインスタンス
   * @param x - X座標
   * @param y - Y座標
   * @throws {Error} sceneがnullまたはundefinedの場合
   */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // BaseComponentでも検証するが、テストで期待する具体的なエラーメッセージのため
    if (!scene) {
      throw new Error('scene is required');
    }
    super(scene, x, y);
  }

  // ===========================================================================
  // ライフサイクルメソッド
  // ===========================================================================

  /**
   * コンポーネントの初期化処理
   * TASK-0047: 視覚要素を生成
   */
  create(): void {
    // 依頼セクションヘッダーを生成
    this._questsIconText = this.scene.add.text(10, 10, '▼', {
      fontSize: '14px',
      color: '#FFFFFF',
    });
    this.container.add(this._questsIconText);

    this._questsHeaderText = this.scene.add.text(30, 10, '【受注依頼】', {
      fontSize: '14px',
      color: '#FFFFFF',
    });
    this.container.add(this._questsHeaderText);

    // 素材セクションヘッダーを生成
    this._materialsIconText = this.scene.add.text(10, 100, '▼', {
      fontSize: '14px',
      color: '#FFFFFF',
    });
    this.container.add(this._materialsIconText);

    this._materialsHeaderText = this.scene.add.text(30, 100, '【素材】', {
      fontSize: '14px',
      color: '#FFFFFF',
    });
    this.container.add(this._materialsHeaderText);

    // 完成品セクションヘッダーを生成
    this._craftedItemsIconText = this.scene.add.text(10, 200, '▼', {
      fontSize: '14px',
      color: '#FFFFFF',
    });
    this.container.add(this._craftedItemsIconText);

    this._craftedItemsHeaderText = this.scene.add.text(30, 200, '【完成品】', {
      fontSize: '14px',
      color: '#FFFFFF',
    });
    this.container.add(this._craftedItemsHeaderText);

    // 保管容量テキストを生成
    this._storageTextElement = this.scene.add.text(10, 300, '保管: 0/20', {
      fontSize: '14px',
      color: '#FFFFFF',
    });
    this.container.add(this._storageTextElement);

    // ショップボタンを生成
    this._shopButtonBackground = this.scene.add.rectangle(90, 350, 160, 36, 0x6366f1);
    this._shopButtonBackground.setInteractive();
    this.container.add(this._shopButtonBackground);

    this._shopButtonText = this.scene.add.text(60, 340, 'ショップ', {
      fontSize: '14px',
      color: '#FFFFFF',
    });
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
  // biome-ignore lint/suspicious/noExplicitAny: UI要素の戻り値型は複雑なためanyを使用
  getQuestsSection(): any {
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
  // biome-ignore lint/suspicious/noExplicitAny: UI要素の戻り値型は複雑なためanyを使用
  getMaterialsSection(): any {
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
  // biome-ignore lint/suspicious/noExplicitAny: UI要素の戻り値型は複雑なためanyを使用
  getCraftedItemsSection(): any {
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
  // biome-ignore lint/suspicious/noExplicitAny: UI要素の戻り値型は複雑なためanyを使用
  getShopButton(): any {
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
        break;
      case 'materials':
        if (this._materialsIconText) {
          this._materialsIconText.setText(iconText);
        }
        break;
      case 'craftedItems':
        if (this._craftedItemsIconText) {
          this._craftedItemsIconText.setText(iconText);
        }
        break;
    }
  }
}
