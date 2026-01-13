import Phaser from 'phaser';

interface ObjectTrackingInfo {
  type: string;
  createdAt: number;
  stackTrace: string;
}

/**
 * メモリリーク検出器（デバッグ用）
 *
 * 開発中にメモリリークを検出するためのユーティリティ。
 * 本番環境では無効化することを推奨。
 */
export class MemoryLeakDetector {
  private static instance: MemoryLeakDetector | null = null;
  private trackedObjects: WeakMap<object, ObjectTrackingInfo> = new WeakMap();
  private objectCounts: Map<string, number> = new Map();
  private enabled: boolean = false;

  private constructor() {}

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  /**
   * 検出を有効化
   */
  enable(): void {
    this.enabled = true;
    console.log('[MemoryLeakDetector] Enabled');
  }

  /**
   * 検出を無効化
   */
  disable(): void {
    this.enabled = false;
    console.log('[MemoryLeakDetector] Disabled');
  }

  /**
   * 検出が有効かどうか
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * オブジェクトを追跡開始
   */
  track(obj: object, type: string): void {
    if (!this.enabled) return;

    const info: ObjectTrackingInfo = {
      type,
      createdAt: Date.now(),
      stackTrace: new Error().stack || '',
    };

    this.trackedObjects.set(obj, info);

    const count = this.objectCounts.get(type) || 0;
    this.objectCounts.set(type, count + 1);
  }

  /**
   * オブジェクトの追跡を解除
   */
  untrack(obj: object): void {
    if (!this.enabled) return;

    const info = this.trackedObjects.get(obj);

    if (info) {
      const count = this.objectCounts.get(info.type) || 0;
      this.objectCounts.set(info.type, Math.max(0, count - 1));
    }
  }

  /**
   * レポートを出力
   */
  report(): void {
    console.group('[MemoryLeakDetector] Report');

    console.log('Object counts by type:');
    let hasObjects = false;
    this.objectCounts.forEach((count, type) => {
      if (count > 0) {
        console.log(`  ${type}: ${count}`);
        hasObjects = true;
      }
    });

    if (!hasObjects) {
      console.log('  No tracked objects');
    }

    // Phaserオブジェクトの確認
    if (typeof window !== 'undefined' && (window as Record<string, unknown>).game) {
      const game = (window as Record<string, unknown>).game as Phaser.Game;

      console.log('Phaser statistics:');
      console.log(`  Active scenes: ${game.scene.getScenes(true).length}`);

      if (game.textures.list) {
        console.log(`  Textures: ${Object.keys(game.textures.list).length}`);
      }

      // メモリ情報（対応ブラウザのみ）
      if ((performance as unknown as Record<string, unknown>).memory) {
        const memory = (performance as unknown as Record<string, unknown>)
          .memory as Record<string, number>;
        console.log(`  JS Heap Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  JS Heap Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      }
    }

    console.groupEnd();
  }

  /**
   * カウントをリセット
   */
  reset(): void {
    this.objectCounts.clear();
    console.log('[MemoryLeakDetector] Reset');
  }

  /**
   * 特定タイプのカウントを取得
   */
  getCount(type: string): number {
    return this.objectCounts.get(type) || 0;
  }

  /**
   * 全タイプのカウントを取得
   */
  getAllCounts(): Map<string, number> {
    return new Map(this.objectCounts);
  }

  /**
   * 警告を出すしきい値を設定
   */
  checkThreshold(type: string, threshold: number): boolean {
    const count = this.getCount(type);

    if (count > threshold) {
      console.warn(
        `[MemoryLeakDetector] ${type} count (${count}) exceeds threshold (${threshold})`
      );
      return true;
    }

    return false;
  }

  /**
   * 全タイプでしきい値チェック
   */
  checkAllThresholds(defaultThreshold: number): string[] {
    const exceeded: string[] = [];

    this.objectCounts.forEach((count, type) => {
      if (count > defaultThreshold) {
        exceeded.push(type);
        console.warn(
          `[MemoryLeakDetector] ${type} count (${count}) exceeds threshold (${defaultThreshold})`
        );
      }
    });

    return exceeded;
  }

  /**
   * スナップショットを取得（比較用）
   */
  takeSnapshot(): Map<string, number> {
    return new Map(this.objectCounts);
  }

  /**
   * スナップショットと比較してリークを検出
   */
  compareSnapshot(snapshot: Map<string, number>): Map<string, number> {
    const diff = new Map<string, number>();

    this.objectCounts.forEach((count, type) => {
      const prevCount = snapshot.get(type) || 0;
      const delta = count - prevCount;

      if (delta !== 0) {
        diff.set(type, delta);
      }
    });

    return diff;
  }
}
