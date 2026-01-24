/**
 * rexUI型定義
 * TASK-0059: rexUIプラグインに対する型定義
 *
 * @description
 * rexUIプラグインの型定義を提供し、コードベース全体で適切な型を使用できるようにする。
 * phaser3-rex-plugins/templates/ui/ui-plugin の公式型定義を活用。
 */

import type UIPluginType from 'phaser3-rex-plugins/templates/ui/ui-plugin';

// =============================================================================
// rexUIプラグインの型エクスポート
// =============================================================================

/**
 * rexUIプラグインの型
 * scene.rexUIの型として使用
 */
export type RexUIPlugin = UIPluginType;

/**
 * UIPlugin のデフォルトエクスポート
 * Phaserの型拡張で使用
 */
export { UIPluginType };

// =============================================================================
// 主要コンポーネントの型エクスポート
// =============================================================================

// Label コンポーネント
export type { default as RexLabel } from 'phaser3-rex-plugins/templates/ui/label/Label';

// Dialog コンポーネント
export type { default as RexDialog } from 'phaser3-rex-plugins/templates/ui/dialog/Dialog';

// RoundRectangle コンポーネント
export type { default as RexRoundRectangle } from 'phaser3-rex-plugins/templates/ui/roundrectangle/RoundRectangle';

// Sizer コンポーネント
export type { default as RexSizer } from 'phaser3-rex-plugins/templates/ui/sizer/Sizer';

// GridSizer コンポーネント
export type { default as RexGridSizer } from 'phaser3-rex-plugins/templates/ui/gridsizer/GridSizer';

// Buttons コンポーネント
export type { default as RexButtons } from 'phaser3-rex-plugins/templates/ui/buttons/Buttons';

// ScrollablePanel コンポーネント
export type { default as RexScrollablePanel } from 'phaser3-rex-plugins/templates/ui/scrollablepanel/ScrollablePanel';

// FixWidthSizer コンポーネント
export type { default as RexFixWidthSizer } from 'phaser3-rex-plugins/templates/ui/fixwidthsizer/FixWidthSizer';

// OverlapSizer コンポーネント
export type { default as RexOverlapSizer } from 'phaser3-rex-plugins/templates/ui/overlapsizer/OverlapSizer';

// TextArea コンポーネント
export type { default as RexTextArea } from 'phaser3-rex-plugins/templates/ui/textarea/TextArea';

// Slider コンポーネント
export type { default as RexSlider } from 'phaser3-rex-plugins/templates/ui/slider/Slider';

// NumberBar コンポーネント
export type { default as RexNumberBar } from 'phaser3-rex-plugins/templates/ui/numberbar/NumberBar';

// Toast コンポーネント
export type { default as RexToast } from 'phaser3-rex-plugins/templates/ui/toast/Toast';

// Menu コンポーネント
export type { default as RexMenu } from 'phaser3-rex-plugins/templates/ui/menu/Menu';

// GridTable コンポーネント
export type { default as RexGridTable } from 'phaser3-rex-plugins/templates/ui/gridtable/GridTable';

// Pages コンポーネント
export type { default as RexPages } from 'phaser3-rex-plugins/templates/ui/pages/Pages';

// Tabs コンポーネント
export type { default as RexTabs } from 'phaser3-rex-plugins/templates/ui/tabs/Tabs';

// =============================================================================
// Phaser.Scene 型拡張
// =============================================================================

declare module 'phaser' {
  interface Scene {
    /**
     * rexUIプラグインへの参照
     * main.tsでプラグインとして登録されている
     * 【修正内容】: I-001への対応
     * 【修正理由】: UIPlugin → UIPluginType に修正（同ファイルでエクスポートされている正しい型名を使用）
     * 🔵 信頼性レベル: rexui.d.ts内の型定義に準拠
     */
    rexUI: UIPluginType;
  }
}
