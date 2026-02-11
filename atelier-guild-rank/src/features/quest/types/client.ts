/**
 * client.ts - 依頼者関連の型定義（features/quest固有）
 *
 * TASK-0080: features/quest/types作成
 *
 * IClientはshared/typesで定義されたゲームロジック用の型。
 * ここではUI・表示向けの拡張型を新規定義する。
 */

import type { ClientId } from '@shared/types';

/**
 * 依頼者の拡張型定義
 * IClientがゲームロジック用のインターフェースなのに対し、
 * Clientは表示・UI向けの情報を持つ
 */
export interface Client {
  /** 依頼者ID（branded型） */
  id: ClientId;
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
export type ClientPersonality = 'demanding' | 'easygoing' | 'generous' | 'picky';

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
