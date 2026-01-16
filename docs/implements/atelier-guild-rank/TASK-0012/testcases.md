# TASK-0012: アイテムエンティティ・AlchemyService実装 - テストケース一覧

**バージョン**: 1.0.0
**作成日**: 2026-01-17
**タスクID**: TASK-0012
**要件名**: atelier-guild-rank

---

## 1. 概要

本文書はTASK-0012「アイテムエンティティ・AlchemyService実装」のTDD開発に必要なテストケースを定義する。

### 1.1 信頼性レベル

- 🔵 **青信号**: 設計文書に明記されている仕様
- 🟡 **黄信号**: 設計文書から妥当に推測される仕様
- 🔴 **赤信号**: 設計文書にない推測

### 1.2 テストファイル構成

| ファイル | 説明 |
|---------|------|
| `tests/unit/domain/entities/ItemInstance.test.ts` | ItemInstanceエンティティのテスト |
| `tests/unit/application/services/alchemy-service.test.ts` | AlchemyServiceのテスト |

---

## 2. ItemInstanceエンティティ テストケース

### 2.1 コンストラクタ・基本プロパティ

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| T-0012-E01 | 正常なプロパティでインスタンス生成 | instanceId, master, quality, usedMaterialsが正しく保持される | 🔵 |
| T-0012-E02 | 空のusedMaterials配列で生成 | usedMaterialsが空配列として保持される | 🔵 |
| T-0012-E03 | 複数の素材を持つインスタンス生成 | usedMaterialsが正しく保持される | 🔵 |

#### T-0012-E01: 正常なプロパティでインスタンス生成

```typescript
describe('コンストラクタ', () => {
  it('T-0012-E01: アイテムインスタンスが正しいプロパティで生成されること', () => {
    // 【テスト目的】: ItemInstanceが正しく生成されること
    // 【テスト内容】: instanceId, master, quality, usedMaterialsが正しく設定される
    // 【期待される動作】: すべてのプロパティが正しく保持される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const instanceId = 'item_1234567890_1234';
    const master = createMockItemMaster('potion', '回復薬', 100);
    const quality = Quality.B;
    const usedMaterials = [createMockMaterialInstance('herb', Quality.B)];

    // Act
    const item = new ItemInstance(instanceId, master, quality, usedMaterials);

    // Assert
    expect(item.instanceId).toBe(instanceId);
    expect(item.master).toBe(master);
    expect(item.quality).toBe(quality);
    expect(item.usedMaterials).toEqual(usedMaterials);
  });
});
```

### 2.2 getterメソッド

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| T-0012-E04 | itemIdゲッターがmaster.idを返す | master.idと同じ値が返される | 🔵 |
| T-0012-E05 | nameゲッターがmaster.nameを返す | master.nameと同じ値が返される | 🔵 |
| T-0012-E06 | basePriceゲッターがmaster.basePriceを返す | master.basePriceと同じ値が返される | 🔵 |
| T-0012-E07 | basePriceがundefinedの場合0を返す | 0が返される | 🟡 |

#### T-0012-E04 ~ E07: getterメソッドのテスト

```typescript
describe('getterメソッド', () => {
  it('T-0012-E04: itemIdゲッターがmaster.idを返すこと', () => {
    // 【テスト目的】: itemIdゲッターが正しく動作すること
    // 【テスト内容】: master.idが正しく返される
    // 【期待される動作】: itemIdゲッターがmaster.idを返す
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const master = createMockItemMaster('potion', '回復薬', 100);
    const item = new ItemInstance('item_001', master, Quality.B, []);

    // Act & Assert
    expect(item.itemId).toBe(master.id);
  });

  it('T-0012-E05: nameゲッターがmaster.nameを返すこと', () => {
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記
    const master = createMockItemMaster('potion', '回復薬', 100);
    const item = new ItemInstance('item_001', master, Quality.B, []);

    expect(item.name).toBe('回復薬');
  });

  it('T-0012-E06: basePriceゲッターがmaster.basePriceを返すこと', () => {
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記
    const master = createMockItemMaster('potion', '回復薬', 100);
    const item = new ItemInstance('item_001', master, Quality.B, []);

    expect(item.basePrice).toBe(100);
  });

  it('T-0012-E07: basePriceがundefinedの場合0を返すこと', () => {
    // 🟡 信頼性レベル: 設計文書から妥当に推測
    const master = createMockItemMasterWithoutPrice('potion', '回復薬');
    const item = new ItemInstance('item_001', master, Quality.B, []);

    expect(item.basePrice).toBe(0);
  });
});
```

