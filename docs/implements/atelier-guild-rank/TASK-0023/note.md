# TASK-0023: 採取フェーズUI（ドラフト採取）タスクノート

**作成日**: 2026-01-18
**タスクID**: TASK-0023
**タスク名**: 採取フェーズUI（ドラフト採取）
**要件名**: atelier-guild-rank

---

## 1. 技術スタック

### 1.1 コア技術

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **言語** | TypeScript | 5.x | 型安全な開発 |
| **ゲームFW** | Phaser | 3.87+ | 2Dゲームエンジン |
| **UIプラグイン** | rexUI | 最新 | ゲーム内UI（Canvas） |
| **テスト** | Vitest | 2.x | 高速ユニットテスト |
| **Lint/Format** | Biome | 2.x | 統合リンター・フォーマッター |
| **パッケージ** | pnpm | 9.x | パッケージ管理 |

### 1.2 アーキテクチャパターン

- **Clean Architecture（4層構造）**: Presentation / Application / Domain / Infrastructure
- **イベント駆動設計**: EventBusによる疎結合な通信
- **State Machine**: フェーズ管理

---

## 2. 開発ルール

### 2.1 コーディング規約

- **Biome** を使用したリント・フォーマット
- **パスエイリアス**: `@presentation/`, `@application/`, `@domain/`, `@shared/`, `@infrastructure/`
- **信頼性レベル表記**: 🔵（要件定義に記載）/ 🟡（妥当な推測）/ 🔴（新規追加）

### 2.2 テスト要件

- **TDD（Test-Driven Development）**: Red → Green → Refactor
- **ユニットテスト**: Vitest を使用
- **テストファイル配置**:
  - UI コンポーネント: `src/presentation/ui/**/*.spec.ts`（コロケーション）
  - サービス: `tests/unit/application/services/*.test.ts`
- **モック**: Phaserシーン・EventBusはモックを使用

### 2.3 UIコンポーネント規約

- `BaseComponent` を継承
- `create()` と `destroy()` を実装必須
- `getContainer()` でコンテナを取得
- EventBusは `scene.data.get('eventBus')` から取得
- rexUIがない場合は警告のみ（モック対応）

---

## 3. 依存サービス

### 3.1 GatheringService

**ファイル**: `/home/user/atelier/atelier-guild-rank/src/application/services/gathering-service.ts`

**主要メソッド**:

| メソッド | 説明 | 戻り値 |
|---------|------|--------|
| `startDraftGathering(card, enhancementCards?)` | ドラフト採取セッション開始 | `DraftSession` |
| `selectMaterial(sessionId, materialIndex)` | 素材を選択 | `MaterialInstance` |
| `skipSelection(sessionId)` | 素材選択をスキップ | `void` |
| `endGathering(sessionId)` | 採取を終了 | `GatheringResult` |
| `getCurrentSession()` | 現在のセッション取得 | `DraftSession | null` |
| `canGather(card)` | 採取可能か判定 | `boolean` |
| `calculateGatheringCost(baseCost, selectedCount)` | コスト計算 | `GatheringCostResult` |

**DraftSession インターフェース**:
```typescript
interface DraftSession {
  sessionId: string;
  card: Card;
  currentRound: number;
  maxRounds: number;
  selectedMaterials: MaterialInstance[];
  currentOptions: MaterialOption[];
  isComplete: boolean;
}
```

**発行イベント**:
- `GameEventType.GATHERING_STARTED`: 採取開始時
- `GameEventType.MATERIAL_SELECTED`: 素材選択時
- `GameEventType.GATHERING_ENDED`: 採取終了時

---

## 4. 設計文書

### 4.1 採取フェーズUI設計

**ファイル**: `/home/user/atelier/docs/design/atelier-guild-rank/ui-design/screens/gathering.md`

**主要コンポーネント**:

| コンポーネントID | 説明 | 信頼性 |
|-----------------|------|--------|
| `location-detail` | 採取地詳細パネル | 🔵 |
| `round-indicator` | ラウンドインジケーター | 🟡 |
| `material-options` | 素材選択肢カード群（3枚） | 🔵 |
| `material-card` | 素材カード | 🔵 |
| `selected-materials` | 獲得済み素材リスト | 🔵 |
| `cost-display` | コスト表示パネル | 🔵 |
| `btn-select-1/2/3` | 素材選択ボタン | 🔵 |
| `btn-skip-round` | スキップボタン | 🔵 |
| `btn-end-gather` | 採取終了ボタン | 🔵 |

