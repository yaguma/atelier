/**
 * QuestPanelインターフェース
 *
 * 依頼パネルコンポーネントのインターフェースを定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0214.md
 */

import type Phaser from 'phaser';
import type { Quest } from '../../../domain/quest/QuestEntity';

/**
 * QuestPanelのオプション
 */
export interface QuestPanelOptions {
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** パネル幅 */
  width?: number;
  /** パネル高さ */
  height?: number;
  /** 依頼受注時のコールバック */
  onAccept?: (quest: Quest) => void;
  /** 依頼拒否時のコールバック */
  onReject?: (quest: Quest) => void;
  /** 納品時のコールバック */
  onDeliver?: (quest: Quest) => void;
}

/**
 * 依頼進捗情報
 */
export interface QuestProgress {
  /** アイテム進捗 */
  items: Array<{
    /** アイテムID */
    itemId: string;
    /** 必要数 */
    required: number;
    /** 現在数 */
    current: number;
  }>;
  /** 完了フラグ */
  isComplete: boolean;
}

/**
 * QuestPanelインターフェース
 */
export interface IQuestPanel {
  /** Phaserコンテナ */
  readonly container: Phaser.GameObjects.Container;

  // 依頼設定
  /**
   * 依頼を設定する
   * @param quest 依頼（nullで空状態）
   */
  setQuest(quest: Quest | null): void;

  /**
   * 現在の依頼を取得する
   */
  getQuest(): Quest | null;

  // 進捗更新
  /**
   * 進捗を更新する
   * @param progress 進捗情報
   */
  updateProgress(progress: QuestProgress): void;

  // ボタン制御
  /**
   * 受注ボタンの有効/無効を設定する
   * @param enabled 有効フラグ
   */
  setAcceptEnabled(enabled: boolean): void;

  /**
   * 納品ボタンの有効/無効を設定する
   * @param enabled 有効フラグ
   */
  setDeliverEnabled(enabled: boolean): void;

  /**
   * 納品ボタンの表示/非表示を設定する
   * @param show 表示フラグ
   */
  showDeliverButton(show: boolean): void;

  // 表示制御
  /**
   * 表示/非表示を設定する
   * @param visible 表示フラグ
   */
  setVisible(visible: boolean): void;

  // 破棄
  /**
   * パネルを破棄する
   */
  destroy(): void;
}
