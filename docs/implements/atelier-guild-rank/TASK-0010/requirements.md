# TASK-0010: 素材エンティティ・MaterialService実装 - 要件定義書

**作成日**: 2026-01-16
**タスクID**: TASK-0010
**要件名**: atelier-guild-rank

---

## 1. 機能要件

### 1.1 MaterialInstanceエンティティ

**概要**
プレイヤーが所持する素材の実体を表すエンティティ。

**必須機能**
- **FR-0010-E01**: instanceId（一意なID）を持つこと
  - GIVEN: 素材インスタンスが生成される場合
  - WHEN: MaterialInstanceが作成される時
  - THEN: 一意なinstanceIdが自動的に割り当てられること

- **FR-0010-E02**: MaterialMaster（マスターデータ）への参照を持つこと
  - GIVEN: 素材インスタンスが生成される場合
  - WHEN: MaterialInstanceが作成される時
  - THEN: IMaterialインターフェースを持つmasterプロパティが設定されること

- **FR-0010-E03**: Quality（D, C, B, A, Sの5段階）を持つこと
  - GIVEN: 素材インスタンスが生成される場合
  - WHEN: MaterialInstanceが作成される時
  - THEN: Quality型のqualityプロパティが設定されること

- **FR-0010-E04**: 不変オブジェクトとして設計すること
  - GIVEN: 素材インスタンスが存在する場合
  - WHEN: プロパティにアクセスする時
  - THEN: すべてのプロパティがreadonly属性であること

**属性アクセス**
- **FR-0010-E05**: materialId、name、baseQuality、attributesをgetterで公開すること
  - GIVEN: 素材インスタンスが存在する場合
  - WHEN: getterメソッドが呼び出される時
  - THEN: マスターデータから対応する属性値が返されること

---

### 1.2 Quality値オブジェクト

**概要**
品質（Quality）の比較・順序付けを行うユーティリティ関数群。

**必須機能**
- **FR-0010-Q01**: QUALITY_ORDER定数で品質の順序を定義すること
  - GIVEN: 品質の順序付けが必要な場合
  - WHEN: QUALITY_ORDERが参照される時
  - THEN: D=1, C=2, B=3, A=4, S=5の順序が定義されていること

- **FR-0010-Q02**: compareQuality(a, b)関数で2つの品質を比較できること
  - GIVEN: 2つの品質が与えられた場合
  - WHEN: compareQuality(a, b)が呼び出される時
  - THEN: a > b なら正の数、a == b なら0、a < b なら負の数が返されること

- **FR-0010-Q03**: getHigherQuality(a, b)関数で高い方の品質を返せること
  - GIVEN: 2つの品質が与えられた場合
  - WHEN: getHigherQuality(a, b)が呼び出される時
  - THEN: 品質が高い方の値が返されること（同じ場合はa）

**推奨機能**
- **FR-0010-Q04**: getLowerQuality(a, b)関数で低い方の品質を返せること（オプション）
  - GIVEN: 2つの品質が与えられた場合
  - WHEN: getLowerQuality(a, b)が呼び出される時
  - THEN: 品質が低い方の値が返されること（同じ場合はa）

---

### 1.3 MaterialService

**概要**
素材の生成、品質計算、検索を行うアプリケーションサービス。

#### 1.3.1 素材インスタンス生成

**FR-0010-S01**: createInstance(materialId, quality): MaterialInstance
- GIVEN: 有効なmaterialIdとqualityが与えられた場合
- WHEN: createInstance()が呼び出される時
- THEN: 一意なinstanceIdを持つMaterialInstanceが生成されること
- AND: マスターデータから素材情報が取得されること
- AND: 指定されたqualityが設定されること

**FR-0010-S02**: 存在しない素材IDの場合はエラーを投げること
- GIVEN: 存在しないmaterialIdが与えられた場合
- WHEN: createInstance()が呼び出される時
- THEN: ApplicationErrorがスローされること
- AND: ErrorCodes.INVALID_MATERIAL_IDが設定されていること

#### 1.3.2 ランダム品質生成

**FR-0010-S03**: generateRandomQuality(baseQuality): Quality
- GIVEN: 基準品質（baseQuality）が与えられた場合
- WHEN: generateRandomQuality()が呼び出される時
- THEN: 基準品質から±1段階の範囲でランダムに品質が生成されること
- AND: 生成される品質は均等な確率分布であること（-1, 0, 1がそれぞれ1/3）

