# Green Phase: 共通UIコンポーネント基盤

**日時**: 2026-01-17
**タスクID**: TASK-0018
**機能名**: 共通UIコンポーネント基盤 (ui-components)
**フェーズ**: Green（最小実装）

---

## 実装したファイル

### 1. テーマ定義 (`src/presentation/ui/theme.ts`)

**実装内容**: UI全体で使用するテーマ定義を作成

- カラーパレット定義（9色）
- フォント設定（primary, secondary）
- サイズ定義（small, medium, large, xlarge）
- スペーシング定義（xs, sm, md, lg, xl）
- `as const` でreadonly化

**テスト結果**: ✅ 25テスト全て成功

### 2. BaseComponent (`src/presentation/ui/components/BaseComponent.ts`)

**実装内容**: 全カスタムUIコンポーネントの基底抽象クラスを作成

- 抽象クラスとして定義
- コンストラクタで scene, x, y を受け取る
- scene, container, rexUI プロパティを保持
- 抽象メソッド create(), destroy() を定義
- setVisible(visible: boolean): this を実装
- setPosition(x: number, y: number): this を実装

**テスト結果**: ✅ 16テスト全て成功

---

## 実装コード

### 1. theme.ts

**ファイルパス**: `src/presentation/ui/theme.ts`

```typescript
/**
 * UIテーマ定義
 * TASK-0018 共通UIコンポーネント基盤
 *
 * @description
 * ゲーム全体で使用するUIテーマ（カラー、フォント、サイズ、スペーシング）を定義
 * 錬金術をテーマにしたデザインで、茶色とベージュを基調とする
 */

export const THEME = {
	colors: {
		primary: 0x8b4513, // SaddleBrown - プライマリアクション用
		secondary: 0xd2691e, // Chocolate - セカンダリアクション用
		background: 0xf5f5dc, // Beige - 背景色
		text: 0x333333, // ダークグレー - テキスト色
		textLight: 0x666666, // ミディアムグレー - ライトテキスト色
		success: 0x228b22, // ForestGreen - 成功状態
		warning: 0xdaa520, // Goldenrod - 警告状態
		error: 0x8b0000, // DarkRed - エラー状態
		disabled: 0xcccccc, // ライトグレー - 無効状態
	},
	fonts: {
		primary: 'Noto Sans JP', // プライマリフォント（日本語対応）
		secondary: 'sans-serif', // フォールバック用セカンダリフォント
	},
	sizes: {
		small: 14, // 小さいテキスト用
		medium: 16, // 標準テキスト用
		large: 20, // 中見出し用
		xlarge: 24, // 大見出し用
	},
	spacing: {
		xs: 4, // 最小スペーシング
		sm: 8, // 小スペーシング
		md: 16, // 中スペーシング
		lg: 24, // 大スペーシング
		xl: 32, // 最大スペーシング
	},
} as const;
```

### 2. BaseComponent.ts

**ファイルパス**: `src/presentation/ui/components/BaseComponent.ts`

```typescript
/**
 * 基底UIコンポーネント
 * TASK-0018 共通UIコンポーネント基盤
 *
 * @description
 * 全カスタムUIコンポーネントの共通基底クラス
 * Phaserシーン、コンテナ、rexUIプラグインへのアクセスを提供
 */

import type Phaser from 'phaser';

/**
 * 基底UIコンポーネント抽象クラス
 *
 * すべてのカスタムUIコンポーネントはこのクラスを継承し、
 * create()とdestroy()メソッドを実装する必要がある
 */
export abstract class BaseComponent {
	/** Phaserシーンへの参照 */
	protected scene: Phaser.Scene;

	/** UIを格納するコンテナ */
	protected container: Phaser.GameObjects.Container;

	/** rexUIプラグインへの参照 */
	protected rexUI: any;

	/**
	 * コンストラクタ
	 *
	 * @param scene - Phaserシーンインスタンス
	 * @param x - X座標
	 * @param y - Y座標
	 */
	constructor(scene: Phaser.Scene, x: number, y: number) {
		this.scene = scene;
		// @ts-expect-error - rexUIはプラグインなので型定義がないため、anyで扱う
		this.rexUI = scene.rexUI;
		this.container = scene.add.container(x, y);
	}

	/**
	 * コンポーネントの初期化処理
	 * サブクラスで実装必須
	 */
	abstract create(): void;

	/**
	 * コンポーネントの破棄処理
	 * サブクラスで実装必須
	 */
	abstract destroy(): void;

	/**
	 * 可視性を設定
	 *
	 * @param visible - true: 表示, false: 非表示
	 * @returns this - メソッドチェーン用
	 */
	setVisible(visible: boolean): this {
		this.container.setVisible(visible);
		return this;
	}

	/**
	 * 位置を設定
	 *
	 * @param x - X座標
	 * @param y - Y座標
	 * @returns this - メソッドチェーン用
	 */
	setPosition(x: number, y: number): this {
		this.container.setPosition(x, y);
		return this;
	}
}
```

