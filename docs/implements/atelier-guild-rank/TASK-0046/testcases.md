# TASK-0046 テストケース一覧: MainScene共通レイアウト実装

**作成日**: 2026-01-21
**タスクID**: TASK-0046
**テストフレームワーク**: Vitest
**テストファイル**: `tests/unit/presentation/main-scene.test.ts`

---

## 1. 概要

MainScene共通レイアウト（ヘッダー、サイドバー、フッター、コンテンツエリア）の実装に関するテストケース一覧。

### テストカテゴリ

| カテゴリ | テスト数 | 説明 |
|---------|---------|------|
| 正常系 | 32 | 期待通りの動作を確認 |
| 異常系 | 8 | エラーハンドリングを確認 |
| 境界値 | 10 | 境界条件での動作を確認 |
| **合計** | **50** | - |

---

## 2. 正常系テストケース

### 2.1 MainScene初期化

#### TC-0046-001: MainSceneのcreateでレイアウトが生成される

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-001 |
| **テスト名** | MainScene create() でレイアウトコンポーネントが生成される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-001 |
| **事前条件** | - MainSceneがインスタンス化されている<br>- モックシーンが設定されている |
| **操作手順** | 1. MainSceneのcreate()を呼び出す |
| **期待結果** | - HeaderUIが生成される<br>- SidebarUIが生成される<br>- FooterUIが生成される<br>- contentContainerが生成される |

```typescript
describe('MainScene', () => {
  describe('create()', () => {
    it('should create layout components (HeaderUI, SidebarUI, FooterUI, contentContainer)', () => {
      // Arrange
      const scene = createMockMainScene();

      // Act
      scene.create();

      // Assert
      expect(scene.headerUI).toBeDefined();
      expect(scene.sidebarUI).toBeDefined();
      expect(scene.footerUI).toBeDefined();
      expect(scene.contentContainer).toBeDefined();
    });
  });
});
```

---

#### TC-0046-002: MainSceneのcreateでサービス参照が取得される

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-002 |
| **テスト名** | MainScene create() でサービス参照が取得される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-002 |
| **事前条件** | - ServiceContainerにサービスが登録されている |
| **操作手順** | 1. MainSceneのcreate()を呼び出す |
| **期待結果** | - StateManagerへの参照が取得される<br>- GameFlowManagerへの参照が取得される<br>- EventBusへの参照が取得される |

```typescript
it('should obtain service references (StateManager, GameFlowManager, EventBus)', () => {
  // Arrange
  const scene = createMockMainScene();

  // Act
  scene.create();

  // Assert
  expect(scene['stateManager']).toBeDefined();
  expect(scene['gameFlowManager']).toBeDefined();
  expect(scene['eventBus']).toBeDefined();
});
```

---

### 2.2 ヘッダーUI（HeaderUI）

#### TC-0046-010: HeaderUIの生成

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-010 |
| **テスト名** | HeaderUI が BaseComponent を継承して正しく生成される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-010 |
| **事前条件** | - モックシーンが設定されている |
| **操作手順** | 1. HeaderUIをインスタンス化する<br>2. create()を呼び出す |
| **期待結果** | - HeaderUIインスタンスがBaseComponentを継承している<br>- containerが生成されている |

```typescript
describe('HeaderUI', () => {
  it('should extend BaseComponent and create container', () => {
    // Arrange
    const scene = createMockScene();

    // Act
    const headerUI = new HeaderUI(scene, 0, 0);
    headerUI.create();

    // Assert
    expect(headerUI).toBeInstanceOf(BaseComponent);
    expect(headerUI.getContainer()).toBeDefined();
  });
});
```

---

#### TC-0046-011: ランク表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-011 |
| **テスト名** | HeaderUI にギルドランクが表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-010 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ currentRank: 'E', ... })を呼び出す |
| **期待結果** | - 「ランク: E」が表示される |

```typescript
it('should display guild rank', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({
    currentRank: GuildRank.E,
    promotionGauge: 35,
    remainingDays: 25,
    gold: 500,
    actionPoints: 3,
    maxActionPoints: 3,
  });

  // Assert
  expect(headerUI.getRankText()).toBe('ランク: E');
});
```

---

#### TC-0046-012: 昇格ゲージ表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-012 |
| **テスト名** | HeaderUI に昇格ゲージが表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-011 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ promotionGauge: 35, ... })を呼び出す |
| **期待結果** | - プログレスバーが35%表示される<br>- 「35/100」が表示される |

```typescript
it('should display promotion gauge with progress bar', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({
    currentRank: GuildRank.E,
    promotionGauge: 35,
    remainingDays: 25,
    gold: 500,
    actionPoints: 3,
    maxActionPoints: 3,
  });

  // Assert
  expect(headerUI.getPromotionGaugeValue()).toBe(35);
  expect(headerUI.getPromotionGaugeText()).toBe('35/100');
});
```

---

#### TC-0046-013: 昇格ゲージ色変化（0〜30%: 赤系）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-013 |
| **テスト名** | 昇格ゲージ 0〜30% で赤系色が適用される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-011 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ promotionGauge: 20, ... })を呼び出す |
| **期待結果** | - ゲージ色が赤系（0xFF6B6B）になる |

```typescript
it('should apply red color when promotion gauge is 0-30%', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, promotionGauge: 20 });

  // Assert
  expect(headerUI.getPromotionGaugeColor()).toBe(0xFF6B6B);
});
```

---

#### TC-0046-014: 昇格ゲージ色変化（30〜60%: 黄系）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-014 |
| **テスト名** | 昇格ゲージ 30〜60% で黄系色が適用される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-011 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ promotionGauge: 45, ... })を呼び出す |
| **期待結果** | - ゲージ色が黄系（0xFFD93D）になる |

```typescript
it('should apply yellow color when promotion gauge is 30-60%', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, promotionGauge: 45 });

  // Assert
  expect(headerUI.getPromotionGaugeColor()).toBe(0xFFD93D);
});
```

