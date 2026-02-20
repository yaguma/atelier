/**
 * gathering-location-service.ts - 採取場所関連の純粋関数
 *
 * TASK-0105: 採取場所データ定義とGatheringService拡張
 *
 * @description
 * 手札カードと連動した採取場所のフィルタリング、場所詳細取得を行うFunctional Core。
 * 副作用なし、外部状態を参照・変更しない純粋関数として実装。
 *
 * 設計文書: docs/design/free-phase-navigation/architecture.md
 * 要件: REQ-002, REQ-002-04〜REQ-002-05
 */

import type { Card, CardId } from '@shared/types';
import { isGatheringCard } from '@shared/types';
import type { IGatheringLocation, IGatheringLocationData } from '../types/gathering-location';

/**
 * 手札カードに基づいて利用可能な採取場所一覧を取得する純粋関数
 *
 * 全ての場所マスタデータに対し、手札に対応する採取地カードがあるかどうかで
 * isSelectableフラグを設定する。手札にないカードの場所もisSelectable=falseで含まれる。
 *
 * @param hand - 現在の手札カード配列
 * @param locations - 採取場所マスタデータ
 * @returns 全採取場所（isSelectableフラグ付き）
 */
export function getAvailableLocations(
  hand: readonly Card[],
  locations: readonly IGatheringLocationData[],
): readonly IGatheringLocation[] {
  const gatheringCardIds = new Set(hand.filter(isGatheringCard).map((card) => card.id));

  return locations.map((location) => ({
    ...location,
    isSelectable: gatheringCardIds.has(location.cardId),
  }));
}

/**
 * カードIDに対応する場所詳細を取得する純粋関数
 *
 * @param cardId - 採取地カードID
 * @param locations - 採取場所マスタデータ
 * @returns 該当する場所データ（見つからない場合はundefined）
 */
export function getLocationDetail(
  cardId: CardId,
  locations: readonly IGatheringLocationData[],
): IGatheringLocationData | undefined {
  return locations.find((location) => location.cardId === cardId);
}

/**
 * 手札カードから選択可能な場所のみを取得する純粋関数
 *
 * getAvailableLocationsと異なり、手札に対応するカードがある場所のみ返す。
 *
 * @param hand - 現在の手札カード配列
 * @param locations - 採取場所マスタデータ
 * @returns 選択可能な採取場所のみ
 */
export function getSelectableLocations(
  hand: readonly Card[],
  locations: readonly IGatheringLocationData[],
): readonly IGatheringLocation[] {
  return getAvailableLocations(hand, locations).filter((location) => location.isSelectable);
}
