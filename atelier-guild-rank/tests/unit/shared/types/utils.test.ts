/**
 * utils.ts テストケース
 * ユーティリティ型の型安全性テスト
 *
 * @description
 * TC-UTIL-001 〜 TC-UTIL-013 を実装
 */

// 型インポート（TDD Red: これらの型はまだ存在しない）
import type { DeepReadonly, NonNullableFields, RequiredFields } from '@shared/types';
import { describe, expect, it } from 'vitest';

// =============================================================================
// 11.1 DeepReadonly<T>型
// =============================================================================

describe('utils.ts', () => {
  describe('DeepReadonly<T>型', () => {
    // TC-UTIL-001
    it('DeepReadonly型がインポート可能', () => {
      type TestType = DeepReadonly<{ a: string }>;
      const obj: TestType = { a: 'test' };
      expect(obj).toBeDefined();
    });

    // TC-UTIL-002
    it('DeepReadonly<{a: string}>の.aが変更不可（型レベル）', () => {
      type TestType = DeepReadonly<{ a: string }>;
      const obj: TestType = { a: 'test' };
      // @ts-expect-error - 読み取り専用プロパティへの代入で型エラー
      obj.a = 'modified';
      // 注: TypeScriptの型チェックはコンパイル時のみ。実行時は変更される
      expect(obj.a).toBe('modified');
    });

    // TC-UTIL-003
    it('DeepReadonly<{nested: {b: number}}>の.nested.bが変更不可（型レベル）', () => {
      type TestType = DeepReadonly<{ nested: { b: number } }>;
      const obj: TestType = { nested: { b: 42 } };
      // @ts-expect-error - ネストされた読み取り専用プロパティへの代入で型エラー
      obj.nested.b = 100;
      // 注: TypeScriptの型チェックはコンパイル時のみ。実行時は変更される
      expect(obj.nested.b).toBe(100);
    });

    // TC-UTIL-004
    it('DeepReadonly<{arr: string[]}>の配列操作が不可（型レベル）', () => {
      type TestType = DeepReadonly<{ arr: string[] }>;
      const obj: TestType = { arr: ['a', 'b'] };
      // @ts-expect-error - 読み取り専用配列への操作で型エラー
      obj.arr.push('c');
      // 注: TypeScriptの型チェックはコンパイル時のみ。実行時は変更される
      expect(obj.arr.length).toBe(3);
    });

    // TC-UTIL-005
    it('DeepReadonlyのネストされたオブジェクトも読み取り専用（型レベル）', () => {
      type TestType = DeepReadonly<{ level1: { level2: { level3: string } } }>;
      const obj: TestType = { level1: { level2: { level3: 'deep' } } };
      // @ts-expect-error - 深いネストへの代入で型エラー
      obj.level1.level2.level3 = 'modified';
      // 注: TypeScriptの型チェックはコンパイル時のみ。実行時は変更される
      expect(obj.level1.level2.level3).toBe('modified');
    });
  });

  // =============================================================================
  // 11.2 RequiredFields<T, K>型
  // =============================================================================

  describe('RequiredFields<T, K>型', () => {
    // TC-UTIL-006
    it('RequiredFields型がインポート可能', () => {
      type TestType = RequiredFields<{ a?: string; b?: number }, 'a'>;
      const obj: TestType = { a: 'required' };
      expect(obj).toBeDefined();
    });

    // TC-UTIL-007
    it("RequiredFields<{a?: string, b?: number}, 'a'>の.aが必須になる", () => {
      type TestType = RequiredFields<{ a?: string; b?: number }, 'a'>;
      // @ts-expect-error - 必須プロパティaが欠如で型エラー
      const invalid: TestType = { b: 42 };
      expect(invalid).toBeDefined();
    });

    // TC-UTIL-008
    it("RequiredFields<{a?: string, b?: number}, 'a'>の.bはオプショナルのまま", () => {
      type TestType = RequiredFields<{ a?: string; b?: number }, 'a'>;
      const withB: TestType = { a: 'required', b: 42 };
      const withoutB: TestType = { a: 'required' };
      expect(withB.b).toBe(42);
      expect(withoutB.b).toBeUndefined();
    });

    // TC-UTIL-009
    it('複数キー指定で複数フィールドが必須になる', () => {
      type TestType = RequiredFields<{ a?: string; b?: number; c?: boolean }, 'a' | 'b'>;
      const valid: TestType = { a: 'required', b: 42 };
      expect(valid.a).toBe('required');
      expect(valid.b).toBe(42);
    });
  });

  // =============================================================================
  // 11.3 NonNullableFields<T>型
  // =============================================================================

  describe('NonNullableFields<T>型', () => {
    // TC-UTIL-010
    it('NonNullableFields型がインポート可能', () => {
      type TestType = NonNullableFields<{ a: string | null }>;
      const obj: TestType = { a: 'not-null' };
      expect(obj).toBeDefined();
    });

    // TC-UTIL-011
    it('NonNullableFields<{a: string | null}>の.aがnull不可', () => {
      type TestType = NonNullableFields<{ a: string | null }>;
      // @ts-expect-error - nullは代入不可
      const invalid: TestType = { a: null };
      expect(invalid).toBeDefined();
    });

    // TC-UTIL-012
    it('NonNullableFields<{a: string | undefined}>の.aがundefined不可', () => {
      type TestType = NonNullableFields<{ a: string | undefined }>;
      // @ts-expect-error - undefinedは代入不可
      const invalid: TestType = { a: undefined };
      expect(invalid).toBeDefined();
    });

    // TC-UTIL-013
    it('全フィールドからnull|undefinedが除外される', () => {
      type TestType = NonNullableFields<{
        a: string | null;
        b: number | undefined;
        c: boolean | null | undefined;
      }>;
      // @ts-expect-error - 全フィールドでnull/undefined代入不可
      const invalid: TestType = { a: null, b: undefined, c: null };
      expect(invalid).toBeDefined();
    });
  });
});
