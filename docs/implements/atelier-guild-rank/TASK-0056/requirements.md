# TASK-0056 詳細要件定義書

**タスクID**: TASK-0056
**タスク名**: ShopSceneリファクタリング
**作成日**: 2026-01-23
**フェーズ**: Phase 7 - Presentation層リファクタリング

---

## 1. 機能要件（EARS記法）

### 1.1 コンポーネント分割要件

#### REQ-056-001: ShopSceneメインクラス
**EARS記法**: Ubiquitous
```
ShopScene.tsは、シーンライフサイクル管理とサブコンポーネントの統合のみを担当しなければならない。
```
**受け入れ基準**:
- ShopScene.tsが200行以下であること
- DIコンテナからのサービス取得ロジックが含まれること
- 各サブコンポーネントの初期化・破棄を管理すること
- イベントバスを介したコンポーネント間通信を仲介すること

#### REQ-056-002: ShopHeaderコンポーネント
**EARS記法**: Ubiquitous
```
ShopHeaderは、ショップのタイトル、所持金表示、戻るボタンを管理しなければならない。
```
**受け入れ基準**:
- BaseComponentを継承すること
- タイトルテキスト「ショップ」を表示すること
- 所持金を「所持金: XXX G」形式で表示すること
- 「戻る」ボタンを表示し、クリックイベントを発火すること
- 推定100行以下であること

#### REQ-056-003: ShopItemGridコンポーネント
**EARS記法**: Ubiquitous
```
ShopItemGridは、商品カードのグリッド表示とスクロール管理を担当しなければならない。
```
**受け入れ基準**:
- BaseComponentを継承すること
- 3列グリッドレイアウトで商品カードを配置すること
- 商品数に応じたスクロール機能を提供すること
- ShopItemCardコンポーネントを内部で使用すること
- 商品選択時にイベントを発火すること
- 推定200行以下であること

#### REQ-056-004: ShopItemCardコンポーネント
**EARS記法**: Ubiquitous
```
ShopItemCardは、個別商品の情報表示と購入ボタンを提供しなければならない。
```
**受け入れ基準**:
- BaseComponentを継承すること
- 商品名、タイプ（カード/素材/アーティファクト）、説明、価格、在庫を表示すること
- UIBackgroundBuilderを使用してカード背景を作成すること
- applyHoverAnimationを使用してホバーエフェクトを適用すること
- 購入可否に応じてボタンの有効/無効を切り替えること
- 在庫切れ時に「売切」表示にすること
- 推定150行以下であること

#### REQ-056-005: ShopDetailPanelコンポーネント（オプション）
**EARS記法**: Event-Driven
```
When アイテムが選択された時、ShopDetailPanelは詳細情報と購入確認を表示しなければならない。
```
**受け入れ基準**:
- BaseComponentを継承すること
- 選択されたアイテムの詳細情報を表示すること
- 購入確認ボタンと数量選択（将来対応）を提供すること
- 推定150行以下であること
- **注**: 現在のShopSceneにはこの機能は実装されていないため、オプションとする

### 1.2 テーマ・ユーティリティ活用要件

#### REQ-056-010: Colors定数の使用
**EARS記法**: Ubiquitous
```
全てのカラー値は、Colors定数またはTHEME.colors定数を使用しなければならない。
```
**受け入れ基準**:
- ハードコードされたカラー値（0xXXXXXX形式）が存在しないこと
- `@presentation/ui/theme`からインポートされたColorsまたはTHEMEを使用すること

#### REQ-056-011: UIBackgroundBuilderの使用
**EARS記法**: Ubiquitous
```
角丸背景の作成には、UIBackgroundBuilderを使用しなければならない。
```
**受け入れ基準**:
- カード背景、パネル背景にUIBackgroundBuilderを使用すること
- `@presentation/ui/utils`からインポートすること

#### REQ-056-012: AnimationPresetsの使用
**EARS記法**: Ubiquitous
```
UIアニメーションには、AnimationPresetsを使用しなければならない。
```
**受け入れ基準**:
- ホバーアニメーションにAnimationPresets.scale.hoverを使用すること
- フェードアニメーションにAnimationPresets.fadeを使用すること

#### REQ-056-013: HoverAnimationMixinの使用
**EARS記法**: Ubiquitous
```
インタラクティブ要素のホバーエフェクトには、applyHoverAnimationを使用しなければならない。
```
**受け入れ基準**:
- ShopItemCardにapplyHoverAnimationを適用すること
- 購入ボタンにapplyHoverAnimationを適用すること

### 1.3 型定義要件

