# TDD用要件定義書: Button と Dialog コンポーネント

**作成日**: 2026-01-17
**タスクID**: TASK-0018 Phase 2
**要件名**: atelier-guild-rank
**機能名**: Button と Dialog コンポーネント
**出力ファイル名**: `docs/implements/atelier-guild-rank/TASK-0018/ui-components-phase2-requirements.md`

---

## 信頼性レベル

各項目について、元の資料（EARS要件定義書・設計文書含む）との照合状況を以下の信号でコメント：

- 🔵 **青信号**: EARS要件定義書・設計文書を参考にしてほぼ推測していない場合
- 🟡 **黄信号**: EARS要件定義書・設計文書から妥当な推測の場合
- 🔴 **赤信号**: EARS要件定義書・設計文書にない推測の場合

---

## 1. 機能の概要

### 1.1 何をする機能か 🔵

**Buttonコンポーネント**:
- ゲーム内で使用される全てのボタンの基底となるコンポーネント
- プライマリボタン、セカンダリボタン、テキストボタン、アイコンボタンの4種類を提供
- rexUI の Label コンポーネントをラップして、統一されたスタイルとインタラクションを実現
- テーマ定義 (theme.ts) のカラーパレットとスタイルを使用

**Dialogコンポーネント**:
- モーダルダイアログを表示・管理するコンポーネント
- 確認ダイアログ、情報ダイアログ、選択ダイアログの3種類を提供
- rexUI の Dialog コンポーネントをラップして、統一されたスタイルとアニメーションを実現
- 深度 (depth) 400 で表示され、オーバーレイ背景 (depth 300) とともに使用

### 1.2 どのような問題を解決するか 🔵

**Buttonコンポーネント**:
- **問題**: 各画面で個別にボタンを作成すると、スタイルやインタラクションが不統一になる
- **解決**: 統一されたボタンコンポーネントを提供し、デザイン規約に従った一貫性のあるUIを実現
- **効果**: 開発効率の向上、メンテナンス性の向上、ユーザー体験の統一

**Dialogコンポーネント**:
- **問題**: ユーザーへの確認・通知を行う際、毎回ダイアログを作成するのは非効率
- **解決**: 統一されたダイアログコンポーネントを提供し、簡単にモーダル表示を実現
- **効果**: コード重複の削減、統一されたUX、アクセシビリティの向上

### 1.3 想定されるユーザー 🔵

- **開発者**: 他のUIコンポーネントやシーンで Button/Dialog を使用する開発者
- **プレイヤー**: ゲームをプレイするエンドユーザー（間接的）

### 1.4 システム内での位置づけ 🔵

- **レイヤー**: Presentation層 / UI層
- **パス**: `src/presentation/ui/components/Button.ts`, `Dialog.ts`
- **依存関係**:
  - `BaseComponent.ts` を継承
  - `theme.ts` のカラーパレットとスタイルを使用
  - `rexUI` プラグインを使用
  - `Phaser.Scene` に依存

### 1.5 参照したEARS要件 🔵

- **タスクファイル**: `docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md`
  - セクション 2.3: ボタンコンポーネント
  - セクション 2.4: ダイアログコンポーネント

### 1.6 参照した設計文書 🔵

- **UI設計概要**: `docs/design/atelier-guild-rank/ui-design/overview.md`
  - セクション 5.1: ボタン (rexUIボタン)
  - セクション 5.3: ダイアログ (rexUIダイアログ)
  - セクション 7.1: カラーパレット
  - セクション 7.4: フォント設定
- **共通コンポーネント設計**: `docs/design/atelier-guild-rank/ui-design/screens/common-components.md`
  - セクション 6.1: 確認ダイアログ (ConfirmDialog)
  - セクション 6.2: 情報ダイアログ (InfoDialog)
  - セクション 8.3: ボタンスタイル

---

## 2. 入力・出力の仕様

### 2.1 Buttonコンポーネントの仕様 🔵

#### 2.1.1 入力パラメータ

