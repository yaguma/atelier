# TASK-0047 TDD要件定義書: 共通UIコンポーネント視覚実装

## 基本情報

| 項目 | 値 |
|------|-----|
| **タスクID** | TASK-0047 |
| **タスク名** | 共通UIコンポーネント視覚実装 |
| **見積時間** | 4時間 |
| **依存タスク** | TASK-0018, TASK-0046 |
| **開発タイプ** | TDD |
| **作成日** | 2026-01-22 |

---

## 1. 概要

### 1.1 背景

TASK-0046で実装されたHeaderUI、SidebarUI、FooterUIコンポーネントは、テストを通すための最小限の実装（ロジック・状態管理）のみで、実際のPhaserのGameObject（テキスト、図形、ボタンなど）を作成していない。そのため、MainSceneに遷移しても画面が真っ白（背景色のみ）となっている。

### 1.2 目的

各共通UIコンポーネントの`create()`メソッドに実際のPhaserのGameObject生成処理を追加し、デザイン仕様に基づいた視覚的なUI表示を実現する。

### 1.3 対象コンポーネント

| コンポーネント | ファイルパス | 責務 |
|---------------|-------------|------|
| **HeaderUI** | `src/presentation/ui/main/HeaderUI.ts` | ランク、昇格ゲージ、残り日数、所持金、行動ポイント表示 |
| **SidebarUI** | `src/presentation/ui/main/SidebarUI.ts` | 受注依頼、素材、完成品のアコーディオン、保管容量、ショップボタン |
| **FooterUI** | `src/presentation/ui/main/FooterUI.ts` | フェーズインジケーター、手札表示エリア、次へボタン |

---

## 2. 機能要件

### 2.1 HeaderUI視覚実装

#### REQ-047-01: ランク表示テキストを画面に描画すること 🔵

**説明:** 現在のギルドランクをテキストで表示する。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`rankText`フィールドが`null`ではないこと
- テキストが「ランク: G」形式で表示されること（初期値はGランク）
- テキストスタイルが`THEME`に基づいていること
- ランクに応じた色（`RANK_COLORS`）が適用されること

**テストケース:**
```typescript
it('ランク表示テキストが生成されること', () => {
  headerUI.create();
  const rankText = headerUI['rankText'];
  expect(rankText).not.toBeNull();
  expect(scene.add.text).toHaveBeenCalled();
});
```

---

#### REQ-047-02: 昇格ゲージをプログレスバーとして表示すること 🔵

**説明:** 昇格に必要な貢献度の進捗をプログレスバーで視覚化する。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`gaugeBackground`フィールドが`null`ではないこと
- `create()`メソッド呼び出し後、`gaugeFill`フィールドが`null`ではないこと
- 背景バーが固定幅で描画されること
- フィルバーが進捗に応じた幅で描画されること

**テストケース:**
```typescript
it('昇格ゲージの背景バーが生成されること', () => {
  headerUI.create();
  const gaugeBackground = headerUI['gaugeBackground'];
  expect(gaugeBackground).not.toBeNull();
  expect(scene.add.graphics).toHaveBeenCalled();
});

it('昇格ゲージのフィルバーが生成されること', () => {
  headerUI.create();
  const gaugeFill = headerUI['gaugeFill'];
  expect(gaugeFill).not.toBeNull();
});
```

---

#### REQ-047-03: 昇格ゲージの色が値に応じて変化すること 🔵

**説明:** 昇格ゲージの進捗率に応じて色が段階的に変化する。

**受け入れ基準:**
- 0-33%: 赤色（`THEME.colors.error` / `0xFF6B6B`）
- 34-66%: 黄色（`THEME.colors.warning` / `0xFFD93D`）
- 67-99%: 緑色（`THEME.colors.success` / `0x6BCB77`）
- 100%: 水色（`0x4ECDC4`）

**テストケース:**
```typescript
it('昇格ゲージ30%未満で赤色になること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, promotionGauge: { current: 20, max: 100 } });
  // gaugeFillのfillStyle呼び出しを検証
});

it('昇格ゲージ30-59%で黄色になること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, promotionGauge: { current: 45, max: 100 } });
});

it('昇格ゲージ60-99%で緑色になること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, promotionGauge: { current: 75, max: 100 } });
});

it('昇格ゲージ100%で水色になること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, promotionGauge: { current: 100, max: 100 } });
});
```

---

#### REQ-047-04: 残り日数テキストを表示し、色が日数に応じて変化すること 🔵

