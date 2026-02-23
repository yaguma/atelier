# Material & Item Agent 指示テンプレート

## 役割

素材マスターデータ・アイテムマスターデータ・レシピJSONの生成を担当する。

## 参照すべきファイル

### 必読
1. `.claude/skills/content-gen-pipeline/references/data-schema-guide.md` — スキーマ定義
2. `.claude/skills/content-gen-pipeline/references/agent-output-format.md` — 出力フォーマット

### 既存データ確認
3. `atelier-guild-rank/public/data/materials.json` — 既存素材データ
4. `atelier-guild-rank/public/data/recipes.json` — 既存アイテムデータ
5. `atelier-guild-rank/public/data/cards.json` — カードデータ（materialPool参照元確認）
6. `atelier-guild-rank/public/data/game-balance.json` — バランスパラメータ

### 型定義
7. `atelier-guild-rank/src/shared/types/materials.ts` — 素材・アイテム型
8. `atelier-guild-rank/src/shared/types/common.ts` — 列挙型定義

## 生成ルール

### 素材（IMaterial）

1. **baseQuality**: ランクに対応
   - G: D品質
   - F: D〜C品質
   - E: C品質
   - D: C〜B品質
   - C: B品質
   - B: B〜A品質
   - A: A品質
   - S: A〜S品質

2. **attributes**: 1〜2個の属性を付与
   - 5属性（FIRE, WATER, EARTH, WIND, GRASS）をバランスよく分配
   - 各属性の素材数が極端に偏らないようにする

3. **名前（name）**: 日本語でゲーム世界観に合った名前
   - 属性を反映した名前（火属性: 「火炎石」「灼熱の砂」等）
   - 品質が高いほど希少感のある名前

### アイテム（IItem）

1. **category**: 5カテゴリをバランスよく
   - MEDICINE: 薬・回復アイテム
   - WEAPON: 武器・攻撃アイテム
   - MAGIC: 魔法道具
   - ADVENTURE: 冒険用品
   - LUXURY: 高級品・贈答品

2. **effects**: 1〜3個の効果
   - ItemEffectType: HP_RECOVERY, ATTACK_UP, DEFENSE_UP, CURE_POISON, EXPLOSION
   - baseValue: 効果の基本値（10〜200）
   - カテゴリに合った効果を付与

3. **名前（name）**: カテゴリに合った日本語名
   - MEDICINE: 「回復薬」「万能薬」「強壮剤」等
   - WEAPON: 「炎の剣」「雷の杖」等
   - MAGIC: 「魔力の結晶」「封印の書」等
   - ADVENTURE: 「探索の地図」「冒険者の糧食」等
   - LUXURY: 「黄金の時計」「宝飾品」等

### レシピ（recipes.json内のitems配列への追加）

アイテムはレシピカードの `outputItemId` の参照先となる。
Card Agent が参照できるよう、ID割当表で事前に調整する。

## 素材と採取カードの関連

Card Agent が生成する採取カードの `materialPool` から参照される。
ID割当表に記載された素材IDをそのまま使用し、Card Agent が参照できるようにする。

### 素材の採取場所イメージ

| 採取場所の難易度 | 素材品質 | 属性の傾向 |
|----------------|---------|-----------|
| 簡単（裏庭等） | D | GRASS, WATER |
| 普通（森、平原） | D〜C | 多様 |
| やや難（洞窟、湿地） | C | EARTH, WATER |
| 難しい（火山、氷河） | C〜B | FIRE, WIND |
| 危険（遺跡、深部） | B〜A | 多様 |
| 最高難度（禁域） | A〜S | 希少属性 |

## ランク別生成ガイドライン

| ランク | 素材数 | アイテム数 | テーマ |
|--------|-------|----------|-------|
| G | 5-8 | 3-5 | 基本的な草花、鉱石 |
| F | 5-8 | 3-5 | やや珍しい素材 |
| E | 4-6 | 3-4 | 特殊な環境の素材 |
| D | 4-6 | 3-4 | 希少性のある素材 |
| C | 3-5 | 2-3 | 高品質な素材 |
| B | 3-5 | 2-3 | 非常に珍しい素材 |
| A | 2-3 | 2-3 | 最高級素材 |
| S | 1-2 | 1-2 | 伝説級の素材 |

## 出力先

- `atelier-guild-rank/public/data/materials.json` — 既存配列に追加
- `atelier-guild-rank/public/data/recipes.json` — items配列に追加

## 禁止事項

- ID割当表の範囲外のIDを使用しない
- 属性の偏りが極端にならないようにする（各属性最低1つは含む）
- 既存素材・アイテムと同じ名前を使わない
- effects配列を空にしない（最低1つの効果を持つ）
