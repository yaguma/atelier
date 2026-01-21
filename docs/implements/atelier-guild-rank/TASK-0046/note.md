# TASK-0046 タスクノート: MainScene共通レイアウト実装

**作成日**: 2026-01-21
**タスクID**: TASK-0046
**タスク名**: MainScene共通レイアウト実装（再実装）
**カテゴリ**: UI層（Presentation）
**見積時間**: 4時間

---

## 1. 技術スタック

### 1.1 使用技術・フレームワーク

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Phaser 3** | 3.87+ | ゲームフレームワーク |
| **rexUI** | - | UI コンポーネントライブラリ（Label, Sizer, Dialog等） |
| **TypeScript** | 5.x | 型安全な開発 |
| **Vite** | 5.x | ビルドツール |
| **Vitest** | - | ユニットテスト |
| **Biome** | 2.x | リンター/フォーマッター |

### 1.2 アーキテクチャパターン

**Clean Architecture（4層構造）**:
```
src/
├── domain/          # ビジネスロジック・エンティティ（依存なし）
├── application/     # ゲームフロー制御・状態管理・イベント調整
├── infrastructure/  # データ永続化・外部連携
├── presentation/    # Phaser Scenes・UI Components ← 今回の対象
└── shared/          # 共通ユーティリティ・型定義
```

**依存方向**: Presentation → Application → Domain → Infrastructure(IF)

### 1.3 パスエイリアス

```typescript
import { Card } from '@domain/entities/Card';
import { DeckService } from '@domain/services/DeckService';
import { StateManager } from '@application/state/StateManager';
import { GameFlowManager } from '@application/services/game-flow-manager';
import { MainScene } from '@presentation/scenes/MainScene';
```

---

## 2. 開発ルール

### 2.1 コーディング規約

- **インデント**: 2スペース
- **クォート**: シングルクォート
- **セミコロン**: 必須
- **末尾カンマ**: 全て

### 2.2 型チェック

- 厳密な型チェック（strict mode）
- `any`の使用は最小限に（rexUIプラグインなど型定義が複雑な箇所のみ許容）
- `biome-ignore`コメントで理由を明記

### 2.3 テスト要件

- **カバレッジ目標**: 80%+（Domain層は90%+）
- **テストファイル配置**: `tests/unit/presentation/main-scene.test.ts`
- **テストパターン**: TDD（Red → Green → Refactor）

### 2.4 信頼性レベル表記

コード内に以下の表記で設計根拠を明示:
- 🔵 **青信号**: 設計文書に記載
- 🟡 **黄信号**: 設計文書から妥当な推測
- 🔴 **赤信号**: 設計文書にない推測

---

## 3. 関連実装

### 3.1 TitleScene.ts（参考実装）

**ファイル**: `/src/presentation/scenes/TitleScene.ts`

**参考パターン**:
- 定数定義（LAYOUT, STYLES, SIZES, DEPTH, ANIMATION）
- rexUIを使ったボタン作成パターン
- ダイアログ表示パターン
- フェードイン/フェードアウトアニメーション

**コードサンプル**（定数定義パターン）:
```typescript
const LAYOUT = {
  TITLE_Y: 200,
  SUBTITLE_Y: 260,
  BUTTON_START_Y: 400,
  BUTTON_SPACING: 60,
  VERSION_OFFSET: 20,
} as const;

const STYLES = {
  TITLE_FONT_SIZE: '48px',
  TITLE_COLOR: '#8B4513',
  // ...
} as const;
```

**コードサンプル**（rexUIボタン作成）:
```typescript
private createButton(x: number, y: number, text: string, backgroundColor: number, onClick: () => void): any {
  const buttonBackground = this.rexUI.add.roundRectangle(0, 0, SIZES.BUTTON_WIDTH, SIZES.BUTTON_HEIGHT, SIZES.BUTTON_RADIUS, backgroundColor);
  const buttonText = this.add.text(0, 0, text, { /* styles */ });
  const button = this.rexUI.add.label({
    width: SIZES.BUTTON_WIDTH,
    height: SIZES.BUTTON_HEIGHT,
    background: buttonBackground,
    text: buttonText,
    align: 'center',
    x, y,
  });
  button.setInteractive();
  button.on('pointerdown', onClick);
  button.layout();
  return button;
}
```

### 3.2 BaseComponent.ts（基底クラス）

**ファイル**: `/src/presentation/ui/components/BaseComponent.ts`