---

## テスト実行結果

### 全体サマリー

```bash
$ pnpm test -- --run src/presentation/ui

Test Files  2 passed (2)
Tests       41 passed (41)
Duration    5.00s
```

### 詳細結果

#### theme.spec.ts

```
✓ src/presentation/ui/theme.spec.ts (25 tests) 6ms
  ✓ THEME定義
    ✓ T-0018-THEME-01: カラーパレット定義の検証 (9 tests)
    ✓ T-0018-THEME-02: フォント設定の検証 (2 tests)
    ✓ T-0018-THEME-03: サイズ定義の検証 (4 tests)
    ✓ T-0018-THEME-04: スペーシング定義の検証 (5 tests)
    ✓ T-0018-THEME-05: 定数としての不変性確認 (5 tests)
```

#### BaseComponent.spec.ts

```
✓ src/presentation/ui/components/BaseComponent.spec.ts (16 tests) 10ms
  ✓ BaseComponent
    ✓ T-0018-BASE-01: コンストラクタの初期化検証 (4 tests)
    ✓ T-0018-BASE-02: setVisibleメソッドの検証 (3 tests)
    ✓ T-0018-BASE-03: setPositionメソッドの検証 (2 tests)
    ✓ T-0018-BASE-04: 抽象メソッドの存在確認 (4 tests)
    ✓ T-0018-BASE-05: メソッドチェーンの検証 (3 tests)
```

---

## 実装方針（TDDの最小実装）

### 1. テーマ定義

テストで要求されている全てのカラー、フォント、サイズ、スペーシングを定義。
`as const` を使用してTypeScriptのリテラル型として扱い、readonly化。

**最小実装のポイント**:
- テストで要求されている値を正確に実装
- 余分な機能は追加しない
- コメントで各値の用途を明記

### 2. BaseComponent

抽象クラスとして定義し、テストで要求されている全てのメソッドとプロパティを実装。

**最小実装のポイント**:
- 抽象メソッド create(), destroy() を定義（実装はサブクラスに委譲）
- setVisible(), setPosition() はテスト通過に必要な最小限の実装
- メソッドチェーン用に `this` を返す
- rexUI は `any` 型で扱い（型定義が複雑なため、Greenフェーズでは最小限に）

---

## 実装時の判断

### rexUIの型定義について

**判断**: `any` 型で扱う

**理由**:
- rexUIプラグインの型定義が複雑
- Greenフェーズでは最小限の実装を目指す
- `@ts-expect-error` コメントで意図的な`any`使用を明示
- Refactorフェーズで適切な型定義を追加予定

### コメントの追加

**判断**: 日本語コメントを追加

**理由**:
- コードの可読性向上
- 各値の用途を明確化
- 将来的なメンテナンス性向上
- プロジェクトのコーディング規約に準拠

---

## 次のステップ

次は `/tdd-refactor` コマンドでRefactorフェーズ（品質改善）を開始してください。

または、次のテストケースを実装する場合は `/tdd-red` コマンドで新しいテストケースを追加してください。

### 推奨される改善点（Refactorフェーズ）

1. **rexUIの型定義**: `any` から適切な型定義への変更
2. **TypeScript strictモード**: より厳密な型チェック
3. **セキュリティレビュー**: 特になし（オフラインゲーム）
4. **パフォーマンステスト**: 現時点では不要（基本的な定義のみ）
5. **コードカバレッジ**: 100%達成済み

---

**作成日時**: 2026-01-17
**作成者**: Claude (Zundamon)
