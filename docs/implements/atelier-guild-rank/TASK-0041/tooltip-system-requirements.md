# TDD要件定義書: ツールチップ表示システム

**作成日**: 2026-01-19
**タスクID**: TASK-0041
**機能名**: ツールチップ表示システム (tooltip-system)
**要件名**: atelier-guild-rank
**フェーズ**: Phase 5 - UI強化・ポリッシュ

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

### 何をする機能か

🟡 **ゲーム全体で使用可能なツールチップ表示システム**

- ユーザーがUI要素（カード、アイテム、ボタンなど）にホバーした際に、詳細情報をポップアップ表示する
- 表示遅延機能により、意図しない一瞬のホバーでは表示されない
- 画面端を自動検知し、ツールチップが画面外に出ないよう位置を調整する
- シングルトンパターンで実装し、シーン間で再利用可能

### どのような問題を解決するか

🟡 **ユーザーの理解を助ける情報提供**

**As a** プレイヤー
**I want** カードやアイテムにホバーしたときに詳細情報を見たい
**So that** ゲームの仕様や効果を理解しやすくなる

**解決する課題**:
- カード効果の詳細説明が必要
- アイテムのステータス情報を確認したい
- UI要素の機能説明を提供したい
- 画面スペースを節約しながら情報を表示したい

### 想定されるユーザー

🟡 **全てのプレイヤー**

- 新規プレイヤー: ゲームの仕様を学習中
- 経験者プレイヤー: 詳細情報を素早く確認
- デバッグ時の開発者: UI要素の動作確認

### システム内での位置づけ

🟡 **Presentation層の共通UIコンポーネント**

- **アーキテクチャ**: Clean Architecture - Presentation層
- **配置**: `atelier-guild-rank/src/presentation/ui/components/TooltipManager.ts`
- **依存関係**:
  - Phaser.Scene（シーン管理）
  - Phaser.GameObjects（UI要素の描画）
  - rexUIプラグイン（将来的な拡張の可能性）
- **利用シーン**:
  - MainScene（メインゲーム画面）
  - ShopScene（ショップ画面）
  - RankUpScene（昇格試験画面）
  - その他すべてのゲームシーン

### 参照したEARS要件

🔴 **EARS要件定義書は直接参照されていない**

TASK-0041はTASK-0020の推奨条件から派生したタスクであり、直接的なEARS要件定義書は存在しない。

### 参照した設計文書

🟡 **UI設計書およびコンポーネント設計書から推測**

- `docs/design/atelier-guild-rank/ui-design/overview.md` - セクション7「ツールチップコンポーネント」
- `docs/design/atelier-guild-rank/ui-design/screens/common-components.md` - セクション7「ツールチップコンポーネント」
- `atelier-guild-rank/src/presentation/ui/theme.ts` - カラーパレット
- `atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts` - コンポーネント基底クラス

---

## 2. 入力・出力の仕様（EARS機能要件・TypeScript型定義ベース）

### 入力パラメータ

🟡 **TooltipConfig インターフェース**

```typescript
export interface TooltipConfig {
  content: string | TooltipContent;  // ツールチップに表示する内容
  x: number;                         // 表示X座標
  y: number;                         // 表示Y座標
  delay?: number;                    // 表示遅延（ms）デフォルト: 500ms
  maxWidth?: number;                 // 最大幅（px）デフォルト: 200px
}

export interface TooltipContent {
  title?: string;                    // タイトル（省略可）
  description: string;               // 説明文（必須）
  stats?: Record<string, string | number>;  // ステータス情報（省略可）
}

export enum TooltipPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  AUTO = 'auto',                     // 画面端に応じて自動調整
}
```

**パラメータの詳細**:

