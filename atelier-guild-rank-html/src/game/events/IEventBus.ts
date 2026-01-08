/**
 * EventBusインターフェース定義
 *
 * Phaser UIとApplication層の疎結合通信を実現するEventBusのインターフェース。
 * 型安全なイベント発行・購読の仕組みを提供する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/core-systems.md
 */

import type {
  EventPayloadMap,
  PayloadEventKey,
  VoidEventKey,
} from './EventPayloads';

/**
 * イベントコールバック関数の型
 */
export type EventCallback<T> = (payload: T) => void;

/**
 * ペイロードなしイベントのコールバック関数の型
 */
export type VoidEventCallback = () => void;

/**
 * 購読解除関数の型
 */
export type UnsubscribeFn = () => void;

/**
 * EventBusインターフェース
 *
 * Phaser UIとApplication層の疎結合通信を実現する。
 * 型安全なイベント発行・購読の仕組みを提供する。
 *
 * @example
 * ```typescript
 * // ペイロードありイベントの発行
 * eventBus.emit('state:phase:changed', { phase: 'GATHERING' });
 *
 * // ペイロードなしイベントの発行
 * eventBus.emitVoid('ui:gathering:confirmed');
 *
 * // イベントの購読
 * const unsubscribe = eventBus.on('state:phase:changed', (payload) => {
 *   console.log('Phase changed to:', payload.phase);
 * });
 *
 * // 購読解除
 * unsubscribe();
 * ```
 */
export interface IEventBus {
  /**
   * ペイロードありイベントを発行する
   * @param event イベントキー
   * @param payload イベントペイロード
   */
  emit<K extends PayloadEventKey>(event: K, payload: EventPayloadMap[K]): void;

  /**
   * ペイロードなしイベントを発行する
   * @param event イベントキー
   */
  emitVoid(event: VoidEventKey): void;

  /**
   * ペイロードありイベントを購読する
   * @param event イベントキー
   * @param callback イベントハンドラ
   * @returns 購読解除関数
   */
  on<K extends PayloadEventKey>(
    event: K,
    callback: EventCallback<EventPayloadMap[K]>
  ): UnsubscribeFn;

  /**
   * ペイロードなしイベントを購読する
   * @param event イベントキー
   * @param callback イベントハンドラ
   * @returns 購読解除関数
   */
  onVoid(event: VoidEventKey, callback: VoidEventCallback): UnsubscribeFn;

  /**
   * ペイロードありイベントを一度だけ購読する
   * イベント発火後、自動的に購読が解除される
   * @param event イベントキー
   * @param callback イベントハンドラ
   * @returns 購読解除関数
   */
  once<K extends PayloadEventKey>(
    event: K,
    callback: EventCallback<EventPayloadMap[K]>
  ): UnsubscribeFn;

  /**
   * ペイロードなしイベントを一度だけ購読する
   * イベント発火後、自動的に購読が解除される
   * @param event イベントキー
   * @param callback イベントハンドラ
   * @returns 購読解除関数
   */
  onceVoid(event: VoidEventKey, callback: VoidEventCallback): UnsubscribeFn;

  /**
   * 特定イベントの購読を解除する
   * callbackを指定しない場合、そのイベントのすべての購読を解除する
   * @param event イベントキー
   * @param callback 解除するコールバック（省略可）
   */
  off(
    event: keyof EventPayloadMap,
    callback?: EventCallback<unknown> | VoidEventCallback
  ): void;

  /**
   * すべてのイベント購読を解除する
   * シーン終了時のクリーンアップに使用する
   */
  clear(): void;

  /**
   * 特定イベントの購読者数を取得する
   * デバッグ・テスト用
   * @param event イベントキー
   * @returns 購読者数
   */
  listenerCount(event: keyof EventPayloadMap): number;
}
