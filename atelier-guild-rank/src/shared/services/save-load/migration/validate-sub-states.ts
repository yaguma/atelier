/**
 * validate-sub-states.ts - サブステート バリデーション
 *
 * Issue #340: save-data-validator.tsのバリデーション関数分割
 *
 * @description
 * DeckState, InventoryState, QuestState のバリデーションを行う。
 * すべての関数は純粋関数（Functional Core）として実装。
 */

import type { IValidationError } from './types';
import { createError, isPositiveInteger, isStringArray } from './validation-helpers';

// =============================================================================
// DeckState バリデーション
// =============================================================================

/**
 * DeckState をバリデーションする
 *
 * @param state 検証対象（オブジェクト確認済み）
 * @returns エラー配列
 */
export function validateDeckState(state: Record<string, unknown>): IValidationError[] {
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

// =============================================================================
// InventoryState バリデーション
// =============================================================================

/**
 * InventoryState をバリデーションする
 *
 * @param state 検証対象（オブジェクト確認済み）
 * @returns エラー配列
 */
export function validateInventoryState(state: Record<string, unknown>): IValidationError[] {
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

// =============================================================================
// QuestState バリデーション
// =============================================================================

/**
 * QuestState をバリデーションする
 *
 * @param state 検証対象（オブジェクト確認済み）
 * @returns エラー配列
 */
export function validateQuestState(state: Record<string, unknown>): IValidationError[] {
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
