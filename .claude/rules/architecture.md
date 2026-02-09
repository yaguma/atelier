# アーキテクチャ・ディレクトリ構成ルール

## 採用アーキテクチャ

本プロジェクトでは以下のアーキテクチャパターンを採用する。

1. **Feature-Based Architecture** - 機能単位でのコード配置
2. **Functional Core, Imperative Shell** - 純粋関数とI/Oの分離

---

## Feature-Based Architecture

### 概要

コードを技術的なレイヤー（controllers, services, models等）ではなく、**機能（Feature）単位**で整理する。各機能は自己完結的で、その機能に必要なすべてのコード（UI、ロジック、型定義）を含む。

### メリット

- **高凝集**: 関連するコードが近くに配置される
- **低結合**: 機能間の依存が明確になる
- **スケーラビリティ**: 新機能追加時に既存コードへの影響が少ない
- **削除容易性**: 機能をフォルダごと削除できる

### ディレクトリ構成

```
atelier-guild-rank/
├── src/
│   ├── features/               # 機能単位のモジュール
│   │   ├── quest/              # 依頼機能
│   │   │   ├── components/     # UI コンポーネント
│   │   │   ├── hooks/          # カスタムフック（状態・副作用）
│   │   │   ├── services/       # ビジネスロジック（純粋関数）
│   │   │   ├── types/          # 型定義
│   │   │   └── index.ts        # 公開API
│   │   ├── alchemy/            # 調合機能
│   │   ├── gathering/          # 採取機能
│   │   ├── deck/               # デッキ機能
│   │   ├── inventory/          # インベントリ機能
│   │   ├── shop/               # ショップ機能
│   │   └── rank/               # ランク機能
│   ├── shared/                 # 機能横断の共通コード
│   │   ├── components/         # 共通UIコンポーネント
│   │   ├── hooks/              # 共通フック
│   │   ├── services/           # 共通サービス（EventBus, StateManager等）
│   │   ├── types/              # 共通型定義
│   │   └── utils/              # ユーティリティ関数
│   ├── scenes/                 # Phaserシーン（機能を組み合わせる）
│   │   ├── BootScene.ts
│   │   ├── TitleScene.ts
│   │   ├── MainScene.ts
│   │   └── ...
│   └── main.ts                 # エントリーポイント
├── tests/                      # テスト
│   ├── unit/
│   │   ├── features/           # 機能単位のテスト
│   │   └── shared/             # 共通コードのテスト
│   └── integration/
└── e2e/
```

### 機能モジュールの構成例

```
features/quest/
├── components/
│   ├── QuestCard.ts            # 依頼カードUI
│   ├── QuestList.ts            # 依頼リストUI
│   └── QuestDetailModal.ts     # 依頼詳細モーダル
├── services/
│   ├── quest-generator.ts      # 依頼生成（純粋関数）
│   ├── quest-validator.ts      # 依頼検証（純粋関数）
│   └── reward-calculator.ts    # 報酬計算（純粋関数）
├── types/
│   ├── quest.ts                # Quest型定義
│   └── client.ts               # Client型定義
└── index.ts                    # 公開API
```

### 公開APIパターン

各機能モジュールは`index.ts`で公開APIを定義する。

```typescript
// features/quest/index.ts
export { QuestCard } from './components/QuestCard';
export { QuestList } from './components/QuestList';
export { generateQuest, validateQuest } from './services/quest-generator';
export type { Quest, QuestDifficulty } from './types/quest';
```

### インポートルール

```typescript
// 機能間のインポート: index.ts経由
import { Quest, generateQuest } from '@features/quest';
import { Card } from '@features/deck';

// 機能内のインポート: 直接参照OK
import { QuestCard } from './components/QuestCard';
import { validateQuest } from './services/quest-validator';

// 共通コード
import { EventBus } from '@shared/services';
import { Button } from '@shared/components';
```

---

## Functional Core, Imperative Shell

### 概要

アプリケーションを2つの部分に分離する。

| 部分 | 責務 | 特徴 |
|------|------|------|
| **Functional Core** | ビジネスロジック | 純粋関数、副作用なし、テスト容易 |
| **Imperative Shell** | I/O、状態管理、UI | 副作用あり、外部との境界 |

