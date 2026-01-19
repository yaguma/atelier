# TASK-0043 開発コンテキストノート

**タスクID**: TASK-0043
**機能名**: 依頼詳細モーダル・受注アニメーション
**作成日**: 2026-01-19
**更新日**: 2026-01-20

---

## 1. 技術スタック

### フレームワーク・ライブラリ
| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| ゲームエンジン | Phaser 3 | 3.87+ | 2Dゲーム描画・アニメーション |
| UIプラグイン | rexUI | 最新 | Phaser向けUI拡張 |
| 言語 | TypeScript | 5.x | 型安全な開発 |
| ビルドツール | Vite | 5.x | 高速ビルド・HMR |
| パッケージマネージャー | pnpm | 9.x | 依存関係管理 |
| Linter/Formatter | Biome | 2.x | コード品質管理 |
| テスト | Vitest | 2.x | ユニットテスト |
| E2Eテスト | Playwright | 最新 | ブラウザテスト |

### 参照元
- docs/design/atelier-guild-rank/architecture-overview.md
- CLAUDE.md

---

## 2. 開発ルール

### Clean Architecture（4層構造）
- **Presentation層**: Phaser Scenes, UI Components（Phaserに依存）
- **Application層**: ゲームフロー制御、状態管理、イベント調整
- **Domain層**: ビジネスロジック、ゲームルール実装（フレームワーク非依存）
- **Infrastructure層**: データ永続化、外部連携、ユーティリティ

**依存方向**: Presentation → Application → Domain → Infrastructure(IF)

### コーディング規約
- インデント: 2スペース
- クォート: シングルクォート
- セミコロン: 必須
- 末尾カンマ: 全て
- Biomeで自動適用

### Path Aliases
```typescript
import { Card } from '@domain/entities/Card';
import { DeckService } from '@domain/services/DeckService';
import { StateManager } from '@application/state/StateManager';
import { SaveDataRepository } from '@infrastructure/repositories/SaveDataRepository';
import { MainScene } from '@presentation/scenes/MainScene';
```

### 参照元
- CLAUDE.md
- docs/design/atelier-guild-rank/architecture-overview.md
- docs/design/atelier-guild-rank/architecture-components.md

---

## 3. 関連実装

### 基底コンポーネント
- **atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts**
  - 全カスタムUIコンポーネントの基底クラス
  - Phaserシーン、コンテナ、rexUIプラグインへのアクセスを提供
  - create()とdestroy()メソッドを実装必須

### モーダル・ダイアログ実装
- **atelier-guild-rank/src/presentation/ui/components/Dialog.ts**
  - モーダルダイアログの基本実装
  - CONFIRM、INFO、CHOICEの3種類のダイアログタイプ
  - オーバーレイ、アニメーション、ボタン処理を提供
  - rexUI Dialogコンポーネントをラップ

- **atelier-guild-rank/src/presentation/ui/components/RewardCardDialog.ts**
  - 報酬カード選択ダイアログの実装例
  - 3枚のカードを表示し、1枚選択またはスキップ
  - カード表示アニメーション（遅延表示）
  - EventEmitter経由でイベント発行

### 依頼受注フェーズUI
- **atelier-guild-rank/src/presentation/ui/phases/QuestAcceptPhaseUI.ts**
  - 依頼受注フェーズ全体のUI管理
  - タイトル、依頼リスト、受注済みリストを表示
  - EventBus経由でQUEST_ACCEPTEDイベントを発行

- **atelier-guild-rank/src/presentation/ui/components/QuestCardUI.ts**
  - 個別依頼をカード形式で表示
  - 依頼者名、セリフ、依頼内容、報酬情報、受注ボタンを表示
  - ホバー時の拡大エフェクト

### テーマ設定
- **atelier-guild-rank/src/presentation/ui/theme.ts**
  - UIコンポーネント共通のテーマ設定
  - カラーパレット、テキストスタイル、ボタンスタイル

### 参照元
- atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts
- atelier-guild-rank/src/presentation/ui/components/Dialog.ts
- atelier-guild-rank/src/presentation/ui/components/RewardCardDialog.ts
- atelier-guild-rank/src/presentation/ui/phases/QuestAcceptPhaseUI.ts
- atelier-guild-rank/src/presentation/ui/components/QuestCardUI.ts

---

## 4. 設計文書

### 要件定義書
- **docs/spec/atelier-guild-rank-requirements.md**
  - ゲーム全体の要件定義
  - 依頼受注フェーズの操作仕様（セクション3.1）
  - 依頼システムの詳細（セクション4.6）

