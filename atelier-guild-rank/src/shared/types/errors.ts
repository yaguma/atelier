/**
 * errors.ts - エラー型定義
 *
 * ドメインエラーとアプリケーションエラーのクラス定義
 */

// =============================================================================
// エラークラス
// =============================================================================

/**
 * ドメインエラー
 * ビジネスロジックに関連するエラー
 */
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * アプリケーションエラー
 * ユーザー向けのエラーメッセージを含むエラー
 */
export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    public readonly userMessage: string,
    public readonly originalError?: Error,
  ) {
    super(userMessage);
    this.name = 'ApplicationError';
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}

// =============================================================================
// エラーコード定数
// =============================================================================

/** エラーコード定義 */
export const ErrorCodes = {
  // デッキ関連
  DECK_EMPTY: 'DECK_EMPTY',
  DECK_FULL: 'DECK_FULL',
  CARD_NOT_IN_HAND: 'CARD_NOT_IN_HAND',
  INVALID_CARD_ID: 'INVALID_CARD_ID',

  // 採取関連
  INSUFFICIENT_ACTION_POINTS: 'INSUFFICIENT_ACTION_POINTS',
  INVALID_GATHERING_STATE: 'INVALID_GATHERING_STATE',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  INVALID_SELECTION: 'INVALID_SELECTION',
  INVALID_CARD_TYPE: 'INVALID_CARD_TYPE',

  // 調合関連
  INSUFFICIENT_MATERIALS: 'INSUFFICIENT_MATERIALS',
  INVALID_RECIPE: 'INVALID_RECIPE',

  // 依頼関連
  QUEST_NOT_FOUND: 'QUEST_NOT_FOUND',
  QUEST_EXPIRED: 'QUEST_EXPIRED',
  QUEST_LIMIT_EXCEEDED: 'QUEST_LIMIT_EXCEEDED',
  INVALID_DELIVERY: 'INVALID_DELIVERY',

  // ショップ関連
  INSUFFICIENT_GOLD: 'INSUFFICIENT_GOLD',
  ITEM_NOT_AVAILABLE: 'ITEM_NOT_AVAILABLE',

  // セーブ関連
  SAVE_FAILED: 'SAVE_FAILED',
  LOAD_FAILED: 'LOAD_FAILED',
  INVALID_SAVE_DATA: 'INVALID_SAVE_DATA',

  // 状態関連
  INVALID_PHASE_TRANSITION: 'INVALID_PHASE_TRANSITION',
  INVALID_STATE: 'INVALID_STATE',

  // データ読み込み関連
  DATA_LOAD_FAILED: 'DATA_LOAD_FAILED',
  DATA_NOT_LOADED: 'DATA_NOT_LOADED',

  // 素材関連
  INVALID_MATERIAL_ID: 'INVALID_MATERIAL_ID',
  INVALID_MATERIALS: 'INVALID_MATERIALS',
} as const;

/** エラーコード型 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