---

#### TC-0046-015: 昇格ゲージ色変化（60〜100%: 緑系）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-015 |
| **テスト名** | 昇格ゲージ 60〜99% で緑系色が適用される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-011 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ promotionGauge: 80, ... })を呼び出す |
| **期待結果** | - ゲージ色が緑系（0x6BCB77）になる |

```typescript
it('should apply green color when promotion gauge is 60-99%', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, promotionGauge: 80 });

  // Assert
  expect(headerUI.getPromotionGaugeColor()).toBe(0x6BCB77);
});
```

---

#### TC-0046-016: 昇格ゲージ色変化（100%: 水色）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-016 |
| **テスト名** | 昇格ゲージ 100% で水色が適用される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-011 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ promotionGauge: 100, ... })を呼び出す |
| **期待結果** | - ゲージ色が水色（0x4ECDC4）になる |

```typescript
it('should apply cyan color when promotion gauge is 100%', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, promotionGauge: 100 });

  // Assert
  expect(headerUI.getPromotionGaugeColor()).toBe(0x4ECDC4);
});
```

---

#### TC-0046-017: 残り日数表示（通常）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-017 |
| **テスト名** | 残り日数が通常表示される（11日以上） |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-012 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ remainingDays: 25, ... })を呼び出す |
| **期待結果** | - 「残り: 25日」が白色で表示される |

```typescript
it('should display remaining days in white when 11+ days', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, remainingDays: 25 });

  // Assert
  expect(headerUI.getRemainingDaysText()).toBe('残り: 25日');
  expect(headerUI.getRemainingDaysColor()).toBe(0xFFFFFF);
});
```

---

#### TC-0046-018: 残り日数表示（警告: 6〜10日）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-018 |
| **テスト名** | 残り日数が警告表示される（6〜10日） |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-012 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ remainingDays: 8, ... })を呼び出す |
| **期待結果** | - 「残り: 8日」が黄色で表示される |

```typescript
it('should display remaining days in yellow when 6-10 days', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, remainingDays: 8 });

  // Assert
  expect(headerUI.getRemainingDaysText()).toBe('残り: 8日');
  expect(headerUI.getRemainingDaysColor()).toBe(0xFFD93D);
});
```

---

#### TC-0046-019: 残り日数表示（緊急: 4〜5日）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-019 |
| **テスト名** | 残り日数が緊急表示される（4〜5日） |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-012 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ remainingDays: 5, ... })を呼び出す |
| **期待結果** | - 「残り: 5日」が赤色（0xFF6B6B）で表示される |

```typescript
it('should display remaining days in red when 4-5 days', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, remainingDays: 5 });

  // Assert
  expect(headerUI.getRemainingDaysText()).toBe('残り: 5日');
  expect(headerUI.getRemainingDaysColor()).toBe(0xFF6B6B);
});
```

---

#### TC-0046-020: 残り日数表示（危機: 1〜3日）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-020 |
| **テスト名** | 残り日数が危機表示される（1〜3日） |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-012 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ remainingDays: 2, ... })を呼び出す |
| **期待結果** | - 「残り: 2日」が赤色（0xFF0000）で点滅表示される |

```typescript
it('should display remaining days in bright red with blink when 1-3 days', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, remainingDays: 2 });

  // Assert
  expect(headerUI.getRemainingDaysText()).toBe('残り: 2日');
  expect(headerUI.getRemainingDaysColor()).toBe(0xFF0000);
  expect(headerUI.isRemainingDaysBlinking()).toBe(true);
});
```

---

#### TC-0046-021: 所持金表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-021 |
| **テスト名** | 所持金が正しく表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-013 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ gold: 500, ... })を呼び出す |
| **期待結果** | - 「500G」が表示される |

```typescript
it('should display gold amount', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, gold: 500 });

  // Assert
  expect(headerUI.getGoldText()).toBe('500G');
});
```

---

#### TC-0046-022: 行動ポイント表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-022 |
| **テスト名** | 行動ポイントが正しく表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-014 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ actionPoints: 3, maxActionPoints: 3, ... })を呼び出す |
| **期待結果** | - 「3/3 AP」が表示される |

```typescript
it('should display action points', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, actionPoints: 3, maxActionPoints: 3 });

  // Assert
  expect(headerUI.getActionPointsText()).toBe('3/3 AP');
});
```

---

#### TC-0046-023: ヘッダー状態更新

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-023 |
| **テスト名** | ヘッダー全体が更新される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-015 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update()で全項目を更新する |
| **期待結果** | - ランク、昇格ゲージ、残り日数、所持金、APがすべて更新される |

```typescript
it('should update all header elements', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({
    currentRank: GuildRank.D,
    promotionGauge: 75,
    remainingDays: 15,
    gold: 1200,
    actionPoints: 2,
    maxActionPoints: 3,
  });

  // Assert
  expect(headerUI.getRankText()).toBe('ランク: D');
  expect(headerUI.getPromotionGaugeValue()).toBe(75);
  expect(headerUI.getRemainingDaysText()).toBe('残り: 15日');
  expect(headerUI.getGoldText()).toBe('1200G');
  expect(headerUI.getActionPointsText()).toBe('2/3 AP');
});
```

---

### 2.3 サイドバーUI（SidebarUI）

#### TC-0046-030: SidebarUIの生成

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-030 |
| **テスト名** | SidebarUI が BaseComponent を継承して正しく生成される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-020 |
| **事前条件** | - モックシーンが設定されている |
| **操作手順** | 1. SidebarUIをインスタンス化する<br>2. create()を呼び出す |
| **期待結果** | - SidebarUIインスタンスがBaseComponentを継承している |

```typescript
describe('SidebarUI', () => {
  it('should extend BaseComponent and create container', () => {
    // Arrange
    const scene = createMockScene();

    // Act
    const sidebarUI = new SidebarUI(scene, 0, 60);
    sidebarUI.create();

    // Assert
    expect(sidebarUI).toBeInstanceOf(BaseComponent);
    expect(sidebarUI.getContainer()).toBeDefined();
  });
});
```