**説明:** 残り日数を表示し、緊急度に応じて色を変化させる。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`daysText`フィールドが`null`ではないこと
- テキストが「残り: XX日」形式で表示されること
- 残り11日以上: 白色（`0xFFFFFF`）
- 残り6-10日: 黄色（`THEME.colors.warning`）
- 残り4-5日: 赤色（`THEME.colors.error`）
- 残り1-3日: 点滅赤（`0xFF0000`）

**テストケース:**
```typescript
it('残り日数テキストが生成されること', () => {
  headerUI.create();
  const daysText = headerUI['daysText'];
  expect(daysText).not.toBeNull();
});

it('残り日数11日以上で白色になること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, remainingDays: 15 });
});

it('残り日数6-10日で黄色になること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, remainingDays: 8 });
});

it('残り日数4-5日で赤色になること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, remainingDays: 5 });
});
```

---

#### REQ-047-05: 残り3日以下で点滅アニメーションを実行すること 🟡

**説明:** 残り日数が3日以下になった場合、テキストが点滅して緊急性を強調する。

**受け入れ基準:**
- 残り3日以下の場合、点滅Tweenが開始されること
- 点滅間隔は500ms程度であること
- 残り4日以上になった場合、点滅が停止すること

**テストケース:**
```typescript
it('残り日数3日以下で点滅フラグがtrueになること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, remainingDays: 3 });
  expect(scene.tweens.add).toHaveBeenCalled();
});

it('残り日数4日以上で点滅が停止すること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, remainingDays: 3 });
  headerUI.update({ ...defaultState, remainingDays: 5 });
  // 点滅Tweenが停止されることを検証
});
```

---

#### REQ-047-06: 所持金テキストを表示すること 🔵

**説明:** 現在の所持金をテキストで表示する。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`goldText`フィールドが`null`ではないこと
- テキストが「XXXG」形式で表示されること
- 数値は3桁区切りでフォーマットされること（オプション）

**テストケース:**
```typescript
it('所持金テキストが生成されること', () => {
  headerUI.create();
  const goldText = headerUI['goldText'];
  expect(goldText).not.toBeNull();
});

it('所持金更新時にテキストが変更されること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, gold: 500 });
  const goldText = headerUI['goldText'];
  expect(goldText.setText).toHaveBeenCalledWith(expect.stringContaining('500'));
});
```

---

#### REQ-047-07: 行動ポイントを「現在/最大 AP」形式で表示すること 🔵

**説明:** 行動ポイント（AP）を「現在/最大」形式で表示する。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`actionPointsText`フィールドが`null`ではないこと
- テキストが「X/Y AP」形式で表示されること（例: 「3/3 AP」）
- AP残量に応じて色が変化すること（0の場合は警告色）

**テストケース:**
```typescript
it('行動ポイントテキストが生成されること', () => {
  headerUI.create();
  const actionPointsText = headerUI['actionPointsText'];
  expect(actionPointsText).not.toBeNull();
});

it('行動ポイント更新時にテキストが変更されること', () => {
  headerUI.create();
  headerUI.update({ ...defaultState, actionPoints: { current: 2, max: 3 } });
  const actionPointsText = headerUI['actionPointsText'];
  expect(actionPointsText.setText).toHaveBeenCalledWith('2/3 AP');
});
```

---

### 2.2 SidebarUI視覚実装

#### REQ-047-08: 「受注依頼」セクションヘッダーを表示すること 🔵

**説明:** 受注依頼セクションのヘッダーテキストを表示する。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`questSection`フィールドが`null`ではないこと
- ヘッダーテキストが「【受注依頼】」であること
- クリック可能なインタラクティブ領域が設定されていること

**テストケース:**
```typescript
it('受注依頼セクションヘッダーが生成されること', () => {
  sidebarUI.create();
  const questSection = sidebarUI['questSection'];
  expect(questSection).not.toBeNull();
  expect(questSection.title.text).toBe('【受注依頼】');
});
```

---

#### REQ-047-09: 「素材」セクションヘッダーを表示すること 🔵

**説明:** 素材セクションのヘッダーテキストを表示する。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`materialSection`フィールドが`null`ではないこと
- ヘッダーテキストが「【素材】」であること

**テストケース:**
```typescript
it('素材セクションヘッダーが生成されること', () => {
  sidebarUI.create();
  const materialSection = sidebarUI['materialSection'];
  expect(materialSection).not.toBeNull();
  expect(materialSection.title.text).toBe('【素材】');
});
```

