/**
 * setup.test.ts - サービス統合テスト
 *
 * TASK-0028: サービス統合・DI設定
 * Container単体テストのみ実施（マスターデータのロードは実際のファイルを使用）
 */

import { Container, resetServices } from '@infrastructure/di';
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
});
