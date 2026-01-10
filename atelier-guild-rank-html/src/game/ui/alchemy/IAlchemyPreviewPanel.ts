/**
 * AlchemyPreviewPanelインターフェース定義
 *
 * TASK-0226: 調合プレビューパネルのインターフェースを定義
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0226.md
 */

import Phaser from 'phaser';
import { Material } from '@domain/material/MaterialEntity';
import { RecipeCard } from '@domain/card/CardEntity';

/**
 * 調合プレビュー情報
 */
export interface AlchemyPreview {
  /** レシピカード */
  recipe: RecipeCard;
  /** 選択素材リスト */
  materials: Material[];
  /** 予測品質（legendary/epic/rare/good/normal/poor） */
  predictedQuality: string;
  /** 予測継承特性リスト */
  predictedTraits: string[];
  /** 調合可能フラグ */
  canCraft: boolean;
  /** 不足素材リスト */
  missingMaterials: string[];
}

/**
 * AlchemyPreviewPanelオプション
 */
export interface AlchemyPreviewPanelOptions {
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
}

/**
 * IAlchemyPreviewPanelインターフェース
 *
 * 調合プレビューパネルの操作を定義
 */
export interface IAlchemyPreviewPanel {
  /** Phaserコンテナ */
  readonly container: Phaser.GameObjects.Container;

  /**
   * プレビュー情報を設定
   * @param preview プレビュー情報（nullでリセット）
   */
  setPreview(preview: AlchemyPreview | null): void;

  /**
   * 現在のプレビュー情報を取得
   * @returns プレビュー情報（未設定時はnull）
   */
  getPreview(): AlchemyPreview | null;

  /**
   * 素材を追加（リアルタイム更新用）
   * @param material 追加する素材
   */
  addMaterial(material: Material): void;

  /**
   * 素材を削除（リアルタイム更新用）
   * @param material 削除する素材
   */
  removeMaterial(material: Material): void;

  /**
   * 全素材をクリア（リアルタイム更新用）
   */
  clearMaterials(): void;

  /**
   * 表示/非表示を設定
   * @param visible 表示フラグ
   */
  setVisible(visible: boolean): void;

  /**
   * 有効/無効を設定
   * @param enabled 有効フラグ
   */
  setEnabled(enabled: boolean): void;

  /**
   * リソースを破棄
   */
  destroy(): void;
}