---

#### TC-0046-031: 受注依頼リスト表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-031 |
| **テスト名** | 受注依頼がアコーディオンセクションで表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-020 |
| **事前条件** | - SidebarUIが生成されている |
| **操作手順** | 1. update({ activeQuests: [...], ... })を呼び出す |
| **期待結果** | - 受注依頼セクションが表示される<br>- 依頼情報が表示される |

```typescript
it('should display active quests in accordion section', () => {
  // Arrange
  const sidebarUI = createSidebarUI();
  sidebarUI.create();

  const mockQuests: IActiveQuest[] = [{
    questId: 'quest-001',
    itemId: 'potion-001',
    requiredQuantity: 2,
    currentQuantity: 1,
    deadline: 3,
    reward: { gold: 50, contribution: 10 },
  }];

  // Act
  sidebarUI.update({
    activeQuests: mockQuests,
    materials: [],
    craftedItems: [],
    currentStorage: 0,
    maxStorage: 20,
  });

  // Assert
  expect(sidebarUI.getQuestsSection()).toBeDefined();
  expect(sidebarUI.getQuestsCount()).toBe(1);
});
```

---

#### TC-0046-032: 素材リスト表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-032 |
| **テスト名** | 素材がアコーディオンセクションで表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-021 |
| **事前条件** | - SidebarUIが生成されている |
| **操作手順** | 1. update({ materials: [...], ... })を呼び出す |
| **期待結果** | - 素材セクションが表示される<br>- 素材情報（名前、数量、品質）が表示される |

```typescript
it('should display materials in accordion section', () => {
  // Arrange
  const sidebarUI = createSidebarUI();
  sidebarUI.create();

  const mockMaterials: IMaterialInstance[] = [
    { materialId: 'herb', name: '薬草', quantity: 5, quality: Quality.C },
    { materialId: 'water', name: '清水', quantity: 3, quality: Quality.B },
  ];

  // Act
  sidebarUI.update({
    activeQuests: [],
    materials: mockMaterials,
    craftedItems: [],
    currentStorage: 8,
    maxStorage: 20,
  });

  // Assert
  expect(sidebarUI.getMaterialsSection()).toBeDefined();
  expect(sidebarUI.getMaterialsCount()).toBe(2);
});
```

---

#### TC-0046-033: 完成品リスト表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-033 |
| **テスト名** | 完成品がアコーディオンセクションで表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-022 |
| **事前条件** | - SidebarUIが生成されている |
| **操作手順** | 1. update({ craftedItems: [...], ... })を呼び出す |
| **期待結果** | - 完成品セクションが表示される<br>- アイテム情報（名前、数量、品質）が表示される |

```typescript
it('should display crafted items in accordion section', () => {
  // Arrange
  const sidebarUI = createSidebarUI();
  sidebarUI.create();

  const mockCraftedItems: ICraftedItem[] = [{
    itemId: 'potion-001',
    name: '回復薬',
    quantity: 2,
    quality: Quality.B,
  }];

  // Act
  sidebarUI.update({
    activeQuests: [],
    materials: [],
    craftedItems: mockCraftedItems,
    currentStorage: 2,
    maxStorage: 20,
  });

  // Assert
  expect(sidebarUI.getCraftedItemsSection()).toBeDefined();
  expect(sidebarUI.getCraftedItemsCount()).toBe(1);
});
```

---

#### TC-0046-034: 保管容量表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-034 |
| **テスト名** | 保管容量が正しく表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-023 |
| **事前条件** | - SidebarUIが生成されている |
| **操作手順** | 1. update({ currentStorage: 12, maxStorage: 20, ... })を呼び出す |
| **期待結果** | - 「保管: 12/20」が表示される |

```typescript
it('should display storage capacity', () => {
  // Arrange
  const sidebarUI = createSidebarUI();
  sidebarUI.create();

  // Act
  sidebarUI.update({
    activeQuests: [],
    materials: [],
    craftedItems: [],
    currentStorage: 12,
    maxStorage: 20,
  });

  // Assert
  expect(sidebarUI.getStorageText()).toBe('保管: 12/20');
});
```

---

#### TC-0046-035: ショップボタン表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-035 |
| **テスト名** | ショップボタンが表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-024 |
| **事前条件** | - SidebarUIが生成されている |
| **操作手順** | 1. create()を呼び出す |
| **期待結果** | - ショップボタンがサイドバー下部に表示される |

```typescript
it('should display shop button', () => {
  // Arrange
  const sidebarUI = createSidebarUI();

  // Act
  sidebarUI.create();

  // Assert
  expect(sidebarUI.getShopButton()).toBeDefined();
});
```

---

#### TC-0046-036: セクション折りたたみ

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-036 |
| **テスト名** | セクションの折りたたみ切り替えができる |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-020 |
| **事前条件** | - SidebarUIが生成されている |
| **操作手順** | 1. toggleSection('quests')を呼び出す |
| **期待結果** | - セクションが折りたたまれる/展開される |

```typescript
it('should toggle section collapse state', () => {
  // Arrange
  const sidebarUI = createSidebarUI();
  sidebarUI.create();

  // Act
  sidebarUI.toggleSection('quests');

  // Assert
  expect(sidebarUI.isSectionCollapsed('quests')).toBe(true);

  // Act - toggle back
  sidebarUI.toggleSection('quests');

  // Assert
  expect(sidebarUI.isSectionCollapsed('quests')).toBe(false);
});
```

---

### 2.4 フッターUI（FooterUI）

#### TC-0046-040: FooterUIの生成

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-040 |
| **テスト名** | FooterUI が BaseComponent を継承して正しく生成される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-030 |
| **事前条件** | - モックシーンが設定されている |
| **操作手順** | 1. FooterUIをインスタンス化する<br>2. create()を呼び出す |
| **期待結果** | - FooterUIインスタンスがBaseComponentを継承している |

