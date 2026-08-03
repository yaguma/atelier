# TASK-0015 テストケース定義書: TraitActivation.resolve_category_conflict

**機能名**: 特性系統間排他制御（TraitActivation.resolve_category_conflict）
**タスクID**: TASK-0015
**要件名**: atelier-alchemy-core
**テストファイル**: `tests/unit/features/alchemy/trait_activation_test.gd`（TASK-0014と同一ファイルに追記）
**対象実装**: `features/alchemy/logic/trait_activation.gd`
**作成日**: 2026-08-01

---

## 概要

REQ-115「貢献度系（CONTRIBUTION）／報酬系（REWARD）の系統間排他制御」を検証するテストケース群。系統ごとに「条件を満たしている枚数＝同一タグの重複投入数の合計」を集計し、多い系統のみ発現・同数は両方不発・補助系（SUPPORT）は対象外という仕様を網羅する。

- **関数シグネチャ**: `static func resolve_category_conflict(materials: Array[MaterialInstance], activated_traits: Array[TraitDefinition]) -> Dictionary`
- **戻り値**: `{ "activated_traits": Array[TraitDefinition], "rejected_category": TraitDefinition.Category, "has_rejected_category": bool }`
- **最重要（支配戦略防止）**: TC-101-04・TC-101-07 が「両方不発（空配列）」になること。

---

## テストケース一覧（サマリー）

| # | テスト名 | 分類 | 対応TC/REQ | 信頼性 |
|---|---------|------|-----------|--------|
| 1 | 不均衡（貢献3 vs 報酬2）で多い方のみ発現 | 正常系 | TC-101-05 / REQ-115 | 🔵 |
| 2 | 不均衡（報酬3 vs 貢献2）で多い方のみ発現（対称性） | 正常系 | REQ-115 | 🟡 |
| 3 | 片系統のみ（貢献のみ）は排他制御が発生しない | 正常系 | TC5 / REQ-115 | 🟡 |
| 4 | 補助系（SUPPORT）は排他制御の対象外で常に残る | 正常系 | TC4 / REQ-115・REQ-108 | 🟡 |
| 5 | 同数（貢献2 vs 報酬2）で両方とも不発になる | 異常系 | TC-101-04 **Critical** | 🔵 |
| 6 | 1素材が2タグ同時保持でも無条件両取りできない | 異常系 | TC-101-07 **Critical** | 🔵 |
| 7 | 発現候補が空のとき空のまま返す | 異常系 | Edge / REQ-115 | 🟡 |
| 8 | 差分1の最小不均衡（貢献2 vs 報酬1相当）で多い方のみ | 境界値 | REQ-115 | 🟡 |
| 9 | SUPPORT系のみのとき排他なしでそのまま残る | 境界値 | REQ-108 | 🟡 |
| 10 | 系統内複数特性が排他で系統ごと一括除去/存置される | 境界値 | REQ-112×REQ-115 | 🟡 |

**内訳**: 正常系4 / 異常系3 / 境界値3 = 合計10ケース（うち必須5: TC-101-04, 05, 07, 補助系除外, 片系統のみ）

---

## 1. 正常系テストケース

### 1-1. 不均衡（貢献度系3 vs 報酬系2）で多い方のみ発現する（TC-101-05）

- **テスト名**: `test_不均衡3対2で多い系統のみ発現し少ない系統を不発にする`
  - **何をテストするか**: CONTRIBUTION合計3 > REWARD合計2 のとき、CONTRIBUTIONのみを残し、REWARDを除外することを確認する。
  - **期待される動作**: 多い系統（貢献度系）の特性だけが `activated_traits` に残り、少ない系統が `rejected_category` に記録される。
- **入力値**:
  - `materials`: 「聖」タグ素材3個 + 「金」タグ素材2個（計5枠・工房強化後想定）
  - `activated_traits`: `[聖(CONTRIBUTION), 金(REWARD)]`
  - **入力データの意味**: 系統枚数が1差で不均衡になる最小に近い代表構成。多数決の「多い方だけ残す」分岐を代表する。
