/**
 * HeaderUIインターフェース定義
 *
 * ヘッダーUIコンポーネントのインターフェースを定義する。
 * 設計文書: docs/tasks/atelier-guild-rank-phaser/TASK-0201.md
 */

import Phaser from 'phaser';
import { GuildRank } from '@domain/common/types';

/**
 * ヘッダー表示データ
 */
export interface HeaderUIData {
  /** 現在のギルドランク */
  rank: GuildRank;
  /** 現在の昇格ポイント */
  currentExp: number;
  /** 昇格に必要なポイント */
  requiredExp: number;
  /** 現在の日数 */
  currentDay: number;
  /** 最大日数 */
  maxDay: number;
  /** 所持ゴールド */
  gold: number;
  /** 現在のAP */
  currentAP: number;
  /** 最大AP */
  maxAP: number;
}

/**
 * ヘッダーUI作成オプション
 */
export interface HeaderUIOptions {
  /** X座標 */
  x?: number;
  /** Y座標 */
  y?: number;
  /** 幅 */
  width?: number;
  /** メニューボタンクリック時コールバック */
  onMenuClick?: () => void;
}

/**
 * HeaderUIインターフェース
 *
 * ゲーム画面上部のヘッダー情報を表示・管理する。
 */
export interface IHeaderUI {
  /** Phaserコンテナへの参照（読み取り専用） */
  readonly container: Phaser.GameObjects.Container;

  // ========================================
  // 一括更新
  // ========================================

  /**
   * すべての表示を更新する
   * @param data 更新データ
   */
  updateAll(data: HeaderUIData): void;

  // ========================================
  // 個別更新
  // ========================================

  /**
   * ランク表示を更新する
   * @param rank 新しいランク
   */
  updateRank(rank: GuildRank): void;

  /**
   * 経験値ゲージを更新する
   * @param current 現在の経験値
   * @param required 必要経験値
   */
  updateExp(current: number, required: number): void;

  /**
   * 日数表示を更新する
   * @param current 現在の日数
   * @param max 最大日数
   */
  updateDay(current: number, max: number): void;

  /**
   * ゴールド表示を更新する
   * @param gold 所持ゴールド
   */
  updateGold(gold: number): void;

  /**
   * AP表示を更新する
   * @param current 現在のAP
   * @param max 最大AP
   */
  updateAP(current: number, max: number): void;

  // ========================================
  // アニメーション付き更新
  // ========================================

  /**
   * 経験値獲得アニメーション
   * @param amount 獲得量
   */
  animateExpGain(amount: number): void;

  /**
   * ゴールド変化アニメーション
   * @param amount 変化量（正: 獲得、負: 消費）
   */
  animateGoldChange(amount: number): void;

  /**
   * AP変化アニメーション
   * @param amount 変化量（正: 回復、負: 消費）
   */
  animateAPChange(amount: number): void;

  // ========================================
  // 表示制御
  // ========================================

  /**
   * 表示・非表示を設定する
   * @param visible true: 表示、false: 非表示
   */
  setVisible(visible: boolean): void;

  // ========================================
  // ライフサイクル
  // ========================================

  /**
   * リソースを破棄する
   */
  destroy(): void;
}
