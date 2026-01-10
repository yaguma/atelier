/**
 * MaterialOptionView インターフェース
 *
 * TASK-0220: MaterialOptionView設計・実装
 * 素材選択肢表示コンポーネントのインターフェースを定義する
 */

import Phaser from 'phaser';
import { Material } from '../../../domain/material/MaterialEntity';

/**
 * 素材選択肢データ
 */
export interface MaterialOption {
  /** 素材マスターデータ */
  material: Material;
  /** 数量 */
  quantity: number;
  /** 取得確率（0-1） */
  probability?: number;
}

/**
 * MaterialOptionViewのオプション
 */
export interface MaterialOptionViewOptions {
  /** Phaserシーン */
  scene: Phaser.Scene;
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** 初期選択肢 */
  options: MaterialOption[];
  /** 最大選択数（デフォルト1） */
  maxSelections?: number;
  /** 選択時のコールバック */
  onSelect?: (material: Material) => void;
  /** 選択解除時のコールバック */
  onDeselect?: (material: Material) => void;
}

/**
 * MaterialOptionViewインターフェース
 */
export interface IMaterialOptionView {
  /** コンテナ */
  readonly container: Phaser.GameObjects.Container;

  // 選択肢管理
  /** 選択肢を設定する */
  setOptions(options: MaterialOption[]): void;
  /** 選択肢を取得する */
  getOptions(): MaterialOption[];

  // 選択管理
  /** 選択中の素材を取得する */
  getSelectedMaterials(): Material[];
  /** 素材を選択する */
  selectMaterial(material: Material): void;
  /** 素材の選択を解除する */
  deselectMaterial(material: Material): void;
  /** 全選択を解除する */
  clearSelection(): void;

  // 選択上限
  /** 選択上限を設定する */
  setMaxSelections(max: number): void;
  /** 追加選択が可能か判定する */
  canSelectMore(): boolean;

  // 表示制御
  /** 表示/非表示を切り替える */
  setVisible(visible: boolean): void;
  /** 有効/無効を切り替える */
  setEnabled(enabled: boolean): void;

  // 破棄
  /** コンポーネントを破棄する */
  destroy(): void;
}