```typescript
interface ButtonConfig {
  // 必須パラメータ
  text: string;                    // ボタンのテキスト
  onClick: () => void;             // クリック時のコールバック

  // オプションパラメータ
  type?: ButtonType;               // ボタンの種類（デフォルト: 'primary'）
  icon?: string;                   // アイコン画像キー（オプション）
  enabled?: boolean;               // 有効/無効（デフォルト: true）
  width?: number;                  // 幅（デフォルト: 自動）
  height?: number;                 // 高さ（デフォルト: 自動）
}

enum ButtonType {
  PRIMARY = 'primary',             // プライマリボタン
  SECONDARY = 'secondary',         // セカンダリボタン
  TEXT = 'text',                   // テキストボタン
  ICON = 'icon',                   // アイコンボタン
}
```

#### 2.1.2 出力値

- **戻り値**: `Button` インスタンス（BaseComponentを継承）
- **イベント**: `onClick` コールバックの実行

#### 2.1.3 公開メソッド

```typescript
class Button extends BaseComponent {
  // テキストを変更
  setText(text: string): this;

  // 有効/無効を切り替え
  setEnabled(enabled: boolean): this;

  // クリックイベントハンドラを変更
  setOnClick(onClick: () => void): this;

  // ボタンの状態を取得
  isEnabled(): boolean;
}
```

### 2.2 Dialogコンポーネントの仕様 🔵

#### 2.2.1 入力パラメータ

```typescript
interface DialogConfig {
  // 必須パラメータ
  title: string;                   // ダイアログのタイトル
  content: string;                 // ダイアログの内容

  // オプションパラメータ
  type?: DialogType;               // ダイアログの種類（デフォルト: 'info'）
  actions?: DialogAction[];        // アクションボタン（デフォルト: [閉じる]）
  width?: number;                  // 幅（デフォルト: 400）
  height?: number;                 // 高さ（デフォルト: 自動）
  onClose?: () => void;            // 閉じる時のコールバック
}

enum DialogType {
  CONFIRM = 'confirm',             // 確認ダイアログ
  INFO = 'info',                   // 情報ダイアログ
  CHOICE = 'choice',               // 選択ダイアログ
}

interface DialogAction {
  label: string;                   // ボタンラベル
  type: ButtonType;                // ボタンの種類
  callback: () => void;            // クリック時のコールバック
}
```

#### 2.2.2 出力値

- **戻り値**: `Dialog` インスタンス（BaseComponentを継承）
- **イベント**: アクションボタンのコールバック実行、`onClose` コールバック実行

#### 2.2.3 公開メソッド

```typescript
class Dialog extends BaseComponent {
  // ダイアログを表示（アニメーション付き）
  show(duration?: number): this;

  // ダイアログを非表示（アニメーション付き）
  hide(duration?: number): this;

  // タイトルを変更
  setTitle(title: string): this;

  // 内容を変更
  setContent(content: string): this;

  // ダイアログの表示状態を取得
  isVisible(): boolean;
}
```

### 2.3 データフロー 🔵

```
ユーザーアクション（クリック）
    ↓
Button.onClick() / Dialog action callback
    ↓
アプリケーション層のロジック実行
    ↓
状態変更・画面更新
```

### 2.4 参照したEARS要件 🔵

- **タスクファイル**: `docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md`
  - セクション 2.3, 2.4: 各コンポーネントの仕様

### 2.5 参照した設計文書 🔵

- **UI設計概要**: `docs/design/atelier-guild-rank/ui-design/overview.md`
  - セクション 5.1, 5.3: ボタンとダイアログの実装例
- **型定義**: Phase 1で実装した `BaseComponent.ts` のインターフェース

---

## 3. 制約条件

### 3.1 パフォーマンス要件 🔵

- **ボタンのホバー・クリックレスポンス**: 16ms以内（60fps）
- **ダイアログのアニメーション**: スムーズな表示・非表示（200-300ms）
- **オブジェクトプール**: 再利用可能なボタン・ダイアログのプール管理

**参照**: `docs/design/atelier-guild-rank/ui-design/screens/common-components.md` セクション 10

### 3.2 セキュリティ要件 🔵

特になし（オフラインゲームのため）

**参照**: `docs/implements/atelier-guild-rank/TASK-0018/note.md` セクション 5.2

