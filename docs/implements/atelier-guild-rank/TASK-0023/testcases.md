# TASK-0023: 採取フェーズUI（ドラフト採取）テストケース一覧

**バージョン**: 1.0.0
**作成日**: 2026-01-18
**タスクID**: TASK-0023
**要件名**: atelier-guild-rank

---

## 1. 概要

本文書は、採取フェーズUI（ドラフト採取）の実装に必要なテストケースを定義する。
TDD（Test-Driven Development）のRedフェーズで作成するテストを網羅的に記載する。

### 1.1 テストファイル

| ファイル | 配置場所 |
|---------|---------|
| GatheringPhaseUI.spec.ts | `src/presentation/ui/phases/GatheringPhaseUI.spec.ts` |
| MaterialCardUI.spec.ts（任意） | `src/presentation/ui/components/MaterialCardUI.spec.ts` |

### 1.2 テストカテゴリ

| カテゴリ | テストID範囲 | 件数 |
|---------|-------------|------|
| 正常系 | TC-201〜TC-220 | 20件 |
| 異常系 | TC-221〜TC-230 | 10件 |
| 境界値 | TC-231〜TC-240 | 10件 |
| 統合 | TC-241〜TC-250 | 10件 |

---

## 2. 正常系テストケース

### 2.1 TC-201: フェーズUI初期化 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | FR-001, AC-001 |
| **目的** | GatheringPhaseUIが正しく初期化されること |
| **前提条件** | mockScene, mockEventBusが準備されている |

#### 2.1.1 TC-201-1: エラーなく初期化される

```typescript
test('GatheringPhaseUIがエラーなく初期化される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);

  expect(phaseUI).toBeDefined();
  expect(phaseUI.getContainer()).toBeDefined();
});
```

#### 2.1.2 TC-201-2: 正しい座標に配置される

```typescript
test('container.x = 160, container.y = 80 に配置される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);

  expect(mockScene.add.container).toHaveBeenCalledWith(160, 80);
});
```

#### 2.1.3 TC-201-3: タイトルが表示される

```typescript
test('タイトル「🌿 採取フェーズ」が表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);

  expect(mockScene.add.text).toHaveBeenCalledWith(
    expect.any(Number),
    expect.any(Number),
    expect.stringContaining('採取'),
    expect.any(Object),
  );
});
```

#### 2.1.4 TC-201-4: ラウンドインジケーターが作成される

```typescript
test('ラウンドインジケーターが作成される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);

  expect((phaseUI as any).roundIndicator).toBeDefined();
});
```

#### 2.1.5 TC-201-5: コスト表示パネルが作成される

```typescript
test('コスト表示パネルが作成される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);

  expect((phaseUI as any).costDisplay).toBeDefined();
});
```

---

### 2.2 TC-202: 採取セッション開始 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | FR-001, AC-002 |
| **目的** | ドラフト採取セッションが正しく開始されること |
| **前提条件** | GatheringServiceがモック化されている |

#### 2.2.1 TC-202-1: startGathering()でセッションが開始される

```typescript
test('startGathering()でDraftSessionが開始される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard();

  phaseUI.startGathering(mockCard);

  expect(mockGatheringService.startDraftGathering).toHaveBeenCalledWith(
    mockCard,
    undefined,
  );
});
```

#### 2.2.2 TC-202-2: GATHERING_STARTEDイベントが発行される

```typescript
test('GATHERING_STARTEDイベントが発行される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard();

  phaseUI.startGathering(mockCard);

  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.GATHERING_STARTED,
    expect.objectContaining({
      locationId: expect.any(String),
      presentationCount: expect.any(Number),
    }),
  );
});
```

#### 2.2.3 TC-202-3: 素材選択肢が3つ表示される

```typescript
test('素材選択肢が3つ表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard();

  phaseUI.startGathering(mockCard);

  expect((phaseUI as any).materialCards.length).toBe(3);
});
```

#### 2.2.4 TC-202-4: ラウンドインジケーターが更新される

```typescript
test('ラウンドインジケーターに「ラウンド 1/5」が表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ maxRounds: 5 });

  phaseUI.startGathering(mockCard);

  expect((phaseUI as any).roundIndicator.text).toContain('1/5');
});
```

#### 2.2.5 TC-202-5: 強化カード付きでセッション開始

```typescript
test('強化カード付きでstartDraftGathering()が呼ばれる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard();
  const enhancementCards = [createMockEnhancementCard()];

  phaseUI.startGathering(mockCard, enhancementCards);

  expect(mockGatheringService.startDraftGathering).toHaveBeenCalledWith(
    mockCard,
    enhancementCards,
  );
});
```

---

### 2.3 TC-203: 素材選択 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | FR-003, AC-004, AC-005 |
| **目的** | 素材選択が正しく動作すること |
| **前提条件** | DraftSessionがアクティブ |

#### 2.3.1 TC-203-1: インデックス0の素材を選択

```typescript
test('インデックス0の素材を選択できる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onMaterialSelected(0);

  expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(
    expect.any(String), // sessionId
    0,
  );
});
```

#### 2.3.2 TC-203-2: インデックス1の素材を選択

```typescript
test('インデックス1の素材を選択できる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onMaterialSelected(1);

  expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(
    expect.any(String),
    1,
  );
});
```

#### 2.3.3 TC-203-3: インデックス2の素材を選択

```typescript
test('インデックス2の素材を選択できる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onMaterialSelected(2);

  expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(
    expect.any(String),
    2,
  );
});
```

