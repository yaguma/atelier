# TASK-0042: カードドラッグ＆ドロップ機能 - 開発ノート

**作成日**: 2026-01-19
**タスクID**: TASK-0042
**要件名**: atelier-guild-rank
**機能名**: カードドラッグ＆ドロップ機能

---

## 1. 技術スタック

### 1.1 使用技術・フレームワーク

| 技術 | バージョン | 用途 |
|------|----------|------|
| **Phaser 3** | 3.87+ | ゲームエンジン |
| **rexUI Plugin** | 最新版 | UIコンポーネントライブラリ |
| **TypeScript** | 5.x | 型安全な開発 |
| **Vite** | 6.x | ビルドツール |
| **Vitest** | 2.x | テストフレームワーク |

**参照元**:
- docs/design/atelier-guild-rank/architecture-overview.md
- docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

### 1.2 アーキテクチャパターン

- **Clean Architecture**: レイヤー分離（Presentation / Application / Domain / Infrastructure）
- **Event-Driven Architecture**: EventBusを用いたコンポーネント間通信
- **Phaser Scene管理**: シーンベースの画面遷移
- **コンポーネントパターン**: 再利用可能なUIコンポーネント設計

**参照元**:
- docs/design/atelier-guild-rank/architecture-overview.md
- docs/design/atelier-guild-rank/architecture-components.md

### 1.3 Phaser入力システム

```typescript
// Phaserのドラッグ設定
gameObject.setInteractive({ draggable: true });

// ドラッグイベント
scene.input.on('dragstart', handler);
scene.input.on('drag', handler);
scene.input.on('dragend', handler);
```

**参照元**: docs/design/atelier-guild-rank/ui-design/input-system.md

---

## 2. 開発ルール

### 2.1 コーディング規約

#### ファイル構成

```
atelier-guild-rank/src/
├── presentation/
│   └── ui/
│       ├── theme.ts                     # テーマ定義
│       └── components/
│           ├── BaseComponent.ts         # 基底クラス
│           ├── CardUI.ts               # カードUI（既存）
│           ├── DraggableCardUI.ts      # ドラッグ可能カードUI（実装予定）
│           ├── DropZone.ts             # ドロップゾーン（実装予定）
│           └── DropZoneManager.ts      # ドロップゾーン管理（実装予定）
```

**参照元**:
- docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md
- atelier-guild-rank/src/presentation/ui/ （実装ファイル）

#### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| **クラス** | PascalCase | `DraggableCardUI`, `DropZoneManager` |
| **インターフェース** | PascalCase | `DraggableCardConfig`, `DropZone` |
| **定数** | UPPER_SNAKE_CASE | `DRAG_SCALE`, `DROP_ALPHA` |
| **変数** | camelCase | `isDragging`, `dragOffset` |
| **プライベートフィールド** | `private` キーワード | `private startPosition` |

**参照元**: TypeScriptコーディング規約、プロジェクト既存コード

### 2.2 プロジェクト固有のルール

#### BaseComponentの継承

- すべてのUIコンポーネントは `BaseComponent` を継承
- `create()` と `destroy()` メソッドを必ず実装
- `scene`, `container`, `rexUI` への参照を基底クラスから取得

```typescript
export class DraggableCardUI extends CardUI {
  constructor(scene: Phaser.Scene, config: DraggableCardConfig) {
    super(scene, config);
    // 初期化処理
  }

  create(): void {
    super.create();
    // ドラッグ機能の追加
  }

  destroy(): void {
    // クリーンアップ
    super.destroy();
  }
}
```

**参照元**:
- atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts
- docs/tasks/atelier-guild-rank/phase-3/TASK-0018.md

#### ドラッグ＆ドロップの設計方針

1. **CardUIを継承**: 既存のCardUIを拡張してドラッグ機能を追加
2. **ドロップゾーンの管理**: DropZoneManagerでドロップ先を一元管理
3. **視覚的フィードバック**: ドラッグ中の拡大、ドロップゾーンのハイライト
4. **元の位置に戻す**: ドロップ失敗時はアニメーションで元の位置に戻す

**参照元**:
- docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md
- docs/design/atelier-guild-rank/ui-design/input-system.md

---

## 3. 関連実装

### 3.1 依存タスク

#### TASK-0021: カードUIコンポーネント ✅ 完了