**状態遷移**:
```
HandView → LocationDetail → DraftSession → GatherResult → HandView/NextPhase
```

**DraftSession内部状態**:
- `MaterialPresent`: 素材提示中（アニメーション）
- `MaterialSelect`: 素材選択待ち
- `SessionEnd`: セッション終了処理中

### 4.2 キーボードショートカット

| キー | 動作 |
|------|------|
| `1`, `2`, `3` | 左/中央/右の素材を選択 |
| `S` または `0` | このラウンドをスキップ |
| `E` | 採取を終了する |
| `Enter` | 選択中の素材を確定/採取開始 |
| `Escape` | キャンセル（未選択時のみ） |

### 4.3 コスト計算ルール 🔵

| 選択個数 | 追加コスト | 追加日数 |
|---------|-----------|---------|
| 0個（偵察のみ） | 0 | 0 |
| 1〜2個 | 1 | 0 |
| 3〜4個 | 2 | 0 |
| 5〜6個 | 3 | 0 |
| 7個以上 | 3 | +1日 |

---

## 5. 参考実装

### 5.1 QuestAcceptPhaseUI（フェーズUIの参考）

**ファイル**: `/home/user/atelier/atelier-guild-rank/src/presentation/ui/phases/QuestAcceptPhaseUI.ts`

**実装パターン**:
```typescript
export class QuestAcceptPhaseUI extends BaseComponent {
  private eventBus: IEventBus | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene, 160, 80);
    this.eventBus = this.scene.data.get('eventBus');
    if (!this.eventBus) {
      console.warn('EventBus is not available in scene.data');
    }
    this.create();
  }

  public create(): void {
    this.createTitle();
    this.createQuestList();
    // ...
  }

  public destroy(): void {
    // カードの破棄
    for (const card of this.questCards) {
      if (card && card.destroy) {
        card.destroy();
      }
    }
    // コンテナの破棄
    if (this.container) {
      this.container.destroy();
    }
  }
}
```

### 5.2 BaseComponent（基底クラス）

**ファイル**: `/home/user/atelier/atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts`

**抽象メソッド**:
- `create(): void` - コンポーネント初期化
- `destroy(): void` - リソース解放

**提供メソッド**:
- `setVisible(visible: boolean): this`
- `setPosition(x: number, y: number): this`
- `getContainer(): Phaser.GameObjects.Container`

### 5.3 テストファイル構造（QuestAcceptPhaseUI.spec.ts参考）

**テストケース命名規則**:
- `TC-XXX: テストケース名`
- 正常系 → 異常系 → 境界値の順

**モック作成パターン**:
```typescript
function createMockScene(): Phaser.Scene {
  return {
    add: {
      container: vi.fn().mockReturnValue({ ... }),
      text: vi.fn().mockReturnValue({ ... }),
      rectangle: vi.fn().mockReturnValue({ ... }),
    },
    data: {
      get: vi.fn().mockReturnValue(mockEventBus),
    },
  } as any;
}

function createMockEventBus() {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  };
}
```

---

## 6. ディレクトリ構造

```
atelier-guild-rank/
├── src/
│   ├── application/
│   │   └── services/
│   │       └── gathering-service.ts  # 採取サービス（実装済み）
│   ├── domain/
│   │   └── interfaces/
│   │       └── gathering-service.interface.ts
│   └── presentation/
│       ├── scenes/
│       │   └── MainScene.ts
│       └── ui/
│           ├── components/
│           │   ├── BaseComponent.ts
│           │   ├── Button.ts
│           │   ├── CardUI.ts
│           │   ├── Dialog.ts
│           │   └── HandDisplay.ts
│           ├── main/
│           │   ├── HeaderUI.ts
│           │   ├── SidebarUI.ts
│           │   └── FooterUI.ts
│           └── phases/
│               ├── QuestAcceptPhaseUI.ts   # 参考実装
│               └── GatheringPhaseUI.ts     # 今回作成
├── tests/
│   └── unit/
│       └── application/
│           └── services/
│               └── gathering-service.test.ts
└── docs/
    └── design/
        └── atelier-guild-rank/
            └── ui-design/
                └── screens/
                    └── gathering.md
```

---

## 7. 作成するファイル

### 7.1 実装ファイル