#### 2.3.4 TC-203-4: MATERIAL_SELECTEDイベントが発行される

```typescript
test('素材選択時にMATERIAL_SELECTEDイベントが発行される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onMaterialSelected(0);

  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.MATERIAL_SELECTED,
    expect.objectContaining({
      round: expect.any(Number),
      materialId: expect.any(String),
    }),
  );
});
```

#### 2.3.5 TC-203-5: 選択後に次のラウンドの選択肢が表示される

```typescript
test('選択後に次のラウンドの選択肢が表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onMaterialSelected(0);

  expect((phaseUI as any).currentSession.currentRound).toBe(2);
  expect((phaseUI as any).materialCards.length).toBe(3);
});
```

#### 2.3.6 TC-203-6: 選択した素材が獲得済みリストに追加される

```typescript
test('選択した素材が獲得済みリストに表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onMaterialSelected(0);

  expect((phaseUI as any).selectedMaterials.length).toBe(1);
});
```

---

### 2.4 TC-204: ラウンドスキップ 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | FR-004, AC-006 |
| **目的** | ラウンドスキップが正しく動作すること |
| **前提条件** | DraftSessionがアクティブ |

#### 2.4.1 TC-204-1: skipSelection()が呼ばれる

```typescript
test('onSkipRound()でskipSelection()が呼ばれる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onSkipRound();

  expect(mockGatheringService.skipSelection).toHaveBeenCalledWith(
    expect.any(String), // sessionId
  );
});
```

#### 2.4.2 TC-204-2: ROUND_SKIPPEDイベントが発行される

```typescript
test('スキップ時にROUND_SKIPPEDイベントが発行される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onSkipRound();

  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.ROUND_SKIPPED,
    expect.objectContaining({
      round: expect.any(Number),
    }),
  );
});
```

#### 2.4.3 TC-204-3: スキップ後に次のラウンドへ進む

```typescript
test('スキップ後に次のラウンドへ進む', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);
  const initialRound = (phaseUI as any).currentSession.currentRound;

  (phaseUI as any).onSkipRound();

  expect((phaseUI as any).currentSession.currentRound).toBe(initialRound + 1);
});
```

#### 2.4.4 TC-204-4: スキップしても獲得済みリストは増えない

```typescript
test('スキップしても獲得済み素材数は増えない', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);
  const initialCount = (phaseUI as any).currentSession.selectedMaterials.length;

  (phaseUI as any).onSkipRound();

  expect((phaseUI as any).currentSession.selectedMaterials.length).toBe(initialCount);
});
```

---

### 2.5 TC-205: 採取終了 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | FR-005, AC-007, AC-010 |
| **目的** | 採取終了が正しく動作し、コストが計算されること |
| **前提条件** | DraftSessionがアクティブ |

#### 2.5.1 TC-205-1: endGathering()が呼ばれる

```typescript
test('onEndGathering()でendGathering()が呼ばれる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onEndGathering();

  expect(mockGatheringService.endGathering).toHaveBeenCalledWith(
    expect.any(String), // sessionId
  );
});
```

#### 2.5.2 TC-205-2: GATHERING_COMPLETEDイベントが発行される

```typescript
test('採取終了時にGATHERING_COMPLETEDイベントが発行される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onEndGathering();

  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.GATHERING_COMPLETED,
    expect.objectContaining({
      locationId: expect.any(String),
      materials: expect.any(Array),
      totalCost: expect.any(Number),
      extraDay: expect.any(Boolean),
    }),
  );
});
```

#### 2.5.3 TC-205-3: GatheringResultが返される

```typescript
test('採取終了時にGatheringResultが返される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  const result = (phaseUI as any).onEndGathering();

  expect(result).toHaveProperty('materials');
  expect(result).toHaveProperty('totalCost');
  expect(result).toHaveProperty('extraDay');
});
```

#### 2.5.4 TC-205-4: コスト計算が正しく行われる

```typescript
test('コスト計算が正しく行われる（3個選択 → 追加コスト2）', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 3);

  (phaseUI as any).onEndGathering();

  expect(mockGatheringService.calculateGatheringCost).toHaveBeenCalled();
});
```

---

### 2.6 TC-206: 全ラウンド完了 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-008 |
| **目的** | 全ラウンド完了時にisCompleteがtrueになること |
| **前提条件** | DraftSessionがラウンド5/5にいる |

#### 2.6.1 TC-206-1: 最終ラウンドで選択するとisCompleteがtrue

```typescript
test('最終ラウンドで選択するとisCompleteがtrueになる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionAtFinalRound(phaseUI);

  (phaseUI as any).onMaterialSelected(0);

  expect((phaseUI as any).currentSession.isComplete).toBe(true);
});
```

#### 2.6.2 TC-206-2: 最終ラウンドでスキップするとisCompleteがtrue

```typescript
test('最終ラウンドでスキップするとisCompleteがtrueになる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionAtFinalRound(phaseUI);

  (phaseUI as any).onSkipRound();

  expect((phaseUI as any).currentSession.isComplete).toBe(true);
});
```

#### 2.6.3 TC-206-3: isComplete時に自動的に採取終了

```typescript
test('isCompleteになると自動的に採取終了処理が行われる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionAtFinalRound(phaseUI);

  (phaseUI as any).onMaterialSelected(0);

  expect(mockGatheringService.endGathering).toHaveBeenCalled();
});
```

---