### 2.3 calculatePrice()メソッド

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| TC-ITEM-001 | D品質で価格計算（basePrice=100） | 50（100 × 0.5） | 🔵 |
| TC-ITEM-002 | C品質で価格計算（basePrice=100） | 75（100 × 0.75） | 🔵 |
| TC-ITEM-003 | B品質で価格計算（basePrice=100） | 100（100 × 1.0） | 🔵 |
| TC-ITEM-004 | A品質で価格計算（basePrice=100） | 150（100 × 1.5） | 🔵 |
| TC-ITEM-005 | S品質で価格計算（basePrice=100） | 200（100 × 2.0） | 🔵 |
| TC-ITEM-006 | 異なる基本価格での計算（basePrice=150, B品質） | 150 | 🔵 |
| TC-ITEM-007 | 端数切捨て確認（basePrice=99, C品質） | 74（99 × 0.75 = 74.25 → 74） | 🔵 |
| TC-ITEM-008 | basePrice=0の場合 | 0 | 🔵 |
| TC-ITEM-009 | basePriceがundefinedの場合 | 0 | 🟡 |

#### TC-ITEM-001 ~ TC-ITEM-009: calculatePrice()のテスト

```typescript
describe('calculatePrice', () => {
  it('TC-ITEM-001: D品質で価格計算（係数0.5）', () => {
    // 【テスト目的】: D品質の価格計算が正しく動作すること
    // 【テスト内容】: basePrice=100, quality=Dで計算
    // 【期待される動作】: 50が返される（100 × 0.5）
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const master = createMockItemMaster('potion', '回復薬', 100);
    const item = new ItemInstance('item_001', master, Quality.D, []);

    // Act
    const price = item.calculatePrice();

    // Assert
    expect(price).toBe(50);
  });

  it('TC-ITEM-002: C品質で価格計算（係数0.75）', () => {
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記
    const master = createMockItemMaster('potion', '回復薬', 100);
    const item = new ItemInstance('item_001', master, Quality.C, []);

    expect(item.calculatePrice()).toBe(75);
  });

  it('TC-ITEM-003: B品質で価格計算（係数1.0）', () => {
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記
    const master = createMockItemMaster('potion', '回復薬', 100);
    const item = new ItemInstance('item_001', master, Quality.B, []);

    expect(item.calculatePrice()).toBe(100);
  });

  it('TC-ITEM-004: A品質で価格計算（係数1.5）', () => {
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記
    const master = createMockItemMaster('potion', '回復薬', 100);
    const item = new ItemInstance('item_001', master, Quality.A, []);

    expect(item.calculatePrice()).toBe(150);
  });

  it('TC-ITEM-005: S品質で価格計算（係数2.0）', () => {
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記
    const master = createMockItemMaster('potion', '回復薬', 100);
    const item = new ItemInstance('item_001', master, Quality.S, []);

    expect(item.calculatePrice()).toBe(200);
  });

  it('TC-ITEM-006: 異なる基本価格での計算（basePrice=150, B品質）', () => {
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記
    const master = createMockItemMaster('elixir', 'エリクサー', 150);
    const item = new ItemInstance('item_001', master, Quality.B, []);

    expect(item.calculatePrice()).toBe(150);
  });

  it('TC-ITEM-007: 端数切捨て確認（basePrice=99, C品質）', () => {
    // 【テスト目的】: 端数切捨てが正しく動作すること
    // 【テスト内容】: 99 × 0.75 = 74.25 → 74
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    const master = createMockItemMaster('potion', '回復薬', 99);
    const item = new ItemInstance('item_001', master, Quality.C, []);

    expect(item.calculatePrice()).toBe(74);
  });

  it('TC-ITEM-008: basePrice=0の場合', () => {
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記
    const master = createMockItemMaster('potion', '回復薬', 0);
    const item = new ItemInstance('item_001', master, Quality.S, []);

    expect(item.calculatePrice()).toBe(0);
  });

  it('TC-ITEM-009: basePriceがundefinedの場合', () => {
    // 🟡 信頼性レベル: 設計文書から妥当に推測
    const master = createMockItemMasterWithoutPrice('potion', '回復薬');
    const item = new ItemInstance('item_001', master, Quality.B, []);

    expect(item.calculatePrice()).toBe(0);
  });
});
```

### 2.4 不変性テスト

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| T-0012-E08 | プロパティがreadonlyであること | TypeScriptの型チェックで保証 | 🔵 |
| T-0012-E09 | usedMaterials配列の参照が不変であること | 配列参照が変更されないこと | 🔵 |

---

## 3. AlchemyService テストケース

### 3.1 craft()メソッド

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| T-0012-01 | 有効なレシピ・十分な素材で調合成功 | ItemInstance生成成功 | 🔵 |
| TC-CRAFT-002 | 存在しないレシピIDで調合 | ApplicationError(INVALID_RECIPE) | 🔵 |
| T-0012-02 | 素材不足で調合 | ApplicationError(INSUFFICIENT_MATERIALS) | 🔵 |
| TC-CRAFT-004 | 出力アイテムが存在しないレシピで調合 | ApplicationError(INVALID_RECIPE) | 🔵 |
| TC-CRAFT-005 | 調合成功時にALCHEMY_COMPLETEDイベント発行 | eventBus.emitが呼ばれる | 🔵 |
| T-0012-03 | 品質計算（全てC品質素材） | C品質アイテム生成 | 🔵 |
| T-0012-04 | 品質計算（混合品質素材） | 平均品質アイテム生成 | 🔵 |