### Functional Core（純粋関数）

入力のみに依存し、常に同じ結果を返す。副作用を持たない。

```typescript
// features/alchemy/services/quality-calculator.ts

/**
 * 調合品質を計算する（純粋関数）
 * - 外部状態を参照しない
 * - 同じ入力に対して常に同じ出力
 * - 副作用なし
 */
export function calculateQuality(
  materials: readonly MaterialInstance[],
  recipe: Recipe,
): QualityResult {
  const baseQuality = materials.reduce((sum, m) => sum + m.quality, 0) / materials.length;
  const bonus = recipe.qualityBonus ?? 0;
  const finalQuality = Math.min(100, baseQuality + bonus);

  return {
    quality: finalQuality,
    grade: getGradeFromQuality(finalQuality),
  };
}

/**
 * 品質からグレードを決定する（純粋関数）
 */
export function getGradeFromQuality(quality: number): Grade {
  if (quality >= 90) return 'S';
  if (quality >= 70) return 'A';
  if (quality >= 50) return 'B';
  return 'C';
}
```

### Imperative Shell（副作用を持つ層）

外部とのI/O、状態の更新、UIのレンダリングを担当。

```typescript
// scenes/MainScene.ts（Imperative Shell）

class MainScene extends Phaser.Scene {
  private stateManager: IStateManager;
  private eventBus: IEventBus;

  create(): void {
    // 状態の読み取り（副作用）
    const state = this.stateManager.getState();

    // 純粋関数の呼び出し（Functional Core）
    const quests = generateQuests(state.rank, state.currentDay);

    // 状態の更新（副作用）
    this.stateManager.updateState({ availableQuests: quests });

    // UIの作成（副作用）
    this.questList = new QuestList(this, quests);
    this.questList.create();

    // イベント発行（副作用）
    this.eventBus.emit(GameEventType.QUESTS_GENERATED, { quests });
  }
}
```

### 設計指針

#### Functional Core に置くもの

- 計算ロジック（報酬計算、品質計算、ダメージ計算等）
- バリデーション
- データ変換
- ビジネスルール判定

#### Imperative Shell に置くもの

- Phaserシーン
- UIコンポーネント
- StateManager操作
- EventBus操作
- ローカルストレージ読み書き
- ネットワーク通信

### テスト戦略

| 部分 | テスト方法 | カバレッジ目標 |
|------|-----------|--------------|
| Functional Core | ユニットテスト（モック不要） | 90%+ |
| Imperative Shell | 統合テスト・E2Eテスト | 60%+ |

```typescript
// Functional Coreのテスト（シンプル、高速）
describe('calculateQuality', () => {
  it('素材の平均品質を計算する', () => {
    const materials = [
      { quality: 80 },
      { quality: 60 },
    ];
    const recipe = { qualityBonus: 10 };

    const result = calculateQuality(materials, recipe);

    expect(result.quality).toBe(80); // (80+60)/2 + 10
    expect(result.grade).toBe('A');
  });
});
```

---

## パスエイリアス

```typescript
// tsconfig.json で定義
{
  "compilerOptions": {
    "paths": {
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"],
      "@scenes/*": ["src/scenes/*"]
    }
  }
}
```

---

## テストファイル配置

テストファイルは**専用ディレクトリ配置**パターンを採用する。

```
tests/
├── unit/
│   ├── features/           # 機能単位のテスト（src/features/と対応）
│   │   ├── quest/
│   │   ├── alchemy/
│   │   └── ...
│   └── shared/             # 共通コードのテスト
├── integration/            # 統合テスト
└── mocks/                  # テスト用モック

e2e/
├── specs/                  # E2Eテストスペック
├── pages/                  # Page Objects
└── fixtures/               # テストデータ
```

### 禁止事項

- `src/` 配下にテストファイル（`.test.ts`、`.spec.ts`）を配置しない
- テストファイルで相対パスインポートを使用しない
- `tests/` 直下にテストファイルを配置しない

---

## 禁止事項

- 機能モジュール間の直接的な内部参照（`index.ts`経由で公開されていないものをインポート）
- Functional Core内での副作用（状態変更、I/O、乱数生成等）
- Imperative Shell内での複雑なビジネスロジック
- 循環依存の発生
