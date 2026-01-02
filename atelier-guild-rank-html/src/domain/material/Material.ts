/**
 * 素材関連インターフェース定義
 */

import { Attribute, Quality } from '@domain/common/types';

/**
 * 素材マスターデータ
 */
export interface IMaterial {
  /** 素材ID */
  id: string;
  /** 素材名 */
  name: string;
  /** 基本品質 */
  baseQuality: Quality;
  /** 属性リスト */
  attributes: Attribute[];
  /** レア素材フラグ */
  isRare?: boolean;
  /** 説明 */
  description?: string;
}

/**
 * 素材インスタンス（インベントリ内）
 * 品質と数量を持つ実際の素材
 */
export interface IMaterialInstance {
  /** 素材ID（IMaterial.idを参照） */
  materialId: string;
  /** 実際の品質 */
  quality: Quality;
  /** 所持数 */
  quantity: number;
}