#### T-0012-01: 調合成功

```typescript
describe('craft', () => {
  it('T-0012-01: 有効なレシピ・十分な素材で調合成功', () => {
    // 【テスト目的】: craft()で正常に調合ができること
    // 【テスト内容】: 有効なレシピIDと十分な素材でcraftを実行
    // 【期待される動作】: ItemInstanceが生成される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [
      createMockMaterialInstance('herb', Quality.B),
      createMockMaterialInstance('water', Quality.C),
    ];
    setupMockRecipe(mockMasterDataRepo, recipeId);
    setupMockItem(mockMasterDataRepo, 'potion');
    mockMaterialService.calculateAverageQuality.mockReturnValue(Quality.B);

    // Act
    const result = alchemyService.craft(recipeId, materials);

    // Assert
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(ItemInstance);
    expect(result.instanceId).toMatch(/^item_\d+_\d+$/);
    expect(result.quality).toBe(Quality.B);
  });

  it('TC-CRAFT-002: 存在しないレシピIDで調合', () => {
    // 【テスト目的】: 存在しないレシピIDでエラーが発生すること
    // 【テスト内容】: 無効なレシピIDでcraftを実行
    // 【期待される動作】: ApplicationError(INVALID_RECIPE)がスローされる
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const invalidRecipeId = toCardId('invalid_recipe');
    const materials = [createMockMaterialInstance('herb', Quality.B)];
    mockMasterDataRepo.getRecipeCardById.mockReturnValue(undefined);

    // Act & Assert
    expect(() => alchemyService.craft(invalidRecipeId, materials))
      .toThrow(ApplicationError);
    expect(() => alchemyService.craft(invalidRecipeId, materials))
      .toThrow(/Recipe not found/);
  });

  it('T-0012-02: 素材不足で調合', () => {
    // 【テスト目的】: 素材不足でエラーが発生すること
    // 【テスト内容】: 必要素材が不足した状態でcraftを実行
    // 【期待される動作】: ApplicationError(INSUFFICIENT_MATERIALS)がスローされる
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials: MaterialInstance[] = []; // 空の素材リスト
    setupMockRecipe(mockMasterDataRepo, recipeId);

    // Act & Assert
    expect(() => alchemyService.craft(recipeId, materials))
      .toThrow(ApplicationError);
    expect(() => alchemyService.craft(recipeId, materials))
      .toThrow(/insufficient materials/);
  });

  it('TC-CRAFT-004: 出力アイテムが存在しないレシピで調合', () => {
    // 【テスト目的】: 出力アイテムが存在しない場合エラーが発生すること
    // 【テスト内容】: outputItemIdに対応するアイテムがない状態でcraftを実行
    // 【期待される動作】: ApplicationError(INVALID_RECIPE)がスローされる
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [createMockMaterialInstance('herb', Quality.B)];
    setupMockRecipeWithInvalidOutput(mockMasterDataRepo, recipeId);

    // Act & Assert
    expect(() => alchemyService.craft(recipeId, materials))
      .toThrow(ApplicationError);
    expect(() => alchemyService.craft(recipeId, materials))
      .toThrow(/Output item not found/);
  });

  it('TC-CRAFT-005: 調合成功時にALCHEMY_COMPLETEDイベント発行', () => {
    // 【テスト目的】: 調合成功時にイベントが発行されること
    // 【テスト内容】: craftを正常に実行した後、eventBus.emitが呼ばれる
    // 【期待される動作】: ALCHEMY_COMPLETEDイベントが発行される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [createMockMaterialInstance('herb', Quality.B)];
    setupMockRecipe(mockMasterDataRepo, recipeId);
    setupMockItem(mockMasterDataRepo, 'potion');
    mockMaterialService.calculateAverageQuality.mockReturnValue(Quality.B);

    // Act
    alchemyService.craft(recipeId, materials);

    // Assert
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameEventType.ALCHEMY_COMPLETED,
      })
    );
  });

  it('T-0012-03: 品質計算（全てC品質素材）', () => {
    // 【テスト目的】: 全てC品質の素材からC品質のアイテムが生成されること
    // 【テスト内容】: C品質の素材のみでcraft
    // 【期待される動作】: C品質のItemInstanceが生成される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [
      createMockMaterialInstance('herb', Quality.C),
      createMockMaterialInstance('water', Quality.C),
    ];
    setupMockRecipe(mockMasterDataRepo, recipeId);
    setupMockItem(mockMasterDataRepo, 'potion');
    mockMaterialService.calculateAverageQuality.mockReturnValue(Quality.C);

    // Act
    const result = alchemyService.craft(recipeId, materials);

    // Assert
    expect(result.quality).toBe(Quality.C);
  });

  it('T-0012-04: 品質計算（混合品質素材）', () => {
    // 【テスト目的】: 混合品質の素材から平均品質のアイテムが生成されること
    // 【テスト内容】: B, C, D品質の混合素材でcraft
    // 【期待される動作】: 平均品質のItemInstanceが生成される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [
      createMockMaterialInstance('herb', Quality.B),
      createMockMaterialInstance('water', Quality.C),
      createMockMaterialInstance('ore', Quality.D),
    ];
    setupMockRecipe(mockMasterDataRepo, recipeId);
    setupMockItem(mockMasterDataRepo, 'potion');
    // (3+2+1)/3 = 2.0 → C
    mockMaterialService.calculateAverageQuality.mockReturnValue(Quality.C);

    // Act
    const result = alchemyService.craft(recipeId, materials);

    // Assert
    expect(result.quality).toBe(Quality.C);
    expect(mockMaterialService.calculateAverageQuality).toHaveBeenCalled();
  });
});
```

