# テストルール

## 基本原則

- TDD（テスト駆動開発）を推奨
- テストをスキップせず、問題があれば修正
- 実装詳細ではなく振る舞いをテスト

---

## テストの種類と配置

### ディレクトリ構成

```
tests/
├── unit/                    # ユニットテスト
│   ├── features/            # 機能単位のテスト
│   │   ├── quest/
│   │   ├── alchemy/
│   │   └── ...
│   └── shared/              # 共通コードのテスト
├── integration/             # 統合テスト
└── mocks/                   # テスト用モック

e2e/
├── specs/                   # E2Eテストスペック
├── pages/                   # Page Objects
└── fixtures/                # テストデータ
```

### テスト種別

| 種別 | ツール | 対象 | カバレッジ目標 |
|------|--------|------|--------------|
| ユニット | Vitest | 純粋関数、サービス | 90%+ |
| 統合 | Vitest | サービス連携、状態管理 | 70%+ |
| E2E | Playwright | ユーザーフロー | クリティカルパス |

---

## ユニットテスト

### ファイル命名

- `{対象ファイル名}.test.ts`
- 配置: `tests/unit/` 以下（`src/`内に配置しない）

### 構造

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { generateQuest } from '@features/quest';

describe('generateQuest', () => {
  describe('正常系', () => {
    it('指定された難易度の依頼を生成する', () => {
      const quest = generateQuest(QuestDifficulty.D, mockClient);

      expect(quest.difficulty).toBe(QuestDifficulty.D);
      expect(quest.client).toBe(mockClient);
    });

    it('報酬がゴールド基準に従う', () => {
      const quest = generateQuest(QuestDifficulty.C, mockClient);

      expect(quest.reward.gold).toBeGreaterThanOrEqual(100);
      expect(quest.reward.gold).toBeLessThanOrEqual(200);
    });
  });

  describe('異常系', () => {
    it('無効な難易度でエラーを投げる', () => {
      expect(() => generateQuest('X' as QuestDifficulty, mockClient))
        .toThrow('Invalid difficulty');
    });
  });
});
```

### モック

```typescript
import { vi, Mock } from 'vitest';

// 関数モック
const mockCalculate = vi.fn().mockReturnValue(100);

// モジュールモック
vi.mock('@shared/services/EventBus', () => ({
  EventBus: {
    emit: vi.fn(),
    on: vi.fn(() => vi.fn()),
  },
}));

// リセット
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## 統合テスト

### 配置

`tests/integration/` 以下

### 例: StateManager + EventBus連携

```typescript
describe('StateManager Integration', () => {
  let stateManager: StateManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    stateManager = new StateManager(eventBus, initialState);
  });

  it('フェーズ変更時にイベントが発行される', () => {
    const handler = vi.fn();
    eventBus.on(GameEventType.PHASE_CHANGED, handler);

    stateManager.setPhase(GamePhase.GATHERING);

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          previousPhase: GamePhase.QUEST_ACCEPT,
          newPhase: GamePhase.GATHERING,
        },
      }),
    );
  });
});
```

---

## E2Eテスト

### 配置

`e2e/specs/` 以下

### Page Objectパターン

```typescript
// e2e/pages/MainPage.ts
export class MainPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async selectQuest(index: number): Promise<void> {
    await this.page.locator(`[data-testid="quest-${index}"]`).click();
  }

  async acceptQuest(): Promise<void> {
    await this.page.locator('[data-testid="accept-button"]').click();
  }

  async getGoldDisplay(): Promise<string> {
    return await this.page.locator('[data-testid="gold-display"]').textContent() ?? '';
  }
}
```

### テストスペック

```typescript
// e2e/specs/quest-flow.spec.ts
import { test, expect } from '@playwright/test';
import { MainPage } from '../pages/MainPage';

test.describe('依頼フロー', () => {
  test('依頼を受注して完了できる', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.goto();

    // 依頼選択
    await mainPage.selectQuest(0);
    await mainPage.acceptQuest();

    // 依頼完了を確認
    await expect(page.locator('[data-testid="phase-indicator"]'))
      .toHaveText('GATHERING');
  });
});
```

### data-testid属性

E2E用セレクタは`data-testid`属性を使用。

```typescript
// コンポーネント側
this.goldText = this.scene.add.text(x, y, '0 G');
this.goldText.setData('testid', 'gold-display');
```

---

## テスト実行

### コマンド

```bash
# ユニットテスト
pnpm test                    # 全テスト実行
pnpm test:watch              # ウォッチモード
pnpm test tests/unit/features/quest  # 特定ディレクトリ
pnpm test -t "generateQuest" # パターンマッチ

# カバレッジ
pnpm test:coverage

# E2E
pnpm test:e2e               # ヘッドレス実行
pnpm test:e2e:headed        # ブラウザ表示
pnpm test:e2e e2e/specs/quest-flow.spec.ts  # 特定ファイル
```

---

## カバレッジ目標

| 領域 | 目標 |
|------|------|
| 全体 | 80%+ |
| Functional Core (services) | 90%+ |
| 共通ユーティリティ | 90%+ |
| UIコンポーネント | 60%+ |

### 除外対象

- 型定義ファイル（`.d.ts`）
- 設定ファイル
- モック・フィクスチャ

---

## ベストプラクティス

### Arrange-Act-Assert

```typescript
it('ゴールドが加算される', () => {
  // Arrange
  const initialGold = 100;
  const state = createState({ gold: initialGold });

  // Act
  const result = addGold(state, 50);

  // Assert
  expect(result.gold).toBe(150);
});
```

### 境界値テスト

```typescript
describe('validateQuantity', () => {
  it.each([
    [0, 1],      // 最小値以下
    [1, 1],      // 最小値
    [50, 50],    // 中間値
    [99, 99],    // 最大値
    [100, 99],   // 最大値超過
  ])('入力%iは%iになる', (input, expected) => {
    expect(validateQuantity(input)).toBe(expected);
  });
});
```

### 非同期テスト

```typescript
it('データ読み込み後に表示更新される', async () => {
  const component = new DataComponent(scene);
  component.create();

  await component.loadData();

  expect(component.getText()).toBe('Loaded');
});
```

---

## 禁止事項

- `it.skip` / `describe.skip` を放置しない
- テスト内で `console.log` を残さない
- CI環境で `.only()` を使用しない
- テスト間に依存関係を作らない
- 実装詳細（private メソッド）を直接テストしない
- `src/` 内にテストファイルを配置しない
