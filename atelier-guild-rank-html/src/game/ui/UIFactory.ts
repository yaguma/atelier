/**
 * UIFactory基盤クラス
 *
 * rexUIを使用したUI要素の生成を一元管理する。
 * 各コンポーネント生成メソッドは後続タスクで実装予定。
 * 設計文書: docs/design/atelier-guild-rank-phaser/ui-design/overview.md
 */

import Phaser from 'phaser';
import type UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import { Colors } from '../config/ColorPalette';
import { TextStyles } from '../config/TextStyles';
import type {
  ButtonOptions,
  LabelOptions,
  PanelOptions,
  DialogOptions,
  ProgressBarOptions,
  ScrollPanelOptions,
  GridButtonsOptions,
  ToastOptions,
  TooltipOptions,
  UIBaseStyle,
} from './UITypes';

/**
 * デフォルトスタイル設定
 */
export const DefaultUIStyles = {
  /** ボタンのデフォルトスタイル */
  button: {
    backgroundColor: Colors.primary,
    cornerRadius: 8,
    padding: { top: 10, bottom: 10, left: 20, right: 20 },
  } satisfies UIBaseStyle,

  /** パネルのデフォルトスタイル */
  panel: {
    backgroundColor: Colors.panelBackground,
    borderColor: Colors.panelBorder,
    borderWidth: 2,
    cornerRadius: 12,
    padding: 16,
  } satisfies UIBaseStyle,

  /** ダイアログのデフォルトスタイル */
  dialog: {
    backgroundColor: Colors.panelBackground,
    borderColor: Colors.accent,
    borderWidth: 2,
    cornerRadius: 16,
    padding: 24,
  } satisfies UIBaseStyle,

  /** プログレスバーのデフォルトスタイル */
  progressBar: {
    backgroundColor: Colors.progressBackground,
    cornerRadius: 4,
  } satisfies UIBaseStyle,
} as const;

/**
 * UIFactory基盤クラス
 *
 * シーン内でのUI要素生成を一元管理し、以下の機能を提供：
 * - 共通スタイルの適用
 * - rexUIコンポーネントの生成
 * - ユーティリティメソッド
 *
 * @example
 * ```typescript
 * // BaseGameSceneのcreate()で使用
 * const uiFactory = new UIFactory(this, this.rexUI);
 *
 * const button = uiFactory.createButton({
 *   x: 640,
 *   y: 400,
 *   text: 'Start Game',
 *   onClick: () => this.goToScene(SceneKeys.MAIN),
 * });
 * ```
 */
export class UIFactory {
  /**
   * コンストラクタ
   * @param scene Phaserシーン
   * @param rexUI rexUIプラグイン
   */
  constructor(
    protected scene: Phaser.Scene,
    protected rexUI: UIPlugin
  ) {}

  // =====================================================
  // コンポーネント生成メソッド（後続タスクで実装）
  // =====================================================

  /**
   * ボタンを生成
   * @param options ボタンオプション
   * @returns rexUI Buttonオブジェクト
   * @see TASK-0173
   */
  createButton(_options: ButtonOptions): unknown {
    throw new Error('Not implemented - see TASK-0173');
  }

  /**
   * ラベルを生成
   * @param options ラベルオプション
   * @returns rexUI Labelオブジェクト
   * @see TASK-0174
   */
  createLabel(_options: LabelOptions): unknown {
    throw new Error('Not implemented - see TASK-0174');
  }

  /**
   * パネルを生成
   * @param options パネルオプション
   * @returns rexUI Sizerオブジェクト
   * @see TASK-0175
   */
  createPanel(_options: PanelOptions): unknown {
    throw new Error('Not implemented - see TASK-0175');
  }

  /**
   * ダイアログを生成
   * @param options ダイアログオプション
   * @returns rexUI Dialogオブジェクト
   * @see TASK-0176
   */
  createDialog(_options: DialogOptions): unknown {
    throw new Error('Not implemented - see TASK-0176');
  }

  /**
   * プログレスバーを生成
   * @param options プログレスバーオプション
   * @returns rexUI ProgressBarオブジェクト
   * @see TASK-0177
   */
  createProgressBar(_options: ProgressBarOptions): unknown {
    throw new Error('Not implemented - see TASK-0177');
  }

  /**
   * スクロールパネルを生成
   * @param options スクロールパネルオプション
   * @returns rexUI ScrollablePanelオブジェクト
   * @see TASK-0178
   */
  createScrollPanel(_options: ScrollPanelOptions): unknown {
    throw new Error('Not implemented - see TASK-0178');
  }

  /**
   * グリッドボタンを生成
   * @param options グリッドボタンオプション
   * @returns rexUI GridButtonsオブジェクト
   * @see TASK-0179
   */
  createGridButtons(_options: GridButtonsOptions): unknown {
    throw new Error('Not implemented - see TASK-0179');
  }

  /**
   * トーストを表示
   * @param options トーストオプション
   * @see TASK-0180
   */
  showToast(_options: ToastOptions): void {
    throw new Error('Not implemented - see TASK-0180');
  }

  /**
   * ツールチップを追加
   * @param options ツールチップオプション
   * @see TASK-0180
   */
  addTooltip(_options: TooltipOptions): void {
    throw new Error('Not implemented - see TASK-0180');
  }

  // =====================================================
  // ユーティリティメソッド
  // =====================================================

  /**
   * 角丸四角形を生成
   * @param x X座標
   * @param y Y座標
   * @param width 幅
   * @param height 高さ
   * @param color 塗りつぶし色
   * @param radius 角丸半径
   * @returns Graphics オブジェクト
   */
  createRoundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    radius: number = 8
  ): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    return graphics;
  }

  /**
   * 枠線付き角丸四角形を生成
   * @param x X座標
   * @param y Y座標
   * @param width 幅
   * @param height 高さ
   * @param fillColor 塗りつぶし色
   * @param strokeColor 枠線色
   * @param strokeWidth 枠線幅
   * @param radius 角丸半径
   * @returns Graphics オブジェクト
   */
  createRoundedRectWithStroke(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
    strokeColor: number,
    strokeWidth: number = 2,
    radius: number = 8
  ): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();

    // 塗りつぶし
    graphics.fillStyle(fillColor);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);

    // 枠線
    graphics.lineStyle(strokeWidth, strokeColor);
    graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius);

    return graphics;
  }

  /**
   * テキストを生成（共通スタイル適用）
   * @param x X座標
   * @param y Y座標
   * @param text テキスト内容
   * @param style スタイル（省略時はbody）
   * @returns Textオブジェクト
   */
  createText(
    x: number,
    y: number,
    text: string,
    style: keyof typeof TextStyles = 'body'
  ): Phaser.GameObjects.Text {
    return this.scene.add.text(x, y, text, TextStyles[style]).setOrigin(0.5);
  }

  /**
   * rexUIプラグインを取得
   */
  getRexUI(): UIPlugin {
    return this.rexUI;
  }

  /**
   * シーンを取得
   */
  getScene(): Phaser.Scene {
    return this.scene;
  }
}
