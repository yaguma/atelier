/**
 * locations.ts - 採取場所マスタデータ
 *
 * TASK-0105: 採取場所データ定義とGatheringService拡張
 *
 * 採取場所のマスタデータを定義する。
 * 各場所には名前、移動APコスト、採取可能素材、マップ座標を含む。
 *
 * 注意: 具体的な値はゲームバランスに依存するため、初期値は仮設定。
 * 設計文書: docs/design/free-phase-navigation/architecture.md
 */

import { toCardId } from '@shared/types';
import type { IGatheringLocationData } from '../types/gathering-location';

/**
 * 採取場所マスタデータ一覧
 *
 * cardIdは採取地カード（IGatheringCard）のidに対応する。
 * カードとの対応はgetAvailableLocations()で手札フィルタリング時に使用する。
 */
export const GATHERING_LOCATIONS: readonly IGatheringLocationData[] = [
  {
    cardId: toCardId('gathering-forest'),
    name: '近くの森',
    movementAPCost: 1,
    availableMaterials: [
      { name: '薬草', rarity: 'Common', dropRate: 'high' },
      { name: '毒草', rarity: 'Common', dropRate: 'medium' },
      { name: '光る花', rarity: 'Uncommon', dropRate: 'low' },
    ],
    mapX: 100,
    mapY: 200,
  },
  {
    cardId: toCardId('gathering-mine'),
    name: '鉱山',
    movementAPCost: 1,
    availableMaterials: [
      { name: '鉄鉱石', rarity: 'Common', dropRate: 'high' },
      { name: '銅鉱石', rarity: 'Common', dropRate: 'medium' },
      { name: '銀鉱石', rarity: 'Uncommon', dropRate: 'low' },
    ],
    mapX: 300,
    mapY: 150,
  },
  {
    cardId: toCardId('gathering-lake'),
    name: '湖畔',
    movementAPCost: 1,
    availableMaterials: [
      { name: '水晶', rarity: 'Common', dropRate: 'high' },
      { name: '真珠貝', rarity: 'Uncommon', dropRate: 'medium' },
      { name: '月光石', rarity: 'Rare', dropRate: 'low' },
    ],
    mapX: 200,
    mapY: 350,
  },
  {
    cardId: toCardId('gathering-ruins'),
    name: '古代遺跡',
    movementAPCost: 2,
    availableMaterials: [
      { name: '古代の欠片', rarity: 'Uncommon', dropRate: 'high' },
      { name: '魔法の粉', rarity: 'Rare', dropRate: 'medium' },
      { name: '賢者の石片', rarity: 'Legendary', dropRate: 'low' },
    ],
    mapX: 400,
    mapY: 100,
  },
  {
    cardId: toCardId('gathering-volcano'),
    name: '火山地帯',
    movementAPCost: 2,
    availableMaterials: [
      { name: '火山灰', rarity: 'Common', dropRate: 'high' },
      { name: '溶岩石', rarity: 'Uncommon', dropRate: 'medium' },
      { name: '炎の結晶', rarity: 'Rare', dropRate: 'low' },
    ],
    mapX: 450,
    mapY: 300,
  },
];