```typescript
describe('FooterUI', () => {
  it('should extend BaseComponent and create container', () => {
    // Arrange
    const scene = createMockScene();

    // Act
    const footerUI = new FooterUI(scene, 0, 600);
    footerUI.create();

    // Assert
    expect(footerUI).toBeInstanceOf(BaseComponent);
    expect(footerUI.getContainer()).toBeDefined();
  });
});
```

---

#### TC-0046-041: フェーズインジケーター表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-041 |
| **テスト名** | 4フェーズのインジケーターが表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-030 |
| **事前条件** | - FooterUIが生成されている |
| **操作手順** | 1. create()を呼び出す |
| **期待結果** | - 4つのフェーズインジケーターが表示される |

```typescript
it('should display 4 phase indicators', () => {
  // Arrange
  const footerUI = createFooterUI();

  // Act
  footerUI.create();

  // Assert
  expect(footerUI.getPhaseIndicators()).toHaveLength(4);
});
```

---

#### TC-0046-042: 現在フェーズハイライト（QUEST_ACCEPT）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-042 |
| **テスト名** | QUEST_ACCEPTフェーズがハイライトされる |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-031 |
| **事前条件** | - FooterUIが生成されている |
| **操作手順** | 1. updatePhaseIndicator(QUEST_ACCEPT, [])を呼び出す |
| **期待結果** | - QUEST_ACCEPTがハイライト状態になる |

```typescript
it('should highlight QUEST_ACCEPT phase', () => {
  // Arrange
  const footerUI = createFooterUI();
  footerUI.create();

  // Act
  footerUI.updatePhaseIndicator(GamePhase.QUEST_ACCEPT, []);

  // Assert
  expect(footerUI.getCurrentPhaseIndicatorState()).toBe('CURRENT');
  expect(footerUI.getPhaseIndicatorState(GamePhase.QUEST_ACCEPT)).toBe('CURRENT');
});
```

---

#### TC-0046-043: 完了フェーズ表示

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-043 |
| **テスト名** | 完了したフェーズにチェックマークが表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-030 |
| **事前条件** | - FooterUIが生成されている |
| **操作手順** | 1. updatePhaseIndicator(GATHERING, [QUEST_ACCEPT])を呼び出す |
| **期待結果** | - QUEST_ACCEPTがCOMPLETED状態になる<br>- GATHERINGがCURRENT状態になる |

```typescript
it('should mark completed phases with checkmark', () => {
  // Arrange
  const footerUI = createFooterUI();
  footerUI.create();

  // Act
  footerUI.updatePhaseIndicator(GamePhase.GATHERING, [GamePhase.QUEST_ACCEPT]);

  // Assert
  expect(footerUI.getPhaseIndicatorState(GamePhase.QUEST_ACCEPT)).toBe('COMPLETED');
  expect(footerUI.getPhaseIndicatorState(GamePhase.GATHERING)).toBe('CURRENT');
});
```

---

#### TC-0046-044: 手札表示エリア

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-044 |
| **テスト名** | 手札表示エリアが配置される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-032 |
| **事前条件** | - FooterUIが生成されている |
| **操作手順** | 1. create()を呼び出す |
| **期待結果** | - 最大5枚のカードを表示可能なエリアが配置される |

```typescript
it('should have hand display area for up to 5 cards', () => {
  // Arrange
  const footerUI = createFooterUI();

  // Act
  footerUI.create();

  // Assert
  expect(footerUI.getHandDisplayArea()).toBeDefined();
  expect(footerUI.getHandDisplayAreaCapacity()).toBe(5);
});
```

---

#### TC-0046-045: 次へボタンラベル（QUEST_ACCEPT→採取へ）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-045 |
| **テスト名** | QUEST_ACCEPTフェーズで「採取へ」ボタンが表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-033 |
| **事前条件** | - FooterUIが生成されている |
| **操作手順** | 1. updateNextButton('採取へ', true)を呼び出す |
| **期待結果** | - ボタンラベルが「採取へ」になる |

```typescript
it('should display "採取へ" button in QUEST_ACCEPT phase', () => {
  // Arrange
  const footerUI = createFooterUI();
  footerUI.create();

  // Act
  footerUI.updateNextButton('採取へ', true);

  // Assert
  expect(footerUI.getNextButtonLabel()).toBe('採取へ');
});
```

---

#### TC-0046-046: 次へボタンラベル（GATHERING→調合へ）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-046 |
| **テスト名** | GATHERINGフェーズで「調合へ」ボタンが表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-033 |
| **事前条件** | - FooterUIが生成されている |
| **操作手順** | 1. updateNextButton('調合へ', true)を呼び出す |
| **期待結果** | - ボタンラベルが「調合へ」になる |

```typescript
it('should display "調合へ" button in GATHERING phase', () => {
  // Arrange
  const footerUI = createFooterUI();
  footerUI.create();

  // Act
  footerUI.updateNextButton('調合へ', true);

  // Assert
  expect(footerUI.getNextButtonLabel()).toBe('調合へ');
});
```

---

#### TC-0046-047: 次へボタンラベル（ALCHEMY→納品へ）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-047 |
| **テスト名** | ALCHEMYフェーズで「納品へ」ボタンが表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-033 |
| **事前条件** | - FooterUIが生成されている |
| **操作手順** | 1. updateNextButton('納品へ', true)を呼び出す |
| **期待結果** | - ボタンラベルが「納品へ」になる |

```typescript
it('should display "納品へ" button in ALCHEMY phase', () => {
  // Arrange
  const footerUI = createFooterUI();
  footerUI.create();

  // Act
  footerUI.updateNextButton('納品へ', true);

  // Assert
  expect(footerUI.getNextButtonLabel()).toBe('納品へ');
});
```

---