- **状態**: Phase 3完了（TDD開発完了）
- **内容**: CardUIコンポーネント実装
- **成果物**:
  - atelier-guild-rank/src/presentation/ui/components/CardUI.ts - カードUI（完成）
  - atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts - 基底クラス（完成）

**CardUIの主要機能**:
- カードタイプ別の背景色表示
- アイコン、名前、コスト、効果テキストの配置
- インタラクティブ機能（ホバー時の拡大、クリックイベント）

**参照元**:
- docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md
- docs/implements/atelier-guild-rank/TASK-0021/note.md
- atelier-guild-rank/src/presentation/ui/components/CardUI.ts

### 3.2 CardUIの実装詳細

#### CardUIの構造

```typescript
export class CardUI extends BaseComponent {
  private config: CardUIConfig;
  private card: Card;
  private background!: Phaser.GameObjects.Rectangle;
  private iconPlaceholder!: Phaser.GameObjects.Rectangle;
  private nameText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;
  private effectText!: Phaser.GameObjects.Text;

  // カードの寸法定数
  private static readonly CARD_WIDTH = 120;
  private static readonly CARD_HEIGHT = 160;
  private static readonly ICON_SIZE = 80;
  private static readonly PADDING = 8;
}
```

**参照元**: atelier-guild-rank/src/presentation/ui/components/CardUI.ts

#### CardUIConfigの定義

```typescript
export interface CardUIConfig {
  card: Card;              // 表示するカード
  x: number;               // X座標
  y: number;               // Y座標
  interactive?: boolean;   // インタラクティブにするか
  onClick?: (card: Card) => void;  // クリック時のコールバック
}
```

**参照元**: atelier-guild-rank/src/presentation/ui/components/CardUI.ts (行17-28)

### 3.3 類似機能の実装例

#### Phaserのドラッグ＆ドロップ基本実装

```typescript
// ドラッグ可能にする
this.background.setInteractive({ draggable: true });

// ドラッグイベントの設定
this.scene.input.on('dragstart', (pointer, gameObject) => {
  // ドラッグ開始時の処理
  gameObject.setScale(1.1);
  gameObject.setAlpha(0.8);
});

this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
  // ドラッグ中の処理
  gameObject.x = dragX;
  gameObject.y = dragY;
});

this.scene.input.on('dragend', (pointer, gameObject) => {
  // ドラッグ終了時の処理
  gameObject.setScale(1);
  gameObject.setAlpha(1);
});
```

**参照元**:
- Phaser公式ドキュメント
- docs/design/atelier-guild-rank/ui-design/input-system.md (3.3節)

---

## 4. 設計文書

### 4.1 ドラッグ可能カードUI設計

#### DraggableCardConfigインターフェース

```typescript
export interface DraggableCardConfig extends CardUIConfig {
  onDragStart?: (card: Card) => void;
  onDrag?: (card: Card, x: number, y: number) => void;
  onDrop?: (card: Card, zone: DropZone | null) => void;
}
```

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md (セクション1)

#### ドラッグ状態管理

```typescript
export class DraggableCardUI extends CardUI {
  private isDragging = false;
  private startPosition: { x: number; y: number } = { x: 0, y: 0 };
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
}
```

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

#### ドラッグ中の視覚効果

| 状態 | スケール | 透明度 | 深度 |
|------|---------|--------|------|
| **通常** | 1.0 | 1.0 | 0 |
| **ドラッグ中** | 1.1 | 0.8 | 100 |

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

### 4.2 ドロップゾーン設計

#### DropZoneインターフェース

```typescript
export interface DropZone {
  id: string;                    // ゾーンの識別子
  bounds: Phaser.Geom.Rectangle; // 判定領域
  accepts: (card: Card) => boolean;  // カード受け入れ判定
  onDrop: (card: Card) => void;  // ドロップ時の処理
}
```

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md (セクション2)

#### DropZoneManagerクラス

```typescript
export class DropZoneManager {
  private zones: Map<string, DropZone> = new Map();

  registerZone(zone: DropZone): void;
  unregisterZone(id: string): void;
  findZoneAt(x: number, y: number): DropZone | null;
  highlightValidZones(card: Card): void;
}
```

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

### 4.3 ドロップゾーンのハイライト表示