- **期待される結果**:
  - `result["activated_traits"].size() == 1` かつ `result["activated_traits"][0].id == &"holy"`
  - `result["rejected_category"] == TraitDefinition.Category.REWARD`
  - `result["has_rejected_category"] == true`
  - **期待結果の理由**: REQ-115「より多い系統のみを発現させ」に一致。除外系統は単一enumで一意に表現できるため `has_rejected_category = true`。
- **テストの目的**: 不均衡時の「多い方のみ発現＋除外系統記録」の主分岐を確認する。
  - **確認ポイント**: 残る特性ID・件数・`rejected_category`・`has_rejected_category` の4点を同時検証する。
- 🔵 信頼性: acceptance-criteria.md TC-101-05 / TASK-0015.md 単体テスト要件2 / REQ-115 に明記

### 1-2. 不均衡（報酬系3 vs 貢献度系2）で多い方のみ発現する（対称性検証）

- **テスト名**: `test_不均衡で報酬系が多い場合は報酬系のみ発現し貢献度系を不発にする`
  - **何をテストするか**: 1-1の系統を入れ替え、REWARD合計3 > CONTRIBUTION合計2 のときREWARDのみ残ることを確認する。
  - **期待される動作**: どちらの系統が多くても同じロジックで多い方が残る（実装がCONTRIBUTION固定でハードコードされていないことの担保）。
- **入力値**:
  - `materials`: 「金」タグ素材3個 + 「聖」タグ素材2個
  - `activated_traits`: `[金(REWARD), 聖(CONTRIBUTION)]`
  - **入力データの意味**: 比較の対称性を破る誤実装（常にCONTRIBUTIONを優先する等）を検出するための鏡像ケース。
- **期待される結果**:
  - `result["activated_traits"].size() == 1` かつ `result["activated_traits"][0].id == &"gold"`
  - `result["rejected_category"] == TraitDefinition.Category.CONTRIBUTION`
  - `result["has_rejected_category"] == true`
  - **期待結果の理由**: 比較演算子が両方向で正しく機能することを保証する。
- **テストの目的**: 系統比較ロジックの対称性・非ハードコード性を確認する。
  - **確認ポイント**: `rejected_category` が CONTRIBUTION 側になる点。
- 🟡 信頼性: REQ-115から導出した妥当な鏡像ケース（対応TC-IDはacceptance-criteria.mdに未整備）

### 1-3. 一方の系統のみが候補に存在する場合は排他制御が発生しない（必須）

- **テスト名**: `test_片系統のみのとき排他せずそのまま残す`
  - **何をテストするか**: REWARD候補が0件（貢献度系のみ）のとき、排他を発生させずCONTRIBUTIONをそのまま残すことを確認する。
  - **期待される動作**: 比較対象が片系統しか存在しないため、除外は起きず全候補が保持される。
- **入力値**:
  - `materials`: 「聖」タグ素材2個
  - `activated_traits`: `[聖(CONTRIBUTION)]`
  - **入力データの意味**: 「両方が条件を満たす場合」だけが排他対象という仕様の境界（片方0）を代表する。
- **期待される結果**:
  - `result["activated_traits"].size() == 1` かつ `result["activated_traits"][0].id == &"holy"`
  - `result["has_rejected_category"] == false`
  - **期待結果の理由**: REQ-115の排他は「両系統がともに候補を持つとき」に限定されるため、片系統のみでは不発扱いにしてはならない。
- **テストの目的**: 片系統のみのとき誤って除外しないことを確認する。
  - **確認ポイント**: `has_rejected_category == false` かつ候補が保持される点。
- 🟡 信頼性: TASK-0015.md 単体テスト要件5 / REQ-115からの妥当な推測

### 1-4. 補助系（SUPPORT）特性は排他制御の対象外で常に残る（必須）

- **テスト名**: `test_補助系は同数不発の状況でも排他対象外で残る`
  - **何をテストするか**: 貢献2 vs 報酬2（同数で両方不発）の状況にSUPPORT特性が混在するとき、SUPPORTだけは除外されず残ることを確認する。
  - **期待される動作**: 「聖」「金」は同数不発で除外されるが、「触媒」(SUPPORT)は比較対象外のため保持される。