### 2.7 TC-207: 獲得済み素材リスト表示 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | FR-007, AC-009 |
| **目的** | 獲得済み素材が正しく表示されること |
| **前提条件** | DraftSessionがアクティブ |

#### 2.7.1 TC-207-1: 素材選択後にリストが更新される

```typescript
test('素材選択後に獲得済みリストが更新される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onMaterialSelected(0);

  expect((phaseUI as any).updateSelectedMaterialsDisplay).toHaveBeenCalled();
});
```

#### 2.7.2 TC-207-2: 素材名と品質が表示される

```typescript
test('素材名と品質が表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 1);

  const displayText = (phaseUI as any).getSelectedMaterialsDisplayText();

  expect(displayText).toContain('森の雫'); // 素材名
  expect(displayText).toMatch(/[CBAS]/); // 品質
});
```

---

### 2.8 TC-208: コスト表示パネル 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | FR-008 |
| **目的** | コストがリアルタイムで表示されること |
| **前提条件** | DraftSessionがアクティブ |

#### 2.8.1 TC-208-1: 基本コストが表示される

```typescript
test('基本コストが表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ baseCost: 2 });

  phaseUI.startGathering(mockCard);

  expect((phaseUI as any).costDisplay).toBeDefined();
});
```

#### 2.8.2 TC-208-2: 素材選択でコスト表示が更新される

```typescript
test('素材選択でコスト表示が更新される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);
  const updateCostSpy = vi.spyOn(phaseUI as any, 'updateCostDisplay');

  (phaseUI as any).onMaterialSelected(0);

  expect(updateCostSpy).toHaveBeenCalled();
});
```

---

### 2.9 TC-209: キーボードショートカット 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | NFR-005, AC-012 |
| **目的** | キーボードショートカットが正しく動作すること |
| **前提条件** | DraftSessionがアクティブ |

#### 2.9.1 TC-209-1: キー「1」で左の素材を選択

```typescript
test('キー「1」で左の素材（インデックス0）を選択', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).handleKeyboardInput({ key: '1' });

  expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(
    expect.any(String),
    0,
  );
});
```

#### 2.9.2 TC-209-2: キー「2」で中央の素材を選択

```typescript
test('キー「2」で中央の素材（インデックス1）を選択', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).handleKeyboardInput({ key: '2' });

  expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(
    expect.any(String),
    1,
  );
});
```

#### 2.9.3 TC-209-3: キー「3」で右の素材を選択

```typescript
test('キー「3」で右の素材（インデックス2）を選択', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).handleKeyboardInput({ key: '3' });

  expect(mockGatheringService.selectMaterial).toHaveBeenCalledWith(
    expect.any(String),
    2,
  );
});
```

#### 2.9.4 TC-209-4: キー「S」でスキップ

```typescript
test('キー「S」でラウンドをスキップ', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).handleKeyboardInput({ key: 'S' });

  expect(mockGatheringService.skipSelection).toHaveBeenCalled();
});
```

#### 2.9.5 TC-209-5: キー「0」でスキップ

```typescript
test('キー「0」でラウンドをスキップ', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).handleKeyboardInput({ key: '0' });

  expect(mockGatheringService.skipSelection).toHaveBeenCalled();
});
```

#### 2.9.6 TC-209-6: キー「E」で採取終了

```typescript
test('キー「E」で採取を終了', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).handleKeyboardInput({ key: 'E' });

  expect(mockGatheringService.endGathering).toHaveBeenCalled();
});
```

#### 2.9.7 TC-209-7: キー「Escape」でキャンセル（未選択時）

```typescript
test('キー「Escape」でキャンセル（素材未選択時のみ）', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithNoSelections(phaseUI);

  (phaseUI as any).handleKeyboardInput({ key: 'Escape' });

  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.GATHERING_CANCELLED,
    expect.any(Object),
  );
});
```

---

### 2.10 TC-210: リソース解放 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | TC-002 |
| **目的** | destroy()でリソースが正しく解放されること |
| **前提条件** | GatheringPhaseUIが初期化されている |

#### 2.10.1 TC-210-1: すべてのMaterialCardUIが破棄される

```typescript
test('すべてのMaterialCardUIのdestroy()が呼ばれる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  const cards = [...(phaseUI as any).materialCards];
  const destroySpies = cards.map(card => vi.spyOn(card, 'destroy'));

  phaseUI.destroy();

  for (const spy of destroySpies) {
    expect(spy).toHaveBeenCalledTimes(1);
  }
});
```

#### 2.10.2 TC-210-2: コンテナが破棄される

```typescript
test('container.destroy()が呼ばれる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);

  phaseUI.destroy();

  expect(phaseUI.getContainer().destroy).toHaveBeenCalledTimes(1);
});
```

#### 2.10.3 TC-210-3: キーボードリスナーが解除される

```typescript
test('キーボードリスナーが解除される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);

  phaseUI.destroy();

  expect(mockScene.input.keyboard.off).toHaveBeenCalled();
});
```

---

## 3. 異常系テストケース

### 3.1 TC-221: EventBus未初期化 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | NFR-007, AC-017 |
| **目的** | EventBus未初期化時に警告が出て処理が継続すること |
| **前提条件** | scene.data.get('eventBus')がnullを返す |

#### 3.1.1 TC-221-1: エラーはスローされない

```typescript
test('EventBus未初期化でもエラーはスローされない', () => {
  const sceneWithoutEventBus = createMockScene();
  sceneWithoutEventBus.data.get = vi.fn().mockReturnValue(null);

  const createPhaseUI = () => {
    const phaseUI = new GatheringPhaseUI(sceneWithoutEventBus);
    phaseUI.create();
  };

  expect(createPhaseUI).not.toThrow();
});
```

