/**
 * types.ts - セーブデータマイグレーション関連型定義
 *
 * Issue #310: セーブデータマイグレーション関数のインターフェース設計
 *
 * @description
 * セーブデータのバージョン管理・マイグレーション・バリデーションに
 * 必要な型定義を提供する。
 * すべてのマイグレーション関数はFunctional Core原則に従い、
 * 純粋関数として設計されている。
 */

import type { ISaveData } from '@shared/types';

// =============================================================================
// バージョン型
// =============================================================================

/**
 * セーブデータバージョン（構造化表現）
 *
 * セマンティックバージョニング（MAJOR.MINOR.PATCH）に従う。
 * - MAJOR: 破壊的変更（マイグレーション不可）
 * - MINOR: フィールド追加等（自動マイグレーション可能）
 * - PATCH: バグ修正のみ（互換性保証）
 */
export interface SaveDataVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

// =============================================================================
// マイグレーションステップ
// =============================================================================

/**
 * マイグレーションステップ
 *
 * 1つのバージョン間のマイグレーションを定義する。
 * migrate関数は純粋関数として実装する（副作用なし）。
 *
 * @example
 * ```typescript
 * const step: IMigrationStep = {
 *   fromVersion: '1.0.0',
 *   toVersion: '1.1.0',
 *   description: 'フェーズ自由遷移対応: apOverflow, questBoard を追加',
 *   migrate: (data) => ({
 *     ...data,
 *     version: '1.1.0',
 *     gameState: {
 *       ...data.gameState,
 *       apOverflow: 0,
 *       questBoard: { boardQuests: [], visitorQuests: [], lastVisitorUpdateDay: 0 },
 *     },
 *   }),
 * };
 * ```
 */
export interface IMigrationStep {
  /** マイグレーション元バージョン（例: "1.0.0"） */
  readonly fromVersion: string;
  /** マイグレーション先バージョン（例: "1.1.0"） */
  readonly toVersion: string;
  /** マイグレーション内容の説明 */
  readonly description: string;
  /**
   * マイグレーション関数（純粋関数）
   *
   * 入力のセーブデータを新バージョンのスキーマに変換する。
   * unknown型を受け取り、型安全にフィールドを補完する。
   * 入力データを変更せず、新しいオブジェクトを返す。
   *
   * @param data マイグレーション元のセーブデータ（unknown: 旧スキーマのため型保証なし）
   * @returns マイグレーション後のセーブデータ
   * @throws 変換不能な場合（呼び出し元でcatch）
   */
  readonly migrate: (data: unknown) => unknown;
}

// =============================================================================
// マイグレーション結果
// =============================================================================

/**
 * マイグレーション成功結果
 */
export interface IMigrationSuccess {
  readonly success: true;
  /** マイグレーション後のセーブデータ */
  readonly data: ISaveData;
  /** 元のバージョン */
  readonly fromVersion: string;
  /** 最終バージョン */
  readonly toVersion: string;
  /** 実行されたマイグレーションステップ数 */
  readonly stepsApplied: number;
  /** フォールバック不要 */
  readonly fallback: false;
}

/**
 * マイグレーション不要結果（同一バージョン）
 */
export interface IMigrationNoOp {
  readonly success: true;
  /** そのままのセーブデータ */
  readonly data: ISaveData;
  /** 現在のバージョン */
  readonly fromVersion: string;
  /** 現在のバージョン（同じ） */
  readonly toVersion: string;
  /** ステップ不要 */
  readonly stepsApplied: 0;
  /** フォールバック不要 */
  readonly fallback: false;
}

/**
 * マイグレーション失敗結果（フォールバック）
 */
export interface IMigrationFailure {
  readonly success: false;
  /** データなし */
  readonly data: null;
  /** 元のバージョン（検出できた場合） */
  readonly fromVersion: string | null;
  /** 目標バージョン */
  readonly toVersion: string;
  /** フォールバック発動 */
  readonly fallback: true;
  /** 失敗理由 */
  readonly reason: MigrationFailureReason;
  /** エラーメッセージ（デバッグ用） */
  readonly errorMessage: string;
}

/**
 * マイグレーション結果（ユニオン型）
 */
export type MigrationResult = IMigrationSuccess | IMigrationNoOp | IMigrationFailure;

// =============================================================================
// マイグレーション失敗理由
// =============================================================================

/**
 * マイグレーション失敗理由
 */
