/**
 * レイアウト共通定数
 * メインシーンのレイアウト構成値。UIコンポーネントが画面位置を参照する際に使用。
 *
 * Issue #486: 各コンポーネントのDEFAULT定数を一元管理に統合
 *
 * @信頼性レベル 🔵 requirements.md セクション2.1に基づく
 */

export const MAIN_LAYOUT = {
  /** サイドバー幅 */
  SIDEBAR_WIDTH: 200,
  /** ヘッダー（HUDBar）高さ */
  HEADER_HEIGHT: 60,
  /** HUDBar 内部の高さ */
  HUD_HEIGHT: 56,
  /** フェーズレール高さ */
  PHASE_RAIL_HEIGHT: 48,
  /** コンテキストパネル幅 */
  CONTEXT_PANEL_WIDTH: 260,
  /** コンテキストパネル余白 */
  CONTEXT_PANEL_PADDING: 8,
  /** フッター高さ */
  FOOTER_HEIGHT: 120,
} as const;
