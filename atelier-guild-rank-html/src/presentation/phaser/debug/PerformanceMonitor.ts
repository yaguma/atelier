import Phaser from 'phaser';

/**
 * パフォーマンス計測メトリクス
 */
export interface PerformanceMetrics {
  fps: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  sceneTransitionTime: number;
  eventProcessingTime: number;
  renderTime: number;
  updateTime: number;
  objectCount: number;
}

/**
 * パフォーマンスレポート
 */
export interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetrics;
  averages: {
    fps: number;
    memory: number;
    sceneTransition: number;
  };
  recommendations: string[];
  bottlenecks: BottleneckInfo[];
}

/**
 * ボトルネック情報
 */
export interface BottleneckInfo {
  type: 'fps' | 'memory' | 'objects' | 'sceneTransition' | 'event';
  severity: 'warning' | 'critical';
  description: string;
  suggestion: string;
}

/**
 * 計測閾値設定
 */
export interface PerformanceThresholds {
  targetFps: number;
  minFps: number;
  maxMemoryMB: number;
  maxMemoryLongTermMB: number;
  maxBootTimeMs: number;
  maxSceneTransitionMs: number;
  maxObjectCount: number;
}

/**
 * デフォルト閾値
 */
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  targetFps: 55,
  minFps: 30,
  maxMemoryMB: 100,
  maxMemoryLongTermMB: 150,
  maxBootTimeMs: 3000,
  maxSceneTransitionMs: 500,
  maxObjectCount: 500,
};

/**
 * パフォーマンス計測クラス
 * ゲーム全体のパフォーマンスを計測し、ボトルネックを特定する
 */
export class PerformanceMonitor {
  private scene: Phaser.Scene;
  private enabled: boolean = false;
  private fpsHistory: number[] = [];
  private memoryHistory: number[] = [];
  private sceneTransitionTimes: Map<string, number> = new Map();
  private sceneTransitionHistory: Map<string, number[]> = new Map();
  private eventTimes: Map<string, number[]> = new Map();
  private historySize: number = 60; // 60フレーム分
  private thresholds: PerformanceThresholds;

  // UI要素
  private debugText?: Phaser.GameObjects.Text;
  private fpsGraph?: Phaser.GameObjects.Graphics;
  private visible: boolean = true;