#### REQ-056-020: any型の排除
**EARS記法**: Ubiquitous
```
rexUIプラグイン以外のany型は、適切な型定義に置き換えなければならない。
```
**受け入れ基準**:
- rexUIプラグインへの参照には`biome-ignore`コメント付きでany型を許可すること
- それ以外の変数・引数・戻り値にany型が存在しないこと
- 必要に応じて型定義ファイル（types.ts）を作成すること

#### REQ-056-021: 共通インターフェースの使用
**EARS記法**: Ubiquitous
```
ShopItem、IShopService等の型は、既存の型定義を使用しなければならない。
```
**受け入れ基準**:
- `@domain/interfaces/shop-service.interface`からIShopItem、IShopServiceをインポートすること
- ローカルで重複した型定義を削除すること

### 1.4 イベント連携要件

#### REQ-056-030: コンポーネント間通信
**EARS記法**: Event-Driven
```
When サブコンポーネントでユーザーアクションが発生した時、コールバック関数またはイベントを通じて親コンポーネントに通知しなければならない。
```
**受け入れ基準**:
- ShopItemCardの購入ボタンクリックがShopSceneに通知されること
- ShopHeaderの戻るボタンクリックがShopSceneに通知されること
- TypeScriptのコールバック型を使用すること（any型の関数シグネチャ不可）

---

## 2. 非機能要件

### 2.1 コード品質要件

#### NFR-056-001: 行数制限
```
ShopScene.tsは400行以下、各サブコンポーネントは200行以下とする。
```

#### NFR-056-002: テストカバレッジ
```
新規作成されるコンポーネントのテストカバレッジは80%以上とする。
```

#### NFR-056-003: Biome準拠
```
全てのコードがBiome設定に準拠し、lint警告がゼロであること（biome-ignore例外を除く）。
```

### 2.2 パフォーマンス要件

#### NFR-056-010: メモリリーク防止
```
全てのコンポーネントのdestroy()メソッドで、作成したリソースを解放すること。
```
**チェック項目**:
- イベントリスナーの解除
- rexUIオブジェクトの破棄
- Phaser GameObjectの破棄

#### NFR-056-011: 描画最適化
```
商品カードの描画は、表示領域内のものを優先して処理すること。
```
**注**: 現在の商品数（数十件程度）では必須ではないが、将来の拡張に備える

### 2.3 保守性要件

#### NFR-056-020: 単一責任原則
```
各コンポーネントは単一の責務のみを持つこと。
```
**責務分割**:
| コンポーネント | 責務 |
|---------------|------|
| ShopScene | シーン管理・統合 |
| ShopHeader | ヘッダーUI |
| ShopItemGrid | グリッドレイアウト |
| ShopItemCard | 商品カードUI |

#### NFR-056-021: 依存関係の明確化
```
コンポーネント間の依存関係は、コンストラクタ注入またはメソッド注入で明示すること。
```

---

## 3. 受け入れ基準

### 3.1 必須基準

| ID | 基準 | 検証方法 |
|----|------|----------|
| AC-001 | ShopScene.tsが400行以下 | `wc -l ShopScene.ts` |
| AC-002 | 3つ以上のサブコンポーネントに分割 | ファイル数確認 |
| AC-003 | any型が全て適切な型に置き換え（rexUI例外あり） | Biome lint実行 |
| AC-004 | Colors/THEME定数を使用 | コードレビュー |
| AC-005 | UIBackgroundBuilder使用 | コードレビュー |
| AC-006 | AnimationPresets/applyHoverAnimation使用 | コードレビュー |
| AC-007 | 既存テスト全通過 | `pnpm test` |
| AC-008 | 新規コンポーネントのカバレッジ80%以上 | `pnpm test:coverage` |

### 3.2 オプション基準

| ID | 基準 | 検証方法 |
|----|------|----------|
| AC-O01 | E2Eテストが全通過 | `pnpm test:e2e` |
| AC-O02 | パフォーマンス劣化なし | 手動確認 |

---

## 4. 制約条件

### 4.1 技術的制約

| ID | 制約 | 理由 |
|----|------|------|
| CON-001 | BaseComponentを継承 | 既存アーキテクチャとの整合性 |
| CON-002 | rexUIプラグインの使用 | ScrollablePanel等の既存UI依存 |
| CON-003 | Phaser 3.87+互換 | プロジェクト標準 |
| CON-004 | DIコンテナ経由のサービス取得 | 依存性注入パターン |

### 4.2 ビジネス制約

| ID | 制約 | 理由 |
|----|------|------|
| CON-010 | 既存動作の維持 | ユーザー影響回避 |
| CON-011 | 購入フローの維持 | 基本機能 |

