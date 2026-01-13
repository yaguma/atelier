/**
 * WeakRefを使用したキャッシュ
 * 参照がなくなったオブジェクトは自動的にGCされる
 */
export class WeakCache<K, V extends object> {
  private cache: Map<K, WeakRef<V>> = new Map();
  private finalizationRegistry: FinalizationRegistry<K>;

  constructor() {
    // オブジェクトがGCされたときにキャッシュからエントリを削除
    this.finalizationRegistry = new FinalizationRegistry((key: K) => {
      this.cache.delete(key);
    });
  }

  /**
   * キャッシュに追加
   */
  set(key: K, value: V): void {
    // 既存エントリがあれば削除
    this.delete(key);

    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    this.finalizationRegistry.register(value, key);
  }

  /**
   * キャッシュから取得
   */
  get(key: K): V | undefined {
    const ref = this.cache.get(key);

    if (!ref) {
      return undefined;
    }

    const value = ref.deref();

    // GCされていたらエントリを削除
    if (value === undefined) {
      this.cache.delete(key);
    }

    return value;
  }

  /**
   * キャッシュから削除
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * キャッシュサイズ（参照が有効なもののみ）
   */
  get size(): number {
    let count = 0;

    for (const [key, ref] of this.cache) {
      if (ref.deref() !== undefined) {
        count++;
      } else {
        this.cache.delete(key);
      }
    }

    return count;
  }

  /**
   * キャッシュに存在するか
   */
  has(key: K): boolean {
    const ref = this.cache.get(key);

    if (!ref) {
      return false;
    }

    if (ref.deref() === undefined) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 全エントリのキーを取得（有効なもののみ）
   */
  keys(): K[] {
    const validKeys: K[] = [];

    for (const [key, ref] of this.cache) {
      if (ref.deref() !== undefined) {
        validKeys.push(key);
      } else {
        this.cache.delete(key);
      }
    }

    return validKeys;
  }

  /**
   * キャッシュ統計
   */
  getStats(): { totalEntries: number; validEntries: number } {
    const totalEntries = this.cache.size;
    const validEntries = this.size;

    return { totalEntries, validEntries };
  }
}
