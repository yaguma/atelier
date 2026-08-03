# TASK-0017: ValueCalculator（貢献度/報酬算出）TDD要件定義書

**機能名**: ValueCalculator（貢献度/報酬算出）
**タスクID**: TASK-0017
**要件名**: atelier-alchemy-core
**フェーズ**: Phase 3 - 調合コアロジック（★核心）
**作成日**: 2026-08-02
**信頼性レベル**: 式の構造は🔵、各係数の算出方法（特に品質倍率）は🟡🔴

---

## 0. 重要な申し送り事項（実装着手前に必読）

### 申し送り 1: DailyRequest 型が未実装 🔴

- 引数 `daily_request: DailyRequest` の型定義 `features/guild/data/daily_request.gd` は **現時点で未実装**（TASK-0017 は Phase 3、DailyRequest は Phase 4 guild 機能で作成予定）。
- data-model.md には定義が存在する（`docs/design/atelier-alchemy-core/data-model.md` 137〜152行）：
  ```gdscript
  # res://features/guild/data/daily_request.gd
  class_name DailyRequest
  extends RefCounted

  var required_recipe_id: StringName                # 🔵 REQ-203
  var preferred_category: TraitDefinition.Category  # 🟡 REQ-204より推測
  var bonus_multiplier: float = 1.5                 # 🟡 REQ-204。具体値はTBD

  func _init(p_recipe_id: StringName = &"") -> void:
      required_recipe_id = p_recipe_id
  ```
- **方針**: 本タスクのテストでは、DailyRequest 実体が未実装の場合、上記 data-model.md の定義に沿った **テスト用ダミー構造（テスト内ローカル定義 or 最小 stub）** として扱う。ValueCalculator が参照するのは `required_recipe_id` と `bonus_multiplier` の 2 フィールドのみであり、この 2 フィールドを持つオブジェクトであれば計算は成立する。実装が Duck typing 的に動くよう、型注釈は `DailyRequest` を用いつつ、テストでは同等フィールドを持つダミーを注入する。
- DailyRequest 本体を本タスクで新規作成するか、テストダミーで代替するかは、テストケース洗い出しフェーズ（tdd-testcases）で確定する。

### 申し送り 2: 指定合致ボーナスの二重適用疑義（Phase 4 着手前に要解消）🔴

- REQ-109/110 の式は「指定合致ボーナス」を貢献度・報酬の算出に **直接含めて** おり、dataflow.md「機能2: 調合」ステップ5も `calculate_contribution`/`calculate_reward` の入力に「指定合致ボーナス」を明記している。
- 一方、dataflow.md「機能3: ギルド納品」では、guild 機能の `DeliveryCalculator.check_daily_request_match()` が **別途** 合致ボーナスを算出し、`rank_hp -= 貢献度 × 合致ボーナス` / `gold += 報酬 × 合致ボーナス` という形で **再度** 乗算している。
- architecture.md のディレクトリ構成でも `guild/logic/delivery_calculator.gd` が「指定合致ボーナス判定」の責務を持つと明記され、alchemy 機能の ValueCalculator と **責務が重複** している。この設計のままでは合致ボーナスが二重に適用される可能性が高い。
- **方針**: 本タスクは REQ-109/110 をそのまま実装する。ただし **Phase 4（guild 機能）着手前に、合致ボーナスを alchemy 側（本タスク）と guild 側（delivery_calculator.gd）のどちらか一方でのみ適用するよう設計を確定させる必要がある**。この課題を既知の未解決事項として明示的に申し送る。

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