- **入力値**:
  - `materials`: 「聖」2個 + 「金」2個 + 「触媒」2個
  - `activated_traits`: `[聖(CONTRIBUTION), 金(REWARD), 触媒(SUPPORT)]`
  - **入力データの意味**: 排他が最も強く働く同数不発ケースにSUPPORTを重ねることで、SUPPORT除外漏れの実装ミスを検出する。
- **期待される結果**:
  - `result["activated_traits"].size() == 1` かつ `result["activated_traits"][0].id == &"catalyst"`（SUPPORTのみ）
  - 「聖」「金」は `activated_traits` に含まれない
  - `result["has_rejected_category"] == false`（貢献・報酬は同数不発で単一enum表現不可のため）
  - **期待結果の理由**: REQ-115最終文「補助系特性はこの排他制御の対象外とする」に一致。
- **テストの目的**: SUPPORTが比較にも除外にも巻き込まれないことを確認する。
  - **確認ポイント**: 残るのがSUPPORTだけであること、`has_rejected_category` は貢献・報酬の同数不発に従う点。
- 🟡 信頼性: TASK-0015.md 単体テスト要件4 / REQ-115最終文・REQ-108からの導出

---

## 2. 異常系テストケース

### 2-1. 同数（貢献度系2 vs 報酬系2）で両方とも不発になる（TC-101-04・Critical）

- **テスト名**: `test_同数2対2で両系統とも不発になり空配列を返す`
  - **エラーケースの概要**: 支配戦略（1品で両系統を無条件両取り）が最も発生しやすい同数ケース。
  - **エラー処理の重要性**: ここで「両方発現」を許すと2026-07-09ゲームデザインレビューのCritical不具合が再発する。
- **入力値**:
  - `materials`: 「聖」2個 + 「金」2個
  - `activated_traits`: `[聖(CONTRIBUTION), 金(REWARD)]`
  - **不正な理由**: 不正入力ではないが、「無条件両取りを許してはならない」という仕様上の危険構成。
  - **実際の発生シナリオ**: プレイヤーが貢献度系・報酬系タグを2個ずつ均等に投入し両取りを狙う典型戦略。
- **期待される結果**:
  - `result["activated_traits"].is_empty() == true`（空配列）
  - `result["has_rejected_category"] == false`
  - **システムの安全性**: 両系統除外により支配戦略が数式レベルで成立しないことを保証する。
- **テストの目的**: 同数不発ルール（真のジレンマの担保）を確認する。
  - **品質保証の観点**: 本フェーズ最重要の支配戦略防止を直接検証する。
- 🔵 信頼性: acceptance-criteria.md TC-101-04 **Critical** / TASK-0015.md 単体テスト要件1 に明記

### 2-2. 1素材が2タグを同時保持しても無条件両取りできない（TC-101-07・Critical）

- **テスト名**: `test_1素材が2タグ同時保持でも同数不発で両取りできない`
  - **エラーケースの概要**: 1素材が貢献度系・報酬系の両タグを持つ（REQ-104）ことで両取りを狙う抜け道。
  - **エラー処理の重要性**: REQ-104（0〜2タグ保持）とREQ-115（系統排他）が組み合わさって初めて支配戦略を防げることを検証する最終防線。
- **入力値**:
  - `materials`: 「聖」「金」両タグを持つ素材2個 + 高品質無特性素材2個
  - `activated_traits`: `[聖(CONTRIBUTION), 金(REWARD)]`（両タグとも重複投入数2で閾値充足済み）
  - **不正な理由**: 「1品で高品質かつ両特性」を無条件に得ようとする支配戦略構成。
  - **実際の発生シナリオ**: 2タグ持ち希少素材を軸に、品質と両系統特性の同時獲得を狙うプレイ。
- **期待される結果**:
  - CONTRIBUTION合計2・REWARD合計2で同数 → TC-101-04と同じ同数不発ルールが適用される
  - `result["activated_traits"].is_empty() == true`（空配列）
  - `result["has_rejected_category"] == false`
  - **システムの安全性**: 2タグ同時保持でも枚数集計が系統単位で行われ、無条件両取りが成立しないことを保証する。