| ファイル | 説明 |
|---------|------|
| `src/presentation/ui/phases/GatheringPhaseUI.ts` | 採取フェーズUIメインコンポーネント |
| `src/presentation/ui/phases/GatheringPhaseUI.spec.ts` | 採取フェーズUIテスト |
| `src/presentation/ui/components/MaterialCardUI.ts` | 素材カードコンポーネント（必要に応じて） |
| `src/presentation/ui/components/MaterialCardUI.spec.ts` | 素材カードテスト（必要に応じて） |

### 7.2 主要クラス

```typescript
// GatheringPhaseUI
export class GatheringPhaseUI extends BaseComponent {
  // GatheringServiceとの連携
  private gatheringService: IGatheringService | null = null;
  private eventBus: IEventBus | null = null;

  // 状態
  private currentSession: DraftSession | null = null;
  private materialCards: MaterialCardUI[] = [];
  private selectedMaterials: Phaser.GameObjects.Container[] = [];

  // UIコンポーネント
  private roundIndicator!: Phaser.GameObjects.Text;
  private costDisplay!: Phaser.GameObjects.Container;
  private skipButton!: Button;
  private endButton!: Button;

  // メソッド
  public create(): void;
  public destroy(): void;
  public startGathering(card: Card, enhancementCards?: Card[]): void;
  private onMaterialSelected(index: number): void;
  private onSkipRound(): void;
  private onEndGathering(): void;
  private updateUI(): void;
  private updateMaterialOptions(options: MaterialOption[]): void;
  private updateCostDisplay(selectedCount: number): void;
}
```

---

## 8. 注意事項

### 8.1 技術的制約

- **rexUIプラグイン**: テスト環境では動作しないため、モック対応が必要
- **Proxyによるコンテナ座標管理**: BaseComponentはモック対応のためProxyを使用
- **EventBus null チェック**: 必ず存在確認後にemit()を呼び出す

### 8.2 エラーハンドリング

- **EventBus未初期化**: 警告ログを出力し、処理は継続
- **GatheringServiceエラー**: try-catchで捕捉し、エラーログ出力
- **無効な素材インデックス**: ApplicationErrorをスロー

### 8.3 パフォーマンス要件

| 指標 | 目標値 |
|------|--------|
| ラウンド遷移 | < 500ms |
| 素材選択反応 | < 16ms |
| 結果画面表示 | < 300ms |
| メモリ使用量 | < 15MB（フェーズ単体） |

### 8.4 アニメーション（任意）

| アニメーション | トリガー | 時間 |
|---------------|---------|------|
| 素材提示 | ラウンド開始時 | 200ms × 3枚 |
| 素材選択 | カード選択時 | 150ms |
| スキップ | スキップ押下時 | 200ms |

---

## 9. テストケース概要

### 9.1 正常系

| ID | テストケース | 信頼性 |
|----|-------------|--------|
| TC-201 | フェーズUI初期化 | 🔵 |
| TC-202 | 採取セッション開始 | 🔵 |
| TC-203 | 素材選択（インデックス0, 1, 2） | 🔵 |
| TC-204 | 素材選択スキップ | 🔵 |
| TC-205 | 採取終了（コスト計算含む） | 🔵 |
| TC-206 | 全ラウンド完了時のisComplete | 🔵 |

### 9.2 異常系

| ID | テストケース | 信頼性 |
|----|-------------|--------|
| TC-207 | EventBus未初期化時の警告 | 🔵 |
| TC-208 | GatheringService未設定時 | 🟡 |

### 9.3 境界値

| ID | テストケース | 信頼性 |
|----|-------------|--------|
| TC-209 | 0個選択（偵察のみ） | 🔵 |
| TC-210 | 最大提示回数（5回） | 🔵 |
| TC-211 | 6個選択（ペナルティなし上限） | 🔵 |
| TC-212 | 7個選択（翌日持越しペナルティ） | 🔵 |

---

## 10. 関連文書

- **設計文書**: `/home/user/atelier/docs/design/atelier-guild-rank/ui-design/screens/gathering.md`
- **共通コンポーネント**: `/home/user/atelier/docs/design/atelier-guild-rank/ui-design/screens/common-components.md`
- **アーキテクチャ概要**: `/home/user/atelier/docs/design/atelier-guild-rank/architecture-overview.md`
- **GatheringServiceテスト**: `/home/user/atelier/atelier-guild-rank/tests/unit/application/services/gathering-service.test.ts`
- **QuestAcceptPhaseUI（参考）**: `/home/user/atelier/atelier-guild-rank/src/presentation/ui/phases/QuestAcceptPhaseUI.ts`

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成 |