### 3.2 canCraft()メソッド

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| TC-CANCRAFT-001 | 十分な素材があれば調合可能 | true | 🔵 |
| TC-CANCRAFT-002 | 素材不足の場合調合不可 | false | 🔵 |
| TC-CANCRAFT-003 | 存在しないレシピIDの場合 | false | 🔵 |
| TC-CANCRAFT-004 | 空の素材リストの場合 | false | 🔵 |

#### TC-CANCRAFT-001 ~ TC-CANCRAFT-004: canCraft()のテスト

```typescript
describe('canCraft', () => {
  it('TC-CANCRAFT-001: 十分な素材があれば調合可能', () => {
    // 【テスト目的】: 十分な素材がある場合にtrueが返されること
    // 【テスト内容】: 必要素材が全て揃った状態でcanCraftを実行
    // 【期待される動作】: trueが返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [
      createMockMaterialInstance('herb', Quality.B),
      createMockMaterialInstance('water', Quality.C),
    ];
    setupMockRecipe(mockMasterDataRepo, recipeId);

    // Act
    const result = alchemyService.canCraft(recipeId, materials);

    // Assert
    expect(result).toBe(true);
  });

  it('TC-CANCRAFT-002: 素材不足の場合調合不可', () => {
    // 【テスト目的】: 素材不足の場合にfalseが返されること
    // 【テスト内容】: 素材が不足した状態でcanCraftを実行
    // 【期待される動作】: falseが返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials: MaterialInstance[] = [];
    setupMockRecipe(mockMasterDataRepo, recipeId);

    // Act
    const result = alchemyService.canCraft(recipeId, materials);

    // Assert
    expect(result).toBe(false);
  });

  it('TC-CANCRAFT-003: 存在しないレシピIDの場合', () => {
    // 【テスト目的】: 存在しないレシピIDでfalseが返されること
    // 【テスト内容】: 無効なレシピIDでcanCraftを実行
    // 【期待される動作】: falseが返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const invalidRecipeId = toCardId('invalid_recipe');
    const materials = [createMockMaterialInstance('herb', Quality.B)];
    mockMasterDataRepo.getRecipeCardById.mockReturnValue(undefined);

    // Act
    const result = alchemyService.canCraft(invalidRecipeId, materials);

    // Assert
    expect(result).toBe(false);
  });

  it('TC-CANCRAFT-004: 空の素材リストの場合', () => {
    // 【テスト目的】: 空の素材リストでfalseが返されること
    // 【テスト内容】: 空の素材リストでcanCraftを実行
    // 【期待される動作】: falseが返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials: MaterialInstance[] = [];
    setupMockRecipeRequiringMaterials(mockMasterDataRepo, recipeId);

    // Act
    const result = alchemyService.canCraft(recipeId, materials);

    // Assert
    expect(result).toBe(false);
  });
});
```

### 3.3 previewQuality()メソッド

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| TC-PREVIEW-001 | 全てC品質素材でプレビュー | Quality.C | 🔵 |
| TC-PREVIEW-002 | B, B, C混合素材でプレビュー | Quality.B（平均2.67→3） | 🔵 |
| TC-PREVIEW-003 | 全てS品質素材でプレビュー | Quality.S | 🔵 |
| TC-PREVIEW-004 | 存在しないレシピIDでプレビュー | エラーまたはデフォルト品質 | 🟡 |
| TC-PREVIEW-005 | 素材不足状態でプレビュー | エラーまたはデフォルト品質 | 🟡 |

#### TC-PREVIEW-001 ~ TC-PREVIEW-005: previewQuality()のテスト

