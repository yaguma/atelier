# Validator Agent 指示テンプレート

## 役割

生成されたマスターデータの整合性検証を担当する。ファイルの読み取りのみ行い、編集は行わない。

## 参照すべきファイル

### 必読
1. `.claude/skills/content-gen-pipeline/references/data-schema-guide.md` — スキーマ定義
2. `.claude/skills/content-gen-pipeline/references/agent-output-format.md` — 出力フォーマット

### 検証対象
3. `atelier-guild-rank/public/data/cards.json`
4. `atelier-guild-rank/public/data/materials.json`
5. `atelier-guild-rank/public/data/recipes.json`
6. `atelier-guild-rank/public/data/quests.json`
7. `atelier-guild-rank/public/data/ranks.json`
8. `atelier-guild-rank/public/data/artifacts.json`
9. `atelier-guild-rank/public/data/game-balance.json`

### 型定義
10. `atelier-guild-rank/src/shared/types/master-data.ts`
11. `atelier-guild-rank/src/shared/types/materials.ts`
12. `atelier-guild-rank/src/shared/types/quests.ts`
13. `atelier-guild-rank/src/shared/types/common.ts`
14. `atelier-guild-rank/src/shared/types/ids.ts`

## 検証項目

### 1. スキーマ検証（Critical）

各JSONファイルが型定義に準拠しているか確認する。

#### cards.json
- [ ] 全カードに必須フィールドが存在する
- [ ] `type` フィールドが `GATHERING` / `RECIPE` / `ENHANCEMENT` のいずれか
- [ ] typeに応じた必須フィールドが存在する
  - GATHERING: baseCost, presentationCount, rareRate, materialPool
  - RECIPE: cost, requiredMaterials, outputItemId, category
  - ENHANCEMENT: cost=0, effect, targetAction
- [ ] 列挙型フィールドの値が有効な値か（rarity, unlockRank等）

#### materials.json
- [ ] 全素材に必須フィールド（id, name, baseQuality, attributes）が存在する
- [ ] baseQualityがQuality列挙型の有効値か
- [ ] attributesの各要素がAttribute列挙型の有効値か

#### recipes.json
- [ ] items配列の各要素に必須フィールドが存在する
- [ ] categoryがItemCategory列挙型の有効値か
- [ ] effects配列が空でないか
- [ ] effects[].typeがItemEffectType列挙型の有効値か

#### quests.json
- [ ] clients配列の各要素に必須フィールドが存在する
- [ ] templates配列の各要素に必須フィールドが存在する
- [ ] ClientTypeが有効値か
- [ ] QuestTypeが有効値か
- [ ] difficultyが easy/normal/hard のいずれか

### 2. 参照整合性検証（Critical）

IDの相互参照が壊れていないか確認する。

- [ ] cards.json（GATHERING）の `materialPool[]` → materials.json の `id`
- [ ] cards.json（RECIPE）の `requiredMaterials[].materialId` → materials.json の `id`
- [ ] cards.json（RECIPE）の `outputItemId` → recipes.json の `items[].id`
- [ ] quests.json の templates[].`clientId` → quests.json の clients[].`id`
- [ ] quests.json の templates[].condition.`itemId`（存在する場合）→ recipes.json の `items[].id`
- [ ] ranks.json の `unlockedGatheringCards[]` → cards.json の `id`（type=GATHERING）
- [ ] ranks.json の `unlockedRecipeCards[]` → cards.json の `id`（type=RECIPE）

### 3. ID一意性検証（Critical）

- [ ] cards.json 内でIDが重複していない
- [ ] materials.json 内でIDが重複していない
- [ ] recipes.json の items 内でIDが重複していない
- [ ] quests.json の clients 内でIDが重複していない
- [ ] quests.json の templates 内でIDが重複していない
- [ ] artifacts.json 内でIDが重複していない

### 4. バランス偏り検証（Warning）

#### レアリティ分布
- [ ] 各レアリティのカード数が極端に偏っていないか
  - 目安: COMMON > UNCOMMON > RARE > EPIC > LEGENDARY

#### 属性分布
- [ ] 各属性の素材数が極端に偏っていないか
  - 目安: 全5属性に最低2つ以上の素材

#### カテゴリ分布
- [ ] アイテムカテゴリが極端に偏っていないか
  - 目安: 全5カテゴリに最低1つ以上のアイテム

#### ランク別コンテンツ量
- [ ] 特定ランクにコンテンツが集中しすぎていないか
- [ ] 高ランクに向けて適切にコンテンツが増えているか

#### 依頼バランス
- [ ] 依頼難易度（easy/normal/hard）が適切に分布しているか
- [ ] 報酬がランクに対して妥当か（低すぎ/高すぎ）

### 5. 値の妥当性検証（Warning）

- [ ] baseCost が 0 以下でないか
- [ ] presentationCount が 0 以下でないか
- [ ] rareRate が 0〜100 の範囲内か
- [ ] contribution が 0 以下でないか
- [ ] deadline が 0 以下でないか
- [ ] 倍率系（contributionMultiplier, goldMultiplier）が 0 以下でないか

### 6. 命名規則検証（Info）

- [ ] IDプレフィックスが規則に従っているか
  - 採取カード: `gathering_`
  - レシピカード: `recipe_`
  - 強化カード: `enhance_`
  - 素材: `mat_`
  - アイテム: `item_`
  - 依頼者: `client_`
  - 依頼: `quest_`
  - アーティファクト: `artifact_`

## 出力

検証結果を `agent-output-format.md` の Validator Agent フォーマットに従いまとめ、
SendMessage で pipeline-lead に送信する。

## 厳守事項

- **ファイル編集は禁止**（Read, Glob, Grep のみ使用可能）
- 問題は重要度別（Critical/Warning/Info）に分類する
- 各問題には具体的な修正案を提示する
- 統計情報（分布表）を必ず含める
- 検証完了後、TaskUpdateでタスクをcompletedにする