### 3.3 互換性要件 🔵

- **Phaser 3**: 最新版に対応
- **rexUI Plugin**: 最新版に対応
- **TypeScript**: 最新版に対応

**参照**: `docs/implements/atelier-guild-rank/TASK-0018/note.md` セクション 1.1

### 3.4 アーキテクチャ制約 🔵

- **Clean Architecture**: Presentation層に配置
- **BaseComponentを継承**: 共通機能を継承
- **rexUIに依存**: rexUIプラグインを使用

**参照**: `docs/implements/atelier-guild-rank/TASK-0018/note.md` セクション 1.2

### 3.5 rexUIの制約 🔵

- **レイアウト後に `.layout()` を必ず呼ぶ**
- **コンテナのサイズは子要素から自動計算される**
- **深度 (depth) の設定**: ボタンは親コンテナに従う、ダイアログは400

**参照**: `docs/implements/atelier-guild-rank/TASK-0018/note.md` セクション 5.1

### 3.6 UIレイヤー制約 🔵

| レイヤー | depth | 内容 |
|---------|------|------|
| Overlay | 300 | オーバーレイ・ダイアログ背景 |
| Dialog | 400 | モーダルダイアログ |

**参照**: `docs/design/atelier-guild-rank/ui-design/overview.md` セクション 4.2

### 3.7 参照したEARS要件 🔵

- **非機能要件**: パフォーマンス要件、互換性要件

### 3.8 参照した設計文書 🔵

- **アーキテクチャ設計**: `docs/design/atelier-guild-rank/architecture-overview.md`
- **Phaser実装設計**: `docs/design/atelier-guild-rank/architecture-phaser.md`

---

## 4. 想定される使用例

### 4.1 基本的な使用パターン 🔵

#### 4.1.1 プライマリボタンの作成

```typescript
const confirmButton = new Button(scene, 640, 600, {
  text: '確定',
  type: ButtonType.PRIMARY,
  onClick: () => {
    console.log('確定ボタンがクリックされました');
    // 確定処理
  }
});
```

#### 4.1.2 セカンダリボタンの作成

```typescript
const cancelButton = new Button(scene, 640, 650, {
  text: 'キャンセル',
  type: ButtonType.SECONDARY,
  onClick: () => {
    console.log('キャンセルボタンがクリックされました');
    // キャンセル処理
  }
});
```

#### 4.1.3 確認ダイアログの表示

```typescript
const confirmDialog = new Dialog(scene, 640, 360, {
  title: '確認',
  content: '本当にこの操作を実行しますか？',
  type: DialogType.CONFIRM,
  actions: [
    {
      label: 'はい',
      type: ButtonType.PRIMARY,
      callback: () => {
        console.log('はいが選択されました');
        confirmDialog.hide();
      }
    },
    {
      label: 'いいえ',
      type: ButtonType.SECONDARY,
      callback: () => {
        console.log('いいえが選択されました');
        confirmDialog.hide();
      }
    }
  ]
});
confirmDialog.show();
```

#### 4.1.4 情報ダイアログの表示

```typescript
const infoDialog = new Dialog(scene, 640, 360, {
  title: '情報',
  content: 'アイテムを入手しました！',
  type: DialogType.INFO,
  actions: [
    {
      label: '閉じる',
      type: ButtonType.PRIMARY,
      callback: () => {
        infoDialog.hide();
      }
    }
  ]
});
infoDialog.show();
```

### 4.2 データフロー 🔵

```
1. シーン起動
   ↓
2. Button/Dialogインスタンス作成
   ↓
3. コンストラクタでrexUIコンポーネント生成
   ↓
4. .layout() でレイアウト確定
   ↓
5. ユーザーアクション待機
   ↓
6. クリックイベント発火
   ↓
7. コールバック実行
   ↓
8. アプリケーションロジック実行
```

### 4.3 エッジケース 🟡

#### 4.3.1 無効化されたボタンのクリック

```typescript
const button = new Button(scene, 640, 600, {
  text: '実行',
  onClick: () => console.log('実行'),
  enabled: false
});

// クリックしても何も起こらない
// ボタンは視覚的にグレーアウトされる
```