### UI設計文書
- **docs/design/atelier-guild-rank/ui-design/screens/quest-accept.md**
  - 依頼受注フェーズのUI詳細設計
  - ワイヤーフレーム、コンポーネント詳細、状態遷移、イベント詳細、アニメーション詳細
  - **重要**: セクション6「アニメーション詳細」に依頼受注時のアニメーションシーケンスを記載

- **docs/design/atelier-guild-rank/ui-design/screens/common-components.md**
  - 共通UIコンポーネント設計
  - ダイアログ、トースト、ツールチップの実装パターン
  - カラーパレット、テキストスタイル、ボタンスタイル

### アーキテクチャ設計文書
- **docs/design/atelier-guild-rank/architecture-overview.md**
  - システム全体のアーキテクチャ概要
  - レイヤー構造、技術スタック、エラーハンドリング、パフォーマンス最適化

- **docs/design/atelier-guild-rank/architecture-components.md**
  - Application層・Domain層のコンポーネント設計
  - イベントフロー設計、ディレクトリ構造

### 参照元
- docs/spec/atelier-guild-rank-requirements.md
- docs/design/atelier-guild-rank/ui-design/screens/quest-accept.md
- docs/design/atelier-guild-rank/ui-design/screens/common-components.md
- docs/design/atelier-guild-rank/architecture-overview.md
- docs/design/atelier-guild-rank/architecture-components.md

---

## 5. 注意事項

### 技術的制約
- **rexUI依存**: rexUIプラグインの型定義が複雑なため、anyで扱う場合がある
- **テスト環境**: rexUIはテスト環境では動作しないため、モック実装が必要
- **メモリリーク防止**: destroy()メソッドで全てのコンポーネントを確実に破棄

### セキュリティ要件
- ユーザー入力のサニタイズ（該当箇所なし）
- XSS対策（該当箇所なし）

### パフォーマンス要件
- モーダル表示: < 300ms
- アニメーション: 60fps維持
- メモリ使用量: < 10MB（コンポーネント単体）
- オブジェクトプール使用でメモリ最適化

### アニメーション設計
- **表示アニメーション**: alpha: 0→1, scale: 0.8→1, ease: 'Back.Out', duration: 300ms
- **非表示アニメーション**: alpha: 1→0, scale: 1→0.8, ease: 'Quad.In', duration: 200ms
- **受注成功アニメーション**: 成功テキスト表示 → スケールアップ＆フェードアウト → パネル縮小
- **カード移動アニメーション**: 受注後にカードをサイドバーへ移動 (x/y/scale変更, duration: 400ms)

### イベントバス利用
- **イベント名**: `QUEST_ACCEPTED`
- **ペイロード**: `{ quest: Quest }`
- **発行元**: QuestAcceptPhaseUI
- **購読者**: MainScene, QuestPanel

### テストカバレッジ目標
- Domain層: 90%+
- Application層: 80%+
- Presentation層: E2Eテストで主要フロー

### 参照元
- docs/design/atelier-guild-rank/architecture-overview.md
- docs/design/atelier-guild-rank/ui-design/screens/quest-accept.md
- atelier-guild-rank/src/presentation/ui/components/BaseComponent.ts

---

## 6. TASK-0043固有の情報

### タスク概要
依頼カードをクリックした際に詳細情報を表示するモーダルと、依頼受注時のアニメーションを実装する。

### 完了条件
- [ ] 依頼詳細モーダル実装
- [ ] モーダル開閉アニメーション
- [ ] 受注成功アニメーション
- [ ] 受注後のカード移動アニメーション
- [ ] 単体テスト実装

### 信頼性レベル
- 🟡 黄信号: 全項目（要件定義書から妥当な推測）

### 実装ファイル
- **QuestDetailModal**: atelier-guild-rank/src/presentation/ui/components/QuestDetailModal.ts
- **QuestAcceptPhaseUI** (修正): atelier-guild-rank/src/presentation/ui/phases/QuestAcceptPhaseUI.ts

### 参照元
- docs/tasks/atelier-guild-rank/phase-5/TASK-0043.md

---

---

## 7. 詳細な参考実装パターン

### 7.1 BaseComponent パターン
**ファイル**: `src/presentation/ui/components/BaseComponent.ts`

```typescript
export abstract class BaseComponent {
  protected scene: Phaser.Scene;
  protected container: Phaser.GameObjects.Container;
  protected rexUI: any;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // バリデーション
    if (!scene) throw new Error('BaseComponent: scene is required');
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(`Invalid position: x=${x}, y=${y}`);
    }

    this.scene = scene;
    this.rexUI = scene.rexUI;
    this.container = scene.add.container(x, y);
  }

  abstract create(): void;
  abstract destroy(): void;

  setVisible(visible: boolean): this { ... }
  setPosition(x: number, y: number): this { ... }
  getContainer(): Phaser.GameObjects.Container { ... }
}
```

