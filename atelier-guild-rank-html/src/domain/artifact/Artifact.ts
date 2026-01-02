/**
 * アーティファクト関連インターフェース定義
 */

import { Rarity } from '@domain/common/types';
import { ICardEffect } from '@domain/card/Card';

/**
 * アーティファクトマスターデータ
 */
export interface IArtifact {
  /** アーティファクトID */
  id: string;
  /** 名前 */
  name: string;
  /** 効果 */
  effect: ICardEffect;
  /** レアリティ */
  rarity: Rarity;
  /** 取得方法（ショップ購入 or 昇格報酬） */
  acquisitionType?: 'shop' | 'promotion';
  /** 説明 */
  description?: string;
}