---

#### REQ-047-10: 「完成品」セクションヘッダーを表示すること 🔵

**説明:** 完成品セクションのヘッダーテキストを表示する。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`itemSection`フィールドが`null`ではないこと
- ヘッダーテキストが「【完成品】」であること

**テストケース:**
```typescript
it('完成品セクションヘッダーが生成されること', () => {
  sidebarUI.create();
  const itemSection = sidebarUI['itemSection'];
  expect(itemSection).not.toBeNull();
  expect(itemSection.title.text).toBe('【完成品】');
});
```

---

#### REQ-047-11: 各セクションの折りたたみ/展開アイコンを表示すること 🟡

**説明:** 各セクションに折りたたみ状態を示すアイコン（▼/▶）を表示する。

**受け入れ基準:**
- 展開状態では「▼」が表示されること
- 折りたたみ状態では「▶」が表示されること
- クリック時にアニメーション付きで切り替わること

**テストケース:**
```typescript
it('セクション折りたたみ時にアイコンが変化すること', () => {
  sidebarUI.create();
  const questSection = sidebarUI['questSection'];

  // 初期状態は展開（▼）
  expect(questSection.icon.text).toBe('▼');

  // 折りたたみ後は▶
  sidebarUI['toggleSection'](questSection);
  // アニメーション完了後
  expect(questSection.icon.text).toBe('▶');
});
```

---

#### REQ-047-12: 保管容量テキストを表示すること 🔵

**説明:** 現在の保管容量を「保管: X/Y」形式で表示する。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`storageText`フィールドが`null`ではないこと
- テキストが「保管: X/Y」形式で表示されること（例: 「保管: 0/20」）
- 容量が80%以上で警告色になること

**テストケース:**
```typescript
it('保管容量テキストが生成されること', () => {
  sidebarUI.create();
  const storageText = sidebarUI['storageText'];
  expect(storageText).not.toBeNull();
});

it('保管容量更新時にテキストが変更されること', () => {
  sidebarUI.create();
  sidebarUI.updateStorage(10, 20);
  const storageText = sidebarUI['storageText'];
  expect(storageText.setText).toHaveBeenCalledWith('保管: 10/20');
});
```

---

#### REQ-047-13: ショップボタンを表示すること 🔵

**説明:** ショップ画面へ遷移するためのボタンを表示する。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`shopButton`フィールドが`null`ではないこと
- ボタンテキストが「ショップ」であること
- クリック可能なインタラクティブ領域が設定されていること
- ホバー時に視覚的フィードバックがあること

**テストケース:**
```typescript
it('ショップボタンが生成されること', () => {
  sidebarUI.create();
  const shopButton = sidebarUI['shopButton'];
  expect(shopButton).not.toBeNull();
  expect(shopButton.getAt(1).text).toBe('ショップ'); // Text要素
});
```

---

### 2.3 FooterUI視覚実装

#### REQ-047-14: フェーズインジケーターを4つのドットで表示すること 🔵

**説明:** 4つのゲームフェーズを視覚的に示すインジケーターを表示する。

**受け入れ基準:**
- 4つのCircle（ドット）が生成されること
- 各ドットはフェーズラベル（依頼受注、採取、調合、納品）と対応すること
- ドット間を接続するラインが描画されること

**テストケース:**
```typescript
it('フェーズインジケーターが4つ生成されること', () => {
  footerUI.create();
  const phaseIndicators = footerUI['phaseIndicators'];
  expect(phaseIndicators).toHaveLength(4);
});
```

---

#### REQ-047-15: 現在フェーズがハイライト表示されること 🔵

**説明:** 現在のゲームフェーズを強調表示する。

**受け入れ基準:**
- 現在フェーズのドットが`PHASE_CURRENT`色（`0x6366F1`）で表示されること
- 他のフェーズとは明確に区別できること

**テストケース:**
```typescript
it('現在フェーズのインジケーターがハイライトされること', () => {
  footerUI.create();
  footerUI.update({ ...defaultState, currentPhase: 'GATHERING' });
  const phaseIndicators = footerUI['phaseIndicators'];
  // GATHERING（インデックス1）がハイライト色になっていることを検証
});
```

---

#### REQ-047-16: 完了フェーズにチェックマークが表示されること 🟡

**説明:** 完了したフェーズにはチェックマークを表示して進捗を示す。