- 🔵 **何をする機能か**: 調合完成品の「貢献度」（ランクHPへのダメージ）と「報酬」（ゴールド）を、4つの係数の乗算で算出する純粋関数を提供する。*REQ-109, REQ-110より*
- 🔵 **どのような問題を解決するか**: 素材の品質・発現特性・日替わり指定合致という複数の要素を、貢献度／報酬という2つの定量的価値へ一意に変換する。これにより「複利ループ（良い素材→良い調合→高い貢献度／報酬→更に良い素材）」の中核となる価値計算を成立させる。*REQ-109, REQ-110, dataflow.md「機能2: 調合」より*
- 🔵 **想定されるユーザー**: 調合を行うプレイヤー（間接的）。直接の呼び出し元は調合フローの UI / GameState、および結果を格納する CraftResult。*architecture.md 呼び出し関係より*
- 🔵 **システム内での位置づけ**: Functional Core（`features/alchemy/logic/`）に属する純粋関数群。副作用なし・Autoload非参照・全入力を引数で受け取る。*architecture.md「Functional Core, Imperative Shell」より*
- **参照したEARS要件**: REQ-109, REQ-110, REQ-111（品質倍率の基準）, REQ-204（指定合致ボーナス）
- **参照した設計文書**: architecture.md（配置・責務）, dataflow.md（機能2: 調合 ステップ5）, data-model.md（データモデル）

---

## 2. 入力・出力の仕様（EARS機能要件・型定義ベース）

### 対象関数

```gdscript
class_name ValueCalculator
extends RefCounted

static func calculate_contribution(
    recipe: RecipeDefinition,
    final_quality: MaterialInstance.Quality,
    activated_traits: Array[TraitDefinition],
    daily_request: DailyRequest,
) -> float

static func calculate_reward(
    recipe: RecipeDefinition,
    final_quality: MaterialInstance.Quality,
    activated_traits: Array[TraitDefinition],
    daily_request: DailyRequest,
) -> float
```

### 入力パラメータ 🔵

| 引数 | 型 | 意味 | 制約 |
|------|-----|------|------|
| `recipe` | `RecipeDefinition` | レシピ定義。`base_contribution` / `base_reward` / `id` を参照 | TASK-0012で実装済み。値は0.0以上想定 |
| `final_quality` | `MaterialInstance.Quality`（enum: D=1,C=2,B=3,A=4,S=5） | REQ-111適用後の最終品質 | 1〜5の範囲 |
| `activated_traits` | `Array[TraitDefinition]` | 発現特性の配列。各要素の `category` と `bonus_multiplier` を参照 | 空配列可 |
| `daily_request` | `DailyRequest` | 日替わり指定調合物。`required_recipe_id` / `bonus_multiplier` を参照 | 🔴 型未実装（申し送り1参照） |

### 出力値 🔵

| 関数 | 型 | 意味 |
|------|-----|------|
| `calculate_contribution` | `float` | 貢献度（ランクHPへのダメージ量） |
| `calculate_reward` | `float` | 報酬（ゴールド） |

### 入出力の関係性（計算式）🔵🟡🔴

**貢献度（REQ-109）** 🔵（構造）:
```
貢献度 = 基礎貢献度 × 品質倍率 × 貢献度系特性ボーナス × 指定合致ボーナス
```

**報酬（REQ-110）** 🔵（構造）:
```
報酬 = 基礎報酬 × 品質倍率 × 報酬系特性ボーナス × 指定合致ボーナス
```

各係数の算出：

- **基礎貢献度 / 基礎報酬** 🔵: `recipe.base_contribution` / `recipe.base_reward` をそのまま使用。
- **品質倍率** 🔴（完全な推測・暫定式）:
  ```
  quality_multiplier = float(final_quality) / float(MaterialInstance.Quality.C)
  ```
  品質Cを基準値1.0とする線形倍率。設計文書に変換式の記載がないための暫定採用。バランス調整フェーズで差し替え前提。`game_balance.gd` への定数切り出しを推奨。
- **特性ボーナス** 🟡: `activated_traits` のうち **該当カテゴリのみ** をフィルタし、`bonus_multiplier` を全て乗算。
  - 貢献度計算 → `TraitDefinition.Category.CONTRIBUTION` のみ
  - 報酬計算 → `TraitDefinition.Category.REWARD` のみ
  - 該当特性が0件なら `1.0`（無効化）
  - SUPPORT カテゴリはどちらのボーナスにも寄与しない
