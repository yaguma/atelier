/**
 * save-data-validator.ts - セーブデータバリデーション関数
 *
 * Issue #310: セーブデータマイグレーション関数のインターフェース設計
 *
 * @description
 * マイグレーション後のセーブデータが正しい構造・値を持っているか検証する。
 * すべての関数は純粋関数（Functional Core）として実装。
 */

import { GamePhase, GuildRank } from '@shared/types';
import type { IValidationError, IValidationResult } from './types';
import { isObject } from './types';

// =============================================================================
// 定数
// =============================================================================

/** 有効な GamePhase 値の集合 */
const VALID_GAME_PHASES = new Set<string>(Object.values(GamePhase));

/** 有効な GuildRank 値の集合 */
const VALID_GUILD_RANKS = new Set<string>(Object.values(GuildRank));

// =============================================================================
// バリデーション関数（公開API）
// =============================================================================

/**
 * セーブデータ全体をバリデーションする
 *
 * 【純粋関数】
 * マイグレーション後のデータが ISaveData の構造に適合しているか検証する。
 * 改ざんデータや破損データを安全に検出する。
 *
 * @param data 検証対象のデータ（unknown型: 型安全性のため）
 * @returns バリデーション結果
 */
export function validateSaveData(data: unknown): IValidationResult {
  const errors: IValidationError[] = [];

  // 基本構造チェック
  if (!isObject(data)) {
    return {
      valid: false,
      errors: [createError('', 'object', typeof data, 'セーブデータがオブジェクトではありません')],
    };
  }

  // version チェック
  if (!isNonEmptyString(data.version)) {
    errors.push(
      createError('version', 'non-empty string', String(data.version), 'バージョンが不正です'),
    );
  }

  // lastSaved チェック
  if (!isNonEmptyString(data.lastSaved)) {
    errors.push(
      createError('lastSaved', 'ISO8601 string', String(data.lastSaved), '最終保存日時が不正です'),
    );
  }

  // gameState チェック
  if (!isObject(data.gameState)) {
    errors.push(
      createError(
        'gameState',
        'object',
        typeof data.gameState,
        'ゲーム状態がオブジェクトではありません',
      ),
    );
  } else {
    errors.push(...validateGameState(data.gameState));
  }

  // deckState チェック
  if (!isObject(data.deckState)) {
    errors.push(
      createError(
        'deckState',
        'object',
        typeof data.deckState,
        'デッキ状態がオブジェクトではありません',
      ),
    );
  } else {
    errors.push(...validateDeckState(data.deckState));
  }

  // inventoryState チェック
  if (!isObject(data.inventoryState)) {
    errors.push(
      createError(
        'inventoryState',
        'object',
        typeof data.inventoryState,
        'インベントリ状態がオブジェクトではありません',
      ),
    );
  } else {
    errors.push(...validateInventoryState(data.inventoryState));
  }

  // questState チェック
  if (!isObject(data.questState)) {
    errors.push(
      createError(
        'questState',
        'object',
        typeof data.questState,
        '依頼状態がオブジェクトではありません',
      ),
    );
  } else {
    errors.push(...validateQuestState(data.questState));
  }

  // artifacts チェック
  if (!isStringArray(data.artifacts)) {
    errors.push(
      createError(
        'artifacts',
        'string[]',
        String(data.artifacts),
        'アーティファクトリストが不正です',
      ),
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// セクション別バリデーション（内部関数）
// =============================================================================

/**
 * GameState をバリデーションする
 *
 * @param state 検証対象（オブジェクト確認済み）
 * @returns エラー配列
 */
function validateGameState(state: Record<string, unknown>): IValidationError[] {
  const errors: IValidationError[] = [];

  // currentRank
  if (!isValidEnumValue(state.currentRank, VALID_GUILD_RANKS)) {
    errors.push(
      createError(
        'gameState.currentRank',
        `one of: ${[...VALID_GUILD_RANKS].join(', ')}`,
        String(state.currentRank),
        'ギルドランクが不正です',
      ),
    );
  }

  // rankHp
  if (!isNonNegativeInteger(state.rankHp)) {
    errors.push(
      createError(
        'gameState.rankHp',
        'non-negative integer',
        String(state.rankHp),
        'ランクHPが不正です',
      ),
    );
  }

  // promotionGauge
  if (!isNonNegativeNumber(state.promotionGauge)) {
    errors.push(
      createError(
        'gameState.promotionGauge',
        'non-negative number',
        String(state.promotionGauge),
        '昇格ゲージが不正です',
      ),
    );
  }

  // remainingDays
  if (!isNonNegativeInteger(state.remainingDays)) {
    errors.push(
      createError(
        'gameState.remainingDays',
        'non-negative integer',
        String(state.remainingDays),
        '残り日数が不正です',
      ),
    );
  }

  // currentDay
  if (!isPositiveInteger(state.currentDay)) {
    errors.push(
      createError(
        'gameState.currentDay',
        'positive integer (>= 1)',
        String(state.currentDay),
        '現在の日数が不正です',
      ),
    );
  }

  // currentPhase
  if (!isValidEnumValue(state.currentPhase, VALID_GAME_PHASES)) {
    errors.push(
      createError(
        'gameState.currentPhase',
        `one of: ${[...VALID_GAME_PHASES].join(', ')}`,
        String(state.currentPhase),
        'ゲームフェーズが不正です',
      ),
    );
  }

  // gold
  if (!isNonNegativeInteger(state.gold)) {
    errors.push(
      createError('gameState.gold', 'non-negative integer', String(state.gold), '所持金が不正です'),
    );
  }

  // comboCount
  if (!isNonNegativeInteger(state.comboCount)) {
    errors.push(
      createError(
        'gameState.comboCount',
        'non-negative integer',
        String(state.comboCount),
        'コンボカウントが不正です',
      ),
    );
  }

  // actionPoints
  if (!isNonNegativeInteger(state.actionPoints)) {
    errors.push(
      createError(
        'gameState.actionPoints',
        'non-negative integer',
        String(state.actionPoints),
        '行動ポイントが不正です',
      ),
    );
  }

  // isPromotionTest
  if (typeof state.isPromotionTest !== 'boolean') {
    errors.push(
      createError(
        'gameState.isPromotionTest',
        'boolean',
        String(state.isPromotionTest),
        '昇格試験フラグが不正です',
      ),
    );
  }

  // promotionTestRemainingDays（オプショナル: 存在する場合のみ検証）
  if (
    state.promotionTestRemainingDays !== undefined &&
    !isPositiveInteger(state.promotionTestRemainingDays)
  ) {
    errors.push(
      createError(
        'gameState.promotionTestRemainingDays',
        'positive integer or undefined',
        String(state.promotionTestRemainingDays),
        '昇格試験残り日数が不正です',
      ),
    );
  }

  // apOverflow
  if (!isNonNegativeInteger(state.apOverflow)) {
    errors.push(
      createError(
        'gameState.apOverflow',
        'non-negative integer',
        String(state.apOverflow),
        'AP超過値が不正です',
      ),
    );
  }

  // questBoard
  if (isObject(state.questBoard)) {
    errors.push(...validateQuestBoardState(state.questBoard as Record<string, unknown>));
  } else {
    errors.push(
      createError(
        'gameState.questBoard',
        'object',
        typeof state.questBoard,
        '掲示板状態がオブジェクトではありません',
      ),
    );
  }

  return errors;
}

/**
 * QuestBoardState をバリデーションする
 *
 * @param board 検証対象
 * @returns エラー配列
 */
function validateQuestBoardState(board: Record<string, unknown>): IValidationError[] {
  const errors: IValidationError[] = [];

  if (!Array.isArray(board.boardQuests)) {
    errors.push(
      createError(
        'gameState.questBoard.boardQuests',
        'array',
        typeof board.boardQuests,
        '掲示板依頼リストが配列ではありません',
      ),
    );
  }

  if (!Array.isArray(board.visitorQuests)) {
    errors.push(
      createError(
        'gameState.questBoard.visitorQuests',
        'array',
        typeof board.visitorQuests,
        '訪問依頼リストが配列ではありません',
      ),
    );
  }

  if (!isNonNegativeInteger(board.lastVisitorUpdateDay)) {
    errors.push(
      createError(
        'gameState.questBoard.lastVisitorUpdateDay',
        'non-negative integer',
        String(board.lastVisitorUpdateDay),
        '訪問依頼最終更新日が不正です',
      ),
    );
  }

  return errors;
}

/**
 * DeckState をバリデーションする
 *
 * @param state 検証対象（オブジェクト確認済み）
 * @returns エラー配列
 */
function validateDeckState(state: Record<string, unknown>): IValidationError[] {
  const errors: IValidationError[] = [];

  if (!isStringArray(state.deck)) {
    errors.push(createError('deckState.deck', 'string[]', String(state.deck), '山札が不正です'));
  }

  if (!isStringArray(state.hand)) {
    errors.push(createError('deckState.hand', 'string[]', String(state.hand), '手札が不正です'));
  }

  if (!isStringArray(state.discard)) {
    errors.push(
      createError('deckState.discard', 'string[]', String(state.discard), '捨て札が不正です'),
    );
  }

  if (!isStringArray(state.ownedCards)) {
    errors.push(
      createError(
        'deckState.ownedCards',
        'string[]',
        String(state.ownedCards),
        '所持カードが不正です',
      ),
    );
  }

  return errors;
}

/**
 * InventoryState をバリデーションする
 *
 * @param state 検証対象（オブジェクト確認済み）
 * @returns エラー配列
 */
function validateInventoryState(state: Record<string, unknown>): IValidationError[] {
  const errors: IValidationError[] = [];

  if (!Array.isArray(state.materials)) {
    errors.push(
      createError(
        'inventoryState.materials',
        'array',
        typeof state.materials,
        '素材リストが配列ではありません',
      ),
    );
  }

  if (!Array.isArray(state.craftedItems)) {
    errors.push(
      createError(
        'inventoryState.craftedItems',
        'array',
        typeof state.craftedItems,
        '調合アイテムリストが配列ではありません',
      ),
    );
  }

  if (!isPositiveInteger(state.storageLimit)) {
    errors.push(
      createError(
        'inventoryState.storageLimit',
        'positive integer (>= 1)',
        String(state.storageLimit),
        '保管上限が不正です',
      ),
    );
  }

  return errors;
}

/**
 * QuestState をバリデーションする
 *
 * @param state 検証対象（オブジェクト確認済み）
 * @returns エラー配列
 */
function validateQuestState(state: Record<string, unknown>): IValidationError[] {
  const errors: IValidationError[] = [];

  if (!Array.isArray(state.activeQuests)) {
    errors.push(
      createError(
        'questState.activeQuests',
        'array',
        typeof state.activeQuests,
        'アクティブ依頼リストが配列ではありません',
      ),
    );
  }

  if (!isStringArray(state.todayClients)) {
    errors.push(
      createError(
        'questState.todayClients',
        'string[]',
        String(state.todayClients),
        '今日の依頼者リストが不正です',
      ),
    );
  }

  if (!Array.isArray(state.todayQuests)) {
    errors.push(
      createError(
        'questState.todayQuests',
        'array',
        typeof state.todayQuests,
        '今日の依頼リストが配列ではありません',
      ),
    );
  }

  if (!isPositiveInteger(state.questLimit)) {
    errors.push(
      createError(
        'questState.questLimit',
        'positive integer (>= 1)',
        String(state.questLimit),
        '同時受注上限が不正です',
      ),
    );
  }

  return errors;
}

// =============================================================================
// ヘルパー関数（型ガード）
// =============================================================================

/**
 * 値が非空文字列であるか判定する
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * 値が0以上の整数であるか判定する
 */
function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * 値が0以上の数値であるか判定する
 */
function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * 値が1以上の正の整数であるか判定する
 */
function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

/**
 * 値が文字列の配列であるか判定する
 */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

/**
 * 値が有効な列挙値であるか判定する
 */
function isValidEnumValue(value: unknown, validSet: Set<string>): boolean {
  return typeof value === 'string' && validSet.has(value);
}

// =============================================================================
// エラー生成ヘルパー
// =============================================================================

/**
 * バリデーションエラーを生成する
 */
function createError(
  path: string,
  expected: string,
  actual: string,
  message: string,
): IValidationError {
  return { path, expected, actual, message };
}
