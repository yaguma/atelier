/**
 * マウス座標定義
 *
 * @description
 * ゲームUI要素の座標を定義する。
 * 基準解像度は1280x720。
 * マウス操作テストで使用する座標を一元管理。
 */

/**
 * 座標の型定義
 */
export interface Coordinates {
  x: number;
  y: number;
}

/**
 * バウンディングボックスの型定義
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 基準解像度
 */
export const BASE_RESOLUTION = {
  WIDTH: 1280,
  HEIGHT: 720,
} as const;

/**
 * タイトル画面の座標
 */
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

/**
 * 共通UI座標
 */
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
  /** フッター領域 */
  FOOTER: {
    NEXT_BUTTON: { x: 1144, y: 660 },
    END_DAY_BUTTON: { x: 400, y: 630 },
  },
} as const;

/**
 * 依頼受注フェーズの座標
 */
export const QUEST_ACCEPT_COORDS = {
  /** 依頼カード（5枚） */
  CARDS: [
    { x: 400, y: 290 }, // カード1
    { x: 700, y: 290 }, // カード2
    { x: 1000, y: 290 }, // カード3
    { x: 400, y: 490 }, // カード4
    { x: 700, y: 490 }, // カード5
  ] as Coordinates[],
  /** 詳細モーダル */
  MODAL: {
    CLOSE_BUTTON: { x: 900, y: 150 },
    ACCEPT_BUTTON: { x: 640, y: 500 },
    BACKGROUND: { x: 640, y: 360 },
  },
} as const;

/**
 * 採取フェーズの座標
 */
export const GATHERING_COORDS = {
  /** ドラフトカード（3枚） */
  DRAFT_CARDS: [
    { x: 450, y: 300 }, // カード1
    { x: 700, y: 300 }, // カード2
    { x: 950, y: 300 }, // カード3
  ] as Coordinates[],
  /** 採取終了ボタン */
  END_BUTTON: { x: 650, y: 550 },
  /** 素材インベントリ */
  INVENTORY: { x: 200, y: 500 },
} as const;

/**
 * 調合フェーズの座標
 */
export const ALCHEMY_COORDS = {
  /** レシピリスト */
  RECIPES: [
    { x: 500, y: 200 }, // レシピ1
    { x: 500, y: 260 }, // レシピ2
    { x: 500, y: 320 }, // レシピ3
  ] as Coordinates[],
  /** 素材スロット */
  MATERIAL_SLOTS: [
    { x: 700, y: 200 }, // スロット1
    { x: 700, y: 280 }, // スロット2
    { x: 700, y: 360 }, // スロット3
  ] as Coordinates[],
  /** 調合ボタン */
  SYNTHESIZE_BUTTON: { x: 700, y: 480 },
  /** 結果モーダル */
  RESULT_MODAL: {
    CLOSE_BUTTON: { x: 700, y: 500 },
    ITEM_DISPLAY: { x: 640, y: 360 },
  },
} as const;

/**
 * 納品フェーズの座標
 */
export const DELIVERY_COORDS = {
  /** 納品対象依頼 */
  QUESTS: [
    { x: 400, y: 200 }, // 依頼1
    { x: 400, y: 280 }, // 依頼2
    { x: 400, y: 360 }, // 依頼3
  ] as Coordinates[],
  /** アイテムリスト */
  ITEMS: [
    { x: 700, y: 350 }, // アイテム1
    { x: 700, y: 420 }, // アイテム2
    { x: 700, y: 490 }, // アイテム3
  ] as Coordinates[],
  /** 納品ボタン */
  DELIVER_BUTTON: { x: 400, y: 480 },
  /** 報酬モーダル */
  REWARD_MODAL: {
    CLOSE_BUTTON: { x: 700, y: 500 },
    REWARD_DISPLAY: { x: 640, y: 360 },
  },
} as const;

/**
 * リザルト画面の座標
 */
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

/**
 * 全座標のエクスポート
 */
export const MOUSE_COORDINATES = {
  title: TITLE_COORDS,
  common: COMMON_UI_COORDS,
  questAccept: QUEST_ACCEPT_COORDS,
  gathering: GATHERING_COORDS,
  alchemy: ALCHEMY_COORDS,
  delivery: DELIVERY_COORDS,
  result: RESULT_COORDS,
} as const;

/**
 * 座標を指定された解像度にスケーリング
 *
 * @param coords - 元の座標（基準解像度）
 * @param targetWidth - ターゲット幅
 * @param targetHeight - ターゲット高さ
 * @returns スケーリングされた座標
 */
export function scaleCoordinates(
  coords: Coordinates,
  targetWidth: number,
  targetHeight: number,
): Coordinates {
  const scaleX = targetWidth / BASE_RESOLUTION.WIDTH;
  const scaleY = targetHeight / BASE_RESOLUTION.HEIGHT;
  return {
    x: Math.round(coords.x * scaleX),
    y: Math.round(coords.y * scaleY),
  };
}

/**
 * バウンディングボックスの中心座標を取得
 *
 * @param box - バウンディングボックス
 * @returns 中心座標
 */
export function getCenterOfBoundingBox(box: BoundingBox): Coordinates {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}

/**
 * フェーズに応じたカード座標を取得
 *
 * @param phase - 現在のフェーズ
 * @param index - カードインデックス（0始まり）
 * @returns 座標（存在しない場合null）
 */
export function getCardCoordinates(phase: string, index: number): Coordinates | null {
  switch (phase) {
    case 'QUEST_ACCEPT':
      return QUEST_ACCEPT_COORDS.CARDS[index] ?? null;
    case 'GATHERING':
      return GATHERING_COORDS.DRAFT_CARDS[index] ?? null;
    case 'ALCHEMY':
      return ALCHEMY_COORDS.RECIPES[index] ?? null;
    case 'DELIVERY':
      return DELIVERY_COORDS.QUESTS[index] ?? null;
    default:
      return null;
  }
}
