/**
 * save-data.ts - セーブデータ関連型定義
 *
 * セーブデータのインターフェース定義
 */

import type { IDeckState, IGameState, IInventoryState, IQuestState } from './game-state';
import type { ArtifactId } from './ids';

// =============================================================================
// セーブデータ
// =============================================================================

/**
 * セーブデータインターフェース
 */
export interface ISaveData {
  /** バージョン */
  version: string;
  /** 最終保存日時（ISO文字列） */
  lastSaved: string;
  /** ゲーム状態 */
  gameState: IGameState;
  /** デッキ状態 */
  deckState: IDeckState;
  /** インベントリ状態 */
  inventoryState: IInventoryState;
  /** 依頼状態 */
  questState: IQuestState;
  /** 所持アーティファクトリスト */
  artifacts: ArtifactId[];
}
