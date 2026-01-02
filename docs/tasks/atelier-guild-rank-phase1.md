# Phase 1: 基盤・インフラストラクチャ層

**フェーズ期間**: 約12日（96時間）
**タスク数**: 12タスク（TASK-0072 〜 TASK-0083）
**目標**: 開発環境とデータ層の基盤を構築
**成果物**: ビルド可能なプロジェクト、マスターデータ、セーブデータリポジトリ

---

## フェーズ概要

プロジェクトの基盤となる開発環境とインフラストラクチャ層を構築する。
TypeScript/ビルド環境、テスト環境、データ永続化、マスターデータ読み込み機能を実装。

---

## 週次計画

### Week 1（TASK-0072〜0076）
- **目標**: 開発環境の完成、ストレージ基盤の構築
- **成果物**:
  - ビルド・テスト可能なプロジェクト
  - LocalStorageリポジトリ
  - マスターデータローダー

### Week 2（TASK-0077〜0083）
- **目標**: マスターデータ・セーブデータの定義完了
- **成果物**:
  - 全マスターデータJSON
  - セーブデータリポジトリ
  - 型定義ファイル

---

## タスク詳細

### TASK-0072: プロジェクト初期設定 🔵

- [ ] タスク完了

**種別**: DIRECT
**推定時間**: 8時間
**依存**: なし
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### 完了条件

- プロジェクトディレクトリが作成されている
- Clean Architectureに準拠したディレクトリ構造が存在する
- package.jsonが作成されている

#### 実装内容

```
atelier-guild-rank-html/
├── src/
│   ├── domain/           # ドメイン層
│   ├── application/      # アプリケーション層
│   ├── infrastructure/   # インフラストラクチャ層
│   ├── presentation/     # プレゼンテーション層
│   └── index.ts          # エントリーポイント
├── public/
│   ├── index.html
│   └── assets/
├── data/
│   └── master/           # マスターデータJSON
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── tsconfig.json
└── README.md
```

#### 受け入れ基準

- [ ] ディレクトリ構造がClean Architectureに準拠している
- [ ] package.jsonに必要な依存関係が定義されている
- [ ] READMEにプロジェクト概要とセットアップ手順が記載されている

---

### TASK-0073: TypeScript/ビルド環境構築 🔵

- [ ] タスク完了

**種別**: DIRECT
**推定時間**: 8時間
**依存**: TASK-0072
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### 完了条件

- TypeScriptコンパイルが成功する
- 開発サーバーが起動する
- ESLint/Prettierが動作する

#### 実装内容

- TypeScript設定（tsconfig.json）
- ビルドツール設定（Vite推奨）
- ESLint/Prettier設定
- パス解決（@domain, @application, @infrastructure, @presentation）

#### 受け入れ基準

- [ ] `npm run build` でTypeScriptがコンパイルされる
- [ ] `npm run dev` で開発サーバーが起動する
- [ ] パスエイリアスが正しく解決される
- [ ] ESLint/Prettierが動作する

---

### TASK-0074: テスト環境構築（Vitest） 🔵

- [ ] タスク完了

**種別**: DIRECT
**推定時間**: 8時間
**依存**: TASK-0073
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD

#### 完了条件

- `npm run test` でテストが実行される
- カバレッジレポートが生成される
- サンプルテストが通過する

#### 実装内容

- Vitest設定
- カバレッジ設定
- テストユーティリティ作成

#### 受け入れ基準

- [ ] `npm run test` でテストが実行される
- [ ] `npm run test:coverage` でカバレッジレポートが生成される
- [ ] サンプルテストが通過する

---

### TASK-0075: LocalStorageリポジトリ基盤 🔵

- [ ] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0074
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**設計参照**: [data-schema.md](../design/atelier-guild-rank/data-schema.md)

#### 完了条件

- 全テストケースが通過する
- localStorageへの読み書きが正しく動作する
- 型安全なインターフェースが実装されている

#### テストケース

```typescript
describe('LocalStorageRepository', () => {
  it('データを保存できる');
  it('データを読み込める');
  it('データを削除できる');
  it('存在しないキーはnullを返す');
  it('JSONシリアライズ/デシリアライズが正しく動作する');
});
```

