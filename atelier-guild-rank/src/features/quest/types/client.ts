/**
 * client.ts - 依頼者関連の型定義
 *
 * TASK-0080: features/quest/types作成
 *
 * IClient型はshared/typesから再エクスポートし、
 * Client, ClientPersonality, ClientDialogueはここで新規定義する。
 */

export type { IClient } from '@shared/types/quests';

/**
 * 依頼者の拡張型定義
 * IClientがゲームロジック用のインターフェースなのに対し、
 * Clientは表示・UI向けの情報を持つ
 */
export interface Client {
  /** 依頼者ID */
  id: string;
  /** 依頼者名 */
  name: string;
  /** 肩書き */
  title: string;
  /** ポートレート画像パス */
  portrait: string;
  /** 性格タイプ */
  personality: ClientPersonality;
  /** 好む品質リスト */
  preferredQualities: string[];
}

/** 依頼者の性格タイプ */
export type ClientPersonality = 'demanding' | 'generous' | 'picky' | 'easygoing';

/** 依頼者のセリフパターン */
export interface ClientDialogue {
  /** 挨拶 */
  greeting: string;
  /** 受注時 */
  accept: string;
  /** 拒否時 */
  reject: string;
  /** 納品成功時 */
  deliverySuccess: string;
  /** 納品失敗時 */
  deliveryFail: string;
}
