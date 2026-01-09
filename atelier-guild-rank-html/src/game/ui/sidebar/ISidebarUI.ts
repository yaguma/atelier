/**
 * SidebarUIインターフェース定義
 *
 * サイドバーUIコンポーネントのインターフェースを定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0205.md
 */

import Phaser from 'phaser';
import { SidebarTab, InventoryFilter } from './SidebarConstants';

/**
 * 依頼表示データ
 */
export interface QuestDisplayData {
  /** 依頼ID */
  id: string;
  /** 依頼名 */
  name: string;
  /** 説明文 */
  description: string;
  /** 難易度 */
  difficulty: number;
  /** 報酬ゴールド */
  rewardGold: number;
  /** 報酬経験値 */
  rewardExp: number;
  /** 必要アイテム */
  requiredItems: { itemId: string; itemName: string; count: number }[];
  /** 完了可能か */
  canComplete: boolean;
}

/**
 * インベントリアイテム表示データ
 */
export interface InventoryDisplayData {
  /** アイテムID */
  id: string;
  /** アイテム名 */
  name: string;
  /** 説明文 */
  description: string;
  /** 所持数 */
  count: number;
  /** カテゴリ */
  category: 'material' | 'item' | 'artifact';
  /** レアリティ */
  rarity?: number;
}

/**
 * サイドバーUI作成オプション
 */
export interface SidebarUIOptions {
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** 幅 */
  width?: number;
  /** 高さ */
  height?: number;
  /** 依頼選択時コールバック */
  onQuestSelect?: (quest: QuestDisplayData) => void;
  /** アイテム選択時コールバック */
  onItemSelect?: (item: InventoryDisplayData) => void;
}

/**
 * SidebarUIインターフェース
 *
 * メイン画面右側のサイドバー情報を表示・管理する。
 */
export interface ISidebarUI {
  /** Phaserコンテナへの参照（読み取り専用） */
  readonly container: Phaser.GameObjects.Container;

  // ========================================
  // タブ切り替え
  // ========================================

  /**
   * アクティブタブを設定する
   * @param tab タブ種別
   */
  setActiveTab(tab: SidebarTab): void;

  /**
   * アクティブタブを取得する
   * @returns 現在のアクティブタブ
   */
  getActiveTab(): SidebarTab;

  // ========================================
  // 依頼リスト
  // ========================================

  /**
   * 依頼リストを設定する
   * @param quests 依頼データの配列
   */
  setQuests(quests: QuestDisplayData[]): void;

  /**
   * 特定の依頼をハイライトする
   * @param questId 依頼ID
   */
  highlightQuest(questId: string): void;

  /**
   * 依頼のハイライトをクリアする
   */
  clearQuestHighlight(): void;

  // ========================================
  // インベントリ
  // ========================================

  /**
   * インベントリを設定する
   * @param items アイテムデータの配列
   */
  setInventory(items: InventoryDisplayData[]): void;

  /**
   * 特定のアイテムをハイライトする
   * @param itemId アイテムID
   */
  highlightItem(itemId: string): void;

  /**
   * アイテムのハイライトをクリアする
   */
  clearItemHighlight(): void;

  // ========================================
  // インベントリフィルター (TASK-0207)
  // ========================================

  /**
   * インベントリフィルターを設定する
   * @param filter フィルター種別
   */
  setInventoryFilter(filter: InventoryFilter): void;

  /**
   * 現在のインベントリフィルターを取得する
   * @returns 現在のフィルター
   */
  getInventoryFilter(): InventoryFilter;

  /**
   * フィルター適用後のアイテム数を取得する
   * @returns フィルター適用後のアイテム数
   */
  getFilteredInventoryCount(): number;

  // ========================================
  // 表示制御
  // ========================================

  /**
   * 表示・非表示を設定する
   * @param visible true: 表示、false: 非表示
   */
  setVisible(visible: boolean): void;

  /**
   * 有効・無効を設定する
   * @param enabled true: 有効、false: 無効（半透明表示）
   */
  setEnabled(enabled: boolean): void;

  // ========================================
  // スクロール
  // ========================================

  /**
   * スクロールを先頭に戻す
   */
  scrollToTop(): void;

  /**
   * 指定インデックスのアイテムまでスクロール
   * @param index アイテムインデックス
   */
  scrollToItem(index: number): void;

  // ========================================
  // ライフサイクル
  // ========================================

  /**
   * リソースを破棄する
   */
  destroy(): void;
}
