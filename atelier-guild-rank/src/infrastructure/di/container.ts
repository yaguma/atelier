/**
 * container.ts - DIコンテナ実装
 *
 * TASK-0028: サービス統合・DI設定
 * シングルトンパターンでサービスを一元管理する
 */

import { ApplicationError, ErrorCodes } from '@shared/types';

/**
 * 【機能概要】: DIコンテナ実装
 * 【実装方針】: Singleton PatternでDIコンテナを実装
 * 【責務】: サービスの登録・解決を担当
 * 🟡 信頼性レベル: 設計文書から妥当な推測
 *
 * @example
 * ```typescript
 * const container = Container.getInstance();
 * container.register(ServiceKeys.EventBus, eventBus);
 * const eventBus = container.resolve<IEventBus>(ServiceKeys.EventBus);
 * ```
 */
export class Container {
  /** シングルトンインスタンス */
  private static instance: Container;

  /** サービスマップ */
  private services: Map<string, unknown> = new Map();

  /**
   * 【機能概要】: プライベートコンストラクタ
   * 【実装方針】: Singletonパターンのため外部からのインスタンス化を禁止
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   */
  private constructor() {
    // シングルトンパターンのため、コンストラクタはprivate
  }

  /**
   * 【機能概要】: シングルトンインスタンスを取得する
   * 【実装方針】: 初回呼び出し時にインスタンスを生成、2回目以降はキャッシュを返す
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   *
   * @returns Containerインスタンス
   */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * 【機能概要】: サービスを登録する
   * 【実装方針】: キーとサービスインスタンスを紐付けて保存
   * 【入力値検証】: 同一キーでの重複登録を防止
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   *
   * @param key サービスキー
   * @param service サービスインスタンス
   * @throws 同一キーで既に登録済みの場合
   */
  register<T>(key: string, service: T): void {
    if (this.services.has(key)) {
      throw new ApplicationError(
        ErrorCodes.INVALID_OPERATION,
        `Service already registered: ${key}`,
      );
    }

    this.services.set(key, service);
  }

  /**
   * 【機能概要】: サービスを解決する
   * 【実装方針】: キーからサービスインスタンスを取得
   * 【エラーハンドリング】: 未登録のサービスキーの場合はエラー
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   *
   * @param key サービスキー
   * @returns サービスインスタンス
   * @throws サービスが見つからない場合
   */
  resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new ApplicationError(ErrorCodes.SERVICE_NOT_FOUND, `Service not found: ${key}`);
    }
    return service as T;
  }

  /**
   * 【機能概要】: サービスが登録されているか確認する
   * 【実装方針】: キーの存在チェック
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   *
   * @param key サービスキー
   * @returns 登録されている場合true
   */
  has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * 【機能概要】: 全てのサービスをクリアする（テスト用）
   * 【実装方針】: サービスマップを初期化
   * 【用途】: 主にテスト時のクリーンアップ
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   */
  clear(): void {
    this.services.clear();
  }

  /**
   * 【機能概要】: シングルトンインスタンスをリセットする（テスト用）
   * 【実装方針】: インスタンスを削除し、次回getInstance()時に新規作成される
   * 【用途】: 主にテスト時の状態リセット
   * 🟡 信頼性レベル: 設計文書から妥当な推測
   */
  static reset(): void {
    if (Container.instance) {
      Container.instance.clear();
      Container.instance = undefined as unknown as Container;
    }
  }
}

/**
 * 【機能概要】: サービスキー定数
 * 【実装方針】: 文字列リテラルではなく定数で管理し、タイポを防止
 * 【保守性】: リファクタリング時の変更箇所を最小化
 * 🔵 信頼性レベル: 設計文書に記載
 */
export const ServiceKeys = {
  EventBus: 'EventBus',
  StateManager: 'StateManager',
  MasterDataRepository: 'MasterDataRepository',
  SaveDataRepository: 'SaveDataRepository',
  DeckService: 'DeckService',
  MaterialService: 'MaterialService',
  GatheringService: 'GatheringService',
  AlchemyService: 'AlchemyService',
  QuestService: 'QuestService',
  InventoryService: 'InventoryService',
  ShopService: 'ShopService',
  ArtifactService: 'ArtifactService',
  RankService: 'RankService',
  GameFlowManager: 'GameFlowManager',
  ContributionCalculator: 'ContributionCalculator',
} as const;

/**
 * 【機能概要】: サービスキーの型
 * 【実装方針】: ServiceKeysの値を型として使用
 * 🟡 信頼性レベル: 設計文書から妥当な推測
 */
export type ServiceKey = (typeof ServiceKeys)[keyof typeof ServiceKeys];
