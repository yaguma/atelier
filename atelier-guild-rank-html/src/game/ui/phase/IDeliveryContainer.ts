/**
 * DeliveryContainerインターフェース定義
 *
 * TASK-0232: DeliveryContainer設計
 * 納品フェーズコンテナのインターフェースと関連型を定義する。
 *
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0232.md
 */

import Phaser from 'phaser';
import type { IActiveQuest } from '@domain/quest/QuestEntity';
import type { CraftedItem } from '@domain/item/ItemEntity';
import type { Card } from '@domain/card/Card';
import type { EventBus } from '../../events/EventBus';
import type { IPhaseContainer } from './IPhaseContainer';

/**
 * 納品報酬
 */
export interface DeliveryReward {
  /** 報酬ゴールド */
  gold: number;
  /** 報酬貢献度 */
  contribution: number;
  /** 報酬カード（あれば） */
  rewardCards?: Card[];
}

/**
 * 納品結果
 */
export interface DeliveryResult {
  /** 納品した依頼 */
  quest: IActiveQuest;
  /** 納品したアイテムリスト */
  deliveredItems: CraftedItem[];
  /** 報酬 */
  rewards: DeliveryReward;
}

/**
 * DeliveryContainerオプション
 */
export interface DeliveryContainerOptions {
  /** シーン参照 */
  scene: Phaser.Scene;
  /** EventBus参照 */
  eventBus: EventBus;
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** 納品完了時コールバック */
  onDeliveryComplete?: (result: DeliveryResult) => void;
  /** スキップ時コールバック */
  onSkip?: () => void;
}

/**
 * IDeliveryContainerインターフェース
 *
 * 納品フェーズコンテナの操作を定義する。
 */
export interface IDeliveryContainer extends IPhaseContainer {
  // =====================================================
  // 依頼設定
  // =====================================================

  /**
   * 受注中の依頼を設定する
   * @param quests 受注中の依頼配列
   */
  setAcceptedQuests(quests: IActiveQuest[]): void;

  /**
   * 受注中の依頼を取得する
   * @returns 受注中の依頼配列
   */
  getAcceptedQuests(): IActiveQuest[];

  // =====================================================
  // インベントリ設定
  // =====================================================

  /**
   * インベントリを設定する（納品可否判定用）
   * @param items インベントリのアイテム配列
   */
  setInventory(items: CraftedItem[]): void;

  // =====================================================
  // 選択操作
  // =====================================================

  /**
   * 選択中の依頼を取得する
   * @returns 選択中の依頼（未選択時はnull）
   */
  getSelectedQuest(): IActiveQuest | null;

  /**
   * 依頼を選択する
   * @param quest 選択する依頼
   */
  selectQuest(quest: IActiveQuest): void;

  // =====================================================
  // 納品判定
  // =====================================================

  /**
   * 依頼が納品可能かどうかを判定する
   * @param quest 判定する依頼
   * @returns 納品可能な場合true
   */
  canDeliver(quest: IActiveQuest): boolean;

  /**
   * 納品可能な依頼リストを取得する
   * @returns 納品可能な依頼配列
   */
  getDeliverableQuests(): IActiveQuest[];

  // =====================================================
  // 納品操作
  // =====================================================

  /**
   * 選択中の依頼を納品する
   */
  deliver(): Promise<void>;
}
