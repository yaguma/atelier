# TASK-0015 要件定義書: TraitActivation.resolve_category_conflict

**機能名**: 特性系統間排他制御（TraitActivation.resolve_category_conflict）
**タスクID**: TASK-0015
**要件名**: atelier-alchemy-core
**出力ファイル**: docs/implements/atelier-alchemy-core/TASK-0015/trait-category-conflict-requirements.md
**作成日**: 2026-08-01

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

- 🔵 **何をする機能か**: 調合の発現候補特性（`activated_traits`）に対し、**貢献度系（CONTRIBUTION）特性と報酬系（REWARD）特性の系統間排他制御**を適用し、最終的に発現する特性リストを決定する純粋関数。投入枠内で条件を満たしている枚数（同一タグの重複投入数の合計）を系統ごとに比較し、より多い系統のみを発現させ、少ない系統を不発とする。
- 🔵 **どのような問題を解決するか**: 旧設計に存在した「1品で貢献度系・報酬系の両方を無条件に発現させられる」**支配戦略**（最適解が自明化し選択の意味が消える状態）を数式レベルで防止する。2026-07-09ゲームデザインレビューの「Critical 2: 貢献度/報酬の二分ジレンマ破壊」への直接対応。
- 🔵 **想定されるユーザー**: 調合システム（`AlchemyResolver.craft()` / TASK-0018）が本関数を呼び出す。間接的には調合を行うプレイヤーの体験（真のジレンマ）を保証する。
- 🔵 **システム内での位置づけ**: Functional Core（純粋関数, `static func`, 副作用なし）。dataflow.md「機能2」ステップ3に位置し、TASK-0014の`resolve_activated_traits()`（系統内複数発現の確定）の結果を受け取り、系統間排他を適用してTASK-0018の`CraftResult`構成情報を返す。
- **参照したEARS要件**: REQ-115（主）、REQ-106（発現条件）、REQ-108（補助系）、REQ-112（系統内複数発現・TASK-0014）
- **参照した設計文書**: architecture.md（TraitActivationシグネチャ）、dataflow.md「機能2」ステップ3、data-model.md（CraftResult / TraitDefinition.Category）

## 2. 入力・出力の仕様（EARS機能要件・型定義ベース）

- 🔵 **入力パラメータ**:
  - `materials: Array[MaterialInstance]` — 投入素材。各素材が持つ特性タグの重複投入数を再集計するために必須。🟡 architecture.mdのシグネチャ例に明記はないが、REQ-115「同一タグの重複投入数の合計」算出のためTASK-0014と一貫して追加する実装判断。
  - `activated_traits: Array[TraitDefinition]` — TASK-0014が確定した発現候補特性リスト（系統内複数発現は確定済み）。
- 🔵 **出力値**: `Dictionary`
  - `"activated_traits": Array[TraitDefinition]` — 排他制御適用後の最終発現特性
  - `"rejected_category": TraitDefinition.Category` — 不発とされた系統（同数不発時は無効値。既定は`Category.CONTRIBUTION`等の意味を持たない値）
  - `"has_rejected_category": bool` — `rejected_category`が有効な値かどうか
- 🔵 **入出力の関係性**:
  - CONTRIBUTION合計 > REWARD合計 → CONTRIBUTIONのみ残す、`rejected_category = REWARD`, `has_rejected_category = true`
  - CONTRIBUTION合計 < REWARD合計 → REWARDのみ残す、`rejected_category = CONTRIBUTION`, `has_rejected_category = true`
  - CONTRIBUTION合計 == REWARD合計（両方 > 0） → 両方除外（空）、`has_rejected_category = false`
  - 一方が0（候補なし） → 存在する系統をそのまま残す、排他なし、`has_rejected_category = false`
  - SUPPORT系 → 常に結果に残す（比較・排他の対象外）
- 🔵 **データフロー**: dataflow.md「機能2」ステップ3 `resolve_category_conflict(発現特性) — REQ-115`
- **参照したEARS要件**: REQ-115、REQ-106
- **参照した設計文書**: data-model.md（MaterialInstance / TraitDefinition / TraitDefinition.Category / CraftResult）、architecture.md

## 3. 制約条件（EARS非機能要件・アーキテクチャ設計ベース）

