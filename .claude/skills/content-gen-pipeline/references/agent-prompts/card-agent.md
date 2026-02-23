# Card Agent 指示テンプレート

## 役割

カードマスターデータ（採取カード・レシピカード・強化カード）の生成を担当する。

## 参照すべきファイル

### 必読
1. `.claude/skills/content-gen-pipeline/references/data-schema-guide.md` — スキーマ定義
2. `.claude/skills/content-gen-pipeline/references/agent-output-format.md` — 出力フォーマット

### 既存データ確認
3. `atelier-guild-rank/public/data/cards.json` — 既存カードデータ
4. `atelier-guild-rank/public/data/materials.json` — 素材データ（materialPool用）
5. `atelier-guild-rank/public/data/recipes.json` — アイテムデータ（outputItemId用）
6. `atelier-guild-rank/public/data/ranks.json` — ランク定義（unlockRank確認用）
7. `atelier-guild-rank/public/data/game-balance.json` — バランスパラメータ

### 型定義
8. `atelier-guild-rank/src/shared/types/master-data.ts` — カードマスター型

## 生成ルール

### 採取カード（GATHERING）

1. **materialPool**: 必ず `materials.json` に存在するIDを使用する
   - Material & Item Agent が新規素材を生成する場合は、ID割当表の素材IDを参照
2. **baseCost**: ランクが上がるほど高く設定（G:1, F:1-2, E:2, D:2-3, C:3, B:3-4, A:4, S:4-5）
3. **presentationCount**: 3〜6の範囲。高ランクほど多くてもよい
4. **rareRate**: ランクが上がるほど高く（G:5-10, F:10-15, E:15-20, D:20-30, C:30-40, B:40-50, A:50-60, S:60-80）
5. **rarity**: ランクに対応（G:COMMON, F:COMMON/UNCOMMON, E:UNCOMMON, D:UNCOMMON/RARE, C:RARE, B:RARE/EPIC, A:EPIC, S:EPIC/LEGENDARY）

### レシピカード（RECIPE）

1. **requiredMaterials**: 必ず `materials.json` に存在するIDを使用する
   - quantity は 1〜5 の範囲
   - minQuality はオプション（高難度レシピで指定）
2. **outputItemId**: 必ず `recipes.json` のitems内に存在するIDを使用する
   - Material & Item Agent が新規アイテムを生成する場合は、ID割当表のアイテムIDを参照
3. **cost**: 1〜3の範囲。複雑なレシピほど高い
4. **category**: outputItemIdのカテゴリと一致させる

### 強化カード（ENHANCEMENT）

1. **cost**: 常に `0`
2. **effect.type**: EffectType列挙型の値を使用
3. **effect.value**: 効果の強さ（5〜50の範囲、効果種別とレアリティに応じて調整）
4. **targetAction**: GATHERING/ALCHEMY/DELIVERY/ALL のいずれか

### 共通ルール

1. **名前（name）**: 日本語でゲーム世界観に合った名前
   - 採取カード: 場所名（「裏庭」「近くの森」「水晶の洞窟」等）
   - レシピカード: 調合品名（「回復薬」「炎の剣」等）
   - 強化カード: 効果を表す名前（「賢者の触媒」「風の祝福」等）
2. **description**: 1〜2文で説明。ゲームの雰囲気に合わせる
3. **unlockRank**: 対象ランクと同じか、そのランク以降に解禁
4. **rarity**: ランクの進行に応じて段階的に上げる

## ランク別生成ガイドライン

| ランク | 採取カード | レシピカード | 強化カード | テーマ例 |
|--------|-----------|------------|-----------|---------|
| G | 2-3枚 | 2-3枚 | 1-2枚 | 基本素材、簡単な薬 |
| F | 2-3枚 | 2-3枚 | 1-2枚 | やや珍しい素材、道具 |
| E | 2-3枚 | 3-4枚 | 2-3枚 | 特殊な場所、武器 |
| D | 2-3枚 | 3-4枚 | 2-3枚 | 危険な場所、魔法品 |
| C | 2-3枚 | 3-4枚 | 2-3枚 | 秘境、高級品 |
| B | 1-2枚 | 2-3枚 | 2-3枚 | 伝説の場所、希少品 |
| A | 1-2枚 | 2-3枚 | 1-2枚 | 最高峰、傑作 |
| S | 1枚 | 1-2枚 | 1枚 | 伝説級、究極品 |

## 出力先

- `atelier-guild-rank/public/data/cards.json` — 既存配列に追加

## 禁止事項

- ID割当表の範囲外のIDを使用しない
- 存在しない素材ID・アイテムIDを参照しない
- 同じランクにカードを集中させない（バランスよく分散）
- 既存カードと同じ名前・同じ効果のカードを作らない
