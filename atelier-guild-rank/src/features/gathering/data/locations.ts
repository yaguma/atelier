/**
 * locations.ts - 採取場所マスタデータ
 *
 * TASK-0105: 採取場所データ定義とGatheringService拡張
 *
 * 採取場所のマスタデータを定義する。
 * 各場所には名前、移動APコスト、採取可能素材、マップ座標を含む。
 *
 * TODO: ゲームバランス調整時に各場所の移動APコスト・素材出現確率を見直す。
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
    cardId: toCardId('gathering_backyard'),
    name: '裏庭',
    movementAPCost: 0,
    availableMaterials: [
      { name: '雑草', rarity: 'Common', dropRate: 'high' },
      { name: '水', rarity: 'Common', dropRate: 'high' },
    ],
    mapX: 50,
    mapY: 200,
  },
  {
    cardId: toCardId('gathering_nearby_forest'),
    name: '近くの森',
    movementAPCost: 0,
    availableMaterials: [
      { name: '薬草', rarity: 'Common', dropRate: 'high' },
      { name: '毒キノコ', rarity: 'Common', dropRate: 'medium' },
      { name: '赤い実', rarity: 'Common', dropRate: 'medium' },
    ],
    mapX: 150,
    mapY: 150,
  },
  {
    cardId: toCardId('gathering_riverside'),
    name: '川辺',
    movementAPCost: 0,
    availableMaterials: [
      { name: '魚', rarity: 'Common', dropRate: 'high' },
      { name: '砂', rarity: 'Common', dropRate: 'high' },
      { name: '清水', rarity: 'Common', dropRate: 'medium' },
    ],
    mapX: 250,
    mapY: 300,
  },
  {
    cardId: toCardId('gathering_windy_hill'),
    name: '風の丘',
    movementAPCost: 0,
    availableMaterials: [
      { name: '風花', rarity: 'Common', dropRate: 'high' },
      { name: '羽根', rarity: 'Common', dropRate: 'medium' },
      { name: '赤い実', rarity: 'Common', dropRate: 'medium' },
    ],
    mapX: 350,
    mapY: 100,
  },
  {
    cardId: toCardId('gathering_mountain_trail'),
    name: '山道',
    movementAPCost: 0,
    availableMaterials: [
      { name: '鉄鉱石', rarity: 'Uncommon', dropRate: 'high' },
      { name: '石', rarity: 'Common', dropRate: 'high' },
      { name: '火の石', rarity: 'Uncommon', dropRate: 'low' },
    ],
    mapX: 400,
    mapY: 200,
  },
  {
    cardId: toCardId('gathering_deep_cave'),
    name: '深層洞窟',
    movementAPCost: 0,
    availableMaterials: [
      { name: '水晶', rarity: 'Uncommon', dropRate: 'high' },
      { name: '深層水', rarity: 'Uncommon', dropRate: 'medium' },
      { name: '鉄鉱石', rarity: 'Uncommon', dropRate: 'medium' },
    ],
    mapX: 300,
    mapY: 350,
  },
  {
    cardId: toCardId('gathering_ancient_forest'),
    name: '古代の森',
    movementAPCost: 0,
    availableMaterials: [
      { name: '魔法草', rarity: 'Rare', dropRate: 'high' },
      { name: '古代の木', rarity: 'Rare', dropRate: 'medium' },
      { name: '精霊水', rarity: 'Rare', dropRate: 'low' },
    ],
    mapX: 150,
    mapY: 400,
  },
  {
    cardId: toCardId('gathering_volcanic_area'),
    name: '火山地帯',
    movementAPCost: 0,
    availableMaterials: [
      { name: '竜の鱗', rarity: 'Rare', dropRate: 'high' },
      { name: '星の欠片', rarity: 'Rare', dropRate: 'medium' },
      { name: '火の石', rarity: 'Uncommon', dropRate: 'medium' },
    ],
    mapX: 450,
    mapY: 300,
  },
];