```typescript
describe('previewQuality', () => {
  it('TC-PREVIEW-001: 全てC品質素材でプレビュー', () => {
    // 【テスト目的】: C品質素材のみで品質プレビューが正しいこと
    // 【テスト内容】: C品質素材でpreviewQualityを実行
    // 【期待される動作】: Quality.Cが返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [
      createMockMaterialInstance('herb', Quality.C),
      createMockMaterialInstance('water', Quality.C),
    ];
    setupMockRecipe(mockMasterDataRepo, recipeId);
    mockMaterialService.calculateAverageQuality.mockReturnValue(Quality.C);

    // Act
    const result = alchemyService.previewQuality(recipeId, materials);

    // Assert
    expect(result).toBe(Quality.C);
  });

  it('TC-PREVIEW-002: B, B, C混合素材でプレビュー', () => {
    // 【テスト目的】: 混合品質素材で品質プレビューが正しいこと
    // 【テスト内容】: B, B, C素材でpreviewQualityを実行
    // 【期待される動作】: Quality.Bが返される（(3+3+2)/3=2.67→3→B）
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [
      createMockMaterialInstance('herb', Quality.B),
      createMockMaterialInstance('water', Quality.B),
      createMockMaterialInstance('ore', Quality.C),
    ];
    setupMockRecipe(mockMasterDataRepo, recipeId);
    mockMaterialService.calculateAverageQuality.mockReturnValue(Quality.B);

    // Act
    const result = alchemyService.previewQuality(recipeId, materials);

    // Assert
    expect(result).toBe(Quality.B);
  });

  it('TC-PREVIEW-003: 全てS品質素材でプレビュー', () => {
    // 【テスト目的】: S品質素材のみで品質プレビューが正しいこと
    // 【テスト内容】: S品質素材でpreviewQualityを実行
    // 【期待される動作】: Quality.Sが返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [
      createMockMaterialInstance('herb', Quality.S),
      createMockMaterialInstance('water', Quality.S),
    ];
    setupMockRecipe(mockMasterDataRepo, recipeId);
    mockMaterialService.calculateAverageQuality.mockReturnValue(Quality.S);

    // Act
    const result = alchemyService.previewQuality(recipeId, materials);

    // Assert
    expect(result).toBe(Quality.S);
  });

  it('TC-PREVIEW-004: 存在しないレシピIDでプレビュー', () => {
    // 【テスト目的】: 存在しないレシピIDで適切に処理されること
    // 【テスト内容】: 無効なレシピIDでpreviewQualityを実行
    // 【期待される動作】: エラーがスローされるか、デフォルト品質が返される
    // 🟡 信頼性レベル: 設計文書から妥当に推測

    // Arrange
    const invalidRecipeId = toCardId('invalid_recipe');
    const materials = [createMockMaterialInstance('herb', Quality.B)];
    mockMasterDataRepo.getRecipeCardById.mockReturnValue(undefined);

    // Act & Assert
    // 実装によってエラーか、デフォルト値のいずれか
    expect(() => alchemyService.previewQuality(invalidRecipeId, materials))
      .toThrow();
    // または
    // expect(alchemyService.previewQuality(invalidRecipeId, materials)).toBe(Quality.D);
  });
});
```

### 3.4 getAvailableRecipes()メソッド

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| TC-AVAILABLE-001 | 複数レシピ作成可能 | 該当レシピの配列 | 🔵 |
| TC-AVAILABLE-002 | 作成可能レシピなし | 空配列 | 🔵 |
| TC-AVAILABLE-003 | 空の素材リスト | 空配列 | 🔵 |
| TC-AVAILABLE-004 | 1つだけ作成可能 | 1要素の配列 | 🔵 |
| T-0012-05 | 調合可能レシピ取得 | 該当レシピリスト | 🔵 |

#### TC-AVAILABLE-001 ~ T-0012-05: getAvailableRecipes()のテスト

```typescript
describe('getAvailableRecipes', () => {
  it('TC-AVAILABLE-001: 複数レシピ作成可能', () => {
    // 【テスト目的】: 複数のレシピが作成可能な場合に正しく返されること
    // 【テスト内容】: 複数レシピの素材を満たす状態でgetAvailableRecipesを実行
    // 【期待される動作】: 作成可能な全レシピの配列が返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const materials = [
      createMockMaterialInstance('herb', Quality.B),
      createMockMaterialInstance('water', Quality.C),
      createMockMaterialInstance('ore', Quality.A),
    ];
    setupMockMultipleRecipes(mockMasterDataRepo);

    // Act
    const result = alchemyService.getAvailableRecipes(materials);

    // Assert
    expect(result.length).toBeGreaterThan(1);
    expect(Array.isArray(result)).toBe(true);
  });

  it('TC-AVAILABLE-002: 作成可能レシピなし', () => {
    // 【テスト目的】: 作成可能なレシピがない場合に空配列が返されること
    // 【テスト内容】: どのレシピも満たさない素材でgetAvailableRecipesを実行
    // 【期待される動作】: 空配列が返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const materials = [createMockMaterialInstance('unknown', Quality.B)];
    setupMockRecipesThatDontMatch(mockMasterDataRepo);

    // Act
    const result = alchemyService.getAvailableRecipes(materials);

    // Assert
    expect(result).toEqual([]);
  });

  it('TC-AVAILABLE-003: 空の素材リスト', () => {
    // 【テスト目的】: 空の素材リストで空配列が返されること
    // 【テスト内容】: 空の素材リストでgetAvailableRecipesを実行
    // 【期待される動作】: 空配列が返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const materials: MaterialInstance[] = [];
    setupMockRecipes(mockMasterDataRepo);

    // Act
    const result = alchemyService.getAvailableRecipes(materials);

    // Assert
    expect(result).toEqual([]);
  });

  it('TC-AVAILABLE-004: 1つだけ作成可能', () => {
    // 【テスト目的】: 1つだけ作成可能な場合に1要素の配列が返されること
    // 【テスト内容】: 1つのレシピのみ満たす素材でgetAvailableRecipesを実行
    // 【期待される動作】: 1要素の配列が返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const materials = [createMockMaterialInstance('herb', Quality.B)];
    setupMockSingleMatchingRecipe(mockMasterDataRepo);

    // Act
    const result = alchemyService.getAvailableRecipes(materials);

    // Assert
    expect(result.length).toBe(1);
  });

  it('T-0012-05: 調合可能レシピ取得', () => {
    // 【テスト目的】: 所持素材で作れるレシピリストを取得できること
    // 【テスト内容】: 有効な素材でgetAvailableRecipesを実行
    // 【期待される動作】: 作成可能なレシピの配列が返される
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const materials = [
      createMockMaterialInstance('herb', Quality.B),
      createMockMaterialInstance('water', Quality.C),
    ];
    setupMockRecipes(mockMasterDataRepo);

    // Act
    const result = alchemyService.getAvailableRecipes(materials);

    // Assert
    expect(Array.isArray(result)).toBe(true);
    // 各要素がIRecipeCardMasterの構造を持つことを確認
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('requiredMaterials');
    }
  });
});
```

