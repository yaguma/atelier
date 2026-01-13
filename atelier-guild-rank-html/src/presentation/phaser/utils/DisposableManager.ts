/**
 * 破棄可能オブジェクトのインターフェース
 */
export interface IDisposable {
  dispose(): void;
}

/**
 * 破棄管理クラス
 * シーン終了時にまとめてリソースを解放
 */
export class DisposableManager implements IDisposable {
  private disposables: Set<IDisposable> = new Set();
  private cleanupCallbacks: Set<() => void> = new Set();
  private isDisposed: boolean = false;

  /**
   * 破棄対象を登録
   */
  register(disposable: IDisposable): void {
    if (this.isDisposed) {
      console.warn('[DisposableManager] Manager is already disposed');
      disposable.dispose();
      return;
    }
    this.disposables.add(disposable);
  }

  /**
   * クリーンアップコールバックを登録
   */
  onCleanup(callback: () => void): void {
    if (this.isDisposed) {
      console.warn('[DisposableManager] Manager is already disposed');
      callback();
      return;
    }
    this.cleanupCallbacks.add(callback);
  }

  /**
   * 登録解除
   */
  unregister(disposable: IDisposable): void {
    this.disposables.delete(disposable);
  }

  /**
   * 全リソースを破棄
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    // クリーンアップコールバック実行
    this.cleanupCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('[DisposableManager] Cleanup callback error:', error);
      }
    });
    this.cleanupCallbacks.clear();

    // 破棄対象を逆順で破棄（後に登録されたものを先に）
    const disposableArray = Array.from(this.disposables).reverse();

    for (const disposable of disposableArray) {
      try {
        disposable.dispose();
      } catch (error) {
        console.error('[DisposableManager] Dispose error:', error);
      }
    }

    this.disposables.clear();
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
    return this.disposables.size;
  }

  /**
   * クリーンアップコールバック数を取得
   */
  get callbackCount(): number {
    return this.cleanupCallbacks.size;
  }
}
