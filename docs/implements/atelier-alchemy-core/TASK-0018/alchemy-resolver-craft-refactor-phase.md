# TASK-0018 Refactorフェーズ記録: AlchemyResolver.craft オーケストレーター実装

**機能名**: AlchemyResolver.craft（調合オーケストレーター）
**タスクID**: TASK-0018
**要件名**: atelier-alchemy-core
**フェーズ**: Refactor（品質改善）
**作成日**: 2026-08-03

---

## 1. リファクタリング方針

Greenフェーズの実装は機能的に完成しており（単体75/75・統合2/2・全体回帰91/91）、アルゴリズム自体の変更は行わない。TASK-0013〜0017（`quality_calculator.gd`・`trait_activation.gd`・`value_calculator.gd`）で確立された「ファイル冒頭に⚠️設計判断ブロックを置き、Godotアーキテクトレビュー対応・申し送り事項を明文化する」規約に、本ファイルの冒頭コメントを揃えることを主目的とした。

Green フェーズ記録の「5. 課題・改善点」で指摘されていた以下3点に対応する:

1. コメントの信頼性レベル注記の粒度をTASK-0013〜0017の既存ファイルと揃える
2. `rejected_category` 設定部分のコメントをより明確にする
3. 本ファイルがGodotアーキテクトレビュー2件（Critical#1・Warning#2）双方の対応の核心であることの明示

加えて、ユーザー指示（コードレビュー観点）に基づき以下を追加した:

- Warning#2対応であることをコメントで明示し、将来UIや他機能が個別関数を直接呼び出すコードを書かないよう注意喚起する一文を追加
- TASK-0013〜0017から持ち越された4つの未確定事項（float→int変換ポイント、trait_definitions/recipe引数の追加、rejected_categoryの無効値表現、指定合致ボーナスの二重適用疑義）がこの統合箇所に集約されていることを明示
- GameState等Autoloadを一切参照しない純粋関数であることを明示（Critical#1・Warning#2双方の対応の核心）

---

## 2. 改善内容の詳細

### 2-1. ファイル冒頭ヘッダーコメントの拡充

従来（Greenフェーズ）は「機能概要・実装方針・テスト対応・信頼性レベル」の4行程度だった冒頭コメントを、以下の3ブロックに再構成した。

- **【Godotアーキテクトレビュー Critical#1 対応】**: `static func`のみで構成し`GameState`等のAutoloadを一切参照しない純粋関数であること、全依存を引数で受け取ることを明記。`trait_activation.gd`冒頭のCritical#1コメントと同一方針であることを相互参照した。
- **【Godotアーキテクトレビュー Warning#2 対応】**: 旧設計（UIが`QualityCalculator`/`TraitActivation`/`ValueCalculator`を個別に直接呼び出す）の設計上の欠陥を明記し、🚨マークで「将来の実装者への注意」として、UIや他機能から個別関数を直接呼び出すコードを新たに書かないよう明示的に注意喚起した。
- **【TASK-0013〜0017からの申し送り事項の統合地点】**: 4論点（float→int変換ポイント／trait_definitions・recipe引数の追加／rejected_categoryの無効値表現／指定合致ボーナスの二重適用疑義）を番号付きで列挙し、各論点が本ファイルのどこで解決されているかを相互参照した。特に4点目（二重適用疑義）は、value_calculator.gd「設計判断1」の既存指摘を踏まえ、「本関数内では各値計算関数を1回ずつしか呼ばないため二重適用は発生しないが、guild機能側との責務重複自体は未解消でPhase 4着手前に確定が必要」と明確に切り分けた。

### 2-2. 関数ドキュメントコメントへの「呼び出し契約」追記

`craft()`関数のドキュメントコメントに「【呼び出し契約】: 調合ロジックが必要な箇所は必ずこの関数を経由すること」を追加し、関数を見た時点でもWarning#2対応の意図が即座に分かるようにした。

### 2-3. ステップ5コメントへの申し送り事項4の確認注記追加

