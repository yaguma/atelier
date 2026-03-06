/**
 * マウス座標定義
 *
 * @description
 * ゲームUI要素の座標を定義する。
 * 基準解像度は1280x720。
 * すべての座標はレイアウト定数に基づいて計算される。
 *
 * Issue #367: レイアウト定数ベースの座標計算に統一
 */

// =============================================================================
// 型定義
// =============================================================================

/**
 * 座標の型定義
 */
export interface Coordinates {
  x: number;
  y: number;
}

// =============================================================================
// 基準解像度・レイアウト定数
// =============================================================================

/**
 * 基準解像度（src/main.ts の Phaser config と同期）
 */
export const BASE_RESOLUTION = {
  WIDTH: 1280,
  HEIGHT: 720,
} as const;

/**
 * メインシーンレイアウト定数
 * src/shared/constants/layout.ts の MAIN_LAYOUT と同期すること
 */
export const MAIN_LAYOUT = {
  /** サイドバー幅 */
  SIDEBAR_WIDTH: 200,
  /** ヘッダー高さ */
  HEADER_HEIGHT: 60,
  /** フッター高さ */
  FOOTER_HEIGHT: 120,
} as const;

/**
 * コンテンツエリアの範囲（Canvas座標）
 * MainSceneの contentContainer が配置される領域
 */
export const CONTENT_AREA = {
  x: MAIN_LAYOUT.SIDEBAR_WIDTH,
  y: MAIN_LAYOUT.HEADER_HEIGHT,
  width: BASE_RESOLUTION.WIDTH - MAIN_LAYOUT.SIDEBAR_WIDTH,
  height: BASE_RESOLUTION.HEIGHT - MAIN_LAYOUT.HEADER_HEIGHT - MAIN_LAYOUT.FOOTER_HEIGHT,
} as const;

/**
 * フッターエリアの範囲（Canvas座標）
 */
export const FOOTER_AREA = {
  x: MAIN_LAYOUT.SIDEBAR_WIDTH,
  y: BASE_RESOLUTION.HEIGHT - MAIN_LAYOUT.FOOTER_HEIGHT,
  width: BASE_RESOLUTION.WIDTH - MAIN_LAYOUT.SIDEBAR_WIDTH,
  height: MAIN_LAYOUT.FOOTER_HEIGHT,
} as const;

// =============================================================================
// 座標変換ヘルパー
// =============================================================================

/**
 * コンテンツエリア内の相対座標をCanvas座標に変換
 *
 * @param contentX - コンテンツエリア内のX座標
 * @param contentY - コンテンツエリア内のY座標
 * @returns Canvas座標
 */
export function contentToCanvas(contentX: number, contentY: number): Coordinates {
  return {
    x: CONTENT_AREA.x + contentX,
    y: CONTENT_AREA.y + contentY,
  };
}

/**
 * フッターエリア内の相対座標をCanvas座標に変換
 *
 * @param footerX - フッターエリア内のX座標
 * @param footerY - フッターエリア内のY座標
 * @returns Canvas座標
 */
export function footerToCanvas(footerX: number, footerY: number): Coordinates {
  return {
    x: FOOTER_AREA.x + footerX,
    y: FOOTER_AREA.y + footerY,
  };
}

// =============================================================================
// フェーズタブ定数（PhaseTabUI: src/shared/components/PhaseTabUI.ts 同期）
// =============================================================================

/**
 * PhaseTabUIレイアウト定数
 */
const PHASE_TAB_LAYOUT = {
  TAB_WIDTH: 100,
  TAB_HEIGHT: 40,
  TAB_SPACING: 8,
  TAB_START_X: 16,
  TAB_Y: 20,
  END_DAY_WIDTH: 80,
  END_DAY_MARGIN: 16,
} as const;

/** フェーズ順序（VALID_GAME_PHASESと同期） */
const PHASE_ORDER = ['QUEST_ACCEPT', 'GATHERING', 'ALCHEMY', 'DELIVERY'] as const;

/**
 * フェーズタブの中心座標を計算（フッターローカル座標）
 */
function getPhaseTabLocalCenter(phaseIndex: number): Coordinates {
  const tabCenterX =
    PHASE_TAB_LAYOUT.TAB_START_X +
    phaseIndex * (PHASE_TAB_LAYOUT.TAB_WIDTH + PHASE_TAB_LAYOUT.TAB_SPACING) +
    PHASE_TAB_LAYOUT.TAB_WIDTH / 2;
  const tabCenterY = PHASE_TAB_LAYOUT.TAB_Y + PHASE_TAB_LAYOUT.TAB_HEIGHT / 2;
  return { x: tabCenterX, y: tabCenterY };
}

/**
 * 日終了ボタンの中心座標を計算（フッターローカル座標）
 */