#### TC-0046-048: 次へボタンラベル（DELIVERY→日終了）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-048 |
| **テスト名** | DELIVERYフェーズで「日終了」ボタンが表示される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-033 |
| **事前条件** | - FooterUIが生成されている |
| **操作手順** | 1. updateNextButton('日終了', true)を呼び出す |
| **期待結果** | - ボタンラベルが「日終了」になる |

```typescript
it('should display "日終了" button in DELIVERY phase', () => {
  // Arrange
  const footerUI = createFooterUI();
  footerUI.create();

  // Act
  footerUI.updateNextButton('日終了', true);

  // Assert
  expect(footerUI.getNextButtonLabel()).toBe('日終了');
});
```

---

#### TC-0046-049: 次へボタンクリックハンドラ

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-049 |
| **テスト名** | 次へボタンのクリックハンドラが呼び出される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-033 |
| **事前条件** | - FooterUIが生成されている |
| **操作手順** | 1. onNextClick(callback)でハンドラ登録<br>2. 次へボタンをクリック |
| **期待結果** | - コールバックが呼び出される |

```typescript
it('should call onNextClick callback when button is clicked', () => {
  // Arrange
  const footerUI = createFooterUI();
  footerUI.create();
  const mockCallback = vi.fn();

  // Act
  footerUI.onNextClick(mockCallback);
  footerUI.simulateNextButtonClick();

  // Assert
  expect(mockCallback).toHaveBeenCalled();
});
```

---

### 2.5 フェーズUI切り替え

#### TC-0046-050: フェーズUI配置

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-050 |
| **テスト名** | コンテンツエリアにフェーズUIコンテナが配置される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-040 |
| **事前条件** | - MainSceneが生成されている |
| **操作手順** | 1. createPhaseUIs()を呼び出す |
| **期待結果** | - contentContainerが指定座標に配置される |

```typescript
it('should place content container at correct position', () => {
  // Arrange
  const scene = createMockMainScene();
  scene.create();

  // Assert
  expect(scene.contentContainer.x).toBe(200); // サイドバー幅
  expect(scene.contentContainer.y).toBe(60);  // ヘッダー高さ
});
```

---

#### TC-0046-051: フェーズUI切り替え

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-051 |
| **テスト名** | フェーズ変更時にUIが切り替わる |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-041 |
| **事前条件** | - MainSceneが生成されている |
| **操作手順** | 1. showPhase(GATHERING)を呼び出す |
| **期待結果** | - GATHERINGフェーズUIのみ表示<br>- 他のフェーズUIは非表示 |

```typescript
it('should show only current phase UI when phase changes', () => {
  // Arrange
  const scene = createMockMainScene();
  scene.create();

  // Act
  scene.showPhase(GamePhase.GATHERING);

  // Assert
  expect(scene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(true);
  expect(scene.isPhaseUIVisible(GamePhase.QUEST_ACCEPT)).toBe(false);
  expect(scene.isPhaseUIVisible(GamePhase.ALCHEMY)).toBe(false);
  expect(scene.isPhaseUIVisible(GamePhase.DELIVERY)).toBe(false);
});
```

---

### 2.6 イベント連携

#### TC-0046-060: PHASE_CHANGEDイベント購読

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-060 |
| **テスト名** | PHASE_CHANGEDイベントでUIが更新される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-050 |
| **事前条件** | - MainSceneが生成されている |
| **操作手順** | 1. EventBusでPHASE_CHANGEDを発行 |
| **期待結果** | - フェーズインジケーターが更新される<br>- コンテンツエリアのUIが切り替わる |

```typescript
it('should update UI on PHASE_CHANGED event', () => {
  // Arrange
  const scene = createMockMainScene();
  scene.create();

  // Act
  scene['eventBus'].emit(GameEventType.PHASE_CHANGED, {
    type: GameEventType.PHASE_CHANGED,
    previousPhase: GamePhase.QUEST_ACCEPT,
    newPhase: GamePhase.GATHERING,
    timestamp: Date.now(),
  });

  // Assert
  expect(scene.footerUI.getPhaseIndicatorState(GamePhase.GATHERING)).toBe('CURRENT');
  expect(scene.isPhaseUIVisible(GamePhase.GATHERING)).toBe(true);
});
```

---

#### TC-0046-061: DAY_STARTEDイベント購読

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-061 |
| **テスト名** | DAY_STARTEDイベントで日数表示が更新される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-051 |
| **事前条件** | - MainSceneが生成されている |
| **操作手順** | 1. EventBusでDAY_STARTEDを発行 |
| **期待結果** | - ヘッダーの残り日数表示が更新される |

```typescript
it('should update remaining days on DAY_STARTED event', () => {
  // Arrange
  const scene = createMockMainScene();
  scene.create();

  // Act
  scene['eventBus'].emit(GameEventType.DAY_STARTED, {
    type: GameEventType.DAY_STARTED,
    day: 2,
    remainingDays: 29,
    timestamp: Date.now(),
  });

  // Assert
  expect(scene.headerUI.getRemainingDaysText()).toBe('残り: 29日');
});
```

---

#### TC-0046-062: 状態変更イベント購読

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-062 |
| **テスト名** | StateManager状態変更でヘッダー・サイドバーが更新される |
| **カテゴリ** | 正常系 |
| **要件ID** | REQ-0046-052 |
| **事前条件** | - MainSceneが生成されている |
| **操作手順** | 1. StateManagerの状態を変更 |
| **期待結果** | - ヘッダーの表示が更新される<br>- サイドバーの表示が更新される |

```typescript
it('should update header and sidebar on state change', () => {
  // Arrange
  const scene = createMockMainScene();
  scene.create();

  // Act
  scene['stateManager'].updateState({ gold: 1000 });
  scene.updateHeader();

  // Assert
  expect(scene.headerUI.getGoldText()).toBe('1000G');
});
```

---

## 3. 異常系テストケース

### 3.1 無効なフェーズ

