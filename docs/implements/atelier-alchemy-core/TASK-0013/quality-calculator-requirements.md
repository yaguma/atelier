# TASK-0013 TDD要件定義書: QualityCalculator.calculate_base_quality

**機能名**: 基礎品質算出（QualityCalculator.calculate_base_quality）
**タスクID**: TASK-0013
**要件名**: atelier-alchemy-core
**作成日**: 2026-07-31
**フェーズ**: Phase 3 - 調合コアロジック（★核心）

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

- 🔵 **何をする機能か**: 調合に投入された素材群（`Array[MaterialInstance]`）の品質値（D=1〜S=5）の算術平均を「基礎品質」として算出する純粋関数。
- 🔵 **どのような問題を解決するか**: 調合結果の品質を決定する起点となる値を提供する。後続の品質ペナルティ適用（REQ-111/TASK-0016）・貢献度/報酬算出（REQ-109,110/TASK-0017）はこの基礎品質を入力とするため、正確な平均値算出が必須。
- 🟡 **想定されるユーザー**: 直接のエンドユーザーではなく、調合オーケストレーター（`AlchemyResolver.craft`/TASK-0018）が呼び出す内部ロジック。プレイヤーは調合フェーズでこの計算結果を品質として体感する。
- 🔵 **システム内での位置づけ**: Functional Core（`features/alchemy/logic/`）に配置される副作用のない純粋関数。dataflow.md「機能2: 調合」のオーケストレーション5ステップのうち**ステップ1（基礎品質算出）**に該当する。
- **参照したEARS要件**: REQ-105
- **参照した設計文書**: architecture.md「Functional Core（logic/）」、dataflow.md「機能2: 調合」

---

## 2. 入力・出力の仕様（EARS機能要件・型定義ベース）

### 入力
- 🔵 **パラメータ**: `materials: Array[MaterialInstance]`
- 🔵 **要素の型**: `MaterialInstance`（TASK-0012実装済み）。`quality: int`（D=1, C=2, B=3, A=4, S=5）、`traits: Array[String]` を持つ。
- 🔵 **本関数が使用するプロパティ**: `quality`（int）のみ。`traits`は本関数では未使用（特性ペナルティはTASK-0016の責務）。
- 🟡 **範囲・制約**: `quality`は1〜5を想定。空配列 `[]` も入力として許容する。

### 出力
- 🔵 **戻り値の型**: `float`
- 🔵 **戻り値の意味**: 投入素材の`quality`値の算術平均（基礎品質、ペナルティ適用前）。
- 🔵 **空配列時の戻り値**: `0.0`（ゼロ除算・クラッシュ回避の防御的実装）。

### 入出力の関係性
- 🔵 `戻り値 = (Σ materials[i].quality) / materials.size()`（`size() > 0` の場合）。
- 🔵 `materials.size() == 0` の場合は `0.0`。

### データフロー
- 🔵 呼び出し側（TASK-0018）が投入素材配列を渡す → 本関数が平均を返す → 後続のペナルティ適用（TASK-0016）へ引き継がれる。

### ⚠️ 型に関する設計判断（重要）
- 🟡 architecture.md の関数シグネチャ例は `-> int` だが、TC-101-01 の期待値 `2.5` は非整数。この設計文書間の不整合に対し、**本タスクでは戻り値型を `float` として採用**する（TC-101-01をそのまま満たすため）。
- 🟡 `float` → Quality enum（D〜S）への丸め・変換は呼び出し側（TASK-0016等）の責務とし、実装コードにコメントで変換ポイントを明示する。

- **参照したEARS要件**: REQ-105
- **参照した設計文書**: architecture.md（シグネチャ例）、data-model.md（Quality: D=1〜S=5）、note.md「6. 注意事項」

---

## 3. 制約条件（EARS非機能要件・アーキテクチャ設計ベース）