**必須メソッド**:
- `abstract create(): void` - コンポーネント初期化
- `abstract destroy(): void` - コンポーネント破棄

**提供メソッド**:
- `setVisible(visible: boolean): this`
- `setPosition(x: number, y: number): this`
- `getContainer(): Phaser.GameObjects.Container`

**使用例**:
```typescript
export class HeaderUI extends BaseComponent {
  create(): void {
    // ヘッダーUI初期化
  }

  destroy(): void {
    // リソース解放
  }
}
```

### 3.3 StateManager（状態管理）

**ファイル**: `/src/application/services/state-manager.ts`
**インターフェース**: `/src/application/services/state-manager.interface.ts`

**主要メソッド**:
```typescript
interface IStateManager {
  getState(): Readonly<IGameState>;
  updateState(partial: Partial<IGameState>): void;
  setPhase(phase: GamePhase): void;
  canTransitionTo(phase: GamePhase): boolean;
  addGold(amount: number): void;
  spendGold(amount: number): boolean;
  addContribution(amount: number): void;
}
```

**IGameState型**:
```typescript
interface IGameState {
  currentPhase: GamePhase;
  currentDay: number;
  remainingDays: number;
  currentRank: GuildRank;
  gold: number;
  actionPoints: number;
  promotionGauge: number;
}
```

### 3.4 GameFlowManager（フロー管理）

**ファイル**: `/src/application/services/game-flow-manager.ts`
**インターフェース**: `/src/application/services/game-flow-manager.interface.ts`

**主要メソッド**:
```typescript
interface IGameFlowManager {
  startNewGame(): void;
  continueGame(saveData: ISaveData): void;
  startDay(): void;
  endDay(): void;
  startPhase(phase: GamePhase): void;
  endPhase(): void;
  skipPhase(): void;
  getCurrentPhase(): GamePhase;
  canAdvancePhase(): boolean;
}
```

### 3.5 theme.ts（テーマ定義）

**ファイル**: `/src/presentation/ui/theme.ts`

**カラーパレット**:
```typescript
const THEME = {
  colors: {
    primary: 0x8b4513,         // SaddleBrown
    primaryHover: 0x9b5523,
    secondary: 0xd2691e,       // Chocolate
    background: 0xf5f5dc,      // Beige
    text: 0x333333,
    textOnPrimary: '#FFFFFF',
    success: 0x228b22,         // ForestGreen
    warning: 0xdaa520,         // Goldenrod
    error: 0x8b0000,           // DarkRed
    disabled: 0xcccccc,
  },
  fonts: {
    primary: '"M PLUS Rounded 1c", sans-serif',
    secondary: 'sans-serif',
  },
  sizes: { small: 14, medium: 16, large: 20, xlarge: 24 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  qualityColors: { D: 0x808080, C: 0x00ff00, B: 0x0080ff, A: 0xffd700, S: 0xff00ff },
};
```

---

## 4. 設計文書

### 4.1 関連設計文書

| 文書 | パス | 内容 |
|------|------|------|
| **メイン画面設計** | `docs/design/atelier-guild-rank/ui-design/screens/main.md` | 画面構成・フェーズ一覧 |
| **共通コンポーネント設計** | `docs/design/atelier-guild-rank/ui-design/screens/common-components.md` | HeaderUI, SidebarUI, FooterUI仕様 |
| **依頼受注フェーズ設計** | `docs/design/atelier-guild-rank/ui-design/screens/quest-accept.md` | QuestAcceptPhaseUI |
| **採取フェーズ設計** | `docs/design/atelier-guild-rank/ui-design/screens/gathering.md` | GatheringPhaseUI |
| **調合フェーズ設計** | `docs/design/atelier-guild-rank/ui-design/screens/alchemy.md` | AlchemyPhaseUI |
| **納品フェーズ設計** | `docs/design/atelier-guild-rank/ui-design/screens/delivery.md` | DeliveryPhaseUI |

### 4.2 画面構成（設計書より）