- 🔵 **アーキテクチャ制約**: Functional Core／Imperative Shell分離に従い、`static func`のみ・外部状態の参照/変更禁止・同一入力に対し常に同一出力（純粋関数）。乱数不使用。
- 🔵 **枚数の定義**: 「条件を満たしている枚数」＝同一タグの重複投入数の合計（例: CONTRIBUTIONに属する「聖」2個＋「浄」2個なら合計4）。系統内の個別特性は再評価せず、TASK-0014の確定結果をそのまま用いる。
- 🔵 **補助系除外**: SUPPORT系特性は排他制御の対象外で常に残す（REQ-115最終文）。
- 🟡 **無効値表現**: 同数不発時は不発系統が両方のため単一enumで表現不可。`has_rejected_category: bool`で表現する。data-model.mdのCraftResult定義には未記載のギャップであり、TASK-0018で`CraftResult`へのフィールド追加が必要になる可能性が高い。
- 🔵 **パフォーマンス/カバレッジ**: Functional Coreとしてカバレッジ目標90%+。
- 🔵 **コーディング規約**: 型注釈必須、関数名スネークケース、クラス名パスカルケース、定数UPPER_SNAKE_CASE（GDScript）。
- **参照したEARS要件**: REQ-115、REQ-108、REQ-112
- **参照した設計文書**: architecture.md（Functional Core方針）、data-model.md（CraftResult）

## 4. 想定される使用例（EARS Edgeケース・データフローベース）

- 🔵 **基本（不均衡・多い方のみ発現）**: 「聖」3個(CONTRIBUTION) vs 「金」2個(REWARD) → 「聖」のみ残す（size==1）、`rejected_category==REWARD`, `has_rejected_category==true`。（TC-101-05）
- 🔵 **同数不発（最重要）**: 「聖」2個 vs 「金」2個 → 両方除外（空配列）、`has_rejected_category==false`。（TC-101-04 / Critical）
- 🔵 **1素材2タグ同時保持（最重要）**: 「聖」「金」両タグを持つ素材2個＋高品質無特性素材2個 → CONTRIBUTION2件・REWARD2件で同数 → 両方不発（空配列）。品質と両特性の無条件両取り不可を確認。（TC-101-07 / Critical・支配戦略防止の最終防線）
- 🟡 **補助系除外**: 「聖」2個・「金」2個（同数不発）＋補助系「触媒」2個 → 「聖」「金」は除外、「触媒」は残る。
- 🟡 **片系統のみ**: 「聖」2個のみ（報酬系候補なし） → 「聖」がそのまま残る、`has_rejected_category==false`。
- 🟡 **エッジ（候補空）**: `activated_traits`が空 → 空のまま返す、`has_rejected_category==false`。
- **参照したEARS要件**: REQ-115
- **参照した受け入れ基準**: TC-101-04, TC-101-05, TC-101-07
- **参照した設計文書**: dataflow.md「機能2」ステップ3

## 5. EARS要件・設計文書との対応関係

- **参照したユーザストーリー**: コンセプト文書「独自要素2: 特性の二分による真のジレンマ」
- **参照した機能要件**: REQ-115（主）, REQ-106, REQ-108, REQ-112
- **参照した非機能要件**: Functional Coreカバレッジ90%+（acceptance-criteria.md 備考）
- **参照したEdgeケース**: 同数不発、片系統のみ、候補空、補助系混在
- **参照した受け入れ基準**: TC-101-04（同数不発・Critical）, TC-101-05（不均衡）, TC-101-07（1素材2タグ・Critical）
- **参照した設計文書**:
  - **アーキテクチャ**: architecture.md（TraitActivationシグネチャ、Functional Core方針）
  - **データフロー**: dataflow.md「機能2」ステップ3
  - **型定義/データモデル**: data-model.md（MaterialInstance, TraitDefinition, TraitDefinition.Category, CraftResult）
  - **実装ファイル**: features/alchemy/logic/trait_activation.gd（TASK-0014と同一）
  - **テストファイル**: tests/unit/features/alchemy/trait_activation_test.gd

---

## 品質判定

- 要件の曖昧さ: なし（コアロジックはREQ-115に一意に規定）
- 入出力定義: 完全（Dictionary3キーの全分岐を定義）
- 制約条件: 明確（純粋関数・補助系除外・無効値表現）
- 実装可能性: 確実（TASK-0014の実装パターンを継承）
- 信頼性レベル分布: 🔵 多数（コア3ケースは全て🔵）、🟡 は補助系/片系統/無効値表現の実装判断に限定、🔴 なし

**総合評価**: ✅ 高品質