### 3.5 checkRecipeRequirements()メソッド

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| TC-CHECK-001 | 全素材マッチ | canCraft=true, missing=[], matched=[...] | 🔵 |
| TC-CHECK-002 | 一部素材不足 | canCraft=false, missing=[不足分], matched=[マッチ分] | 🔵 |
| TC-CHECK-003 | 全素材不足 | canCraft=false, missing=[全必要素材], matched=[] | 🔵 |
| TC-CHECK-004 | 存在しないレシピID | canCraft=false, missing=[], matched=[] | 🔵 |
| TC-CHECK-005 | 品質条件未達 | canCraft=false, missing=[該当素材] | 🔵 |
| TC-CHECK-006 | 複数個必要な素材 | 必要数量分マッチ | 🔵 |
| TC-CHECK-007 | 余剰素材あり | 必要分のみマッチ | 🔵 |
| TC-CHECK-008 | 同一素材の重複使用禁止 | 1つの素材は1回のみマッチ | 🔵 |

#### TC-CHECK-001 ~ TC-CHECK-008: checkRecipeRequirements()のテスト

```typescript
describe('checkRecipeRequirements', () => {
  it('TC-CHECK-001: 全素材マッチ', () => {
    // 【テスト目的】: 全ての必要素材がマッチした場合の結果
    // 【テスト内容】: 必要素材が全て揃った状態でcheckRecipeRequirementsを実行
    // 【期待される動作】: canCraft=true, missingMaterials=[], matchedMaterialsに素材
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [
      createMockMaterialInstance('herb', Quality.B),
      createMockMaterialInstance('water', Quality.C),
    ];
    setupMockRecipe(mockMasterDataRepo, recipeId);

    // Act
    const result = alchemyService.checkRecipeRequirements(recipeId, materials);

    // Assert
    expect(result.canCraft).toBe(true);
    expect(result.missingMaterials).toEqual([]);
    expect(result.matchedMaterials.length).toBe(2);
  });

  it('TC-CHECK-002: 一部素材不足', () => {
    // 【テスト目的】: 一部の素材が不足している場合の結果
    // 【テスト内容】: 一部素材のみ揃った状態でcheckRecipeRequirementsを実行
    // 【期待される動作】: canCraft=false, missingMaterialsに不足分, matchedMaterialsにマッチ分
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials = [createMockMaterialInstance('herb', Quality.B)];
    // レシピはherb + waterを要求
    setupMockRecipeRequiringTwoMaterials(mockMasterDataRepo, recipeId);

    // Act
    const result = alchemyService.checkRecipeRequirements(recipeId, materials);

    // Assert
    expect(result.canCraft).toBe(false);
    expect(result.missingMaterials.length).toBeGreaterThan(0);
    expect(result.matchedMaterials.length).toBe(1);
  });

  it('TC-CHECK-003: 全素材不足', () => {
    // 【テスト目的】: 全ての素材が不足している場合の結果
    // 【テスト内容】: 空の素材リストでcheckRecipeRequirementsを実行
    // 【期待される動作】: canCraft=false, missingMaterialsに全必要素材, matchedMaterials=[]
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    const materials: MaterialInstance[] = [];
    setupMockRecipeRequiringMaterials(mockMasterDataRepo, recipeId);

    // Act
    const result = alchemyService.checkRecipeRequirements(recipeId, materials);

    // Assert
    expect(result.canCraft).toBe(false);
    expect(result.missingMaterials.length).toBeGreaterThan(0);
    expect(result.matchedMaterials).toEqual([]);
  });

  it('TC-CHECK-004: 存在しないレシピID', () => {
    // 【テスト目的】: 存在しないレシピIDの場合の結果
    // 【テスト内容】: 無効なレシピIDでcheckRecipeRequirementsを実行
    // 【期待される動作】: canCraft=false, missingMaterials=[], matchedMaterials=[]
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const invalidRecipeId = toCardId('invalid_recipe');
    const materials = [createMockMaterialInstance('herb', Quality.B)];
    mockMasterDataRepo.getRecipeCardById.mockReturnValue(undefined);

    // Act
    const result = alchemyService.checkRecipeRequirements(invalidRecipeId, materials);

    // Assert
    expect(result.canCraft).toBe(false);
    expect(result.missingMaterials).toEqual([]);
    expect(result.matchedMaterials).toEqual([]);
  });

  it('TC-CHECK-005: 品質条件未達', () => {
    // 【テスト目的】: 素材の品質が最低条件を満たさない場合の結果
    // 【テスト内容】: 品質条件を満たさない素材でcheckRecipeRequirementsを実行
    // 【期待される動作】: canCraft=false, missingMaterialsに該当素材
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    // レシピはB品質以上のherbを要求
    const materials = [createMockMaterialInstance('herb', Quality.D)];
    setupMockRecipeRequiringMinQuality(mockMasterDataRepo, recipeId, Quality.B);

    // Act
    const result = alchemyService.checkRecipeRequirements(recipeId, materials);

    // Assert
    expect(result.canCraft).toBe(false);
    expect(result.missingMaterials.length).toBeGreaterThan(0);
  });

  it('TC-CHECK-006: 複数個必要な素材', () => {
    // 【テスト目的】: 同一素材が複数個必要な場合の結果
    // 【テスト内容】: 必要数量の素材を持ってcheckRecipeRequirementsを実行
    // 【期待される動作】: 必要数量分がマッチする
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    // レシピはherbを3個要求
    const materials = [
      createMockMaterialInstance('herb', Quality.B),
      createMockMaterialInstance('herb', Quality.C),
      createMockMaterialInstance('herb', Quality.A),
    ];
    setupMockRecipeRequiringMultipleQuantity(mockMasterDataRepo, recipeId, 3);

    // Act
    const result = alchemyService.checkRecipeRequirements(recipeId, materials);

    // Assert
    expect(result.canCraft).toBe(true);
    expect(result.matchedMaterials.length).toBe(3);
  });

  it('TC-CHECK-007: 余剰素材あり', () => {
    // 【テスト目的】: 必要以上の素材がある場合の結果
    // 【テスト内容】: 必要数以上の素材を持ってcheckRecipeRequirementsを実行
    // 【期待される動作】: 必要分のみがマッチし、余剰は含まれない
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    // レシピはherbを1個要求
    const materials = [
      createMockMaterialInstance('herb', Quality.B),
      createMockMaterialInstance('herb', Quality.C),
      createMockMaterialInstance('herb', Quality.A),
    ];
    setupMockRecipeRequiringSingleMaterial(mockMasterDataRepo, recipeId);

    // Act
    const result = alchemyService.checkRecipeRequirements(recipeId, materials);

    // Assert
    expect(result.canCraft).toBe(true);
    expect(result.matchedMaterials.length).toBe(1); // 必要な1個のみ
  });

  it('TC-CHECK-008: 同一素材の重複使用禁止', () => {
    // 【テスト目的】: 同じ素材インスタンスが複数の要件で使用されないこと
    // 【テスト内容】: 複数の要件で同じ素材IDを要求するレシピでチェック
    // 【期待される動作】: 1つの素材インスタンスは1回のみマッチ
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    // Arrange
    const recipeId = toCardId('recipe_001');
    // レシピはherbを2個要求するが、素材は1個しかない
    const materials = [createMockMaterialInstance('herb', Quality.B)];
    setupMockRecipeRequiringMultipleQuantity(mockMasterDataRepo, recipeId, 2);

    // Act
    const result = alchemyService.checkRecipeRequirements(recipeId, materials);

    // Assert
    expect(result.canCraft).toBe(false);
    expect(result.matchedMaterials.length).toBe(1);
    expect(result.missingMaterials[0].quantity).toBe(1); // 不足1個
  });
});
```

