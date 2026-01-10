/**
 * GatheringContainer インターフェース
 *
 * TASK-0222: GatheringContainer設計
 * 採取フェーズコンテナのインターフェースを定義する
 */

import Phaser from 'phaser';
import { GatheringCard } from '../../../domain/card/CardEntity';
import { Material } from '../../../domain/material/MaterialEntity';
import type { IPhaseContainer } from './IPhaseContainer';
import type { MaterialOption } from '../material/IMaterialOptionView';
import type { EventBus } from '../../events/EventBus';

/**
 * 採取結果
 */
export interface GatheringResult {
  /** 選択した素材 */
  selectedMaterials: Material[];
  /** 合計APコスト */
  totalAPCost: number;
  /** 採取に使用したカード */
  gatheringCard: GatheringCard;
}

/**
 * GatheringContainerオプション
 */
export interface GatheringContainerOptions {
  /** Phaserシーン */
  scene: Phaser.Scene;
  /** EventBus */
  eventBus: EventBus;
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** 採取完了時のコールバック */
  onGatheringComplete?: (result: GatheringResult) => void;
  /** スキップ時のコールバック */
  onSkip?: () => void;
}

/**
 * GatheringContainerインターフェース
 */
export interface IGatheringContainer extends IPhaseContainer {
  // 採取地カード設定
  /** 採取地カードを設定する */
  setGatheringCard(card: GatheringCard): void;
  /** 採取地カードを取得する */
  getGatheringCard(): GatheringCard | null;

  // 素材選択肢設定
  /** 素材選択肢を設定する */
  setMaterialOptions(options: MaterialOption[]): void;

  // AP管理
  /** 現在のAPを設定する */
  setCurrentAP(current: number, max: number): void;

  // 選択状態
  /** 選択中の素材を取得する */
  getSelectedMaterials(): Material[];
  /** 合計APコストを取得する */
  getTotalAPCost(): number;

  // 操作
  /** 採取を確定する */
  confirmGathering(): void;
  /** 選択をリセットする */
  resetSelection(): void;
}
