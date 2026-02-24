/**
 * v1_0_to_v1_1.ts - v1.0.0 -> v1.1.0 マイグレーション
 *
 * Issue #310: セーブデータマイグレーション関数のインターフェース設計
 *
 * @description
 * フェーズ自由遷移対応のためのマイグレーション。
 * IGameStateに以下のフィールドを追加する:
 * - apOverflow: number（デフォルト: 0）
 * - questBoard: IQuestBoardState（デフォルト: 空の初期状態）
 *
 * 【純粋関数】: 入力データを変更せず、新しいオブジェクトを返す。
 */

import type { IMigrationStep } from '../types';
import { isObject } from '../types';

// =============================================================================
// マイグレーション定義
// =============================================================================

/**
 * v1.0.0 -> v1.1.0 マイグレーションステップ
 *
 * フェーズ自由遷移対応: apOverflow, questBoard フィールドの追加
 */
export const migrationV1_0ToV1_1: IMigrationStep = {
  fromVersion: '1.0.0',
  toVersion: '1.1.0',
  description: 'フェーズ自由遷移対応: apOverflow, questBoard を追加',
  migrate: (data: unknown): unknown => {
    // unknown型から安全にオブジェクトを取得
    if (!isObject(data)) {
      throw new Error('Migration v1.0.0 -> v1.1.0: data is not an object');
    }

    const saveData = data;

    // gameStateの存在チェック
    if (!isObject(saveData.gameState)) {
      throw new Error('Migration v1.0.0 -> v1.1.0: gameState is missing or invalid');
    }

    const gameState = saveData.gameState;

    // 新しいgameStateを構築（既存フィールド + 新規フィールド）
    const migratedGameState = {
      ...gameState,
      // apOverflow が存在しない場合はデフォルト値 0 を設定
      apOverflow: typeof gameState.apOverflow === 'number' ? gameState.apOverflow : 0,
      // questBoard が存在しない場合は空の初期状態を設定
      questBoard:
        typeof gameState.questBoard === 'object' && gameState.questBoard !== null
          ? gameState.questBoard
          : {
              boardQuests: [],
              visitorQuests: [],
              lastVisitorUpdateDay: 0,
            },
    };

    // マイグレーション後のデータを返却
    return {
      ...saveData,
      version: '1.1.0',
      gameState: migratedGameState,
    };
  },
};