| パラメータ | 型 | 制約 | デフォルト値 | 説明 |
|-----------|-----|------|-------------|------|
| `content` | `string \| TooltipContent` | 必須 | - | シンプルなテキストまたは構造化コンテンツ |
| `x` | `number` | 必須、0以上 | - | 表示X座標（画面左上基準） |
| `y` | `number` | 必須、0以上 | - | 表示Y座標（画面左上基準） |
| `delay` | `number` | 省略可、0以上 | 500 | ホバー後の表示遅延（ミリ秒） |
| `maxWidth` | `number` | 省略可、50以上 | 200 | ツールチップの最大幅（ピクセル） |

**TooltipContentの詳細**:

| プロパティ | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| `title` | `string` | 省略可、最大30文字 | ツールチップのタイトル |
| `description` | `string` | 必須、最大200文字 | 説明文 |
| `stats` | `Record<string, string \| number>` | 省略可 | キー・バリュー形式のステータス情報 |

### 出力値

🟡 **TooltipManagerの戻り値**

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getInstance()` | `TooltipManager` | シングルトンインスタンスを返す |
| `initialize(scene)` | `void` | シーンを初期化（副作用あり） |
| `show(config)` | `void` | ツールチップを表示（副作用あり） |
| `hide()` | `void` | ツールチップを非表示（副作用あり） |

**表示状態**:
- 表示前: `tooltip.visible = false`
- 表示中: `tooltip.visible = true`、depth = 500-600
- 非表示後: `tooltip.visible = false`

### 入出力の関係性

🟡 **show()メソッドの処理フロー**

```
入力: TooltipConfig
  ↓
1. 既存のタイムアウトをクリア
  ↓
2. delay時間後にdisplayTooltip()を呼び出す
  ↓
3. コンテンツを更新（updateContent）
  ↓
4. 表示位置を調整（updatePosition）
  ↓
5. tooltip.setVisible(true)
  ↓
出力: ツールチップが画面に表示される
```

**hide()メソッドの処理フロー**:

```
入力: なし
  ↓
1. タイムアウトをクリア
  ↓
2. tooltip.setVisible(false)
  ↓
出力: ツールチップが非表示になる
```

### データフロー

🟡 **ツールチップ表示のデータフロー**

```
UI要素（カード、ボタンなど）
  ↓ onPointerOver イベント
TooltipManager.show(config)
  ↓
表示遅延タイマー（500ms）
  ↓
displayTooltip(config)
  ↓ updateContent()
Phaser.GameObjects.Text（コンテンツ更新）
  ↓ updatePosition()
座標調整（画面端チェック）
  ↓
Phaser.GameObjects.Container.setVisible(true)
  ↓