**受け入れ基準:**
- 完了フェーズのドットが`PHASE_COMPLETED`色（`0x10B981`）で表示されること
- チェックマーク（✓）が重ねて表示されること

**テストケース:**
```typescript
it('完了フェーズのインジケーターが完了スタイルになること', () => {
  footerUI.create();
  footerUI.update({
    ...defaultState,
    currentPhase: 'ALCHEMY',
    completedPhases: ['QUEST_ACCEPT', 'GATHERING']
  });
  // 完了フェーズが緑色+チェックマークになっていることを検証
});

it('未到達フェーズのインジケーターがグレーアウトされること', () => {
  footerUI.create();
  footerUI.update({ ...defaultState, currentPhase: 'QUEST_ACCEPT' });
  // GATHERING, ALCHEMY, DELIVERYがグレー色になっていることを検証
});
```

---

#### REQ-047-17: 手札表示エリアのプレースホルダーを5つ表示すること 🔵

**説明:** 手札カードを表示するための5つのプレースホルダー枠を表示する。

**受け入れ基準:**
- 5つのRectangle（カード枠）が生成されること
- 等間隔で横並びに配置されること
- カード未配置時は薄いグレー色で表示されること

**テストケース:**
```typescript
it('手札表示エリアのプレースホルダーが5つ生成されること', () => {
  footerUI.create();
  const handPlaceholders = footerUI['handPlaceholders'];
  expect(handPlaceholders).toHaveLength(5);
});
```

---

#### REQ-047-18: 「次へ」ボタンを表示すること 🔵

**説明:** 次のフェーズへ進むためのボタンを表示する。

**受け入れ基準:**
- `create()`メソッド呼び出し後、`nextButton`フィールドが`null`ではないこと
- クリック可能なインタラクティブ領域が設定されていること
- ホバー時に視覚的フィードバックがあること

**テストケース:**
```typescript
it('次へボタンが生成されること', () => {
  footerUI.create();
  const nextButton = footerUI['nextButton'];
  expect(nextButton).not.toBeNull();
});
```

---

#### REQ-047-19: 「次へ」ボタンのラベルがフェーズに応じて変化すること 🔵

**説明:** 現在のフェーズに応じて次へボタンのラベルを動的に変更する。

**受け入れ基準:**
- QUEST_ACCEPT: 「採取へ」
- GATHERING: 「調合へ」
- ALCHEMY: 「納品へ」
- DELIVERY: 「日終了」

**テストケース:**
```typescript
it('ボタンラベルがフェーズに応じて変化すること', () => {
  footerUI.create();

  footerUI.update({ ...defaultState, currentPhase: 'QUEST_ACCEPT' });
  expect(footerUI['nextButton'].getAt(1).text).toBe('採取へ');

  footerUI.update({ ...defaultState, currentPhase: 'GATHERING' });
  expect(footerUI['nextButton'].getAt(1).text).toBe('調合へ');
});

it('無効時にボタンがグレーアウトされること', () => {
  footerUI.create();
  footerUI.setNextButtonEnabled(false);
  // ボタンの色が disabled 色になっていることを検証
});
```

---

## 3. 非機能要件

### NFR-047-01: テスト容易性

**説明:** すべての視覚要素がテストで検証可能であること。

**受け入れ基準:**
- 各GameObjectへのアクセスがプライベートフィールド経由で可能であること
- Phaserモックを使用したユニットテストが実行可能であること
- テストカバレッジが80%以上であること

---

### NFR-047-02: 既存テストとの互換性

**説明:** 既存テストが引き続きパスすること。

**受け入れ基準:**
- TASK-0046で作成されたテストがすべてパスすること
- 既存のロジック・状態管理が破壊されないこと

---

### NFR-047-03: 更新メソッドの動作

**説明:** update()メソッド呼び出し時に表示が更新されること。

**受け入れ基準:**
- `update(state)`呼び出しで関連する視覚要素が更新されること
- 変更がない場合は不要な再描画を行わないこと（パフォーマンス考慮）

---

## 4. 設計仕様

### 4.1 カラー定数