### 7.2 Dialog パターン（モーダル実装参考）
**ファイル**: `src/presentation/ui/components/Dialog.ts`

```typescript
export class Dialog extends BaseComponent {
  private overlay: any | null = null;  // 背景オーバーレイ depth: 300
  private dialog: any | null = null;   // rexUI Dialog depth: 400
  private _visible: boolean = false;

  public show(duration: number = 300): this {
    if (!this._visible) {
      this._visible = true;
      this.overlay.setVisible(true);
      this.dialog.setVisible(true);
      this.dialog.popUp(duration);  // rexUIのアニメーション
    }
    return this;
  }

  public hide(duration: number = 300): this {
    this._visible = false;
    this.dialog.scaleDownDestroy(duration);
    this.overlay.setVisible(false);
    // アニメーション完了後にコールバック実行
    if (this.config.onClose) {
      this.scene.time.delayedCall(duration, () => {
        this.config.onClose?.();
      });
    }
    return this;
  }
}
```

### 7.3 QuestCardUI のホバーアニメーション
**ファイル**: `src/presentation/ui/components/QuestCardUI.ts`

```typescript
// アニメーション定数
private static readonly HOVER_SCALE = 1.05;
private static readonly HOVER_DURATION = 150;
private static readonly HOVER_EASE = 'Quad.Out';

private setupInteraction(): void {
  this.background.on('pointerover', () => {
    this.scene.tweens.add({
      targets: this.container,
      scale: QuestCardUI.HOVER_SCALE,
      duration: QuestCardUI.HOVER_DURATION,
      ease: QuestCardUI.HOVER_EASE,
    });
  });

  this.background.on('pointerout', () => {
    this.scene.tweens.add({
      targets: this.container,
      scale: 1.0,
      duration: QuestCardUI.HOVER_DURATION,
      ease: QuestCardUI.HOVER_EASE,
    });
  });
}
```

### 7.4 TooltipManager（シングルトンパターン）
**ファイル**: `src/presentation/ui/components/TooltipManager.ts`

```typescript
export class TooltipManager {
  private static instance: TooltipManager | null = null;
  private _isInitialized = false;
  private _isVisible = false;

  private constructor() {}

  static getInstance(): TooltipManager {
    if (!TooltipManager.instance) {
      TooltipManager.instance = new TooltipManager();
    }
    return TooltipManager.instance;
  }

  static resetInstance(): void {
    if (TooltipManager.instance) {
      TooltipManager.instance.destroy();
    }
    TooltipManager.instance = null;
  }

  initialize(scene: Phaser.Scene): void { ... }
  show(config: TooltipConfig): void { ... }
  hide(): void { ... }
  destroy(): void { ... }
}
```

---

## 8. Quest エンティティ詳細構造

### 8.1 Quest クラス
**ファイル**: `src/domain/entities/Quest.ts`

```typescript
export class Quest {
  constructor(
    public readonly data: IQuest,
    public readonly client: IClient,
  ) {}

  // ゲッター
  get id(): QuestId { return this.data.id; }
  get clientId(): ClientId { return this.data.clientId; }
  get condition(): IQuestCondition { return this.data.condition; }
  get baseContribution(): number { return this.data.contribution; }
  get baseGold(): number { return this.data.gold; }
  get deadline(): number { return this.data.deadline; }
  get difficulty(): QuestDifficulty { return this.data.difficulty; } // 'easy' | 'normal' | 'hard'
  get flavorText(): string { return this.data.flavorText; }
  get typeMultiplier(): number { ... }
  get clientContributionMultiplier(): number { return this.client.contributionMultiplier; }
  get clientGoldMultiplier(): number { return this.client.goldMultiplier; }

  // メソッド
  canDeliver(item: ItemInstance): boolean { ... }
  calculateContribution(item: ItemInstance): number { ... }
  calculateGold(item: ItemInstance): number { ... }
}
```

### 8.2 IClient インターフェース
**ファイル**: `src/shared/types/quests.ts`

```typescript
export interface IClient {
  id: ClientId;
  name: string;
  type: ClientType;               // 依頼者種別
  contributionMultiplier: number; // 貢献度倍率
  goldMultiplier: number;         // ゴールド倍率
  deadlineModifier: number;       // 期限修正値
  preferredQuestTypes: QuestType[];
  unlockRank: GuildRank;
  dialoguePatterns?: string[];    // セリフパターン（オプション）
}
```

