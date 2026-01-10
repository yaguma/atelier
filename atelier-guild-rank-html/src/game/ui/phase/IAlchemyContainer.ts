/**
 * AlchemyContainerインターフェース定義
 *
 * TASK-0227: AlchemyContainer設計
 * 調合フェーズコンテナのインターフェースと関連型を定義する。
 *
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0227.md
 */

import Phaser from 'phaser';
import type { RecipeCard } from '@domain/card/CardEntity';
import type { Material } from '@domain/material/MaterialEntity';
import type { EventBus } from '../../events/EventBus';
import type { IPhaseContainer } from './IPhaseContainer';

/**
 * 調合結果
 */
export interface AlchemyResult {
  /** 使用したレシピ */
  recipe: RecipeCard;
  /** 使用した素材リスト */
  usedMaterials: Material[];
  /** 調合品のID */
  craftedItemId: string;
  /** 調合品名 */
  craftedItemName: string;
  /** 品質 */
  quality: string;
  /** 継承特性 */
  traits: string[];
}

/**
 * AlchemyContainerオプション
 */
export interface AlchemyContainerOptions {
  /** シーン参照 */
  scene: Phaser.Scene;
  /** EventBus参照 */
  eventBus: EventBus;
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** 調合完了時コールバック */
  onAlchemyComplete?: (result: AlchemyResult) => void;
  /** スキップ時コールバック */
  onSkip?: () => void;
}

/**
 * IAlchemyContainerインターフェース
 *
 * 調合フェーズコンテナの操作を定義する。
 */
export interface IAlchemyContainer extends IPhaseContainer {
  // =====================================================
  // レシピカード管理
  // =====================================================

  /**
   * レシピカードを設定する
   * @param cards レシピカードの配列
   */
  setRecipeCards(cards: RecipeCard[]): void;

  /**
   * 選択中のレシピを取得する
   * @returns 選択中のレシピカード（未選択時はnull）
   */
  getSelectedRecipe(): RecipeCard | null;

  /**
   * レシピを選択する
   * @param card 選択するレシピカード
   */
  selectRecipe(card: RecipeCard): void;

  // =====================================================
  // 素材管理
  // =====================================================

  /**
   * 利用可能な素材を設定する
   * @param materials 素材の配列
   */
  setAvailableMaterials(materials: Material[]): void;

  /**
   * 選択中の素材リストを取得する
   * @returns 選択中の素材配列
   */
  getSelectedMaterials(): Material[];

  /**
   * 素材を選択する
   * @param material 選択する素材
   */
  selectMaterial(material: Material): void;

  /**
   * 素材の選択を解除する
   * @param material 解除する素材
   */
  deselectMaterial(material: Material): void;

  /**
   * 全素材の選択を解除する
   */
  clearMaterials(): void;

  // =====================================================
  // 調合操作
  // =====================================================

  /**
   * 調合可能かどうかを判定する
   * @returns 調合可能な場合true
   */
  canCraft(): boolean;

  /**
   * 調合を実行する
   */
  craft(): Promise<void>;
}