```typescript
const UI_COLORS = {
  // ステータス色
  RED: 0xFF6B6B,       // 昇格ゲージ0-29%、残り日数4-5日
  YELLOW: 0xFFD93D,    // 昇格ゲージ30-59%、残り日数6-10日
  GREEN: 0x6BCB77,     // 昇格ゲージ60-99%
  CYAN: 0x4ECDC4,      // 昇格ゲージ100%
  WHITE: 0xFFFFFF,     // 残り日数11日以上
  BRIGHT_RED: 0xFF0000, // 残り日数1-3日（点滅用）

  // 背景色
  BACKGROUND: 0x1F2937,
  BACKGROUND_LIGHT: 0x374151,

  // テキスト色
  TEXT_PRIMARY: 0xFFFFFF,
  TEXT_SECONDARY: 0x9CA3AF,
  TEXT_MUTED: 0x6B7280,

  // フェーズインジケーター
  PHASE_PENDING: 0x6B7280,   // 未到達（グレー）
  PHASE_CURRENT: 0x6366F1,   // 現在（プライマリ）
  PHASE_COMPLETED: 0x10B981, // 完了（緑）
};
```

### 4.2 レイアウト定数

```typescript
const LAYOUT = {
  SIDEBAR_WIDTH: 200,
  HEADER_HEIGHT: 60,
  FOOTER_HEIGHT: 160,
  PHASE_INDICATOR_HEIGHT: 40,
  HAND_AREA_HEIGHT: 120,
};
```

### 4.3 昇格ゲージ色判定ロジック

```typescript
function getGaugeColor(percentage: number): number {
  if (percentage >= 100) return UI_COLORS.CYAN;
  if (percentage >= 67) return UI_COLORS.GREEN;
  if (percentage >= 34) return UI_COLORS.YELLOW;
  return UI_COLORS.RED;
}
```

### 4.4 残り日数色判定ロジック

```typescript
function getDaysColor(remainingDays: number): number {
  if (remainingDays >= 11) return UI_COLORS.WHITE;
  if (remainingDays >= 6) return UI_COLORS.YELLOW;
  if (remainingDays >= 4) return UI_COLORS.RED;
  return UI_COLORS.BRIGHT_RED; // 点滅対象
}
```

---

## 5. テストケースサマリー

### 5.1 HeaderUI視覚テスト（16ケース）

| テストID | テストケース | 対応要件 |
|----------|-------------|---------|
| HUI-V-01 | ランク表示テキストが生成されること | REQ-047-01 |
| HUI-V-02 | ランク更新時にテキストが変更されること | REQ-047-01 |
| HUI-V-03 | 昇格ゲージの背景バーが生成されること | REQ-047-02 |
| HUI-V-04 | 昇格ゲージのフィルバーが生成されること | REQ-047-02 |
| HUI-V-05 | 昇格ゲージ更新時にバー幅が変更されること | REQ-047-02 |
| HUI-V-06 | 昇格ゲージ30%未満で赤色になること | REQ-047-03 |
| HUI-V-07 | 昇格ゲージ30-59%で黄色になること | REQ-047-03 |
| HUI-V-08 | 昇格ゲージ60-99%で緑色になること | REQ-047-03 |
| HUI-V-09 | 昇格ゲージ100%で水色になること | REQ-047-03 |
| HUI-V-10 | 残り日数テキストが生成されること | REQ-047-04 |
| HUI-V-11 | 残り日数に応じて色が変化すること | REQ-047-04 |
| HUI-V-12 | 残り日数3日以下で点滅フラグがtrueになること | REQ-047-05 |
| HUI-V-13 | 所持金テキストが生成されること | REQ-047-06 |
| HUI-V-14 | 所持金更新時にテキストが変更されること | REQ-047-06 |
| HUI-V-15 | 行動ポイントテキストが生成されること | REQ-047-07 |
| HUI-V-16 | 行動ポイント更新時にテキストが変更されること | REQ-047-07 |

### 5.2 SidebarUI視覚テスト（8ケース）

| テストID | テストケース | 対応要件 |
|----------|-------------|---------|
| SUI-V-01 | 受注依頼セクションヘッダーが生成されること | REQ-047-08 |
| SUI-V-02 | 素材セクションヘッダーが生成されること | REQ-047-09 |
| SUI-V-03 | 完成品セクションヘッダーが生成されること | REQ-047-10 |
| SUI-V-04 | セクション折りたたみ時にアイコンが変化すること | REQ-047-11 |
| SUI-V-05 | 保管容量テキストが生成されること | REQ-047-12 |
| SUI-V-06 | 保管容量更新時にテキストが変更されること | REQ-047-12 |
| SUI-V-07 | ショップボタンが生成されること | REQ-047-13 |
| SUI-V-08 | ショップボタンがクリック可能であること | REQ-047-13 |

### 5.3 FooterUI視覚テスト（10ケース）