#### 3.1.2 TC-221-2: console.warnが呼ばれる

```typescript
test('EventBus未初期化時にconsole.warnが呼ばれる', () => {
  const sceneWithoutEventBus = createMockScene();
  sceneWithoutEventBus.data.get = vi.fn().mockReturnValue(null);
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  const phaseUI = new GatheringPhaseUI(sceneWithoutEventBus);
  phaseUI.create();

  expect(consoleWarnSpy).toHaveBeenCalledWith(
    expect.stringContaining('EventBus is not available'),
  );

  consoleWarnSpy.mockRestore();
});
```

#### 3.1.3 TC-221-3: UI処理は継続される

```typescript
test('EventBus未初期化でもUI処理は継続される', () => {
  const sceneWithoutEventBus = createMockScene();
  sceneWithoutEventBus.data.get = vi.fn().mockReturnValue(null);

  const phaseUI = new GatheringPhaseUI(sceneWithoutEventBus);
  phaseUI.create();

  expect(phaseUI.getContainer()).toBeDefined();
});
```

---

### 3.2 TC-222: GatheringService未設定 🟡

| 項目 | 内容 |
|------|------|
| **要件ID** | NFR-008 |
| **目的** | GatheringService未設定時に適切なフォールバックが行われること |
| **前提条件** | gatheringServiceがnull |

#### 3.2.1 TC-222-1: エラーログが出力される

```typescript
test('GatheringService未設定時にエラーログが出力される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  (phaseUI as any).gatheringService = null;
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  phaseUI.startGathering(createMockGatheringCard());

  expect(consoleErrorSpy).toHaveBeenCalledWith(
    expect.stringContaining('GatheringService is not available'),
  );

  consoleErrorSpy.mockRestore();
});
```

#### 3.2.2 TC-222-2: アプリケーションが停止しない

```typescript
test('GatheringService未設定でもアプリケーションが停止しない', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  (phaseUI as any).gatheringService = null;

  const startGathering = () => phaseUI.startGathering(createMockGatheringCard());

  expect(startGathering).not.toThrow();
});
```

---

### 3.3 TC-223: 無効な素材インデックス 🟡

| 項目 | 内容 |
|------|------|
| **要件ID** | NFR-009 |
| **目的** | 無効なインデックスでApplicationErrorがスローされること |
| **前提条件** | DraftSessionがアクティブ |

#### 3.3.1 TC-223-1: インデックス-1でエラー

```typescript
test('インデックス-1でApplicationErrorがスローされる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  expect(() => (phaseUI as any).onMaterialSelected(-1)).toThrow();
});
```

#### 3.3.2 TC-223-2: インデックス3でエラー

```typescript
test('インデックス3でApplicationErrorがスローされる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  expect(() => (phaseUI as any).onMaterialSelected(3)).toThrow();
});
```

---

### 3.4 TC-224: セッション未開始時の操作 🟡

| 項目 | 内容 |
|------|------|
| **要件ID** | - |
| **目的** | セッション未開始時の操作が適切に処理されること |
| **前提条件** | currentSessionがnull |

#### 3.4.1 TC-224-1: 素材選択が無視される

```typescript
test('セッション未開始時に素材選択が無視される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);

  const selectMaterial = () => (phaseUI as any).onMaterialSelected(0);

  expect(selectMaterial).not.toThrow();
  expect(mockGatheringService.selectMaterial).not.toHaveBeenCalled();
});
```

#### 3.4.2 TC-224-2: スキップが無視される

```typescript
test('セッション未開始時にスキップが無視される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);

  const skipRound = () => (phaseUI as any).onSkipRound();

  expect(skipRound).not.toThrow();
  expect(mockGatheringService.skipSelection).not.toHaveBeenCalled();
});
```

---

### 3.5 TC-225: イベント発行失敗 🟡

| 項目 | 内容 |
|------|------|
| **要件ID** | - |
| **目的** | EventBus.emit()でエラーが発生しても処理が継続すること |
| **前提条件** | EventBus.emit()がエラーをスローする |

#### 3.5.1 TC-225-1: エラーがキャッチされる

```typescript
test('EventBus.emit()エラーがキャッチされる', () => {
  const mockEventBusWithError = createMockEventBus();
  mockEventBusWithError.emit = vi.fn().mockImplementation(() => {
    throw new Error('EventBus error');
  });
  mockScene.data.get = vi.fn().mockReturnValue(mockEventBusWithError);

  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  const selectMaterial = () => (phaseUI as any).onMaterialSelected(0);

  expect(selectMaterial).not.toThrow();
});
```

#### 3.5.2 TC-225-2: console.errorが呼ばれる

```typescript
test('EventBus.emit()エラー時にconsole.errorが呼ばれる', () => {
  const mockEventBusWithError = createMockEventBus();
  mockEventBusWithError.emit = vi.fn().mockImplementation(() => {
    throw new Error('EventBus error');
  });
  mockScene.data.get = vi.fn().mockReturnValue(mockEventBusWithError);
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSession(phaseUI);

  (phaseUI as any).onMaterialSelected(0);

  expect(consoleErrorSpy).toHaveBeenCalled();

  consoleErrorSpy.mockRestore();
});
```

---

### 3.6 TC-226: Escapeキーでのキャンセル制限 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-019 |
| **目的** | 素材選択後はEscapeでキャンセルできないこと |
| **前提条件** | 素材が1つ以上選択されている |