function getEndDayLocalCenter(): Coordinates {
  const endDayX =
    PHASE_TAB_LAYOUT.TAB_START_X +
    PHASE_ORDER.length * (PHASE_TAB_LAYOUT.TAB_WIDTH + PHASE_TAB_LAYOUT.TAB_SPACING) +
    PHASE_TAB_LAYOUT.END_DAY_WIDTH / 2 +
    PHASE_TAB_LAYOUT.END_DAY_MARGIN;
  const endDayCenterY = PHASE_TAB_LAYOUT.TAB_Y + PHASE_TAB_LAYOUT.TAB_HEIGHT / 2;
  return { x: endDayX, y: endDayCenterY };
}

// =============================================================================
// 依頼受注フェーズ座標（QuestAcceptPhaseUI 同期）
// =============================================================================

/**
 * QuestAcceptPhaseUIのグリッドレイアウト定数
 * src/shared/presentation/ui/phases/QuestAcceptPhaseUI.ts と同期
 */
const QUEST_GRID = {
  COLUMNS: 3,
  START_X: 200,
  START_Y: 150,
  SPACING_X: 300,
  SPACING_Y: 200,
} as const;

/**
 * 依頼カードのCanvas座標を計算
 *
 * @param index - カードインデックス（0始まり）
 * @returns Canvas座標（カード中心）
 */
function questCardCanvasCoords(index: number): Coordinates {
  const col = index % QUEST_GRID.COLUMNS;
  const row = Math.floor(index / QUEST_GRID.COLUMNS);
  const contentX = QUEST_GRID.START_X + col * QUEST_GRID.SPACING_X;
  const contentY = QUEST_GRID.START_Y + row * QUEST_GRID.SPACING_Y;
  return contentToCanvas(contentX, contentY);
}

// =============================================================================
// 調合フェーズ座標（AlchemyPhaseUI 同期）
// =============================================================================

/**
 * AlchemyPhaseUIのレイアウト定数
 * src/features/alchemy/components/AlchemyPhaseUI.ts と同期
 */
const ALCHEMY_LAYOUT = {
  RECIPE_LIST_START_Y: 80,
  RECIPE_LIST_OFFSET_X: 20,
  ITEM_WIDTH: 200,
  ITEM_HEIGHT: 30,
  ITEM_SPACING: 12,
  MATERIAL_LINE_HEIGHT: 22,
  PADDING_VERTICAL: 5,
} as const;

/**
 * レシピカードの高さを推定（素材数2個を標準とする）
 */
const ESTIMATED_RECIPE_CARD_HEIGHT =
  ALCHEMY_LAYOUT.ITEM_HEIGHT +
  2 * ALCHEMY_LAYOUT.MATERIAL_LINE_HEIGHT +
  ALCHEMY_LAYOUT.PADDING_VERTICAL;

/**
 * レシピのCanvas座標を計算
 *
 * @param index - レシピインデックス（0始まり）
 * @returns Canvas座標（カード中心）
 */
function recipeCanvasCoords(index: number): Coordinates {
  const cardHeight = ESTIMATED_RECIPE_CARD_HEIGHT;
  const contentX = ALCHEMY_LAYOUT.RECIPE_LIST_OFFSET_X + ALCHEMY_LAYOUT.ITEM_WIDTH / 2;
  const contentY =
    ALCHEMY_LAYOUT.RECIPE_LIST_START_Y +
    index * (cardHeight + ALCHEMY_LAYOUT.ITEM_SPACING) +
    cardHeight / 2;
  return contentToCanvas(contentX, contentY);
}

// =============================================================================
// タイトル画面の座標（Canvas中央ベース）
// =============================================================================

export const TITLE_COORDS = {
  /** 新規ゲームボタン */
  NEW_GAME: { x: 640, y: 400 },
  /** コンティニューボタン */
  CONTINUE: { x: 640, y: 470 },
  /** 設定ボタン */
  SETTINGS: { x: 640, y: 540 },
  /** ロゴ */
  LOGO: { x: 640, y: 200 },
} as const;

// =============================================================================
// 共通UI座標
// =============================================================================

export const COMMON_UI_COORDS = {
  /** ヘッダー領域 */
  HEADER: {
    RANK_DISPLAY: { x: 100, y: 50 },
    DAYS_DISPLAY: { x: 300, y: 50 },
    GOLD_DISPLAY: { x: 500, y: 50 },
    AP_DISPLAY: { x: 700, y: 50 },
  },
  /** サイドバー領域 */
  SIDEBAR: {
    SHOP_BUTTON: { x: 100, y: 504 },
    QUEST_LIST: { x: 100, y: 300 },
    MATERIAL_LIST: { x: 100, y: 400 },
  },
  /** フッター領域（PhaseTabUI） */
  FOOTER: {
    /** 各フェーズタブ（Canvas座標） */
    PHASE_TAB_QUEST_ACCEPT: footerToCanvas(
      getPhaseTabLocalCenter(0).x,
      getPhaseTabLocalCenter(0).y,
    ),
    PHASE_TAB_GATHERING: footerToCanvas(getPhaseTabLocalCenter(1).x, getPhaseTabLocalCenter(1).y),
    PHASE_TAB_ALCHEMY: footerToCanvas(getPhaseTabLocalCenter(2).x, getPhaseTabLocalCenter(2).y),
    PHASE_TAB_DELIVERY: footerToCanvas(getPhaseTabLocalCenter(3).x, getPhaseTabLocalCenter(3).y),
    /** 日終了ボタン（Canvas座標） */
    END_DAY_BUTTON: footerToCanvas(getEndDayLocalCenter().x, getEndDayLocalCenter().y),
  },
} as const;