#### 4.3.2 ダイアログの多重表示防止

```typescript
const dialog = new Dialog(scene, 640, 360, {
  title: '警告',
  content: 'エラーが発生しました'
});

dialog.show();
dialog.show(); // 既に表示中の場合は無視される
```

#### 4.3.3 長いテキストの処理

```typescript
const button = new Button(scene, 640, 600, {
  text: 'とても長いボタンテキストが入力された場合の動作確認',
  width: 200
});

// テキストが折り返されるか、省略記号が表示される
```

### 4.4 エラーケース 🟡

#### 4.4.1 不正なパラメータ

```typescript
// textが空の場合
try {
  const button = new Button(scene, 640, 600, {
    text: '',
    onClick: () => {}
  });
} catch (error) {
  console.error('Button: text is required');
}

// onClickがnullの場合
try {
  const button = new Button(scene, 640, 600, {
    text: 'ボタン',
    onClick: null as any
  });
} catch (error) {
  console.error('Button: onClick callback is required');
}
```

#### 4.4.2 rexUIが未初期化

```typescript
// rexUIが未初期化の場合
try {
  const button = new Button(scene, 640, 600, {
    text: 'ボタン',
    onClick: () => {}
  });
} catch (error) {
  console.error('Button: rexUI plugin is not initialized');
}
```

### 4.5 参照したEARS要件 🟡

- **エッジケース要件**: 入力値検証、エラーハンドリング（Phase 1のコードレビューで追加された要件）

### 4.6 参照した設計文書 🔵

- **UI設計概要**: `docs/design/atelier-guild-rank/ui-design/overview.md`
  - セクション 5.1, 5.3: 実装例
- **データフロー**: Phase 1の実装パターンを参考

---

## 5. EARS要件・設計文書との対応関係

### 5.1 参照したユーザストーリー 🔵

- **ストーリー**: ゲーム内で統一されたUIコンポーネントを使用したい
- **As a**: 開発者
- **I want**: 統一されたButtonとDialogコンポーネント
- **So that**: 効率的にUI開発ができ、一貫性のあるUXを提供できる

### 5.2 参照した機能要件 🔵

- **REQ-UI-001**: ボタンコンポーネントの提供
  - プライマリ、セカンダリ、テキスト、アイコンボタンの4種類
- **REQ-UI-002**: ダイアログコンポーネントの提供
  - 確認、情報、選択ダイアログの3種類
- **REQ-UI-003**: テーマ定義の使用
  - カラーパレット、フォント、サイズ、スペーシングを統一

**参照**: `docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md`

### 5.3 参照した非機能要件 🔵

- **NFR-PERF-001**: 60fps以上のフレームレート維持
- **NFR-UX-001**: 統一されたデザイン規約の適用
- **NFR-A11Y-001**: キーボード操作対応

**参照**: `docs/design/atelier-guild-rank/ui-design/overview.md` セクション 14

### 5.4 参照したEdgeケース 🟡

- **EDGE-UI-001**: 無効化されたボタンのクリック
- **EDGE-UI-002**: ダイアログの多重表示防止
- **EDGE-UI-003**: 長いテキストの処理
- **EDGE-UI-004**: 不正なパラメータの処理
- **EDGE-UI-005**: rexUIが未初期化の場合

**参照**: Phase 1のコードレビュー結果

### 5.5 参照した受け入れ基準 🔵

- **AC-001**: ボタンが正しいスタイルで表示される
- **AC-002**: ボタンクリック時にコールバックが実行される
- **AC-003**: ダイアログがモーダル表示される
- **AC-004**: ダイアログが閉じることができる
- **AC-005**: 無効化されたボタンはクリックできない
- **AC-006**: ダイアログは適切なアニメーションで表示・非表示される

**参照**: `docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md` セクション 3

### 5.6 参照した設計文書

#### 5.6.1 アーキテクチャ 🔵

- **ファイル**: `docs/design/atelier-guild-rank/architecture-overview.md`
- **セクション**: Clean Architecture - Presentation層
- **内容**: UIコンポーネントの配置とレイヤー分離

#### 5.6.2 データフロー 🔵