- **指定合致ボーナス** 🟡: `daily_request.required_recipe_id == recipe.id` なら `daily_request.bonus_multiplier`、不一致なら `1.0`。

### データフロー 🔵

```
UI / GameState
  ↓ recipe, final_quality, activated_traits, daily_request
ValueCalculator.calculate_contribution() / calculate_reward()
  ↓ float
CraftResult へ結果格納
```

*参照したEARS要件: REQ-109, REQ-110, REQ-111, REQ-204*
*参照した設計文書: data-model.md（RecipeDefinition, TraitDefinition, MaterialInstance, DailyRequest）, dataflow.md（機能2 ステップ5）*

---

## 3. 制約条件（EARS非機能要件・アーキテクチャ設計ベース）

- 🔵 **アーキテクチャ制約（純粋関数）**: `static func` のみで構成し、Nodeを継承しない（RefCounted）。外部状態（Autoload・GameState）を参照せず、必要データは全て引数で受け取る。同一入力に対し常に同一出力を返す。*architecture.md「Functional Core」より*
- 🔵 **型安全性**: 全引数・戻り値に明示的型注釈を付与。GDScript 4.x 型システムに準拠。*note.md 開発ルールより*
- 🔵 **系統独立性**: 貢献度計算は CONTRIBUTION 系特性のみ、報酬計算は REWARD 系特性のみに依存し、互いに影響しない。*REQ-109/110の「貢献度系/報酬系」区別より*
- 🟡 **係数のTBD性**: `base_contribution`, `base_reward`, `trait.bonus_multiplier`, `daily_request.bonus_multiplier` は全て未確定値（requirements.md「未確定数値一覧」）。テストは絶対値ではなく **乗算構造・系統独立性** を検証する。
- 🔴 **品質倍率の推測性**: 品質倍率変換式は設計文書に根拠がなく暫定。バランス調整で変更される前提で、差し替えやすい設計（定数切り出し）にする。
- 🔴 **DailyRequest未実装制約**: 型が未実装のため、テストではダミー構造で代替（申し送り1）。
- **技術スタック**: GDScript 4.x / Godot 4.7 / GUT 9.6.1。

*参照したEARS要件: REQ-109, REQ-110（各係数TBD）*
*参照した設計文書: architecture.md（Functional Core, ディレクトリ配置）, data-model.md*

---

## 4. 想定される使用例（Edgeケース・データフローベース）

### 基本的な使用パターン 🟡

**例1: 基本ケース（ボーナスなし）**
```
Given: base_contribution=10.0, final_quality=C(2), activated_traits=[], 指定不一致
Calc:  品質倍率 = 2/2 = 1.0、特性ボーナス=1.0、指定合致=1.0
Then:  貢献度 = 10.0 × 1.0 × 1.0 × 1.0 = 10.0
```

**例2: 貢献度系特性のみ寄与（系統フィルタ）**
```
Given: base_contribution=10.0, final_quality=C(2),
       activated_traits=[CONTRIBUTION(1.5), REWARD(2.0)], 指定不一致
Calc:  品質倍率=1.0、貢献度系ボーナス=1.5（REWARDの2.0は無視）、指定合致=1.0
Then:  貢献度 = 10.0 × 1.0 × 1.5 × 1.0 = 15.0
```

**例3: 報酬系特性のみ寄与（例2と対称）**
```
Given: base_reward=20.0, final_quality=C(2),
       activated_traits=[CONTRIBUTION(1.5), REWARD(2.0)], 指定不一致
Then:  報酬 = 20.0 × 1.0 × 2.0 × 1.0 = 40.0（CONTRIBUTIONの1.5は無視）
```

**例4: 指定合致ボーナス適用**
```
Given: base_contribution=10.0, final_quality=B(3), activated_traits=[],
       daily_request.required_recipe_id == recipe.id, bonus_multiplier=1.5
Calc:  品質倍率 = 3/2 = 1.5、特性ボーナス=1.0、指定合致=1.5
Then:  貢献度 = 10.0 × 1.5 × 1.0 × 1.5 = 22.5
```