- **テストの目的**: 素材データ構造レベルの抜け道が排他制御で塞がれることを確認する。
  - **品質保証の観点**: 支配戦略防止の最終防線。枚数集計が「素材数」ではなく「系統ごとのタグ重複投入数合計」で正しく行われることを担保する。
- 🔵 信頼性: acceptance-criteria.md TC-101-07 **Critical** / TASK-0015.md 単体テスト要件3 に明記

### 2-3. 発現候補が空のとき空のまま返す（退化入力）

- **テスト名**: `test_発現候補が空のとき空配列を返し排他フラグは偽`
  - **エラーケースの概要**: `activated_traits` が空（TASK-0014が候補を1件も返さなかった）状態での呼び出し。
  - **エラー処理の重要性**: 退化入力で例外を投げず決定論的に空を返すことは、上流（TASK-0018 craft）の安定性に直結する。
- **入力値**:
  - `materials`: 無特性素材4個（または空配列）
  - `activated_traits`: `[]`
  - **不正な理由**: 不正ではないが集計対象ゼロの退化ケース。
  - **実際の発生シナリオ**: 特性を持たない基礎素材のみの調合、または閾値未達で候補ゼロの調合。
- **期待される結果**:
  - `result["activated_traits"].is_empty() == true`
  - `result["has_rejected_category"] == false`
  - **システムの安全性**: 空入力でもクラッシュせず一貫した戻り値構造（3キー）を返す。
- **テストの目的**: 退化入力への堅牢性と戻り値構造の一貫性を確認する。
  - **品質保証の観点**: 上流呼び出し側のnullチェック負担を減らす。
- 🟡 信頼性: 要件定義書「4. 想定される使用例：エッジ（候補空）」からの導出

---

## 3. 境界値テストケース

### 3-1. 差分1の最小不均衡で多い方のみ発現する

- **テスト名**: `test_差分1の最小不均衡で多い系統のみ残す`
  - **境界値の意味**: 「同数（不発）」と「不均衡（多い方発現）」を分ける境界は枚数差=1。差1でも確実に不均衡側に倒れることを確認する。
  - **境界値での動作保証**: 差0（同数不発）と差1（不均衡発現）の境界の一貫性を担保する。
- **入力値**:
  - `materials`: 「聖」2個 + 「金」1個（「金」は閾値未満だが集計比較の枚数境界を検証するため、または「聖」3個 vs「金」2個の差1で代替）
  - `activated_traits`: 比較対象となる両系統候補（実装の枚数集計仕様に合わせ、貢献度系合計 = 報酬系合計 + 1 となる構成）
  - **境界値選択の根拠**: 枚数差=1は不均衡判定の下限。オフバイワン誤り（`>` と `>=` の取り違え）を検出する。
  - **実際の使用場面**: プレイヤーが片系統をわずかに多く投入して発現を狙う微調整プレイ。
- **期待される結果**:
  - 多い系統のみ `activated_traits` に残る（`size() == 1`）
  - `result["has_rejected_category"] == true`、`rejected_category` は少ない系統
  - **境界での正確性**: 差1で同数不発に誤分類されないこと。
- **テストの目的**: 同数境界のオフバイワン誤りを排除する。
  - **堅牢性の確認**: 比較演算子の境界挙動を固定する。
- 🟡 信頼性: REQ-115「より多い系統」からの境界導出（TC-101-05を境界視点で補強）

### 3-2. SUPPORT系のみのとき排他なしでそのまま残る

- **テスト名**: `test_補助系のみのとき排他制御なしで全て残す`
  - **境界値の意味**: 比較対象（CONTRIBUTION/REWARD）が両方0件でSUPPORTのみという極端構成の境界。
  - **境界値での動作保証**: SUPPORTだけのとき比較が発生せず、除外も起きないことを確認する。
- **入力値**:
  - `materials`: 「触媒」(SUPPORT)2個
  - `activated_traits`: `[触媒(SUPPORT)]`
  - **境界値選択の根拠**: CONTRIBUTION=0 かつ REWARD=0 の下限。SUPPORT単独時の分岐を代表する。
  - **実際の使用場面**: 補助系特性のみを狙った調合。
