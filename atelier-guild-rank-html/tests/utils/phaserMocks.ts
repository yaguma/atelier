/**
 * Phaserモック
 *
 * 【目的】: テスト環境でPhaserを使用できるようにモック化
 * 【理由】: jsdom環境ではPhaserのCanvas APIが動作しないため
 * 【信頼性】: 🔵 設計文書に基づく実装
 */

import { vi } from 'vitest';

/**
 * MockSceneクラス
 *
 * 【機能】: Phaser.Sceneのモック実装
 * 【実装内容】: イベントエミッター機能を提供
 * 【メモリ管理】: リスナーのMap管理で購読解除を確実にする
 */
class MockScene {
  events: any;

  constructor() {
    // 【リスナー管理】: イベント名をキーとして、コールバック関数のSetを値とするMap
    // 【設計方針】: 同じイベントに複数のリスナーを登録できるようにSetを使用
    const listeners = new Map<string, Set<(...args: any[]) => void>>();

    this.events = {
      // 【emit】: イベントを発火し、登録されたすべてのリスナーを実行
      // 【引数】: event - イベント名、args - イベントのペイロード
      emit: vi.fn((event: string, ...args: any[]) => {
        const eventListeners = listeners.get(event);
        if (eventListeners) {
          eventListeners.forEach((callback) => callback(...args));
        }
      }),

      // 【on】: イベントリスナーを登録
      // 【引数】: event - イベント名、callback - コールバック関数
      on: vi.fn((event: string, callback: (...args: any[]) => void) => {
        if (!listeners.has(event)) {
          listeners.set(event, new Set());
        }
        listeners.get(event)!.add(callback);
      }),

      // 【once】: 一度だけ実行されるイベントリスナーを登録
      // 【実装方針】: ラッパー関数を作成し、実行後に自動的に購読解除
      once: vi.fn((event: string, callback: (...args: any[]) => void) => {
        const wrapper = (...args: any[]) => {
          callback(...args);
          listeners.get(event)?.delete(wrapper);
        };
        if (!listeners.has(event)) {
          listeners.set(event, new Set());
        }
        listeners.get(event)!.add(wrapper);
      }),

      // 【off】: イベントリスナーを解除
      // 【引数】: event - イベント名、callback - 解除するコールバック（省略時は全解除）
      off: vi.fn((event: string, callback?: (...args: any[]) => void) => {
        if (callback) {
          listeners.get(event)?.delete(callback);
        } else {
          listeners.get(event)?.clear();
        }
      }),
    };
  }
}

/**
 * Phaserモック
 *
 * 【エクスポート内容】: Phaser.Game、Phaser.Scene、Phaser.GameObjectsのモック
 * 【使用方法】: vi.mock('phaser', () => getPhaserMock())
 */
export function getPhaserMock() {
  return {
    default: {
      // 【HEADLESS定数】: ヘッドレスモード（UIレンダリングなし）
      HEADLESS: 'HEADLESS',

      // 【Game】: Phaserゲームインスタンスのモック
      Game: class {
        scene: any;
        registry: any;
        destroy = vi.fn();
        private sceneInstances: Map<string, MockScene>;

        constructor() {
          // 【シーンインスタンスキャッシュ】: 同じシーンキーで常に同じインスタンスを返す
          // 【設計方針】: シーンごとにイベントリスナーを独立管理
          this.sceneInstances = new Map();

          // 【scene】: シーン管理API
          this.scene = {
            // 【isActive】: シーンがアクティブかどうかを判定
            // 【初期値】: false（後でSceneManagerモックが上書き）
            isActive: vi.fn().mockReturnValue(false),

            // 【getScene】: シーンインスタンスを取得
            // 【キャッシュ戦略】: 初回アクセス時に作成し、以降は同じインスタンスを返す
            getScene: vi.fn((sceneKey: string) => {
              if (!this.sceneInstances.has(sceneKey)) {
                this.sceneInstances.set(sceneKey, new MockScene());
              }
              return this.sceneInstances.get(sceneKey);
            }),

            // 【start/stop/launch】: シーン操作メソッド
            // 【実装】: モックなので何もしない（呼び出し記録のみ）
            start: vi.fn(),
            stop: vi.fn(),
            launch: vi.fn(),
          };

          // 【registry】: ゲーム全体で共有するデータストア
          // 【実装方針】: Mapの機能を拡張して、_dataオブジェクトでデータを保持
          this.registry = new Map();
          this.registry.get = vi.fn((key: string) => {
            return this.registry._data?.[key];
          });
          this.registry.set = vi.fn((key: string, value: any) => {
            if (!this.registry._data) {
              this.registry._data = {};
            }
            this.registry._data[key] = value;
          });
          this.registry._data = {};
        }
      },

      // 【Scene】: Phaser.Sceneのモック
      Scene: MockScene,

      // 【GameObjects】: Phaser.GameObjectsのモック
      GameObjects: {
        // 【Container】: コンテナオブジェクトのモック
        // 【メソッドチェーン】: メソッドがthisを返してチェーン可能にする
        Container: class {
          add = vi.fn().mockReturnThis();
          setAlpha = vi.fn().mockReturnThis();
          destroy = vi.fn();
        },
      },
    },
  };
}

/**
 * MockSceneのエクスポート
 *
 * 【用途】: テストコードでMockSceneの型を使用する場合
 */
export { MockScene };