`calculate_contribution`/`calculate_reward`の呼び出し箇所に、「各関数はここで1回ずつしか呼び出しておらず、本関数内で指定合致ボーナスが二重適用されることはない」ことを明示的に確認するコメントを追加した。

### 2-4. 変更しなかった箇所

- 5ステップの合成順序・分岐ロジック（EDGE-001ガード、`rejected_category`設定の`if`分岐）は一切変更していない。
- `rejected_category`設定部分の既存コメント（`has_rejected_category`契約の説明）は既にGreenフェーズ時点で明確だったため、大きな書き換えはせず維持した。

---

## 3. セキュリティレビュー

- 本関数は純粋関数であり、外部入力（ユーザー操作・ネットワーク・ファイルI/O）を直接受け付けない。呼び出し元（TASK-0019 GameState.craft）が渡す型付き引数（`Array[MaterialInstance]`, `int`, `RecipeDefinition`, `Dictionary`）のみを扱う。
- `trait_definitions`（Dictionary）へのアクセスは`TraitActivation`側の既存実装に委譲しており、本関数自体は辞書のキー探索・注入等のリスクを持たない。
- 機密情報の扱い・認証認可・SQLインジェクション等は本関数のスコープ外（該当なし）。
- 重大な脆弱性は発見されなかった。

## 4. パフォーマンスレビュー

- 計算量: 5ステップはいずれも投入素材数・発現特性数に対してO(n)の単純な走査・合計・乗算のみで構成されており、本オーケストレーターが追加するオーバーヘッドは定数個のフィールド代入のみ。
- 調合投入枠は数個規模（REQ-101想定4枠）であり、計算量上の懸念はない。
- `CraftResult.new()`のオブジェクト生成は1回のみ（`craft()`呼び出しごとに1個）。ループ内でのオブジェクト生成は存在しない。
- 重大な性能課題は発見されなかった。

---

## 5. テスト実行結果（リファクタ後）

### 単体テスト（`res://tests/unit/features/alchemy`）

```
Totals
------
Scripts               8
Tests                75
Passing Tests        75
Asserts             148
Time              1.958s

---- All tests passed! ----
```

### 統合テスト（`res://tests/integration/features/alchemy`）

```
Totals
------
Scripts               1
Tests                 2
Passing Tests         2
Asserts               8
Time              0.635s

---- All tests passed! ----
```

### 全体回帰確認（`res://tests/unit`）

```
Totals
------
Scripts              11
Tests                91
Passing Tests        91
Asserts            1188
Time              2.295s

---- All tests passed! ----
```

コメント追加のみでロジック変更を行っていないため、リファクタ前後でテスト結果に変化はない（すべてGreenのまま維持）。

---

## 6. 品質判定結果

```
✅ 高品質
- テスト結果: 単体75/75・統合2/2・全体回帰91/91 すべてBash経由でのGUT実行で継続成功
- セキュリティ: 重大な脆弱性なし（純粋関数・外部入力の直接受付なし）
- パフォーマンス: 重大な性能課題なし（O(n)の単純合成のみ、追加オブジェクト生成は1回のみ）
- リファクタ品質: 目標達成（Critical#1・Warning#2対応の明示、4申し送り事項の統合箇所の明文化）
- コード品質: TASK-0013〜0017の既存ファイルと同水準のヘッダーコメント規約に統一
- ファイルサイズ: 124行（500行制限に対し大幅に余裕あり）
- モック使用: 実装コードにモック・スタブは含まれていない（機能変更なし）
- ドキュメント: 完成（本ファイル・メモファイルを更新）
```

---

## 7. 今後の申し送り（本タスクのスコープ外）

- 指定合致ボーナスの二重適用疑義（guild機能側`delivery_calculator.gd`との責務重複）は、Phase 4（guild機能）着手前にarchitecture.md/dataflow.mdの整合を取り、設計を確定させる必要がある（value_calculator.gd「設計判断1」に詳細記録済み）。
- `rejected_category`（String想定 vs 実物Category enum）・`contribution`/`reward`（int想定 vs 実物float）というrequirements.md本文との型差異は、要件定義書本文への反映が別タスクとして必要（テストケース定義書で申し送り済み）。