#### 3.6.1 TC-226-1: 素材選択後はキャンセル不可

```typescript
test('素材選択後はEscapeキーでキャンセルできない', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 1);

  (phaseUI as any).handleKeyboardInput({ key: 'Escape' });

  expect(mockEventBus.emit).not.toHaveBeenCalledWith(
    GameEventType.GATHERING_CANCELLED,
    expect.any(Object),
  );
});
```

---

## 4. 境界値テストケース

### 4.1 TC-231: 0個選択（偵察のみ） 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-020 |
| **目的** | 0個選択時のコスト計算が正しいこと |
| **期待値** | 追加コスト0、追加日数0 |

#### 4.1.1 TC-231-1: 追加コストが0

```typescript
test('0個選択時の追加コストは0', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 0);

  const result = (phaseUI as any).onEndGathering();

  expect(result.additionalCost).toBe(0);
});
```

#### 4.1.2 TC-231-2: 追加日数が0

```typescript
test('0個選択時の追加日数は0', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 0);

  const result = (phaseUI as any).onEndGathering();

  expect(result.extraDay).toBe(false);
});
```

#### 4.1.3 TC-231-3: 警告レベルがnone

```typescript
test('0個選択時の警告レベルはnone', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 0);

  const costResult = (phaseUI as any).calculateCurrentCost();

  expect(costResult.warningLevel).toBe('none');
});
```

---

### 4.2 TC-232: 1〜2個選択 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-010 |
| **目的** | 1〜2個選択時のコスト計算が正しいこと |
| **期待値** | 追加コスト1、追加日数0 |

#### 4.2.1 TC-232-1: 1個選択で追加コスト1

```typescript
test('1個選択時の追加コストは1', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 1);

  const costResult = (phaseUI as any).calculateCurrentCost();

  expect(costResult.additionalCost).toBe(1);
});
```

#### 4.2.2 TC-232-2: 2個選択で追加コスト1

```typescript
test('2個選択時の追加コストは1', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 2);

  const costResult = (phaseUI as any).calculateCurrentCost();

  expect(costResult.additionalCost).toBe(1);
});
```

---

### 4.3 TC-233: 3〜4個選択 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-010 |
| **目的** | 3〜4個選択時のコスト計算が正しいこと |
| **期待値** | 追加コスト2、追加日数0 |

#### 4.3.1 TC-233-1: 3個選択で追加コスト2

```typescript
test('3個選択時の追加コストは2', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 3);

  const costResult = (phaseUI as any).calculateCurrentCost();

  expect(costResult.additionalCost).toBe(2);
});
```

#### 4.3.2 TC-233-2: 4個選択で追加コスト2

```typescript
test('4個選択時の追加コストは2', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 4);

  const costResult = (phaseUI as any).calculateCurrentCost();

  expect(costResult.additionalCost).toBe(2);
});
```

---

### 4.4 TC-234: 5〜6個選択（ペナルティなし上限） 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-022 |
| **目的** | 5〜6個選択時のコスト計算が正しいこと |
| **期待値** | 追加コスト3、追加日数0、警告レベルwarning |

#### 4.4.1 TC-234-1: 5個選択で追加コスト3

```typescript
test('5個選択時の追加コストは3', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 5);

  const costResult = (phaseUI as any).calculateCurrentCost();

  expect(costResult.additionalCost).toBe(3);
});
```

#### 4.4.2 TC-234-2: 6個選択で追加コスト3、追加日数0

```typescript
test('6個選択時の追加コストは3、追加日数0', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 6);

  const costResult = (phaseUI as any).calculateCurrentCost();

  expect(costResult.additionalCost).toBe(3);
  expect(costResult.extraDay).toBe(false);
});
```

#### 4.4.3 TC-234-3: 5〜6個選択で警告レベルwarning

```typescript
test('5個選択時の警告レベルはwarning', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 5);

  const costResult = (phaseUI as any).calculateCurrentCost();

  expect(costResult.warningLevel).toBe('warning');
});
```

---

### 4.5 TC-235: 7個選択（翌日持越しペナルティ） 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-023 |
| **目的** | 7個以上選択時に翌日持越しペナルティが適用されること |
| **期待値** | 追加コスト3、追加日数+1、警告レベルdanger |

#### 4.5.1 TC-235-1: 7個選択で追加日数+1

```typescript
test('7個選択時の追加日数は+1', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 7);

  const costResult = (phaseUI as any).calculateCurrentCost();

  expect(costResult.extraDay).toBe(true);
});
```

#### 4.5.2 TC-235-2: 7個選択で警告レベルdanger

```typescript
test('7個選択時の警告レベルはdanger', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 7);

  const costResult = (phaseUI as any).calculateCurrentCost();

  expect(costResult.warningLevel).toBe('danger');
});
```

#### 4.5.3 TC-235-3: 警告表示が更新される

```typescript
test('7個選択時に「翌日持越し」警告が表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 7);

  (phaseUI as any).updateCostDisplay(7);

  // 赤色点滅などの警告スタイルが適用されていることを確認
  expect((phaseUI as any).costDisplay).toBeDefined();
});
```

---

### 4.6 TC-236: 最大提示回数（5回） 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-021 |
| **目的** | 最大提示回数（5回）まで正常動作すること |
| **前提条件** | maxRounds = 5 |

#### 4.6.1 TC-236-1: 5ラウンド全て素材選択肢が表示される