| ゾーン状態 | ハイライト色 | 枠線幅 |
|-----------|------------|--------|
| **受け入れ可能** | 0x00FF00（緑） | 3px |
| **受け入れ不可** | 0xFF0000（赤） | 3px |
| **通常（非ハイライト）** | なし | - |

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md (セクション3)

### 4.4 ユースケース

#### 手札からプレイエリアへのカード移動

1. プレイヤーが手札のカードをドラッグ開始
2. カードが拡大し、透明度が下がる
3. 有効なドロップゾーンが緑色にハイライト
4. ドロップゾーンにカードをドロップ
5. カードがプレイエリアに配置される

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

#### 調合画面での素材配置

1. プレイヤーがインベントリの素材をドラッグ開始
2. 素材が拡大し、透明度が下がる
3. 調合スロットがハイライト
4. スロットに素材をドロップ
5. 素材が調合スロットに配置される

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

---

## 5. 注意事項

### 5.1 技術的制約

#### Phaserのドラッグシステム

- `setInteractive({ draggable: true })` でドラッグ可能にする
- ドラッグイベントはSceneレベルで購読する
- ドラッグ中はGameObjectの位置を直接更新する

**参照元**:
- Phaser公式ドキュメント
- docs/design/atelier-guild-rank/ui-design/input-system.md

#### タッチデバイス対応

- マウスとタッチを統一的に扱う（Phaserが自動処理）
- タップ＆ホールドでドラッグ開始
- スワイプ操作と区別する

**参照元**:
- docs/design/atelier-guild-rank/ui-design/input-system.md (4.1節)
- docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

### 5.2 パフォーマンス要件

#### メモリ管理

- ドラッグ中のイベントリスナーを適切に削除
- Tweenアニメーションの完了を確認してから破棄
- ドロップゾーンの登録/解除を忘れない

```typescript
public destroy(): void {
  // ドラッグイベントリスナーを削除
  this.scene.input.off('dragstart', this.onDragStart, this);
  this.scene.input.off('drag', this.onDrag, this);
  this.scene.input.off('dragend', this.onDragEnd, this);

  // 親クラスのdestroy呼び出し
  super.destroy();
}
```

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

#### ドラッグ中の処理最適化

- ドラッグ中はフレームごとに更新されるため、重い処理を避ける
- ドロップゾーンの判定を効率的に行う（空間分割など）

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

### 5.3 ユーザビリティ

#### ドラッグ操作のフィードバック

- ドラッグ開始時に即座にスケール変更（100ms以内）
- ドロップゾーンのハイライトを明確に表示
- ドロップ失敗時は滑らかに元の位置に戻す（200ms、Power2イージング）

**参照元**:
- docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md
- atelier-guild-rank/src/presentation/ui/components/CardUI.ts（既存のホバーアニメーション参考）

---

## 6. テスト戦略

### 6.1 単体テストケース

| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| T-0042-01 | ドラッグ開始 | onDragStartコールバックが呼ばれる |
| T-0042-02 | ドラッグ中の視覚効果 | スケール1.1、透明度0.8、深度100 |
| T-0042-03 | ドロップ成功 | onDropコールバックがゾーン情報と共に呼ばれる |
| T-0042-04 | ドロップ失敗 | カードが元の位置にアニメーションで戻る |
| T-0042-05 | ドロップゾーン登録 | ゾーンが正しく登録される |
| T-0042-06 | ドロップゾーン判定 | 座標からゾーンを正しく検索できる |

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

### 6.2 統合テスト

- Phaserシーン内でのドラッグ＆ドロップ動作確認
- 複数のドロップゾーンが存在する場合の判定確認
- EventBusとの連携確認（カードドロップイベント）

**参照元**: docs/design/atelier-guild-rank/architecture-phaser.md

---

## 7. 実装優先度

### 7.1 Phase 1: DraggableCardUI実装（必須）

1. **CardUIの拡張** - CardUIを継承してドラッグ機能を追加
2. **ドラッグイベント処理** - dragstart, drag, dragend
3. **視覚的フィードバック** - スケール、透明度、深度変更

### 7.2 Phase 2: DropZone実装（必須）

1. **DropZoneインターフェース** - ドロップゾーンの定義
2. **DropZoneManager** - ドロップゾーンの登録と検索
3. **ドロップゾーンハイライト** - 受け入れ可能/不可の視覚化

### 7.3 Phase 3: 統合（必須）

