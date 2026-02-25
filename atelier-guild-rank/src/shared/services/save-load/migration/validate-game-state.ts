/**
 * validate-game-state.ts - GameState バリデーション
 *
 * Issue #340: save-data-validator.tsのバリデーション関数分割
 *
 * @description
 * GameState および QuestBoardState のバリデーションを行う。
 * すべての関数は純粋関数（Functional Core）として実装。
 */

import type { IValidationError } from './types';
import { isObject } from './types';
import {
  createError,
  isNonNegativeInteger,
  isNonNegativeNumber,
  isPositiveInteger,
  isValidEnumValue,
  VALID_GAME_PHASES,
  VALID_GUILD_RANKS,
} from './validation-helpers';

// =============================================================================
// GameState バリデーション
// =============================================================================

/**
 * GameState をバリデーションする
 *
 * @param state 検証対象（オブジェクト確認済み）
 * @returns エラー配列
 */
export function validateGameState(state: Record<string, unknown>): IValidationError[] {
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

// =============================================================================
// QuestBoardState バリデーション
// =============================================================================

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