  constructor(scene: Phaser.Scene, thresholds?: Partial<PerformanceThresholds>) {
    this.scene = scene;
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * パフォーマンスモニタリングを有効化
   */
  enable(): void {
    this.enabled = true;
    if (this.visible) {
      this.createDebugUI();
    }
    console.log('[PerformanceMonitor] Enabled');
  }

  /**
   * パフォーマンスモニタリングを無効化
   */
  disable(): void {
    this.enabled = false;
    this.destroyDebugUI();
    console.log('[PerformanceMonitor] Disabled');
  }

  /**
   * デバッグUIの表示/非表示を切り替え
   */
  toggleVisibility(): void {
    this.visible = !this.visible;
    if (this.enabled) {
      if (this.visible) {
        this.createDebugUI();
      } else {
        this.destroyDebugUI();
      }
    }
  }

  /**
   * 有効状態を取得
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * デバッグUIを作成
   */
  private createDebugUI(): void {
    if (this.debugText) return;

    // FPS/メモリ表示テキスト
    this.debugText = this.scene.add
      .text(10, 10, '', {
        fontSize: '12px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(9999);

    // FPSグラフ
    this.fpsGraph = this.scene.add.graphics().setScrollFactor(0).setDepth(9999);
  }

  /**
   * デバッグUIを破棄
   */
  private destroyDebugUI(): void {
    this.debugText?.destroy();
    this.debugText = undefined;
    this.fpsGraph?.destroy();
    this.fpsGraph = undefined;
  }

  /**
   * フレーム更新時に呼び出す
   */
  update(): void {
    if (!this.enabled) return;

    // FPS記録
    const fps = this.scene.game.loop.actualFps;
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }

    // メモリ記録（Chrome only）
    const memory = this.getMemoryUsage();
    if (memory) {
      this.memoryHistory.push(memory.usedJSHeapSize);
      if (this.memoryHistory.length > this.historySize) {
        this.memoryHistory.shift();
      }
    }

    // UI更新
    if (this.visible) {
      this.updateDebugUI(fps, memory);
    }
  }

  /**
   * メモリ使用量を取得（Chrome DevTools API）
   */
  private getMemoryUsage(): PerformanceMetrics['memory'] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perf = window.performance as any;
    if (perf.memory) {
      return {
        usedJSHeapSize: perf.memory.usedJSHeapSize,
        totalJSHeapSize: perf.memory.totalJSHeapSize,
        jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * デバッグUIを更新
   */
  private updateDebugUI(
    fps: number,
    memory: PerformanceMetrics['memory']
  ): void {
    if (!this.debugText) return;

    const avgFps = this.getAverageFps();
    const memoryMB = memory
      ? (memory.usedJSHeapSize / 1024 / 1024).toFixed(1)
      : 'N/A';
    const objectCount = this.scene.children?.length ?? 0;

    // FPS状態に応じた色
    const fpsColor =
      avgFps >= this.thresholds.targetFps
        ? '#00ff00'
        : avgFps >= this.thresholds.minFps
          ? '#ffff00'
          : '#ff0000';

    this.debugText.setStyle({ color: fpsColor });
    this.debugText.setText(
      [
        `FPS: ${fps.toFixed(0)} (avg: ${avgFps.toFixed(0)})`,
        `Memory: ${memoryMB} MB`,
        `Scene: ${this.scene.scene.key}`,
        `Objects: ${objectCount}`,
      ].join('\n')
    );

    // FPSグラフ描画
    this.drawFpsGraph();
  }

  /**
   * FPSグラフを描画
   */
  private drawFpsGraph(): void {
    if (!this.fpsGraph) return;

    const graphX = 10;
    const graphY = 100;
    const graphWidth = 120;
    const graphHeight = 50;

    this.fpsGraph.clear();

    // 背景
    this.fpsGraph.fillStyle(0x000000, 0.7);
    this.fpsGraph.fillRect(graphX, graphY, graphWidth, graphHeight);

    // 60FPSライン
    this.fpsGraph.lineStyle(1, 0x00ff00, 0.3);
    const targetY = graphY + graphHeight - (60 / 60) * graphHeight;
    this.fpsGraph.lineBetween(graphX, targetY, graphX + graphWidth, targetY);

    // 30FPSライン（警告）
    this.fpsGraph.lineStyle(1, 0xff0000, 0.3);
    const warningY = graphY + graphHeight - (30 / 60) * graphHeight;
    this.fpsGraph.lineBetween(graphX, warningY, graphX + graphWidth, warningY);

    // FPS履歴描画
    if (this.fpsHistory.length < 2) return;

    this.fpsGraph.lineStyle(2, 0x00ff00, 1);
    this.fpsGraph.beginPath();

    const step = graphWidth / this.historySize;
    this.fpsHistory.forEach((fps, i) => {
      const x = graphX + i * step;
      const normalizedFps = Math.min(fps, 60) / 60;
      const y = graphY + graphHeight - normalizedFps * graphHeight;

      if (i === 0) {
        this.fpsGraph!.moveTo(x, y);
      } else {
        this.fpsGraph!.lineTo(x, y);
      }
    });

    this.fpsGraph.strokePath();
  }

  /**
   * 平均FPSを取得
   */
  getAverageFps(): number {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  /**
   * 最小FPSを取得
   */
  getMinFps(): number {
    if (this.fpsHistory.length === 0) return 0;
    return Math.min(...this.fpsHistory);
  }

  /**
   * 平均メモリ使用量を取得（バイト）
   */
  getAverageMemory(): number {
    if (this.memoryHistory.length === 0) return 0;
    return this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length;
  }

  /**
   * シーン遷移計測を開始
   */
  startSceneTransition(fromScene: string, toScene: string): void {
    const key = `${fromScene}->${toScene}`;
    this.sceneTransitionTimes.set(key, performance.now());
  }

  /**
   * シーン遷移計測を終了
   */
  endSceneTransition(fromScene: string, toScene: string): number {
    const key = `${fromScene}->${toScene}`;
    const startTime = this.sceneTransitionTimes.get(key);

    if (startTime) {
      const duration = performance.now() - startTime;
      this.sceneTransitionTimes.delete(key);

      // 履歴に追加
      if (!this.sceneTransitionHistory.has(key)) {
        this.sceneTransitionHistory.set(key, []);
      }
      const history = this.sceneTransitionHistory.get(key)!;
      history.push(duration);
      if (history.length > 10) {
        history.shift();
      }

      console.log(`[PerformanceMonitor] Scene transition ${key}: ${duration.toFixed(2)}ms`);
      return duration;
    }

    return 0;
  }

  /**
   * シーン遷移の平均時間を取得
   */
  getAverageSceneTransitionTime(fromScene?: string, toScene?: string): number {
    if (fromScene && toScene) {
      const key = `${fromScene}->${toScene}`;
      const history = this.sceneTransitionHistory.get(key);
      if (history && history.length > 0) {
        return history.reduce((a, b) => a + b, 0) / history.length;
      }
      return 0;
    }

    // 全体平均
    let total = 0;
    let count = 0;
    this.sceneTransitionHistory.forEach((history) => {
      history.forEach((time) => {
        total += time;
        count++;
      });
    });
    return count > 0 ? total / count : 0;
  }

  /**
   * イベント処理時間計測を開始
   */
  startEventMeasure(eventName: string): void {
    if (!this.eventTimes.has(eventName)) {
      this.eventTimes.set(eventName, []);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.eventTimes.get(eventName) as any)._startTime = performance.now();
  }

  /**
   * イベント処理時間計測を終了
   */
  endEventMeasure(eventName: string): number {
    const times = this.eventTimes.get(eventName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (times && (times as any)._startTime) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const duration = performance.now() - (times as any)._startTime;
      times.push(duration);

      // 履歴を制限
      if (times.length > 100) {
        times.shift();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (times as any)._startTime;
      return duration;
    }
    return 0;
  }

  /**
   * イベント処理の平均時間を取得
   */
  getEventAverageTime(eventName: string): number {
    const times = this.eventTimes.get(eventName);
    if (!times || times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  /**
   * ボトルネックを特定
   */
  identifyBottlenecks(): BottleneckInfo[] {
    const bottlenecks: BottleneckInfo[] = [];
    const avgFps = this.getAverageFps();
    const minFps = this.getMinFps();
    const avgMemoryMB = this.getAverageMemory() / 1024 / 1024;
    const objectCount = this.scene.children?.length ?? 0;
    const avgSceneTransition = this.getAverageSceneTransitionTime();

    // FPS分析
    if (avgFps < this.thresholds.minFps) {
      bottlenecks.push({
        type: 'fps',
        severity: 'critical',
        description: `平均FPS (${avgFps.toFixed(1)}) が最低基準 (${this.thresholds.minFps}) を下回っています`,
        suggestion: 'オブジェクトプールの導入、不要なオブジェクトの削除を検討してください',
      });
    } else if (avgFps < this.thresholds.targetFps) {
      bottlenecks.push({
        type: 'fps',
        severity: 'warning',
        description: `平均FPS (${avgFps.toFixed(1)}) が目標値 (${this.thresholds.targetFps}) を下回っています`,
        suggestion: 'テクスチャアトラスの使用、描画最適化を検討してください',
      });
    }

    // 最小FPSがひどく低い場合
    if (minFps < 20 && avgFps >= this.thresholds.minFps) {
      bottlenecks.push({
        type: 'fps',
        severity: 'warning',
        description: `FPSが一時的に ${minFps.toFixed(1)} まで低下しています`,
        suggestion: 'GC(ガベージコレクション)の影響の可能性があります。オブジェクト生成を減らしてください',
      });
    }

    // メモリ分析
    if (avgMemoryMB > this.thresholds.maxMemoryLongTermMB) {
      bottlenecks.push({
        type: 'memory',
        severity: 'critical',
        description: `メモリ使用量 (${avgMemoryMB.toFixed(1)}MB) が上限 (${this.thresholds.maxMemoryLongTermMB}MB) を超えています`,
        suggestion: 'メモリリークの可能性があります。オブジェクトの破棄を確認してください',
      });
    } else if (avgMemoryMB > this.thresholds.maxMemoryMB) {
      bottlenecks.push({
        type: 'memory',
        severity: 'warning',
        description: `メモリ使用量 (${avgMemoryMB.toFixed(1)}MB) が推奨値 (${this.thresholds.maxMemoryMB}MB) を超えています`,
        suggestion: 'アセットの遅延読み込み、不要なリソースの解放を検討してください',
      });
    }

    // オブジェクト数分析
    if (objectCount > this.thresholds.maxObjectCount) {
      bottlenecks.push({
        type: 'objects',
        severity: 'warning',
        description: `オブジェクト数 (${objectCount}) が推奨上限 (${this.thresholds.maxObjectCount}) を超えています`,
        suggestion: 'オブジェクトプールの使用、画面外オブジェクトの非表示化を検討してください',
      });
    }

    // シーン遷移時間分析
    if (avgSceneTransition > this.thresholds.maxSceneTransitionMs) {
      bottlenecks.push({
        type: 'sceneTransition',
        severity: 'warning',
        description: `シーン遷移時間 (${avgSceneTransition.toFixed(0)}ms) が上限 (${this.thresholds.maxSceneTransitionMs}ms) を超えています`,
        suggestion: 'アセットのプリロード、シーン初期化の最適化を検討してください',
      });
    }

    return bottlenecks;
  }

  /**
   * パフォーマンスレポートを生成
   */
  generateReport(): PerformanceReport {
    const memory = this.getMemoryUsage();
    const objectCount = this.scene.children?.length ?? 0;

    const metrics: PerformanceMetrics = {
      fps: this.scene.game.loop.actualFps,
      memory,
      sceneTransitionTime: this.getAverageSceneTransitionTime(),
      eventProcessingTime: 0,
      renderTime: 0,
      updateTime: 0,
      objectCount,
    };

    const bottlenecks = this.identifyBottlenecks();
    const recommendations = bottlenecks.map((b) => b.suggestion);

    return {
      timestamp: Date.now(),
      metrics,
      averages: {
        fps: this.getAverageFps(),
        memory: this.getAverageMemory(),
        sceneTransition: this.getAverageSceneTransitionTime(),
      },
      recommendations,
      bottlenecks,
    };
  }

  /**
   * レポートをコンソールに出力
   */
  logReport(): void {
    const report = this.generateReport();

    console.group('%c[PerformanceMonitor] Performance Report', 'color: #00ff00; font-weight: bold');
    console.log('Timestamp:', new Date(report.timestamp).toLocaleString());
    console.log('Current FPS:', report.metrics.fps.toFixed(1));
    console.log('Average FPS:', report.averages.fps.toFixed(1));
    console.log('Min FPS:', this.getMinFps().toFixed(1));
    console.log(
      'Average Memory:',
      (report.averages.memory / 1024 / 1024).toFixed(1),
      'MB'
    );
    console.log('Object Count:', report.metrics.objectCount);
    console.log(
      'Avg Scene Transition:',
      report.averages.sceneTransition.toFixed(1),
      'ms'
    );

    if (report.bottlenecks.length > 0) {
      console.group('%cBottlenecks', 'color: #ff0000');
      report.bottlenecks.forEach((b) => {
        const color = b.severity === 'critical' ? '#ff0000' : '#ffff00';
        console.log(`%c[${b.severity.toUpperCase()}] ${b.type}`, `color: ${color}`);
        console.log('  Description:', b.description);
        console.log('  Suggestion:', b.suggestion);
      });
      console.groupEnd();
    } else {
      console.log('%cNo bottlenecks detected', 'color: #00ff00');
    }

    console.groupEnd();
  }

  /**
   * 計測データをリセット
   */
  reset(): void {
    this.fpsHistory = [];
    this.memoryHistory = [];
    this.sceneTransitionTimes.clear();
    this.sceneTransitionHistory.clear();
    this.eventTimes.clear();
    console.log('[PerformanceMonitor] Reset');
  }

  /**
   * 計測データをJSON形式でエクスポート
   */
  exportData(): string {
    const report = this.generateReport();
    return JSON.stringify(
      {
        report,
        fpsHistory: this.fpsHistory,
        memoryHistory: this.memoryHistory.map((m) => m / 1024 / 1024), // MB単位
        sceneTransitions: Object.fromEntries(this.sceneTransitionHistory),
        eventTimes: Object.fromEntries(this.eventTimes),
      },
      null,
      2
    );
  }

  /**
   * シーンを更新（別シーンで使用する場合）
   */
  setScene(scene: Phaser.Scene): void {
    this.destroyDebugUI();
    this.scene = scene;
    if (this.enabled && this.visible) {
      this.createDebugUI();
    }
  }
}
