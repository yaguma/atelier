# Quest & Client Agent 指示テンプレート

## 役割

依頼者マスターデータ・依頼テンプレートマスターデータの生成を担当する。

## 参照すべきファイル

### 必読
1. `.claude/skills/content-gen-pipeline/references/data-schema-guide.md` — スキーマ定義
2. `.claude/skills/content-gen-pipeline/references/agent-output-format.md` — 出力フォーマット

### 既存データ確認
3. `atelier-guild-rank/public/data/quests.json` — 既存依頼者・依頼テンプレート
4. `atelier-guild-rank/public/data/recipes.json` — アイテムデータ（condition.itemId参照用）
5. `atelier-guild-rank/public/data/ranks.json` — ランク定義
6. `atelier-guild-rank/public/data/game-balance.json` — バランスパラメータ

### 型定義
7. `atelier-guild-rank/src/shared/types/quests.ts` — 依頼・依頼者型
8. `atelier-guild-rank/src/shared/types/common.ts` — 列挙型定義

### ビジネスロジック参照
9. `atelier-guild-rank/src/features/quest/services/calculate-reward.ts` — 報酬計算ロジック
10. `atelier-guild-rank/src/features/quest/services/generate-quests.ts` — 依頼生成ロジック

## 生成ルール

### 依頼者（IClient）

1. **type**: 5種をバランスよく
   - VILLAGER: 村人（簡単な依頼、低報酬、長い期限）
   - ADVENTURER: 冒険者（戦闘系の依頼、普通の報酬）
   - MERCHANT: 商人（大量納品、ゴールド報酬高め）
   - NOBLE: 貴族（高品質要求、高報酬、短い期限）
   - GUILD: ギルド（特殊な依頼、貢献度報酬高め）

2. **contributionMultiplier**: 依頼者種別に応じて調整
   - VILLAGER: 0.8〜1.0
   - ADVENTURER: 1.0〜1.2
   - MERCHANT: 0.8〜1.0
   - NOBLE: 1.2〜1.5
   - GUILD: 1.3〜1.8

3. **goldMultiplier**: 依頼者種別に応じて調整
   - VILLAGER: 0.6〜0.8
   - ADVENTURER: 0.9〜1.1
   - MERCHANT: 1.2〜1.5
   - NOBLE: 1.3〜1.8
   - GUILD: 0.8〜1.0

4. **deadlineModifier**: 期限の修正値（日数）
   - VILLAGER: +1〜+3（余裕あり）
   - ADVENTURER: 0〜+1
   - MERCHANT: 0〜+1
   - NOBLE: -1〜0（厳しめ）
   - GUILD: -1〜+1

5. **preferredQuestTypes**: 種別に合った依頼タイプ
   - VILLAGER: SPECIFIC, CATEGORY
   - ADVENTURER: SPECIFIC, QUALITY, MATERIAL
   - MERCHANT: QUANTITY, CATEGORY
   - NOBLE: QUALITY, ATTRIBUTE, EFFECT
   - GUILD: COMPOUND, MATERIAL, QUALITY

6. **dialoguePatterns**: 2〜4パターンのセリフ
   - 依頼者の性格・立場を反映
   - ゲーム世界観に合った口調

### 依頼テンプレート（IQuest）

1. **clientId**: 必ず quests.json の clients に存在するIDを使用

2. **condition**: 依頼者の preferredQuestTypes に合ったタイプを使用
   - SPECIFIC: 特定アイテムの納品（itemId必須）
   - CATEGORY: カテゴリ指定納品（category必須）
   - QUALITY: 品質指定納品（minQuality必須）
   - QUANTITY: 数量指定納品（quantity必須）
   - ATTRIBUTE: 属性指定素材納品
   - EFFECT: 効果指定アイテム納品
   - MATERIAL: 特定素材の納品
   - COMPOUND: 複合条件（subConditions必須）

3. **contribution**: ランクと難易度に応じた貢献度
   - game-balance.json の difficulty_curve を参考に
   - easy: 基準値 × 0.7
   - normal: 基準値 × 1.0
   - hard: 基準値 × 1.5

4. **gold**: 貢献度と依頼者の goldMultiplier を考慮
   - 基本: 貢献度 × 1.5 × goldMultiplier

5. **deadline**: ランクと難易度に応じた期限（日数）
   - G: 2-4日
   - F: 2-3日
   - E: 2-3日
   - D以上: 1-3日
   - 依頼者の deadlineModifier で調整

6. **difficulty**: easy/normal/hard をバランスよく
   - 低ランク: easy多め
   - 中ランク: normal中心
   - 高ランク: hard多め

7. **flavorText**: 依頼者の性格を反映した依頼文
   - 1〜2文で状況と理由を説明
   - 依頼者の口調に合わせる

## ランク別生成ガイドライン

| ランク | 依頼者数 | 依頼テンプレート数 | テーマ |
|--------|---------|-----------------|-------|
| G | 2-3人 | 4-6件 | 日常的な依頼 |
| F | 2-3人 | 4-6件 | やや専門的な依頼 |
| E | 2-3人 | 3-5件 | 特殊な依頼 |
| D | 1-2人 | 3-5件 | 高難度の依頼 |
| C | 1-2人 | 3-4件 | 専門的な依頼 |
| B | 1-2人 | 2-3件 | 極めて難しい依頼 |
| A | 1人 | 2-3件 | 最高難度の依頼 |
| S | 1人 | 1-2件 | 伝説的な依頼 |

## 出力先

- `atelier-guild-rank/public/data/quests.json`
  - `clients` 配列に依頼者を追加
  - `templates` 配列に依頼テンプレートを追加

## 禁止事項

- ID割当表の範囲外のIDを使用しない
- 存在しないアイテムIDをcondition.itemIdで参照しない
- 依頼者の preferredQuestTypes と合わない条件タイプを使わない
- 報酬が0以下にならないようにする
- deadlineが0以下にならないようにする
- 同じ依頼者に依頼が集中しないよう分散させる
