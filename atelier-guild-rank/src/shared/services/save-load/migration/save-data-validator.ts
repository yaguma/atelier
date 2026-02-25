/**
 * save-data-validator.ts - セーブデータバリデーション関数
 *
 * Issue #310: セーブデータマイグレーション関数のインターフェース設計
 * Issue #340: バリデーション関数分割
 *
 * @description
 * マイグレーション後のセーブデータが正しい構造・値を持っているか検証する。
 * すべての関数は純粋関数（Functional Core）として実装。
 *
 * セクション別バリデーションは以下のモジュールに分割:
 * - validation-helpers.ts: 型ガード・エラー生成ヘルパー・定数
 * - validate-game-state.ts: GameState + QuestBoardState バリデーション
 * - validate-sub-states.ts: DeckState + InventoryState + QuestState バリデーション
 */

import type { IValidationError, IValidationResult } from './types';
import { isObject } from './types';
import { validateGameState } from './validate-game-state';
import {
  validateDeckState,
  validateInventoryState,
  validateQuestState,
} from './validate-sub-states';
import { createError, isNonEmptyString, isStringArray } from './validation-helpers';

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