#### 実装インターフェース

```typescript
interface IStorageRepository<T> {
  save(key: string, data: T): void;
  load(key: string): T | null;
  delete(key: string): void;
  exists(key: string): boolean;
}
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] localStorageへの読み書きが正しく動作する

---

### TASK-0076: マスターデータローダー 🔵

- [ ] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0075
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**設計参照**: [data-schema.md](../design/atelier-guild-rank/data-schema.md)

#### 完了条件

- 全テストケースが通過する
- JSONファイルの読み込みが動作する
- エラーハンドリングが適切

#### テストケース

```typescript
describe('MasterDataLoader', () => {
  it('JSONファイルを読み込める');
  it('複数のマスターデータを一括ロードできる');
  it('存在しないファイルでエラーをスローする');
  it('不正なJSONでエラーをスローする');
  it('キャッシュが機能する');
});
```

#### 実装インターフェース

```typescript
interface IMasterDataLoader {
  load<T>(path: string): Promise<T>;
  loadAll(): Promise<MasterDataSet>;
  clearCache(): void;
}

interface MasterDataSet {
  cards: CardMaster[];
  materials: MaterialMaster[];
  items: ItemMaster[];
  quests: QuestMaster[];
  ranks: RankMaster[];
  artifacts: ArtifactMaster[];
}
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] fetchを使用してJSONファイルを読み込める
- [ ] エラーハンドリングが適切に行われる

---

### TASK-0077: カードマスターデータ定義 🔵

- [ ] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0076
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts), [game-mechanics.md](../design/atelier-guild-rank/game-mechanics.md)

#### 完了条件

- 全テストケースが通過する
- cards.jsonが設計書の仕様に準拠
- TypeScript型定義が完備

#### テストケース

```typescript
describe('CardMaster', () => {
  describe('GatheringCardMaster', () => {
    it('採取地カードのスキーマが正しい');
    it('獲得素材リストが正しく解析される');
    it('獲得確率が0-100の範囲である');
  });

  describe('RecipeCardMaster', () => {
    it('レシピカードのスキーマが正しい');
    it('必要素材リストが正しく解析される');
    it('完成アイテムIDが正しく参照される');
  });

  describe('EnhancementCardMaster', () => {
    it('強化カードのスキーマが正しい');
    it('効果タイプと効果値が正しく解析される');
  });
});
```

#### データファイル

`data/master/cards.json` を作成：
- 採取地カード（10種類以上）
- レシピカード（15種類以上）
- 強化カード（5種類以上）

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] cards.jsonが設計書の仕様に準拠している
- [ ] TypeScript型定義が完備している

---

### TASK-0078: 素材マスターデータ定義 🔵

- [ ] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0076
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts)

#### 完了条件

- 全テストケースが通過する
- materials.jsonが設計書の仕様に準拠

#### テストケース

```typescript
describe('MaterialMaster', () => {
  it('素材のスキーマが正しい');
  it('カテゴリが正しく定義されている');
  it('レアリティが正しく定義されている');
  it('スタック可能フラグが正しい');
});
```

#### データファイル

`data/master/materials.json` を作成：
- 基本素材（薬草、水、石など）
- 中級素材（鉱石、キノコなど）
- レア素材（火山石、魔法素材など）

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] materials.jsonが設計書の仕様に準拠している

---

### TASK-0079: アイテムマスターデータ定義 🔵

- [ ] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0076
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts)

#### 完了条件

- 全テストケースが通過する
- items.jsonが設計書の仕様に準拠

#### テストケース

```typescript
describe('ItemMaster', () => {
  it('アイテムのスキーマが正しい');
  it('品質範囲が正しく定義されている');
  it('対応依頼カテゴリが正しい');
  it('売却価格が正しい');
});
```

#### データファイル

`data/master/items.json` を作成：
- 回復薬系
- 解毒剤系
- 爆弾系
- 武器系

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] items.jsonが設計書の仕様に準拠している

---

### TASK-0080: 依頼マスターデータ定義 🔵

- [ ] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0076
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts), [game-mechanics.md](../design/atelier-guild-rank/game-mechanics.md)

#### 完了条件

- 全テストケースが通過する
- quests.jsonが設計書の仕様に準拠