1. **ドロップ処理** - findZoneAt()でゾーン検索、onDropコールバック実行
2. **ドロップ失敗処理** - 元の位置に戻るアニメーション
3. **エッジケース対応** - ドラッグキャンセル、複数カード同時ドラッグ防止

**参照元**: docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md

---

## 8. 参考リンク

### 8.1 設計文書

- docs/spec/atelier-guild-rank-requirements.md - 要件定義書
- docs/design/atelier-guild-rank/architecture-overview.md - アーキテクチャ概要
- docs/design/atelier-guild-rank/architecture-phaser.md - Phaser実装設計
- docs/design/atelier-guild-rank/ui-design/overview.md - UI設計概要
- docs/design/atelier-guild-rank/ui-design/input-system.md - 入力システム設計
- docs/design/atelier-guild-rank/ui-design/screens/common-components.md - 共通コンポーネント設計

### 8.2 タスク文書

- docs/tasks/atelier-guild-rank/phase-3/TASK-0021.md - カードUIコンポーネント（前提タスク）
- docs/tasks/atelier-guild-rank/phase-5/TASK-0042.md - 本タスク

### 8.3 実装ファイル

- atelier-guild-rank/src/presentation/ui/theme.ts - テーマ定義
- atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts - 基底クラス
- atelier-guild-rank/src/presentation/ui/components/CardUI.ts - カードUI（既存実装）
- atelier-guild-rank/src/domain/entities/Card.ts - カードエンティティ

---

## 9. 開発メモ

### 9.1 実装時の注意点

1. **CardUIを継承**: すべてのカードUI機能を引き継ぐ
2. **イベントリスナーの管理**: destroy時に必ず削除
3. **ドラッグオフセットの計算**: カードの中心を掴んだように見せる
4. **ドロップゾーンの深度**: カードより低い深度に配置（背景に見える）
5. **相対パス**: すべてのファイルパスはプロジェクトルートからの相対パスで記載

### 9.2 既存実装の活用

CardUIの既存機能を活用：

- **視覚的表現**: 背景、アイコン、テキストはそのまま使用
- **ホバーエフェクト**: 既存のTweenアニメーション設定を参考
- **クリックイベント**: onClickとonDragを両立させる

**既存実装の参考箇所**:
- atelier-guild-rank/src/presentation/ui/components/CardUI.ts (行249-297: setupInteraction)

### 9.3 よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| ドラッグが開始しない | draggable未設定 | setInteractive({ draggable: true }) |
| ドラッグ中カードが動かない | dragイベント未処理 | pointer位置にGameObjectを移動 |
| ドロップゾーンが反応しない | bounds設定ミス | Rectangle範囲を確認 |
| メモリリーク | イベントリスナー削除忘れ | destroy()で全イベント削除 |

---

## 10. 実装状況

### 10.1 実装予定コンポーネント

#### DraggableCardUI ⏳ 実装予定

- **ファイル**: atelier-guild-rank/src/presentation/ui/components/DraggableCardUI.ts
- **テスト**: atelier-guild-rank/src/presentation/ui/components/DraggableCardUI.spec.ts
- **機能**:
  - CardUIを拡張してドラッグ機能を追加
  - ドラッグイベント処理（dragstart, drag, dragend）
  - 視覚的フィードバック（スケール、透明度、深度）

#### DropZone ⏳ 実装予定

- **ファイル**: atelier-guild-rank/src/presentation/ui/components/DropZone.ts
- **テスト**: atelier-guild-rank/src/presentation/ui/components/DropZone.spec.ts
- **機能**:
  - ドロップゾーンの定義
  - 受け入れ判定ロジック
  - ハイライト表示

#### DropZoneManager ⏳ 実装予定

- **ファイル**: atelier-guild-rank/src/presentation/ui/components/DropZoneManager.ts
- **テスト**: atelier-guild-rank/src/presentation/ui/components/DropZoneManager.spec.ts
- **機能**:
  - ドロップゾーンの登録/解除
  - 座標からのゾーン検索
  - 有効なゾーンのハイライト管理

### 10.2 今後の拡張

- **マルチタッチ対応**: 複数のカードを同時にドラッグ
- **ドラッグプレビュー**: ドラッグ中にカードの半透明コピーを表示
- **スナップ機能**: ドロップゾーンに近づいたら自動吸着

---

**最終更新**: 2026-01-19
**作成者**: Claude (Zundamon)