ツールチップが画面に表示される
```

### 参照したEARS要件

🔴 **直接的なEARS要件は存在しない**

TASK-0041は設計書から推測された機能であり、EARS形式の要件定義書は参照されていない。

### 参照した設計文書

🟡 **UI設計書の型定義を参照**

- `docs/design/atelier-guild-rank/ui-design/overview.md` - TooltipProps, TooltipContent, TooltipPosition
- `docs/design/atelier-guild-rank/ui-design/screens/common-components.md` - ツールチップインターフェース定義

---

## 3. 制約条件（EARS非機能要件・アーキテクチャ設計ベース）

### パフォーマンス要件

🟡 **NFR-001: 表示遅延（推測）**

- **要件**: ツールチップの表示遅延はデフォルト500msとする
- **根拠**: ユーザビリティを考慮し、意図しない一瞬のホバーでは表示されないようにする
- **カスタマイズ**: `TooltipConfig.delay`で変更可能

🟡 **NFR-002: メモリ管理（推測）**

- **要件**: ツールチップは1つのインスタンスを使い回し、複数のツールチップを同時に生成しない
- **根拠**: メモリ使用量を最小化し、パフォーマンスを維持する
- **実装**: シングルトンパターン

🟡 **NFR-003: 描画パフォーマンス（推測）**

- **要件**: ツールチップの表示・非表示は60FPSを維持する
- **根拠**: ゲーム体験を損なわないための最低要件
- **実装**: Phaserの描画エンジンに依存

### セキュリティ要件

🟡 **SEC-001: XSS防止（推測）**

- **要件**: ツールチップに表示するテキストはサニタイズ不要
- **根拠**: クライアント側のみで動作し、外部入力を受け付けない
- **注意**: 将来的にサーバーからテキストを取得する場合は要対応

### 互換性要件

🟡 **REQ-001: Phaser 3互換性（推測）**

- **要件**: Phaser 3.87以上で動作する
- **根拠**: プロジェクトの技術スタック要件
- **制約**: Phaser 2では動作しない

🟡 **REQ-002: rexUI互換性（推測）**

- **要件**: rexUI 1.80.0以上で動作する（将来的な拡張用）
- **根拠**: 既存UIコンポーネントとの統一性
- **制約**: 現時点ではrexUIを直接使用しない（Phaser標準のGameObjectsのみ使用）

### アーキテクチャ制約

🟡 **ARCH-001: Clean Architecture遵守**

- **要件**: Presentation層に配置し、Domain層やApplication層には依存しない
- **根拠**: プロジェクトのアーキテクチャ方針
- **配置**: `atelier-guild-rank/src/presentation/ui/components/TooltipManager.ts`

🟡 **ARCH-002: シングルトンパターン**

- **要件**: TooltipManagerはシングルトンとして実装する
- **根拠**: ゲーム全体で1つのツールチップインスタンスを共有
- **実装**: `getInstance()`メソッド、privateコンストラクタ

🟡 **ARCH-003: depth管理**

- **要件**: ツールチップのdepthは500-600に設定する
- **根拠**: 最前面に表示し、他のUI要素に隠れないようにする
- **参考**: UI設計書のレイヤー構成

| レイヤー | depth | 内容 |
|---------|-------|------|
| Background | 0 | 背景画像・パターン |
| Content | 100 | メインコンテンツ |
| Sidebar | 150 | サイドバー |
| Header/Footer | 200 | ヘッダー・フッター |
| Overlay | 300 | オーバーレイ・ダイアログ背景 |
| Dialog | 400 | モーダルダイアログ |
| **Tooltip** | **500-600** | **ツールチップ（最前面）** |

### データベース制約

🔵 **該当なし**

ツールチップは表示のみの機能であり、データベースには依存しない。

### API制約

🔵 **該当なし**

ツールチップはクライアント側のUI表示のみであり、APIには依存しない。

### 参照したEARS要件

🔴 **直接的なEARS非機能要件は存在しない**

TASK-0041の非機能要件は、設計文書およびプロジェクトの一般的なルールから推測されている。

### 参照した設計文書

🟡 **アーキテクチャ設計書およびUI設計書から推測**

- `docs/design/atelier-guild-rank/ui-design/overview.md` - UIレイヤー構成、depth管理
- `docs/design/atelier-guild-rank/ui-design/screens/common-components.md` - パフォーマンス最適化セクション
- `CLAUDE.md` - Clean Architectureの遵守、テスト要件
- `atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts` - メモリ管理パターン

---

## 4. 想定される使用例（EARSEdgeケース・データフローベース）

### 基本的な使用パターン

🟡 **USE-001: カードホバー時の詳細表示**

```typescript
// カードコンポーネントでの使用例
export class CardComponent {
  private tooltipManager: TooltipManager;

  constructor(scene: Phaser.Scene) {
    this.tooltipManager = TooltipManager.getInstance();
    this.tooltipManager.initialize(scene);
  }

