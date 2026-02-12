/**
 * inventory-operations.ts - インベントリ操作の純粋関数
 *
 * TASK-0085: features/inventory/services作成
 *
 * 素材・アイテム・アーティファクトの追加・削除・取得を
 * イミュータブルな純粋関数として提供する。
 */

import type { ItemInstance } from '@domain/entities/ItemInstance';
import type { MaterialInstance } from '@domain/entities/MaterialInstance';
import type { ArtifactId } from '@shared/types';

// =============================================================================
// 定数
// =============================================================================

/** 素材の最大容量 */
export const MAX_MATERIALS = 99;

/** アイテムの最大容量 */
export const MAX_ITEMS = 99;

/** アーティファクトの最大容量 */
export const MAX_ARTIFACTS = 10;

// =============================================================================
// インベントリ状態型
// =============================================================================

/** インベントリの状態を表す型 */
export interface InventoryState {
  /** 素材リスト */
  readonly materials: readonly MaterialInstance[];
  /** アイテムリスト */
  readonly items: readonly ItemInstance[];
  /** アーティファクトIDリスト */
  readonly artifacts: readonly ArtifactId[];
}

/** 操作結果の型 */
export interface InventoryOperationResult<T = undefined> {
  /** 操作後のインベントリ状態 */
  readonly state: InventoryState;
  /** 操作に関連する追加データ */
  readonly data: T;
}

// =============================================================================
// インベントリ状態の作成
// =============================================================================

/** 空のインベントリ状態を作成する */
export function createEmptyInventory(): InventoryState {
  return {
    materials: [],
    items: [],
    artifacts: [],
  };
}

// =============================================================================
// 素材操作（純粋関数）
// =============================================================================

/**
 * 素材を追加した新しいインベントリ状態を返す
 *
 * @param state - 現在のインベントリ状態
 * @param material - 追加する素材
 * @returns 操作結果（容量超過時はnull）
 */
export function addMaterial(
  state: InventoryState,
  material: MaterialInstance,
): InventoryState | null {
  if (state.materials.length >= MAX_MATERIALS) {
    return null;
  }
  return {
    ...state,
    materials: [...state.materials, material],
  };
}

/**
 * 複数の素材を追加した新しいインベントリ状態を返す
 *
 * @param state - 現在のインベントリ状態
 * @param materials - 追加する素材の配列
 * @returns 操作結果（容量超過時はnull）
 */
export function addMaterials(
  state: InventoryState,
  materials: readonly MaterialInstance[],
): InventoryState | null {
  if (state.materials.length + materials.length > MAX_MATERIALS) {
    return null;
  }
  return {
    ...state,
    materials: [...state.materials, ...materials],
  };
}

/**
 * 素材を削除した新しいインベントリ状態を返す
 *
 * @param state - 現在のインベントリ状態
 * @param instanceId - 削除する素材のインスタンスID
 * @returns 操作結果と削除された素材（見つからない場合はnull）
 */
export function removeMaterial(
  state: InventoryState,
  instanceId: string,
): InventoryOperationResult<MaterialInstance | null> {
  const index = state.materials.findIndex((m) => m.instanceId === instanceId);
  if (index === -1) {
    return { state, data: null };
  }
  const removed = state.materials[index]!;
  return {
    state: {
      ...state,
      materials: [...state.materials.slice(0, index), ...state.materials.slice(index + 1)],
    },
    data: removed,
  };
}

/**
 * 複数の素材を削除した新しいインベントリ状態を返す
 *
 * @param state - 現在のインベントリ状態
 * @param instanceIds - 削除する素材のインスタンスID配列
 * @returns 操作結果と削除された素材の配列
 */
export function removeMaterials(
  state: InventoryState,
  instanceIds: readonly string[],
): InventoryOperationResult<MaterialInstance[]> {
  const idsSet = new Set(instanceIds);
  const removed: MaterialInstance[] = [];
  const remaining: MaterialInstance[] = [];

  for (const material of state.materials) {
    if (idsSet.has(material.instanceId)) {
      removed.push(material);
    } else {
      remaining.push(material);
    }
  }

  return {
    state: { ...state, materials: remaining },
    data: removed,
  };
}