| テストID | テストケース | 対応要件 |
|----------|-------------|---------|
| FUI-V-01 | フェーズインジケーターが4つ生成されること | REQ-047-14 |
| FUI-V-02 | 現在フェーズのインジケーターがハイライトされること | REQ-047-15 |
| FUI-V-03 | 完了フェーズのインジケーターが完了スタイルになること | REQ-047-16 |
| FUI-V-04 | 未到達フェーズのインジケーターがグレーアウトされること | REQ-047-16 |
| FUI-V-05 | 手札表示エリアのプレースホルダーが5つ生成されること | REQ-047-17 |
| FUI-V-06 | 次へボタンが生成されること | REQ-047-18 |
| FUI-V-07 | 次へボタンがクリック可能であること | REQ-047-18 |
| FUI-V-08 | ボタンラベルがQUEST_ACCEPTフェーズで「採取へ」になること | REQ-047-19 |
| FUI-V-09 | ボタンラベルがGATHERINGフェーズで「調合へ」になること | REQ-047-19 |
| FUI-V-10 | 無効時にボタンがグレーアウトされること | REQ-047-19 |

---

## 6. 実装計画

### 6.1 ステップ1: HeaderUI視覚実装（1.5時間）

1. **背景描画**
   - `this.background = this.scene.add.graphics()`
   - 背景色で矩形を描画

2. **ランクテキスト生成**
   - `this.rankText = this.scene.add.text(x, y, 'ランク: G', textStyle)`

3. **昇格ゲージ実装**
   - 背景バー（固定幅のGraphics）
   - フィルバー（進捗に応じた幅のGraphics）

4. **update()での視覚更新**
   - ランクテキスト更新
   - ゲージ幅・色更新
   - 日数テキスト・色更新
   - 所持金・APテキスト更新

### 6.2 ステップ2: SidebarUI視覚実装（1時間）

1. **保管容量テキスト追加**
   - `this.storageText = this.scene.add.text(x, y, '保管: 0/20', textStyle)`

2. **ショップボタン追加**
   - Rectangle（背景）+ Text（ラベル）をContainerにまとめる
   - `setInteractive()`でクリック可能に

### 6.3 ステップ3: FooterUI視覚実装（1.5時間）

1. **フェーズインジケーター実装**
   - 4つのCircle（ドット）を生成
   - 接続ラインをGraphicsで描画

2. **手札表示エリア実装**
   - 5つのRectangle（プレースホルダー）を生成

3. **次へボタン実装**
   - Rectangle + Textの組み合わせ
   - フェーズに応じたラベル変更ロジック

---

## 7. 関連ファイル

### 7.1 実装対象ファイル

| ファイルパス | 変更種別 |
|-------------|---------|
| `src/presentation/ui/main/HeaderUI.ts` | 修正 |
| `src/presentation/ui/main/SidebarUI.ts` | 修正 |
| `src/presentation/ui/main/FooterUI.ts` | 修正 |

### 7.2 テストファイル

| ファイルパス | 変更種別 |
|-------------|---------|
| `tests/unit/presentation/ui/main/HeaderUI.visual.spec.ts` | 新規作成 |
| `tests/unit/presentation/ui/main/SidebarUI.visual.spec.ts` | 新規作成 |
| `tests/unit/presentation/ui/main/FooterUI.visual.spec.ts` | 新規作成 |

### 7.3 参照ファイル

| ファイルパス | 用途 |
|-------------|------|
| `src/presentation/ui/components/BaseComponent.ts` | 基底クラス |
| `src/presentation/ui/theme.ts` | テーマ定義 |
| `tests/setup.ts` | テストセットアップ・モック |
| `docs/design/atelier-guild-rank/ui-design/screens/common-components.md` | 設計文書 |

---

## 8. 受け入れ条件チェックリスト

- [ ] HeaderUIのすべての表示要素が画面に描画される
- [ ] SidebarUIのすべての表示要素が画面に描画される
- [ ] FooterUIのすべての表示要素が画面に描画される
- [ ] 各コンポーネントのupdate()呼び出しで表示が正しく更新される
- [ ] 既存のテストがすべてパスする
- [ ] 新規テストがすべてパスする
- [ ] テストカバレッジが80%以上を維持している
- [ ] 「新規ゲーム」クリック後にMainSceneの4分割レイアウトが表示される
- [ ] `pnpm lint`でエラーがないこと

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-22 | 初版作成 |
