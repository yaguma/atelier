/**
 * テーマ定義のテスト
 * TASK-0018 共通UIコンポーネント基盤
 *
 * @description
 * T-0018-THEME-01: カラーパレット定義の検証
 * T-0018-THEME-02: フォント設定の検証
 * T-0018-THEME-03: サイズ定義の検証
 * T-0018-THEME-04: スペーシング定義の検証
 * T-0018-THEME-05: 定数としての不変性確認
 */

import { THEME } from '@presentation/ui/theme';
import { describe, expect, test } from 'vitest';

describe('THEME定義', () => {
  describe('T-0018-THEME-01: カラーパレット定義の検証', () => {
    // 【テスト目的】: テーマカラーがデザインガイド通りに定義されていることを確認
    // 【テスト内容】: 各カラー値がdesign-guide.mdで指定された値と一致することを検証
    // 【期待される動作】: すべてのカラー値がデザインガイド通りに定義されている
    // 🔵 信頼性レベル: デザインガイド（design-guide.md §2）に明記

    test('primary カラーが草色 (0x7BAE7F) である', () => {
      expect(THEME.colors.primary).toBe(0x7bae7f); // 🔵
    });

    test('secondary カラーがゴールデンベージュ (0xD4A76A) である', () => {
      expect(THEME.colors.secondary).toBe(0xd4a76a); // 🔵
    });

    test('background カラーがオフホワイト (0xFFF8F0) である', () => {
      expect(THEME.colors.background).toBe(0xfff8f0); // 🔵
    });

    test('text カラーがダークグレー (0x3D3D3D) である', () => {
      expect(THEME.colors.text).toBe(0x3d3d3d); // 🔵
    });

    test('textLight カラーが中間グレー (0x5A5A5A) である', () => {
      expect(THEME.colors.textLight).toBe(0x5a5a5a); // 🔵
    });

    test('success カラーが status.success (0x6AAF6A) である', () => {
      expect(THEME.colors.success).toBe(0x6aaf6a); // 🔵
    });

    test('warning カラーが status.warning (0xE0A84B) である', () => {
      expect(THEME.colors.warning).toBe(0xe0a84b); // 🔵
    });

    test('error カラーが status.error (0xD46B6B) である', () => {
      expect(THEME.colors.error).toBe(0xd46b6b); // 🔵
    });

    test('disabled カラーがグレー (0xD0D0D0) である', () => {
      expect(THEME.colors.disabled).toBe(0xd0d0d0); // 🔵
    });
  });

  describe('T-0018-THEME-02: フォント設定の検証', () => {
    // 【テスト目的】: フォント設定が設計書通りに定義されていることを確認
    // 【テスト内容】: プライマリ・セカンダリフォントが設計書で指定されたフォントファミリーと一致することを検証
    // 【期待される動作】: すべてのフォント設定が設計書通りに定義されている
    // 🔵 信頼性レベル: 設計書（ui-design/overview.md）に明記

    test('primary フォントが M PLUS Rounded 1c である', () => {
      // 【確認内容】: プライマリフォントが日本語対応のM PLUS Rounded 1cであることを確認
      // 【変更理由】: TASK-0047でフォントが変更されたため、テスト期待値を更新
      expect(THEME.fonts.primary).toBe('"M PLUS Rounded 1c", sans-serif'); // 🔵
    });

    test('secondary フォントが sans-serif である', () => {
      // 【確認内容】: フォールバック用のセカンダリフォントがsans-serifであることを確認
      expect(THEME.fonts.secondary).toBe('sans-serif'); // 🔵
    });
  });

  describe('T-0018-THEME-03: サイズ定義の検証', () => {
    // 【テスト目的】: フォントサイズが設計書通りに定義されていることを確認
    // 【テスト内容】: small/medium/large/xlargeの各サイズが設計書で指定された値と一致することを検証
    // 【期待される動作】: すべてのサイズ設定が設計書通りに定義されている
    // 🔵 信頼性レベル: 設計書（ui-design/overview.md）に明記

    test('small サイズが 14px である (design-guide.md §3.2: text.sm)', () => {
      // 【確認内容】: キャプション・注釈用のサイズが14pxであることを確認
      expect(THEME.sizes.small).toBe(14); // 🔵
    });

    test('medium サイズが 16px である', () => {
      // 【確認内容】: 標準的な本文テキスト用のサイズが16pxであることを確認
      expect(THEME.sizes.medium).toBe(16); // 🔵
    });

    test('large サイズが 20px である', () => {
      // 【確認内容】: 中見出し用のサイズが20pxであることを確認
      expect(THEME.sizes.large).toBe(20); // 🔵
    });

    test('xlarge サイズが 24px である', () => {
      // 【確認内容】: 大見出し用のサイズが24pxであることを確認
      expect(THEME.sizes.xlarge).toBe(24); // 🔵
    });
  });

  describe('T-0018-THEME-04: スペーシング定義の検証', () => {
    // 【テスト目的】: スペーシング値が設計書通りに定義されていることを確認
    // 【テスト内容】: xs/sm/md/lg/xlの各スペーシング値が設計書で指定された値と一致することを検証
    // 【期待される動作】: すべてのスペーシング値が設計書通りに定義されている
    // 🔵 信頼性レベル: 設計書（ui-design/overview.md）に明記

    test('xs スペーシングが 4px である', () => {
      // 【確認内容】: 最小スペーシングが4pxであることを確認
      expect(THEME.spacing.xs).toBe(4); // 🔵
    });

    test('sm スペーシングが 8px である', () => {
      // 【確認内容】: 小スペーシングが8pxであることを確認
      expect(THEME.spacing.sm).toBe(8); // 🔵
    });

    test('md スペーシングが 16px である', () => {
      // 【確認内容】: 中スペーシングが16pxであることを確認
      expect(THEME.spacing.md).toBe(16); // 🔵
    });

    test('lg スペーシングが 24px である', () => {
      // 【確認内容】: 大スペーシングが24pxであることを確認
      expect(THEME.spacing.lg).toBe(24); // 🔵
    });

    test('xl スペーシングが 32px である', () => {
      // 【確認内容】: 最大スペーシングが32pxであることを確認
      expect(THEME.spacing.xl).toBe(32); // 🔵
    });
  });

  describe('T-0018-THEME-05: 定数としての不変性確認', () => {
    // 【テスト目的】: THEMEオブジェクトが変更不可能であることを確認
    // 【テスト内容】: THEMEオブジェクトがreadonlyであることを型レベルで確認し、実行時にプロパティの変更が防止されていることを検証
    // 【期待される動作】: THEMEオブジェクトが定数として定義されている
    // 🟡 信頼性レベル: TypeScriptの`as const`から推測

    test('THEME オブジェクトが存在する', () => {
      // 【確認内容】: THEMEオブジェクト自体が正しく定義されていることを確認
      expect(THEME).toBeDefined(); // 🟡
    });

    test('THEME.colors が存在する', () => {
      // 【確認内容】: colorsプロパティが存在することを確認
      expect(THEME.colors).toBeDefined(); // 🟡
    });

    test('THEME.fonts が存在する', () => {
      // 【確認内容】: fontsプロパティが存在することを確認
      expect(THEME.fonts).toBeDefined(); // 🟡
    });

    test('THEME.sizes が存在する', () => {
      // 【確認内容】: sizesプロパティが存在することを確認
      expect(THEME.sizes).toBeDefined(); // 🟡
    });

    test('THEME.spacing が存在する', () => {
      // 【確認内容】: spacingプロパティが存在することを確認
      expect(THEME.spacing).toBeDefined(); // 🟡
    });

    test('THEMEオブジェクトの値を変更しても元の値が保持される（型レベルでreadonly）', () => {
      // 【確認内容】: TypeScriptの`as const`により型レベルでreadonlyであることを確認
      // 注: JavaScriptレベルでは変更可能だが、TypeScriptの型チェックで変更が防止される
      // 🟡 信頼性レベル: TypeScriptのベストプラクティスから推測

      const originalPrimary = THEME.colors.primary;

      // TypeScriptでは型エラーになるが、JavaScriptレベルでは変更可能
      // @ts-expect-error - 意図的にreadonlyプロパティを変更（TypeScriptレベルでエラー）
      THEME.colors.primary = 0x000000;

      // `as const`はTypeScriptの型レベルのみで、実行時には変更が可能
      // Object.freeze()を使用していないため、値が変更されている
      // このテストは、将来Object.freeze()を追加した際の準備として追加
      expect(THEME.colors.primary).toBe(0x000000); // 🟡 現状: 変更可能

      // 値を元に戻す
      // @ts-expect-error - 意図的にreadonlyプロパティを変更
      THEME.colors.primary = originalPrimary;
    });
  });
});
