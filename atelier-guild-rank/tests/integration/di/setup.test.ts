/**
 * setup.test.ts - サービス統合テスト
 *
 * TASK-0028: サービス統合・DI設定
 * Container単体テスト＋統合テスト（T-0028-01〜04）
 */

import type { IDeckService } from '@domain/interfaces/deck-service.interface';
import { Container, initializeServices, resetServices, ServiceKeys } from '@shared/services/di';
import type { IEventBus } from '@shared/services/event-bus';
import type { IMasterDataRepository } from '@shared/services/repositories/master-data-repository';
import type { IStateManager } from '@shared/services/state-manager';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('DI Container - サービス統合テスト', () => {
  beforeEach(() => {
    // 各テストの前にDIコンテナをリセット
    resetServices();
  });

  afterEach(() => {
    // 各テストの後にDIコンテナをリセット
    resetServices();
  });

  // =============================================================================
  // Container単体テスト
  // =============================================================================

  describe('Container単体テスト', () => {
    it('サービスを登録・解決できる', () => {
      const container = Container.getInstance();
      const testService = { name: 'TestService' };

      container.register('TestService', testService);
      const resolved = container.resolve<typeof testService>('TestService');

      expect(resolved).toBe(testService);
    });

    it('重複登録でエラーを投げる', () => {
      const container = Container.getInstance();
      const testService = { name: 'TestService' };

      container.register('TestService', testService);

      expect(() => container.register('TestService', testService)).toThrow(
        'Service already registered',
      );
    });

    it('has()でサービスの存在を確認できる', () => {
      const container = Container.getInstance();
      const testService = { name: 'TestService' };

      expect(container.has('TestService')).toBe(false);

      container.register('TestService', testService);

      expect(container.has('TestService')).toBe(true);
    });

    it('clear()で全サービスをクリアできる', () => {
      const container = Container.getInstance();
      const testService = { name: 'TestService' };

      container.register('TestService', testService);
      expect(container.has('TestService')).toBe(true);

      container.clear();
      expect(container.has('TestService')).toBe(false);
    });

    it('reset()でシングルトンインスタンスをリセットできる', () => {
      const container1 = Container.getInstance();
      const testService = { name: 'TestService' };

      container1.register('TestService', testService);

      Container.reset();

      const container2 = Container.getInstance();
      expect(container2.has('TestService')).toBe(false);
    });
  });

  // =============================================================================
  // 統合テスト（TASK-0028テストケース）
  // =============================================================================

  describe('統合テスト - TASK-0028', () => {
    /**
     * T-0028-01: サービス初期化 - 全サービス利用可能
     * 【期待結果】: initializeServices()後、全サービスキーに対してhas()がtrueを返す
     */
    it('T-0028-01: サービス初期化 - 全サービス利用可能', async () => {
      // テスト環境用のパス設定
      const config = {
        masterDataBasePath: 'public/assets/data/master',
      };

      const container = await initializeServices(config);

      // 全サービスキーに対してhas()を確認
      const allServiceKeys = Object.values(ServiceKeys);
      for (const key of allServiceKeys) {
        expect(container.has(key), `Service key "${key}" should be registered`).toBe(true);
      }

      // 登録サービス数の確認
      expect(allServiceKeys.length).toBeGreaterThan(0);
    });

    /**
     * T-0028-02: 依存関係解決 - 正しいインスタンス取得
     * 【期待結果】: resolve()で各サービスの正しいインスタンスが取得できる
     */
    it('T-0028-02: 依存関係解決 - 正しいインスタンス取得', async () => {
      // テスト環境用のパス設定
      const config = {
        masterDataBasePath: 'public/assets/data/master',
      };

      const container = await initializeServices(config);

      // EventBus取得
      const eventBus = container.resolve<IEventBus>(ServiceKeys.EventBus);
      expect(eventBus).toBeDefined();
      expect(typeof eventBus.emit).toBe('function');
      expect(typeof eventBus.on).toBe('function');

      // StateManager取得
      const stateManager = container.resolve<IStateManager>(ServiceKeys.StateManager);
      expect(stateManager).toBeDefined();
      expect(typeof stateManager.getState).toBe('function');

      // MasterDataRepository取得
      const masterDataRepo = container.resolve<IMasterDataRepository>(
        ServiceKeys.MasterDataRepository,
      );
      expect(masterDataRepo).toBeDefined();

      // DeckService取得
      const deckService = container.resolve<IDeckService>(ServiceKeys.DeckService);
      expect(deckService).toBeDefined();
      expect(typeof deckService.draw).toBe('function');
      expect(typeof deckService.shuffle).toBe('function');

      // 他のサービスも同様に取得できることを確認（抜粋）
      expect(container.resolve(ServiceKeys.MaterialService)).toBeDefined();
      expect(container.resolve(ServiceKeys.GatheringService)).toBeDefined();
      expect(container.resolve(ServiceKeys.AlchemyService)).toBeDefined();
      expect(container.resolve(ServiceKeys.QuestService)).toBeDefined();
      expect(container.resolve(ServiceKeys.InventoryService)).toBeDefined();
      expect(container.resolve(ServiceKeys.ShopService)).toBeDefined();
      expect(container.resolve(ServiceKeys.ArtifactService)).toBeDefined();
      expect(container.resolve(ServiceKeys.RankService)).toBeDefined();
    });

    /**
     * T-0028-03: マスターデータエラー - リトライ動作
     * 【期待結果】: マスターデータ読み込み失敗時にリトライし、最終的にエラーを投げる
     * 【注意】: このテストは実際のマスターデータファイルが存在する場合は失敗するため、
     *          存在しないパスを指定してエラーを再現する
     */
    it('T-0028-03: マスターデータエラー - リトライ動作', async () => {
      // 存在しないマスターデータパスを指定
      const config = {
        masterDataBasePath: '/invalid/path/to/master',
        maxRetries: 2,
        retryDelayMs: 10, // テスト高速化のため短縮
      };

      // エラーが発生することを確認
      await expect(initializeServices(config)).rejects.toThrow();

      // 初期化失敗後、コンテナはクリアされている
      const container = Container.getInstance();
      expect(container.has(ServiceKeys.EventBus)).toBe(false);
    });

    /**
     * T-0028-04: シーンからのアクセス - サービス取得可能
     * 【期待結果】: initializeServices()後、どこからでもContainer経由でサービスにアクセスできる
     * 【実装方針】: シミュレーション関数を作成し、シーンからのアクセスを模擬
     */
    it('T-0028-04: シーンからのアクセス - サービス取得可能', async () => {
      // テスト環境用のパス設定
      const config = {
        masterDataBasePath: 'public/assets/data/master',
      };

      // サービス初期化
      await initializeServices(config);

      // シーンからのアクセスを模擬する関数
      const simulateSceneAccess = () => {
        const container = Container.getInstance();

        // シーンでよく使うサービスを取得
        const eventBus = container.resolve<IEventBus>(ServiceKeys.EventBus);
        const stateManager = container.resolve<IStateManager>(ServiceKeys.StateManager);
        const deckService = container.resolve<IDeckService>(ServiceKeys.DeckService);

        return { eventBus, stateManager, deckService };
      };

      // シーンからのアクセスが成功することを確認
      const services = simulateSceneAccess();
      expect(services.eventBus).toBeDefined();
      expect(services.stateManager).toBeDefined();
      expect(services.deckService).toBeDefined();

      // 同じインスタンスが取得できることを確認（Singleton）
      const services2 = simulateSceneAccess();
      expect(services.eventBus).toBe(services2.eventBus);
      expect(services.stateManager).toBe(services2.stateManager);
      expect(services.deckService).toBe(services2.deckService);
    });
  });
});
