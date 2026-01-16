# TASK-0003: 共通型定義 テストケース一覧

**バージョン**: 1.0.0
**作成日**: 2026-01-16
**対象**: `src/shared/types/` 配下の型定義

---

## 目次

1. [テスト方針](#1-テスト方針)
2. [common.ts テストケース](#2-commonts-テストケース)
3. [ids.ts テストケース](#3-idsts-テストケース)
4. [cards.ts テストケース](#4-cardsts-テストケース)
5. [materials.ts テストケース](#5-materialsts-テストケース)
6. [quests.ts テストケース](#6-queststs-テストケース)
7. [game-state.ts テストケース](#7-game-statets-テストケース)
8. [events.ts テストケース](#8-eventsts-テストケース)
9. [save-data.ts テストケース](#9-save-datats-テストケース)
10. [errors.ts テストケース](#10-errorsts-テストケース)
11. [utils.ts テストケース](#11-utilsts-テストケース)
12. [constants.ts テストケース](#12-constantsts-テストケース)
13. [index.ts テストケース](#13-indexts-テストケース)

---

## 1. テスト方針

### 1.1 型定義テストの特性

型定義のテストは通常のユニットテストとは異なり、**TypeScriptコンパイラによる型チェック**が主なテスト方法となる。

### 1.2 テストカテゴリ

| カテゴリ | 内容 | 検証方法 |
|---------|------|----------|
| 型存在テスト | 各型がインポート可能か | TypeScriptコンパイル成功 |
| 型安全性テスト | 不正な代入が型エラーになるか | `@ts-expect-error` コメント |
| 型推論テスト | 型ガード使用後の型絞り込み | 型変数への代入確認 |
| ランタイムテスト | エラークラス・定数の動作 | vitest単体テスト |

### 1.3 テストファイル構成

```
src/shared/types/
├── __tests__/
│   ├── common.test.ts       # 列挙型テスト
│   ├── ids.test.ts          # ID型テスト
│   ├── cards.test.ts        # カード型テスト
│   ├── materials.test.ts    # 素材・アイテム型テスト
│   ├── quests.test.ts       # 依頼型テスト
│   ├── game-state.test.ts   # ゲーム状態型テスト
│   ├── events.test.ts       # イベント型テスト
│   ├── save-data.test.ts    # セーブデータ型テスト
│   ├── errors.test.ts       # エラー型テスト
│   ├── utils.test.ts        # ユーティリティ型テスト
│   ├── constants.test.ts    # 定数テスト
│   └── index.test.ts        # エクスポート統合テスト
```

---

## 2. common.ts テストケース

### 2.1 GamePhase列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-001 | GamePhase型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-002 | GamePhase.QUEST_ACCEPTが使用可能 | 値が'QUEST_ACCEPT' | 単体テスト |
| TC-COMMON-003 | GamePhase.GATHERINGが使用可能 | 値が'GATHERING' | 単体テスト |
| TC-COMMON-004 | GamePhase.ALCHEMYが使用可能 | 値が'ALCHEMY' | 単体テスト |
| TC-COMMON-005 | GamePhase.DELIVERYが使用可能 | 値が'DELIVERY' | 単体テスト |
| TC-COMMON-006 | 無効な値の代入が型エラー | コンパイルエラー | @ts-expect-error |

### 2.2 GuildRank列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-007 | GuildRank型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-008 | GuildRank.Gが使用可能 | 値が'G' | 単体テスト |
| TC-COMMON-009 | GuildRank.Fが使用可能 | 値が'F' | 単体テスト |
| TC-COMMON-010 | GuildRank.Eが使用可能 | 値が'E' | 単体テスト |
| TC-COMMON-011 | GuildRank.Dが使用可能 | 値が'D' | 単体テスト |
| TC-COMMON-012 | GuildRank.Cが使用可能 | 値が'C' | 単体テスト |
| TC-COMMON-013 | GuildRank.Bが使用可能 | 値が'B' | 単体テスト |
| TC-COMMON-014 | GuildRank.Aが使用可能 | 値が'A' | 単体テスト |
| TC-COMMON-015 | GuildRank.Sが使用可能 | 値が'S' | 単体テスト |
| TC-COMMON-016 | 全8ランクが存在する | Object.values(GuildRank).length === 8 | 単体テスト |

### 2.3 CardType列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-017 | CardType型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-018 | CardType.GATHERINGが使用可能 | 値が'GATHERING' | 単体テスト |
| TC-COMMON-019 | CardType.RECIPEが使用可能 | 値が'RECIPE' | 単体テスト |
| TC-COMMON-020 | CardType.ENHANCEMENTが使用可能 | 値が'ENHANCEMENT' | 単体テスト |
| TC-COMMON-021 | 全3種類が存在する | Object.values(CardType).length === 3 | 単体テスト |

### 2.4 Quality列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-022 | Quality型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-023 | Quality.Dが使用可能 | 値が'D' | 単体テスト |
| TC-COMMON-024 | Quality.Cが使用可能 | 値が'C' | 単体テスト |
| TC-COMMON-025 | Quality.Bが使用可能 | 値が'B' | 単体テスト |
| TC-COMMON-026 | Quality.Aが使用可能 | 値が'A' | 単体テスト |
| TC-COMMON-027 | Quality.Sが使用可能 | 値が'S' | 単体テスト |
| TC-COMMON-028 | 全5段階が存在する | Object.values(Quality).length === 5 | 単体テスト |

### 2.5 Attribute列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-029 | Attribute型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-030 | Attribute.FIREが使用可能 | 値が'FIRE' | 単体テスト |
| TC-COMMON-031 | Attribute.WATERが使用可能 | 値が'WATER' | 単体テスト |
| TC-COMMON-032 | Attribute.EARTHが使用可能 | 値が'EARTH' | 単体テスト |
| TC-COMMON-033 | Attribute.WINDが使用可能 | 値が'WIND' | 単体テスト |
| TC-COMMON-034 | Attribute.GRASSが使用可能 | 値が'GRASS' | 単体テスト |
| TC-COMMON-035 | 全5属性が存在する | Object.values(Attribute).length === 5 | 単体テスト |

### 2.6 QuestType列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-036 | QuestType型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-037 | QuestType.SPECIFICが使用可能 | 値が'SPECIFIC' | 単体テスト |
| TC-COMMON-038 | QuestType.CATEGORYが使用可能 | 値が'CATEGORY' | 単体テスト |
| TC-COMMON-039 | QuestType.QUALITYが使用可能 | 値が'QUALITY' | 単体テスト |
| TC-COMMON-040 | QuestType.QUANTITYが使用可能 | 値が'QUANTITY' | 単体テスト |
| TC-COMMON-041 | QuestType.ATTRIBUTEが使用可能 | 値が'ATTRIBUTE' | 単体テスト |
| TC-COMMON-042 | QuestType.EFFECTが使用可能 | 値が'EFFECT' | 単体テスト |
| TC-COMMON-043 | QuestType.MATERIALが使用可能 | 値が'MATERIAL' | 単体テスト |
| TC-COMMON-044 | QuestType.COMPOUNDが使用可能 | 値が'COMPOUND' | 単体テスト |
| TC-COMMON-045 | 全8種類が存在する | Object.values(QuestType).length === 8 | 単体テスト |

### 2.7 ClientType列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-046 | ClientType型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-047 | ClientType.VILLAGERが使用可能 | 値が'VILLAGER' | 単体テスト |
| TC-COMMON-048 | ClientType.ADVENTURERが使用可能 | 値が'ADVENTURER' | 単体テスト |
| TC-COMMON-049 | ClientType.MERCHANTが使用可能 | 値が'MERCHANT' | 単体テスト |
| TC-COMMON-050 | ClientType.NOBLEが使用可能 | 値が'NOBLE' | 単体テスト |
| TC-COMMON-051 | ClientType.GUILDが使用可能 | 値が'GUILD' | 単体テスト |
| TC-COMMON-052 | 全5種類が存在する | Object.values(ClientType).length === 5 | 単体テスト |

### 2.8 Rarity列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-053 | Rarity型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-054 | Rarity.COMMONが使用可能 | 値が'COMMON' | 単体テスト |
| TC-COMMON-055 | Rarity.UNCOMMONが使用可能 | 値が'UNCOMMON' | 単体テスト |
| TC-COMMON-056 | Rarity.RAREが使用可能 | 値が'RARE' | 単体テスト |
| TC-COMMON-057 | Rarity.EPICが使用可能 | 値が'EPIC' | 単体テスト |
| TC-COMMON-058 | Rarity.LEGENDARYが使用可能 | 値が'LEGENDARY' | 単体テスト |
| TC-COMMON-059 | 全5段階が存在する | Object.values(Rarity).length === 5 | 単体テスト |

### 2.9 EnhancementTarget列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-060 | EnhancementTarget型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-061 | EnhancementTarget.GATHERINGが使用可能 | 値が'GATHERING' | 単体テスト |
| TC-COMMON-062 | EnhancementTarget.ALCHEMYが使用可能 | 値が'ALCHEMY' | 単体テスト |
| TC-COMMON-063 | EnhancementTarget.DELIVERYが使用可能 | 値が'DELIVERY' | 単体テスト |
| TC-COMMON-064 | EnhancementTarget.ALLが使用可能 | 値が'ALL' | 単体テスト |
| TC-COMMON-065 | 全4種類が存在する | Object.values(EnhancementTarget).length === 4 | 単体テスト |

### 2.10 EffectType列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-066 | EffectType型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-067 | EffectType.QUALITY_UPが使用可能 | 値が'QUALITY_UP' | 単体テスト |
| TC-COMMON-068 | EffectType.MATERIAL_SAVEが使用可能 | 値が'MATERIAL_SAVE' | 単体テスト |
| TC-COMMON-069 | EffectType.GATHERING_BONUSが使用可能 | 値が'GATHERING_BONUS' | 単体テスト |
| TC-COMMON-070 | EffectType.RARE_CHANCE_UPが使用可能 | 値が'RARE_CHANCE_UP' | 単体テスト |
| TC-COMMON-071 | EffectType.GOLD_BONUSが使用可能 | 値が'GOLD_BONUS' | 単体テスト |
| TC-COMMON-072 | EffectType.CONTRIBUTION_BONUSが使用可能 | 値が'CONTRIBUTION_BONUS' | 単体テスト |
| TC-COMMON-073 | EffectType.COST_REDUCTIONが使用可能 | 値が'COST_REDUCTION' | 単体テスト |
| TC-COMMON-074 | EffectType.STORAGE_EXPANSIONが使用可能 | 値が'STORAGE_EXPANSION' | 単体テスト |
| TC-COMMON-075 | EffectType.ACTION_POINT_BONUSが使用可能 | 値が'ACTION_POINT_BONUS' | 単体テスト |
| TC-COMMON-076 | EffectType.ALCHEMY_COST_REDUCTIONが使用可能 | 値が'ALCHEMY_COST_REDUCTION' | 単体テスト |
| TC-COMMON-077 | EffectType.ALL_BONUSが使用可能 | 値が'ALL_BONUS' | 単体テスト |
| TC-COMMON-078 | 全11種類が存在する | Object.values(EffectType).length === 11 | 単体テスト |

### 2.11 ItemCategory列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-079 | ItemCategory型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-080 | ItemCategory.MEDICINEが使用可能 | 値が'MEDICINE' | 単体テスト |
| TC-COMMON-081 | ItemCategory.WEAPONが使用可能 | 値が'WEAPON' | 単体テスト |
| TC-COMMON-082 | ItemCategory.MAGICが使用可能 | 値が'MAGIC' | 単体テスト |
| TC-COMMON-083 | ItemCategory.ADVENTUREが使用可能 | 値が'ADVENTURE' | 単体テスト |
| TC-COMMON-084 | ItemCategory.LUXURYが使用可能 | 値が'LUXURY' | 単体テスト |
| TC-COMMON-085 | 全5種類が存在する | Object.values(ItemCategory).length === 5 | 単体テスト |

### 2.12 ItemEffectType列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-086 | ItemEffectType型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-087 | ItemEffectType.HP_RECOVERYが使用可能 | 値が'HP_RECOVERY' | 単体テスト |
| TC-COMMON-088 | ItemEffectType.ATTACK_UPが使用可能 | 値が'ATTACK_UP' | 単体テスト |
| TC-COMMON-089 | ItemEffectType.DEFENSE_UPが使用可能 | 値が'DEFENSE_UP' | 単体テスト |
| TC-COMMON-090 | ItemEffectType.CURE_POISONが使用可能 | 値が'CURE_POISON' | 単体テスト |
| TC-COMMON-091 | ItemEffectType.EXPLOSIONが使用可能 | 値が'EXPLOSION' | 単体テスト |
| TC-COMMON-092 | 全5種類が存在する | Object.values(ItemEffectType).length === 5 | 単体テスト |

### 2.13 SpecialRuleType列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-COMMON-093 | SpecialRuleType型がインポート可能 | コンパイル成功 | 型インポート |
| TC-COMMON-094 | SpecialRuleType.QUEST_LIMITが使用可能 | 値が'QUEST_LIMIT' | 単体テスト |
| TC-COMMON-095 | SpecialRuleType.QUALITY_PENALTYが使用可能 | 値が'QUALITY_PENALTY' | 単体テスト |
| TC-COMMON-096 | SpecialRuleType.DEADLINE_REDUCTIONが使用可能 | 値が'DEADLINE_REDUCTION' | 単体テスト |
| TC-COMMON-097 | SpecialRuleType.QUALITY_REQUIREDが使用可能 | 値が'QUALITY_REQUIRED' | 単体テスト |
| TC-COMMON-098 | 全4種類が存在する | Object.values(SpecialRuleType).length === 4 | 単体テスト |

---

## 3. ids.ts テストケース

### 3.1 ブランド型定義

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-IDS-001 | CardId型がインポート可能 | コンパイル成功 | 型インポート |
| TC-IDS-002 | MaterialId型がインポート可能 | コンパイル成功 | 型インポート |
| TC-IDS-003 | ItemId型がインポート可能 | コンパイル成功 | 型インポート |
| TC-IDS-004 | QuestId型がインポート可能 | コンパイル成功 | 型インポート |
| TC-IDS-005 | ArtifactId型がインポート可能 | コンパイル成功 | 型インポート |
| TC-IDS-006 | ClientId型がインポート可能 | コンパイル成功 | 型インポート |
| TC-IDS-007 | RecipeId型がインポート可能 | コンパイル成功 | 型インポート |

### 3.2 ID型の型安全性

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-IDS-008 | CardIdにMaterialIdを代入できない | コンパイルエラー | @ts-expect-error |
| TC-IDS-009 | MaterialIdにCardIdを代入できない | コンパイルエラー | @ts-expect-error |
| TC-IDS-010 | ItemIdにQuestIdを代入できない | コンパイルエラー | @ts-expect-error |
| TC-IDS-011 | QuestIdにItemIdを代入できない | コンパイルエラー | @ts-expect-error |
| TC-IDS-012 | ArtifactIdにClientIdを代入できない | コンパイルエラー | @ts-expect-error |
| TC-IDS-013 | ClientIdにArtifactIdを代入できない | コンパイルエラー | @ts-expect-error |
| TC-IDS-014 | RecipeIdにCardIdを代入できない | コンパイルエラー | @ts-expect-error |
| TC-IDS-015 | 生の文字列をCardIdに代入できない | コンパイルエラー | @ts-expect-error |

### 3.3 ID変換関数

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-IDS-016 | toCardId関数が存在する | 関数がインポート可能 | 型インポート |
| TC-IDS-017 | toCardId('card-001')がCardId型を返す | 戻り値がCardId型 | 型テスト |
| TC-IDS-018 | toCardIdが入力値をそのまま返す | 'card-001' === toCardId('card-001') | 単体テスト |
| TC-IDS-019 | toMaterialId関数が存在する | 関数がインポート可能 | 型インポート |
| TC-IDS-020 | toMaterialId('mat-001')がMaterialId型を返す | 戻り値がMaterialId型 | 型テスト |
| TC-IDS-021 | toMaterialIdが入力値をそのまま返す | 'mat-001' === toMaterialId('mat-001') | 単体テスト |
| TC-IDS-022 | toItemId関数が存在する | 関数がインポート可能 | 型インポート |
| TC-IDS-023 | toItemIdが入力値をそのまま返す | 'item-001' === toItemId('item-001') | 単体テスト |
| TC-IDS-024 | toQuestId関数が存在する | 関数がインポート可能 | 型インポート |
| TC-IDS-025 | toQuestIdが入力値をそのまま返す | 'quest-001' === toQuestId('quest-001') | 単体テスト |
| TC-IDS-026 | toArtifactId関数が存在する | 関数がインポート可能 | 型インポート |
| TC-IDS-027 | toArtifactIdが入力値をそのまま返す | 'artifact-001' === toArtifactId('artifact-001') | 単体テスト |
| TC-IDS-028 | toClientId関数が存在する | 関数がインポート可能 | 型インポート |
| TC-IDS-029 | toClientIdが入力値をそのまま返す | 'client-001' === toClientId('client-001') | 単体テスト |
| TC-IDS-030 | toRecipeId関数が存在する | 関数がインポート可能 | 型インポート |
| TC-IDS-031 | toRecipeIdが入力値をそのまま返す | 'recipe-001' === toRecipeId('recipe-001') | 単体テスト |

---

## 4. cards.ts テストケース

### 4.1 ICardインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CARDS-001 | ICard型がインポート可能 | コンパイル成功 | 型インポート |
| TC-CARDS-002 | ICardにid, name, type, rarity, unlockRankが必須 | 必須プロパティなしで型エラー | @ts-expect-error |
| TC-CARDS-003 | ICard.descriptionがオプショナル | undefined許容 | 型テスト |
| TC-CARDS-004 | ICard.typeがCardType型 | 不正な値で型エラー | @ts-expect-error |
| TC-CARDS-005 | ICard.rarityがRarity型 | 不正な値で型エラー | @ts-expect-error |
| TC-CARDS-006 | ICard.unlockRankがGuildRank型 | 不正な値で型エラー | @ts-expect-error |

### 4.2 IGatheringCardインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CARDS-007 | IGatheringCard型がインポート可能 | コンパイル成功 | 型インポート |
| TC-CARDS-008 | IGatheringCardがICardを拡張している | 基底プロパティがアクセス可能 | 型テスト |
| TC-CARDS-009 | IGatheringCard.typeがCardType.GATHERINGに限定 | 他の値で型エラー | @ts-expect-error |
| TC-CARDS-010 | IGatheringCard.costがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-CARDS-011 | IGatheringCard.materialsがIGatheringMaterial[]型 | 配列以外で型エラー | @ts-expect-error |

### 4.3 IGatheringMaterialインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CARDS-012 | IGatheringMaterial型がインポート可能 | コンパイル成功 | 型インポート |
| TC-CARDS-013 | IGatheringMaterial.materialIdが必須 | undefined不可 | @ts-expect-error |
| TC-CARDS-014 | IGatheringMaterial.quantityが必須 | undefined不可 | @ts-expect-error |
| TC-CARDS-015 | IGatheringMaterial.probabilityが必須 | undefined不可 | @ts-expect-error |
| TC-CARDS-016 | IGatheringMaterial.qualityがオプショナル | undefined許容 | 型テスト |

### 4.4 IRecipeCardインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CARDS-017 | IRecipeCard型がインポート可能 | コンパイル成功 | 型インポート |
| TC-CARDS-018 | IRecipeCardがICardを拡張している | 基底プロパティがアクセス可能 | 型テスト |
| TC-CARDS-019 | IRecipeCard.typeがCardType.RECIPEに限定 | 他の値で型エラー | @ts-expect-error |
| TC-CARDS-020 | IRecipeCard.costがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-CARDS-021 | IRecipeCard.requiredMaterialsがIRequiredMaterial[]型 | 型違いで型エラー | @ts-expect-error |
| TC-CARDS-022 | IRecipeCard.outputItemIdがstring型 | 数値で型エラー | @ts-expect-error |
| TC-CARDS-023 | IRecipeCard.categoryがItemCategory型 | 不正な値で型エラー | @ts-expect-error |

### 4.5 IRequiredMaterialインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CARDS-024 | IRequiredMaterial型がインポート可能 | コンパイル成功 | 型インポート |
| TC-CARDS-025 | IRequiredMaterial.materialIdが必須 | undefined不可 | @ts-expect-error |
| TC-CARDS-026 | IRequiredMaterial.quantityが必須 | undefined不可 | @ts-expect-error |
| TC-CARDS-027 | IRequiredMaterial.minQualityがオプショナル | undefined許容 | 型テスト |

### 4.6 IEnhancementCardインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CARDS-028 | IEnhancementCard型がインポート可能 | コンパイル成功 | 型インポート |
| TC-CARDS-029 | IEnhancementCardがICardを拡張している | 基底プロパティがアクセス可能 | 型テスト |
| TC-CARDS-030 | IEnhancementCard.typeがCardType.ENHANCEMENTに限定 | 他の値で型エラー | @ts-expect-error |
| TC-CARDS-031 | IEnhancementCard.costが0リテラル型 | 1で型エラー | @ts-expect-error |
| TC-CARDS-032 | IEnhancementCard.effectがICardEffect型 | 型違いで型エラー | @ts-expect-error |
| TC-CARDS-033 | IEnhancementCard.targetActionがEnhancementTarget型 | 不正な値で型エラー | @ts-expect-error |

### 4.7 ICardEffectインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CARDS-034 | ICardEffect型がインポート可能 | コンパイル成功 | 型インポート |
| TC-CARDS-035 | ICardEffect.typeがEffectType型 | 不正な値で型エラー | @ts-expect-error |
| TC-CARDS-036 | ICardEffect.valueがnumber型 | 文字列で型エラー | @ts-expect-error |

### 4.8 Cardユニオン型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CARDS-037 | Card型がインポート可能 | コンパイル成功 | 型インポート |
| TC-CARDS-038 | IGatheringCardがCard型に代入可能 | コンパイル成功 | 型テスト |
| TC-CARDS-039 | IRecipeCardがCard型に代入可能 | コンパイル成功 | 型テスト |
| TC-CARDS-040 | IEnhancementCardがCard型に代入可能 | コンパイル成功 | 型テスト |
| TC-CARDS-041 | Card.typeで型絞り込みが可能 | ナローイング動作 | 型テスト |

### 4.9 型ガード関数

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CARDS-042 | isGatheringCard関数が存在する | 関数がインポート可能 | 型インポート |
| TC-CARDS-043 | isGatheringCardがtrue時にIGatheringCardに絞り込み | 型絞り込み動作 | 型テスト |
| TC-CARDS-044 | isRecipeCard関数が存在する | 関数がインポート可能 | 型インポート |
| TC-CARDS-045 | isRecipeCardがtrue時にIRecipeCardに絞り込み | 型絞り込み動作 | 型テスト |
| TC-CARDS-046 | isEnhancementCard関数が存在する | 関数がインポート可能 | 型インポート |
| TC-CARDS-047 | isEnhancementCardがtrue時にIEnhancementCardに絞り込み | 型絞り込み動作 | 型テスト |

---

## 5. materials.ts テストケース

### 5.1 IMaterialインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-MAT-001 | IMaterial型がインポート可能 | コンパイル成功 | 型インポート |
| TC-MAT-002 | IMaterial.idが必須でstring型 | undefined/数値で型エラー | @ts-expect-error |
| TC-MAT-003 | IMaterial.nameが必須でstring型 | undefined/数値で型エラー | @ts-expect-error |
| TC-MAT-004 | IMaterial.baseQualityがQuality型 | 不正な値で型エラー | @ts-expect-error |
| TC-MAT-005 | IMaterial.attributesがAttribute[]型 | 型違いで型エラー | @ts-expect-error |
| TC-MAT-006 | IMaterial.descriptionがオプショナル | undefined許容 | 型テスト |

### 5.2 IMaterialInstanceインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-MAT-007 | IMaterialInstance型がインポート可能 | コンパイル成功 | 型インポート |
| TC-MAT-008 | IMaterialInstance.materialIdが必須 | undefined不可 | @ts-expect-error |
| TC-MAT-009 | IMaterialInstance.qualityがQuality型 | 不正な値で型エラー | @ts-expect-error |
| TC-MAT-010 | IMaterialInstance.quantityがnumber型 | 文字列で型エラー | @ts-expect-error |

### 5.3 IItemインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-MAT-011 | IItem型がインポート可能 | コンパイル成功 | 型インポート |
| TC-MAT-012 | IItem.idが必須でstring型 | undefined/数値で型エラー | @ts-expect-error |
| TC-MAT-013 | IItem.nameが必須でstring型 | undefined/数値で型エラー | @ts-expect-error |
| TC-MAT-014 | IItem.categoryがItemCategory型 | 不正な値で型エラー | @ts-expect-error |
| TC-MAT-015 | IItem.effectsがIItemEffect[]型 | 型違いで型エラー | @ts-expect-error |
| TC-MAT-016 | IItem.descriptionがオプショナル | undefined許容 | 型テスト |

### 5.4 IItemEffectインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-MAT-017 | IItemEffect型がインポート可能 | コンパイル成功 | 型インポート |
| TC-MAT-018 | IItemEffect.typeがItemEffectType型 | 不正な値で型エラー | @ts-expect-error |
| TC-MAT-019 | IItemEffect.baseValueがnumber型 | 文字列で型エラー | @ts-expect-error |

### 5.5 ICraftedItemインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-MAT-020 | ICraftedItem型がインポート可能 | コンパイル成功 | 型インポート |
| TC-MAT-021 | ICraftedItem.itemIdが必須でstring型 | undefined不可 | @ts-expect-error |
| TC-MAT-022 | ICraftedItem.qualityがQuality型 | 不正な値で型エラー | @ts-expect-error |
| TC-MAT-023 | ICraftedItem.attributeValuesがIAttributeValue[]型 | 型違いで型エラー | @ts-expect-error |
| TC-MAT-024 | ICraftedItem.effectValuesがIEffectValue[]型 | 型違いで型エラー | @ts-expect-error |
| TC-MAT-025 | ICraftedItem.usedMaterialsがIUsedMaterial[]型 | 型違いで型エラー | @ts-expect-error |

### 5.6 IAttributeValue, IEffectValue, IUsedMaterialインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-MAT-026 | IAttributeValue型がインポート可能 | コンパイル成功 | 型インポート |
| TC-MAT-027 | IAttributeValue.attributeがAttribute型 | 不正な値で型エラー | @ts-expect-error |
| TC-MAT-028 | IAttributeValue.valueがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-MAT-029 | IEffectValue型がインポート可能 | コンパイル成功 | 型インポート |
| TC-MAT-030 | IEffectValue.typeがItemEffectType型 | 不正な値で型エラー | @ts-expect-error |
| TC-MAT-031 | IEffectValue.valueがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-MAT-032 | IUsedMaterial型がインポート可能 | コンパイル成功 | 型インポート |
| TC-MAT-033 | IUsedMaterial.isRareがboolean型 | 文字列で型エラー | @ts-expect-error |

---

## 6. quests.ts テストケース

### 6.1 IClientインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-QUEST-001 | IClient型がインポート可能 | コンパイル成功 | 型インポート |
| TC-QUEST-002 | IClient.idが必須でstring型 | undefined不可 | @ts-expect-error |
| TC-QUEST-003 | IClient.typeがClientType型 | 不正な値で型エラー | @ts-expect-error |
| TC-QUEST-004 | IClient.contributionMultiplierがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-QUEST-005 | IClient.goldMultiplierがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-QUEST-006 | IClient.deadlineModifierがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-QUEST-007 | IClient.preferredQuestTypesがQuestType[]型 | 型違いで型エラー | @ts-expect-error |
| TC-QUEST-008 | IClient.unlockRankがGuildRank型 | 不正な値で型エラー | @ts-expect-error |
| TC-QUEST-009 | IClient.dialoguePatternsがオプショナル | undefined許容 | 型テスト |

### 6.2 IQuestConditionインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-QUEST-010 | IQuestCondition型がインポート可能 | コンパイル成功 | 型インポート |
| TC-QUEST-011 | IQuestCondition.typeが必須でQuestType型 | undefined/不正値で型エラー | @ts-expect-error |
| TC-QUEST-012 | IQuestCondition.itemIdがオプショナル | undefined許容 | 型テスト |
| TC-QUEST-013 | IQuestCondition.categoryがオプショナルでItemCategory型 | undefined許容、不正値で型エラー | 型テスト |
| TC-QUEST-014 | IQuestCondition.minQualityがオプショナルでQuality型 | undefined許容、不正値で型エラー | 型テスト |
| TC-QUEST-015 | IQuestCondition.quantityがオプショナルでnumber型 | undefined許容、文字列で型エラー | 型テスト |
| TC-QUEST-016 | IQuestCondition.subConditionsが再帰的にIQuestCondition[]型 | 再帰型動作 | 型テスト |

### 6.3 IQuestインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-QUEST-017 | IQuest型がインポート可能 | コンパイル成功 | 型インポート |
| TC-QUEST-018 | IQuest.idが必須でstring型 | undefined不可 | @ts-expect-error |
| TC-QUEST-019 | IQuest.clientIdが必須でstring型 | undefined不可 | @ts-expect-error |
| TC-QUEST-020 | IQuest.conditionがIQuestCondition型 | 型違いで型エラー | @ts-expect-error |
| TC-QUEST-021 | IQuest.contributionがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-QUEST-022 | IQuest.goldがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-QUEST-023 | IQuest.deadlineがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-QUEST-024 | IQuest.difficultyが'easy'|'normal'|'hard'|'extreme'型 | 不正な値で型エラー | @ts-expect-error |
| TC-QUEST-025 | IQuest.flavorTextがstring型 | 数値で型エラー | @ts-expect-error |

### 6.4 IActiveQuestインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-QUEST-026 | IActiveQuest型がインポート可能 | コンパイル成功 | 型インポート |
| TC-QUEST-027 | IActiveQuest.questがIQuest型 | 型違いで型エラー | @ts-expect-error |
| TC-QUEST-028 | IActiveQuest.remainingDaysがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-QUEST-029 | IActiveQuest.acceptedDayがnumber型 | 文字列で型エラー | @ts-expect-error |

---

## 7. game-state.ts テストケース

### 7.1 IGameStateインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-STATE-001 | IGameState型がインポート可能 | コンパイル成功 | 型インポート |
| TC-STATE-002 | IGameState.currentRankがGuildRank型 | 不正な値で型エラー | @ts-expect-error |
| TC-STATE-003 | IGameState.rankHpがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-STATE-004 | IGameState.remainingDaysがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-STATE-005 | IGameState.currentDayがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-STATE-006 | IGameState.currentPhaseがGamePhase型 | 不正な値で型エラー | @ts-expect-error |
| TC-STATE-007 | IGameState.goldがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-STATE-008 | IGameState.comboCountがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-STATE-009 | IGameState.actionPointsがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-STATE-010 | IGameState.isPromotionTestがboolean型 | 文字列で型エラー | @ts-expect-error |
| TC-STATE-011 | IGameState.promotionTestRemainingDaysがオプショナルでnumber型 | undefined許容 | 型テスト |

### 7.2 IDeckStateインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-STATE-012 | IDeckState型がインポート可能 | コンパイル成功 | 型インポート |
| TC-STATE-013 | IDeckState.deckがstring[]型 | 型違いで型エラー | @ts-expect-error |
| TC-STATE-014 | IDeckState.handがstring[]型 | 型違いで型エラー | @ts-expect-error |
| TC-STATE-015 | IDeckState.discardがstring[]型 | 型違いで型エラー | @ts-expect-error |
| TC-STATE-016 | IDeckState.ownedCardsがstring[]型 | 型違いで型エラー | @ts-expect-error |

### 7.3 IInventoryStateインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-STATE-017 | IInventoryState型がインポート可能 | コンパイル成功 | 型インポート |
| TC-STATE-018 | IInventoryState.materialsがIMaterialInstance[]型 | 型違いで型エラー | @ts-expect-error |
| TC-STATE-019 | IInventoryState.craftedItemsがICraftedItem[]型 | 型違いで型エラー | @ts-expect-error |
| TC-STATE-020 | IInventoryState.storageLimitがnumber型 | 文字列で型エラー | @ts-expect-error |

### 7.4 IQuestStateインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-STATE-021 | IQuestState型がインポート可能 | コンパイル成功 | 型インポート |
| TC-STATE-022 | IQuestState.activeQuestsがIActiveQuest[]型 | 型違いで型エラー | @ts-expect-error |
| TC-STATE-023 | IQuestState.todayClientsがstring[]型 | 型違いで型エラー | @ts-expect-error |
| TC-STATE-024 | IQuestState.todayQuestsがIQuest[]型 | 型違いで型エラー | @ts-expect-error |
| TC-STATE-025 | IQuestState.questLimitがnumber型 | 文字列で型エラー | @ts-expect-error |

---

## 8. events.ts テストケース

### 8.1 GameEventType列挙型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-EVT-001 | GameEventType型がインポート可能 | コンパイル成功 | 型インポート |
| TC-EVT-002 | GameEventType.PHASE_CHANGEDが使用可能 | 値が'PHASE_CHANGED' | 単体テスト |
| TC-EVT-003 | GameEventType.DAY_ENDEDが使用可能 | 値が'DAY_ENDED' | 単体テスト |
| TC-EVT-004 | GameEventType.DAY_STARTEDが使用可能 | 値が'DAY_STARTED' | 単体テスト |
| TC-EVT-005 | GameEventType.QUEST_ACCEPTEDが使用可能 | 値が'QUEST_ACCEPTED' | 単体テスト |
| TC-EVT-006 | GameEventType.QUEST_COMPLETEDが使用可能 | 値が'QUEST_COMPLETED' | 単体テスト |
| TC-EVT-007 | GameEventType.QUEST_FAILEDが使用可能 | 値が'QUEST_FAILED' | 単体テスト |
| TC-EVT-008 | GameEventType.GATHERING_COMPLETEDが使用可能 | 値が'GATHERING_COMPLETED' | 単体テスト |
| TC-EVT-009 | GameEventType.ALCHEMY_COMPLETEDが使用可能 | 値が'ALCHEMY_COMPLETED' | 単体テスト |
| TC-EVT-010 | GameEventType.RANK_DAMAGEDが使用可能 | 値が'RANK_DAMAGED' | 単体テスト |
| TC-EVT-011 | GameEventType.RANK_UPが使用可能 | 値が'RANK_UP' | 単体テスト |
| TC-EVT-012 | GameEventType.GAME_OVERが使用可能 | 値が'GAME_OVER' | 単体テスト |
| TC-EVT-013 | GameEventType.GAME_CLEAREDが使用可能 | 値が'GAME_CLEARED' | 単体テスト |

### 8.2 IGameEventインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-EVT-014 | IGameEvent型がインポート可能 | コンパイル成功 | 型インポート |
| TC-EVT-015 | IGameEvent.typeがGameEventType型 | 不正な値で型エラー | @ts-expect-error |
| TC-EVT-016 | IGameEvent.timestampがnumber型 | 文字列で型エラー | @ts-expect-error |

### 8.3 IPhaseChangedEventインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-EVT-017 | IPhaseChangedEvent型がインポート可能 | コンパイル成功 | 型インポート |
| TC-EVT-018 | IPhaseChangedEventがIGameEventを拡張 | 基底プロパティアクセス可能 | 型テスト |
| TC-EVT-019 | IPhaseChangedEvent.typeがGameEventType.PHASE_CHANGEDに限定 | 他の値で型エラー | @ts-expect-error |
| TC-EVT-020 | IPhaseChangedEvent.previousPhaseがGamePhase型 | 不正な値で型エラー | @ts-expect-error |
| TC-EVT-021 | IPhaseChangedEvent.newPhaseがGamePhase型 | 不正な値で型エラー | @ts-expect-error |

### 8.4 IQuestCompletedEventインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-EVT-022 | IQuestCompletedEvent型がインポート可能 | コンパイル成功 | 型インポート |
| TC-EVT-023 | IQuestCompletedEvent.typeがGameEventType.QUEST_COMPLETEDに限定 | 他の値で型エラー | @ts-expect-error |
| TC-EVT-024 | IQuestCompletedEvent.questがIQuest型 | 型違いで型エラー | @ts-expect-error |
| TC-EVT-025 | IQuestCompletedEvent.deliveredItemがICraftedItem型 | 型違いで型エラー | @ts-expect-error |

### 8.5 IGatheringCompletedEvent, IAlchemyCompletedEventインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-EVT-026 | IGatheringCompletedEvent型がインポート可能 | コンパイル成功 | 型インポート |
| TC-EVT-027 | IGatheringCompletedEvent.obtainedMaterialsがIMaterialInstance[]型 | 型違いで型エラー | @ts-expect-error |
| TC-EVT-028 | IAlchemyCompletedEvent型がインポート可能 | コンパイル成功 | 型インポート |
| TC-EVT-029 | IAlchemyCompletedEvent.craftedItemがICraftedItem型 | 型違いで型エラー | @ts-expect-error |

### 8.6 IRankDamagedEvent, IRankUpEventインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-EVT-030 | IRankDamagedEvent型がインポート可能 | コンパイル成功 | 型インポート |
| TC-EVT-031 | IRankDamagedEvent.damageがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-EVT-032 | IRankUpEvent型がインポート可能 | コンパイル成功 | 型インポート |
| TC-EVT-033 | IRankUpEvent.previousRankがGuildRank型 | 不正な値で型エラー | @ts-expect-error |
| TC-EVT-034 | IRankUpEvent.newRankがGuildRank型 | 不正な値で型エラー | @ts-expect-error |

### 8.7 IGameOverEvent, IGameClearedEventインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-EVT-035 | IGameOverEvent型がインポート可能 | コンパイル成功 | 型インポート |
| TC-EVT-036 | IGameOverEvent.reasonが'day_limit_exceeded'型 | 不正な値で型エラー | @ts-expect-error |
| TC-EVT-037 | IGameOverEvent.finalRankがGuildRank型 | 不正な値で型エラー | @ts-expect-error |
| TC-EVT-038 | IGameClearedEvent型がインポート可能 | コンパイル成功 | 型インポート |
| TC-EVT-039 | IGameClearedEvent.totalDaysがnumber型 | 文字列で型エラー | @ts-expect-error |
| TC-EVT-040 | IGameClearedEvent.finalScoreがnumber型 | 文字列で型エラー | @ts-expect-error |

---

## 9. save-data.ts テストケース

### 9.1 ISaveDataインターフェース

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-SAVE-001 | ISaveData型がインポート可能 | コンパイル成功 | 型インポート |
| TC-SAVE-002 | ISaveData.versionがstring型 | 数値で型エラー | @ts-expect-error |
| TC-SAVE-003 | ISaveData.lastSavedがstring型 | 数値で型エラー | @ts-expect-error |
| TC-SAVE-004 | ISaveData.gameStateがIGameState型 | 型違いで型エラー | @ts-expect-error |
| TC-SAVE-005 | ISaveData.deckStateがIDeckState型 | 型違いで型エラー | @ts-expect-error |
| TC-SAVE-006 | ISaveData.inventoryStateがIInventoryState型 | 型違いで型エラー | @ts-expect-error |
| TC-SAVE-007 | ISaveData.questStateがIQuestState型 | 型違いで型エラー | @ts-expect-error |
| TC-SAVE-008 | ISaveData.artifactsがstring[]型 | 型違いで型エラー | @ts-expect-error |

---

## 10. errors.ts テストケース

### 10.1 DomainErrorクラス

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-ERR-001 | DomainErrorクラスがインポート可能 | コンパイル成功 | 型インポート |
| TC-ERR-002 | DomainErrorがErrorを継承している | instanceof Error === true | 単体テスト |
| TC-ERR-003 | DomainError.codeプロパティがアクセス可能 | プロパティ取得可能 | 単体テスト |
| TC-ERR-004 | DomainError.messageプロパティがアクセス可能 | プロパティ取得可能 | 単体テスト |
| TC-ERR-005 | DomainError.detailsプロパティがアクセス可能 | プロパティ取得可能 | 単体テスト |
| TC-ERR-006 | new DomainError('CODE', 'message')でインスタンス生成可能 | インスタンス生成成功 | 単体テスト |
| TC-ERR-007 | new DomainError('CODE', 'message', {detail: 'value'})でdetails付きインスタンス生成可能 | details取得可能 | 単体テスト |

### 10.2 ApplicationErrorクラス

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-ERR-008 | ApplicationErrorクラスがインポート可能 | コンパイル成功 | 型インポート |
| TC-ERR-009 | ApplicationErrorがErrorを継承している | instanceof Error === true | 単体テスト |
| TC-ERR-010 | ApplicationError.userMessageプロパティがアクセス可能 | プロパティ取得可能 | 単体テスト |
| TC-ERR-011 | ApplicationError.originalErrorプロパティがアクセス可能 | プロパティ取得可能 | 単体テスト |
| TC-ERR-012 | new ApplicationError('userMessage')でインスタンス生成可能 | インスタンス生成成功 | 単体テスト |
| TC-ERR-013 | new ApplicationError('userMessage', originalError)でoriginalError付きインスタンス生成可能 | originalError取得可能 | 単体テスト |

### 10.3 ErrorCodes定数

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-ERR-014 | ErrorCodes定数がインポート可能 | コンパイル成功 | 型インポート |
| TC-ERR-015 | ErrorCodes.DECK_EMPTYが存在する | 値が取得可能 | 単体テスト |
| TC-ERR-016 | ErrorCodes.CARD_NOT_IN_HANDが存在する | 値が取得可能 | 単体テスト |
| TC-ERR-017 | ErrorCodes.INSUFFICIENT_ACTION_POINTSが存在する | 値が取得可能 | 単体テスト |
| TC-ERR-018 | ErrorCodes.INSUFFICIENT_MATERIALSが存在する | 値が取得可能 | 単体テスト |
| TC-ERR-019 | ErrorCodes.QUEST_NOT_FOUNDが存在する | 値が取得可能 | 単体テスト |
| TC-ERR-020 | ErrorCodes.INSUFFICIENT_GOLDが存在する | 値が取得可能 | 単体テスト |
| TC-ERR-021 | ErrorCodes.SAVE_FAILEDが存在する | 値が取得可能 | 単体テスト |
| TC-ERR-022 | ErrorCodes.INVALID_PHASE_TRANSITIONが存在する | 値が取得可能 | 単体テスト |

### 10.4 ErrorCode型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-ERR-023 | ErrorCode型がインポート可能 | コンパイル成功 | 型インポート |
| TC-ERR-024 | ErrorCodesの値がErrorCode型に代入可能 | コンパイル成功 | 型テスト |
| TC-ERR-025 | 任意の文字列がErrorCode型に代入できない | コンパイルエラー | @ts-expect-error |

---

## 11. utils.ts テストケース

### 11.1 DeepReadonly<T>型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-UTIL-001 | DeepReadonly型がインポート可能 | コンパイル成功 | 型インポート |
| TC-UTIL-002 | DeepReadonly<{a: string}>の.aが変更不可 | 代入で型エラー | @ts-expect-error |
| TC-UTIL-003 | DeepReadonly<{nested: {b: number}}>の.nested.bが変更不可 | 代入で型エラー | @ts-expect-error |
| TC-UTIL-004 | DeepReadonly<{arr: string[]}>の配列操作が不可 | push等で型エラー | @ts-expect-error |
| TC-UTIL-005 | DeepReadonlyのネストされたオブジェクトも読み取り専用 | 深いネストでも型エラー | @ts-expect-error |

### 11.2 RequiredFields<T, K>型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-UTIL-006 | RequiredFields型がインポート可能 | コンパイル成功 | 型インポート |
| TC-UTIL-007 | RequiredFields<{a?: string, b?: number}, 'a'>の.aが必須になる | undefined代入で型エラー | @ts-expect-error |
| TC-UTIL-008 | RequiredFields<{a?: string, b?: number}, 'a'>の.bはオプショナルのまま | undefined許容 | 型テスト |
| TC-UTIL-009 | 複数キー指定で複数フィールドが必須になる | 指定キーが必須 | 型テスト |

### 11.3 NonNullableFields<T>型

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-UTIL-010 | NonNullableFields型がインポート可能 | コンパイル成功 | 型インポート |
| TC-UTIL-011 | NonNullableFields<{a: string | null}>の.aがnull不可 | null代入で型エラー | @ts-expect-error |
| TC-UTIL-012 | NonNullableFields<{a: string | undefined}>の.aがundefined不可 | undefined代入で型エラー | @ts-expect-error |
| TC-UTIL-013 | 全フィールドからnull|undefinedが除外される | 全フィールドで型エラー | @ts-expect-error |

---

## 12. constants.ts テストケース

### 12.1 QualityValue定数

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CONST-001 | QualityValue定数がインポート可能 | コンパイル成功 | 型インポート |
| TC-CONST-002 | QualityValue[Quality.D] === 1 | 値が1 | 単体テスト |
| TC-CONST-003 | QualityValue[Quality.C] === 2 | 値が2 | 単体テスト |
| TC-CONST-004 | QualityValue[Quality.B] === 3 | 値が3 | 単体テスト |
| TC-CONST-005 | QualityValue[Quality.A] === 4 | 値が4 | 単体テスト |
| TC-CONST-006 | QualityValue[Quality.S] === 5 | 値が5 | 単体テスト |

### 12.2 QualityMultiplier定数

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CONST-007 | QualityMultiplier定数がインポート可能 | コンパイル成功 | 型インポート |
| TC-CONST-008 | QualityMultiplier[Quality.D] === 0.5 | 値が0.5 | 単体テスト |
| TC-CONST-009 | QualityMultiplier[Quality.C] === 1.0 | 値が1.0 | 単体テスト |
| TC-CONST-010 | QualityMultiplier[Quality.B] === 1.5 | 値が1.5 | 単体テスト |
| TC-CONST-011 | QualityMultiplier[Quality.A] === 2.0 | 値が2.0 | 単体テスト |
| TC-CONST-012 | QualityMultiplier[Quality.S] === 3.0 | 値が3.0 | 単体テスト |

### 12.3 RankOrder定数

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CONST-013 | RankOrder定数がインポート可能 | コンパイル成功 | 型インポート |
| TC-CONST-014 | RankOrder[GuildRank.G] === 0 | 値が0 | 単体テスト |
| TC-CONST-015 | RankOrder[GuildRank.F] === 1 | 値が1 | 単体テスト |
| TC-CONST-016 | RankOrder[GuildRank.E] === 2 | 値が2 | 単体テスト |
| TC-CONST-017 | RankOrder[GuildRank.D] === 3 | 値が3 | 単体テスト |
| TC-CONST-018 | RankOrder[GuildRank.C] === 4 | 値が4 | 単体テスト |
| TC-CONST-019 | RankOrder[GuildRank.B] === 5 | 値が5 | 単体テスト |
| TC-CONST-020 | RankOrder[GuildRank.A] === 6 | 値が6 | 単体テスト |
| TC-CONST-021 | RankOrder[GuildRank.S] === 7 | 値が7 | 単体テスト |
| TC-CONST-022 | GからSへ昇順になっている | 順序が正しい | 単体テスト |

### 12.4 InitialParameters定数

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-CONST-023 | InitialParameters定数がインポート可能 | コンパイル成功 | 型インポート |
| TC-CONST-024 | InitialParameters.INITIAL_DECK_SIZE === 15 | 値が15 | 単体テスト |
| TC-CONST-025 | InitialParameters.DECK_LIMIT === 30 | 値が30 | 単体テスト |
| TC-CONST-026 | InitialParameters.HAND_LIMIT === 7 | 値が7 | 単体テスト |
| TC-CONST-027 | InitialParameters.ACTION_POINTS_PER_DAY === 3 | 値が3 | 単体テスト |
| TC-CONST-028 | InitialParameters.INITIAL_GOLD === 100 | 値が100 | 単体テスト |
| TC-CONST-029 | InitialParameters.INITIAL_STORAGE_LIMIT === 20 | 値が20 | 単体テスト |
| TC-CONST-030 | InitialParameters.MAX_ACTIVE_QUESTS === 3 | 値が3 | 単体テスト |
| TC-CONST-031 | InitialParameters.HAND_REFILL_COUNT === 5 | 値が5 | 単体テスト |
| TC-CONST-032 | InitialParametersがas constで読み取り専用 | 変更で型エラー | @ts-expect-error |

---

## 13. index.ts テストケース

### 13.1 エクスポート確認

| TC-ID | テストケース | 期待結果 | 検証方法 |
|-------|-------------|---------|----------|
| TC-IDX-001 | @shared/typesからすべての列挙型がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-002 | @shared/typesからすべてのID型がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-003 | @shared/typesからすべてのカード型がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-004 | @shared/typesからすべての素材・アイテム型がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-005 | @shared/typesからすべての依頼型がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-006 | @shared/typesからすべてのゲーム状態型がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-007 | @shared/typesからすべてのイベント型がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-008 | @shared/typesからすべてのセーブデータ型がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-009 | @shared/typesからすべてのエラー型がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-010 | @shared/typesからすべてのユーティリティ型がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-011 | @shared/typesからすべての定数がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-012 | @shared/typesからすべてのID変換関数がインポート可能 | コンパイル成功 | 統合インポート |
| TC-IDX-013 | @shared/typesからすべての型ガード関数がインポート可能 | コンパイル成功 | 統合インポート |

---

## 付録

### A. テストケース総数

| カテゴリ | テストケース数 |
|---------|---------------|
| common.ts | 98 |
| ids.ts | 31 |
| cards.ts | 47 |
| materials.ts | 33 |
| quests.ts | 29 |
| game-state.ts | 25 |
| events.ts | 40 |
| save-data.ts | 8 |
| errors.ts | 25 |
| utils.ts | 13 |
| constants.ts | 32 |
| index.ts | 13 |
| **合計** | **394** |

### B. 検証方法凡例

| 検証方法 | 説明 |
|---------|------|
| 型インポート | TypeScriptコンパイラによる型定義の存在確認 |
| 単体テスト | vitest による実行時テスト |
| @ts-expect-error | TypeScriptコンパイラエラーを期待するテスト |
| 型テスト | 型変数への代入による型互換性確認 |
| 統合インポート | パスエイリアス経由でのインポート確認 |

### C. 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|----------|---------|--------|
| 2026-01-16 | 1.0.0 | 初版作成 | ずんだもん |
