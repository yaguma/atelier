/**
 * event-bus.interface.ts - イベントバスインターフェース定義
 *
 * TASK-0004: イベントバス実装
 * アプリケーション内のイベント駆動通信を管理するインターフェース
 */

import type { GameEventType } from '@shared/types';

/**
 * イベントバスで発行されるイベントの構造
 */
export interface IBusEvent<T = unknown> {
  /** イベント種別 */
  type: GameEventType;
  /** ペイロード */
  payload: T;
  /** タイムスタンプ */
  timestamp: number;
}

/**
 * イベントハンドラーの型
 */
export type EventHandler<T = unknown> = (event: IBusEvent<T>) => void;

/**
 * イベントバスインターフェース
 *
 * 購読型（Pub/Sub）パターンでコンポーネント間の疎結合な通信を実現する
 */
export interface IEventBus {
  /**
   * イベントを発行する
   *
   * @param type イベント種別
   * @param payload イベントペイロード
   */
  emit<T>(type: GameEventType, payload: T): void;

  /**
   * イベントを購読する
   *
   * @param type イベント種別
   * @param handler イベントハンドラー
   * @returns 購読解除関数
   */
  on<T>(type: GameEventType, handler: EventHandler<T>): () => void;

  /**
   * イベントを1回だけ購読する
   *
   * @param type イベント種別
   * @param handler イベントハンドラー
   */
  once<T>(type: GameEventType, handler: EventHandler<T>): void;

  /**
   * イベントの購読を解除する
   *
   * @param type イベント種別
   * @param handler 解除するハンドラー
   */
  off(type: GameEventType, handler: EventHandler<unknown>): void;
}