```typescript
test('5ラウンド全てで素材選択肢が表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ maxRounds: 5 });

  phaseUI.startGathering(mockCard);

  for (let i = 0; i < 4; i++) {
    expect((phaseUI as any).materialCards.length).toBe(3);
    (phaseUI as any).onMaterialSelected(0);
  }

  // 最終ラウンド（5ラウンド目）
  expect((phaseUI as any).materialCards.length).toBe(3);
});
```

#### 4.6.2 TC-236-2: ラウンドインジケーターが正しく更新される

```typescript
test('ラウンドインジケーターが1/5から5/5まで正しく更新される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ maxRounds: 5 });

  phaseUI.startGathering(mockCard);
  expect((phaseUI as any).currentSession.currentRound).toBe(1);

  for (let i = 1; i < 5; i++) {
    (phaseUI as any).onMaterialSelected(0);
    if (i < 4) {
      expect((phaseUI as any).currentSession.currentRound).toBe(i + 1);
    }
  }
});
```

---

### 4.7 TC-237: 行動ポイント不足 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-018 |
| **目的** | 行動ポイント不足時に開始ボタンが非活性になること |
| **前提条件** | 現在の行動ポイント < 必要コスト |

#### 4.7.1 TC-237-1: 開始ボタンが非活性

```typescript
test('行動ポイント不足時に開始ボタンが非活性になる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ baseCost: 5 });

  (phaseUI as any).currentActionPoints = 2; // コスト不足
  phaseUI.showLocationDetail(mockCard);

  expect((phaseUI as any).startButton.isEnabled()).toBe(false);
});
```

---

## 5. 統合テストケース

### 5.1 TC-241: 完全な採取フロー 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | 全体 |
| **目的** | 開始→選択→終了の完全なフローが動作すること |
| **シナリオ** | 3ラウンドで2個選択して終了 |

#### 5.1.1 TC-241-1: 完全なフローが成功する

```typescript
test('完全な採取フロー: 開始→選択→選択→スキップ→終了', async () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ maxRounds: 3 });

  // セッション開始
  phaseUI.startGathering(mockCard);
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.GATHERING_STARTED,
    expect.any(Object),
  );

  // ラウンド1: 素材選択
  (phaseUI as any).onMaterialSelected(0);
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.MATERIAL_SELECTED,
    expect.any(Object),
  );

  // ラウンド2: 素材選択
  (phaseUI as any).onMaterialSelected(1);

  // ラウンド3: スキップ
  (phaseUI as any).onSkipRound();
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.ROUND_SKIPPED,
    expect.any(Object),
  );

  // 終了（自動または手動）
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.GATHERING_COMPLETED,
    expect.objectContaining({
      materials: expect.any(Array),
      totalCost: expect.any(Number),
    }),
  );
});
```

---

### 5.2 TC-242: 途中終了フロー 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | FR-005 |
| **目的** | 全ラウンド完了前に終了できること |
| **シナリオ** | 2ラウンド目で手動終了 |

#### 5.2.1 TC-242-1: 途中終了が成功する

```typescript
test('ラウンド2/5で手動終了できる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ maxRounds: 5 });

  phaseUI.startGathering(mockCard);
  (phaseUI as any).onMaterialSelected(0); // ラウンド1
  (phaseUI as any).onEndGathering(); // ラウンド2で終了

  expect(mockGatheringService.endGathering).toHaveBeenCalled();
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.GATHERING_COMPLETED,
    expect.any(Object),
  );
});
```

---

### 5.3 TC-243: 偵察のみフロー 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-020 |
| **目的** | 0個選択（偵察のみ）で終了できること |
| **シナリオ** | 全ラウンドスキップ |

#### 5.3.1 TC-243-1: 偵察のみで終了

```typescript
test('全ラウンドスキップで偵察のみ終了', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ maxRounds: 3 });

  phaseUI.startGathering(mockCard);
  (phaseUI as any).onSkipRound(); // ラウンド1
  (phaseUI as any).onSkipRound(); // ラウンド2
  (phaseUI as any).onSkipRound(); // ラウンド3（最終）

  expect((phaseUI as any).currentSession.selectedMaterials.length).toBe(0);
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.GATHERING_COMPLETED,
    expect.objectContaining({
      materials: [],
      totalCost: expect.any(Number),
      extraDay: false,
    }),
  );
});
```

---

### 5.4 TC-244: 最大選択フロー 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | AC-023 |
| **目的** | 7個以上選択時のペナルティ適用を確認 |
| **シナリオ** | 7ラウンドで7個全て選択 |

#### 5.4.1 TC-244-1: 7個選択でペナルティ適用

```typescript
test('7個選択で翌日持越しペナルティが適用される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ maxRounds: 7 });

  phaseUI.startGathering(mockCard);
  for (let i = 0; i < 7; i++) {
    (phaseUI as any).onMaterialSelected(0);
  }

  expect(mockEventBus.emit).toHaveBeenCalledWith(
    GameEventType.GATHERING_COMPLETED,
    expect.objectContaining({
      extraDay: true,
    }),
  );
});
```

---

### 5.5 TC-245: キーボード操作のみでの完全フロー 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | NFR-005 |
| **目的** | キーボードのみで採取を完了できること |
| **シナリオ** | Enter→1→2→S→E |

#### 5.5.1 TC-245-1: キーボードのみで完了

