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
  /** ヘッダー領域の高さ（HUDBar配置スロットの高さ。位置計算に使用） */
  HEADER_HEIGHT: 60,
  /** HUDBar 内部の描画高さ（背景パネル・ボーダー等の実描画サイズ） */
  HUD_HEIGHT: 56,
  /** フェーズレール高さ */
  PHASE_RAIL_HEIGHT: 48,
  /** コンテキストパネル幅 */
  CONTEXT_PANEL_WIDTH: 260,
  /** コンテキストパネル余白（位置計算に必要なためTHEMEではなくここで管理） */
  CONTEXT_PANEL_PADDING: 8,
  /** フッター高さ */
  FOOTER_HEIGHT: 120,
  /** ゲーム画面幅 */
  GAME_WIDTH: 1280,
} as const;

/**
 * ContentContainer内の作業領域中央X座標（ContextPanel領域を除く）
 * 計算: (GAME_WIDTH - SIDEBAR_WIDTH - CONTEXT_PANEL_WIDTH) / 2 = (1280 - 200 - 260) / 2 = 410
 */
export const CONTENT_WORK_CENTER_X =
  (MAIN_LAYOUT.GAME_WIDTH - MAIN_LAYOUT.SIDEBAR_WIDTH - MAIN_LAYOUT.CONTEXT_PANEL_WIDTH) / 2;