**FR-0010-S04**: 品質の範囲制限
- GIVEN: 基準品質がDまたはSの場合
- WHEN: generateRandomQuality()が呼び出される時
- THEN: D（最小）～S（最大）の範囲を超えないようクランプされること
  - 例: baseQuality=D の場合、D または C のみ生成される
  - 例: baseQuality=S の場合、A または S のみ生成される

#### 1.3.3 平均品質計算

**FR-0010-S05**: calculateAverageQuality(materials): Quality
- GIVEN: 素材インスタンスの配列が与えられた場合
- WHEN: calculateAverageQuality()が呼び出される時
- THEN: 各素材の品質を数値に変換して平均が算出されること
- AND: 平均値が四捨五入されて品質ランクに変換されること

**FR-0010-S06**: 空配列の場合はエラーを投げること
- GIVEN: 空の配列が与えられた場合
- WHEN: calculateAverageQuality()が呼び出される時
- THEN: ApplicationErrorがスローされること
- AND: ErrorCodes.INVALID_MATERIALSが設定されていること

#### 1.3.4 検索機能（将来実装）

**FR-0010-S07**: getMaterialsByCategory(category): MaterialMaster[]（オプション）
- GIVEN: カテゴリが与えられた場合
- WHEN: getMaterialsByCategory()が呼び出される時
- THEN: 該当するカテゴリの素材マスターが配列で返されること

**FR-0010-S08**: getMaterialsByRank(rank): MaterialMaster[]（オプション）
- GIVEN: ギルドランクが与えられた場合
- WHEN: getMaterialsByRank()が呼び出される時
- THEN: 該当するランクで解禁される素材マスターが配列で返されること

---

## 2. 非機能要件

### 2.1 型安全性

**NFR-0010-T01**: TypeScript strictモードで型安全を保証すること
- GIVEN: TypeScriptコンパイルが実行される場合
- WHEN: strictモードが有効な時
- THEN: 型エラーが発生しないこと

**NFR-0010-T02**: unknown型を適切に使用すること
- GIVEN: 外部からの入力を扱う場合
- WHEN: 型が不明な値を処理する時
- THEN: any型ではなくunknown型を使用すること

### 2.2 不変性

**NFR-0010-I01**: エンティティは不変オブジェクトとして実装すること
- GIVEN: MaterialInstanceが生成される場合
- WHEN: インスタンスが作成された後
- THEN: すべてのプロパティが変更不可能であること（readonly）

**NFR-0010-I02**: 状態更新時は新しいオブジェクトを作成すること
- GIVEN: 状態の更新が必要な場合
- WHEN: 配列やオブジェクトを操作する時
- THEN: 元のオブジェクトを変更せず、新しいオブジェクトを作成すること

### 2.3 境界値処理

**NFR-0010-B01**: 品質の最小値（D）と最大値（S）を超えないこと
- GIVEN: 品質計算が行われる場合
- WHEN: ランダム生成や平均計算が実行される時
- THEN: 結果がD～Sの範囲内に収まること

**NFR-0010-B02**: 空配列や不正な入力に対して適切にエラーを投げること
- GIVEN: 無効な入力が与えられた場合
- WHEN: サービスメソッドが呼び出される時
- THEN: ApplicationErrorが明確なエラーコードとともにスローされること

### 2.4 テストカバレッジ

**NFR-0010-TC01**: 単体テストカバレッジ80%以上を達成すること
- GIVEN: テストが実行される場合
- WHEN: カバレッジレポートが生成される時
- THEN: ライン、ブランチ、関数のカバレッジがそれぞれ80%以上であること

**NFR-0010-TC02**: 境界値テストを含めること
- GIVEN: テストケースが作成される場合
- WHEN: テストが実行される時
- THEN: 最小値（D）、最大値（S）、空配列などの境界値がテストされていること

### 2.5 コーディング規約

**NFR-0010-C01**: Biomeによるコードスタイルチェックに合格すること
- GIVEN: コードがコミットされる場合
- WHEN: Lefthookによるpre-commit hookが実行される時
- THEN: Biomeのlintとformatチェックが全て通ること