### 8.3 IQuestCondition インターフェース
```typescript
export interface IQuestCondition {
  type: QuestType;  // 'SPECIFIC'|'CATEGORY'|'QUALITY'|'QUANTITY'|'ATTRIBUTE'|'EFFECT'|'MATERIAL'|'COMPOUND'
  itemId?: string;
  category?: ItemCategory;
  minQuality?: Quality;  // 'D'|'C'|'B'|'A'|'S'
  quantity?: number;
  subConditions?: IQuestCondition[];  // 複合条件用
}
```

---

## 9. テーマ定義詳細

**ファイル**: `src/presentation/ui/theme.ts`

```typescript
export const THEME = {
  colors: {
    primary: 0x8b4513,        // SaddleBrown - プライマリアクション
    primaryHover: 0x9b5523,   // ホバー時
    secondary: 0xd2691e,      // Chocolate - セカンダリアクション
    secondaryHover: 0xe2792e,
    background: 0xf5f5dc,     // Beige - 背景色
    text: 0x333333,           // ダークグレー - テキスト
    textLight: 0x666666,      // ミディアムグレー
    textOnPrimary: '#FFFFFF', // ボタン上のテキスト
    success: 0x228b22,        // ForestGreen - 成功
    warning: 0xdaa520,        // Goldenrod - 警告
    error: 0x8b0000,          // DarkRed - エラー
    disabled: 0xcccccc,       // 無効状態
  },
  sizes: {
    small: 14,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;
```

---

## 10. テストパターン

### 10.1 Phaserシーンのモック構造
**参考**: `src/presentation/ui/components/Dialog.spec.ts`

```typescript
// rexUIプラグインのモック
const mockDialog = {
  layout: vi.fn().mockReturnThis(),
  popUp: vi.fn().mockReturnThis(),
  scaleDownDestroy: vi.fn().mockReturnThis(),
  setDepth: vi.fn().mockReturnThis(),
  setVisible: vi.fn().mockReturnThis(),
  visible: false,
};

const mockOverlay = {
  setDepth: vi.fn().mockReturnThis(),
  setVisible: vi.fn().mockReturnThis(),
  setAlpha: vi.fn().mockReturnThis(),
};

const mockContainer = {
  setVisible: vi.fn().mockReturnThis(),
  setPosition: vi.fn().mockReturnThis(),
  x: 0,
  y: 0,
  visible: true,
};

scene = {
  add: {
    container: vi.fn().mockReturnValue(mockContainer),
    rectangle: vi.fn().mockReturnValue(mockOverlay),
    text: vi.fn().mockReturnValue({ setStyle: vi.fn().mockReturnThis() }),
  },
  rexUI: {
    add: {
      dialog: vi.fn().mockReturnValue(mockDialog),
      label: vi.fn().mockImplementation(() => ({
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        layout: vi.fn().mockReturnThis(),
      })),
      roundRectangle: vi.fn().mockReturnValue({
        setFillStyle: vi.fn().mockReturnThis(),
      }),
    },
  },
  time: {
    delayedCall: vi.fn(),
  },
  tweens: {
    add: vi.fn(),
  },
  input: {
    keyboard: {
      on: vi.fn(),
    },
  },
} as unknown as Phaser.Scene;
```

### 10.2 アニメーション検証
```typescript
// popUpアニメーションの検証
expect(mockDialog.popUp).toHaveBeenCalledWith(500);

// scaleDownDestroyアニメーションの検証
expect(mockDialog.scaleDownDestroy).toHaveBeenCalledWith(500);

// 深度設定の検証
expect(mockDialog.setDepth).toHaveBeenCalledWith(400);
expect(mockOverlay.setDepth).toHaveBeenCalledWith(300);
```

### 10.3 テストファイル命名規則
- `ComponentName.spec.ts` - コンポーネントと同じディレクトリに配置

---

## まとめ

- **技術スタック**: Phaser 3.87+, rexUI, TypeScript 5.x, Vitest, Playwright
- **アーキテクチャ**: Clean Architecture（4層構造）
- **主要な参考実装**: Dialog.ts, RewardCardDialog.ts, QuestCardUI.ts, TooltipManager.ts
- **重要な設計文書**: quest-accept.md, common-components.md
- **Questエンティティ**: client, condition, baseContribution, baseGold, deadline, difficulty, flavorText
- **注意事項**: rexUI依存、メモリリーク防止、アニメーション設計、深度設定
- **テストパターン**: Dialog.spec.tsを参考にモック構造を構築