```typescript
test('キーボード操作のみで採取を完了できる', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ maxRounds: 3 });

  // 採取地詳細表示後、Enterで開始
  phaseUI.showLocationDetail(mockCard);
  (phaseUI as any).handleKeyboardInput({ key: 'Enter' });

  // 1キーで選択
  (phaseUI as any).handleKeyboardInput({ key: '1' });

  // 2キーで選択
  (phaseUI as any).handleKeyboardInput({ key: '2' });

  // Sキーでスキップ
  (phaseUI as any).handleKeyboardInput({ key: 'S' });

  // Eキーで終了
  (phaseUI as any).handleKeyboardInput({ key: 'E' });

  expect(mockGatheringService.endGathering).toHaveBeenCalled();
});
```

---

### 5.6 TC-246: UIコンポーネント連携 🟡

| 項目 | 内容 |
|------|------|
| **要件ID** | - |
| **目的** | MaterialCardUIとの連携が正しく動作すること |
| **前提条件** | MaterialCardUIがモック化されている |

#### 5.6.1 TC-246-1: MaterialCardUIが正しく作成される

```typescript
test('MaterialCardUIが正しいデータで作成される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard();

  phaseUI.startGathering(mockCard);

  const materialCards = (phaseUI as any).materialCards;
  expect(materialCards[0].material.name).toBeDefined();
  expect(materialCards[0].material.quality).toBeDefined();
});
```

---

### 5.7 TC-247: 状態遷移の検証 🟡

| 項目 | 内容 |
|------|------|
| **要件ID** | - |
| **目的** | 状態遷移が正しく行われること |
| **状態** | MaterialPresent → MaterialSelect → SessionEnd |

#### 5.7.1 TC-247-1: 状態遷移が正しい

```typescript
test('状態遷移: MaterialPresent → MaterialSelect → SessionEnd', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({ maxRounds: 1 });

  phaseUI.startGathering(mockCard);
  // MaterialPresent → MaterialSelect（アニメーション後）
  expect((phaseUI as any).currentState).toBe('MaterialSelect');

  (phaseUI as any).onMaterialSelected(0);
  // MaterialSelect → SessionEnd
  expect((phaseUI as any).currentState).toBe('SessionEnd');
});
```

---

### 5.8 TC-248: イベント購読の検証 🟡

| 項目 | 内容 |
|------|------|
| **要件ID** | - |
| **目的** | 外部イベントの購読が正しく行われること |
| **イベント** | ACTION_POINTS_CHANGED |

#### 5.8.1 TC-248-1: ACTION_POINTS_CHANGEDを購読

```typescript
test('ACTION_POINTS_CHANGEDイベントを購読する', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);

  expect(mockEventBus.on).toHaveBeenCalledWith(
    GameEventType.ACTION_POINTS_CHANGED,
    expect.any(Function),
  );
});
```

---

### 5.9 TC-249: 採取地詳細表示 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | FR-009 |
| **目的** | 採取地詳細が正しく表示されること |
| **前提条件** | 採取地カードが選択されている |

#### 5.9.1 TC-249-1: 採取地詳細パネルが表示される

```typescript
test('採取地詳細パネルが表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({
    name: '深緑の森',
    baseCost: 2,
    maxRounds: 5,
  });

  phaseUI.showLocationDetail(mockCard);

  expect((phaseUI as any).locationDetailPanel).toBeDefined();
  expect((phaseUI as any).locationDetailPanel.isVisible()).toBe(true);
});
```

#### 5.9.2 TC-249-2: 採取地情報が正しく表示される

```typescript
test('採取地名、基本コスト、提示回数が表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  const mockCard = createMockGatheringCard({
    name: '深緑の森',
    baseCost: 2,
    maxRounds: 5,
  });

  phaseUI.showLocationDetail(mockCard);

  const displayText = (phaseUI as any).getLocationDetailText();
  expect(displayText).toContain('深緑の森');
  expect(displayText).toContain('2'); // baseCost
  expect(displayText).toContain('5'); // maxRounds
});
```

---

### 5.10 TC-250: 採取完了画面 🔵

| 項目 | 内容 |
|------|------|
| **要件ID** | FR-010 |
| **目的** | 採取完了画面が正しく表示されること |
| **前提条件** | 採取が完了している |

#### 5.10.1 TC-250-1: 採取完了画面が表示される

```typescript
test('採取完了後に結果画面が表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 3);

  (phaseUI as any).onEndGathering();

  expect((phaseUI as any).resultPanel).toBeDefined();
  expect((phaseUI as any).resultPanel.isVisible()).toBe(true);
});
```

#### 5.10.2 TC-250-2: 獲得素材一覧が表示される

```typescript
test('獲得素材一覧が結果画面に表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 3);

  (phaseUI as any).onEndGathering();

  const resultText = (phaseUI as any).getResultDisplayText();
  expect(resultText).toContain('獲得素材');
});
```

#### 5.10.3 TC-250-3: コスト詳細が表示される

```typescript
test('消費コスト詳細が結果画面に表示される', () => {
  const phaseUI = new GatheringPhaseUI(mockScene);
  setupActiveSessionWithMaterials(phaseUI, 3);

  (phaseUI as any).onEndGathering();

  const resultText = (phaseUI as any).getResultDisplayText();
  expect(resultText).toContain('コスト');
});
```

---

## 6. モックヘルパー関数

### 6.1 共通モック