- 🔵 **純粋関数制約**: `static func` のみで構成。`RefCounted`を継承し`Node`は継承しない。GameState・Autoload等の外部状態を一切参照しない（architecture.md「Functional Core」原則）。
- 🔵 **副作用禁止**: 引数以外の情報を使用せず、同一入力に対し常に同一出力を返す。
- 🔵 **防御的実装**: 空配列時にゼロ除算・例外・クラッシュを起こさない（`0.0`を返す）。
- 🟡 **パフォーマンス**: 単純なO(n)ループ。特別な最適化要件はなし。
- 🟡 **テストカバレッジ**: Functional Coreとして最も高いカバレッジ目標（90%+）を課す（acceptance-criteria.md 記載）。
- 🔵 **配置制約**: 実装は `atelier-godot/features/alchemy/logic/quality_calculator.gd`、テストは `atelier-godot/tests/unit/features/alchemy/quality_calculator_test.gd`。
- **参照したEARS要件**: REQ-105、EDGE-001
- **参照した設計文書**: architecture.md「Functional Core（logic/）」、acceptance-criteria.md（カバレッジ目標）

---

## 4. 想定される使用例（EARSエッジケース・データフローベース）

### 基本パターン（TC-101-01） 🔵
- **入力**: 品質 D(1)/C(2)/B(3)/A(4) の無特性素材 各1個
- **期待**: `(1+2+3+4)/4 = 2.5`

### 単一素材 🟡
- **入力**: 品質 S(5) の素材1個
- **期待**: `5.0`（単一要素の平均は自身に一致）

### 同一品質 🟡
- **入力**: 品質 B(3) の素材4個
- **期待**: `3.0`（非整数にならない一般ケース）

### エッジ/エラーケース: 空配列 🟡
- **入力**: `[]`
- **期待**: 例外・クラッシュなく `0.0` を返す（EDGE-001関連。実際の「調合を成立させない」ガードはTASK-0018/UI側の責務）

- **参照したEARS要件**: REQ-105、EDGE-001
- **参照した設計文書**: dataflow.md「機能2: 調合」ステップ1、acceptance-criteria.md TC-101-01

---

## 5. EARS要件・設計文書との対応関係

- **参照したユーザストーリー**: 調合により完成品を生み出すコアループ（機能2: 調合）
- **参照した機能要件**: REQ-105（基礎品質＝投入素材の平均品質）
- **参照した関連要件（本タスク外）**: REQ-111（品質ペナルティ）、REQ-109/110（貢献度・報酬算出）
- **参照したEdgeケース**: EDGE-001（投入枠に素材なし時は調合不成立）
- **参照した受け入れ基準**: TC-101-01（平均=2.5）、および派生3ケース（単一素材/同一品質/空配列）
- **参照した設計文書**:
  - **アーキテクチャ**: architecture.md「Functional Core（logic/）」— 純粋関数配置
  - **データフロー**: dataflow.md「機能2: 調合」ステップ1（基礎品質算出）
  - **データモデル**: data-model.md（Quality: D=1, C=2, B=3, A=4, S=5）
  - **関数シグネチャ**: `static func calculate_base_quality(materials: Array[MaterialInstance]) -> float`

---

## 6. 品質判定

### 信頼性レベル分布
- 🔵 青信号: 概要・入出力の基本仕様・純粋関数制約・TC-101-01（REQ-105/TC-101-01に直接根拠あり）
- 🟡 黄信号: 戻り値型floatの採用判断（設計文書間の不整合を解消するための妥当な推測）、空配列時0.0、派生テストケース

### 判定結果: ⚠️ 要改善（許容範囲内）
- REQ-105・TC-101-01自体は🔵で確実。
- architecture.md（`-> int`）とTC-101-01（`2.5`）の設計文書間不整合が存在するが、note.md・TASK-0013.mdで「本タスクは`float`採用」と申し送り済みのため、実装方針は確定している。
- **入出力定義・制約条件・実装可能性はいずれも明確**。TDD着手可能。

---

## 参考ファイル一覧

- `docs/tasks/atelier-alchemy-core/TASK-0013.md` — タスク定義
- `docs/spec/atelier-alchemy-core/requirements.md` — REQ-105, EDGE-001
- `docs/spec/atelier-alchemy-core/acceptance-criteria.md` — TC-101-01
- `docs/design/atelier-alchemy-core/architecture.md` — Functional Core / シグネチャ例
- `docs/design/atelier-alchemy-core/data-model.md` — Quality enum
- `docs/implements/atelier-alchemy-core/TASK-0013/note.md` — コンテキストノート