- **期待される結果**:
  - `result["activated_traits"].size() == 1` かつ `id == &"catalyst"`
  - `result["has_rejected_category"] == false`
  - **一貫した動作**: SUPPORTは常に保持されるという仕様が単独構成でも守られる。
- **テストの目的**: SUPPORT単独時に空配列へ誤って倒れないことを確認する。
  - **堅牢性の確認**: 「両系統0件かつSUPPORT有」の分岐を固定する。
- 🟡 信頼性: REQ-115最終文・REQ-108からの境界導出

### 3-3. 系統内複数特性が排他で系統ごと一括除去/存置される

- **テスト名**: `test_多い系統内の複数特性は全て残り少ない系統は全除去される`
  - **境界値の意味**: 排他が「特性単位」ではなく「系統単位」で行われる境界を検証する。多い系統に複数特性があれば全て残り、少ない系統は複数特性でも全除去される。
  - **境界値での動作保証**: REQ-112（系統内複数発現）とREQ-115（系統間排他）の処理境界の一貫性を担保する。
- **入力値**:
  - `materials`: 「聖」2個 + 「浄」2個（ともにCONTRIBUTION、合計4） + 「金」2個（REWARD、合計2）
  - `activated_traits`: `[聖(CONTRIBUTION), 浄(CONTRIBUTION), 金(REWARD)]`
  - **境界値選択の根拠**: CONTRIBUTION合計4 > REWARD合計2。多い系統が複数特性を持つ最小構成で、系統単位の一括処理を検証する。
  - **実際の使用場面**: 貢献度系タグを複数種類重ねて系統合計枚数で報酬系に勝つ戦略。
- **期待される結果**:
  - `result["activated_traits"].size() == 2`、含まれるIDは `&"holy"` と `&"cleanse"`（順序非依存）
  - 「金」は含まれない
  - `result["rejected_category"] == TraitDefinition.Category.REWARD`、`has_rejected_category == true`
  - **境界での正確性**: 系統内の個別特性を再評価せず、系統単位で一括存置/除去する。
- **テストの目的**: 排他の粒度が系統単位であることを確認する。
  - **堅牢性の確認**: TASK-0014の系統内複数発現結果を壊さず、系統間排他のみを適用する。
- 🟡 信頼性: REQ-112×REQ-115の組合せ・TASK-0015.md「系統内の個別特性を再評価しない」注意事項からの導出

---

## 4. 開発言語・フレームワーク

- **プログラミング言語**: GDScript（Godot 4.7）
  - **言語選択の理由**: プロジェクトのメイン開発スタックがGodot 4.x + GDScript（CLAUDE.md「技術スタック移行」）。対象実装 `trait_activation.gd` がGDScript。
  - **テストに適した機能**: `static func` の純粋関数を直接呼び出せ、インスタンス生成不要でテストが単純化される。
- **テストフレームワーク**: GUT（Godot Unit Test）9.6.1
  - **フレームワーク選択の理由**: プロジェクト標準のユニットテストフレームワーク（CLAUDE.md Tech Stack、TASK-0014が同フレームワークで実装済み）。
  - **テスト実行環境**: `godot --headless` でのCLI実行、またはGUT統合実行。テストファイルは `tests/unit/features/alchemy/trait_activation_test.gd`（TASK-0014と同一ファイルに追記）。
- 🔵 信頼性: note.md「技術スタック」「テストフレームワーク設定」・CLAUDE.md に明記

---

## 5. テストケース実装時の日本語コメント指針（GUT/GDScript）

TASK-0014の既存テスト（`trait_activation_test.gd`）のコメントスタイルを継承する。各テストで以下を記載する。

