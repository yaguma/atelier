import Phaser from 'phaser';
import { IDisposable } from './DisposableManager';

type UnsubscribeFunction = () => void;

/**
 * イベントリスナー管理クラス
 * 登録したリスナーを一括解除
 */
export class EventListenerManager implements IDisposable {
  private unsubscribers: Set<UnsubscribeFunction> = new Set();
  private isDisposed: boolean = false;

  /**
   * EventBusのリスナーを登録
   */
  addEventBusListener(
    eventBus: { on: (event: string, callback: Function) => UnsubscribeFunction },
    event: string,
    callback: Function
  ): void {
    if (this.isDisposed) {
      console.warn('[EventListenerManager] Manager is disposed');
      return;
    }

    const unsubscribe = eventBus.on(event, callback);
    this.unsubscribers.add(unsubscribe);
  }

  /**
   * Phaser EventEmitterのリスナーを登録
   */
  addPhaserListener(
    emitter: Phaser.Events.EventEmitter,
    event: string,
    callback: Function,
    context?: object
  ): void {
    if (this.isDisposed) {
      console.warn('[EventListenerManager] Manager is disposed');
      return;
    }

    emitter.on(event, callback, context);

    this.unsubscribers.add(() => {
      emitter.off(event, callback, context);
    });
  }

  /**
   * DOM EventListenerを登録
   */
  addDOMListener(
    element: EventTarget,
    event: string,
    callback: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (this.isDisposed) {
      console.warn('[EventListenerManager] Manager is disposed');
      return;
    }

    element.addEventListener(event, callback, options);

    this.unsubscribers.add(() => {
      element.removeEventListener(event, callback, options);
    });
  }

  /**
   * Tween完了時のクリーンアップを登録
   */
  addTween(tween: Phaser.Tweens.Tween): void {
    if (this.isDisposed) {
      console.warn('[EventListenerManager] Manager is disposed');
      tween.destroy();
      return;
    }

    this.unsubscribers.add(() => {
      if (tween.isPlaying()) {
        tween.stop();
      }
      tween.destroy();
    });
  }

  /**
   * Timer完了時のクリーンアップを登録
   */
  addTimer(timer: Phaser.Time.TimerEvent): void {
    if (this.isDisposed) {
      console.warn('[EventListenerManager] Manager is disposed');
      timer.destroy();
      return;
    }

    this.unsubscribers.add(() => {
      timer.destroy();
    });
  }

  /**
   * カスタム解除関数を登録
   */
  addUnsubscriber(unsubscribe: UnsubscribeFunction): void {
    if (this.isDisposed) {
      console.warn('[EventListenerManager] Manager is disposed');
      unsubscribe();
      return;
    }

    this.unsubscribers.add(unsubscribe);
  }

  /**
   * 全リスナーを解除
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    this.unsubscribers.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('[EventListenerManager] Unsubscribe error:', error);
      }
    });

    this.unsubscribers.clear();
  }

  /**
   * 破棄済みか確認
   */
  get disposed(): boolean {
    return this.isDisposed;
  }

  /**
   * 登録数を取得
   */
  get count(): number {
    return this.unsubscribers.size;
  }
}