---

## 4. QUALITY_PRICE_MULTIPLIER定数テスト

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| TC-CONST-001 | QUALITY_PRICE_MULTIPLIER定数が正しく定義されている | D=0.5, C=0.75, B=1.0, A=1.5, S=2.0 | 🔵 |

```typescript
describe('QUALITY_PRICE_MULTIPLIER', () => {
  it('TC-CONST-001: 品質価格係数が正しく定義されていること', () => {
    // 【テスト目的】: QUALITY_PRICE_MULTIPLIER定数が正しく定義されていること
    // 【テスト内容】: 各品質の係数を確認
    // 【期待される動作】: D=0.5, C=0.75, B=1.0, A=1.5, S=2.0
    // 🔵 信頼性レベル: 要件定義書・設計文書に明記

    expect(QUALITY_PRICE_MULTIPLIER[Quality.D]).toBe(0.5);
    expect(QUALITY_PRICE_MULTIPLIER[Quality.C]).toBe(0.75);
    expect(QUALITY_PRICE_MULTIPLIER[Quality.B]).toBe(1.0);
    expect(QUALITY_PRICE_MULTIPLIER[Quality.A]).toBe(1.5);
    expect(QUALITY_PRICE_MULTIPLIER[Quality.S]).toBe(2.0);
  });
});
```

