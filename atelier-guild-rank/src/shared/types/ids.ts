/**
 * ids.ts - ブランド型ID定義
 *
 * 型安全なエンティティIDを提供するブランド型と変換関数
 */

// =============================================================================
// ブランド型定義
// =============================================================================

/** ブランドシンボル用のユニークシンボル型 */
declare const __brand: unique symbol;

/** ブランド型のベース定義 */
type Brand<K, T> = K & { readonly [__brand]: T };

/** カードID */
export type CardId = Brand<string, 'CardId'>;

/** 素材ID */
export type MaterialId = Brand<string, 'MaterialId'>;

/** アイテムID */
export type ItemId = Brand<string, 'ItemId'>;

/** 依頼ID */
export type QuestId = Brand<string, 'QuestId'>;

/** アーティファクトID */
export type ArtifactId = Brand<string, 'ArtifactId'>;

/** 依頼者ID */
export type ClientId = Brand<string, 'ClientId'>;

/** レシピID */
export type RecipeId = Brand<string, 'RecipeId'>;

// =============================================================================
// ID変換関数
// =============================================================================

/**
 * 文字列をCardIdに変換
 * @param value - 変換する文字列
 * @returns CardId型の値
 */
export function toCardId(value: string): CardId {
  return value as CardId;
}

/**
 * 文字列をMaterialIdに変換
 * @param value - 変換する文字列
 * @returns MaterialId型の値
 */
export function toMaterialId(value: string): MaterialId {
  return value as MaterialId;
}

/**
 * 文字列をItemIdに変換
 * @param value - 変換する文字列
 * @returns ItemId型の値
 */
export function toItemId(value: string): ItemId {
  return value as ItemId;
}

/**
 * 文字列をQuestIdに変換
 * @param value - 変換する文字列
 * @returns QuestId型の値
 */
export function toQuestId(value: string): QuestId {
  return value as QuestId;
}

/**
 * 文字列をArtifactIdに変換
 * @param value - 変換する文字列
 * @returns ArtifactId型の値
 */
export function toArtifactId(value: string): ArtifactId {
  return value as ArtifactId;
}

/**
 * 文字列をClientIdに変換
 * @param value - 変換する文字列
 * @returns ClientId型の値
 */
export function toClientId(value: string): ClientId {
  return value as ClientId;
}

/**
 * 文字列をRecipeIdに変換
 * @param value - 変換する文字列
 * @returns RecipeId型の値
 */
export function toRecipeId(value: string): RecipeId {
  return value as RecipeId;
}
