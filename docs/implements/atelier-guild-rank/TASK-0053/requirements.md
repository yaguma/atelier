# TASK-0053 詳細要件定義: 共通UIユーティリティ基盤作成

**作成日**: 2026-01-23
**タスクID**: TASK-0053

---

## 1. 概要

Presentation層で重複しているUI生成パターンを共通ユーティリティとして抽出・統合する。

---

## 2. 機能要件

### 2.1 UIBackgroundBuilder

**REQ-UI-001**: 背景パネル生成Builder

| 項目 | 内容 |
|------|------|
| 責務 | Graphicsオブジェクトを使用した背景パネルの生成 |
| パターン | Builderパターン（メソッドチェーン） |

**メソッド仕様**:

| メソッド | 引数 | 戻り値 | 説明 |
|----------|------|--------|------|
| `constructor(scene)` | `Phaser.Scene` | `UIBackgroundBuilder` | インスタンス生成 |
| `setPosition(x, y)` | `number, number` | `this` | 位置設定 |
| `setSize(width, height)` | `number, number` | `this` | サイズ設定 |
| `setFill(color, alpha?)` | `number, number?` | `this` | 塗り色設定 |
| `setBorder(color, width?)` | `number, number?` | `this` | ボーダー設定 |
| `setRadius(radius)` | `number` | `this` | 角丸半径設定 |
| `build()` | なし | `Phaser.GameObjects.Graphics` | Graphicsオブジェクト生成 |

**デフォルト値**:

| プロパティ | デフォルト値 |
|-----------|-------------|
| x | 0 |
| y | 0 |
| width | 100 |
| height | 100 |
| fillColor | 0x2a2a3d |
| fillAlpha | 0.95 |
| borderRadius | 8 |
| borderColor | 0x4a4a5d |
| borderWidth | 2 |

### 2.2 HoverAnimationMixin

**REQ-UI-002**: ホバーアニメーション適用関数

**関数仕様**:

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `applyHoverAnimation(gameObject, scene, config?)` | `GameObject, Scene, Config?` | `void` | ホバーエフェクト適用 |
| `removeHoverAnimation(gameObject)` | `GameObject` | `void` | ホバーエフェクト解除 |

**HoverAnimationConfig**:

| プロパティ | 型 | デフォルト値 | 説明 |
|-----------|-----|-------------|------|
| scaleUp | `number` | 1.05 | ホバー時のスケール |
| duration | `number` | 100 | アニメーション時間(ms) |
| ease | `string` | 'Power2' | イージング関数 |
| glowColor | `number?` | undefined | グロー色（オプション） |
| glowIntensity | `number?` | undefined | グロー強度（オプション） |

### 2.3 BorderLineFactory

**REQ-UI-003**: ボーダーライン生成Factory

**静的メソッド仕様**:

| メソッド | 引数 | 戻り値 |
|----------|------|--------|
| `createHorizontalLine(scene, x, y, width, color?, thickness?)` | `Scene, number, number, number, number?, number?` | `Graphics` |
| `createVerticalLine(scene, x, y, height, color?, thickness?)` | `Scene, number, number, number, number?, number?` | `Graphics` |
| `createRoundedBorder(scene, x, y, width, height, radius?, color?)` | `Scene, number, number, number, number, number?, number?` | `Graphics` |

**デフォルト値**:

| プロパティ | デフォルト値 |
|-----------|-------------|
| color | 0x4a4a5d |
| thickness | 2 |
| radius | 8 |

---

## 3. 非機能要件

### 3.1 パフォーマンス

- **NFR-001**: Graphicsオブジェクト生成は1ms以内で完了すること
- **NFR-002**: メモリリークを発生させないこと（destroyメソッドの適切な呼び出し）

### 3.2 互換性

- **NFR-003**: Phaser 3.87以上と互換性があること
- **NFR-004**: 既存のUIコンポーネントと共存可能なこと

### 3.3 保守性

- **NFR-005**: TypeScript型定義が完備されていること
- **NFR-006**: JSDocコメントが記載されていること

---

## 4. 受け入れ基準

### AC-001: UIBackgroundBuilder
- [ ] Builderパターンでメソッドチェーンが機能すること
- [ ] build()でGraphicsオブジェクトが生成されること
- [ ] デフォルト値が適用されること
- [ ] カスタム値が正しく反映されること

### AC-002: HoverAnimationMixin
- [ ] applyHoverAnimationでpointerover/pointeroutイベントが設定されること
- [ ] ホバー時にスケールアニメーションが実行されること
- [ ] removeHoverAnimationでイベントが解除されること
- [ ] configパラメータが正しく適用されること

### AC-003: BorderLineFactory
- [ ] createHorizontalLineで水平線が生成されること
- [ ] createVerticalLineで垂直線が生成されること
- [ ] createRoundedBorderで角丸ボーダーが生成されること
- [ ] デフォルト値とカスタム値が正しく機能すること

### AC-004: 品質
- [ ] テストカバレッジが80%以上であること
- [ ] 既存テストが全て通過すること
- [ ] TypeScript型エラーがないこと

---

## 5. 実装ファイル

```
src/presentation/ui/utils/
├── index.ts
├── UIBackgroundBuilder.ts
├── HoverAnimationMixin.ts
└── BorderLineFactory.ts

tests/unit/presentation/ui/utils/
├── UIBackgroundBuilder.test.ts
├── HoverAnimationMixin.test.ts
└── BorderLineFactory.test.ts
```

---

## 6. 信頼性レベル

| 項目 | レベル | 根拠 |
|------|--------|------|
| UIBackgroundBuilder仕様 | 🟡 | コードベース調査から妥当な推測 |
| HoverAnimationMixin仕様 | 🟡 | 既存実装パターンからの抽出 |
| BorderLineFactory仕様 | 🟡 | 既存実装パターンからの抽出 |
| デフォルト値 | 🟡 | 既存コードの頻出値を参照 |
| インデックスファイル | 🔵 | 標準的な実装パターン |
