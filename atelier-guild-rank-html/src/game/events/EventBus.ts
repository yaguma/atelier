/**
 * EventBus実装
 *
 * Phaser UIとApplication層の疎結合通信を実現するイベントバス。
 * シングルトンパターンで実装し、型安全なイベント発行・購読を提供する。
 * 設計文書: docs/design/atelier-guild-rank-phaser/core-systems.md
 */

import type {
  IEventBus,
  EventCallback,
  VoidEventCallback,
  UnsubscribeFn,
} from './IEventBus';
import type {
  EventPayloadMap,
  PayloadEventKey,
  VoidEventKey,
} from './EventPayloads';

/**
 * リスナー情報
 */
interface Listener {
  callback: EventCallback<unknown> | VoidEventCallback;
  once: boolean;
}

/**
 * EventBusクラス
 *
 * Phaser UIとApplication層の疎結合通信を実現するシングルトンイベントバス。
 *
 * @example
 * ```typescript
 * const eventBus = EventBus.getInstance();
 *
 * // イベント購読
 * const unsubscribe = eventBus.on('state:phase:changed', (payload) => {
 *   console.log('Phase changed to:', payload.phase);
 * });
 *
 * // イベント発行
 * eventBus.emit('state:phase:changed', { phase: 'GATHERING' });
 *
 * // 購読解除
 * unsubscribe();
 * ```
 */
export class EventBus implements IEventBus {
  /**
   * シングルトンインスタンス
   */
  private static instance: EventBus | null = null;

  /**
   * イベントリスナーのマップ
   */
  private listeners: Map<string, Set<Listener>> = new Map();

  /**
   * プライベートコンストラクタ（シングルトン）
   */
  private constructor() {}

  /**
   * シングルトンインスタンスを取得する
   * @returns EventBusインスタンス
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * シングルトンインスタンスをリセットする
   * テスト用途で使用する
   */
  public static resetInstance(): void {
    if (EventBus.instance) {
      EventBus.instance.clear();
      EventBus.instance = null;
    }
  }

  /**
   * ペイロードありイベントを発行する
   */
  emit<K extends PayloadEventKey>(event: K, payload: EventPayloadMap[K]): void {
    this.emitInternal(event, payload);
  }

  /**
   * ペイロードなしイベントを発行する
   */
  emitVoid(event: VoidEventKey): void {
    this.emitInternal(event, undefined);
  }

  /**
   * 内部発行処理
   */
  private emitInternal(event: string, payload: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      return;
    }

    // イテレーション中にSetを変更しないようコピーを作成
    const listenersArray = Array.from(eventListeners);
    const toRemove: Listener[] = [];

    for (const listener of listenersArray) {
      // コールバックを実行
      if (payload === undefined) {
        (listener.callback as VoidEventCallback)();
      } else {
        (listener.callback as EventCallback<unknown>)(payload);
      }

      // once購読の場合は削除対象に追加
      if (listener.once) {
        toRemove.push(listener);
      }
    }

    // once購読を削除
    for (const listener of toRemove) {
      eventListeners.delete(listener);
    }
  }

  /**
   * ペイロードありイベントを購読する
   */
  on<K extends PayloadEventKey>(
    event: K,
    callback: EventCallback<EventPayloadMap[K]>
  ): UnsubscribeFn {
    return this.addListener(
      event,
      callback as EventCallback<unknown>,
      false
    );
  }

  /**
   * ペイロードなしイベントを購読する
   */
  onVoid(event: VoidEventKey, callback: VoidEventCallback): UnsubscribeFn {
    return this.addListener(event, callback, false);
  }

  /**
   * ペイロードありイベントを一度だけ購読する
   */
  once<K extends PayloadEventKey>(
    event: K,
    callback: EventCallback<EventPayloadMap[K]>
  ): UnsubscribeFn {
    return this.addListener(
      event,
      callback as EventCallback<unknown>,
      true
    );
  }

  /**
   * ペイロードなしイベントを一度だけ購読する
   */
  onceVoid(event: VoidEventKey, callback: VoidEventCallback): UnsubscribeFn {
    return this.addListener(event, callback, true);
  }

  /**
   * リスナーを追加する内部メソッド
   */
  private addListener(
    event: string,
    callback: EventCallback<unknown> | VoidEventCallback,
    once: boolean
  ): UnsubscribeFn {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listener: Listener = { callback, once };
    this.listeners.get(event)!.add(listener);

    // 購読解除関数を返す
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(listener);
      }
    };
  }

  /**
   * 特定イベントの購読を解除する
   */
  off(
    event: keyof EventPayloadMap,
    callback?: EventCallback<unknown> | VoidEventCallback
  ): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) {
      return;
    }

    if (callback) {
      // 特定のコールバックのみ削除
      const toRemove = Array.from(eventListeners).filter(
        (l) => l.callback === callback
      );
      for (const listener of toRemove) {
        eventListeners.delete(listener);
      }
    } else {
      // すべての購読を解除
      eventListeners.clear();
    }
  }

  /**
   * すべてのイベント購読を解除する
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * 特定イベントの購読者数を取得する
   * @param event イベントキー（省略時は全購読者数）
   * @returns 購読者数
   */
  listenerCount(event?: keyof EventPayloadMap): number {
    if (event) {
      return this.listeners.get(event)?.size ?? 0;
    }

    let count = 0;
    this.listeners.forEach((set) => {
      count += set.size;
    });
    return count;
  }
}