```gdscript
func test_同数2対2で両系統とも不発になり空配列を返す() -> void:
    # 【テスト目的】: 貢献度系・報酬系が同数のとき両方不発になることを確認する（支配戦略防止）
    # 【テスト内容】: 「聖」2個+「金」2個の同数構成で resolve_category_conflict を実行
    # 【期待される動作】: activated_traits が空配列、has_rejected_category が false
    # 🔵 信頼性: acceptance-criteria.md TC-101-04（Critical）

    # 【テストデータ準備】: 貢献度系「聖」と報酬系「金」を各2個、系統合計が2対2で同数になる構成
    # 【初期条件設定】: activated_traits は TASK-0014 が確定した [聖, 金] を模したリスト
    var materials: Array[MaterialInstance] = [
        _make_material([&"holy"] as Array[StringName]),
        _make_material([&"holy"] as Array[StringName]),
        _make_material([&"gold"] as Array[StringName]),
        _make_material([&"gold"] as Array[StringName]),
    ]
    var activated: Array[TraitDefinition] = [trait_defs[&"holy"], trait_defs[&"gold"]]

    # 【実際の処理実行】: 系統間排他制御の純粋関数を呼び出す
    # 【処理内容】: 系統別枚数集計 → 同数判定 → 両系統除外
    var result: Dictionary = TraitActivationScript.resolve_category_conflict(materials, activated)

    # 【結果検証】: 空配列かつ排他フラグ偽であることを確認する
    # 【品質保証】: 支配戦略（無条件両取り）が数式レベルで成立しないことを保証する
    assert_true(result["activated_traits"].is_empty(), "同数時は両系統とも不発（空配列）") # 【検証項目】: 同数不発 🔵
    assert_false(result["has_rejected_category"], "同数不発時は単一系統で表現不可のためfalse") # 【検証項目】: 無効値フラグ 🔵
```

### セットアップ（before_each）方針

- TASK-0014の `before_each` で構築済みの `trait_defs` 辞書（`holy`/`cleanse`/`heal`/`gold`）を再利用する。
- 本タスクで新規に必要な特性を追加する:
  - `trait_defs[&"catalyst"] = _make_trait(&"catalyst", "触媒", TraitDefinitionScript.Category.SUPPORT, &"E")`（補助系検証用）
- ヘルパー `_make_material` / `_make_trait` はTASK-0014のものをそのまま利用する。

---

## 6. 要件定義との対応関係

- **参照した機能概要**: `trait-category-conflict-requirements.md` 1章（系統間排他制御・支配戦略防止）
- **参照した入力・出力仕様**: 同2章（`materials`/`activated_traits` 入力、Dictionary3キー出力、5分岐の入出力関係）
- **参照した制約条件**: 同3章（Functional Core純粋関数、枚数の定義＝同一タグ重複投入数合計、補助系除外、無効値表現）
- **参照した使用例**: 同4章（不均衡・同数不発・1素材2タグ・補助系除外・片系統のみ・候補空）
- **参照した受け入れ基準**: acceptance-criteria.md TC-101-04（Critical）, TC-101-05, TC-101-07（Critical）
- **参照したEARS要件**: REQ-115（主）, REQ-106, REQ-108, REQ-112, REQ-104
- **参照した設計文書**: architecture.md（TraitActivationシグネチャ）, dataflow.md「機能2」ステップ3, data-model.md（MaterialInstance / TraitDefinition / Category / CraftResult）
- **参照した既存実装**: `features/alchemy/logic/trait_activation.gd`（TASK-0014）, `tests/unit/features/alchemy/trait_activation_test.gd`（テストパターン）

---

## 品質判定

- **テストケース分類**: 正常系4・異常系3・境界値3で網羅（同数不発／不均衡／片系統／補助系／候補空／系統単位排他／対称性を全てカバー）
- **期待値定義**: 全ケースで `activated_traits`（件数・ID）・`rejected_category`・`has_rejected_category` を明確に定義
- **技術選択**: GDScript + GUT 9.6.1 に確定（TASK-0014と同一ファイル・同一パターン）
- **実装可能性**: 確実（TASK-0014の `_make_material`/`_make_trait`/`trait_defs` 資産を継承、SUPPORT特性のみ追加）
- **信頼性レベル分布**: 🔵 4件（必須Critical含むコアケース）/ 🟡 6件（対称性・境界・SUPPORT・候補空などREQ本文からの妥当な導出）/ 🔴 0件

**総合評価**: ✅ 高品質

---

## 次のお勧めステップ

`/tsumiki:tdd-red atelier-alchemy-core TASK-0015` でRedフェーズ（失敗テスト作成）を開始する。