#### テストケース

```typescript
describe('QuestMaster', () => {
  it('依頼のスキーマが正しい');
  it('難易度が1-5の範囲である');
  it('必要アイテムが正しく定義されている');
  it('報酬（ゴールド、貢献度）が正しい');
  it('解放ランクが正しい');
});
```

#### データファイル

`data/master/quests.json` を作成：
- Gランク依頼
- Fランク依頼
- Eランク依頼
- （以降、各ランクの依頼）

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] quests.jsonが設計書の仕様に準拠している

---

### TASK-0081: ランクマスターデータ定義 🔵

- [ ] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0076
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts), [core-systems.md](../design/atelier-guild-rank/core-systems.md)

#### 完了条件

- 全テストケースが通過する
- ranks.jsonが設計書の仕様に準拠

#### テストケース

```typescript
describe('RankMaster', () => {
  it('ランクのスキーマが正しい');
  it('ランク順序が G < F < E < D < C < B < A < S である');
  it('昇格ゲージ最大値が正しい');
  it('ランク維持日数が正しい');
  it('昇格試験内容が正しく定義されている');
});
```

#### データファイル

`data/master/ranks.json` を作成：
- G〜Sランクの定義
- 昇格ゲージ要件
- 昇格試験課題

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] ranks.jsonが設計書の仕様に準拠している

---

### TASK-0082: アーティファクトマスターデータ定義 🔵

- [ ] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0076
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**設計参照**: [interfaces.ts](../design/atelier-guild-rank/interfaces.ts), [game-mechanics.md](../design/atelier-guild-rank/game-mechanics.md)

#### 完了条件

- 全テストケースが通過する
- artifacts.jsonが設計書の仕様に準拠

#### テストケース

```typescript
describe('ArtifactMaster', () => {
  it('アーティファクトのスキーマが正しい');
  it('レアリティが正しく定義されている');
  it('パッシブ効果が正しく定義されている');
  it('取得条件（ショップ/昇格報酬）が正しい');
});
```

#### データファイル

`data/master/artifacts.json` を作成：
- コモンアーティファクト
- レアアーティファクト
- エピックアーティファクト
- レジェンダリーアーティファクト

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] artifacts.jsonが設計書の仕様に準拠している

---

### TASK-0083: セーブデータリポジトリ 🔵

- [ ] タスク完了

**種別**: TDD
**推定時間**: 8時間
**依存**: TASK-0075
**要件名**: アトリエギルドランク HTML版
**GitHub Issue**: #TBD
**設計参照**: [data-schema.md](../design/atelier-guild-rank/data-schema.md)

#### 完了条件

- 全テストケースが通過する
- セーブデータのCRUD操作が正しく動作
- バージョン互換性チェックが機能

#### テストケース

```typescript
describe('SaveDataRepository', () => {
  it('新規セーブデータを作成できる');
  it('セーブデータを読み込める');
  it('セーブデータを更新できる');
  it('セーブデータを削除できる');
  it('セーブデータの存在確認ができる');
  it('セーブデータのバージョン管理ができる');
});
```

#### 実装インターフェース

```typescript
interface ISaveDataRepository {
  create(initialData: SaveData): void;
  load(): SaveData | null;
  save(data: SaveData): void;
  delete(): void;
  exists(): boolean;
  getVersion(): number;
}

interface SaveData {
  version: number;
  gameState: GameState;
  playerState: PlayerState;
  deckState: DeckState;
  inventoryState: InventoryState;
  questState: QuestState;
  timestamp: string;
}
```

#### 受け入れ基準

- [ ] 全テストケースが通過する
- [ ] セーブデータのCRUD操作が正しく動作する
- [ ] バージョン互換性チェックが機能する

---

## フェーズ完了基準

- [ ] 全12タスクが完了している
- [ ] 全テストが通過する
- [ ] カバレッジが80%以上
- [ ] マスターデータが設計書に準拠している
- [ ] ドキュメントが更新されている

---

## 次フェーズへの移行条件

1. 全タスクのチェックボックスが完了
2. CIでテストが通過
3. Phase 2の依存タスク（TASK-0077〜TASK-0083）が全て完了

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-01-02 | 1.0.0 | 初版作成 |
