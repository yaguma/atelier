/**
 * ContextPanel - 選択中オブジェクトの詳細表示スロット composite
 * Issue #456: UI刷新 Phase 2
 * Issue #458: UI刷新 Phase 4 A準備 - 最低限の子要素差し込み API 整備
 *
 * @description
 * Workspace の右カラムに配置される汎用情報パネル。
 * 既定では「タイトル + 本文」を表示するが、任意の子 GameObject を
 * `setChild` / `addChild` で差し込むスロットも提供する。
 *
 * Phase 4 A 本実装時に、依頼詳細・素材詳細・ヘルプなど
 * コンテキスト固有のビューを差し込めるよう設計する。
 *
 * 公開 API:
 * - `setContent(title, body)` / `clear()` — 旧方式（文字列のみ）
 * - `getTitle() / getBody()` — 読み取り（Phase 2 互換）
 * - `setChild(child)` — 任意の Phaser GameObject を子スロットに設定
 * - `addChild(child)` — 既存の子を保持したまま追加
 * - `clearChildren()` — 差し込まれた子のみを破棄
 */

import { BaseComponent, type BaseComponentOptions } from '@shared/components';
import { Colors, DesignTokens } from '@shared/theme';
import type Phaser from 'phaser';

// =============================================================================
// 型定義
// =============================================================================

export interface ContextPanelOptions extends BaseComponentOptions {
  width?: number;
  height?: number;
  title?: string;
  body?: string;
}

/** ContextPanel が受け入れる差し込み可能な子オブジェクト */
export type ContextPanelChild = Phaser.GameObjects.GameObject & {
  destroy?: () => void;
};

// =============================================================================
// 定数
// =============================================================================

const DEFAULT_WIDTH = 280;
const DEFAULT_HEIGHT = 320;
const PADDING = 16;

// =============================================================================
// ContextPanel
// =============================================================================

export class ContextPanel extends BaseComponent {
  private readonly width: number;
  private readonly height: number;

  private title: string;
  private body: string;

  // 視覚要素
  private titleText: Phaser.GameObjects.Text | null = null;
  private bodyText: Phaser.GameObjects.Text | null = null;

  /** setChild/addChild で差し込まれた子オブジェクト */
  private insertedChildren: ContextPanelChild[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, options: ContextPanelOptions = {}) {
    super(scene, x, y, options);
    this.width = options.width ?? DEFAULT_WIDTH;
    this.height = options.height ?? DEFAULT_HEIGHT;
    this.title = options.title ?? '';
    this.body = options.body ?? '';
  }

  // ===========================================================================
  // ライフサイクル
  // ===========================================================================

  create(): void {
    // 背景パネル
    const bg = this.scene.add.rectangle(0, 0, this.width, this.height, Colors.background.card);
    if (bg.setStrokeStyle) bg.setStrokeStyle(DesignTokens.border.thin, Colors.border.primary);
    if (bg.setName) bg.setName('ContextPanel.background');
    this.container.add(bg);
    this.container.setDepth(DesignTokens.zIndex.content);

    // タイトル
    const titleText = this.scene.add.text(0, -this.height / 2 + PADDING, this.title, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.medium}px`,
      color: '#333333',
      padding: { top: 4 },
    });
    if (titleText.setOrigin) titleText.setOrigin(0.5, 0);
    if (titleText.setName) titleText.setName('ContextPanel.title');
    this.titleText = titleText;
    this.container.add(titleText);

    // 本文
    const bodyText = this.scene.add.text(0, 0, this.body, {
      fontFamily: DesignTokens.fonts.primary,
      fontSize: `${DesignTokens.sizes.small}px`,
      color: '#666666',
      padding: { top: 4 },
      wordWrap: { width: this.width - PADDING * 2 },
    });
    if (bodyText.setOrigin) bodyText.setOrigin(0.5);
    if (bodyText.setName) bodyText.setName('ContextPanel.body');
    this.bodyText = bodyText;
    this.container.add(bodyText);
  }

  destroy(): void {
    this.clearChildren();
    this.bodyText = null;
    this.titleText = null;
    this.container.destroy(true);
  }

  // ===========================================================================
  // 公開API: 文字列コンテンツ
  // ===========================================================================

  setContent(title: string, body: string): this {
    this.title = title;
    this.body = body;
    this.titleText?.setText(title);
    this.bodyText?.setText(body);
    return this;
  }

  clear(): this {
    return this.setContent('', '');
  }

  getTitle(): string {
    return this.title;
  }

  getBody(): string {
    return this.body;
  }

  // ===========================================================================
  // 公開API: 任意の子要素差し込み
  // ===========================================================================

  /**
   * 差し込まれた子を全て破棄してから、新しい子を1つ設定する。
   * 既存の title / body テキストは維持される。
   */
  setChild(child: ContextPanelChild): this {
    this.clearChildren();
    this.addChild(child);
    return this;
  }

  /**
   * 既存の差し込み子を保持したまま、新しい子を追加する。
   * 重複追加は行わない。
   */
  addChild(child: ContextPanelChild): this {
    if (this.insertedChildren.includes(child)) return this;
    this.insertedChildren.push(child);
    this.container.add(child);
    return this;
  }

  /**
   * setChild/addChild で差し込まれた子のみを破棄する。
   * 背景・タイトル・本文は保持される。
   */
  clearChildren(): this {
    for (const child of this.insertedChildren) {
      try {
        child.destroy?.();
      } catch {
        // destroy 例外は無視（テストモック対応）
      }
    }
    this.insertedChildren = [];
    return this;
  }

  /** 現在差し込まれている子の数 */
  getChildCount(): number {
    return this.insertedChildren.length;
  }
}