---

## 5. エッジケース・エラーケース一覧

### 5.1 入力検証

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| TC-EDGE-001 | nullの素材配列 | エラーまたは空配列扱い | 🟡 |
| TC-EDGE-002 | undefinedのレシピID | エラー | 🟡 |
| TC-EDGE-003 | 非常に長いインスタンスID | 正常に処理される | 🔴 |

### 5.2 境界値

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| TC-EDGE-004 | 大量の素材（100個）でチェック | 正常に処理される | 🟡 |
| TC-EDGE-005 | 0個の必要素材を持つレシピ | 常にcanCraft=true | 🟡 |
| TC-EDGE-006 | 非常に高い基本価格（MAX_SAFE_INTEGER） | オーバーフローなし | 🔴 |

### 5.3 エラーハンドリング

| テストID | テスト内容 | 期待結果 | 信頼性 |
|---------|----------|----------|--------|
| TC-ERROR-001 | MasterDataRepositoryが未ロード | 適切なエラー | 🟡 |
| TC-ERROR-002 | MaterialServiceがエラーをスロー | エラーが伝播 | 🟡 |
| TC-ERROR-003 | EventBusがエラーをスロー | エラーが伝播または無視 | 🟡 |

---

## 6. テストケースサマリー

### 6.1 カテゴリ別テスト数

| カテゴリ | テスト数 | 必須 | 推奨 |
|---------|---------|------|------|
| ItemInstance コンストラクタ | 3 | 3 | 0 |
| ItemInstance getter | 4 | 3 | 1 |
| ItemInstance calculatePrice | 9 | 8 | 1 |
| ItemInstance 不変性 | 2 | 2 | 0 |
| AlchemyService craft | 7 | 7 | 0 |
| AlchemyService canCraft | 4 | 4 | 0 |
| AlchemyService previewQuality | 5 | 3 | 2 |
| AlchemyService getAvailableRecipes | 5 | 5 | 0 |
| AlchemyService checkRecipeRequirements | 8 | 8 | 0 |
| 定数 | 1 | 1 | 0 |
| エッジケース | 9 | 0 | 9 |
| **合計** | **57** | **44** | **13** |

### 6.2 優先度

1. **最優先（P0）**: T-0012-01 ~ T-0012-05（タスク定義の必須テスト）
2. **高優先（P1）**: TC-ITEM-*, TC-CRAFT-*, TC-CANCRAFT-*, TC-CHECK-*
3. **中優先（P2）**: TC-PREVIEW-*, TC-AVAILABLE-*
4. **低優先（P3）**: TC-EDGE-*, TC-ERROR-*

---

## 7. モックヘルパー関数

```typescript
// モック生成ヘルパー関数の定義例

function createMockItemMaster(id: string, name: string, basePrice: number): ItemMaster {
  return {
    id: toItemId(id),
    name,
    basePrice,
    category: ItemCategory.CONSUMABLE,
    description: `${name}の説明`,
  };
}

function createMockItemMasterWithoutPrice(id: string, name: string): ItemMaster {
  return {
    id: toItemId(id),
    name,
    category: ItemCategory.CONSUMABLE,
    description: `${name}の説明`,
    // basePriceは意図的に省略
  } as ItemMaster;
}

function createMockMaterialInstance(materialId: string, quality: Quality): MaterialInstance {
  const master: IMaterial = {
    id: toMaterialId(materialId),
    name: `${materialId}の名前`,
    baseQuality: quality,
    attributes: [],
    description: `${materialId}の説明`,
  };
  return new MaterialInstance(`material_${Date.now()}_${Math.random()}`, master, quality);
}

function setupMockRecipe(repo: IMasterDataRepository, recipeId: CardId): void {
  const recipe: IRecipeCardMaster = {
    id: recipeId,
    type: 'RECIPE',
    name: 'テストレシピ',
    description: 'テスト用レシピ',
    cost: 1,
    rarity: 'COMMON',
    outputItemId: 'potion',
    requiredMaterials: [
      { materialId: 'herb', quantity: 1 },
      { materialId: 'water', quantity: 1 },
    ],
  };
  (repo.getRecipeCardById as Mock).mockReturnValue(recipe);
}
```

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-17 | 1.0.0 | 初版作成 |
