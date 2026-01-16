/**
 * event-bus.ts - イベントバス実装
 *
 * TASK-0004: イベントバス実装
 * 購読型（Pub/Sub）パターンでコンポーネント間の疎結合な通信を実現する
 */

import type { GameEventType } from '@shared/types';
import type { EventHandler, IBusEvent, IEventBus } from './event-bus.interface';

/**
 * イベントバス実装
 *
 * @example
 * ```typescript
 * const eventBus = new EventBus();
 *
 * // 購読
 * const unsubscribe = eventBus.on(GameEventType.PHASE_CHANGED, (event) => {
 *   console.log('Phase changed:', event.payload);
 * });
 *
 * // 発行
 * eventBus.emit(GameEventType.PHASE_CHANGED, { previousPhase: 'GATHERING', newPhase: 'ALCHEMY' });
 *
 * // 購読解除
 * unsubscribe();
 * ```
 */
export class EventBus implements IEventBus {
  /** イベントタイプごとのハンドラーセット */
  private handlers: Map<GameEventType, Set<EventHandler<unknown>>> = new Map();

  /**
   * イベントを発行する
   *
   * @param type イベント種別
   * @param payload イベントペイロード
   */
  emit<T>(type: GameEventType, payload: T): void {
    const event: IBusEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        handler(event);
      }
    }
  }

  /**
   * イベントを購読する
   *
   * @param type イベント種別
   * @param handler イベントハンドラー
   * @returns 購読解除関数
   */
  on<T>(type: GameEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    const handlerSet = this.handlers.get(type)!;
    handlerSet.add(handler as EventHandler<unknown>);

    return () => this.off(type, handler as EventHandler<unknown>);
  }

  /**
   * イベントを1回だけ購読する
   *
   * @param type イベント種別
   * @param handler イベントハンドラー
   */
  once<T>(type: GameEventType, handler: EventHandler<T>): void {
    const onceHandler: EventHandler<T> = (event) => {
      handler(event);
      this.off(type, onceHandler as EventHandler<unknown>);
    };

    this.on(type, onceHandler);
  }

  /**
   * イベントの購読を解除する
   *
   * @param type イベント種別
   * @param handler 解除するハンドラー
   */
  off(type: GameEventType, handler: EventHandler<unknown>): void {
    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      typeHandlers.delete(handler);
    }
  }
}
