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

## 禁止事項

- `eslint-disable` / `biome-ignore` のコメントを安易に使わない
- `@ts-ignore` / `@ts-expect-error` は原則禁止
- マジックナンバーは定数化
- ネストが深いコード（3階層以上は早期リターンで解消）
- `console.log` を本番コードに残さない