  private setupTooltip(cardData: CardData): void {
    this.cardContainer.on('pointerover', (pointer: Phaser.Input.Pointer) => {
      this.tooltipManager.show({
        content: {
          title: cardData.name,
          description: cardData.description,
          stats: {
            'コスト': cardData.cost,
            '効果': cardData.effect,
            'レアリティ': cardData.rarity,
          },
        },
        x: pointer.x + 10,
        y: pointer.y + 10,
        delay: 500,
        maxWidth: 250,
      });
    });

    this.cardContainer.on('pointerout', () => {
      this.tooltipManager.hide();
    });
  }
}
```

**期待される動作**:
1. ユーザーがカードにホバー
2. 500ms後にツールチップが表示される
3. カードの名前、説明、ステータス情報が表示される
4. ホバーを外すと即座に非表示になる

🟡 **USE-002: アイテムホバー時の情報表示**

```typescript
// アイテムコンポーネントでの使用例
this.itemIcon.on('pointerover', (pointer: Phaser.Input.Pointer) => {
  TooltipManager.getInstance().show({
    content: item.description,  // シンプルなテキスト表示
    x: pointer.x,
    y: pointer.y - 10,
    delay: 300,  // より短い遅延
  });
});

this.itemIcon.on('pointerout', () => {
  TooltipManager.getInstance().hide();
});
```

**期待される動作**:
1. ユーザーがアイテムアイコンにホバー
2. 300ms後にシンプルなテキストツールチップが表示される
3. ホバーを外すと即座に非表示になる

### データフロー

🟡 **FLOW-001: 通常のツールチップ表示フロー**

```
ユーザー
  ↓ マウスホバー
UI要素（カード、アイテムなど）
  ↓ pointerover イベント
TooltipManager.show(config)
  ↓
タイマー設定（delay ms）
  ↓ タイムアウト
displayTooltip(config)
  ↓
updateContent(content, maxWidth)
  - テキストを生成/更新
  - 背景サイズを調整
  ↓
updatePosition(x, y)
  - 画面端チェック
  - 座標調整
  ↓
tooltip.setVisible(true)
  ↓