export const MigrationFailureReason = {
  /** JSONパース失敗（データ破損） */
  PARSE_ERROR: 'PARSE_ERROR',
  /** バージョンフィールド欠損 */
  VERSION_MISSING: 'VERSION_MISSING',
  /** バージョン形式が不正 */
  VERSION_INVALID: 'VERSION_INVALID',
  /** メジャーバージョン不一致（マイグレーション不可） */
  MAJOR_VERSION_MISMATCH: 'MAJOR_VERSION_MISMATCH',
  /** ダウングレード不可（保存データが新しい） */
  DOWNGRADE_NOT_SUPPORTED: 'DOWNGRADE_NOT_SUPPORTED',
  /** マイグレーションパスが見つからない */
  NO_MIGRATION_PATH: 'NO_MIGRATION_PATH',
  /** マイグレーションステップ実行時エラー */
  STEP_EXECUTION_ERROR: 'STEP_EXECUTION_ERROR',
  /** バリデーション失敗 */
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  /** データ構造が不正（ISaveDataの基本構造に合致しない） */
  INVALID_STRUCTURE: 'INVALID_STRUCTURE',
} as const;

export type MigrationFailureReason =
  (typeof MigrationFailureReason)[keyof typeof MigrationFailureReason];

// =============================================================================
// バリデーション
// =============================================================================

/**
 * バリデーション結果
 */
export interface IValidationResult {
  /** バリデーション成功か */
  readonly valid: boolean;
  /** エラー一覧（成功時は空配列） */
  readonly errors: readonly IValidationError[];
}

/**
 * バリデーションエラー詳細
 */
export interface IValidationError {
  /** エラーが発生したフィールドパス（例: "gameState.gold"） */
  readonly path: string;
  /** 期待される値の説明 */
  readonly expected: string;
  /** 実際の値（文字列表現） */
  readonly actual: string;
  /** エラーメッセージ */
  readonly message: string;
}

// =============================================================================
// マイグレーションレジストリ
// =============================================================================

/**
 * マイグレーションレジストリインターフェース
 *
 * マイグレーションステップの登録・検索・パス解決を行う。
 */
export interface IMigrationRegistry {
  /**
   * マイグレーションステップを登録する
   *
   * @param step 登録するマイグレーションステップ
   */
  register(step: IMigrationStep): void;

  /**
   * 指定バージョン間のマイグレーションパスを取得する
   *
   * @param fromVersion マイグレーション元バージョン
   * @param toVersion マイグレーション先バージョン
   * @returns マイグレーションステップの配列（パスが存在しない場合null）
   */
  getPath(fromVersion: string, toVersion: string): readonly IMigrationStep[] | null;

  /**
   * 指定バージョンからのマイグレーションが可能かを判定する
   *
   * @param fromVersion マイグレーション元バージョン
   * @param toVersion マイグレーション先バージョン
   * @returns マイグレーション可能な場合true
   */
  canMigrate(fromVersion: string, toVersion: string): boolean;

  /**
   * 登録されているすべてのマイグレーションステップを取得する
   *
   * @returns 登録済みマイグレーションステップの配列
   */
  getAll(): readonly IMigrationStep[];
}

// =============================================================================
// マイグレーション関数シグネチャ
// =============================================================================

/**
 * セーブデータマイグレーション関数
 *
 * 【純粋関数】
 * unknownな入力データを受け取り、現在のバージョンにマイグレーションする。
 * JSONパース・バージョン検出・マイグレーション実行・バリデーションを
 * すべて行い、結果を返す。
 *
 * @param rawData パース済みのunknownデータ（JSON.parse結果）
 * @param targetVersion マイグレーション先バージョン文字列
 * @param registry マイグレーションレジストリ
 * @returns マイグレーション結果
 *
 * @example
 * ```typescript
 * const parsed = JSON.parse(jsonString);
 * const result = migrateSaveData(parsed, CURRENT_VERSION, registry);
 *
 * if (result.success) {
 *   // result.data を使用
 * } else {
 *   // result.fallback === true -> 新規ゲーム開始
 *   console.warn(result.errorMessage);
 * }
 * ```
 */
export type MigrateSaveDataFn = (
  rawData: unknown,
  targetVersion: string,
  registry: IMigrationRegistry,
) => MigrationResult;

/**
 * セーブデータバリデーション関数
 *
 * 【純粋関数】
 * マイグレーション後のセーブデータが正しい構造・値を持っているか検証する。
 *
 * @param data 検証対象のデータ
 * @returns バリデーション結果
 *
 * @example
 * ```typescript
 * const result = validateSaveData(data);
 * if (!result.valid) {
 *   console.warn('Validation errors:', result.errors);
 * }
 * ```
 */
export type ValidateSaveDataFn = (data: unknown) => IValidationResult;

/**
 * バージョン文字列パース関数
 *
 * 【純粋関数】
 * "1.0.0" 形式の文字列を SaveDataVersion に変換する。
 *
 * @param version バージョン文字列
 * @returns パース済みバージョン（不正な場合null）
 */
export type ParseVersionFn = (version: string) => SaveDataVersion | null;

/**
 * バージョン比較関数
 *
 * 【純粋関数】
 * 2つのバージョンを比較する。
 *
 * @param a 比較対象A
 * @param b 比較対象B
 * @returns a < b なら負、a === b なら0、a > b なら正
 */
export type CompareVersionsFn = (a: SaveDataVersion, b: SaveDataVersion) => number;