#### TC-0046-E01: 無効なフェーズへの切り替え

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-E01 |
| **テスト名** | 無効なフェーズを指定した場合エラーが発生する |
| **カテゴリ** | 異常系 |
| **要件ID** | REQ-0046-041 |
| **事前条件** | - MainSceneが生成されている |
| **操作手順** | 1. showPhase('INVALID_PHASE')を呼び出す |
| **期待結果** | - エラーがスローされる、またはログ出力 |

```typescript
describe('Error Handling', () => {
  it('should handle invalid phase gracefully', () => {
    // Arrange
    const scene = createMockMainScene();
    scene.create();

    // Act & Assert
    expect(() => {
      scene.showPhase('INVALID_PHASE' as GamePhase);
    }).toThrow();
  });
});
```

---

#### TC-0046-E02: フェーズインジケーター更新時の無効フェーズ

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-E02 |
| **テスト名** | 無効なフェーズでインジケーター更新時にエラー処理される |
| **カテゴリ** | 異常系 |
| **要件ID** | REQ-0046-031 |
| **事前条件** | - FooterUIが生成されている |
| **操作手順** | 1. updatePhaseIndicator('INVALID')を呼び出す |
| **期待結果** | - エラーが適切に処理される |

```typescript
it('should handle invalid phase in updatePhaseIndicator', () => {
  // Arrange
  const footerUI = createFooterUI();
  footerUI.create();

  // Act & Assert
  expect(() => {
    footerUI.updatePhaseIndicator('INVALID' as GamePhase, []);
  }).toThrow();
});
```

---

### 3.2 サービス初期化失敗

#### TC-0046-E03: StateManager未初期化

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-E03 |
| **テスト名** | StateManager未初期化時にエラー処理される |
| **カテゴリ** | 異常系 |
| **要件ID** | REQ-0046-002 |
| **事前条件** | - ServiceContainerにStateManagerが未登録 |
| **操作手順** | 1. MainSceneのcreate()を呼び出す |
| **期待結果** | - 適切なエラーメッセージが出力される |

```typescript
it('should handle missing StateManager', () => {
  // Arrange
  const scene = createMockMainSceneWithoutServices();

  // Act & Assert
  expect(() => scene.create()).toThrow('StateManager is required');
});
```

---

#### TC-0046-E04: GameFlowManager未初期化

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-E04 |
| **テスト名** | GameFlowManager未初期化時にエラー処理される |
| **カテゴリ** | 異常系 |
| **要件ID** | REQ-0046-002 |
| **事前条件** | - ServiceContainerにGameFlowManagerが未登録 |
| **操作手順** | 1. MainSceneのcreate()を呼び出す |
| **期待結果** | - 適切なエラーメッセージが出力される |

```typescript
it('should handle missing GameFlowManager', () => {
  // Arrange
  const scene = createMockMainSceneWithoutGameFlowManager();

  // Act & Assert
  expect(() => scene.create()).toThrow('GameFlowManager is required');
});
```

---

#### TC-0046-E05: EventBus未初期化

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-E05 |
| **テスト名** | EventBus未初期化時にエラー処理される |
| **カテゴリ** | 異常系 |
| **要件ID** | REQ-0046-002 |
| **事前条件** | - ServiceContainerにEventBusが未登録 |
| **操作手順** | 1. MainSceneのcreate()を呼び出す |
| **期待結果** | - 適切なエラーメッセージが出力される |

```typescript
it('should handle missing EventBus', () => {
  // Arrange
  const scene = createMockMainSceneWithoutEventBus();

  // Act & Assert
  expect(() => scene.create()).toThrow('EventBus is required');
});
```

---

### 3.3 コンポーネント生成エラー

#### TC-0046-E06: HeaderUI生成失敗

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-E06 |
| **テスト名** | 無効なシーンでHeaderUI生成時にエラーが発生する |
| **カテゴリ** | 異常系 |
| **要件ID** | REQ-0046-001 |
| **事前条件** | - シーンがnull |
| **操作手順** | 1. new HeaderUI(null, 0, 0)を呼び出す |
| **期待結果** | - 'scene is required'エラーがスローされる |

```typescript
it('should throw error when scene is null for HeaderUI', () => {
  // Act & Assert
  expect(() => new HeaderUI(null as any, 0, 0)).toThrow('scene is required');
});
```

---

#### TC-0046-E07: SidebarUI生成失敗

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-E07 |
| **テスト名** | 無効なシーンでSidebarUI生成時にエラーが発生する |
| **カテゴリ** | 異常系 |
| **要件ID** | REQ-0046-001 |
| **事前条件** | - シーンがundefined |
| **操作手順** | 1. new SidebarUI(undefined, 0, 60)を呼び出す |
| **期待結果** | - 'scene is required'エラーがスローされる |

```typescript
it('should throw error when scene is undefined for SidebarUI', () => {
  // Act & Assert
  expect(() => new SidebarUI(undefined as any, 0, 60)).toThrow('scene is required');
});
```

---

#### TC-0046-E08: FooterUI生成失敗

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-E08 |
| **テスト名** | 無効な座標でFooterUI生成時にエラーが発生する |
| **カテゴリ** | 異常系 |
| **要件ID** | REQ-0046-001 |
| **事前条件** | - 座標がNaN |
| **操作手順** | 1. new FooterUI(scene, NaN, 600)を呼び出す |
| **期待結果** | - 'Invalid position'エラーがスローされる |

```typescript
it('should throw error when position is NaN for FooterUI', () => {
  // Arrange
  const scene = createMockScene();

  // Act & Assert
  expect(() => new FooterUI(scene, NaN, 600)).toThrow('Invalid position');
});
```

---

## 4. 境界値テストケース

### 4.1 昇格ゲージ境界値