ツールチップが画面に表示される
```

### エッジケース

🟡 **EDGE-001: 画面右端でのツールチップ表示**

**Given**: ツールチップを画面右端付近に表示しようとする
**When**: `show({ x: 750, y: 300 })`を呼び出す（画面幅800pxの場合）
**Then**: ツールチップが左側に表示されるよう自動調整される

```typescript
// 期待される動作
if (x + bounds.width > camera.width) {
  x = x - bounds.width - 10;  // 左側に表示
}
```

🟡 **EDGE-002: 画面下端でのツールチップ表示**

**Given**: ツールチップを画面下端付近に表示しようとする
**When**: `show({ x: 300, y: 550 })`を呼び出す（画面高さ600pxの場合）
**Then**: ツールチップが上側に表示されるよう自動調整される

```typescript
// 期待される動作
if (y + bounds.height > camera.height) {
  y = y - bounds.height - 10;  // 上側に表示
}
```

🟡 **EDGE-003: 画面左上端でのツールチップ表示**

**Given**: ツールチップを画面左上端に表示しようとする
**When**: `show({ x: -10, y: -10 })`を呼び出す
**Then**: ツールチップが画面内に収まるよう調整される

```typescript
// 期待される動作
x = Math.max(10, x);  // 最小マージン10px
y = Math.max(10, y);
```

🟡 **EDGE-004: 連続ホバー時の表示タイミング**

**Given**: ツールチップの表示遅延が500msに設定されている
**When**: ユーザーが300ms後にホバーを外す
**Then**: ツールチップは表示されない（タイムアウトがキャンセルされる）

```typescript
// 期待される動作
hide(): void {
  if (this.showTimeout) {
    clearTimeout(this.showTimeout);  // タイムアウトをキャンセル
    this.showTimeout = null;
  }
  this.tooltip?.setVisible(false);
}
```

🟡 **EDGE-005: 既に表示中のツールチップに対するshow()呼び出し**

**Given**: ツールチップが既に表示されている
**When**: 別のUI要素にホバーして`show()`を呼び出す
**Then**: 既存のタイムアウトがキャンセルされ、新しいツールチップが表示される

```typescript
// 期待される動作
show(config: TooltipConfig): void {
  if (this.showTimeout) {
    clearTimeout(this.showTimeout);  // 既存のタイムアウトをキャンセル
  }
  // 新しいタイムアウトを設定
}
```

### エラーケース

🟡 **ERROR-001: 初期化前のshow()呼び出し**

**Given**: TooltipManagerが初期化されていない（`initialize()`未呼び出し）
**When**: `show(config)`を呼び出す
**Then**: エラーを起こさず、静かに無視する

```typescript
// 期待される動作
private displayTooltip(config: TooltipConfig): void {
  if (!this.tooltip || !this.scene) return;  // 早期リターン
  // ...
}
```

🟡 **ERROR-002: contentが空文字列**

**Given**: `content: ""`で`show()`を呼び出す
**When**: ツールチップを表示しようとする
**Then**: ツールチップは表示されるが、コンテンツは空（今後の拡張で検証を追加予定）

🟡 **ERROR-003: 負の座標値**

**Given**: `x: -50, y: -50`で`show()`を呼び出す
**When**: 表示位置を調整する
**Then**: 座標が最小値（10, 10）に補正される

```typescript
// 期待される動作
x = Math.max(10, x);
y = Math.max(10, y);
```

### 参照したEARS要件

🔴 **直接的なEARS Edgeケース要件は存在しない**

TASK-0041のエッジケースは、標準的なUIパターンと設計文書から推測されている。

### 参照した設計文書

🟡 **UI設計書およびコンポーネント設計書から推測**

- `docs/design/atelier-guild-rank/ui-design/overview.md` - ツールチップの動作仕様
- `docs/design/atelier-guild-rank/ui-design/screens/common-components.md` - ワイヤーフレーム、使用例
- `atelier-guild-rank/src/presentation/ui/components/Button.ts` - ホバーエフェクトの参考実装
- `atelier-guild-rank/src/presentation/ui/components/Dialog.ts` - アニメーション実装の参考

---

## 5. EARS要件・設計文書との対応関係

### 参照したユーザストーリー

🔴 **直接的なユーザストーリーは存在しない**

TASK-0041はTASK-0020（MainScene共通レイアウト）の推奨条件から派生したタスクであり、独立したユーザストーリーは定義されていない。

**推測されるユーザストーリー**:

```
As a プレイヤー
I want カードやアイテムにホバーしたときに詳細情報を見たい
So that ゲームの仕様や効果を理解しやすくなる
```

### 参照した機能要件

🔴 **直接的なEARS機能要件は存在しない**

TASK-0041の機能要件は、UI設計書から推測されている。

### 参照した非機能要件

🔴 **直接的なEARS非機能要件は存在しない**

TASK-0041の非機能要件は、プロジェクトの一般的なルールと設計文書から推測されている。

### 参照したEdgeケース

🔴 **直接的なEARS Edgeケース要件は存在しない**

TASK-0041のEdgeケースは、標準的なUIパターンから推測されている。

### 参照した受け入れ基準

🟡 **TASK-0041の完了条件**

- [ ] TooltipManagerシングルトン実装
- [ ] ツールチップ表示/非表示機能
- [ ] 表示位置の自動調整（画面端対応）
- [ ] 表示遅延設定機能
- [ ] 単体テスト実装

### 参照した設計文書

🟡 **以下の設計文書を参照**

#### アーキテクチャ

- `CLAUDE.md` - Clean Architectureの4層構造、依存方向
- `atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts` - コンポーネント基底クラス

#### データフロー

- `docs/design/atelier-guild-rank/ui-design/overview.md` - ツールチップの動作フロー
- `docs/design/atelier-guild-rank/ui-design/screens/common-components.md` - UI要素との連携

#### 型定義

🟡 **UI設計書から推測された型定義**

```typescript
// docs/design/atelier-guild-rank/ui-design/overview.md - セクション7
interface TooltipProps {
  content: string | TooltipContent;
  position: TooltipPosition;
  delay: number;
  maxWidth: number;
}