**NFR-0010-C02**: Clean Architectureの原則に従うこと
- GIVEN: コードが実装される場合
- WHEN: レイヤー間の依存関係が定義される時
- THEN: Domain層がFrameworkに依存しないこと
- AND: Application層がPresentation層に依存しないこと

---

## 3. 受け入れ基準

### 3.1 必須条件

- **AC-0010-01**: 素材インスタンスが生成できる
  - [ ] createInstance()で一意なinstanceIdを持つMaterialInstanceが生成される
  - [ ] マスターデータから素材情報が正しく取得される
  - [ ] 指定された品質が正しく設定される
  - [ ] 存在しない素材IDの場合はエラーがスローされる

- **AC-0010-02**: 品質比較が正しく動作する（S > A > B > C > D）
  - [ ] compareQuality()で正しい比較結果が返される
  - [ ] getHigherQuality()で高い方の品質が返される
  - [ ] QUALITY_ORDER定数が正しく定義されている

- **AC-0010-03**: 平均品質計算が正しい
  - [ ] 同じ品質の素材の平均は元の品質と同じになる
  - [ ] 異なる品質の素材の平均が四捨五入で計算される
  - [ ] 空配列の場合はエラーがスローされる

- **AC-0010-04**: ランダム品質生成が基準±1以内である
  - [ ] generateRandomQuality()が基準±1段階の範囲で生成される
  - [ ] 品質Dの場合、D または C のみ生成される
  - [ ] 品質Sの場合、A または S のみ生成される
  - [ ] 生成される品質の確率分布が均等である

### 3.2 推奨条件

- **AC-0010-05**: 品質変動ロジックのカスタマイズが可能
  - [ ] 将来的に±2段階の変動など、拡張可能な設計になっている

- **AC-0010-06**: 単体テストカバレッジ80%以上
  - [ ] エンティティ、値オブジェクト、サービスのテストが実装されている
  - [ ] カバレッジレポートで80%以上を達成している

- **AC-0010-07**: エラーハンドリングが適切
  - [ ] 存在しない素材ID時にERROR.INVALID_MATERIAL_IDがスローされる
  - [ ] 空配列での平均計算時にERROR.INVALID_MATERIALSがスローされる
  - [ ] マスターデータ未読み込み時にERROR.DATA_NOT_LOADEDがスローされる

### 3.3 テストケース一覧

| テストID | テスト内容 | 期待結果 |
|---------|----------|----------|
| T-0010-01 | 素材インスタンス生成 | 正しいプロパティ（instanceId, master, quality）を持つ |
| T-0010-02 | 品質比較 | S > A > B > C > D の順序が正しく比較される |
| T-0010-03 | 平均品質（同一品質） | 入力と同じ品質が返される |
| T-0010-04 | 平均品質（混合） | 正しい平均が四捨五入で計算される |
| T-0010-05 | ランダム品質生成 | 基準±1以内の品質が生成される |
| T-0010-06 | 境界値（D） | 品質Dでランダム生成時、D または C のみ |
| T-0010-07 | 境界値（S） | 品質Sでランダム生成時、A または S のみ |
| T-0010-08 | エラー（存在しない素材ID） | ApplicationErrorがスローされる |
| T-0010-09 | エラー（空配列） | ApplicationErrorがスローされる |

---

## 4. 制約事項

### 4.1 技術制約

**CON-0010-01**: 品質は5段階のみ
- 品質はD, C, B, A, Sの5段階に限定される
- 他の品質ランク（F, S+など）は存在しない

**CON-0010-02**: ランダム品質生成は基準から±1段階まで
- generateRandomQuality()は基準品質から±1段階の範囲でのみ生成する
- ±2段階以上の変動は今回の実装では対応しない（将来拡張可能）

**CON-0010-03**: 平均品質は四捨五入で決定
- calculateAverageQuality()は四捨五入（Math.round()）を使用する
- 切り捨て（Math.floor()）や切り上げ（Math.ceil()）は使用しない

**CON-0010-04**: 素材インスタンスIDは時刻ベースのユニークID
- instanceIdは`generateUniqueId('material')`で生成される
- 形式: `material_<timestamp>_<random>`
- UUIDやulidは使用しない

### 4.2 データ制約