---

## 5. 依存関係

### 5.1 前提タスク

| タスクID | タスク名 | 状態 | 依存内容 |
|----------|---------|------|----------|
| TASK-0053 | 共通UIユーティリティ基盤 | 完了 | UIBackgroundBuilder, BorderLineFactory |
| TASK-0054 | テーマ定数統一 | 完了 | Colors, AnimationPresets |
| TASK-0050 | ShopScene実装 | 完了 | 現在のShopScene実装 |

### 5.2 後続タスク

| タスクID | タスク名 | 依存内容 |
|----------|---------|----------|
| TASK-0059 | MainSceneリファクタリング | 同様のリファクタリングパターン適用 |
| TASK-0060 | RankUpSceneリファクタリング | 同様のリファクタリングパターン適用 |

### 5.3 関連ファイル

#### 対象ファイル
| ファイル | 役割 |
|---------|------|
| `src/presentation/scenes/ShopScene.ts` | リファクタリング対象（現在607行） |

#### 参照ファイル
| ファイル | 役割 |
|---------|------|
| `src/presentation/ui/components/BaseComponent.ts` | 基底クラス |
| `src/presentation/ui/theme.ts` | Colors, THEME定数 |
| `src/presentation/ui/utils/index.ts` | 共通ユーティリティ |
| `src/presentation/ui/utils/UIBackgroundBuilder.ts` | 背景生成ユーティリティ |
| `src/presentation/ui/utils/AnimationPresets.ts` | アニメーション定数 |
| `src/presentation/ui/utils/HoverAnimationMixin.ts` | ホバーアニメーション |

#### テストファイル
| ファイル | 役割 |
|---------|------|
| `tests/unit/presentation/scenes/shop-scene.test.ts` | 既存テスト（維持必須） |

#### 出力ファイル
| ファイル | 役割 |
|---------|------|
| `src/presentation/scenes/components/shop/ShopHeader.ts` | ヘッダーコンポーネント |
| `src/presentation/scenes/components/shop/ShopItemGrid.ts` | グリッドコンポーネント |
| `src/presentation/scenes/components/shop/ShopItemCard.ts` | 商品カードコンポーネント |
| `src/presentation/scenes/components/shop/types.ts` | 型定義（必要に応じて） |
| `src/presentation/scenes/components/shop/index.ts` | エクスポート |
| `tests/unit/presentation/scenes/components/shop/*.test.ts` | 新規テスト |

---

## 6. コンポーネント設計サマリー

### 6.1 分割計画

```
ShopScene.ts (607行 → 200行以下)
├── ShopHeader.ts (新規: 100行)
│   ├── タイトル表示
│   ├── 所持金表示
│   └── 戻るボタン
├── ShopItemGrid.ts (新規: 200行)
│   ├── グリッドレイアウト
│   ├── スクロール管理
│   └── ShopItemCard[] 管理
├── ShopItemCard.ts (新規: 150行)
│   ├── 商品情報表示
│   ├── 購入ボタン
│   └── ホバーエフェクト
└── types.ts (新規: 50行)
    ├── ShopComponentConfig
    └── ShopItemCardConfig
```

### 6.2 責務マッピング

| 現在のコード箇所 | 移動先 |
|-----------------|--------|
| `createHeader()` | ShopHeader |
| `createBackButton()` | ShopHeader |
| `createItemGrid()` | ShopItemGrid |
| `createItemCard()` | ShopItemCard |
| `createFooter()` | ShopHeader（所持金部分） |
| `handlePurchase()` | ShopScene（統合役） |
| `updateGoldDisplay()` | ShopHeader |
| `refreshItemList()` | ShopItemGrid |

---

## 7. 検証計画

### 7.1 ユニットテスト

| コンポーネント | テストケース数 | 優先度 |
|---------------|---------------|--------|
| ShopHeader | 5件 | 高 |
| ShopItemGrid | 6件 | 高 |
| ShopItemCard | 8件 | 高 |
| ShopScene（統合） | 5件 | 中 |

### 7.2 統合テスト

| テストシナリオ | 検証内容 |
|---------------|----------|
| 商品一覧表示 | ShopItemGrid + ShopItemCard連携 |
| 購入フロー | ShopItemCard → ShopScene → ShopService |
| 所持金更新 | 購入後のShopHeader更新 |
| シーン遷移 | ShopHeader戻るボタン → MainScene |

---

*生成日時: 2026-01-23*
*タスクID: TASK-0056*
*TDDフェーズ: 要件定義（tdd-requirements）*