interface TooltipContent {
  title?: string;
  description: string;
  stats?: Record<string, string | number>;
}

enum TooltipPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  AUTO = 'auto',
}
```

#### データベース

🔵 **該当なし**

ツールチップはデータベースを使用しない。

#### API仕様

🔵 **該当なし**

ツールチップはAPIを使用しない。

---

## 6. 実装の優先順位

### 必須機能（MVP）

1. **TooltipManagerシングルトン実装**
2. **基本的な表示/非表示機能**
3. **表示遅延機能**
4. **画面端での自動位置調整**

### 推奨機能（今後の拡張）

1. **rexUIを使用した高度なレイアウト**
2. **フェードイン/フェードアウトアニメーション**
3. **複数行の整形されたコンテンツ**
4. **アイコン表示機能**

### オプション機能（将来的な検討）

1. **オブジェクトプールによるパフォーマンス最適化**
2. **カスタムテーマ対応**
3. **多言語対応**

---

## 7. 実装時の注意事項

### 技術的制約

🟡 **rexUIプラグインの利用**

- rexUIはPhaser 3のプラグインであり、型定義が複雑
- 現時点ではPhaser標準のGameObjectsのみを使用
- 将来的な拡張でrexUIを導入する可能性あり

🟡 **depth管理**

- ツールチップは最前面に表示する必要がある
- depth: 500〜600を設定（Toast同等または上）

🟡 **座標の境界チェック**

- 画面端からはみ出さないよう、表示位置を自動調整
- `scene.cameras.main.width/height`で画面サイズを取得

🟡 **メモリリーク防止**

- destroy()でイベントリスナーを全て削除
- タイムアウトを適切にクリア

### セキュリティ要件

🟡 **クライアント側の表示処理のみ**

- ツールチップ表示はクライアント側の表示処理のみ
- 外部入力を受け付けないため、特別なセキュリティ要件なし

### パフォーマンス要件

🟡 **表示遅延**

- デフォルト遅延: 500ms（ユーザビリティを考慮）
- カスタマイズ可能にする

🟡 **シングルトンパターン**

- TooltipManagerをシングルトンとして実装
- 複数のツールチップを同時に表示しない

---

## 8. テスト戦略

### 単体テスト

- TooltipManagerのシングルトン動作
- show()、hide()メソッドの動作
- 表示位置の自動調整ロジック
- 表示遅延のタイミング

### 統合テスト（将来的な拡張）

- MainSceneでの実際の表示確認
- カードホバー時のツールチップ表示
- 画面端での位置調整

### テストファイル配置

- `tests/unit/presentation/ui/components/TooltipManager.spec.ts`

---

## 9. 信頼性レベルサマリー

### 項目別信頼性

| カテゴリ | 🔵 青 | 🟡 黄 | 🔴 赤 | 合計 |
|---------|-------|-------|-------|------|
| 機能の概要 | 0 | 4 | 1 | 5 |
| 入力・出力の仕様 | 0 | 5 | 1 | 6 |
| 制約条件 | 2 | 8 | 1 | 11 |
| 想定される使用例 | 0 | 10 | 1 | 11 |
| EARS要件との対応 | 2 | 3 | 5 | 10 |

### 全体評価

- **総項目数**: 43項目
- 🔵 **青信号**: 4項目 (9%)
- 🟡 **黄信号**: 30項目 (70%)
- 🔴 **赤信号**: 9項目 (21%)

### 品質評価

⚠️ **要改善**

**理由**:
- EARS要件定義書が存在しないため、🔴（赤信号）が21%
- UI設計書から妥当な推測が多く、🟡（黄信号）が70%
- 直接的なEARS要件がないため、実装時にユーザー意図の確認が必要

**推奨アクション**:
1. ユーザーストーリーを正式に定義する
2. UI設計書の内容を元にEARS要件定義書を作成する
3. テストケースを洗い出し、受け入れ基準を明確化する

---

## 10. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-19 | 1.0.0 | 初版作成 |