**CON-0010-05**: マスターデータが読み込まれていること
- MaterialServiceを使用する前に、マスターデータが読み込まれている必要がある
- 未読み込みの場合、createInstance()はエラーをスローする

**CON-0010-06**: 素材マスターはIMaterialインターフェースに準拠すること
- マスターデータは以下のプロパティを持つ必要がある:
  - id: MaterialId
  - name: string
  - baseQuality: Quality
  - attributes: Attribute[]
  - category: MaterialCategory
  - unlockRank: GuildRank

### 4.3 パフォーマンス制約

**CON-0010-07**: 素材検索はO(1)で実行されること
- マスターデータリポジトリはMapを使用してインデックス化される
- getMaterialById()はO(1)のアクセス時間で実行される

### 4.4 互換性制約

**CON-0010-08**: Phaser 3.87+との互換性
- ゲームエンジンとしてPhaser 3.87以上を使用する
- ただし、Domain層・Application層はPhaserに依存しない

**CON-0010-09**: TypeScript 5.x対応
- TypeScript 5.xのstrictモードで動作すること
- 最新の型システムを活用すること

---

## 5. 実装優先順位

### 5.1 Phase 1: 必須実装（信頼性レベル: 🔵）

1. **Quality値オブジェクト**（最優先）
   - QUALITY_ORDER定数
   - compareQuality()関数
   - getHigherQuality()関数

2. **MaterialInstanceエンティティ**
   - コンストラクタ
   - getterメソッド

3. **IMaterialServiceインターフェース**
   - メソッドシグネチャ定義

4. **MaterialService実装**
   - createInstance()メソッド
   - generateRandomQuality()メソッド
   - calculateAverageQuality()メソッド

5. **単体テスト**
   - T-0010-01 ～ T-0010-05
   - カバレッジ80%以上達成

### 5.2 Phase 2: 推奨実装（信頼性レベル: 🟡）

1. **エラーハンドリング強化**
   - 存在しない素材ID時のエラー
   - 空配列での平均計算時のエラー
   - マスターデータ未読み込み時のエラー

2. **テスト拡充**
   - T-0010-06 ～ T-0010-09
   - 境界値テスト
   - エラーケーステスト

3. **検索機能**（将来実装）
   - getMaterialsByCategory()
   - getMaterialsByRank()

### 5.3 Phase 3: 将来拡張（信頼性レベル: 🟢）

1. **イベント発行**
   - MATERIAL_CREATEDイベント
   - EventBusとの連携

2. **品質変動ロジックのカスタマイズ**
   - ±2段階の変動対応
   - 確率分布のカスタマイズ

---

## 6. 参照文書

### 設計文書
- [データスキーマ設計（素材マスター）](../../../design/atelier-guild-rank/data-schema-master-game.md)
- [アーキテクチャ設計（概要）](../../../design/atelier-guild-rank/architecture-overview.md)

### タスク定義
- [TASK-0010定義](../../../tasks/atelier-guild-rank/phase-2/TASK-0010.md)

### 開発ノート
- [TASK-0010開発ノート](./note.md)

### 既存実装（参考）
- Cardエンティティ: `atelier-guild-rank/src/domain/entities/Card.ts`
- DeckService: `atelier-guild-rank/src/application/services/deck-service.ts`
- EventBus: `atelier-guild-rank/src/application/events/event-bus.ts`

---

## 7. 用語定義

| 用語 | 定義 |
|-----|------|
| MaterialInstance | プレイヤーが所持する素材の実体。マスターデータへの参照と実際の品質を持つ。 |
| MaterialMaster | 素材のマスターデータ（IMaterialインターフェース）。素材の基本情報を定義。 |
| Quality | 品質ランク。D, C, B, A, Sの5段階。 |
| QUALITY_ORDER | 品質を数値にマッピングする定数（D=1, C=2, B=3, A=4, S=5）。 |
| instanceId | 素材インスタンスの一意なID。形式: `material_<timestamp>_<random>` |
| baseQuality | 素材マスターで定義された基本品質。 |
| クランプ処理 | 値を範囲内に収める処理（例: 0未満は0に、5超は5にする）。 |

---

**承認**: 未承認
**承認者**: -
**承認日**: -

**最終更新**: 2026-01-16