```
┌─────────────────────────────────────────────────────────────┐
│ ヘッダー: [ギルドランク: E] [貢献度: 0/100] [所持金: 500G]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐                                               │
│  │サイドバー│     メインコンテンツエリア                    │
│  │          │     （各フェーズUIがここに表示される）        │
│  │ 依頼受注 │                                               │
│  │   採取   │     QuestAcceptPhaseUI / GatheringPhaseUI    │
│  │   調合   │     AlchemyPhaseUI / DeliveryPhaseUI         │
│  │   納品   │                                               │
│  └──────────┘                                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ フッター: [ターン: 1/30] [現在フェーズ: 依頼受注]           │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 データモデル

**GamePhase列挙型**:
```typescript
const GamePhase = {
  QUEST_ACCEPT: 'QUEST_ACCEPT',
  GATHERING: 'GATHERING',
  ALCHEMY: 'ALCHEMY',
  DELIVERY: 'DELIVERY',
} as const;
```

**GuildRank列挙型**:
```typescript
const GuildRank = {
  G: 'G', F: 'F', E: 'E', D: 'D', C: 'C', B: 'B', A: 'A', S: 'S',
} as const;
```

### 4.4 ディレクトリ構造（成果物）

```
src/presentation/
├── scenes/
│   └── MainScene.ts           # 実装対象（再実装）
└── ui/
    └── components/
        ├── BaseComponent.ts   # 既存（基底クラス）
        ├── HeaderUI.ts        # 新規作成
        ├── SidebarUI.ts       # 新規作成
        └── FooterUI.ts        # 新規作成

tests/unit/presentation/
└── main-scene.test.ts         # テストファイル
```

---

## 5. 注意事項

### 5.1 技術的制約

1. **rexUIプラグインの型定義**
   - rexUIは複雑な型定義を持つため、`any`の使用が許容される
   - 使用時は`biome-ignore lint/suspicious/noExplicitAny`コメントで理由を明記

2. **レイアウト座標**
   - 画面サイズ: 1280x720（デフォルト）
   - 中央座標は`this.cameras.main.centerX/Y`で取得

3. **コンポーネントライフサイクル**
   - `create()`で初期化、`destroy()`でリソース解放
   - シーンの`shutdown()`でコンポーネントを破棄

### 5.2 パフォーマンス要件

1. **更新頻度**
   - HeaderUI, SidebarUI: 値変更時のみ更新（on_change）
   - PhaseIndicator: フェーズ変更時のみ更新

2. **メモリ管理**
   - 不要なオブジェクトは適切に破棄
   - コンテナは明示的にdestroyを呼び出す

### 5.3 イベント駆動

**使用するイベント（EventBus経由）**:
```typescript
// フェーズ変更イベント
GameEventType.PHASE_CHANGED: { previousPhase, newPhase }

// 日開始イベント
GameEventType.DAY_STARTED: { day, remainingDays }

// 貢献度追加イベント
GameEventType.CONTRIBUTION_ADDED: { amount, newPromotionGauge }
```

### 5.4 現在のMainScene.ts状態

現在の`/src/presentation/scenes/MainScene.ts`はスタブ実装（仮実装）。
タイトルテキストを表示するのみで、実際のレイアウトは未実装。
本タスクでフルレイアウトに置き換える。

---

## 6. テストケース一覧

| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| T-0046-01 | MainScene初期化 | レイアウトが正常に作成される |
| T-0046-02 | ヘッダー表示 | ランク・貢献度・所持金が表示される |
| T-0046-03 | サイドバー表示 | 4フェーズボタンが表示される |
| T-0046-04 | フッター表示 | ターン・フェーズが表示される |
| T-0046-05 | フェーズ切替 | コンテンツが正しく切り替わる |
| T-0046-06 | 状態更新 | StateManager変更でUI更新される |

---

## 7. 実装手順（推奨）

### 7.1 Red Phase（テスト作成）

1. `tests/unit/presentation/main-scene.test.ts`作成
2. T-0046-01〜06のテストケースを記述
3. テスト失敗を確認

### 7.2 Green Phase（最小実装）

1. HeaderUI.ts作成（BaseComponent継承）
2. SidebarUI.ts作成（BaseComponent継承）
3. FooterUI.ts作成（BaseComponent継承）
4. MainScene.ts再実装
5. テスト成功を確認

### 7.3 Refactor Phase

1. コード品質改善
2. 定数の整理
3. コメント・JSDoc追加
4. Biomeによるリント

---

## 8. 参考リンク

- **タスク定義**: `docs/tasks/atelier-guild-rank/phase-3/TASK-0046.md`
- **依存タスク**: TASK-0018（BaseComponent）, TASK-0017（GameFlowManager）
- **設計概要**: `docs/design/atelier-guild-rank/ui-design/overview.md`