- **ファイル**: `docs/design/atelier-guild-rank/ui-design/overview.md`
- **セクション**: セクション 5.1, 5.3
- **内容**: ボタンとダイアログの実装パターン

#### 5.6.3 型定義 🔵

- **ファイル**: `atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts`
- **内容**: BaseComponent の型定義（Phase 1で実装済み）

#### 5.6.4 データベース 🔵

特になし（UIコンポーネントのため）

#### 5.6.5 API仕様 🔵

特になし（オフラインゲームのため）

---

## 6. 実装優先度

### 6.1 Phase 2-1: Buttonコンポーネント（優先度: 高）

1. **Button基底クラス** - BaseComponentを継承
2. **プライマリボタン** - 確定アクション用
3. **セカンダリボタン** - キャンセル・戻る用
4. **テキストボタン** - 軽微なアクション用（優先度: 中）
5. **アイコンボタン** - アイコンのみ（優先度: 中）

### 6.2 Phase 2-2: Dialogコンポーネント（優先度: 高）

1. **Dialog基底クラス** - BaseComponentを継承
2. **確認ダイアログ** - ユーザー確認用
3. **情報ダイアログ** - 情報提示用
4. **選択ダイアログ** - 複数選択肢用（優先度: 中）

---

## 7. 技術的な決定事項

### 7.1 実装方針 🔵

- **TDD（テスト駆動開発）**: Red → Green → Refactor のサイクルで開発
- **最小実装**: Greenフェーズではテストを通すための最小限のコードを実装
- **リファクタリング**: Refactorフェーズでコード品質を向上

### 7.2 テスト戦略 🔵

- **単体テスト**: Vitest を使用
- **モック**: Phaser.Scene と rexUI をモック化
- **テストカバレッジ**: 100% を目標

### 7.3 コーディング規約 🔵

- **命名規則**: PascalCase (クラス), camelCase (変数・メソッド)
- **型定義**: TypeScript の型を適切に使用
- **コメント**: JSDoc + 処理ブロックレベルコメント（日本語）

---

## 8. 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/presentation/ui/components/Button.ts` | Buttonコンポーネント実装 |
| `src/presentation/ui/components/Button.spec.ts` | Buttonコンポーネントテスト |
| `src/presentation/ui/components/Dialog.ts` | Dialogコンポーネント実装 |
| `src/presentation/ui/components/Dialog.spec.ts` | Dialogコンポーネントテスト |
| `src/presentation/ui/theme.ts` | テーマ定義（Phase 1で実装済み） |
| `src/presentation/ui/components/BaseComponent.ts` | 基底コンポーネント（Phase 1で実装済み） |

---

## 9. 参考リンク

### 9.1 タスク文書

- `docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md` - 本タスクの仕様

### 9.2 設計文書

- `docs/design/atelier-guild-rank/ui-design/overview.md` - UI設計概要
- `docs/design/atelier-guild-rank/ui-design/screens/common-components.md` - 共通コンポーネント設計

### 9.3 開発文書

- `docs/implements/atelier-guild-rank/TASK-0018/note.md` - 開発ノート
- `docs/implements/atelier-guild-rank/TASK-0018/ui-components-memo.md` - 開発メモ

---

## 10. 品質基準

### 10.1 テストケース数

- **Button**: 20テスト以上
  - 各ボタンタイプの表示・動作テスト
  - 有効/無効状態のテスト
  - エッジケースのテスト
- **Dialog**: 20テスト以上
  - 各ダイアログタイプの表示・動作テスト
  - 表示/非表示アニメーションのテスト
  - エッジケースのテスト

### 10.2 コード品質

- **Lint警告**: 0件
- **TypeScript型エラー**: 0件
- **テスト成功率**: 100%
- **コードカバレッジ**: 100%

### 10.3 ドキュメント品質

- **日本語コメント**: 適切（処理ブロックレベル）
- **JSDocコメント**: 充実（全publicメソッド）
- **信頼性レベル**: 各項目に明記（🔵🟡🔴）

---

**作成日**: 2026-01-17
**作成者**: Claude (Zundamon)
**バージョン**: 1.0.0
