/**
 * MaterialViewインターフェース定義
 *
 * 素材の視覚的表現コンポーネントのインターフェースを定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0199.md
 */

import Phaser from 'phaser';
import { Material, IMaterialInstance } from '@domain/material/Material';
import { MaterialViewMode } from './MaterialConstants';

/**
 * MaterialView作成オプション
 */
export interface MaterialViewOptions {
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** 素材マスターデータ */
  material: Material;
  /** 素材インスタンス（品質・個数情報） */
  instance?: IMaterialInstance;
  /** 表示モード（デフォルト: compact） */
  mode?: MaterialViewMode;
  /** 個数（デフォルト: 1） */
  count?: number;
  /** 品質表示（デフォルト: true） */
  showQuality?: boolean;
  /** インタラクティブ（デフォルト: true） */
  interactive?: boolean;
  /** クリック時コールバック */
  onClick?: (material: Material) => void;
  /** ホバー時コールバック */
  onHover?: (material: Material, isHovering: boolean) => void;
}

/**
 * MaterialViewインターフェース
 *
 * 素材の描画と状態管理を担当する。
 * Phaserのコンテナをラップし、統一的なAPIを提供する。
 */
export interface IMaterialView {
  /** Phaserコンテナへの参照（読み取り専用） */
  readonly container: Phaser.GameObjects.Container;

  /** 素材マスターデータへの参照（読み取り専用） */
  readonly material: Material;

  // ========================================
  // 表示更新
  // ========================================

  /**
   * 個数を設定する
   * @param count 新しい個数
   */
  setCount(count: number): void;

  /**
   * 選択状態を設定する
   * @param selected true: 選択中、false: 非選択
   */
  setSelected(selected: boolean): void;

  /**
   * 有効/無効状態を設定する
   * @param enabled true: 有効、false: 無効（グレーアウト）
   */
  setEnabled(enabled: boolean): void;

  // ========================================
  // 位置・表示
  // ========================================

  /**
   * 位置を設定する
   * @param x X座標
   * @param y Y座標
   */
  setPosition(x: number, y: number): void;

  /**
   * 表示・非表示を設定する
   * @param visible true: 表示、false: 非表示
   */
  setVisible(visible: boolean): void;

  /**
   * 透明度を設定する
   * @param alpha 透明度（0-1）
   */
  setAlpha(alpha: number): void;

  /**
   * インタラクティブ状態を設定する
   * @param enabled true: インタラクション有効、false: 無効
   */
  setInteractive(enabled: boolean): void;

  // ========================================
  // ライフサイクル
  // ========================================

  /**
   * リソースを破棄する
   */
  destroy(): void;
}
