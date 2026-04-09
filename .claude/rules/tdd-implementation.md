# TDD実装ルール

## 概要

プロジェクト固有のTDD（テスト駆動開発）実装ルールを定義する。
テストの基本規約は `testing.md` を参照。本ルールはTDDサイクルの実行手順に特化する。

---

## TDDサイクル

### Red（テスト作成）

#### テストファイル配置

```
tests/unit/features/{feature}/{対象サービス名}.test.ts
```

**禁止**: `src/` 配下へのテストファイル配置

#### インポートルール

```typescript
// エイリアスを使用（必須）
import { targetFunction } from '@features/{feature}';
import { SOME_CONFIG } from '@shared/constants';

// 相対パスは禁止
// import { targetFunction } from '../../../src/features/...';  // NG
```

#### describe構造

正常系と異常系を必ず分離する。

```typescript
describe('関数名またはクラス名', () => {
  // 共通セットアップ
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('基本的な動作を検証する', () => { /* ... */ });
    it('別のケースを検証する', () => { /* ... */ });
  });

  describe('異常系', () => {
    it('無効な入力でエラーを返す', () => { /* ... */ });
    it('境界値で適切に処理する', () => { /* ... */ });
  });
});
```

#### 失敗確認コマンド

```bash
pnpm test -- --run tests/unit/features/{feature}/{ファイル}.test.ts
```

テストが**失敗する**ことを必ず確認する。テストが成功してしまう場合はテスト設計を見直す。

---

### Green（最小実装）

#### 実装先

```
src/features/{feature}/services/{サービス名}.ts
```

#### 純粋関数の原則

Functional Coreに配置する関数は以下を遵守する:

- 副作用なし（外部状態の読み取り・変更をしない）
- 入力のみに依存（引数以外の情報を使わない）
- 同じ入力に対して常に同じ出力を返す
- 乱数が必要な場合はシード値を引数で受け取る

```typescript
// OK: 純粋関数
export function calculateReward(difficulty: Difficulty, baseGold: number): number {
  return baseGold * DIFFICULTY_MULTIPLIER[difficulty];
}

// NG: 副作用あり
export function calculateReward(difficulty: Difficulty): number {
  const baseGold = stateManager.getState().gold;  // 外部状態の参照
  return baseGold * DIFFICULTY_MULTIPLIER[difficulty];
}
```

#### 最小実装の原則

テストを通す**最小限のコード**のみ記述する。

- 将来必要になりそうな機能を先に実装しない
- テストケースにない分岐を追加しない
- 過度な抽象化を行わない

#### 成功確認コマンド

```bash
pnpm test -- --run tests/unit/features/{feature}/{ファイル}.test.ts
```

テストが**成功する**ことを確認する。

---

### Refactor（リファクタリング）

#### テスト維持

リファクタリング中は頻繁にテストを実行し、グリーン状態を維持する。

```bash
pnpm test -- --run tests/unit/features/{feature}/
```

#### リファクタリング対象

| 対象 | 具体例 |
|------|--------|
| 重複排除 | 同じ計算ロジックの関数化 |
| 命名改善 | 意図が伝わる変数名・関数名に変更 |
| 関数分割 | 1関数が長い場合にヘルパー関数に分割 |
| 定数化 | マジックナンバーをGAME_CONFIGに移動 |
| 型改善 | より厳密な型定義に変更 |

#### 定数化の判断基準

```
その値を変更するとゲームバランスが変わるか？
  → YES: GAME_CONFIG（src/shared/constants/game-config.ts）
  → NO: THEME または feature内の定数ファイル
```

---

## テストパターン

### Arrange-Act-Assert構造

全テストケースでAAA構造を徹底する。

```typescript
it('報酬が正しく計算される', () => {
  // Arrange: テストデータの準備
  const difficulty = QuestDifficulty.C;
  const baseGold = 100;

  // Act: テスト対象の実行
  const result = calculateReward(difficulty, baseGold);

  // Assert: 結果の検証
  expect(result).toBe(200);
});
```

### 境界値テスト

`it.each` パターンで境界値を網羅する。

```typescript
describe('境界値', () => {
  it.each([
    [0, 'C'],       // 最小値
    [49, 'C'],       // 閾値直前
    [50, 'B'],       // 閾値
    [69, 'B'],       // 次の閾値直前
    [70, 'A'],       // 次の閾値
    [89, 'A'],       // 最大閾値直前
    [90, 'S'],       // 最大閾値
    [100, 'S'],      // 最大値
  ])('品質%iの場合、グレード%sを返す', (quality, expectedGrade) => {
    expect(getGradeFromQuality(quality)).toBe(expectedGrade);
  });
});
```

### モック使用

```typescript
// beforeEachでリセット
beforeEach(() => {
  vi.clearAllMocks();
});

// 関数モック
const mockHandler = vi.fn();

// 戻り値の設定
const mockCalculate = vi.fn().mockReturnValue(100);

// モジュールモック
vi.mock('@shared/services/EventBus', () => ({
  createEventBus: vi.fn(() => ({
    emit: vi.fn(),
    on: vi.fn(() => vi.fn()),
  })),
}));
```

---

## サイクル完了後の作業

### 公開APIの更新

`src/features/{feature}/index.ts` に新しいエクスポートを追加する。

```typescript
// 新しい関数を追加
export { newFunction } from './services/new-service';

// 新しい型を追加
export type { NewType } from './types/new-type';
```

### 全体確認

```bash
# 全テスト
pnpm test -- --run

# 型チェック
pnpm typecheck
```

---

## カバレッジ目標

| 領域 | 目標 |
|------|------|
| Functional Core（services/） | 90%+ |
| 全体 | 80%+ |

### 除外対象

- 型定義ファイル（`.d.ts`）
- 設定ファイル（`vite.config.ts`, `vitest.config.ts` 等）
- モック・フィクスチャ（`tests/mocks/`）

---

## よくある間違いと対策

| 間違い | 対策 |
|--------|------|
| テスト未作成で実装を始める | 必ずRedフェーズから開始する |
| テストが失敗中にリファクタリング | Greenを確認してからRefactorに進む |
| 過度な実装（テストにないケース） | テストケースに対応するコードのみ書く |
| `src/` にテストファイルを配置 | `tests/unit/` に配置する |
| 相対パスでインポート | `@features/`, `@shared/` エイリアスを使用 |
| services/ に副作用を含む関数 | 副作用はImperative Shell（scenes/等）に分離 |