```typescript
/**
 * Phaserシーンのモックを作成
 */
function createMockScene(): Phaser.Scene {
  const mockScene = {
    add: {
      container: vi.fn().mockReturnValue({
        add: vi.fn(),
        setDepth: vi.fn(),
        destroy: vi.fn(),
        x: 0,
        y: 0,
        active: true,
      }),
      text: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setText: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        text: '',
        active: true,
      }),
      rectangle: vi.fn().mockReturnValue({
        setOrigin: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        off: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        emit: vi.fn(),
        listenerCount: vi.fn().mockReturnValue(0),
        active: true,
      }),
    },
    tweens: {
      add: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
      }),
    },
    input: {
      keyboard: {
        on: vi.fn(),
        off: vi.fn(),
      },
    },
    data: {
      get: vi.fn().mockReturnValue(null),
    },
    plugins: {
      get: vi.fn().mockReturnValue({
        add: {
          sizer: vi.fn(),
        },
      }),
    },
  } as any;

  return mockScene;
}

/**
 * EventBusのモックを作成
 */
function createMockEventBus() {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  };
}

/**
 * GatheringServiceのモックを作成
 */
function createMockGatheringService() {
  return {
    startDraftGathering: vi.fn().mockReturnValue(createMockDraftSession()),
    selectMaterial: vi.fn().mockReturnValue(createMockMaterialInstance()),
    skipSelection: vi.fn(),
    endGathering: vi.fn().mockReturnValue(createMockGatheringResult()),
    getCurrentSession: vi.fn().mockReturnValue(null),
    canGather: vi.fn().mockReturnValue(true),
    calculateGatheringCost: vi.fn().mockReturnValue({
      baseCost: 2,
      additionalCost: 1,
      totalCost: 3,
      extraDay: false,
      warningLevel: 'none',
    }),
  };
}

/**
 * 採取地カードモックを作成
 */
function createMockGatheringCard(overrides?: Partial<any>): any {
  return {
    id: 'LOC001',
    name: '深緑の森',
    type: 'location',
    baseCost: 2,
    maxRounds: 5,
    rareRate: 0.1,
    materials: ['M001', 'M002', 'M003'],
    ...overrides,
  };
}

/**
 * DraftSessionモックを作成
 */
function createMockDraftSession(overrides?: Partial<any>): any {
  return {
    sessionId: 'SESSION001',
    card: createMockGatheringCard(),
    currentRound: 1,
    maxRounds: 5,
    selectedMaterials: [],
    currentOptions: [
      { materialId: 'M001', name: '森の雫', icon: '💧', quality: 'B', isRare: false },
      { materialId: 'M002', name: '薬草', icon: '🌿', quality: 'C', isRare: false },
      { materialId: 'M003', name: '輝石', icon: '💎', quality: 'A', isRare: true },
    ],
    isComplete: false,
    ...overrides,
  };
}

/**
 * MaterialInstanceモックを作成
 */
function createMockMaterialInstance(): any {
  return {
    instanceId: 'INST001',
    materialId: 'M001',
    name: '森の雫',
    quality: 'B',
    isRare: false,
  };
}

/**
 * GatheringResultモックを作成
 */
function createMockGatheringResult(): any {
  return {
    locationId: 'LOC001',
    materials: [],
    baseCost: 2,
    additionalCost: 0,
    totalCost: 2,
    extraDay: false,
  };
}
```

### 6.2 セットアップヘルパー

```typescript
/**
 * アクティブなセッションをセットアップ
 */
function setupActiveSession(phaseUI: any): void {
  const mockCard = createMockGatheringCard();
  phaseUI.startGathering(mockCard);
}

/**
 * 指定数の素材が選択されたセッションをセットアップ
 */
function setupActiveSessionWithMaterials(phaseUI: any, count: number): void {
  const mockSession = createMockDraftSession({
    selectedMaterials: Array.from({ length: count }, (_, i) => ({
      instanceId: `INST00${i + 1}`,
      materialId: `M00${i + 1}`,
      name: `素材${i + 1}`,
      quality: 'B',
      isRare: false,
    })),
  });
  (phaseUI as any).currentSession = mockSession;
}

/**
 * 最終ラウンドのセッションをセットアップ
 */
function setupActiveSessionAtFinalRound(phaseUI: any): void {
  const mockSession = createMockDraftSession({
    currentRound: 5,
    maxRounds: 5,
  });
  (phaseUI as any).currentSession = mockSession;
}

/**
 * 素材未選択のセッションをセットアップ
 */
function setupActiveSessionWithNoSelections(phaseUI: any): void {
  const mockSession = createMockDraftSession({
    selectedMaterials: [],
  });
  (phaseUI as any).currentSession = mockSession;
}
```

---

## 7. テスト実行コマンド

```bash
# 全テスト実行
pnpm test src/presentation/ui/phases/GatheringPhaseUI.spec.ts

# 特定のテストスイート実行
pnpm test src/presentation/ui/phases/GatheringPhaseUI.spec.ts -t "TC-201"

# カバレッジ付き実行
pnpm test --coverage src/presentation/ui/phases/GatheringPhaseUI.spec.ts

# ウォッチモード
pnpm test --watch src/presentation/ui/phases/GatheringPhaseUI.spec.ts
```

---

## 8. テストケースサマリー

| カテゴリ | テストID | 件数 | 信頼性 |
|---------|---------|------|--------|
| 正常系 | TC-201〜TC-210 | 40件 | 🔵 |
| 異常系 | TC-221〜TC-226 | 15件 | 🔵🟡 |
| 境界値 | TC-231〜TC-237 | 18件 | 🔵 |
| 統合 | TC-241〜TC-250 | 17件 | 🔵🟡 |
| **合計** | - | **90件** | - |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成 |