#### TC-0046-B01: 昇格ゲージ下限値（0）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-B01 |
| **テスト名** | 昇格ゲージ0で赤系色が適用される |
| **カテゴリ** | 境界値 |
| **要件ID** | REQ-0046-011 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ promotionGauge: 0, ... })を呼び出す |
| **期待結果** | - ゲージ色が赤系（0xFF6B6B）になる<br>- 「0/100」が表示される |

```typescript
describe('Boundary Values', () => {
  it('should apply red color when promotion gauge is 0', () => {
    // Arrange
    const headerUI = createHeaderUI();
    headerUI.create();

    // Act
    headerUI.update({ ...defaultData, promotionGauge: 0 });

    // Assert
    expect(headerUI.getPromotionGaugeColor()).toBe(0xFF6B6B);
    expect(headerUI.getPromotionGaugeText()).toBe('0/100');
  });
});
```

---

#### TC-0046-B02: 昇格ゲージ境界値（30）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-B02 |
| **テスト名** | 昇格ゲージ30で黄系色に切り替わる |
| **カテゴリ** | 境界値 |
| **要件ID** | REQ-0046-011 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ promotionGauge: 30, ... })を呼び出す |
| **期待結果** | - ゲージ色が黄系（0xFFD93D）になる |

```typescript
it('should apply yellow color when promotion gauge is exactly 30', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, promotionGauge: 30 });

  // Assert
  expect(headerUI.getPromotionGaugeColor()).toBe(0xFFD93D);
});
```

---

#### TC-0046-B03: 昇格ゲージ境界値（60）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-B03 |
| **テスト名** | 昇格ゲージ60で緑系色に切り替わる |
| **カテゴリ** | 境界値 |
| **要件ID** | REQ-0046-011 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ promotionGauge: 60, ... })を呼び出す |
| **期待結果** | - ゲージ色が緑系（0x6BCB77）になる |

```typescript
it('should apply green color when promotion gauge is exactly 60', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, promotionGauge: 60 });

  // Assert
  expect(headerUI.getPromotionGaugeColor()).toBe(0x6BCB77);
});
```

---

#### TC-0046-B04: 昇格ゲージ上限値（100）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-B04 |
| **テスト名** | 昇格ゲージ100で水色が適用される |
| **カテゴリ** | 境界値 |
| **要件ID** | REQ-0046-011 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ promotionGauge: 100, ... })を呼び出す |
| **期待結果** | - ゲージ色が水色（0x4ECDC4）になる<br>- 「100/100」が表示される |

```typescript
it('should apply cyan color when promotion gauge is 100', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, promotionGauge: 100 });

  // Assert
  expect(headerUI.getPromotionGaugeColor()).toBe(0x4ECDC4);
  expect(headerUI.getPromotionGaugeText()).toBe('100/100');
});
```

---

### 4.2 残り日数境界値

#### TC-0046-B05: 残り日数境界値（11日）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-B05 |
| **テスト名** | 残り日数11日で白色が適用される |
| **カテゴリ** | 境界値 |
| **要件ID** | REQ-0046-012 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ remainingDays: 11, ... })を呼び出す |
| **期待結果** | - 日数表示が白色になる |

```typescript
it('should apply white color when remaining days is 11', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, remainingDays: 11 });

  // Assert
  expect(headerUI.getRemainingDaysColor()).toBe(0xFFFFFF);
});
```

---

#### TC-0046-B06: 残り日数境界値（10日）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-B06 |
| **テスト名** | 残り日数10日で黄色が適用される |
| **カテゴリ** | 境界値 |
| **要件ID** | REQ-0046-012 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ remainingDays: 10, ... })を呼び出す |
| **期待結果** | - 日数表示が黄色になる |

```typescript
it('should apply yellow color when remaining days is 10', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, remainingDays: 10 });

  // Assert
  expect(headerUI.getRemainingDaysColor()).toBe(0xFFD93D);
});
```

---

#### TC-0046-B07: 残り日数境界値（6日）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-B07 |
| **テスト名** | 残り日数6日で黄色が適用される |
| **カテゴリ** | 境界値 |
| **要件ID** | REQ-0046-012 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ remainingDays: 6, ... })を呼び出す |
| **期待結果** | - 日数表示が黄色になる |

```typescript
it('should apply yellow color when remaining days is 6', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, remainingDays: 6 });

  // Assert
  expect(headerUI.getRemainingDaysColor()).toBe(0xFFD93D);
});
```

---

#### TC-0046-B08: 残り日数境界値（5日）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-B08 |
| **テスト名** | 残り日数5日で赤色が適用される |
| **カテゴリ** | 境界値 |
| **要件ID** | REQ-0046-012 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ remainingDays: 5, ... })を呼び出す |
| **期待結果** | - 日数表示が赤色（0xFF6B6B）になる |

```typescript
it('should apply red color when remaining days is 5', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, remainingDays: 5 });

  // Assert
  expect(headerUI.getRemainingDaysColor()).toBe(0xFF6B6B);
});
```

---

#### TC-0046-B09: 残り日数境界値（3日）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-B09 |
| **テスト名** | 残り日数3日で点滅が開始される |
| **カテゴリ** | 境界値 |
| **要件ID** | REQ-0046-012 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ remainingDays: 3, ... })を呼び出す |
| **期待結果** | - 日数表示が明るい赤（0xFF0000）で点滅する |

```typescript
it('should apply bright red with blink when remaining days is 3', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, remainingDays: 3 });

  // Assert
  expect(headerUI.getRemainingDaysColor()).toBe(0xFF0000);
  expect(headerUI.isRemainingDaysBlinking()).toBe(true);
});
```

---

#### TC-0046-B10: 残り日数下限値（1日）

| 項目 | 内容 |
|------|------|
| **テストID** | TC-0046-B10 |
| **テスト名** | 残り日数1日で点滅表示される |
| **カテゴリ** | 境界値 |
| **要件ID** | REQ-0046-012 |
| **事前条件** | - HeaderUIが生成されている |
| **操作手順** | 1. update({ remainingDays: 1, ... })を呼び出す |
| **期待結果** | - 日数表示が明るい赤（0xFF0000）で点滅する |

