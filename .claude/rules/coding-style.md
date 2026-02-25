# コーディングスタイルルール

## 基本原則

- 読みやすさと保守性を最優先
- 一貫性のあるコードスタイル
- 型安全性の確保

---

## TypeScript

### 型安全性

- `any` 型は禁止（`unknown` + 型ガードを使用）
- `as` キャストは最小限に
- 戻り値の型は明示的に指定
- `noUncheckedIndexedAccess` を有効化

```typescript
// NG
const data: any = fetchData();
const item = array[0] as Item;

// OK
const data: unknown = fetchData();
if (isValidData(data)) {
  // 型ガードで絞り込み
}
const item = array[0]; // undefined | Item として扱う
```

### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| 変数・関数 | camelCase | `questList`, `calculateReward` |
| コンポーネント | PascalCase | `QuestCard`, `GoldDisplay` |
| 型・インターフェース | PascalCase | `Quest`, `IEventBus` |
| 定数 | UPPER_SNAKE_CASE | `MAX_DECK_SIZE`, `GAME_CONFIG` |
| ファイル（コンポーネント） | PascalCase | `QuestCard.ts` |
| ファイル（その他） | kebab-case | `quest-generator.ts`, `event-bus.ts` |
| ディレクトリ | kebab-case | `quest-accept/`, `state-management/` |

### インターフェース命名

- 実装から独立したインターフェースは`I`プレフィックス
- 特定の実装に紐づく型はプレフィックスなし

```typescript
// インターフェース（実装独立）
interface IEventBus {
  emit(type: string, payload: unknown): void;
}

// 型定義
type Quest = {
  id: string;
  name: string;
};
```

### インポート順序（Biome自動整理）

1. React関連（Phaser含む）
2. 外部ライブラリ
3. 内部モジュール（絶対パス `@features/`, `@shared/` 等）
4. 相対パスのモジュール
5. 型インポート

```typescript
// 例
import Phaser from 'phaser';
import { RexUIPlugin } from 'phaser3-rex-plugins';
import { Quest } from '@features/quest';
import { EventBus } from '@shared/services';
import { QuestCard } from './components/QuestCard';
import type { IGameState } from '@shared/types';
```

---

## Phaser固有のスタイル

### シーンクラス

```typescript
export class MainScene extends Phaser.Scene {
  // 依存注入されるサービス（readonly）
  private readonly stateManager: IStateManager;
  private readonly eventBus: IEventBus;

  // UIコンポーネント
  private questList!: QuestList;
  private goldDisplay!: GoldDisplay;

  // 内部状態
  private isProcessing = false;

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: SceneData): void { /* ... */ }
  create(): void { /* ... */ }
  // update() は必要な場合のみ定義
}
```

### コンポーネントクラス

```typescript
export class QuestCard extends BaseComponent {
  // プロパティはprivateでカプセル化
  private readonly quest: Quest;
  private cardBg!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, quest: Quest) {
    super(scene, x, y);
    this.quest = quest;
  }

  create(): void { /* ... */ }
  destroy(): void { /* ... */ }

  // 公開メソッドは明確な名前で
  setSelected(selected: boolean): void { /* ... */ }
  getQuest(): Quest { return this.quest; }
}
```

---

## Biome設定遵守

### フォーマット

- インデント: 2スペース
- 行幅: 100文字
- クォート: シングルクォート
- セミコロン: 必須
- 末尾カンマ: 全て

### リンター

- recommended ルールを遵守
- 警告は放置せず修正

---

## コメント

### 書くべきコメント

- 「なぜ」そうしたかの理由
- 複雑なビジネスロジックの説明
- TODO/FIXME（担当者とチケット番号付き）

```typescript
// ゲームバランス調整: 初期プレイでの挫折防止のため
// 1日目は必ずE難易度の依頼を1つ含める
const guaranteedEasyQuest = generateQuest(QuestDifficulty.E, client);

// TODO(TASK-0025): ランク昇格時の演出を追加
```

### 書くべきでないコメント

- コードを読めばわかること
- 古くなった情報
- コメントアウトされたコード

```typescript
// NG: コードで自明
// ゴールドを100増やす
this.stateManager.addGold(100);

// NG: 古いコード（削除すべき）
// const oldValue = calculateOld(x);
```

---

## ファイル構成

### 1ファイルの上限

- 300行を超えたら分割を検討
- 1コンポーネント = 1ファイルを原則

### 機能モジュール構成

```
features/quest/
├── components/
│   ├── QuestCard.ts
│   └── QuestList.ts
├── services/
│   ├── quest-generator.ts
│   └── quest-validator.ts
├── types/
│   └── quest.ts
└── index.ts           # 公開API
```

---

## 定数管理: GAME_CONFIG vs THEME

ゲーム内の定数は用途に応じて2つのファイルに分離して管理する。

### GAME_CONFIG (`@shared/constants/game-config.ts`)

**ゲームバランスに影響するパラメータ**を管理する。

| カテゴリ | 例 |
|---------|-----|
| 報酬・コスト | 依頼報酬、調合コスト、採取コスト、ショップ価格 |
| 制限値 | デッキ上限、手札上限、同時受注上限、保管上限 |
| ランク設定 | 必要貢献度、日数制限、昇格ボーナス |
| 品質パラメータ | 品質閾値、品質補正値、品質値マッピング |
| 依頼パラメータ | 難易度報酬、期限、依頼生成数、依頼タイプ補正 |
| 確率・閾値 | 品質変動閾値、コンボ補正率 |

```typescript
// 使用例
import { PLAYER_INITIAL, GATHERING_COST } from '@shared/constants';

const maxDeck = PLAYER_INITIAL.DECK_LIMIT;     // 30
const apCost = GATHERING_COST.thresholds[0];    // { maxCount: 0, additionalCost: 0 }
```

### THEME (`@shared/theme/theme.ts`)

**UIの見た目に関するパラメータ**を管理する。

| カテゴリ | 例 |
|---------|-----|
| 色 | 背景色、テキスト色、ボーダー色、品質色、ボタン色 |
| フォント | フォントファミリー、フォントサイズ |
| スペーシング | マージン、パディング |
| 視覚効果 | 光彩効果、アニメーション設定 |

```typescript
// 使用例
import { THEME, Colors } from '@shared/theme/theme';

const bgColor = Colors.background.primary;      // 0x2a2a3d
const fontSize = THEME.sizes.medium;             // 16
```

### 判断基準

新しい定数を追加する場合、以下の基準で配置先を決定する。

```
その定数を変更するとゲームバランスが変わるか？
  → YES: GAME_CONFIG（game-config.ts）
  → NO: その定数を変更するとUIの見た目が変わるか？
    → YES: THEME（theme.ts）
    → NO: 用途に応じて @shared/constants/ または各feature内に配置
```

### 注意事項

- GAME_CONFIGの値をTHEMEから参照しない（逆も同様）
- マジックナンバーは必ずどちらかのファイルに定数として定義する
- バランス設計書 (`docs/design/atelier-guild-rank/balance-design.md`) の変更時はGAME_CONFIGも同期更新する
- 各定数にはバランス設計書のセクション番号をコメントで対応付ける

---

## 禁止事項

- `eslint-disable` / `biome-ignore` のコメントを安易に使わない
- `@ts-ignore` / `@ts-expect-error` は原則禁止
- マジックナンバーは定数化（GAME_CONFIGまたはTHEMEに追加）
- ネストが深いコード（3階層以上は早期リターンで解消）
- `console.log` を本番コードに残さない