// =============================================================================
// 依頼受注フェーズの座標（Canvas座標）
// =============================================================================

export const QUEST_ACCEPT_COORDS = {
  /** 依頼カード（5枚）- Canvas座標 */
  CARDS: [
    questCardCanvasCoords(0),
    questCardCanvasCoords(1),
    questCardCanvasCoords(2),
    questCardCanvasCoords(3),
    questCardCanvasCoords(4),
  ] as Coordinates[],
  /** 詳細モーダル */
  MODAL: {
    CLOSE_BUTTON: { x: 900, y: 150 },
    ACCEPT_BUTTON: { x: 640, y: 500 },
    BACKGROUND: { x: 640, y: 360 },
  },
} as const;

// =============================================================================
// 採取フェーズの座標
// =============================================================================

/**
 * 採取フェーズ（ドラフトカード）のCanvas座標
 * Note: 採取フェーズは場所選択→ドラフトセッションの2段階。
 * ドラフトカードの座標はコンテンツエリア中央付近に配置される。
 */
export const GATHERING_COORDS = {
  /** ドラフトカード（3枚）- コンテンツエリア中央に均等配置と仮定 */
  DRAFT_CARDS: [
    contentToCanvas(250, 240),
    contentToCanvas(500, 240),
    contentToCanvas(750, 240),
  ] as Coordinates[],
  /** 採取終了ボタン */
  END_BUTTON: contentToCanvas(450, 490),
  /** 素材インベントリ */
  INVENTORY: { x: 200, y: 500 },
} as const;

// =============================================================================
// 調合フェーズの座標（Canvas座標）
// =============================================================================

export const ALCHEMY_COORDS = {
  /** レシピリスト - Canvas座標 */
  RECIPES: [recipeCanvasCoords(0), recipeCanvasCoords(1), recipeCanvasCoords(2)] as Coordinates[],
  /** 素材スロット */
  MATERIAL_SLOTS: [
    contentToCanvas(500, 200),
    contentToCanvas(500, 280),
    contentToCanvas(500, 360),
  ] as Coordinates[],
  /** 調合ボタン */
  SYNTHESIZE_BUTTON: contentToCanvas(500, 420),
  /** 結果モーダル */
  RESULT_MODAL: {
    CLOSE_BUTTON: { x: 700, y: 500 },
    ITEM_DISPLAY: { x: 640, y: 360 },
  },
} as const;

// =============================================================================
// 納品フェーズの座標
// =============================================================================

export const DELIVERY_COORDS = {
  /** 納品対象依頼 */
  QUESTS: [
    contentToCanvas(200, 140),
    contentToCanvas(200, 220),
    contentToCanvas(200, 300),
  ] as Coordinates[],
  /** アイテムリスト */
  ITEMS: [
    contentToCanvas(500, 290),
    contentToCanvas(500, 360),
    contentToCanvas(500, 430),
  ] as Coordinates[],
  /** 納品ボタン */
  DELIVER_BUTTON: contentToCanvas(200, 420),
  /** 報酬モーダル */
  REWARD_MODAL: {
    CLOSE_BUTTON: { x: 700, y: 500 },
    REWARD_DISPLAY: { x: 640, y: 360 },
  },
} as const;

// =============================================================================
// リザルト画面の座標
// =============================================================================

export const RESULT_COORDS = {
  /** ゲームクリア画面 */
  GAME_CLEAR: {
    TITLE_BUTTON: { x: 500, y: 550 },
    NEW_GAME_PLUS_BUTTON: { x: 780, y: 550 },
    STATISTICS: { x: 640, y: 360 },
  },
  /** ゲームオーバー画面 */
  GAME_OVER: {
    TITLE_BUTTON: { x: 500, y: 550 },
    RETRY_BUTTON: { x: 780, y: 550 },
    STATISTICS: { x: 640, y: 360 },
  },
} as const;

// =============================================================================
// 全座標のエクスポート
// =============================================================================

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * フェーズ名からフェーズタブのCanvas座標を取得
 *
 * @param phase - フェーズ名
 * @returns Canvas座標（見つからない場合null）
 */
export function getPhaseTabCoords(phase: string): Coordinates | null {
  const index = PHASE_ORDER.indexOf(phase as (typeof PHASE_ORDER)[number]);
  if (index === -1) return null;
  const local = getPhaseTabLocalCenter(index);
  return footerToCanvas(local.x, local.y);
}