```typescript
it('should apply bright red with blink when remaining days is 1', () => {
  // Arrange
  const headerUI = createHeaderUI();
  headerUI.create();

  // Act
  headerUI.update({ ...defaultData, remainingDays: 1 });

  // Assert
  expect(headerUI.getRemainingDaysColor()).toBe(0xFF0000);
  expect(headerUI.isRemainingDaysBlinking()).toBe(true);
  expect(headerUI.getRemainingDaysText()).toBe('残り: 1日');
});
```

---

## 5. テストスイート構造（参考）

```typescript
// tests/unit/presentation/main-scene.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MainScene } from '@presentation/scenes/MainScene';
import { HeaderUI } from '@presentation/ui/components/HeaderUI';
import { SidebarUI } from '@presentation/ui/components/SidebarUI';
import { FooterUI } from '@presentation/ui/components/FooterUI';
import { BaseComponent } from '@presentation/ui/components/BaseComponent';
import { GamePhase, GuildRank, Quality } from '@shared/types';
import { GameEventType } from '@shared/types/events';

describe('MainScene共通レイアウト', () => {
  describe('MainScene', () => {
    describe('create()', () => {
      // TC-0046-001, TC-0046-002
    });

    describe('showPhase()', () => {
      // TC-0046-050, TC-0046-051, TC-0046-E01
    });

    describe('Event Handling', () => {
      // TC-0046-060, TC-0046-061, TC-0046-062
    });
  });

  describe('HeaderUI', () => {
    describe('create()', () => {
      // TC-0046-010
    });

    describe('update()', () => {
      describe('ランク表示', () => {
        // TC-0046-011
      });

      describe('昇格ゲージ表示', () => {
        // TC-0046-012, TC-0046-013, TC-0046-014, TC-0046-015, TC-0046-016
        // 境界値: TC-0046-B01, TC-0046-B02, TC-0046-B03, TC-0046-B04
      });

      describe('残り日数表示', () => {
        // TC-0046-017, TC-0046-018, TC-0046-019, TC-0046-020
        // 境界値: TC-0046-B05, TC-0046-B06, TC-0046-B07, TC-0046-B08, TC-0046-B09, TC-0046-B10
      });

      describe('所持金表示', () => {
        // TC-0046-021
      });

      describe('行動ポイント表示', () => {
        // TC-0046-022
      });

      describe('全体更新', () => {
        // TC-0046-023
      });
    });

    describe('Error Handling', () => {
      // TC-0046-E06
    });
  });

  describe('SidebarUI', () => {
    describe('create()', () => {
      // TC-0046-030
    });

    describe('update()', () => {
      // TC-0046-031, TC-0046-032, TC-0046-033, TC-0046-034
    });

    describe('toggleSection()', () => {
      // TC-0046-036
    });

    describe('ショップボタン', () => {
      // TC-0046-035
    });

    describe('Error Handling', () => {
      // TC-0046-E07
    });
  });

  describe('FooterUI', () => {
    describe('create()', () => {
      // TC-0046-040, TC-0046-041, TC-0046-044
    });

    describe('updatePhaseIndicator()', () => {
      // TC-0046-042, TC-0046-043, TC-0046-E02
    });

    describe('updateNextButton()', () => {
      // TC-0046-045, TC-0046-046, TC-0046-047, TC-0046-048
    });

    describe('onNextClick()', () => {
      // TC-0046-049
    });

    describe('Error Handling', () => {
      // TC-0046-E08
    });
  });

  describe('Service Initialization Errors', () => {
    // TC-0046-E03, TC-0046-E04, TC-0046-E05
  });
});
```

---

## 6. モック定義（参考）

```typescript
// tests/mocks/phaser-scene.mock.ts

export const createMockScene = () => ({
  add: {
    container: vi.fn().mockReturnValue({
      setVisible: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
      add: vi.fn(),
      x: 0,
      y: 0,
    }),
    text: vi.fn().mockReturnValue({
      setText: vi.fn().mockReturnThis(),
      setStyle: vi.fn().mockReturnThis(),
      setColor: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    }),
    rectangle: vi.fn().mockReturnValue({
      setFillStyle: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    }),
  },
  cameras: {
    main: {
      centerX: 640,
      centerY: 360,
      width: 1280,
      height: 720,
    },
  },
  rexUI: {
    add: {
      sizer: vi.fn().mockReturnValue({
        layout: vi.fn(),
        add: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      label: vi.fn().mockReturnValue({
        layout: vi.fn(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      roundRectangle: vi.fn().mockReturnValue({
        setFillStyle: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      }),
      scrollablePanel: vi.fn().mockReturnValue({
        layout: vi.fn(),
        destroy: vi.fn(),
      }),
    },
  },
  tweens: {
    add: vi.fn(),
  },
});

// tests/mocks/state-manager.mock.ts

export const createMockStateManager = () => ({
  getState: vi.fn().mockReturnValue({
    currentRank: GuildRank.E,
    promotionGauge: 35,
    remainingDays: 25,
    currentDay: 6,
    currentPhase: GamePhase.QUEST_ACCEPT,
    gold: 500,
    actionPoints: 3,
    comboCount: 0,
    rankHp: 100,
    isPromotionTest: false,
  }),
  updateState: vi.fn(),
  setPhase: vi.fn(),
});

// tests/mocks/game-flow-manager.mock.ts

export const createMockGameFlowManager = () => ({
  getCurrentPhase: vi.fn().mockReturnValue(GamePhase.QUEST_ACCEPT),
  canAdvancePhase: vi.fn().mockReturnValue(true),
  startPhase: vi.fn(),
  endPhase: vi.fn(),
});

// tests/mocks/event-bus.mock.ts

export const createMockEventBus = () => ({
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
});
```

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-21 | 1.0.0 | 初版作成（50テストケース） |
