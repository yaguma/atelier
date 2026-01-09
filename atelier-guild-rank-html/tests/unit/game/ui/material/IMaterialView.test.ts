/**
 * IMaterialViewインターフェーステスト
 *
 * IMaterialViewインターフェースの型定義テスト
 */

import { describe, it, expect } from 'vitest';
import type { IMaterialView, MaterialViewOptions } from '../../../../../src/game/ui/material/IMaterialView';
import type { MaterialViewMode } from '../../../../../src/game/ui/material/MaterialConstants';
import { Material } from '../../../../../src/domain/material/MaterialEntity';
import { Quality, Attribute } from '../../../../../src/domain/common/types';

// テスト用の素材データ
const createTestMaterial = (): Material => {
  return new Material({
    id: 'mat-test-001',
    name: 'テスト素材',
    baseQuality: Quality.C,
    attributes: [Attribute.GRASS],
    isRare: false,
    description: 'テスト用の素材',
  });
};

describe('IMaterialView インターフェース', () => {
  describe('MaterialViewOptions', () => {
    it('必須オプションのみで作成できる', () => {
      const material = createTestMaterial();
      const options: MaterialViewOptions = {
        x: 100,
        y: 200,
        material,
      };

      expect(options.x).toBe(100);
      expect(options.y).toBe(200);
      expect(options.material).toBe(material);
    });

    it('オプショナルパラメータを含めて作成できる', () => {
      const material = createTestMaterial();
      const onClick = () => {};
      const onHover = () => {};

      const options: MaterialViewOptions = {
        x: 100,
        y: 200,
        material,
        mode: 'detail',
        count: 5,
        showQuality: true,
        interactive: true,
        onClick,
        onHover,
      };

      expect(options.mode).toBe('detail');
      expect(options.count).toBe(5);
      expect(options.showQuality).toBe(true);
      expect(options.interactive).toBe(true);
      expect(options.onClick).toBe(onClick);
      expect(options.onHover).toBe(onHover);
    });

    it('modeにcompactを指定できる', () => {
      const material = createTestMaterial();
      const options: MaterialViewOptions = {
        x: 0,
        y: 0,
        material,
        mode: 'compact',
      };

      expect(options.mode).toBe('compact');
    });

    it('modeにdetailを指定できる', () => {
      const material = createTestMaterial();
      const options: MaterialViewOptions = {
        x: 0,
        y: 0,
        material,
        mode: 'detail',
      };

      expect(options.mode).toBe('detail');
    });

    it('instanceを指定できる', () => {
      const material = createTestMaterial();
      const options: MaterialViewOptions = {
        x: 0,
        y: 0,
        material,
        instance: {
          materialId: 'mat-test-001',
          quality: Quality.A,
          quantity: 10,
        },
      };

      expect(options.instance?.quality).toBe(Quality.A);
      expect(options.instance?.quantity).toBe(10);
    });
  });

  describe('IMaterialView', () => {
    it('インターフェースが正しく定義されている（型チェック）', () => {
      // 型チェックのみ - 実際のモック実装
      const mockView: IMaterialView = {
        container: {} as any,
        material: createTestMaterial(),
        setCount: () => {},
        setSelected: () => {},
        setEnabled: () => {},
        setPosition: () => {},
        setVisible: () => {},
        setAlpha: () => {},
        setInteractive: () => {},
        destroy: () => {},
      };

      expect(mockView).toBeDefined();
      expect(typeof mockView.setCount).toBe('function');
      expect(typeof mockView.setSelected).toBe('function');
      expect(typeof mockView.setEnabled).toBe('function');
      expect(typeof mockView.setPosition).toBe('function');
      expect(typeof mockView.setVisible).toBe('function');
      expect(typeof mockView.setAlpha).toBe('function');
      expect(typeof mockView.setInteractive).toBe('function');
      expect(typeof mockView.destroy).toBe('function');
    });

    it('containerが読み取り専用であること', () => {
      const mockView: IMaterialView = {
        container: {} as any,
        material: createTestMaterial(),
        setCount: () => {},
        setSelected: () => {},
        setEnabled: () => {},
        setPosition: () => {},
        setVisible: () => {},
        setAlpha: () => {},
        setInteractive: () => {},
        destroy: () => {},
      };

      // containerはreadonlyなので代入できないことを型で保証
      // (container = {} は TypeScript エラーになる)
      expect(mockView.container).toBeDefined();
    });

    it('materialが読み取り専用であること', () => {
      const material = createTestMaterial();
      const mockView: IMaterialView = {
        container: {} as any,
        material,
        setCount: () => {},
        setSelected: () => {},
        setEnabled: () => {},
        setPosition: () => {},
        setVisible: () => {},
        setAlpha: () => {},
        setInteractive: () => {},
        destroy: () => {},
      };

      expect(mockView.material).toBe(material);
    });
  });
});
