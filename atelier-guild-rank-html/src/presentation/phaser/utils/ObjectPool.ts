import Phaser from 'phaser';

/**
 * プール対応オブジェクトのインターフェース
 */
export interface PoolableObject extends Phaser.GameObjects.GameObject {
  /**
   * オブジェクトをリセットする（プール返却時）
   */
  reset(): void;

  /**
   * プール状態を設定する
   */
  setPooled(pooled: boolean): void;

  /**
   * プール状態を取得する
   */
  isPooled(): boolean;
}

/**
 * オブジェクトプールの設定
 */
export interface ObjectPoolConfig<T extends PoolableObject> {
  /** シーン */
  scene: Phaser.Scene;
  /** オブジェクト生成ファクトリ */
  factory: () => T;
  /** 初期プールサイズ（デフォルト: 10） */
  initialSize?: number;
  /** 最大プールサイズ（デフォルト: 100） */
  maxSize?: number;
  /** 自動拡張するか（デフォルト: true） */
  autoExpand?: boolean;
}

/**
 * プール統計情報
 */
export interface PoolStats {
  /** 総オブジェクト数 */
  total: number;
  /** アクティブ数 */
  active: number;
  /** 利用可能数 */
  available: number;
  /** 取得回数 */
  acquireCount: number;
  /** 返却回数 */
  releaseCount: number;
  /** 拡張回数 */
  expandCount: number;
}

/**
 * 汎用オブジェクトプール
 *
 * 頻繁に生成・破棄されるオブジェクトを再利用することで、
 * GC（ガベージコレクション）の発生を抑制し、パフォーマンスを向上させる
 */
export class ObjectPool<T extends PoolableObject> {
  private scene: Phaser.Scene;
  private factory: () => T;
  private pool: T[] = [];
  private active: Set<T> = new Set();
  private maxSize: number;
  private autoExpand: boolean;

  // 統計情報
  private acquireCount: number = 0;
  private releaseCount: number = 0;
  private expandCount: number = 0;

  constructor(config: ObjectPoolConfig<T>) {
    this.scene = config.scene;
    this.factory = config.factory;
    this.maxSize = config.maxSize ?? 100;
    this.autoExpand = config.autoExpand ?? true;

    // 初期プール作成
    const initialSize = config.initialSize ?? 10;
    this.expand(initialSize);
  }

  /**
   * プールを拡張する
   */
  private expand(count: number): void {
    const targetSize = Math.min(this.pool.length + count, this.maxSize);
    const actualCount = targetSize - this.pool.length;

    for (let i = 0; i < actualCount; i++) {
      this.createObject();
    }

    if (actualCount > 0) {
      this.expandCount++;
    }
  }

  /**
   * オブジェクトを生成してプールに追加
   */
  private createObject(): T {
    const obj = this.factory();
    obj.setPooled(true);
    obj.setActive(false);
    obj.setVisible(false);
    this.pool.push(obj);
    return obj;
  }

  /**
   * プールからオブジェクトを取得
   * @returns 取得したオブジェクト、または利用不可の場合はnull
   */
  acquire(): T | null {
    // 利用可能なオブジェクトを探す
    let obj = this.pool.find((o) => !this.active.has(o));

    if (!obj) {
      // プールが枯渇
      if (this.autoExpand && this.pool.length < this.maxSize) {
        // 自動拡張
        const expandSize = Math.min(10, this.maxSize - this.pool.length);
        this.expand(expandSize);
        obj = this.pool.find((o) => !this.active.has(o));
      }

      if (!obj) {
        console.warn(
          `[ObjectPool] Pool exhausted (total: ${this.pool.length}, max: ${this.maxSize})`
        );
        return null;
      }
    }

    obj.setActive(true);
    obj.setVisible(true);
    obj.setPooled(false);
    this.active.add(obj);
    this.acquireCount++;

    return obj;
  }

  /**
   * オブジェクトをプールに返却
   * @param obj 返却するオブジェクト
   */
  release(obj: T): void {
    if (!this.active.has(obj)) {
      console.warn('[ObjectPool] Trying to release object not in active set');
      return;
    }

    obj.reset();
    obj.setActive(false);
    obj.setVisible(false);
    obj.setPooled(true);
    this.active.delete(obj);
    this.releaseCount++;
  }

  /**
   * 全アクティブオブジェクトを返却
   */
  releaseAll(): void {
    this.active.forEach((obj) => {
      obj.reset();
      obj.setActive(false);
      obj.setVisible(false);
      obj.setPooled(true);
      this.releaseCount++;
    });
    this.active.clear();
  }

  /**
   * プールを破棄
   */
  destroy(): void {
    this.pool.forEach((obj) => obj.destroy());
    this.pool = [];
    this.active.clear();
  }

  /**
   * プールをプリウォーム（事前にオブジェクトを生成）
   * @param count 生成数
   */
  prewarm(count: number): void {
    const needed = count - this.pool.length;
    if (needed > 0) {
      this.expand(needed);
    }
  }

  /**
   * 統計情報を取得
   */
  getStats(): PoolStats {
    return {
      total: this.pool.length,
      active: this.active.size,
      available: this.pool.length - this.active.size,
      acquireCount: this.acquireCount,
      releaseCount: this.releaseCount,
      expandCount: this.expandCount,
    };
  }

  /**
   * アクティブオブジェクトを取得
   */
  getActiveObjects(): T[] {
    return Array.from(this.active);
  }

  /**
   * プールサイズを取得
   */
  getSize(): number {
    return this.pool.length;
  }

  /**
   * アクティブ数を取得
   */
  getActiveCount(): number {
    return this.active.size;
  }

  /**
   * 利用可能数を取得
   */
  getAvailableCount(): number {
    return this.pool.length - this.active.size;
  }

  /**
   * プールが枯渇しているかチェック
   */
  isExhausted(): boolean {
    return this.active.size >= this.pool.length && this.pool.length >= this.maxSize;
  }

  /**
   * 統計をリセット
   */
  resetStats(): void {
    this.acquireCount = 0;
    this.releaseCount = 0;
    this.expandCount = 0;
  }
}

/**
 * プール対応コンテナの基底クラス
 */
export abstract class PoolableContainer
  extends Phaser.GameObjects.Container
  implements PoolableObject
{
  protected _isPooled: boolean = false;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    super(scene, x, y);
    scene.add.existing(this);
  }

  /**
   * リセット処理（サブクラスでオーバーライド）
   */
  abstract reset(): void;

  setPooled(pooled: boolean): void {
    this._isPooled = pooled;
  }

  isPooled(): boolean {
    return this._isPooled;
  }

  /**
   * 基本的なリセット処理（サブクラスから呼び出し可能）
   */
  protected resetBase(): void {
    this.setPosition(0, 0);
    this.setScale(1);
    this.setAlpha(1);
    this.setAngle(0);
    this.removeInteractive();
    this.removeAllListeners();
  }
}
