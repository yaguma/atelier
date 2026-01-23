# TASK-0053 テストケース設計: 共通UIユーティリティ基盤作成

**作成日**: 2026-01-23
**タスクID**: TASK-0053

---

## テストケース一覧

### 1. UIBackgroundBuilder テストケース

| ID | カテゴリ | テスト内容 | 信頼性 |
|-----|---------|----------|--------|
| TC-BG-001 | 正常系 | デフォルト設定でGraphicsオブジェクトが生成される | 🟡 |
| TC-BG-002 | 正常系 | setPosition()で位置が設定される | 🟡 |
| TC-BG-003 | 正常系 | setSize()でサイズが設定される | 🟡 |
| TC-BG-004 | 正常系 | setFill()で塗り色が設定される | 🟡 |
| TC-BG-005 | 正常系 | setBorder()でボーダーが設定される | 🟡 |
| TC-BG-006 | 正常系 | setRadius()で角丸半径が設定される | 🟡 |
| TC-BG-007 | 正常系 | メソッドチェーンが機能する | 🔵 |
| TC-BG-101 | 異常系 | nullシーンでエラーがスローされる | 🟡 |
| TC-BG-201 | 境界値 | サイズ0でも生成される | 🟡 |
| TC-BG-202 | 境界値 | 負のサイズでも生成される（0扱い） | 🟡 |

### 2. HoverAnimationMixin テストケース

| ID | カテゴリ | テスト内容 | 信頼性 |
|-----|---------|----------|--------|
| TC-HV-001 | 正常系 | applyHoverAnimationでイベントが設定される | 🟡 |
| TC-HV-002 | 正常系 | デフォルト設定でホバーアニメーションが実行される | 🟡 |
| TC-HV-003 | 正常系 | カスタムscaleUpが適用される | 🟡 |
| TC-HV-004 | 正常系 | カスタムdurationが適用される | 🟡 |
| TC-HV-005 | 正常系 | カスタムeaseが適用される | 🟡 |
| TC-HV-006 | 正常系 | removeHoverAnimationでイベントが解除される | 🟡 |
| TC-HV-101 | 異常系 | nullオブジェクトでエラーなく処理される | 🟡 |
| TC-HV-102 | 異常系 | interactiveでないオブジェクトでも安全に処理 | 🟡 |
| TC-HV-201 | 境界値 | scaleUp: 1でアニメーションなし | 🟡 |
| TC-HV-202 | 境界値 | duration: 0で即時適用 | 🟡 |

### 3. BorderLineFactory テストケース

| ID | カテゴリ | テスト内容 | 信頼性 |
|-----|---------|----------|--------|
| TC-BL-001 | 正常系 | createHorizontalLineで水平線が生成される | 🟡 |
| TC-BL-002 | 正常系 | createVerticalLineで垂直線が生成される | 🟡 |
| TC-BL-003 | 正常系 | createRoundedBorderで角丸ボーダーが生成される | 🟡 |
| TC-BL-004 | 正常系 | カスタムカラーが適用される | 🟡 |
| TC-BL-005 | 正常系 | カスタム太さが適用される | 🟡 |
| TC-BL-006 | 正常系 | カスタム角丸半径が適用される | 🟡 |
| TC-BL-101 | 異常系 | nullシーンでエラーがスローされる | 🟡 |
| TC-BL-201 | 境界値 | 幅/高さ0でも生成される | 🟡 |
| TC-BL-202 | 境界値 | 太さ0でも生成される | 🟡 |

### 4. index.ts エクスポートテスト

| ID | カテゴリ | テスト内容 | 信頼性 |
|-----|---------|----------|--------|
| TC-IX-001 | 正常系 | UIBackgroundBuilderがエクスポートされる | 🔵 |
| TC-IX-002 | 正常系 | applyHoverAnimationがエクスポートされる | 🔵 |
| TC-IX-003 | 正常系 | removeHoverAnimationがエクスポートされる | 🔵 |
| TC-IX-004 | 正常系 | BorderLineFactoryがエクスポートされる | 🔵 |
| TC-IX-005 | 正常系 | HoverAnimationConfig型がエクスポートされる | 🔵 |

---

## テストケース詳細

### TC-BG-001: デフォルト設定でGraphicsオブジェクトが生成される

**Given**: UIBackgroundBuilderインスタンスが作成される
**When**: build()を呼び出す
**Then**: デフォルト設定のGraphicsオブジェクトが返される

### TC-HV-001: applyHoverAnimationでイベントが設定される

**Given**: Phaserゲームオブジェクト
**When**: applyHoverAnimation()を呼び出す
**Then**: pointeroverとpointeroutイベントが設定される

### TC-BL-001: createHorizontalLineで水平線が生成される

**Given**: Phaserシーンと座標
**When**: BorderLineFactory.createHorizontalLine()を呼び出す
**Then**: 指定位置に水平線のGraphicsが返される

---

## 合計: 30テストケース

- UIBackgroundBuilder: 10ケース
- HoverAnimationMixin: 10ケース
- BorderLineFactory: 9ケース
- index.ts: 5ケース（軽量）