// =============================================================================
// アイテム操作（純粋関数）
// =============================================================================

/**
 * アイテムを追加した新しいインベントリ状態を返す
 *
 * @param state - 現在のインベントリ状態
 * @param item - 追加するアイテム
 * @returns 操作結果（容量超過時はnull）
 */
export function addItem(state: InventoryState, item: ItemInstance): InventoryState | null {
  if (state.items.length >= MAX_ITEMS) {
    return null;
  }
  return {
    ...state,
    items: [...state.items, item],
  };
}

/**
 * アイテムを削除した新しいインベントリ状態を返す
 *
 * @param state - 現在のインベントリ状態
 * @param instanceId - 削除するアイテムのインスタンスID
 * @returns 操作結果と削除されたアイテム（見つからない場合はnull）
 */
export function removeItem(
  state: InventoryState,
  instanceId: string,
): InventoryOperationResult<ItemInstance | null> {
  const index = state.items.findIndex((i) => i.instanceId === instanceId);
  if (index === -1) {
    return { state, data: null };
  }
  const removed = state.items[index]!;
  return {
    state: {
      ...state,
      items: [...state.items.slice(0, index), ...state.items.slice(index + 1)],
    },
    data: removed,
  };
}

// =============================================================================
// アーティファクト操作（純粋関数）
// =============================================================================

/**
 * アーティファクトを追加した新しいインベントリ状態を返す
 *
 * @param state - 現在のインベントリ状態
 * @param artifactId - 追加するアーティファクトID
 * @returns 操作結果（容量超過時または重複時はnull）
 */
export function addArtifact(state: InventoryState, artifactId: ArtifactId): InventoryState | null {
  if (state.artifacts.includes(artifactId)) {
    return null;
  }
  if (state.artifacts.length >= MAX_ARTIFACTS) {
    return null;
  }
  return {
    ...state,
    artifacts: [...state.artifacts, artifactId],
  };
}

/**
 * アーティファクトを削除した新しいインベントリ状態を返す
 *
 * @param state - 現在のインベントリ状態
 * @param artifactId - 削除するアーティファクトID
 * @returns 操作結果（削除成功時true、見つからない場合false）
 */
export function removeArtifact(
  state: InventoryState,
  artifactId: ArtifactId,
): InventoryOperationResult<boolean> {
  const index = state.artifacts.indexOf(artifactId);
  if (index === -1) {
    return { state, data: false };
  }
  return {
    state: {
      ...state,
      artifacts: [...state.artifacts.slice(0, index), ...state.artifacts.slice(index + 1)],
    },
    data: true,
  };
}

// =============================================================================
// インベントリ全体操作（純粋関数）
// =============================================================================

/** インベントリをクリアした新しい状態を返す */
export function clearInventory(): InventoryState {
  return createEmptyInventory();
}

// =============================================================================
// 検索・取得（純粋関数）
// =============================================================================

/** インスタンスIDで素材を検索する */
export function findMaterialById(
  state: InventoryState,
  instanceId: string,
): MaterialInstance | null {
  return state.materials.find((m) => m.instanceId === instanceId) ?? null;
}

/** インスタンスIDでアイテムを検索する */
export function findItemById(state: InventoryState, instanceId: string): ItemInstance | null {
  return state.items.find((i) => i.instanceId === instanceId) ?? null;
}

/** アーティファクトを所持しているか判定する */
export function hasArtifact(state: InventoryState, artifactId: ArtifactId): boolean {
  return state.artifacts.includes(artifactId);
}

// =============================================================================
// 容量関連（純粋関数）
// =============================================================================

/** 素材の残り容量を取得する */
export function getMaterialRemainingCapacity(state: InventoryState): number {
  return MAX_MATERIALS - state.materials.length;
}

/** アイテムの残り容量を取得する */
export function getItemRemainingCapacity(state: InventoryState): number {
  return MAX_ITEMS - state.items.length;
}

/** アーティファクトの残り容量を取得する */
export function getArtifactRemainingCapacity(state: InventoryState): number {
  return MAX_ARTIFACTS - state.artifacts.length;
}