### エッジケース 🟡

- **EDGE-A: 空配列**: `activated_traits=[]` → 特性ボーナス = 1.0。
- **EDGE-B: 該当カテゴリ0件**: 発現特性がSUPPORTのみ/反対系統のみ → 当該計算の特性ボーナス = 1.0。
- **EDGE-C: ゼロ値**: `base_contribution=0.0` → 結果 0.0。
- **EDGE-D: 品質下限/上限**: `final_quality=D(1)` → 倍率0.5、`final_quality=S(5)` → 倍率2.5。
- **EDGE-E: 複数同系統特性**: CONTRIBUTIONが複数 → `bonus_multiplier` を全て乗算（1.5×1.2=1.8等）。
- **EDGE-F: SUPPORT混在**: SUPPORTは貢献度・報酬いずれのボーナスにも寄与しない。

*参照したEARS要件: REQ-109, REQ-110, REQ-204, EDGE-102*
*参照した設計文書: dataflow.md（機能2）, note.md 付録の計算例*

---

## 5. EARS要件・設計文書との対応関係

- **参照したユーザストーリー**: 調合による複利ループ体験（コンセプト文書「調合主軸モデル」）
- **参照した機能要件**: REQ-109（貢献度式）, REQ-110（報酬式）, REQ-111（最終品質＝品質倍率基準）, REQ-107（特性の系統分類）, REQ-108（補助系＝SUPPORT）, REQ-203（日替わり指定調合物）, REQ-204（指定合致ボーナス）
- **参照した非機能要件**: なし（本タスクはロジック純粋関数のためNFR直接該当なし。requirements.md「未確定数値一覧」REQ-109/110の係数TBDに留意）
- **参照したEdgeケース**: EDGE-102（特性偏重時の品質低下、間接関連）
- **参照した受け入れ基準**: TC-109-N01〜N04（acceptance-criteria.md：基本ケース・貢献度系ボーナス・報酬系ボーナス・指定合致ボーナス）
- **参照した設計文書**:
  - **アーキテクチャ**: architecture.md（`features/alchemy/logic/value_calculator.gd` 配置、Functional Core 制約、呼び出し関係、guild/logic/delivery_calculator.gd との責務重複＝申し送り2）
  - **データフロー**: dataflow.md（機能2: 調合 ステップ5 / 機能3: ギルド納品）
  - **型定義（データモデル）**: data-model.md（RecipeDefinition, TraitDefinition, MaterialInstance.Quality, DailyRequest）
  - **データベース**: 該当なし（ローカルゲーム・Resourceベース）
  - **API仕様**: 該当なし

---

## 6. 品質判定

| 判定項目 | 状態 |
|---------|------|
| 要件の曖昧さ | 一部あり（品質倍率式が🔴推測、DailyRequest未実装、合致ボーナス二重適用疑義） |
| 入出力定義 | 完全（式の構造・型・フィルタ条件が明確） |
| 制約条件 | 明確（純粋関数・系統独立性・型安全） |
| 実装可能性 | 確実（式構造は確定、TBD係数はダミー値で式構造を検証可能） |
| 信頼性レベル分布 | 🔵構造は確実 / 🟡係数算出は妥当推測 / 🔴品質倍率式・DailyRequest未実装 |

**総合判定**: ⚠️ **要改善（要ヒアリング項目あり）**。式の乗算構造（4係数）自体は REQ-109/110 に明記され🔵で実装可能だが、(1) 品質倍率変換式が完全推測🔴、(2) DailyRequest 型が未実装🔴、(3) 指定合致ボーナスの alchemy/guild 二重適用疑義🔴、の3点が未解決課題として残る。式の構造とテスト方針（絶対値でなく乗算構造・系統独立性を検証）は確立しているため、TDD 実装自体は着手可能。ただし品質倍率式と合致ボーナスの適用箇所は Phase 4 着手前にデザイナー／アーキテクトとの確定が必須。
